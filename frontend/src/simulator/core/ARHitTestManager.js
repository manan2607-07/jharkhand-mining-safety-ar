/**
 * ARHitTestManager
 * Manages WebXR Hit-Testing to detect physical real-world horizontal and vertical surfaces.
 * Translates XR hit test matrices to Three.js reticle coordinate space.
 */

import * as THREE from 'three';

export class ARHitTestManager {
  constructor(sessionManager) {
    this.sessionManager = sessionManager;
    this.hitTestSource = null;
    this.hitTestSourceRequested = false;
    this.lastHitPose = null;
    this.hasSurface = false;
  }

  /**
   * Reset hit test state.
   */
  reset() {
    if (this.hitTestSource) {
      try {
        this.hitTestSource.cancel();
      } catch {}
      this.hitTestSource = null;
    }
    this.hitTestSourceRequested = false;
    this.lastHitPose = null;
    this.hasSurface = false;
  }

  /**
   * Process a WebXR render frame for hit-test results.
   * @param {XRFrame} frame
   * @param {THREE.Object3D} [reticle] Optional 3D reticle to position automatically
   * @returns {{ hasSurface: boolean, hitPose: XRPose | null }}
   */
  update(frame, reticle = null) {
    const session = this.sessionManager.getSession();
    const referenceSpace = this.sessionManager.getReferenceSpace();

    if (!session || !referenceSpace || !frame) {
      this.hasSurface = false;
      if (reticle) reticle.visible = false;
      return { hasSurface: false, hitPose: null };
    }

    // Request hit test source once viewer space is available
    if (!this.hitTestSourceRequested) {
      session.requestReferenceSpace('viewer').then((viewerSpace) => {
        session.requestHitTestSource({ space: viewerSpace }).then((source) => {
          this.hitTestSource = source;
        }).catch((err) => {
          console.warn('Unable to acquire XR hit test source:', err);
        });
      }).catch((err) => {
        console.warn('Unable to request viewer space for hit test:', err);
      });
      this.hitTestSourceRequested = true;
    }

    if (this.hitTestSource) {
      const hitTestResults = frame.getHitTestResults(this.hitTestSource);
      if (hitTestResults.length > 0) {
        const hit = hitTestResults[0];
        const pose = hit.getPose(referenceSpace);
        if (pose) {
          this.lastHitPose = pose;
          this.hasSurface = true;

          if (reticle) {
            reticle.visible = true;
            reticle.matrix.fromArray(pose.transform.matrix);
          }

          return { hasSurface: true, hitPose: pose };
        }
      }
    }

    this.hasSurface = false;
    if (reticle) {
      reticle.visible = false;
    }
    return { hasSurface: false, hitPose: null };
  }

  getLastHitPose() {
    return this.lastHitPose;
  }

  surfaceDetected() {
    return this.hasSurface;
  }
}
