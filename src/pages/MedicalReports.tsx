import { useState } from 'react';
import { Upload, FileText, CheckCircle2, AlertTriangle, ArrowRight, Activity, Wind } from 'lucide-react';
import { MEDICAL_REPORT } from '../data/patient';
import GlassCard from '../components/GlassCard';
import { useRole } from '../hooks/RoleContext';

export default function MedicalReports() {
  const { role } = useRole();
  const [uploaded, setUploaded] = useState(false);
  const [parsing, setParsing] = useState(false);

  const handleUpload = () => {
    setParsing(true);
    setTimeout(() => {
      setParsing(false);
      setUploaded(true);
    }, 1500);
  };

  if (role !== 'physician') {
    return (
      <div style={{ maxWidth: 800, margin: '100px auto', textAlign: 'center' }}>
        <GlassCard>
          <FileText size={48} style={{ color: 'var(--accent-cyan)', margin: '0 auto 24px auto' }} />
          <h2 style={{ fontSize: 24, marginBottom: 16 }}>Clinical History Intact</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 16, lineHeight: 1.6 }}>
            Your full medical history, lab results, and previous physician notes have been securely integrated into your AI monitoring profile to provide perfectly personalized care.
          </p>
        </GlassCard>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, margin: '0 0 8px 0' }}>Medical Report Integration</h1>
        <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
          LLaMA 3.2 unstructured PDF parsing to auto-adjust physiological AI baselines.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Upload Zone */}
        <GlassCard>
          <h3 style={{ margin: '0 0 16px 0', fontSize: 16 }}>Upload Patient Record</h3>
          <div
            onClick={!uploaded && !parsing ? handleUpload : undefined}
            style={{
              border: `2px dashed ${uploaded ? 'var(--accent-emerald)' : 'var(--border-glass)'}`,
              borderRadius: 12,
              padding: 40,
              textAlign: 'center',
              cursor: (!uploaded && !parsing) ? 'pointer' : 'default',
              background: uploaded ? 'rgba(52,211,153,0.05)' : 'rgba(0,0,0,0.2)',
              transition: 'all 0.3s'
            }}
          >
            {parsing ? (
              <div style={{ color: 'var(--accent-cyan)' }}>
                <div style={{
                  width: 40, height: 40, border: '3px solid var(--accent-cyan)',
                  borderTopColor: 'transparent', borderRadius: '50%',
                  margin: '0 auto 16px auto', animation: 'spin 1s linear infinite'
                }} />
                <div>Parsing via LLaMA 3.2 7B...</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 8 }}>Extracting entities & clinical logic rules</div>
              </div>
            ) : uploaded ? (
              <div style={{ color: 'var(--status-normal)' }}>
                <CheckCircle2 size={48} style={{ margin: '0 auto 16px auto' }} />
                <div style={{ fontSize: 18, fontWeight: 600 }}>Report Parsed Successfully</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 8 }}>Dr. Sharma_Discharge_Aug24.pdf</div>
              </div>
            ) : (
              <div style={{ color: 'var(--text-muted)' }}>
                <Upload size={48} style={{ margin: '0 auto 16px auto' }} />
                <div style={{ fontSize: 16, color: 'var(--text-primary)', marginBottom: 8 }}>Drag & drop clinical PDF</div>
                <div style={{ fontSize: 13 }}>or click to browse</div>
              </div>
            )}
          </div>
        </GlassCard>

        {/* Extracted Entities */}
        <div style={{ opacity: uploaded ? 1 : 0.3, transition: 'opacity 0.5s', pointerEvents: uploaded ? 'auto' : 'none' }}>
          <GlassCard style={{ height: '100%' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: 16 }}>Extracted Entities</h3>

            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8 }}>Conditions</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {MEDICAL_REPORT.diagnoses.map(d => (
                  <span key={d} style={{ padding: '4px 10px', background: 'rgba(56,189,248,0.1)', color: 'var(--accent-cyan)', borderRadius: 100, fontSize: 12 }}>{d}</span>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8 }}>Active Meds</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {MEDICAL_REPORT.medications.map(m => (
                  <span key={m.name} style={{ padding: '4px 10px', background: 'rgba(167,139,250,0.1)', color: 'var(--accent-violet)', borderRadius: 100, fontSize: 12 }}>{m.name} ({m.dosage})</span>
                ))}
              </div>
            </div>

            <div style={{ padding: 12, background: 'rgba(239, 68, 68, 0.1)', borderLeft: '3px solid #ef4444', borderRadius: 4, marginTop: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#ef4444', fontWeight: 600, fontSize: 14, marginBottom: 4 }}>
                <AlertTriangle size={16} /> Past History: Sepsis
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Pre-test probability for early sepsis warnings increased by +15%.</div>
            </div>
          </GlassCard>
        </div>
      </div>

      {uploaded && (
        <GlassCard style={{ marginTop: 24 }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: 16 }}>AI Baseline Auto-Adjustments</h3>
          <div style={{ border: '1px solid var(--border-glass)', borderRadius: 8, overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 3fr', background: 'rgba(0,0,0,0.4)', padding: '12px 16px', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              <div>Trigger Entity</div>
              <div>Baseline Adjustment</div>
              <div>Clinical Reasoning</div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 3fr', padding: '16px', borderTop: '1px solid var(--border-glass)', alignItems: 'center', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: 'var(--accent-emerald)' }}>
                <Activity size={16} /> Hypertension
              </div>
              <div style={{ fontSize: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ color: 'var(--text-muted)', textDecoration: 'line-through' }}>120/80</span>
                <ArrowRight size={14} color="var(--text-muted)" />
                <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>135-145 SBP</span>
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Accepting higher normotensive range to prevent false alarms for stage 2 HTN.</div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 3fr', padding: '16px', borderTop: '1px solid var(--border-glass)', alignItems: 'center', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: 'var(--accent-violet)' }}>
                <Wind size={16} /> Asthma
              </div>
              <div style={{ fontSize: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ color: 'var(--text-muted)' }}>SpO2 Alert: &lt;95%</span>
                <ArrowRight size={14} color="var(--text-muted)" />
                <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Alert: &lt;93% OR -3% drop/hr</span>
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>More sensitive to trajectory velocity than absolute threshold due to mild persistence.</div>
            </div>

             <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 3fr', padding: '16px', borderTop: '1px solid var(--border-glass)', alignItems: 'center', gap: 16, background: 'rgba(239, 68, 68, 0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: 'var(--accent-rose)' }}>
                <AlertTriangle size={16} /> Beta-Blocker
              </div>
              <div style={{ fontSize: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ color: 'var(--text-muted)' }}>Max HR: 180</span>
                <ArrowRight size={14} color="var(--text-muted)" />
                <span style={{ color: '#ef4444', fontWeight: 600 }}>Max HR: 120</span>
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                <strong style={{ color: '#ef4444' }}>Conflict Rule Added:</strong> Patient on active beta-blocker. If HR &gt; 100, alert for severe sympathetic drive overriding medication, or poor adherence.
              </div>
            </div>

          </div>
        </GlassCard>
      )}

      <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
