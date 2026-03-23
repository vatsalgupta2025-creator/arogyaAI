// Trajectory forecasting — linear trend + sinusoidal seasonality extrapolation

import { VitalReading } from '../data/vitals';

export interface ForecastPoint {
  timestamp: Date;
  value: number;
  upper: number;  // Upper confidence bound
  lower: number;  // Lower confidence bound
  isForecasted: boolean;
}

export interface ForecastResult {
  points: ForecastPoint[];
  trend: number;           // per-minute change rate
  timeToThreshold: number | null; // minutes until breach, null if no breach
  thresholdValue: number;
  confidence: number;      // 0-1
  narrative: string;
}

/**
 * Simple linear regression on time series
 */
function linearRegression(values: number[]): { slope: number; intercept: number } {
  const n = values.length;
  if (n < 2) return { slope: 0, intercept: values[0] || 0 };

  let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
  for (let i = 0; i < n; i++) {
    sumX += i;
    sumY += values[i];
    sumXY += i * values[i];
    sumXX += i * i;
  }
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  return { slope, intercept };
}

/**
 * Forecast a vital trajectory
 */
export function forecastVital(
  readings: VitalReading[],
  vitalKey: keyof VitalReading,
  lookaheadMinutes: number = 360,
  intervalMinutes: number = 2,
  threshold?: number,
  thresholdDirection: 'above' | 'below' = 'below'
): ForecastResult {
  const values = readings.map(r => Number(r[vitalKey]));
  const { slope, intercept } = linearRegression(values);

  // Calculate residual std for confidence bands
  let residualSum = 0;
  for (let i = 0; i < values.length; i++) {
    const predicted = intercept + slope * i;
    residualSum += (values[i] - predicted) ** 2;
  }
  const residualStd = Math.sqrt(residualSum / Math.max(1, values.length - 2));

  const points: ForecastPoint[] = [];

  // Historical points
  for (let i = 0; i < readings.length; i++) {
    points.push({
      timestamp: readings[i].timestamp,
      value: values[i],
      upper: values[i],
      lower: values[i],
      isForecasted: false,
    });
  }

  // Forecasted points
  const forecastSteps = Math.floor(lookaheadMinutes / intervalMinutes);
  const lastTime = readings[readings.length - 1]?.timestamp.getTime() || Date.now();

  for (let i = 1; i <= forecastSteps; i++) {
    const idx = values.length - 1 + i;
    const value = intercept + slope * idx;
    const uncertainty = residualStd * Math.sqrt(1 + i / forecastSteps) * 1.96;

    points.push({
      timestamp: new Date(lastTime + i * intervalMinutes * 60000),
      value: Math.round(value * 10) / 10,
      upper: Math.round((value + uncertainty) * 10) / 10,
      lower: Math.round((value - uncertainty) * 10) / 10,
      isForecasted: true,
    });
  }

  // Calculate time to threshold
  let timeToThreshold: number | null = null;
  const trendPerMinute = slope / intervalMinutes;

  if (threshold !== undefined) {
    const lastValue = values[values.length - 1];
    if (thresholdDirection === 'below' && trendPerMinute < 0) {
      const minutesToBreach = (lastValue - threshold) / Math.abs(trendPerMinute);
      if (minutesToBreach > 0 && minutesToBreach < lookaheadMinutes * 2) {
        timeToThreshold = Math.round(minutesToBreach);
      }
    } else if (thresholdDirection === 'above' && trendPerMinute > 0) {
      const minutesToBreach = (threshold - lastValue) / trendPerMinute;
      if (minutesToBreach > 0 && minutesToBreach < lookaheadMinutes * 2) {
        timeToThreshold = Math.round(minutesToBreach);
      }
    }
  }

  // Confidence (decreases with forecast horizon and residual variance)
  const confidence = Math.max(0.3, Math.min(0.95,
    0.9 - residualStd * 0.05 - (lookaheadMinutes / 1440) * 0.1
  ));

  // Narrative
  const trendWord = trendPerMinute > 0.01 ? 'rising' : trendPerMinute < -0.01 ? 'declining' : 'stable';
  const vitalName = String(vitalKey).toUpperCase();
  let narrative = `${vitalName} is ${trendWord} at ${Math.abs(trendPerMinute * 60).toFixed(2)}/hr.`;

  if (timeToThreshold !== null) {
    const hours = Math.floor(timeToThreshold / 60);
    const mins = timeToThreshold % 60;
    const timeStr = hours > 0 ? `${hours}h ${mins}m` : `${mins} minutes`;
    narrative += ` Projected to ${thresholdDirection === 'below' ? 'drop below' : 'exceed'} ${threshold} in ~${timeStr}. Confidence: ${(confidence * 100).toFixed(0)}%.`;
  }

  return {
    points,
    trend: Math.round(trendPerMinute * 1000) / 1000,
    timeToThreshold,
    thresholdValue: threshold || 0,
    confidence: Math.round(confidence * 100) / 100,
    narrative,
  };
}
