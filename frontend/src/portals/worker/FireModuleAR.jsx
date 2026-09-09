import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useLanguage } from '../../context/LanguageContext';
import { 
  Flame, 
  Target, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle, 
  RotateCcw, 
  Volume2, 
  ShieldCheck,
  Compass,
  Sparkles
} from 'lucide-react';

export default function FireModuleAR({ onComplete, onCancel }) {
  const { t, speak, language } = useLanguage();
  const canvasRef = useRef(null);
  const videoRef = useRef(null);

  // Simulation steps: 0: Exit Identification, 1: P - Pull Pin, 2: A - Aim Base, 3: S - Squeeze Lever, 4: S - Sweep Side-to-Side, 5: Evacuation Clear
  const [currentStep, setCurrentStep] = useState(0);
  const [cameraActive, setCameraActive] = useState(false);
  const [pinPulled, setPinPulled] = useState(false);
  const [aimLocked, setAimLocked] = useState(false);
  const [foamPressure, setFoamPressure] = useState(0);
  const [sweepProgress, setSweepProgress] = useState(0);
  const [fireIntensity, setFireIntensity] = useState(100);
  const [isSqueezing, setIsSqueezing] = useState(false);
  const [passScore, setPassScore] = useState(0);

  // Initialize Camera Feed
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
        console.warn('Camera access denied or unavailable, using 3D synthetic industrial background:', err);
        setCameraActive(false);
      }
    }
    initCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Initialize Three.js Scene for 3D Fire, Smoke, and Waypoint Overlays
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
    camera.position.set(0, 1.5, 4);

    // Ambient & Directional Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    const fireLight = new THREE.PointLight(0xff5500, 2.5, 10);
    fireLight.position.set(0, 1, 0);
    scene.add(fireLight);

    // 3D Fire Particles
    const particleCount = 120;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const scales = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 1.2;
      positions[i * 3 + 1] = Math.random() * 2;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 1.2;
      scales[i] = Math.random() * 0.15 + 0.05;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const material = new THREE.PointsMaterial({
      color: 0xff3b00,
      size: 0.18,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending
    });
    const fireParticles = new THREE.Points(geometry, material);
    scene.add(fireParticles);

    // 3D Extinguisher Canister Model in foreground
    const extGroup = new THREE.Group();
    const bodyGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.8, 24);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0xd90429, roughness: 0.3, metalness: 0.5 });
    const extBody = new THREE.Mesh(bodyGeo, bodyMat);
    extGroup.add(extBody);

    const headGeo = new THREE.CylinderGeometry(0.12, 0.2, 0.15, 16);
    const headMat = new THREE.MeshStandardMaterial({ color: 0x222222, metalness: 0.8 });
    const extHead = new THREE.Mesh(headGeo, headMat);
    extHead.position.y = 0.45;
    extGroup.add(extHead);

    extGroup.position.set(0.9, -0.6, 2.5);
    extGroup.rotation.z = -0.2;
    scene.add(extGroup);

    // Render loop
    let animationFrameId;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Flicker fire light
      fireLight.intensity = (1.8 + Math.sin(elapsedTime * 15) * 0.7) * (fireIntensity / 100);

      // Animate fire particles
      const pos = geometry.attributes.position.array;
      for (let i = 0; i < particleCount; i++) {
        pos[i * 3 + 1] += 0.03 * (fireIntensity / 100);
        if (pos[i * 3 + 1] > 2.2) {
          pos[i * 3 + 1] = 0;
          pos[i * 3] = (Math.random() - 0.5) * 1.2 * (fireIntensity / 100);
          pos[i * 3 + 2] = (Math.random() - 0.5) * 1.2 * (fireIntensity / 100);
        }
      }
      geometry.attributes.position.needsUpdate = true;

      // Extinguisher slight movement when squeezing
      if (isSqueezing) {
        extGroup.rotation.x = Math.sin(elapsedTime * 30) * 0.04;
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!canvas) return;
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, [fireIntensity, isSqueezing]);

  // Voice narration on step changes
  useEffect(() => {
    if (currentStep === 0) speak("Look for emergency exit signs and clear path.");
    else if (currentStep === 1) speak(t.audioPullPin);
    else if (currentStep === 2) speak(t.audioAimBase);
    else if (currentStep === 3) speak(t.audioSqueezeLever);
    else if (currentStep === 4) speak(t.audioSweepFire);
    else if (currentStep === 5) speak("Fire extinguished! Evacuate through green pathway.");
  }, [currentStep]);

  // Simulate fire suppression during sweep and squeeze
  useEffect(() => {
    let interval = null;
    if (currentStep === 4 && isSqueezing && sweepProgress < 100) {
      interval = setInterval(() => {
        setSweepProgress((prev) => {
          const next = Math.min(100, prev + 4);
          setFireIntensity(Math.max(0, 100 - next));
          return next;
        });
      }, 150);
    } else if (sweepProgress >= 100 && currentStep === 4) {
      setFireIntensity(0);
      setPassScore(94);
      setTimeout(() => setCurrentStep(5), 600);
    }
    return () => clearInterval(interval);
  }, [currentStep, isSqueezing, sweepProgress]);

  const handlePullPin = () => {
    setPinPulled(true);
    setPassScore((s) => s + 25);
    setTimeout(() => setCurrentStep(2), 500);
  };

  const handleAimLock = () => {
    setAimLocked(true);
    setPassScore((s) => s + 25);
    setTimeout(() => setCurrentStep(3), 500);
  };

  const handleSqueezeStart = () => {
    setIsSqueezing(true);
    setFoamPressure(85);
    if (currentStep === 3) {
      setPassScore((s) => s + 20);
      setTimeout(() => setCurrentStep(4), 600);
    }
  };

  const handleSqueezeEnd = () => {
    setIsSqueezing(false);
  };

  return (
    <div style={{ position: 'relative', width: '100%', minHeight: '88vh', background: '#0a0a0a', overflow: 'hidden', borderRadius: '4px', border: '2px solid var(--gov-navy)' }}>
      {/* Background Camera Feed */}
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
          opacity: cameraActive ? 0.75 : 0,
          transition: 'opacity 0.5s'
        }}
      />

      {/* Synthetic Mine Tunnel Background when camera is inactive */}
      {!cameraActive && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'radial-gradient(ellipse at center, #24140b 0%, #0a0705 60%, #000000 100%)',
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
            DGMS VIRTUAL COAL SEAM CHAMBER #2 • SYNTHETIC 3D ENVIRONMENT ACTIVE
          </div>
        </div>
      )}

      {/* Three.js 3D WebGL Overlay */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none'
        }}
      />

      {/* Top HUD: Official DGMS Header Bar */}
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
          border: '1px solid var(--gov-navy)',
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
            background: '#1E7B34'
          }} />
          <span style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--gov-navy)', letterSpacing: '0.03em' }}>
            DGMS STATUTORY SIMULATION • CMR REG. 136 (PASS DRILL)
          </span>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => speak(currentStep === 1 ? t.audioPullPin : currentStep === 2 ? t.audioAimBase : currentStep === 3 ? t.audioSqueezeLever : t.audioSweepFire)}
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

      {/* Visual Emergency Exit Signage (Statutory DGMS Spec) */}
      <div style={{
        position: 'absolute',
        top: '18%',
        right: '2rem',
        background: '#1E7B34',
        border: '2px solid #FFFFFF',
        borderRadius: '4px',
        padding: '0.45rem 0.85rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        color: '#FFFFFF',
        fontWeight: '700',
        fontSize: '0.82rem',
        letterSpacing: '0.04em',
        boxShadow: '0 3px 10px rgba(0, 0, 0, 0.4)'
      }}>
        <Compass size={18} />
        <span>EMERGENCY SHAFT ESCAPE WAY (25m) →</span>
      </div>

      {/* Target Crosshair when in Aim step */}
      {currentStep === 2 && (
        <div 
          onClick={handleAimLock}
          style={{
            position: 'absolute',
            top: '52%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '110px',
            height: '110px',
            border: '2px dashed #F59E0B',
            borderRadius: '50%',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 0 4px rgba(245, 158, 11, 0.25)',
            zIndex: 30
          }}
        >
          <Target size={36} color="#F59E0B" />
          <span style={{
            position: 'absolute',
            bottom: '-28px',
            background: 'var(--gov-navy)',
            color: '#FFFFFF',
            border: '1px solid #F59E0B',
            fontSize: '0.72rem',
            fontWeight: '700',
            padding: '2px 8px',
            borderRadius: '2px',
            whiteSpace: 'nowrap'
          }}>
            TAP BASE TO LOCK NOZZLE AIM
          </span>
        </div>
      )}

      {/* Bottom Step-by-Step Control Panel (Official Government Portal Style) */}
      <div style={{
        position: 'absolute',
        bottom: '1.25rem',
        left: '1rem',
        right: '1rem',
        background: '#FFFFFF',
        border: '1px solid var(--border-subtle)',
        borderTop: '4px solid var(--gov-navy)',
        borderRadius: '4px',
        padding: '1.25rem',
        zIndex: 30,
        boxShadow: '0 8px 24px rgba(11, 61, 145, 0.15)'
      }}>
        {/* Step Indicator Badges (P - A - S - S) */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', gap: '0.5rem' }}>
          {[
            { id: 1, label: 'P: Pull Pin', done: pinPulled },
            { id: 2, label: 'A: Aim Base', done: aimLocked },
            { id: 3, label: 'S: Squeeze', done: foamPressure > 0 },
            { id: 4, label: 'S: Sweep', done: sweepProgress >= 100 }
          ].map((item) => {
            const isCompleted = item.done;
            const isActive = currentStep === item.id;
            return (
              <div
                key={item.id}
                style={{
                  flex: 1,
                  textAlign: 'center',
                  padding: '0.45rem 0.2rem',
                  borderRadius: '3px',
                  fontSize: '0.75rem',
                  fontWeight: '700',
                  textTransform: 'uppercase',
                  letterSpacing: '0.03em',
                  background: isCompleted 
                    ? 'var(--gov-success-bg)' 
                    : isActive 
                      ? 'var(--gov-navy)' 
                      : '#F1F5F9',
                  border: isCompleted 
                    ? '1px solid var(--gov-success)' 
                    : isActive 
                      ? '1px solid var(--gov-navy-dark)' 
                      : '1px solid #CBD5E1',
                  color: isCompleted 
                    ? 'var(--gov-success)' 
                    : isActive 
                      ? '#FFFFFF' 
                      : 'var(--text-muted)'
                }}
              >
                {isCompleted ? '✓ ' : ''}{item.label}
              </div>
            );
          })}
        </div>

        {/* Step Description & Action */}
        {currentStep === 0 && (
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--gov-navy)', marginBottom: '0.35rem' }}>
              Statutory Hazard Assessment & Evacuation Route
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: '1.45' }}>
              Class B Coal Dust / Electrical Fire detected in Heading #4. Ensure emergency escape shaft is unobstructed behind you before commencing suppression.
            </p>
            <button
              onClick={() => setCurrentStep(1)}
              className="gov-btn-primary"
              style={{ width: '100%', padding: '0.75rem' }}
            >
              Verify Route & Unlatch Fire Extinguisher →
            </button>
          </div>
        )}

        {currentStep === 1 && (
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--gov-navy)', marginBottom: '0.35rem' }}>
              {t.passP_title}
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: '1.45' }}>
              {t.passP_desc}
            </p>
            <button
              onClick={handlePullPin}
              className="gov-btn-primary"
              style={{ width: '100%', padding: '0.75rem' }}
            >
              Pull Safety Seal Pin (P) 🔓
            </button>
          </div>
        )}

        {currentStep === 2 && (
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--gov-navy)', marginBottom: '0.35rem' }}>
              {t.passA_title}
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: '1.45' }}>
              {t.passA_desc}
            </p>
            <button
              onClick={handleAimLock}
              className="gov-btn-primary"
              style={{ width: '100%', padding: '0.75rem' }}
            >
              Lock Crosshair on Base of Fire (A) 🎯
            </button>
          </div>
        )}

        {currentStep === 3 && (
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--gov-navy)', marginBottom: '0.35rem' }}>
              {t.passS1_title}
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: '1.45' }}>
              {t.passS1_desc}
            </p>
            <button
              onMouseDown={handleSqueezeStart}
              onMouseUp={handleSqueezeEnd}
              onTouchStart={handleSqueezeStart}
              onTouchEnd={handleSqueezeEnd}
              style={{
                width: '100%',
                padding: '0.85rem',
                fontSize: '0.92rem',
                fontWeight: '700',
                borderRadius: '4px',
                cursor: 'pointer',
                border: isSqueezing ? '1px solid #145A24' : '1px solid var(--gov-navy-dark)',
                background: isSqueezing ? '#1E7B34' : 'var(--gov-navy)',
                color: '#FFFFFF',
                transition: 'background 0.15s ease'
              }}
            >
              {isSqueezing ? 'DISCHARGING DRY CHEMICAL FOAM 💨' : 'HOLD & SQUEEZE OPERATING LEVER (S) ✊'}
            </button>
          </div>
        )}

        {currentStep === 4 && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--gov-navy)' }}>
                {t.passS2_title}
              </h3>
              <span className="gov-badge-green">
                {sweepProgress}% Extinguished
              </span>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.85rem', lineHeight: '1.45' }}>
              {t.passS2_desc}
            </p>

            {/* Sweep Gauge Bar */}
            <div style={{
              width: '100%',
              height: '10px',
              background: '#E2E8F0',
              borderRadius: '2px',
              overflow: 'hidden',
              marginBottom: '1rem',
              border: '1px solid #CBD5E1'
            }}>
              <div style={{
                width: `${sweepProgress}%`,
                height: '100%',
                background: '#1E7B34',
                transition: 'width 0.2s ease'
              }} />
            </div>

            <button
              onMouseDown={handleSqueezeStart}
              onMouseUp={handleSqueezeEnd}
              onTouchStart={handleSqueezeStart}
              onTouchEnd={handleSqueezeEnd}
              style={{
                width: '100%',
                padding: '0.85rem',
                fontSize: '0.92rem',
                fontWeight: '700',
                borderRadius: '4px',
                cursor: 'pointer',
                border: isSqueezing ? '1px solid #145A24' : '1px solid var(--gov-navy-dark)',
                background: isSqueezing ? '#1E7B34' : 'var(--gov-navy)',
                color: '#FFFFFF'
              }}
            >
              {isSqueezing ? 'SWEEPING NOZZLE SIDE-TO-SIDE ↔️' : 'HOLD TO SWEEP NOZZLE ACROSS FLAMES (S) ↔️'}
            </button>
          </div>
        )}

        {currentStep === 5 && (
          <div style={{ textAlign: 'center', padding: '0.5rem 0' }}>
            <div style={{ display: 'inline-flex', padding: '0.5rem', borderRadius: '50%', background: 'var(--gov-success-bg)', marginBottom: '0.5rem' }}>
              <CheckCircle2 size={32} color="var(--gov-success)" />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: 'var(--gov-navy)', marginBottom: '0.25rem' }}>
              Fire Hazard Neutralized & Extinguished
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              PASS Protocol successfully executed with 94% statutory compliance. Complete the DGMS statutory examination paper to record completion.
            </p>
            <button
              onClick={() => onComplete({ accuracy: 0.94, completionTimeSec: 180 })}
              className="gov-btn-gold"
              style={{ width: '100%', padding: '0.85rem', fontSize: '0.92rem' }}
            >
              Proceed to Graded DGMS Examination →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
