import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useOfflineSync } from '../context/OfflineSyncContext';
import { AshokaLionCapital, JharkhandGovSeal } from './Emblem';
import { 
  Volume2, 
  VolumeX, 
  Globe, 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  HardHat, 
  Building2, 
  Scale, 
  BarChart3,
  CheckCircle2,
  UserCheck,
  Eye,
  Type,
  Monitor,
  Phone,
  Mail,
  Award,
  Shield,
  ArrowRight,
  ArrowLeft,
  LogOut
} from 'lucide-react';

export default function Navbar({
  portalMode = 'worker',
  setPortalMode,
  adminTab = 'officer',
  setAdminTab,
  workerSection = 'modules',
  setWorkerSection
}) {
  const { language, setLanguage, t, audioEnabled, setAudioEnabled, isSpeaking } = useLanguage();
  const { currentRole, switchRole, currentUser, workerUser, adminUser, logoutWorker, logoutAdmin, ROLES } = useAuth();
  const { isOnline, pendingSyncCount, isSyncing, triggerSync } = useOfflineSync();

  // Accessibility States (GIGW Mandated)
  const [fontSize, setFontSize] = useState('normal'); // 'small' | 'normal' | 'large'

  // Apply Font Size Scaling
  const handleFontSizeChange = (size) => {
    setFontSize(size);
    document.documentElement.setAttribute('data-font-size', size);
    localStorage.setItem('jh_gov_font_size', size);
  };

  useEffect(() => {
    const savedSize = localStorage.getItem('jh_gov_font_size') || 'normal';
    setFontSize(savedSize);
    document.documentElement.setAttribute('data-font-size', savedSize);

    // Maintain standard clean government portal theme
    document.body.classList.remove('high-contrast');
    localStorage.removeItem('jh_gov_high_contrast');
  }, []);

  // Statutory Authority Role is strictly fixed to authenticated official (No role switching permitted)

  // Worker navigation items
  const workerNavTabs = [
    { 
      id: 'modules', 
      label: t.tabModules, 
      icon: HardHat 
    },
    { 
      id: 'certificates', 
      label: t.tabCertificates, 
      icon: Award 
    },
    { 
      id: 'profile', 
      label: t.tabProfile, 
      icon: UserCheck 
    }
  ];

  // Admin navigation items
  const adminNavTabs = [
    { 
      id: 'officer', 
      label: t.tabOfficer, 
      icon: Building2, 
      role: 'SAFETY_OFFICER' 
    },
    { 
      id: 'dgms', 
      label: t.tabDgms, 
      icon: Scale, 
      role: 'DGMS_INSPECTOR' 
    },
    { 
      id: 'state', 
      label: t.tabState, 
      icon: BarChart3, 
      role: 'STATE_NODAL_OFFICER' 
    }
  ];

  const getTabLabel = (tab) => tab.label;

  return (
    <header className="no-print" style={{ position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 2px 4px rgba(0,0,0,0.06)' }}>
      {/* Smart India Hackathon 2026 Academic & Research Prototype Safe Harbor Banner */}
      <div style={{
        background: '#FFFBEB',
        borderBottom: '1px solid #FCD34D',
        color: '#92400E',
        padding: '0.35rem 1.25rem',
        fontSize: '0.74rem',
        fontWeight: '600',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        gap: '0.5rem',
        flexWrap: 'wrap'
      }}>
        <span style={{
          background: '#D97706',
          color: '#FFFFFF',
          padding: '0.1rem 0.45rem',
          borderRadius: '3px',
          fontSize: '0.66rem',
          fontWeight: '800',
          letterSpacing: '0.04em',
          textTransform: 'uppercase'
        }}>
          {t.sihAcademicBadge}
        </span>
        <span>
          {t.sihDisclaimer}
        </span>
      </div>

      {/* Skip to Main Content Link (GIGW Accessibility) */}
      <a href="#main-content" className="skip-to-content">
        {t.skipToContent}
      </a>

      {/* 1. Indian National Tricolour Top Accent Strip */}
      <div className="tricolour-bar" aria-hidden="true">
        <div className="saffron"></div>
        <div className="white"></div>
        <div className="green"></div>
      </div>

      {/* 2. Official Jharkhand State Portal Top Utility Bar (jharkhand.gov.in/mines style) */}
      <div style={{
        background: '#1b2733',
        borderBottom: '1px solid #101820',
        fontSize: '0.74rem',
        color: '#E2E8F0',
        padding: '0.35rem 1.25rem'
      }}>
        <div style={{
          maxWidth: '1440px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.5rem'
        }}>
          {/* Left: Screen Reader, SIH Helpdesk, Demo Assistance */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <a
              href="#main-content"
              style={{
                color: '#FFFFFF',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                textDecoration: 'none',
                fontWeight: '500'
              }}
              title={t.screenReader}
            >
              <Monitor size={12} color="#2EE59D" />
              <span>{t.screenReader}</span>
            </a>

            <span style={{ color: '#4B5563' }}>|</span>

            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: '#FFFFFF', fontWeight: '600' }}>
              <Phone size={12} color="#2EE59D" />
              <span>{t.sihHelpdesk}</span>
            </span>

            <span style={{ color: '#4B5563' }}>|</span>

            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: '#CBD5E1' }}>
              <Mail size={12} color="#2EE59D" />
              <span>sih2026.prototype<span style={{ color: '#2EE59D' }}>[at]</span>demo<span style={{ color: '#2EE59D' }}>[dot]</span>internal</span>
            </span>
          </div>

          {/* Right Utilities: Font Size (+A A -A), High Contrast (White/Black A), Sound, Sync, Language */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            {/* Font Size Adjuster (+A A -A) as seen on jharkhand.gov.in */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', borderRight: '1px solid #374151', paddingRight: '0.65rem' }}>
              <button
                type="button"
                onClick={() => handleFontSizeChange('large')}
                title="Increase Font Size (+A)"
                aria-label="Increase Font Size"
                style={{
                  background: fontSize === 'large' ? '#2EE59D' : 'transparent',
                  color: fontSize === 'large' ? '#000000' : '#FFFFFF',
                  border: 'none',
                  fontWeight: '700',
                  fontSize: '0.75rem',
                  padding: '0.1rem 0.35rem',
                  cursor: 'pointer',
                  borderRadius: '2px'
                }}
              >
                +A
              </button>
              <button
                type="button"
                onClick={() => handleFontSizeChange('normal')}
                title="Normal Font Size (A)"
                aria-label="Reset Font Size"
                style={{
                  background: fontSize === 'normal' ? '#2EE59D' : 'transparent',
                  color: fontSize === 'normal' ? '#000000' : '#FFFFFF',
                  border: 'none',
                  fontWeight: '700',
                  fontSize: '0.75rem',
                  padding: '0.1rem 0.35rem',
                  cursor: 'pointer',
                  borderRadius: '2px'
                }}
              >
                A
              </button>
              <button
                type="button"
                onClick={() => handleFontSizeChange('small')}
                title="Decrease Font Size (-A)"
                aria-label="Decrease Font Size"
                style={{
                  background: fontSize === 'small' ? '#2EE59D' : 'transparent',
                  color: fontSize === 'small' ? '#000000' : '#FFFFFF',
                  border: 'none',
                  fontWeight: '700',
                  fontSize: '0.75rem',
                  padding: '0.1rem 0.35rem',
                  cursor: 'pointer',
                  borderRadius: '2px'
                }}
              >
                -A
              </button>
            </div>

            {/* Multilingual Voiceover Toggle */}
            <button
              type="button"
              onClick={() => setAudioEnabled(!audioEnabled)}
              title={audioEnabled ? "Speech synthesis active" : "Speech narration muted"}
              aria-label="Toggle Speech Synthesis Narration"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
                padding: '0.2rem 0.5rem',
                fontSize: '0.72rem',
                fontWeight: '600',
                background: audioEnabled ? '#EAF5EC' : '#283747',
                color: audioEnabled ? '#1E7B34' : '#E2E8F0',
                border: audioEnabled ? '1px solid #2EE59D' : '1px solid #4B5563',
                borderRadius: '2px',
                cursor: 'pointer'
              }}
            >
              {audioEnabled ? <Volume2 size={12} color="#1E7B34" /> : <VolumeX size={12} />}
              <span>{audioEnabled ? (isSpeaking ? t.speaking : t.soundOn) : t.soundOff}</span>
            </button>

            {/* Offline Sync Status Indicator */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.15rem 0.5rem',
              borderRadius: '2px',
              border: isOnline ? '1px solid #2EE59D' : '1px solid #F59E0B',
              background: isOnline ? 'rgba(46, 229, 157, 0.15)' : 'rgba(245, 158, 11, 0.15)',
              color: isOnline ? '#2EE59D' : '#F59E0B',
              fontSize: '0.72rem',
              fontWeight: '600'
            }}>
              {isOnline ? <Wifi size={11} /> : <WifiOff size={11} />}
              <span>{isOnline ? t.cloudSynced : `${t.offlineCount} (${pendingSyncCount})`}</span>
              {pendingSyncCount > 0 && isOnline && (
                <button
                  onClick={triggerSync}
                  disabled={isSyncing}
                  style={{
                    marginLeft: '0.25rem',
                    background: '#2EE59D',
                    color: '#000000',
                    border: 'none',
                    borderRadius: '2px',
                    padding: '0.1rem 0.35rem',
                    cursor: 'pointer',
                    fontSize: '0.65rem',
                    fontWeight: '700'
                  }}
                >
                  {isSyncing ? '...' : t.syncNow}
                </button>
              )}
            </div>

            {/* Language Selector Dropdown (EN / HI / SAT) */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
              <Globe size={13} color="#2EE59D" />
              <select
                id="portal-language-selector"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                aria-label={t.selectLanguage}
                style={{
                  padding: '0.2rem 0.45rem',
                  borderRadius: '2px',
                  border: '1px solid #4B5563',
                  background: '#22313F',
                  color: '#FFFFFF',
                  fontWeight: '700',
                  fontSize: '0.74rem',
                  cursor: 'pointer',
                  outline: 'none'
                }}
              >
                <option value="en">English</option>
                <option value="hi">हिन्दी</option>
                <option value="sat">ᱥᱟᱱᱛᱟᱲᱤ</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Official Department Header (Branding & Logo Lockup from jharkhand.gov.in/mines) */}
      <div style={{
        background: '#FFFFFF',
        padding: '0.75rem 1.25rem'
      }}>
        <div style={{
          maxWidth: '1440px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          {/* Logo & Department Branding */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <img
                src={portalMode === 'admin' ? '/admin-app-logo.png' : '/app-logo.png'}
                alt={portalMode === 'admin' ? 'Khan Suraksha Admin App Logo' : 'Khan Suraksha App Logo'}
                style={{ width: '50px', height: '50px', borderRadius: '10px', boxShadow: '0 2px 6px rgba(0,0,0,0.12)' }}
              />
              <JharkhandGovSeal size={48} />
            </div>

            <div style={{ borderLeft: '1px solid #CBD5E1', paddingLeft: '1rem' }}>
              <div style={{
                fontSize: '0.76rem',
                fontWeight: '800',
                color: '#0c4e7e',
                letterSpacing: '0.04em',
                fontFamily: "'Roboto Slab', serif",
                textTransform: 'uppercase'
              }}>
                {t.sihTitle}
              </div>

              {portalMode === 'worker' ? (
                <h1 style={{
                  fontSize: '1.22rem',
                  fontWeight: '800',
                  color: '#0c4e7e',
                  margin: '0.15rem 0',
                  lineHeight: 1.25,
                  fontFamily: "'Roboto Slab', 'Noto Sans Devanagari', serif"
                }}>
                  {t.workerLoginHeader}
                </h1>
              ) : (
                <h1 style={{
                  fontSize: '1.22rem',
                  fontWeight: '800',
                  color: '#0c4e7e',
                  margin: '0.15rem 0',
                  lineHeight: 1.25,
                  fontFamily: "'Roboto Slab', 'Noto Sans Devanagari', serif"
                }}>
                  {t.adminLoginHeader}
                </h1>
              )}

              <div style={{
                fontSize: '0.74rem',
                color: '#475569',
                fontWeight: '600',
                margin: '0.1rem 0 0.35rem 0',
                fontFamily: "'Open Sans', sans-serif"
              }}>
                {portalMode === 'worker' ? (
                  t.workerLoginSubheader
                ) : (
                  t.adminLoginSubheader
                )}
              </div>

              <div style={{
                fontSize: '0.76rem',
                color: '#555555',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                flexWrap: 'wrap',
                fontFamily: "'Open Sans', sans-serif"
              }}>
                <span style={{
                  background: '#EBF3FC',
                  color: '#0c4e7e',
                  border: '1px solid #B4D3F7',
                  padding: '0.1rem 0.4rem',
                  borderRadius: '3px',
                  fontWeight: '700',
                  fontSize: '0.68rem'
                }}>
                  {t.sihAcademicBadge}
                </span>
                <span>•</span>
                <span style={{ color: '#0c4e7e', fontWeight: '700' }}>
                  {portalMode === 'worker' ? t.workerWorkspace : t.adminWorkspace}
                </span>
              </div>
            </div>
          </div>

          {/* Right Header: Dedicated Mode Switcher & Profiles */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
            {portalMode === 'worker' ? (
              <>
                {/* Active Worker Profile Chip */}
                <div style={{
                  border: '1px solid #CBD5E1',
                  background: '#F8FAFC',
                  borderRadius: '4px',
                  padding: '0.35rem 0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.65rem'
                }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '3px',
                    background: '#0c4e7e',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <HardHat size={18} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.68rem', color: '#64748B', textTransform: 'uppercase', fontWeight: '700' }}>
                      {t.activeMinerBadge}:
                    </div>
                    <div style={{ fontSize: '0.82rem', fontWeight: '700', color: '#0c4e7e', fontFamily: "'Roboto Slab', serif" }}>
                      {workerUser?.name || 'Birsa Hansda'} ({workerUser?.workerCode || 'JH-WRK-001'})
                    </div>
                  </div>
                </div>

                {/* Frontline Worker Sign Out Button (Zero Mention of Admin Portal) */}
                <button
                  type="button"
                  onClick={() => {
                    logoutWorker();
                    window.location.hash = '#worker-login';
                  }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    padding: '0.45rem 0.85rem',
                    background: '#FDF2F2',
                    color: '#9B1C1C',
                    border: '1px solid #F8B4B4',
                    borderRadius: '4px',
                    fontWeight: '700',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  title={t.logOut}
                >
                  <LogOut size={15} color="#9B1C1C" />
                  <span>{t.logOut}</span>
                </button>
              </>
            ) : (
              <>
                {/* Authenticated Authority Official Profile Chip (Strictly Single Profile - Zero Dropdown/Switcher) */}
                <div style={{
                  border: '1px solid #CBD5E1',
                  background: '#F8FAFC',
                  borderRadius: '4px',
                  padding: '0.35rem 0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.65rem'
                }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '3px',
                    background: '#0c4e7e',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Shield size={18} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.68rem', color: '#64748B', textTransform: 'uppercase', fontWeight: '700' }}>
                      {t.activeAdminBadge}:
                    </div>
                    <div style={{
                      fontSize: '0.82rem',
                      fontWeight: '700',
                      color: '#0c4e7e',
                      fontFamily: "'Roboto Slab', serif"
                    }}>
                      {adminUser?.fullName || adminUser?.name || 'Accredited Official'}
                      <span style={{ fontSize: '0.74rem', color: '#475569', fontWeight: '600', marginLeft: '0.4rem' }}>
                        ({adminUser?.role === 'SAFETY_OFFICER' ? t.roleSafetyOfficerTitle : adminUser?.role === 'DGMS_INSPECTOR' ? t.roleDgmsTitle : t.roleStateTitle})
                      </span>
                    </div>
                  </div>
                </div>

                {/* Administrative Authority Sign Out Button */}
                <button
                  type="button"
                  onClick={() => {
                    logoutAdmin();
                    window.location.hash = '#admin-login';
                  }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    padding: '0.45rem 0.85rem',
                    background: '#FDF2F2',
                    color: '#9B1C1C',
                    border: '1px solid #F8B4B4',
                    borderRadius: '4px',
                    fontWeight: '700',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  title={t.logOut}
                >
                  <LogOut size={15} color="#9B1C1C" />
                  <span>{t.logOut}</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Signature Jharkhand Accent Border Line (.menuline from jharkhand.gov.in) */}
      <div className="menuline" aria-hidden="true" />

      {/* 4. Official Department Navigation Bar (jharkhand.gov.in/mines nav) */}
      <nav style={{
        background: '#0c4e7e',
        borderBottom: '2px solid #073556'
      }} aria-label="Department Navigation">
        <div style={{
          maxWidth: '1440px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          overflowX: 'auto',
          padding: '0 0.75rem'
        }}>
          {/* Main Portal Navigation Tabs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            {portalMode === 'worker' ? (
              workerNavTabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = workerSection === tab.id;

                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setWorkerSection(tab.id);
                      window.location.hash = `#worker/${tab.id}`;
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.45rem',
                      padding: '0.7rem 1.15rem',
                      background: isActive ? '#073556' : 'transparent',
                      color: '#FFFFFF',
                      fontSize: '0.88rem',
                      fontWeight: isActive ? '700' : '600',
                      fontFamily: "'Roboto Slab', serif",
                      border: 'none',
                      borderBottom: isActive ? '3px solid #2EE59D' : '3px solid transparent',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      transition: 'background-color 0.15s ease, border-color 0.15s ease'
                    }}
                    className={language === 'sat' ? 'font-ol-chiki' : ''}
                  >
                    <Icon size={16} color={isActive ? '#2EE59D' : '#CBD5E1'} />
                    <span>{getTabLabel(tab)}</span>
                  </button>
                );
              })
            ) : (
              adminNavTabs
                .filter(tab => !adminUser || tab.role === adminUser.role)
                .map((tab) => {
                  const Icon = tab.icon;
                  const isActive = adminTab === tab.id;

                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setAdminTab(tab.id);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.45rem',
                        padding: '0.7rem 1.15rem',
                        background: isActive ? '#073556' : 'transparent',
                        color: '#FFFFFF',
                        fontSize: '0.88rem',
                        fontWeight: isActive ? '700' : '600',
                        fontFamily: "'Roboto Slab', serif",
                        border: 'none',
                        borderBottom: isActive ? '3px solid #2EE59D' : '3px solid transparent',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        transition: 'background-color 0.15s ease, border-color 0.15s ease'
                      }}
                      className={language === 'sat' ? 'font-ol-chiki' : ''}
                    >
                      <Icon size={16} color={isActive ? '#2EE59D' : '#CBD5E1'} />
                      <span>{getTabLabel(tab)}</span>
                    </button>
                  );
                })
            )}
          </div>

          {/* Right Side Quick Statutory Badges */}
          <div style={{ display: 'none', alignItems: 'center', gap: '0.5rem' }} className="d-lg-flex">
            {portalMode === 'worker' ? (
              <span style={{
                fontSize: '0.74rem',
                color: '#2EE59D',
                background: 'rgba(46, 229, 157, 0.15)',
                border: '1px solid #2EE59D',
                fontWeight: '700',
                padding: '0.25rem 0.65rem',
                borderRadius: '3px',
                fontFamily: "'Roboto Slab', serif",
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#2EE59D', display: 'inline-block' }}></span>
                {t.portalWorker}
              </span>
            ) : (
              <>
                <span style={{
                  fontSize: '0.74rem',
                  color: '#E2E8F0',
                  background: 'rgba(255, 255, 255, 0.12)',
                  padding: '0.25rem 0.6rem',
                  borderRadius: '3px',
                  fontFamily: "'Roboto Slab', serif"
                }}>
                  Acts & Rules | 42
                </span>
                <span style={{
                  fontSize: '0.74rem',
                  color: '#000000',
                  background: '#2EE59D',
                  fontWeight: '700',
                  padding: '0.25rem 0.6rem',
                  borderRadius: '3px',
                  fontFamily: "'Roboto Slab', serif"
                }}>
                  DMFT / PMKKKY
                </span>
              </>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}
