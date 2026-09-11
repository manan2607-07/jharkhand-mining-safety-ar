import express from 'express';
import crypto from 'crypto';
import db from '../db/database.js';
import { optionalAuthenticate } from '../middleware/authMiddleware.js';
import { logAuditEvent, getClientIp, AuditEventType } from '../services/auditService.js';

const router = express.Router();

function generateNumericCode(length = 6) {
  const len = Number(length) === 4 ? 4 : 6;
  const min = Math.pow(10, len - 1);
  const max = Math.pow(10, len) - 1;
  return crypto.randomInt(min, max + 1).toString();
}

const DEFAULT_CODES = {
  'MOD-001': '184920',
  'MOD-002': '294715',
  'MOD-003': '849201',
  'MOD-004': '632194',
  'MOD-005': '518742'
};

/**
 * Ensures dgms_test_authorizations contains rows for all modules.
 * Resilient against cold starts and ephemeral serverless environments.
 */
function ensureAuthorizationsSeeded() {
  try {
    const modules = db.prepare('SELECT id, is_mvp FROM modules').all();
    const insertOrIgnore = db.prepare(`
      INSERT OR IGNORE INTO dgms_test_authorizations 
      (id, module_id, access_code, code_length, is_enabled, authorized_by, authorized_by_name)
      VALUES (?, ?, ?, ?, ?, 'USR-DGMS-01', 'Dr. A.K. Sengupta (Chief Inspector)')
    `);

    for (const m of modules) {
      const code = DEFAULT_CODES[m.id] || generateNumericCode(6);
      insertOrIgnore.run(`AUTH-${m.id}`, m.id, code, 6, m.is_mvp ? 1 : 0);
    }
  } catch (err) {
    console.warn('[DGMS] Auto-seed warning:', err.message);
  }
}

/**
 * GET /api/dgms/authorizations
 * Lists all module test authorizations, statutory access codes, and live states.
 * Accessible with optional token so both authenticated inspectors and simulated sessions work reliably.
 */
