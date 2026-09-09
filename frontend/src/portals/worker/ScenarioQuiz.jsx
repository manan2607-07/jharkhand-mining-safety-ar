import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { AshokaLionCapital } from '../../components/Emblem';
import { 
  CheckCircle2, 
  XCircle, 
  Volume2, 
  Award, 
  RotateCcw, 
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  FileCheck
} from 'lucide-react';

export default function ScenarioQuiz({ moduleId, arAccuracy = 0.9, onQuizPassed, onRetake }) {
  const { language, t, speak } = useLanguage();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);

  // Question banks with English, Hindi, and authentic Santali Ol Chiki (ᱚᱞ ᱪᱤᱠᱤ)
  const questionBanks = {
    'MOD-001': [
      {
        id: 'Q1',
        title: {
          en: "Dense coal dust smoke is detected ahead. According to DGMS protocol, what is your FIRST critical action?",
          hi: "सामने घना कोयला धूल धुआं देखा गया है। डीजीएमएस प्रोटोकॉल के अनुसार आपकी पहली महत्वपूर्ण कार्रवाई क्या है?",
          sat: "ᱞᱟᱦᱟ ᱨᱮ ᱫᱷᱩᱸᱣᱟᱹ ᱧᱮᱞᱚᱜ ᱠᱟᱱᱟ᱾ DGMS ᱟᱹᱱ ᱞᱮᱠᱟᱛᱮ ᱟᱢᱟᱜ ᱯᱩᱭᱞᱩ ᱠᱟᱹᱢᱤ ᱫᱚ ᱪᱮᱫ?"
        },
        options: [
          {
            id: 'A',
            text: {
              en: "Run alone toward the shaft without warning others",
              hi: "दूसरों को चेतावनी दिए बिना अकेले बाहर की ओर भागना",
              sat: "ᱮᱴᱟᱜ ᱠᱚ ᱵᱟᱝ ᱞᱟᱹᱭ ᱠᱟᱛᱮ ᱮᱠᱞᱟ ᱫᱟᱹᱲ"
            },
            isCorrect: false
          },
          {
            id: 'B',
            text: {
              en: "Trigger manual acoustic alarm and verify emergency exit path remains unblocked behind you",
              hi: "मैन्युअल अलार्म बजाएं और पुष्टि करें कि आपके पीछे का आपातकालीन निकास खुला है",
              sat: "ᱵᱤᱯᱚᱫᱽ ᱜᱷᱟᱱᱴᱤ ᱵᱟᱡᱟᱣ ᱟᱨ ᱟᱢ ᱛᱟᱭᱚᱢ ᱨᱮ ᱚᱰᱚᱠᱚᱜ ᱰᱟᱦᱟᱨ ᱧᱮᱞ"
            },
            isCorrect: true,
            rationale: "DGMS Mines Safety Circular 2026 mandates acoustic alert and clear retreat path before engaging."
          },
          {
            id: 'C',
            text: {
              en: "Hide behind conveyor belt structure to wait out the fire",
              hi: "कन्वेयर बेल्ट के पीछे छिपकर आग शांत होने का इंतजार करना",
              sat: "ᱠᱚᱞ ᱥᱩᱨ ᱨᱮ ᱩᱠᱩ ᱠᱟᱛᱮ ᱛᱟᱺᱜᱤ ᱛᱟᱦᱮᱸᱱ"
            },
            isCorrect: false
          }
        ]
      },
      {
        id: 'Q2',
        title: {
          en: "You have retrieved the dry chemical powder extinguisher. What is the mandatory PASS decision sequence?",
          hi: "आपके पास सूखा रासायनिक अग्निशामक है। अनिवार्य PASS निर्णय क्रम क्या है?",
          sat: "ᱥᱮᱸᱜᱮᱞ ᱤᱬᱤᱡ ᱥᱟᱯᱟᱵ ᱨᱮᱱᱟᱜ ᱴᱷᱤᱠ PASS ᱠᱟᱹᱢᱤᱦᱚᱨᱟ ᱫᱚ ᱪᱮᱫ?"
        },
        options: [
          {
            id: 'A',
            text: {
              en: "Pull pin → Aim at fire base → Squeeze handle → Sweep side-to-side",
              hi: "पिन खींचें → आग के आधार पर निशाना साधें → हैंडल दबाएं → अगल-बगल घुमाएं",
              sat: "ᱯᱤᱱ ᱚᱨ → ᱞᱟᱛᱟᱨ ᱥᱮᱫ ᱴᱷᱤᱠᱟᱹᱭ → ᱦᱮᱱᱰᱮᱞ ᱞᱤᱱ → ᱞᱮᱸᱜᱟ-ᱡᱚᱡᱚᱢ ᱦᱤᱞᱟᱹᱣ"
            },
            isCorrect: true,
            rationale: "Statutory PASS sequence: Pull pin, Aim low, Squeeze lever, Sweep across base."
          },
          {
            id: 'B',
            text: {
              en: "Squeeze handle → Wave nozzle in circles → Aim at top smoke",
              hi: "हैंडल दबाएं → नोजल को गोल घुमाएं → ऊपर के धुएं पर निशाना लगाएं",
              sat: "ᱦᱮᱱᱰᱮᱞ ᱞᱤᱱ → ᱜᱩᱞᱟᱹᱭ ᱦᱤᱞᱟᱹᱣ → ᱪᱮᱛᱟᱱ ᱫᱷᱩᱸᱣᱟᱹ ᱨᱮ ᱴᱷᱤᱠᱟᱹᱭ"
            },
            isCorrect: false
          }
        ]
      },
      {
        id: 'Q3',
        title: {
          en: "The flames begin spreading onto high-voltage motor cables and exceed head height. What is the statutory order?",
          hi: "लपटें उच्च वोल्टेज केबल पर फैलने लगी हैं और सिर की ऊंचाई से ऊपर हैं। वैधानिक आदेश क्या है?",
          sat: "ᱥᱮᱸᱜᱮᱞ ᱵᱤᱡᱽᱞᱤ ᱛᱟᱨ ᱨᱮ ᱞᱟᱜᱟᱣ ᱮᱱᱟ ᱟᱨ ᱩᱥᱩᱞ ᱡᱩᱞᱩᱜ ᱠᱟᱱᱟ᱾ ᱟᱹᱱ ᱞᱮᱠᱟᱛᱮ ᱪᱮᱫ ᱠᱟᱹᱢᱤ ᱦᱩᱭᱩᱜ-ᱟ?"
        },
        options: [
          {
            id: 'A',
            text: {
              en: "Continue fighting fire until all extinguisher powder is depleted",
              hi: "पाउडर खत्म होने तक आग बुझाना जारी रखें",
              sat: "ᱥᱟᱯᱟᱵ ᱯᱮᱨᱮᱡ ᱢᱩᱪᱟᱹᱫ ᱦᱟᱹᱵᱤᱡ ᱥᱮᱸᱜᱮᱞ ᱥᱟᱶ ᱞᱟᱹᱲᱦᱟᱹᱭ"
            },
            isCorrect: false
          },
          {
            id: 'B',
            text: {
              en: "Immediately cease fighting, activate emergency stop, seal ventilation doors, and evacuate via intake shaft",
              hi: "तुरंत बुझाना बंद करें, ई-स्टॉप दबाएं, वेंटिलेशन दरवाजे बंद करें और ताजी हवा वाले शाफ्ट से बाहर निकलें",
              sat: "ᱥᱟᱶᱛᱮ ᱤᱬᱤᱡ ᱵᱟᱹᱜᱤ ᱠᱟᱛᱮ ᱩᱥᱟᱹᱨᱟ ᱥᱟᱯᱷᱟ ᱦᱚᱭ ᱰᱟᱦᱟᱨ ᱛᱮ ᱚᱰᱚᱠ ᱪᱟᱞᱟᱜ"
            },
            isCorrect: true,
            rationale: "Mines Act 1952 specifies that toxic smoke and electrical arcing outweigh firefighting attempts once flame bounds are breached."
          }
        ]
      }
    ],

    'MOD-002': [
      {
        id: 'Q1',
        title: {
          en: "Your multi-gas detector beeps and reads Methane (CH4) at 1.45%. What does DGMS Coal Mine Regulation mandate?",
          hi: "आपका गैस डिटेक्टर बीप करता है और मीथेन 1.45% दिखाता है। डीजीएमएस कोयला खान विनियमन क्या निर्देश देता है?",
          sat: "ᱦᱚᱭ ᱢᱤᱴᱟᱨ ᱨᱮ ᱢᱤᱛᱷᱮᱱ ᱑.᱔᱕% ᱩᱫᱩᱜ ᱠᱟᱱᱟ᱾ DGMS ᱠᱷᱟᱫᱟᱱ ᱟᱹᱱ ᱞᱮᱠᱟᱛᱮ ᱪᱮᱫ ᱦᱩᱭᱩᱜ-ᱟ?"
        },
        options: [
          {
            id: 'A',
            text: {
              en: "Methane above 1.25% is explosive hazard: immediately cut electrical power and withdraw all workers",
              hi: "1.25% से अधिक मीथेन विस्फोटक है: तुरंत बिजली काटें और सभी कामगारों को सुरक्षित बाहर निकालें",
              sat: "᱑.᱒᱕% ᱠᱷᱚᱱ ᱰᱷᱮᱨ ᱢᱤᱛᱷᱮᱱ ᱵᱤᱥᱯᱷᱚᱴ ᱦᱩᱭ ᱫᱟᱲᱮᱭᱟᱜ-ᱟ: ᱵᱤᱡᱽᱞᱤ ᱵᱚᱸᱫᱽ ᱠᱟᱛᱮ ᱥᱟᱱᱟᱢ ᱦᱚᱲ ᱚᱰᱚᱠ"
            },
            isCorrect: true,
            rationale: "DGMS limits explosive gas presence to 1.25% max in work areas."
          },
          {
            id: 'B',
            text: {
              en: "Ignore the alarm if there is no burning smell",
              hi: "यदि कोई जलने की गंध न हो तो अलार्म को अनदेखा करें",
              sat: "ᱥᱚ ᱵᱟᱝ ᱦᱤᱡᱩᱜ ᱠᱟᱱ ᱠᱷᱟᱱ ᱟᱞᱟᱨᱢ ᱵᱟᱹᱜᱤ ᱢᱮ"
            },
            isCorrect: false
          }
        ]
      },
      {
        id: 'Q2',
        title: {
          en: "What is the mandatory 2-person buddy rule before stepping into an underground confined space chamber?",
          hi: "भूमिगत सीमित स्थान में प्रवेश करने से पहले अनिवार्य 2-व्यक्ति बडी नियम क्या है?",
          sat: "ᱠᱷᱟᱫᱟᱱ ᱪᱤᱯᱟᱹᱴ ᱡᱟᱭᱜᱟ ᱵᱚᱞᱚᱱ ᱞᱟᱦᱟ ᱨᱮ ᱵᱟᱨ ᱦᱚᱲ ᱡᱚᱴᱟᱣ (Buddy System) ᱟᱹᱱ ᱫᱚ ᱪᱮᱫ?"
        },
        options: [
          {
            id: 'A',
            text: {
              en: "Continuous line-of-sight/radio contact with a designated standby attendant stationed outside with rescue gear",
              hi: "बचाव उपकरण के साथ बाहर तैनात साथी के साथ निरंतर रेडियो एवं दृश्य संपर्क बनाए रखना",
              sat: "ᱵᱟᱦᱨᱮ ᱨᱮ ᱛᱟᱦᱮᱸᱱ ᱡᱚᱴᱟᱣ ᱥᱟᱶ ᱨᱮᱰᱤᱭᱳ ᱟᱨ ᱢᱮᱫ ᱛᱮ ᱧᱮᱯᱮᱞ ᱥᱟᱹᱜᱟᱹᱭ ᱫᱚᱦᱚ"
            },
            isCorrect: true,
            rationale: "Factories Act & Mines Act require an external sentinel who never enters alone but coordinates extraction."
          },
          {
            id: 'B',
            text: {
              en: "Both workers enter together without anyone monitoring the entrance",
              hi: "प्रवेश द्वार पर किसी के बिना दोनों कार्यकर्ता एक साथ अंदर चले जाएं",
              sat: "ᱵᱟᱦᱨᱮ ᱨᱮ ᱚᱠᱚᱭ ᱦᱚᱸ ᱵᱟᱝ ᱫᱚᱦᱚ ᱠᱟᱛᱮ ᱵᱟᱱᱟᱨ ᱦᱚᱲ ᱵᱷᱤᱛᱨᱤ ᱵᱚᱞᱚᱱ"
            },
            isCorrect: false
          }
        ]
      },
      {
        id: 'Q3',
        title: {
          en: "During confined entry, your partner outside transmits 3 rapid sharp pulls on the harness lifeline rope. What is the meaning?",
          hi: "सुरंग में प्रवेश के दौरान आपका बाहरी साथी लाइफलाइन रस्सी पर तेजी से 3 झटके देता है। इसका क्या अर्थ है?",
          sat: "ᱠᱷᱟᱫᱟᱱ ᱵᱷᱤᱛᱨᱤ ᱨᱮ ᱵᱟᱵᱮᱨ ᱓ ᱫᱷᱟᱣ ᱡᱚᱨ ᱛᱮ ᱚᱨ ᱮᱱᱟ᱾ ᱱᱚᱶᱟ ᱪᱮᱫ ᱵᱟᱰᱟᱭᱚᱜ-ᱟ?"
        },
        options: [
          {
            id: 'A',
            text: {
              en: "Emergency immediate evacuation: retreat immediately along the lifeline rope",
              hi: "आपातकालीन तत्काल निकास: रस्सी के सहारे तुरंत बाहर निकलें",
              sat: "ᱟᱹᱰᱤ ᱩᱥᱟᱹᱨᱟ ᱵᱟᱧᱪᱟᱣ: ᱵᱟᱵᱮᱨ ᱥᱟᱵ ᱠᱟᱛᱮ ᱵᱟᱦᱨᱮ ᱚᱰᱚᱠᱚᱜ ᱢᱮ"
            },
            isCorrect: true,
            rationale: "Standard mining rope signal: 1 tug = stop, 2 tugs = advance/slack, 3 tugs = emergency extract."
          },
          {
            id: 'B',
            text: {
              en: "Partner is testing rope weight: stay where you are",
              hi: "साथी रस्सी के वजन का परीक्षण कर रहा है: वहीं रहें",
              sat: "ᱡᱚᱴᱟᱣ ᱫᱚ ᱵᱟᱵᱮᱨ ᱡᱚᱠᱷᱟᱭᱮᱫ-ᱟ: ᱛᱟᱦᱮᱸᱱ ᱢᱮ"
            },
            isCorrect: false
          }
        ]
      }
    ]
  };

  const currentQuestions = questionBanks[moduleId] || questionBanks['MOD-001'];
  const q = currentQuestions[currentQuestionIndex];

  useEffect(() => {
    if (q) {
      const qText = q.title[language] || q.title.en;
      speak(qText);
    }
  }, [currentQuestionIndex, language]);

  const handleSelectOption = (opt) => {
    if (isSubmitted) return;
    setSelectedOption(opt);
  };

  const handleSubmitAnswer = () => {
    if (!selectedOption) return;
    setIsSubmitted(true);
    const isCorrect = selectedOption.isCorrect;
    const newAnswers = [...answers, { questionId: q.id, selectedOption: selectedOption.id, isCorrect }];
    setAnswers(newAnswers);

    if (isCorrect) {
      speak("Correct decision!");
    } else {
      speak("Incorrect. Review the DGMS regulatory rationale.");
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex + 1 < currentQuestions.length) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsSubmitted(false);
    } else {
      const correctCount = answers.filter((a) => a.isCorrect).length;
      const total = currentQuestions.length;
      const quizPercentage = Math.round((correctCount / total) * 100);
      const compositeScore = Math.round(quizPercentage * 0.7 + arAccuracy * 100 * 0.3);

      setQuizFinished(true);
      if (compositeScore >= 75) {
        onQuizPassed(compositeScore);
      }
    }
  };

  const correctCount = answers.filter((a) => a.isCorrect).length;
  const compositeScore = Math.round((correctCount / currentQuestions.length) * 70 + arAccuracy * 30);
  const passed = compositeScore >= 75;

  if (quizFinished) {
    return (
      <div className="gov-card" style={{ padding: '2.25rem', textAlign: 'center', maxWidth: '680px', margin: '2rem auto', borderTop: passed ? '4px solid #1E7B34' : '4px solid #9B1C1C' }}>
        <div style={{
          width: '68px',
          height: '68px',
          borderRadius: '50%',
          background: passed ? '#EAF5EC' : '#FDF2F2',
          border: `2px solid ${passed ? '#1E7B34' : '#9B1C1C'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.25rem'
        }}>
          {passed ? <Award size={34} color="#1E7B34" /> : <AlertTriangle size={34} color="#9B1C1C" />}
        </div>

        <h2 style={{ fontSize: '1.45rem', fontWeight: '800', color: passed ? '#1E7B34' : '#9B1C1C', marginBottom: '0.4rem' }}>
          {passed ? 'DGMS Statutory Assessment: PASSED' : 'Competency Standard Not Met'}
        </h2>

        <p style={{ color: '#4A5568', fontSize: '0.9rem', marginBottom: '1.75rem', lineHeight: 1.6 }}>
          {passed
            ? 'Candidate has satisfied statutory safety decision benchmarks under Mines Act 1952. Cryptographic QR certificate is being generated.'
            : 'Candidate scored below the mandatory 75% DGMS passing benchmark. Review statutory emergency instructions and retake the simulation drill.'}
        </p>

        {/* Scorecard Box */}
        <div style={{
          background: '#F8FAFC',
          border: '1px solid #CBD5E1',
          borderRadius: '4px',
          padding: '1.25rem',
          display: 'flex',
          justifyContent: 'space-around',
          marginBottom: '1.75rem'
        }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: '600' }}>Decision Accuracy</div>
            <div style={{ fontSize: '1.35rem', fontWeight: '800', color: '#0c4e7e' }}>
              {correctCount} / {currentQuestions.length}
            </div>
          </div>
          <div style={{ width: '1px', background: '#CBD5E1' }} />
          <div>
            <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: '600' }}>AR Technique Score</div>
            <div style={{ fontSize: '1.35rem', fontWeight: '800', color: '#0c4e7e' }}>
              {Math.round(arAccuracy * 100)}%
            </div>
          </div>
          <div style={{ width: '1px', background: '#CBD5E1' }} />
          <div>
            <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: '600' }}>Final Evaluation</div>
            <div style={{ fontSize: '1.35rem', fontWeight: '800', color: passed ? '#1E7B34' : '#9B1C1C' }}>
              {compositeScore}%
            </div>
          </div>
        </div>

        {passed ? (
          <div className="gov-badge-green" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
            ✓ Verified for Statutory Certificate Issuance
          </div>
        ) : (
          <button onClick={onRetake} className="gov-btn-primary" style={{ padding: '0.65rem 1.5rem' }}>
            <RotateCcw size={15} />
            <span>Retake Vocational Drill</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="gov-card" style={{ maxWidth: '780px', margin: '1.5rem auto', padding: '2rem', borderTop: '4px solid #0c4e7e' }}>
      {/* Quiz Progress & Official Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: '0.85rem',
        borderBottom: '1px solid #E2E8F0',
        marginBottom: '1.5rem',
        flexWrap: 'wrap',
        gap: '0.75rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <AshokaLionCapital size={24} color="#0c4e7e" showMotto={false} />
          <div>
            <div style={{ fontSize: '0.82rem', fontWeight: '700', color: '#0c4e7e', fontFamily: 'var(--font-heading)' }}>
              DGMS STATUTORY COMPETENCY ASSESSMENT
            </div>
            <div style={{ fontSize: '0.72rem', color: '#64748B' }}>
              Mines Act 1952 • Examination Paper
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.82rem', color: '#64748B', fontWeight: '600' }}>
            Question {currentQuestionIndex + 1} of {currentQuestions.length}
          </span>
          <button
            onClick={() => speak(q.title[language] || q.title.en)}
            className="gov-btn-secondary"
            style={{ padding: '0.25rem 0.55rem', fontSize: '0.75rem' }}
          >
            <Volume2 size={13} />
            <span>Audio</span>
          </button>
        </div>
      </div>

      {/* Question Title */}
      <h2 style={{
        fontSize: '1.15rem',
        fontWeight: '700',
        color: '#0c4e7e',
        fontFamily: 'var(--font-heading)',
        lineHeight: 1.5,
        marginBottom: '1.5rem'
      }}>
        {q.title[language] || q.title.en}
      </h2>

      {/* Options List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.75rem' }}>
        {q.options.map((opt) => {
          const isSelected = selectedOption?.id === opt.id;
          let borderCol = '#CBD5E1';
          let bgCol = '#FFFFFF';

          if (isSubmitted) {
            if (opt.isCorrect) {
              borderCol = '#1E7B34';
              bgCol = '#EAF5EC';
            } else if (isSelected && !opt.isCorrect) {
              borderCol = '#9B1C1C';
              bgCol = '#FDF2F2';
            }
          } else if (isSelected) {
            borderCol = '#0c4e7e';
            bgCol = '#EBF3FC';
          }

          return (
            <div
              key={opt.id}
              onClick={() => handleSelectOption(opt)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.85rem',
                padding: '0.9rem 1.1rem',
                borderRadius: '4px',
                border: `1.5px solid ${borderCol}`,
                background: bgCol,
                cursor: isSubmitted ? 'default' : 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{
                width: '26px',
                height: '26px',
                borderRadius: '4px',
                border: `1.5px solid ${borderCol}`,
                background: isSelected ? (isSubmitted ? (opt.isCorrect ? '#1E7B34' : '#9B1C1C') : '#0c4e7e') : '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '700',
                fontSize: '0.82rem',
                color: isSelected ? '#FFFFFF' : '#4A5568'
              }}>
                {opt.id}
              </div>
              <span style={{ fontSize: '0.92rem', color: '#1A202C', flex: 1, lineHeight: 1.4 }}>
                {opt.text[language] || opt.text.en}
              </span>
            </div>
          );
        })}
      </div>

      {/* Rationale & Decision Review */}
      {isSubmitted && (
        <div style={{
          background: selectedOption?.isCorrect ? '#EAF5EC' : '#FDF2F2',
          border: `1px solid ${selectedOption?.isCorrect ? '#B8E0C0' : '#F8B4B4'}`,
          borderRadius: '4px',
          padding: '1rem',
          marginBottom: '1.5rem'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            color: selectedOption?.isCorrect ? '#1E7B34' : '#9B1C1C',
            fontWeight: '700',
            fontSize: '0.88rem',
            marginBottom: '0.25rem'
          }}>
            {selectedOption?.isCorrect ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
            <span>{selectedOption?.isCorrect ? 'Correct Regulatory Decision' : 'DGMS Safety Violation'}</span>
          </div>
          <p style={{ fontSize: '0.84rem', color: '#4A5568', lineHeight: 1.5 }}>
            {q.options.find((o) => o.isCorrect)?.rationale}
          </p>
        </div>
      )}

      {/* Action CTA */}
      {!isSubmitted ? (
        <button
          disabled={!selectedOption}
          onClick={handleSubmitAnswer}
          className="gov-btn-primary"
          style={{ width: '100%', padding: '0.75rem', opacity: selectedOption ? 1 : 0.5 }}
        >
          Submit Answer & Verify Decision →
        </button>
      ) : (
        <button
          onClick={handleNextQuestion}
          className="gov-btn-gold"
          style={{ width: '100%', padding: '0.75rem' }}
        >
          {currentQuestionIndex + 1 < currentQuestions.length ? 'Next Question →' : 'View Evaluation Results →'}
        </button>
      )}
    </div>
  );
}
