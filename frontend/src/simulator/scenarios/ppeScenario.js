/**
 * ppeScenario.js
 * Scenario Definition for Module 5: PPE Compliance & Induction (MOD-005)
 * Statutory Benchmark: 90%
 * Est. Duration: 8 minutes
 * Focus: DGMS 11-point gear compliance, cap lamp integrity, dust respirator fit check.
 */

export const ppeScenario = {
  moduleId: 'MOD-005',
  title: 'PPE Compliance & Induction',
  title_hi: 'पीपीई अनुपालन एवं प्रथम दिवस खदान प्रवेश',
  title_sat: 'ᱯᱤᱯᱤᱤ (PPE) ᱦᱚᱨᱚᱜ ᱟᱨ ᱠᱷᱟᱫᱟᱱ ᱵᱚᱞᱚᱱ',
  benchmark: 90,
  durationMinutes: 8,
  modelType: 'PPE_STATION',
  learningObjectives: [
    'Inspect complete 11-point protective gear before entering the colliery shaft',
    'Verify cap lamp cable and lock-tight battery connection',
    'Perform negative-pressure fit check for particulate dust respirator',
    'Ensure high-visibility reflective striping meets underground illumination criteria'
  ],
  hazards: [
    {
      id: 'HAZ-PPE-HELMET',
      name: 'Safety Helmet & Chin Strap',
      name_hi: 'सुरक्षा हेलमेट एवं चिन स्ट्रैप',
      type: 'INSPECTION_CHECK',
      severity: 'CRITICAL',
      position: [0, 1.54, 0.05],
      description: 'DGMS Type-II Industrial Miner Safety Helmet. Trainee must inspect internal suspension harness and fasten the 3-point chin strap.',
      correctResponse: 'Inspect shell for micro-fractures, adjust inner cradle suspension to 25mm clearance, and firmly buckle chin strap.',
      wrongResponse: 'Wear helmet loosely without fastening chin strap to allow quick removal.',
      explanation: 'Unstrapped helmets instantly dislodge during sudden roof spalls or slips, leaving the head defenseless against rock falls.',
      score: 15,
      moduleId: 'MOD-005',
      decision: {
        question: 'How must the safety helmet be secured prior to descending into the colliery drift?',
        options: [
          {
            id: 'A',
            text: 'Adjust 6-point suspension harness to 25mm clearance and securely lock the chin strap',
            text_hi: 'सस्पेंशन हार्नेस को समायोजित करें और चिन स्ट्रैप को सुरक्षित रूप से लॉक करें',
            isCorrect: true,
            score: 15,
            explanation: 'Correct: The internal harness absorbs impact shock, while the fastened chin strap prevents the helmet from falling off during impacts.'
          },
          {
            id: 'B',
            text: 'Keep chin strap unbuckled for comfort and ventilation in warm underground sections',
            text_hi: 'गर्मी और आराम के लिए चिन स्ट्रैप को खुला रखें',
            isCorrect: false,
            penalty: 10,
            consequenceTitle: 'NEAR-MISS SIMULATION: HEAD INJURY HAZARD',
            simulationType: 'NEAR_MISS',
            hazardExplanation: 'Without a fastened chin strap, any sudden movement or loose rock contact knocks the helmet off, exposing the skull.',
            saferResponse: 'Always buckle and adjust the chin strap before crossing the mine lamp cabin.'
          }
        ]
      }
    },
    {
      id: 'HAZ-PPE-CAPLAMP',
      name: 'Cap Lamp & Battery Cable Integrity',
      name_hi: 'कैप लैंप एवं बैटरी केबल अखंडता',
      type: 'INSPECTION_CHECK',
      severity: 'HIGH',
      position: [0, 1.58, 0.18],
      description: 'Colliery LED Cap Lamp. Must be verified for certified flameproof casing lock and intact insulated power cable running to belt battery.',
      correctResponse: 'Inspect lamp lens seal, confirm high-beam and low-beam operation, and verify cable insulation has no cuts or exposed copper.',
      wrongResponse: 'Tape damaged cable with PVC tape and enter underground without reporting to lamp room.',
      explanation: 'Underground coal mines contain methane (CH4); an exposed wire spark from a damaged cap lamp can trigger a firedamp explosion.',
      score: 15,
      moduleId: 'MOD-005',
      decision: {
        question: 'During cap lamp inspection, you notice slight abrasive wear on the power cord. What is the verified procedure?',
        options: [
          {
            id: 'A',
            text: 'Immediately return lamp to authorized Lamp Cabin in exchange for a certified tagged unit',
            text_hi: 'लैंप को तुरंत अधिकृत लैंप केबिन में जमा कराएं और प्रमाणित यूनिट प्राप्त करें',
            isCorrect: true,
            score: 15,
            explanation: 'Correct: Colliery cap lamps are statutory intrinsically safe equipment; damaged cords must only be serviced by certified electricians.'
          },
          {
            id: 'B',
            text: 'Wrap electrical insulation tape around the worn section and proceed to shift muster',
            text_hi: 'कटे हुए हिस्से पर टेप चिपकाएं और काम पर आगे बढ़ें',
            isCorrect: false,
            penalty: 10,
            consequenceTitle: 'NEAR-MISS SIMULATION: FIREDAMP IGNITION RISK',
            simulationType: 'NEAR_MISS',
            hazardExplanation: 'Temporary tape fixes fail under humid underground mine conditions. Sparking in a methane atmosphere is catastrophic.',
            saferResponse: 'Never improvise electrical repairs on underground equipment. Return it to the Lamp Cabin.'
          }
        ]
      }
    },
    {
      id: 'HAZ-PPE-RESPIRATOR',
      name: 'Dust Respirator Fit & Cartridge Check',
      name_hi: 'धूल श्वासयंत्र (रेस्पिरेटर) फिटिंग जांच',
      type: 'INSPECTION_CHECK',
      severity: 'CRITICAL',
      position: [0, 1.42, 0.14],
      description: 'P100 / FFP3 Particulate Dust Respirator for coal dust and crystalline silica protection. Trainee must perform negative-pressure seal check.',
      correctResponse: 'Cover filter cartridges with clean palms, inhale gently, and verify mask collapses inward without air leakage along cheek edges.',
      wrongResponse: 'Hang respirator loosely around neck until visible dust appears at the coal face.',
      explanation: 'Microscopic respirable coal dust (<5 microns) is invisible to the human eye. Inhaling it causes irreversible Coal Workers Pneumoconiosis.',
      score: 20,
      moduleId: 'MOD-005',
      decision: {
        question: 'What is the mandatory seal-check protocol before entering dusty coal haulage drift?',
        options: [
          {
            id: 'A',
            text: 'Perform negative-pressure seal check: cup cartridges, inhale gently, verify airtight facial contour',
            text_hi: 'नेगेटिव प्रेशर सील जांच करें: फिल्टर को ढकें, सांस खींचें और चेहरे की सील की पुष्टि करें',
            isCorrect: true,
            score: 20,
            explanation: 'Correct: An airtight negative-pressure test ensures zero bypass leakage of hazardous respirable coal and silica dust.'
          },
          {
            id: 'B',
            text: 'Pull the mask over a thick beard or scarf without adjusting the bridge nose clip',
            text_hi: 'मास्क को बिना क्लिप दबाए चेहरे पर ढीला पहनें',
            isCorrect: false,
            penalty: 10,
            consequenceTitle: 'NEAR-MISS SIMULATION: RESPIRABLE DUST INHALATION',
            simulationType: 'NEAR_MISS',
            hazardExplanation: 'Facial hair and loose bridge clips break the seal, allowing up to 70% of toxic respirable dust to bypass the filters.',
            saferResponse: 'Keep facial contact clean-shaven and pinch the nose clip firmly against nasal bridge.'
          }
        ]
      }
    },
    {
      id: 'HAZ-PPE-GOGGLES',
      name: 'Impact & Dust Safety Goggles',
      name_hi: 'प्रभाव एवं धूल रोधी सुरक्षा चश्मा',
      type: 'INSPECTION_CHECK',
      severity: 'HIGH',
      position: [0, 1.5, 0.13],
      description: 'EN166 / IS-5983 approved polycarbonate wrap-around goggles with anti-fog ventilation ports.',
      correctResponse: 'Verify clear visibility, scratch-free lens, elastic strap tension, and side shield coverage against flying coal chips.',
      wrongResponse: 'Tuck goggles into pocket because underground humidity creates slight lens misting.',
      explanation: 'High-speed coal spalls from pick hammers and roof bolters cause permanent eye puncture injuries within milliseconds.',
      score: 10,
      moduleId: 'MOD-005',
      decision: {
        question: 'When is it permissible to remove safety goggles inside the active coal mining district?',
        options: [
          {
            id: 'A',
            text: 'Never remove goggles while inside active mining, drilling, conveyor, or rock bolting zones',
            text_hi: 'सक्रिय खनन, ड्रिलिंग अथवा कन्वेयर क्षेत्र में चश्मा कभी न हटाएं',
            isCorrect: true,
            score: 10,
            explanation: 'Correct: Eye protection is mandatory throughout the operational district to shield against projectile rock and coal particles.'
          },
          {
            id: 'B',
            text: 'Remove goggles whenever sweating or fogging occurs during manual shovel loading',
            text_hi: 'पसीना आने पर चश्मा उतारकर जेब में रख लें',
            isCorrect: false,
            penalty: 5,
            consequenceTitle: 'NEAR-MISS SIMULATION: EYE TRAUMA HAZARD',
            simulationType: 'NEAR_MISS',
            hazardExplanation: 'Taking off goggles in active zones exposes corneas to high-velocity stone fragments and acidic pit water droplets.',
            saferResponse: 'Use anti-fog wipes or approved indirect-ventilation goggles; do not expose eyes.'
          }
        ]
      }
    },
    {
      id: 'HAZ-PPE-EARMUFFS',
      name: 'High-Decibel Hearing Protection',
      name_hi: 'ध्वनि रोधी कर्ण रक्षक (ईयरमफ)',
      type: 'INSPECTION_CHECK',
      severity: 'MEDIUM',
      position: [0.14, 1.48, 0],
      description: 'Helmet-mounted earmuffs (NRR 26+ dB) protecting against continuous heavy machinery noise from ventilation fans and shearers.',
      correctResponse: 'Check ear cushions for softness, ensure complete seal around ears without pinching hair or spectacle frames.',
      wrongResponse: 'Stuff cotton waste into ears instead of using certified earmuffs.',
      explanation: 'Cotton provides zero acoustic attenuation against low-frequency colliery machinery rumblings.',
      score: 10,
      moduleId: 'MOD-005',
      decision: {
        question: 'What is the approved method to protect hearing near continuous mining machinery exceeding 85 dBA?',
        options: [
          {
            id: 'A',
            text: 'Deploy certified NRR-rated earmuffs or pre-formed earplugs with clean acoustic cushion seal',
            text_hi: 'प्रमाणित ईयरमफ अथवा ईयरप्लग का उपयोग करें और कुशन सील की पुष्टि करें',
            isCorrect: true,
            score: 10,
            explanation: 'Correct: Continuous colliery noise causes irreversible sensorineural hearing loss without acoustic dampening.'
          },
          {
            id: 'B',
            text: 'Rely on loose cotton waste or folded tissue paper inside ear canal',
            text_hi: 'कान में साधारण रुई का टुकड़ा डालकर काम करें',
            isCorrect: false,
            penalty: 5,
            consequenceTitle: 'NEAR-MISS SIMULATION: ACOUSTIC TRAUMA RISK',
            simulationType: 'NEAR_MISS',
            hazardExplanation: 'Cotton waste dampens barely 2-3 dB while introducing ear canal bacterial infections in hot mine airways.',
            saferResponse: 'Always wear certified hearing protection when operating near equipment.'
          }
        ]
      }
    },
    {
      id: 'HAZ-PPE-GLOVES',
      name: 'Heavy-Duty Abrasion Resistant Gloves',
      name_hi: 'भारी-भरकम घर्षण रोधी दस्ताने',
      type: 'INSPECTION_CHECK',
      severity: 'HIGH',
      position: [0.33, 0.72, 0],
      description: 'Cut-level 5 leather/nitrile reinforced safety gloves protecting against sharp coal shards, pinch edges, and hot steel cable frays.',
      correctResponse: 'Ensure snug fit, flexible knuckle padding, and inspect palm leather for tears or embedded metallic burrs.',
      wrongResponse: 'Cut off glove fingertips to make gripping small nuts and bolts easier.',
      explanation: 'Modifying PPE voids certification and exposes fingertips to severe pinch lacerations and crushing injuries.',
      score: 10,
      moduleId: 'MOD-005',
      decision: {
        question: 'You notice minor oil grease on your gloves before operating the conveyor isolation latch. What is correct?',
        options: [
          {
            id: 'A',
            text: 'Inspect grip texture; replace if oil degradation causes slippage on emergency controls',
            text_hi: 'दस्तानों की पकड़ जांचें; यदि तेल के कारण फिसलन हो तो तुरंत बदलें',
            isCorrect: true,
            score: 10,
            explanation: 'Correct: Slippery gloves prevent positive grip on emergency trip cables and heavy isolation levers.'
          },
          {
            id: 'B',
            text: 'Cut off glove fingertips to gain tactile skin grip on machinery levers',
            text_hi: 'दस्ताने की उंगलियों को आगे से काट लें',
            isCorrect: false,
            penalty: 10,
            consequenceTitle: 'NEAR-MISS SIMULATION: SEVERE PINCH INJURY',
            simulationType: 'NEAR_MISS',
            hazardExplanation: 'Cutting glove fingertips leaves digits completely vulnerable to shearing pinch points and wire rope frays.',
            saferResponse: 'Never tamper with or alter personal protective equipment.'
          }
        ]
      }
    },
    {
      id: 'HAZ-PPE-BOOTS',
      name: 'Steel-Toed Boots with Metatarsal Guard',
      name_hi: 'स्टील-टो युक्त सुरक्षा जूते',
      type: 'INSPECTION_CHECK',
      severity: 'CRITICAL',
      position: [0.14, 0.04, 0.05],
      description: 'IS-15298 certified colliery boots with 200J steel toe cap, penetration-resistant steel midsole, and deep cleated anti-slip rubber outsole.',
      correctResponse: 'Verify steel toe integrity, clean mud from deep sole cleats, and tie laces tightly with no trailing loops.',
      wrongResponse: 'Tuck loose laces into socks or wear ordinary gumboots without steel toe protection.',
      explanation: 'Trailing laces get snagged in rotating scraper chains; unreinforced boots lead to crushed metatarsals from falling boulders.',
      score: 10,
      moduleId: 'MOD-005',
      decision: {
        question: 'Why are standard non-steel gumboots strictly prohibited underground?',
        options: [
          {
            id: 'A',
            text: 'They lack 200-Joule impact steel toe caps and puncture-resistant midsole plates',
            text_hi: 'उनमें 200-जूल प्रभाव स्टील टो और पंचर-रोधी प्लेट नहीं होती है',
            isCorrect: true,
            score: 10,
            explanation: 'Correct: Falling coal boulders and sharp rusted track spikes easily crush or penetrate unreinforced footwear.'
          },
          {
            id: 'B',
            text: 'They weigh slightly less than leather colliery work boots',
            text_hi: 'वे चमड़े के जूतों से हल्के होते हैं',
            isCorrect: false,
            penalty: 5,
            consequenceTitle: 'NEAR-MISS SIMULATION: FOOT CRUSH RISK',
            simulationType: 'NEAR_MISS',
            hazardExplanation: 'Non-safety boots offer zero protection when heavy equipment or coal lumps roll over feet.',
            saferResponse: 'Always verify the steel toe cap rating before entering pit gates.'
          }
        ]
      }
    },
    {
      id: 'HAZ-PPE-JACKET',
      name: 'High-Visibility Retroreflective Apparel',
      name_hi: 'उच्च-दृश्यता परावर्तक सुरक्षा परिधान',
      type: 'INSPECTION_CHECK',
      severity: 'HIGH',
      position: [0, 1.05, 0],
      description: 'Fluorescent high-visibility jacket with dual 50mm retroreflective silver stripes visible at 200+ meters in cap lamp beams.',
      correctResponse: 'Ensure jacket is fully zipped, reflective bands are free of thick coal mud, and fabric is visible from front, side, and rear.',
      wrongResponse: 'Wear a dark jacket over the safety vest when underground temperatures drop.',
      explanation: 'Underground haulage drivers (LHDs, shuttle cars) cannot see unreflective dark clothing until it is too late to brake.',
      score: 10,
      moduleId: 'MOD-005',
      decision: {
        question: 'Underground ambient light is near pitch-black. How does retroreflective striping keep you safe?',
        options: [
          {
            id: 'A',
            text: 'It reflects shuttle car and cap lamp beams directly back to operators at long distances',
            text_hi: 'यह वाहन चालकों को दूर से ही प्रकाश परावर्तित कर आपकी स्थिति दर्शाता है',
            isCorrect: true,
            score: 10,
            explanation: 'Correct: Retroreflective micro-prismatic bands bounce light back toward vehicle operators, giving ample stopping distance.'
          },
          {
            id: 'B',
            text: 'It provides thermal heat insulation inside deep ventilation shafts',
            text_hi: 'यह खदान में केवल ठंड से सुरक्षा देता है',
            isCorrect: false,
            penalty: 5,
            consequenceTitle: 'NEAR-MISS SIMULATION: VEHICLE BLIND SPOT HAZARD',
            simulationType: 'NEAR_MISS',
            hazardExplanation: 'Covering reflective stripes makes you invisible to heavy colliery vehicle operators in dark haulage galleries.',
            saferResponse: 'Keep outer high-visibility clothing exposed and clean of heavy coal slurry.'
          }
        ]
      }
    }
  ]
};