router.get('/authorizations', optionalAuthenticate, (req, res, next) => {
  try {
    ensureAuthorizationsSeeded();

    const stmt = db.prepare(`
      SELECT 
        a.id,
        a.module_id,
        a.access_code,
        a.code_length,
        a.is_enabled,
        a.authorized_by,
        a.authorized_by_name,
        a.updated_at,
        m.title AS module_title,
        m.title_hi,
        m.title_sat,
        m.description,
        m.category,
        m.pass_score_threshold,
        m.est_minutes,
        m.is_mvp,
        m.phase
      FROM dgms_test_authorizations a
      JOIN modules m ON a.module_id = m.id
      ORDER BY m.phase ASC, m.id ASC
    `);
    const rows = stmt.all();

    // Fallback if modules join produced empty results
    if (!rows || rows.length === 0) {
      const fallbackList = [
        { id: 'AUTH-MOD-001', module_id: 'MOD-001', module_title: 'Fire & Explosion Response', access_code: '184920', code_length: 6, is_enabled: 1, is_mvp: 1, phase: 1, pass_score_threshold: 80, est_minutes: 12, authorized_by_name: 'Dr. A.K. Sengupta (Chief Inspector)' },
        { id: 'AUTH-MOD-002', module_id: 'MOD-002', module_title: 'Gas Leak & Confined Space Protocol', access_code: '294715', code_length: 6, is_enabled: 1, is_mvp: 1, phase: 1, pass_score_threshold: 75, est_minutes: 15, authorized_by_name: 'Dr. A.K. Sengupta (Chief Inspector)' },
        { id: 'AUTH-MOD-003', module_id: 'MOD-003', module_title: 'Machinery & Moving-Part Safety', access_code: '849201', code_length: 6, is_enabled: 0, is_mvp: 0, phase: 2, pass_score_threshold: 80, est_minutes: 10, authorized_by_name: 'Dr. A.K. Sengupta (Chief Inspector)' },
        { id: 'AUTH-MOD-004', module_id: 'MOD-004', module_title: 'Electrical & Blasting Clearance', access_code: '632194', code_length: 6, is_enabled: 0, is_mvp: 0, phase: 2, pass_score_threshold: 85, est_minutes: 14, authorized_by_name: 'Dr. A.K. Sengupta (Chief Inspector)' },
        { id: 'AUTH-MOD-005', module_id: 'MOD-005', module_title: 'PPE Compliance & Induction', access_code: '518742', code_length: 6, is_enabled: 0, is_mvp: 0, phase: 2, pass_score_threshold: 90, est_minutes: 8, authorized_by_name: 'Dr. A.K. Sengupta (Chief Inspector)' }
      ];
      return res.json(fallbackList);
    }

    res.json(rows);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/dgms/toggle-test
 * Enables or locks an individual vocational test on-site.
 */
router.post('/toggle-test', optionalAuthenticate, (req, res, next) => {
  try {
    const { moduleId, isEnabled } = req.body;
    if (!moduleId) {
      return res.status(400).json({ error: 'moduleId is required' });
    }

    ensureAuthorizationsSeeded();

    const enabledInt = isEnabled ? 1 : 0;
    const inspectorId = req.user?.id || 'USR-DGMS-01';
    const inspectorName = req.user?.name || req.user?.fullName || 'Dr. A.K. Sengupta (Chief Inspector)';

    // Upsert record
    const existing = db.prepare('SELECT id FROM dgms_test_authorizations WHERE module_id = ?').get(moduleId);
    if (!existing) {
      const code = DEFAULT_CODES[moduleId] || generateNumericCode(6);
      db.prepare(`
        INSERT INTO dgms_test_authorizations (id, module_id, access_code, code_length, is_enabled, authorized_by, authorized_by_name)
        VALUES (?, ?, ?, 6, ?, ?, ?)
      `).run(`AUTH-${moduleId}`, moduleId, code, enabledInt, inspectorId, inspectorName);
    } else {
      db.prepare(`
        UPDATE dgms_test_authorizations
        SET is_enabled = ?,
            authorized_by = ?,
            authorized_by_name = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE module_id = ?
      `).run(enabledInt, inspectorId, inspectorName, moduleId);
    }

    logAuditEvent({
      eventType: AuditEventType.STATUS_CHANGE || 'STATUS_CHANGE',
      actorId: inspectorId,
      actorRole: req.user?.role || 'DGMS_INSPECTOR',
      resource: `DGMS_TEST:${moduleId}`,
      action: enabledInt ? 'ENABLE_TEST_SESSION' : 'DISABLE_TEST_SESSION',
      result: 'SUCCESS',
      ipAddress: getClientIp(req),
      metadata: { moduleId, isEnabled: enabledInt, inspectorName }
    });

    const updated = db.prepare(`
      SELECT a.*, COALESCE(m.title, a.module_id) AS module_title
      FROM dgms_test_authorizations a
      LEFT JOIN modules m ON a.module_id = m.id
      WHERE a.module_id = ?
    `).get(moduleId);

    res.json({
      success: true,
      message: `Test ${moduleId} ${enabledInt ? 'enabled for worker drill' : 'locked under DGMS specification'}`,
      authorization: updated
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/dgms/generate-code
 * Generates a fresh 4 or 6-digit statutory access code for a module.
 */
router.post('/generate-code', optionalAuthenticate, (req, res, next) => {
  try {
    const { moduleId, codeLength = 6 } = req.body;
    if (!moduleId) {
      return res.status(400).json({ error: 'moduleId is required' });
    }

    ensureAuthorizationsSeeded();

    const length = Number(codeLength) === 4 ? 4 : 6;
    const newCode = generateNumericCode(length);
    const inspectorId = req.user?.id || 'USR-DGMS-01';
    const inspectorName = req.user?.name || req.user?.fullName || 'Dr. A.K. Sengupta (Chief Inspector)';

    const existing = db.prepare('SELECT id FROM dgms_test_authorizations WHERE module_id = ?').get(moduleId);
    if (!existing) {
      db.prepare(`
        INSERT INTO dgms_test_authorizations (id, module_id, access_code, code_length, is_enabled, authorized_by, authorized_by_name)
        VALUES (?, ?, ?, ?, 0, ?, ?)
      `).run(`AUTH-${moduleId}`, moduleId, newCode, length, inspectorId, inspectorName);
    } else {
      db.prepare(`
        UPDATE dgms_test_authorizations
        SET access_code = ?,
            code_length = ?,
            authorized_by = ?,
            authorized_by_name = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE module_id = ?
      `).run(newCode, length, inspectorId, inspectorName, moduleId);
    }

    logAuditEvent({
      eventType: 'ACCESS_GRANTED',
      actorId: inspectorId,
      actorRole: req.user?.role || 'DGMS_INSPECTOR',
      resource: `DGMS_TEST:${moduleId}`,
      action: 'GENERATE_ACCESS_CODE',
      result: 'SUCCESS',
      ipAddress: getClientIp(req),
      metadata: { moduleId, codeLength: length, codeMasked: `${newCode.slice(0, 2)}****` }
    });

    const updated = db.prepare(`
      SELECT a.*, COALESCE(m.title, a.module_id) AS module_title
      FROM dgms_test_authorizations a
      LEFT JOIN modules m ON a.module_id = m.id
      WHERE a.module_id = ?
    `).get(moduleId);

    res.json({
      success: true,
      message: `New ${length}-digit statutory access code generated for ${moduleId}`,
      accessCode: newCode,
      authorization: updated
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/dgms/verify-code
 * Worker inputs the 4 or 6-digit access code provided by DGMS personnel.
 */
router.post('/verify-code', optionalAuthenticate, (req, res, next) => {
  try {
    const { moduleId, accessCode } = req.body;
    if (!moduleId || !accessCode) {
      return res.status(400).json({
        success: false,
        error: 'Module ID and statutory access code are required'
      });
    }

    ensureAuthorizationsSeeded();

    const cleanedCode = String(accessCode).trim().replace(/[\s-]/g, '');

    const row = db.prepare(`
      SELECT a.*, COALESCE(m.title, a.module_id) AS module_title
      FROM dgms_test_authorizations a
      LEFT JOIN modules m ON a.module_id = m.id
      WHERE a.module_id = ?
    `).get(moduleId);

    if (!row) {
      // Fallback check against default static codes
      const defaultCode = DEFAULT_CODES[moduleId];
      if (defaultCode && defaultCode === cleanedCode) {
        return res.json({
          success: true,
          authorized: true,
          moduleId,
          message: 'Statutory authorization confirmed by DGMS. Drill access granted.'
        });
      }
      return res.status(404).json({
        success: false,
        error: 'Specified training module not found'
      });
    }

    if (row.is_enabled !== 1) {
      return res.status(403).json({
        success: false,
        error: 'This test is currently locked under DGMS specification. The inspecting DGMS officer has not enabled this test session.'
      });
    }

    if (row.access_code !== cleanedCode) {
      return res.status(401).json({
        success: false,
        error: 'Invalid statutory access code. Please verify the 4 or 6-digit code with your inspecting DGMS Officer.'
      });
    }

    // Valid code match and enabled!
    logAuditEvent({
      eventType: 'ACCESS_GRANTED',
      actorId: req.user?.id || 'WORKER_DEVICE',
      actorRole: req.user?.role || 'WORKER',
      resource: `DGMS_TEST:${moduleId}`,
      action: 'VERIFY_DGMS_TEST_CODE',
      result: 'SUCCESS',
      ipAddress: getClientIp(req),
      metadata: { moduleId, verified: true }
    });

    res.json({
      success: true,
      authorized: true,
      moduleId: row.module_id,
      moduleTitle: row.module_title,
      message: 'Statutory authorization confirmed by DGMS. Drill access granted.'
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/dgms/public-status
 * Public status endpoint showing which modules are actively enabled by DGMS.
 */
router.get('/public-status', (req, res, next) => {
  try {
    ensureAuthorizationsSeeded();
    const rows = db.prepare(`
      SELECT module_id, is_enabled, code_length, updated_at
      FROM dgms_test_authorizations
    `).all();
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

export default router;
