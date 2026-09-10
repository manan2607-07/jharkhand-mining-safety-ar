import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { createHandler } from 'graphql-http/lib/use/express';
import db, { initDatabase } from './db/database.js';
import { seed } from './db/seed.js';

import authRoutes from './routes/authRoutes.js';
import workerRoutes from './routes/workerRoutes.js';
import certificateRoutes from './routes/certificateRoutes.js';
import syncRoutes from './routes/syncRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';

import { schema } from './graphql/schema.js';
import { rootResolver } from './graphql/resolvers.js';
import { optionalAuthenticate } from './middleware/authMiddleware.js';
import { apiRateLimiter, errorHandler } from './middleware/securityMiddleware.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Trust reverse proxy (Vercel, Nginx, cloud load balancers) for accurate client IP detection & rate limiting
app.set('trust proxy', 1);

// 1. Security Headers via Helmet (Configured for WebXR, Three.js, Canvas & Google Fonts)
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
      imgSrc: ["'self'", "data:", "blob:", "https:"],
      connectSrc: ["'self'", "http://localhost:*", "ws://localhost:*", "https://*.vercel.app"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null
    }
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  hidePoweredBy: true
}));

// 2. Controlled CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',').map(s => s.trim())
  : [
      'http://localhost:5173', 
      'http://localhost:5174', 
      'http://localhost:5175', 
      'http://localhost:5176', 
      'http://localhost:5177', 
      'http://localhost:3000', 
      'http://127.0.0.1:5176', 
      'http://127.0.0.1:5177'
    ];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    // Allow local dev subnets/hostnames seamlessly
    if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
      return callback(null, true);
    }
    // Allow all Vercel deployment preview and production domains
    try {
      const url = new URL(origin);
      if (url.hostname.endsWith('.vercel.app') || url.hostname === 'vercel.app') {
        return callback(null, true);
      }
    } catch {}
    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  credentials: true
}));

// 3. Body parsers with defensive payload size limit (1MB max, preventing JSON memory bomb DoS)
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// 4. General API Rate Limiting
app.use('/api', apiRateLimiter);

// 5. Initialize DB and auto-seed if needed
initDatabase();
const siteCountRow = db.prepare('SELECT COUNT(*) AS count FROM sites').get();
if (!siteCountRow || siteCountRow.count === 0) {
  console.log('⚡ Empty database detected. Running seed script...');
  seed();
}

// 6. REST Routes
app.use('/api/auth', authRoutes);
app.use('/api/workers', workerRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/sync', syncRoutes);
app.use('/api/analytics', analyticsRoutes);

// Modules List Endpoint
app.get('/api/modules', (req, res, next) => {
  try {
    const stmt = db.prepare('SELECT * FROM modules ORDER BY phase ASC, id ASC');
    const modules = stmt.all();
    res.json(modules);
  } catch (err) {
    next(err);
  }
});

// 7. GraphQL API Layer with Context Authentication
app.all(
  '/graphql',
  optionalAuthenticate,
  createHandler({
    schema: schema,
    rootValue: rootResolver,
    context: (req) => ({ user: req.raw.user })
  })
);

// 8. Health Check (Hardened: details redacted)
app.get('/api/health', (req, res) => {
  res.json({
    status: 'HEALTHY',
    service: 'Jharkhand Mining & Steel Vocational AR Training & DGMS Compliance Backend',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    database: 'Connected',
    sihProblemStatement: 'PS ID 26041',
    projectType: 'Smart India Hackathon 2026 Academic Simulation Prototype',
    legalDisclaimer: 'Non-governmental educational prototype developed solely for SIH 2026 technical demonstration.'
  });
});

// 9. Centralized Error Handling Middleware
app.use(errorHandler);

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`\n=============================================================`);
    console.log(`🚀 Jharkhand AR Safety Training API Server Running on Port ${PORT}`);
    console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
    console.log(`📊 REST Analytics: http://localhost:${PORT}/api/analytics/compliance-summary`);
    console.log(`🔍 GraphQL Endpoint: http://localhost:${PORT}/graphql`);
    console.log(`🛡️  Security: Helmet, Rate Limiting, JWT Auth & RBAC Active`);
    console.log(`=============================================================\n`);
  });
}

export default app;
