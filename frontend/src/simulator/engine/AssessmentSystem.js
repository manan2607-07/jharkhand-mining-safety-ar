/**
 * AssessmentSystem
 * Coordinates between GUIDED mode (hints, highlighted beacons, explanations)
 * and ASSESSMENT mode (independent hazard identification, no hints, statutory competency evaluation).
 */

export const TrainingMode = {
  GUIDED: 'GUIDED',
  ASSESSMENT: 'ASSESSMENT'
};

export class AssessmentSystem {
  constructor(hazardSystem, scoringSystem, options = {}) {
    this.hazardSystem = hazardSystem;
    this.scoringSystem = scoringSystem;
    this.mode = options.initialMode || TrainingMode.GUIDED;
    this.onModeChangeCallback = options.onModeChange || null;
  }

  setMode(mode) {
    if (this.mode !== mode) {
      this.mode = mode;
      this.hazardSystem.setTrainingMode(mode);
      if (this.onModeChangeCallback) {
        this.onModeChangeCallback(mode);
      }
    }
  }

  getMode() {
    return this.mode;
  }

  isGuided() {
    return this.mode === TrainingMode.GUIDED;
  }

  isAssessment() {
    return this.mode === TrainingMode.ASSESSMENT;
  }

  /**
   * Request a hint (allowed in GUIDED mode)
   */
  requestHint(hintText) {
    if (this.isAssessment()) {
      return {
        allowed: false,
        message: 'Hints are disabled in statutory Assessment Mode.'
      };
    }

    this.scoringSystem.recordHintUsed();
    return {
      allowed: true,
      hint: hintText
    };
  }
}
