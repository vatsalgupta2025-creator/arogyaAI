// Vital sign data generation with realistic physiological patterns

export interface VitalReading {
  timestamp: Date;
  hr: number;       // Heart rate (bpm)
  spo2: number;     // Oxygen saturation (%)
  temp: number;     // Temperature (°C)
  rr: number;       // Respiratory rate (breaths/min)
  sbp: number;      // Systolic BP (mmHg)
  dbp: number;      // Diastolic BP (mmHg)
  hrv: number;      // Heart rate variability (ms)
  context: string;  // Activity context
}

export interface VitalConfig {
  baseHR: number;
  baseSpo2: number;
  baseTemp: number;
  baseRR: number;
  baseSBP: number;
  baseDBP: number;
  baseHRV: number;
}

// Default baseline for our patient (Sarah, 67, diabetic, hypertensive)
export const DEFAULT_BASELINE: VitalConfig = {
  baseHR: 78,
  baseSpo2: 95.5,
  baseTemp: 36.8,
  baseRR: 16,
  baseSBP: 138,
  baseDBP: 88,
  baseHRV: 42,
};

// Physiological noise generators
function gaussian(): number {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

// Circadian rhythm (sine wave peaking at 4pm, trough at 4am)
function circadianFactor(timestamp: Date): number {
  const hour = timestamp.getHours() + timestamp.getMinutes() / 60;
  return Math.sin(((hour - 4) / 24) * 2 * Math.PI);  // peaks at 16:00
}

/**
 * Generate a stream of vital readings.
 * mode: 'normal' = stable vitals, 'sepsis' = gradual deterioration
 */
export function generateVitalStream(
  config: VitalConfig,
  count: number,
  intervalMinutes: number = 2,
  mode: 'normal' | 'sepsis' = 'normal',
  startTime?: Date
): VitalReading[] {
  const readings: VitalReading[] = [];
  const start = startTime || new Date(Date.now() - count * intervalMinutes * 60000);

  for (let i = 0; i < count; i++) {
    const t = new Date(start.getTime() + i * intervalMinutes * 60000);
    const progress = i / count; // 0 → 1
    const circ = circadianFactor(t);

    let hr: number, spo2: number, temp: number, rr: number, sbp: number, dbp: number, hrv: number;

    if (mode === 'sepsis') {
      // Gradual sepsis deterioration
      const sepsisRamp = Math.pow(progress, 1.5); // accelerating

      hr = config.baseHR + sepsisRamp * 30 + circ * 3 + gaussian() * 2;
      spo2 = config.baseSpo2 - sepsisRamp * 6 + gaussian() * 0.3;
      temp = config.baseTemp + sepsisRamp * 2.2 + circ * 0.1 + gaussian() * 0.1;
      rr = config.baseRR + sepsisRamp * 10 + gaussian() * 1;
      sbp = config.baseSBP - sepsisRamp * 25 + gaussian() * 3;
      dbp = config.baseDBP - sepsisRamp * 12 + gaussian() * 2;
      hrv = config.baseHRV - sepsisRamp * 20 + gaussian() * 2;
    } else {
      // Normal with circadian rhythm + noise
      hr = config.baseHR + circ * 5 + gaussian() * 3;
      spo2 = config.baseSpo2 + circ * 0.3 + gaussian() * 0.4;
      temp = config.baseTemp + circ * 0.2 + gaussian() * 0.1;
      rr = config.baseRR + circ * 1.5 + gaussian() * 1;
      sbp = config.baseSBP + circ * 5 + gaussian() * 4;
      dbp = config.baseDBP + circ * 3 + gaussian() * 2;
      hrv = config.baseHRV + circ * 3 + gaussian() * 3;
    }

    const contexts = ['resting', 'sitting', 'walking', 'sleeping', 'post-meal'];
    const context = contexts[Math.floor(Math.random() * contexts.length)];

    readings.push({
      timestamp: t,
      hr: clamp(Math.round(hr * 10) / 10, 40, 180),
      spo2: clamp(Math.round(spo2 * 10) / 10, 70, 100),
      temp: clamp(Math.round(temp * 100) / 100, 35, 42),
      rr: clamp(Math.round(rr), 8, 40),
      sbp: clamp(Math.round(sbp), 70, 220),
      dbp: clamp(Math.round(dbp), 40, 130),
      hrv: clamp(Math.round(hrv), 5, 100),
      context,
    });
  }
  return readings;
}

/**
 * Get the latest vital + a sparkline of recent data for cards
 */
export function getLatestWithSparkline(stream: VitalReading[], sparklinePoints: number = 20) {
  const latest = stream[stream.length - 1];
  const sparkline = stream.slice(-sparklinePoints);
  return { latest, sparkline };
}
