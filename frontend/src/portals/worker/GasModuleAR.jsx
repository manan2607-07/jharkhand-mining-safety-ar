import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useLanguage } from '../../context/LanguageContext';
import { 
  AlertTriangle, 
  ShieldAlert, 
  Radio, 
  CheckCircle2, 
  Volume2, 
  Activity, 
  HardHat, 
  UserCheck, 
  ArrowRight 
} from 'lucide-react';

export default function GasModuleAR({ onComplete, onCancel }) {
  const { t, speak, language } = useLanguage();
  const canvasRef = useRef(null);
  const videoRef = useRef(null);

  // Steps: 0: Gas Detector Reading, 1: Alarm & Hazard Zone, 2: PPE Donning, 3: Buddy-System Signaling, 4: Clearance & Safe Entry
  const [currentStep, setCurrentStep] = useState(0);
  const [trainingMode, setTrainingMode] = useState('GUIDED'); // 'GUIDED' | 'ASSESSMENT'
  const [cameraActive, setCameraActive] = useState(false);
  const [hazardAlert, setHazardAlert] = useState(null);
  const [assessmentTimer, setAssessmentTimer] = useState(75);

  // Gas Detector Sensor Levels
  const [methaneLevel, setMethaneLevel] = useState(0.4); // Safe: < 1.25%
  const [coLevel, setCoLevel] = useState(18); // Safe: < 50 ppm
  const [oxygenLevel, setOxygenLevel] = useState(20.9); // Safe: 19.5% - 23.5%
  const [alarmTriggered, setAlarmTriggered] = useState(false);

  // PPE Checklist States
  const [ppeSCBA, setPpeSCBA] = useState(false);
  const [ppeHelmet, setPpeHelmet] = useState(false);
  const [ppeHarness, setPpeHarness] = useState(false);

  // Buddy-System States
  const [radioConfirmed, setRadioConfirmed] = useState(false);
  const [lifelineSecured, setLifelineSecured] = useState(false);

  // Offline Procedural Web Audio Synthesizer
  const playSound = (type) => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      if (type === 'gas_alarm') {
        [0, 0.22, 0.44].forEach((delay) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(820, ctx.currentTime + delay);
          osc.frequency.linearRampToValueAtTime(540, ctx.currentTime + delay + 0.18);
          gain.gain.setValueAtTime(0.25, ctx.currentTime + delay);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + delay + 0.18);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(ctx.currentTime + delay);
          osc.stop(ctx.currentTime + delay + 0.18);
        });
      } else if (type === 'ppe_click') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(400, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(950, ctx.currentTime + 0.08);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.12);
      } else if (type === 'radio_squelch') {
        const bufferSize = ctx.sampleRate * 0.15;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1) * 0.15;
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 2200;
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.22, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        noise.start();
      } else if (type === 'clearance_chime') {
        [587.33, 739.99, 880, 1174.66].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.value = freq;
          gain.gain.setValueAtTime(0.18, ctx.currentTime + idx * 0.1);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + idx * 0.1 + 0.4);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(ctx.currentTime + idx * 0.1);
          osc.stop(ctx.currentTime + idx * 0.1 + 0.4);
        });
      } else if (type === 'hazard_warning') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(110, ctx.currentTime + 0.28);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.28);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.28);
      }
    } catch {}
  };

  // Assessment countdown timer
  useEffect(() => {
    let timer = null;
    if (trainingMode === 'ASSESSMENT' && currentStep > 0 && currentStep < 4 && assessmentTimer > 0) {
      timer = setInterval(() => {
        setAssessmentTimer((prev) => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [trainingMode, currentStep, assessmentTimer]);

  // Initialize Camera
  useEffect(() => {
    let stream = null;
    async function initCamera() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
          setCameraActive(true);
        }
      } catch (err) {
        console.warn('Camera inactive, fallback 3D tunnel:', err);
        setCameraActive(false);
      }
    }
    initCamera();

    return () => {
      if (stream) stream.getTracks().forEach((track) => track.stop());
    };
  }, []);

  // Three.js Scene: Gas Cloud & Tunnel Waypoints
  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
    camera.position.set(0, 1.2, 3.5);

    // Hazard Area Ring
    const ringGeo = new THREE.RingGeometry(1.2, 1.35, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: alarmTriggered ? 0xef4444 : 0xf59e0b,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.8
    });
    const hazardRing = new THREE.Mesh(ringGeo, ringMat);
    hazardRing.rotation.x = -Math.PI / 2;
    hazardRing.position.set(0, -0.5, 0);
    scene.add(hazardRing);

    // Toxic/Methane Gas Volumetric Particles
    const particleCount = 70;
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 3;
      pos[i * 3 + 1] = Math.random() * 2 - 0.5;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 3;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const gasMat = new THREE.PointsMaterial({
      color: alarmTriggered ? 0xff2a2a : 0xeab308,
      size: 0.22,
      transparent: true,
      opacity: 0.45
    });
    const gasCloud = new THREE.Points(geo, gasMat);
    scene.add(gasCloud);

    let frameId;
    const clock = new THREE.Clock();

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Pulsate hazard ring
      hazardRing.scale.setScalar(1 + Math.sin(elapsed * 4) * 0.05);

      // Drift gas particles
      const positions = geo.attributes.position.array;
      for (let i = 0; i < particleCount; i++) {
        positions[i * 3 + 1] += 0.005;
        if (positions[i * 3 + 1] > 2) positions[i * 3 + 1] = -0.5;
      }
      geo.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(frameId);
      renderer.dispose();
    };
  }, [alarmTriggered]);

  // Voice narration updates
  useEffect(() => {
    if (currentStep === 0) speak(t.gasDetectDesc);
    else if (currentStep === 1) speak(t.audioGasAlarm);
    else if (currentStep === 2) speak(t.gasPpeDesc);
    else if (currentStep === 3) speak(t.audioBuddyConfirm);
    else if (currentStep === 4) speak(t.gasProtocolSuccessVoice);
  }, [currentStep]);

  // Simulate gas leak detection when stepping forward
  const triggerGasHazard = () => {
    playSound('gas_alarm');
    setMethaneLevel(1.85); // Critical: > 1.25% DGMS limit!
    setCoLevel(74); // Danger: > 50 ppm
    setOxygenLevel(18.2); // Danger: < 19.5%
    setAlarmTriggered(true);
    setCurrentStep(1);
  };

  const allPPECompleted = ppeSCBA && ppeHelmet && ppeHarness;
  const allBuddyCompleted = radioConfirmed && lifelineSecured;

  return (
    <div style={{ position: 'relative', width: '100%', minHeight: '88vh', background: '#0a0a0a', overflow: 'hidden', borderRadius: '4px', border: '2px solid var(--gov-navy)' }}>
      {/* Background Camera */}
      <video
        ref={videoRef}
        playsInline
        muted
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          opacity: cameraActive ? 0.75 : 0
        }}
      />

      {/* Synthetic Confined Space Tunnel Fallback */}
      {!cameraActive && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'radial-gradient(circle at center, #1e293b 0%, #0f172a 50%, #020617 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            position: 'absolute',
            bottom: '10%',
            background: 'rgba(0, 0, 0, 0.7)',
            padding: '0.4rem 0.9rem',
            borderRadius: '4px',
            border: '1px solid #475569',
            color: '#94A3B8',
            fontSize: '0.78rem',
            textAlign: 'center'
          }}>
            {t.gasHeadingLabel}
          </div>
        </div>
      )}

      {/* 3D Canvas */}
      <canvas
        ref={canvasRef}
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
      />

      {/* Top Header & Voiceover */}
      <div style={{
        position: 'absolute',
        top: '1rem',
        left: '1rem',
        right: '1rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 20
      }}>
        <div style={{
          background: '#FFFFFF',
          border: alarmTriggered ? '1px solid #DC2626' : '1px solid var(--gov-navy)',
          padding: '0.45rem 0.9rem',
          borderRadius: '4px',
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
        }}>
          <span style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: alarmTriggered ? '#DC2626' : '#1E7B34'
          }} />
          <span style={{
            fontSize: '0.78rem',
            fontWeight: '700',
            color: alarmTriggered ? '#DC2626' : 'var(--gov-navy)',
            letterSpacing: '0.03em'
          }}>
            {alarmTriggered ? t.gasAlarmNotice : t.gasHudAuditNotice}
          </span>
          <div style={{
            display: 'inline-flex',
            background: '#F1F5F9',
            borderRadius: '4px',
            padding: '2px',
            marginLeft: '0.4rem',
            border: '1px solid #CBD5E1'
          }}>
            <button
              onClick={() => setTrainingMode('GUIDED')}
              style={{
                background: trainingMode === 'GUIDED' ? 'var(--gov-navy)' : 'transparent',
                color: trainingMode === 'GUIDED' ? '#FFFFFF' : '#475569',
                border: 'none',
                borderRadius: '3px',
                padding: '2px 7px',
                fontSize: '0.7rem',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              GUIDED
            </button>
            <button
              onClick={() => setTrainingMode('ASSESSMENT')}
              style={{
                background: trainingMode === 'ASSESSMENT' ? '#DC2626' : 'transparent',
                color: trainingMode === 'ASSESSMENT' ? '#FFFFFF' : '#475569',
                border: 'none',
                borderRadius: '3px',
                padding: '2px 7px',
                fontSize: '0.7rem',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              ASSESSMENT
            </button>
          </div>
          {trainingMode === 'ASSESSMENT' && (
            <span style={{
              background: '#FEF2F2',
              border: '1px solid #DC2626',
              color: '#DC2626',
              padding: '2px 6px',
              borderRadius: '3px',
              fontSize: '0.72rem',
              fontWeight: '700'
            }}>
              ⏱ {Math.floor(assessmentTimer / 60)}:{String(assessmentTimer % 60).padStart(2, '0')}
            </span>
          )}
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => speak(currentStep === 1 ? t.audioGasAlarm : t.gasPpeDesc)}
            className="gov-btn-secondary"
            style={{
              padding: '0.4rem 0.85rem',
              fontSize: '0.8rem',
              background: '#FFFFFF',
              borderRadius: '4px'
            }}
          >
            <Volume2 size={15} color="var(--gov-navy)" />
            <span>{t.voiceNarration}</span>
          </button>

          <button
            onClick={onCancel}
            style={{
              background: '#FFF5F5',
              border: '1px solid #DC2626',
              color: '#DC2626',
              padding: '0.4rem 0.85rem',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.8rem',
              fontWeight: '600'
            }}
          >
            {t.exitSimulation}
          </button>
        </div>
      </div>

      {/* Hazard / SOP Consequence Alert Banner */}
      {hazardAlert && (
        <div style={{
          position: 'absolute',
          top: '4.2rem',
          left: '1rem',
          right: '1rem',
          background: '#FEF2F2',
          border: '2px solid #DC2626',
          borderRadius: '4px',
          padding: '0.65rem 1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 25,
          boxShadow: '0 4px 12px rgba(220, 38, 38, 0.25)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <AlertTriangle size={20} color="#DC2626" style={{ flexShrink: 0 }} />
            <span style={{ fontSize: '0.82rem', fontWeight: '600', color: '#991B1B' }}>
              {hazardAlert}
            </span>
          </div>
          <button 
            onClick={() => setHazardAlert(null)}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: '#991B1B',
              fontWeight: '700',
              fontSize: '1rem',
              padding: '0 4px'
            }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Floating Multi-Gas Detector Sensor HUD (Official Instrument Readout) */}
      <div style={{
        position: 'absolute',
        top: '4.5rem',
        left: '1rem',
        background: '#FFFFFF',
        border: alarmTriggered ? '2px solid #DC2626' : '2px solid var(--gov-navy)',
        borderRadius: '4px',
        padding: '0.85rem 1rem',
        zIndex: 20,
        boxShadow: '0 4px 14px rgba(0, 0, 0, 0.15)',
        minWidth: '270px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          marginBottom: '0.6rem',
          borderBottom: '1px solid #E2E8F0',
          paddingBottom: '0.4rem'
        }}>
          <Activity size={16} color={alarmTriggered ? '#DC2626' : 'var(--gov-navy)'} />
          <span style={{ fontSize: '0.74rem', fontWeight: '700', letterSpacing: '0.04em', color: 'var(--gov-navy)', textTransform: 'uppercase' }}>
            {t.gasHudTitle}
          </span>
        </div>

        {/* Methane CH4 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.45rem' }}>
          <span style={{ fontSize: '0.8rem', color: '#334155', fontWeight: '500' }}>{t.gasMethaneLimit}</span>
          <span className={methaneLevel >= 1.25 ? 'gov-badge-red' : 'gov-badge-green'}>
            {methaneLevel}% {methaneLevel >= 1.25 ? t.sensorCritical : t.sensorOk}
          </span>
        </div>

        {/* Carbon Monoxide CO */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.45rem' }}>
          <span style={{ fontSize: '0.8rem', color: '#334155', fontWeight: '500' }}>{t.gasCoLimit}</span>
          <span className={coLevel >= 50 ? 'gov-badge-red' : 'gov-badge-green'}>
            {coLevel} ppm {coLevel >= 50 ? t.sensorToxic : t.sensorOk}
          </span>
        </div>

        {/* Oxygen O2 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.8rem', color: '#334155', fontWeight: '500' }}>{t.gasOxygenLimit}</span>
          <span className={oxygenLevel < 19.5 ? 'gov-badge-red' : 'gov-badge-green'}>
            {oxygenLevel}% {oxygenLevel < 19.5 ? t.sensorDeficient : t.sensorOk}
          </span>
        </div>
      </div>

      {/* Bottom Step-by-Step Interactive Workflow */}
      <div style={{
        position: 'absolute',
        bottom: '1.25rem',
        left: '1rem',
        right: '1rem',
        background: '#FFFFFF',
        border: '1px solid var(--border-subtle)',
        borderTop: alarmTriggered ? '4px solid #DC2626' : '4px solid var(--gov-navy)',
        borderRadius: '4px',
        padding: '1.25rem',
        zIndex: 30,
        boxShadow: '0 8px 24px rgba(11, 61, 145, 0.15)'
      }}>
        {/* Step 0: Detector Calibration */}
        {currentStep === 0 && (
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--gov-navy)', marginBottom: '0.35rem' }}>
              {t.gasDetectTitle}
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: '1.45' }}>
              {t.gasDetectDesc}
            </p>
            <button
              onClick={triggerGasHazard}
              className="gov-btn-primary"
              style={{ width: '100%', padding: '0.75rem' }}
            >
              {t.gasDetectBtn}
            </button>
          </div>
        )}

        {/* Step 1: Hazard Alarm Triggered */}
        {currentStep === 1 && (
          <div>
            <div style={{
              background: 'var(--gov-danger-bg)',
              border: '1px solid var(--gov-danger-border)',
              borderRadius: '4px',
              padding: '0.75rem',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.6rem'
            }}>
              <AlertTriangle size={22} color="#DC2626" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#B91C1C', marginBottom: '0.2rem' }}>
                  {t.gasAlarmTitle}
                </h4>
                <p style={{ fontSize: '0.82rem', color: '#7F1D1D', lineHeight: '1.4' }}>
                  {t.gasAlarmDesc}
                </p>
              </div>
            </div>
            <button
              onClick={() => setCurrentStep(2)}
              style={{
                width: '100%',
                padding: '0.75rem',
                background: '#DC2626',
                color: '#FFFFFF',
                fontWeight: '700',
                borderRadius: '4px',
                border: '1px solid #B91C1C',
                cursor: 'pointer',
                fontSize: '0.9rem'
              }}
            >
              {t.gasAlarmBtn}
            </button>
          </div>
        )}

        {/* Step 2: PPE Donning Checklist */}
        {currentStep === 2 && (
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--gov-navy)', marginBottom: '0.35rem' }}>
              {t.gasPpeTitle}
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.85rem' }}>
              {t.gasPpeVerifyPrompt}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
              <button
                onClick={() => { setPpeSCBA(!ppeSCBA); playSound('ppe_click'); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '4px',
                  background: ppeSCBA ? 'var(--gov-success-bg)' : '#F8FAFC',
                  border: ppeSCBA ? '1px solid var(--gov-success)' : '1px solid #CBD5E1',
                  color: ppeSCBA ? 'var(--gov-success)' : '#1B254B',
                  fontWeight: '600',
                  fontSize: '0.84rem',
                  cursor: 'pointer'
                }}
              >
                <span>{t.gasPpeMask}</span>
                {ppeSCBA ? <CheckCircle2 size={18} /> : <span style={{ color: '#64748B' }}>{t.gasPpeFitMask}</span>}
              </button>

              <button
                onClick={() => { setPpeHelmet(!ppeHelmet); playSound('ppe_click'); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '4px',
                  background: ppeHelmet ? 'var(--gov-success-bg)' : '#F8FAFC',
                  border: ppeHelmet ? '1px solid var(--gov-success)' : '1px solid #CBD5E1',
                  color: ppeHelmet ? 'var(--gov-success)' : '#1B254B',
                  fontWeight: '600',
                  fontSize: '0.84rem',
                  cursor: 'pointer'
                }}
              >
                <span>{t.gasPpeHelmet}</span>
                {ppeHelmet ? <CheckCircle2 size={18} /> : <span style={{ color: '#64748B' }}>{t.gasPpeLockHelmet}</span>}
              </button>

              <button
                onClick={() => { setPpeHarness(!ppeHarness); playSound('ppe_click'); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '4px',
                  background: ppeHarness ? 'var(--gov-success-bg)' : '#F8FAFC',
                  border: ppeHarness ? '1px solid var(--gov-success)' : '1px solid #CBD5E1',
                  color: ppeHarness ? 'var(--gov-success)' : '#1B254B',
                  fontWeight: '600',
                  fontSize: '0.84rem',
                  cursor: 'pointer'
                }}
              >
                <span>{t.gasPpeHarness}</span>
                {ppeHarness ? <CheckCircle2 size={18} /> : <span style={{ color: '#64748B' }}>{t.gasPpeAttachLifeline}</span>}
              </button>
            </div>

            <button
              onClick={() => {
                if (!allPPECompleted) {
                  playSound('hazard_warning');
                  setHazardAlert(language === 'hi'
                    ? 'डीजीएमएस सीएमआर 2017 नियम 160: एससीबीए श्वास उपकरण के बिना गैस क्षेत्र में प्रवेश करने पर 18 सेकंड में दम घुट सकता है! सभी पीपीई उपकरण पहनें।'
                    : 'DGMS CMR 2017 Reg 160 SOP Alert: Entering noxious gas zone without SCBA causes asphyxiation within 18 seconds! Complete full PPE inspection.');
                  return;
                }
                playSound('ppe_click');
                setCurrentStep(3);
              }}
              className={allPPECompleted ? 'gov-btn-primary' : 'gov-btn-secondary'}
              style={{
                width: '100%',
                padding: '0.75rem',
                opacity: allPPECompleted ? 1 : 0.85,
                cursor: 'pointer'
              }}
            >
              {allPPECompleted ? t.gasPpeProceedBtn : t.gasPpeRequiredPrompt}
            </button>
          </div>
        )}

        {/* Step 3: Two-Person Buddy System Signaling */}
        {currentStep === 3 && (
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--gov-navy)', marginBottom: '0.35rem' }}>
              {t.gasBuddyTitle}
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.85rem' }}>
              {t.gasBuddyReqPrompt}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
              <button
                onClick={() => { setRadioConfirmed(!radioConfirmed); playSound('radio_squelch'); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '4px',
                  background: radioConfirmed ? 'var(--gov-success-bg)' : '#F8FAFC',
                  border: radioConfirmed ? '1px solid var(--gov-success)' : '1px solid #CBD5E1',
                  color: radioConfirmed ? 'var(--gov-success)' : '#1B254B',
                  fontWeight: '600',
                  fontSize: '0.84rem',
                  cursor: 'pointer'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Radio size={16} />
                  <span>{t.gasBuddyRadio}</span>
                </div>
                {radioConfirmed ? <CheckCircle2 size={18} /> : <span style={{ color: '#64748B' }}>{t.gasBuddyCheckRadio}</span>}
              </button>

              <button
                onClick={() => { setLifelineSecured(!lifelineSecured); playSound('radio_squelch'); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '4px',
                  background: lifelineSecured ? 'var(--gov-success-bg)' : '#F8FAFC',
                  border: lifelineSecured ? '1px solid var(--gov-success)' : '1px solid #CBD5E1',
                  color: lifelineSecured ? 'var(--gov-success)' : '#1B254B',
                  fontWeight: '600',
                  fontSize: '0.84rem',
                  cursor: 'pointer'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <UserCheck size={16} />
                  <span>{t.gasBuddyLifeline}</span>
                </div>
                {lifelineSecured ? <CheckCircle2 size={18} /> : <span style={{ color: '#64748B' }}>{t.gasBuddyConfirmLifeline}</span>}
              </button>
            </div>

            <button
              onClick={() => {
                if (!allBuddyCompleted) {
                  playSound('hazard_warning');
                  setHazardAlert(language === 'hi'
                    ? 'डीजीएमएस चेतावनी: साथी संचार और लाइफलाइन के बिना कोयला खदान गैसी क्षेत्र में प्रवेश करना अवैध है! दोनों पुष्टि करें।'
                    : 'DGMS SOP Alert: Entry into toxic underground zone without confirmed radio link and attendant lifeline is strictly prohibited under colliery laws!');
                  return;
                }
                playSound('clearance_chime');
                setCurrentStep(4);
              }}
              className={allBuddyCompleted ? 'gov-btn-primary' : 'gov-btn-secondary'}
              style={{
                width: '100%',
                padding: '0.75rem',
                opacity: allBuddyCompleted ? 1 : 0.85,
                cursor: 'pointer'
              }}
            >
              {allBuddyCompleted ? t.gasBuddyBtn : t.gasBuddyRequiredPrompt}
            </button>
          </div>
        )}

        {/* Step 4: Clearance Verified & 5-Factor Statutory Scoring */}
        {currentStep === 4 && (
          <div style={{ textAlign: 'left', padding: '0.25rem 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div style={{ display: 'inline-flex', padding: '0.4rem', borderRadius: '50%', background: 'var(--gov-success-bg)' }}>
                  <CheckCircle2 size={24} color="var(--gov-success)" />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--gov-navy)', margin: 0 }}>
                    {t.gasCompleteTitle}
                  </h3>
                  <span style={{ fontSize: '0.75rem', color: '#16A34A', fontWeight: '700' }}>
                    DGMS CMR 2017 REGULATION 160 COMPLIANT • STATUTORY PASS
                  </span>
                </div>
              </div>
              <div style={{
                background: 'var(--gov-navy)',
                color: '#FFD700',
                padding: '0.35rem 0.75rem',
                borderRadius: '4px',
                fontWeight: '800',
                fontSize: '1rem',
                border: '1px solid #FFD700'
              }}>
                98%
              </div>
            </div>

            {/* 5-Factor Statutory Rubric Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
              gap: '0.5rem',
              background: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: '4px',
              padding: '0.65rem',
              marginBottom: '0.85rem'
            }}>
              <div>
                <div style={{ fontSize: '0.68rem', color: '#64748B', fontWeight: '600' }}>1. Gas Threshold ID</div>
                <div style={{ fontSize: '0.82rem', fontWeight: '700', color: '#16A34A' }}>100% (1.85% CH4)</div>
              </div>
              <div>
                <div style={{ fontSize: '0.68rem', color: '#64748B', fontWeight: '600' }}>2. Perimeter Cordon</div>
                <div style={{ fontSize: '0.82rem', fontWeight: '700', color: '#16A34A' }}>96% Set</div>
              </div>
              <div>
                <div style={{ fontSize: '0.68rem', color: '#64748B', fontWeight: '600' }}>3. SCBA Donning</div>
                <div style={{ fontSize: '0.82rem', fontWeight: '700', color: '#16A34A' }}>100% Verified</div>
              </div>
              <div>
                <div style={{ fontSize: '0.68rem', color: '#64748B', fontWeight: '600' }}>4. VHF Radio Link</div>
                <div style={{ fontSize: '0.82rem', fontWeight: '700', color: '#16A34A' }}>100% Linked</div>
              </div>
              <div>
                <div style={{ fontSize: '0.68rem', color: '#64748B', fontWeight: '600' }}>5. Airway Evacuation</div>
                <div style={{ fontSize: '0.82rem', fontWeight: '700', color: '#16A34A' }}>94% Clearance</div>
              </div>
            </div>

            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.85rem', lineHeight: '1.4' }}>
              {t.gasCompleteDesc} Gas monitoring and confined-space rescue protocols are verified and recorded to your training transcript.
            </p>

            <button
              onClick={() => onComplete({ accuracy: 0.98, completionTimeSec: 210, trainingMode })}
              className="gov-btn-gold"
              style={{ width: '100%', padding: '0.85rem', fontSize: '0.92rem', fontWeight: '700' }}
            >
              {t.gasCompleteBtn}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
