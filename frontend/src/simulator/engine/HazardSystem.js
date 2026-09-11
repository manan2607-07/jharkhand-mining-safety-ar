/**
 * HazardSystem
 * Manages 3D hazard entities, inspection touch volumes, glowing indicators,
 * and tracks hazard lifecycle: UNDISCOVERED -> INSPECTED -> RESOLVED | TRIGGERED
 */

import * as THREE from 'three';

export const HazardStatus = {
  UNDISCOVERED: 'UNDISCOVERED',
  INSPECTED: 'INSPECTED',
  RESOLVED: 'RESOLVED',
  TRIGGERED: 'TRIGGERED'
};

export class HazardSystem {
  constructor(scenarioGroup, options = {}) {
    this.scenarioGroup = scenarioGroup;
    this.hazards = new Map(); // id -> hazard object
    this.hazardMeshes = new Map(); // id -> THREE.Object3D
    this.interactiveTargets = []; // array of meshes for raycasting
    this.mode = options.trainingMode || 'GUIDED'; // 'GUIDED' | 'ASSESSMENT'
    this.onHazardInspected = options.onHazardInspected || null;
  }

  /**
   * Register hazard definitions from scenario
   * @param {Array} hazardDefinitions
   */
  loadHazards(hazardDefinitions = []) {
    this.clear();
    hazardDefinitions.forEach((def) => {
      const hazard = {
        ...def,
        status: HazardStatus.UNDISCOVERED,
        inspectedAt: null,
        attempts: 0
      };
      this.hazards.set(hazard.id, hazard);
      this._createHazardVisuals(hazard);
    });
  }

  setTrainingMode(mode) {
    this.mode = mode;
    // Update marker visibility: visible in GUIDED, hidden or subtle in ASSESSMENT
    this.hazards.forEach((hazard) => {
      const mesh = this.hazardMeshes.get(hazard.id);
      if (mesh && mesh.userData.beaconMesh) {
        mesh.userData.beaconMesh.visible = (mode === 'GUIDED') && hazard.status === HazardStatus.UNDISCOVERED;
      }
    });
  }

  _createHazardVisuals(hazard) {
    const group = new THREE.Group();
    const [x, y, z] = hazard.position || [0, 0, 0];
    group.position.set(x, y, z);
    group.name = `Hazard_${hazard.id}`;
    group.userData = { hazardId: hazard.id, isHazardTarget: true };

    // Invisible enlarged touch target (diameter ~0.35m) for comfortable finger tapping on mobile
    const hitGeo = new THREE.SphereGeometry(0.22, 16, 16);
    const hitMat = new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: 0.0,
      depthWrite: false
    });
    const hitMesh = new THREE.Mesh(hitGeo, hitMat);
    hitMesh.userData = { hazardId: hazard.id, isHitTarget: true };
    group.add(hitMesh);
    this.interactiveTargets.push(hitMesh);

    // Visual glowing beacon marker (active in GUIDED mode)
    const markerGroup = new THREE.Group();
    markerGroup.name = 'Beacon';

    // Outer pulsing ring
    const ringGeo = new THREE.RingGeometry(0.09, 0.12, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: hazard.severity === 'CRITICAL' ? 0xef4444 : hazard.severity === 'HIGH' ? 0xf59e0b : 0x3b82f6,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.8
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    markerGroup.add(ring);

    // Inner glowing sphere
    const coreGeo = new THREE.SphereGeometry(0.035, 12, 12);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.95
    });
    const core = new THREE.Mesh(coreGeo, coreMat);
    core.position.y = 0.03;
    markerGroup.add(core);

    markerGroup.visible = (this.mode === 'GUIDED');
    group.add(markerGroup);
    group.userData.beaconMesh = markerGroup;
    group.userData.ringMesh = ring;

    this.scenarioGroup.add(group);
    this.hazardMeshes.set(hazard.id, group);
  }

  updateAnimations(delta, elapsedTime) {
    // Pulse and animate hazard beacons
    this.hazards.forEach((hazard) => {
      const mesh = this.hazardMeshes.get(hazard.id);
      if (mesh && mesh.userData.beaconMesh && mesh.userData.beaconMesh.visible) {
        const ring = mesh.userData.ringMesh;
        if (ring) {
          const s = 1 + Math.sin(elapsedTime * 4) * 0.2;
          ring.scale.set(s, s, s);
          ring.material.opacity = 0.5 + Math.sin(elapsedTime * 4) * 0.35;
        }
      }
    });
  }

  /**
   * Inspect a hazard by ID
   */
  inspectHazard(hazardId) {
    const hazard = this.hazards.get(hazardId);
    if (!hazard) return null;

    if (hazard.status === HazardStatus.UNDISCOVERED) {
      hazard.status = HazardStatus.INSPECTED;
      hazard.inspectedAt = Date.now();
    }

    // Hide or dim the beacon
    const mesh = this.hazardMeshes.get(hazardId);
    if (mesh && mesh.userData.beaconMesh) {
      mesh.userData.beaconMesh.visible = false;
    }

    if (this.onHazardInspected) {
      this.onHazardInspected(hazard);
    }

    return hazard;
  }

  resolveHazard(hazardId) {
    const hazard = this.hazards.get(hazardId);
    if (!hazard) return;
    hazard.status = HazardStatus.RESOLVED;

    // Green resolved indicator
    const mesh = this.hazardMeshes.get(hazardId);
    if (mesh) {
      const checkGroup = new THREE.Group();
      const ringGeo = new THREE.RingGeometry(0.06, 0.09, 24);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x10b981,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.9
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = -Math.PI / 2;
      checkGroup.add(ring);
      mesh.add(checkGroup);
    }
  }

  triggerHazardMistake(hazardId) {
    const hazard = this.hazards.get(hazardId);
    if (!hazard) return;
    hazard.status = HazardStatus.TRIGGERED;
    hazard.attempts = (hazard.attempts || 0) + 1;

    // Red warning pulse
    const mesh = this.hazardMeshes.get(hazardId);
    if (mesh && mesh.userData.beaconMesh) {
      mesh.userData.beaconMesh.visible = true;
      if (mesh.userData.ringMesh) {
        mesh.userData.ringMesh.material.color.setHex(0xef4444);
      }
    }
  }

  getHazard(id) {
    return this.hazards.get(id);
  }

  getAllHazards() {
    return Array.from(this.hazards.values());
  }

  getDiscoveredCount() {
    return Array.from(this.hazards.values()).filter(
      (h) => h.status !== HazardStatus.UNDISCOVERED
    ).length;
  }

  getTotalCount() {
    return this.hazards.size;
  }

  getInteractiveTargets() {
    return this.interactiveTargets;
  }

  clear() {
    this.hazards.clear();
    this.interactiveTargets = [];
    this.hazardMeshes.forEach((mesh) => {
      this.scenarioGroup.remove(mesh);
    });
    this.hazardMeshes.clear();
  }
}
