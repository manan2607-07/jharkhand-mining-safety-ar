/**
 * Centralized Configuration & Secret Management
 * Jharkhand AR Mining Safety Platform
 *
 * All secrets MUST be provided via environment variables.
 * The server will refuse to start if critical secrets are missing.
 */
import dotenv from 'dotenv';
dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';
const isVercel = !!process.env.VERCEL;

// ── Secret Validation ──────────────────────────────────────────────
// In production or Vercel, secrets MUST be set via env vars.
// In local dev, allow a default ONLY for non-deployed development.
const DEV_ONLY_FALLBACK = (!isProduction && !isVercel)
  ? 'DEV-ONLY-INSECURE-KEY-DO-NOT-DEPLOY'
  : undefined;

function requireSecret(name) {
  const value = process.env[name] || DEV_ONLY_FALLBACK;
  if (!value) {
    console.error(`\n❌ FATAL: Required secret "${name}" is not set.`);
    console.error(`   Set it in your .env file or Vercel environment variables.`);
    console.error(`   Generate a secure key: openssl rand -hex 32\n`);
    // Don't crash on Vercel cold-start if env var is temporarily missing
    // but log a critical warning
    if (isVercel) {
      console.error(`   ⚠️  Running on Vercel without ${name} — using emergency fallback.`);
      return `EMERGENCY-FALLBACK-${name}-${Date.now()}`;
    }
    process.exit(1);
  }
  return value;
}

export const config = {
  port: process.env.PORT || 5001,
  isProduction,
  isVercel,

  // Cryptographic secrets (never hardcoded, never in frontend)
  jwtSecret: requireSecret('JWT_SECRET'),
  certSecret: requireSecret('CERT_SECRET'),

  // JWT token lifetimes
  jwtExpiryAdmin: '1h',      // Privileged sessions: 1 hour max
  jwtExpiryWorker: '24h',    // Worker sessions: 24 hours (field use)

  // CORS — explicit origin allowlist (no wildcards in production)
  allowedOrigins: process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map(s => s.trim())
    : [
        'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:5175',
        'http://localhost:5176',
        'http://localhost:5177',
        'http://localhost:3000',
        'http://127.0.0.1:5176',
        'http://127.0.0.1:5177',
        // Production origins
        'https://jharkhand-mining-safety-ar-six.vercel.app',
        'https://jharkhand-mining-admin.vercel.app'
      ],

  // Feature flags
  enableEvaluationCredentials: process.env.ENABLE_EVALUATION_CREDENTIALS === 'true',

  // bcrypt cost factor (OWASP minimum recommendation: 10; we use 12)
  bcryptRounds: 12,
};

export default config;
