import { useOutletContext } from 'react-router-dom';
import { Activity, Heart, Thermometer, Wind, Droplets, BrainCircuit, ShieldAlert, Sparkles } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { VitalsState } from '../hooks/useVitals';
import VitalCard from '../components/VitalCard';
import GlassCard from '../components/GlassCard';
import { useRole } from '../hooks/RoleContext';
import { usePatient } from '../hooks/PatientContext';

export default function VitalsOverview() {
  const { current, history, anomalies } = useOutletContext<VitalsState>();
  const { role } = useRole();
  const { patient } = usePatient();

  if (!current) return null;

  const hrSpark = history.slice(-20).map(r => r.hr);
  const spo2Spark = history.slice(-20).map(r => r.spo2);
  const tempSpark = history.slice(-20).map(r => r.temp);
  const rrSpark = history.slice(-20).map(r => r.rr);
  const bpSpark = history.slice(-20).map(r => r.sbp); // Simplified to SBP

  const getStatus = (vital: string) => anomalies.find(a => a.vital.includes(vital))?.severity || 'normal';

  // Generate synthetic HRV & Stability data for the advanced chart
  const advancedMetrics = history.slice(-20).map((r, i) => ({
    time: `-${20 - i}m`,
    hrv: Math.round(50 + Math.sin(i) * 10 + (r.hr > 90 ? -15 : 10)),
    stability: Math.max(0, 100 - (r.hr > 100 ? 20 : 0) - (r.spo2 < 95 ? 15 : 0) + Math.sin(i * 2) * 5)
  }));

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, margin: '0 0 8px 0' }}>Vitals Overview</h1>
          <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
            Real-time multi-modal monitoring. <span style={{ color: 'var(--accent-cyan)' }}>Context: {current.context}</span>
          </p>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: 20,
        marginBottom: 24
      }}>
        <VitalCard
          title="Heart Rate"
          value={current.hr}
          unit="bpm"
          icon={<Heart />}
          sparklineData={hrSpark}
          status={getStatus('Heart')}
          trend={hrSpark[hrSpark.length - 1] > hrSpark[0] ? 'up' : 'stable'}
          color="var(--accent-cyan)"
        />
        <VitalCard
          title="SpO₂"
          value={current.spo2}
          unit="%"
          icon={<Wind />}
          sparklineData={spo2Spark}
          status={getStatus('SpO')}
          trend={spo2Spark[spo2Spark.length - 1] < spo2Spark[0] ? 'down' : 'stable'}
          color="var(--accent-emerald)"
        />
        <VitalCard
          title="Temperature"
          value={current.temp}
          unit="°C"
          icon={<Thermometer />}
          sparklineData={tempSpark}
          status={getStatus('Temp')}
          trend={tempSpark[tempSpark.length - 1] > tempSpark[0] ? 'up' : 'stable'}
          color="var(--accent-rose)"
        />
        <VitalCard
          title="Respiratory Rate"
          value={current.rr}
          unit="br/min"
          icon={<Activity />}
          sparklineData={rrSpark}
          status={getStatus('Resp')}
          trend="stable"
          color="var(--accent-violet)"
        />
        <VitalCard
          title="Blood Pressure"
          value={`${current.sbp}/${current.dbp}`}
          unit="mmHg"
          icon={<Droplets />}
          sparklineData={bpSpark}
          status={getStatus('Systolic')}
          trend="stable"
          color="var(--accent-amber)"
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 20 }}>
        {/* Advanced Chart: Multi-Modal Context Analysis */}
        <GlassCard>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
            <BrainCircuit size={20} color="var(--accent-cyan)" />
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>Multi-Modal Context Analysis</h3>
          </div>

          <div style={{ height: 240, width: '100%', marginBottom: 16 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={advancedMetrics} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorHrv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent-cyan)" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="var(--accent-cyan)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorStability" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent-emerald)" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="var(--accent-emerald)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="time" stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ background: 'rgba(15,23,42,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, backdropFilter: 'blur(10px)' }}
                  itemStyle={{ fontSize: 13 }}
                  labelStyle={{ display: 'none' }}
                />
                <Area type="monotone" dataKey="hrv" name="HRV Complexity" stroke="var(--accent-cyan)" strokeWidth={2} fillOpacity={1} fill="url(#colorHrv)" />
                <Area type="monotone" dataKey="stability" name="Stability Score" stroke="var(--accent-emerald)" strokeWidth={2} fillOpacity={1} fill="url(#colorStability)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div style={{ fontSize: 13, color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.03)', padding: 12, borderRadius: 8, border: '1px solid rgba(255,255,255,0.05)' }}>
            {role === 'physician' ? (
              <div style={{ display: 'flex', gap: 16 }}>
                <div><strong style={{ color: 'var(--text-primary)' }}>HRV (DFA):</strong> 0.85 (Sympathetic dominance)</div>
                <div><strong style={{ color: 'var(--text-primary)' }}>Context:</strong> Post-meal sitting</div>
              </div>
            ) : role === 'caregiver' ? (
              <p style={{ margin: 0 }}>{patient?.name || 'Patient'} is resting. Their heart rate variability indicates steady recovery.</p>
            ) : (
              <p style={{ margin: 0 }}>Your body is currently relaxed. System is learning your resting patterns.</p>
            )}
          </div>
        </GlassCard>

        {/* AI Clinical Reasoning Feed */}
        <GlassCard>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
            <Sparkles size={20} color="var(--accent-amber)" />
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>AI Clinical Reasoning</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxHeight: 290, overflowY: 'auto', paddingRight: 4 }}>
            {anomalies.filter(a => a.severity !== 'normal').length === 0 ? (
              <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.02)', borderRadius: 12, border: '1px dashed rgba(255,255,255,0.1)' }}>
                <Heart size={32} style={{ opacity: 0.3, margin: '0 auto 12px' }} />
                No active anomalies requiring reasoning interventions.
              </div>
            ) : (
              anomalies.filter(a => a.severity !== 'normal').map((a, i) => (
                <div key={i} style={{
                  padding: 16,
                  borderRadius: 12,
                  background: `rgba(${a.severity === 'critical' ? '239,68,68' : '251,191,36'}, 0.08)`,
                  border: `1px solid rgba(${a.severity === 'critical' ? '239,68,68' : '251,191,36'}, 0.2)`,
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: 3, background: `var(--status-${a.severity})` }} />
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    <ShieldAlert size={16} color={`var(--status-${a.severity})`} style={{ marginTop: 2, flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
                        {a.vital} Vector Deviation
                      </div>
                      <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                        {a.message}
                      </div>
                      {role === 'physician' && (
                        <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid rgba(255,255,255,0.05)', fontSize: 12, color: 'var(--accent-amber)' }}>
                          <strong>AI Suggestion:</strong> Review recent medication adherence timeframe. High correlation with post-prandial stress.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}

            {/* Synthetic baseline reasoning card to always show something */}
            {anomalies.filter(a => a.severity !== 'normal').length < 2 && (
              <div style={{
                padding: 16,
                borderRadius: 12,
                background: 'rgba(52,211,153, 0.05)',
                border: '1px solid rgba(52,211,153, 0.15)',
                position: 'relative'
              }}>
                <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: 3, background: 'var(--status-normal)' }} />
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <BrainCircuit size={16} color="var(--status-normal)" style={{ marginTop: 2, flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
                      Baseline Adaptation Complete
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                      The learning model has integrated the last 24h of vitals telemetry. The expected SpO2 floor for this patient is now correctly adjusted to 91% due to documented pre-existing conditions.
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
