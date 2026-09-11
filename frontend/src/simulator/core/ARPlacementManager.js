/**
 * ARPlacementManager
 * Controls placement states and anchors the 3D training scenario root object:
 *  - NOT_STARTED: Session opening
 *  - SEARCHING_SURFACE: Scanning real floor/table
 *  - SURFACE_FOUND: Ready to place, reticle active
 *  - PLACED: Anchored in physical space
 */

import * as THREE from 'three';

export const PlacementState = {
  NOT_STARTED: 'NOT_STARTED',
  SEARCHING_SURFACE: 'SEARCHING_SURFACE',
  SURFACE_FOUND: 'SURFACE_FOUND',
  PLACED: 'PLACED'
};

export class ARPlacementManager {
  constructor(options = {}) {
    this.state = PlacementState.NOT_STARTED;
    this.targetGroup = null;
    this.reticle = null;
    this.onStateChangeCallback = options.onStateChange || null;
  }

  setTargetGroup(group) {
    this.targetGroup = group;
  }

  setReticle(reticle) {
    this.reticle = reticle;
  }

  setState(newState) {
    if (this.state !== newState) {
      this.state = newState;
      if (this.onStateChangeCallback) {
        this.onStateChangeCallback(newState);
      }
    }
  }

  getState() {
    return this.state;
  }

  isPlaced() {
    return this.state === PlacementState.PLACED;
  }

  /**
   * Called on every frame in AR mode
   * @param {boolean} surfaceDetected
   */
  updateSurfaceStatus(surfaceDetected) {
    if (this.state === PlacementState.PLACED) return;

    if (surfaceDetected) {
      this.setState(PlacementState.SURFACE_FOUND);
    } else {
      this.setState(PlacementState.SEARCHING_SURFACE);
    }
  }

  /**
   * Places the 3D scene at the reticle position in AR mode
   */
  placeAtReticle() {
    if (!this.targetGroup || !this.reticle) return false;
    if (!this.reticle.visible && this.state !== PlacementState.SURFACE_FOUND) return false;

    // Apply reticle position and orientation to target group
    this.targetGroup.position.setFromMatrixPosition(this.reticle.matrix);
    
    // Decompose rotation around Y axis so scenario faces user cleanly
    const rot = new THREE.Euler().setFromRotationMatrix(this.reticle.matrix, 'YXZ');
    this.targetGroup.rotation.y = rot.y;

    this.targetGroup.visible = true;
    if (this.reticle) {
      this.reticle.visible = false;
    }

    this.setState(PlacementState.PLACED);
    return true;
  }

  /**
   * Automatically places scenario for 3D Simulation or Desktop Preview
   */
  placeDefaultAtOrigin() {
    if (this.targetGroup) {
      this.targetGroup.position.set(0, 0, 0);
      this.targetGroup.rotation.set(0, 0, 0);
      this.targetGroup.visible = true;
    }
    if (this.reticle) {
      this.reticle.visible = false;
    }
    this.setState(PlacementState.PLACED);
    return true;
  }

  /**
   * Reset placement to re-scan floor
   */
  reset() {
    if (this.targetGroup) {
      this.targetGroup.visible = false;
    }
    if (this.reticle) {
      this.reticle.visible = false;
    }
    this.setState(PlacementState.SEARCHING_SURFACE);
  }
}
