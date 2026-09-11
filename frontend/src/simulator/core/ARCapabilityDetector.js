/**
 * ARCapabilityDetector
 * Evaluates hardware and browser capabilities to route the user into:
 *  - MODE 1: REAL_AR (Supported Android / WebXR device with camera passthrough & hit-test)
 *  - MODE 2: 3D_SIMULATION (Mobile browser without WebXR support, full-screen interactive 3D WebGL)
 *  - MODE 3: DESKTOP_PREVIEW (Desktop browser e.g. Safari / Chrome on macOS / Windows with OrbitControls)
 */

export class ARCapabilityDetector {
  /**
   * Performs an asynchronous capability check.
   * @returns {Promise<{
   *   mode: 'REAL_AR' | '3D_SIMULATION' | 'DESKTOP_PREVIEW',
   *   canStartAR: boolean,
   *   isMobile: boolean,
   *   isSecureContext: boolean,
   *   reason: string
   * }>}
   */
  static async detect() {
    if (typeof window === 'undefined') {
      return {
        mode: 'DESKTOP_PREVIEW',
        canStartAR: false,
        isMobile: false,
        isSecureContext: false,
        reason: 'Server-side rendering environment'
      };
    }

    const isSecure = window.isSecureContext || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const ua = navigator.userAgent || '';
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua) || 
      (navigator.maxTouchPoints && navigator.maxTouchPoints > 1 && /Macintosh/i.test(ua));

    // Check if WebXR is present
    if (!isSecure) {
      return {
        mode: isMobile ? '3D_SIMULATION' : 'DESKTOP_PREVIEW',
        canStartAR: false,
        isMobile,
        isSecureContext: false,
        reason: 'WebXR requires a secure context (HTTPS or localhost).'
      };
    }

    if (!('xr' in navigator) || !navigator.xr) {
      return {
        mode: isMobile ? '3D_SIMULATION' : 'DESKTOP_PREVIEW',
        canStartAR: false,
        isMobile,
        isSecureContext: isSecure,
        reason: isMobile 
          ? 'WebXR is not supported by this mobile browser. Launching 3D Simulation Mode.'
          : 'Desktop browser environment. Launching 3D Training Preview Mode.'
      };
    }

    try {
      // Check if immersive-ar is supported
      const isArSupported = await navigator.xr.isSessionSupported('immersive-ar');
      if (isArSupported) {
        return {
          mode: 'REAL_AR',
          canStartAR: true,
          isMobile,
          isSecureContext: isSecure,
          reason: 'WebXR immersive-ar is supported on this device.'
        };
      } else {
        return {
          mode: isMobile ? '3D_SIMULATION' : 'DESKTOP_PREVIEW',
          canStartAR: false,
          isMobile,
          isSecureContext: isSecure,
          reason: isMobile 
            ? 'immersive-ar session not supported on this browser. Launching 3D Simulation Mode.'
            : 'Desktop browser environment. Launching 3D Training Preview Mode.'
        };
      }
    } catch (err) {
      console.warn('AR capability check error:', err);
      return {
        mode: isMobile ? '3D_SIMULATION' : 'DESKTOP_PREVIEW',
        canStartAR: false,
        isMobile,
        isSecureContext: isSecure,
        reason: 'WebXR probe failed. Launching 3D Simulation Mode.'
      };
    }
  }
}
