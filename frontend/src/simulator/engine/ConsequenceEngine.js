/**
 * ConsequenceEngine
 * Simulates non-graphic safety consequences when an unsafe decision is made:
 *  1. Pauses scenario simulation
 *  2. Highlights the unsafe element in red/amber
 *  3. Displays a "NEAR-MISS SIMULATION" alert
 *  4. Explains the exact hazard mechanics
 *  5. Provides the site-approved safer response
 *  6. Enables immediate retry
 */

export class ConsequenceEngine {
  constructor(options = {}) {
    this.activeConsequence = null;
    this.isPaused = false;
    this.onConsequenceTriggered = options.onConsequenceTriggered || null;
    this.onConsequenceDismissed = options.onConsequenceDismissed || null;
  }

  /**
   * Trigger a simulated near-miss consequence.
   * @param {{
   *   hazardId: string,
   *   title: string,
   *   simulationType: 'NEAR_MISS' | 'EQUIPMENT_STALL' | 'BREACH_WARNING' | 'IMPROPER_DONNING',
   *   hazardExplanation: string,
   *   saferResponse: string,
   *   onRetry: Function
   * }} params
   */
  triggerConsequence({
    hazardId,
    title = 'NEAR-MISS SIMULATION',
    simulationType = 'NEAR_MISS',
    hazardExplanation,
    saferResponse,
    onRetry
  }) {
    this.isPaused = true;
    this.activeConsequence = {
      hazardId,
      title,
      simulationType,
      hazardExplanation,
      saferResponse,
      timestamp: Date.now(),
      onRetry
    };

    if (this.onConsequenceTriggered) {
      this.onConsequenceTriggered(this.activeConsequence);
    }
  }

  /**
   * Resume scenario and allow retry
   */
  retry() {
    if (!this.activeConsequence) return;
    const retryFn = this.activeConsequence.onRetry;
    this.activeConsequence = null;
    this.isPaused = false;

    if (this.onConsequenceDismissed) {
      this.onConsequenceDismissed();
    }

    if (retryFn) {
      retryFn();
    }
  }

  dismiss() {
    this.activeConsequence = null;
    this.isPaused = false;
    if (this.onConsequenceDismissed) {
      this.onConsequenceDismissed();
    }
  }

  getActiveConsequence() {
    return this.activeConsequence;
  }

  isScenarioPaused() {
    return this.isPaused;
  }
}
