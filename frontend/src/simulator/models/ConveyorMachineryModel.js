/**
 * ConveyorMachineryModel
 * Procedural 3D scene for Module 3: Machinery & Moving-Part Safety.
 * Contains:
 *  - Coal conveyor belt system with drive drum and return idler rollers
 *  - In-running roller nip PINCH POINTS
 *  - Continuous Emergency Trip-Wire Pull Cord & Stop Switch
 *  - Removable / Displaced Safety Wire Mesh Guard
 *  - Authorized Lock-Out/Tag-Out (LOTO) Padlock Isolation Station
 *  - Statutory Machinery Warning Signage
 */

import * as THREE from 'three';
import { MineTunnelModel } from './MineTunnelModel.js';

export class ConveyorMachineryModel {
  static create(options = {}) {
    const sceneGroup = new THREE.Group();
    sceneGroup.name = 'ConveyorMachineryScenario';

    // 1. Underground Drift Tunnel
    const tunnel = MineTunnelModel.create({ length: 9, width: 3.4, height: 2.5 });
    sceneGroup.add(tunnel);

    // 2. Conveyor Structural Frame
    const conveyorGroup = new THREE.Group();
    conveyorGroup.name = 'ConveyorSystem';
    conveyorGroup.position.set(0, 0, -0.4);

    const steelMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8, roughness: 0.4 });
    const beltMat = new THREE.MeshStandardMaterial({ color: 0x171717, roughness: 0.9 }); // Heavy black rubber
    const rollerMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.9, roughness: 0.2 });

    const length = 5.2;
    const width = 0.85;
    const height = 0.75;

    // Main side stringer beams
    const leftBeam = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.12, length), steelMat);
    leftBeam.position.set(-width / 2, height, 0);
    const rightBeam = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.12, length), steelMat);
    rightBeam.position.set(width / 2, height, 0);
    conveyorGroup.add(leftBeam, rightBeam);

    // Support A-frame legs
    const legCount = 4;
    for (let i = 0; i < legCount; i++) {
      const zPos = -length / 2 + 0.5 + (i * (length - 1) / (legCount - 1));
      const leg1 = new THREE.Mesh(new THREE.BoxGeometry(0.05, height, 0.05), steelMat);
      leg1.position.set(-width / 2, height / 2, zPos);
      const leg2 = new THREE.Mesh(new THREE.BoxGeometry(0.05, height, 0.05), steelMat);
      leg2.position.set(width / 2, height / 2, zPos);
      const cross = new THREE.Mesh(new THREE.BoxGeometry(width, 0.04, 0.04), steelMat);
      cross.position.set(0, 0.15, zPos);
      conveyorGroup.add(leg1, leg2, cross);
    }

    // Rotating Drive Drum Pulley at far end
    const drumGeo = new THREE.CylinderGeometry(0.22, 0.22, width - 0.08, 24);
    drumGeo.rotateZ(Math.PI / 2);
    const drum = new THREE.Mesh(drumGeo, steelMat);
    drum.position.set(0, height, -length / 2 + 0.3);
    conveyorGroup.add(drum);

    // Return Tail Drum Pulley at near end
    const tailDrum = new THREE.Mesh(drumGeo, steelMat);
    tailDrum.position.set(0, height, length / 2 - 0.3);
    conveyorGroup.add(tailDrum);

    // Troughing Idler Rollers along top carrying strand
    const rollers = [];
    for (let i = 0; i < 5; i++) {
      const zPos = -length / 2 + 0.9 + i * 0.85;
      const rollerGeo = new THREE.CylinderGeometry(0.06, 0.06, width - 0.12, 16);
      rollerGeo.rotateZ(Math.PI / 2);
      const roller = new THREE.Mesh(rollerGeo, rollerMat);
      roller.position.set(0, height + 0.05, zPos);
      conveyorGroup.add(roller);
      rollers.push(roller);
    }

    // Top carrying belt surface
    const topBelt = new THREE.Mesh(new THREE.BoxGeometry(width - 0.1, 0.015, length - 0.6), beltMat);
    topBelt.position.set(0, height + 0.11, 0);
    // Bottom return belt surface
    const bottomBelt = new THREE.Mesh(new THREE.BoxGeometry(width - 0.1, 0.015, length - 0.6), beltMat);
    bottomBelt.position.set(0, 0.25, 0);
    conveyorGroup.add(topBelt, bottomBelt);

    // 3. Exposed Pinch Point Indicator (Hazard Zone on roller #2)
    const pinchPointZone = new THREE.Group();
    pinchPointZone.name = 'PinchPointHazard';
    pinchPointZone.position.set(0, height + 0.05, -0.8);

    // In-running nip warning marker (striped red/yellow chevron ring)
    const pinchRingGeo = new THREE.RingGeometry(0.12, 0.16, 24);
    const pinchRingMat = new THREE.MeshBasicMaterial({ color: 0xef4444, side: THREE.DoubleSide });
    const pinchRing = new THREE.Mesh(pinchRingGeo, pinchRingMat);
    pinchRing.rotation.y = Math.PI / 2;
    pinchPointZone.add(pinchRing);
    conveyorGroup.add(pinchPointZone);

    // 4. Missing / Displaced Wire Mesh Safety Guard
    const guardMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b, // Safety Yellow mesh
      wireframe: true,
      roughness: 0.5
    });

    // Guard on left side (properly installed)
    const leftGuard = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.45, 2.2), guardMat);
    leftGuard.position.set(-width / 2 - 0.05, height + 0.1, 0.8);
    conveyorGroup.add(leftGuard);

    // Displaced / Missing Guard on right side (Hazard!)
    const missingGuardZone = new THREE.Group();
    missingGuardZone.name = 'MissingGuardHazard';
    missingGuardZone.position.set(width / 2 + 0.05, height + 0.1, -0.8);
    // Wireframe outline showing empty gap where guard is missing
    const gapBox = new THREE.Mesh(
      new THREE.BoxGeometry(0.02, 0.45, 1.6),
      new THREE.MeshBasicMaterial({ color: 0xef4444, wireframe: true, transparent: true, opacity: 0.7 })
    );
    missingGuardZone.add(gapBox);
    conveyorGroup.add(missingGuardZone);

    // 5. Emergency Trip-Wire Pull Cord along full conveyor length
    const pullCordGroup = new THREE.Group();
    pullCordGroup.name = 'EmergencyPullCord';
    pullCordGroup.position.set(-width / 2 - 0.15, height + 0.22, 0);

    // Stainless steel wire rope line
    const cordCurve = new THREE.LineCurve3(
      new THREE.Vector3(0, 0, -length / 2 + 0.4),
      new THREE.Vector3(0, 0, length / 2 - 0.4)
    );
    const cordGeo = new THREE.TubeGeometry(cordCurve, 20, 0.006, 8, false);
    const cordMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, metalness: 0.8 }); // Red trip wire
    const cord = new THREE.Mesh(cordGeo, cordMat);
    pullCordGroup.add(cord);

    // Pull switch box with manual reset flag
    const switchBox = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 0.22, 0.14),
      new THREE.MeshStandardMaterial({ color: 0xdc2626 }) // Red emergency box
    );
    switchBox.position.set(0, -0.08, 0);
    const resetLever = new THREE.Mesh(
      new THREE.BoxGeometry(0.04, 0.08, 0.04),
      new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.9 })
    );
    resetLever.position.set(-0.06, 0.05, 0);
    pullCordGroup.add(switchBox, resetLever);
    conveyorGroup.add(pullCordGroup);

    // 6. Authorized LOTO (Lockout / Tagout) Station Stand
    const lotoStation = new THREE.Group();
    lotoStation.name = 'LOTOStation';
    lotoStation.position.set(1.2, 0, 0.4);

    const lotoPost = new THREE.Mesh(
      new THREE.CylinderGeometry(0.03, 0.03, 1.1, 16),
      new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.7 })
    );
    lotoPost.position.y = 0.55;

    const lotoBoard = new THREE.Mesh(
      new THREE.BoxGeometry(0.4, 0.3, 0.03),
      new THREE.MeshStandardMaterial({ color: 0xb91c1c }) // Safety Red Board
    );
    lotoBoard.position.set(0, 1.1, 0);

    // Red Safety Padlocks hanging on hasp
    const padlockMat = new THREE.MeshStandardMaterial({ color: 0xef4444, metalness: 0.6 });
    const lock1 = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.06, 0.02), padlockMat);
    lock1.position.set(-0.08, 1.08, 0.03);
    const lock2 = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.06, 0.02), padlockMat);
    lock2.position.set(0.08, 1.08, 0.03);

    // Danger Tag
    const tagMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const tag = new THREE.Mesh(new THREE.PlaneGeometry(0.06, 0.09), tagMat);
    tag.position.set(0, 1.07, 0.031);

    lotoStation.add(lotoPost, lotoBoard, lock1, lock2, tag);
    sceneGroup.add(lotoStation);

    sceneGroup.add(conveyorGroup);

    // Conveyor belt and roller animation
    sceneGroup.userData.isConveyorRunning = true;
    sceneGroup.userData.animate = (delta, time) => {
      if (sceneGroup.userData.isConveyorRunning) {
        drum.rotation.x += delta * 3;
        tailDrum.rotation.x += delta * 3;
        rollers.forEach((r) => (r.rotation.x += delta * 3));
      }
    };

    return sceneGroup;
  }
}
