import { useOutletContext } from 'react-router-dom';
import { ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { AlertCircle, ArrowRight } from 'lucide-react';
import type { VitalsState } from '../hooks/useVitals';
import GlassCard from '../components/GlassCard';
import { forecastVital } from '../utils/forecast';
import { useRole } from '../hooks/RoleContext';

export default function TrajectoryForecast() {
  const { history } = useOutletContext<VitalsState>();
  const { role } = useRole();

  if (history.length < 10) return <div>Gathering data...</div>;

  // Forecast SpO2 (simulating a sepsis trajectory drop)
  const forecast = forecastVital(history, 'spo2', 360, 2, 90, 'below');

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const chartData = forecast.points.map(p => ({
    time: formatTime(p.timestamp),
    actual: p.isForecasted ? null : p.value,
    forecast: p.isForecasted ? p.value : null,
    lowerBound: p.isForecasted ? p.lower : null,
    upperBound: p.isForecasted ? p.upper : null,
    isForecasted: p.isForecasted,
  }));

  const splitIndex = chartData.findIndex(d => d.isForecasted);

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, margin: '0 0 8px 0' }}>Trajectory Forecasting</h1>
        <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
          Physics-informed 6-hour forward predictions, not just reactive alerts.
        </p>
      </div>

      <GlassCard glow={forecast.timeToThreshold ? 'rose' : 'none'} style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontSize: 18, color: 'var(--text-primary)' }}>SpO₂ Trajectory (Next 6 Hours)</h2>
          {forecast.timeToThreshold && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#ef4444', fontWeight: 600, background: 'rgba(239, 68, 68, 0.1)', padding: '6px 16px', borderRadius: 20 }}>
              <AlertCircle size={16} />
              Hypoxic threshold (&lt;90%) projected in {Math.floor(forecast.timeToThreshold / 60)}h {forecast.timeToThreshold % 60}m
            </div>
          )}
        </div>

        <div style={{ height: 400, width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 20, right: 20, bottom: 20, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="time" tick={{ fill: 'var(--text-muted)' }} tickLine={false} axisLine={false} minTickGap={30} />
              <YAxis domain={[85, 100]} tick={{ fill: 'var(--text-muted)' }} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-glass)', borderRadius: 8, color: 'var(--text-primary)' }}
                labelStyle={{ color: 'var(--text-secondary)' }}
              />
              <ReferenceLine y={90} stroke="#ef4444" strokeDasharray="3 3" label={{ position: 'top', value: 'Critical Threshold (90%)', fill: '#ef4444', fontSize: 12 }} />
              <ReferenceLine x={chartData[splitIndex > 0 ? splitIndex - 1 : 0]?.time} stroke="var(--accent-cyan)" strokeDasharray="3 3" label={{ position: 'top', value: 'NOW', fill: 'var(--accent-cyan)', fontSize: 12 }} />

              {/* Confidence interval band */}
              <Area type="monotone" dataKey="upperBound" stroke="none" fill="rgba(52, 211, 153, 0.05)" />
              <Area type="monotone" dataKey="lowerBound" stroke="none" fill="var(--bg-card)" />

              {/* Actual historical line */}
              <Line type="monotone" dataKey="actual" stroke="var(--accent-cyan)" strokeWidth={3} dot={false} isAnimationActive={false} />

              {/* Forecast line (dashed) */}
              <Line type="monotone" dataKey="forecast" stroke="var(--accent-emerald)" strokeWidth={2} strokeDasharray="5 5" dot={false} isAnimationActive={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <GlassCard>
          <h3 style={{ margin: '0 0 12px 0', fontSize: 16 }}>Model Explanation</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.6, margin: '0 0 16px 0' }}>
            {role === 'physician'
              ? 'LSTM projection utilizing real-time sensor data decomposed into trend + circadian seasonality components. Uncertainty bounds calculated using residual variance over the last 24h.'
              : 'Our system learns your normal daily rhythm and predicts future vitals to catch issues early, before they become uncomfortable.'}
          </p>
          <div style={{ display: 'flex', gap: 20 }}>
            <div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Confidence</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--accent-emerald)' }}>{forecast.confidence * 100}%</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Trend Slope</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: forecast.trend < 0 ? '#ef4444' : 'var(--text-primary)' }}>{forecast.trend.toFixed(3)}%/min</div>
            </div>
          </div>
        </GlassCard>

        <GlassCard style={{ background: 'rgba(34, 211, 238, 0.05)', border: '1px solid rgba(34, 211, 238, 0.2)' }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: 16, color: 'var(--accent-cyan)' }}>AI Narrative Summary</h3>
          <p style={{ color: 'var(--text-primary)', fontSize: 15, lineHeight: 1.6, margin: '0 0 16px 0' }}>
            {forecast.narrative}
          </p>
          {role === 'physician' && (
            <button style={{
              background: 'transparent', border: '1px solid var(--accent-cyan)', color: 'var(--accent-cyan)',
              padding: '6px 12px', borderRadius: 6, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8
            }}>
              View Full Differential <ArrowRight size={14} />
            </button>
          )}
        </GlassCard>
      </div>
    </div>
  );
}
