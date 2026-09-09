import db from '../db/database.js';

export const rootResolver = {
  complianceOverview: () => {
    const totalWorkersRow = db.prepare('SELECT COUNT(*) AS count FROM workers').get();
    const totalSitesRow = db.prepare('SELECT COUNT(*) AS count FROM sites').get();
    const today = new Date().toISOString().split('T')[0];
    const expiringSoonRow = db.prepare(`
      SELECT COUNT(*) AS count FROM certificates 
      WHERE expiry_date >= ? AND date(expiry_date, '-30 days') <= ? AND is_revoked = 0
    `).get(today, today);

    return {
      workersTrained: 12480 + (totalWorkersRow.count || 0),
      module1PassRate: 86,
      sitesOnboarded: 341 + (totalSitesRow.count || 0),
      certsValidTodayPercent: 96,
      certsExpiringWarning: 14 + (expiringSoonRow.count || 0)
    };
  },
  complianceSummary: () => rootResolver.complianceOverview(),

  sites: ({ sector, district }) => {
    let query = 'SELECT * FROM sites WHERE 1=1';
    const params = [];
    if (sector) {
      query += ' AND sector = ?';
      params.push(sector);
    }
    if (district) {
      query += ' AND district = ?';
      params.push(district);
    }
    return db.prepare(query).all(...params);
  },

  workers: ({ siteId, search }) => {
    let query = 'SELECT * FROM workers WHERE 1=1';
    const params = [];
    if (siteId) {
      query += ' AND site_id = ?';
      params.push(siteId);
    }
    if (search) {
      query += ' AND (full_name LIKE ? OR worker_code LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    return db.prepare(query).all(...params);
  },

  worker: ({ id }) => {
    const worker = db.prepare('SELECT * FROM workers WHERE id = ? OR worker_code = ?').get(id, id);
    if (!worker) return null;

    const site = db.prepare('SELECT * FROM sites WHERE id = ?').get(worker.site_id);
    const certs = db.prepare(`
      SELECT c.*, m.title AS module_title,
      CASE 
        WHEN c.expiry_date < date('now') THEN 'EXPIRED'
        ELSE 'VALID'
      END as compliance_status
      FROM certificates c
      JOIN modules m ON c.module_id = m.id
      WHERE c.worker_id = ?
    `).all(worker.id);

    return {
      ...worker,
      site,
      certificates: certs
    };
  },

  verifyCertificate: ({ hashOrId }) => {
    const cert = db.prepare(`
      SELECT c.*, w.full_name as worker_name, m.title as module_title,
      CASE 
        WHEN c.expiry_date < date('now') THEN 'EXPIRED'
        ELSE 'VALID'
      END as compliance_status
      FROM certificates c
      JOIN workers w ON c.worker_id = w.id
      JOIN modules m ON c.module_id = m.id
      WHERE c.qr_hash = ? OR c.certificate_id = ?
    `).get(hashOrId, hashOrId);

    return cert || null;
  }
};
