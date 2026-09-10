import { rateLimit } from 'express-rate-limit';

/**
 * Rate Limiter for Authentication Endpoints (Brute-force protection)
 * Max 30 attempts per 15 minutes per IP.
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false },
  message: {
    error: 'Too many login attempts from this network. Please wait 15 minutes before trying again.'
  }
});

/**
 * General API Rate Limiter
 * Max 600 requests per 15 minutes per IP.
 */
export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 600,
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false },
  message: {
    error: 'API rate limit exceeded. Please reduce request frequency.'
  }
});

/**
 * Rate Limiter for Sensitive State Operations (Certificate Issuance, Sync)
 * Max 120 requests per 15 minutes per IP.
 */
export const sensitiveOpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false },
  message: {
    error: 'Too many sensitive transactions processed. Please wait before retrying.'
  }
});

/**
 * Public Verification Limiter (For QR / badge verification)
 * Max 200 requests per 15 minutes per IP.
 */
export const publicVerifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false },
  message: {
    error: 'Verification query limit reached. Please wait a few minutes before scanning again.'
  }
});

/**
 * Sanitize string input to prevent control character injection and limit max length
 */
export function sanitizeText(input, maxLength = 255) {
  if (typeof input !== 'string') return '';
  // Strip control characters, normalize whitespace, and slice
  return input
    .replace(/[\x00-\x1F\x7F]/g, '')
    .trim()
    .slice(0, maxLength);
}

/**
 * Centralized Error Handling Middleware
 * Prevents internal SQLite / stack trace leakage in production
 */
export function errorHandler(err, req, res, next) {
  const isProd = process.env.NODE_ENV === 'production';
  const isCorsError = err.message?.includes('CORS');
  const statusCode = err.status || err.statusCode || (isCorsError ? 403 : 500);

  console.error(`[SECURITY ERROR] ${req.method} ${req.url} - Code: ${statusCode}:`, err);

  // Return descriptive message for client/validation/CORS errors; obfuscate only internal 500s
  const message = statusCode < 500 
    ? (err.message || 'Request Error')
    : (isProd ? 'An unexpected server error occurred. Please contact the DGMS / Mining Support Desk.' : (err.message || 'Internal Server Error'));

  res.status(statusCode).json({ error: message });
}
