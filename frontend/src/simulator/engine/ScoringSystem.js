/**
 * ScoringSystem
 * Computes safety score based on:
 *  - Hazard identification (discovery)
 *  - Decision accuracy (correct safe choices)
 *  - Mistake deductions (consequences triggered)
 *  - Hint usage adjustments
 * Validates against statutory benchmarks:
 *  - MOD-001 (Fire): 80%
 *  - MOD-002 (Gas): 75%
 *  - MOD-003 (Machinery): 80%
 *  - MOD-004 (Electrical/Blasting): 85%
 *  - MOD-005 (PPE): 90%
 */

export const MODULE_BENCHMARKS = {
  'MOD-001': 80,
  'MOD-002': 75,
  'MOD-003': 80,
  'MOD-004': 85,
  'MOD-005': 90
};

export class ScoringSystem {
  constructor(moduleId, options = {}) {
    this.moduleId = moduleId;
    this.benchmark = MODULE_BENCHMARKS[moduleId] || 80;
    this.totalHazards = options.totalHazards || 5;
    this.totalDecisions = options.totalDecisions || 5;

    // Metrics tracking
    this.hazardsIdentified = new Set();
    this.correctDecisions = new Set();
    this.mistakesCount = 0;
    this.mistakeDetails = [];
    this.hintsUsed = 0;
    this.attemptsCount = 1;
    this.startTime = Date.now();
    this.strengths = [];
    this.improvements = [];
  }

  recordHazardIdentified(hazardId, hazardName = '') {
    if (!this.hazardsIdentified.has(hazardId)) {
      this.hazardsIdentified.add(hazardId);
      if (hazardName) {
        this.strengths.push(`Identified ${hazardName}`);
      }
    }
  }

  recordCorrectDecision(hazardId, points = 10, detail = '') {
    if (!this.correctDecisions.has(hazardId)) {
      this.correctDecisions.add(hazardId);
      if (detail) {
        this.strengths.push(detail);
      }
    }
  }

  recordMistake(hazardId, penalty = 5, reason = '') {
    this.mistakesCount += 1;
    this.mistakeDetails.push({ hazardId, reason });
    if (reason && !this.improvements.includes(reason)) {
      this.improvements.push(reason);
    }
  }

  recordHintUsed() {
    this.hintsUsed += 1;
  }

  incrementAttempt() {
    this.attemptsCount += 1;
  }

  /**
   * Calculates final score percentage and pass/fail status
   * @returns {{
   *   score: number,
   *   benchmark: number,
   *   isPassed: boolean,
   *   status: 'PASSED' | 'RETAKE_REQUIRED',
   *   hazardsFound: number,
   *   totalHazards: number,
   *   correctDecisions: number,
   *   totalDecisions: number,
   *   mistakes: number,
   *   hintsUsed: number,
   *   elapsedSeconds: number,
   *   strengths: string[],
   *   improvements: string[]
   * }}
   */
  calculateFinalResults() {
    const elapsedSeconds = Math.max(1, Math.round((Date.now() - this.startTime) / 1000));

    // Calculate component weights:
    // 50% Hazard Identification + 50% Decision Quality
    const hazardRatio = this.totalHazards > 0 
      ? (this.hazardsIdentified.size / this.totalHazards) 
      : 1;
    const decisionRatio = this.totalDecisions > 0 
      ? (this.correctDecisions.size / this.totalDecisions) 
      : 1;

    let baseScore = (hazardRatio * 50) + (decisionRatio * 50);

    // Deduct penalties for mistakes and hints
    const mistakePenalty = Math.min(25, this.mistakesCount * 5);
    const hintPenalty = Math.min(10, this.hintsUsed * 2);

    let finalScore = Math.round(baseScore - mistakePenalty - hintPenalty);
    finalScore = Math.max(0, Math.min(100, finalScore));

    const isPassed = finalScore >= this.benchmark;

    // Deduplicate strengths and improvements
    const cleanStrengths = Array.from(new Set(this.strengths)).slice(0, 4);
    const cleanImprovements = Array.from(new Set(this.improvements)).slice(0, 4);

    if (cleanStrengths.length === 0 && isPassed) {
      cleanStrengths.push('Followed verified colliery safety protocol');
      cleanStrengths.push('Maintained statutory safe distance from hazard zones');
    }

    if (cleanImprovements.length === 0 && !isPassed) {
      cleanImprovements.push('Review mandatory DGMS equipment check sequence');
      cleanImprovements.push('Ensure comprehensive inspection before entering workspace');
    }

    return {
      score: finalScore,
      benchmark: this.benchmark,
      isPassed,
      status: isPassed ? 'PASSED' : 'RETAKE_REQUIRED',
      hazardsFound: this.hazardsIdentified.size,
      totalHazards: this.totalHazards,
      correctDecisions: this.correctDecisions.size,
      totalDecisions: this.totalDecisions,
      mistakes: this.mistakesCount,
      hintsUsed: this.hintsUsed,
      attempts: this.attemptsCount,
      elapsedSeconds,
      strengths: cleanStrengths,
      improvements: cleanImprovements
    };
  }
}
