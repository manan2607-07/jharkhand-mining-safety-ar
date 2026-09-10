import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { AshokaLionCapital, JharkhandGovSeal } from '../../components/Emblem';
import { 
  Shield, 
  Lock, 
  User, 
  ArrowRight, 
  Building2, 
  Scale, 
  BarChart3, 
  RefreshCw, 
  AlertCircle,
  KeyRound,
  CheckCircle2,
  Globe
} from 'lucide-react';

export default function AdminLoginPage({ onLoginSuccess }) {
  const { loginAdmin } = useAuth();
  const { language, setLanguage, t } = useLanguage();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  const [captchaCode, setCaptchaCode] = useState(() => {
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    let code = '';
    for (let i = 0; i < 5; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const generateCaptcha = () => {
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    let code = '';
    for (let i = 0; i < 5; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaCode(code);
    setCaptchaInput('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (captchaInput.trim().toUpperCase() !== captchaCode.trim().toUpperCase()) {
      setErrorMsg(t.captchaFailedMsg || 'Security CAPTCHA verification failed. Please enter the characters shown.');
      return;
    }

    setLoading(true);
    const res = await loginAdmin({ username: username.trim(), password });
    setLoading(false);

    if (res.success) {
      if (onLoginSuccess) onLoginSuccess(res.admin);
    } else {
      setErrorMsg(res.error || t.adminInvalidCredsMsg || 'Invalid credentials or unauthorized authority access.');
    }
  };

  return (
    <div style={{
      minHeight: '85vh',
      backgroundColor: '#073556',
      backgroundImage: 'radial-gradient(circle at 50% 20%, #0c4e7e 0%, #073556 100%)',
      padding: '2.5rem 1rem',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      {/* Top Language Bar */}
      <div style={{
        maxWidth: '1000px',
        width: '100%',
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        marginBottom: '1rem',
        gap: '0.5rem'
      }}>
        <Globe size={14} color="#2EE59D" />
        <span style={{ fontSize: '0.78rem', color: '#E2E8F0', fontWeight: '600' }}>
          {t.selectLanguage}:
        </span>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          style={{
            padding: '0.2rem 0.6rem',
            borderRadius: '4px',
            border: '1px solid rgba(255,255,255,0.2)',
            background: '#1b2733',
            color: '#FFFFFF',
            fontWeight: '700',
            fontSize: '0.78rem',
            cursor: 'pointer'
          }}
        >
          <option value="en">English</option>
          <option value="hi">हिन्दी</option>
          <option value="sat">ᱥᱟᱱᱛᱟᱲᱤ</option>
        </select>
      </div>

      <div style={{
        maxWidth: '1000px',
        width: '100%',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
        gap: '2rem',
        alignItems: 'stretch'
      }}>
        {/* Left Side: Regulatory Notice & Statutory Directives */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.06)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          borderRadius: '6px',
          padding: '2.25rem',
          color: '#FFFFFF',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
              <img
                src="/admin-app-logo.png"
                alt="Khan Suraksha Admin App Logo"
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '14px',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.35)',
                  border: '1.5px solid rgba(255,255,255,0.25)',
                  flexShrink: 0
                }}
              />
              <div>
                <div style={{ fontSize: '0.7rem', fontWeight: '800', color: '#2EE59D', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  {t.sihTitle}
                </div>
                <div style={{ fontSize: '1.15rem', fontWeight: '800', fontFamily: "'Roboto Slab', serif", color: '#FFFFFF', lineHeight: 1.25 }}>
                  {t.adminLoginHeader}
                </div>
                <div style={{ fontSize: '0.76rem', color: '#CBD5E1', marginTop: '0.15rem' }}>
                  {t.adminLoginSubheader}
                </div>
              </div>
            </div>

            <div style={{
              background: 'rgba(46, 229, 157, 0.1)',
              border: '1px solid rgba(46, 229, 157, 0.3)',
              borderRadius: '4px',
              padding: '0.85rem',
              marginBottom: '1.5rem',
              fontSize: '0.8rem',
              lineHeight: 1.5,
              color: '#E2E8F0'
            }}>
              <strong style={{ color: '#2EE59D' }}>{t.statutoryNoticeLabel}:</strong><br />
              {t.adminRegulatoryNotice}
            </div>

            {/* Official Statutory Roles */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <Building2 size={20} color="#2EE59D" style={{ marginTop: '0.15rem', flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: '700', color: '#FFFFFF' }}>
                    {t.roleSafetyOfficerTitle}
                  </div>
                  <div style={{ fontSize: '0.74rem', color: '#94A3B8', lineHeight: 1.4 }}>
                    {t.roleSafetyOfficerDesc}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <Scale size={20} color="#2EE59D" style={{ marginTop: '0.15rem', flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: '700', color: '#FFFFFF' }}>
                    {t.roleDgmsTitle}
                  </div>
                  <div style={{ fontSize: '0.74rem', color: '#94A3B8', lineHeight: 1.4 }}>
                    {t.roleDgmsDesc}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <BarChart3 size={20} color="#2EE59D" style={{ marginTop: '0.15rem', flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: '700', color: '#FFFFFF' }}>
                    {t.roleStateTitle}
                  </div>
                  <div style={{ fontSize: '0.74rem', color: '#94A3B8', lineHeight: 1.4 }}>
                    {t.roleStateDesc}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '1.75rem', fontSize: '0.72rem', color: '#94A3B8', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '0.75rem' }}>
            {t.adminDemoCredsNotice}
          </div>
        </div>

        {/* Right Side: Official Login Card */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '6px',
          padding: '2.5rem',
          boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: '#0c4e7e',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 0.75rem auto'
            }}>
              <Shield size={28} />
            </div>

            <h2 style={{
              fontSize: '1.35rem',
              fontWeight: '800',
              color: '#0c4e7e',
              fontFamily: "'Roboto Slab', serif",
              margin: '0.2rem 0'
            }}>
              {t.adminLoginBtn}
            </h2>
            <p style={{ fontSize: '0.82rem', color: '#64748B', margin: 0 }}>
              {t.adminLoginSubheader}
            </p>
          </div>

          {errorMsg && (
            <div style={{
              background: '#FDF2F2',
              border: '1px solid #F8B4B4',
              color: '#9B1C1C',
              padding: '0.75rem',
              borderRadius: '4px',
              marginBottom: '1.25rem',
              fontSize: '0.82rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <AlertCircle size={18} />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#334155', marginBottom: '0.35rem' }}>
                {t.adminRoleLabel}:
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={t.adminRolePlaceholder}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.75rem 0.65rem 2.4rem',
                    border: '1px solid #CBD5E1',
                    borderRadius: '4px',
                    fontSize: '0.92rem',
                    fontWeight: '600',
                    color: '#0c4e7e',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
                <User size={18} color="#64748B" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
              </div>
              <span style={{ fontSize: '0.72rem', color: '#64748B', display: 'block', marginTop: '0.25rem' }}>
                {t.adminRoleHintPrefix} <strong>officer1</strong>, <strong>dgms_inspector</strong>, {t.orWord} <strong>state_nodal</strong>
              </span>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#334155', marginBottom: '0.35rem' }}>
                {t.adminPassLabel}:
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t.adminPassPlaceholder}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.75rem 0.65rem 2.4rem',
                    border: '1px solid #CBD5E1',
                    borderRadius: '4px',
                    fontSize: '0.92rem',
                    fontWeight: '600',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
                <Lock size={18} color="#64748B" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
              </div>
              <span style={{ fontSize: '0.72rem', color: '#64748B', display: 'block', marginTop: '0.25rem' }}>
                {t.defaultPasswordLabel} <strong>password123</strong>
              </span>
            </div>

            {/* Security CAPTCHA verification */}
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#334155', marginBottom: '0.35rem' }}>
                {t.captchaLabel}:
              </label>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <input
                  type="text"
                  required
                  value={captchaInput}
                  onChange={(e) => setCaptchaInput(e.target.value)}
                  placeholder={t.captchaPlaceholder}
                  style={{
                    flex: 1,
                    padding: '0.65rem 0.75rem',
                    border: '1px solid #CBD5E1',
                    borderRadius: '4px',
                    fontSize: '0.95rem',
                    fontWeight: '700',
                    letterSpacing: '0.1em',
                    boxSizing: 'border-box'
                  }}
                />

                <div style={{
                  background: '#1b2733',
                  color: '#2EE59D',
                  padding: '0.65rem 1rem',
                  borderRadius: '4px',
                  fontFamily: 'monospace',
                  fontSize: '1.1rem',
                  fontWeight: '800',
                  letterSpacing: '0.25em',
                  userSelect: 'none'
                }}>
                  {captchaCode}
                </div>

                <button
                  type="button"
                  onClick={generateCaptcha}
                  title={t.refreshCaptchaTitle || "Generate new CAPTCHA"}
                  style={{
                    background: '#F1F5F9',
                    border: '1px solid #CBD5E1',
                    borderRadius: '4px',
                    padding: '0.65rem',
                    cursor: 'pointer'
                  }}
                >
                  <RefreshCw size={16} color="#0c4e7e" />
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="gov-btn-primary"
              style={{
                width: '100%',
                padding: '0.75rem',
                fontSize: '0.95rem',
                fontWeight: '800',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                marginTop: '0.5rem'
              }}
            >
              <span>{loading ? t.adminLoggingIn : t.adminLoginBtn}</span>
              <ArrowRight size={18} />
            </button>
          </form>

          <div style={{
            marginTop: '1.5rem',
            padding: '0.65rem',
            background: '#F8FAFC',
            borderRadius: '4px',
            border: '1px solid #E2E8F0',
            fontSize: '0.72rem',
            color: '#64748B',
            textAlign: 'center'
          }}>
            🛡️ {t.statutoryComplianceNotice}
          </div>
        </div>
      </div>
    </div>
  );
}
