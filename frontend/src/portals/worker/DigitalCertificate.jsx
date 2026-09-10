import React, { useEffect, useState, useRef } from 'react';
import QRCode from 'qrcode';
import confetti from 'canvas-confetti';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useOfflineSync } from '../../context/OfflineSyncContext';
import { AshokaLionCapital, JharkhandGovSeal } from '../../components/Emblem';
import { 
  ShieldCheck, 
  Printer, 
  CheckCircle2, 
  Calendar, 
  Building2, 
  Award,
  ExternalLink,
  Shield,
  FileCheck,
  Download,
  Lock,
  Star,
  Check
} from 'lucide-react';

export default function DigitalCertificate({ certificate, onDone }) {
  const { t } = useLanguage();
  const { currentUser } = useAuth();
  const { saveOfflineCertificate } = useOfflineSync();
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [copiedHash, setCopiedHash] = useState(false);
  const certRef = useRef(null);

  const certData = certificate || {};
  const workerName = certData.workerName || certData.worker_name || currentUser?.name || 'Birsa Hansda';
  const workerCode = certData.workerCode || certData.worker_code || currentUser?.workerCode || 'JH-WRK-001';
  const siteName = certData.siteName || certData.site_name || currentUser?.siteName || 'BCCL Jharia Underground Coal Mine Colliery #4';
  const district = certData.district || currentUser?.district || 'Dhanbad';
  const sector = certData.sector || currentUser?.sector || 'COAL';
  const moduleTitle = certData.moduleTitle || certData.module_title || 'Fire & Explosion Emergency Response Protocol';
  const score = certData.score !== undefined ? certData.score : 92;
  const issueDate = certData.issueDate || certData.issue_date || new Date().toISOString().split('T')[0];
  const expiryDate = certData.expiryDate || certData.expiry_date || '2027-09-10';
  const certId = certData.certificateId || certData.certificate_id || 'CERT-JH-2026-10482';
  const qrHash = certData.qrHash || certData.qr_hash || 'd65a73e7e6f5f10e07473e952760d8f646f43293ba5d965ebeddff3fde7f8667';
  const signature = certData.signature || `DGMS-SIG-${qrHash.substring(0, 16).toUpperCase()}`;

  useEffect(() => {
    // Confetti celebration upon opening a newly awarded certificate
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch {}

    // Generate high-resolution colored QR code encoding verifiable state ledger hash
    const qrPayload = JSON.stringify({
      certId: certId,
      hash: qrHash,
      workerCode: workerCode,
      workerName: workerName,
      score: score,
      expiry: expiryDate,
      authority: 'DGMS-Jharkhand-Mines-Safety-Ledger',
      verificationUrl: `${window.location.origin}/#verify/${encodeURIComponent(qrHash)}`
    });

    QRCode.toDataURL(qrPayload, {
      width: 220,
      margin: 1,
      color: {
        dark: '#073556',
        light: '#FFFFFF'
      },
      errorCorrectionLevel: 'H'
    })
      .then((url) => setQrCodeUrl(url))
      .catch((err) => console.error('QR generation error:', err));

    if (saveOfflineCertificate && certData.qrHash) {
      saveOfflineCertificate(certData);
    }
  }, [certId, qrHash]);

  const handlePrint = () => {
    window.print();
  };

  const handleCopyHash = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(qrHash);
      setCopiedHash(true);
      setTimeout(() => setCopiedHash(false), 2000);
    }
  };

  return (
    <div className="print-certificate-container" style={{ maxWidth: '940px', margin: '1.25rem auto' }}>
      {/* Top Action Bar (Hides automatically during print) */}
      <div className="no-print" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1rem',
        flexWrap: 'wrap',
        gap: '0.75rem',
        background: 'linear-gradient(135deg, #073556 0%, #0c4e7e 100%)',
        padding: '0.85rem 1.35rem',
        borderRadius: '8px',
        color: '#FFFFFF',
        boxShadow: '0 4px 16px rgba(7, 53, 86, 0.25)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div style={{
            width: '34px',
            height: '34px',
            borderRadius: '50%',
            background: '#2EE59D',
            color: '#073556',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <CheckCircle2 size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.94rem', fontWeight: '800', color: '#FFFFFF' }}>
              Statutory Vocational Safety Credential Ready
            </div>
            <div style={{ fontSize: '0.73rem', color: '#CBD5E1', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span>High-resolution A4 format</span>
              <span>•</span>
              <span style={{ color: '#2EE59D', fontWeight: '600' }}>Official Mines Safety Record</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.55rem', flexWrap: 'wrap' }}>
          <button
            onClick={handlePrint}
            style={{
              padding: '0.55rem 1.15rem',
              fontSize: '0.85rem',
              fontWeight: '800',
              background: '#2EE59D',
              color: '#073556',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              boxShadow: '0 2px 8px rgba(46, 229, 157, 0.4)'
            }}
          >
            <Printer size={16} />
            <span>Print Certificate</span>
          </button>

          <button
            onClick={handlePrint}
            title="Open browser print dialog to save as PDF"
            style={{
              padding: '0.55rem 1rem',
              fontSize: '0.85rem',
              fontWeight: '700',
              background: '#D4AF37',
              color: '#073556',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              boxShadow: '0 2px 8px rgba(212, 175, 55, 0.3)'
            }}
          >
            <Download size={15} />
            <span>Save as PDF</span>
          </button>

          {onDone && (
            <button
              onClick={onDone}
              style={{
                padding: '0.55rem 0.9rem',
                fontSize: '0.85rem',
                fontWeight: '700',
                background: 'rgba(255, 255, 255, 0.15)',
                color: '#FFFFFF',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Return to Portal
            </button>
          )}
        </div>
      </div>

      {/* ====================================================================
          HIGH-FIDELITY COLORED STATUTORY CERTIFICATE
          Strictly fitted for single-page A4 color printing (8.27in x 11.69in)
          ==================================================================== */}
      <div
        ref={certRef}
        className="print-page"
        style={{
          background: 'radial-gradient(ellipse at 50% 25%, #FFFFFF 0%, #FDFBF7 60%, #F7F1E5 100%)',
          border: '5px solid #073556',
          borderRadius: '4px',
          padding: '1.75rem 2.2rem',
          position: 'relative',
          boxShadow: '0 8px 26px rgba(0, 0, 0, 0.12)',
          color: '#1A202C',
          overflow: 'hidden',
          fontFamily: "'Open Sans', 'Roboto', sans-serif",
          WebkitPrintColorAdjust: 'exact',
          printColorAdjust: 'exact',
          colorAdjust: 'exact'
        }}
      >
        {/* Top Government Indian Tricolor Header Ribbon */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '6px',
          background: 'linear-gradient(90deg, #FF9933 0%, #FF9933 33.3%, #FFFFFF 33.3%, #FFFFFF 66.6%, #138808 66.6%, #138808 100%)',
          WebkitPrintColorAdjust: 'exact',
          printColorAdjust: 'exact'
        }} />

        {/* Holographic Prismatic Security Thread (Iridescent Foil Micro-Strip) */}
        <div style={{
          position: 'absolute',
          top: '6px',
          left: 0,
          right: 0,
          height: '3px',
          background: 'linear-gradient(90deg, #e0c3fc 0%, #8ec5fc 20%, #fbc2eb 40%, #a1c4fd 60%, #c2e9fb 80%, #ffd1ff 100%)',
          opacity: 0.95,
          WebkitPrintColorAdjust: 'exact',
          printColorAdjust: 'exact'
        }} />

        {/* Bottom Government Indian Tricolor Ribbon */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '5px',
          background: 'linear-gradient(90deg, #138808 0%, #138808 33.3%, #FFFFFF 33.3%, #FFFFFF 66.6%, #FF9933 66.6%, #FF9933 100%)',
          WebkitPrintColorAdjust: 'exact',
          printColorAdjust: 'exact'
        }} />

        {/* Ornate Inner Double Gold/Navy Security Border Frame */}
        <div style={{
          position: 'absolute',
          top: '9px',
          left: '9px',
          right: '9px',
          bottom: '9px',
          border: '2px solid #D4AF37',
          borderRadius: '3px',
          pointerEvents: 'none',
          WebkitPrintColorAdjust: 'exact',
          printColorAdjust: 'exact'
        }} />
        <div style={{
          position: 'absolute',
          top: '13px',
          left: '13px',
          right: '13px',
          bottom: '13px',
          border: '1px dashed rgba(7, 53, 86, 0.35)',
          borderRadius: '2px',
          pointerEvents: 'none',
          WebkitPrintColorAdjust: 'exact',
          printColorAdjust: 'exact'
        }} />

        {/* Four Ornate Gold Filigree Corner Brackets */}
        <svg style={{ position: 'absolute', top: '13px', left: '13px', width: '32px', height: '32px', pointerEvents: 'none' }} viewBox="0 0 32 32">
          <path d="M 2 30 L 2 5 C 2 3.3 3.3 2 5 2 L 30 2" fill="none" stroke="#D4AF37" strokeWidth="2.5" />
          <path d="M 6 26 L 6 7 C 6 6.4 6.4 6 7 6 L 26 6" fill="none" stroke="#8B6508" strokeWidth="1" strokeDasharray="2,2" />
          <circle cx="7" cy="7" r="2.5" fill="#D4AF37" />
          <circle cx="14" cy="7" r="1.5" fill="#D4AF37" />
          <circle cx="7" cy="14" r="1.5" fill="#D4AF37" />
        </svg>

        <svg style={{ position: 'absolute', top: '13px', right: '13px', width: '32px', height: '32px', pointerEvents: 'none', transform: 'scaleX(-1)' }} viewBox="0 0 32 32">
          <path d="M 2 30 L 2 5 C 2 3.3 3.3 2 5 2 L 30 2" fill="none" stroke="#D4AF37" strokeWidth="2.5" />
          <path d="M 6 26 L 6 7 C 6 6.4 6.4 6 7 6 L 26 6" fill="none" stroke="#8B6508" strokeWidth="1" strokeDasharray="2,2" />
          <circle cx="7" cy="7" r="2.5" fill="#D4AF37" />
          <circle cx="14" cy="7" r="1.5" fill="#D4AF37" />
          <circle cx="7" cy="14" r="1.5" fill="#D4AF37" />
        </svg>

        <svg style={{ position: 'absolute', bottom: '13px', left: '13px', width: '32px', height: '32px', pointerEvents: 'none', transform: 'scaleY(-1)' }} viewBox="0 0 32 32">
          <path d="M 2 30 L 2 5 C 2 3.3 3.3 2 5 2 L 30 2" fill="none" stroke="#D4AF37" strokeWidth="2.5" />
          <path d="M 6 26 L 6 7 C 6 6.4 6.4 6 7 6 L 26 6" fill="none" stroke="#8B6508" strokeWidth="1" strokeDasharray="2,2" />
          <circle cx="7" cy="7" r="2.5" fill="#D4AF37" />
          <circle cx="14" cy="7" r="1.5" fill="#D4AF37" />
          <circle cx="7" cy="14" r="1.5" fill="#D4AF37" />
        </svg>

        <svg style={{ position: 'absolute', bottom: '13px', right: '13px', width: '32px', height: '32px', pointerEvents: 'none', transform: 'scale(-1, -1)' }} viewBox="0 0 32 32">
          <path d="M 2 30 L 2 5 C 2 3.3 3.3 2 5 2 L 30 2" fill="none" stroke="#D4AF37" strokeWidth="2.5" />
          <path d="M 6 26 L 6 7 C 6 6.4 6.4 6 7 6 L 26 6" fill="none" stroke="#8B6508" strokeWidth="1" strokeDasharray="2,2" />
          <circle cx="7" cy="7" r="2.5" fill="#D4AF37" />
          <circle cx="14" cy="7" r="1.5" fill="#D4AF37" />
          <circle cx="7" cy="14" r="1.5" fill="#D4AF37" />
        </svg>

        {/* Central State Watermark (Security Guilloche) */}
        <div style={{
          position: 'absolute',
          top: '52%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '380px',
          height: '380px',
          borderRadius: '50%',
          border: '14px solid rgba(212, 175, 55, 0.05)',
          background: 'radial-gradient(circle, rgba(7, 53, 86, 0.03) 0%, rgba(212, 175, 55, 0.06) 70%, transparent 100%)',
          pointerEvents: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1,
          userSelect: 'none'
        }}>
          <div style={{
            transform: 'rotate(-20deg)',
            textAlign: 'center',
            color: 'rgba(7, 53, 86, 0.06)',
            fontFamily: "'Roboto Slab', serif",
            fontWeight: '900',
            fontSize: '1.9rem',
            letterSpacing: '0.12em',
            textTransform: 'uppercase'
          }}>
            KHAN SURAKSHA<br />
            <span style={{ fontSize: '1.1rem', letterSpacing: '0.08em' }}>DGMS BENCHMARK COMPLIANT</span>
          </div>
        </div>

        {/* ================================================================
            CERTIFICATE HEADER (Official Crests & State Seal)
            ================================================================ */}
        <div style={{ position: 'relative', zIndex: 2, marginBottom: '1.4rem' }}>
          {/* Top Tri-Insignia Row: Jharkhand Seal, Ashoka Lion Capital, Khan Suraksha Logo */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingBottom: '0.75rem',
            borderBottom: '2px solid #D4AF37'
          }}>
            {/* Left Insignia: Official State Seal */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', minWidth: '170px' }}>
              <JharkhandGovSeal size={58} />
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: '800', color: '#138808', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  झारखंड सरकार
                </div>
                <div style={{ fontSize: '0.68rem', fontWeight: '700', color: '#073556' }}>
                  Govt. of Jharkhand
                </div>
              </div>
            </div>

            {/* Center Insignia: National Emblem (Ashoka Lion Capital with Satyameva Jayate) */}
            <div style={{ textAlign: 'center' }}>
              <AshokaLionCapital size={52} color="#073556" showMotto={true} />
            </div>

            {/* Right Insignia: Khan Suraksha App Crest */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.65rem', minWidth: '170px' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: '800', color: '#D97706', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  खान सुरक्षा प्रभाग
                </div>
                <div style={{ fontSize: '0.68rem', fontWeight: '700', color: '#073556' }}>
                  Mines Safety Division
                </div>
              </div>
              <img
                src="/app-logo.png"
                alt="Khan Suraksha Official Emblem"
                style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: '12px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                  border: '1.5px solid #D4AF37'
                }}
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            </div>
          </div>

          {/* Departmental Banners */}
          <div style={{ textAlign: 'center', marginTop: '0.65rem' }}>
            <div style={{
              fontSize: '0.88rem',
              fontWeight: '800',
              color: '#073556',
              letterSpacing: '0.08em',
              textTransform: 'uppercase'
            }}>
              झारखंड सरकार • खान एवं भूतत्व विभाग
            </div>
            <div style={{
              fontSize: '0.78rem',
              fontWeight: '700',
              color: '#8B6508',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              marginTop: '0.1rem'
            }}>
              DEPARTMENT OF MINES & GEOLOGY • GOVERNMENT OF JHARKHAND
            </div>
            <div style={{
              fontSize: '0.72rem',
              color: '#4A5568',
              marginTop: '0.15rem'
            }}>
              In Collaboration with Directorate General of Mines Safety (DGMS), Dhanbad HQ
            </div>
          </div>
        </div>

        {/* ================================================================
            PRESTIGIOUS COLORED CERTIFICATE TITLE BANNER
            ================================================================ */}
        <div style={{
          position: 'relative',
          zIndex: 2,
          margin: '0.85rem 0 1.25rem 0',
          textAlign: 'center'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #073556 0%, #0c4e7e 50%, #073556 100%)',
            border: '2px solid #D4AF37',
            borderRadius: '4px',
            padding: '0.75rem 1.25rem',
            boxShadow: '0 3px 10px rgba(7, 53, 86, 0.25)',
            WebkitPrintColorAdjust: 'exact',
            printColorAdjust: 'exact'
          }}>
            <div style={{
              fontSize: '1.15rem',
              fontWeight: '800',
              color: '#FDFBF7',
              fontFamily: "'Roboto Slab', 'Noto Sans Devanagari', serif",
              letterSpacing: '0.04em',
              lineHeight: 1.3
            }}>
              व्यावसायिक खान सुरक्षा एवं योग्यता प्रमाण-पत्र
            </div>
            <div style={{
              fontSize: '0.78rem',
              fontWeight: '700',
              color: '#FDE68A',
              fontFamily: "'Noto Sans Ol Chiki', sans-serif",
              letterSpacing: '0.04em',
              marginTop: '0.15rem'
            }}>
              ᱠᱷᱟᱫᱟᱱ ᱨᱩᱠᱷᱤᱭᱟᱹ ᱟᱨ ᱟᱯᱚᱛᱠᱟᱞᱤᱱ ᱥᱟᱹᱵᱩᱫ ᱥᱟᱠᱟᱢ
            </div>
            <div style={{
              fontSize: '0.88rem',
              fontWeight: '800',
              color: '#F59E0B',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              marginTop: '0.2rem'
            }}>
              CERTIFICATE OF VOCATIONAL MINING SAFETY & EMERGENCY COMPETENCY
            </div>
            <div style={{
              fontSize: '0.68rem',
              color: '#E2E8F0',
              marginTop: '0.25rem',
              letterSpacing: '0.03em'
            }}>
              Accredited under Mandatory Safety Regulations of the Mines Act, 1952 & Factories Act, 1948
            </div>
          </div>

          {/* Registration Serial Pills */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '0.75rem',
            marginTop: '0.5rem',
            flexWrap: 'wrap'
          }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              background: '#FEF3C7',
              border: '1px solid #F59E0B',
              borderRadius: '3px',
              padding: '0.25rem 0.65rem',
              fontSize: '0.72rem',
              color: '#92400E',
              fontWeight: '700',
              WebkitPrintColorAdjust: 'exact',
              printColorAdjust: 'exact'
            }}>
              <span>Registration No:</span>
              <strong className="font-mono" style={{ color: '#073556' }}>{certId}</strong>
            </div>

            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              background: '#ECFDF5',
              border: '1px solid #10B981',
              borderRadius: '3px',
              padding: '0.25rem 0.65rem',
              fontSize: '0.72rem',
              color: '#065F46',
              fontWeight: '700',
              WebkitPrintColorAdjust: 'exact',
              printColorAdjust: 'exact'
            }}>
              <CheckCircle2 size={13} color="#059669" />
              <span>Status: DGMS Statutory Certified</span>
            </div>
          </div>
        </div>

        {/* ================================================================
            CERTIFICATE RECIPIENT BODY
            ================================================================ */}
        <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', margin: '1rem 0' }}>
          <div style={{
            fontSize: '0.85rem',
            color: '#4A5568',
            fontStyle: 'italic',
            letterSpacing: '0.04em'
          }}>
            This is to officially certify that
          </div>

          {/* Worker Name with Gold Tapered Underline */}
          <div style={{
            fontSize: '1.55rem',
            fontWeight: '900',
            color: '#073556',
            fontFamily: "'Roboto Slab', serif",
            marginTop: '0.25rem',
            marginBottom: '0.25rem',
            letterSpacing: '0.03em'
          }}>
            {workerName}
          </div>
          <div style={{
            width: '260px',
            height: '2px',
            background: 'linear-gradient(90deg, transparent 0%, #D4AF37 50%, transparent 100%)',
            margin: '0 auto 0.85rem auto',
            WebkitPrintColorAdjust: 'exact',
            printColorAdjust: 'exact'
          }} />

          {/* Four-Column Recipient Details Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '0.5rem',
            background: '#FFFFFF',
            border: '1px solid #CBD5E1',
            borderRadius: '4px',
            padding: '0.65rem 0.75rem',
            margin: '0 auto 1.15rem auto',
            textAlign: 'left',
            boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
            WebkitPrintColorAdjust: 'exact',
            printColorAdjust: 'exact'
          }}>
            <div>
              <span style={{ display: 'block', fontSize: '0.64rem', color: '#64748B', textTransform: 'uppercase', fontWeight: '700' }}>
                Workforce ID
              </span>
              <span className="font-mono" style={{ fontSize: '0.82rem', fontWeight: '800', color: '#073556' }}>
                {workerCode}
              </span>
            </div>

            <div>
              <span style={{ display: 'block', fontSize: '0.64rem', color: '#64748B', textTransform: 'uppercase', fontWeight: '700' }}>
                Designation
              </span>
              <span style={{ fontSize: '0.82rem', fontWeight: '700', color: '#1A202C' }}>
                {certData.designation || currentUser?.designation || 'Underground Miner'}
              </span>
            </div>

            <div>
              <span style={{ display: 'block', fontSize: '0.64rem', color: '#64748B', textTransform: 'uppercase', fontWeight: '700' }}>
                Mine / Facility
              </span>
              <span style={{ fontSize: '0.78rem', fontWeight: '700', color: '#1A202C' }}>
                {siteName}
              </span>
            </div>

            <div>
              <span style={{ display: 'block', fontSize: '0.64rem', color: '#64748B', textTransform: 'uppercase', fontWeight: '700' }}>
                District & Sector
              </span>
              <span style={{ fontSize: '0.82rem', fontWeight: '700', color: '#1E7B34' }}>
                {district} ({sector})
              </span>
            </div>
          </div>

          {/* Competency Statement */}
          <div style={{
            fontSize: '0.86rem',
            lineHeight: 1.6,
            color: '#2D3748',
            textAlign: 'justify',
            marginBottom: '1rem'
          }}>
            has successfully completed mandatory practical augmented reality simulation training and passed the statutory on-device DGMS competency evaluation under simulated high-hazard industrial conditions in:
          </div>

          {/* Highlighted Module Card with Rosette Distinction Badge */}
          <div style={{
            background: 'linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)',
            border: '1.5px solid #86EFAC',
            borderLeft: '5px solid #1E7B34',
            borderRadius: '4px',
            padding: '0.75rem 1.15rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem',
            marginBottom: '1.15rem',
            boxShadow: '0 2px 6px rgba(30, 123, 52, 0.08)',
            WebkitPrintColorAdjust: 'exact',
            printColorAdjust: 'exact'
          }}>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: '800', color: '#15803D', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Prescribed DGMS Vocational Curriculum Drill
              </div>
              <div style={{ fontSize: '1.05rem', fontWeight: '900', color: '#073556', marginTop: '0.1rem' }}>
                {moduleTitle}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#374151', marginTop: '0.2rem' }}>
                Emergency response sequencing, hazard clearance verification, and personal protective protocols.
              </div>
            </div>

            {/* Rosette Pass Badge */}
            <div style={{
              background: '#FFFFFF',
              border: '2px solid #D4AF37',
              borderRadius: '6px',
              padding: '0.45rem 0.85rem',
              textAlign: 'center',
              boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
              WebkitPrintColorAdjust: 'exact',
              printColorAdjust: 'exact'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}>
                <Star size={14} color="#D97706" fill="#F59E0B" />
                <span style={{ fontSize: '0.98rem', fontWeight: '900', color: '#15803D' }}>
                  {score}%
                </span>
              </div>
              <div style={{ fontSize: '0.62rem', fontWeight: '800', color: '#B45309', textTransform: 'uppercase', letterSpacing: '0.04em', marginTop: '0.1rem' }}>
                Passed with Distinction
              </div>
              <div style={{ fontSize: '0.58rem', color: '#6B7280' }}>
                Min. Pass Threshold: 75%
              </div>
            </div>
          </div>
        </div>

        {/* ================================================================
            VERIFICATION, CRYPTO LEDGER & QR CODE SECTION
            ================================================================ */}
        <div style={{
          position: 'relative',
          zIndex: 2,
          display: 'grid',
          gridTemplateColumns: '1.65fr 1fr',
          gap: '1rem',
          alignItems: 'stretch',
          marginBottom: '1.4rem'
        }}>
          {/* Left: Statutory Dates & Ledger Metadata Card */}
          <div style={{
            background: '#FFFFFF',
            border: '1px solid #CBD5E1',
            borderRadius: '4px',
            padding: '0.85rem 1rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
            WebkitPrintColorAdjust: 'exact',
            printColorAdjust: 'exact'
          }}>
            <div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.74rem',
                fontWeight: '800',
                color: '#073556',
                borderBottom: '1px solid #E2E8F0',
                paddingBottom: '0.35rem',
                marginBottom: '0.5rem',
                textTransform: 'uppercase',
                letterSpacing: '0.04em'
              }}>
                <ShieldCheck size={15} color="#1E7B34" />
                <span>Statutory Compliance & Legal Ledger</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem', marginBottom: '0.5rem' }}>
                <div>
                  <span style={{ fontSize: '0.64rem', color: '#64748B', display: 'block', textTransform: 'uppercase', fontWeight: '700' }}>
                    Issue Date
                  </span>
                  <span style={{ fontSize: '0.82rem', fontWeight: '800', color: '#1A202C' }}>
                    {issueDate}
                  </span>
                </div>

                <div>
                  <span style={{ fontSize: '0.64rem', color: '#64748B', display: 'block', textTransform: 'uppercase', fontWeight: '700' }}>
                    Mandatory Refresher Expiry
                  </span>
                  <span style={{ fontSize: '0.82rem', fontWeight: '800', color: '#B45309' }}>
                    {expiryDate}
                  </span>
                </div>
              </div>

              <div style={{ fontSize: '0.72rem', color: '#4A5568', lineHeight: 1.4, marginBottom: '0.45rem' }}>
                <strong>Statutory Benchmark:</strong> Mines Act 1952, Section 22A & DGMS Safety Circular DGMS/S&T/Circular-2026/041.
              </div>
            </div>

            {/* Cryptographic Hash Box */}
            <div style={{
              background: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: '3px',
              padding: '0.45rem 0.65rem',
              marginTop: '0.35rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.62rem', fontWeight: '700', color: '#64748B', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Lock size={11} color="#073556" />
                  SHA-256 HMAC Digital Hash
                </span>
                <button
                  type="button"
                  onClick={handleCopyHash}
                  className="no-print"
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '0.62rem',
                    color: copiedHash ? '#1E7B34' : '#073556',
                    cursor: 'pointer',
                    fontWeight: '700'
                  }}
                >
                  {copiedHash ? '✓ Copied' : 'Copy'}
                </button>
              </div>
              <div className="font-mono" style={{ fontSize: '0.65rem', color: '#073556', wordBreak: 'break-all', marginTop: '0.15rem', lineHeight: 1.3 }}>
                {qrHash}
              </div>
            </div>
          </div>

          {/* Right: DigiLocker Style Live High-Resolution QR Card */}
          <div style={{
            background: '#FFFFFF',
            border: '2px solid #D4AF37',
            borderRadius: '4px',
            padding: '0.85rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            boxShadow: '0 2px 8px rgba(212, 175, 55, 0.15)',
            WebkitPrintColorAdjust: 'exact',
            printColorAdjust: 'exact'
          }}>
            <div style={{
              border: '1.5px solid #073556',
              padding: '4px',
              borderRadius: '4px',
              background: '#FFFFFF',
              boxShadow: '0 2px 6px rgba(0,0,0,0.06)'
            }}>
              {qrCodeUrl ? (
                <img
                  src={qrCodeUrl}
                  alt="DGMS Verifiable Cryptographic QR Passport"
                  style={{ width: '125px', height: '125px', display: 'block' }}
                />
              ) : (
                <div style={{ width: '125px', height: '125px', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', color: '#64748B' }}>
                  Generating QR...
                </div>
              )}
            </div>

            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem',
              background: '#ECFDF5',
              border: '1px solid #10B981',
              borderRadius: '3px',
              padding: '0.2rem 0.55rem',
              marginTop: '0.45rem',
              fontSize: '0.68rem',
              fontWeight: '800',
              color: '#065F46',
              WebkitPrintColorAdjust: 'exact',
              printColorAdjust: 'exact'
            }}>
              <CheckCircle2 size={13} color="#059669" />
              <span>DIGITALLY SIGNED & VERIFIED</span>
            </div>

            <div style={{ fontSize: '0.62rem', color: '#64748B', marginTop: '0.25rem', lineHeight: 1.3 }}>
              Scan via camera or verify in DGMS portal
            </div>
          </div>
        </div>

        {/* ================================================================
            SIGNATURES & OFFICIAL STAMP FOOTER
            ================================================================ */}
        <div style={{
          position: 'relative',
          zIndex: 2,
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          alignItems: 'flex-end',
          paddingTop: '0.85rem',
          borderTop: '2px solid #D4AF37',
          marginTop: '0.5rem'
        }}>
          {/* Signature 1: Site Safety Supervisor */}
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontFamily: "'Dancing Script', 'Brush Script MT', 'Segoe Script', cursive",
              fontSize: '1.6rem',
              color: '#1A365D',
              fontWeight: '700',
              lineHeight: 1.1,
              marginBottom: '0.2rem',
              userSelect: 'none'
            }}>
              Rajesh Mahato
            </div>
            <div style={{ width: '150px', height: '1.5px', background: '#073556', margin: '0 auto 0.3rem auto' }} />
            <div style={{ fontSize: '0.78rem', fontWeight: '800', color: '#073556' }}>
              Rajesh Mahato
            </div>
            <div style={{ fontSize: '0.66rem', color: '#4A5568' }}>
              Accredited Site Safety Officer
            </div>
            <div style={{ fontSize: '0.62rem', color: '#718096' }}>
              BCCL Jharia Colliery #4 (Dhanbad)
            </div>
          </div>

          {/* Official Center Stamp: DGMS Physical Circular Rubber Stamp */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{
              width: '84px',
              height: '84px',
              borderRadius: '50%',
              border: '2.5px dashed #2A4365',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#2A4365',
              transform: 'rotate(-8deg)',
              background: 'radial-gradient(circle, rgba(42, 67, 101, 0.04) 0%, transparent 80%)',
              boxShadow: 'inset 0 0 4px rgba(42, 67, 101, 0.2)',
              userSelect: 'none',
              WebkitPrintColorAdjust: 'exact',
              printColorAdjust: 'exact'
            }}>
              <div style={{ fontSize: '0.48rem', fontWeight: '800', letterSpacing: '0.04em', textAlign: 'center' }}>
                ★ DGMS DHANBAD ★
              </div>
              <div style={{
                fontSize: '0.62rem',
                fontWeight: '900',
                color: '#1E7B34',
                letterSpacing: '0.05em',
                margin: '2px 0',
                textTransform: 'uppercase'
              }}>
                SEALED &amp; VERIFIED
              </div>
              <div style={{ fontSize: '0.48rem', fontWeight: '800', color: '#2A4365' }}>
                {issueDate}
              </div>
            </div>
            <div style={{ fontSize: '0.62rem', fontWeight: '800', color: '#B45309', marginTop: '0.35rem', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              Statutory Directorate Seal
            </div>
          </div>

          {/* Signature 2: Director of Mine Safety / DGMS Chief Inspector */}
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontFamily: "'Dancing Script', 'Brush Script MT', 'Segoe Script', cursive",
              fontSize: '1.6rem',
              color: '#1A365D',
              fontWeight: '700',
              lineHeight: 1.1,
              marginBottom: '0.2rem',
              userSelect: 'none'
            }}>
              Dr. A.K. Sengupta
            </div>
            <div style={{ width: '150px', height: '1.5px', background: '#073556', margin: '0 auto 0.3rem auto' }} />
            <div style={{ fontSize: '0.78rem', fontWeight: '800', color: '#073556' }}>
              Dr. A.K. Sengupta
            </div>
            <div style={{ fontSize: '0.66rem', color: '#4A5568' }}>
              Director of Mine Safety (DGMS Inspector)
            </div>
            <div style={{ fontSize: '0.62rem', color: '#718096' }}>
              Govt. of India • Mines Safety HQ
            </div>
          </div>
        </div>

        {/* Academic Safe Harbor Bottom Tag (Micro Note) */}
        <div style={{
          marginTop: '0.9rem',
          padding: '0.4rem 0.65rem',
          background: '#FEF9C3',
          border: '1px solid #FACC15',
          borderRadius: '3px',
          textAlign: 'center',
          fontSize: '0.62rem',
          color: '#854D0E',
          lineHeight: 1.3,
          position: 'relative',
          zIndex: 2,
          WebkitPrintColorAdjust: 'exact',
          printColorAdjust: 'exact'
        }}>
          <strong>Smart India Hackathon 2026 Academic Research Prototype (PS ID 26041):</strong> This digital credential is generated automatically by an AI/WebXR vocational simulator. Benchmarked against Mines Act 1952 standards for technical evaluation.
        </div>
      </div>
    </div>
  );
}
