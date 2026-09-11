/**
 * ElectricalBlastingModel
 * Procedural 3D scene for Module 4: Electrical & Blasting Clearance.
 * Strict safety awareness architecture complying with mining statutory limits:
 *  - Section A: Heavy Flameproof (FLP) Switchgear Enclosure & Trailing Cable arc-flash boundary
 *  - Section B: Shot-Firing Blast Clearance Barricade & Danger Perimeter Cordon
 * Note: ZERO operational shot-firing or electrical internal repair instructions. Clearance & reporting only.
 */

import * as THREE from 'three';
import { MineTunnelModel } from './MineTunnelModel.js';

export class ElectricalBlastingModel {
  static create(options = {}) {
    const sceneGroup = new THREE.Group();
    sceneGroup.name = 'ElectricalBlastingScenario';

    // 1. Underground Mine Tunnel
    const tunnel = MineTunnelModel.create({ length: 9, width: 3.4, height: 2.5 });
    sceneGroup.add(tunnel);

    // ═══════════════════════════════════════════════════════════════
    // SECTION A: ELECTRICAL SAFETY & FLP ENCLOSURE INSPECTION
    // ═══════════════════════════════════════════════════════════════
    const electricalGroup = new THREE.Group();
    electricalGroup.name = 'ElectricalSection';
    electricalGroup.position.set(-1.1, 0, -1.0);

    // Heavy Cast Iron Flameproof (FLP) Electrical Enclosure
    const flpMat = new THREE.MeshStandardMaterial({
      color: 0x334155, // Heavy colliery industrial iron
      metalness: 0.85,
      roughness: 0.35
    });
    const flpBox = new THREE.Mesh(new THREE.BoxGeometry(0.7, 1.1, 0.45), flpMat);
    flpBox.position.y = 0.55;
    electricalGroup.add(flpBox);

    // Front Flanged Inspection Cover Plate with Machined Flamepath Gap
    const coverPlate = new THREE.Mesh(
      new THREE.BoxGeometry(0.62, 0.95, 0.04),
      new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.9, roughness: 0.3 })
    );
    coverPlate.position.set(0, 0.55, 0.23);
    electricalGroup.add(coverPlate);

    // Perimeter High-Tensile Bolts around FLP cover
    const boltMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9 });
    for (let i = 0; i < 6; i++) {
      const boltLeft = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.03, 12), boltMat);
      boltLeft.rotation.x = Math.PI / 2;
      boltLeft.position.set(-0.28, 0.18 + i * 0.15, 0.25);
      electricalGroup.add(boltLeft);

      // On right side, omit one bolt to represent missing/loose bolt hazard!
      if (i !== 3) {
        const boltRight = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.03, 12), boltMat);
        boltRight.rotation.x = Math.PI / 2;
        boltRight.position.set(0.28, 0.18 + i * 0.15, 0.25);
        electricalGroup.add(boltRight);
      }
    }

    // High Voltage Triangle Warning Sign on FLP Door
    const signGeo = new THREE.ConeGeometry(0.12, 0.18, 3);
    const signMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 }); // Caution Yellow
    const hvSign = new THREE.Mesh(signGeo, signMat);
    hvSign.position.set(0, 0.72, 0.255);
    electricalGroup.add(hvSign);

    // Armored High-Voltage Trailing Cable on Floor
    const cableMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.8 });
    const cableCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0.05, 0.15),
      new THREE.Vector3(0.4, 0.04, 0.8),
      new THREE.Vector3(0.9, 0.04, 1.4),
      new THREE.Vector3(1.3, 0.04, 2.2)
    ]);
    const cableGeo = new THREE.TubeGeometry(cableCurve, 24, 0.025, 12, false);
    const cableMesh = new THREE.Mesh(cableGeo, cableMat);
    electricalGroup.add(cableMesh);

    // Damaged Cable Section with Exposed Sheath / Spark Hazard Marker
    const cableFaultMarker = new THREE.Group();
    cableFaultMarker.name = 'CableFaultHazard';
    cableFaultMarker.position.set(0.4, 0.06, 0.8);
    const sparkGeo = new THREE.RingGeometry(0.06, 0.09, 16).rotateX(-Math.PI / 2);
    const sparkMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b, side: THREE.DoubleSide });
    cableFaultMarker.add(new THREE.Mesh(sparkGeo, sparkMat));
    electricalGroup.add(cableFaultMarker);

    // Yellow Arc-Flash Safe Distance Boundary on floor (1.5 meter clearance)
    const arcTapeGeo = new THREE.RingGeometry(1.4, 1.48, 32).rotateX(-Math.PI / 2);
    const arcTapeMat = new THREE.MeshBasicMaterial({ color: 0xeab308, side: THREE.DoubleSide });
    const arcTape = new THREE.Mesh(arcTapeGeo, arcTapeMat);
    arcTape.position.set(0, 0.02, 0);
    electricalGroup.add(arcTape);

    sceneGroup.add(electricalGroup);

    // ═══════════════════════════════════════════════════════════════
    // SECTION B: BLASTING CLEARANCE & RESTRICTED CORDON
    // ═══════════════════════════════════════════════════════════════
    const blastGroup = new THREE.Group();
    blastGroup.name = 'BlastingSection';
    blastGroup.position.set(0, 0, 1.8);

    // Red-and-White Danger Barricade across drift
    const barricadeMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.6 });
    const barTop = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.12, 0.04), barricadeMat);
    barTop.position.set(0, 0.95, 0);

    const barBottom = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.12, 0.04), barricadeMat);
    barBottom.position.set(0, 0.5, 0);

    const post1 = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.1, 0.08), barricadeMat);
    post1.position.set(-1.1, 0.55, 0);
    const post2 = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.1, 0.08), barricadeMat);
    post2.position.set(1.1, 0.55, 0);

    blastGroup.add(barTop, barBottom, post1, post2);

    // Statutory Danger Signboard: DANGER — SHOT-FIRING RESTRICTED AREA
    const blastSign = new THREE.Mesh(
      new THREE.BoxGeometry(0.9, 0.4, 0.02),
      new THREE.MeshStandardMaterial({ color: 0xffffff })
    );
    blastSign.position.set(0, 1.3, 0.02);
    blastGroup.add(blastSign);

    // Warning Red Strobe Siren on top of barricade
    const sirenMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
    const siren = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.08, 16), sirenMat);
    siren.position.set(1.1, 1.15, 0);
    blastGroup.add(siren);

    const sirenLight = new THREE.PointLight(0xef4444, 2.5, 5);
    sirenLight.position.set(1.1, 1.25, 0);
    blastGroup.add(sirenLight);

    // Safe Waiting Refuge Shelter Arrow pointing backwards
    const safeRefugeSign = new THREE.Mesh(
      new THREE.BoxGeometry(0.6, 0.22, 0.02),
      new THREE.MeshStandardMaterial({ color: 0x10b981 }) // Green safe sign
    );
    safeRefugeSign.position.set(-1.3, 1.5, 0.2);
    blastGroup.add(safeRefugeSign);

    sceneGroup.add(blastGroup);

    // Strobe animation
    sceneGroup.userData.animate = (delta, time) => {
      sirenLight.intensity = (Math.sin(time * 10) > 0) ? 3.0 : 0.2;
    };

    return sceneGroup;
  }
}
