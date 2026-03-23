// Personal baseline calculation and anomaly detection

import { VitalReading, VitalConfig } from '../data/vitals';

export interface PersonalBaseline {
  hr: BaselineStat;
  spo2: BaselineStat;
  temp: BaselineStat;
  rr: BaselineStat;
  sbp: BaselineStat;
  dbp: BaselineStat;
  hrv: BaselineStat;
  calibrationProgress: number; // 0-100%
  daysLearned: number;
}

export interface BaselineStat {
  median: number;
  q1: number;
  q3: number;
  iqr: number;
  min: number;
  max: number;
}

function percentile(arr: number[], p: number): number {
  const sorted = [...arr].sort((a, b) => a - b);
  const idx = (p / 100) * (sorted.length - 1);
  const low = Math.floor(idx);
  const high = Math.ceil(idx);
  if (low === high) return sorted[low];
  return sorted[low] + (sorted[high] - sorted[low]) * (idx - low);
}

export function calculateBaseline(readings: VitalReading[]): PersonalBaseline {
  // Filter to resting states only
  const resting = readings.filter(r =>
    r.context === 'resting' || r.context === 'sitting' || r.context === 'sleeping'
  );
  const data = resting.length > 10 ? resting : readings;

  const calc = (values: number[]): BaselineStat => {
    const med = percentile(values, 50);
    const q1 = percentile(values, 25);
    const q3 = percentile(values, 75);
    return {
      median: Math.round(med * 10) / 10,
      q1: Math.round(q1 * 10) / 10,
      q3: Math.round(q3 * 10) / 10,
      iqr: Math.round((q3 - q1) * 10) / 10,
      min: Math.round(Math.min(...values) * 10) / 10,
      max: Math.round(Math.max(...values) * 10) / 10,
    };
  };

  const daysOfData = readings.length > 0
    ? (readings[readings.length - 1].timestamp.getTime() - readings[0].timestamp.getTime()) / 86400000
    : 0;

  return {
    hr: calc(data.map(r => r.hr)),
    spo2: calc(data.map(r => r.spo2)),
    temp: calc(data.map(r => r.temp)),
    rr: calc(data.map(r => r.rr)),
    sbp: calc(data.map(r => r.sbp)),
    dbp: calc(data.map(r => r.dbp)),
    hrv: calc(data.map(r => r.hrv)),
    calibrationProgress: Math.min(100, (daysOfData / 14) * 100),
    daysLearned: Math.round(daysOfData * 10) / 10,
  };
}

export interface AnomalyResult {
  vital: string;
  zScore: number;
  isAnomaly: boolean;
  severity: 'normal' | 'warning' | 'critical';
  message: string;
}

export function detectAnomaly(
  current: VitalReading,
  baseline: PersonalBaseline,
  context: string = 'resting'
): AnomalyResult[] {
  const thresholds: Record<string, number> = {
    'resting': 2.0,
    'sitting': 2.0,
    'sleeping': 1.8,
    'post-exercise': 2.5,
    'post-meal': 2.2,
    'post-coffee': 2.2,
    'walking': 2.3,
  };
  const threshold = thresholds[context] || 2.0;
  const results: AnomalyResult[] = [];

  const checks: { key: keyof PersonalBaseline; value: number; label: string; unit: string; invertWarning?: boolean }[] = [
    { key: 'hr', value: current.hr, label: 'Heart Rate', unit: 'bpm' },
    { key: 'spo2', value: current.spo2, label: 'SpO₂', unit: '%', invertWarning: true },
    { key: 'temp', value: current.temp, label: 'Temperature', unit: '°C' },
    { key: 'rr', value: current.rr, label: 'Respiratory Rate', unit: 'br/min' },
    { key: 'sbp', value: current.sbp, label: 'Systolic BP', unit: 'mmHg' },
    { key: 'hrv', value: current.hrv, label: 'HRV', unit: 'ms', invertWarning: true },
  ];

  for (const check of checks) {
    const stat = baseline[check.key] as BaselineStat;
    const iqr = stat.iqr || 1;
    const z = Math.abs(check.value - stat.median) / iqr;
    const isAnomaly = z > threshold;
    let severity: 'normal' | 'warning' | 'critical' = 'normal';
    if (z > threshold * 1.5) severity = 'critical';
    else if (z > threshold) severity = 'warning';

    results.push({
      vital: check.label,
      zScore: Math.round(z * 100) / 100,
      isAnomaly,
      severity,
      message: isAnomaly
        ? `${check.label} (${check.value}${check.unit}) deviates ${z.toFixed(1)}σ from personal baseline (${stat.median}${check.unit})`
        : `${check.label} within normal range`,
    });
  }
  return results;
}

// Population thresholds for comparison
export const POPULATION_THRESHOLDS: VitalConfig = {
  baseHR: 75,
  baseSpo2: 97,
  baseTemp: 36.6,
  baseRR: 16,
  baseSBP: 120,
  baseDBP: 80,
  baseHRV: 50,
};

export function calculateStabilityScore(anomalies: AnomalyResult[]): number {
  let score = 100;
  for (const a of anomalies) {
    if (a.severity === 'critical') score -= 25;
    else if (a.severity === 'warning') score -= 12;
    else if (a.zScore > 1) score -= 3;
  }
  return Math.max(0, Math.min(100, Math.round(score)));
}
