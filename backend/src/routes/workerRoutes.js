import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../db/database.js';

const router = express.Router();

// GET /api/workers - List workers with site and cohort joins
router.get('/', (req, res) => {
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
      params.push(siteId);
    }
    if (cohortId) {
      query += ' AND w.cohort_id = ?';
      params.push(cohortId);
    }
    if (district) {
      query += ' AND s.district = ?';
      params.push(district);
    }
    if (sector) {
      query += ' AND s.sector = ?';
      params.push(sector);
    }
    if (search) {
      query += ' AND (w.full_name LIKE ? OR w.worker_code LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY w.created_at DESC';

    const stmt = db.prepare(query);
    const workers = stmt.all(...params);
    res.json(workers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/workers/:id - Worker profile with full training history & certificates
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;

    const workerStmt = db.prepare(`
      SELECT 
        w.*, 
        s.name AS site_name, s.sector, s.district, s.operator,
        c.name AS cohort_name
      FROM workers w
      JOIN sites s ON w.site_id = s.id
      LEFT JOIN cohorts c ON w.cohort_id = c.id
      WHERE w.id = ? OR w.worker_code = ?
    `);
    const worker = workerStmt.get(id, id);

    if (!worker) {
      return res.status(404).json({ error: 'Worker not found' });
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
    res.status(500).json({ error: err.message });
  }
});

// POST /api/workers/enroll - Register / bulk-enroll workers
router.post('/enroll', (req, res) => {
  try {
    const { workers } = req.body; // Array of worker objects or single worker
    const list = Array.isArray(workers) ? workers : [req.body];

    if (!list.length) {
      return res.status(400).json({ error: 'No worker data provided' });
    }

    const insert = db.prepare(`
      INSERT INTO workers (id, worker_code, full_name, tribal_language, literacy_level, site_id, cohort_id, designation, phone, joined_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const enrolled = [];
    for (const w of list) {
      const id = `WRK-${Date.now().toString().slice(-4)}${Math.floor(Math.random() * 900 + 100)}`;
      const workerCode = w.worker_code || `JH-WRK-${Math.floor(Math.random() * 8999 + 1000)}`;
      insert.run(
        id,
        workerCode,
        w.full_name || 'Tribal Recruit',
        w.tribal_language || 'SANTALI',
        w.literacy_level || 'LOW',
        w.site_id || 'SITE-DHN-01',
        w.cohort_id || null,
        w.designation || 'Trainee Miner',
        w.phone || '+91 94311 00000',
        w.joined_date || new Date().toISOString().split('T')[0]
      );
      enrolled.push({ id, worker_code: workerCode, full_name: w.full_name });
    }

    res.status(201).json({
      message: `Successfully enrolled ${enrolled.length} worker(s)`,
      enrolled
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/workers/cohorts/list - List cohorts with completion metrics
router.get('/cohorts/list', (req, res) => {
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
      params.push(siteId);
    }

    query += ' GROUP BY c.id ORDER BY c.start_date DESC';

    const stmt = db.prepare(query);
    const cohorts = stmt.all(...params);
    res.json(cohorts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/workers/cohorts/create - Create new training cohort
router.post('/cohorts/create', (req, res) => {
  try {
    const { name, site_id, supervisor_id, start_date, target_completion_date } = req.body;
    if (!name || !site_id || !start_date) {
      return res.status(400).json({ error: 'Name, site_id, and start_date required' });
    }

    const id = `COH-${site_id.split('-')[1]}-${Date.now().toString().slice(-4)}`;
    const insert = db.prepare(`
      INSERT INTO cohorts (id, name, site_id, supervisor_id, start_date, target_completion_date, status)
      VALUES (?, ?, ?, ?, ?, ?, 'ACTIVE')
    `);

    insert.run(id, name, site_id, supervisor_id || null, start_date, target_completion_date || null);
    res.status(201).json({ id, name, site_id, status: 'ACTIVE' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
