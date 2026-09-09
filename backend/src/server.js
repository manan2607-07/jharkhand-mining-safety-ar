import express from 'express';
import cors from 'cors';
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

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middlewares
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Initialize DB and auto-seed if needed
initDatabase();
const siteCountRow = db.prepare('SELECT COUNT(*) AS count FROM sites').get();
if (!siteCountRow || siteCountRow.count === 0) {
  console.log('⚡ Empty database detected. Running seed script...');
  seed();
}

// REST Routes
app.use('/api/auth', authRoutes);
app.use('/api/workers', workerRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/sync', syncRoutes);
app.use('/api/analytics', analyticsRoutes);

// Modules List Endpoint
app.get('/api/modules', (req, res) => {
  try {
    const stmt = db.prepare('SELECT * FROM modules ORDER BY phase ASC, id ASC');
    const modules = stmt.all();
    res.json(modules);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GraphQL API Layer
app.all(
  '/graphql',
  createHandler({
    schema: schema,
    rootValue: rootResolver
  })
);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'HEALTHY',
    service: 'Jharkhand Mining & Steel Vocational AR Training & DGMS Compliance Backend',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    database: 'SQLite (Node.js Built-in Sync)',
    sihProblemStatement: 'PS ID 26041',
    projectType: 'Smart India Hackathon 2026 Academic Simulation Prototype',
    legalDisclaimer: 'Non-governmental educational prototype developed solely for SIH 2026 technical demonstration.'
  });
});

app.listen(PORT, () => {
  console.log(`\n=============================================================`);
  console.log(`🚀 Jharkhand AR Safety Training API Server Running on Port ${PORT}`);
  console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`📊 REST Analytics: http://localhost:${PORT}/api/analytics/compliance-summary`);
  console.log(`🔍 GraphQL Endpoint: http://localhost:${PORT}/graphql`);
  console.log(`=============================================================\n`);
});

export default app;
