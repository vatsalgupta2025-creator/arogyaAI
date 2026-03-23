import { useState, useEffect, useRef } from 'react';
import { VitalReading, generateVitalStream, DEFAULT_BASELINE } from '../data/vitals';
import { PersonalBaseline, calculateBaseline, detectAnomaly, calculateStabilityScore, AnomalyResult } from '../utils/baseline';

export interface VitalsState {
  history: VitalReading[];
  current: VitalReading | null;
  baseline: PersonalBaseline;
  anomalies: AnomalyResult[];
  stabilityScore: number;
  isStreaming: boolean;
}

export function useVitals(mode: 'normal' | 'sepsis' = 'sepsis', intervalMs: number = 2000): VitalsState {
  const [history, setHistory] = useState<VitalReading[]>([]);
  const [current, setCurrent] = useState<VitalReading | null>(null);
  const [baseline, setBaseline] = useState<PersonalBaseline>({
    hr: { median: 78, q1: 74, q3: 82, iqr: 8, min: 65, max: 95 },
    spo2: { median: 95.5, q1: 95, q3: 96, iqr: 1, min: 93, max: 98 },
    temp: { median: 36.8, q1: 36.6, q3: 37.0, iqr: 0.4, min: 36.2, max: 37.4 },
    rr: { median: 16, q1: 14, q3: 18, iqr: 4, min: 12, max: 22 },
    sbp: { median: 138, q1: 132, q3: 144, iqr: 12, min: 120, max: 160 },
    dbp: { median: 88, q1: 84, q3: 92, iqr: 8, min: 76, max: 100 },
    hrv: { median: 42, q1: 36, q3: 48, iqr: 12, min: 25, max: 60 },
    calibrationProgress: 85,
    daysLearned: 12,
  });
  const [anomalies, setAnomalies] = useState<AnomalyResult[]>([]);
  const [stabilityScore, setStabilityScore] = useState(92);
  const indexRef = useRef(0);
  const streamRef = useRef<VitalReading[]>([]);

  useEffect(() => {
    // Generate a full stream upfront
    const stream = generateVitalStream(DEFAULT_BASELINE, 300, 2, mode);
    streamRef.current = stream;

    // Initialize with first 60 readings as "history"
    const initial = stream.slice(0, 60);
    setHistory(initial);
    setCurrent(initial[initial.length - 1]);
    indexRef.current = 60;

    // Calculate baseline from initial data
    const bl = calculateBaseline(initial);
    setBaseline(prev => ({ ...prev, ...bl, calibrationProgress: 85, daysLearned: 12 }));
  }, [mode]);

  useEffect(() => {
    const timer = setInterval(() => {
      const stream = streamRef.current;
      if (indexRef.current >= stream.length) {
        indexRef.current = 60; // loop
      }

      const newReading = stream[indexRef.current];
      indexRef.current++;

      setHistory(prev => {
        const updated = [...prev.slice(-120), newReading];
        
        // Fetch AI reasoning and anomaly analysis from Python ML backend
        fetch('http://localhost:5000/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ current: newReading, history: updated.slice(-30) })
        })
        .then(res => res.json())
        .then(data => {
          if (data.anomalies) {
            setAnomalies(data.anomalies);
            setStabilityScore(data.stability);
          }
        })
        .catch(e => {
          // Fallback to local logic if ML server unreachable
          const anom = detectAnomaly(newReading, baseline, newReading.context);
          setAnomalies(anom);
          setStabilityScore(calculateStabilityScore(anom));
        });

        return updated;
      });
      setCurrent(newReading);
    }, intervalMs);

    return () => clearInterval(timer);
  }, [baseline, intervalMs]);

  return { history, current, baseline, anomalies, stabilityScore, isStreaming: true };
}
