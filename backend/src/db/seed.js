import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import db, { initDatabase } from './database.js';

const JWT_SECRET = process.env.JWT_SECRET || 'jharkhand-sih-2026-secret-key-dgms-verified';

export function seed() {
  console.log('⚡ Initializing Database Schema...');
  initDatabase();

  // Clear existing records in proper dependency order
  db.exec(`
    DELETE FROM sync_audit_log;
    DELETE FROM certificates;
    DELETE FROM training_sessions;
    DELETE FROM workers;
    DELETE FROM cohorts;
    DELETE FROM users;
    DELETE FROM modules;
    DELETE FROM sites;
  `);

  console.log('🌱 Seeding Jharkhand Industrial Sites...');
  const insertSite = db.prepare(`
    INSERT INTO sites (id, name, sector, district, operator, safety_rating, total_workers)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const sites = [
    { id: 'SITE-DHN-01', name: 'BCCL Jharia Underground Coal Mine Colliery #4', sector: 'COAL', district: 'Dhanbad', operator: 'Bharat Coking Coal Ltd (BCCL)', rating: 4.6, workers: 4200 },
    { id: 'SITE-BOK-01', name: 'SAIL Bokaro Steel Plant - Blast Furnace Unit #2', sector: 'STEEL', district: 'Bokaro', operator: 'Steel Authority of India Ltd (SAIL)', rating: 4.8, workers: 3600 },
    { id: 'SITE-KOD-01', name: 'Koderma Mica Mining & Beneficiation Zone', sector: 'MICA', district: 'Koderma', operator: 'Jharkhand State Mineral Dev. Corp (JSMDC)', rating: 4.2, workers: 1450 },
    { id: 'SITE-RAM-01', name: 'CCL Rajrappa Open Cast Project', sector: 'COAL', district: 'Ramgarh', operator: 'Central Coalfields Ltd (CCL)', rating: 4.5, workers: 2800 },
    { id: 'SITE-JSR-01', name: 'Tata Steel Jamshedpur Rolling Mill & Pellet Plant', sector: 'STEEL', district: 'East Singhbhum', operator: 'Tata Steel Ltd', rating: 4.9, workers: 5100 },
    { id: 'SITE-GIR-01', name: 'Giridih Mica Flake & Sheet Processing Unit', sector: 'MICA', district: 'Giridih', operator: 'Chotanagpur Minerals Co.', rating: 4.1, workers: 920 },
    { id: 'SITE-RNC-01', name: 'Ranchi Heavy Engineering & Machinery Division', sector: 'STEEL', district: 'Ranchi', operator: 'HEC Ranchi', rating: 4.4, workers: 1800 }
  ];

  for (const s of sites) {
    insertSite.run(s.id, s.name, s.sector, s.district, s.operator, s.rating, s.workers);
  }

  console.log('🌱 Seeding Platform Users & Roles...');
  const insertUser = db.prepare(`
    INSERT INTO users (id, username, password_hash, full_name, role, site_id, district)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const pwHash = bcrypt.hashSync('password123', 8);

  const users = [
    { id: 'USR-WORKER-01', username: 'worker1', hash: pwHash, name: 'Birsa Hansda', role: 'WORKER', site: 'SITE-DHN-01', dist: 'Dhanbad' },
    { id: 'USR-OFFICER-01', username: 'officer1', hash: pwHash, name: 'Rajesh Mahato (Safety Officer)', role: 'SAFETY_OFFICER', site: 'SITE-DHN-01', dist: 'Dhanbad' },
    { id: 'USR-OFFICER-01-ALT', username: 'officer_dhanbad', hash: pwHash, name: 'Rajesh Mahato (Safety Officer)', role: 'SAFETY_OFFICER', site: 'SITE-DHN-01', dist: 'Dhanbad' },
    { id: 'USR-OFFICER-02', username: 'officer2', hash: pwHash, name: 'Anand Murmu (Plant Safety Sup.)', role: 'SAFETY_OFFICER', site: 'SITE-BOK-01', dist: 'Bokaro' },
    { id: 'USR-DGMS-01', username: 'dgms_inspector', hash: pwHash, name: 'Dr. A.K. Sengupta (Chief Inspector)', role: 'DGMS_INSPECTOR', site: null, dist: 'Dhanbad' },
    { id: 'USR-STATE-01', username: 'state_nodal', hash: pwHash, name: 'Priya Soren (State Nodal Officer)', role: 'STATE_NODAL_OFFICER', site: null, dist: 'Ranchi' }
  ];

  for (const u of users) {
    insertUser.run(u.id, u.username, u.hash, u.name, u.role, u.site, u.dist);
  }

  console.log('🌱 Seeding Training Modules...');
  const insertModule = db.prepare(`
    INSERT INTO modules (id, title, title_hi, title_sat, description, description_hi, description_sat, category, pass_score_threshold, est_minutes, is_mvp, phase)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const modules = [
    {
      id: 'MOD-001',
      title: 'Fire & Explosion Response',
      title_hi: 'आग एवं विस्फोट आपातकालीन प्रतिक्रिया',
      title_sat: 'ᱥᱮᱸᱜᱮᱞ ᱟᱨ ᱵᱚᱢ ᱵᱤᱥᱯᱷᱚᱴ ᱵᱟᱧᱪᱟᱣ',
      desc: 'Exit identification, extinguisher PASS technique (Pull, Aim, Squeeze, Sweep) and emergency evacuation sequencing on real camera surroundings.',
      desc_hi: 'वास्तविक परिवेश में आपातकालीन निकास की पहचान, अग्निशामक PASS तकनीक (खींचें, निशाना लगाएं, दबाएं, घुमाएं) और सुरक्षित निकासी।',
      desc_sat: 'ᱠᱮᱢᱨᱟ ᱦᱚᱛᱮᱛᱮ ᱚᱰᱚᱠᱚᱜ ᱰᱟᱦᱟᱨ ᱧᱟᱢ, ᱥᱮᱸᱜᱮᱞ ᱤᱬᱤᱡ (PASS) ᱠᱟᱹᱢᱤᱦᱚᱨᱟ ᱟᱨ ᱨᱩᱠᱷᱤᱭᱟᱹ ᱵᱟᱧᱪᱟᱣ ᱰᱟᱦᱟᱨ ᱥᱮᱪᱮᱫ᱾',
      category: 'EMERGENCY_RESPONSE',
      pass_threshold: 80,
      est_minutes: 12,
      is_mvp: 1,
      phase: 1
    },
    {
      id: 'MOD-002',
      title: 'Gas Leak & Confined Space Protocol',
      title_hi: 'गैस रिसाव एवं सीमित स्थान सुरक्षा प्रोटोकॉल',
      title_sat: 'ᱜᱮᱥ ᱡᱚᱨᱚ ᱟᱨ ᱪᱤᱯᱟᱹᱴ ᱡᱟᱭᱜᱟ ᱨᱩᱠᱷᱤᱭᱟᱹ',
      desc: 'Atmospheric multi-gas detector monitoring (CH4 Methane, CO, O2 deficiency), mandatory PPE donning sequence, and 2-person buddy-system signaling.',
      desc_hi: 'वायुमंडलीय मल्टी-गैस डिटेक्टर (मीथेन, CO, ऑक्सीजन कमी), अनिवार्य PPE पहनने का क्रम और 2-व्यक्ति बडी-सिस्टम संकेत।',
      desc_sat: 'ᱢᱤᱛᱷᱮᱱ ᱟᱨ ᱠᱟᱨᱵᱚᱱ ᱢᱚᱱᱳᱠᱥᱟᱭᱤᱰ ᱜᱮᱥ ᱯᱚᱨᱠᱷᱟᱣ, PPE ᱦᱚᱨᱚᱜ ᱞᱮᱠᱟᱱ ᱥᱟᱯᱟᱵ ᱟᱨ ᱵᱟᱨ ᱦᱚᱲᱟᱜ ᱵᱟᱰᱟᱭ ᱪᱤᱱᱦᱟᱹ᱾',
      category: 'HAZARD_PREVENTION',
      pass_threshold: 80,
      est_minutes: 15,
      is_mvp: 1,
      phase: 1
    },
    {
      id: 'MOD-003',
      title: 'Machinery & Moving-Part Safety',
      title_hi: 'मशीनरी एवं कन्वेयर सुरक्षा (LOTO)',
      title_sat: 'ᱠᱚᱞ ᱠᱟᱹᱨᱜᱟᱲ ᱟᱨ ᱢᱮᱥᱤᱱ ᱨᱩᱠᱷᱤᱭᱟᱹ',
      desc: 'Lock-Out/Tag-Out (LOTO) procedures, guard-rail recognition, and pinch-point distance simulation for coal conveyors and rock crushers.',
      desc_hi: 'कन्वेयर बेल्ट और क्रशर के लिए लॉक-आउट/टैग-आउट (LOTO) प्रक्रियाएं और गार्ड-रेल सुरक्षा जांच।',
      desc_sat: 'ᱢᱮᱥᱤᱱ ᱵᱚᱸᱫᱽ ᱠᱟᱛᱮ ᱪᱟᱹᱵᱷᱤ ᱞᱟᱜᱟᱣ (LOTO) ᱟᱨ ᱵᱮᱞᱴ ᱥᱩᱨ ᱨᱩᱠᱷᱤᱭᱟᱹ ᱥᱟᱺᱜᱤᱧ ᱫᱚᱦᱚ᱾',
      category: 'INDUSTRIAL_SAFETY',
      pass_threshold: 75,
      est_minutes: 10,
      is_mvp: 0,
      phase: 2
    },
    {
      id: 'MOD-004',
      title: 'Electrical & Blasting Hazard Awareness',
      title_hi: 'विद्युत एवं ब्लास्टिंग क्लीयरेंस ड्रिल',
      title_sat: 'ᱵᱤᱡᱽᱞᱤ ᱟᱨ ᱵᱞᱟᱥᱴᱤᱝ ᱦᱩᱥᱤᱭᱟᱹᱨ',
      desc: 'High-voltage arc flash boundary recognition and open-cast dynamite blast perimeter clearance sequencing.',
      desc_hi: 'उच्च वोल्टेज चाप सीमा पहचान और खदान में ब्लास्टिंग से पूर्व सुरक्षित दूरी निकासी ड्रिल।',
      desc_sat: 'ᱦᱟᱭ-ᱵᱷᱚᱞᱴᱮᱡᱽ ᱵᱤᱡᱽᱞᱤ ᱟᱨ ᱠᱷᱟᱫᱟᱱ ᱵᱞᱟᱥᱴᱤᱝ ᱚᱠᱛᱚ ᱥᱟᱺᱜᱤᱧ ᱪᱟᱞᱟᱣ ᱥᱮᱪᱮᱫ᱾',
      category: 'SPECIALIZED_DRILL',
      pass_threshold: 85,
      est_minutes: 15,
      is_mvp: 0,
      phase: 2
    },
    {
      id: 'MOD-005',
      title: 'PPE Compliance & Site Induction',
      title_hi: 'PPE अनुपालन एवं प्रथम दिवस खदान प्रवेश',
      title_sat: 'ᱯᱤᱯᱤᱤ (PPE) ᱦᱚᱨᱚᱜ ᱟᱨ ᱠᱷᱟᱫᱟᱱ ᱵᱚᱞᱚᱱ',
      desc: 'AR-guided PPE fitting check (helmet, reflective jacket, safety boots, dust mask) and hazard map walkthrough for new tribal recruits.',
      desc_hi: 'नए श्रमिकों के लिए एआर-गाइडेड पीपीई फिटिंग जांच (हेलमेट, बूट, मास्क) और प्रथम-दिवस अभिविन्यास।',
      desc_sat: 'ᱱᱟᱣᱟ ᱠᱟᱹᱢᱤᱭᱟᱹ ᱠᱚ ᱞᱟᱹᱜᱤᱫ ᱦᱮᱞᱢᱮᱴ, ᱡᱩᱛᱟᱹ, ᱢᱟᱥᱠ ᱴᱷᱤᱠ ᱥᱟᱺᱦᱤᱡ ᱦᱚᱨᱚᱜ ᱟᱨ ᱠᱷᱟᱫᱟᱱ ᱵᱚᱞᱚᱱ ᱰᱟᱦᱟᱨ᱾',
      category: 'INDUCTION',
      pass_threshold: 75,
      est_minutes: 8,
      is_mvp: 0,
      phase: 2
    }
  ];

  for (const m of modules) {
    insertModule.run(
      m.id, m.title, m.title_hi, m.title_sat,
      m.desc, m.desc_hi, m.desc_sat,
      m.category, m.pass_threshold, m.est_minutes, m.is_mvp, m.phase
    );
  }

  console.log('🌱 Seeding Cohorts & Frontline Workers...');
  const insertCohort = db.prepare(`
    INSERT INTO cohorts (id, name, site_id, supervisor_id, start_date, target_completion_date, status)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const cohorts = [
    { id: 'COH-DHN-2026-A', name: 'BCCL Dhanbad - 2026 Q1 Underground Batch', site_id: 'SITE-DHN-01', supervisor: 'USR-OFFICER-01', start: '2026-08-01', end: '2026-09-15', status: 'ACTIVE' },
    { id: 'COH-BOK-2026-B', name: 'SAIL Bokaro - Furnace Contract Recruits', site_id: 'SITE-BOK-01', supervisor: 'USR-OFFICER-02', start: '2026-08-10', end: '2026-09-30', status: 'ACTIVE' },
    { id: 'COH-KOD-2026-C', name: 'Koderma Mica - Tribal Women Processing Group', site_id: 'SITE-KOD-01', supervisor: 'USR-OFFICER-01', start: '2026-07-15', end: '2026-08-30', status: 'COMPLETED' },
    { id: 'COH-RAM-2026-D', name: 'CCL Rajrappa - Heavy Equipment Operators', site_id: 'SITE-RAM-01', supervisor: 'USR-OFFICER-01', start: '2026-08-20', end: '2026-10-05', status: 'ACTIVE' }
  ];

  for (const c of cohorts) {
    insertCohort.run(c.id, c.name, c.site_id, c.supervisor, c.start, c.end, c.status);
  }

  const workerPinHash = bcrypt.hashSync('1234', 8);

  const insertWorker = db.prepare(`
    INSERT INTO workers (id, worker_code, full_name, tribal_language, literacy_level, site_id, cohort_id, designation, phone, joined_date, pin_hash)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const workerNames = [
    { code: 'JH-WRK-001', name: 'Birsa Hansda', lang: 'SANTALI', lit: 'LOW', site: 'SITE-DHN-01', cohort: 'COH-DHN-2026-A', desig: 'Underground Driller', phone: '+91 94311 20401' },
    { code: 'JH-WRK-002', name: 'Shibu Soren', lang: 'SANTALI', lit: 'LOW', site: 'SITE-DHN-01', cohort: 'COH-DHN-2026-A', desig: 'Loader Operator', phone: '+91 94311 20402' },
    { code: 'JH-WRK-003', name: 'Sunil Murmu', lang: 'SANTALI', lit: 'MEDIUM', site: 'SITE-DHN-01', cohort: 'COH-DHN-2026-A', desig: 'Ventilation Helper', phone: '+91 94311 20403' },
    { code: 'JH-WRK-004', name: 'Champa Marandi', lang: 'SANTALI', lit: 'LOW', site: 'SITE-KOD-01', cohort: 'COH-KOD-2026-C', desig: 'Mica Sorter', phone: '+91 94311 20404' },
    { code: 'JH-WRK-005', name: 'Raju Mahato', lang: 'HINDI', lit: 'MEDIUM', site: 'SITE-BOK-01', cohort: 'COH-BOK-2026-B', desig: 'Blast Furnace Assistant', phone: '+91 94311 20405' },
    { code: 'JH-WRK-006', name: 'Basanti Hembram', lang: 'SANTALI', lit: 'LOW', site: 'SITE-KOD-01', cohort: 'COH-KOD-2026-C', desig: 'Mica Splitter', phone: '+91 94311 20406' },
    { code: 'JH-WRK-007', name: 'Mangal Tudu', lang: 'SANTALI', lit: 'LOW', site: 'SITE-DHN-01', cohort: 'COH-DHN-2026-A', desig: 'Coal Cutter', phone: '+91 94311 20407' },
    { code: 'JH-WRK-008', name: 'Karan Munda', lang: 'MUNDARI', lit: 'LOW', site: 'SITE-RAM-01', cohort: 'COH-RAM-2026-D', desig: 'Dumper Driver', phone: '+91 94311 20408' },
    { code: 'JH-WRK-009', name: 'Gita Kisku', lang: 'SANTALI', lit: 'MEDIUM', site: 'SITE-KOD-01', cohort: 'COH-KOD-2026-C', desig: 'Mica Quality Inspector', phone: '+91 94311 20409' },
    { code: 'JH-WRK-010', name: 'Rameshwar Oraon', lang: 'HINDI', lit: 'HIGH', site: 'SITE-BOK-01', cohort: 'COH-BOK-2026-B', desig: 'Crane Operator', phone: '+91 94311 20410' },
    { code: 'JH-WRK-011', name: 'Sita Besra', lang: 'SANTALI', lit: 'LOW', site: 'SITE-DHN-01', cohort: 'COH-DHN-2026-A', desig: 'Conveyor Attendant', phone: '+91 94311 20411' },
    { code: 'JH-WRK-012', name: 'Jaipal Singh Ho', lang: 'HO', lit: 'LOW', site: 'SITE-JSR-01', cohort: 'COH-RAM-2026-D', desig: 'Slag Handler', phone: '+91 94311 20412' }
  ];

  for (let i = 0; i < workerNames.length; i++) {
    const w = workerNames[i];
    const id = `WRK-${1000 + i}`;
    insertWorker.run(id, w.code, w.name, w.lang, w.lit, w.site, w.cohort, w.desig, w.phone, '2026-06-01', workerPinHash);
  }

  console.log('🌱 Seeding Initial Training Sessions & QR Certificates...');
  const insertSession = db.prepare(`
    INSERT INTO training_sessions (id, worker_id, module_id, score, pass_status, completion_time_sec, ar_accuracy_score, language_used, offline_flag, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertCert = db.prepare(`
    INSERT INTO certificates (id, certificate_id, worker_id, module_id, site_id, score, issue_date, expiry_date, qr_hash, signature, countersigned_by, is_revoked, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const sampleCertificates = [
    {
      worker_id: 'WRK-1000',
      module_id: 'MOD-001',
      site_id: 'SITE-DHN-01',
      score: 92,
      issue_date: '2026-08-14',
      expiry_date: '2027-08-14',
      lang: 'SANTALI',
      countersign: 'USR-OFFICER-01'
    },
    {
      worker_id: 'WRK-1000',
      module_id: 'MOD-002',
      site_id: 'SITE-DHN-01',
      score: 88,
      issue_date: '2026-08-20',
      expiry_date: '2027-08-20',
      lang: 'SANTALI',
      countersign: 'USR-OFFICER-01'
    },
    {
      worker_id: 'WRK-1001',
      module_id: 'MOD-001',
      site_id: 'SITE-DHN-01',
      score: 85,
      issue_date: '2026-08-18',
      expiry_date: '2027-08-18',
      lang: 'SANTALI',
      countersign: 'USR-OFFICER-01'
    },
    {
      worker_id: 'WRK-1003',
      module_id: 'MOD-001',
      site_id: 'SITE-KOD-01',
      score: 95,
      issue_date: '2026-08-10',
      expiry_date: '2027-08-10',
      lang: 'SANTALI',
      countersign: 'USR-OFFICER-01'
    },
    {
      worker_id: 'WRK-1004',
      module_id: 'MOD-002',
      site_id: 'SITE-BOK-01',
      score: 82,
      issue_date: '2026-08-25',
      expiry_date: '2027-08-25',
      lang: 'HINDI',
      countersign: 'USR-OFFICER-02'
    },
    {
      // An expiring certificate within 15 days to test DGMS warning alert
      worker_id: 'WRK-1006',
      module_id: 'MOD-001',
      site_id: 'SITE-DHN-01',
      score: 80,
      issue_date: '2025-09-20',
      expiry_date: '2026-09-20',
      lang: 'SANTALI',
      countersign: 'USR-OFFICER-01'
    }
  ];

  for (let idx = 0; idx < sampleCertificates.length; idx++) {
    const sc = sampleCertificates[idx];
    const sessId = `SESS-${2000 + idx}`;
    insertSession.run(
      sessId, sc.worker_id, sc.module_id, sc.score, 1, 480, 0.94, sc.lang, 0, sc.issue_date + ' 10:30:00'
    );

    const certId = `CERT-JH-2026-${10000 + idx}`;
    const rawPayload = `${certId}|${sc.worker_id}|${sc.module_id}|${sc.site_id}|${sc.score}|${sc.issue_date}|${sc.expiry_date}`;
    const qrHash = crypto.createHmac('sha256', JWT_SECRET).update(rawPayload).digest('hex');
    const signature = `DGMS-SIG-${qrHash.substring(0, 16).toUpperCase()}`;

    insertCert.run(
      `ID-${certId}`, certId, sc.worker_id, sc.module_id, sc.site_id, sc.score,
      sc.issue_date, sc.expiry_date, qrHash, signature, sc.countersign, 0, sc.issue_date + ' 11:00:00'
    );
  }

  console.log('✅ Seeding completed successfully!');
  console.log(`   - Sites: ${sites.length}`);
  console.log(`   - Users: ${users.length}`);
  console.log(`   - Modules: ${modules.length}`);
  console.log(`   - Cohorts: ${cohorts.length}`);
  console.log(`   - Workers: ${workerNames.length}`);
  console.log(`   - Certificates: ${sampleCertificates.length}`);
}

// Auto-run if executed directly
if (process.argv[1]?.endsWith('seed.js')) {
  seed();
}
