import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { apiFetch } from '../../services/api';
import { AshokaLionCapital } from '../../components/Emblem';
import DigitalCertificate from '../worker/DigitalCertificate';
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
  ShieldAlert,
  Printer
} from 'lucide-react';

export default function DGMSPortal({ initialHash = '' }) {
  const { currentUser } = useAuth();
  const { t, getLocalizedModuleTitle } = useLanguage();
  const [hashInput, setHashInput] = useState(initialHash);
  const [verificationResult, setVerificationResult] = useState(null);
  const [viewingCertificate, setViewingCertificate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [auditCertificates, setAuditCertificates] = useState([]);
  const [filterSector, setFilterSector] = useState('ALL');

  useEffect(() => {
    fetchAuditCertificates();
    if (initialHash) {
      handleVerify(initialHash);
    }

    const handleUpdate = () => {
      fetchAuditCertificates();
    };

    window.addEventListener('jh-safety-drill-completed', handleUpdate);
    window.addEventListener('focus', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    document.addEventListener('visibilitychange', handleUpdate);
    return () => {
      window.removeEventListener('jh-safety-drill-completed', handleUpdate);
      window.removeEventListener('focus', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
      document.removeEventListener('visibilitychange', handleUpdate);
    };
  }, [initialHash]);

  const fetchAuditCertificates = async () => {
    try {
      const res = await apiFetch('/api/certificates');
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
      const res = await apiFetch(`/api/certificates/verify/${encodeURIComponent(target)}`);
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
                {t.dgmsConsoleBadge}
              </span>
              <span style={{ fontSize: '0.82rem', color: '#64748B' }}>
                {t.dgmsBenchmarkSub}
              </span>
            </div>

            <h2 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#0c4e7e', fontFamily: 'var(--font-heading)', margin: 0 }}>
              {t.dgmsLedgerTitle}
            </h2>

            <p style={{ fontSize: '0.86rem', color: '#4A5568', marginTop: '0.25rem' }}>
              {t.dgmsAuditorLabel}: <strong>{currentUser.name}</strong> • {t.dgmsBenchmarkRef}
            </p>
          </div>
        </div>

        <button
          onClick={handleExportCSV}
          className="gov-btn-primary"
          style={{ padding: '0.65rem 1.25rem', fontSize: '0.88rem' }}
        >
          <Download size={16} />
          <span>{t.dgmsExportCsv}</span>
        </button>
      </div>

      {/* Live QR / Hash Verification Widget */}
      <div className="gov-card" style={{ padding: '1.75rem', marginBottom: '1.75rem' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0c4e7e', fontFamily: 'var(--font-heading)', marginBottom: '0.35rem' }}>
          {t.dgmsScannerTitle}
        </h3>
        <p style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: '1.25rem' }}>
          {t.dgmsScannerDesc}
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
              placeholder={t.dgmsInputPlaceholder}
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
            {loading ? t.dgmsVerifying : t.dgmsVerifyBtn}
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
            {t.dgmsTestValid}
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
            {t.dgmsTestForgery}
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
                    ? t.dgmsVerifiedAuthentic
                    : t.dgmsFraudDetected}
                </div>
                <div style={{ fontSize: '0.84rem', color: '#4A5568', marginTop: '0.2rem' }}>
                  {verificationResult.verified
                    ? t.dgmsVerifiedDetail
                    : verificationResult.error || t.dgmsFraudDetail}
                </div>
              </div>
            </div>

            {verificationResult.certificate && (
              <>
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
                    <span style={{ color: '#64748B', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: '600' }}>{t.dgmsWorkerDetails}</span>
                    <div style={{ fontWeight: '700', color: '#0c4e7e' }}>{verificationResult.certificate.worker_name}</div>
                    <div style={{ fontSize: '0.78rem', color: '#4A5568' }} className="font-mono">{verificationResult.certificate.worker_code}</div>
                  </div>

                  <div>
                    <span style={{ color: '#64748B', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: '600' }}>{t.dgmsMineFacility}</span>
                    <div style={{ fontWeight: '700', color: '#1A202C' }}>{verificationResult.certificate.site_name}</div>
                    <div style={{ fontSize: '0.78rem', color: '#4A5568' }}>{verificationResult.certificate.district} ({verificationResult.certificate.sector})</div>
                  </div>

                  <div>
                    <span style={{ color: '#64748B', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: '600' }}>{t.dgmsModuleCompetency}</span>
                    <div style={{ fontWeight: '700', color: '#1A202C' }}>{getLocalizedModuleTitle(verificationResult.certificate.module_title)}</div>
                    <div style={{ fontSize: '0.78rem', color: '#1E7B34', fontWeight: '700' }}>{(t.dgmsPassedTag || 'Score: {score}% (PASSED)').replace('{score}', verificationResult.certificate.score)}</div>
                  </div>

                  <div>
                    <span style={{ color: '#64748B', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: '600' }}>{t.dgmsValidityWindow}</span>
                    <div style={{ fontWeight: '700', color: '#8B6508' }}>
                      {t.dgmsExpiresLabel}: {verificationResult.certificate.expiry_date}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: verificationResult.daysRemaining < 30 ? '#9B1C1C' : '#1E7B34', fontWeight: '600' }}>
                      {verificationResult.daysRemaining} {t.dgmsRefresherDays}
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: '0.85rem', display: 'flex', gap: '0.75rem' }}>
                  <button
                    type="button"
                    onClick={() => setViewingCertificate({
                      certificateId: verificationResult.certificate.certificate_id,
                      workerName: verificationResult.certificate.worker_name,
                      workerCode: verificationResult.certificate.worker_code,
                      siteName: verificationResult.certificate.site_name,
                      district: verificationResult.certificate.district,
                      sector: verificationResult.certificate.sector,
                      moduleTitle: verificationResult.certificate.module_title,
                      score: verificationResult.certificate.score,
                      issueDate: verificationResult.certificate.issue_date,
                      expiryDate: verificationResult.certificate.expiry_date,
                      qrHash: verificationResult.certificate.qr_hash,
                      signature: verificationResult.certificate.signature
                    })}
                    className="gov-btn-primary"
                    style={{
                      padding: '0.55rem 1.15rem',
                      fontSize: '0.85rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      background: '#2EE59D',
                      color: '#073556',
                      fontWeight: '800',
                      border: 'none',
                      cursor: 'pointer',
                      borderRadius: '4px',
                      boxShadow: '0 2px 8px rgba(46, 229, 157, 0.4)'
                    }}
                  >
                    <Printer size={16} />
                    <span>{t.dgmsViewPrintCert}</span>
                  </button>
                </div>
              </>
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
              {t.dgmsAuditRegisterTitle}
            </h3>
            <p style={{ fontSize: '0.84rem', color: '#64748B' }}>
              {t.dgmsAuditRegisterDesc}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.82rem', color: '#4A5568', fontWeight: '600' }}>{t.dgmsFilterSector}</span>
            <select
              value={filterSector}
              onChange={(e) => setFilterSector(e.target.value)}
              className="gov-select"
              style={{ width: 'auto', padding: '0.4rem 0.75rem', fontSize: '0.84rem' }}
            >
              <option value="ALL">{t.dgmsSectorAll}</option>
              <option value="COAL">{t.dgmsSectorCoal}</option>
              <option value="STEEL">{t.dgmsSectorSteel}</option>
              <option value="MICA">{t.dgmsSectorMica}</option>
            </select>
          </div>
        </div>

        <div className="gov-table-container">
          <table className="gov-table">
            <thead>
              <tr>
                <th>{t.dgmsThCertId}</th>
                <th>{t.dgmsThWorkerCode}</th>
                <th>{t.dgmsThWorkerName}</th>
                <th>{t.dgmsThMineSite}</th>
                <th>{t.dgmsThDistrict}</th>
                <th>{t.dgmsThScore}</th>
                <th>{t.dgmsThIssueDate}</th>
                <th>{t.dgmsThExpiryDate}</th>
                <th>{t.dgmsThStatus}</th>
                <th>{t.dgmsThVerify}</th>
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
                      {cert.compliance_status === 'VALID' ? (t.complianceStatusValid || 'VALID') : cert.compliance_status === 'EXPIRING_SOON' ? (t.complianceStatusExpiring || 'EXPIRING SOON') : (t.complianceStatusRevoked || 'REVOKED')}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.35rem' }}>
                      <button
                        onClick={() => {
                          setHashInput(cert.qr_hash);
                          handleVerify(cert.qr_hash);
                          window.scrollTo({ top: 120, behavior: 'smooth' });
                        }}
                        className="gov-btn-secondary"
                        style={{ padding: '0.25rem 0.55rem', fontSize: '0.74rem' }}
                      >
                        {t.dgmsBtnAudit}
                      </button>
                      <button
                        type="button"
                        onClick={() => setViewingCertificate({
                          certificateId: cert.certificate_id,
                          workerName: cert.worker_name,
                          workerCode: cert.worker_code,
                          siteName: cert.site_name,
                          district: cert.district,
                          sector: cert.sector,
                          moduleTitle: getLocalizedModuleTitle(cert.module_title),
                          score: cert.score,
                          issueDate: cert.issue_date,
                          expiryDate: cert.expiry_date,
                          qrHash: cert.qr_hash,
                          signature: cert.signature
                        })}
                        title="Print Certificate"
                        style={{
                          padding: '0.25rem 0.55rem',
                          fontSize: '0.74rem',
                          background: '#EBF3FC',
                          color: '#0c4e7e',
                          border: '1px solid #B4D3F7',
                          borderRadius: '3px',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          fontWeight: '700'
                        }}
                      >
                        <Printer size={12} />
                        <span>{t.dgmsBtnPrint}</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Inspector Certificate Preview for Direct A4 Color Printing */}
      {viewingCertificate && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(7, 53, 86, 0.88)',
          backdropFilter: 'blur(4px)',
          zIndex: 9999,
          overflowY: 'auto',
          padding: '1.5rem 1rem'
        }}>
          <div style={{ maxWidth: '960px', margin: '0 auto' }}>
            <div className="no-print" style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.65rem' }}>
              <button
                type="button"
                onClick={() => setViewingCertificate(null)}
                style={{
                  background: '#FFFFFF',
                  color: '#073556',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '0.45rem 1.1rem',
                  fontWeight: '800',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                }}
              >
                {t.dgmsClosePreview}
              </button>
            </div>
            <DigitalCertificate
              certificate={viewingCertificate}
              onDone={() => setViewingCertificate(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
