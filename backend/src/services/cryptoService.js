import crypto from 'crypto';

const CERT_SECRET = process.env.CERT_SECRET || process.env.JWT_SECRET || 'jharkhand-sih-2026-secret-key-dgms-verified';

/**
 * Generate a tamper-evident cryptographic hash for a certificate.
 */
export function generateCertificateHash({ certificateId, workerId, moduleId, siteId, score, issueDate, expiryDate }) {
  const payload = `${certificateId}|${workerId}|${moduleId}|${siteId}|${score}|${issueDate}|${expiryDate}`;
  const hash = crypto.createHmac('sha256', CERT_SECRET).update(payload).digest('hex');
  const signature = `DGMS-SIG-${hash.substring(0, 16).toUpperCase()}`;
  return { hash, signature };
}

/**
 * Verify a certificate hash against expected payload using timing-safe comparison
 */
export function verifyCertificateHash({ certificateId, workerId, moduleId, siteId, score, issueDate, expiryDate, expectedHash }) {
  if (!expectedHash || typeof expectedHash !== 'string') return false;
  const { hash } = generateCertificateHash({ certificateId, workerId, moduleId, siteId, score, issueDate, expiryDate });
  
  const expectedBuf = Buffer.from(expectedHash, 'utf8');
  const calcBuf = Buffer.from(hash, 'utf8');
  if (expectedBuf.length !== calcBuf.length) {
    return false;
  }
  return crypto.timingSafeEqual(calcBuf, expectedBuf);
}

/**
 * Calculate statutory expiry date (Default: 365 days from issue date per Mines Act 1952 / Factories Act 1948)
 */
export function calculateExpiryDate(issueDate = new Date()) {
  const date = new Date(issueDate);
  date.setFullYear(date.getFullYear() + 1);
  return date.toISOString().split('T')[0];
}
