import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let dbDir = path.join(__dirname, '../../data');
try {
  if (process.env.VERCEL) {
    dbDir = '/tmp';
  } else if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }
} catch {
  dbDir = '/tmp';
}

const dbPath = path.join(dbDir, 'jharkhand_mining_safety.db');
const db = new DatabaseSync(dbPath);

// Enable foreign keys
db.exec(`PRAGMA foreign_keys = ON;`);

export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS sites (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      sector TEXT NOT NULL CHECK(sector IN ('COAL', 'STEEL', 'MICA')),
      district TEXT NOT NULL,
      operator TEXT NOT NULL,
      safety_rating REAL DEFAULT 4.5,
      total_workers INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      full_name TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('WORKER', 'SAFETY_OFFICER', 'DGMS_INSPECTOR', 'STATE_NODAL_OFFICER')),
      site_id TEXT,
      district TEXT,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS cohorts (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      site_id TEXT NOT NULL REFERENCES sites(id),
      supervisor_id TEXT,
      start_date TEXT NOT NULL,
      target_completion_date TEXT,
      status TEXT DEFAULT 'ACTIVE' CHECK(status IN ('ACTIVE', 'COMPLETED', 'UPCOMING')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS workers (
      id TEXT PRIMARY KEY,
      worker_code TEXT UNIQUE NOT NULL,
      full_name TEXT NOT NULL,
      tribal_language TEXT DEFAULT 'SANTALI' CHECK(tribal_language IN ('SANTALI', 'HINDI', 'MUNDARI', 'HO', 'ENGLISH')),
      literacy_level TEXT DEFAULT 'LOW' CHECK(literacy_level IN ('LOW', 'MEDIUM', 'HIGH')),
      site_id TEXT NOT NULL REFERENCES sites(id),
      cohort_id TEXT REFERENCES cohorts(id),
      designation TEXT NOT NULL,
      phone TEXT,
      joined_date TEXT,
      pin_hash TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS modules (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      title_hi TEXT NOT NULL,
      title_sat TEXT NOT NULL,
      description TEXT NOT NULL,
      description_hi TEXT NOT NULL,
      description_sat TEXT NOT NULL,
      category TEXT NOT NULL,
      pass_score_threshold INTEGER DEFAULT 75,
      est_minutes INTEGER DEFAULT 15,
      is_mvp INTEGER DEFAULT 0,
      phase INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS training_sessions (
      id TEXT PRIMARY KEY,
      worker_id TEXT NOT NULL REFERENCES workers(id),
      module_id TEXT NOT NULL REFERENCES modules(id),
      score INTEGER NOT NULL,
      pass_status INTEGER NOT NULL CHECK(pass_status IN (0, 1)),
      completion_time_sec INTEGER,
      ar_accuracy_score REAL,
      language_used TEXT DEFAULT 'SANTALI',
      offline_flag INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS certificates (
      id TEXT PRIMARY KEY,
      certificate_id TEXT UNIQUE NOT NULL,
      worker_id TEXT NOT NULL REFERENCES workers(id),
      module_id TEXT NOT NULL REFERENCES modules(id),
      site_id TEXT NOT NULL REFERENCES sites(id),
      score INTEGER NOT NULL,
      issue_date TEXT NOT NULL,
      expiry_date TEXT NOT NULL,
      qr_hash TEXT UNIQUE NOT NULL,
      signature TEXT NOT NULL,
      countersigned_by TEXT,
      is_revoked INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS sync_audit_log (
      id TEXT PRIMARY KEY,
      client_device_id TEXT,
      synced_sessions INTEGER DEFAULT 0,
      synced_certs INTEGER DEFAULT 0,
      status TEXT DEFAULT 'SUCCESS',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- ═══════════════════════════════════════════════════════════════
    -- SECURITY TABLES (Added for hardening)
    -- ═══════════════════════════════════════════════════════════════

    -- Audit trail for government compliance (immutable log)
    CREATE TABLE IF NOT EXISTS audit_events (
      id TEXT PRIMARY KEY,
      event_type TEXT NOT NULL,
      actor_id TEXT,
      actor_role TEXT,
      resource TEXT,
      action TEXT NOT NULL,
      result TEXT NOT NULL DEFAULT 'SUCCESS',
      ip_address TEXT,
      metadata TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Token blacklist for session revocation
    CREATE TABLE IF NOT EXISTS token_blacklist (
      token_hash TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      reason TEXT DEFAULT 'LOGOUT',
      expires_at DATETIME NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_workers_site ON workers(site_id);
    CREATE INDEX IF NOT EXISTS idx_workers_cohort ON workers(cohort_id);
    CREATE INDEX IF NOT EXISTS idx_certs_worker ON certificates(worker_id);
    CREATE INDEX IF NOT EXISTS idx_certs_hash ON certificates(qr_hash);
    CREATE INDEX IF NOT EXISTS idx_certs_expiry ON certificates(expiry_date);
    CREATE INDEX IF NOT EXISTS idx_audit_type ON audit_events(event_type);
    CREATE INDEX IF NOT EXISTS idx_audit_actor ON audit_events(actor_id);
    CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_events(created_at);
    CREATE INDEX IF NOT EXISTS idx_token_blacklist_expires ON token_blacklist(expires_at);

    -- DGMS Test Authorization & Access Codes
    CREATE TABLE IF NOT EXISTS dgms_test_authorizations (
      id TEXT PRIMARY KEY,
      module_id TEXT UNIQUE NOT NULL REFERENCES modules(id),
      access_code TEXT NOT NULL,
      code_length INTEGER DEFAULT 6,
      is_enabled INTEGER DEFAULT 0,
      authorized_by TEXT,
      authorized_by_name TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_dgms_auth_code ON dgms_test_authorizations(access_code);
    CREATE INDEX IF NOT EXISTS idx_dgms_auth_module ON dgms_test_authorizations(module_id);
  `);

  // Safe column additions for schema migrations
  try {
    db.exec(`ALTER TABLE workers ADD COLUMN pin_hash TEXT;`);
  } catch {
    // Column already exists
  }
  try {
    db.exec(`ALTER TABLE users ADD COLUMN is_active INTEGER DEFAULT 1;`);
  } catch {
    // Column already exists
  }

  // Ensure default DGMS test authorizations exist
  try {
    const defaultAuthorizations = [
      { id: 'AUTH-MOD-001', module_id: 'MOD-001', access_code: '184920', code_length: 6, is_enabled: 1 },
      { id: 'AUTH-MOD-002', module_id: 'MOD-002', access_code: '294715', code_length: 6, is_enabled: 1 },
      { id: 'AUTH-MOD-003', module_id: 'MOD-003', access_code: '849201', code_length: 6, is_enabled: 0 },
      { id: 'AUTH-MOD-004', module_id: 'MOD-004', access_code: '632194', code_length: 6, is_enabled: 0 },
      { id: 'AUTH-MOD-005', module_id: 'MOD-005', access_code: '518742', code_length: 6, is_enabled: 0 }
    ];

    const insertAuthStmt = db.prepare(`
      INSERT OR IGNORE INTO dgms_test_authorizations (id, module_id, access_code, code_length, is_enabled, authorized_by, authorized_by_name)
      VALUES (?, ?, ?, ?, ?, 'USR-DGMS-01', 'Dr. A.K. Sengupta (Chief Inspector)')
    `);

    for (const auth of defaultAuthorizations) {
      insertAuthStmt.run(auth.id, auth.module_id, auth.access_code, auth.code_length, auth.is_enabled);
    }
  } catch (err) {
    console.warn('[DB] Warning seeding default DGMS test authorizations:', err.message);
  }

  // Clean expired blacklisted tokens on startup
  try {
    db.prepare(`DELETE FROM token_blacklist WHERE expires_at < datetime('now')`).run();
  } catch {
    // Table may not exist yet on first run
  }
}

export default db;
