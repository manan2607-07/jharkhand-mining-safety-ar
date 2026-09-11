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
  Printer,
  KeyRound,
  Lock,
  Unlock,
  RefreshCw,
  Copy,
  Check
} from 'lucide-react';

const DEFAULT_AUTHORIZATIONS = [
  {
    module_id: 'MOD-001',
    module_title: 'Fire & Explosion Response',
    pass_score_threshold: 80,
    est_minutes: 12,
    is_mvp: 1,
    phase: 1,
    is_enabled: 1,
    access_code: '184920',
    code_length: 6,
    authorized_by_name: 'Dr. A.K. Sengupta (Chief Inspector)'
  },
  {
    module_id: 'MOD-002',
    module_title: 'Gas Leak & Confined Space Protocol',
    pass_score_threshold: 75,
    est_minutes: 15,
    is_mvp: 1,
    phase: 1,
    is_enabled: 1,
    access_code: '294715',
    code_length: 6,
    authorized_by_name: 'Dr. A.K. Sengupta (Chief Inspector)'
  },
  {
    module_id: 'MOD-003',
    module_title: 'Machinery & Moving-Part Safety',
    pass_score_threshold: 80,
    est_minutes: 10,
    is_mvp: 0,
    phase: 2,
    is_enabled: 0,
    access_code: '849201',
    code_length: 6,
    authorized_by_name: 'Dr. A.K. Sengupta (Chief Inspector)'
  },
  {
    module_id: 'MOD-004',
    module_title: 'Electrical & Blasting Clearance',
    pass_score_threshold: 85,
    est_minutes: 14,
    is_mvp: 0,
    phase: 2,
    is_enabled: 0,
    access_code: '632194',
    code_length: 6,
    authorized_by_name: 'Dr. A.K. Sengupta (Chief Inspector)'
  },
  {
    module_id: 'MOD-005',
    module_title: 'PPE Compliance & Induction',
    pass_score_threshold: 90,
    est_minutes: 8,
    is_mvp: 0,
    phase: 2,
    is_enabled: 0,
    access_code: '518742',
    code_length: 6,
    authorized_by_name: 'Dr. A.K. Sengupta (Chief Inspector)'
  }
];

