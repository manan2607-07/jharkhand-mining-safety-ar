import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { JharkhandGovSeal, AshokaLionCapital } from '../../components/Emblem';
import { 
  HardHat, 
  Phone, 
  KeyRound, 
  ArrowRight, 
  Volume2, 
  Globe, 
  CheckCircle2, 
  AlertCircle,
  ShieldCheck,
  Sparkles
} from 'lucide-react';

export default function WorkerLoginPage({ onLoginSuccess }) {
  const { language, setLanguage, t, speak } = useLanguage();
  const { loginWorker } = useAuth();

  const [identifier, setIdentifier] = useState('JH-WRK-001');
  const [pin, setPin] = useState('1234');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const demoMiners = [
    {
      name: 'Birsa Hansda',
      code: 'JH-WRK-001',
      phone: '+91 94311 20401',
      desig: 'Underground Driller',
      site: 'BCCL Jharia Colliery #4',
      sector: 'COAL'
    },
    {
      name: 'Shibu Soren',
      code: 'JH-WRK-002',
      phone: '+91 94311 20402',
      desig: 'Loader Operator',
      site: 'BCCL Jharia Colliery #4',
      sector: 'COAL'
    },
    {
      name: 'Champa Marandi',
      code: 'JH-WRK-004',
      phone: '+91 94311 20404',
      desig: 'Mica Sorter',
      site: 'Koderma Mica Processing Zone',
      sector: 'MICA'
    },
    {
      name: 'Raju Mahato',
      code: 'JH-WRK-005',
      phone: '+91 94311 20405',
      desig: 'Blast Furnace Assistant',
      site: 'SAIL Bokaro Steel Plant',
      sector: 'STEEL'
    }
  ];

  const handleVoicePrompt = () => {
    if (language === 'sat') {
      speak('ᱠᱟᱹᱢᱤᱭᱟᱹ ᱨᱩᱠᱷᱤᱭᱟᱹ ᱥᱮᱪᱮᱫ ᱯᱚᱨᱴᱟᱞ ᱨᱮ ᱥᱟᱹᱜᱩᱱ ᱫᱟᱨᱟᱢ᱾ ᱟᱢᱟᱜ ᱠᱟᱹᱢᱤᱭᱟᱹ ᱠᱳᱰ ᱟᱨ ᱯᱤᱱ ᱮᱢ ᱠᱟᱛᱮ ᱵᱚᱞᱚᱱ ᱢᱮ᱾');
    } else if (language === 'hi') {
      speak('कामगार ई-सुरक्षा प्रशिक्षण पोर्टल में आपका स्वागत है। अपना कामगार कोड अथवा मोबाइल नंबर और पिन दर्ज करके प्रवेश करें।');
    } else {
      speak('Welcome to the Frontline Worker Safety Training Portal. Please enter your Workforce ID or registered mobile number to proceed.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    const res = await loginWorker({ workerCode: identifier, pin });
    setLoading(false);

    if (res.success) {
      if (onLoginSuccess) onLoginSuccess(res.worker);
    } else {
      setErrorMsg(res.error || 'Login failed. Please check your credentials.');
    }
  };

  const handleSelectDemoMiner = (miner) => {
    setIdentifier(miner.code);
    setPin('1234');
    setErrorMsg('');
  };

  return (
    <div style={{
      minHeight: '85vh',
      backgroundColor: 'var(--bg-primary)',
      padding: '2rem 1rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        maxWidth: '960px',
        width: '100%',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '2rem',
        alignItems: 'stretch'
      }}>
        {/* Left Side: Worker Context, Instructions & Language Assistance */}
        <div className="gov-card" style={{
          padding: '2rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          borderLeft: '5px solid #0c4e7e',
          background: '#FFFFFF'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
              <img
                src="/app-logo.png"
                alt="Khan Suraksha Official Mobile App Logo"
                style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  flexShrink: 0
                }}
              />
              <div>
                <div style={{
                  fontSize: '0.72rem',
                  fontWeight: '800',
                  color: '#0c4e7e',
                  letterSpacing: '0.04em',
                  fontFamily: "'Roboto Slab', serif",
                  textTransform: 'uppercase'
                }}>
                  Smart India Hackathon 2026 • PS ID: 26041
                </div>
                <h1 style={{
                  fontSize: '1.25rem',
                  fontWeight: '800',
                  color: '#0c4e7e',
                  margin: '0.1rem 0',
                  fontFamily: "'Roboto Slab', 'Noto Sans Devanagari', serif",
                  lineHeight: 1.3
                }}>
                  खान सुरक्षा प्रशिक्षण पोर्टल
                </h1>
                <div style={{ fontSize: '0.8rem', color: '#475569', fontWeight: '600' }}>
                  Frontline Worker AR Vocational Safety Portal
                </div>
              </div>
            </div>

            <div style={{
              background: '#EBF3FC',
              border: '1px solid #B4D3F7',
              borderRadius: '4px',
              padding: '0.85rem',
              marginBottom: '1.5rem',
              fontSize: '0.82rem',
              color: '#0c4e7e',
              lineHeight: 1.5
            }}>
              <strong>कामगार निर्देश / Worker Guidance:</strong><br />
              यह पोर्टल खदान एवं उद्योग कामगारों के लिए व्यवहारिक AR सुरक्षा सिमुलेशन (अग्निशामक PASS तकनीक एवं गैस रिसाव) एवं DGMS डिजिटल सुरक्षा पासपोर्ट प्रदान करता है।
            </div>

            {/* Language Selection & Voiceover Assistance */}
            <div style={{
              background: '#F8FAFC',
              border: '1px solid #CBD5E1',
              borderRadius: '4px',
              padding: '1rem',
              marginBottom: '1.5rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: '700', color: '#334155', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Globe size={14} color="#0c4e7e" />
                  भाषा चुनें / Select Language:
                </span>

                <button
                  type="button"
                  onClick={handleVoicePrompt}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.2rem 0.6rem',
                    background: '#EAF5EC',
                    border: '1px solid #B8E0C0',
                    color: '#1E7B34',
                    borderRadius: '3px',
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                  title="Play Voiceover Guidance"
                >
                  <Volume2 size={13} />
                  <span>आवाज से सुनें</span>
                </button>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setLanguage('hi')}
                  style={{
                    flex: 1,
                    padding: '0.45rem',
                    background: language === 'hi' ? '#0c4e7e' : '#FFFFFF',
                    color: language === 'hi' ? '#FFFFFF' : '#334155',
                    border: '1px solid #CBD5E1',
                    borderRadius: '3px',
                    fontWeight: '700',
                    fontSize: '0.82rem',
                    cursor: 'pointer'
                  }}
                >
                  हिन्दी
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage('sat')}
                  style={{
                    flex: 1,
                    padding: '0.45rem',
                    background: language === 'sat' ? '#0c4e7e' : '#FFFFFF',
                    color: language === 'sat' ? '#FFFFFF' : '#334155',
                    border: '1px solid #CBD5E1',
                    borderRadius: '3px',
                    fontWeight: '700',
                    fontSize: '0.82rem',
                    cursor: 'pointer'
                  }}
                  className="font-ol-chiki"
                >
                  ᱥᱟᱱᱛᱟᱲᱤ
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage('en')}
                  style={{
                    flex: 1,
                    padding: '0.45rem',
                    background: language === 'en' ? '#0c4e7e' : '#FFFFFF',
                    color: language === 'en' ? '#FFFFFF' : '#334155',
                    border: '1px solid #CBD5E1',
                    borderRadius: '3px',
                    fontWeight: '700',
                    fontSize: '0.82rem',
                    cursor: 'pointer'
                  }}
                >
                  English
                </button>
              </div>
            </div>

            {/* Quick Demo Miner Selector */}
            <div>
              <div style={{ fontSize: '0.76rem', fontWeight: '700', color: '#475569', marginBottom: '0.5rem' }}>
                त्वरित कामगार चयन (Demo Miner Profiles):
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                {demoMiners.map((m) => {
                  const isSelected = identifier === m.code;
                  return (
                    <button
                      key={m.code}
                      type="button"
                      onClick={() => handleSelectDemoMiner(m)}
                      style={{
                        padding: '0.5rem',
                        textAlign: 'left',
                        background: isSelected ? '#EBF3FC' : '#F8FAFC',
                        border: isSelected ? '2px solid #0c4e7e' : '1px solid #CBD5E1',
                        borderRadius: '3px',
                        cursor: 'pointer'
                      }}
                    >
                      <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#0c4e7e' }}>
                        {m.name}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#64748B' }}>
                        {m.code} • {m.sector}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div style={{ marginTop: '1.5rem', fontSize: '0.72rem', color: '#94A3B8', borderTop: '1px solid #E2E8F0', paddingTop: '0.75rem' }}>
            DGMS Vocational Training Standard • Mines Act 1952 Benchmarks
          </div>
        </div>

        {/* Right Side: Sign-In Form */}
        <div className="gov-card" style={{
          padding: '2.25rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          background: '#FFFFFF'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: '#EBF3FC',
              color: '#0c4e7e',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 0.75rem auto',
              border: '2px solid #B4D3F7'
            }}>
              <HardHat size={30} />
            </div>

            <h2 style={{
              fontSize: '1.35rem',
              fontWeight: '800',
              color: '#0c4e7e',
              fontFamily: "'Roboto Slab', serif",
              margin: '0.2rem 0'
            }}>
              कामगार प्रवेश (Sign In)
            </h2>
            <p style={{ fontSize: '0.82rem', color: '#64748B', margin: 0 }}>
              Enter your Workforce Code or Mobile Number
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
                कामगार कोड अथवा मोबाइल नंबर (Workforce ID / Mobile):
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="उदा. JH-WRK-001 या 9431120401"
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.75rem 0.65rem 2.4rem',
                    border: '1px solid #CBD5E1',
                    borderRadius: '4px',
                    fontSize: '0.92rem',
                    fontWeight: '600',
                    color: '#0c4e7e',
                    fontFamily: "'Roboto Slab', monospace",
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
                <HardHat size={18} color="#64748B" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
              </div>
              <span style={{ fontSize: '0.72rem', color: '#64748B', display: 'block', marginTop: '0.25rem' }}>
                Try <strong>JH-WRK-001</strong> for Birsa Hansda or <strong>JH-WRK-002</strong> for Shibu Soren
              </span>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#334155', marginBottom: '0.35rem' }}>
                सुरक्षा पिन (Security PIN):
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="password"
                  required
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="Default PIN: 1234"
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
                <KeyRound size={18} color="#64748B" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
              </div>
              <span style={{ fontSize: '0.72rem', color: '#64748B', display: 'block', marginTop: '0.25rem' }}>
                Default Hackathon PIN: <strong>1234</strong>
              </span>
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
              <span>{loading ? 'सत्यापित हो रहा है...' : 'सुरक्षा पोर्टल में प्रवेश करें (Enter Portal)'}</span>
              <ArrowRight size={18} />
            </button>
          </form>

          <div style={{
            marginTop: '1.5rem',
            padding: '0.75rem',
            background: '#F8FAFC',
            borderRadius: '4px',
            border: '1px solid #E2E8F0',
            fontSize: '0.74rem',
            color: '#64748B',
            textAlign: 'center'
          }}>
            🔒 On-device offline authentication supported. Passwords and biometrics processed locally during network disconnection.
          </div>
        </div>
      </div>
    </div>
  );
}
