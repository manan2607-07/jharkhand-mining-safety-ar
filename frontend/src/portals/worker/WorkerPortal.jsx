import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useOfflineSync } from '../../context/OfflineSyncContext';
import { apiFetch } from '../../services/api';
import FireModuleAR from './FireModuleAR';
import GasModuleAR from './GasModuleAR';
import ScenarioQuiz from './ScenarioQuiz';
import DigitalCertificate from './DigitalCertificate';
import { 
  Flame, 
  AlertOctagon, 
  Cog, 
  Zap, 
  HardHat, 
  Play, 
  CheckCircle2, 
  Award, 
  Clock, 
  FileText,
  Volume2,
  ShieldCheck,
  QrCode,
  Calendar,
  Building2,
  Info
} from 'lucide-react';

export default function WorkerPortal({ onActivityOccurred, workerSection = 'modules' }) {
  const { t, language, speak, getLocalizedModuleTitle, getLocalizedDesignation } = useLanguage();
  const { currentUser } = useAuth();
  const { saveOfflineSession, saveOfflineCertificate } = useOfflineSync();

  // Mode: 'CATALOG' | 'SIMULATION' | 'QUIZ' | 'CERTIFICATE'
  const [activeView, setActiveView] = useState('CATALOG');
  const [selectedModule, setSelectedModule] = useState(null);
  const [arResults, setArResults] = useState(null);
  const [issuedCertificate, setIssuedCertificate] = useState(null);
  const [workerCerts, setWorkerCerts] = useState([]);
  const [loadingCerts, setLoadingCerts] = useState(false);

  // Smooth scroll to targeted worker section when navigation tab changes
  useEffect(() => {
    if (activeView !== 'CATALOG') return;
    if (workerSection === 'certificates') {
      const el = document.getElementById('worker-certificates-section');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (workerSection === 'profile') {
      const el = document.getElementById('worker-profile-section');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (workerSection === 'modules') {
      const el = document.getElementById('worker-modules-section');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [workerSection, activeView]);

  // Fetch worker's active certificates from backend
  useEffect(() => {
    async function loadCerts() {
      try {
        setLoadingCerts(true);
        const res = await apiFetch(`/api/workers/${currentUser.id}`);
        if (res.ok) {
          const data = await res.json();
          if (data.certificates) {
            setWorkerCerts(data.certificates);
          }
        }
      } catch (err) {
        console.warn('Could not fetch certificates from backend (offline):', err);
      } finally {
        setLoadingCerts(false);
      }
    }
    loadCerts();
  }, [currentUser.id]);

  const modules = [
    {
      id: 'MOD-001',
      title: t.module1Title,
      subtitle: t.module1Subtitle,
      icon: Flame,
      color: '#0c4e7e',
      isMvp: true,
      phase: 1,
      duration: `12 ${t.minutesUnit || 'mins'}`,
      threshold: '80%'
    },
    {
      id: 'MOD-002',
      title: t.module2Title,
      subtitle: t.module2Subtitle,
      icon: AlertOctagon,
      color: '#B8860B',
      isMvp: true,
      phase: 1,
      duration: `15 ${t.minutesUnit || 'mins'}`,
      threshold: '75%'
    },
    {
      id: 'MOD-003',
      title: t.module3Title,
      subtitle: t.module3Subtitle,
      icon: Cog,
      color: '#4B5563',
      isMvp: false,
      phase: 2,
      duration: `10 ${t.minutesUnit || 'mins'}`,
      threshold: '80%'
    },
    {
      id: 'MOD-004',
      title: t.module4Title,
      subtitle: t.module4Subtitle,
      icon: Zap,
      color: '#4B5563',
      isMvp: false,
      phase: 2,
      duration: `14 ${t.minutesUnit || 'mins'}`,
      threshold: '85%'
    },
    {
      id: 'MOD-005',
      title: t.module5Title,
      subtitle: t.module5Subtitle,
      icon: HardHat,
      color: '#4B5563',
      isMvp: false,
      phase: 2,
      duration: `8 ${t.minutesUnit || 'mins'}`,
      threshold: '90%'
    }
  ];

  const handleStartModule = (mod) => {
    setSelectedModule(mod);
    speak(language === 'sat' ? "ᱥᱮᱪᱮᱫ ᱮᱦᱚᱵᱚᱜ ᱠᱟᱱᱟ᱾ ᱠᱮᱢᱮᱨᱟ ᱥᱟᱢᱟᱝ ᱨᱮ ᱫᱚᱦᱚᱭ ᱢᱮ᱾" : "सुरक्षा सिमुलेशन प्रारंभ हो रहा है। कैमरा स्क्रीन पर ध्यान दें।");
    setActiveView('SIMULATION');
  };

  const handleARComplete = (results) => {
    setArResults(results);
    setActiveView('QUIZ');
  };

  const handleQuizPassed = async (score) => {
    try {
      // Issue certificate via API
      const res = await apiFetch('/api/certificates/issue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          worker_id: currentUser.id || 'WRK-1000',
          module_id: selectedModule.id,
          score,
          completion_time_sec: arResults?.completionTimeSec || 300,
          ar_accuracy_score: arResults?.accuracy || 0.94,
          language_used: language.toUpperCase()
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.certificate) {
          const cert = {
            ...data.certificate,
            moduleTitle: selectedModule.title,
            workerCode: currentUser.workerCode,
            workerName: currentUser.name
          };
          setIssuedCertificate(cert);
          setWorkerCerts((prev) => [cert, ...prev]);
          setActiveView('CERTIFICATE');

          // Real-time broadcast for admin portal synchronization
          try {
            window.dispatchEvent(new CustomEvent('jh-safety-drill-completed', { detail: cert }));
            localStorage.setItem('jh_last_activity_ts', Date.now().toString());
            if (onActivityOccurred) onActivityOccurred(cert);
          } catch (e) {
            console.warn('Cross-portal event dispatch notice:', e);
          }
          return;
        }
      }
    } catch (err) {
      console.warn('Network issue while issuing certificate, generating offline certificate:', err);
    }

    // Fallback on-device offline certificate generation
    const fallbackId = `CERT-JH-2026-${Math.floor(10000 + Math.random() * 90000)}`;
    const issueDate = new Date().toISOString().split('T')[0];
    const expiryDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const rawPayload = `${fallbackId}|${currentUser.id}|${selectedModule.id}|${score}|${issueDate}|${expiryDate}`;
    
    const offlineCert = {
      certificateId: fallbackId,
      workerId: currentUser.id || 'WRK-1000',
      workerName: currentUser.name,
      workerCode: currentUser.workerCode,
      moduleTitle: selectedModule.title,
      score,
      issueDate,
      expiryDate,
      qrHash: btoa(rawPayload).substring(0, 48),
      signature: `DGMS-OFFLINE-SIG-${Date.now().toString().slice(-6)}`
    };

    saveOfflineCertificate(offlineCert);
    saveOfflineSession({
      id: `SESS-${Date.now()}`,
      worker_id: currentUser.id || 'WRK-1000',
      module_id: selectedModule.id,
      score,
      pass_status: 1
    });

    setIssuedCertificate(offlineCert);
    setWorkerCerts((prev) => [offlineCert, ...prev]);
    setActiveView('CERTIFICATE');

    // Real-time broadcast for admin portal synchronization
    try {
      window.dispatchEvent(new CustomEvent('jh-safety-drill-completed', { detail: offlineCert }));
      localStorage.setItem('jh_last_activity_ts', Date.now().toString());
      if (onActivityOccurred) onActivityOccurred(offlineCert);
    } catch (e) {
      console.warn('Cross-portal event dispatch notice:', e);
    }
  };

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '1.5rem 1rem' }}>
      {/* Simulation View */}
      {activeView === 'SIMULATION' && (
        selectedModule.id === 'MOD-001' ? (
          <FireModuleAR
            onComplete={handleARComplete}
            onCancel={() => setActiveView('CATALOG')}
          />
        ) : (
          <GasModuleAR
            onComplete={handleARComplete}
            onCancel={() => setActiveView('CATALOG')}
          />
        )
      )}

      {/* Quiz Assessment View */}
      {activeView === 'QUIZ' && (
        <ScenarioQuiz
          moduleId={selectedModule.id}
          arAccuracy={arResults?.accuracy || 0.92}
          onQuizPassed={handleQuizPassed}
          onRetake={() => setActiveView('SIMULATION')}
        />
      )}

      {/* Certificate View */}
      {activeView === 'CERTIFICATE' && issuedCertificate && (
        <DigitalCertificate
          certificate={issuedCertificate}
          onDone={() => setActiveView('CATALOG')}
        />
      )}

      {/* Main Worker Catalog & Profile View */}
      {activeView === 'CATALOG' && (
        <div>
          {/* Official Worker E-Identity Card (Govt Style) */}
          <div id="worker-profile-section" className="gov-card" style={{
            padding: '1.5rem',
            marginBottom: '1.75rem',
            borderLeft: '5px solid #0c4e7e',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1.25rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '4px',
                background: '#EBF3FC',
                border: '1px solid #B4D3F7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#0c4e7e'
              }}>
                <HardHat size={34} />
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
                  <h2 style={{ fontSize: '1.3rem', fontWeight: '800', color: '#0c4e7e', fontFamily: 'var(--font-heading)', margin: 0 }}>
                    {currentUser.name}
                  </h2>
                  <span className="gov-badge-green">
                    ✓ {t.activeMinerStatus}
                  </span>
                </div>

                <p style={{ fontSize: '0.88rem', color: '#4A5568', margin: '0.2rem 0' }}>
                  <strong>{getLocalizedDesignation ? getLocalizedDesignation(currentUser.designation) : currentUser.designation}</strong> • {currentUser.siteName}
                </p>

                <div style={{ fontSize: '0.8rem', color: '#718096' }}>
                  {t.workforceCode}: <strong className="font-mono" style={{ color: '#0c4e7e' }}>{currentUser.workerCode}</strong>
                  <span style={{ margin: '0 0.5rem' }}>•</span>
                  {t.sectorLabel}: <strong>{currentUser.sector || 'COAL'}</strong>
                  <span style={{ margin: '0 0.5rem' }}>•</span>
                  {t.districtLabel}: <strong>{currentUser.district || 'Dhanbad'}</strong>
                </div>
              </div>
            </div>

            {/* Official Certification Summary Counters */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              background: '#F8FAFC',
              padding: '0.75rem 1.25rem',
              borderRadius: '4px',
              border: '1px solid #E2E8F0'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#1E7B34' }}>
                  {workerCerts.length}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748B', textTransform: 'uppercase', fontWeight: '700' }}>
                  {t.activeCertsCounter}
                </div>
              </div>

              <div style={{ width: '1px', height: '36px', background: '#CBD5E1' }} />

              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0c4e7e' }}>
                  2
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748B', textTransform: 'uppercase', fontWeight: '700' }}>
                  {t.mandatoryDrillsCounter}
                </div>
              </div>
            </div>
          </div>

          {/* Section Header */}
          <div id="worker-modules-section" style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem',
            paddingBottom: '0.5rem',
            borderBottom: '2px solid #E2E8F0'
          }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', color: '#0c4e7e', fontWeight: '800', fontFamily: 'var(--font-heading)' }}>
                {t.modulesSectionTitle}
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#64748B' }}>
                {t.modulesSectionSubtitle}
              </p>
            </div>

            <button
              onClick={() => speak(language === 'sat' ? "ᱥᱮᱸᱜᱮᱞ ᱤᱬᱤᱡ ᱟᱨᱵᱟᱝ ᱜᱮᱥ ᱡᱚᱨᱚ ᱥᱮᱪᱮᱫ ᱵᱟᱪᱷᱟᱣ ᱢᱮ᱾" : "आग एवं विस्फोट अथवा गैस रिसाव सिमुलेशन शुरू करने के लिए मॉड्यूल चुनें।")}
              className="gov-btn-secondary"
              style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem' }}
            >
              <Volume2 size={14} />
              <span>{t.audioGuidanceBtn}</span>
            </button>
          </div>

          {/* Training Modules Grid (Formal Light Cards) */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(330px, 1fr))',
            gap: '1.25rem',
            marginBottom: '2.5rem'
          }}>
            {modules.map((mod) => {
              const IconComponent = mod.icon;
              const isCertified = workerCerts.some((c) => c.module_id === mod.id || c.moduleTitle === mod.title);

              return (
                <div
                  key={mod.id}
                  className="gov-card"
                  style={{
                    padding: '1.25rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    borderTop: mod.isMvp ? '3px solid #0c4e7e' : '3px solid #D1D5DB',
                    opacity: mod.isMvp ? 1 : 0.75
                  }}
                >
                  <div>
                    {/* Header: Icon & Badges */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                      <div style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '4px',
                        background: mod.isMvp ? '#EBF3FC' : '#F3F4F6',
                        border: mod.isMvp ? '1px solid #B4D3F7' : '1px solid #D1D5DB',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: mod.isMvp ? '#0c4e7e' : '#6B7280'
                      }}>
                        <IconComponent size={22} />
                      </div>

                      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                        {isCertified && (
                          <span className="gov-badge-green">
                            ✓ {t.certifiedBadge}
                          </span>
                        )}
                        <span className={mod.isMvp ? 'gov-badge-amber' : 'gov-badge-grey'}>
                          {mod.isMvp ? t.statutoryDrillBadge : t.phase2Badge}
                        </span>
                      </div>
                    </div>

                    {/* Title & Description */}
                    <h4 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#0c4e7e', fontFamily: 'var(--font-heading)', marginBottom: '0.4rem' }}>
                      {mod.title}
                    </h4>
                    <p style={{ fontSize: '0.84rem', color: '#4A5568', marginBottom: '1.25rem', lineHeight: '1.5' }}>
                      {mod.subtitle}
                    </p>
                  </div>

                  <div>
                    {/* Meta Specs */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '0.5rem 0',
                      borderTop: '1px solid #E2E8F0',
                      marginBottom: '1rem',
                      fontSize: '0.78rem',
                      color: '#64748B'
                    }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Clock size={13} /> {mod.duration}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Award size={13} /> {t.passThresholdLabel} {mod.threshold}
                      </span>
                    </div>

                    {/* Official CTA Button */}
                    {mod.isMvp ? (
                      <button
                        onClick={() => handleStartModule(mod)}
                        className="gov-btn-primary"
                        style={{ width: '100%', padding: '0.65rem' }}
                      >
                        <Play size={15} fill="#fff" />
                        <span>{t.startSimulation}</span>
                      </button>
                    ) : (
                      <button
                        disabled
                        className="gov-btn-secondary"
                        style={{ width: '100%', padding: '0.65rem', opacity: 0.6, cursor: 'not-allowed' }}
                      >
                        {t.underDgmsSpec}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Official Issued Certificates Ledger */}
          <div id="worker-certificates-section" style={{ marginTop: '2rem' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1rem',
              paddingBottom: '0.5rem',
              borderBottom: '2px solid #E2E8F0'
            }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', color: '#0c4e7e', fontWeight: '800', fontFamily: 'var(--font-heading)' }}>
                  {t.passportsSectionTitle}
                </h3>
                <p style={{ fontSize: '0.84rem', color: '#64748B' }}>
                  {t.passportsSectionSubtitle}
                </p>
              </div>
            </div>

            {workerCerts.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(330px, 1fr))', gap: '1rem' }}>
                {workerCerts.map((cert, index) => (
                  <div
                    key={cert.certificate_id || cert.certificateId || index}
                    className="gov-card"
                    style={{
                      padding: '1.25rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      borderLeft: '4px solid #1E7B34'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: '600' }}>
                        {t.certNumberLabel}
                      </div>
                      <div className="font-mono" style={{ fontSize: '0.92rem', fontWeight: '700', color: '#0c4e7e' }}>
                        {cert.certificate_id || cert.certificateId}
                      </div>
                      <div style={{ fontSize: '0.88rem', fontWeight: '700', color: '#1A202C', marginTop: '0.25rem' }}>
                        {getLocalizedModuleTitle(cert.module_title || cert.moduleTitle)}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#8B6508', marginTop: '0.2rem' }}>
                        {t.statutoryValidityLabel} <strong>{cert.expiry_date || cert.expiryDate}</strong>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setIssuedCertificate({
                          certificateId: cert.certificate_id || cert.certificateId,
                          workerId: cert.worker_id || cert.workerId,
                          workerName: currentUser.name,
                          workerCode: currentUser.workerCode,
                          moduleTitle: getLocalizedModuleTitle(cert.module_title || cert.moduleTitle),
                          score: cert.score,
                          issueDate: cert.issue_date || cert.issueDate,
                          expiryDate: cert.expiry_date || cert.expiryDate,
                          qrHash: cert.qr_hash || cert.qrHash,
                          signature: cert.signature
                        });
                        setActiveView('CERTIFICATE');
                      }}
                      className="gov-btn-secondary"
                      style={{ padding: '0.45rem 0.75rem', fontSize: '0.8rem' }}
                    >
                      <QrCode size={16} />
                      <span>{t.viewCertificate}</span>
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="gov-card" style={{ padding: '1.75rem', textAlign: 'center', background: '#F8FAFC' }}>
                <ShieldCheck size={36} color="#0c4e7e" style={{ margin: '0 auto 0.5rem auto' }} />
                <h4 style={{ fontSize: '1rem', fontWeight: '700', color: '#0c4e7e', margin: '0.25rem 0' }}>
                  {t.noPassportsTitle}
                </h4>
                <p style={{ fontSize: '0.82rem', color: '#64748B', maxWidth: '480px', margin: '0 auto 1rem auto' }}>
                  {t.noPassportsDesc}
                </p>
                <button
                  onClick={() => {
                    const el = document.getElementById('worker-modules-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                  className="gov-btn-primary"
                  style={{ padding: '0.45rem 1rem', fontSize: '0.82rem' }}
                >
                  {t.startDrillCta}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
