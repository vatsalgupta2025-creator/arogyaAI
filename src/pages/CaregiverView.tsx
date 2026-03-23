import { useOutletContext } from 'react-router-dom';
import { Heart, Moon, PhoneCall, ShieldCheck } from 'lucide-react';
import { VitalsState } from '../hooks/useVitals';
import GlassCard from '../components/GlassCard';

export default function CaregiverView() {
  const { current, stabilityScore } = useOutletContext<VitalsState>();

  if (!current) return null;

  const getMessage = () => {
    if (stabilityScore > 80) return "Sarah's rhythm is perfectly stable. Rest easy.";
    if (stabilityScore > 50) return "Sarah's body is working slightly harder than usual. The system is monitoring her closely.";
    return "We've detected a significant shift. Dr. Sharma has been notified. We recommend giving Sarah a gentle, non-urgent call when you are free.";
  };

  // Mock caregiver stress data
  const checksToday = 14;
  const nightChecks = 4;
  const isStressed = checksToday > 10 || nightChecks > 2;

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <div style={{ marginBottom: 32, textAlign: 'center' }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: '0 0 8px 0', color: 'var(--text-primary)' }}>
          Family Updates
        </h1>
        <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: 16 }}>
          Keeping you connected to Sarah's wellbeing.
        </p>
      </div>

      <GlassCard glow={stabilityScore > 80 ? 'emerald' : 'none'} style={{ padding: '40px 24px', textAlign: 'center', marginBottom: 24 }}>
        <Heart
          size={64}
          color={stabilityScore > 80 ? 'var(--accent-emerald)' : 'var(--accent-amber)'}
          style={{ margin: '0 auto 24px auto', animation: 'pulse-normal 3s infinite' }}
        />
        <div style={{ fontSize: 72, fontWeight: 800, lineHeight: 1, marginBottom: 16 }}>
          {stabilityScore}%
        </div>
        <div style={{ fontSize: 18, fontWeight: 500, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          Stability Score
        </div>
        <p style={{ marginTop: 24, fontSize: 20, lineHeight: 1.5, color: 'var(--text-primary)', maxWidth: 500, margin: '24px auto 0 auto' }}>
          {getMessage()}
        </p>
      </GlassCard>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Caregiver Wellness */}
        <GlassCard>
          <h3 style={{ margin: '0 0 16px 0', fontSize: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Moon size={18} color="var(--accent-violet)" /> Caregiver Wellness
          </h3>
          <div style={{ padding: 16, background: 'rgba(0,0,0,0.2)', borderRadius: 8, marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: 14 }}>App checks today:</span>
              <span style={{ fontWeight: 600, color: isStressed ? '#ef4444' : 'var(--text-primary)' }}>{checksToday}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Late-night checks (2am-6am):</span>
              <span style={{ fontWeight: 600, color: isStressed ? '#ef4444' : 'var(--text-primary)' }}>{nightChecks}</span>
            </div>
          </div>
          {isStressed && (
            <div style={{ padding: 12, background: 'rgba(167, 139, 250, 0.1)', color: '#c4b5fd', borderRadius: 8, fontSize: 13, lineHeight: 1.5 }}>
              We've noticed you checking very frequently during the night. Sarah's vitals are actively monitored by our 24/7 AI and clinical team. <strong>Please prioritize your own rest tonight.</strong>
            </div>
          )}
        </GlassCard>

        {/* Delegated Actions */}
        <GlassCard>
          <h3 style={{ margin: '0 0 16px 0', fontSize: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <ShieldCheck size={18} color="var(--accent-blue)" /> Active Delegation
          </h3>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 20 }}>
            You have medical proxy authorization. You can trigger clinical actions directly.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <button style={{
              background: 'rgba(56, 189, 248, 0.1)', border: '1px solid var(--accent-cyan)', color: 'var(--accent-cyan)',
              padding: '12px', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontWeight: 600
            }}>
              <PhoneCall size={16} /> Schedule Telehealth Check-in
            </button>
            <button style={{
              background: 'transparent', border: '1px solid var(--border-glass)', color: 'var(--text-primary)',
              padding: '12px', borderRadius: 8, cursor: 'pointer', fontWeight: 500
            }}>
              Send Weekly Summary to Family Group
            </button>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
