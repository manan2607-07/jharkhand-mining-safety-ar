import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { AshokaLionCapital } from '../../components/Emblem';
import { 
  Scale, 
  QrCode, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Search, 
  Download, 
  FileCheck, 
  ShieldCheck, 
  Clock, 
  Building2,
  Calendar,
  ExternalLink,
  ShieldAlert
} from 'lucide-react';

export default function DGMSPortal({ initialHash = '' }) {
  const { currentUser } = useAuth();
  const [hashInput, setHashInput] = useState(initialHash);
  const [verificationResult, setVerificationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [auditCertificates, setAuditCertificates] = useState([]);
  const [filterSector, setFilterSector] = useState('ALL');

  useEffect(() => {
    fetchAuditCertificates();
    if (initialHash) {
      handleVerify(initialHash);
    }
  }, [initialHash]);

  const fetchAuditCertificates = async () => {
    try {
      const res = await fetch('/api/certificates');
      if (res.ok) {
        const data = await res.json();
        setAuditCertificates(data);
      }
    } catch (err) {
      console.error('Error fetching audit certs:', err);
    }
  };

  const handleVerify = async (hashOrIdToVerify) => {
    let target = (hashOrIdToVerify || hashInput || '').trim();
    if (!target) return;

    // Handle parsed JSON payload if scanned from QR directly
    if (target.startsWith('{')) {
      try {
        const parsed = JSON.parse(target);
        target = parsed.hash || parsed.certId || parsed.certificateId || target;
      } catch (e) {
        // Continue with raw target if not valid JSON
      }
    }

    try {
      setLoading(true);
      const res = await fetch(`/api/certificates/verify/${encodeURIComponent(target)}`);
      const data = await res.json();
      setVerificationResult(data);
    } catch (err) {
      setVerificationResult({
        verified: false,
        error: 'Connection error during DGMS ledger verification.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (!auditCertificates.length) return;
    const headers = ['Certificate ID', 'Worker Name', 'Worker Code', 'Mine Site', 'District', 'Sector', 'Score', 'Issue Date', 'Expiry Date', 'Status', 'QR Hash'];
    const rows = auditCertificates.map(c => [
      c.certificate_id,
      `"${c.worker_name}"`,
      c.worker_code,
      `"${c.site_name}"`,
      c.district,
      c.sector,
      `${c.score}%`,
      c.issue_date,
      c.expiry_date,
      c.compliance_status,
      c.qr_hash
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `DGMS_Mines_Act_Compliance_Audit_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredCerts = auditCertificates.filter((c) => {
    return filterSector === 'ALL' || c.sector === filterSector;
  });

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '1.5rem 1rem' }}>
      {/* DGMS Statutory Inspection Header */}
      <div className="gov-card" style={{
        padding: '1.5rem',
        marginBottom: '1.75rem',
        borderLeft: '5px solid #0c4e7e',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1.25rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <AshokaLionCapital size={38} color="#0c4e7e" showMotto={false} />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.2rem' }}>
              <span className="gov-badge-navy">
                Regulatory Simulation Console
              </span>
              <span style={{ fontSize: '0.82rem', color: '#64748B' }}>
                DGMS Standards Benchmark Console • Dhanbad Regulatory Framework
              </span>
            </div>

            <h2 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#0c4e7e', fontFamily: 'var(--font-heading)', margin: 0 }}>
              Mines Act 1952 Compliance Ledger (DGMS Regulatory Simulation)
            </h2>

            <p style={{ fontSize: '0.86rem', color: '#4A5568', marginTop: '0.25rem' }}>
              Simulated Auditor / Inspector: <strong>{currentUser.name}</strong> • Regulatory Benchmark Ref: DGMS/S&T/Circular-2026/041
            </p>
          </div>
        </div>

        <button
          onClick={handleExportCSV}
          className="gov-btn-primary"
          style={{ padding: '0.65rem 1.25rem', fontSize: '0.88rem' }}
        >
          <Download size={16} />
          <span>Export Statutory Audit Log (CSV)</span>
        </button>
      </div>

      {/* Live QR / Hash Verification Widget */}
      <div className="gov-card" style={{ padding: '1.75rem', marginBottom: '1.75rem' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0c4e7e', fontFamily: 'var(--font-heading)', marginBottom: '0.35rem' }}>
          Live On-Site QR Certificate Verifier & Anti-Forgery Scanner
        </h3>
        <p style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: '1.25rem' }}>
          Scan physical worker card QR code or paste Certificate ID / SHA-256 HMAC hash to verify ledger authenticity in real-time
        </p>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
          <div style={{
            flex: 1,
            minWidth: '320px',
            display: 'flex',
            alignItems: 'center',
            background: '#FFFFFF',
            border: '1px solid #CBD5E1',
            borderRadius: '4px',
            padding: '0.5rem 0.85rem',
            gap: '0.6rem'
          }}>
            <QrCode size={18} color="#0c4e7e" />
            <input
              type="text"
              placeholder="Paste QR Hash (e.g. bb44da...) or Certificate ID (e.g. CERT-JH-2026-10004)..."
              value={hashInput}
              onChange={(e) => setHashInput(e.target.value)}
              className="font-mono"
              style={{
                background: 'transparent',
                border: 'none',
                color: '#1A202C',
                fontSize: '0.88rem',
                outline: 'none',
                width: '100%'
              }}
            />
          </div>

          <button
            onClick={() => handleVerify()}
            disabled={loading || !hashInput}
            className="gov-btn-primary"
            style={{ padding: '0.6rem 1.5rem', opacity: hashInput ? 1 : 0.6 }}
          >
            {loading ? 'Querying DGMS Ledger...' : 'Verify Authenticity →'}
          </button>

          {/* Quick Demo Test Buttons */}
          <button
            onClick={() => {
              const testCert = auditCertificates[0];
              if (testCert) {
                setHashInput(testCert.qr_hash);
                handleVerify(testCert.qr_hash);
              }
            }}
            className="gov-btn-secondary"
            style={{ padding: '0.6rem 0.95rem', fontSize: '0.8rem' }}
          >
            Test Valid Cert
          </button>

          <button
            onClick={() => {
              const fakeHash = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855_TAMPERED';
              setHashInput(fakeHash);
              handleVerify(fakeHash);
            }}
            className="gov-btn-secondary"
            style={{ padding: '0.6rem 0.95rem', fontSize: '0.8rem', borderColor: '#F8B4B4', color: '#9B1C1C' }}
          >
            Test Forgery Check
          </button>
        </div>

        {/* Verification Result Display (Official Stamp Box) */}
        {verificationResult && (
          <div className="gov-stamp-box" style={{
            background: verificationResult.verified ? '#EAF5EC' : '#FDF2F2',
            borderColor: verificationResult.verified ? '#1E7B34' : '#9B1C1C',
            marginTop: '1.25rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem', marginBottom: '1rem' }}>
              {verificationResult.verified ? (
                <CheckCircle2 size={30} color="#1E7B34" style={{ flexShrink: 0, marginTop: '2px' }} />
              ) : (
                <XCircle size={30} color="#9B1C1C" style={{ flexShrink: 0, marginTop: '2px' }} />
              )}

              <div>
                <div style={{
                  fontSize: '1.15rem',
                  fontWeight: '800',
                  color: verificationResult.verified ? '#1E7B34' : '#9B1C1C'
                }}>
                  {verificationResult.verified
                    ? 'VERIFIED AUTHENTIC: STATUTORY DGMS COMPLIANT'
                    : 'RECORD NOT FOUND OR FRAUDULENT FORGERY DETECTED'}
                </div>
                <div style={{ fontSize: '0.84rem', color: '#4A5568', marginTop: '0.2rem' }}>
                  {verificationResult.verified
                    ? 'Cryptographic SHA-256 HMAC digital signature validated against state ledger. Zero data tampering detected.'
                    : verificationResult.error || 'The submitted QR hash does not match records or has been altered.'}
                </div>
              </div>
            </div>

            {verificationResult.certificate && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '1rem',
                background: '#FFFFFF',
                padding: '1rem',
                borderRadius: '4px',
                border: '1px solid #CBD5E1',
                fontSize: '0.85rem'
              }}>
                <div>
                  <span style={{ color: '#64748B', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: '600' }}>Worker Details</span>
                  <div style={{ fontWeight: '700', color: '#0c4e7e' }}>{verificationResult.certificate.worker_name}</div>
                  <div style={{ fontSize: '0.78rem', color: '#4A5568' }} className="font-mono">{verificationResult.certificate.worker_code}</div>
                </div>

                <div>
                  <span style={{ color: '#64748B', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: '600' }}>Mine Facility Site</span>
                  <div style={{ fontWeight: '700', color: '#1A202C' }}>{verificationResult.certificate.site_name}</div>
                  <div style={{ fontSize: '0.78rem', color: '#4A5568' }}>{verificationResult.certificate.district} ({verificationResult.certificate.sector})</div>
                </div>

                <div>
                  <span style={{ color: '#64748B', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: '600' }}>Module Competency</span>
                  <div style={{ fontWeight: '700', color: '#1A202C' }}>{verificationResult.certificate.module_title}</div>
                  <div style={{ fontSize: '0.78rem', color: '#1E7B34', fontWeight: '700' }}>Score: {verificationResult.certificate.score}% (PASSED)</div>
                </div>

                <div>
                  <span style={{ color: '#64748B', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: '600' }}>Statutory Validity Window</span>
                  <div style={{ fontWeight: '700', color: '#8B6508' }}>
                    Expires: {verificationResult.certificate.expiry_date}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: verificationResult.daysRemaining < 30 ? '#9B1C1C' : '#1E7B34', fontWeight: '600' }}>
                    {verificationResult.daysRemaining} day(s) until mandatory refresher
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Statutory Audit Ledger Table (Mines Act 1952 Format) */}
      <div className="gov-card" style={{ padding: '1.5rem' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.25rem',
          paddingBottom: '0.75rem',
          borderBottom: '2px solid #E2E8F0'
        }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0c4e7e', fontFamily: 'var(--font-heading)' }}>
              Mines Act, 1952 Statutory Audit Register
            </h3>
            <p style={{ fontSize: '0.84rem', color: '#64748B' }}>
              Mandatory digital registry of all issued competency certificates with cryptographic hashes
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.82rem', color: '#4A5568', fontWeight: '600' }}>Filter by Sector:</span>
            <select
              value={filterSector}
              onChange={(e) => setFilterSector(e.target.value)}
              className="gov-select"
              style={{ width: 'auto', padding: '0.4rem 0.75rem', fontSize: '0.84rem' }}
            >
              <option value="ALL">All Industrial Sectors</option>
              <option value="COAL">Coal Mining (BCCL / CCL)</option>
              <option value="STEEL">Steel Processing (SAIL / Tata)</option>
              <option value="MICA">Mica Beneficiation (Koderma / Giridih)</option>
            </select>
          </div>
        </div>

        <div className="gov-table-container">
          <table className="gov-table">
            <thead>
              <tr>
                <th>Certificate ID</th>
                <th>Worker Code</th>
                <th>Worker Name</th>
                <th>Mine / Plant Site</th>
                <th>District</th>
                <th>Score</th>
                <th>Issue Date</th>
                <th>Expiry Date</th>
                <th>Statutory Status</th>
                <th>Verify</th>
              </tr>
            </thead>
            <tbody>
              {filteredCerts.map((cert) => (
                <tr key={cert.certificate_id}>
                  <td className="font-mono" style={{ fontWeight: '700', color: '#0c4e7e' }}>
                    {cert.certificate_id}
                  </td>
                  <td className="font-mono" style={{ color: '#4A5568' }}>
                    {cert.worker_code}
                  </td>
                  <td style={{ fontWeight: '700', color: '#1A202C' }}>
                    {cert.worker_name}
                  </td>
                  <td style={{ color: '#4A5568' }}>
                    {cert.site_name}
                  </td>
                  <td style={{ color: '#4A5568' }}>
                    {cert.district}
                  </td>
                  <td style={{ fontWeight: '700', color: '#1E7B34' }}>
                    {cert.score}%
                  </td>
                  <td style={{ color: '#64748B' }}>
                    {cert.issue_date}
                  </td>
                  <td style={{ color: '#64748B' }}>
                    {cert.expiry_date}
                  </td>
                  <td>
                    <span className={cert.compliance_status === 'VALID' ? 'gov-badge-green' : cert.compliance_status === 'EXPIRING_SOON' ? 'gov-badge-amber' : 'gov-badge-red'}>
                      {cert.compliance_status}
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={() => {
                        setHashInput(cert.qr_hash);
                        handleVerify(cert.qr_hash);
                        window.scrollTo({ top: 120, behavior: 'smooth' });
                      }}
                      className="gov-btn-secondary"
                      style={{ padding: '0.25rem 0.55rem', fontSize: '0.74rem' }}
                    >
                      Audit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
