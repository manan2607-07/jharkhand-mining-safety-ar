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

const isCurrentDomainAdmin = () => {
  if (typeof window === 'undefined') return false;
  const host = window.location.hostname.toLowerCase();
  const path = window.location.pathname.toLowerCase();
  return (
    host.includes('admin') ||
    path.startsWith('/admin') ||
    import.meta.env.VITE_DEFAULT_PORTAL === 'admin'
  );
};

function MainApp() {
  const { adminUser, isWorkerAuthenticated, isAdminAuthenticated } = useAuth();
  
  const isAdminDomain = isCurrentDomainAdmin();

  // Determine authorized admin tab based strictly on authenticated role (immutable per session)
  const authorizedAdminTab = adminUser ? (
    adminUser.role === 'DGMS_INSPECTOR' ? 'dgms' :
    adminUser.role === 'STATE_NODAL_OFFICER' ? 'state' : 'officer'
  ) : 'officer';

  const [routeHash, setRouteHash] = useState(() => {
    if (typeof window !== 'undefined') {
      if (isAdminDomain) {
        return isAdminAuthenticated ? `#admin/${authorizedAdminTab}` : '#admin-login';
      }
      if (window.location.hash === '#admin-login') return '#admin-login';
      return isWorkerAuthenticated ? (window.location.hash || '#worker') : '#worker-login';
    }
    return '#worker-login';
  });

  const [adminTab, setAdminTabState] = useState(authorizedAdminTab);
  const [workerSection, setWorkerSection] = useState('modules');
  const [lastSyncTimestamp, setLastSyncTimestamp] = useState(Date.now());

  // Keep adminTab locked to authorized role
  useEffect(() => {
    if (adminUser) {
      setAdminTabState(authorizedAdminTab);
    }
  }, [adminUser, authorizedAdminTab]);

  // Synchronize hash routing across page visits with strict auth guards
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash || '';

      if (isAdminDomain) {
        if (!isAdminAuthenticated) {
          if (hash !== '#admin-login') {
            window.location.hash = '#admin-login';
          }
          setRouteHash('#admin-login');
        } else {
          // Locked strictly to authorized role's tab; cannot switch or view other admins
          const target = `#admin/${authorizedAdminTab}`;
          if (hash !== target) {
            window.location.hash = target;
          }
          setRouteHash(target);
          setAdminTabState(authorizedAdminTab);
        }
        return;
      }

      // On worker domain:
      if (hash === '#admin-login') {
        setRouteHash('#admin-login');
        return;
      }

      if (!isWorkerAuthenticated) {
        if (hash !== '#worker-login') {
          window.location.hash = '#worker-login';
        }
        setRouteHash('#worker-login');
        return;
      }

      // Authenticated worker routing
      const safeHash = hash.startsWith('#worker') ? hash : '#worker';
      setRouteHash(safeHash);
      if (safeHash.includes('certificates')) setWorkerSection('certificates');
      else if (safeHash.includes('profile')) setWorkerSection('profile');
      else setWorkerSection('modules');
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [isAdminDomain, isAdminAuthenticated, isWorkerAuthenticated, authorizedAdminTab]);

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

  const setAdminTab = () => {
    // Admin is strictly locked to their own authorized console
    setAdminTabState(authorizedAdminTab);
    window.location.hash = `#admin/${authorizedAdminTab}`;
  };

  // Determine views strictly based on authentication state
  const showAdminLogin = isAdminDomain ? !isAdminAuthenticated : (routeHash === '#admin-login' && !isAdminAuthenticated);
  const showWorkerLogin = !isAdminDomain && !isWorkerAuthenticated && !showAdminLogin;
  const showAdminDashboard = isAdminDomain ? isAdminAuthenticated : (routeHash.startsWith('#admin') && isAdminAuthenticated);
  const showWorkerDashboard = !isAdminDomain && isWorkerAuthenticated && !showAdminLogin && !showAdminDashboard;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-primary)' }}>
      {/* Show full Navbar when authenticated in respective portal */}
      {!showAdminLogin && !showWorkerLogin && (
        <Navbar
          portalMode={isAdminDomain || routeHash.startsWith('#admin') ? 'admin' : 'worker'}
          adminTab={adminTab}
          setAdminTab={setAdminTab}
          workerSection={workerSection}
          setWorkerSection={setWorkerSection}
        />
      )}
      <OfflineBanner />

      <main id="main-content" tabIndex="-1" style={{ flex: 1, outline: 'none' }}>
        {showAdminLogin ? (
          <AdminLoginPage
            onLoginSuccess={(admin) => {
              const targetTab = admin.role === 'DGMS_INSPECTOR' ? 'dgms' : admin.role === 'STATE_NODAL_OFFICER' ? 'state' : 'officer';
              setAdminTabState(targetTab);
              window.location.hash = `#admin/${targetTab}`;
            }}
          />
        ) : showWorkerLogin ? (
          <WorkerLoginPage
            onLoginSuccess={() => {
              setWorkerSection('modules');
              window.location.hash = '#worker';
            }}
          />
        ) : showAdminDashboard ? (
          <>
            {adminUser?.role === 'SAFETY_OFFICER' && (
              <SafetyOfficerDashboard key={`officer-${lastSyncTimestamp}`} />
            )}
            {adminUser?.role === 'DGMS_INSPECTOR' && (
              <DGMSPortal key={`dgms-${lastSyncTimestamp}`} />
            )}
            {adminUser?.role === 'STATE_NODAL_OFFICER' && (
              <StateNodalDashboard key={`state-${lastSyncTimestamp}`} />
            )}
          </>
        ) : showWorkerDashboard ? (
          <WorkerPortal
            key={`worker-${lastSyncTimestamp}`}
            onActivityOccurred={() => setLastSyncTimestamp(Date.now())}
            workerSection={workerSection}
          />
        ) : (
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            <p>Accessing portal...</p>
          </div>
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
            {isAdminDomain && !isAdminAuthenticated && (
              <>
                <span style={{ color: 'rgba(255,255,255,0.4)' }}>|</span>
                <a href="#admin-login" style={{ color: '#2EE59D', textDecoration: 'none', fontWeight: '700' }}>Official Sign-In (विभागीय लॉगिन)</a>
              </>
            )}
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
