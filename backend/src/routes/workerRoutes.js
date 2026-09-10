import express from 'express';
import bcrypt from 'bcryptjs';
import db from '../db/database.js';
import config from '../config.js';
import { authenticateToken, authorizeRoles, enforceSiteIsolation } from '../middleware/authMiddleware.js';
import { sanitizeText } from '../middleware/securityMiddleware.js';
import { logAuditEvent, getClientIp, AuditEventType } from '../services/auditService.js';

const router = express.Router();

// GET /api/workers - List workers with site and cohort joins (Requires Admin Auth + Site Isolation, Paginated)
router.get(
  '/',
  authenticateToken,
  authorizeRoles('SAFETY_OFFICER', 'DGMS_INSPECTOR', 'STATE_NODAL_OFFICER'),
  enforceSiteIsolation,
  (req, res, next) => {
    try {
      const { siteId, cohortId, district, sector, search } = req.query;

      let query = `
        SELECT 
          w.id, w.worker_code, w.full_name, w.tribal_language, w.literacy_level,
          w.designation, w.phone, w.joined_date,
          s.id AS site_id, s.name AS site_name, s.sector, s.district,
          c.id AS cohort_id, c.name AS cohort_name,
          (SELECT COUNT(*) FROM certificates cert WHERE cert.worker_id = w.id AND cert.is_revoked = 0) AS active_certs_count,
          (SELECT COUNT(*) FROM training_sessions sess WHERE sess.worker_id = w.id) AS training_sessions_count,
          (SELECT MAX(score) FROM training_sessions sess WHERE sess.worker_id = w.id) AS latest_score,
          (SELECT MAX(created_at) FROM training_sessions sess WHERE sess.worker_id = w.id) AS last_drill_date
        FROM workers w
        JOIN sites s ON w.site_id = s.id
        LEFT JOIN cohorts c ON w.cohort_id = c.id
        WHERE 1=1
      `;
      const params = [];

      if (siteId) {
        query += ' AND w.site_id = ?';
        params.push(sanitizeText(siteId, 50));
      }
      if (cohortId) {
        query += ' AND w.cohort_id = ?';
        params.push(sanitizeText(cohortId, 50));
      }
      if (district) {
        query += ' AND s.district = ?';
        params.push(sanitizeText(district, 50));
      }
      if (sector) {
        query += ' AND s.sector = ?';
        params.push(sanitizeText(sector, 50));
      }
      if (search) {
        const cleanSearch = sanitizeText(search, 50);
        query += ' AND (w.full_name LIKE ? OR w.worker_code LIKE ?)';
        params.push(`%${cleanSearch}%`, `%${cleanSearch}%`);
      }

      // Safe pagination: default 200, max 500 per page to prevent memory exhaustion DoS
      const limit = Math.min(Math.max(parseInt(req.query.limit) || 200, 1), 500);
      const offset = Math.max(parseInt(req.query.offset) || 0, 0);

      query += ' ORDER BY w.created_at DESC LIMIT ? OFFSET ?';
      params.push(limit, offset);

      const stmt = db.prepare(query);
      const workers = stmt.all(...params);
      res.setHeader('X-Total-Count', workers.length);
      res.json(workers);
    } catch (err) {
      next(err);
    }
  }
);

