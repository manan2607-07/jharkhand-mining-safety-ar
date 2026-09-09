import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const translations = {
  en: {
    appTitle: "Jharkhand AR Safety Simulator",
    appSubtitle: "DGMS Statutory Vocational Certification System",
    portalWorker: "Worker AR Trainer",
    portalOfficer: "Site Safety Officer",
    portalDGMS: "DGMS Dhanbad Verifier",
    portalState: "State Nodal Analytics",
    
    // Status & Common
    online: "Online Cloud Sync",
    offline: "Offline Local Store",
    voiceNarration: "Voice Narration",
    soundOn: "Audio Active",
    soundOff: "Audio Muted",
    startSimulation: "Start AR Training",
    exitSimulation: "Exit Simulation",
    nextStep: "Next Step",
    previousStep: "Previous",
    finishAssessment: "Submit Assessment",
    viewCertificate: "View Verifiable Certificate",
    downloadCertificate: "Download QR Certificate",
    
    // Modules
    module1Title: "Fire & Explosion Response",
    module1Subtitle: "Exit identification, extinguisher PASS technique, and evacuation drill",
    module2Title: "Gas Leak & Confined Space Protocol",
    module2Subtitle: "Methane (CH4), Carbon Monoxide (CO), PPE donning, and buddy signaling",
    module3Title: "Machinery & Moving-Part Safety",
    module4Title: "Electrical & Blasting Clearance",
    module5Title: "PPE Compliance & Induction",
    phase1MVP: "MVP Included",
    phase2Future: "Phase 2 Pipeline",
    
    // AR Fire PASS steps
    passP_title: "Step 1: Pull the Safety Pin",
    passP_desc: "Break the tamper seal and pull the safety locking pin from the valve handle.",
    passA_title: "Step 2: Aim Low at Fire Base",
    passA_desc: "Direct the discharge nozzle directly at the base/fuel of the flames, not the smoke.",
    passS1_title: "Step 3: Squeeze the Lever",
    passS1_desc: "Depress the handle to release pressurized dry chemical extinguishing foam.",
    passS2_title: "Step 4: Sweep Side to Side",
    passS2_desc: "Sweep the nozzle horizontally covering the fire perimeter until completely smothered.",
    
    // AR Gas Module steps
    gasDetectTitle: "Step 1: Atmospheric Gas Monitoring",
    gasDetectDesc: "Calibrate 4-gas detector. Check Methane (CH4 < 1.25%), CO (< 50 ppm), and Oxygen (19.5% - 23.5%).",
    gasPpeTitle: "Step 2: Mandatory PPE Donning",
    gasPpeDesc: "Equip Self-Contained Breathing Apparatus (SCBA), anti-static helmet with cap lamp, and lifeline harness.",
    gasBuddyTitle: "Step 3: Two-Person Buddy Signaling",
    gasBuddyDesc: "Establish visual and radio contact with standby buddy before crossing confined space threshold.",
    
    // Certification & DGMS
    certTitle: "STATUTORY SAFETY CERTIFICATE",
    certSubtitle: "Mines Act 1952 & Factories Act 1948 Competency Accreditation",
    certWorkerName: "Worker Name",
    certWorkerId: "Worker Code",
    certMineSite: "Certified Mine / Plant Site",
    certScore: "Competency Score",
    certIssueDate: "Issue Date",
    certExpiryDate: "Statutory Expiry Date",
    certRefresherWarning: "Refresher training mandatory within 365 days under DGMS Circulars.",
    certVerifiedStatus: "AUTHENTIC & REGISTERED ON DGMS LEDGER",
    certQrInstructions: "Scan QR code on-site to inspect cryptographic proof and compliance integrity.",
    
    // Audio Prompts
    audioPullPin: "Pull the safety pin from the extinguisher now.",
    audioAimBase: "Aim the nozzle at the bottom of the fire.",
    audioSqueezeLever: "Squeeze the lever firmly to discharge foam.",
    audioSweepFire: "Sweep left and right across the fire.",
    audioGasAlarm: "Warning! Gas threshold exceeded. Don oxygen mask immediately!",
    audioBuddyConfirm: "Confirm buddy radio signal before entering the tunnel."
  },

  hi: {
    appTitle: "झारखंड एआर सुरक्षा सिम्युलेटर",
    appSubtitle: "डीजीएमएस वैधानिक व्यावसायिक प्रमाणन प्रणाली",
    portalWorker: "श्रमिक एआर प्रशिक्षण",
    portalOfficer: "साइट सुरक्षा अधिकारी",
    portalDGMS: "डीजीएमएस धनबाद सत्यापन",
    portalState: "राज्य नोडल विश्लेषिकी",
    
    // Status & Common
    online: "ऑनलाइन क्लाउड सिंक",
    offline: "ऑफ़लाइन स्थानीय संग्रह",
    voiceNarration: "आवाज़ मार्गदर्शन",
    soundOn: "ऑडियो सक्रिय",
    soundOff: "ऑडियो बंद",
    startSimulation: "एआर प्रशिक्षण शुरू करें",
    exitSimulation: "सिमुलेशन से बाहर निकलें",
    nextStep: "अगला चरण",
    previousStep: "पिछला",
    finishAssessment: "मूल्यांकन सबमिट करें",
    viewCertificate: "सत्यापित प्रमाण पत्र देखें",
    downloadCertificate: "क्यूआर प्रमाण पत्र डाउनलोड करें",
    
    // Modules
    module1Title: "आग एवं विस्फोट प्रतिक्रिया",
    module1Subtitle: "निकास पहचान, अग्निशामक PASS तकनीक और आपातकालीन निकासी",
    module2Title: "गैस रिसाव एवं सीमित स्थान प्रोटोकॉल",
    module2Subtitle: "मीथेन (CH4), कार्बन मोनोऑक्साइड (CO), पीपीई और बडी संकेत",
    module3Title: "मशीनरी एवं कन्वेयर सुरक्षा",
    module4Title: "विद्युत एवं ब्लास्टिंग क्लीयरेंस",
    module5Title: "पीपीई अनुपालन एवं खदान प्रवेश",
    phase1MVP: "एमवीपी शामिल",
    phase2Future: "द्वितीय चरण",
    
    // AR Fire PASS steps
    passP_title: "चरण 1: सुरक्षा पिन खींचें (Pull)",
    passP_desc: "सील तोड़ें और हैंडल से सेफ्टी लॉकिंग पिन को बाहर खींचें।",
    passA_title: "चरण 2: आग के आधार पर निशाना लगाएं (Aim)",
    passA_desc: "नोजल को सीधे आग की जड़ (निचले हिस्से) पर केंद्रित करें, धुएं पर नहीं।",
    passS1_title: "चरण 3: लीवर को दबाएं (Squeeze)",
    passS1_desc: "केमिकल झाग छोड़ने के लिए हैंडल लीवर को मजबूती से दबाएं।",
    passS2_title: "चरण 4: अगल-बगल घुमाएं (Sweep)",
    passS2_desc: "आग पूरी तरह बुझने तक नोजल को दाएं-बाएं घुमाते रहें।",
    
    // AR Gas Module steps
    gasDetectTitle: "चरण 1: वायुमंडलीय गैस निगरानी",
    gasDetectDesc: "गैस डिटेक्टर जांचें: मीथेन (< 1.25%), कार्बन मोनोऑक्साइड (< 50 ppm), ऑक्सीजन स्तर सामान्य।",
    gasPpeTitle: "चरण 2: अनिवार्य पीपीई पहनना",
    gasPpeDesc: "ऑक्सीजन मास्क (SCBA), कैप लैंप युक्त हेलमेट और हार्नेस रस्सी पहनें।",
    gasBuddyTitle: "चरण 3: 2-व्यक्ति बडी सिग्नल",
    gasBuddyDesc: "सीमित खदान सुरंग में प्रवेश से पूर्व बाहर खड़े साथी के साथ रेडियो संपर्क जांचें।",
    
    // Certification & DGMS
    certTitle: "वैधानिक सुरक्षा प्रमाण पत्र",
    certSubtitle: "खान अधिनियम 1952 एवं कारखाना अधिनियम 1948 योग्यता प्रमाणन",
    certWorkerName: "श्रमिक का नाम",
    certWorkerId: "श्रमिक कोड",
    certMineSite: "प्रमाणित खदान / संयंत्र स्थल",
    certScore: "योग्यता अंक",
    certIssueDate: "जारी करने की तिथि",
    certExpiryDate: "वैधानिक समाप्ति तिथि",
    certRefresherWarning: "डीजीएमएस परिपत्र के अनुसार 365 दिनों के भीतर पुनश्चर्या प्रशिक्षण अनिवार्य है।",
    certVerifiedStatus: "डीजीएमएस रिकॉर्ड पर प्रामाणिक एवं पंजीकृत",
    certQrInstructions: "डिजिटल सत्यापन के लिए इस क्यूआर कोड को ऑन-साइट स्कैन करें।",
    
    // Audio Prompts
    audioPullPin: "अग्निशामक यंत्र की सेफ्टी पिन खींचें।",
    audioAimBase: "नोजल को आग के निचले हिस्से पर रखें।",
    audioSqueezeLever: "हैंडल को दबाकर झाग छोड़ें।",
    audioSweepFire: "नोजल को दाएं-बाएं घुमाएं।",
    audioGasAlarm: "खतरा! जहरीली गैस का स्तर बढ़ा। तुरंत ऑक्सीजन मास्क पहनें!",
    audioBuddyConfirm: "सुरंग में जाने से पहले साथी को रेडियो संकेत दें।"
  },

  sat: {
    appTitle: "ᱡᱷᱟᱨᱠᱷᱚᱸᱰ AR ᱨᱩᱠᱷᱤᱭᱟᱹ ᱥᱮᱪᱮᱫ",
    appSubtitle: "DGMS ᱠᱷᱟᱫᱟᱱ ᱟᱹᱱ ᱯᱚᱨᱢᱟᱱ ᱥᱟᱠᱟᱢ ᱵᱮᱵᱚᱥᱛᱟ",
    portalWorker: "ᱠᱟᱹᱢᱤᱭᱟᱹ AR ᱥᱮᱪᱮᱫ",
    portalOfficer: "ᱥᱟᱭᱤᱴ ᱨᱩᱠᱷᱤᱭᱟᱹ ᱚᱯᱷᱤᱥᱚᱨ",
    portalDGMS: "DGMS ᱫᱷᱟᱱᱵᱟᱫᱽ ᱯᱚᱨᱠᱷᱟᱣ",
    portalState: "ᱯᱚᱱᱚᱛ ᱱᱚᱰᱟᱞ ᱰᱮᱥᱵᱚᱨᱰ",
    
    // Status & Common
    online: "ᱚᱱᱞᱟᱭᱤᱱ ᱠᱞᱟᱣᱩᱰ ᱡᱚᱲᱟᱣ",
    offline: "ᱚᱯᱷᱞᱟᱭᱤᱱ ᱡᱟᱭᱜᱟ ᱨᱮ ᱥᱟᱧᱪᱟᱣ",
    voiceNarration: "ᱨᱚᱲ ᱛᱮ ᱞᱟᱹᱭ",
    soundOn: "ᱟᱲᱟᱝ ᱪᱟᱹᱞᱩ",
    soundOff: "ᱟᱲᱟᱝ ᱵᱚᱸᱫᱽ",
    startSimulation: "AR ᱥᱮᱪᱮᱫ ᱮᱦᱚᱵ",
    exitSimulation: "ᱥᱮᱪᱮᱫ ᱠᱷᱚᱱ ᱚᱰᱚᱠ",
    nextStep: "ᱞᱟᱦᱟ ᱛᱷᱟᱠ",
    previousStep: "ᱛᱟᱭᱚᱢ",
    finishAssessment: "ᱯᱚᱨᱠᱷᱟᱣ ᱮᱢ",
    viewCertificate: "ᱯᱚᱨᱢᱟᱱ ᱥᱟᱠᱟᱢ ᱧᱮᱞ",
    downloadCertificate: "QR ᱥᱟᱠᱟᱢ ᱟᱹᱜᱩᱭ",
    
    // Modules
    module1Title: "ᱥᱮᱸᱜᱮᱞ ᱟᱨ ᱵᱚᱢ ᱵᱤᱥᱯᱷᱚᱴ ᱵᱟᱧᱪᱟᱣ",
    module1Subtitle: "ᱚᱰᱚᱠᱚᱜ ᱰᱟᱦᱟᱨ ᱯᱟᱱᱛᱷᱟ, ᱥᱮᱸᱜᱮᱞ ᱤᱬᱤᱡ (PASS) ᱠᱟᱹᱢᱤᱦᱚᱨᱟ",
    module2Title: "ᱜᱮᱥ ᱡᱚᱨᱚ ᱟᱨ ᱪᱤᱯᱟᱹᱴ ᱡᱟᱭᱜᱟ ᱨᱩᱠᱷᱤᱭᱟᱹ",
    module2Subtitle: "ᱢᱤᱛᱷᱮᱱ, CO ᱜᱮᱥ ᱪᱤᱱᱦᱟᱹ, PPE ᱦᱚᱨᱚᱜ ᱟᱨ ᱡᱚᱴᱟᱣ ᱥᱟᱶ ᱜᱟᱞᱢᱟᱨᱟᱣ",
    module3Title: "ᱠᱚᱞ ᱠᱟᱹᱨᱜᱟᱲ ᱟᱨ ᱢᱮᱥᱤᱱ ᱨᱩᱠᱷᱤᱭᱟᱹ",
    module4Title: "ᱵᱤᱡᱽᱞᱤ ᱟᱨ ᱵᱞᱟᱥᱴᱤᱝ ᱦᱩᱥᱤᱭᱟᱹᱨ",
    module5Title: "ᱯᱤᱯᱤᱤ (PPE) ᱦᱚᱨᱚᱜ ᱟᱨ ᱠᱷᱟᱫᱟᱱ ᱵᱚᱞᱚᱱ",
    phase1MVP: "ᱱᱤᱛᱚᱜ ᱪᱟᱹᱞᱩ",
    phase2Future: "ᱫᱚᱥᱟᱨ ᱛᱷᱟᱠ",
    
    // AR Fire PASS steps
    passP_title: "ᱛᱷᱟᱠ ᱑: ᱨᱩᱠᱷᱤᱭᱟᱹ ᱯᱤᱱ ᱚᱨ ᱚᱰᱚᱠ (Pull)",
    passP_desc: "ᱥᱤᱞ ᱨᱟᱹᱯᱩᱫ ᱠᱟᱛᱮ ᱦᱮᱱᱰᱮᱞ ᱠᱷᱚᱱ ᱞᱚᱠ ᱯᱤᱱ ᱚᱨ ᱚᱰᱚᱠ ᱢᱮ᱾",
    passA_title: "ᱛᱷᱟᱠ ᱒: ᱥᱮᱸᱜᱮᱞ ᱞᱟᱛᱟᱨ ᱨᱮ ᱴᱷᱤᱠᱟᱹᱭ (Aim)",
    passA_desc: "ᱱᱚᱡᱚᱞ ᱫᱚ ᱥᱮᱸᱜᱮᱞ ᱨᱮᱱᱟᱜ ᱵᱩᱴᱟᱹ ᱥᱮᱫ ᱥᱟᱢᱟᱝ ᱢᱮ, ᱫᱷᱩᱶᱟᱹ ᱥᱮᱫ ᱫᱚ ᱵᱟᱝ᱾",
    passS1_title: "ᱛᱷᱟᱠ ᱓: ᱦᱮᱱᱰᱮᱞ ᱞᱤᱱ ᱢᱮ (Squeeze)",
    passS1_desc: "ᱫᱟᱨᱮ ᱜᱩᱸᱰᱟᱹ ᱯᱷᱮᱬ ᱚᱰᱚᱠ ᱞᱟᱹᱜᱤᱫ ᱦᱮᱱᱰᱮᱞ ᱡᱚᱨ ᱛᱮ ᱞᱤᱱ ᱢᱮ᱾",
    passS2_title: "ᱛᱷᱟᱠ ᱔: ᱮᱛᱚᱢ ᱠᱚᱧᱮ ᱦᱤᱞᱟᱹᱣ ᱢᱮ (Sweep)",
    passS2_desc: "ᱥᱮᱸᱜᱮᱞ ᱵᱟᱝ ᱤᱬᱤᱡᱚᱜ ᱵᱷᱩᱨ ᱞᱮᱸᱜᱟ ᱟᱨ ᱡᱚᱡᱚᱢ ᱥᱮᱫ ᱦᱤᱞᱟᱹᱣ ᱤᱫᱤ ᱢᱮ᱾",
    
    // AR Gas Module steps
    gasDetectTitle: "ᱛᱷᱟᱠ ᱑: ᱦᱚᱭ ᱜᱮᱥ ᱯᱚᱨᱠᱷᱟᱣ",
    gasDetectDesc: "ᱢᱤᱛᱷᱮᱱ (< ᱑.᱒᱕%) ᱟᱨ ᱠᱟᱨᱵᱚᱱ ᱢᱚᱱᱳᱠᱥᱟᱭᱤᱰ (< ᱕᱐ ppm) ᱦᱚᱭ ᱢᱤᱴᱟᱨ ᱧᱮᱞ ᱢᱮ᱾",
    gasPpeTitle: "ᱛᱷᱟᱠ ᱒: ᱨᱩᱠᱷᱤᱭᱟᱹ ᱥᱟᱯᱟᱵ (PPE) ᱦᱚᱨᱚᱜ",
    gasPpeDesc: "ᱥᱟᱺᱦᱮᱫ ᱢᱟᱥᱠ, ᱦᱮᱞᱢᱮᱴ ᱵᱟᱹᱛᱤ ᱟᱨ ᱨᱩᱠᱷᱤᱭᱟᱹ ᱵᱟᱵᱮᱨ ᱦᱚᱨᱚᱜ ᱢᱮ᱾",
    gasBuddyTitle: "ᱛᱷᱟᱠ ᱓: ᱡᱚᱴᱟᱣ ᱥᱟᱶ ᱜᱟᱞᱢᱟᱨᱟᱣ (Buddy System)",
    gasBuddyDesc: "ᱠᱷᱟᱫᱟᱱ ᱵᱷᱤᱛᱨᱤ ᱵᱚᱞᱚᱱ ᱞᱟᱦᱟ ᱨᱮ ᱵᱟᱦᱨᱮ ᱛᱟᱦᱮᱸᱱ ᱡᱚᱴᱟᱣ ᱥᱟᱶ ᱨᱮᱰᱤᱭᱳ ᱛᱮ ᱠᱟᱛᱷᱟ ᱯᱩᱥᱴᱟᱹᱣ ᱢᱮ᱾",
    
    // Certification & DGMS
    certTitle: "ᱠᱷᱟᱫᱟᱱ ᱨᱩᱠᱷᱤᱭᱟᱹ ᱯᱚᱨᱢᱟᱱ ᱥᱟᱠᱟᱢ",
    certSubtitle: "Mines Act 1952 & Factories Act 1948 ᱞᱮᱠᱟᱛᱮ ᱥᱮᱪᱮᱫ ᱯᱚᱨᱢᱟᱱ",
    certWorkerName: "ᱠᱟᱹᱢᱤᱭᱟᱹ ᱧᱩᱛᱩᱢ",
    certWorkerId: "ᱠᱟᱹᱢᱤᱭᱟᱹ ᱠᱳᱰ",
    certMineSite: "ᱠᱷᱟᱫᱟᱱ / ᱠᱟᱹᱨᱜᱟᱲ ᱡᱟᱭᱜᱟ",
    certScore: "ᱥᱮᱪᱮᱫ ᱱᱚᱢᱵᱚᱨ",
    certIssueDate: "ᱮᱢ ᱢᱟᱹᱦᱤᱛ",
    certExpiryDate: "ᱢᱩᱪᱟᱹᱫ ᱢᱟᱹᱦᱤᱛ",
    certRefresherWarning: "DGMS ᱟᱹᱱ ᱞᱮᱠᱟᱛᱮ ᱓᱖᱕ ᱢᱟᱦᱟᱸ ᱵᱷᱤᱛᱨᱤ ᱨᱮ ᱫᱚᱦᱲᱟ ᱥᱮᱪᱮᱫ ᱦᱩᱭᱩᱜ-ᱟ᱾",
    certVerifiedStatus: "DGMS ᱨᱮᱠᱳᱨᱰ ᱨᱮ ᱥᱟᱹᱨᱤ ᱟᱨ ᱫᱚᱦᱚ ᱢᱮᱱᱟᱜ-ᱟ",
    certQrInstructions: "ᱱᱚᱶᱟ QR ᱠᱳᱰ ᱥᱠᱮᱱ ᱠᱟᱛᱮ ᱯᱚᱨᱢᱟᱱ ᱥᱟᱠᱟᱢ ᱨᱮᱱᱟᱜ ᱥᱟᱹᱨᱤᱭᱟᱹᱛ ᱵᱟᱰᱟᱭ ᱢᱮ᱾",
    
    // Audio Prompts
    audioPullPin: "ᱥᱮᱸᱜᱮᱞ ᱤᱬᱤᱡ ᱥᱟᱯᱟᱵ ᱨᱮᱱᱟᱜ ᱯᱤᱱ ᱚᱨ ᱚᱰᱚᱠ ᱢᱮ᱾",
    audioAimBase: "ᱱᱚᱡᱚᱞ ᱫᱚ ᱥᱮᱸᱜᱮᱞ ᱞᱟᱛᱟᱨ ᱥᱮᱫ ᱴᱷᱤᱠᱟᱹᱭ ᱢᱮ᱾",
    audioSqueezeLever: "ᱯᱷᱮᱬ ᱚᱰᱚᱠ ᱞᱟᱹᱜᱤᱫ ᱦᱮᱱᱰᱮᱞ ᱡᱚᱨ ᱛᱮ ᱞᱤᱱ ᱢᱮ᱾",
    audioSweepFire: "ᱞᱮᱸᱜᱟ ᱟᱨ ᱡᱚᱡᱚᱢ ᱥᱮᱫ ᱦᱤᱞᱟᱹᱣ ᱢᱮ᱾",
    audioGasAlarm: "ᱵᱚᱛᱚᱨ! ᱵᱤᱥ ᱜᱮᱥ ᱰᱷᱮᱨ ᱮᱱᱟ᱾ ᱥᱟᱺᱦᱮᱫ ᱢᱟᱥᱠ ᱩᱥᱟᱹᱨᱟ ᱦᱚᱨᱚᱜ ᱢᱮ!",
    audioBuddyConfirm: "ᱠᱷᱟᱫᱟᱱ ᱵᱚᱞᱚᱱ ᱞᱟᱦᱟ ᱡᱚᱴᱟᱣ ᱥᱟᱶ ᱨᱮᱰᱤᱭᱳ ᱛᱮ ᱜᱟᱞᱢᱟᱨᱟᱣ ᱢᱮ᱾"
  }
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('jh_safety_lang') || 'sat'; // Default to Santali Ol Chiki for Jharkhand tribal priority!
  });
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    localStorage.setItem('jh_safety_lang', language);
  }, [language]);

  const t = translations[language] || translations.en;

  const speak = (text) => {
    if (!audioEnabled || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Determine speech voice/lang
      if (language === 'hi') {
        utterance.lang = 'hi-IN';
        utterance.rate = 0.9;
      } else if (language === 'sat') {
        // Santali phonetics can use Indic phonetic synthesizer
        utterance.lang = 'hi-IN';
        utterance.rate = 0.85;
      } else {
        utterance.lang = 'en-IN';
        utterance.rate = 0.95;
      }

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('Speech synthesis error:', err);
      setIsSpeaking(false);
    }
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

  return (
    <LanguageContext.Provider value={{
      language,
      setLanguage,
      t,
      audioEnabled,
      setAudioEnabled,
      isSpeaking,
      speak,
      stopSpeaking
    }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
