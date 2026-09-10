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
  Download, 
  Lock, 
  Star, 
  Check,
  LayoutGrid,
  FileText
} from 'lucide-react';

export default function DigitalCertificate({ certificate, onDone }) {
  const { t, getLocalizedDesignation } = useLanguage();
  const { currentUser } = useAuth();
  const { saveOfflineCertificate } = useOfflineSync();
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [copiedHash, setCopiedHash] = useState(false);
  // Default to Landscape mode: official statutory certificate format (fits strictly on 1 single page)
  const [orientation, setOrientation] = useState('landscape');
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
      width: 200,
      margin: 1,
      color: {
        dark: '#073556',
        light: '#FFFFFF'
      },
      errorCorrectionLevel: 'H'
    }).then(url => {
      setQrCodeUrl(url);
    }).catch(err => {
      console.error('Failed to generate high-resolution QR:', err);
    });

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

  const isLandscape = orientation === 'landscape';

  return (
    <div 
      className="print-certificate-container" 
      style={{ 
        maxWidth: isLandscape ? '1060px' : '820px', 
        margin: '1rem auto',
        transition: 'max-width 0.25s ease'
      }}
    >
      {/* Injected Dynamic @page Style to enforce selected single-page orientation in browser print preview */}
      <style>{`
        @page {
          size: ${isLandscape ? 'A4 landscape' : 'A4 portrait'};
          margin: ${isLandscape ? '4mm 6mm' : '5mm 6mm'};
        }
        @media print {
          .print-page {
            max-height: ${isLandscape ? '198mm' : '285mm'} !important;
            overflow: hidden !important;
          }
        }
      `}</style>

      {/* Top Action Bar (Hides automatically during print) */}
      <div className="no-print" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '0.85rem',
        flexWrap: 'wrap',
        gap: '0.65rem',
        background: 'linear-gradient(135deg, #073556 0%, #0c4e7e 100%)',
        padding: '0.75rem 1.25rem',
        borderRadius: '8px',
        color: '#FFFFFF',
        boxShadow: '0 4px 16px rgba(7, 53, 86, 0.25)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: '#2EE59D',
            color: '#073556',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <CheckCircle2 size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.92rem', fontWeight: '800', color: '#FFFFFF' }}>
              {t.certActionBarTitle || 'DGMS Mines Act Statutory Certificate'}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#CBD5E1', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span>Single-Page A4 {isLandscape ? 'Landscape' : 'Portrait'}</span>
              <span>•</span>
              <span style={{ color: '#2EE59D', fontWeight: '600' }}>{t.certOfficialRecord || 'Official Record'}</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Orientation Switcher Pill (Landscape by default, single-page guaranteed) */}
          <div style={{
            display: 'inline-flex',
            background: 'rgba(0, 0, 0, 0.25)',
            padding: '2px',
            borderRadius: '6px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            marginRight: '0.35rem'
          }}>
            <button
              type="button"
              onClick={() => setOrientation('landscape')}
              title="Official Statutory Landscape Format (Single Page)"
              style={{
                padding: '0.4rem 0.75rem',
                fontSize: '0.78rem',
                fontWeight: '700',
                background: isLandscape ? '#2EE59D' : 'transparent',
                color: isLandscape ? '#073556' : '#E2E8F0',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                transition: 'all 0.15s ease'
              }}
            >
              <LayoutGrid size={14} />
              <span>Landscape</span>
            </button>
            <button
              type="button"
              onClick={() => setOrientation('portrait')}
              title="Compact Single-Page Portrait Format"
              style={{
                padding: '0.4rem 0.75rem',
                fontSize: '0.78rem',
                fontWeight: '700',
                background: !isLandscape ? '#2EE59D' : 'transparent',
                color: !isLandscape ? '#073556' : '#E2E8F0',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                transition: 'all 0.15s ease'
              }}
            >
              <FileText size={14} />
              <span>Portrait</span>
            </button>
          </div>

          <button
            onClick={handlePrint}
            style={{
              padding: '0.48rem 1.05rem',
              fontSize: '0.82rem',
              fontWeight: '800',
              background: '#2EE59D',
              color: '#073556',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              boxShadow: '0 2px 8px rgba(46, 229, 157, 0.4)'
            }}
          >
            <Printer size={15} />
            <span>{t.printCertificate || 'Print Certificate'}</span>
          </button>

          <button
            onClick={handlePrint}
            title="Open browser print dialog to save as single-page PDF"
            style={{
              padding: '0.48rem 0.95rem',
              fontSize: '0.82rem',
              fontWeight: '700',
              background: '#D4AF37',
              color: '#073556',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              boxShadow: '0 2px 8px rgba(212, 175, 55, 0.3)'
            }}
          >
            <Download size={14} />
            <span>{t.saveAsPdf || 'Save PDF'}</span>
          </button>

          {onDone && (
            <button
              onClick={onDone}
              style={{
                padding: '0.48rem 0.85rem',
                fontSize: '0.82rem',
                fontWeight: '700',
                background: 'rgba(255, 255, 255, 0.15)',
                color: '#FFFFFF',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              {t.returnToPortal || 'Return'}
            </button>
          )}
        </div>
      </div>

      {/* ====================================================================
          HIGH-FIDELITY COLORED STATUTORY CERTIFICATE
          Guaranteed single-page layout (A4 Landscape 297mm x 210mm or Portrait)
          ==================================================================== */}
      <div
        ref={certRef}
        className={`print-page ${isLandscape ? 'print-landscape' : 'print-portrait'}`}
        style={{
          background: 'radial-gradient(ellipse at 50% 25%, #FFFFFF 0%, #FDFBF7 60%, #F7F1E5 100%)',
          border: '4px solid #073556',
          borderRadius: '4px',
          padding: isLandscape ? '0.85rem 1.4rem' : '1.1rem 1.6rem',
          position: 'relative',
          boxShadow: '0 8px 26px rgba(0, 0, 0, 0.12)',
          color: '#1A202C',
          overflow: 'hidden',
          fontFamily: "'Open Sans', 'Roboto', sans-serif",
          WebkitPrintColorAdjust: 'exact',
          printColorAdjust: 'exact',
          colorAdjust: 'exact',
          boxSizing: 'border-box'
        }}
      >
        {/* Top Government Indian Tricolor Header Ribbon */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '5px',
          background: 'linear-gradient(90deg, #FF9933 0%, #FF9933 33.3%, #FFFFFF 33.3%, #FFFFFF 66.6%, #138808 66.6%, #138808 100%)',
          WebkitPrintColorAdjust: 'exact',
          printColorAdjust: 'exact'
        }} />

        {/* Holographic Prismatic Security Thread (Iridescent Foil Micro-Strip) */}
        <div style={{
          position: 'absolute',
          top: '5px',
          left: 0,
          right: 0,
          height: '2.5px',
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
          height: '4.5px',
          background: 'linear-gradient(90deg, #138808 0%, #138808 33.3%, #FFFFFF 33.3%, #FFFFFF 66.6%, #FF9933 66.6%, #FF9933 100%)',
          WebkitPrintColorAdjust: 'exact',
          printColorAdjust: 'exact'
        }} />

        {/* Ornate Inner Double Gold/Navy Security Border Frame */}
        <div style={{
          position: 'absolute',
          top: '8px',
          left: '8px',
          right: '8px',
          bottom: '8px',
          border: '1.5px solid #D4AF37',
          borderRadius: '3px',
          pointerEvents: 'none',
          WebkitPrintColorAdjust: 'exact',
          printColorAdjust: 'exact'
        }} />
        <div style={{
          position: 'absolute',
          top: '11px',
          left: '11px',
          right: '11px',
          bottom: '11px',
          border: '1px dashed rgba(7, 53, 86, 0.3)',
          borderRadius: '2px',
          pointerEvents: 'none',
          WebkitPrintColorAdjust: 'exact',
          printColorAdjust: 'exact'
        }} />

        {/* Four Ornate Gold Filigree Corner Brackets */}
        <svg style={{ position: 'absolute', top: '11px', left: '11px', width: '28px', height: '28px', pointerEvents: 'none' }} viewBox="0 0 32 32">
          <path d="M 2 30 L 2 5 C 2 3.3 3.3 2 5 2 L 30 2" fill="none" stroke="#D4AF37" strokeWidth="2.5" />
          <path d="M 6 26 L 6 7 C 6 6.4 6.4 6 7 6 L 26 6" fill="none" stroke="#8B6508" strokeWidth="1" strokeDasharray="2,2" />
          <circle cx="7" cy="7" r="2.5" fill="#D4AF37" />
          <circle cx="14" cy="7" r="1.5" fill="#D4AF37" />
          <circle cx="7" cy="14" r="1.5" fill="#D4AF37" />
        </svg>

        <svg style={{ position: 'absolute', top: '11px', right: '11px', width: '28px', height: '28px', pointerEvents: 'none', transform: 'scaleX(-1)' }} viewBox="0 0 32 32">
          <path d="M 2 30 L 2 5 C 2 3.3 3.3 2 5 2 L 30 2" fill="none" stroke="#D4AF37" strokeWidth="2.5" />
          <path d="M 6 26 L 6 7 C 6 6.4 6.4 6 7 6 L 26 6" fill="none" stroke="#8B6508" strokeWidth="1" strokeDasharray="2,2" />
          <circle cx="7" cy="7" r="2.5" fill="#D4AF37" />
          <circle cx="14" cy="7" r="1.5" fill="#D4AF37" />
          <circle cx="7" cy="14" r="1.5" fill="#D4AF37" />
        </svg>

        <svg style={{ position: 'absolute', bottom: '11px', left: '11px', width: '28px', height: '28px', pointerEvents: 'none', transform: 'scaleY(-1)' }} viewBox="0 0 32 32">
          <path d="M 2 30 L 2 5 C 2 3.3 3.3 2 5 2 L 30 2" fill="none" stroke="#D4AF37" strokeWidth="2.5" />
          <path d="M 6 26 L 6 7 C 6 6.4 6.4 6 7 6 L 26 6" fill="none" stroke="#8B6508" strokeWidth="1" strokeDasharray="2,2" />
          <circle cx="7" cy="7" r="2.5" fill="#D4AF37" />
          <circle cx="14" cy="7" r="1.5" fill="#D4AF37" />
          <circle cx="7" cy="14" r="1.5" fill="#D4AF37" />
        </svg>

        <svg style={{ position: 'absolute', bottom: '11px', right: '11px', width: '28px', height: '28px', pointerEvents: 'none', transform: 'scale(-1, -1)' }} viewBox="0 0 32 32">
          <path d="M 2 30 L 2 5 C 2 3.3 3.3 2 5 2 L 30 2" fill="none" stroke="#D4AF37" strokeWidth="2.5" />
          <path d="M 6 26 L 6 7 C 6 6.4 6.4 6 7 6 L 26 6" fill="none" stroke="#8B6508" strokeWidth="1" strokeDasharray="2,2" />
          <circle cx="7" cy="7" r="2.5" fill="#D4AF37" />
          <circle cx="14" cy="7" r="1.5" fill="#D4AF37" />
          <circle cx="7" cy="14" r="1.5" fill="#D4AF37" />
        </svg>

        {/* Central State Watermark (Security Guilloche) */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: isLandscape ? '440px' : '340px',
          height: isLandscape ? '440px' : '340px',
          borderRadius: '50%',
          border: '10px solid rgba(212, 175, 55, 0.04)',
          background: 'radial-gradient(circle, rgba(7, 53, 86, 0.02) 0%, rgba(212, 175, 55, 0.04) 70%, transparent 100%)',
          pointerEvents: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1,
          userSelect: 'none'
        }}>
          <div style={{
            transform: 'rotate(-18deg)',
            textAlign: 'center',
            color: 'rgba(7, 53, 86, 0.05)',
            fontFamily: "'Roboto Slab', serif",
            fontWeight: '900',
            fontSize: isLandscape ? '1.8rem' : '1.5rem',
            letterSpacing: '0.12em',
            textTransform: 'uppercase'
          }}>
            KHAN SURAKSHA<br />
            <span style={{ fontSize: isLandscape ? '1rem' : '0.85rem', letterSpacing: '0.08em' }}>DGMS BENCHMARK COMPLIANT</span>
          </div>
        </div>

        {/* ================================================================
            CERTIFICATE HEADER (Official Crests & State Seal)
            ================================================================ */}
        <div style={{ position: 'relative', zIndex: 2, marginBottom: isLandscape ? '0.6rem' : '0.8rem' }}>
          {/* Top Tri-Insignia Row: Jharkhand Seal, Ashoka Lion Capital, Khan Suraksha Logo */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingBottom: '0.45rem',
            borderBottom: '1.5px solid #D4AF37'
          }}>
            {/* Left Insignia: Official State Seal */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: '150px' }}>
              <JharkhandGovSeal size={isLandscape ? 44 : 48} />
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '0.66rem', fontWeight: '800', color: '#138808', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                  झारखंड सरकार
                </div>
                <div style={{ fontSize: '0.62rem', fontWeight: '700', color: '#073556' }}>
                  Govt. of Jharkhand
                </div>
              </div>
            </div>

            {/* Center Insignia: National Emblem & Departmental Title */}
            <div style={{ textAlign: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.45rem' }}>
                <AshokaLionCapital size={isLandscape ? 36 : 42} color="#073556" showMotto={true} />
                <div>
                  <div style={{
                    fontSize: isLandscape ? '0.78rem' : '0.82rem',
                    fontWeight: '800',
                    color: '#073556',
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase'
                  }}>
                    झारखंड सरकार • खान एवं भूतत्व विभाग
                  </div>
                  <div style={{
                    fontSize: isLandscape ? '0.68rem' : '0.72rem',
                    fontWeight: '700',
                    color: '#8B6508',
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase'
                  }}>
                    DEPARTMENT OF MINES & GEOLOGY • GOVT. OF JHARKHAND
                  </div>
                  <div style={{ fontSize: '0.58rem', color: '#4A5568' }}>
                    In Collaboration with Directorate General of Mines Safety (DGMS), Dhanbad HQ
                  </div>
                </div>
              </div>
            </div>

            {/* Right Insignia: Khan Suraksha App Crest */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem', minWidth: '150px' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.66rem', fontWeight: '800', color: '#D97706', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                  खान सुरक्षा प्रभाग
                </div>
                <div style={{ fontSize: '0.62rem', fontWeight: '700', color: '#073556' }}>
                  Mines Safety Division
                </div>
              </div>
              <img
                src="/app-logo.png"
                alt="Khan Suraksha Official Emblem"
                style={{
                  width: isLandscape ? '40px' : '44px',
                  height: isLandscape ? '40px' : '44px',
                  borderRadius: '10px',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                  border: '1.5px solid #D4AF37'
                }}
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            </div>
          </div>
        </div>

        {/* ================================================================
            MAIN CONTENT BODY — LANDSCAPE 2-COLUMN VS PORTRAIT STACK
            ================================================================ */}
        {isLandscape ? (
          /* ── LANDSCAPE LAYOUT (2 Columns side-by-side) ────────────────── */
          <div style={{
            position: 'relative',
            zIndex: 2,
            display: 'grid',
            gridTemplateColumns: '1.45fr 1fr',
            gap: '0.9rem',
            alignItems: 'stretch',
            marginBottom: '0.65rem'
          }}>
            {/* Left Column: Title Banner, Recipient Details, & Drill Summary */}
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              {/* Prestigious Title Banner */}
              <div style={{
                background: 'linear-gradient(135deg, #073556 0%, #0c4e7e 50%, #073556 100%)',
                border: '1.5px solid #D4AF37',
                borderRadius: '4px',
                padding: '0.4rem 0.85rem',
                textAlign: 'center',
                boxShadow: '0 2px 8px rgba(7, 53, 86, 0.25)',
                WebkitPrintColorAdjust: 'exact',
                printColorAdjust: 'exact'
              }}>
                <div style={{
                  fontSize: '0.96rem',
                  fontWeight: '800',
                  color: '#FDFBF7',
                  fontFamily: "'Roboto Slab', 'Noto Sans Devanagari', serif",
                  letterSpacing: '0.03em',
                  lineHeight: 1.2
                }}>
                  व्यावसायिक खान सुरक्षा एवं योग्यता प्रमाण-पत्र
                </div>
                <div style={{
                  fontSize: '0.66rem',
                  fontWeight: '700',
                  color: '#FDE68A',
                  fontFamily: "'Noto Sans Ol Chiki', sans-serif",
                  marginTop: '0.05rem'
                }}>
                  ᱠᱷᱟᱫᱟᱱ ᱨᱩᱠᱷᱤᱭᱟᱹ ᱟᱨ ᱟᱯᱚᱛᱠᱟᱞᱤᱱ ᱥᱟᱹᱵᱩᱫ ᱥᱟᱠᱟᱢ
                </div>
                <div style={{
                  fontSize: '0.74rem',
                  fontWeight: '800',
                  color: '#F59E0B',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  marginTop: '0.1rem'
                }}>
                  CERTIFICATE OF VOCATIONAL MINING SAFETY & EMERGENCY COMPETENCY
                </div>
                <div style={{
                  fontSize: '0.58rem',
                  color: '#E2E8F0',
                  marginTop: '0.1rem'
                }}>
                  Accredited under Mandatory Safety Regulations of the Mines Act, 1952 & Factories Act, 1948
                </div>
              </div>

              {/* Recipient Details & Competency Statement */}
              <div style={{ textAlign: 'center', marginTop: '0.45rem' }}>
                <div style={{ fontSize: '0.72rem', color: '#4A5568', fontStyle: 'italic' }}>
                  This is to officially certify that
                </div>

                <div style={{
                  fontSize: '1.35rem',
                  fontWeight: '900',
                  color: '#073556',
                  fontFamily: "'Roboto Slab', serif",
                  marginTop: '0.15rem',
                  marginBottom: '0.15rem',
                  letterSpacing: '0.02em'
                }}>
                  {workerName}
                </div>
                <div style={{
                  width: '200px',
                  height: '2px',
                  background: 'linear-gradient(90deg, transparent 0%, #D4AF37 50%, transparent 100%)',
                  margin: '0 auto 0.45rem auto',
                  WebkitPrintColorAdjust: 'exact',
                  printColorAdjust: 'exact'
                }} />

                {/* 4-Item Recipient Details Grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: '0.35rem',
                  background: '#FFFFFF',
                  border: '1px solid #CBD5E1',
                  borderRadius: '4px',
                  padding: '0.4rem 0.55rem',
                  textAlign: 'left',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                  WebkitPrintColorAdjust: 'exact',
                  printColorAdjust: 'exact'
                }}>
                  <div>
                    <span style={{ display: 'block', fontSize: '0.56rem', color: '#64748B', textTransform: 'uppercase', fontWeight: '700' }}>
                      {t.workforceCode || 'Workforce ID'}
                    </span>
                    <span className="font-mono" style={{ fontSize: '0.76rem', fontWeight: '800', color: '#073556' }}>
                      {workerCode}
                    </span>
                  </div>
                  <div>
                    <span style={{ display: 'block', fontSize: '0.56rem', color: '#64748B', textTransform: 'uppercase', fontWeight: '700' }}>
                      {t.officerThDesignation || 'Designation'}
                    </span>
                    <span style={{ fontSize: '0.74rem', fontWeight: '700', color: '#1A202C' }}>
                      {getLocalizedDesignation ? getLocalizedDesignation(certData.designation || currentUser?.designation || 'Underground Miner') : (certData.designation || currentUser?.designation || 'Underground Miner')}
                    </span>
                  </div>
                  <div>
                    <span style={{ display: 'block', fontSize: '0.56rem', color: '#64748B', textTransform: 'uppercase', fontWeight: '700' }}>
                      {t.thFacility || 'Mine / Facility'}
                    </span>
                    <span style={{ fontSize: '0.7rem', fontWeight: '700', color: '#1A202C', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={siteName}>
                      {siteName}
                    </span>
                  </div>
                  <div>
                    <span style={{ display: 'block', fontSize: '0.56rem', color: '#64748B', textTransform: 'uppercase', fontWeight: '700' }}>
                      {t.districtLabel || 'District'} & Sector
                    </span>
                    <span style={{ fontSize: '0.74rem', fontWeight: '700', color: '#1E7B34' }}>
                      {district} ({sector})
                    </span>
                  </div>
                </div>

                {/* Competency Statement */}
                <div style={{
                  fontSize: '0.72rem',
                  lineHeight: 1.35,
                  color: '#2D3748',
                  textAlign: 'justify',
                  margin: '0.45rem 0'
                }}>
                  has successfully completed mandatory practical augmented reality simulation training and passed statutory on-device DGMS competency evaluation under simulated high-hazard conditions in:
                </div>

                {/* Highlighted Module Card */}
                <div style={{
                  background: 'linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)',
                  border: '1px solid #86EFAC',
                  borderLeft: '4px solid #1E7B34',
                  borderRadius: '4px',
                  padding: '0.45rem 0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  textAlign: 'left',
                  boxShadow: '0 1px 4px rgba(30, 123, 52, 0.06)',
                  WebkitPrintColorAdjust: 'exact',
                  printColorAdjust: 'exact'
                }}>
                  <div>
                    <div style={{ fontSize: '0.6rem', fontWeight: '800', color: '#15803D', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                      Prescribed DGMS Vocational Curriculum Drill
                    </div>
                    <div style={{ fontSize: '0.86rem', fontWeight: '900', color: '#073556', marginTop: '0.05rem' }}>
                      {moduleTitle}
                    </div>
                    <div style={{ fontSize: '0.62rem', color: '#374151', marginTop: '0.1rem' }}>
                      Emergency response sequencing, hazard clearance verification, and personal protective protocols.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Score Rosette, Verifiable QR Passport, & Crypto Ledger */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', justifyContent: 'space-between' }}>
              {/* Rosette Distinction Badge & Reg Pills Row */}
              <div style={{ display: 'flex', gap: '0.45rem', alignItems: 'stretch' }}>
                {/* Distinction Badge */}
                <div style={{
                  flex: 1,
                  background: '#FFFFFF',
                  border: '1.5px solid #D4AF37',
                  borderRadius: '4px',
                  padding: '0.35rem 0.55rem',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
                  WebkitPrintColorAdjust: 'exact',
                  printColorAdjust: 'exact'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}>
                    <Star size={13} color="#D97706" fill="#F59E0B" />
                    <span style={{ fontSize: '0.94rem', fontWeight: '900', color: '#15803D' }}>
                      {score}%
                    </span>
                  </div>
                  <div style={{ fontSize: '0.58rem', fontWeight: '800', color: '#B45309', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                    Passed with Distinction
                  </div>
                  <div style={{ fontSize: '0.52rem', color: '#6B7280' }}>
                    Min. Threshold: 75%
                  </div>
                </div>

                {/* Registration Pills Stack */}
                <div style={{ flex: 1.2, display: 'flex', flexDirection: 'column', gap: '0.3rem', justifyContent: 'center' }}>
                  <div style={{
                    background: '#FEF3C7',
                    border: '1px solid #F59E0B',
                    borderRadius: '3px',
                    padding: '0.2rem 0.45rem',
                    fontSize: '0.62rem',
                    color: '#92400E',
                    fontWeight: '700',
                    WebkitPrintColorAdjust: 'exact',
                    printColorAdjust: 'exact'
                  }}>
                    <span style={{ display: 'block', fontSize: '0.52rem', color: '#78350F' }}>Registration No:</span>
                    <strong className="font-mono" style={{ color: '#073556', fontSize: '0.72rem' }}>{certId}</strong>
                  </div>

                  <div style={{
                    background: '#ECFDF5',
                    border: '1px solid #10B981',
                    borderRadius: '3px',
                    padding: '0.2rem 0.45rem',
                    fontSize: '0.62rem',
                    color: '#065F46',
                    fontWeight: '700',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    WebkitPrintColorAdjust: 'exact',
                    printColorAdjust: 'exact'
                  }}>
                    <CheckCircle2 size={11} color="#059669" />
                    <span>DGMS Statutory Certified</span>
                  </div>
                </div>
              </div>

              {/* DigiLocker High-Res QR Card */}
              <div style={{
                background: '#FFFFFF',
                border: '1.5px solid #D4AF37',
                borderRadius: '4px',
                padding: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                boxShadow: '0 2px 6px rgba(212, 175, 55, 0.12)',
                WebkitPrintColorAdjust: 'exact',
                printColorAdjust: 'exact'
              }}>
                <div style={{
                  border: '1px solid #073556',
                  padding: '3px',
                  borderRadius: '3px',
                  background: '#FFFFFF',
                  flexShrink: 0
                }}>
                  {qrCodeUrl ? (
                    <img
                      src={qrCodeUrl}
                      alt="DGMS Verifiable Cryptographic QR Passport"
                      style={{ width: '85px', height: '85px', display: 'block' }}
                    />
                  ) : (
                    <div style={{ width: '85px', height: '85px', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', color: '#64748B' }}>
                      QR Code
                    </div>
                  )}
                </div>

                <div style={{ textAlign: 'left', flex: 1 }}>
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    background: '#ECFDF5',
                    border: '1px solid #10B981',
                    borderRadius: '3px',
                    padding: '0.15rem 0.4rem',
                    fontSize: '0.58rem',
                    fontWeight: '800',
                    color: '#065F46',
                    WebkitPrintColorAdjust: 'exact',
                    printColorAdjust: 'exact'
                  }}>
                    <CheckCircle2 size={10} color="#059669" />
                    <span>DIGITALLY SIGNED & VERIFIED</span>
                  </div>
                  <div style={{ fontSize: '0.58rem', color: '#64748B', marginTop: '0.2rem', lineHeight: 1.25 }}>
                    Instant QR inspection via smartphone or statutory DGMS portal.
                  </div>
                  <div style={{ fontSize: '0.62rem', color: '#073556', fontWeight: '700', marginTop: '0.2rem' }}>
                    Sig: {signature}
                  </div>
                </div>
              </div>

              {/* Statutory Dates & Cryptographic Ledger Card */}
              <div style={{
                background: '#FFFFFF',
                border: '1px solid #CBD5E1',
                borderRadius: '4px',
                padding: '0.45rem 0.65rem',
                fontSize: '0.66rem',
                WebkitPrintColorAdjust: 'exact',
                printColorAdjust: 'exact'
              }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.45rem', marginBottom: '0.35rem' }}>
                  <div>
                    <span style={{ fontSize: '0.54rem', color: '#64748B', display: 'block', textTransform: 'uppercase', fontWeight: '700' }}>
                      Issue Date
                    </span>
                    <strong style={{ color: '#1A202C', fontSize: '0.74rem' }}>{issueDate}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.54rem', color: '#64748B', display: 'block', textTransform: 'uppercase', fontWeight: '700' }}>
                      Refresher Expiry
                    </span>
                    <strong style={{ color: '#B45309', fontSize: '0.74rem' }}>{expiryDate}</strong>
                  </div>
                </div>

                <div style={{
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '3px',
                  padding: '0.3rem 0.45rem'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.52rem', fontWeight: '700', color: '#64748B', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                      <Lock size={9} color="#073556" />
                      SHA-256 HMAC Hash
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyHash}
                      className="no-print"
                      style={{
                        background: 'none',
                        border: 'none',
                        fontSize: '0.52rem',
                        color: copiedHash ? '#1E7B34' : '#073556',
                        cursor: 'pointer',
                        fontWeight: '700'
                      }}
                    >
                      {copiedHash ? '✓ Copied' : 'Copy'}
                    </button>
                  </div>
                  <div className="font-mono" style={{ fontSize: '0.56rem', color: '#073556', wordBreak: 'break-all', lineHeight: 1.2 }}>
                    {qrHash.slice(0, 32)}...
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ── PORTRAIT LAYOUT (Streamlined Compact Stack — Single Page) ─── */
          <div style={{ position: 'relative', zIndex: 2, marginBottom: '0.75rem' }}>
            {/* Title Banner */}
            <div style={{
              background: 'linear-gradient(135deg, #073556 0%, #0c4e7e 50%, #073556 100%)',
              border: '1.5px solid #D4AF37',
              borderRadius: '4px',
              padding: '0.45rem 1rem',
              textAlign: 'center',
              boxShadow: '0 2px 8px rgba(7, 53, 86, 0.25)',
              marginBottom: '0.55rem',
              WebkitPrintColorAdjust: 'exact',
              printColorAdjust: 'exact'
            }}>
              <div style={{
                fontSize: '1rem',
                fontWeight: '800',
                color: '#FDFBF7',
                fontFamily: "'Roboto Slab', 'Noto Sans Devanagari', serif"
              }}>
                व्यावसायिक खान सुरक्षा एवं योग्यता प्रमाण-पत्र
              </div>
              <div style={{
                fontSize: '0.68rem',
                fontWeight: '700',
                color: '#FDE68A',
                fontFamily: "'Noto Sans Ol Chiki', sans-serif"
              }}>
                ᱠᱷᱟᱫᱟᱱ ᱨᱩᱠᱷᱤᱭᱟᱹ ᱟᱨ ᱟᱯᱚᱛᱠᱟᱞᱤᱱ ᱥᱟᱹᱵᱩᱫ ᱥᱟᱠᱟᱢ
              </div>
              <div style={{
                fontSize: '0.76rem',
                fontWeight: '800',
                color: '#F59E0B',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                marginTop: '0.1rem'
              }}>
                CERTIFICATE OF VOCATIONAL MINING SAFETY & EMERGENCY COMPETENCY
              </div>
            </div>

            {/* Recipient Certification Header */}
            <div style={{ textAlign: 'center', margin: '0.35rem 0' }}>
              <div style={{ fontSize: '0.74rem', color: '#4A5568', fontStyle: 'italic' }}>
                This is to officially certify that
              </div>
              <div style={{
                fontSize: '1.45rem',
                fontWeight: '900',
                color: '#073556',
                fontFamily: "'Roboto Slab', serif",
                margin: '0.15rem 0',
                letterSpacing: '0.02em'
              }}>
                {workerName}
              </div>
              <div style={{
                width: '220px',
                height: '2px',
                background: 'linear-gradient(90deg, transparent 0%, #D4AF37 50%, transparent 100%)',
                margin: '0 auto 0.5rem auto'
              }} />

              {/* 4-Item Recipient Details Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '0.4rem',
                background: '#FFFFFF',
                border: '1px solid #CBD5E1',
                borderRadius: '4px',
                padding: '0.45rem 0.65rem',
                textAlign: 'left',
                margin: '0 auto 0.5rem auto',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
              }}>
                <div>
                  <span style={{ display: 'block', fontSize: '0.58rem', color: '#64748B', textTransform: 'uppercase', fontWeight: '700' }}>
                    {t.workforceCode || 'Workforce ID'}
                  </span>
                  <span className="font-mono" style={{ fontSize: '0.78rem', fontWeight: '800', color: '#073556' }}>
                    {workerCode}
                  </span>
                </div>
                <div>
                  <span style={{ display: 'block', fontSize: '0.58rem', color: '#64748B', textTransform: 'uppercase', fontWeight: '700' }}>
                    {t.officerThDesignation || 'Designation'}
                  </span>
                  <span style={{ fontSize: '0.76rem', fontWeight: '700', color: '#1A202C' }}>
                    {getLocalizedDesignation ? getLocalizedDesignation(certData.designation || currentUser?.designation || 'Underground Miner') : (certData.designation || currentUser?.designation || 'Underground Miner')}
                  </span>
                </div>
                <div>
                  <span style={{ display: 'block', fontSize: '0.58rem', color: '#64748B', textTransform: 'uppercase', fontWeight: '700' }}>
                    {t.thFacility || 'Mine / Facility'}
                  </span>
                  <span style={{ fontSize: '0.74rem', fontWeight: '700', color: '#1A202C' }}>
                    {siteName}
                  </span>
                </div>
                <div>
                  <span style={{ display: 'block', fontSize: '0.58rem', color: '#64748B', textTransform: 'uppercase', fontWeight: '700' }}>
                    {t.districtLabel || 'District'} & Sector
                  </span>
                  <span style={{ fontSize: '0.76rem', fontWeight: '700', color: '#1E7B34' }}>
                    {district} ({sector})
                  </span>
                </div>
              </div>

              {/* Competency Statement */}
              <div style={{
                fontSize: '0.74rem',
                lineHeight: 1.35,
                color: '#2D3748',
                textAlign: 'justify',
                margin: '0.4rem 0'
              }}>
                has successfully completed mandatory practical augmented reality simulation training and passed statutory on-device DGMS competency evaluation in:
              </div>

              {/* Module Card & Score Distinction Rosette */}
              <div style={{
                background: 'linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)',
                border: '1px solid #86EFAC',
                borderLeft: '4px solid #1E7B34',
                borderRadius: '4px',
                padding: '0.5rem 0.85rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                textAlign: 'left',
                margin: '0.45rem 0'
              }}>
                <div>
                  <div style={{ fontSize: '0.62rem', fontWeight: '800', color: '#15803D', textTransform: 'uppercase' }}>
                    Prescribed DGMS Curriculum Drill
                  </div>
                  <div style={{ fontSize: '0.92rem', fontWeight: '900', color: '#073556' }}>
                    {moduleTitle}
                  </div>
                </div>
                <div style={{
                  background: '#FFFFFF',
                  border: '1.5px solid #D4AF37',
                  borderRadius: '4px',
                  padding: '0.3rem 0.65rem',
                  textAlign: 'center'
                }}>
                  <span style={{ fontSize: '0.95rem', fontWeight: '900', color: '#15803D' }}>
                    {score}%
                  </span>
                  <div style={{ fontSize: '0.56rem', fontWeight: '800', color: '#B45309' }}>
                    Distinction
                  </div>
                </div>
              </div>
            </div>

            {/* QR & Verification Section (Side-by-Side in Portrait) */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1.5fr 1fr',
              gap: '0.65rem',
              alignItems: 'center',
              marginTop: '0.45rem'
            }}>
              {/* Left: Ledger & Hash */}
              <div style={{
                background: '#FFFFFF',
                border: '1px solid #CBD5E1',
                borderRadius: '4px',
                padding: '0.5rem 0.75rem',
                fontSize: '0.7rem'
              }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem', marginBottom: '0.3rem' }}>
                  <div>
                    <span style={{ fontSize: '0.56rem', color: '#64748B', display: 'block', textTransform: 'uppercase', fontWeight: '700' }}>
                      Issue Date
                    </span>
                    <strong style={{ color: '#1A202C' }}>{issueDate}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.56rem', color: '#64748B', display: 'block', textTransform: 'uppercase', fontWeight: '700' }}>
                      Refresher Expiry
                    </span>
                    <strong style={{ color: '#B45309' }}>{expiryDate}</strong>
                  </div>
                </div>
                <div style={{ fontSize: '0.62rem', color: '#4A5568', marginBottom: '0.3rem' }}>
                  <strong>Reg No:</strong> {certId} • <strong>Benchmark:</strong> Mines Act 1952 Sec 22A
                </div>
                <div className="font-mono" style={{ fontSize: '0.58rem', color: '#073556', wordBreak: 'break-all', background: '#F8FAFC', padding: '0.2rem 0.4rem', borderRadius: '2px' }}>
                  SHA-256: {qrHash.slice(0, 36)}...
                </div>
              </div>

              {/* Right: QR Code Card */}
              <div style={{
                background: '#FFFFFF',
                border: '1.5px solid #D4AF37',
                borderRadius: '4px',
                padding: '0.45rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center'
              }}>
                {qrCodeUrl && (
                  <img
                    src={qrCodeUrl}
                    alt="DGMS Verifiable QR"
                    style={{ width: '80px', height: '80px', display: 'block' }}
                  />
                )}
                <div style={{ fontSize: '0.56rem', fontWeight: '800', color: '#065F46', marginTop: '0.2rem' }}>
                  ✓ DIGITALLY SIGNED & VERIFIED
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================
            SIGNATURES & OFFICIAL STAMP FOOTER (Unified & Compact)
            ================================================================ */}
        <div style={{
          position: 'relative',
          zIndex: 2,
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          alignItems: 'flex-end',
          paddingTop: '0.5rem',
          borderTop: '1.5px solid #D4AF37',
          marginTop: '0.35rem'
        }}>
          {/* Signature 1: Site Safety Supervisor */}
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontFamily: "'Dancing Script', 'Brush Script MT', 'Segoe Script', cursive",
              fontSize: isLandscape ? '1.35rem' : '1.45rem',
              color: '#1A365D',
              fontWeight: '700',
              lineHeight: 1,
              marginBottom: '0.1rem',
              userSelect: 'none'
            }}>
              Rajesh Mahato
            </div>
            <div style={{ width: '130px', height: '1.5px', background: '#073556', margin: '0 auto 0.2rem auto' }} />
            <div style={{ fontSize: '0.72rem', fontWeight: '800', color: '#073556' }}>
              Rajesh Mahato
            </div>
            <div style={{ fontSize: '0.6rem', color: '#4A5568' }}>
              Accredited Site Safety Officer
            </div>
            <div style={{ fontSize: '0.56rem', color: '#718096' }}>
              BCCL Jharia Colliery #4 (Dhanbad)
            </div>
          </div>

          {/* Official Center Stamp: DGMS Physical Circular Rubber Stamp */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{
              width: isLandscape ? '68px' : '74px',
              height: isLandscape ? '68px' : '74px',
              borderRadius: '50%',
              border: '2px dashed #2A4365',
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
              <div style={{ fontSize: '0.42rem', fontWeight: '800', letterSpacing: '0.04em', textAlign: 'center' }}>
                ★ DGMS DHANBAD ★
              </div>
              <div style={{
                fontSize: '0.54rem',
                fontWeight: '900',
                color: '#1E7B34',
                letterSpacing: '0.04em',
                margin: '1px 0',
                textTransform: 'uppercase'
              }}>
                SEALED &amp; VERIFIED
              </div>
              <div style={{ fontSize: '0.42rem', fontWeight: '800', color: '#2A4365' }}>
                {issueDate}
              </div>
            </div>
            <div style={{ fontSize: '0.54rem', fontWeight: '800', color: '#B45309', marginTop: '0.2rem', letterSpacing: '0.03em', textTransform: 'uppercase' }}>
              Statutory Directorate Seal
            </div>
          </div>

          {/* Signature 2: Director of Mine Safety / DGMS Chief Inspector */}
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontFamily: "'Dancing Script', 'Brush Script MT', 'Segoe Script', cursive",
              fontSize: isLandscape ? '1.35rem' : '1.45rem',
              color: '#1A365D',
              fontWeight: '700',
              lineHeight: 1,
              marginBottom: '0.1rem',
              userSelect: 'none'
            }}>
              Dr. A.K. Sengupta
            </div>
            <div style={{ width: '130px', height: '1.5px', background: '#073556', margin: '0 auto 0.2rem auto' }} />
            <div style={{ fontSize: '0.72rem', fontWeight: '800', color: '#073556' }}>
              Dr. A.K. Sengupta
            </div>
            <div style={{ fontSize: '0.6rem', color: '#4A5568' }}>
              Director of Mine Safety (DGMS Inspector)
            </div>
            <div style={{ fontSize: '0.56rem', color: '#718096' }}>
              Govt. of India • Mines Safety HQ
            </div>
          </div>
        </div>

        {/* Academic Safe Harbor Bottom Tag (Micro Note) */}
        <div style={{
          marginTop: '0.45rem',
          padding: '0.25rem 0.5rem',
          background: '#FEF9C3',
          border: '1px solid #FACC15',
          borderRadius: '3px',
          textAlign: 'center',
          fontSize: '0.56rem',
          color: '#854D0E',
          lineHeight: 1.25,
          position: 'relative',
          zIndex: 2,
          WebkitPrintColorAdjust: 'exact',
          printColorAdjust: 'exact'
        }}>
          <strong>Smart India Hackathon 2026 Academic Research Prototype (PS ID 26041):</strong> Generated by WebXR simulator. Benchmarked against Mines Act 1952 standards for technical evaluation.
        </div>
      </div>
    </div>
  );
}
