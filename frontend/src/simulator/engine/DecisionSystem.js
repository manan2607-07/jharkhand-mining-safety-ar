/**
 * DecisionSystem
 * Manages decision evaluation for inspected hazards and interactive checkpoints.
 * Dispatches positive reinforcement on safe actions, or triggers ConsequenceEngine on dangerous actions.
 */

export class DecisionSystem {
  constructor(hazardSystem, consequenceEngine, scoringSystem, options = {}) {
    this.hazardSystem = hazardSystem;
    this.consequenceEngine = consequenceEngine;
    this.scoringSystem = scoringSystem;
    this.activeDecision = null;
    this.onDecisionEvaluated = options.onDecisionEvaluated || null;
  }

  /**
   * Set the active decision prompt for the inspected hazard
   */
  presentDecision(hazard, decisionDefinition) {
    this.activeDecision = {
      hazard,
      ...decisionDefinition
    };
  }

  /**
   * Evaluate user's selected choice for the active hazard
   * @param {string} optionId
   * @returns {{ isCorrect: boolean, feedback: string, consequence: object | null }}
   */
  evaluateChoice(optionId) {
    if (!this.activeDecision) return null;

    const { hazard, options, question } = this.activeDecision;
    const selectedOption = options.find((opt) => opt.id === optionId);
    if (!selectedOption) return null;

    const isCorrect = !!selectedOption.isCorrect;

    if (isCorrect) {
      // Safe action taken
      this.hazardSystem.resolveHazard(hazard.id);
      this.scoringSystem.recordCorrectDecision(hazard.id, selectedOption.score || 10);

      const result = {
        isCorrect: true,
        hazardId: hazard.id,
        feedback: selectedOption.explanation || hazard.explanation,
        consequence: null
      };

      if (this.onDecisionEvaluated) {
        this.onDecisionEvaluated(result);
      }

      this.activeDecision = null;
      return result;
    } else {
      // Unsafe action taken -> Trigger Consequence Engine
      this.hazardSystem.triggerHazardMistake(hazard.id);
      this.scoringSystem.recordMistake(hazard.id, selectedOption.penalty || 5);

      this.consequenceEngine.triggerConsequence({
        hazardId: hazard.id,
        title: selectedOption.consequenceTitle || 'NEAR-MISS SIMULATION',
        simulationType: selectedOption.simulationType || 'NEAR_MISS',
        hazardExplanation: selectedOption.hazardExplanation || hazard.explanation,
        saferResponse: selectedOption.saferResponse || hazard.correctResponse,
        onRetry: () => {
          // Keep active decision open for re-attempt
        }
      });

      const result = {
        isCorrect: false,
        hazardId: hazard.id,
        feedback: selectedOption.hazardExplanation,
        consequence: this.consequenceEngine.getActiveConsequence()
      };

      if (this.onDecisionEvaluated) {
        this.onDecisionEvaluated(result);
      }

      return result;
    }
  }

  clearActiveDecision() {
    this.activeDecision = null;
  }

  getActiveDecision() {
    return this.activeDecision;
  }
}
