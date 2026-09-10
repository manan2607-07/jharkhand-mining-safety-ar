import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'jharkhand-sih-2026-secret-key-dgms-verified';

/**
 * Mandatory Authentication Middleware
 * Validates JWT Bearer token on protected endpoints
 */
export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Authentication token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Session expired. Please log in again.' });
      }
      return res.status(403).json({ error: 'Invalid or corrupted authentication token' });
    }
    req.user = user;
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

  if (!token) {
    return next();
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (!err && user) {
      req.user = user;
    }
    next();
  });
}

/**
 * Role-Based Access Control Middleware
 * Restricts endpoint to authorized roles
 */
export function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Access forbidden: Required role [${allowedRoles.join(', ')}], current role: [${req.user?.role || 'NONE'}]`
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
        error: `Access denied: You are only authorized for site ${req.user.siteId}`
      });
    }
    if (req.body && req.body.site_id && req.body.site_id !== req.user.siteId) {
      return res.status(403).json({
        error: `Access denied: You can only manage data for site ${req.user.siteId}`
      });
    }
    // Auto-scope queries if siteId was omitted
    if (!req.query.siteId) {
      req.query.siteId = req.user.siteId;
    }
  }
  next();
}