// GET /api/workers/:id - Worker profile with full training history & certificates (IDOR Protected)
router.get('/:id', authenticateToken, (req, res, next) => {
  try {
    const rawId = req.params.id;
    const cleanId = sanitizeText(rawId, 50);

    const workerStmt = db.prepare(`
      SELECT 
        w.id, w.worker_code, w.full_name, w.tribal_language, w.literacy_level,
        w.designation, w.phone, w.joined_date, w.site_id, w.cohort_id,
        s.name AS site_name, s.sector, s.district, s.operator,
        c.name AS cohort_name
      FROM workers w
      JOIN sites s ON w.site_id = s.id
      LEFT JOIN cohorts c ON w.cohort_id = c.id
      WHERE w.id = ? OR w.worker_code = ?
    `);
    const worker = workerStmt.get(cleanId, cleanId);

    if (!worker) {
      return res.status(404).json({ error: 'Worker not found' });
    }

    // Access Control: Workers can only view their own profile
    if (req.user.role === 'WORKER') {
      if (req.user.id !== worker.id && req.user.workerCode !== worker.worker_code) {
        logAuditEvent({
          type: AuditEventType.IDOR_ATTEMPT,
          actorId: req.user.id,
          actorRole: req.user.role,
          resource: `worker:${cleanId}`,
          action: 'Worker attempted unauthorized access to another worker profile',
          result: 'DENIED',
          ipAddress: getClientIp(req)
        });
        return res.status(403).json({ error: 'Access denied: You can only view your own worker profile' });
      }
    }

    // Access Control: Safety officers can only view workers in their site
    if (req.user.role === 'SAFETY_OFFICER' && req.user.siteId && req.user.siteId !== worker.site_id) {
      return res.status(403).json({ error: 'Access denied: Worker belongs to a different mine site' });
    }

    const certsStmt = db.prepare(`
      SELECT 
        c.*, 
        m.title AS module_title, m.title_hi, m.title_sat, m.category
      FROM certificates c
      JOIN modules m ON c.module_id = m.id
      WHERE c.worker_id = ?
      ORDER BY c.issue_date DESC
    `);
    const certificates = certsStmt.all(worker.id);

    const sessionsStmt = db.prepare(`
      SELECT 
        ts.*, 
        m.title AS module_title
      FROM training_sessions ts
      JOIN modules m ON ts.module_id = m.id
      WHERE ts.worker_id = ?
      ORDER BY ts.created_at DESC
    `);
    const sessions = sessionsStmt.all(worker.id);

    res.json({
      worker,
      certificates,
      sessions
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/workers/enroll - Register / bulk-enroll workers (Restricted + Batch Capped)
router.post(
  '/enroll',
  authenticateToken,
  authorizeRoles('SAFETY_OFFICER', 'STATE_NODAL_OFFICER'),
  enforceSiteIsolation,
  (req, res, next) => {
    try {
      const { workers } = req.body;
      const list = Array.isArray(workers) ? workers : [req.body];

      if (!list.length || !list[0]) {
        return res.status(400).json({ error: 'No worker enrollment data provided' });
      }

      // DoS Prevention: Maximum 50 workers per batch request
      if (list.length > 50) {
        return res.status(400).json({ error: 'Batch enrollment exceeds limit of 50 records per submission' });
      }

      const insert = db.prepare(`
        INSERT INTO workers (id, worker_code, full_name, tribal_language, literacy_level, site_id, cohort_id, designation, phone, joined_date, pin_hash)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const defaultPinHash = bcrypt.hashSync('1234', config.bcryptRounds);
      const enrolled = [];

      for (const w of list) {
        if (!w.full_name) continue;

        const id = `WRK-${Date.now().toString().slice(-4)}${Math.floor(Math.random() * 900 + 100)}`;
        const workerCode = w.worker_code 
          ? sanitizeText(w.worker_code, 20) 
          : `JH-WRK-${Math.floor(Math.random() * 8999 + 1000)}`;

        const siteId = (req.user.role === 'SAFETY_OFFICER' && req.user.siteId) 
          ? req.user.siteId 
          : (sanitizeText(w.site_id, 50) || 'SITE-DHN-01');

        insert.run(
          id,
          workerCode,
          sanitizeText(w.full_name, 100) || 'Tribal Recruit',
          ['SANTALI', 'HINDI', 'MUNDARI', 'HO', 'ENGLISH'].includes(w.tribal_language) ? w.tribal_language : 'SANTALI',
          ['LOW', 'MEDIUM', 'HIGH'].includes(w.literacy_level) ? w.literacy_level : 'LOW',
          siteId,
          w.cohort_id ? sanitizeText(w.cohort_id, 50) : null,
          sanitizeText(w.designation, 100) || 'Trainee Miner',
          sanitizeText(w.phone, 20) || '+91 94311 00000',
          w.joined_date || new Date().toISOString().split('T')[0],
          defaultPinHash
        );
        enrolled.push({ id, worker_code: workerCode, full_name: w.full_name });
      }

      logAuditEvent({
        type: AuditEventType.WORKER_ENROLLED,
        actorId: req.user.id,
        actorRole: req.user.role,
        action: `Enrolled ${enrolled.length} worker(s)`,
        result: 'SUCCESS',
        ipAddress: getClientIp(req),
        metadata: { count: enrolled.length }
      });

      res.status(201).json({
        message: `Successfully enrolled ${enrolled.length} worker(s)`,
        enrolled
      });
    } catch (err) {
      next(err);
    }
  }
);

// GET /api/workers/cohorts/list - List cohorts with completion metrics (Protected)
router.get(
  '/cohorts/list',
  authenticateToken,
  authorizeRoles('SAFETY_OFFICER', 'DGMS_INSPECTOR', 'STATE_NODAL_OFFICER'),
  enforceSiteIsolation,
  (req, res, next) => {
    try {
      const { siteId } = req.query;
      let query = `
        SELECT 
          c.*, 
          s.name AS site_name, s.district, s.sector,
          COUNT(w.id) AS total_enrolled,
          COUNT(DISTINCT cert.worker_id) AS certified_count
        FROM cohorts c
        JOIN sites s ON c.site_id = s.id
        LEFT JOIN workers w ON w.cohort_id = c.id
        LEFT JOIN certificates cert ON cert.worker_id = w.id AND cert.is_revoked = 0
        WHERE 1=1
      `;
      const params = [];

      if (siteId) {
        query += ' AND c.site_id = ?';
        params.push(sanitizeText(siteId, 50));
      }

      query += ' GROUP BY c.id ORDER BY c.start_date DESC';

      const stmt = db.prepare(query);
      const cohorts = stmt.all(...params);
      res.json(cohorts);
    } catch (err) {
      next(err);
    }
  }
);

// POST /api/workers/cohorts/create - Create new training cohort (Protected)
router.post(
  '/cohorts/create',
  authenticateToken,
  authorizeRoles('SAFETY_OFFICER', 'STATE_NODAL_OFFICER'),
  enforceSiteIsolation,
  (req, res, next) => {
    try {
      const { name, site_id, supervisor_id, start_date, target_completion_date } = req.body;
      if (!name || !start_date) {
        return res.status(400).json({ error: 'Cohort name and start_date required' });
      }

      const cleanSiteId = (req.user.role === 'SAFETY_OFFICER' && req.user.siteId) 
        ? req.user.siteId 
        : (sanitizeText(site_id, 50) || 'SITE-DHN-01');

      const prefix = cleanSiteId.includes('-') ? cleanSiteId.split('-')[1] : 'COH';
      const id = `COH-${prefix}-${Date.now().toString().slice(-4)}`;
      
      const insert = db.prepare(`
        INSERT INTO cohorts (id, name, site_id, supervisor_id, start_date, target_completion_date, status)
        VALUES (?, ?, ?, ?, ?, ?, 'ACTIVE')
      `);

      insert.run(
        id,
        sanitizeText(name, 100),
        cleanSiteId,
        supervisor_id ? sanitizeText(supervisor_id, 50) : (req.user.id || null),
        sanitizeText(start_date, 20),
        target_completion_date ? sanitizeText(target_completion_date, 20) : null
      );

      logAuditEvent({
        type: AuditEventType.COHORT_CREATED,
        actorId: req.user.id,
        actorRole: req.user.role,
        resource: `cohort:${id}`,
        action: `Created training cohort: ${name} (${id})`,
        result: 'SUCCESS',
        ipAddress: getClientIp(req)
      });

      res.status(201).json({ id, name, site_id: cleanSiteId, status: 'ACTIVE' });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
