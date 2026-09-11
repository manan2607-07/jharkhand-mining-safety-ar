/**
 * ARSessionManager
 * Manages WebXR 'immersive-ar' session lifecycle:
 *  - Requests session with hit-test and local-floor features
 *  - Configures DOM overlay (if container provided)
 *  - Sets up reference space (local-floor or local)
 *  - Handles session termination and clean resource disposal
 */

export class ARSessionManager {
  constructor(renderer, options = {}) {
    this.renderer = renderer;
    this.options = options;
    this.session = null;
    this.referenceSpace = null;
    this.onSessionEndedCallback = null;
  }

  /**
   * Request and start an immersive-ar WebXR session.
   * @param {HTMLElement} [domOverlayElement]
   * @returns {Promise<XRSession>}
   */
  async startSession(domOverlayElement = null) {
    if (!navigator.xr) {
      throw new Error('WebXR is not available on this platform.');
    }

    const sessionInit = {
      requiredFeatures: ['hit-test'],
      optionalFeatures: ['local-floor', 'local']
    };

    if (domOverlayElement && 'domOverlay' in sessionInit) {
      sessionInit.optionalFeatures.push('dom-overlay');
      sessionInit.domOverlay = { root: domOverlayElement };
    }

    try {
      this.session = await navigator.xr.requestSession('immersive-ar', sessionInit);
    } catch (e) {
      // Retry without domOverlay if device failed to create session with it
      console.warn('Retrying session without dom-overlay:', e);
      this.session = await navigator.xr.requestSession('immersive-ar', {
        requiredFeatures: ['hit-test'],
        optionalFeatures: ['local-floor', 'local']
      });
    }

    // Connect session to Three.js WebGLRenderer
    await this.renderer.xr.setSession(this.session);

    // Acquire reference space: try 'local-floor' first, fallback to 'local'
    try {
      this.referenceSpace = await this.session.requestReferenceSpace('local-floor');
    } catch {
      this.referenceSpace = await this.session.requestReferenceSpace('local');
    }

    // Set reference space on renderer
    this.renderer.xr.setReferenceSpace(this.referenceSpace);

    // Listen for session end
    this.session.addEventListener('end', () => {
      this._handleSessionEnded();
    });

    return this.session;
  }

  onSessionEnded(callback) {
    this.onSessionEndedCallback = callback;
  }

  _handleSessionEnded() {
    this.session = null;
    this.referenceSpace = null;
    if (this.onSessionEndedCallback) {
      this.onSessionEndedCallback();
    }
  }

  async endSession() {
    if (this.session) {
      try {
        await this.session.end();
      } catch (err) {
        console.warn('Error ending WebXR session:', err);
      }
      this._handleSessionEnded();
    }
  }

  isActive() {
    return !!this.session;
  }

  getSession() {
    return this.session;
  }

  getReferenceSpace() {
    return this.referenceSpace;
  }
}
