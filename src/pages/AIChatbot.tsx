import { useState, useRef, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { GoogleGenerativeAI } from '@google/generative-ai';
import ReactMarkdown from 'react-markdown';
import { Bot, Mic, MicOff, Volume2, Download, Send, Globe, AlertCircle, FileText } from 'lucide-react';
import { PATIENT } from '../data/patient';

// Using the provided Gemini API Key
const API_KEY = "AIzaSyBvsVcbx23RQwFa8nrMZ-7TuNZC7vvBAqg";
const genAI = new GoogleGenerativeAI(API_KEY);

const LANGUAGES = [
  { code: 'en-IN', name: 'English (India)' },
  { code: 'hi-IN', name: 'Hindi (हिंदी)' },
  { code: 'bn-IN', name: 'Bengali (বাংলা)' },
  { code: 'te-IN', name: 'Telugu (తెలుగు)' },
  { code: 'mr-IN', name: 'Marathi (मराठी)' },
  { code: 'ta-IN', name: 'Tamil (தமிழ்)' },
  { code: 'gu-IN', name: 'Gujarati (ગુજરાતી)' },
  { code: 'ur-IN', name: 'Urdu (اردو)' },
  { code: 'kn-IN', name: 'Kannada (ಕನ್ನಡ)' },
  { code: 'or-IN', name: 'Odia (ଓଡ଼ିଆ)' },
  { code: 'ml-IN', name: 'Malayalam (മലയാളം)' },
  { code: 'pa-IN', name: 'Punjabi (ਪੰਜਾਬੀ)' },
  { code: 'as-IN', name: 'Assamese (অসমীয়া)' },
  { code: 'mai-IN', name: 'Maithili (मैथिली)' },
  { code: 'sat-IN', name: 'Santali (ᱥᱟᱱᱛᱟᱲᱤ)' },
  { code: 'ks-IN', name: 'Kashmiri (کأشُر)' }
];

const COMMON_DISEASES = [
  "Common Cold / Viral Fever",
  "High Blood Pressure (Hypertension)",
  "Diabetes Management",
  "Acid Reflux / GERD",
  "Migraine / Severe Headache",
  "Asthma / Breathing Issues",
  "Joint Pain / Arthritis",
  "Other (Specify Below)"
];

export default function AIChatbot() {
  const [selectedLanguage, setSelectedLanguage] = useState('en-IN');
  const [selectedDisease, setSelectedDisease] = useState('');
  const [customProblem, setCustomProblem] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState('');
  const [error, setError] = useState('');
  
  // Speech states
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  
  // Initialize Speech Recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      
      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setCustomProblem(prev => prev + ' ' + transcript);
        setIsListening(false);
      };
      
      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
        setError(`Microphone error: ${event.error}`);
      };
      
      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    } else {
      console.warn("Speech recognition not supported in this browser.");
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      window.speechSynthesis.cancel(); // stop TTS on unmount
    };
  }, []);

  const toggleListen = () => {
    if (!recognitionRef.current) {
      setError("Speech recognition is not supported in your browser.");
      return;
    }
    
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setError('');
      if (selectedDisease !== 'Other (Specify Below)') {
        setSelectedDisease('Other (Specify Below)');
      }
      recognitionRef.current.lang = selectedLanguage;
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const handleGenerate = async () => {
    const targetProblem = selectedDisease === 'Other (Specify Below)' ? customProblem : selectedDisease;
    if (!targetProblem) {
      setError("Please select a condition or describe your problem.");
      return;
    }

    setIsGenerating(true);
    setError('');
    setGeneratedPlan('');
    
    const languageName = LANGUAGES.find(l => l.code === selectedLanguage)?.name || 'English';

    const prompt = `You are Arogya AI, an empathetic, highly advanced clinical assistant. 
Patient Context: 
- Name: ${PATIENT.name}
- Age: ${PATIENT.age}
- Gender: ${PATIENT.sex}
- Pre-existing Conditions: ${PATIENT.conditions.join(', ')}

The patient has reported the following current problem/condition: "${targetProblem}".

Task: Act as a specialist doctor. Generate a comprehensive routine and diet plan tailored for this patient to help manage this specific condition. 
IMPORTANT: The entire response MUST be written fluently in the following language: ${languageName}.

Include the following sections clearly formatted using Markdown (with # and ## headers, bullet points, and bold text):
1. Condition Overview & Immediate Advice (A brief empathetic analysis)
2. Recommended Daily Routine (Morning to Night schedule)
3. Diet Plan ( Foods to eat, foods to avoid, and a sample meal plan)
4. Doctor Recommendations (What kind of specialist should they consult? E.g., Cardiologist, ENT)
5. Suggested Medical Checkups / Hospital Visits (What labs/tests should they ask for?)

Do not include any English text if the requested language is not English, except for universally recognized medical terms if necessary. Keep the tone highly professional, caring, and encouraging.`;

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      setGeneratedPlan(response.text());
    } catch (err: any) {
      console.error("Gemini API Error:", err);
      setError("Failed to generate the plan. Please check your network or API quota.");
    } finally {
      setIsGenerating(false);
    }
  };

  const readAloud = () => {
    if (!generatedPlan) return;
    
    // Stop any ongoing speech
    window.speechSynthesis.cancel();
    
    // Strip markdown formatting approximately for cleaner speech
    const cleanText = generatedPlan.replace(/[#*`_]/g, '');
    
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = selectedLanguage;
    window.speechSynthesis.speak(utterance);
  };

  const downloadPlan = () => {
    if (!generatedPlan) return;
    const blob = new Blob([generatedPlan], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Arogya_Care_Plan_${PATIENT.name.replace(/\s+/g, '_')}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto pb-10">
      <div className="flex items-center gap-4 border-b border-white/10 pb-6">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center border border-indigo-500/30">
          <Bot className="text-indigo-400" size={28} />
        </div>
        <div>
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-200 to-indigo-400">
            Arogya Multi-Modal AI Assistant
          </h1>
          <p className="text-sm text-indigo-300/60 mt-1">
            Personalized multilingual routines, diets & clinical recommendations
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel: Inputs */}
        <div className="flex flex-col gap-6 lg:col-span-1">
          {/* Language Selection */}
          <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl">
            <label className="flex items-center gap-2 text-sm font-semibold text-white/80 mb-3">
              <Globe size={16} className="text-indigo-400" />
              Select Language
            </label>
            <select
              value={selectedLanguage}
              onChange={(e) => {
                 setSelectedLanguage(e.target.value);
                 window.speechSynthesis.cancel(); // Stop TTS if language changes
              }}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500/50 appearance-none"
              style={{ colorScheme: 'dark' }}
            >
              {LANGUAGES.map(l => (
                <option key={l.code} value={l.code} className="bg-slate-900">{l.name}</option>
              ))}
            </select>
            <p className="text-xs text-white/40 mt-2">
              The AI will read, listen, and generate plans in this chosen language.
            </p>
          </div>

          {/* Condition Selection */}
          <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl flex-1">
            <label className="flex items-center gap-2 text-sm font-semibold text-white/80 mb-3">
              <AlertCircle size={16} className="text-rose-400" />
              Primary Concern / Diagnosis
            </label>
            <select
              value={selectedDisease}
              onChange={(e) => setSelectedDisease(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-rose-500/50 appearance-none mb-4"
              style={{ colorScheme: 'dark' }}
            >
              <option value="" disabled className="bg-slate-900">Select Medical Condition</option>
              {COMMON_DISEASES.map(d => (
                <option key={d} value={d} className="bg-slate-900">{d}</option>
              ))}
            </select>

            {selectedDisease === 'Other (Specify Below)' && (
              <div className="relative mt-2">
                <textarea
                  value={customProblem}
                  onChange={(e) => setCustomProblem(e.target.value)}
                  placeholder="Describe your symptoms or condition..."
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-indigo-500/50 min-h-[120px] resize-none"
                />
                <button
                  onClick={toggleListen}
                  className={`absolute bottom-3 right-3 p-2 rounded-full transition-all ${isListening ? 'bg-rose-500 text-white animate-pulse' : 'bg-white/10 text-white/60 hover:bg-white/20'}`}
                  title="Speak (Voice Typing)"
                >
                  {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                </button>
              </div>
            )}

            {error && (
              <div className="mt-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
                {error}
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={isGenerating || (!selectedDisease)}
              className="mt-6 w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 font-semibold text-white shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_30px_rgba(99,102,241,0.5)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <SparklesIcon /> Create Care Plan
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Panel: AI Generation Output */}
        <div className="lg:col-span-2 relative min-h-[500px] flex flex-col">
          <div className="w-full h-full rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl flex flex-col overflow-hidden">
            
            {/* Header / Actions */}
            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-black/20">
              <div className="flex items-center gap-2 text-white/80 font-semibold">
                <FileText size={18} className="text-emerald-400" />
                AI Generated Care Plan
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={readAloud}
                  disabled={!generatedPlan}
                  className="p-2 rounded-lg bg-white/5 text-white/70 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  title="Read Aloud (TTS)"
                >
                  <Volume2 size={18} />
                </button>
                <button
                  onClick={downloadPlan}
                  disabled={!generatedPlan}
                  className="p-2 rounded-lg bg-white/5 text-white/70 hover:bg-emerald-500/20 hover:text-emerald-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  title="Download Plan Markdown"
                >
                  <Download size={18} />
                </button>
              </div>
            </div>

            {/* Markdown Content Area */}
            <div className="flex-1 p-6 overflow-y-auto w-full custom-scrollbar">
              {!isGenerating && !generatedPlan ? (
                <div className="h-full flex flex-col items-center justify-center text-white/30 p-10 text-center">
                  <Bot size={48} className="mb-4 opacity-50 stroke-[1.5]" />
                  <p className="text-lg">Ready to analyze.</p>
                  <p className="text-sm mt-2 max-w-md">Select your primary concern and language to instantly generate a comprehensive routine, dietary plan, and specialist recommendations.</p>
                </div>
              ) : isGenerating ? (
                <div className="h-full flex flex-col items-center justify-center text-indigo-400 p-10">
                  <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mb-6" />
                  <p className="animate-pulse font-medium text-lg">Synthesizing clinical knowledge base...</p>
                  <p className="text-sm text-indigo-300/50 mt-2">Formulating diet and routine in {LANGUAGES.find(l => l.code === selectedLanguage)?.name}.</p>
                </div>
              ) : (
                <div className="custom-prose text-white/80">
                  <ReactMarkdown>{generatedPlan}</ReactMarkdown>
                </div>
              )}
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}

function SparklesIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
      <path d="M5 3v4M3 5h4M19 3v4M17 5h4M5 19v4M3 21h4"/>
    </svg>
  );
}
