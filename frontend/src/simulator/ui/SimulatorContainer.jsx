/**
 * SimulatorContainer.jsx
 * Main Interactive WebXR / 3D Mining Safety Training Simulator Container.
 * Seamlessly manages:
 *  - Safety Briefing & surroundings awareness check
 *  - Hardware capability detection (Real AR vs 3D Simulation vs Desktop Preview)
 *  - Surface hit-testing & reticle placement in AR mode
 *  - Live 3D/AR interaction, hazard inspection, and decision choices
 *  - Consequence Engine (non-graphic near-miss simulation & recovery)
 *  - Comprehensive multi-factor scoring against statutory benchmarks
 *  - Dual Mode support (Guided Training vs Statutory Assessment)
 *  - Multi-lingual text & voice narration (English, Hindi, Santali)
 */

import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useOfflineSync } from '../../context/OfflineSyncContext';

import { ARCapabilityDetector } from '../core/ARCapabilityDetector';
import { ARSessionManager } from '../core/ARSessionManager';
import { ARHitTestManager } from '../core/ARHitTestManager';
import { ARPlacementManager, PlacementState } from '../core/ARPlacementManager';
import { TrainingScene } from '../core/TrainingScene';

import { HazardSystem, HazardStatus } from '../engine/HazardSystem';
import { InteractionSystem } from '../engine/InteractionSystem';
import { ConsequenceEngine } from '../engine/ConsequenceEngine';
import { DecisionSystem } from '../engine/DecisionSystem';
import { ScoringSystem } from '../engine/ScoringSystem';
import { AssessmentSystem, TrainingMode } from '../engine/AssessmentSystem';
import { TrainingProgressManager } from '../engine/TrainingProgressManager';

import { getScenarioData } from '../scenarios';
import { AudioSystem } from './AudioSystem';

import {
  ShieldAlert,
  HardHat,
  Volume2,
  VolumeX,
  X,
  Play,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Compass,
  ArrowRight,
  Eye,
  Award,
  Sparkles,
  Info,
  Maximize2,
  Check
} from 'lucide-react';

