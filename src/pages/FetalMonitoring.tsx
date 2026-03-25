import { useState, useEffect, useRef, useCallback } from 'react';
import { Heart, Activity, AlertTriangle, Waves, Zap, Signal, PlayCircle, StopCircle, RefreshCw, Database } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

// ── Dataset record ────────────────────────────────────────────────────────────
interface DatasetRecord {
  heartRate: number;
  oxygenSat: number;
  systolic: number;
  diastolic: number;
  temperature: number;
  hrv: number;
  risk: 'High Risk' | 'Low Risk';
}

// ── Parse embedded CSV rows (first 300 records) ───────────────────────────────
const RAW_DATASET: DatasetRecord[] = [
  { heartRate: 60, oxygenSat: 95.7, systolic: 124, diastolic: 86, temperature: 36.86, hrv: 0.121, risk: 'High Risk' },
  { heartRate: 63, oxygenSat: 96.7, systolic: 126, diastolic: 84, temperature: 36.51, hrv: 0.117, risk: 'High Risk' },
  { heartRate: 63, oxygenSat: 98.5, systolic: 131, diastolic: 78, temperature: 37.05, hrv: 0.053, risk: 'Low Risk' },
  { heartRate: 99, oxygenSat: 95.0, systolic: 118, diastolic: 72, temperature: 36.65, hrv: 0.064, risk: 'High Risk' },
  { heartRate: 69, oxygenSat: 98.6, systolic: 138, diastolic: 76, temperature: 36.97, hrv: 0.118, risk: 'High Risk' },
  { heartRate: 79, oxygenSat: 95.9, systolic: 130, diastolic: 70, temperature: 36.88, hrv: 0.104, risk: 'Low Risk' },
  { heartRate: 81, oxygenSat: 99.4, systolic: 118, diastolic: 84, temperature: 37.27, hrv: 0.056, risk: 'High Risk' },
  { heartRate: 96, oxygenSat: 97.1, systolic: 135, diastolic: 77, temperature: 36.85, hrv: 0.073, risk: 'High Risk' },
  { heartRate: 83, oxygenSat: 98.6, systolic: 111, diastolic: 84, temperature: 36.04, hrv: 0.099, risk: 'Low Risk' },
  { heartRate: 66, oxygenSat: 97.9, systolic: 131, diastolic: 77, temperature: 36.96, hrv: 0.081, risk: 'High Risk' },
  { heartRate: 84, oxygenSat: 98.2, systolic: 119, diastolic: 84, temperature: 36.28, hrv: 0.078, risk: 'Low Risk' },
  { heartRate: 84, oxygenSat: 98.0, systolic: 137, diastolic: 83, temperature: 36.53, hrv: 0.102, risk: 'Low Risk' },
  { heartRate: 72, oxygenSat: 96.6, systolic: 112, diastolic: 76, temperature: 37.24, hrv: 0.149, risk: 'High Risk' },
  { heartRate: 61, oxygenSat: 96.5, systolic: 112, diastolic: 80, temperature: 36.51, hrv: 0.111, risk: 'High Risk' },
  { heartRate: 98, oxygenSat: 98.7, systolic: 127, diastolic: 87, temperature: 37.26, hrv: 0.138, risk: 'High Risk' },
  { heartRate: 99, oxygenSat: 100, systolic: 121, diastolic: 74, temperature: 36.92, hrv: 0.067, risk: 'High Risk' },
  { heartRate: 83, oxygenSat: 96.1, systolic: 113, diastolic: 86, temperature: 37.22, hrv: 0.061, risk: 'Low Risk' },
  { heartRate: 84, oxygenSat: 97.6, systolic: 127, diastolic: 89, temperature: 36.15, hrv: 0.117, risk: 'Low Risk' },
  { heartRate: 77, oxygenSat: 96.2, systolic: 137, diastolic: 73, temperature: 36.81, hrv: 0.058, risk: 'Low Risk' },
  { heartRate: 97, oxygenSat: 98.0, systolic: 129, diastolic: 87, temperature: 37.47, hrv: 0.052, risk: 'High Risk' },
  { heartRate: 85, oxygenSat: 98.3, systolic: 126, diastolic: 85, temperature: 37.16, hrv: 0.096, risk: 'High Risk' },
  { heartRate: 73, oxygenSat: 99.9, systolic: 135, diastolic: 84, temperature: 36.18, hrv: 0.114, risk: 'Low Risk' },
  { heartRate: 68, oxygenSat: 95.6, systolic: 114, diastolic: 73, temperature: 36.22, hrv: 0.068, risk: 'High Risk' },
  { heartRate: 69, oxygenSat: 97.7, systolic: 130, diastolic: 87, temperature: 36.96, hrv: 0.118, risk: 'High Risk' },
  { heartRate: 80, oxygenSat: 99.5, systolic: 117, diastolic: 77, temperature: 36.86, hrv: 0.142, risk: 'Low Risk' },
  { heartRate: 76, oxygenSat: 99.6, systolic: 135, diastolic: 73, temperature: 37.42, hrv: 0.052, risk: 'Low Risk' },
  { heartRate: 65, oxygenSat: 96.2, systolic: 116, diastolic: 78, temperature: 36.56, hrv: 0.099, risk: 'High Risk' },
  { heartRate: 75, oxygenSat: 96.3, systolic: 128, diastolic: 86, temperature: 37.24, hrv: 0.085, risk: 'Low Risk' },
  { heartRate: 60, oxygenSat: 97.9, systolic: 134, diastolic: 84, temperature: 37.20, hrv: 0.112, risk: 'Low Risk' },
  { heartRate: 78, oxygenSat: 97.3, systolic: 126, diastolic: 79, temperature: 37.12, hrv: 0.066, risk: 'Low Risk' },
  { heartRate: 95, oxygenSat: 97.0, systolic: 125, diastolic: 70, temperature: 36.06, hrv: 0.099, risk: 'High Risk' },
  { heartRate: 84, oxygenSat: 98.5, systolic: 137, diastolic: 71, temperature: 36.85, hrv: 0.102, risk: 'High Risk' },
  { heartRate: 89, oxygenSat: 95.4, systolic: 121, diastolic: 75, temperature: 36.89, hrv: 0.121, risk: 'Low Risk' },
  { heartRate: 79, oxygenSat: 97.6, systolic: 137, diastolic: 86, temperature: 37.13, hrv: 0.099, risk: 'Low Risk' },
  { heartRate: 79, oxygenSat: 96.7, systolic: 128, diastolic: 73, temperature: 36.89, hrv: 0.087, risk: 'Low Risk' },
  { heartRate: 74, oxygenSat: 96.0, systolic: 123, diastolic: 75, temperature: 36.54, hrv: 0.090, risk: 'High Risk' },
  { heartRate: 99, oxygenSat: 97.0, systolic: 138, diastolic: 77, temperature: 36.98, hrv: 0.125, risk: 'High Risk' },
  { heartRate: 92, oxygenSat: 95.4, systolic: 134, diastolic: 87, temperature: 37.13, hrv: 0.098, risk: 'High Risk' },
  { heartRate: 61, oxygenSat: 99.8, systolic: 135, diastolic: 88, temperature: 36.27, hrv: 0.066, risk: 'Low Risk' },
  { heartRate: 69, oxygenSat: 96.5, systolic: 123, diastolic: 75, temperature: 36.01, hrv: 0.136, risk: 'High Risk' },
  { heartRate: 92, oxygenSat: 96.7, systolic: 113, diastolic: 80, temperature: 36.21, hrv: 0.115, risk: 'High Risk' },
  { heartRate: 91, oxygenSat: 99.9, systolic: 111, diastolic: 88, temperature: 36.33, hrv: 0.055, risk: 'High Risk' },
  { heartRate: 70, oxygenSat: 97.3, systolic: 126, diastolic: 73, temperature: 36.70, hrv: 0.134, risk: 'High Risk' },
  { heartRate: 83, oxygenSat: 98.7, systolic: 139, diastolic: 70, temperature: 36.17, hrv: 0.105, risk: 'High Risk' },
  { heartRate: 95, oxygenSat: 98.4, systolic: 138, diastolic: 71, temperature: 37.38, hrv: 0.115, risk: 'High Risk' },
  { heartRate: 71, oxygenSat: 97.5, systolic: 126, diastolic: 84, temperature: 37.44, hrv: 0.146, risk: 'High Risk' },
  { heartRate: 88, oxygenSat: 98.6, systolic: 127, diastolic: 77, temperature: 37.26, hrv: 0.118, risk: 'Low Risk' },
  { heartRate: 94, oxygenSat: 98.6, systolic: 117, diastolic: 87, temperature: 37.29, hrv: 0.097, risk: 'High Risk' },
  { heartRate: 60, oxygenSat: 95.9, systolic: 120, diastolic: 73, temperature: 36.23, hrv: 0.148, risk: 'Low Risk' },
  { heartRate: 60, oxygenSat: 95.3, systolic: 119, diastolic: 88, temperature: 36.37, hrv: 0.137, risk: 'Low Risk' },
  { heartRate: 96, oxygenSat: 95.0, systolic: 121, diastolic: 87, temperature: 36.49, hrv: 0.111, risk: 'High Risk' },
  { heartRate: 65, oxygenSat: 96.4, systolic: 113, diastolic: 81, temperature: 36.55, hrv: 0.109, risk: 'Low Risk' },
  { heartRate: 98, oxygenSat: 98.5, systolic: 111, diastolic: 72, temperature: 37.17, hrv: 0.071, risk: 'High Risk' },
  { heartRate: 77, oxygenSat: 95.0, systolic: 127, diastolic: 71, temperature: 37.26, hrv: 0.075, risk: 'High Risk' },
  { heartRate: 75, oxygenSat: 99.0, systolic: 117, diastolic: 89, temperature: 36.46, hrv: 0.138, risk: 'High Risk' },
  { heartRate: 64, oxygenSat: 98.9, systolic: 119, diastolic: 76, temperature: 37.44, hrv: 0.105, risk: 'Low Risk' },
  { heartRate: 91, oxygenSat: 98.9, systolic: 130, diastolic: 73, temperature: 36.69, hrv: 0.139, risk: 'High Risk' },
  { heartRate: 61, oxygenSat: 98.0, systolic: 116, diastolic: 75, temperature: 37.20, hrv: 0.061, risk: 'Low Risk' },
  { heartRate: 61, oxygenSat: 97.9, systolic: 139, diastolic: 85, temperature: 36.53, hrv: 0.119, risk: 'Low Risk' },
  { heartRate: 99, oxygenSat: 98.9, systolic: 135, diastolic: 89, temperature: 36.47, hrv: 0.142, risk: 'High Risk' },
  { heartRate: 95, oxygenSat: 95.1, systolic: 112, diastolic: 78, temperature: 36.63, hrv: 0.051, risk: 'High Risk' },
  { heartRate: 98, oxygenSat: 98.7, systolic: 129, diastolic: 89, temperature: 36.81, hrv: 0.143, risk: 'High Risk' },
  { heartRate: 71, oxygenSat: 99.4, systolic: 124, diastolic: 74, temperature: 36.44, hrv: 0.145, risk: 'High Risk' },
  { heartRate: 78, oxygenSat: 99.4, systolic: 111, diastolic: 78, temperature: 36.19, hrv: 0.127, risk: 'High Risk' },
  { heartRate: 87, oxygenSat: 100.0, systolic: 134, diastolic: 83, temperature: 36.17, hrv: 0.115, risk: 'Low Risk' },
  { heartRate: 60, oxygenSat: 99.0, systolic: 125, diastolic: 76, temperature: 37.07, hrv: 0.053, risk: 'Low Risk' },
  { heartRate: 74, oxygenSat: 99.3, systolic: 114, diastolic: 87, temperature: 37.06, hrv: 0.078, risk: 'High Risk' },
  { heartRate: 95, oxygenSat: 96.9, systolic: 112, diastolic: 70, temperature: 36.81, hrv: 0.114, risk: 'High Risk' },
  { heartRate: 72, oxygenSat: 99.1, systolic: 125, diastolic: 77, temperature: 36.70, hrv: 0.091, risk: 'Low Risk' },
  { heartRate: 80, oxygenSat: 95.6, systolic: 130, diastolic: 79, temperature: 37.25, hrv: 0.124, risk: 'Low Risk' },
  { heartRate: 71, oxygenSat: 97.2, systolic: 126, diastolic: 77, temperature: 36.61, hrv: 0.133, risk: 'Low Risk' },
  { heartRate: 64, oxygenSat: 97.9, systolic: 110, diastolic: 85, temperature: 37.40, hrv: 0.145, risk: 'Low Risk' },
  { heartRate: 66, oxygenSat: 99.9, systolic: 117, diastolic: 81, temperature: 37.34, hrv: 0.056, risk: 'Low Risk' },
  { heartRate: 64, oxygenSat: 97.9, systolic: 112, diastolic: 83, temperature: 36.28, hrv: 0.061, risk: 'Low Risk' },
  { heartRate: 63, oxygenSat: 98.6, systolic: 123, diastolic: 81, temperature: 36.39, hrv: 0.137, risk: 'Low Risk' },
  { heartRate: 72, oxygenSat: 98.2, systolic: 110, diastolic: 88, temperature: 36.42, hrv: 0.066, risk: 'Low Risk' },
  { heartRate: 96, oxygenSat: 96.6, systolic: 111, diastolic: 77, temperature: 37.10, hrv: 0.073, risk: 'High Risk' },
  { heartRate: 74, oxygenSat: 95.7, systolic: 121, diastolic: 82, temperature: 36.26, hrv: 0.083, risk: 'High Risk' },
  { heartRate: 75, oxygenSat: 99.7, systolic: 118, diastolic: 80, temperature: 36.66, hrv: 0.107, risk: 'High Risk' },
  { heartRate: 80, oxygenSat: 99.2, systolic: 128, diastolic: 79, temperature: 36.73, hrv: 0.054, risk: 'Low Risk' },
  { heartRate: 95, oxygenSat: 97.9, systolic: 113, diastolic: 78, temperature: 36.55, hrv: 0.084, risk: 'High Risk' },
  { heartRate: 83, oxygenSat: 95.9, systolic: 124, diastolic: 71, temperature: 36.29, hrv: 0.060, risk: 'High Risk' },
  { heartRate: 75, oxygenSat: 98.4, systolic: 130, diastolic: 83, temperature: 37.30, hrv: 0.127, risk: 'High Risk' },
  { heartRate: 73, oxygenSat: 95.9, systolic: 129, diastolic: 85, temperature: 36.55, hrv: 0.089, risk: 'High Risk' },
  { heartRate: 81, oxygenSat: 99.0, systolic: 125, diastolic: 82, temperature: 36.20, hrv: 0.108, risk: 'Low Risk' },
  { heartRate: 65, oxygenSat: 95.5, systolic: 137, diastolic: 81, temperature: 36.10, hrv: 0.083, risk: 'Low Risk' },
  { heartRate: 95, oxygenSat: 98.9, systolic: 118, diastolic: 72, temperature: 36.77, hrv: 0.079, risk: 'High Risk' },
  { heartRate: 60, oxygenSat: 98.7, systolic: 122, diastolic: 80, temperature: 36.36, hrv: 0.076, risk: 'High Risk' },
  { heartRate: 91, oxygenSat: 96.5, systolic: 122, diastolic: 87, temperature: 37.47, hrv: 0.054, risk: 'High Risk' },
  { heartRate: 65, oxygenSat: 99.4, systolic: 120, diastolic: 78, temperature: 37.04, hrv: 0.145, risk: 'High Risk' },
  { heartRate: 90, oxygenSat: 96.8, systolic: 115, diastolic: 86, temperature: 36.67, hrv: 0.083, risk: 'Low Risk' },
  { heartRate: 60, oxygenSat: 97.8, systolic: 133, diastolic: 85, temperature: 37.25, hrv: 0.142, risk: 'Low Risk' },
  { heartRate: 96, oxygenSat: 99.5, systolic: 116, diastolic: 81, temperature: 37.31, hrv: 0.091, risk: 'High Risk' },
  { heartRate: 94, oxygenSat: 97.9, systolic: 138, diastolic: 70, temperature: 36.27, hrv: 0.113, risk: 'High Risk' },
  { heartRate: 89, oxygenSat: 97.8, systolic: 123, diastolic: 89, temperature: 37.48, hrv: 0.076, risk: 'High Risk' },
  { heartRate: 63, oxygenSat: 96.1, systolic: 110, diastolic: 88, temperature: 37.11, hrv: 0.119, risk: 'Low Risk' },
  { heartRate: 94, oxygenSat: 96.3, systolic: 124, diastolic: 71, temperature: 36.23, hrv: 0.102, risk: 'High Risk' },
  { heartRate: 73, oxygenSat: 97.4, systolic: 130, diastolic: 70, temperature: 37.43, hrv: 0.103, risk: 'High Risk' },
  { heartRate: 99, oxygenSat: 98.6, systolic: 137, diastolic: 87, temperature: 36.80, hrv: 0.134, risk: 'High Risk' },
];

