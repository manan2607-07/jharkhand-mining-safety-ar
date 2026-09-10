import express from 'express';
import { generateCertificateHash, calculateExpiryDate } from '../services/cryptoService.js';
import db from '../db/database.js';
import { authenticateToken, authorizeRoles, enforceSiteIsolation } from '../middleware/authMiddleware.js';
import { sensitiveOpLimiter, publicVerifyLimiter, sanitizeText } from '../middleware/securityMiddleware.js';
import { logAuditEvent, getClientIp, AuditEventType } from '../services/auditService.js';

const router = express.Router();

// GET /api/certificates - List certificates with filters (Requires Admin Auth + Site Isolation)
router.get(
  '/',
  authenticateToken,
  authorizeRoles('SAFETY_OFFICER', 'DGMS_INSPECTOR', 'STATE_NODAL_OFFICER'),
  enforceSiteIsolation,
  (req, res, next) => {
    try {
      const { district, sector, siteId, isExpired, search } = req.query;
      const today = new Date().toISOString().split('T')[0];

      let query = `
        SELECT 
          c.*,
          w.worker_code, w.full_name AS worker_name, w.tribal_language, w.designation,
          s.name AS site_name, s.sector, s.district, s.operator,
          m.title AS module_title, m.category AS module_category,
          CASE 
            WHEN c.is_revoked = 1 THEN 'REVOKED'
            WHEN c.expiry_date < ? THEN 'EXPIRED'
            WHEN date(c.expiry_date, '-30 days') <= ? THEN 'EXPIRING_SOON'
            ELSE 'VALID'
          END AS compliance_status
        FROM certificates c
        JOIN workers w ON c.worker_id = w.id
        JOIN sites s ON c.site_id = s.id
        JOIN modules m ON c.module_id = m.id
        WHERE 1=1
      `;
      const params = [today, today];

      if (district) {
        query += ' AND s.district = ?';
        params.push(sanitizeText(district, 50));
      }
      if (sector) {
        query += ' AND s.sector = ?';
        params.push(sanitizeText(sector, 50));
      }
      if (siteId) {
        query += ' AND c.site_id = ?';
        params.push(sanitizeText(siteId, 50));
      }
      if (isExpired === 'true') {
        query += ' AND c.expiry_date < ?';
        params.push(today);
      } else if (isExpired === 'false') {
        query += ' AND c.expiry_date >= ? AND c.is_revoked = 0';
        params.push(today);
      }
      if (search) {
        const cleanSearch = sanitizeText(search, 50);
        query += ' AND (c.certificate_id LIKE ? OR w.full_name LIKE ? OR w.worker_code LIKE ? OR c.qr_hash LIKE ?)';
        params.push(`%${cleanSearch}%`, `%${cleanSearch}%`, `%${cleanSearch}%`, `%${cleanSearch}%`);
      }

      // Safe pagination: default 200, max 500 per page to prevent memory exhaustion DoS
      const limit = Math.min(Math.max(parseInt(req.query.limit) || 200, 1), 500);
      const offset = Math.max(parseInt(req.query.offset) || 0, 0);

      query += ' ORDER BY c.issue_date DESC LIMIT ? OFFSET ?';
      params.push(limit, offset);

      const stmt = db.prepare(query);
      const certs = stmt.all(...params);
      res.setHeader('X-Total-Count', certs.length);
      res.json(certs);
    } catch (err) {
      next(err);
    }
  }
);

