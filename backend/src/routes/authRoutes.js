import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../db/database.js';
import { authRateLimiter, sanitizeText } from '../middleware/securityMiddleware.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'jharkhand-sih-2026-secret-key-dgms-verified';

// POST /api/auth/login - Generic login endpoint (Rate-limited, sanitized)
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
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role,
        fullName: user.full_name,
        siteId: user.site_id,
        district: user.district
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

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

// POST /api/auth/worker-login - Dedicated Frontline Worker Login (Rate-limited, bcrypt PIN verified)
router.post('/worker-login', authRateLimiter, (req, res, next) => {
  try {
    const { workerCode, phone, pin } = req.body;
    const rawIdentifier = (workerCode || phone || '').trim();
    const identifier = sanitizeText(rawIdentifier, 100);

    if (!identifier) {
      return res.status(400).json({ error: 'Worker Code (e.g. JH-WRK-001) or Registered Mobile Number required' });
    }

    if (!pin) {
      return res.status(400).json({ error: 'Worker Security PIN required (Default prototype PIN: 1234)' });
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
      return res.status(404).json({
        error: `No miner record found for '${identifier}'. Try sample worker code 'JH-WRK-001' (Birsa Hansda).`
      });
    }

    // Verify PIN against stored bcrypt hash (fallback to '1234' hash for unmigrated entries)
    const isPinValid = worker.pin_hash
      ? bcrypt.compareSync(String(pin), worker.pin_hash)
      : (String(pin) === '1234');

    if (!isPinValid) {
      return res.status(401).json({ error: 'Invalid Security PIN. Please verify your 4-digit PIN.' });
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
      JWT_SECRET,
      { expiresIn: '7d' }
    );

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

// POST /api/auth/admin-login - Dedicated Administrative & Regulatory Official Sign-In
router.post('/admin-login', authRateLimiter, (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Official Username and Password required' });
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

    if (!admin) {
      return res.status(401).json({
        error: 'Invalid administrative credentials. Access restricted to authorized statutory officials.'
      });
    }

    // Verify bcrypt password securely without hardcoded backdoors
    const isPwValid = bcrypt.compareSync(password, admin.password_hash);
    if (!isPwValid) {
      return res.status(401).json({ error: 'Incorrect statutory password.' });
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
      JWT_SECRET,
      { expiresIn: '7d' }
    );

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

// GET /api/auth/credentials-info - Detailed credentials directory for evaluation
router.get('/credentials-info', authRateLimiter, (req, res) => {
  // Disable in production unless explicitly enabled via environment variable
  if (process.env.NODE_ENV === 'production' && process.env.ENABLE_EVALUATION_CREDENTIALS !== 'true') {
    return res.status(404).json({ error: 'Credential directory unavailable in production mode' });
  }

  res.json({
    workerPortal: {
      portalName: 'Frontline Worker AR Safety Training Portal',
      loginRoute: '#worker-login',
      activePortalRoute: '#worker',
      instructions: 'Enter Workforce ID or registered phone number with default PIN 1234.',
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
      instructions: 'Enter official username with default statutory password password123.',
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