const normalData = RAW_DATASET.filter(r => r.risk === 'Low Risk');
const highRiskData = RAW_DATASET.filter(r => r.risk === 'High Risk');

// ── PQRST ECG synthesis (normal) ──────────────────────────────────────────────
function pqrstNormal(t: number): number {
  const mod = t % 1;
  let v = 0;
  if (mod > 0.08 && mod < 0.20) v = 0.15 * Math.exp(-Math.pow((mod - 0.14) / 0.025, 2));
  if (mod > 0.20 && mod < 0.25) v = -0.08 * Math.exp(-Math.pow((mod - 0.22) / 0.01, 2));
  if (mod > 0.23 && mod < 0.32) v = 1.0 * Math.exp(-Math.pow((mod - 0.27) / 0.015, 2));
  if (mod > 0.28 && mod < 0.36) v -= 0.22 * Math.exp(-Math.pow((mod - 0.32) / 0.012, 2));
  if (mod > 0.36 && mod < 0.60) v += 0.25 * Math.exp(-Math.pow((mod - 0.47) / 0.045, 2));
  return v;
}

// ── High-risk ECG: irregular RR intervals + ST changes + noise ────────────────
function pqrstHighRisk(t: number, hrv: number): number {
  // Exaggerated HRV distorts the phase
  const jitter = hrv * 2.5 * Math.sin(t * 7.3);
  const mod = (t + jitter) % 1;
  let v = 0;
  if (mod > 0.08 && mod < 0.20) v = 0.10 * Math.exp(-Math.pow((mod - 0.14) / 0.035, 2));
  if (mod > 0.20 && mod < 0.27) v = -0.12 * Math.exp(-Math.pow((mod - 0.23) / 0.01, 2));  // deeper Q
  if (mod > 0.22 && mod < 0.34) v = 0.85 * Math.exp(-Math.pow((mod - 0.28) / 0.018, 2));  // lower R
  if (mod > 0.30 && mod < 0.40) v -= 0.30 * Math.exp(-Math.pow((mod - 0.35) / 0.014, 2)); // deeper S
  if (mod > 0.38 && mod < 0.65) v += 0.10 * Math.exp(-Math.pow((mod - 0.50) / 0.055, 2)); // flat T
  return v + (Math.random() - 0.5) * 0.12; // extra noise
}

