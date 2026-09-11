/**
 * GasConfinedModel
 * Procedural 3D scene for Module 2: Gas Leak & Confined Space Protocol.
 * Contains:
 *  - Underground blind heading / confined-space portal
 *  - Restricted Zone Barricade with colliery danger sign
 *  - Handheld Multi-Gas Detector with simulated LED readout (CH4, CO, O2)
 *  - Ventilation Brattice curtain
 *  - 2-person buddy signaling station & safe airway retreat route
 */

import * as THREE from 'three';
import { MineTunnelModel } from './MineTunnelModel.js';

export class GasConfinedModel {
  static create(options = {}) {
    const sceneGroup = new THREE.Group();
    sceneGroup.name = 'GasConfinedScenario';

    // 1. Underground Mine Tunnel
    const tunnel = MineTunnelModel.create({ length: 8, width: 3.2, height: 2.5 });
    sceneGroup.add(tunnel);

    // 2. Confined Space Portal & Hazard Barricade
    const portalGroup = new THREE.Group();
    portalGroup.name = 'ConfinedPortal';
    portalGroup.position.set(0, 0, -2.4);

    // Ventilation Brattice Cloth (Heavy orange/yellow plastic hanging curtain)
    const bratticeGeo = new THREE.PlaneGeometry(1.6, 2.2);
    const bratticeMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b, // Amber safety curtain
      roughness: 0.7,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.9
    });
    const brattice = new THREE.Mesh(bratticeGeo, bratticeMat);
    brattice.position.set(0, 1.1, -0.3);
    portalGroup.add(brattice);

    // Cross barrier / wooden crossbar (Do Not Enter)
    const barMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.8 });
    const bar1 = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.08, 0.04), barMat);
    bar1.position.set(0, 0.9, 0);
    const bar2 = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.08, 0.04), barMat);
    bar2.position.set(0, 0.5, 0);
    portalGroup.add(bar1, bar2);

    // Warning Signboard (RESTRICTED CONFINED SPACE — GAS HAZARD)
    const signBoard = new THREE.Mesh(
      new THREE.BoxGeometry(0.7, 0.35, 0.02),
      new THREE.MeshStandardMaterial({ color: 0xdc2626 }) // Red danger
    );
    signBoard.position.set(0, 1.3, 0.02);
    portalGroup.add(signBoard);

    // Flashing amber warning strobe light on top of barricade
    const strobeLight = new THREE.PointLight(0xf59e0b, 2.5, 5);
    strobeLight.position.set(0, 1.6, 0.1);
    portalGroup.add(strobeLight);

    sceneGroup.add(portalGroup);

    // 3. Multi-Gas Digital Detector on Stand
    const detectorGroup = new THREE.Group();
    detectorGroup.name = 'MultiGasDetector';
    detectorGroup.position.set(-0.7, 0, -0.6);

    // Pedestal stand
    const stand = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.05, 0.85, 16),
      new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.6 })
    );
    stand.position.y = 0.425;
    detectorGroup.add(stand);

    // Rugged Rubberized Device Body (Safety Yellow)
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0xeab308, roughness: 0.4 });
    const deviceBody = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.24, 0.08), bodyMat);
    deviceBody.position.set(0, 0.95, 0);

    // LCD Screen (Simulated backlit multi-gas readout)
    const screenMat = new THREE.MeshBasicMaterial({ color: 0x0f172a });
    const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.11, 0.1), screenMat);
    screen.position.set(0, 0.98, 0.041);

    // Gas Sensor Sniffer Snout
    const snout = new THREE.Mesh(
      new THREE.CylinderGeometry(0.025, 0.025, 0.06, 16),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.9 })
    );
    snout.position.set(0, 1.1, 0);

    // Gas alarm status LED (Blinking Red)
    const ledMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
    const led = new THREE.Mesh(new THREE.SphereGeometry(0.015, 8, 8), ledMat);
    led.position.set(0.04, 1.05, 0.042);

    detectorGroup.add(deviceBody, screen, snout, led);
    sceneGroup.add(detectorGroup);

    // 4. Atmospheric Gas Vapor Indicator (Transparent green/amber haze)
    const hazeGeo = new THREE.SphereGeometry(1.2, 16, 16);
    const hazeMat = new THREE.MeshBasicMaterial({
      color: 0x84cc16,
      transparent: true,
      opacity: 0.12,
      wireframe: true
    });
    const gasHaze = new THREE.Mesh(hazeGeo, hazeMat);
    gasHaze.position.set(0, 1.2, -2.6);
    sceneGroup.add(gasHaze);

    // 5. Buddy Signaling Station (Intercom / Signal Bell)
    const commGroup = new THREE.Group();
    commGroup.name = 'BuddyCommStation';
    commGroup.position.set(1.45, 1.3, 0.2);

    const commBox = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 0.25, 0.2),
      new THREE.MeshStandardMaterial({ color: 0x0369a1, metalness: 0.4 })
    );
    const signalBell = new THREE.Mesh(
      new THREE.SphereGeometry(0.04, 12, 12),
      new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.9 })
    );
    signalBell.position.set(-0.05, 0.05, 0);
    commGroup.add(commBox, signalBell);
    sceneGroup.add(commGroup);

    // Animation loop callback
    sceneGroup.userData.animate = (delta, time) => {
      strobeLight.intensity = (Math.sin(time * 8) > 0) ? 3.0 : 0.2;
      ledMat.color.setHex((Math.sin(time * 8) > 0) ? 0xef4444 : 0x450a0a);
      gasHaze.rotation.y += delta * 0.2;
      gasHaze.rotation.x += delta * 0.1;
    };

    return sceneGroup;
  }
}
