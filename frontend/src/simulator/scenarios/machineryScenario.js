/**
 * machineryScenario.js
 * Scenario Definition for Module 3: Machinery & Moving-Part Safety (MOD-003)
 * Statutory Benchmark: 80%
 * Duration: 10 minutes
 * Focus: Roller pinch point hazard, missing mesh guard, emergency trip-wire pull cord, LOTO principle.
 */

export const machineryScenario = {
  moduleId: 'MOD-003',
  title: 'Machinery & Moving-Part Safety',
  title_hi: 'मशीनरी एवं कन्वेयर सुरक्षा (LOTO)',
  title_sat: 'ᱠᱚᱞ ᱠᱟᱹᱨᱜᱟᱲ ᱟᱨ ᱢᱮᱥᱤᱱ ᱨᱩᱠᱷᱤᱭᱟᱹ',
  benchmark: 80,
  durationMinutes: 10,
  modelType: 'CONVEYOR_MACHINERY',
  learningObjectives: [
    'Identify in-running nip pinch points on rotating conveyor rollers',
    'Recognize missing and displaced protective wire mesh machinery guards',
    'Locate and operate the continuous emergency trip-wire pull cord',
    'Apply core Lock-Out/Tag-Out (LOTO) energy isolation principles according to site approved procedure'
  ],
  hazards: [
    {
      id: 'HAZ-MACH-PINCH',
      name: 'In-Running Nip Roller Pinch Point',
      name_hi: 'कन्वेयर रोलर इन-रनिंग पिंच पॉइंट',
      type: 'PINCH_POINT_CHECK',
      severity: 'CRITICAL',
      position: [0, 0.8, -0.8],
      description: 'The convergence zone between moving coal belt and rotating idler roller creates an in-running nip capable of drawing in hands, loose clothing, or tools.',
      correctResponse: 'Mark as UNSAFE. Never touch or reach near rollers while belt is energized; maintain safe statutory clearance distance.',
      wrongResponse: 'Mark as SAFE to clean coal dust accumulation off roller while belt is moving slowly.',
      explanation: 'In-running nips exert tons of drawing force; loose gloves or sleeves are sucked in instantaneously, causing severe traumatic amputation.',
      score: 25,
      moduleId: 'MOD-003',
      decision: {
        question: 'Is it SAFE or UNSAFE to manually scrape caked coal mud from this idler roller while the conveyor is energized?',
        options: [
          {
            id: 'A',
            text: 'UNSAFE — In-running nip draws hands and tools into roller drum; requires positive LOTO isolation first',
            text_hi: 'असुरक्षित (UNSAFE) — चलती बेल्ट का दबाव हाथ को खींच लेता है; पहले LOTO प्रक्रिया आवश्यक है',
            isCorrect: true,
            score: 25,
            explanation: 'Correct: Cleaning running conveyor rollers is a leading cause of fatal crushing injuries in mines. Equipment must be locked out first.'
          },
          {
            id: 'B',
            text: 'SAFE — It is permissible if using a short steel scraper with one gloved hand',
            text_hi: 'सुरक्षित (SAFE) — दस्ताने पहनकर छोटे खुरपे से सफाई की जा सकती है',
            isCorrect: false,
            penalty: 15,
            consequenceTitle: 'NEAR-MISS SIMULATION: ROLLER ENTANGLEMENT',
            simulationType: 'NEAR_MISS',
            hazardExplanation: 'The scraper gets caught between belt and roller, pulling the worker arm directly into the pinch point in less than a second.',
            saferResponse: 'Stop the machine, lock out power following approved LOTO procedure, and clean only when stationary.'
          }
        ]
      }
    },
    {
      id: 'HAZ-MACH-GUARD',
      name: 'Displaced Protective Wire Mesh Guard',
      name_hi: 'हटी हुई सुरक्षात्मक तार-जाली गार्ड',
      type: 'GUARD_INTEGRITY',
      severity: 'HIGH',
      position: [0.48, 0.85, -0.8],
      description: 'Wire mesh protective guard is displaced and unbolted, exposing rotating mechanical components to walking passage.',
      correctResponse: 'Report displaced guard immediately; do not energize or operate machinery with missing protective interlocks.',
      wrongResponse: 'Step over exposed moving components and continue work without replacing guard.',
      explanation: 'Machinery guards provide physical physical separation; unshielded drive mechanisms catch loose garments and body limbs.',
      score: 25,
      moduleId: 'MOD-003',
      decision: {
        question: 'You discover a section of safety mesh guard removed beside the active haulage walkway. What is required?',
        options: [
          {
            id: 'A',
            text: 'Halt work near the section, report missing guard to supervisor, ensure re-installation before operation',
            text_hi: 'क्षेत्र में काम रोकें, गार्ड हटने की सूचना दें और दोबारा लगाने के बाद ही संचालन करें',
            isCorrect: true,
            score: 25,
            explanation: 'Correct: Operating machinery without statutory guards violates DGMS Circulars and exposes miners to direct contact.'
          },
          {
            id: 'B',
            text: 'Place an ordinary rock or piece of timber against it and keep conveyor running',
            text_hi: 'गार्ड की जगह लकड़ी का टुकड़ा अड़ा दें और काम जारी रखें',
            isCorrect: false,
            penalty: 10,
            consequenceTitle: 'NEAR-MISS SIMULATION: EXPOSED DRIVE CONTACT',
            simulationType: 'NEAR_MISS',
            hazardExplanation: 'Makeshift barriers vibrate loose under conveyor load, leaving rotating parts wide open to slip-and-fall contact.',
            saferResponse: 'Fasten certified guards securely before running conveyor.'
          }
        ]
      }
    },
    {
      id: 'HAZ-MACH-PULLCORD',
      name: 'Emergency Trip-Wire Pull Cord System',
      name_hi: 'आपातकालीन ट्रिप-वायर पुल कॉर्ड प्रणाली',
      type: 'EMERGENCY_STOP',
      severity: 'HIGH',
      position: [-0.58, 0.97, 0],
      description: 'Continuous steel wire cord running along the full length of the conveyor. Pulling it at any point trips the emergency stop switch and latches power off.',
      correctResponse: 'Pull wire firmly in any emergency to trip drive motor immediately; do not run to distant electrical substations.',
      wrongResponse: 'Use pull cord as a clothesline to hang jackets or equipment pouches.',
      explanation: 'The pull cord provides instant emergency stopping capability from any location along the haulage length.',
      score: 25,
      moduleId: 'MOD-003',
      decision: {
        question: 'A co-worker coat catches on moving belt idler. How do you stop the conveyor instantly?',
        options: [
          {
            id: 'A',
            text: 'Pull the continuous emergency trip-wire cord immediately at your current location',
            text_hi: 'अपनी वर्तमान स्थिति से ही आपातकालीन ट्रिप-वायर पुल कॉर्ड को तुरंत खींचें',
            isCorrect: true,
            score: 25,
            explanation: 'Correct: The trip-wire mechanically trips the drive contactor within milliseconds from any point along the beltline.'
          },
          {
            id: 'B',
            text: 'Run 100 meters down the gallery to find the electrical switchroom',
            text_hi: 'स्विच ढूंढने के लिए 100 मीटर दूर कंट्रोल रूम की तरफ दौड़ें',
            isCorrect: false,
            penalty: 15,
            consequenceTitle: 'NEAR-MISS SIMULATION: DELAYED EMERGENCY SHUTDOWN',
            simulationType: 'NEAR_MISS',
            hazardExplanation: 'Running to distant switches takes precious seconds; continuous trip cords are designed for zero-delay intervention.',
            saferResponse: 'Pull the nearest trip cord immediately.'
          }
        ]
      }
    },
    {
      id: 'HAZ-MACH-LOTO',
      name: 'Lock-Out / Tag-Out (LOTO) Station Principle',
      name_hi: 'लॉक-आउट / टैग-आउट (LOTO) सिद्धांत स्टेशन',
      type: 'LOTO_PRINCIPLE',
      severity: 'CRITICAL',
      position: [1.2, 1.1, 0.4],
      description: 'Colliery electrical/mechanical energy isolation point. Teaches the core 5-step LOTO principle: STOP → ISOLATE → LOCK/TAG → VERIFY → WORK ONLY WHEN AUTHORIZED.',
      correctResponse: 'Follow your site approved LOTO procedure: de-energize, attach personal padlock/tag to hasp, and verify zero residual energy before maintenance.',
      wrongResponse: 'Ask a friend to hold the stop button while you quickly adjust a roller bracket.',
      explanation: 'Uncontrolled stored electrical, hydraulic, or gravitational energy can restart machinery unexpectedly.',
      score: 25,
      moduleId: 'MOD-003',
      decision: {
        question: 'What is the mandatory sequence for performing maintenance on coal conveyor components?',
        options: [
          {
            id: 'A',
            text: 'STOP → ISOLATE BY APPROVED PROCEDURE → LOCK/TAG → VERIFY ZERO ENERGY → WORK ONLY WHEN AUTHORIZED',
            text_hi: 'रोकें → अधिकृत प्रक्रिया से अलग करें → ताला/टैग लगाएं → शून्य ऊर्जा सत्यापित करें → तभी कार्य करें',
            isCorrect: true,
            score: 25,
            explanation: 'Correct: LOTO guarantees that no other person can accidentally re-energize equipment while personnel are working.'
          },
          {
            id: 'B',
            text: 'Have a coworker watch the switch while you crawl under belt without padlocks',
            text_hi: 'साथी को स्विच पर खड़ा कर बिना ताला लगाए बेल्ट के नीचे जाएं',
            isCorrect: false,
            penalty: 15,
            consequenceTitle: 'NEAR-MISS SIMULATION: ACCIDENTAL RE-ENERGIZATION',
            simulationType: 'NEAR_MISS',
            hazardExplanation: 'Human verbal agreements fail when shifts change or automated remote PLCs trigger scheduled conveyor starts.',
            saferResponse: 'Always apply your personal padlock and danger tag to the isolation point.'
          }
        ]
      }
    }
  ]
};
