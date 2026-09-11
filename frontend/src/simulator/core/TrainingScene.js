/**
 * TrainingScene
 * Reusable Three.js Scene Engine supporting:
 *  - Mode 1: Real AR (WebXR camera pose, alpha canvas, hit test reticle)
 *  - Mode 2 & 3: 3D Simulation / Desktop Preview (Virtual colliery ambient, OrbitControls, touch navigation)
 *  - Unified animation loop via renderer.setAnimationLoop
 *  - Thorough memory and WebGL context cleanup
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export class TrainingScene {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.options = options;
    this.mode = options.mode || '3D_SIMULATION'; // 'REAL_AR' | '3D_SIMULATION' | 'DESKTOP_PREVIEW'

    // Scene Graph
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      65,
      canvas.clientWidth / Math.max(canvas.clientHeight, 1),
      0.05,
      100
    );

    // Renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
    this.renderer.xr.enabled = true;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Root groups
    this.scenarioGroup = new THREE.Group();
    this.scenarioGroup.name = 'ScenarioRoot';
    this.scene.add(this.scenarioGroup);

    // Reticle for AR surface detection
    this.reticle = this._createReticle();
    this.scene.add(this.reticle);

    // Controls for 3D simulation
    this.controls = null;
    this._setupControls();

    // Lighting
    this._setupLighting();

    // Environment background
    this.updateMode(this.mode);

    // Resize listener
    this._onResize = this._onResize.bind(this);
    window.addEventListener('resize', this._onResize);

    // Animation callbacks
    this.animationCallbacks = [];
    this.clock = new THREE.Clock();

    // Start render loop
    this.renderer.setAnimationLoop(this._onFrame.bind(this));
  }

  _createReticle() {
    const group = new THREE.Group();
    group.matrixAutoUpdate = false;
    group.visible = false;
    group.name = 'PlacementReticle';

    // Outer ring
    const ringGeo = new THREE.RingGeometry(0.18, 0.22, 32).rotateX(-Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x2ee59d,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    group.add(ring);

    // Inner target dot
    const dotGeo = new THREE.CircleGeometry(0.04, 16).rotateX(-Math.PI / 2);
    const dotMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.95
    });
    const dot = new THREE.Mesh(dotGeo, dotMat);
    group.add(dot);

    // Crosshairs
    const lineMat = new THREE.LineBasicMaterial({ color: 0x2ee59d, linewidth: 2 });
    const pointsX = [new THREE.Vector3(-0.28, 0.001, 0), new THREE.Vector3(0.28, 0.001, 0)];
    const geoX = new THREE.BufferGeometry().setFromPoints(pointsX);
    group.add(new THREE.Line(geoX, lineMat));

    const pointsZ = [new THREE.Vector3(0, 0.001, -0.28), new THREE.Vector3(0, 0.001, 0.28)];
    const geoZ = new THREE.BufferGeometry().setFromPoints(pointsZ);
    group.add(new THREE.Line(geoZ, lineMat));

    return group;
  }

  _setupControls() {
    if (this.mode === 'REAL_AR') {
      if (this.controls) {
        this.controls.dispose();
        this.controls = null;
      }
      return;
    }

    if (!this.controls) {
      this.controls = new OrbitControls(this.camera, this.canvas);
      this.controls.enableDamping = true;
      this.controls.dampingFactor = 0.08;
      this.controls.maxDistance = 15;
      this.controls.minDistance = 0.5;
      this.controls.maxPolarAngle = Math.PI / 2 + 0.1; // Don't flip under floor
      this.controls.target.set(0, 0.8, 0);

      // Camera default position for 3D look-around
      this.camera.position.set(0, 1.3, 2.5);
      this.controls.update();
    }
  }

  _setupLighting() {
    // Ambient light - slightly warm miner lamp ambiance
    this.ambientLight = new THREE.AmbientLight(0xdde5ed, 1.2);
    this.scene.add(this.ambientLight);

    // Key directional light representing overhead drift fixture / sun
    this.dirLight = new THREE.DirectionalLight(0xfff3d6, 1.8);
    this.dirLight.position.set(3, 6, 4);
    this.dirLight.castShadow = true;
    this.dirLight.shadow.mapSize.width = 1024;
    this.dirLight.shadow.mapSize.height = 1024;
    this.dirLight.shadow.camera.near = 0.5;
    this.dirLight.shadow.camera.far = 15;
    this.dirLight.shadow.bias = -0.0005;
    this.scene.add(this.dirLight);

    // Miner cap lamp fill light attached near camera in 3D mode
    this.headlampLight = new THREE.PointLight(0xfffaed, 0.9, 8, 1.5);
    this.headlampLight.position.set(0, 1.5, 0);
    this.scene.add(this.headlampLight);
  }

  updateMode(mode) {
    this.mode = mode;
    if (mode === 'REAL_AR') {
      // Clear background for camera feed passthrough
      this.scene.background = null;
      this.scene.fog = null;
      if (this.controls) {
        this.controls.dispose();
        this.controls = null;
      }
      this.ambientLight.intensity = 1.0;
      this.dirLight.intensity = 1.4;
    } else {
      // 3D Simulation / Desktop Preview - atmospheric underground coal mine haze
      this.scene.background = new THREE.Color(0x0a121c);
      this.scene.fog = new THREE.FogExp2(0x0a121c, 0.05);
      this.ambientLight.intensity = 1.3;
      this.dirLight.intensity = 1.9;
      this._setupControls();
    }
  }

  addFrameCallback(cb) {
    this.animationCallbacks.push(cb);
  }

  removeFrameCallback(cb) {
    this.animationCallbacks = this.animationCallbacks.filter((c) => c !== cb);
  }

  _onFrame(timestamp, frame) {
    const delta = this.clock.getDelta();

    // Update orbit controls in 3D mode
    if (this.controls && this.mode !== 'REAL_AR') {
      this.controls.update();
      // Keep pointlight tracking user viewing position like a cap lamp
      this.headlampLight.position.copy(this.camera.position);
    }

    // Call registered frame listeners (hazard animations, particles, hit-tests)
    for (let i = 0; i < this.animationCallbacks.length; i++) {
      try {
        this.animationCallbacks[i]({ timestamp, frame, delta });
      } catch (err) {
        console.warn('Error in frame callback:', err);
      }
    }

    // Render frame
    this.renderer.render(this.scene, this.camera);
  }

  _onResize() {
    if (!this.canvas) return;
    const width = this.canvas.clientWidth;
    const height = this.canvas.clientHeight;

    this.camera.aspect = width / Math.max(height, 1);
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height, false);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  }

  resetCamera() {
    if (this.controls) {
      this.camera.position.set(0, 1.3, 2.5);
      this.controls.target.set(0, 0.8, 0);
      this.controls.update();
    }
  }

  dispose() {
    window.removeEventListener('resize', this._onResize);
    this.renderer.setAnimationLoop(null);

    if (this.controls) {
      this.controls.dispose();
      this.controls = null;
    }

    // Traverse and dispose geometries, materials, textures
    this.scene.traverse((object) => {
      if (object.geometry) {
        object.geometry.dispose();
      }
      if (object.material) {
        if (Array.isArray(object.material)) {
          object.material.forEach((mat) => {
            if (mat.map) mat.map.dispose();
            mat.dispose();
          });
        } else {
          if (object.material.map) object.material.map.dispose();
          object.material.dispose();
        }
      }
    });

    this.renderer.dispose();
  }
}
