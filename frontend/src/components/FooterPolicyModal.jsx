import React, { useEffect, useRef } from 'react';
import { 
  X, 
  ShieldCheck, 
  BookOpen, 
  Scale, 
  FileText, 
  Users, 
  Award, 
  Volume2, 
  Terminal, 
  CheckCircle2, 
  ExternalLink, 
  Layers, 
  AlertCircle,
  Eye,
  Keyboard,
  Printer
} from 'lucide-react';
import { AshokaLionCapital } from './Emblem';

export default function FooterPolicyModal({ activeModal, onClose, t, language, speak }) {
  const modalRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (activeModal) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [activeModal, onClose]);

  if (!activeModal) return null;

  // Render Modal Content based on activeModal ID
  const renderContent = () => {
    switch (activeModal) {
      // 1. SIMULATOR INFO
      case 'simulator':
        return (
          <div>
            <div className="gov-card" style={{ padding: '1.25rem', marginBottom: '1.25rem', borderLeft: '4px solid #0c4e7e', background: '#F8FAFC' }}>
              <h4 style={{ margin: '0 0 0.5rem 0', color: '#0c4e7e', fontSize: '1rem', fontWeight: '800' }}>
                {language === 'hi' ? 'एआर सिमुलेशन इंजन तकनीकी विशिष्टताएं' : language === 'sat' ? 'AR ᱥᱤᱢᱩᱞᱮᱥᱚᱱ ᱤᱧᱡᱤᱱ ᱴᱮᱠᱱᱤᱠᱟᱞ ᱵᱟᱰᱟᱭ' : 'AR Simulation Engine Technical Specifications'}
              </h4>
              <p style={{ fontSize: '0.85rem', color: '#4A5568', margin: 0, lineHeight: 1.6 }}>
                {language === 'hi' 
                  ? 'यह प्रणाली वेबएक्सआर (WebXR) संगत 3डी भौतिकी सिमुलेशन और स्थानिक ट्रैकिंग इंजन का उपयोग करती है, जिसे भूमिगत कोयला एवं धातु खदानों में काम करने वाले अग्रिम पंक्ति कामगारों को व्यावहारिक व्यावसायिक सुरक्षा प्रशिक्षण देने के लिए तैयार किया गया है।'
                  : language === 'sat'
                  ? 'ᱱᱚᱶᱟ ᱵᱮᱵᱚᱥᱛᱟ ᱫᱚ WebXR 3D ᱯᱷᱤᱡᱤᱠᱥ ᱟᱨ ᱴᱷᱟᱶ ᱪᱤᱱᱦᱟᱹᱯ ᱤᱧᱡᱤᱱ ᱵᱮᱵᱷᱟᱨᱟ, ᱡᱟᱦᱟᱸ ᱫᱚ ᱠᱷᱟᱫᱟᱱ ᱠᱟᱹᱢᱤᱭᱟᱹ ᱠᱚ ᱞᱟᱹᱜᱤᱫ ᱨᱩᱠᱷᱤᱭᱟᱹ ᱥᱮᱪᱮᱫ ᱮᱢ ᱞᱟᱹᱜᱤᱫ ᱵᱮᱱᱟᱣ ᱟᱠᱟᱱᱟ᱾'
                  : 'This platform utilizes a WebXR-compatible 3D physics and spatial tracking engine tailored specifically to train frontline miners in statutory DGMS vocational hazard response drills with zero external proprietary hardware.'}
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
              <div style={{ border: '1px solid #E2E8F0', borderRadius: '4px', padding: '1rem', background: '#FFFFFF' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <Layers size={18} color="#0c4e7e" />
                  <strong style={{ fontSize: '0.9rem', color: '#1A202C' }}>
                    {language === 'hi' ? 'स्थानिक एआर ट्रैकिंग' : language === 'sat' ? 'AR ᱴᱷᱟᱶ ᱪᱤᱱᱦᱟᱹᱯ' : 'Spatial AR Tracking'}
                  </strong>
                </div>
                <p style={{ fontSize: '0.8rem', color: '#64748B', margin: 0 }}>
                  {language === 'hi' 
                    ? 'एचटीएमएल5 कैनवस एवं फोन जायरोस्कोप/एक्सेलेरोमीटर द्वारा 90 एफपीएस पर आग की लपटों और गैस विसर्जन का वास्तविक 3डी भौतिकी सिमुलेशन।'
                    : language === 'sat'
                    ? 'HTML5 ᱠᱮᱱᱵᱷᱟᱥ ᱟᱨ ᱯᱷᱳᱱ ᱥᱮᱱᱥᱚᱨ ᱦᱚᱛᱮᱛᱮ 90 FPS ᱨᱮ ᱥᱮᱸᱜᱮᱞ ᱟᱨ ᱜᱮᱥ ᱨᱮᱭᱟᱜ 3D ᱩᱫᱩᱜ᱾'
                    : '6-DOF spatial device orientation tracking running at 90 FPS with realistic particle fire propagation and multi-gas diffusion vectors.'}
                </p>
              </div>

              <div style={{ border: '1px solid #E2E8F0', borderRadius: '4px', padding: '1rem', background: '#FFFFFF' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <Volume2 size={18} color="#1E7B34" />
                  <strong style={{ fontSize: '0.9rem', color: '#1A202C' }}>
                    {language === 'hi' ? 'त्रिभाषी ध्वनि मार्गदर्शन' : language === 'sat' ? 'ᱯᱮ ᱯᱟᱹᱨᱥᱤ ᱟᱲᱟᱝ' : 'Tribal Voice Narration'}
                  </strong>
                </div>
                <p style={{ fontSize: '0.8rem', color: '#64748B', margin: 0 }}>
                  {language === 'hi'
                    ? 'संथाली (ओल चिकी उच्चारण), हिन्दी एवं अंग्रेज़ी में वास्तविक समय ऑडियो मार्गदर्शन, जो कम साक्षर कामगारों को बिना पढ़े सीखने में सक्षम बनाता है।'
                    : language === 'sat'
                    ? 'ᱥᱟᱱᱛᱟᱲᱤ (ᱚᱞ ᱪᱤᱠᱤ), ᱦᱤᱱᱫᱤ ᱟᱨ ᱤᱝᱞᱤᱥ ᱛᱮ ᱟᱲᱟᱝ ᱥᱟᱰᱮ ᱥᱮᱪᱮᱫ ᱡᱟᱦᱟᱸ ᱫᱚ ᱵᱟᱝ ᱚᱞ-ᱯᱟᱲᱦᱟᱣ ᱠᱟᱹᱢᱤᱭᱟᱹ ᱠᱚ ᱜᱚᱲᱚ ᱟᱠᱚᱣᱟ᱾'
                    : 'Native synthetic audio voiceover in Santali (Ol Chiki phonetics), Hindi, and English, designed for low-literacy miners.'}
                </p>
              </div>

              <div style={{ border: '1px solid #E2E8F0', borderRadius: '4px', padding: '1rem', background: '#FFFFFF' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <ShieldCheck size={18} color="#0c4e7e" />
                  <strong style={{ fontSize: '0.9rem', color: '#1A202C' }}>
                    {language === 'hi' ? 'ऑफलाइन इंडेक्स्ड-डीबी सिंक' : language === 'sat' ? 'ᱚᱯᱷᱞᱟᱭᱤᱱ IndexedDB ᱥᱟᱸᱵᱽᱲᱟᱣ' : 'Offline-First Resilience'}
                  </strong>
                </div>
                <p style={{ fontSize: '0.8rem', color: '#64748B', margin: 0 }}>
                  {language === 'hi'
                    ? 'भूमिगत खदानों में इंटरनेट न होने पर भी सभी मॉड्यूल चलते हैं। सतह पर आने पर राज्य अनुपालन बहीखाते में स्वतः सिंक होता है।'
                    : language === 'sat'
                    ? 'ᱠᱷᱟᱫᱟᱱ ᱵᱷᱤᱛᱨᱤ ᱨᱮ ᱤᱱᱴᱟᱨᱱᱮᱴ ᱵᱟᱹᱱᱩᱜ ᱨᱮᱦᱚᱸ ᱥᱟᱱᱟᱢ ᱥᱮᱪᱮᱫ ᱪᱟᱞᱟᱜᱼᱟ ᱟᱨ ᱵᱟᱦᱨᱮ ᱦᱮᱡ ᱞᱮᱱᱠᱷᱟᱱ ᱟᱯᱱᱟᱨ ᱛᱮ ᱥᱤᱸᱠ ᱦᱩᱭᱩᱜᱼᱟ᱾'
                    : 'Deep underground seam execution using local browser IndexedDB; records automatically queue and sync to central ledger upon reconnect.'}
                </p>
              </div>

              <div style={{ border: '1px solid #E2E8F0', borderRadius: '4px', padding: '1rem', background: '#FFFFFF' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <CheckCircle2 size={18} color="#B8860B" />
                  <strong style={{ fontSize: '0.9rem', color: '#1A202C' }}>
                    {language === 'hi' ? 'क्रिप्टोग्राफिक सत्यापन' : language === 'sat' ? 'ᱠᱨᱤᱯᱴᱳᱜᱽᱨᱟᱯᱷᱤᱠ ᱯᱚᱨᱢᱟᱱ' : 'SHA-256 HMAC Passports'}
                  </strong>
                </div>
                <p style={{ fontSize: '0.8rem', color: '#64748B', margin: 0 }}>
                  {language === 'hi'
                    ? 'डीजीएमएस मानकों के अनुरूप 80% उत्तीर्ण अंक प्राप्त करने पर 256-बिट क्रिप्टोग्राफिक क्यूआर पासपोर्ट जारी किया जाता है।'
                    : language === 'sat'
                    ? 'DGMS ᱢᱟᱱᱚᱠ ᱞᱮᱠᱟᱛᱮ 80% ᱱᱚᱢᱵᱚᱨ ᱧᱟᱢ ᱞᱮᱠᱷᱟᱱ ᱠᱨᱤᱯᱴᱳᱜᱽᱨᱟᱯᱷᱤᱠ QR ᱯᱟᱥᱯᱳᱨᱴ ᱮᱢ ᱦᱩᱭᱩᱜᱼᱟ᱾'
                    : 'Tamper-evident 64-character SHA-256 HMAC digital passport certificates issued instantly upon achieving >=80% threshold.'}
                </p>
              </div>
            </div>
          </div>
        );

      // 2. CURRICULUM MODEL
      case 'curriculum':
        return (
          <div>
            <div style={{ marginBottom: '1rem' }}>
              <p style={{ fontSize: '0.86rem', color: '#4A5568', margin: '0 0 0.75rem 0', lineHeight: 1.5 }}>
                {language === 'hi'
                  ? 'खान व्यावसायिक प्रशिक्षण नियमावली, 1966 (MVTR 1966) एवं कोयला खान विनियम, 2017 (CMR 2017) के तहत अनिवार्य 5 प्रमुख सुरक्षा मॉड्यूल:'
                  : language === 'sat'
                  ? 'ᱠᱷᱟᱫᱟᱱ ᱥᱮᱪᱮᱫ ᱱᱤᱭᱚᱢ ᱑᱙᱖᱖ (MVTR 1966) ᱟᱨ CMR ᱒᱐᱑᱗ ᱞᱮᱠᱟᱛᱮ ᱕ ᱜᱚᱴᱟᱝ ᱨᱩᱠᱷᱤᱭᱟᱹ ᱢᱚᱰᱩᱞ:'
                  : '5 mandatory vocational training modules strictly aligned with Mines Vocational Training Rules (MVTR 1966) and Coal Mines Regulations (CMR 2017):'}
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[
                {
                  code: 'MOD-001',
                  title: language === 'hi' ? 'अग्नि एवं विस्फोट आपातकालीन प्रतिक्रिया' : language === 'sat' ? 'ᱥᱮᱸᱜᱮᱞ ᱟᱨ ᱵᱚᱢ ᱨᱩᱠᱷᱤᱭᱟᱹ' : 'Fire & Explosion Emergency Response Protocol',
                  desc: language === 'hi' ? 'कोयला धूल एवं मीथेन विस्फोट गतिशीलता, अग्नि के प्रकार, 4-चरणीय PASS अग्निशामक तकनीक, वायु निकासी मार्ग।' : 'Coal dust & methane fire dynamics, fire classes (A,B,C,Electrical), 4-step PASS extinguisher technique, intake airway escape routing.'
                },
                {
                  code: 'MOD-002',
                  title: language === 'hi' ? 'विषाक्त एवं ज्वलनशील गैस संकट प्रतिक्रिया' : language === 'sat' ? 'ᱵᱤᱥ ᱜᱮᱥ ᱨᱩᱠᱷᱤᱭᱟᱹ' : 'Toxic & Flammable Gas Ingress Response',
                  desc: language === 'hi' ? 'मल्टी-गैस डिटेक्टर वाचन (CH4 > 0.75%, CO, H2S), 30 सेकंड में सेल्फ-रेस्क्यूअर पहनना, आपातकालीन बैरिकेडिंग।' : 'Multi-gas detector monitoring (CH4 > 0.75%, CO > 50ppm, H2S), SCSR self-rescuer donning under 30 seconds, emergency barricade protocol.'
                },
                {
                  code: 'MOD-003',
                  title: language === 'hi' ? 'भूमिगत भारी मशीनरी एवं कन्वेयर सुरक्षा' : language === 'sat' ? 'ᱠᱷᱟᱫᱟᱱ ᱢᱮᱥᱤᱱ ᱟᱨ ᱠᱚᱱᱵᱷᱮᱭᱟᱨ ᱨᱩᱠᱷᱤᱭᱟᱹ' : 'Underground Machinery & Conveyor Safety',
                  desc: language === 'hi' ? 'लॉकआउट-टैगआउट (LOTO) अलगाव, कन्वेयर आपातकालीन पुल-कॉर्ड का संचालन, निप-पॉइंट सुरक्षा, पिंच पॉइंट से बचाव।' : 'Lockout-Tagout (LOTO) isolation, emergency trip wire / pull cord activation, nip point clearance, conveyor pinch hazard prevention.'
                },
                {
                  code: 'MOD-004',
                  title: language === 'hi' ? 'ब्लास्टिंग एवं विद्युत खतरा अलगाव' : language === 'sat' ? 'ᱵᱞᱟᱥᱴᱤᱝ ᱟᱨ ᱵᱤᱡᱽᱞᱤ ᱨᱩᱠᱷᱤᱭᱟᱹ' : 'Blasting & Electrical Hazard Isolation',
                  desc: language === 'hi' ? 'शॉटफायरिंग चेतावनी संकेत, वैधानिक 300 मीटर खतरे का घेरा, एक्सप्लोडर सर्किट अलगाव, फ्लेमप्रूफ बाड़े।' : 'Shotfiring alarm protocol, statutory 300m danger cordon clearance, exploder circuit isolation, flameproof switchgear verification.'
                },
                {
                  code: 'MOD-005',
                  title: language === 'hi' ? 'डीजीएमएस अनुमोदित पीपीई एवं प्रवेश प्रक्रिया' : language === 'sat' ? 'PPE ᱟᱨ ᱠᱷᱟᱫᱟᱱ ᱵᱚᱞᱚᱱ ᱨᱩᱠᱷᱤᱭᱟᱹ' : 'DGMS Approved PPE & Ingress Inspection',
                  desc: language === 'hi' ? 'कैप लैंप पूर्व-परीक्षण, हेलमेट एवं चिन स्ट्रैप जांच, स्टील-टो बूट, डस्ट मास्क एवं गैस टेस्ट किट की पूर्ण जांच।' : 'Cap lamp beam test, helmet chin strap tensioning, steel-toe boot inspection, dust respirator filter fitting, SCSR seal checks.'
                }
              ].map((m, idx) => (
                <div key={m.code} style={{ border: '1px solid #E2E8F0', borderRadius: '4px', padding: '0.85rem 1rem', background: '#F8FAFC' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <span className="font-mono" style={{ fontSize: '0.75rem', fontWeight: '800', color: '#0c4e7e', background: '#E0F2FE', padding: '0.15rem 0.45rem', borderRadius: '2px' }}>
                      {m.code}
                    </span>
                    <span style={{ fontSize: '0.72rem', color: '#1E7B34', fontWeight: '700' }}>
                      {language === 'hi' ? 'उत्तीर्ण मानक: ≥ 80%' : 'Pass Standard: ≥ 80%'}
                    </span>
                  </div>
                  <div style={{ fontWeight: '700', fontSize: '0.88rem', color: '#1A202C', marginBottom: '0.25rem' }}>
                    {m.title}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#64748B' }}>
                    {m.desc}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      // 3. RTI DISCLOSURES
      case 'rti':
        return (
          <div>
            <div className="gov-card" style={{ padding: '1.25rem', marginBottom: '1rem', borderLeft: '4px solid #1E7B34', background: '#F8FAFC' }}>
              <h4 style={{ margin: '0 0 0.5rem 0', color: '#1E7B34', fontSize: '1rem', fontWeight: '800' }}>
                {language === 'hi' ? 'सूचना का अधिकार अधिनियम, 2005 (धारा 4(1)(बी))' : language === 'sat' ? 'RTI ᱟᱹᱱ ᱒᱐᱐᱕ (ᱫᱷᱟᱨᱟ 4(1)(b))' : 'RTI Act 2005 Proactive Disclosures'}
              </h4>
              <p style={{ fontSize: '0.84rem', color: '#4A5568', margin: 0, lineHeight: 1.6 }}>
                {language === 'hi'
                  ? 'खान एवं भूतत्व विभाग (झारखंड सरकार) तथा डीजीएमएस व्यावसायिक सुरक्षा प्रशिक्षण मानकों के तहत पारदर्शिता एवं खुला शासन सुनिश्चित करने हेतु यह स्वैच्छिक प्रकटीकरण प्रकाशित किया गया है।'
                  : 'Proactive disclosures published under Section 4(1)(b) of the Right to Information Act, 2005 to ensure transparent governance in mining safety compliance.'}
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{ border: '1px solid #E2E8F0', borderRadius: '4px', padding: '1rem', background: '#FFFFFF' }}>
                <div style={{ fontSize: '0.72rem', color: '#64748B', textTransform: 'uppercase', fontWeight: '700' }}>
                  {language === 'hi' ? 'लोक सूचना अधिकारी (पीआईओ)' : 'Public Information Officer (PIO)'}
                </div>
                <div style={{ fontWeight: '700', fontSize: '0.88rem', color: '#0c4e7e', marginTop: '0.25rem' }}>
                  {language === 'hi' ? 'संयुक्त निदेशक (खान प्रशिक्षण एवं प्रशासन)' : 'Joint Director (Mines Training & Administration)'}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#4A5568', marginTop: '0.25rem' }}>
                  {language === 'hi' ? 'खान भवन, डोरंडा, राँची - 834002' : 'Mines Bhavan, Doranda, Ranchi - 834002'}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#0c4e7e', marginTop: '0.25rem', fontFamily: 'monospace' }}>
                  pio-mines[at]jharkhand[dot]gov[dot]in
                </div>
              </div>

              <div style={{ border: '1px solid #E2E8F0', borderRadius: '4px', padding: '1rem', background: '#FFFFFF' }}>
                <div style={{ fontSize: '0.72rem', color: '#64748B', textTransform: 'uppercase', fontWeight: '700' }}>
                  {language === 'hi' ? 'प्रथम अपीलीय प्राधिकारी (एफएए)' : 'First Appellate Authority (FAA)'}
                </div>
                <div style={{ fontWeight: '700', fontSize: '0.88rem', color: '#0c4e7e', marginTop: '0.25rem' }}>
                  {language === 'hi' ? 'विशेष सचिव (खान एवं भूतत्व विभाग)' : 'Special Secretary to Government (Mines & Geology)'}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#4A5568', marginTop: '0.25rem' }}>
                  {language === 'hi' ? 'प्रोजेक्ट भवन, धुर्वा, राँची - 834004' : 'Project Building, Dhurwa, Ranchi - 834004'}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#0c4e7e', marginTop: '0.25rem', fontFamily: 'monospace' }}>
                  appellate-mines[at]jharkhand[dot]gov[dot]in
                </div>
              </div>
            </div>

            <div style={{ border: '1px solid #E2E8F0', borderRadius: '4px', padding: '0.85rem 1rem', background: '#F8FAFC' }}>
              <div style={{ fontWeight: '700', fontSize: '0.82rem', color: '#1A202C', marginBottom: '0.35rem' }}>
                {language === 'hi' ? 'पारदर्शिता एवं ऑडिट बहीखाता (Audit Trail)' : 'Transparency & Cryptographic Audit Trail'}
              </div>
              <p style={{ fontSize: '0.78rem', color: '#64748B', margin: 0, lineHeight: 1.5 }}>
                {language === 'hi'
                  ? 'सभी प्रशिक्षण सत्र, मूल्यांकन स्कोर एवं जारी किए गए क्यूआर सुरक्षा पासपोर्ट केंद्रीकृत बहीखाते में डिजिटल रूप से दर्ज होते हैं। किसी भी रिकॉर्ड का सत्यापन 64-अक्षर हैश या क्यूआर स्कैन द्वारा तुरंत संभव है।'
                  : 'All worker training attempts, drill scores, and issued safety passports are cryptographically signed with HMAC-SHA256 and immutably recorded in the state compliance ledger.'}
              </p>
            </div>
          </div>
        );

      // 4. EVALUATION TEAM (SIH 2026 PS ID: 26041)
      case 'evaluation':
        return (
          <div>
            <div className="gov-card" style={{ padding: '1.25rem', marginBottom: '1.25rem', borderLeft: '4px solid #0c4e7e', background: '#F0F9FF' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <span className="gov-badge-navy" style={{ marginBottom: '0.35rem', display: 'inline-block' }}>
                    SMART INDIA HACKATHON 2026
                  </span>
                  <h4 style={{ margin: '0.2rem 0', color: '#0c4e7e', fontSize: '1.05rem', fontWeight: '800' }}>
                    Problem Statement ID: 26041
                  </h4>
                  <p style={{ fontSize: '0.82rem', color: '#0369A1', margin: 0, fontWeight: '600' }}>
                    AR-Based Vocational Safety Simulator & Digital Passports for Mining & Industrial Workforce
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className="gov-badge-green">
                    Academic Prototype
                  </span>
                </div>
              </div>
            </div>

            {/* Prototype Capabilities Walkthrough */}
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontWeight: '700', fontSize: '0.85rem', color: '#1A202C', marginBottom: '0.5rem' }}>
                {language === 'hi' ? 'मूल्यांकन हेतु 4-आयामी प्रणाली वास्तुकला:' : 'Four Pillars for Evaluation Demonstration:'}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
                <div style={{ border: '1px solid #E2E8F0', borderRadius: '4px', padding: '0.75rem', background: '#FFFFFF' }}>
                  <div style={{ fontWeight: '700', fontSize: '0.8rem', color: '#0c4e7e' }}>1. Frontline Worker AR</div>
                  <div style={{ fontSize: '0.74rem', color: '#64748B', marginTop: '0.2rem' }}>
                    PASS fire extinguisher drill + toxic gas detection simulation + Santali audio voiceover.
                  </div>
                </div>
                <div style={{ border: '1px solid #E2E8F0', borderRadius: '4px', padding: '0.75rem', background: '#FFFFFF' }}>
                  <div style={{ fontWeight: '700', fontSize: '0.8rem', color: '#0c4e7e' }}>2. Safety Officer Console</div>
                  <div style={{ fontSize: '0.74rem', color: '#64748B', marginTop: '0.2rem' }}>
                    Colliery workforce roster, multilingual search, literacy indicators, recruit onboarding.
                  </div>
                </div>
                <div style={{ border: '1px solid #E2E8F0', borderRadius: '4px', padding: '0.75rem', background: '#FFFFFF' }}>
                  <div style={{ fontWeight: '700', fontSize: '0.8rem', color: '#0c4e7e' }}>3. DGMS Verifier</div>
                  <div style={{ fontSize: '0.74rem', color: '#64748B', marginTop: '0.2rem' }}>
                    SHA-256 HMAC cryptographic certificate validation & instant offline QR code scanner.
                  </div>
                </div>
                <div style={{ border: '1px solid #E2E8F0', borderRadius: '4px', padding: '0.75rem', background: '#FFFFFF' }}>
                  <div style={{ fontWeight: '700', fontSize: '0.8rem', color: '#0c4e7e' }}>4. State Nodal Analytics</div>
                  <div style={{ fontSize: '0.74rem', color: '#64748B', marginTop: '0.2rem' }}>
                    Statewide compliance heatmap across 24 districts, predictive risk, training velocity KPIs.
                  </div>
                </div>
              </div>
            </div>

            {/* Test Credentials for Evaluators */}
            <div style={{ border: '1px solid #CBD5E1', borderRadius: '4px', padding: '1rem', background: '#F8FAFC', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <Terminal size={16} color="#0c4e7e" />
                <strong style={{ fontSize: '0.85rem', color: '#0c4e7e' }}>
                  {language === 'hi' ? 'मूल्यांकन दल हेतु परीक्षण साख (Test Credentials)' : 'Evaluation Demonstration Credentials:'}
                </strong>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.8rem' }}>
                <div style={{ background: '#FFFFFF', padding: '0.65rem', borderRadius: '3px', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontWeight: '700', color: '#1A202C' }}>Worker Login:</div>
                  <div style={{ color: '#64748B' }}>Code: <code style={{ color: '#0c4e7e' }}>JH-WRK-001</code> | PIN: <code style={{ color: '#0c4e7e' }}>1234</code></div>
                </div>
                <div style={{ background: '#FFFFFF', padding: '0.65rem', borderRadius: '3px', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontWeight: '700', color: '#1A202C' }}>Regulatory Roles:</div>
                  <div style={{ color: '#64748B' }}>User: <code style={{ color: '#0c4e7e' }}>officer / dgms / statenodal</code></div>
                  <div style={{ color: '#64748B' }}>Password: <code style={{ color: '#0c4e7e' }}>password123</code></div>
                </div>
              </div>
            </div>

            {/* Official Team Roster Card (Team ECLIPSE • Parul University) */}
            {(() => {
              const isHi = language === 'hi';
              const isSat = language === 'sat';
              const roster = {
                teamName: isHi ? 'टीम ECLIPSE' : isSat ? 'ᱴᱤᱢ ECLIPSE' : 'TEAM ECLIPSE',
                prototypeBadge: isHi ? 'SIH 2026 प्रोटोटाइप' : isSat ? 'SIH ᱒᱐᱒᱖ ᱯᱨᱳᱴᱳᱴᱟᱭᱤᱯ' : 'SIH 2026 Prototype',
                college: isHi ? 'पारुल विश्वविद्यालय (Parul University)' : isSat ? 'ᱯᱟᱨᱩᱞ ᱡᱮᱜᱮᱛ ᱵᱤᱨᱫᱟᱹᱜᱟᱲ (Parul University)' : 'Parul University',
                mentorLabel: isHi ? 'संकाय सलाहकार (मेंटर):' : isSat ? 'ᱯᱷᱮᱠᱟᱞᱴᱤ ᱢᱮᱱᱴᱚᱨ:' : 'Faculty Mentor:',
                mentorName: 'Prof. DINESH SWAMI',
                psLabel: isHi ? 'समस्या विवरण' : isSat ? 'ᱥᱚᱢᱚᱥᱭᱟ ᱵᱤᱵᱚᱨᱚᱬ' : 'Problem Statement',
                sectionTitle: isHi ? 'परियोजना दल सदस्य एवं दायित्व:' : isSat ? 'ᱯᱨᱳᱡᱮᱠᱴ ᱴᱤᱢ ᱨᱟᱹᱥᱤᱭᱟᱹ ᱟᱨ ᱠᱟᱹᱢᱤ:' : 'Project Team Members & Roles:',
                members: [
                  {
                    name: 'Patel Manan Dharmendra',
                    role: isHi ? 'लीड एवं बैकएंड डेवलपर' : isSat ? 'ᱞᱤᱰ ᱟᱨ ᱵᱮᱠᱮᱱᱰ ᱰᱮᱵᱷᱞᱚᱯᱟᱨ' : 'Lead & Backend Developer',
                    category: isHi ? 'दल प्रमुख (Team Leader)' : isSat ? 'ᱴᱤᱢ ᱞᱤᱰᱟᱨ (Team Leader)' : 'Team Leader',
                    isLeader: true,
                  },
                  {
                    name: 'Shubh Singh',
                    role: isHi ? 'फ्रंटएंड डेवलपर' : isSat ? 'ᱯᱷᱨᱚᱱᱴᱮᱱᱰ ᱰᱮᱵᱷᱞᱚᱯᱟᱨ' : 'Frontend Developer',
                    category: isHi ? 'फ्रंटएंड इंजीनियरिंग' : isSat ? 'ᱯᱷᱨᱚᱱᱴᱮᱱᱰ ᱤᱧᱡᱤᱱᱤᱭᱟᱹᱨᱤᱝ' : 'Frontend Engineering',
                    isLeader: false,
                  },
                  {
                    name: 'Priyam Patel',
                    role: isHi ? 'डेटाबेस इंजीनियर' : isSat ? 'ᱰᱮᱴᱟᱵᱮᱥ ᱤᱧᱡᱤᱱᱤᱭᱟᱹᱨ' : 'Database Engineer',
                    category: isHi ? 'डेटाबेस आर्किटेक्चर' : isSat ? 'ᱰᱮᱴᱟᱵᱮᱥ ᱟᱨᱠᱤᱴᱮᱠᱪᱟᱨ' : 'Database Architecture',
                    isLeader: false,
                  },
                  {
                    name: 'Taha Chasmawala',
                    role: isHi ? 'UI/UX डिज़ाइनर' : isSat ? 'UI/UX ᱰᱤᱡᱟᱭᱱᱟᱨ' : 'UI/UX Designer',
                    category: isHi ? 'यूज़र इंटरफेस एवं अनुभव' : isSat ? 'ᱵᱮᱵᱷᱟᱨᱤᱭᱟᱹ ᱟᱹᱭᱠᱟᱹᱣ' : 'User Experience',
                    isLeader: false,
                  },
                  {
                    name: 'Vaishnavi Pandey',
                    role: isHi ? 'डेवऑप्स डेवलपर' : isSat ? 'ᱰᱮᱵᱷᱳᱯᱥ ᱰᱮᱵᱷᱞᱚᱯᱟᱨ' : 'DevOps Developer',
                    category: isHi ? 'क्लाउड एवं CI/CD पाइपलाइन' : isSat ? 'ᱠᱞᱟᱣᱰ ᱟᱨ CI/CD ᱯᱟᱭᱤᱯᱞᱟᱭᱤᱱ' : 'Cloud & CI/CD Pipeline',
                    isLeader: false,
                  },
                  {
                    name: 'Hrutvi Baldaniya',
                    role: isHi ? 'गुणवत्ता (QA) + सुरक्षा डेवलपर' : isSat ? 'QA ᱟᱨ ᱨᱩᱠᱷᱤᱭᱟᱹ ᱰᱮᱵᱷᱞᱚᱯᱟᱨ' : 'QA + Security Developer',
                    category: isHi ? 'गुणवत्ता एवं वैधानिक सुरक्षा' : isSat ? 'ᱜᱩᱬ ᱟᱨ ᱟᱹᱱ ᱚᱰᱤᱴ' : 'Quality & Statutory Audits',
                    isLeader: false,
                  },
                ],
              };

              return (
                <div style={{ border: '2px solid #0c4e7e', borderRadius: '6px', padding: '1.25rem', background: '#FFFFFF', boxShadow: '0 4px 12px rgba(12, 78, 126, 0.08)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                        <span className="gov-badge-navy" style={{ fontSize: '0.82rem', padding: '0.2rem 0.6rem', fontWeight: '800' }}>
                          {roster.teamName}
                        </span>
                        <span className="gov-badge-green" style={{ fontSize: '0.75rem' }}>
                          {roster.prototypeBadge}
                        </span>
                      </div>
                      <div style={{ fontWeight: '800', fontSize: '1.05rem', color: '#1A202C' }}>
                        {roster.college}
                      </div>
                      <div style={{ fontSize: '0.82rem', color: '#64748B', marginTop: '0.15rem' }}>
                        <strong>{roster.mentorLabel}</strong> <span style={{ color: '#0c4e7e', fontWeight: '700' }}>{roster.mentorName}</span>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.72rem', color: '#64748B', textTransform: 'uppercase', fontWeight: '700' }}>
                        {roster.psLabel}
                      </div>
                      <div style={{ fontSize: '0.95rem', fontWeight: '800', color: '#0c4e7e', fontFamily: 'monospace' }}>
                        PS ID: 26041
                      </div>
                    </div>
                  </div>

                  {/* Members Roster Grid */}
                  <div style={{ fontWeight: '700', fontSize: '0.82rem', color: '#4A5568', marginBottom: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {roster.sectionTitle}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
                    {roster.members.map((m, idx) => (
                      <div
                        key={idx}
                        style={{
                          border: m.isLeader ? '1px solid #93C5FD' : '1px solid #E2E8F0',
                          borderRadius: '4px',
                          padding: '0.75rem',
                          background: m.isLeader ? '#EFF6FF' : '#F8FAFC',
                          boxShadow: m.isLeader ? '0 2px 4px rgba(37, 99, 235, 0.08)' : 'none',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                          <span
                            style={{
                              fontSize: '0.68rem',
                              fontWeight: '800',
                              color: m.isLeader ? '#1E40AF' : '#64748B',
                              background: m.isLeader ? '#DBEAFE' : '#EDF2F7',
                              padding: '0.1rem 0.4rem',
                              borderRadius: '3px',
                              textTransform: 'uppercase',
                            }}
                          >
                            {m.category}
                          </span>
                        </div>
                        <div style={{ fontWeight: '800', fontSize: '0.9rem', color: m.isLeader ? '#073556' : '#1A202C' }}>
                          {m.name}
                        </div>
                        <div style={{ fontSize: '0.76rem', color: m.isLeader ? '#2563EB' : '#0c4e7e', fontWeight: '600', marginTop: '0.15rem' }}>
                          {m.role}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>
        );

      // 5. ACTS & RULES
      case 'acts':
        return (
          <div>
            <div style={{ marginBottom: '1rem' }}>
              <p style={{ fontSize: '0.85rem', color: '#4A5568', margin: 0, lineHeight: 1.55 }}>
                {language === 'hi'
                  ? 'यह सिमुलेशन प्रणाली भारत सरकार एवं झारखंड सरकार द्वारा अधिसूचित निम्नलिखित सांविधिक अधिनियमों एवं नियमों के अनुरूप संचालित होती है:'
                  : 'This prototype simulator is anchored in the statutory framework prescribed under Indian mining legislation:'}
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[
                {
                  title: 'The Mines Act, 1952 (Act No. 35 of 1952)',
                  desc: language === 'hi' 
                    ? 'खदानों में कार्यरत व्यक्तियों के स्वास्थ्य, सुरक्षा एवं कल्याण का मुख्य वैधानिक ढांचा। धारा 22, 23 एवं 57 के तहत डीजीएमएस को सुरक्षा मानकों के प्रवर्तन का अधिकार।'
                    : 'The foundational Parliamentary statute regulating working conditions, occupational health, welfare, and safety in all mines across India.'
                },
                {
                  title: 'Coal Mines Regulations, 2017 (CMR 2017)',
                  desc: language === 'hi'
                    ? 'कोयला खदानों में वेंटिलेशन, गैस निगरानी, अग्नि रोकथाम, ब्लास्टिंग एवं यांत्रिक सुरक्षा के विस्तृत वैधानिक नियम। विनियम 104, 129 एवं 130।'
                    : 'Comprehensive statutory regulations governing ventilation, inflammable & noxious gases, fire containment, and machinery operation in underground coal mines.'
                },
                {
                  title: 'Mines Vocational Training Rules, 1966 (MVTR 1966)',
                  desc: language === 'hi'
                    ? 'प्रत्येक खनिक के लिए कार्य प्रारंभ करने से पूर्व प्रारंभिक एवं समय-समय पर पुनश्चर्या (Refresher) सुरक्षा प्रशिक्षण की वैधानिक अनिवार्यता।'
                    : 'Mandates initial and periodic refresher safety training for all mine workers prior to deployment in underground or opencast workings.'
                },
                {
                  title: 'The Mines Rules, 1955',
                  desc: language === 'hi'
                    ? 'खदानों में प्राथमिक चिकित्सा स्टेशन, आपातकालीन एम्बुलेंस, पेयजल, स्वच्छता एवं श्रमिक कल्याण समिति के वैधानिक प्रावधान।'
                    : 'Statutory rules governing first aid provisions, occupational health check-ups, pithead baths, canteens, and safety committees.'
                },
                {
                  title: 'Indian Copyright Act, 1957 (Section 52 - Fair Dealing)',
                  desc: language === 'hi'
                    ? 'शैक्षणिक प्रदर्शन, तकनीकी अनुसंधान एवं हैकाथॉन मूल्यांकन हेतु सांविधिक मानकों एवं प्रतीकों का गैर-व्यावसायिक उपयोग निष्पक्ष व्यवहार के तहत संरक्षित है।'
                    : 'All statutory names and regulatory benchmarks are referenced strictly under Fair Dealing provisions for educational demonstration and competition evaluation.'
                }
              ].map((act, i) => (
                <div key={i} style={{ border: '1px solid #E2E8F0', borderRadius: '4px', padding: '0.85rem 1rem', background: '#F8FAFC' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <Scale size={16} color="#0c4e7e" />
                    <strong style={{ fontSize: '0.88rem', color: '#0c4e7e' }}>{act.title}</strong>
                  </div>
                  <p style={{ fontSize: '0.78rem', color: '#4A5568', margin: 0, lineHeight: 1.5 }}>
                    {act.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        );

      // 6. SAFETY FRAMEWORK
      case 'safety':
        return (
          <div>
            <div className="gov-card" style={{ padding: '1.25rem', marginBottom: '1.25rem', borderLeft: '4px solid #0c4e7e', background: '#F8FAFC' }}>
              <h4 style={{ margin: '0 0 0.5rem 0', color: '#0c4e7e', fontSize: '1rem', fontWeight: '800' }}>
                {language === 'hi' ? 'डीजीएमएस सुरक्षा प्रबंधन योजना (SMP) एवं हिरा (HIRA)' : 'DGMS Safety Management Plan & HIRA Framework'}
              </h4>
              <p style={{ fontSize: '0.84rem', color: '#4A5568', margin: 0, lineHeight: 1.6 }}>
                {language === 'hi'
                  ? 'खान सुरक्षा महानिदेशालय (DGMS) के दिशानिर्देशों के अनुसार, यह मंच जोखिम पहचान एवं मूल्यांकन (HIRA) पद्धति को डिजिटल रूप से लागू करता है ताकि शून्य-हानि (Zero-Harm) लक्ष्य को प्राप्त किया जा सके।'
                  : 'In compliance with DGMS directives and National Safety Conferences on Mines, this platform digitizes Hazard Identification & Risk Assessment (HIRA) to pursue zero-harm colliery operations.'}
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{ border: '1px solid #E2E8F0', borderRadius: '4px', padding: '1rem', background: '#FFFFFF' }}>
                <div style={{ fontWeight: '700', fontSize: '0.88rem', color: '#B91C1C', marginBottom: '0.35rem' }}>
                  {language === 'hi' ? '1. जोखिम पहचान (HIRA Matrix)' : '1. Hazard Identification (HIRA)'}
                </div>
                <p style={{ fontSize: '0.78rem', color: '#64748B', margin: 0, lineHeight: 1.5 }}>
                  {language === 'hi'
                    ? 'छत गिरने (Roof Fall), गैस रिसाव, आग एवं यांत्रिक दुर्घटनाओं की संभावना व गंभीरता का सतत मूल्यांकन।'
                    : 'Dynamic probability vs severity rating matrix for roof falls, coal dust explosions, and toxic gas bursts.'}
                </p>
              </div>

              <div style={{ border: '1px solid #E2E8F0', borderRadius: '4px', padding: '1rem', background: '#FFFFFF' }}>
                <div style={{ fontWeight: '700', fontSize: '0.88rem', color: '#0c4e7e', marginBottom: '0.35rem' }}>
                  {language === 'hi' ? '2. मानक संचालन प्रक्रिया (SOP)' : '2. Standard Operating Procedures (SOP)'}
                </div>
                <p style={{ fontSize: '0.78rem', color: '#64748B', margin: 0, lineHeight: 1.5 }}>
                  {language === 'hi'
                    ? 'आपात स्थिति में 30 सेकंड के भीतर सेल्फ-रेस्क्यूअर पहनना और पूर्व-निर्धारित इंटेक एयरवे से सुरक्षित निकासी।'
                    : 'Step-by-step P.A.S.S. protocol, 30-second SCSR donning, and intake airway egress route guidance.'}
                </p>
              </div>

              <div style={{ border: '1px solid #E2E8F0', borderRadius: '4px', padding: '1rem', background: '#FFFFFF' }}>
                <div style={{ fontWeight: '700', fontSize: '0.88rem', color: '#1E7B34', marginBottom: '0.35rem' }}>
                  {language === 'hi' ? '3. डिजिटल सुरक्षा पासपोर्ट' : '3. Digital Safety Passports'}
                </div>
                <p style={{ fontSize: '0.78rem', color: '#64748B', margin: 0, lineHeight: 1.5 }}>
                  {language === 'hi'
                    ? 'कामगारों के सफल प्रशिक्षण के बाद एचएमएसी हस्ताक्षरित डिजिटल प्रमाणपत्र, जो खदान बदलने पर भी मान्य रहता है।'
                    : 'HMAC-SHA256 authenticated digital credential that travels with the miner across colliery transfers.'}
                </p>
              </div>

              <div style={{ border: '1px solid #E2E8F0', borderRadius: '4px', padding: '1rem', background: '#FFFFFF' }}>
                <div style={{ fontWeight: '700', fontSize: '0.88rem', color: '#6B21A8', marginBottom: '0.35rem' }}>
                  {language === 'hi' ? '4. वास्तविक समय राज्य हीटमैप' : '4. Statewide Risk Heatmaps'}
                </div>
                <p style={{ fontSize: '0.78rem', color: '#64748B', margin: 0, lineHeight: 1.5 }}>
                  {language === 'hi'
                    ? 'झारखंड के सभी 24 जिलों के खदान समूहों में सुरक्षा अनुपालन का लाइव स्कोर और रिफ्रेशर प्रशिक्षण चेतावनी।'
                    : 'Live predictive district risk indicators alert safety inspectors before mandatory annual certificates expire.'}
                </p>
              </div>
            </div>
          </div>
        );

      // 7. SCREEN READER ACCESS & KEYBOARD SHORTCUTS
      case 'screen_reader':
        return (
          <div>
            <div className="gov-card" style={{ padding: '1.25rem', marginBottom: '1.25rem', borderLeft: '4px solid #1E7B34', background: '#F8FAFC' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div>
                  <h4 style={{ margin: '0 0 0.35rem 0', color: '#1E7B34', fontSize: '1rem', fontWeight: '800' }}>
                    {language === 'hi' ? 'सुगमता एवं स्क्रीन रीडर दिशानिर्देश (GIGW 3.0 / WCAG 2.1 AA)' : 'Accessibility & Screen Reader Guidance'}
                  </h4>
                  <p style={{ fontSize: '0.82rem', color: '#4A5568', margin: 0 }}>
                    {language === 'hi' 
                      ? 'यह पोर्टल भारत सरकार के दिशानिर्देश (GIGW 3.0) एवं WCAG 2.1 AA मानकों के अनुरूप दृष्टिबाधित एवं दिव्यांग उपयोगकर्ताओं हेतु सुगम है।'
                      : 'Compliant with Guidelines for Indian Government Websites (GIGW 3.0) and W3C WCAG 2.1 Level AA accessibility standards.'}
                  </p>
                </div>
                {speak && (
                  <button
                    type="button"
                    onClick={() => {
                      const textToRead = language === 'hi'
                        ? 'झारखंड एआर व्यावसायिक सुरक्षा सिमुलेटर। यह पोर्टल खान सुरक्षा महानिदेशालय और झारखंड सरकार के मानकों पर आधारित है।'
                        : language === 'sat'
                        ? 'ᱡᱷᱟᱨᱠᱷᱚᱸᱰ AR ᱨᱩᱠᱷᱤᱭᱟᱹ ᱥᱮᱪᱮᱫ ᱯᱳᱨᱴᱟᱞ᱾ ᱱᱚᱶᱟ ᱫᱚ ᱠᱷᱟᱫᱟᱱ ᱠᱟᱹᱢᱤᱭᱟᱹ ᱠᱚ ᱞᱟᱹᱜᱤᱫ ᱠᱟᱱᱟ᱾'
                        : 'Jharkhand AR Vocational Mining Safety Simulator. Developed for Smart India Hackathon 2026 Problem Statement 26041.';
                      speak(textToRead);
                    }}
                    className="gov-btn-primary"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.45rem 0.85rem', fontSize: '0.8rem' }}
                  >
                    <Volume2 size={15} />
                    {language === 'hi' ? 'पृष्ठ सारांश सुनें' : language === 'sat' ? 'ᱥᱟᱦᱴᱟ ᱟᱲᱟᱝ ᱟᱸᱡᱚᱢ' : 'Hear Page Audio Summary'}
                  </button>
                )}
              </div>
            </div>

            {/* Keyboard Shortcuts Matrix */}
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <Keyboard size={16} color="#0c4e7e" />
                <strong style={{ fontSize: '0.86rem', color: '#0c4e7e' }}>
                  {language === 'hi' ? 'कीबोर्ड शॉर्टकट कुंजियां (Keyboard Navigation Shortcuts)' : 'Standard Keyboard Navigation Shortcuts:'}
                </strong>
              </div>

              <div style={{ border: '1px solid #E2E8F0', borderRadius: '4px', overflow: 'hidden' }}>
                <table className="gov-table" style={{ margin: 0, fontSize: '0.8rem' }}>
                  <thead>
                    <tr>
                      <th style={{ width: '35%' }}>{language === 'hi' ? 'कुंजी संयोजन (Key)' : 'Key Combination'}</th>
                      <th>{language === 'hi' ? 'कार्य (Function)' : 'Assigned Action'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><kbd style={{ background: '#E2E8F0', padding: '0.15rem 0.45rem', borderRadius: '3px', fontWeight: '700' }}>Alt + 1</kbd></td>
                      <td>{language === 'hi' ? 'मुख्य सामग्री पर जाएं (Skip to Main Content)' : 'Skip directly to main content area'}</td>
                    </tr>
                    <tr>
                      <td><kbd style={{ background: '#E2E8F0', padding: '0.15rem 0.45rem', borderRadius: '3px', fontWeight: '700' }}>Alt + 2</kbd></td>
                      <td>{language === 'hi' ? 'कामगार कार्यस्थल / एआर अभ्यास' : 'Frontline Worker AR Drills portal'}</td>
                    </tr>
                    <tr>
                      <td><kbd style={{ background: '#E2E8F0', padding: '0.15rem 0.45rem', borderRadius: '3px', fontWeight: '700' }}>Alt + 3</kbd></td>
                      <td>{language === 'hi' ? 'नियामक प्रशासन कंसोल (Admin)' : 'Regulatory Administration console'}</td>
                    </tr>
                    <tr>
                      <td><kbd style={{ background: '#E2E8F0', padding: '0.15rem 0.45rem', borderRadius: '3px', fontWeight: '700' }}>Alt + V</kbd></td>
                      <td>{language === 'hi' ? 'ध्वनि मार्गदर्शन चालू / बंद करें' : 'Toggle voice synthesis narration on/off'}</td>
                    </tr>
                    <tr>
                      <td><kbd style={{ background: '#E2E8F0', padding: '0.15rem 0.45rem', borderRadius: '3px', fontWeight: '700' }}>Alt + L</kbd></td>
                      <td>{language === 'hi' ? 'भाषा बदलें (English / हिन्दी / ᱥᱟᱱᱛᱟᱲᱤ)' : 'Cycle portal display language'}</td>
                    </tr>
                    <tr>
                      <td><kbd style={{ background: '#E2E8F0', padding: '0.15rem 0.45rem', borderRadius: '3px', fontWeight: '700' }}>Escape</kbd></td>
                      <td>{language === 'hi' ? 'सक्रिय संवाद / मोडल बंद करें' : 'Dismiss active dialog or notification modal'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div style={{ fontSize: '0.78rem', color: '#64748B', lineHeight: 1.5 }}>
              {language === 'hi'
                ? 'यह पोर्टल NVDA, JAWS, macOS VoiceOver एवं Android TalkBack स्क्रीन रीडर्स के साथ पूर्णतः संगत है।'
                : 'Fully compatible with standard assistive technology including NVDA, JAWS, Apple VoiceOver, and Android TalkBack.'}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Modal Title Mapping
  const getModalTitle = () => {
    switch (activeModal) {
      case 'simulator':
        return t.footerLinkSimulator || 'Simulator Info';
      case 'curriculum':
        return t.footerLinkCurriculum || 'Curriculum Model';
      case 'rti':
        return t.footerLinkRti || 'RTI Disclosures';
      case 'evaluation':
        return t.footerLinkEvaluation || 'Evaluation Team';
      case 'acts':
        return t.footerLinkActs || 'Acts & Rules';
      case 'safety':
        return t.footerLinkSafety || 'Safety Framework';
      case 'screen_reader':
        return t.footerLinkScreenReader || 'Screen Reader Access';
      default:
        return 'Information';
    }
  };

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(7, 53, 86, 0.72)',
        backdropFilter: 'blur(3px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '1rem',
        animation: 'fadeIn 0.18s ease-out'
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="footer-policy-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        ref={modalRef}
        className="gov-card" 
        style={{
          maxWidth: '780px',
          width: '100%',
          maxHeight: '88vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.35)',
          borderTop: '4px solid #0c4e7e',
          overflow: 'hidden',
          background: '#FFFFFF',
          borderRadius: '4px',
          padding: 0
        }}
      >
        {/* Modal Header */}
        <div style={{
          padding: '1rem 1.5rem',
          borderBottom: '2px solid #E2E8F0',
          background: '#FFFFFF',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexShrink: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <AshokaLionCapital size={30} color="#0c4e7e" showMotto={false} />
            <div>
              <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: '700', textTransform: 'uppercase' }}>
                {language === 'hi' ? 'खान एवं भूतत्व विभाग • झारखंड सरकार' : language === 'sat' ? 'ᱠᱷᱟᱫᱟᱱ ᱟᱨ ᱚᱛᱱᱚᱜ ᱵᱤᱵᱷᱟᱜᱽ' : 'Govt of Jharkhand • Dept of Mines & Geology'}
              </div>
              <h3 id="footer-policy-modal-title" style={{ margin: '0.1rem 0 0 0', fontSize: '1.2rem', fontWeight: '800', color: '#0c4e7e', fontFamily: 'var(--font-heading)' }}>
                {getModalTitle()}
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: '#64748B',
              padding: '0.4rem',
              borderRadius: '3px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={22} />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div style={{
          padding: '1.5rem',
          overflowY: 'auto',
          flex: '1 1 auto',
          color: '#1A202C'
        }}>
          {renderContent()}
        </div>

        {/* Modal Footer Controls */}
        <div style={{
          padding: '0.85rem 1.5rem',
          borderTop: '1px solid #E2E8F0',
          background: '#F8FAFC',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexShrink: 0
        }}>
          <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: '600' }}>
            {t.sihTitle || 'SIH 2026 • PS ID: 26041'}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="gov-btn-primary"
            style={{ padding: '0.45rem 1.25rem', fontSize: '0.82rem' }}
          >
            {language === 'hi' ? 'बंद करें' : language === 'sat' ? 'ᱵᱚᱸᱫᱽ' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
}
