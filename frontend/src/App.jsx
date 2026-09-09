import React, { useState, useEffect } from 'react';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { OfflineSyncProvider } from './context/OfflineSyncContext';
import Navbar from './components/Navbar';
import OfflineBanner from './components/OfflineBanner';
import WorkerPortal from './portals/worker/WorkerPortal';
import SafetyOfficerDashboard from './portals/safety_officer/SafetyOfficerDashboard';
import DGMSPortal from './portals/dgms/DGMSPortal';
import StateNodalDashboard from './portals/state_nodal/StateNodalDashboard';
import WorkerLoginPage from './portals/auth/WorkerLoginPage';
import AdminLoginPage from './portals/auth/AdminLoginPage';
import { AshokaLionCapital } from './components/Emblem';
import { Shield, ExternalLink, Info, CheckCircle } from 'lucide-react';

function MainApp() {
  const { currentRole, switchRole, workerUser, adminUser, isWorkerAuthenticated, isAdminAuthenticated } = useAuth();
  
  const [routeHash, setRouteHash] = useState(() => {
    if (typeof window !== 'undefined') {
      const isSubdomainAdmin = window.location.hostname.startsWith('admin');
      const isPathAdmin = window.location.pathname.startsWith('/admin');
      const isEnvAdmin = import.meta.env.VITE_DEFAULT_PORTAL === 'admin';

      if (isSubdomainAdmin || isPathAdmin || isEnvAdmin) {
        if (!window.location.hash.startsWith('#admin')) {
          return '#admin-login';
        }
      }
      return window.location.hash || '#worker';
    }
    return '#worker';
  });

  const [adminTab, setAdminTabState] = useState(() => {
    if (typeof window !== 'undefined') {
      if (window.location.hash.includes('dgms')) return 'dgms';
      if (window.location.hash.includes('state')) return 'state';
    }
    return 'officer';
  });

  const [workerSection, setWorkerSection] = useState('modules');
  const [verificationHash, setVerificationHash] = useState('');
  const [lastSyncTimestamp, setLastSyncTimestamp] = useState(Date.now());

  // Synchronize hash routing across page visits
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash || '#worker';
      setRouteHash(hash);

      if (hash.startsWith('#admin')) {
        if (hash.includes('dgms')) {
          setAdminTabState('dgms');
          switchRole('DGMS_INSPECTOR');
        } else if (hash.includes('state')) {
          setAdminTabState('state');
          switchRole('STATE_NODAL_OFFICER');
        } else {
          setAdminTabState('officer');
          switchRole('SAFETY_OFFICER');
        }
      } else {
        if (hash.includes('certificates')) setWorkerSection('certificates');
        else if (hash.includes('profile')) setWorkerSection('profile');
        else setWorkerSection('modules');
        switchRole('WORKER');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Listen for real-time worker completions & offline sync broadcasts
  useEffect(() => {
    const handleWorkerActivity = () => {
      setLastSyncTimestamp(Date.now());
    };
    window.addEventListener('jh-safety-drill-completed', handleWorkerActivity);
    window.addEventListener('storage', handleWorkerActivity);
    return () => {
      window.removeEventListener('jh-safety-drill-completed', handleWorkerActivity);
      window.removeEventListener('storage', handleWorkerActivity);
    };
  }, []);

  const setPortalMode = (mode) => {
    if (mode === 'admin') {
      window.location.hash = isAdminAuthenticated ? `#admin/${adminTab}` : '#admin-login';
    } else {
      window.location.hash = isWorkerAuthenticated ? '#worker' : '#worker-login';
    }
  };

  const setAdminTab = (tab) => {
    setAdminTabState(tab);
    window.location.hash = `#admin/${tab}`;
    if (tab === 'officer') switchRole('SAFETY_OFFICER');
    else if (tab === 'dgms') switchRole('DGMS_INSPECTOR');
    else if (tab === 'state') switchRole('STATE_NODAL_OFFICER');
  };

  const navigateToDGMS = (hash) => {
    setVerificationHash(hash);
    switchRole('DGMS_INSPECTOR');
    setAdminTabState('dgms');
    window.location.hash = '#admin/dgms';
  };

  // Determine active view mode based on route and auth status
  const isAdminRoute = routeHash.startsWith('#admin');
  const isAdminLoginView = routeHash === '#admin-login' || (isAdminRoute && !isAdminAuthenticated);
  const isWorkerLoginView = routeHash === '#worker-login' || routeHash === '#login' || (!isAdminRoute && !isWorkerAuthenticated);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-primary)' }}>
      {/* Show full Navbar when authenticated in respective portal */}
      {!isAdminLoginView && !isWorkerLoginView && (
        <Navbar
          portalMode={isAdminRoute ? 'admin' : 'worker'}
          setPortalMode={setPortalMode}
          adminTab={adminTab}
          setAdminTab={setAdminTab}
          workerSection={workerSection}
          setWorkerSection={setWorkerSection}
        />
      )}
      <OfflineBanner />

      <main id="main-content" tabIndex="-1" style={{ flex: 1, outline: 'none' }}>
        {isAdminLoginView ? (
          <AdminLoginPage
            onLoginSuccess={(admin) => {
              const targetTab = admin.role === 'DGMS_INSPECTOR' ? 'dgms' : admin.role === 'STATE_NODAL_OFFICER' ? 'state' : 'officer';
              setAdminTabState(targetTab);
              window.location.hash = `#admin/${targetTab}`;
            }}
          />
        ) : isWorkerLoginView ? (
          <WorkerLoginPage
            onLoginSuccess={(worker) => {
              setWorkerSection('modules');
              window.location.hash = '#worker';
            }}
          />
        ) : isAdminRoute ? (
          <>
            {adminTab === 'officer' && (
              <SafetyOfficerDashboard key={`officer-${lastSyncTimestamp}`} />
            )}
            {adminTab === 'dgms' && (
              <DGMSPortal key={`dgms-${lastSyncTimestamp}`} initialHash={verificationHash} />
            )}
            {adminTab === 'state' && (
              <StateNodalDashboard key={`state-${lastSyncTimestamp}`} />
            )}
          </>
        ) : (
          <WorkerPortal
            key={`worker-${lastSyncTimestamp}`}
            onNavigateToDGMS={navigateToDGMS}
            onActivityOccurred={() => setLastSyncTimestamp(Date.now())}
            workerSection={workerSection}
          />
        )}
      </main>

      {/* Official Jharkhand State Mines Portal Footer (jharkhand.gov.in/mines) */}
      <footer className="no-print" style={{
        backgroundColor: '#073556',
        borderTop: '3px solid #2EE59D',
        color: '#E2E8F0',
        marginTop: 'auto',
        fontSize: '0.82rem',
        fontFamily: "'Open Sans', sans-serif"
      }}>
        {/* Top Footer: Statutory Policy Navigation Links */}
        <div style={{
          borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
          padding: '1rem 1.25rem',
          background: '#0c4e7e'
        }}>
          <div style={{
            maxWidth: '1440px',
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1.25rem',
            fontSize: '0.8rem',
            fontFamily: "'Roboto Slab', serif"
          }}>
            <a href="#main-content" style={{ color: '#FFFFFF', textDecoration: 'none' }}>Home</a>
            <span style={{ color: 'rgba(255,255,255,0.4)' }}>|</span>
            <a href="#main-content" style={{ color: '#FFFFFF', textDecoration: 'none' }}>Simulator Info</a>
            <span style={{ color: 'rgba(255,255,255,0.4)' }}>|</span>
            <a href="#main-content" style={{ color: '#FFFFFF', textDecoration: 'none' }}>Curriculum Model</a>
            <span style={{ color: 'rgba(255,255,255,0.4)' }}>|</span>
            <a href="#main-content" style={{ color: '#FFFFFF', textDecoration: 'none' }}>RTI Disclosures</a>
            <span style={{ color: 'rgba(255,255,255,0.4)' }}>|</span>
            <a href="#main-content" style={{ color: '#FFFFFF', textDecoration: 'none' }}>Evaluation Team</a>
            <span style={{ color: 'rgba(255,255,255,0.4)' }}>|</span>
            <a href="#main-content" style={{ color: '#FFFFFF', textDecoration: 'none' }}>Acts & Rules</a>
            <span style={{ color: 'rgba(255,255,255,0.4)' }}>|</span>
            <a href="#main-content" style={{ color: '#FFFFFF', textDecoration: 'none' }}>Safety Framework</a>
            <span style={{ color: 'rgba(255,255,255,0.4)' }}>|</span>
            <a href="#main-content" style={{ color: '#FFFFFF', textDecoration: 'none' }}>Screen Reader Access</a>
            <span style={{ color: 'rgba(255,255,255,0.4)' }}>|</span>
            <a href="#admin-login" style={{ color: '#2EE59D', textDecoration: 'none', fontWeight: '700' }}>Official Sign-In (विभागीय लॉगिन)</a>
          </div>
        </div>

        {/* Middle Footer: Project Context, Statutory References & Academic Declarations */}
        <div style={{
          padding: '1.75rem 1.25rem',
          maxWidth: '1440px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.5rem',
          alignItems: 'start'
        }}>
          {/* Department Ownership Context */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.65rem' }}>
              <AshokaLionCapital size={32} color="#FFFFFF" showMotto={false} />
              <div>
                <div style={{ fontWeight: '700', fontSize: '0.94rem', color: '#FFFFFF', fontFamily: "'Roboto Slab', serif" }}>
                  Smart India Hackathon 2026 (PS ID: 26041)
                </div>
                <div style={{ fontSize: '0.78rem', color: '#2EE59D', fontWeight: '600' }}>
                  AR Vocational Mining Safety Simulation Engine
                </div>
              </div>
            </div>
            <p style={{ fontSize: '0.76rem', color: '#94A3B8', lineHeight: 1.55 }}>
              Academic technical prototype developed for Smart India Hackathon 2026. Modeled on the vocational training curriculum of the Department of Mines & Geology (Govt. of Jharkhand) and statutory benchmarks of the Mines Act, 1952 and DGMS guidelines.
            </p>
          </div>

          {/* Statutory Mandates & Frameworks */}
          <div>
            <div style={{ fontWeight: '700', fontSize: '0.88rem', color: '#FFFFFF', marginBottom: '0.65rem', fontFamily: "'Roboto Slab', serif" }}>
              Benchmarked Standards & Guidelines
            </div>
            <ul style={{ listStyle: 'none', padding: 0, fontSize: '0.76rem', color: '#CBD5E1', lineHeight: 1.8 }}>
              <li>• Directorate General of Mines Safety (DGMS) Safety Criteria</li>
              <li>• Mines Act, 1952 & Factories Act, 1948 Competency Metrics</li>
              <li>• Smart India Hackathon 2026 — Problem Statement ID: 26041</li>
              <li>• Guidelines for Indian Government Websites (GIGW 3.0 / WCAG 2.1 AA)</li>
            </ul>
          </div>

          {/* Hosting Credit, Visitor Stats & SIH Attribution */}
          <div>
            <div style={{ fontWeight: '700', fontSize: '0.88rem', color: '#FFFFFF', marginBottom: '0.65rem', fontFamily: "'Roboto Slab', serif" }}>
              Development & Safe Harbor Provenance
            </div>
            <div style={{ fontSize: '0.76rem', color: '#CBD5E1', lineHeight: 1.6 }}>
              <div>Developed by <strong>SIH 2026 Team (Problem Statement ID: 26041)</strong></div>
              <div>Educational & Research Prototype for <strong>Mining & Steel Safety Training</strong></div>
              
              {/* Simulated Visitor Counter */}
              <div style={{ marginTop: '0.6rem' }}>
                <span style={{ fontSize: '0.72rem', color: '#94A3B8', display: 'block', marginBottom: '0.25rem' }}>
                  Simulated Workforce Drill Count:
                </span>
                <div style={{ display: 'inline-flex' }}>
                  <span className="visitorspan">0</span>
                  <span className="visitorspan">0</span>
                  <span className="visitorspan">1</span>
                  <span className="visitorspan">2</span>
                  <span className="visitorspan">4</span>
                  <span className="visitorspan">9</span>
                  <span className="visitorspan">2</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Strip: Copyright & Safe Harbor Disclaimer */}
        <div style={{
          background: '#042238',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '0.85rem 1.25rem',
          textAlign: 'center',
          fontSize: '0.72rem',
          color: '#94A3B8',
          lineHeight: 1.6
        }}>
          <div>
            <strong>Legal Disclaimer & Fair Dealing Notice:</strong> This platform is an independent educational and technical simulation prototype created for the <strong>Smart India Hackathon 2026 (Problem Statement ID: 26041)</strong>. It is <strong>NOT</strong> an official government portal and is not operated by or formally affiliated with the Government of Jharkhand, Directorate General of Mines Safety (DGMS), or National Informatics Centre (NIC).
          </div>
          <div style={{ marginTop: '0.25rem', color: '#64748B' }}>
            All statutory names, insignia representations, and regulatory benchmarks are referenced solely for competition evaluation and academic demonstration under the Fair Dealing provisions of Section 52 of the Indian Copyright Act, 1957.
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <OfflineSyncProvider>
          <MainApp />
        </OfflineSyncProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}
