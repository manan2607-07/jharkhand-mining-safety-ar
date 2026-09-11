/**
 * InteractionSystem
 * Bridges WebXR select events, touch interactions on mobile phones, and mouse clicks on desktop.
 * Uses Three.js Raycaster to detect tapped hazards and objects with touch-slop filtering.
 */

import * as THREE from 'three';

export class InteractionSystem {
  constructor(trainingScene, hazardSystem, options = {}) {
    this.trainingScene = trainingScene;
    this.hazardSystem = hazardSystem;
    this.canvas = trainingScene.canvas;
    this.camera = trainingScene.camera;
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.touchStartPos = new THREE.Vector2();
    this.touchStartTime = 0;
    this.isDragging = false;
    this.onSelectCallback = options.onSelect || null;

    this._onPointerDown = this._onPointerDown.bind(this);
    this._onPointerUp = this._onPointerUp.bind(this);
    this._onXRSelect = this._onXRSelect.bind(this);

    this.attach();
  }

  attach() {
    this.canvas.addEventListener('pointerdown', this._onPointerDown, { passive: true });
    this.canvas.addEventListener('pointerup', this._onPointerUp, { passive: true });

    // WebXR select event for AR mode
    const renderer = this.trainingScene.renderer;
    if (renderer && renderer.xr) {
      this.xrController = renderer.xr.getController(0);
      if (this.xrController) {
        this.xrController.addEventListener('select', this._onXRSelect);
      }
    }
  }

  detach() {
    this.canvas.removeEventListener('pointerdown', this._onPointerDown);
    this.canvas.removeEventListener('pointerup', this._onPointerUp);
    if (this.xrController) {
      this.xrController.removeEventListener('select', this._onXRSelect);
    }
  }

  _onPointerDown(e) {
    this.touchStartPos.set(e.clientX, e.clientY);
    this.touchStartTime = Date.now();
    this.isDragging = false;
  }

  _onPointerUp(e) {
    const dx = e.clientX - this.touchStartPos.x;
    const dy = e.clientY - this.touchStartPos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const duration = Date.now() - this.touchStartTime;

    // Filter out drags/swipes (slop threshold 12px, max 600ms tap duration)
    if (distance > 12 || duration > 600) {
      return;
    }

    const rect = this.canvas.getBoundingClientRect();
    this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    this._performRaycast();
  }

  _onXRSelect(e) {
    // In AR mode, raycast from camera center (center reticle / crosshair gaze)
    this.mouse.set(0, 0);
    this._performRaycast();
  }

  _performRaycast() {
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const targets = this.hazardSystem.getInteractiveTargets();

    if (!targets || targets.length === 0) return;

    const intersects = this.raycaster.intersectObjects(targets, true);

    if (intersects.length > 0) {
      const hit = intersects[0];
      let current = hit.object;
      let hazardId = null;

      while (current && !hazardId) {
        if (current.userData && current.userData.hazardId) {
          hazardId = current.userData.hazardId;
        }
        current = current.parent;
      }

      if (hazardId) {
        const hazard = this.hazardSystem.inspectHazard(hazardId);
        if (this.onSelectCallback) {
          this.onSelectCallback({
            hazardId,
            hazard,
            intersectPoint: hit.point
          });
        }
      }
    }
  }

  triggerRaycastFromScreen(x, y) {
    const rect = this.canvas.getBoundingClientRect();
    this.mouse.x = ((x - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((y - rect.top) / rect.height) * 2 + 1;
    this._performRaycast();
  }
}