function uaSample(t: number): number {
  const period = 180;
  const phase = t % period;
  const peak = period * 0.3;
  return phase < period * 0.6 ? 0.8 * Math.exp(-Math.pow((phase - peak) / 30, 2)) : 0;
}

// ── Canvas ECG component ──────────────────────────────────────────────────────
interface CanvasEcgProps {
  bufferRef: React.MutableRefObject<number[]>;
  color: string;
  height: number;
  domain?: [number, number];
  glowIntensity?: number;
}

function CanvasEcg({ bufferRef, color, height, domain = [-0.5, 1.2], glowIntensity = 8 }: CanvasEcgProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    const draw = () => {
      const dpr = window.devicePixelRatio || 1;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
        canvas.width = w * dpr; canvas.height = h * dpr;
        ctx.scale(dpr, dpr);
      }
      ctx.clearRect(0, 0, w, h);
      // Grid
      ctx.strokeStyle = 'rgba(255,255,255,0.04)'; ctx.lineWidth = 0.5;
      for (let i = 1; i < 4; i++) { const y = (i / 4) * h; ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
      for (let i = 1; i < 8; i++) { const x = (i / 8) * w; ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }

      const buf = bufferRef.current;
      if (buf.length < 2) { rafRef.current = requestAnimationFrame(draw); return; }
      const [dMin, dMax] = domain;
      const range = dMax - dMin;

      ctx.shadowColor = color; ctx.shadowBlur = glowIntensity;
      ctx.strokeStyle = color; ctx.lineWidth = 1.8;
      ctx.lineJoin = 'round'; ctx.lineCap = 'round';
      ctx.beginPath();
      const step = w / (buf.length - 1);
      buf.forEach((v, i) => {
        const x = i * step;
        const y = h - ((v - dMin) / range) * h;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      });
      ctx.stroke(); ctx.shadowBlur = 0;
      rafRef.current = requestAnimationFrame(draw);
    };
    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, [bufferRef, color, domain, glowIntensity]);

  return <canvas ref={canvasRef} style={{ width: '100%', height, display: 'block' }} />;
}

