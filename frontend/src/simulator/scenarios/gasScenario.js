/**
 * gasScenario.js
 * Scenario Definition for Module 2: Gas Leak & Confined Space Protocol (MOD-002)
 * Statutory Benchmark: 75%
 * Duration: 15 minutes
 * Focus: Atmospheric monitoring (CH4, CO, O2), confined space entry prohibition, buddy communication.
 */

export const gasScenario = {
  moduleId: 'MOD-002',
  title: 'Gas Leak & Confined Space Protocol',
  title_hi: 'गैस रिसाव एवं सीमित स्थान सुरक्षा प्रोटोकॉल',
  title_sat: 'ᱜᱮᱥ ᱡᱚᱨᱚ ᱟᱨ ᱪᱤᱯᱟᱹᱴ ᱡᱟᱭᱜᱟ ᱨᱩᱠᱷᱤᱭᱟᱹ',
  benchmark: 75,
  durationMinutes: 15,
  modelType: 'GAS_CONFINED',
  learningObjectives: [
    'Interpret simulated multi-gas detector readings (Methane CH4, Carbon Monoxide CO, Oxygen O2)',
    'Obey statutory confined-space entry restrictions and warning barricades',
    'Select appropriate emergency self-rescuer respirator equipment',
    'Execute 2-person buddy system communication before initiating retreat'
  ],
  hazards: [
    {
      id: 'HAZ-GAS-DETECTOR',
      name: 'Multi-Gas Atmospheric Detector Breach',
      name_hi: 'मल्टी-गैस डिटेक्टर सीमा उल्लंघन',
      type: 'GAS_MONITOR_CHECK',
      severity: 'CRITICAL',
      position: [-0.7, 0.98, -0.6],
      description: 'Simulated multi-gas sensor sounding continuous alarm: CH4 reading 1.8% (DGMS statutory limit 1.25%), CO reading 65 ppm, O2 reading 18.2%.',
      correctResponse: 'Recognize hazardous explosive and toxic gas threshold breach; halt all electrical and mechanical activities immediately.',
      wrongResponse: 'Ignore detector beeping as calibration noise and proceed into heading.',
      explanation: 'Methane concentrations between 5% and 15% are violently explosive in presence of sparks; CO above 50 ppm causes rapid asphyxiation.',
      score: 25,
      moduleId: 'MOD-002',
      decision: {
        question: 'The multi-gas detector alarm triggers showing CH4 at 1.8% (above statutory 1.25% cutoff). What is required?',
        options: [
          {
            id: 'A',
            text: 'Immediately stop all work, isolate electric power to heading, withdraw personnel to main intake airway',
            text_hi: 'काम तुरंत रोकें, बिजली सप्लाई काटें और कर्मचारियों को सुरक्षित ताजी हवा क्षेत्र में ले जाएं',
            isCorrect: true,
            score: 25,
            explanation: 'Correct: CMR Regulation mandates immediate withdrawal of workers and power isolation whenever inflammable gas exceeds 1.25%.'
          },
          {
            id: 'B',
            text: 'Mute the audio buzzer on the detector and continue manual shoveling until the end of the shift',
            text_hi: 'डिटेक्टर की आवाज बंद करें और काम जारी रखें',
            isCorrect: false,
            penalty: 15,
            consequenceTitle: 'NEAR-MISS SIMULATION: FIREDAMP ACCUMULATION',
            simulationType: 'NEAR_MISS',
            hazardExplanation: 'Methane builds up swiftly in dead ends without positive ventilation; a friction spark can trigger catastrophic explosion.',
            saferResponse: 'Withdraw immediately and report to ventilation officer.'
          }
        ]
      }
    },
    {
      id: 'HAZ-GAS-PORTAL',
      name: 'Confined Space Barricade & Restricted Zone',
      name_hi: 'सीमित स्थान बैरिकेड एवं प्रतिबंधित क्षेत्र',
      type: 'ENTRY_RESTRICTION',
      severity: 'CRITICAL',
      position: [0, 1.3, -2.4],
      description: 'Wooden warning barricade across blind heading reading "RESTRICTED GOAF — POISONOUS GAS HAZARD — NO ENTRY".',
      correctResponse: 'Never enter a barricaded or unventilated blind gallery without statutory confined space entry permit and forced ventilation.',
      wrongResponse: 'Duck under the wooden barrier to search for dropped tools or personal belongings.',
      explanation: 'Unventilated headings contain stagnant oxygen-deficient atmospheres that cause loss of consciousness in 1-2 breaths.',
      score: 25,
      moduleId: 'MOD-002',
      decision: {
        question: 'Under what circumstances may a frontline miner pass beyond a danger barricade into a blind heading?',
        options: [
          {
            id: 'A',
            text: 'Only with authorized Confined Space Permit-to-Work, positive forced ventilation, and rescue standby',
            text_hi: 'केवल अधिकृत परमिट, वेंटिलेशन और सुरक्षा टीम की मौजूदगी में ही प्रवेश संभव है',
            isCorrect: true,
            score: 25,
            explanation: 'Correct: Confined spaces must be certified gas-free with continuous positive airflow and trained standby attendants.'
          },
          {
            id: 'B',
            text: 'Anytime if holding breath for under two minutes to retrieve equipment',
            text_hi: 'सांस रोककर दो मिनट में सामान निकाल लाने के लिए',
            isCorrect: false,
            penalty: 15,
            consequenceTitle: 'NEAR-MISS SIMULATION: RAPID ANOXIA COLLAPSE',
            simulationType: 'NEAR_MISS',
            hazardExplanation: 'In oxygen concentrations below 10%, the brain suffers sudden anoxic syncope with zero advance warning symptoms.',
            saferResponse: 'Never breach a hazard barricade.'
          }
        ]
      }
    },
    {
      id: 'HAZ-GAS-PPE',
      name: 'Respiratory Protection Selection',
      name_hi: 'आपातकालीन श्वसन सुरक्षा चयन',
      type: 'PPE_SELECTION',
      severity: 'HIGH',
      position: [-0.3, 0.6, -1.0],
      description: 'Atmosphere contains elevated Carbon Monoxide (toxic gas) and low Oxygen (18.2%). Selection of correct protective gear.',
      correctResponse: 'Don Self-Contained Self-Rescuer (SCSR) generating oxygen; simple dust masks offer zero protection against gases or low O2.',
      wrongResponse: 'Wear standard cotton dust mask to filter out toxic carbon monoxide fumes.',
      explanation: 'Mechanical dust filters only capture solid particulates; they do not filter toxic gas molecules or generate oxygen.',
      score: 25,
      moduleId: 'MOD-002',
      decision: {
        question: 'Which device provides survival breathing air inside a verified toxic gas / oxygen-deficient zone?',
        options: [
          {
            id: 'A',
            text: 'Chemical Self-Contained Self-Rescuer (SCSR) or supplied-air airline respirator',
            text_hi: 'ऑक्सीजन युक्त सेल्फ-कंटेन्ड सेल्फ-रेस्क्यूअर (SCSR)',
            isCorrect: true,
            score: 25,
            explanation: 'Correct: SCSR chemically generates breathable oxygen independent of the ambient contaminated atmosphere.'
          },
          {
            id: 'B',
            text: 'Cloth cotton dust mask or folded wet handkerchief over nose',
            text_hi: 'गीला रूमाल अथवा साधारण कॉटन मास्क',
            isCorrect: false,
            penalty: 10,
            consequenceTitle: 'NEAR-MISS SIMULATION: CARBON MONOXIDE POISONING',
            simulationType: 'NEAR_MISS',
            hazardExplanation: 'Carbon monoxide passes unimpeded through cloth fibers and bonds with hemoglobin 200 times faster than oxygen.',
            saferResponse: 'Deploy your certified belt-worn SCSR self-rescuer.'
          }
        ]
      }
    },
    {
      id: 'HAZ-GAS-BUDDY',
      name: '2-Person Buddy System Signaling',
      name_hi: '2-व्यक्ति बडी-सिस्टम संचार संकेत',
      type: 'COMMUNICATION_PROTOCOL',
      severity: 'HIGH',
      position: [1.45, 1.3, 0.2],
      description: 'Underground colliery acoustic communication and signal bell station. Standard 2-person buddy protocol verification.',
      correctResponse: 'Signal buddy partner immediately using verified lamp/acoustic code and verify partner acknowledges before retreating together.',
      wrongResponse: 'Sprint away in panic without checking on buddy partner position.',
      explanation: 'The buddy system ensures both miners exit together; leaving a partner behind risks unobserved collapse.',
      score: 25,
      moduleId: 'MOD-002',
      decision: {
        question: 'When gas hazard alarm triggers, what is the mandatory buddy-system protocol?',
        options: [
          {
            id: 'A',
            text: 'Establish visual/verbal contact with buddy, confirm their respirator is donned, and retreat as a linked pair',
            text_hi: 'साथी से संपर्क करें, पुष्टि करें कि उन्होंने रेस्क्यूअर पहना है, और साथ में बाहर निकलें',
            isCorrect: true,
            score: 25,
            explanation: 'Correct: Frontline mining regulations require workers to operate and evacuate in pairs to ensure mutual accountability.'
          },
          {
            id: 'B',
            text: 'Run individually toward shaft without verifying buddy partner status',
            text_hi: 'साथी को देखे बिना अकेले तेजी से भागें',
            isCorrect: false,
            penalty: 10,
            consequenceTitle: 'NEAR-MISS SIMULATION: ISOLATED WORKER RISK',
            simulationType: 'NEAR_MISS',
            hazardExplanation: 'If a partner trips or loses consciousness unnoticed, survival window drops drastically without immediate assistance.',
            saferResponse: 'Maintain continuous contact with your buddy partner.'
          }
        ]
      }
    }
  ]
};
