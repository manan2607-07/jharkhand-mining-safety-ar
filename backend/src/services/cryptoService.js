import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'jharkhand-sih-2026-secret-key-dgms-verified';

/**
 * Generate a tamper-evident cryptographic hash for a certificate.
 */
export function generateCertificateHash({ certificateId, workerId, moduleId, siteId, score, issueDate, expiryDate }) {
  const payload = `${certificateId}|${workerId}|${moduleId}|${siteId}|${score}|${issueDate}|${expiryDate}`;
  const hash = crypto.createHmac('sha256', JWT_SECRET).update(payload).digest('hex');
  const signature = `DGMS-SIG-${hash.substring(0, 16).toUpperCase()}`;
  return { hash, signature };
}

/**
 * Verify a certificate hash against expected payload
 */
export function verifyCertificateHash({ certificateId, workerId, moduleId, siteId, score, issueDate, expiryDate, expectedHash }) {
  const { hash } = generateCertificateHash({ certificateId, workerId, moduleId, siteId, score, issueDate, expiryDate });
  return hash === expectedHash;
}

/**
 * Calculate statutory expiry date (Default: 365 days from issue date per Mines Act 1952 / Factories Act 1948)
 */
export function calculateExpiryDate(issueDate = new Date()) {
  const date = new Date(issueDate);
  date.setFullYear(date.getFullYear() + 1);
  return date.toISOString().split('T')[0];
}
