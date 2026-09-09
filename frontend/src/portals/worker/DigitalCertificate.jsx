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
  FileCheck
} from 'lucide-react';

export default function DigitalCertificate({ certificate, onDone, onVerifyInDGMS }) {
  const { t } = useLanguage();
  const { currentUser } = useAuth();
  const { saveOfflineCertificate } = useOfflineSync();
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const certRef = useRef(null);

  useEffect(() => {
    // Generate QR code encoding verifiable hash & metadata
    if (certificate?.qrHash) {
      const qrPayload = JSON.stringify({
        certId: certificate.certificateId,
        hash: certificate.qrHash,
        workerId: certificate.workerId,
        score: certificate.score,
        expiry: certificate.expiryDate,
        authority: 'SIH-2026-Academic-Evaluation-Engine',
        disclaimer: 'SIH 2026 Academic Simulation Record - Not a statutory license'
      });

      QRCode.toDataURL(qrPayload, {
        width: 170,
        margin: 1,
        color: {
          dark: '#0c4e7e',
          light: '#FFFFFF'
        }
      })
        .then((url) => setQrCodeUrl(url))
        .catch((err) => console.error('QR generation error:', err));

      saveOfflineCertificate(certificate);
    }
  }, [certificate]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ maxWidth: '860px', margin: '1.5rem auto' }}>
      {/* Top Action Bar (GIGW Standard) */}
      <div className="no-print" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.25rem',
        flexWrap: 'wrap',
        gap: '0.75rem',
        background: '#FFFFFF',
        padding: '0.75rem 1.25rem',
        borderRadius: '4px',
        border: '1px solid #D9D9D9',
        boxShadow: 'var(--shadow-subtle)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle2 size={20} color="#1E7B34" />
          <span style={{ fontSize: '0.95rem', fontWeight: '700', color: '#1E7B34' }}>
            Academic Simulation Record Issued
          </span>
        </div>

        <div style={{ display: 'flex', gap: '0.65rem' }}>
          <button
            onClick={handlePrint}
            className="gov-btn-secondary"
            style={{ padding: '0.45rem 0.9rem', fontSize: '0.82rem' }}
          >
            <Printer size={15} />
            <span>Print Simulation Certificate</span>
          </button>

          {onVerifyInDGMS && (
            <button
              onClick={() => onVerifyInDGMS(certificate.qrHash)}
              className="gov-btn-primary"
              style={{ padding: '0.45rem 0.9rem', fontSize: '0.82rem' }}
            >
              <ExternalLink size={15} />
              <span>Verify on Simulated Ledger</span>
            </button>
          )}

          <button
            onClick={onDone}
            className="gov-btn-gold"
            style={{ padding: '0.45rem 0.9rem', fontSize: '0.82rem' }}
          >
            Return to Modules
          </button>
        </div>
      </div>

      {/* Official Government of Jharkhand Statutory Certificate (DigiLocker / e-Sanad Style) */}
      <div
        ref={certRef}
        className="print-page"
        style={{
          background: '#FFFFFF',
          border: '3px solid #0c4e7e',
          borderRadius: '4px',
          padding: '2.5rem 2.25rem',
          position: 'relative',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
          color: '#1A202C',
          overflow: 'hidden'
        }}
      >
        {/* Academic Simulation Record Watermark (Legal Protection) */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%) rotate(-25deg)',
          fontSize: '2.2rem',
          fontWeight: '900',
          color: 'rgba(217, 119, 6, 0.09)',
          textTransform: 'uppercase',
          letterSpacing: '0.12em',
          pointerEvents: 'none',
          whiteSpace: 'nowrap',
          zIndex: 1,
          fontFamily: "'Roboto Slab', serif",
          textAlign: 'center',
          lineHeight: 1.4,
          userSelect: 'none'
        }}>
          ACADEMIC SIMULATION RECORD<br />
          <span style={{ fontSize: '1.25rem' }}>NOT A STATUTORY DGMS LICENSE</span>
        </div>

        {/* Subtle Decorative Inner Border */}
        <div style={{
          position: 'absolute',
          top: '6px',
          left: '6px',
          right: '6px',
          bottom: '6px',
          border: '1px solid #B8860B',
          pointerEvents: 'none',
          borderRadius: '2px'
        }} />

        {/* Certificate Header with National Emblem */}
        <div style={{
          textAlign: 'center',
          borderBottom: '2px solid #0c4e7e',
          paddingBottom: '1.25rem',
          marginBottom: '1.5rem',
          position: 'relative',
          zIndex: 2
        }}>
          {/* Top Academic Disclaimer Tag */}
          <div style={{
            display: 'inline-block',
            padding: '0.2rem 0.75rem',
            background: '#FEF3C7',
            border: '1px solid #F59E0B',
            borderRadius: '2px',
            color: '#B45309',
            fontSize: '0.68rem',
            fontWeight: '800',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            marginBottom: '0.6rem'
          }}>
            Smart India Hackathon 2026 (PS ID: 26041) • Simulation Prototype Credential
          </div>

          {/* Ashoka Lion Capital at Top Center */}
          <div style={{ marginBottom: '0.35rem' }}>
            <AshokaLionCapital size={52} color="#0c4e7e" showMotto={true} />
          </div>

          <div style={{
            fontSize: '0.82rem',
            fontWeight: '700',
            color: '#4A5568',
            letterSpacing: '0.05em'
          }}>
            शैक्षणिक सिमुलेशन रिकॉर्ड | ACADEMIC SIMULATION RECORD
          </div>

          <h1 style={{
            fontSize: '1.25rem',
            fontWeight: '800',
            color: '#0c4e7e',
            margin: '0.2rem 0',
            fontFamily: "'Roboto Slab', 'Noto Sans Devanagari', serif"
          }}>
            खान सुरक्षा प्रशिक्षण सिमुलेटर | MINING SAFETY SIMULATION CREDENTIAL
          </h1>

          <div style={{
            fontSize: '0.82rem',
            fontWeight: '700',
            color: '#B8860B'
          }}>
            पाठ्यक्रम मॉडल: खान एवं भूतत्व विभाग (झारखंड) एवं डीजीएमएस मानक
          </div>

          <div style={{
            fontSize: '0.72rem',
            color: '#718096',
            marginTop: '0.2rem'
          }}>
            Curriculum Modeled on Mines Act 1952 Benchmarks • Smart India Hackathon 2026 (PS ID 26041)
          </div>
        </div>

        {/* Formal Certificate Title */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem', position: 'relative', zIndex: 2 }}>
          <div style={{
            display: 'inline-block',
            padding: '0.35rem 1.25rem',
            background: '#FEF9E7',
            border: '1px solid #F3DC9B',
            borderRadius: '2px',
            color: '#8B6508',
            fontSize: '0.78rem',
            fontWeight: '700',
            letterSpacing: '0.05em',
            textTransform: 'uppercase'
          }}>
            Simulated Certificate of Vocational Safety Competency
          </div>

          <div style={{
            fontSize: '0.78rem',
            color: '#64748B',
            marginTop: '0.4rem',
            fontFamily: 'monospace'
          }}>
            Registration No: <strong style={{ color: '#0c4e7e' }}>{certificate.certificateId}</strong>
          </div>
        </div>

        {/* Certificate Legal Body Text */}
        <div style={{
          fontSize: '0.92rem',
          lineHeight: 1.8,
          color: '#2D3748',
          marginBottom: '1.75rem',
          textAlign: 'justify'
        }}>
          This is to officially certify that Sri/Smt <strong>{certificate.workerName || currentUser.name}</strong>, holding Workforce Identification Code <strong className="font-mono">{certificate.workerCode || currentUser.workerCode}</strong>, designated as <strong>{currentUser.designation}</strong> at <strong>{currentUser.siteName}</strong> ({currentUser.district} District, {currentUser.sector} Sector), has successfully participated in the camera-first Augmented Reality vocational drill and passed the mandatory on-device DGMS competency assessment in:
          
          <div style={{
            margin: '0.75rem 0',
            padding: '0.75rem 1rem',
            background: '#F8FAFC',
            border: '1px solid #E2E8F0',
            borderLeft: '4px solid #0c4e7e',
            borderRadius: '2px'
          }}>
            <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0c4e7e' }}>
              {certificate.moduleTitle || 'Fire & Explosion Emergency Response Protocol'}
            </div>
            <div style={{ fontSize: '0.82rem', color: '#4A5568', marginTop: '0.2rem' }}>
              Evaluated Competency Score: <strong style={{ color: '#1E7B34' }}>{certificate.score}%</strong> (Statutory Passing Threshold: 75%)
            </div>
          </div>

          The candidate is hereby accredited as qualified to execute emergency protocols under hazardous underground and surface industrial conditions in compliance with DGMS circular mandates.
        </div>

        {/* Verification & Metadata Split Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.5rem',
          alignItems: 'center',
          background: '#FAFCFF',
          padding: '1.25rem',
          border: '1px solid #CBD5E1',
          borderRadius: '4px',
          marginBottom: '1.75rem'
        }}>
          {/* Left: Statutory Dates & Ledger Metadata */}
          <div>
            <div style={{ fontSize: '0.8rem', color: '#64748B', marginBottom: '0.35rem' }}>
              Statutory Ledger Record
            </div>
            <div style={{ fontSize: '0.84rem', marginBottom: '0.3rem' }}>
              Issue Date: <strong>{certificate.issueDate}</strong>
            </div>
            <div style={{ fontSize: '0.84rem', marginBottom: '0.3rem' }}>
              Statutory Expiry Date: <strong style={{ color: '#B8860B' }}>{certificate.expiryDate}</strong>
            </div>
            <div style={{ fontSize: '0.84rem', marginBottom: '0.3rem' }}>
              Regulatory Benchmark: <strong>DGMS Dhanbad Standards (SIH-2026 Academic Evaluation)</strong>
            </div>
            <div style={{ fontSize: '0.74rem', color: '#718096', marginTop: '0.5rem' }}>
              Cryptographic Hash (SHA-256 HMAC):
              <div className="font-mono" style={{ fontSize: '0.68rem', color: '#0c4e7e', wordBreak: 'break-all', marginTop: '0.15rem' }}>
                {certificate.qrHash}
              </div>
            </div>
          </div>

          {/* Right: DigiLocker Style QR Verification Stamp */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px dashed #0c4e7e',
            padding: '0.85rem',
            background: '#FFFFFF',
            borderRadius: '4px'
          }}>
            {qrCodeUrl ? (
              <img
                src={qrCodeUrl}
                alt="Verifiable Cryptographic QR Passport"
                style={{ width: '130px', height: '130px', display: 'block' }}
              />
            ) : (
              <div style={{ width: '130px', height: '130px', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                Generating...
              </div>
            )}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
              marginTop: '0.4rem',
              fontSize: '0.72rem',
              fontWeight: '700',
              color: '#1E7B34'
            }}>
              <CheckCircle2 size={13} color="#1E7B34" />
              <span>Digitally Signed & Valid</span>
            </div>
            <div style={{ fontSize: '0.65rem', color: '#64748B', textAlign: 'center', marginTop: '0.15rem' }}>
              Scan with camera or verify in DGMS portal
            </div>
          </div>
        </div>

        {/* Signatures & Seal Footer */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          paddingTop: '1rem',
          borderTop: '1px solid #CBD5E1',
          fontSize: '0.8rem',
          color: '#4A5568',
          position: 'relative',
          zIndex: 2
        }}>
          {/* Signature 1 */}
          <div style={{ textAlign: 'center' }}>
            <div className="font-serif" style={{ fontSize: '0.95rem', color: '#0c4e7e', fontStyle: 'italic', fontWeight: '700', marginBottom: '0.2rem' }}>
              Automated AI Evaluator
            </div>
            <div style={{ width: '150px', height: '1px', background: '#A0AEC0', margin: '0 auto 0.25rem' }} />
            <div style={{ fontWeight: '700', color: '#1A202C' }}>Drill Verification Engine</div>
            <div style={{ fontSize: '0.72rem', color: '#718096' }}>SIH 2026 Simulation Platform</div>
          </div>

          {/* Official Seal Center */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <JharkhandGovSeal size={56} />
            <div style={{ fontSize: '0.62rem', fontWeight: '800', color: '#B45309', marginTop: '0.25rem', letterSpacing: '0.04em' }}>
              ACADEMIC PROTOTYPE SEAL
            </div>
          </div>

          {/* Signature 2 */}
          <div style={{ textAlign: 'center' }}>
            <div className="font-serif" style={{ fontSize: '0.95rem', color: '#0c4e7e', fontStyle: 'italic', fontWeight: '700', marginBottom: '0.2rem' }}>
              DGMS Benchmark Engine
            </div>
            <div style={{ width: '150px', height: '1px', background: '#A0AEC0', margin: '0 auto 0.25rem' }} />
            <div style={{ fontWeight: '700', color: '#1A202C' }}>Rule Scoring System</div>
            <div style={{ fontSize: '0.72rem', color: '#718096' }}>SIH 2026 Assessment Model</div>
          </div>
        </div>

        {/* Academic Safe Harbor Bottom Note */}
        <div style={{
          marginTop: '1.5rem',
          padding: '0.65rem 0.85rem',
          background: '#FEF3C7',
          border: '1px solid #F59E0B',
          borderRadius: '3px',
          textAlign: 'center',
          fontSize: '0.7rem',
          color: '#92400E',
          lineHeight: 1.5,
          position: 'relative',
          zIndex: 2
        }}>
          <strong>Academic & Technical Safe Harbor Notice:</strong> This digital credential is generated automatically by an AI/AR vocational training simulator created for the <strong>Smart India Hackathon 2026 (Problem Statement ID: 26041)</strong>. It is designed solely for competition demonstration and academic research. It does NOT constitute a statutory mine pass, employment certification, or legal license under the Mines Act, 1952. Any commercial, official, or fraudulent misrepresentation is strictly prohibited.
        </div>
      </div>
    </div>
  );
}
