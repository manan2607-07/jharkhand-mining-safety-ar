/**
 * Audit Logging Service
 * Jharkhand AR Mining Safety Platform
 *
 * Provides structured, immutable audit trail for government compliance.
 * Audit logs record WHO did WHAT to WHICH resource and WHEN.
 *
 * NEVER log: passwords, PINs, tokens, private keys, full PII
 */
import db from '../db/database.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Supported audit event types
 */
export const AuditEventType = {
  // Authentication events
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILED: 'LOGIN_FAILED',
  LOGOUT: 'LOGOUT',
  TOKEN_REVOKED: 'TOKEN_REVOKED',
  SESSION_EXPIRED: 'SESSION_EXPIRED',

  // Worker events
  WORKER_ENROLLED: 'WORKER_ENROLLED',
  WORKER_PROFILE_VIEWED: 'WORKER_PROFILE_VIEWED',

  // Certificate events
  CERT_ISSUED: 'CERT_ISSUED',
  CERT_VERIFICATION: 'CERT_VERIFICATION',

  // Data access events
  DATA_EXPORT: 'DATA_EXPORT',
  ANALYTICS_ACCESSED: 'ANALYTICS_ACCESSED',

  // Sync events
  SYNC_COMPLETED: 'SYNC_COMPLETED',
  SYNC_CERT_REJECTED: 'SYNC_CERT_REJECTED',

  // Cohort events
  COHORT_CREATED: 'COHORT_CREATED',

  // Security events
  RATE_LIMIT_HIT: 'RATE_LIMIT_HIT',
  UNAUTHORIZED_ACCESS: 'UNAUTHORIZED_ACCESS',
  IDOR_ATTEMPT: 'IDOR_ATTEMPT',
};

/**
 * Log an audit event to the database.
 *
 * @param {Object} event
 * @param {string} event.type - One of AuditEventType values
 * @param {string|null} event.actorId - User/worker ID performing the action
 * @param {string|null} event.actorRole - Role of the actor
 * @param {string|null} event.resource - Resource being acted upon (e.g., 'worker:WRK-1000')
 * @param {string} event.action - Human-readable description
 * @param {string} event.result - 'SUCCESS', 'FAILURE', 'DENIED', 'ERROR'
 * @param {string|null} event.ipAddress - Client IP address
 * @param {Object|null} event.metadata - Additional non-sensitive context
 */
export function logAuditEvent({
  type,
  actorId = null,
  actorRole = null,
  resource = null,
  action = '',
  result = 'SUCCESS',
  ipAddress = null,
  metadata = null
}) {
  try {
    const id = `AUDIT-${uuidv4()}`;
    const stmt = db.prepare(`
      INSERT INTO audit_events (id, event_type, actor_id, actor_role, resource, action, result, ip_address, metadata, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `);

    stmt.run(
      id,
      type,
      actorId,
      actorRole,
      resource,
      action.slice(0, 500),  // Prevent oversized log entries
      result,
      ipAddress,
      metadata ? JSON.stringify(metadata) : null
    );
  } catch (err) {
    // Audit logging should never crash the application
    console.error('[AUDIT ERROR] Failed to write audit event:', err.message);
  }
}

/**
 * Extract client IP from request, respecting reverse proxy headers
 */
export function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return req.ip || req.socket?.remoteAddress || 'unknown';
}

export default { logAuditEvent, getClientIp, AuditEventType };
