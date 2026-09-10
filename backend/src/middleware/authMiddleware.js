import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import config from '../config.js';
import db from '../db/database.js';

/**
 * Mandatory Authentication Middleware
 * Validates JWT Bearer token on protected endpoints.
 * Checks token blacklist for revoked sessions.
 */
export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  // Reject offline/fake tokens immediately
  if (token.startsWith('offline-')) {
    return res.status(401).json({ error: 'Invalid authentication token' });
  }

  jwt.verify(token, config.jwtSecret, { algorithms: ['HS256'] }, (err, user) => {
    if (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Session expired. Please log in again.' });
      }
      return res.status(401).json({ error: 'Invalid authentication token' });
    }

    // Check token blacklist (revoked sessions)
    try {
      const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
      const blacklisted = db.prepare(
        'SELECT 1 FROM token_blacklist WHERE token_hash = ? AND expires_at > datetime(\'now\')'
      ).get(tokenHash);

      if (blacklisted) {
        return res.status(401).json({ error: 'Session has been revoked. Please log in again.' });
      }
    } catch {
      // If blacklist check fails (e.g., table not yet created), continue
    }

    // Check if user account is still active
    try {
      const userRow = db.prepare('SELECT is_active FROM users WHERE id = ?').get(user.id);
      if (userRow && userRow.is_active === 0) {
        return res.status(403).json({ error: 'Account has been deactivated' });
      }
    } catch {
      // Non-user accounts (workers via worker-login) won't be in users table
    }

    req.user = user;
    req.token = token; // Store for potential blacklisting on logout
    next();
  });
}

/**
 * Optional Authentication Middleware
 * Populates req.user if a valid token is provided, otherwise continues
 */
export function optionalAuthenticate(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token || token.startsWith('offline-')) {
    return next();
  }

  jwt.verify(token, config.jwtSecret, { algorithms: ['HS256'] }, (err, user) => {
    if (!err && user) {
      req.user = user;
      req.token = token;
    }
    next();
  });
}

/**
 * Role-Based Access Control Middleware
 * Restricts endpoint to authorized roles.
 * Error response does NOT leak which roles are required.
 */
export function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Access denied: Insufficient permissions for this operation'
      });
    }
    next();
  };
}

/**
 * Site Isolation Middleware for Safety Officers
 * Prevents Safety Officers from viewing or modifying workers across external mine sites
 */
export function enforceSiteIsolation(req, res, next) {
  if (req.user && req.user.role === 'SAFETY_OFFICER' && req.user.siteId) {
    // If request contains siteId parameter, verify it matches the officer's site
    if (req.query.siteId && req.query.siteId !== req.user.siteId) {
      return res.status(403).json({
        error: 'Access denied: You are not authorized for this site'
      });
    }
    if (req.body && req.body.site_id && req.body.site_id !== req.user.siteId) {
      return res.status(403).json({
        error: 'Access denied: You are not authorized for this site'
      });
    }
    // Auto-scope queries if siteId was omitted
    if (!req.query.siteId) {
      req.query.siteId = req.user.siteId;
    }
  }
  next();
}

/**
 * Blacklist a JWT token (for logout / revocation)
 */
export function blacklistToken(token, userId, reason = 'LOGOUT') {
  try {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    // Decode without verify to get expiry for cleanup scheduling
    const decoded = jwt.decode(token);
    const expiresAt = decoded?.exp
      ? new Date(decoded.exp * 1000).toISOString()
      : new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // fallback 24h

    db.prepare(`
      INSERT OR IGNORE INTO token_blacklist (token_hash, user_id, reason, expires_at)
      VALUES (?, ?, ?, ?)
    `).run(tokenHash, userId, reason, expiresAt);
  } catch (err) {
    console.error('[TOKEN BLACKLIST] Failed to blacklist token:', err.message);
  }
}
