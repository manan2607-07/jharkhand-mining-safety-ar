import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbDir = path.join(__dirname, '../../data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
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

    CREATE INDEX IF NOT EXISTS idx_workers_site ON workers(site_id);
    CREATE INDEX IF NOT EXISTS idx_workers_cohort ON workers(cohort_id);
    CREATE INDEX IF NOT EXISTS idx_certs_worker ON certificates(worker_id);
    CREATE INDEX IF NOT EXISTS idx_certs_hash ON certificates(qr_hash);
    CREATE INDEX IF NOT EXISTS idx_certs_expiry ON certificates(expiry_date);
  `);
}

export default db;
