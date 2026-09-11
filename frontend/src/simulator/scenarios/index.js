/**
 * Scenario Registry
 * Central registry mapping all 5 statutory training modules:
 *  - MOD-001: Fire & Explosion Response
 *  - MOD-002: Gas Leak & Confined Space Protocol
 *  - MOD-003: Machinery & Moving-Part Safety
 *  - MOD-004: Electrical & Blasting Clearance
 *  - MOD-005: PPE Compliance & Induction
 */

import { ppeScenario } from './ppeScenario.js';
import { fireScenario } from './fireScenario.js';
import { gasScenario } from './gasScenario.js';
import { machineryScenario } from './machineryScenario.js';
import { electricalScenario } from './electricalScenario.js';

import { PPEStationModel } from '../models/PPEStationModel.js';
import { FireEmergencyModel } from '../models/FireEmergencyModel.js';
import { GasConfinedModel } from '../models/GasConfinedModel.js';
import { ConveyorMachineryModel } from '../models/ConveyorMachineryModel.js';
import { ElectricalBlastingModel } from '../models/ElectricalBlastingModel.js';

export const SCENARIO_REGISTRY = {
  'MOD-001': {
    scenario: fireScenario,
    createModel: () => FireEmergencyModel.create()
  },
  'MOD-002': {
    scenario: gasScenario,
    createModel: () => GasConfinedModel.create()
  },
  'MOD-003': {
    scenario: machineryScenario,
    createModel: () => ConveyorMachineryModel.create()
  },
  'MOD-004': {
    scenario: electricalScenario,
    createModel: () => ElectricalBlastingModel.create()
  },
  'MOD-005': {
    scenario: ppeScenario,
    createModel: () => PPEStationModel.create()
  }
};

export function getScenarioData(moduleId) {
  return SCENARIO_REGISTRY[moduleId] || SCENARIO_REGISTRY['MOD-005'];
}
