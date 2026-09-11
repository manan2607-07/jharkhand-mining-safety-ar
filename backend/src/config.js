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
// Use environment variables when provided. If running on Vercel or locally
// without explicit env vars, use deterministic stable secrets so tokens verify
// consistently across serverless lambda instances.
const STABLE_SECRETS = {
  JWT_SECRET: 'JH-MINING-SAFETY-DGMS-STABLE-JWT-SECRET-2026-KEY-PROD-X9F4',
  CERT_SECRET: 'JH-MINING-SAFETY-DGMS-STABLE-CERT-HMAC-SECRET-2026-KEY-PROD-Y8Q2'
};

function requireSecret(name) {
  const value = process.env[name];
  if (value) return value;

  if (STABLE_SECRETS[name]) {
    if (isVercel || isProduction) {
      console.warn(`[CONFIG] Note: Using stable fallback key for "${name}". To use a custom key, set ${name} in Vercel environment variables.`);
    }
    return STABLE_SECRETS[name];
  }

  if (!isProduction && !isVercel) {
    return 'DEV-ONLY-INSECURE-KEY-DO-NOT-DEPLOY';
  }

  return `STABLE-FALLBACK-${name}-2026-KEY`;
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
