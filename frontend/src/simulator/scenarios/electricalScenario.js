/**
 * electricalScenario.js
 * Scenario Definition for Module 4: Electrical & Blasting Clearance (MOD-004)
 * Statutory Benchmark: 85%
 * Duration: 14 minutes
 * Two strict safety awareness sections:
 *  - Section A: Electrical Safety & Flameproof (FLP) Enclosure Awareness
 *  - Section B: Blasting Clearance & Restricted Perimeter Cordon
 * Note: Zero operational shot-firing or electrical internal repair instructions.
 */

export const electricalScenario = {
  moduleId: 'MOD-004',
  title: 'Electrical & Blasting Clearance',
  title_hi: 'विद्युत एवं ब्लास्टिंग क्लीयरेंस ड्रिल',
  title_sat: 'ᱵᱤᱡᱽᱞᱤ ᱟᱨ ᱵᱞᱟᱥᱴᱤᱝ ᱦᱩᱥᱤᱭᱟᱹᱨ',
  benchmark: 85,
  durationMinutes: 14,
  modelType: 'ELECTRICAL_BLASTING',
  learningObjectives: [
    'Inspect flameproof (FLP) electrical enclosures for missing bolts and external casing damage',
    'Recognize high-voltage trailing cable damage and maintain arc-flash statutory clearance',
    'Identify shot-firing danger perimeters and obey red-and-white warning cordons',
    'Retreat to designated blast refuge shelter until the all-clear siren sounds'
  ],
  hazards: [
    {
      id: 'HAZ-ELEC-FLP',
      name: 'Flameproof (FLP) Enclosure Inspection Awareness',
      name_hi: 'ज्वाला-सह (FLP) एनक्लोजर निरीक्षण जागरूकता',
      type: 'ELECTRICAL_AWARENESS',
      severity: 'CRITICAL',
      position: [-1.1, 0.55, -0.75],
      description: 'Underground high-voltage flameproof switchgear. Trainee notices a missing perimeter bolt and visible clearance gap along the machined flamepath flange.',
      correctResponse: 'Do not touch or open enclosure. Maintain safe distance, report missing bolt to colliery electrical engineer, and tag area.',
      wrongResponse: 'Attempt to pry open the door with a screwdriver or replace with an ordinary hardware bolt.',
      explanation: 'FLP enclosures are precision engineered to cool internal electric arcs before hot gases reach the surrounding methane mine atmosphere.',
      score: 25,
      moduleId: 'MOD-004',
      decision: {
        question: 'You notice a missing high-tensile bolt on an underground FLP electrical switchgear cover. What is the verified procedure?',
        options: [
          {
            id: 'A',
            text: 'Keep clear distance, do not touch enclosure, report immediately to certified mine electrical supervisor',
            text_hi: 'सुरक्षित दूरी बनाए रखें, उपकरण को न छुएं, प्रमाणित विद्युत अधिकारी को तुरंत सूचित करें',
            isCorrect: true,
            score: 25,
            explanation: 'Correct: Frontline personnel must never attempt unauthorized electrical repairs; missing bolts compromise statutory explosion-proofing.'
          },
          {
            id: 'B',
            text: 'Insert a piece of steel wire or common wood screw into the hole to seal the gap',
            text_hi: 'छेद में तार या कील डालकर काम चलाने का प्रयास करें',
            isCorrect: false,
            penalty: 15,
            consequenceTitle: 'NEAR-MISS SIMULATION: FLAMEPATH BREACH RISK',
            simulationType: 'NEAR_MISS',
            hazardExplanation: 'Non-specification fasteners blow out during internal switch switching arcs, escaping into ambient methane and causing coal dust explosions.',
            saferResponse: 'Maintain distance and notify authorized electrical personnel.'
          }
        ]
      }
    },
    {
      id: 'HAZ-ELEC-CABLE',
      name: 'Damaged High-Voltage Trailing Cable',
      name_hi: 'क्षतिग्रस्त हाई-वोल्टेज ट्रेलिंग केबल',
      type: 'ELECTRICAL_CLEARANCE',
      severity: 'CRITICAL',
      position: [-0.7, 0.08, -0.2],
      description: 'Heavy rubber-sheathed trailing cable damaged by colliery vehicle wheel impact, exposing inner insulation layers.',
      correctResponse: 'Treat cable as live. Maintain minimum 1.5-meter arc-flash clearance boundary, do not touch with bare hands or shovel, notify substation.',
      wrongResponse: 'Pick up cable with hands or shovel to move it out of the trackway.',
      explanation: 'Underground coal mine trailing cables carry up to 3.3 kV. Damaged insulation produces fatal shock and explosive arc flash burns.',
      score: 25,
      moduleId: 'MOD-004',
      decision: {
        question: 'A vehicle wheel has crushed an armored cable jacket on the haulage floor. How do you respond?',
        options: [
          {
            id: 'A',
            text: 'Treat cable as energized, maintain safe clearance outside the arc boundary, report to power switchboard',
            text_hi: 'केबल को चालू मानकर दूर रहें, सुरक्षा घेरे से बाहर रहें और सबस्टेशन को सूचित करें',
            isCorrect: true,
            score: 25,
            explanation: 'Correct: Physical contact with damaged high-voltage trailing cables is a leading cause of fatal electrical electrocution in mines.'
          },
          {
            id: 'B',
            text: 'Drag cable aside using a damp shovel to clear vehicle path',
            text_hi: 'गीले फावड़े से केबल को रास्ते से हटा दें',
            isCorrect: false,
            penalty: 15,
            consequenceTitle: 'NEAR-MISS SIMULATION: HIGH-VOLTAGE ARC FLASH',
            simulationType: 'NEAR_MISS',
            hazardExplanation: 'Metal tools puncture damaged rubber jackets, triggering phase-to-ground flashover and lethal electric shock.',
            saferResponse: 'Never touch damaged cables. Alert substation to isolate power.'
          }
        ]
      }
    },
    {
      id: 'HAZ-BLAST-CORDON',
      name: 'Shot-Firing Danger Perimeter Cordon',
      name_hi: 'ब्लास्टिंग खतरनाक क्षेत्र घेराबंदी',
      type: 'BLAST_CLEARANCE',
      severity: 'CRITICAL',
      position: [0, 1.1, 1.8],
      description: 'Red-and-white danger barricade with warning siren sounding 3 audible horn blasts indicating imminent face shot-firing.',
      correctResponse: 'Obey blast danger perimeter cordon; never cross barricades or enter the designated exclusion zone.',
      wrongResponse: 'Crawl under the red barrier to retrieve tools before the countdown ends.',
      explanation: 'Flyrock fragments and toxic post-blast noxious fumes travel hundreds of meters along mine galleries during detonation.',
      score: 25,
      moduleId: 'MOD-004',
      decision: {
        question: 'The warning siren sounds 3 horn blasts and the red-and-white blasting cordon is deployed. What must you do?',
        options: [
          {
            id: 'A',
            text: 'Halt immediately, remain outside the danger cordon, obey the statutory shot-firing sentry orders',
            text_hi: 'तुरंत रुकें, लाल बैरिकेड के बाहर रहें और ब्लास्टिंग संतरी के निर्देशों का पालन करें',
            isCorrect: true,
            score: 25,
            explanation: 'Correct: The statutory shot-firing cordon enforces an exclusion zone to protect miners from flyrock projectiles and concussion shockwaves.'
          },
          {
            id: 'B',
            text: 'Quickly run past the barrier to pick up your lunch box from the drill face',
            text_hi: 'बैरिकेड के नीचे से निकलकर सामान लेने चले जाएं',
            isCorrect: false,
            penalty: 15,
            consequenceTitle: 'NEAR-MISS SIMULATION: BLAST PERIMETER BREACH',
            simulationType: 'NEAR_MISS',
            hazardExplanation: 'Breaching sentry cordons puts personnel directly in the path of deadly flying rock shards and heavy concussion waves.',
            saferResponse: 'Never bypass or ignore a blasting sentry barricade.'
          }
        ]
      }
    },
    {
      id: 'HAZ-BLAST-SHELTER',
      name: 'Designated Safe Waiting Blast Shelter',
      name_hi: 'निर्धारित सुरक्षित ब्लास्ट आश्रय स्थल',
      type: 'SHELTER_PROTOCOL',
      severity: 'HIGH',
      position: [-1.3, 1.5, 2.0],
      description: 'Statutory reinforced blast shelter located at safe clearance distance outside line-of-sight of the blast face.',
      correctResponse: 'Enter blast shelter, turn face away from gallery opening, protect ears, and wait until the single prolonged "All-Clear" siren sounds.',
      wrongResponse: 'Stand near the gallery intersection to watch the dust plume.',
      explanation: 'Concussion waves reflected around corners can rupture eardrums; post-blast fumes (nitrous fumes and CO) linger in the airway.',
      score: 25,
      moduleId: 'MOD-004',
      decision: {
        question: 'When is it safe to leave the designated blast refuge shelter?',
        options: [
          {
            id: 'A',
            text: 'Only after the authorized shot-firer sounds the single prolonged continuous "All-Clear" siren signal',
            text_hi: 'केवल तभी जब अधिकृत ब्लास्टर द्वारा निरंतर "ऑल-क्लियर" सायरन बजाया जाए',
            isCorrect: true,
            score: 25,
            explanation: 'Correct: The shot-firer must first inspect the face for misfires and toxic fumes before declaring the sector safe for re-entry.'
          },
          {
            id: 'B',
            text: 'Immediately as soon as you hear the blast explosion rumble',
            text_hi: 'धमाके की आवाज सुनते ही तुरंत बाहर निकल आएं',
            isCorrect: false,
            penalty: 10,
            consequenceTitle: 'NEAR-MISS SIMULATION: PREMATURE RE-ENTRY HAZARD',
            simulationType: 'NEAR_MISS',
            hazardExplanation: 'Secondary delayed blasts, delayed misfires, and dense toxic nitrous fumes threaten workers who re-enter before all-clear inspection.',
            saferResponse: 'Wait inside the shelter until the official all-clear signal sounds.'
          }
        ]
      }
    }
  ]
};
