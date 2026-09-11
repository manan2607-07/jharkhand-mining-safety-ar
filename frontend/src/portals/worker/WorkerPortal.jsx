import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useOfflineSync } from '../../context/OfflineSyncContext';
import { apiFetch } from '../../services/api';
import SimulatorContainer from '../../simulator/ui/SimulatorContainer';
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
  Info,
  Smartphone,
  Download,
  KeyRound,
  Lock,
  Unlock,
  ShieldAlert,
  X
} from 'lucide-react';
import { AshokaLionCapital } from '../../components/Emblem';

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

  // DGMS Statutory Authorization & Passcode state for locked modules
  const [unlockedModules, setUnlockedModules] = useState(() => {
    try {
      const saved = sessionStorage.getItem('jh_unlocked_dgms_modules');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [dgmsCodeModalModule, setDgmsCodeModalModule] = useState(null);
  const [dgmsInputCode, setDgmsInputCode] = useState('');
  const [dgmsVerifyLoading, setDgmsVerifyLoading] = useState(false);
  const [dgmsVerifyError, setDgmsVerifyError] = useState('');
  const [dgmsVerifySuccess, setDgmsVerifySuccess] = useState('');

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
      title: t.module1Title || 'Fire & Explosion Response',
      subtitle: t.module1Subtitle || 'Exit identification, extinguisher PASS technique, and evacuation drill.',
      icon: Flame,
      color: '#0c4e7e',
      isMvp: true,
      phase: 1,
      duration: `12 ${t.minutesUnit || 'mins'}`,
      threshold: '80%'
    },
    {
      id: 'MOD-002',
      title: t.module2Title || 'Gas Leak & Confined Space Protocol',
      subtitle: t.module2Subtitle || 'Methane (CH4), Carbon Monoxide (CO), PPE donning, and buddy signaling.',
      icon: AlertOctagon,
      color: '#B8860B',
      isMvp: true,
      phase: 1,
      duration: `15 ${t.minutesUnit || 'mins'}`,
      threshold: '75%'
    },
    {
      id: 'MOD-003',
      title: t.module3Title || 'Machinery & Moving-Part Safety',
      subtitle: t.module3Subtitle || 'Conveyor belt lock-out/tag-out (LOTO), roller pinch points, and emergency pull cords.',
      icon: Cog,
      color: '#4B5563',
      isMvp: false,
      phase: 2,
      duration: `10 ${t.minutesUnit || 'mins'}`,
      threshold: '80%'
    },
    {
      id: 'MOD-004',
      title: t.module4Title || 'Electrical & Blasting Clearance',
      subtitle: t.module4Subtitle || 'Flameproof enclosure inspection, explosive magazine handling, and shot-firing cordon.',
      icon: Zap,
      color: '#4B5563',
      isMvp: false,
      phase: 2,
      duration: `14 ${t.minutesUnit || 'mins'}`,
      threshold: '85%'
    },
    {
      id: 'MOD-005',
      title: t.module5Title || 'PPE Compliance & Induction',
      subtitle: t.module5Subtitle || 'Mandatory DGMS 11-point gear protocol, cap lamp inspection, and dust respirator fitting.',
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

  const handleOpenDgmsCodeModal = (mod) => {
    setDgmsCodeModalModule(mod);
    setDgmsInputCode('');
    setDgmsVerifyError('');
    setDgmsVerifySuccess('');
  };

  const handleVerifyDgmsCode = async (e) => {
    if (e) e.preventDefault();
    if (!dgmsCodeModalModule || !dgmsInputCode.trim()) return;

    const cleanedCode = dgmsInputCode.trim().replace(/[\s-]/g, '');
    if (cleanedCode.length !== 6) {
      setDgmsVerifyError(t.dgmsCodeDigitsNotice || 'Please enter the 6-digit statutory code');
      return;
    }

    try {
      setDgmsVerifyLoading(true);
      setDgmsVerifyError('');
      setDgmsVerifySuccess('');

      const res = await apiFetch('/api/dgms/verify-code', {
        method: 'POST',
        body: JSON.stringify({
          moduleId: dgmsCodeModalModule.id,
          accessCode: cleanedCode
        })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setDgmsVerifySuccess(t.dgmsCodeSuccess || 'DGMS Statutory authorization confirmed. Launching simulator drill...');

        // Mark module unlocked in state & sessionStorage for this worker shift
        const newUnlocked = { ...unlockedModules, [dgmsCodeModalModule.id]: true };
        setUnlockedModules(newUnlocked);
        try {
          sessionStorage.setItem('jh_unlocked_dgms_modules', JSON.stringify(newUnlocked));
        } catch (err) {}

        setTimeout(() => {
          const targetMod = dgmsCodeModalModule;
          setDgmsCodeModalModule(null);
          handleStartModule(targetMod);
        }, 900);
      } else {
        setDgmsVerifyError(data.error || (t.dgmsCodeInvalid || 'Invalid code or test is currently locked under DGMS specification.'));
      }
    } catch (err) {
      console.warn('Network error during DGMS code verification, checking offline cached codes:', err);
      // Offline fallback verification
      try {
        const cached = localStorage.getItem('jh_dgms_cached_authorizations');
        if (cached) {
          const auths = JSON.parse(cached);
          const matching = auths.find(a => a.module_id === dgmsCodeModalModule.id);
          if (matching && matching.is_enabled === 1 && matching.access_code === cleanedCode) {
            setDgmsVerifySuccess(t.dgmsCodeSuccess || 'DGMS authorization confirmed. Launching simulator drill...');
            const newUnlocked = { ...unlockedModules, [dgmsCodeModalModule.id]: true };
            setUnlockedModules(newUnlocked);
            try {
              sessionStorage.setItem('jh_unlocked_dgms_modules', JSON.stringify(newUnlocked));
            } catch (e) {}
            setTimeout(() => {
              const targetMod = dgmsCodeModalModule;
              setDgmsCodeModalModule(null);
              handleStartModule(targetMod);
            }, 900);
            return;
          }
        }
      } catch (e) {}

      setDgmsVerifyError(t.dgmsCodeInvalid || 'Invalid code or test is currently locked under DGMS specification.');
    } finally {
      setDgmsVerifyLoading(false);
    }
  };

  const handleSimulatorComplete = ({ results, certificate, isOffline }) => {
    if (certificate) {
      const fullCert = {
        ...certificate,
        moduleTitle: selectedModule?.title || 'Safety Certification',
        workerCode: currentUser.workerCode,
        workerName: currentUser.name
      };
      setIssuedCertificate(fullCert);
      setWorkerCerts((prev) => [fullCert, ...prev]);
      setActiveView('CERTIFICATE');

      // Real-time broadcast for admin portal synchronization
      try {
        window.dispatchEvent(new CustomEvent('jh-safety-drill-completed', { detail: fullCert }));
        localStorage.setItem('jh_last_activity_ts', Date.now().toString());
        if (onActivityOccurred) onActivityOccurred(fullCert);
      } catch (e) {
        console.warn('Cross-portal event dispatch notice:', e);
      }
    } else {
      setActiveView('CATALOG');
    }
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
        <SimulatorContainer
          moduleId={selectedModule?.id || 'MOD-005'}
          onComplete={handleSimulatorComplete}
          onCancel={() => setActiveView('CATALOG')}
        />
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

          {/* Android 10+ Dedicated Mobile App Banner (Underground Offline Mining Mode) */}
          <div style={{
            background: 'linear-gradient(135deg, #0f2d4a 0%, #0c4e7e 100%)',
            color: '#FFFFFF',
            borderRadius: '6px',
            padding: '1rem 1.25rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            boxShadow: '0 2px 8px rgba(12, 78, 126, 0.15)',
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '6px',
                background: 'rgba(255,255,255,0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Smartphone size={22} color="#2EE59D" />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <h4 style={{ margin: 0, fontSize: '0.98rem', fontWeight: '800', color: '#FFFFFF' }}>
                    {language === 'sat' ? 'खान सुरक्षा - ᱮᱱᱰᱨᱚᱭᱮᱰ ᱑᱐+ ᱢᱚᱵᱟᱭᱤᱞ ᱮᱯ' : language === 'hi' ? 'खान सुरक्षा - Android 10+ स्टैंडअलोन मोबाइल ऐप' : 'Khan Suraksha - Android 10+ Standalone Mobile App'}
                  </h4>
                  <span style={{
                    background: '#10B981',
                    color: '#FFFFFF',
                    fontSize: '0.68rem',
                    fontWeight: '800',
                    padding: '0.1rem 0.45rem',
                    borderRadius: '3px'
                  }}>
                    API 29+ (Android 10 - 15+)
                  </span>
                </div>
                <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.82rem', color: '#CBD5E1' }}>
                  {language === 'sat' ? 'ᱠᱷᱟᱫᱟᱱ ᱵᱷᱤᱛᱨᱤ ᱨᱮ ᱤᱱᱴᱚᱨᱱᱮᱴ ᱵᱮᱜᱚᱨ ᱓D AR ᱥᱮᱪᱮᱫ, ᱠᱮᱢᱮᱨᱟ ᱟᱨ ᱥᱟᱨᱴᱤᱯᱷᱤᱠᱮᱴ ᱞᱟᱹᱜᱤᱫ APK ᱤᱱᱥᱴᱚᱞ ᱢᱮ᱾' : language === 'hi' ? 'भूगर्भीय खदानों में 100% ऑफ़लाइन 3D AR अभ्यास, कैमरा लाइव फीड एवं डिजिटल प्रमाणपत्र के लिए स्टैंडअलोन ऐप इंस्टॉल करें।' : 'Dedicated offline mobile APK for underground colliery training with native WebGL 3D AR, camera feeds, and offline DGMS ledger.'}
                </p>
              </div>
            </div>

            <a
              href="/khan-suraksha-android10+.apk"
              download="khan-suraksha-android10+.apk"
              className="gov-btn-primary"
              style={{
                background: '#2EE59D',
                color: '#0F172A',
                fontWeight: '800',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.5rem 1rem',
                borderRadius: '4px',
                fontSize: '0.82rem',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
              }}
            >
              <Download size={15} />
              <span>{language === 'sat' ? 'APK ᱰᱟᱣᱩᱱᱞᱚᱰ (᱑᱘ MB)' : language === 'hi' ? 'डाउनलोड ऐप (18 MB)' : 'Download APK (18 MB)'}</span>
            </a>
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
              const isUnlocked = mod.isMvp || Boolean(unlockedModules[mod.id]);

              return (
                <div
                  key={mod.id}
                  className="gov-card"
                  style={{
                    padding: '1.25rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    borderTop: isUnlocked ? '3px solid #0c4e7e' : '3px solid #64748B',
                    opacity: 1
                  }}
                >
                  <div>
                    {/* Header: Icon & Badges */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                      <div style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '4px',
                        background: isUnlocked ? '#EBF3FC' : '#F3F4F6',
                        border: isUnlocked ? '1px solid #B4D3F7' : '1px solid #D1D5DB',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: isUnlocked ? '#0c4e7e' : '#475569'
                      }}>
                        <IconComponent size={22} />
                      </div>

                      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                        {isCertified && (
                          <span className="gov-badge-green">
                            ✓ {t.certifiedBadge}
                          </span>
                        )}
                        {unlockedModules[mod.id] ? (
                          <span className="gov-badge-green">
                            ✓ {t.dgmsSessionAuthorizedBadge || 'DGMS AUTHORIZED'}
                          </span>
                        ) : mod.isMvp ? (
                          <span className="gov-badge-amber">
                            {t.statutoryDrillBadge}
                          </span>
                        ) : (
                          <span className="gov-badge-grey" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                            <Lock size={11} />
                            <span>{t.underDgmsSpec || 'Under DGMS Specification'}</span>
                          </span>
                        )}
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
                    {isUnlocked ? (
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
                        onClick={() => handleOpenDgmsCodeModal(mod)}
                        className="gov-btn-primary"
                        style={{
                          width: '100%',
                          padding: '0.65rem',
                          background: '#0c4e7e',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.45rem',
                          cursor: 'pointer'
                        }}
                      >
                        <KeyRound size={15} />
                        <span>{t.enterDgmsCodeBtn || 'Enter DGMS Code to Access'}</span>
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

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* DGMS Statutory Examination Access Code Modal                     */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      {dgmsCodeModalModule && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(7, 53, 86, 0.85)',
          backdropFilter: 'blur(5px)',
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem'
        }}>
          <div className="gov-card" style={{
            maxWidth: '480px',
            width: '100%',
            padding: '2rem',
            borderRadius: '8px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.35)',
            borderTop: '5px solid #0c4e7e',
            animation: 'fadeIn 0.2s ease-out'
          }}>
            {/* Official Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <AshokaLionCapital size={36} color="#0c4e7e" showMotto={false} />
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#B8860B', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Statutory Examination Access
                  </div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0c4e7e', fontFamily: 'var(--font-heading)', margin: 0 }}>
                    {t.dgmsUnlockModalTitle || 'DGMS Statutory Drill Access'}
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDgmsCodeModalModule(null)}
                style={{ background: 'transparent', border: 'none', color: '#64748B', cursor: 'pointer', padding: '0.25rem' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Target Module Badge */}
            <div style={{
              background: '#F1F5F9',
              border: '1px solid #CBD5E1',
              borderRadius: '6px',
              padding: '0.75rem 1rem',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem'
            }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '4px', background: '#0c4e7e', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <KeyRound size={18} />
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#0c4e7e' }}>
                  {dgmsCodeModalModule.id}
                </div>
                <div style={{ fontSize: '0.9rem', fontWeight: '700', color: '#1E293B' }}>
                  {dgmsCodeModalModule.title}
                </div>
              </div>
            </div>

            {/* Description */}
            <p style={{ fontSize: '0.86rem', color: '#4A5568', lineHeight: '1.5', marginBottom: '1.5rem' }}>
              {t.dgmsUnlockModalDesc || 'Testing for this module requires on-site authorization by the Directorate General of Mines Safety (DGMS). Enter the 6-digit statutory drill pass code provided by your inspecting DGMS Officer to begin.'}
            </p>

            {/* Error & Success Messages */}
            {dgmsVerifyError && (
              <div style={{
                background: '#FEF2F2',
                border: '1px solid #FCA5A5',
                borderRadius: '4px',
                padding: '0.75rem',
                color: '#991B1B',
                fontSize: '0.84rem',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.5rem'
              }}>
                <ShieldAlert size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>{dgmsVerifyError}</span>
              </div>
            )}

            {dgmsVerifySuccess && (
              <div style={{
                background: '#ECFDF5',
                border: '1px solid #6EE7B7',
                borderRadius: '4px',
                padding: '0.75rem',
                color: '#065F46',
                fontSize: '0.84rem',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <CheckCircle2 size={16} color="#10B981" />
                <span>{dgmsVerifySuccess}</span>
              </div>
            )}

            {/* Code Form */}
            <form onSubmit={handleVerifyDgmsCode}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#334155', marginBottom: '0.4rem' }}>
                  {t.dgmsColAccessCode || 'Statutory Access Code'} (6 Digits)
                </label>
                <input
                  type="text"
                  autoFocus
                  maxLength={6}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={dgmsInputCode}
                  onChange={(e) => setDgmsInputCode(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="e.g. 849201"
                  className="font-mono"
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    fontSize: '1.4rem',
                    fontWeight: '800',
                    letterSpacing: '0.25em',
                    textAlign: 'center',
                    border: '2px solid #0c4e7e',
                    borderRadius: '6px',
                    outline: 'none',
                    color: '#0c4e7e',
                    background: '#F8FAFC'
                  }}
                />
                <div style={{ fontSize: '0.74rem', color: '#64748B', marginTop: '0.35rem', textAlign: 'center' }}>
                  {t.dgmsCodeDigitsNotice || 'Requires 6-digit statutory code'}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setDgmsCodeModalModule(null)}
                  className="gov-btn-secondary"
                  style={{ flex: 1, padding: '0.75rem' }}
                >
                  {t.dgmsCancel || 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={dgmsVerifyLoading || !dgmsInputCode.trim()}
                  className="gov-btn-primary"
                  style={{
                    flex: 2,
                    padding: '0.75rem',
                    opacity: dgmsVerifyLoading || !dgmsInputCode.trim() ? 0.6 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.45rem'
                  }}
                >
                  {dgmsVerifyLoading ? (
                    <span>{t.dgmsVerifyingCode || 'Verifying with DGMS...'}</span>
                  ) : (
                    <>
                      <ShieldCheck size={16} />
                      <span>{t.dgmsVerifyAndStartBtn || 'Verify & Start Drill'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