export default function SimulatorContainer({ moduleId = 'MOD-005', onComplete, onCancel }) {
  const { language, t, speak } = useLanguage();
  const { currentUser } = useAuth();
  const { saveOfflineSession, saveOfflineCertificate } = useOfflineSync();

  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  // Workflow Phases: 'BRIEFING' | 'DETECTING' | 'PLACING' | 'ACTIVE' | 'RESULTS'
  const [phase, setPhase] = useState('BRIEFING');
  const [capability, setCapability] = useState(null);
  const [activeMode, setActiveMode] = useState('3D_SIMULATION'); // 'REAL_AR' | '3D_SIMULATION' | 'DESKTOP_PREVIEW'
  const [placementState, setPlacementState] = useState(PlacementState.NOT_STARTED);

  // Training state
  const [trainingMode, setTrainingMode] = useState(TrainingMode.GUIDED);
  const [activeHazard, setActiveHazard] = useState(null);
  const [activeDecision, setActiveDecision] = useState(null);
  const [activeConsequence, setActiveConsequence] = useState(null);
  const [decisionFeedback, setDecisionFeedback] = useState(null);
  const [discoveredCount, setDiscoveredCount] = useState(0);
  const [totalHazardCount, setTotalHazardCount] = useState(0);
  const [elapsedTimer, setElapsedTimer] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [hintMessage, setHintMessage] = useState(null);
  const [finalResults, setFinalResults] = useState(null);

  // Subsystem Refs
  const trainingSceneRef = useRef(null);
  const sessionManagerRef = useRef(null);
  const hitTestManagerRef = useRef(null);
  const placementManagerRef = useRef(null);
  const hazardSystemRef = useRef(null);
  const interactionSystemRef = useRef(null);
  const consequenceEngineRef = useRef(null);
  const decisionSystemRef = useRef(null);
  const scoringSystemRef = useRef(null);
  const assessmentSystemRef = useRef(null);
  const progressManagerRef = useRef(null);
  const audioSystemRef = useRef(null);

  const scenarioInfo = getScenarioData(moduleId);
  const scenarioDef = scenarioInfo.scenario;

  // Initialize Audio
  useEffect(() => {
    audioSystemRef.current = new AudioSystem();
    return () => {
      if (audioSystemRef.current) {
        audioSystemRef.current.dispose();
      }
    };
  }, []);

  // Timer while simulation is active
  useEffect(() => {
    let interval = null;
    if (phase === 'ACTIVE' && !activeConsequence) {
      interval = setInterval(() => {
        setElapsedTimer((t) => t + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [phase, activeConsequence]);

  // Step 1: Handle Start from Safety Briefing -> Probe capabilities
  const handleStartFromBriefing = async () => {
    setPhase('DETECTING');
    if (audioSystemRef.current) audioSystemRef.current.playClick();

    const cap = await ARCapabilityDetector.detect();
    setCapability(cap);
    setActiveMode(cap.mode);

    // Provide spoken audio confirmation
    if (language === 'hi') {
      speak("सिमुलेटर वातावरण लोड हो रहा है।");
    } else if (language === 'sat') {
      speak("ᱥᱤᱢᱩᱞᱮᱴᱚᱨ ᱮᱦᱚᱵᱚᱜ ᱠᱟᱱᱟ᱾");
    }

    setPhase('PLACING');
  };

  // Step 2: Initialize Three.js scene once canvas is mounted for placement / simulation
  useEffect(() => {
    if (phase !== 'PLACING' && phase !== 'ACTIVE') return;
    if (!canvasRef.current) return;
    if (trainingSceneRef.current) return;

    const canvas = canvasRef.current;
    const scene = new TrainingScene(canvas, { mode: activeMode });
    trainingSceneRef.current = scene;

    // Load 3D model for scenario
    const model = scenarioInfo.createModel();
    scene.scenarioGroup.add(model);
    scene.scenarioGroup.visible = (activeMode !== 'REAL_AR');

    // Register animation callback
    scene.addFrameCallback(({ delta, timestamp }) => {
      const time = timestamp * 0.001;
      if (model.userData && model.userData.animate) {
        model.userData.animate(delta, time);
      }
      if (hazardSystemRef.current) {
        hazardSystemRef.current.updateAnimations(delta, time);
      }
      if (sessionManagerRef.current && sessionManagerRef.current.isActive() && hitTestManagerRef.current) {
        // Run hit testing on AR frame
        const frame = scene.renderer.xr.getFrame();
        if (frame) {
          const hitResult = hitTestManagerRef.current.update(frame, scene.reticle);
          if (placementManagerRef.current) {
            placementManagerRef.current.updateSurfaceStatus(hitResult.hasSurface);
          }
        }
      }
    });

    // Managers
    const sessionManager = new ARSessionManager(scene.renderer);
    sessionManagerRef.current = sessionManager;

    const hitTestManager = new ARHitTestManager(sessionManager);
    hitTestManagerRef.current = hitTestManager;

    const placementManager = new ARPlacementManager({
      onStateChange: (st) => setPlacementState(st)
    });
    placementManager.setTargetGroup(scene.scenarioGroup);
    placementManager.setReticle(scene.reticle);
    placementManagerRef.current = placementManager;

    // Scoring & Progress
    const scoringSystem = new ScoringSystem(moduleId, {
      totalHazards: scenarioDef.hazards.length,
      totalDecisions: scenarioDef.hazards.length
    });
    scoringSystemRef.current = scoringSystem;

    const progressManager = new TrainingProgressManager(moduleId, scoringSystem, {
      currentUser,
      saveOfflineSession,
      saveOfflineCertificate,
      totalSteps: scenarioDef.hazards.length
    });
    progressManagerRef.current = progressManager;

    // Hazard System
    const hazardSystem = new HazardSystem(scene.scenarioGroup, {
      trainingMode,
      onHazardInspected: (hazard) => {
        setActiveHazard(hazard);
        setDecisionFeedback(null);
        scoringSystem.recordHazardIdentified(hazard.id, hazard.name);
        setDiscoveredCount(hazardSystem.getDiscoveredCount());
        if (audioSystemRef.current) audioSystemRef.current.playHazardSelect();

        // Voice read hazard name
        if (language === 'hi' && hazard.name_hi) {
          speak(hazard.name_hi);
        }

        // Present associated decision
        if (hazard.decision) {
          decisionSystemRef.current.presentDecision(hazard, hazard.decision);
          setActiveDecision(hazard.decision);
        }
      }
    });
    hazardSystem.loadHazards(scenarioDef.hazards);
    hazardSystemRef.current = hazardSystem;
    setTotalHazardCount(hazardSystem.getTotalCount());

    // Consequence Engine
    const consequenceEngine = new ConsequenceEngine({
      onConsequenceTriggered: (consequence) => {
        setActiveConsequence(consequence);
        if (audioSystemRef.current) audioSystemRef.current.playWarningAlert();
        if (language === 'hi') {
          speak("असुरक्षित स्थिति। सुरक्षित प्रतिक्रिया देखें।");
        }
      },
      onConsequenceDismissed: () => {
        setActiveConsequence(null);
      }
    });
    consequenceEngineRef.current = consequenceEngine;

    // Decision System
    const decisionSystem = new DecisionSystem(hazardSystem, consequenceEngine, scoringSystem);
    decisionSystemRef.current = decisionSystem;

    // Assessment System
    const assessmentSystem = new AssessmentSystem(hazardSystem, scoringSystem, {
      initialMode: trainingMode,
      onModeChange: (m) => setTrainingMode(m)
    });
    assessmentSystemRef.current = assessmentSystem;

    // Interaction System (Touch + Raycaster)
    const interactionSystem = new InteractionSystem(scene, hazardSystem, {
      onSelect: ({ hazard }) => {
        // Hazard selected via 3D raycast
      }
    });
    interactionSystemRef.current = interactionSystem;

    // Start placement or auto-place
    if (activeMode === 'REAL_AR') {
      sessionManager.startSession(containerRef.current).then(() => {
        placementManager.reset();
      }).catch((err) => {
        console.warn('Could not launch immersive-ar session, falling back to 3D Simulation:', err);
        setActiveMode('3D_SIMULATION');
        scene.updateMode('3D_SIMULATION');
        placementManager.placeDefaultAtOrigin();
        setPhase('ACTIVE');
      });

      sessionManager.onSessionEnded(() => {
        // Clean shutdown
        handleExit();
      });
    } else {
      // 3D Simulation or Desktop Preview -> immediately place at origin
      placementManager.placeDefaultAtOrigin();
      setPhase('ACTIVE');
    }

    return () => {
      // Cleanup on unmount
      if (sessionManagerRef.current) {
        sessionManagerRef.current.endSession();
      }
      if (interactionSystemRef.current) {
        interactionSystemRef.current.detach();
      }
      if (trainingSceneRef.current) {
        trainingSceneRef.current.dispose();
        trainingSceneRef.current = null;
      }
    };
  }, [phase, activeMode]);

  // Handle AR User Tap to Place
  const handleTapToPlace = () => {
    if (!placementManagerRef.current) return;
    const placed = placementManagerRef.current.placeAtReticle();
    if (placed) {
      if (audioSystemRef.current) audioSystemRef.current.playSafeAction();
      setPhase('ACTIVE');
    }
  };

  // Handle Decision Selection
  const handleSelectChoice = (optionId) => {
    if (!decisionSystemRef.current) return;
    if (audioSystemRef.current) audioSystemRef.current.playClick();

    const evaluation = decisionSystemRef.current.evaluateChoice(optionId);
    if (!evaluation) return;

    if (evaluation.isCorrect) {
      if (audioSystemRef.current) audioSystemRef.current.playSafeAction();
      setDecisionFeedback({
        isCorrect: true,
        text: evaluation.feedback
      });

      if (progressManagerRef.current) {
        progressManagerRef.current.advanceStep();
      }

      // Check if all hazards are resolved/identified
      const allFound = hazardSystemRef.current.getDiscoveredCount() >= hazardSystemRef.current.getTotalCount();
      if (allFound) {
        setTimeout(() => {
          handleCompleteSimulation();
        }, 1500);
      }
    } else {
      // Unsafe choice: consequence engine state is active
      setDecisionFeedback({
        isCorrect: false,
        text: evaluation.feedback
      });
    }
  };

  // Consequence Retry
  const handleRetryConsequence = () => {
    if (consequenceEngineRef.current) {
      consequenceEngineRef.current.retry();
      setDecisionFeedback(null);
    }
  };

  // Request Hint in Guided Mode
  const handleRequestHint = () => {
    if (!assessmentSystemRef.current) return;
    const currentHz = activeHazard || scenarioDef.hazards[0];
    const hint = assessmentSystemRef.current.requestHint(currentHz.description);
    if (hint.allowed) {
      setHintMessage(hint.hint);
      if (audioSystemRef.current) audioSystemRef.current.playClick();
      setTimeout(() => setHintMessage(null), 5000);
    }
  };

  // Mode Toggle (Guided vs Assessment)
  const handleToggleTrainingMode = () => {
    const newMode = trainingMode === TrainingMode.GUIDED ? TrainingMode.ASSESSMENT : TrainingMode.GUIDED;
    setTrainingMode(newMode);
    if (assessmentSystemRef.current) {
      assessmentSystemRef.current.setMode(newMode);
    }
    if (audioSystemRef.current) audioSystemRef.current.playClick();
  };

  // Complete Simulation & Calculate Score
  const handleCompleteSimulation = async () => {
    if (!scoringSystemRef.current || !progressManagerRef.current) return;

    const results = scoringSystemRef.current.calculateFinalResults();
    setFinalResults(results);
    setPhase('RESULTS');

    if (results.isPassed) {
      if (audioSystemRef.current) audioSystemRef.current.playSuccessFanfare();
      // Persist results & generate certificate
      await progressManagerRef.current.persistResults(results, language);
    } else {
      if (audioSystemRef.current) audioSystemRef.current.playWarningAlert();
    }
  };

  const handleExit = () => {
    if (sessionManagerRef.current) {
      sessionManagerRef.current.endSession();
    }
    if (onCancel) onCancel();
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 9999,
        backgroundColor: '#0a121c',
        color: '#f8fafc',
        fontFamily: 'var(--font-sans, system-ui, -apple-system, sans-serif)',
        overflow: 'hidden'
      }}
    >
      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* STAGE 1: SAFETY BRIEFING & SURROUNDINGS AWARENESS CHECK         */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      {phase === 'BRIEFING' && (
        <div style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1.5rem',
          background: 'radial-gradient(circle at center, #112233 0%, #060b11 100%)'
        }}>
          <div style={{
            maxWidth: '520px',
            width: '100%',
            background: '#0f1d2a',
            border: '2px solid #1e3a5f',
            borderRadius: '12px',
            padding: '2rem',
            boxShadow: '0 20px 50px rgba(0,0,0,0.7)',
            textAlign: 'center'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'rgba(234, 179, 8, 0.15)',
              border: '2px solid #eab308',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem',
              color: '#eab308'
            }}>
              <ShieldAlert size={34} />
            </div>

            <div style={{
              fontSize: '0.78rem',
              letterSpacing: '0.12em',
              fontWeight: '800',
              color: '#94a3b8',
              textTransform: 'uppercase',
              marginBottom: '0.4rem'
            }}>
              {scenarioDef.title}
            </div>

            <h2 style={{
              fontSize: '1.45rem',
              fontWeight: '800',
              color: '#ffffff',
              margin: '0 0 1rem 0',
              letterSpacing: '-0.02em'
            }}>
              SAFETY TRAINING SIMULATOR
            </h2>

            <div style={{
              background: 'rgba(15, 23, 42, 0.6)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              padding: '1.25rem',
              textAlign: 'left',
              marginBottom: '1.5rem',
              fontSize: '0.92rem',
              lineHeight: '1.6',
              color: '#cbd5e1'
            }}>
              <p style={{ margin: '0 0 0.75rem 0', color: '#f8fafc', fontWeight: '600' }}>
                Use this simulator while stationary and in a safe environment.
              </p>
              <p style={{ margin: 0 }}>
                Remain aware of your physical surroundings. Clear a 2-meter walking radius if using augmented reality mode.
              </p>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '1.5rem',
              fontSize: '0.82rem',
              color: '#94a3b8',
              padding: '0.75rem',
              background: 'rgba(255,255,255,0.03)',
              borderRadius: '6px'
            }}>
              <span>Benchmark: <strong style={{ color: '#2ee59d' }}>{scenarioDef.benchmark}%</strong></span>
              <span>Duration: <strong>{scenarioDef.durationMinutes} mins</strong></span>
              <span>Mode: <strong style={{ color: '#60a5fa' }}>Interactive AR/3D</strong></span>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={onCancel}
                style={{
                  flex: 1,
                  padding: '0.85rem',
                  borderRadius: '6px',
                  background: 'transparent',
                  border: '1px solid #334155',
                  color: '#94a3b8',
                  fontWeight: '700',
                  fontSize: '0.92rem',
                  cursor: 'pointer'
                }}
              >
                CANCEL
              </button>
              <button
                onClick={handleStartFromBriefing}
                style={{
                  flex: 2,
                  padding: '0.85rem',
                  borderRadius: '6px',
                  background: '#2ee59d',
                  border: 'none',
                  color: '#060b11',
                  fontWeight: '800',
                  fontSize: '0.98rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 4px 14px rgba(46, 229, 157, 0.4)'
                }}
              >
                <Play size={18} fill="#060b11" />
                <span>START TRAINING</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* STAGE 2: DETECTING CAPABILITIES & PREPARING AR SCENE           */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      {phase === 'DETECTING' && (
        <div style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            border: '4px solid #1e3a5f',
            borderTopColor: '#2ee59d',
            animation: 'spin 1s linear infinite',
            marginBottom: '1.25rem'
          }} />
          <h3 style={{ fontSize: '1.15rem', color: '#f8fafc', margin: '0 0 0.5rem 0' }}>
            Checking Device AR Capabilities...
          </h3>
          <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0 }}>
            Probing WebXR immersive-ar and surface hit-testing support...
          </p>
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* STAGE 3: 3D VIEWPORT CANVAS (AR PASSTHROUGH / 3D SCENE)        */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      {(phase === 'PLACING' || phase === 'ACTIVE') && (
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
          <canvas
            ref={canvasRef}
            style={{
              width: '100%',
              height: '100%',
              display: 'block',
              touchAction: 'none'
            }}
          />

          {/* AR Surface Scanning Overlay (Only in Real AR before placement) */}
          {phase === 'PLACING' && activeMode === 'REAL_AR' && (
            <div
              onClick={handleTapToPlace}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'rgba(0,0,0,0.25)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '2rem 1.5rem',
                boxSizing: 'border-box',
                cursor: 'pointer'
              }}
            >
              <div style={{
                background: 'rgba(15, 23, 42, 0.9)',
                border: '1px solid #3b82f6',
                borderRadius: '8px',
                padding: '1rem',
                textAlign: 'center',
                color: '#ffffff'
              }}>
                <Compass size={24} color="#60a5fa" style={{ marginBottom: '0.35rem' }} />
                <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '1rem' }}>
                  {placementState === PlacementState.SURFACE_FOUND
                    ? 'Surface Detected! Tap to Place Scenario'
                    : 'Slowly Move Phone to Scan Floor or Table'}
                </h4>
                <p style={{ margin: 0, fontSize: '0.82rem', color: '#94a3b8' }}>
                  Point camera downward at a textured horizontal surface.
                </p>
              </div>

              {placementState === PlacementState.SURFACE_FOUND && (
                <button
                  onClick={handleTapToPlace}
                  style={{
                    background: '#2ee59d',
                    color: '#060b11',
                    fontWeight: '800',
                    fontSize: '1rem',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '1rem',
                    boxShadow: '0 4px 16px rgba(46, 229, 157, 0.5)'
                  }}
                >
                  TAP HERE TO PLACE TRAINING SCENARIO
                </button>
              )}
            </div>
          )}

          {/* ═════════════════════════════════════════════════════════ */}
          {/* SIMULATOR HUD: TOP BAR                                    */}
          {/* ═════════════════════════════════════════════════════════ */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            padding: '0.75rem 1rem',
            boxSizing: 'border-box',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'linear-gradient(to bottom, rgba(10, 18, 28, 0.9) 0%, rgba(10, 18, 28, 0) 100%)',
            pointerEvents: 'none'
          }}>
            {/* Left: Module title & Mode Badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', pointerEvents: 'auto' }}>
              <div style={{
                background: 'rgba(15, 29, 42, 0.85)',
                border: '1px solid #1e3a5f',
                padding: '0.35rem 0.65rem',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem'
              }}>
                <HardHat size={16} color="#2ee59d" />
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: '800', color: '#ffffff', lineHeight: 1.1 }}>
                    {scenarioDef.title}
                  </div>
                  <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>
                    {activeMode === 'REAL_AR' ? 'REAL AR MODE' : activeMode === 'DESKTOP_PREVIEW' ? '3D PREVIEW' : '3D SIMULATION'}
                  </div>
                </div>
              </div>

              {/* Guided vs Assessment Toggle */}
              <button
                onClick={handleToggleTrainingMode}
                style={{
                  background: trainingMode === TrainingMode.GUIDED ? 'rgba(59, 130, 246, 0.2)' : 'rgba(234, 179, 8, 0.2)',
                  border: `1px solid ${trainingMode === TrainingMode.GUIDED ? '#3b82f6' : '#eab308'}`,
                  color: trainingMode === TrainingMode.GUIDED ? '#93c5fd' : '#fde047',
                  fontSize: '0.7rem',
                  fontWeight: '700',
                  padding: '0.35rem 0.6rem',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                {trainingMode === TrainingMode.GUIDED ? 'GUIDED' : 'ASSESSMENT'}
              </button>
            </div>

            {/* Right: Timer, Mute, Exit */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', pointerEvents: 'auto' }}>
              <div style={{
                background: 'rgba(15, 29, 42, 0.85)',
                border: '1px solid #1e3a5f',
                padding: '0.35rem 0.6rem',
                borderRadius: '6px',
                fontSize: '0.8rem',
                fontFamily: 'monospace',
                fontWeight: '700',
                color: '#2ee59d'
              }}>
                {formatTime(elapsedTimer)}
              </div>

              <button
                onClick={() => {
                  const muted = audioSystemRef.current.toggleMute();
                  setIsMuted(muted);
                }}
                style={{
                  background: 'rgba(15, 29, 42, 0.85)',
                  border: '1px solid #1e3a5f',
                  color: '#cbd5e1',
                  padding: '0.45rem',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center'
                }}
                title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
              >
                {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
              </button>

              <button
                onClick={handleExit}
                style={{
                  background: 'rgba(220, 38, 38, 0.2)',
                  border: '1px solid #dc2626',
                  color: '#f87171',
                  padding: '0.45rem',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center'
                }}
                title="Exit Simulator"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Progress Tracker Pill */}
          <div style={{
            position: 'absolute',
            top: '3.6rem',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(15, 23, 42, 0.85)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '20px',
            padding: '0.3rem 0.85rem',
            fontSize: '0.74rem',
            fontWeight: '700',
            color: '#e2e8f0',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
            pointerEvents: 'none'
          }}>
            <span>Hazards: <strong style={{ color: '#2ee59d' }}>{discoveredCount} / {totalHazardCount}</strong></span>
            <div style={{ width: '40px', height: '4px', background: '#334155', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{
                width: `${(discoveredCount / Math.max(1, totalHazardCount)) * 100}%`,
                height: '100%',
                background: '#2ee59d'
              }} />
            </div>
          </div>

          {/* Hint Message Toast */}
          {hintMessage && (
            <div style={{
              position: 'absolute',
              top: '5.5rem',
              left: '50%',
              transform: 'translateX(-50%)',
              background: '#0369a1',
              color: '#ffffff',
              padding: '0.6rem 1rem',
              borderRadius: '6px',
              fontSize: '0.82rem',
              boxShadow: '0 4px 15px rgba(0,0,0,0.4)',
              zIndex: 10
            }}>
              💡 {hintMessage}
            </div>
          )}

          {/* ═════════════════════════════════════════════════════════ */}
          {/* SIMULATOR HUD: BOTTOM INTERACTION SHEET                    */}
          {/* ═════════════════════════════════════════════════════════ */}
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '100%',
            padding: '1rem',
            boxSizing: 'border-box',
            pointerEvents: 'none',
            display: 'flex',
            justifyContent: 'center'
          }}>
            <div style={{
              maxWidth: '680px',
              width: '100%',
              background: 'rgba(15, 29, 42, 0.95)',
              border: '1px solid #1e3a5f',
              borderRadius: '10px',
              padding: '1.15rem',
              boxShadow: '0 10px 30px rgba(0,0,0,0.6)',
              backdropFilter: 'blur(8px)',
              pointerEvents: 'auto'
            }}>
              {/* If no hazard is currently inspected, show guidance instruction */}
              {!activeHazard ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <h5 style={{ margin: '0 0 0.2rem 0', fontSize: '0.95rem', color: '#f8fafc', fontWeight: '800' }}>
                      {trainingMode === TrainingMode.GUIDED
                        ? 'Tap any glowing marker or 3D equipment to inspect'
                        : 'Explore and tap components to inspect compliance'}
                    </h5>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8' }}>
                      {activeMode === 'REAL_AR'
                        ? 'Walk around the equipment in physical space or tap directly.'
                        : 'Drag screen to look around, pinch to zoom, tap equipment points.'}
                    </p>
                  </div>

                  {trainingMode === TrainingMode.GUIDED && (
                    <button
                      onClick={handleRequestHint}
                      style={{
                        background: 'rgba(255,255,255,0.08)',
                        border: '1px solid #334155',
                        color: '#93c5fd',
                        borderRadius: '6px',
                        padding: '0.45rem 0.8rem',
                        fontSize: '0.78rem',
                        fontWeight: '700',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        flexShrink: 0
                      }}
                    >
                      <Sparkles size={14} />
                      <span>HINT</span>
                    </button>
                  )}
                </div>
              ) : (
                /* Active Inspected Hazard & Decision Evaluation Card */
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.65rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                        <span style={{
                          fontSize: '0.68rem',
                          fontWeight: '800',
                          padding: '0.15rem 0.45rem',
                          borderRadius: '3px',
                          background: activeHazard.severity === 'CRITICAL' ? '#dc2626' : '#f59e0b',
                          color: '#ffffff'
                        }}>
                          {activeHazard.severity}
                        </span>
                        <h4 style={{ margin: 0, fontSize: '1rem', color: '#ffffff', fontWeight: '800' }}>
                          {activeHazard.name}
                        </h4>
                      </div>
                      <p style={{ margin: 0, fontSize: '0.82rem', color: '#cbd5e1', lineHeight: '1.4' }}>
                        {activeHazard.description}
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setActiveHazard(null);
                        setActiveDecision(null);
                        setDecisionFeedback(null);
                      }}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#64748b',
                        cursor: 'pointer',
                        padding: '0.2rem'
                      }}
                    >
                      <X size={18} />
                    </button>
                  </div>

                  {/* Decision question prompt */}
                  {activeDecision && !decisionFeedback && (
                    <div style={{
                      marginTop: '0.85rem',
                      borderTop: '1px solid #1e3a5f',
                      paddingTop: '0.85rem'
                    }}>
                      <div style={{ fontSize: '0.84rem', fontWeight: '700', color: '#facc15', marginBottom: '0.6rem' }}>
                        {activeDecision.question}
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {activeDecision.options.map((opt) => (
                          <button
                            key={opt.id}
                            onClick={() => handleSelectChoice(opt.id)}
                            style={{
                              textAlign: 'left',
                              background: '#132335',
                              border: '1px solid #234267',
                              borderRadius: '6px',
                              padding: '0.65rem 0.85rem',
                              color: '#f8fafc',
                              fontSize: '0.84rem',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            <span style={{
                              width: '20px',
                              height: '20px',
                              borderRadius: '50%',
                              background: '#1e3a5f',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.74rem',
                              fontWeight: '800',
                              flexShrink: 0
                            }}>
                              {opt.id}
                            </span>
                            <span>{opt.text}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Immediate Feedback (Safe action confirmed) */}
                  {decisionFeedback && decisionFeedback.isCorrect && (
                    <div style={{
                      marginTop: '0.85rem',
                      background: 'rgba(16, 185, 129, 0.15)',
                      border: '1px solid #10b981',
                      borderRadius: '6px',
                      padding: '0.75rem',
                      fontSize: '0.84rem',
                      color: '#6ee7b7',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      <CheckCircle2 size={20} color="#10b981" style={{ flexShrink: 0 }} />
                      <div>{decisionFeedback.text}</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ═════════════════════════════════════════════════════════ */}
          {/* CONSEQUENCE ENGINE MODAL (NEAR-MISS SIMULATION)            */}
          {/* ═════════════════════════════════════════════════════════ */}
          {activeConsequence && (
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: 'rgba(6, 11, 17, 0.85)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1.5rem',
              boxSizing: 'border-box',
              zIndex: 20
            }}>
              <div style={{
                maxWidth: '520px',
                width: '100%',
                background: '#171a21',
                border: '2px solid #ef4444',
                borderRadius: '10px',
                padding: '1.75rem',
                boxShadow: '0 25px 60px rgba(239, 68, 68, 0.35)',
                textAlign: 'left'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1rem' }}>
                  <div style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    background: 'rgba(239, 68, 68, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ef4444'
                  }}>
                    <AlertTriangle size={22} />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.72rem', fontWeight: '800', color: '#f87171', textTransform: 'uppercase' }}>
                      Safety Protocol Alert
                    </span>
                    <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#ffffff', fontWeight: '800' }}>
                      {activeConsequence.title}
                    </h3>
                  </div>
                </div>

                <div style={{
                  background: 'rgba(0,0,0,0.4)',
                  borderRadius: '6px',
                  padding: '1rem',
                  marginBottom: '1rem',
                  fontSize: '0.88rem',
                  lineHeight: '1.5',
                  color: '#e2e8f0'
                }}>
                  <p style={{ margin: '0 0 0.5rem 0', color: '#fca5a5', fontWeight: '700' }}>
                    Hazard Explanation:
                  </p>
                  <p style={{ margin: 0 }}>
                    {activeConsequence.hazardExplanation}
                  </p>
                </div>

                <div style={{
                  background: 'rgba(46, 229, 157, 0.08)',
                  borderLeft: '4px solid #2ee59d',
                  padding: '0.85rem 1rem',
                  marginBottom: '1.5rem',
                  fontSize: '0.86rem',
                  lineHeight: '1.5',
                  color: '#f8fafc'
                }}>
                  <strong style={{ color: '#2ee59d' }}>Safer Response: </strong>
                  {activeConsequence.saferResponse}
                </div>

                <button
                  onClick={handleRetryConsequence}
                  style={{
                    width: '100%',
                    padding: '0.85rem',
                    borderRadius: '6px',
                    background: '#ef4444',
                    border: 'none',
                    color: '#ffffff',
                    fontWeight: '800',
                    fontSize: '0.94rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.45rem',
                    boxShadow: '0 4px 14px rgba(239, 68, 68, 0.4)'
                  }}
                >
                  <RotateCcw size={16} />
                  <span>RETRY DECISION</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* STAGE 4: TRAINING RESULTS & SCORE SCREEN                        */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      {phase === 'RESULTS' && finalResults && (
        <div style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1.5rem',
          background: 'radial-gradient(circle at center, #0f2438 0%, #060b11 100%)',
          overflowY: 'auto'
        }}>
          <div style={{
            maxWidth: '560px',
            width: '100%',
            background: '#0f1d2a',
            border: `2px solid ${finalResults.isPassed ? '#10b981' : '#f59e0b'}`,
            borderRadius: '12px',
            padding: '2rem',
            boxShadow: '0 20px 50px rgba(0,0,0,0.7)',
            textAlign: 'center'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: finalResults.isPassed ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
              border: `2px solid ${finalResults.isPassed ? '#10b981' : '#f59e0b'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem',
              color: finalResults.isPassed ? '#10b981' : '#f59e0b'
            }}>
              {finalResults.isPassed ? <Award size={34} /> : <RotateCcw size={34} />}
            </div>

            <div style={{
              fontSize: '0.8rem',
              letterSpacing: '0.1em',
              fontWeight: '800',
              color: '#94a3b8',
              textTransform: 'uppercase',
              marginBottom: '0.35rem'
            }}>
              {scenarioDef.title}
            </div>

            <h2 style={{
              fontSize: '2rem',
              fontWeight: '900',
              color: '#ffffff',
              margin: '0 0 0.2rem 0'
            }}>
              Score: {finalResults.score}%
            </h2>

            <div style={{ fontSize: '0.88rem', color: '#94a3b8', marginBottom: '1.25rem' }}>
              Statutory Benchmark: <strong>{finalResults.benchmark}%</strong> • STATUS:{' '}
              <strong style={{ color: finalResults.isPassed ? '#2ee59d' : '#f87171' }}>
                {finalResults.isPassed ? 'PASSED' : 'RETAKE REQUIRED'}
              </strong>
            </div>

            {/* Metrics Breakdown Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '0.75rem',
              marginBottom: '1.5rem',
              textAlign: 'left'
            }}>
              <div style={{ background: '#132335', padding: '0.75rem', borderRadius: '6px' }}>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Hazards identified</div>
                <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#ffffff' }}>
                  {finalResults.hazardsFound} / {finalResults.totalHazards}
                </div>
              </div>

              <div style={{ background: '#132335', padding: '0.75rem', borderRadius: '6px' }}>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Correct decisions</div>
                <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#ffffff' }}>
                  {finalResults.correctDecisions} / {finalResults.totalDecisions}
                </div>
              </div>

              <div style={{ background: '#132335', padding: '0.75rem', borderRadius: '6px' }}>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Mistakes recorded</div>
                <div style={{ fontSize: '1.1rem', fontWeight: '800', color: finalResults.mistakes > 0 ? '#f87171' : '#2ee59d' }}>
                  {finalResults.mistakes}
                </div>
              </div>

              <div style={{ background: '#132335', padding: '0.75rem', borderRadius: '6px' }}>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Hints used</div>
                <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#ffffff' }}>
                  {finalResults.hintsUsed}
                </div>
              </div>
            </div>

            {/* Strengths & Improvements */}
            <div style={{ textAlign: 'left', marginBottom: '1.5rem' }}>
              {finalResults.strengths.length > 0 && (
                <div style={{ marginBottom: '1rem' }}>
                  <h5 style={{ margin: '0 0 0.5rem 0', fontSize: '0.84rem', color: '#2ee59d', fontWeight: '800' }}>
                    WHAT YOU DID WELL
                  </h5>
                  {finalResults.strengths.map((str, idx) => (
                    <div key={idx} style={{ fontSize: '0.82rem', color: '#cbd5e1', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Check size={14} color="#2ee59d" />
                      <span>{str}</span>
                    </div>
                  ))}
                </div>
              )}

              {finalResults.improvements.length > 0 && (
                <div>
                  <h5 style={{ margin: '0 0 0.5rem 0', fontSize: '0.84rem', color: '#f59e0b', fontWeight: '800' }}>
                    AREAS TO IMPROVE
                  </h5>
                  {finalResults.improvements.map((imp, idx) => (
                    <div key={idx} style={{ fontSize: '0.82rem', color: '#cbd5e1', marginBottom: '0.25rem' }}>
                      • {imp}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Action CTAs */}
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={() => {
                  setPhase('BRIEFING');
                  setActiveHazard(null);
                  setActiveDecision(null);
                  setDecisionFeedback(null);
                  setDiscoveredCount(0);
                  setElapsedTimer(0);
                }}
                style={{
                  flex: 1,
                  padding: '0.85rem',
                  borderRadius: '6px',
                  background: 'transparent',
                  border: '1px solid #334155',
                  color: '#94a3b8',
                  fontWeight: '700',
                  fontSize: '0.92rem',
                  cursor: 'pointer'
                }}
              >
                RETRY
              </button>

              <button
                onClick={handleExit}
                style={{
                  flex: 2,
                  padding: '0.85rem',
                  borderRadius: '6px',
                  background: '#2ee59d',
                  border: 'none',
                  color: '#060b11',
                  fontWeight: '800',
                  fontSize: '0.96rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
              >
                <span>{finalResults.isPassed ? 'CONTINUE TO PASSPORT' : 'EXIT TO ROSTER'}</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
