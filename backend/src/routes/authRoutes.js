import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../db/database.js';
import config from '../config.js';
import { authRateLimiter, sanitizeText } from '../middleware/securityMiddleware.js';
import { authenticateToken, blacklistToken } from '../middleware/authMiddleware.js';
import { logAuditEvent, getClientIp, AuditEventType } from '../services/auditService.js';

const router = express.Router();

// ══════════════════════════════════════════════════════════════════
// POST /api/auth/login - Generic login endpoint (Rate-limited, sanitized)
// ══════════════════════════════════════════════════════════════════
router.post('/login', authRateLimiter, (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    const cleanUsername = sanitizeText(username, 100);
    const stmt = db.prepare('SELECT * FROM users WHERE LOWER(username) = LOWER(?)');
    const user = stmt.get(cleanUsername);

    if (!user || !bcrypt.compareSync(password, user.password_hash)) {
      // Generic response — do NOT reveal if username exists
      logAuditEvent({
        type: AuditEventType.LOGIN_FAILED,
        actorId: cleanUsername,
        action: `Login attempt failed for username "${cleanUsername}"`,
        result: 'FAILURE',
        ipAddress: getClientIp(req)
      });
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if account is deactivated
    if (user.is_active === 0) {
      logAuditEvent({
        type: AuditEventType.LOGIN_FAILED,
        actorId: user.id,
        actorRole: user.role,
        action: 'Login attempt on deactivated account',
        result: 'DENIED',
        ipAddress: getClientIp(req)
      });
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const expiresIn = (user.role === 'WORKER') ? config.jwtExpiryWorker : config.jwtExpiryAdmin;

    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role,
        fullName: user.full_name,
        siteId: user.site_id,
        district: user.district
      },
      config.jwtSecret,
      { expiresIn, algorithm: 'HS256' }
    );

    logAuditEvent({
      type: AuditEventType.LOGIN_SUCCESS,
      actorId: user.id,
      actorRole: user.role,
      action: `Successful login via generic endpoint`,
      result: 'SUCCESS',
      ipAddress: getClientIp(req)
    });

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        fullName: user.full_name,
        siteId: user.site_id,
        district: user.district
      }
    });
  } catch (err) {
    next(err);
  }
});

// ══════════════════════════════════════════════════════════════════
// POST /api/auth/worker-login - Frontline Worker Login (Rate-limited, bcrypt PIN verified)
// ══════════════════════════════════════════════════════════════════
router.post('/worker-login', authRateLimiter, (req, res, next) => {
  try {
    const { workerCode, phone, pin } = req.body;
    const rawIdentifier = (workerCode || phone || '').trim();
    const identifier = sanitizeText(rawIdentifier, 100);

    if (!identifier) {
      return res.status(400).json({ error: 'Worker Code or Registered Mobile Number required' });
    }

    if (!pin) {
      return res.status(400).json({ error: 'Worker Security PIN required' });
    }

    const stmt = db.prepare(`
      SELECT 
        w.id, w.worker_code, w.full_name, w.tribal_language, w.literacy_level,
        w.designation, w.phone, w.joined_date, w.pin_hash,
        s.id AS site_id, s.name AS site_name, s.sector, s.district,
        c.id AS cohort_id, c.name AS cohort_name
      FROM workers w
      JOIN sites s ON w.site_id = s.id
      LEFT JOIN cohorts c ON w.cohort_id = c.id
      WHERE UPPER(w.worker_code) = UPPER(?) 
         OR w.phone LIKE ? 
         OR w.id = ?
      LIMIT 1
    `);

    const phoneClean = identifier.replace(/[^0-9]/g, '');
    const worker = stmt.get(identifier, `%${phoneClean}%`, identifier);

    if (!worker) {
      // Generic response — do NOT reveal which worker codes exist
      logAuditEvent({
        type: AuditEventType.LOGIN_FAILED,
        actorId: identifier,
        action: 'Worker login failed — identifier not found',
        result: 'FAILURE',
        ipAddress: getClientIp(req)
      });
      return res.status(401).json({
        error: 'Invalid worker credentials. Please verify your Worker Code and PIN.'
      });
    }

    // Verify PIN against stored bcrypt hash — NO plaintext fallback
    if (!worker.pin_hash) {
      logAuditEvent({
        type: AuditEventType.LOGIN_FAILED,
        actorId: worker.id,
        action: 'Worker login failed — no PIN hash set (account needs PIN migration)',
        result: 'FAILURE',
        ipAddress: getClientIp(req)
      });
      return res.status(401).json({
        error: 'Invalid worker credentials. Please verify your Worker Code and PIN.'
      });
    }

    const isPinValid = bcrypt.compareSync(String(pin), worker.pin_hash);
    if (!isPinValid) {
      logAuditEvent({
        type: AuditEventType.LOGIN_FAILED,
        actorId: worker.id,
        action: 'Worker login failed — incorrect PIN',
        result: 'FAILURE',
        ipAddress: getClientIp(req)
      });
      return res.status(401).json({
        error: 'Invalid worker credentials. Please verify your Worker Code and PIN.'
      });
    }

    const token = jwt.sign(
      {
        id: worker.id,
        workerCode: worker.worker_code,
        role: 'WORKER',
        fullName: worker.full_name,
        siteId: worker.site_id,
        district: worker.district
      },
      config.jwtSecret,
      { expiresIn: config.jwtExpiryWorker, algorithm: 'HS256' }
    );

    logAuditEvent({
      type: AuditEventType.LOGIN_SUCCESS,
      actorId: worker.id,
      actorRole: 'WORKER',
      action: `Worker login success: ${worker.worker_code}`,
      result: 'SUCCESS',
      ipAddress: getClientIp(req)
    });

    res.json({
      success: true,
      token,
      worker: {
        id: worker.id,
        role: 'WORKER',
        workerCode: worker.worker_code,
        name: worker.full_name,
        designation: worker.designation,
        tribalLanguage: worker.tribal_language,
        phone: worker.phone,
        siteId: worker.site_id,
        siteName: worker.site_name,
        sector: worker.sector,
        district: worker.district,
        cohortId: worker.cohort_id,
        cohortName: worker.cohort_name
      }
    });
  } catch (err) {
    next(err);
  }
});

