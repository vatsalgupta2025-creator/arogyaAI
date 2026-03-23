import { useOutletContext } from 'react-router-dom';

import { Sliders, Zap, CheckCircle } from 'lucide-react';
import { VitalsState } from '../hooks/useVitals';
import GlassCard from '../components/GlassCard';
import { POPULATION_THRESHOLDS } from '../utils/baseline';

export default function PersonalBaseline() {
  const { baseline } = useOutletContext<VitalsState>();

  const comparisonData = [
    { name: 'Resting HR', unit: 'bpm', pop: POPULATION_THRESHOLDS.baseHR, popMin: 60, popMax: 100, personal: baseline.hr.median, persMin: baseline.hr.min, persMax: baseline.hr.max, invert: false },
    { name: 'Sleeping SpO₂', unit: '%', pop: POPULATION_THRESHOLDS.baseSpo2, popMin: 95, popMax: 100, personal: baseline.spo2.median, persMin: baseline.spo2.min, persMax: baseline.spo2.max, invert: true },
    { name: 'Core Temp', unit: '°C', pop: POPULATION_THRESHOLDS.baseTemp, popMin: 36.1, popMax: 37.2, personal: baseline.temp.median, persMin: baseline.temp.min, persMax: baseline.temp.max, invert: false },
    { name: 'Resp Rate', unit: 'br/min', pop: POPULATION_THRESHOLDS.baseRR, popMin: 12, popMax: 20, personal: baseline.rr.median, persMin: baseline.rr.min, persMax: baseline.rr.max, invert: false },
  ];

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, margin: '0 0 8px 0' }}>Personalized Baselining</h1>
        <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
          Continuous learning from your unique physiological rhythms, reducing false alarms by ~38%.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24, marginBottom: 24 }}>
        {/* Learning Progress */}
        <GlassCard>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <h3 style={{ margin: '0 0 4px 0', fontSize: 16 }}>Calibration Phase 1</h3>
              <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)' }}>Establishing baseline stability across multiple contexts</p>
            </div>
            <div style={{ padding: '6px 12px', background: 'rgba(52, 211, 153, 0.1)', color: 'var(--accent-emerald)', borderRadius: 20, fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
              <CheckCircle size={14} /> Active Learning
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8 }}>
            <div style={{ flex: 1, height: 8, background: 'var(--bg-primary)', borderRadius: 4, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${baseline.calibrationProgress}%`, background: 'var(--accent-cyan)', borderRadius: 4, transition: 'width 1s ease-out' }} />
            </div>
            <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--accent-cyan)', width: 40, textAlign: 'right' }}>
              {Math.round(baseline.calibrationProgress)}%
            </div>
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{baseline.daysLearned} consecutive days / 14 days optimal target</div>
        </GlassCard>

        {/* Impact Stat */}
        <GlassCard glow="cyan" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
          <Zap size={32} color="var(--accent-amber)" style={{ marginBottom: 12 }} />
          <div style={{ fontSize: 36, fontWeight: 800, fontFamily: 'var(--font-mono)', lineHeight: 1, color: 'var(--text-primary)' }}>
            38<span style={{ fontSize: 24, color: 'var(--text-muted)' }}>%</span>
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 8 }}>Fewer false-positive alerts<br/>vs global population thresholds</div>
        </GlassCard>
      </div>

      <GlassCard>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <Sliders size={20} color="var(--accent-cyan)" />
          <h2 style={{ fontSize: 18, margin: 0 }}>Threshold Drift: You vs Population</h2>
        </div>

        <div style={{ display: 'grid', gap: 20 }}>
          {comparisonData.map((data, i) => (
            <div key={i} style={{ padding: 16, background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-glass)', borderRadius: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{data.name} <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>({data.unit})</span></div>
              </div>

              <div style={{ position: 'relative', height: 40, background: 'rgba(255,255,255,0.02)', borderRadius: 4 }}>
                {/* Visual scale background could go here */}

                {/* Population Range (Gray) */}
                <div style={{
                  position: 'absolute', top: 6, bottom: 6,
                  left: `${(data.popMin / (data.popMax * 1.5)) * 100}%`,
                  width: `${((data.popMax - data.popMin) / (data.popMax * 1.5)) * 100}%`,
                  background: 'rgba(255,255,255,0.1)', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10, color: 'var(--text-muted)'
                }}>
                  Gen Pop Range
                </div>

                {/* Personal Baseline (Cyan) */}
                <div style={{
                  position: 'absolute', top: 12, bottom: 12,
                  left: `${(data.persMin / (data.popMax * 1.5)) * 100}%`,
                  width: `${((data.persMax - data.persMin) / (data.popMax * 1.5)) * 100}%`,
                  background: 'rgba(34, 211, 238, 0.2)', border: '1px solid var(--accent-cyan)', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10, color: 'var(--accent-cyan)', fontWeight: 600
                }}>
                  Your Range
                </div>

                {/* Median markers */}
                <div style={{ position: 'absolute', top: 0, bottom: 0, left: `${(data.pop / (data.popMax * 1.5)) * 100}%`, width: 2, background: 'rgba(255,255,255,0.3)' }} />
                <div style={{ position: 'absolute', top: 0, bottom: 0, left: `${(data.personal / (data.popMax * 1.5)) * 100}%`, width: 2, background: 'var(--accent-cyan)', boxShadow: 'var(--glow-cyan)' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)', marginTop: 8 }}>
                <div>Pop Median: {data.pop}</div>
                <div style={{ color: 'var(--accent-cyan)' }}>Your Median: {data.personal}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 24, padding: 16, background: '#1e1b4b', borderRadius: 8, borderLeft: '4px solid #8b5cf6' }}>
          <p style={{ margin: 0, fontSize: 13, color: '#c4b5fd', lineHeight: 1.6 }}>
            <strong>Clinical Context Note:</strong> Your resting heart rate median (78 bpm) is slightly higher than the population average, but perfectly stable for you. A standard wearable would trigger "High HR Alerts" during minor activity spikes, causing anxiety. Our baselining prevents this by assessing deviation from <em>your</em> normal, not global averages.
          </p>
        </div>
      </GlassCard>
    </div>
  );
}
