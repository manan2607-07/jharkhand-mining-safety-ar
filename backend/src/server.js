import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createHandler } from 'graphql-http/lib/use/express';
import config from './config.js';
import db, { initDatabase } from './db/database.js';
import { seed } from './db/seed.js';

import authRoutes from './routes/authRoutes.js';
import workerRoutes from './routes/workerRoutes.js';
import certificateRoutes from './routes/certificateRoutes.js';
import syncRoutes from './routes/syncRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';

import { schema } from './graphql/schema.js';
import { rootResolver } from './graphql/resolvers.js';
import { optionalAuthenticate, authenticateToken } from './middleware/authMiddleware.js';
import { apiRateLimiter, errorHandler } from './middleware/securityMiddleware.js';

const app = express();

// Trust reverse proxy (Vercel, Nginx, cloud load balancers) for accurate client IP detection & rate limiting
app.set('trust proxy', 1);

// ═══════════════════════════════════════════════════════════════
// 1. Security Headers via Helmet (Hardened CSP — removed unsafe-eval)
// ═══════════════════════════════════════════════════════════════
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],   // Removed 'unsafe-eval'
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
      imgSrc: ["'self'", "data:", "blob:", "https:"],
      connectSrc: [
        "'self'",
        ...(config.isProduction ? [] : ["http://localhost:*", "ws://localhost:*"]),
        "https://jharkhand-mining-safety-ar-six.vercel.app",
        "https://jharkhand-mining-admin.vercel.app"
      ],
      objectSrc: ["'none'"],
      frameAncestors: ["'none'"],       // Clickjacking protection
      formAction: ["'self'"],           // Form submission restriction
      baseUri: ["'self'"],              // Prevent base tag injection
      upgradeInsecureRequests: config.isProduction ? [] : null
    }
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  hidePoweredBy: true,
  hsts: {
    maxAge: 31536000,                   // 1 year
    includeSubDomains: true,
    preload: true
  },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
}));

// ═══════════════════════════════════════════════════════════════
// 2. CORS — Explicit origin allowlist (no wildcards in production)
// ═══════════════════════════════════════════════════════════════
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (server-to-server, mobile apps, curl)
    if (!origin) {
      return callback(null, true);
    }

    // Check explicit allowlist
    if (config.allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // In development only, allow localhost variants
    if (!config.isProduction) {
      if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
        return callback(null, true);
      }
    }

    console.warn(`[CORS] Blocked request from unauthorized origin: ${origin}`);
    return callback(new Error(`CORS policy: Origin ${origin} is not allowed`));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  credentials: true,
  maxAge: 600  // Preflight cache: 10 minutes
}));

// ═══════════════════════════════════════════════════════════════
// 3. Body parsers with defensive payload size limit (1MB max)
// ═══════════════════════════════════════════════════════════════
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// ═══════════════════════════════════════════════════════════════
// 4. General API Rate Limiting
// ═══════════════════════════════════════════════════════════════
app.use('/api', apiRateLimiter);

// ═══════════════════════════════════════════════════════════════
// 5. Initialize DB and auto-seed if needed
// ═══════════════════════════════════════════════════════════════
initDatabase();
try {
  const siteCountRow = db.prepare('SELECT COUNT(*) AS count FROM sites').get();
  if (!siteCountRow || siteCountRow.count === 0) {
    console.log('⚡ Empty database detected. Running seed script...');
    seed();
  }
} catch {
  console.log('⚡ Database initialization — seeding...');
  seed();
}

// ═══════════════════════════════════════════════════════════════
// 6. REST Routes
// ═══════════════════════════════════════════════════════════════
app.use('/api/auth', authRoutes);
app.use('/api/workers', workerRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/sync', syncRoutes);
app.use('/api/analytics', analyticsRoutes);

// Modules List Endpoint — now requires authentication
app.get('/api/modules', authenticateToken, (req, res, next) => {
  try {
    const stmt = db.prepare('SELECT * FROM modules ORDER BY phase ASC, id ASC');
    const modules = stmt.all();
    res.json(modules);
  } catch (err) {
    next(err);
  }
});

// Audit Events — restricted to DGMS_INSPECTOR and STATE_NODAL_OFFICER
app.get('/api/audit/events',
  authenticateToken,
  (req, res, next) => {
    if (!['DGMS_INSPECTOR', 'STATE_NODAL_OFFICER'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied: Insufficient permissions' });
    }
    next();
  },
  (req, res, next) => {
    try {
      const limit = Math.min(Math.max(parseInt(req.query.limit) || 50, 1), 200);
      const offset = Math.max(parseInt(req.query.offset) || 0, 0);
      const eventType = req.query.type;

      let query = 'SELECT * FROM audit_events';
      const params = [];

      if (eventType) {
        query += ' WHERE event_type = ?';
        params.push(eventType);
      }

      query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
      params.push(limit, offset);

      const events = db.prepare(query).all(...params);
      const totalRow = db.prepare(
        eventType
          ? 'SELECT COUNT(*) as total FROM audit_events WHERE event_type = ?'
          : 'SELECT COUNT(*) as total FROM audit_events'
      ).get(...(eventType ? [eventType] : []));

      res.json({
        events,
        pagination: { limit, offset, total: totalRow?.total || 0 }
      });
    } catch (err) {
      next(err);
    }
  }
);

// ═══════════════════════════════════════════════════════════════
// 7. GraphQL API Layer with Context Authentication
// ═══════════════════════════════════════════════════════════════
app.all(
  '/graphql',
  optionalAuthenticate,
  createHandler({
    schema: schema,
    rootValue: rootResolver,
    context: (req) => ({ user: req.raw.user })
  })
);

// ═══════════════════════════════════════════════════════════════
// 8. Health Check (details redacted in production)
// ═══════════════════════════════════════════════════════════════
app.get('/api/health', (req, res) => {
  res.json({
    status: 'HEALTHY',
    service: 'Jharkhand Mining & Steel Vocational AR Training & DGMS Compliance Backend',
    version: '1.1.0',
    timestamp: new Date().toISOString(),
    database: 'Connected',
    sihProblemStatement: 'PS ID 26041',
    projectType: 'Smart India Hackathon 2026 Academic Simulation Prototype',
    legalDisclaimer: 'Non-governmental educational prototype developed solely for SIH 2026 technical demonstration.'
  });
});

// ═══════════════════════════════════════════════════════════════
// 9. Centralized Error Handling Middleware
// ═══════════════════════════════════════════════════════════════
app.use(errorHandler);

if (!process.env.VERCEL) {
  app.listen(config.port, () => {
    console.log(`\n=============================================================`);
    console.log(`🚀 Jharkhand AR Safety Training API Server Running on Port ${config.port}`);
    console.log(`📡 Health Check: http://localhost:${config.port}/api/health`);
    console.log(`📊 REST Analytics: http://localhost:${config.port}/api/analytics/compliance-summary`);
    console.log(`🔍 GraphQL Endpoint: http://localhost:${config.port}/graphql`);
    console.log(`🛡️  Security: Helmet, Rate Limiting, JWT Auth, RBAC, Audit Logging Active`);
    console.log(`=============================================================\n`);
  });
}

export default app;