// ══════════════════════════════════════════════════════════════════
// POST /api/auth/admin-login - Administrative & Regulatory Official Sign-In
// ══════════════════════════════════════════════════════════════════
router.post('/admin-login', authRateLimiter, (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    const cleanUsername = sanitizeText(username, 100);

    const stmt = db.prepare(`
      SELECT 
        u.*,
        s.name AS site_name, s.sector
      FROM users u
      LEFT JOIN sites s ON u.site_id = s.id
      WHERE LOWER(u.username) = LOWER(?)
        AND u.role IN ('SAFETY_OFFICER', 'DGMS_INSPECTOR', 'STATE_NODAL_OFFICER')
    `);

    const admin = stmt.get(cleanUsername);

    // Generic error — do NOT differentiate user-not-found vs. wrong-password
    if (!admin || !bcrypt.compareSync(password, admin.password_hash)) {
      logAuditEvent({
        type: AuditEventType.LOGIN_FAILED,
        actorId: cleanUsername,
        action: 'Admin login failed',
        result: 'FAILURE',
        ipAddress: getClientIp(req)
      });
      return res.status(401).json({
        error: 'Invalid credentials'
      });
    }

    // Check if account is deactivated
    if (admin.is_active === 0) {
      logAuditEvent({
        type: AuditEventType.LOGIN_FAILED,
        actorId: admin.id,
        actorRole: admin.role,
        action: 'Admin login attempt on deactivated account',
        result: 'DENIED',
        ipAddress: getClientIp(req)
      });
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      {
        id: admin.id,
        username: admin.username,
        role: admin.role,
        fullName: admin.full_name,
        siteId: admin.site_id,
        district: admin.district
      },
      config.jwtSecret,
      { expiresIn: config.jwtExpiryAdmin, algorithm: 'HS256' }
    );

    logAuditEvent({
      type: AuditEventType.LOGIN_SUCCESS,
      actorId: admin.id,
      actorRole: admin.role,
      action: `Admin login success: ${admin.username} (${admin.role})`,
      result: 'SUCCESS',
      ipAddress: getClientIp(req)
    });

    res.json({
      success: true,
      token,
      admin: {
        id: admin.id,
        username: admin.username,
        fullName: admin.full_name,
        role: admin.role,
        designation: admin.role === 'SAFETY_OFFICER' 
          ? 'Site Safety Supervisor'
          : admin.role === 'DGMS_INSPECTOR'
            ? 'Director of Mine Safety (Statutory Inspector)'
            : 'State Nodal Officer - Mines & Geology',
        siteId: admin.site_id,
        siteName: admin.site_name || 'DGMS / State Headquarters',
        district: admin.district || 'Dhanbad',
        sector: admin.sector || 'ALL'
      }
    });
  } catch (err) {
    next(err);
  }
});

