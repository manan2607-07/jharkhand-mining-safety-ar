import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
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
  CheckCircle2
} from 'lucide-react';

export default function AdminLoginPage({ onLoginSuccess }) {
  const { loginAdmin } = useAuth();

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
      setErrorMsg('Security CAPTCHA verification failed. Please enter the characters shown.');
      return;
    }

    setLoading(true);
    const res = await loginAdmin({ username: username.trim(), password });
    setLoading(false);

    if (res.success) {
      if (onLoginSuccess) onLoginSuccess(res.admin);
    } else {
      setErrorMsg(res.error || 'Invalid credentials or unauthorized authority access.');
    }
  };

  return (
    <div style={{
      minHeight: '85vh',
      backgroundColor: '#073556',
      backgroundImage: 'radial-gradient(circle at 50% 20%, #0c4e7e 0%, #073556 100%)',
      padding: '2.5rem 1rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        maxWidth: '1000px',
        width: '100%',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
        gap: '2rem',
        alignItems: 'stretch'
      }}>
        {/* Left Side: Regulatory Notice & Statutory Directives (Zero Admin Profile Leakage) */}
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1.25rem' }}>
              <div style={{ background: '#FFFFFF', padding: '0.35rem', borderRadius: '4px', display: 'flex' }}>
                <JharkhandGovSeal size={46} />
              </div>
              <AshokaLionCapital size={44} color="#FFFFFF" showMotto={false} />
              <div>
                <div style={{ fontSize: '0.7rem', fontWeight: '700', color: '#2EE59D', letterSpacing: '0.05em' }}>
                  E-GOVERNANCE SECURE SSO
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: '800', fontFamily: "'Roboto Slab', serif" }}>
                  Regulatory Authority Console
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
              <strong style={{ color: '#2EE59D' }}>Statutory Access Restriction:</strong><br />
              This gateway is restricted strictly to accredited Site Safety Officers, DGMS Statutory Inspectors, and State Nodal Directors under Section 38 of the Mines Act, 1952.
            </div>

            {/* Official Statutory Directives */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <Shield size={20} color="#2EE59D" style={{ marginTop: '0.15rem', flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: '700', color: '#FFFFFF' }}>
                    Role-Isolated Authority Sessions
                  </div>
                  <div style={{ fontSize: '0.74rem', color: '#94A3B8', lineHeight: 1.4 }}>
                    Upon authentication, your console is strictly confined to your accredited statutory jurisdiction. Cross-role impersonation or visibility into other administrative accounts is strictly prohibited.
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <KeyRound size={20} color="#2EE59D" style={{ marginTop: '0.15rem', flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: '700', color: '#FFFFFF' }}>
                    Statutory Audit & Forensic Trail
                  </div>
                  <div style={{ fontSize: '0.74rem', color: '#94A3B8', lineHeight: 1.4 }}>
                    All logins, workforce certifications, and regulatory ledger verifications are immutably signed and timestamped per DGMS safety circulars.
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <CheckCircle2 size={20} color="#2EE59D" style={{ marginTop: '0.15rem', flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: '700', color: '#FFFFFF' }}>
                    Statutory Credentials Assistance
                  </div>
                  <div style={{ fontSize: '0.74rem', color: '#94A3B8', lineHeight: 1.4 }}>
                    Official credentials are provided through the DGMS Dhanbad Headquarters or Dept. of Mines & Geology, Govt. of Jharkhand.
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '1.75rem', fontSize: '0.72rem', color: '#94A3B8', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '0.75rem' }}>
            Smart India Hackathon 2026 • Academic Technical Demonstration (PS ID: 26041)
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
              प्राधिकरण साइन-इन (Official Sign-In)
            </h2>
            <p style={{ fontSize: '0.82rem', color: '#64748B', margin: 0 }}>
              Access Safety Officer, DGMS, or State Nodal Console
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
                विभागीय उपयोगकर्ता नाम (Official Username):
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. officer1, dgms_inspector, state_nodal"
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
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#334155', marginBottom: '0.35rem' }}>
                पासवर्ड (Statutory Password):
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="e.g. password123"
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
            </div>

            {/* Security CAPTCHA verification */}
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#334155', marginBottom: '0.35rem' }}>
                सुरक्षा सत्यापन कोड (Security Verification Code):
              </label>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <input
                  type="text"
                  required
                  value={captchaInput}
                  onChange={(e) => setCaptchaInput(e.target.value)}
                  placeholder="Enter Code"
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
                  title="Generate new CAPTCHA"
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
              <span>{loading ? 'सत्यापित हो रहा है...' : 'प्राधिकरण कंसोल में प्रवेश करें (Sign In)'}</span>
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
            🛡️ Official DGMS & Jharkhand Mines Audit Log Tracking Enabled.
          </div>
        </div>
      </div>
    </div>
  );
}