// GET /api/certificates/verify/:hashOrId - DGMS Live Verification & QR Scanner Endpoint (Public + Rate-limited)
router.get('/verify/:hashOrId', publicVerifyLimiter, (req, res, next) => {
  try {
    const rawTarget = req.params.hashOrId;
    const cleanTarget = sanitizeText(rawTarget, 128);

    if (!cleanTarget) {
      return res.status(400).json({ error: 'Valid certificate ID or QR hash required' });
    }

    const today = new Date().toISOString().split('T')[0];

    const stmt = db.prepare(`
      SELECT 
        c.*,
        w.worker_code, w.full_name AS worker_name, w.tribal_language, w.designation, w.phone,
        s.name AS site_name, s.sector, s.district, s.operator,
        m.title AS module_title, m.title_hi, m.title_sat, m.category,
        CASE 
          WHEN c.is_revoked = 1 THEN 'REVOKED'
          WHEN c.expiry_date < ? THEN 'EXPIRED'
          WHEN date(c.expiry_date, '-30 days') <= ? THEN 'EXPIRING_SOON'
          ELSE 'VALID'
        END AS compliance_status
      FROM certificates c
      JOIN workers w ON c.worker_id = w.id
      JOIN sites s ON c.site_id = s.id
      JOIN modules m ON c.module_id = m.id
      WHERE c.qr_hash = ? OR c.certificate_id = ?
    `);

    const cert = stmt.get(today, today, cleanTarget, cleanTarget);

    if (!cert) {
      return res.status(404).json({
        verified: false,
        error: 'Certificate not found or hash mismatch. Forgery detected or invalid QR code.'
      });
    }

    // Verify cryptographic hash integrity against tamper-evident payload
    const verification = generateCertificateHash({
      certificateId: cert.certificate_id,
      workerId: cert.worker_id,
      moduleId: cert.module_id,
      siteId: cert.site_id,
      score: cert.score,
      issueDate: cert.issue_date,
      expiryDate: cert.expiry_date
    });

    const isTamperFree = verification.hash === cert.qr_hash;

    const daysRemaining = Math.ceil(
      (new Date(cert.expiry_date).getTime() - new Date(today).getTime()) / (1000 * 60 * 60 * 24)
    );

    res.json({
      verified: isTamperFree && cert.is_revoked === 0 && daysRemaining > 0,
      tamperFree: isTamperFree,
      complianceStatus: cert.compliance_status,
      daysRemaining,
      certificate: cert,
      statutoryCompliance: {
        minesAct1952Compliant: isTamperFree && daysRemaining > 0,
        factoriesAct1948Compliant: isTamperFree && daysRemaining > 0,
        dgmsCircularRef: 'DGMS/S&T/Circular-2026/041',
        nextMandatoryRefresherDate: cert.expiry_date
      }
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/certificates/issue - Issue certificate upon completed AR assessment (Authenticated + Validated)
router.post('/issue', authenticateToken, sensitiveOpLimiter, (req, res, next) => {
  try {
    const {
      worker_id,
      module_id,
      score,
      completion_time_sec = 360,
      ar_accuracy_score = 0.95,
      language_used = 'SANTALI',
      offline_flag = 0
    } = req.body;

    if (!worker_id || !module_id || score === undefined) {
      return res.status(400).json({ error: 'worker_id, module_id, and score required' });
    }

    const cleanWorkerId = sanitizeText(worker_id, 50);
    const cleanModuleId = sanitizeText(module_id, 50);

    // IDOR Authorization Check: Workers can only issue certificates for themselves
    if (req.user.role === 'WORKER') {
      if (req.user.id !== cleanWorkerId && req.user.workerCode !== cleanWorkerId) {
        return res.status(403).json({ error: 'Access denied: You can only issue certifications for your own account' });
      }
    }

    // Input Validation
    const numericScore = Number(score);
    if (isNaN(numericScore) || numericScore < 0 || numericScore > 100) {
      return res.status(400).json({ error: 'Score must be a number between 0 and 100' });
    }

    const numericCompletionTime = Math.max(1, Math.min(86400, Number(completion_time_sec) || 300));
    const numericAccuracy = Math.max(0, Math.min(1, Number(ar_accuracy_score) || 0.9));

    // Fetch worker record
    const workerStmt = db.prepare('SELECT * FROM workers WHERE id = ? OR worker_code = ?');
    const worker = workerStmt.get(cleanWorkerId, cleanWorkerId);

    if (!worker) {
      return res.status(404).json({ error: 'Worker not found' });
    }

    // Safety Officer site isolation check
    if (req.user.role === 'SAFETY_OFFICER' && req.user.siteId && req.user.siteId !== worker.site_id) {
      return res.status(403).json({ error: 'Access denied: Worker belongs to a different mine site' });
    }

    const moduleStmt = db.prepare('SELECT * FROM modules WHERE id = ?');
    const mod = moduleStmt.get(cleanModuleId);

    if (!mod) {
      return res.status(404).json({ error: 'Safety module not found' });
    }

    const passed = numericScore >= (mod.pass_score_threshold || 75) ? 1 : 0;

    // Log training session
    const sessId = `SESS-${Date.now()}-${Math.floor(Math.random() * 900 + 100)}`;
    const insertSession = db.prepare(`
      INSERT INTO training_sessions (id, worker_id, module_id, score, pass_status, completion_time_sec, ar_accuracy_score, language_used, offline_flag)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    insertSession.run(
      sessId, 
      worker.id, 
      mod.id, 
      numericScore, 
      passed, 
      numericCompletionTime, 
      numericAccuracy, 
      sanitizeText(language_used, 20) || 'SANTALI', 
      offline_flag ? 1 : 0
    );

    if (!passed) {
      return res.status(200).json({
        passed: false,
        score: numericScore,
        threshold: mod.pass_score_threshold,
        message: 'Assessment score is below DGMS competency threshold. Please retake the module.'
      });
    }

    // Issue cryptographic certificate
    const issueDate = new Date().toISOString().split('T')[0];
    const expiryDate = calculateExpiryDate(issueDate);
    const certNumber = Math.floor(10000 + Math.random() * 90000);
    const certificateId = `CERT-JH-2026-${certNumber}`;

    const { hash, signature } = generateCertificateHash({
      certificateId,
      workerId: worker.id,
      moduleId: mod.id,
      siteId: worker.site_id,
      score: numericScore,
      issueDate,
      expiryDate
    });

    const certRowId = `ID-${certificateId}`;
    const insertCert = db.prepare(`
      INSERT INTO certificates (id, certificate_id, worker_id, module_id, site_id, score, issue_date, expiry_date, qr_hash, signature, countersigned_by, is_revoked)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
    `);

    insertCert.run(
      certRowId,
      certificateId,
      worker.id,
      mod.id,
      worker.site_id,
      numericScore,
      issueDate,
      expiryDate,
      hash,
      signature,
      req.user.id || 'USR-OFFICER-01'
    );

    res.status(201).json({
      passed: true,
      certificate: {
        certificateId,
        workerId: worker.id,
        workerName: worker.full_name,
        moduleTitle: mod.title,
        score: numericScore,
        issueDate,
        expiryDate,
        qrHash: hash,
        signature,
        statutoryNotice: 'Certified under Mines Act, 1952 & Factories Act, 1948 norms'
      }
    });

    logAuditEvent({
      type: AuditEventType.CERT_ISSUED,
      actorId: req.user.id,
      actorRole: req.user.role,
      resource: `certificate:${certificateId}`,
      action: `Certificate issued for worker ${worker.worker_code} on module ${mod.id} (score: ${numericScore})`,
      result: 'SUCCESS',
      ipAddress: getClientIp(req)
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/certificates/export/dgms-report - Statutory audit export (Restricted to Inspectors & State Nodal)
router.get(
  '/export/dgms-report',
  authenticateToken,
  authorizeRoles('DGMS_INSPECTOR', 'STATE_NODAL_OFFICER'),
  (req, res, next) => {
    try {
      const { district, sector } = req.query;
      let query = `
        SELECT 
          c.certificate_id AS "Certificate ID",
          w.worker_code AS "Worker Code",
          w.full_name AS "Worker Name",
          w.tribal_language AS "Language",
          s.name AS "Mine/Plant Site",
          s.district AS "District",
          s.sector AS "Sector",
          m.title AS "Safety Module",
          c.score AS "Competency Score (%)",
          c.issue_date AS "Issue Date",
          c.expiry_date AS "Statutory Expiry",
          c.signature AS "DGMS Signature Code",
          c.qr_hash AS "Cryptographic QR Hash"
        FROM certificates c
        JOIN workers w ON c.worker_id = w.id
        JOIN sites s ON c.site_id = s.id
        JOIN modules m ON c.module_id = m.id
        WHERE c.is_revoked = 0
      `;
      const params = [];
      if (district) {
        query += ' AND s.district = ?';
        params.push(sanitizeText(district, 50));
      }
      if (sector) {
        query += ' AND s.sector = ?';
        params.push(sanitizeText(sector, 50));
      }

      query += ' ORDER BY c.issue_date DESC';

      const stmt = db.prepare(query);
      const rows = stmt.all(...params);

      res.json({
        metadata: {
          generatedAt: new Date().toISOString(),
          regulatoryBenchmark: 'DGMS Technical Criteria & Mines Act 1952 (SIH 2026 Academic Simulation)',
          issuingBody: 'Smart India Hackathon 2026 Evaluation Engine (PS ID: 26041)',
          actReference: 'Mines Act 1952, Section 22A & Factories Act 1948',
          totalCertificatesAudited: rows.length
        },
        records: rows
      });

      logAuditEvent({
        type: AuditEventType.DATA_EXPORT,
        actorId: req.user.id,
        actorRole: req.user.role,
        resource: 'certificates:dgms-report',
        action: `DGMS audit report exported (${rows.length} records)`,
        result: 'SUCCESS',
        ipAddress: getClientIp(req),
        metadata: { recordCount: rows.length, filters: { district: req.query.district, sector: req.query.sector } }
      });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
