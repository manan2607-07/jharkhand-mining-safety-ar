/**
 * fireScenario.js
 * Scenario Definition for Module 1: Fire & Explosion Response (MOD-001)
 * Statutory Benchmark: 80%
 * Duration: 12 minutes
 * Focus: Alarm activation, fresh air intake evacuation, PASS extinguisher awareness.
 */

export const fireScenario = {
  moduleId: 'MOD-001',
  title: 'Fire & Explosion Response',
  title_hi: 'आग एवं विस्फोट आपातकालीन प्रतिक्रिया',
  title_sat: 'ᱥᱮᱸᱜᱮᱞ ᱟᱨ ᱵᱚᱢ ᱵᱤᱥᱯᱷᱚᱴ ᱵᱟᱧᱪᱟᱣ',
  benchmark: 80,
  durationMinutes: 12,
  modelType: 'FIRE_EMERGENCY',
  learningObjectives: [
    'Recognize underground conveyor friction fire ignition',
    'Raise acoustic manual alarm immediately to alert colliery personnel',
    'Select safe intake airway evacuation route avoiding toxic smoke spread',
    'Apply statutory PASS extinguisher technique (awareness level) for incipient stage'
  ],
  hazards: [
    {
      id: 'HAZ-FIRE-ALARM',
      name: 'Emergency Acoustic Alarm Station',
      name_hi: 'आपातकालीन सायरन / अलार्म स्टेशन',
      type: 'ALARM_ACTION',
      severity: 'CRITICAL',
      position: [-1.55, 1.4, -0.6],
      description: 'Wall-mounted manual pull-switch colliery alarm. Triggers audible siren throughout working section and notifies surface hoist room.',
      correctResponse: 'Pull emergency acoustic lever immediately before attempting any other response.',
      wrongResponse: 'Wait to see if the fire extinguishes on its own before sounding the alarm.',
      explanation: 'Underground mine fires spread rapidly via ventilation currents. Delayed alarms trap miners in toxic downstream fumes.',
      score: 25,
      moduleId: 'MOD-001',
      decision: {
        question: 'Smoke is observed near the conveyor head. What is your FIRST mandatory action?',
        options: [
          {
            id: 'A',
            text: 'Trigger the manual acoustic alarm station immediately and confirm clear retreat behind you',
            text_hi: 'तुरंत अलार्म स्टेशन चालू करें और पुष्टि करें कि आपके पीछे का निकास खुला है',
            isCorrect: true,
            score: 25,
            explanation: 'Correct: Sounding the acoustic alarm alerts all miners in the split and initiates ventilation emergency protocols.'
          },
          {
            id: 'B',
            text: 'Attempt to smother the flames with work jackets without notifying the section supervisor',
            text_hi: 'बिना किसी को बताए कपड़ों से आग बुझाने की कोशिश करें',
            isCorrect: false,
            penalty: 15,
            consequenceTitle: 'NEAR-MISS SIMULATION: RAPID FIRE PROPAGATION',
            simulationType: 'NEAR_MISS',
            hazardExplanation: 'Fighting conveyor fires alone without raising the alarm leads to disorientation, asphyxiation, and trapped co-workers.',
            saferResponse: 'Always sound the acoustic alarm first to summon trained rescue brigades.'
          }
        ]
      }
    },
    {
      id: 'HAZ-FIRE-ROUTE',
      name: 'Evacuation Route Direction',
      name_hi: 'सुरक्षित निकास मार्ग चयन',
      type: 'EVACUATION_DECISION',
      severity: 'CRITICAL',
      position: [0, 2.1, 3.2],
      description: 'Illuminated Green Exit signage pointing along intake airway vs dark return airway containing smoke roll.',
      correctResponse: 'Evacuate along intake airway against the fresh airflow direction toward shaft bottom.',
      wrongResponse: 'Run downwind along the return airway following the smoke path.',
      explanation: 'Underground mine ventilation carries deadly carbon monoxide (CO) downwind along return airways within minutes.',
      score: 25,
      moduleId: 'MOD-001',
      decision: {
        question: 'Which evacuation path must be followed according to colliery emergency standing orders?',
        options: [
          {
            id: 'A',
            text: 'Follow illuminated green exit markers along the fresh air intake gallery to colliery surface shaft',
            text_hi: 'ताजा हवा वाली इंटेक गैलरी और हरे निकास संकेतों का अनुसरण करते हुए बाहर निकलें',
            isCorrect: true,
            score: 25,
            explanation: 'Correct: The intake airway supplies uncontaminated breathable air, ensuring clear visibility and oxygen during evacuation.'
          },
          {
            id: 'B',
            text: 'Take shortcut through old unventilated return workings to avoid conveyor smoke',
            text_hi: 'धुएं से बचने के लिए पुराने बंद रास्ते से होकर भागें',
            isCorrect: false,
            penalty: 15,
            consequenceTitle: 'NEAR-MISS SIMULATION: OXYGEN DEFICIENCY HAZARD',
            simulationType: 'NEAR_MISS',
            hazardExplanation: 'Old unventilated goaf workings contain suffocating blackdamp (nitrogen/CO2) and stagnant explosive methane pockets.',
            saferResponse: 'Always adhere strictly to designated illuminated intake evacuation airways.'
          }
        ]
      }
    },
    {
      id: 'HAZ-FIRE-EXTINGUISHER',
      name: 'Extinguisher PASS Technique (Awareness)',
      name_hi: 'अग्निशामक PASS तकनीक (जागरूकता)',
      type: 'EXTINGUISHER_PASS',
      severity: 'HIGH',
      position: [-1.0, 0.5, 0.4],
      description: 'Dry Chemical Powder (DCP) stored-pressure extinguisher suitable for Class A, B, and C electrical/coal fires.',
      correctResponse: 'P: Pull pin → A: Aim low at base of flame → S: Squeeze operating lever → S: Sweep side-to-side across fire front.',
      wrongResponse: 'Aim nozzle high into rising smoke plume and discharge erratically.',
      explanation: 'Chemical powder must coat the fuel fuel bed at the base to extinguish embers and cut off oxygen.',
      score: 25,
      moduleId: 'MOD-001',
      decision: {
        question: 'If authorized to engage an incipient flame, what is the verified PASS operating sequence?',
        options: [
          {
            id: 'A',
            text: 'PULL pin → AIM at base of fire → SQUEEZE operating lever → SWEEP side-to-side',
            text_hi: 'पिन खींचें (P) → आधार पर निशाना साधें (A) → लीवर दबाएं (S) → अगल-बगल घुमाएं (S)',
            isCorrect: true,
            score: 25,
            explanation: 'Correct: PASS (Pull, Aim base, Squeeze, Sweep) maximizes agent delivery directly to the combustible fuel bed.'
          },
          {
            id: 'B',
            text: 'SQUEEZE lever first → AIM at top smoke → WAVE in circles above fire',
            text_hi: 'पहले लीवर दबाएं → ऊपर धुएं पर निशाना लगाएं → गोल घुमाएं',
            isCorrect: false,
            penalty: 10,
            consequenceTitle: 'NEAR-MISS SIMULATION: INEFFECTIVE EXTINGUISHING',
            simulationType: 'NEAR_MISS',
            hazardExplanation: 'Aiming at smoke dissipates powder harmlessly into the air while flames continue feeding on the fuel source below.',
            saferResponse: 'Aim strictly at the base of the fire and sweep horizontally.'
          }
        ]
      }
    },
    {
      id: 'HAZ-FIRE-SMOKE',
      name: 'Smoke Layer & Thermal Ceiling Hazard',
      name_hi: 'धुआं स्तर एवं थर्मल सीलिंग जोखिम',
      type: 'BEHAVIOR_CHECK',
      severity: 'HIGH',
      position: [0.6, 1.4, -2.5],
      description: 'Rising superheated smoke layer creating zero visibility and thermal radiant heat along the drift roof.',
      correctResponse: 'Crouch low to maintain posture beneath the thermal neutral plane where cooler breathable air resides.',
      wrongResponse: 'Stand fully upright and run through dense smoke clouds.',
      explanation: 'Toxic carbon monoxide and heated gases rise to the roof; oxygen concentration remains highest near the floor.',
      score: 25,
      moduleId: 'MOD-001',
      decision: {
        question: 'When navigating a smoke-filled drift, what physical posture minimizes inhalation risk?',
        options: [
          {
            id: 'A',
            text: 'Crouch low beneath the thermal smoke layer and follow track rails or lifelines',
            text_hi: 'धुएं के स्तर से नीचे झुककर चलें और रेल पटरी अथवा लाइफलाइन का सहारा लें',
            isCorrect: true,
            score: 25,
            explanation: 'Correct: Air near the mine floor is cooler and contains less carbon monoxide, protecting airway passages.'
          },
          {
            id: 'B',
            text: 'Stand upright and breathe deeply through mouth while running',
            text_hi: 'सीधे खड़े होकर मुंह से गहरी सांस लेते हुए दौड़ें',
            isCorrect: false,
            penalty: 10,
            consequenceTitle: 'NEAR-MISS SIMULATION: HOT GAS INHALATION',
            simulationType: 'NEAR_MISS',
            hazardExplanation: 'Inhaling superheated smoke causes severe thermal airway edema and rapid carbon monoxide incapacitation.',
            saferResponse: 'Keep your head low and use lifelines to navigate to safety.'
          }
        ]
      }
    }
  ]
};
