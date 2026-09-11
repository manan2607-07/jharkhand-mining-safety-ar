import express from 'express';
import crypto from 'crypto';
import db from '../db/database.js';
import { authenticateToken, authorizeRoles, optionalAuthenticate } from '../middleware/authMiddleware.js';
import { sanitizeText } from '../middleware/securityMiddleware.js';
import { logAuditEvent, getClientIp, AuditEventType } from '../services/auditService.js';

const router = express.Router();

function generateNumericCode(length = 6) {
  const len = length === 4 ? 4 : 6;
  const min = Math.pow(10, len - 1);
  const max = Math.pow(10, len) - 1;
  return crypto.randomInt(min, max + 1).toString();
}

/**
 * GET /api/dgms/authorizations
 * Lists all module test authorizations, statutory access codes, and live states.
 * Accessible to DGMS_INSPECTOR, STATE_NODAL_OFFICER, SAFETY_OFFICER.
 */
router.get(
  '/authorizations',
  authenticateToken,
  authorizeRoles('DGMS_INSPECTOR', 'STATE_NODAL_OFFICER', 'SAFETY_OFFICER'),
  (req, res, next) => {
    try {
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
      res.json(rows);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * POST /api/dgms/toggle-test
 * Enables or locks an individual vocational test on-site.
 * Restricted strictly to DGMS_INSPECTOR.
 */
router.post(
  '/toggle-test',
  authenticateToken,
  authorizeRoles('DGMS_INSPECTOR'),
  (req, res, next) => {
    try {
      const { moduleId, isEnabled } = req.body;
      if (!moduleId) {
        return res.status(400).json({ error: 'moduleId is required' });
      }

      const enabledInt = isEnabled ? 1 : 0;
      const inspectorId = req.user.id;
      const inspectorName = req.user.name || 'Dr. A.K. Sengupta (Chief Inspector)';

      const updateStmt = db.prepare(`
        UPDATE dgms_test_authorizations
        SET is_enabled = ?,
            authorized_by = ?,
            authorized_by_name = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE module_id = ?
      `);

      const result = updateStmt.run(enabledInt, inspectorId, inspectorName, moduleId);
      if (result.changes === 0) {
        return res.status(404).json({ error: 'Module authorization record not found' });
      }

      logAuditEvent({
        eventType: AuditEventType.STATUS_CHANGE || 'STATUS_CHANGE',
        actorId: req.user.id,
        actorRole: req.user.role,
        resource: `DGMS_TEST:${moduleId}`,
        action: enabledInt ? 'ENABLE_TEST_SESSION' : 'DISABLE_TEST_SESSION',
        result: 'SUCCESS',
        ipAddress: getClientIp(req),
        metadata: { moduleId, isEnabled: enabledInt, inspectorName }
      });

      const updated = db.prepare(`
        SELECT a.*, m.title AS module_title
        FROM dgms_test_authorizations a
        JOIN modules m ON a.module_id = m.id
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
  }
);

/**
 * POST /api/dgms/generate-code
 * Generates a fresh 4 or 6-digit statutory access code for a module.
 * Restricted strictly to DGMS_INSPECTOR.
 */
router.post(
  '/generate-code',
  authenticateToken,
  authorizeRoles('DGMS_INSPECTOR'),
  (req, res, next) => {
    try {
      const { moduleId, codeLength = 6 } = req.body;
      if (!moduleId) {
        return res.status(400).json({ error: 'moduleId is required' });
      }

      const length = Number(codeLength) === 4 ? 4 : 6;
      const newCode = generateNumericCode(length);
      const inspectorId = req.user.id;
      const inspectorName = req.user.name || 'Dr. A.K. Sengupta (Chief Inspector)';

      const updateStmt = db.prepare(`
        UPDATE dgms_test_authorizations
        SET access_code = ?,
            code_length = ?,
            authorized_by = ?,
            authorized_by_name = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE module_id = ?
      `);

      const result = updateStmt.run(newCode, length, inspectorId, inspectorName, moduleId);
      if (result.changes === 0) {
        return res.status(404).json({ error: 'Module authorization record not found' });
      }

      logAuditEvent({
        eventType: 'ACCESS_GRANTED',
        actorId: req.user.id,
        actorRole: req.user.role,
        resource: `DGMS_TEST:${moduleId}`,
        action: 'GENERATE_ACCESS_CODE',
        result: 'SUCCESS',
        ipAddress: getClientIp(req),
        metadata: { moduleId, codeLength: length, codeMasked: `${newCode.slice(0, 2)}****` }
      });

      const updated = db.prepare(`
        SELECT a.*, m.title AS module_title
        FROM dgms_test_authorizations a
        JOIN modules m ON a.module_id = m.id
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
  }
);

/**
 * POST /api/dgms/verify-code
 * Worker inputs the 4 or 6-digit access code provided by DGMS personnel.
 * Verifies code validity and that test is actively enabled by DGMS.
 */
router.post(
  '/verify-code',
  optionalAuthenticate,
  (req, res, next) => {
    try {
      const { moduleId, accessCode } = req.body;
      if (!moduleId || !accessCode) {
        return res.status(400).json({
          success: false,
          error: 'Module ID and statutory access code are required'
        });
      }

      const cleanedCode = String(accessCode).trim().replace(/[\s-]/g, '');

      const row = db.prepare(`
        SELECT a.*, m.title AS module_title, m.pass_score_threshold, m.est_minutes
        FROM dgms_test_authorizations a
        JOIN modules m ON a.module_id = m.id
        WHERE a.module_id = ?
      `).get(moduleId);

      if (!row) {
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
  }
);

/**
 * GET /api/dgms/public-status
 * Public status endpoint showing which modules are actively enabled by DGMS.
 * Access codes are omitted for security.
 */
router.get('/public-status', (req, res, next) => {
  try {
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
