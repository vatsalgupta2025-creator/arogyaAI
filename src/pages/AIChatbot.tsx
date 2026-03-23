import { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import ReactMarkdown from 'react-markdown';
import jsPDF from 'jspdf';
import { AIVoiceInput } from '../components/ui/ai-voice-input';
import {
  Bot, Mic, Volume2, VolumeX, Download, Paperclip, CornerDownLeft,
  Globe, X, Image as ImageIcon, FileText, Sparkles, User, FileDown
} from 'lucide-react';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "AIzaSyAFO76eHf4kBLpx-VUyjAzspxd8gtnyuXU";
const genAI = new GoogleGenerativeAI(API_KEY);

const LANGUAGES = [
  { code: 'en-IN', name: 'English', flag: '🇬🇧' },
  { code: 'hi-IN', name: 'हिंदी', flag: '🇮🇳' },
  { code: 'bn-IN', name: 'বাংলা', flag: '🇮🇳' },
  { code: 'te-IN', name: 'తెలుగు', flag: '🇮🇳' },
  { code: 'mr-IN', name: 'मराठी', flag: '🇮🇳' },
  { code: 'ta-IN', name: 'தமிழ்', flag: '🇮🇳' },
  { code: 'gu-IN', name: 'ગુજરાતી', flag: '🇮🇳' },
  { code: 'ur-IN', name: 'اردو', flag: '🇮🇳' },
  { code: 'kn-IN', name: 'ಕನ್ನಡ', flag: '🇮🇳' },
  { code: 'or-IN', name: 'ଓଡ଼ିଆ', flag: '🇮🇳' },
  { code: 'ml-IN', name: 'മലയാളം', flag: '🇮🇳' },
  { code: 'pa-IN', name: 'ਪੰਜਾਬੀ', flag: '🇮🇳' },
  { code: 'as-IN', name: 'অসমীয়া', flag: '🇮🇳' },
  { code: 'mai-IN', name: 'मैथिली', flag: '🇮🇳' },
  { code: 'sat-IN', name: 'ᱥᱟᱱᱛᱟᱲᱤ', flag: '🇮🇳' },
  { code: 'ks-IN', name: 'کأشُر', flag: '🇮🇳' },
  { code: 'sd-IN', name: 'سنڌي', flag: '🇮🇳' },
  { code: 'ne-IN', name: 'नेपाली', flag: '🇮🇳' },
  { code: 'kok-IN', name: 'कोंकणी', flag: '🇮🇳' },
  { code: 'doi-IN', name: 'डोगरी', flag: '🇮🇳' },
  { code: 'mni-IN', name: 'মৈতৈলোন্', flag: '🇮🇳' },
  { code: 'brx-IN', name: 'बड़ो', flag: '🇮🇳' },
];

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  attachments?: { name: string; type: string; url: string }[];
}

const QUICK_OPTIONS = [
  "🤒 Common Cold / Fever",
  "💓 High Blood Pressure",
  "🩸 Diabetes Management",
  "🔥 Acid Reflux / GERD",
  "🧠 Migraine / Headache",
  "🫁 Asthma / Breathing",
  "🦴 Joint Pain / Arthritis",
  "🧴 Skin Allergy / Rash",
];

