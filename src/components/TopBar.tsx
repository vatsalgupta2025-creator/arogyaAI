import { useRole } from '../hooks/RoleContext';
import { PATIENT } from '../data/patient';
import { Bell, User } from 'lucide-react';
import StatusBadge from './StatusBadge';

interface TopBarProps {
  stabilityScore: number;
  alertCount: number;
}

export default function TopBar({ stabilityScore, alertCount }: TopBarProps) {
  const { roleLabel, roleColor } = useRole();

  const overallStatus: 'normal' | 'warning' | 'critical' = stabilityScore >= 80 ? 'normal' : stabilityScore >= 50 ? 'warning' : 'critical';

  return (
    <header style={{
      height: 64,
      background: 'rgba(6, 10, 20, 0.9)',
      borderBottom: '1px solid var(--border-glass)',
      backdropFilter: 'blur(20px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 28px',
      position: 'sticky',
      top: 0,
      zIndex: 50,
    }}>
      {/* Left: Patient info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{
          width: 36,
          height: 36,
          borderRadius: '50%',
          background: `linear-gradient(135deg, ${roleColor}33, ${roleColor}11)`,
          border: `1px solid ${roleColor}44`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <User size={18} style={{ color: roleColor }} />
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{PATIENT.name}</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            {PATIENT.age}y • {PATIENT.sex} • {PATIENT.id} • {PATIENT.conditions.slice(0, 2).join(', ')}
          </div>
        </div>
      </div>

      {/* Center: Stability */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <StatusBadge status={overallStatus} label={`Stability: ${Math.round(stabilityScore)}%`} size="md" />
      </div>

      {/* Right: Alerts + Role */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ position: 'relative', cursor: 'pointer' }}>
          <Bell size={20} style={{ color: 'var(--text-secondary)' }} />
          {alertCount > 0 && (
            <span style={{
              position: 'absolute',
              top: -6,
              right: -6,
              width: 18,
              height: 18,
              borderRadius: '50%',
              background: '#ef4444',
              color: 'white',
              fontSize: 10,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              {alertCount}
            </span>
          )}
        </div>
        <div style={{
          padding: '4px 12px',
          borderRadius: 8,
          background: `${roleColor}15`,
          border: `1px solid ${roleColor}33`,
          fontSize: 11,
          fontWeight: 600,
          color: roleColor,
        }}>
          {roleLabel}
        </div>
      </div>
    </header>
  );
}