export default function DGMSPortal({ initialHash = '' }) {
  const { currentUser } = useAuth();
  const { t, getLocalizedModuleTitle } = useLanguage();
  const [hashInput, setHashInput] = useState(initialHash);
  const [verificationResult, setVerificationResult] = useState(null);
  const [viewingCertificate, setViewingCertificate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [auditCertificates, setAuditCertificates] = useState([]);
  const [filterSector, setFilterSector] = useState('ALL');
  
  // DGMS Statutory Test Authorization & Access Codes state (with instant default fallback)
  const [testAuthorizations, setTestAuthorizations] = useState(() => {
    try {
      const cached = localStorage.getItem('jh_dgms_cached_authorizations');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return DEFAULT_AUTHORIZATIONS;
  });
  const [authLoading, setAuthLoading] = useState(false);
  const [codeLengths, setCodeLengths] = useState({});
  const [copiedModuleId, setCopiedModuleId] = useState(null);
  const [actionInProgress, setActionInProgress] = useState(null);

  useEffect(() => {
    fetchAuditCertificates();
    fetchTestAuthorizations();
    if (initialHash) {
      handleVerify(initialHash);
    }

    const handleUpdate = () => {
      fetchAuditCertificates();
      fetchTestAuthorizations();
    };

    window.addEventListener('jh-safety-drill-completed', handleUpdate);
    window.addEventListener('jh-dgms-authorization-changed', handleUpdate);
    window.addEventListener('focus', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    document.addEventListener('visibilitychange', handleUpdate);
    return () => {
      window.removeEventListener('jh-safety-drill-completed', handleUpdate);
      window.removeEventListener('jh-dgms-authorization-changed', handleUpdate);
      window.removeEventListener('focus', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
      document.removeEventListener('visibilitychange', handleUpdate);
    };
  }, [initialHash]);

  const fetchTestAuthorizations = async () => {
    try {
      setAuthLoading(true);
      const res = await apiFetch('/api/dgms/authorizations');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setTestAuthorizations(data);
          try {
            localStorage.setItem('jh_dgms_cached_authorizations', JSON.stringify(data));
          } catch (e) {}
        }
      }
    } catch (err) {
      console.warn('Error fetching DGMS test authorizations, using active state:', err);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleToggleTest = async (moduleId, currentStatus) => {
    const nextStatus = currentStatus ? 0 : 1;
    // Optimistic UI update immediately
    setTestAuthorizations(prev => {
      const updated = prev.map(item =>
        item.module_id === moduleId ? { ...item, is_enabled: nextStatus, updated_at: new Date().toISOString() } : item
      );
      try {
        localStorage.setItem('jh_dgms_cached_authorizations', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
    window.dispatchEvent(new CustomEvent('jh-dgms-authorization-changed'));

    try {
      setActionInProgress(`toggle-${moduleId}`);
      const res = await apiFetch('/api/dgms/toggle-test', {
        method: 'POST',
        body: JSON.stringify({ moduleId, isEnabled: !currentStatus })
      });
      if (res.ok) {
        const result = await res.json();
        if (result.authorization) {
          setTestAuthorizations(prev => {
            const synced = prev.map(item => 
              item.module_id === moduleId ? { ...item, ...result.authorization } : item
            );
            try {
              localStorage.setItem('jh_dgms_cached_authorizations', JSON.stringify(synced));
            } catch (e) {}
            return synced;
          });
        }
      }
    } catch (err) {
      console.warn('Failed to sync toggle with server, local state preserved:', err);
    } finally {
      setActionInProgress(null);
    }
  };

  const handleGenerateCode = async (moduleId, requestedLength) => {
    const len = Number(requestedLength) === 4 ? 4 : 6;
    const min = Math.pow(10, len - 1);
    const max = Math.pow(10, len) - 1;
    const optimisticCode = Math.floor(min + Math.random() * (max - min + 1)).toString();

    // Optimistic UI update immediately
    setTestAuthorizations(prev => {
      const updated = prev.map(item =>
        item.module_id === moduleId ? { ...item, access_code: optimisticCode, code_length: len, updated_at: new Date().toISOString() } : item
      );
      try {
        localStorage.setItem('jh_dgms_cached_authorizations', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
    window.dispatchEvent(new CustomEvent('jh-dgms-authorization-changed'));

    try {
      setActionInProgress(`code-${moduleId}`);
      const res = await apiFetch('/api/dgms/generate-code', {
        method: 'POST',
        body: JSON.stringify({ moduleId, codeLength: len })
      });
      if (res.ok) {
        const result = await res.json();
        if (result.authorization) {
          setTestAuthorizations(prev => {
            const synced = prev.map(item => 
              item.module_id === moduleId ? { ...item, ...result.authorization } : item
            );
            try {
              localStorage.setItem('jh_dgms_cached_authorizations', JSON.stringify(synced));
            } catch (e) {}
            return synced;
          });
        }
      }
    } catch (err) {
      console.warn('Failed to sync generated code with server, local code preserved:', err);
    } finally {
      setActionInProgress(null);
    }
  };

  const handleCopyCode = (code, moduleId) => {
    if (!code) return;
    try {
      navigator.clipboard.writeText(code);
      setCopiedModuleId(moduleId);
      setTimeout(() => setCopiedModuleId(null), 2500);
    } catch (e) {
      console.warn('Failed to copy to clipboard', e);
    }
  };

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

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* Statutory Test Authorization & Access Code Control Panel        */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <div className="gov-card" style={{ padding: '1.75rem', marginBottom: '1.75rem', borderTop: '4px solid #16A34A' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
              <span className="gov-badge-green" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                <ShieldCheck size={14} />
                <span>DGMS Regulation 181 Clearance</span>
              </span>
              <span style={{ fontSize: '0.8rem', color: '#64748B' }}>
                On-Site Vocational Drill Permissions
              </span>
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0c4e7e', fontFamily: 'var(--font-heading)', margin: 0 }}>
              {t.dgmsAuthSectionTitle || 'DGMS Statutory Test Authorization & Access Code Control'}
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#4A5568', marginTop: '0.35rem', maxWidth: '850px' }}>
              {t.dgmsAuthSectionDesc || 'Authorize vocational safety examinations on-site. Enable tests individually and issue 4 or 6-digit statutory drill pass codes for frontline workers.'}
            </p>
          </div>

          <button
            onClick={fetchTestAuthorizations}
            disabled={authLoading}
            className="gov-btn-secondary"
            style={{ padding: '0.5rem 1rem', fontSize: '0.82rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <RefreshCw size={14} className={authLoading ? 'animate-spin' : ''} />
            <span>{authLoading ? 'Syncing...' : 'Refresh Status'}</span>
          </button>
        </div>

        {/* Active Test Live Broadcast Banner (when any special test is enabled) */}
        {testAuthorizations.some(a => a.is_enabled === 1 && !a.is_mvp) && (
          <div style={{
            background: 'linear-gradient(135deg, #073556 0%, #0c4e7e 100%)',
            borderRadius: '6px',
            padding: '1rem 1.25rem',
            marginBottom: '1.5rem',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            boxShadow: '0 4px 12px rgba(12, 78, 126, 0.2)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(46, 229, 157, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2EE59D' }}>
                <KeyRound size={22} />
              </div>
              <div>
                <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#93C5FD', fontWeight: '700' }}>
                  Live Examination Session In Progress
                </div>
                <div style={{ fontSize: '0.95rem', fontWeight: '700', color: '#FFFFFF' }}>
                  Provide these statutory pass codes to workers for entry:
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              {testAuthorizations.filter(a => a.is_enabled === 1).map(a => (
                <div key={a.module_id} style={{
                  background: 'rgba(255, 255, 255, 0.12)',
                  border: '1px solid rgba(255, 255, 255, 0.25)',
                  borderRadius: '4px',
                  padding: '0.45rem 0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.65rem'
                }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#BAE6FD' }}>{a.module_id}:</span>
                  <span className="font-mono" style={{ fontSize: '1.15rem', fontWeight: '900', letterSpacing: '0.12em', color: '#FCD34D' }}>
                    {a.access_code}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopyCode(a.access_code, a.module_id)}
                    title="Copy code"
                    style={{ background: 'transparent', border: 'none', color: '#BAE6FD', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                  >
                    {copiedModuleId === a.module_id ? <Check size={14} color="#34D399" /> : <Copy size={14} />}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Detailed Authorizations Table */}
        <div className="gov-table-container">
          <table className="gov-table">
            <thead>
              <tr>
                <th style={{ minWidth: '220px' }}>{t.dgmsColModule || 'Module / Examination'}</th>
                <th style={{ minWidth: '150px' }}>{t.dgmsColStatus || 'DGMS Clearance Status'}</th>
                <th style={{ minWidth: '140px' }}>{t.dgmsColToggle || 'Test Permission'}</th>
                <th style={{ minWidth: '220px' }}>{t.dgmsColAccessCode || 'Statutory Access Code'}</th>
                <th style={{ minWidth: '200px' }}>{t.dgmsColActions || 'Code Controls'}</th>
                <th style={{ minWidth: '180px' }}>{t.dgmsColAuthorizedBy || 'Authorized Inspector'}</th>
              </tr>
            </thead>
            <tbody>
              {testAuthorizations.map((auth) => {
                const isSpecialTest = !auth.is_mvp;
                const isEnabled = auth.is_enabled === 1;
                const isToggling = actionInProgress === `toggle-${auth.module_id}`;
                const isGenerating = actionInProgress === `code-${auth.module_id}`;
                const currentLen = codeLengths[auth.module_id] || auth.code_length || 6;

                return (
                  <tr key={auth.module_id} style={{ background: isEnabled ? '#F8FCF9' : '#FFFFFF' }}>
                    {/* Module Title */}
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                        <span className="font-mono" style={{ fontSize: '0.75rem', fontWeight: '800', color: '#0c4e7e', background: '#E0F2FE', padding: '0.15rem 0.4rem', borderRadius: '3px' }}>
                          {auth.module_id}
                        </span>
                        {isSpecialTest && (
                          <span style={{ fontSize: '0.7rem', color: '#9B1C1C', background: '#FDE8E8', padding: '0.1rem 0.35rem', borderRadius: '3px', fontWeight: '700' }}>
                            DGMS Spec
                          </span>
                        )}
                      </div>
                      <div style={{ fontWeight: '700', color: '#1E293B', fontSize: '0.9rem' }}>
                        {auth.module_title}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#64748B' }}>
                        Threshold: {auth.pass_score_threshold}% • Est: {auth.est_minutes} mins
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td>
                      {isEnabled ? (
                        <span className="gov-badge-green" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#16A34A', display: 'inline-block', boxShadow: '0 0 0 2px rgba(22, 163, 74, 0.3)' }} />
                          <strong>{t.dgmsTestEnabledBadge || 'DRILL ACTIVE'}</strong>
                        </span>
                      ) : (
                        <span className="gov-badge-grey" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                          <Lock size={12} color="#6B7280" />
                          <span>{t.dgmsTestDisabledBadge || 'UNDER DGMS SPEC'}</span>
                        </span>
                      )}
                    </td>

                    {/* Permission Toggle (One by One) */}
                    <td>
                      <button
                        onClick={() => handleToggleTest(auth.module_id, isEnabled)}
                        disabled={isToggling}
                        className={isEnabled ? 'gov-btn-secondary' : 'gov-btn-primary'}
                        style={{
                          padding: '0.45rem 0.85rem',
                          fontSize: '0.8rem',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          background: isEnabled ? '#FEF2F2' : '#0c4e7e',
                          color: isEnabled ? '#991B1B' : '#FFFFFF',
                          borderColor: isEnabled ? '#FCA5A5' : '#0c4e7e',
                          fontWeight: '700',
                          cursor: 'pointer'
                        }}
                      >
                        {isEnabled ? (
                          <>
                            <Lock size={13} />
                            <span>{t.dgmsDisableTest || 'Lock / Disable'}</span>
                          </>
                        ) : (
                          <>
                            <Unlock size={13} />
                            <span>{t.dgmsEnableTest || 'Enable Test'}</span>
                          </>
                        )}
                      </button>
                    </td>

                    {/* Active Statutory Access Code (Column Present on Screen) */}
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          padding: '0.45rem 0.75rem',
                          background: isEnabled ? '#ECFDF5' : '#F1F5F9',
                          border: isEnabled ? '2px solid #10B981' : '1px dashed #CBD5E1',
                          borderRadius: '6px',
                          color: isEnabled ? '#065F46' : '#94A3B8'
                        }}>
                          <span className="font-mono" style={{
                            fontSize: '1.25rem',
                            fontWeight: '900',
                            letterSpacing: '0.18em',
                            textShadow: isEnabled ? '0 1px 2px rgba(16, 185, 129, 0.2)' : 'none'
                          }}>
                            {auth.access_code}
                          </span>
                        </div>

                        <button
                          onClick={() => handleCopyCode(auth.access_code, auth.module_id)}
                          title="Copy Access Code"
                          className="gov-btn-secondary"
                          style={{
                            padding: '0.45rem 0.65rem',
                            fontSize: '0.78rem',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            borderColor: copiedModuleId === auth.module_id ? '#10B981' : '#CBD5E1',
                            color: copiedModuleId === auth.module_id ? '#047857' : '#475569'
                          }}
                        >
                          {copiedModuleId === auth.module_id ? (
                            <>
                              <Check size={14} color="#10B981" />
                              <span style={{ fontWeight: '700' }}>Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy size={14} />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>

                      <div style={{ fontSize: '0.74rem', color: isEnabled ? '#059669' : '#94A3B8', marginTop: '0.25rem' }}>
                        {isEnabled ? '● Active code for frontline workers' : 'Code ready upon test enablement'}
                      </div>
                    </td>

                    {/* Code Controls (4 or 6 digit selector + Regenerate) */}
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: '600' }}>Digits:</span>
                          <div style={{ display: 'inline-flex', borderRadius: '4px', overflow: 'hidden', border: '1px solid #CBD5E1' }}>
                            <button
                              type="button"
                              onClick={() => {
                                setCodeLengths(prev => ({ ...prev, [auth.module_id]: 6 }));
                                handleGenerateCode(auth.module_id, 6);
                              }}
                              style={{
                                padding: '0.2rem 0.5rem',
                                fontSize: '0.72rem',
                                fontWeight: currentLen === 6 ? '800' : '500',
                                background: currentLen === 6 ? '#0c4e7e' : '#FFFFFF',
                                color: currentLen === 6 ? '#FFFFFF' : '#475569',
                                border: 'none',
                                cursor: 'pointer'
                              }}
                            >
                              6 Digits
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setCodeLengths(prev => ({ ...prev, [auth.module_id]: 4 }));
                                handleGenerateCode(auth.module_id, 4);
                              }}
                              style={{
                                padding: '0.2rem 0.5rem',
                                fontSize: '0.72rem',
                                fontWeight: currentLen === 4 ? '800' : '500',
                                background: currentLen === 4 ? '#0c4e7e' : '#FFFFFF',
                                color: currentLen === 4 ? '#FFFFFF' : '#475569',
                                border: 'none',
                                borderLeft: '1px solid #CBD5E1',
                                cursor: 'pointer'
                              }}
                            >
                              4 Digits
                            </button>
                          </div>
                        </div>

                        <button
                          onClick={() => handleGenerateCode(auth.module_id, currentLen)}
                          disabled={isGenerating}
                          className="gov-btn-secondary"
                          style={{
                            padding: '0.35rem 0.65rem',
                            fontSize: '0.76rem',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            width: 'fit-content'
                          }}
                        >
                          <RefreshCw size={12} className={isGenerating ? 'animate-spin' : ''} />
                          <span>{isGenerating ? 'Generating...' : (t.dgmsGenerateNewCode || 'Generate New Code')}</span>
                        </button>
                      </div>
                    </td>

                    {/* Authorized By & Timestamp */}
                    <td>
                      <div style={{ fontSize: '0.82rem', fontWeight: '700', color: '#1E293B' }}>
                        {auth.authorized_by_name || 'Dr. A.K. Sengupta'}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.15rem' }}>
                        <Clock size={11} />
                        <span>{auth.updated_at ? new Date(auth.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Ready'}</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
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
