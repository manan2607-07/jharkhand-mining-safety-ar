import express from 'express';
import db from '../db/database.js';

const router = express.Router();

/**
 * POST /api/sync
 * Opportunistic sync endpoint for offline mobile apps and underground tablets.
 */
router.post('/', (req, res) => {
  try {
    const {
      client_device_id = 'MOBILE-DEV-APP',
      sessions = [],
      certificates = []
    } = req.body;

    let syncedSessionsCount = 0;
    let syncedCertsCount = 0;

    const checkSessionStmt = db.prepare('SELECT id FROM training_sessions WHERE id = ?');
    const insertSessionStmt = db.prepare(`
      INSERT INTO training_sessions (id, worker_id, module_id, score, pass_status, completion_time_sec, ar_accuracy_score, language_used, offline_flag, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
    `);

    for (const sess of sessions) {
      if (!sess.id) continue;
      const existing = checkSessionStmt.get(sess.id);
      if (!existing) {
        insertSessionStmt.run(
          sess.id,
          sess.worker_id,
          sess.module_id,
          sess.score,
          sess.pass_status ? 1 : 0,
          sess.completion_time_sec || 300,
          sess.ar_accuracy_score || 0.9,
          sess.language_used || 'SANTALI',
          sess.created_at || new Date().toISOString()
        );
        syncedSessionsCount++;
      }
    }

    const checkCertStmt = db.prepare('SELECT id FROM certificates WHERE certificate_id = ? OR qr_hash = ?');
    const insertCertStmt = db.prepare(`
      INSERT INTO certificates (id, certificate_id, worker_id, module_id, site_id, score, issue_date, expiry_date, qr_hash, signature, countersigned_by, is_revoked, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?)
    `);

    for (const cert of certificates) {
      if (!cert.certificate_id || !cert.qr_hash) continue;
      const existing = checkCertStmt.get(cert.certificate_id, cert.qr_hash);
      if (!existing) {
        insertCertStmt.run(
          cert.id || `ID-${cert.certificate_id}`,
          cert.certificate_id,
          cert.worker_id,
          cert.module_id,
          cert.site_id,
          cert.score,
          cert.issue_date,
          cert.expiry_date,
          cert.qr_hash,
          cert.signature,
          cert.countersigned_by || 'USR-OFFICER-01',
          cert.created_at || new Date().toISOString()
        );
        syncedCertsCount++;
      }
    }

    // Record in sync audit log
    const logId = `SYNC-LOG-${Date.now()}`;
    const insertLog = db.prepare(`
      INSERT INTO sync_audit_log (id, client_device_id, synced_sessions, synced_certs, status)
      VALUES (?, ?, ?, ?, 'SUCCESS')
    `);
    insertLog.run(logId, client_device_id, syncedSessionsCount, syncedCertsCount);

    res.json({
      status: 'SYNC_COMPLETE',
      clientDeviceId: client_device_id,
      syncedSessions: syncedSessionsCount,
      syncedCertificates: syncedCertsCount,
      timestamp: new Date().toISOString(),
      message: `Conflict-safe opportunistic sync completed: ${syncedSessionsCount} sessions & ${syncedCertsCount} certificates integrated into state ledger.`
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/sync/audit-history
router.get('/audit-history', (req, res) => {
  try {
    const stmt = db.prepare('SELECT * FROM sync_audit_log ORDER BY created_at DESC LIMIT 50');
    const history = stmt.all();
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
