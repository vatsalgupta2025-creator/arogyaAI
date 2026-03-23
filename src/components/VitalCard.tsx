import { ReactNode } from 'react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import GlassCard from './GlassCard';
import StatusBadge from './StatusBadge';
import { useRole } from '../hooks/RoleContext';

interface VitalCardProps {
  title: string;
  value: number | string;
  unit: string;
  icon: ReactNode;
  sparklineData: number[];
  status: 'normal' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
  baselineMedian?: number;
  narrativePatient?: string;
  narrativePhysician?: string;
  color?: string;
}

const TrendIcon = ({ trend }: { trend: 'up' | 'down' | 'stable' }) => {
  if (trend === 'up') return <TrendingUp size={14} style={{ color: '#fbbf24' }} />;
  if (trend === 'down') return <TrendingDown size={14} style={{ color: '#fb7185' }} />;
  return <Minus size={14} style={{ color: '#34d399' }} />;
};

export default function VitalCard({
  title, value, unit, icon, sparklineData, status, trend,
  baselineMedian, narrativePatient, narrativePhysician, color = '#22d3ee'
}: VitalCardProps) {
  const { role } = useRole();

  const chartData = sparklineData.map((v, i) => ({ v, i }));

  const glowType = status === 'critical' ? 'rose' : status === 'warning' ? 'amber' : 'none';

  const narrativeText = role === 'patient'
    ? (narrativePatient || (status === 'normal' ? 'Within your normal range. ✓' : 'Slightly outside your usual range.'))
    : (narrativePhysician || `${value}${unit} — ${status === 'normal' ? 'WNL' : `Δ from baseline ${baselineMedian || '—'}${unit}`}`);

  return (
    <GlassCard glow={glowType} hover className="vital-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ color, opacity: 0.8 }}>{icon}</span>
          <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}>{title}</span>
        </div>
        <StatusBadge status={status} size="sm" />
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 8 }}>
        <span style={{ fontSize: 36, fontWeight: 700, fontFamily: 'var(--font-mono)', color }}>
          {typeof value === 'number' ? value.toFixed(1) : value}
        </span>
        <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>{unit}</span>
        <TrendIcon trend={trend} />
      </div>

      {/* Sparkline */}
      <div style={{ height: 40, marginBottom: 8 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <Line
              type="monotone"
              dataKey="v"
              stroke={color}
              strokeWidth={1.5}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Narrative */}
      <p style={{
        fontSize: 11,
        color: 'var(--text-muted)',
        margin: 0,
        lineHeight: 1.4,
        fontStyle: role === 'patient' ? 'normal' : 'italic',
      }}>
        {narrativeText}
      </p>
    </GlassCard>
  );
}