// ══════════════════════════════════════════════════════════════════
// POST /api/auth/logout - Secure Logout with Token Revocation
// ══════════════════════════════════════════════════════════════════
router.post('/logout', authenticateToken, (req, res) => {
  try {
    blacklistToken(req.token, req.user.id, 'LOGOUT');

    logAuditEvent({
      type: AuditEventType.LOGOUT,
      actorId: req.user.id,
      actorRole: req.user.role,
      action: 'User logged out and token revoked',
      result: 'SUCCESS',
      ipAddress: getClientIp(req)
    });

    res.json({ success: true, message: 'Logged out successfully' });
  } catch {
    // Even if blacklisting fails, confirm logout
    res.json({ success: true, message: 'Logged out' });
  }
});

// ══════════════════════════════════════════════════════════════════
// GET /api/auth/credentials-info - Evaluation credentials (SIH demo only)
// ══════════════════════════════════════════════════════════════════
router.get('/credentials-info', authRateLimiter, (req, res) => {
  // Strictly disabled unless explicitly enabled via env var
  if (!config.enableEvaluationCredentials) {
    return res.status(404).json({ error: 'Not found' });
  }

  res.json({
    workerPortal: {
      portalName: 'Frontline Worker AR Safety Training Portal',
      loginRoute: '#worker-login',
      activePortalRoute: '#worker',
      instructions: 'Enter Workforce ID or registered phone number with your PIN.',
      accounts: [
        {
          name: 'Birsa Hansda',
          workerCode: 'JH-WRK-001',
          phone: '+91 94311 20401',
          pin: '1234',
          designation: 'Underground Driller',
          site: 'BCCL Jharia Colliery #4 (Dhanbad)',
          language: 'SANTALI'
        },
        {
          name: 'Shibu Soren',
          workerCode: 'JH-WRK-002',
          phone: '+91 94311 20402',
          pin: '1234',
          designation: 'Loader Operator',
          site: 'BCCL Jharia Colliery #4 (Dhanbad)',
          language: 'SANTALI'
        },
        {
          name: 'Sunil Murmu',
          workerCode: 'JH-WRK-003',
          phone: '+91 94311 20403',
          pin: '1234',
          designation: 'Ventilation Helper',
          site: 'BCCL Jharia Colliery #4 (Dhanbad)',
          language: 'SANTALI'
        },
        {
          name: 'Raju Mahato',
          workerCode: 'JH-WRK-005',
          phone: '+91 94311 20405',
          pin: '1234',
          designation: 'Blast Furnace Assistant',
          site: 'SAIL Bokaro Steel Plant (Bokaro)',
          language: 'HINDI'
        },
        {
          name: 'Champa Marandi',
          workerCode: 'JH-WRK-004',
          phone: '+91 94311 20404',
          pin: '1234',
          designation: 'Mica Sorter',
          site: 'Koderma Mica Mining Zone (Koderma)',
          language: 'SANTALI'
        }
      ]
    },
    adminPortal: {
      portalName: 'Administrative & Regulatory Console (Safety Officer, DGMS, State Nodal)',
      loginRoute: '#admin-login',
      activePortalRoute: '#admin',
      instructions: 'Enter official username with assigned statutory password.',
      accounts: [
        {
          roleName: 'Site Safety Officer',
          username: 'officer1',
          officialName: 'Rajesh Mahato',
          jurisdiction: 'BCCL Jharia Underground Coal Mine Colliery #4',
          portalTab: '#admin/officer'
        },
        {
          roleName: 'DGMS Statutory Inspector',
          username: 'dgms_inspector',
          officialName: 'Dr. A.K. Sengupta',
          jurisdiction: 'Directorate General of Mines Safety (DGMS) Dhanbad HQ',
          portalTab: '#admin/dgms'
        },
        {
          roleName: 'State Nodal Officer',
          username: 'state_nodal',
          officialName: 'Priya Soren',
          jurisdiction: 'Dept. of Mines & Geology, Govt. of Jharkhand (Ranchi)',
          portalTab: '#admin/state'
        }
      ]
    }
  });
});

export default router;
