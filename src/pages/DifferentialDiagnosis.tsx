import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { ChevronDown, ChevronUp, FileText, CheckCircle2 } from 'lucide-react';
import { VitalsState } from '../hooks/useVitals';
import GlassCard from '../components/GlassCard';
import { useRole } from '../hooks/RoleContext';

interface Diagnosis {
  id: string;
  condition: string;
  probability: number;
  evidence: string[];
  nextSteps: string[];
  caveats: string;
  color: string;
}

const diagnoses: Diagnosis[] = [
  {
    id: 'dx1',
    condition: 'Early Sepsis',
    probability: 0.42,
    evidence: [
      'Temperature rose 0.8°C over 3 hours (fever trend)',
      'HR increased from 78→92 (tachycardia)',
      'HRV complexity dropped 18% (parasympathetic withdrawal)',
      'Patient reports chills (from notes)',
      'History of past sepsis (Aug 2024)'
    ],
    nextSteps: [
      'Order: Blood cultures, lactate, CBC',
      'If not done: Start empiric antibiotics within 1 hour',
      'Monitor: Temp, HR, RR, SpO2 every 15 min'
    ],
    caveats: 'High confidence limited by: SpO2 still >94% (argues against severe sepsis), no documented focal infection yet.',
    color: '#ef4444' // red
  },
  {
    id: 'dx2',
    condition: 'Dehydration',
    probability: 0.28,
    evidence: [
      'Patient reports reduced PO intake today',
      'HR tachycardia (compensatory volume depletion response)',
      'However: Temperature elevation usually absent in pure dehydration'
    ],
    nextSteps: [
      'IV fluid challenge (500mL NS over 30 min)',
      'Reassess HR, BP, UOP post-fluid'
    ],
    caveats: 'Does not fully explain the temperature rise or the steep HRV drop.',
    color: '#fbbf24' // amber
  },
  {
    id: 'dx3',
    condition: 'Anxiety/Stress Response',
    probability: 0.18,
    evidence: [
      'Peak HR spike coincided with patient checking phone (stressor)',
      'RR slightly elevated but SpO2 unchanged',
      'Blood pressure transiently elevated'
    ],
    nextSteps: [
      'Reassurance and monitoring',
      'Guided breathing exercise'
    ],
    caveats: 'Diagnosis of exclusion. High fever makes this much less likely.',
    color: '#34d399' // emerald
  }
];

export default function DifferentialDiagnosis() {
  const { current } = useOutletContext<VitalsState>();
  const { role } = useRole();
  const [expandedId, setExpandedId] = useState<string>(diagnoses[0].id);

  if (!current) return null;

  if (role !== 'physician') {
    return (
      <div style={{ maxWidth: 800, margin: '100px auto', textAlign: 'center' }}>
        <GlassCard>
          <CheckCircle2 size={48} style={{ color: 'var(--accent-emerald)', margin: '0 auto 24px auto' }} />
          <h2 style={{ fontSize: 24, marginBottom: 16 }}>Clinical Analysis Active</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 16, lineHeight: 1.6 }}>
            The system is continuously analyzing your vital signs in the background. If any patterns require attention, they will be securely forwarded to Dr. Sharma for review.
          </p>
        </GlassCard>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, margin: '0 0 8px 0' }}>Differential Diagnosis Engine</h1>
          <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
            Explainable AI logic ranked by Bayesian pre-test probability, mapped to actionable clinical steps.
          </p>
        </div>
        <button style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: 'var(--bg-card)', border: '1px solid var(--border-glass)',
          padding: '8px 16px', borderRadius: 8, color: 'var(--text-primary)', cursor: 'pointer'
        }}>
          <FileText size={16} /> Generate EHR Note
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {diagnoses.map((dx, index) => {
          const isExpanded = expandedId === dx.id;
          return (
            <GlassCard key={dx.id} hover={false} style={{ padding: 0, overflow: 'hidden' }}>
              <div
                onClick={() => setExpandedId(isExpanded ? '' : dx.id)}
                style={{
                  padding: '20px 24px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  background: isExpanded ? 'rgba(255,255,255,0.02)' : 'transparent'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 24, flex: 1 }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: `${dx.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: dx.color, fontWeight: 700, fontSize: 18 }}>
                    #{index + 1}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                      <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>{dx.condition}</h3>
                      <span style={{ fontSize: 14, color: dx.color, fontWeight: 600 }}>{(dx.probability * 100).toFixed(0)}%</span>
                    </div>
                    {/* Progress bar */}
                    <div style={{ height: 6, background: 'var(--bg-primary)', borderRadius: 3, overflow: 'hidden', width: '100%', maxWidth: 300 }}>
                      <div style={{ height: '100%', width: `${dx.probability * 100}%`, background: dx.color, borderRadius: 3 }} />
                    </div>
                  </div>
                </div>
                {isExpanded ? <ChevronUp size={20} color="var(--text-muted)" /> : <ChevronDown size={20} color="var(--text-muted)" />}
              </div>

              {isExpanded && (
                <div style={{ padding: '0 24px 24px 88px', borderTop: '1px solid var(--border-glass)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, marginTop: 24 }}>
                    <div>
                      <h4 style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: 12 }}>Supporting Evidence</h4>
                      <ul style={{ margin: 0, paddingLeft: 16, color: 'var(--text-primary)', fontSize: 14, lineHeight: 1.6 }}>
                        {dx.evidence.map((ev, i) => <li key={i} style={{ marginBottom: 6 }}>{ev}</li>)}
                      </ul>
                    </div>
                    <div>
                      <h4 style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: 12 }}>Recommended Workup</h4>
                      <ul style={{ margin: 0, paddingLeft: 16, color: 'var(--text-primary)', fontSize: 14, lineHeight: 1.6 }}>
                        {dx.nextSteps.map((step, i) => <li key={i} style={{ marginBottom: 6 }}>{step}</li>)}
                      </ul>
                    </div>
                  </div>
                  <div style={{ marginTop: 24, padding: 16, background: 'rgba(255,255,255,0.03)', borderRadius: 8, borderLeft: '3px solid var(--text-muted)' }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>AI LIMITATION / CAVEAT</span>
                    <p style={{ margin: '4px 0 0 0', fontSize: 13, color: 'var(--text-secondary)' }}>{dx.caveats}</p>
                  </div>
                </div>
              )}
            </GlassCard>
          );
        })}
      </div>

      <div style={{ marginTop: 32, padding: 24, background: '#0f172a', border: '1px solid var(--border-glass)', borderRadius: 12, fontFamily: 'var(--font-mono)' }}>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 12 }}>Auto-Generated EHR Note Summary</div>
        <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.5 }}>
          VITAL SIGN ALERT - EARLY SEPSIS (PROBABLE)

          Interpretation: Patient's vital sign pattern over the last 3 hours is most consistent with Early Sepsis (Pre-test prob: 42%).
          Key findings: Temperature rose 0.8°C (fever trend), HR increased from 78→92 (tachycardia), HRV complexity dropped 18%.

          Recommended workup: Order Blood cultures, lactate, CBC. Consider empiric antibiotics if indicated.

          Differential considerations: Dehydration (28%), Anxiety/Stress Response (18%).

          AI Confidence: 78% [Caveat: SpO2 still normal argues against severe pulmonary sepsis]
        </pre>
      </div>
    </div>
  );
}