export default function AIChatbot() {
  const [userProfile, setUserProfile] = useState<{ name: string; age: number; sex: string } | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('en-IN');
  const [showLangPicker, setShowLangPicker] = useState(false);
  const [attachments, setAttachments] = useState<{ name: string; type: string; url: string }[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showVoiceOverlay, setShowVoiceOverlay] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');

  // Profile form state
  const [profileName, setProfileName] = useState('');
  const [profileAge, setProfileAge] = useState('');
  const [profileSex, setProfileSex] = useState('Male');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    return () => { window.speechSynthesis.cancel(); };
  }, []);

  const speakText = (text: string) => {
    if (isSpeaking) { window.speechSynthesis.cancel(); setIsSpeaking(false); return; }
    const utterance = new SpeechSynthesisUtterance(text.replace(/[#*`_\[\]]/g, ''));
    utterance.lang = selectedLanguage;
    utterance.onend = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleFileAttach = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const newAtts = Array.from(e.target.files).map(f => ({
      name: f.name, type: f.type.startsWith('image/') ? 'image' : 'file', url: URL.createObjectURL(f),
    }));
    setAttachments(prev => [...prev, ...newAtts]);
    e.target.value = '';
  };

  const removeAttachment = (i: number) => setAttachments(prev => prev.filter((_, idx) => idx !== i));

  // Handle profile submission
  const handleProfileSubmit = () => {
    if (!profileName.trim() || !profileAge) return;

    const profile = {
      name: profileName.trim(),
      age: parseInt(profileAge),
      sex: profileSex
    };
    setUserProfile(profile);

    // Add welcome message with user info
    const welcomeMsg: ChatMessage = {
      id: 'welcome',
      role: 'assistant',
      content: `👋 Namaste, **${profile.name}**! I'm **Arogya AI**, your personal health copilot.\n\nI'm ready to help you with health concerns. You are **${profile.age} years old** and **${profile.sex === 'Male' ? 'Male' : 'Female'}**.\n\nTell me what you're experiencing, or tap a quick option below. I'll provide **personalized health advice, diet plans, and doctor recommendations** — in your preferred language! 🌐`,
      timestamp: new Date()
    };
    setMessages([welcomeMsg]);
  };

  const downloadLastPlan = useCallback(() => {
    const plan = [...messages].reverse().find(m => m.role === 'assistant' && m.content.length > 200);
    if (!plan) return;
    const blob = new Blob([plan.content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url;
    a.download = `Arogya_Plan_${(userProfile?.name || 'User').replace(/\s+/g, '_')}.md`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [messages]);

  // ── PDF Export ──
  const downloadChatAsPDF = useCallback(() => {
    if (messages.length <= 1) return;
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageW = doc.internal.pageSize.getWidth();
    const margin = 15;
    const maxW = pageW - margin * 2;
    let y = 20;

    doc.setFontSize(18);
    doc.setTextColor(99, 102, 241);
    doc.text('Arogya AI — Chat Export', margin, y);
    y += 8;
    doc.setFontSize(9);
    doc.setTextColor(120, 120, 120);
    doc.text(`Patient: ${userProfile?.name || 'User'} (${userProfile?.age || 0}y, ${userProfile?.sex || 'N/A'}) | Exported: ${new Date().toLocaleString()}`, margin, y);
    y += 10;

    messages.forEach((msg) => {
      // Safely skip the static welcome intro if desired, or keep it. Let's keep it for context.
      const isUser = msg.role === 'user';

      doc.setFontSize(10);
      // Indigo for AI, Cyan for User
      if (isUser) {
        doc.setTextColor(6, 182, 212);
      } else {
        doc.setTextColor(99, 102, 241);
      }
      doc.setFont('helvetica', 'bold');
      doc.text(isUser ? 'You:' : 'Arogya AI:', margin, y);
      y += 6;

      doc.setFontSize(10);
      doc.setTextColor(40, 40, 40);
      doc.setFont('helvetica', 'normal');

      // Strip markdown for the PDF
      const cleanContent = msg.content.replace(/[#*`_]/g, '');
      const lines = doc.splitTextToSize(cleanContent, maxW);

      lines.forEach((line: string) => {
        if (y > 280) { // Page break near the bottom margin
          doc.addPage();
          y = 20;
        }
        doc.text(line, margin, y);
        y += 6;
      });
      y += 4; // Space between messages
    });

    const fileName = `Arogya_Chat_${(userProfile?.name || 'User').replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
  }, [messages, userProfile]);

  const sendMessage = async (text?: string) => {
    const msg = text || inputValue.trim();
    if (!msg && attachments.length === 0) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(), role: 'user', content: msg || '(attached files)',
      timestamp: new Date(), attachments: attachments.length > 0 ? [...attachments] : undefined,
    };
    setMessages(prev => [...prev, userMsg]);
    setInputValue(''); setAttachments([]); setIsGenerating(true);

    const langName = LANGUAGES.find(l => l.code === selectedLanguage)?.name || 'English';
    const userName = userProfile?.name || 'User';
    const userAge = userProfile?.age || 0;
    const userSex = userProfile?.sex || 'Not specified';
    const prompt = `You are Arogya AI, a warm, empathetic Indian clinical health assistant.
Patient: ${userName}, ${userAge}y, ${userSex}.
Patient says: "${msg}"
${userMsg.attachments ? '(Patient attached medical reports/images.)' : ''}
Respond ENTIRELY in ${langName}. Use Markdown.
If describing symptoms, provide: 1) Brief analysis 2) Daily routine 3) Diet plan 4) Doctor recommendation 5) Suggested checkups.
If a general question, answer helpfully. Be professional, caring, use emojis sparingly.`;

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      const result = await model.generateContent(prompt);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(), role: 'assistant',
        content: result.response.text(), timestamp: new Date(),
      }]);
    } catch {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(), role: 'assistant',
        content: '⚠️ Sorry, I encountered an error. Please try again or check your API quota.',
        timestamp: new Date(),
      }]);
    } finally { setIsGenerating(false); }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  // Voice transcript handler — accumulates text while overlay is open
  const handleVoiceTranscript = useCallback((text: string) => {
    setVoiceTranscript(prev => prev + (prev ? ' ' : '') + text);
  }, []);

  // When voice overlay closes, push transcript to input
  const closeVoiceOverlay = () => {
    if (voiceTranscript.trim()) {
      setInputValue(prev => prev + (prev ? ' ' : '') + voiceTranscript.trim());
    }
    setVoiceTranscript('');
    setShowVoiceOverlay(false);
  };

  // Send voice message directly from overlay
  const sendVoiceMessage = () => {
    if (voiceTranscript.trim()) {
      sendMessage(voiceTranscript.trim());
    }
    setVoiceTranscript('');
    setShowVoiceOverlay(false);
  };

  // --- Inline styles ---
  const iconBtn = (active = false): React.CSSProperties => ({
    width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
    borderRadius: 10, border: 'none', cursor: 'pointer', transition: 'all 0.2s',
    background: active ? 'rgba(239, 68, 68, 0.15)' : 'rgba(255,255,255,0.05)',
    color: active ? '#f87171' : 'rgba(255,255,255,0.5)',
  });

  const headerIconBtn: React.CSSProperties = {
    ...iconBtn(), border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10,
  };

  // Show profile setup if no profile
  if (!userProfile) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - 88px)',
        maxWidth: 500,
        margin: '0 auto',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24
      }}>
        {/* Logo */}
        <div style={{
          width: 80,
          height: 80,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #6366f1, #a855f7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 24,
          boxShadow: '0 8px 32px rgba(99,102,241,0.4)'
        }}>
          <Bot size={40} color="white" />
        </div>

        <h1 style={{ fontSize: 28, fontWeight: 700, color: 'white', marginBottom: 8, textAlign: 'center' }}>
          Welcome to Arogya AI
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: 32, textAlign: 'center' }}>
          Your personal health copilot
        </p>

        {/* Profile Form */}
        <div style={{
          width: '100%',
          background: 'rgba(255,255,255,0.05)',
          borderRadius: 16,
          padding: 24,
          border: '1px solid rgba(255,255,255,0.1)'
        }}>
          <h3 style={{ color: 'white', fontSize: 16, marginBottom: 20, textAlign: 'center' }}>
            Tell us about yourself
          </h3>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: 13, marginBottom: 6 }}>
              Your Name
            </label>
            <input
              type="text"
              value={profileName}
              onChange={(e) => setProfileName(e.target.value)}
              placeholder="Enter your name"
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: 10,
                border: '1px solid rgba(255,255,255,0.15)',
                background: 'rgba(0,0,0,0.3)',
                color: 'white',
                fontSize: 14,
                outline: 'none'
              }}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: 13, marginBottom: 6 }}>
              Your Age
            </label>
            <input
              type="number"
              value={profileAge}
              onChange={(e) => setProfileAge(e.target.value)}
              placeholder="Enter your age"
              min="1"
              max="150"
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: 10,
                border: '1px solid rgba(255,255,255,0.15)',
                background: 'rgba(0,0,0,0.3)',
                color: 'white',
                fontSize: 14,
                outline: 'none'
              }}
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: 13, marginBottom: 6 }}>
              Gender
            </label>
            <div style={{ display: 'flex', gap: 12 }}>
              {['Male', 'Female'].map((sex) => (
                <button
                  key={sex}
                  onClick={() => setProfileSex(sex)}
                  style={{
                    flex: 1,
                    padding: '12px 16px',
                    borderRadius: 10,
                    border: profileSex === sex ? '1px solid #6366f1' : '1px solid rgba(255,255,255,0.15)',
                    background: profileSex === sex ? 'rgba(99,102,241,0.2)' : 'rgba(0,0,0,0.3)',
                    color: profileSex === sex ? '#818cf8' : 'rgba(255,255,255,0.7)',
                    fontSize: 14,
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  {sex}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleProfileSubmit}
            disabled={!profileName.trim() || !profileAge}
            style={{
              width: '100%',
              padding: '14px 24px',
              borderRadius: 12,
              border: 'none',
              background: profileName.trim() && profileAge
                ? 'linear-gradient(135deg, #6366f1, #a855f7)'
                : 'rgba(255,255,255,0.1)',
              color: profileName.trim() && profileAge ? 'white' : 'rgba(255,255,255,0.4)',
              fontSize: 15,
              fontWeight: 600,
              cursor: profileName.trim() && profileAge ? 'pointer' : 'not-allowed',
              boxShadow: profileName.trim() && profileAge ? '0 4px 20px rgba(99,102,241,0.4)' : 'none'
            }}
          >
            Get Started →
          </button>
        </div>

        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 24, textAlign: 'center' }}>
          Your data is kept private and secure
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 88px)', maxWidth: 900, margin: '0 auto', position: 'relative' }}>

      {/* ═══════════ VOICE INPUT OVERLAY ═══════════ */}
      {showVoiceOverlay && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 50,
          background: 'rgba(6,10,20,0.92)', backdropFilter: 'blur(24px)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          borderRadius: 16,
        }}>
          {/* Close button */}
          <button onClick={closeVoiceOverlay}
            style={{
              position: 'absolute', top: 16, right: 16, width: 36, height: 36, borderRadius: 12,
              background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)',
              color: 'rgba(255,255,255,0.6)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
            <X size={18} />
          </button>

          {/* Language badge */}
          <div style={{
            position: 'absolute', top: 20, left: 20, display: 'flex', alignItems: 'center', gap: 6,
            padding: '6px 14px', borderRadius: 20, background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.2)',
            fontSize: 12, color: '#818cf8', fontWeight: 500
          }}>
            <Globe size={13} /> {LANGUAGES.find(l => l.code === selectedLanguage)?.name}
          </div>

          {/* Voice Input Component */}
          <AIVoiceInput
            lang={selectedLanguage}
            onTranscript={handleVoiceTranscript}
            onStart={() => { }}
            onStop={() => { }}
            visualizerBars={48}
          />

          {/* Live transcript preview */}
          {voiceTranscript && (
            <div style={{
              maxWidth: 500, width: '90%', marginTop: 16, padding: '14px 20px',
              borderRadius: 16, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
              fontSize: 14, color: 'rgba(255,255,255,0.8)', lineHeight: 1.6,
              maxHeight: 120, overflowY: 'auto', textAlign: 'center',
            }}>
              "{voiceTranscript}"
            </div>
          )}

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
            <button onClick={closeVoiceOverlay}
              style={{
                padding: '10px 24px', borderRadius: 12, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: 500, cursor: 'pointer'
              }}>
              Add to text
            </button>
            <button onClick={sendVoiceMessage}
              disabled={!voiceTranscript.trim()}
              style={{
                padding: '10px 24px', borderRadius: 12,
                background: voiceTranscript.trim() ? 'linear-gradient(135deg, #6366f1, #a855f7)' : 'rgba(255,255,255,0.06)',
                border: 'none', color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                boxShadow: voiceTranscript.trim() ? '0 4px 14px rgba(99,102,241,0.3)' : 'none',
                opacity: voiceTranscript.trim() ? 1 : 0.4, transition: 'all 0.2s'
              }}>
              Send now ↵
            </button>
          </div>
        </div>
      )}

      {/* ─── Header ─── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 14, background: 'linear-gradient(135deg, #6366f1, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 15px rgba(99,102,241,0.3)' }}>
            <Bot size={22} color="white" />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'white' }}>Arogya AI</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>Multilingual Health Copilot • Online</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Language Picker */}
          <div style={{ position: 'relative' }}>
            <button onClick={() => setShowLangPicker(!showLangPicker)} style={{ ...headerIconBtn, width: 'auto', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,0.7)' }}>
              <Globe size={14} /> {LANGUAGES.find(l => l.code === selectedLanguage)?.name}
            </button>
            {showLangPicker && (
              <div style={{ position: 'absolute', right: 0, marginTop: 8, width: 200, maxHeight: 320, overflowY: 'auto', borderRadius: 14, background: 'rgba(15,23,42,0.98)', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 20px 60px rgba(0,0,0,0.5)', zIndex: 99 }}>
                {LANGUAGES.map(l => (
                  <button key={l.code} onClick={() => { setSelectedLanguage(l.code); setShowLangPicker(false); }}
                    style={{
                      width: '100%', textAlign: 'left', padding: '10px 16px', fontSize: 13, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, transition: 'background 0.15s',
                      background: selectedLanguage === l.code ? 'rgba(99,102,241,0.15)' : 'transparent',
                      color: selectedLanguage === l.code ? '#818cf8' : 'rgba(255,255,255,0.65)',
                    }}>
                    <span>{l.flag}</span> {l.name}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button onClick={downloadLastPlan} style={headerIconBtn} title="Download plan"><Download size={16} /></button>
          <button onClick={downloadChatAsPDF} style={{ ...headerIconBtn, color: messages.length > 1 ? '#34d399' : headerIconBtn.color }} title="Export chat PDF"><FileDown size={16} /></button>
          <button onClick={() => { const last = [...messages].reverse().find(m => m.role === 'assistant'); if (last) speakText(last.content); }}
            style={{ ...headerIconBtn, background: isSpeaking ? 'rgba(251,191,36,0.15)' : headerIconBtn.background, color: isSpeaking ? '#fbbf24' : headerIconBtn.color }}
            title={isSpeaking ? 'Stop' : 'Read aloud'}>
            {isSpeaking ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
        </div>
      </div>

      {/* ─── Messages ─── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        {messages.map(msg => (
          <div key={msg.id} style={{ display: 'flex', gap: 10, flexDirection: msg.role === 'user' ? 'row-reverse' : 'row', alignItems: 'flex-start' }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              background: msg.role === 'user' ? 'linear-gradient(135deg, #06b6d4, #3b82f6)' : 'linear-gradient(135deg, #6366f1, #a855f7)'
            }}>
              {msg.role === 'user' ? <User size={14} color="white" /> : <Sparkles size={14} color="white" />}
            </div>
            <div style={{
              maxWidth: '78%', borderRadius: 18, padding: '14px 18px',
              background: msg.role === 'user' ? 'linear-gradient(135deg, rgba(6,182,212,0.12), rgba(59,130,246,0.12))' : 'rgba(255,255,255,0.04)',
              border: msg.role === 'user' ? '1px solid rgba(6,182,212,0.2)' : '1px solid rgba(255,255,255,0.08)',
              borderTopRightRadius: msg.role === 'user' ? 4 : 18, borderTopLeftRadius: msg.role === 'user' ? 18 : 4,
            }}>
              {msg.attachments && msg.attachments.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
                  {msg.attachments.map((att, i) => (
                    <div key={i} style={{ borderRadius: 10, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                      {att.type === 'image'
                        ? <img src={att.url} alt={att.name} style={{ height: 100, width: 'auto', objectFit: 'cover', borderRadius: 10 }} />
                        : <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', background: 'rgba(255,255,255,0.05)', fontSize: 11, color: 'rgba(255,255,255,0.5)' }}><FileText size={14} /> {att.name}</div>
                      }
                    </div>
                  ))}
                </div>
              )}
              <div className="custom-prose" style={{ fontSize: 14, color: 'rgba(255,255,255,0.85)', lineHeight: 1.7 }}>
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              </div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', marginTop: 8 }}>
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}

        {isGenerating && (
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Sparkles size={14} color="white" />
            </div>
            <div style={{ borderRadius: 18, borderTopLeftRadius: 4, padding: '14px 18px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ display: 'flex', gap: 4 }}>
                  {[0, 1, 2].map(i => (
                    <span key={i} style={{
                      width: 8, height: 8, borderRadius: '50%', background: '#818cf8', display: 'inline-block',
                      animation: 'bounce 1.4s infinite ease-in-out both', animationDelay: `${i * 0.16}s`
                    }} />
                  ))}
                </div>
                <span style={{ fontSize: 12, color: 'rgba(129,140,248,0.5)' }}>Analyzing...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* ─── Quick Options ─── */}
      {messages.length <= 1 && !isGenerating && (
        <div style={{ padding: '0 16px 12px' }}>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginBottom: 8 }}>Quick start — tap a condition:</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {QUICK_OPTIONS.map(opt => (
              <button key={opt} onClick={() => sendMessage(opt.replace(/^.+?\s/, ''))}
                style={{
                  padding: '7px 14px', borderRadius: 20, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
                  fontSize: 12, color: 'rgba(255,255,255,0.65)', cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap'
                }}>
                {opt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ─── Attachment Preview ─── */}
      {attachments.length > 0 && (
        <div style={{ padding: '0 16px 8px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, padding: 12, borderRadius: 14, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
            {attachments.map((att, i) => (
              <div key={i} style={{ position: 'relative' }}>
                {att.type === 'image'
                  ? <img src={att.url} alt={att.name} style={{ height: 56, width: 56, objectFit: 'cover', borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)' }} />
                  : <div style={{ height: 56, width: 80, display: 'flex', alignItems: 'center', gap: 4, padding: '0 8px', background: 'rgba(255,255,255,0.04)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)', fontSize: 10, color: 'rgba(255,255,255,0.5)' }}>
                    <FileText size={14} /><span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{att.name}</span>
                  </div>
                }
                <button onClick={() => removeAttachment(i)} style={{ position: 'absolute', top: -6, right: -6, width: 18, height: 18, borderRadius: '50%', background: '#ef4444', color: 'white', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 10 }}>
                  <X size={10} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── Input Bar ─── */}
      <div style={{ padding: '0 16px 16px' }}>
        <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
          style={{ borderRadius: 16, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(20px)', padding: 4, transition: 'border-color 0.2s' }}>
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe your symptoms, ask a health question..."
            rows={1}
            style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', resize: 'none', padding: '12px 14px', fontSize: 14, color: 'white', fontFamily: 'inherit', minHeight: 44 }}
          />
          <div style={{ display: 'flex', alignItems: 'center', padding: '4px 8px 8px' }}>
            <input ref={fileInputRef} type="file" accept="image/*,.pdf,.doc,.docx" multiple style={{ display: 'none' }} onChange={handleFileAttach} />
            <button type="button" onClick={() => fileInputRef.current?.click()} style={iconBtn()}><Paperclip size={16} /></button>
            <button type="button" onClick={() => fileInputRef.current?.click()} style={iconBtn()}><ImageIcon size={16} /></button>

            {/* Voice Input — opens full overlay */}
            <button type="button" onClick={() => { setVoiceTranscript(''); setShowVoiceOverlay(true); }}
              style={{ ...iconBtn(), background: 'rgba(99,102,241,0.1)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.2)' }}
              title="Voice input">
              <Mic size={16} />
            </button>

            <button type="submit" disabled={isGenerating || (!inputValue.trim() && attachments.length === 0)}
              style={{
                marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6, padding: '8px 18px', borderRadius: 12,
                background: 'linear-gradient(135deg, #6366f1, #a855f7)', color: 'white', border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(99,102,241,0.3)', opacity: (isGenerating || (!inputValue.trim() && attachments.length === 0)) ? 0.4 : 1, transition: 'opacity 0.2s'
              }}>
              Send <CornerDownLeft size={14} />
            </button>
          </div>
        </form>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
