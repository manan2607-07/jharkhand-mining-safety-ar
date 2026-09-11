/**
 * FireEmergencyModel
 * Procedural 3D scene for Module 1: Fire & Explosion Response.
 * Contains:
 *  - Simulated colliery conveyor friction fire source with animated flame particles
 *  - Dry Chemical Powder (DCP) Fire Extinguisher with inspectable PASS parts
 *  - Acoustic Emergency Alarm pull station
 *  - Statutory illuminated Green Exit Signage & evacuation route waypoints
 */

import * as THREE from 'three';
import { MineTunnelModel } from './MineTunnelModel.js';

export class FireEmergencyModel {
  static create(options = {}) {
    const sceneGroup = new THREE.Group();
    sceneGroup.name = 'FireEmergencyScenario';

    // 1. Underground Drift Tunnel
    const tunnel = MineTunnelModel.create({ length: 9, width: 3.4, height: 2.5 });
    sceneGroup.add(tunnel);

    // 2. Simulated Fire Source (Conveyor idler friction)
    const fireGroup = new THREE.Group();
    fireGroup.name = 'FireSource';
    fireGroup.position.set(0.6, 0.35, -2.5);

    // Smoldering conveyor roller stand
    const rollerStand = new THREE.Mesh(
      new THREE.BoxGeometry(0.8, 0.4, 0.5),
      new THREE.MeshStandardMaterial({ color: 0x262626, roughness: 0.9 })
    );
    rollerStand.position.y = 0.2;
    fireGroup.add(rollerStand);

    // Flame Core (Layered translucent cones with emissive orange/yellow)
    const flameGeo = new THREE.ConeGeometry(0.28, 0.7, 16);
    const flameMat = new THREE.MeshBasicMaterial({
      color: 0xff4500,
      transparent: true,
      opacity: 0.85
    });
    const flameCore = new THREE.Mesh(flameGeo, flameMat);
    flameCore.position.y = 0.65;
    fireGroup.add(flameCore);

    const innerFlameGeo = new THREE.ConeGeometry(0.18, 0.5, 16);
    const innerFlameMat = new THREE.MeshBasicMaterial({
      color: 0xffea00,
      transparent: true,
      opacity: 0.95
    });
    const innerFlame = new THREE.Mesh(innerFlameGeo, innerFlameMat);
    innerFlame.position.y = 0.58;
    fireGroup.add(innerFlame);

    // Animated point light for fire flicker
    const fireLight = new THREE.PointLight(0xff7700, 3, 6, 1.8);
    fireLight.position.y = 0.8;
    fireGroup.add(fireLight);

    // Smoke Puff Particles
    const smokeGroup = new THREE.Group();
    smokeGroup.name = 'SmokePuffs';
    const smokeMat = new THREE.MeshBasicMaterial({
      color: 0x475569,
      transparent: true,
      opacity: 0.45
    });
    for (let i = 0; i < 6; i++) {
      const puff = new THREE.Mesh(new THREE.DodecahedronGeometry(0.18 + Math.random() * 0.15, 1), smokeMat);
      puff.position.set(
        (Math.random() - 0.5) * 0.4,
        1.1 + i * 0.25,
        (Math.random() - 0.5) * 0.4
      );
      smokeGroup.add(puff);
    }
    fireGroup.add(smokeGroup);
    sceneGroup.add(fireGroup);

    // Animate flames during frame callback
    sceneGroup.userData.animate = (delta, time) => {
      const s = 1 + Math.sin(time * 12) * 0.15;
      flameCore.scale.set(s, 1 + Math.cos(time * 10) * 0.2, s);
      innerFlame.scale.set(1 + Math.cos(time * 14) * 0.1, 1 + Math.sin(time * 12) * 0.15, 1);
      fireLight.intensity = 2.5 + Math.sin(time * 20) * 0.8;

      smokeGroup.children.forEach((puff, idx) => {
        puff.position.y += delta * 0.3;
        puff.position.x += Math.sin(time * 2 + idx) * delta * 0.1;
        if (puff.position.y > 2.3) {
          puff.position.y = 1.0;
        }
      });
    };

    // 3. Dry Chemical Powder Extinguisher (PASS Training Object)
    const extinguisherGroup = new THREE.Group();
    extinguisherGroup.name = 'PASS_Extinguisher';
    extinguisherGroup.position.set(-1.0, 0, 0.4);

    const extMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, metalness: 0.3, roughness: 0.3 }); // Red cylinder
    const extBody = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.48, 20), extMat);
    extBody.position.y = 0.24;

    const extCap = new THREE.Mesh(new THREE.SphereGeometry(0.1, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2), extMat);
    extCap.position.y = 0.48;

    // Handle & Lever (Squeeze)
    const leverMat = new THREE.MeshStandardMaterial({ color: 0x111827, metalness: 0.8 });
    const handle = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.08, 0.12), leverMat);
    handle.position.set(0, 0.54, -0.02);

    // Pull Pin
    const pinMat = new THREE.MeshStandardMaterial({ color: 0xeab308, metalness: 0.9, roughness: 0.2 });
    const pin = new THREE.Mesh(new THREE.TorusGeometry(0.025, 0.005, 8, 16), pinMat);
    pin.position.set(0.05, 0.53, 0);

    // Discharge Hose & Nozzle (Aim)
    const hoseMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8 });
    const nozzle = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.025, 0.15, 12), hoseMat);
    nozzle.rotation.z = Math.PI / 3;
    nozzle.position.set(0.12, 0.3, 0.06);

    extinguisherGroup.add(extBody, extCap, handle, pin, nozzle);
    sceneGroup.add(extinguisherGroup);

    // 4. Acoustic Manual Emergency Alarm Box on Wall
    const alarmGroup = new THREE.Group();
    alarmGroup.name = 'EmergencyAlarmBox';
    alarmGroup.position.set(-1.55, 1.4, -0.6);

    const alarmBox = new THREE.Mesh(
      new THREE.BoxGeometry(0.1, 0.26, 0.22),
      new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.4 })
    );
    const alarmLever = new THREE.Mesh(
      new THREE.BoxGeometry(0.04, 0.12, 0.04),
      new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.7 })
    );
    alarmLever.position.set(0.06, -0.02, 0);
    alarmGroup.add(alarmBox, alarmLever);

    // Flashing emergency beacon on top of alarm
    const beaconGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.06, 16);
    const beaconMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const beacon = new THREE.Mesh(beaconGeo, beaconMat);
    beacon.position.set(0, 0.16, 0);
    alarmGroup.add(beacon);
    sceneGroup.add(alarmGroup);

    // 5. Statutory Emergency Exit Sign & Route Arrows
    const exitSignGroup = new THREE.Group();
    exitSignGroup.name = 'ExitSignage';
    exitSignGroup.position.set(0, 2.1, 3.2);

    const signBoard = new THREE.Mesh(
      new THREE.BoxGeometry(0.65, 0.24, 0.04),
      new THREE.MeshStandardMaterial({ color: 0x059669 }) // Statutory Green
    );
    const signText = new THREE.Mesh(
      new THREE.PlaneGeometry(0.58, 0.18),
      new THREE.MeshBasicMaterial({ color: 0xffffff })
    );
    signText.position.set(0, 0, -0.021);
    signText.rotation.y = Math.PI;
    exitSignGroup.add(signBoard, signText);

    // Illuminated exit directional light
    const exitLight = new THREE.PointLight(0x10b981, 1.5, 4);
    exitLight.position.set(0, -0.2, -0.2);
    exitSignGroup.add(exitLight);
    sceneGroup.add(exitSignGroup);

    // Floor evacuation chevron direction arrows
    const arrowMat = new THREE.MeshBasicMaterial({ color: 0x10b981, side: THREE.DoubleSide });
    for (let i = 0; i < 3; i++) {
      const arrowGeo = new THREE.ConeGeometry(0.14, 0.28, 3).rotateX(-Math.PI / 2);
      const arrow = new THREE.Mesh(arrowGeo, arrowMat);
      arrow.position.set(0, 0.02, -0.8 + i * 1.4);
      sceneGroup.add(arrow);
    }

    return sceneGroup;
  }
}
