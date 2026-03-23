"use client";

import { Mic, Square } from "lucide-react";
import { useState, useEffect, useCallback, useRef } from "react";
import { cn } from "../../lib/utils";

interface AIVoiceInputProps {
  onStart?: () => void;
  onStop?: (duration: number) => void;
  onTranscript?: (text: string) => void;
  visualizerBars?: number;
  demoMode?: boolean;
  demoInterval?: number;
  className?: string;
  lang?: string;
}

export function AIVoiceInput({
  onStart,
  onStop,
  onTranscript,
  visualizerBars = 48,
  demoMode = false,
  demoInterval = 3000,
  className,
  lang = 'en-IN'
}: AIVoiceInputProps) {
  const [submitted, setSubmitted] = useState(false);
  const [time, setTime] = useState(0);
  const [isClient, setIsClient] = useState(false);
  const [isDemo, setIsDemo] = useState(demoMode);
  const [barHeights, setBarHeights] = useState<number[]>([]);
  const recognitionRef = useRef<any>(null);
  const animFrameRef = useRef<number>(0);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Animate bars smoothly
  useEffect(() => {
    if (!submitted || !isClient) {
      setBarHeights([]);
      return;
    }
    const animate = () => {
      setBarHeights(
        Array.from({ length: visualizerBars }, () => 15 + Math.random() * 85)
      );
      animFrameRef.current = requestAnimationFrame(() => {
        setTimeout(() => { animFrameRef.current = requestAnimationFrame(animate); }, 120);
      });
    };
    animate();
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [submitted, isClient, visualizerBars]);

  // Timer
  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval>;
    if (submitted) {
      onStart?.();
      intervalId = setInterval(() => setTime(t => t + 1), 1000);
    } else {
      if (time > 0) onStop?.(time);
      setTime(0);
    }
    return () => clearInterval(intervalId);
  }, [submitted, time, onStart, onStop]);

  // Speech Recognition
  useEffect(() => {
    if (!submitted || isDemo) return;
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) return;

    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SR();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = lang;

    recognition.onresult = (event: any) => {
      const last = event.results.length - 1;
      onTranscript?.(event.results[last][0].transcript);
    };
    recognition.onerror = () => setSubmitted(false);
    recognition.onend = () => {
      if (submitted) { try { recognition.start(); } catch {} }
    };

    recognitionRef.current = recognition;
    recognition.start();
    return () => { try { recognition.stop(); } catch {} };
  }, [submitted, isDemo, lang, onTranscript]);

  // Demo mode
  useEffect(() => {
    if (!isDemo) return;
    let timeoutId: ReturnType<typeof setTimeout>;
    const run = () => {
      setSubmitted(true);
      timeoutId = setTimeout(() => {
        setSubmitted(false);
        timeoutId = setTimeout(run, 1000);
      }, demoInterval);
    };
    const initial = setTimeout(run, 100);
    return () => { clearTimeout(timeoutId); clearTimeout(initial); };
  }, [isDemo, demoInterval]);

  const formatTime = useCallback((seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }, []);

  const handleClick = () => {
    if (isDemo) { setIsDemo(false); setSubmitted(false); }
    else { setSubmitted(prev => !prev); }
  };

  return (
    <div className={cn("w-full py-4", className)}>
      <div style={{ position: 'relative', maxWidth: 560, width: '100%', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
        {/* Mic / Stop Button */}
        <button
          type="button"
          onClick={handleClick}
          style={{
            width: 72, height: 72, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: 'none', cursor: 'pointer', transition: 'all 0.3s',
            background: submitted
              ? 'linear-gradient(135deg, rgba(239,68,68,0.2), rgba(239,68,68,0.1))'
              : 'rgba(255,255,255,0.06)',
            boxShadow: submitted ? '0 0 30px rgba(239,68,68,0.3)' : 'none',
          }}
        >
          {submitted ? (
            <Square size={24} style={{ color: '#f87171' }} />
          ) : (
            <Mic size={28} style={{ color: 'rgba(255,255,255,0.7)' }} />
          )}
        </button>

        {/* Timer */}
        <span style={{
          fontFamily: 'monospace', fontSize: 16, fontWeight: 600, letterSpacing: 2,
          color: submitted ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.25)',
          transition: 'color 0.3s',
        }}>
          {formatTime(time)}
        </span>

        {/* Visualizer */}
        <div style={{
          height: 48, width: 320, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5,
        }}>
          {Array.from({ length: visualizerBars }).map((_, i) => (
            <div
              key={i}
              style={{
                width: 2.5, borderRadius: 4, transition: 'height 0.15s ease, background 0.3s',
                height: submitted && barHeights[i] ? `${barHeights[i]}%` : 3,
                background: submitted
                  ? `hsl(${240 + i * 2}, 70%, ${55 + Math.random() * 15}%)`
                  : 'rgba(255,255,255,0.08)',
              }}
            />
          ))}
        </div>

        {/* Status */}
        <p style={{ fontSize: 13, fontWeight: 500, color: submitted ? '#818cf8' : 'rgba(255,255,255,0.4)', transition: 'color 0.3s' }}>
          {submitted ? '🎙 Listening...' : 'Tap microphone to speak'}
        </p>
      </div>
    </div>
  );
}