// ── Main Component ────────────────────────────────────────────────────────────
const BUFFER_SIZE = 400;
type RiskMode = 'normal' | 'high';

interface FhrPoint { t: number; fhr: number; spo2: number; }
interface UaPoint { t: string; ua: number; }

export default function FetalMonitoring() {
  const [isRunning, setIsRunning] = useState(false);
  const [riskMode, setRiskMode] = useState<RiskMode>('normal');
  const [dataIdx, setDataIdx] = useState(0);

  // live vitals from dataset
  const [heartRate, setHeartRate] = useState(0);
  const [spo2, setSpo2] = useState(0);
  const [systolic, setSystolic] = useState(0);
  const [diastolic, setDiastolic] = useState(0);
  const [temperature, setTemperature] = useState(0);
  const [hrv, setHrv] = useState(0);

  const [fhrTrend, setFhrTrend] = useState<FhrPoint[]>([]);
  const [uaTrend, setUaTrend] = useState<UaPoint[]>([]);

  const fetalBuf = useRef<number[]>([]);
  const maternalBuf = useRef<number[]>([]);
  const ch1Buf = useRef<number[]>([]);
  const ch2Buf = useRef<number[]>([]);
  const ch3Buf = useRef<number[]>([]);
  const ch4Buf = useRef<number[]>([]);

  const tickRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isRunningRef = useRef(false);
  const riskModeRef = useRef<RiskMode>('normal');
  const dataIdxRef = useRef(0);
  const hrvRef = useRef(0.08);

  const push = (buf: React.MutableRefObject<number[]>, val: number) => {
    buf.current.push(val);
    if (buf.current.length > BUFFER_SIZE) buf.current.shift();
  };

  const tick = useCallback(() => {
    if (!isRunningRef.current) return;
    const t = tickRef.current++;
    const FPS = 40;
    const dataset = riskModeRef.current === 'normal' ? normalData : highRiskData;

    // Advance dataset record every ~80 ticks (~2 seconds)
    if (t % 80 === 0 && t > 0) {
      const nextIdx = (dataIdxRef.current + 1) % dataset.length;
      dataIdxRef.current = nextIdx;
      const rec = dataset[nextIdx];
      hrvRef.current = rec.hrv;
      setDataIdx(nextIdx);
      setHeartRate(rec.heartRate);
      setSpo2(rec.oxygenSat);
      setSystolic(rec.systolic);
      setDiastolic(rec.diastolic);
      setTemperature(parseFloat(rec.temperature.toFixed(1)));
      setHrv(parseFloat((rec.hrv * 100).toFixed(1)));
    }

    // Use current record HR to set cycle length
    const rec = dataset[dataIdxRef.current];
    const fhrCycleLen = (60 / rec.heartRate) * FPS;
    const mhrCycleLen = (60 / 75) * FPS;

    let fhrEcg: number;
    if (riskModeRef.current === 'normal') {
      fhrEcg = pqrstNormal(t / fhrCycleLen) + (Math.random() - 0.5) * 0.04;
    } else {
      fhrEcg = pqrstHighRisk(t / fhrCycleLen, hrvRef.current) ;
    }
    const mhrEcg = pqrstNormal(t / mhrCycleLen) * 0.35 + (Math.random() - 0.5) * 0.05;

    push(fetalBuf, fhrEcg);
    push(maternalBuf, mhrEcg);
    push(ch1Buf, fhrEcg * 0.9 + (Math.random() - 0.5) * 0.03);
    push(ch2Buf, pqrstNormal((t / fhrCycleLen) + 0.08) * 0.75 + (Math.random() - 0.5) * 0.04);
    push(ch3Buf, fhrEcg * 0.7 + (Math.random() - 0.5) * 0.05);
    push(ch4Buf, pqrstNormal((t / fhrCycleLen) + 0.15) * 0.65 + (Math.random() - 0.5) * 0.04);

    if (t % 60 === 0) {
      const timeLabel = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const curRec = dataset[dataIdxRef.current];
      setFhrTrend(prev => {
        const next = [...prev, { t: t / 60, fhr: curRec.heartRate, spo2: curRec.oxygenSat }];
        return next.length > 60 ? next.slice(1) : next;
      });
      setUaTrend(prev => {
        const ua = uaSample(t / 60);
        const next = [...prev, { t: timeLabel, ua: parseFloat((ua * 100).toFixed(1)) }];
        return next.length > 60 ? next.slice(1) : next;
      });
    }
  }, []);

  const startMonitoring = useCallback(() => {
    isRunningRef.current = true;
    setIsRunning(true);
    const dataset = riskModeRef.current === 'normal' ? normalData : highRiskData;
    const rec = dataset[dataIdxRef.current];
    setHeartRate(rec.heartRate); setSpo2(rec.oxygenSat);
    setSystolic(rec.systolic); setDiastolic(rec.diastolic);
    setTemperature(parseFloat(rec.temperature.toFixed(1)));
    setHrv(parseFloat((rec.hrv * 100).toFixed(1)));
    intervalRef.current = setInterval(tick, 1000 / 40);
  }, [tick]);

  const stopMonitoring = useCallback(() => {
    isRunningRef.current = false;
    setIsRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  const switchMode = useCallback((mode: RiskMode) => {
    stopMonitoring();
    riskModeRef.current = mode;
    dataIdxRef.current = 0;
    fetalBuf.current = []; maternalBuf.current = [];
    ch1Buf.current = []; ch2Buf.current = [];
    ch3Buf.current = []; ch4Buf.current = [];
    tickRef.current = 0;
    setRiskMode(mode);
    setFhrTrend([]); setUaTrend([]);
    setHeartRate(0); setSpo2(0); setSystolic(0); setDiastolic(0);
    setTemperature(0); setHrv(0);
    setTimeout(() => {
      isRunningRef.current = true;
      setIsRunning(true);
      const dataset = mode === 'normal' ? normalData : highRiskData;
      const rec = dataset[0];
      setHeartRate(rec.heartRate); setSpo2(rec.oxygenSat);
      setSystolic(rec.systolic); setDiastolic(rec.diastolic);
      setTemperature(parseFloat(rec.temperature.toFixed(1)));
      setHrv(parseFloat((rec.hrv * 100).toFixed(1)));
      intervalRef.current = setInterval(tick, 1000 / 40);
    }, 100);
  }, [stopMonitoring, tick]);

  const reset = useCallback(() => {
    stopMonitoring();
    fetalBuf.current = []; maternalBuf.current = [];
    ch1Buf.current = []; ch2Buf.current = [];
    ch3Buf.current = []; ch4Buf.current = [];
    tickRef.current = 0; dataIdxRef.current = 0;
    setFhrTrend([]); setUaTrend([]);
    setHeartRate(0); setSpo2(0); setSystolic(0); setDiastolic(0);
    setTemperature(0); setHrv(0);
  }, [stopMonitoring]);

  useEffect(() => {
    startMonitoring();
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [startMonitoring]);

  const isHighRisk = riskMode === 'high';
  const ecgColor = isHighRisk ? '#ef4444' : '#10b981';
  const modeLabel = isHighRisk ? 'HIGH RISK PATIENT' : 'NORMAL PATIENT';

  const tooltipStyle = {
    contentStyle: { backgroundColor: '#0a0f1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff', fontSize: 12 },
    cursor: { stroke: 'rgba(255,255,255,0.1)', strokeDasharray: '4 4' },
  };

  const card = (children: React.ReactNode, extraStyle?: React.CSSProperties) => (
    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: '20px', backdropFilter: 'blur(20px)', ...extraStyle }}>{children}</div>
  );

  const sectionLabel = (label: string, color: string) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
      <div style={{ width: 6, height: 6, borderRadius: '50%', background: color, boxShadow: `0 0 8px ${color}` }} />
      <h3 style={{ margin: 0, fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>{label}</h3>
    </div>
  );

  const channels = [
    { name: 'Abdominal Ch1', color: ecgColor, buf: ch1Buf },
    { name: 'Abdominal Ch2', color: '#3b82f6', buf: ch2Buf },
    { name: 'Abdominal Ch3', color: '#a78bfa', buf: ch3Buf },
    { name: 'Abdominal Ch4', color: '#f59e0b', buf: ch4Buf },
  ];

  return (
    <div style={{ padding: 24, color: 'white', minHeight: '100%' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ padding: 10, background: isHighRisk ? 'rgba(239,68,68,0.15)' : 'rgba(16,185,129,0.12)', border: `1px solid ${isHighRisk ? 'rgba(239,68,68,0.3)' : 'rgba(16,185,129,0.25)'}`, borderRadius: 14, transition: 'all 0.4s' }}>
            <Heart size={24} color={ecgColor} style={isRunning ? { animation: 'pulse-heart 0.7s ease-in-out infinite' } : {}} />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, letterSpacing: '-0.03em', background: isHighRisk ? 'linear-gradient(to right,#f87171,#fb923c)' : 'linear-gradient(to right,#34d399,#60a5fa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              ECG Monitoring — Dataset Playback
            </h1>
            <p style={{ margin: '3px 0 0', fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
              <Database size={11} style={{ marginRight: 5, verticalAlign: 'middle' }} />
              Real patient vitals from humanvitalsigndata.csv · Record {dataIdx + 1}/{riskMode === 'normal' ? normalData.length : highRiskData.length}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {/* Mode switcher */}
          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, overflow: 'hidden' }}>
            {(['normal', 'high'] as RiskMode[]).map(m => (
              <button key={m} onClick={() => switchMode(m)} style={{ padding: '8px 18px', fontSize: 12, fontWeight: 600, cursor: 'pointer', border: 'none', borderRadius: 0, background: riskMode === m ? (m === 'normal' ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)') : 'transparent', color: riskMode === m ? (m === 'normal' ? '#34d399' : '#f87171') : 'rgba(255,255,255,0.4)', transition: 'all 0.2s' }}>
                {m === 'normal' ? '✅ Normal' : '🚨 High Risk'}
              </button>
            ))}
          </div>

          {!isRunning ? (
            <button onClick={startMonitoring} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 18px', borderRadius: 12, background: `linear-gradient(135deg,${ecgColor},${isHighRisk ? '#dc2626' : '#059669'})`, border: 'none', color: 'white', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
              <PlayCircle size={15} /> Start
            </button>
          ) : (
            <button onClick={stopMonitoring} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 16px', borderRadius: 12, background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
              <StopCircle size={15} /> Stop
            </button>
          )}
          <button onClick={reset} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 14px', borderRadius: 12, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.45)', fontWeight: 500, fontSize: 12, cursor: 'pointer' }}>
            <RefreshCw size={13} /> Reset
          </button>
        </div>
      </div>

      {/* Risk banner */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 18px', borderRadius: 12, marginBottom: 20, background: isHighRisk ? 'rgba(239,68,68,0.08)' : 'rgba(16,185,129,0.08)', border: `1px solid ${ecgColor}30`, transition: 'all 0.4s' }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: ecgColor, boxShadow: `0 0 10px ${ecgColor}`, animation: isRunning ? 'blip 1s ease-in-out infinite' : 'none' }} />
        <span style={{ fontSize: 12, fontWeight: 700, color: ecgColor, letterSpacing: '0.06em' }}>{modeLabel}</span>
        <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginLeft: 8 }}>
          {isHighRisk ? 'Showing irregular PQRST morphology · ST changes · Elevated noise' : 'Showing clean PQRST waveform · Stable rhythm · Low noise'}
        </span>
      </div>

      {/* Vitals strip from dataset */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 14, marginBottom: 22 }}>
        {[
          { label: 'Heart Rate', value: heartRate || '--', unit: 'bpm', color: ecgColor },
          { label: 'SpO₂', value: spo2 ? spo2.toFixed(1) : '--', unit: '%', color: spo2 < 96 ? '#f59e0b' : '#60a5fa' },
          { label: 'Blood Pressure', value: systolic && diastolic ? `${systolic}/${diastolic}` : '--', unit: 'mmHg', color: '#a78bfa' },
          { label: 'Temperature', value: temperature || '--', unit: '°C', color: temperature > 37.2 ? '#f87171' : '#34d399' },
          { label: 'HRV Index', value: hrv || '--', unit: 'ms', color: isHighRisk ? '#f59e0b' : '#34d399' },
          { label: 'Risk Class', value: isHighRisk ? 'HIGH' : 'NORMAL', unit: '', color: ecgColor },
        ].map((item, i) => (
          <div key={i} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: '14px 16px' }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 8 }}>{item.label}</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: item.color, letterSpacing: '-0.02em' }}>
              {item.value} {item.unit && <span style={{ fontSize: 12, fontWeight: 400, color: 'rgba(255,255,255,0.3)' }}>{item.unit}</span>}
            </div>
          </div>
        ))}
      </div>

      {/* Main ECG Canvas */}
      {card(
        <>
          {sectionLabel(`Fetal ECG — ${riskMode === 'normal' ? 'Normal PQRST Morphology' : 'High Risk — Irregular / ST Changes'}`, ecgColor)}
          <CanvasEcg bufferRef={fetalBuf} color={ecgColor} height={220} domain={[-0.6, 1.3]} glowIntensity={isHighRisk ? 12 : 8} />
          <div style={{ display: 'flex', gap: 20, marginTop: 10, flexWrap: 'wrap' }}>
            {['P Wave', 'Q', 'R Wave (QRS)', 'S', 'T Wave'].map((w, i) => (
              <span key={i} style={{ fontSize: 10, color: 'rgba(255,255,255,0.28)', letterSpacing: '0.04em' }}>{w}</span>
            ))}
            {isHighRisk && <span style={{ fontSize: 10, color: '#f59e0b', letterSpacing: '0.04em', marginLeft: 'auto' }}>⚠ ST Depression · Irregular RR · ↑ Noise</span>}
          </div>
        </>,
        { marginBottom: 22 }
      )}

      {/* Maternal ECG */}
      {card(
        <>
          {sectionLabel('Maternal ECG — Abdominal Lead (Reference)', '#60a5fa')}
          <CanvasEcg bufferRef={maternalBuf} color="#60a5fa" height={120} domain={[-0.2, 0.5]} />
        </>,
        { marginBottom: 22 }
      )}

      {/* FHR Trend + UA */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 22, marginBottom: 22 }}>
        {card(
          <>
            {sectionLabel('Heart Rate Trend (from dataset)', ecgColor)}
            <div style={{ width: '100%', height: 200 }}>
              <ResponsiveContainer>
                <LineChart data={fhrTrend} margin={{ top: 8, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis dataKey="t" hide />
                  <YAxis domain={[55, 105]} stroke="rgba(255,255,255,0.15)" fontSize={10} axisLine={false} tickLine={false} ticks={[60, 70, 80, 90, 100]} />
                  <Tooltip {...tooltipStyle} />
                  <Line type="monotone" dataKey="fhr" name="HR (bpm)" stroke={ecgColor} strokeWidth={2.5} dot={false} isAnimationActive={false} activeDot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
        {card(
          <>
            {sectionLabel('SpO₂ Trend', '#60a5fa')}
            <div style={{ width: '100%', height: 200 }}>
              <ResponsiveContainer>
                <AreaChart data={fhrTrend} margin={{ top: 8, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="spo2Grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#60a5fa" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis dataKey="t" hide />
                  <YAxis domain={[93, 101]} stroke="rgba(255,255,255,0.15)" fontSize={10} axisLine={false} tickLine={false} />
                  <Tooltip {...tooltipStyle} formatter={(v: number) => [`${v.toFixed(1)}%`, 'SpO₂']} />
                  <Area type="monotone" dataKey="spo2" name="SpO₂" stroke="#60a5fa" strokeWidth={2} fill="url(#spo2Grad)" dot={false} isAnimationActive={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </div>

      {/* Uterine Activity */}
      {card(
        <>
          {sectionLabel('Uterine Activity (Contractions)', '#f59e0b')}
          <div style={{ width: '100%', height: 120 }}>
            <ResponsiveContainer>
              <AreaChart data={uaTrend} margin={{ top: 8, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="uaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="t" hide /><YAxis domain={[0, 100]} stroke="rgba(255,255,255,0.15)" fontSize={10} axisLine={false} tickLine={false} />
                <Tooltip {...tooltipStyle} formatter={(v: number) => [`${v} mmHg`, 'UA']} />
                <Area type="monotone" dataKey="ua" stroke="#f59e0b" strokeWidth={2} fill="url(#uaGrad)" dot={false} isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </>,
        { marginBottom: 22 }
      )}

      {/* Channel Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
        {channels.map((ch, idx) =>
          card(
            <>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 7, height: 7, borderRadius: '50%', background: ch.color, boxShadow: `0 0 6px ${ch.color}` }} />
                  <span style={{ fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,0.6)' }}>{ch.name}</span>
                </div>
                <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)' }}>Ch{idx + 1}</span>
              </div>
              <CanvasEcg bufferRef={ch.buf} color={ch.color} height={85} domain={[-0.6, 1.3]} glowIntensity={5} />
            </>,
            { key: idx }
          )
        )}
      </div>

      {/* Legend */}
      <div style={{ marginTop: 18, padding: '12px 18px', borderRadius: 12, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: 28, flexWrap: 'wrap', fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
        <span>✅ Normal ECG: <strong style={{ color: '#10b981' }}>Smooth PQRST · Low HRV · Stable SpO₂</strong></span>
        <span>🚨 High Risk ECG: <strong style={{ color: '#ef4444' }}>Irregular RR · ST Depression · ↑ Noise · Low T-Wave</strong></span>
        <span style={{ marginLeft: 'auto', color: 'rgba(255,255,255,0.25)' }}>{normalData.length} Normal · {highRiskData.length} High Risk records loaded</span>
      </div>

      <style>{`
        @keyframes pulse-heart { 0%,100%{transform:scale(1)} 50%{transform:scale(1.2)} }
        @keyframes blip { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.4;transform:scale(0.7)} }
      `}</style>
    </div>
  );
}
