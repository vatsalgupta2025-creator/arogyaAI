import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { ShieldCheck, AlertTriangle, Users } from 'lucide-react';
import GlassCard from '../components/GlassCard';

export default function EquityAudit() {
  const biasData = [
    { skinTone: 'I (Light)', errorRate: 0.2, overestimation: 0.1 },
    { skinTone: 'II', errorRate: 0.3, overestimation: 0.2 },
    { skinTone: 'III', errorRate: 0.5, overestimation: 0.5 },
    { skinTone: 'IV (Olive)', errorRate: 1.2, overestimation: 1.5 },
    { skinTone: 'V (Brown)', errorRate: 2.5, overestimation: 2.8 },
    { skinTone: 'VI (Dark)', errorRate: 3.8, overestimation: 4.2 }, // Hypoxia missed ~4% of time
  ];

  const radarData = [
    { metric: 'Sensitivity', male: 0.88, female: 0.85 },
    { metric: 'Specificity', male: 0.92, female: 0.91 },
    { metric: 'Time-to-alert', male: 0.85, female: 0.82 },
    { metric: 'False Pos', male: 0.90, female: 0.94 },
    { metric: 'Forecast Acc', male: 0.86, female: 0.87 },
  ];

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, margin: '0 0 8px 0' }}>Algorithmic Equity Audit</h1>
        <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
          Continuous fairness monitoring stratified by patient demographics.
        </p>
      </div>

      {/* Overview stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 24 }}>
        <GlassCard>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
            <ShieldCheck size={16} color="var(--accent-emerald)" /> Bias Adjustments Active
          </div>
          <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--accent-emerald)', fontFamily: 'var(--font-mono)' }}>14</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Compensatory rules applied across 3 modalities</div>
        </GlassCard>
        <GlassCard>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
            <Users size={16} /> Demographics Monitored
          </div>
          <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>4</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Race, Sex, Age Cohort, BMI Group</div>
        </GlassCard>
        <GlassCard glow="rose" style={{ border: '1px solid rgba(239, 68, 68, 0.3)' }}>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
            <AlertTriangle size={16} color="#ef4444" /> Disparities Detected
          </div>
          <div style={{ fontSize: 32, fontWeight: 700, color: '#ef4444', fontFamily: 'var(--font-mono)' }}>1</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>SpO₂ optical sensor bias on Fitzpatrick V-VI</div>
        </GlassCard>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 24 }}>
        <GlassCard>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
            <div>
              <h3 style={{ margin: '0 0 8px 0', fontSize: 16 }}>SpO₂ Overestimation by Skin Tone</h3>
              <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)' }}>Standard pulse oximeters overestimate oxygenation in darker skin tones, missing silent hypoxia.</p>
            </div>
          </div>
          <div style={{ height: 300, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={biasData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="skinTone" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis unit="%" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-glass)', borderRadius: 8 }}
                />
                <ReferenceLine y={2.0} stroke="#ef4444" strokeDasharray="3 3" label={{ position: 'top', value: 'FDA Critical Threshold', fill: '#ef4444', fontSize: 11 }} />
                <Bar dataKey="overestimation" name="Mean Overestimation (%)" fill="var(--accent-cyan)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div style={{ padding: 16, background: 'rgba(52, 211, 153, 0.1)', borderLeft: '3px solid var(--accent-emerald)', borderRadius: 4, marginTop: 16 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent-emerald)', textTransform: 'uppercase' }}>Auto-Correction Active</span>
            <p style={{ margin: '4px 0 0 0', fontSize: 13, color: 'var(--text-primary)' }}>
              Patient identified as Fitzpatrick V (Brown). System is automatically applying a <strong>-2.5% conservative shift</strong> to SpO₂ alert thresholds to prevent missed hypoxic events.
            </p>
          </div>
        </GlassCard>

        <GlassCard>
          <h3 style={{ margin: '0 0 8px 0', fontSize: 16 }}>Sepsis Model Performance by Sex</h3>
          <p style={{ margin: '0 0 20px 0', fontSize: 13, color: 'var(--text-secondary)' }}>Tracking sensitivity parity across 5 key metrics.</p>
          
          <div style={{ height: 280, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                <PolarGrid stroke="rgba(255,255,255,0.1)" />
                <PolarAngleAxis dataKey="metric" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} />
                <PolarRadiusAxis angle={30} domain={[0, 1]} tick={false} axisLine={false} />
                <Radar name="Male" dataKey="male" stroke="var(--accent-cyan)" fill="var(--accent-cyan)" fillOpacity={0.2} />
                <Radar name="Female" dataKey="female" stroke="var(--accent-rose)" fill="var(--accent-rose)" fillOpacity={0.3} />
                <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-glass)', borderRadius: 8 }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-muted)' }}>
              <div style={{ width: 12, height: 12, background: 'rgba(34, 211, 238, 0.5)', border: '1px solid var(--accent-cyan)' }} /> Male Cohort
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-muted)' }}>
              <div style={{ width: 12, height: 12, background: 'rgba(251, 113, 133, 0.5)', border: '1px solid var(--accent-rose)' }} /> Female Cohort
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
