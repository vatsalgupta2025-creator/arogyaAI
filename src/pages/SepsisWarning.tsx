import { useOutletContext } from 'react-router-dom';
import { AlertTriangle, Clock, Activity, Thermometer, Wind } from 'lucide-react';
import type { VitalsState } from '../hooks/useVitals';
import GlassCard from '../components/GlassCard';
import { useRole } from '../hooks/RoleContext';

export default function SepsisWarning() {
  const { current, history } = useOutletContext<VitalsState>();
  const { role } = useRole();

  if (!current) return null;

  // Calculate qSOFA + Trajectory aspects
  const ams = false; // Altered mental status (mocked)
  const rrElevated = current.rr >= 22;
  const bpLow = current.sbp <= 100;

  let qSofaScore = 0;
  if (ams) qSofaScore++;
  if (rrElevated) qSofaScore++;
  if (bpLow) qSofaScore++;

  // Trajectory severity (mocked calculation based on trends)
  const tempTrend = history.length > 30 ? current.temp - history[history.length - 30].temp : 0;
  const hrTrend = history.length > 30 ? current.hr - history[history.length - 30].hr : 0;
  const isDeteriorating = tempTrend > 0.5 && hrTrend > 10;

  const sepsisRisk = (qSofaScore * 0.3) + (isDeteriorating ? 0.5 : 0.1);
  const isHighRisk = sepsisRisk > 0.6;

  // Hours to septic shock (mock calculation based on deterioration rate)
  const hoursToShock = isDeteriorating ? Math.max(1, 6 - (tempTrend * 2)) : null;

  if (role !== 'physician') {
    return (
      <div style={{ maxWidth: 800, margin: '100px auto', textAlign: 'center' }}>
        <GlassCard glow="cyan">
          <Activity size={48} style={{ color: 'var(--accent-cyan)', margin: '0 auto 24px auto' }} />
          <h2 style={{ fontSize: 24, marginBottom: 16 }}>Advanced Monitoring Active</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 16, lineHeight: 1.6 }}>
            Our system is continuously analyzing vital sign trajectories to predict wellness up to 6 hours in advance, ensuring your clinical team always stays one step ahead.
          </p>
        </GlassCard>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, margin: '0 0 8px 0', color: isHighRisk ? '#ef4444' : 'var(--text-primary)' }}>
          Systemic Inflammatory Response / Sepsis EW
        </h1>
        <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
          Combines standard qSOFA scoring with continuous temporal trajectory analysis.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 24 }}>
        <GlassCard glow={isHighRisk ? 'rose' : 'none'} style={{ position: 'relative', overflow: 'hidden' }}>
          {isHighRisk && (
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: '#ef4444', boxShadow: '0 0 10px #ef4444' }} />
          )}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                <AlertTriangle size={24} color={isHighRisk ? '#ef4444' : '#fbbf24'} />
                <h2 style={{ fontSize: 20, margin: 0 }}>Early Warning Triggered</h2>
              </div>
              <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: 14 }}>
                Subtle vital shifts detected before clinical decompensation.
              </p>
            </div>
            {hoursToShock && (
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 12, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Predictive Window</div>
                <div style={{ fontSize: 32, fontWeight: 700, color: '#ef4444', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Clock size={24} /> ~{hoursToShock.toFixed(1)}h
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>until likely organ dysfunction</div>
              </div>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
            {/* qSOFA breakdown */}
            <div style={{ padding: 16, background: 'rgba(0,0,0,0.2)', borderRadius: 8, border: `1px solid ${rrElevated ? '#ef4444' : 'var(--border-glass)'}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Resp Rate (≥22)</span>
                <Wind size={16} color={rrElevated ? '#ef4444' : 'var(--status-normal)'} />
              </div>
              <div style={{ fontSize: 24, fontWeight: 600, color: rrElevated ? '#ef4444' : 'var(--text-primary)' }}>{current.rr}</div>
            </div>
            <div style={{ padding: 16, background: 'rgba(0,0,0,0.2)', borderRadius: 8, border: `1px solid ${bpLow ? '#ef4444' : 'var(--border-glass)'}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Systolic BP (≤100)</span>
                <Activity size={16} color={bpLow ? '#ef4444' : 'var(--status-normal)'} />
              </div>
              <div style={{ fontSize: 24, fontWeight: 600, color: bpLow ? '#ef4444' : 'var(--text-primary)' }}>{current.sbp}</div>
            </div>
            <div style={{ padding: 16, background: 'rgba(0,0,0,0.2)', borderRadius: 8, border: `1px solid ${ams ? '#ef4444' : 'var(--border-glass)'}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Altered Mental Status</span>
                <AlertTriangle size={16} color={ams ? '#ef4444' : 'var(--status-normal)'} />
              </div>
              <div style={{ fontSize: 16, fontWeight: 600, color: ams ? '#ef4444' : 'var(--status-normal)' }}>{ams ? 'YES' : 'Normal'}</div>
            </div>
          </div>

          <div style={{ padding: 16, background: '#1e1b4b', borderRadius: 8, borderLeft: '4px solid #8b5cf6' }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: 14, color: '#c4b5fd' }}>Trajectory Enhance (+0.5 Risk)</h4>
            <div style={{ display: 'flex', gap: 24 }}>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                <strong style={{ color: 'var(--text-primary)' }}>Temp:</strong> +0.8°C / 3hrs <Thermometer size={12} style={{ display: 'inline', color: '#fb7185' }} />
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                <strong style={{ color: 'var(--text-primary)' }}>HR:</strong> +14 bpm / 3hrs <Activity size={12} style={{ display: 'inline', color: '#fb7185' }} />
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                <strong style={{ color: 'var(--text-primary)' }}>HRV DFA:</strong> -18% (Loss of complexity)
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Action Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <GlassCard style={{ flex: 1, background: isHighRisk ? 'rgba(239, 68, 68, 0.05)' : 'var(--bg-card)' }}>
             <h3 style={{ margin: '0 0 16px 0', fontSize: 16 }}>Urgent Care Pathway</h3>
             <ul style={{ paddingLeft: 16, margin: 0, fontSize: 14, lineHeight: 1.8, color: 'var(--text-primary)' }}>
               <li>Draw blood cultures before starting antibiotics</li>
               <li>Measure lactate level. Remeasure if initial &gt; 2 mmol/L</li>
               <li>Administer broad-spectrum antibiotics</li>
               <li>Begin rapid administration of 30 mL/kg crystalloid for hypotension or lactate ≥4</li>
             </ul>
             <button style={{
               marginTop: 24, width: '100%', padding: '12px', borderRadius: 8,
               background: '#ef4444', color: 'white', fontWeight: 600, border: 'none', cursor: 'pointer',
               boxShadow: '0 0 15px rgba(239, 68, 68, 0.4)'
             }}>
               Acknowledge & Trigger Order Set
             </button>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
