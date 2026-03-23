import { ReactNode } from 'react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
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



  const narrativeText = role === 'patient'
    ? (narrativePatient || (status === 'normal' ? 'Within your normal range. ✓' : 'Slightly outside your usual range.'))
    : (narrativePhysician || `${value}${unit} — ${status === 'normal' ? 'WNL' : `Δ from baseline ${baselineMedian || '—'}${unit}`}`);

  const bgGradients = {
    critical: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(239, 68, 68, 0.02) 100%)',
    warning: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(245, 158, 11, 0.02) 100%)',
    normal: 'linear-gradient(135deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0.01) 100%)'
  };

  const borders = {
    critical: '1px solid rgba(239, 68, 68, 0.3)',
    warning: '1px solid rgba(245, 158, 11, 0.2)',
    normal: '1px solid rgba(255, 255, 255, 0.08)'
  };

  return (
    <div 
      className={`rounded-2xl transition-all duration-300 hover:scale-[1.02] cursor-default`}
      style={{
        background: bgGradients[status],
        border: borders[status],
        boxShadow: status === 'critical' ? '0 0 30px rgba(239, 68, 68, 0.15)' : 'none',
        backdropFilter: 'blur(20px)',
        overflow: 'hidden',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Top section */}
      <div style={{ padding: '20px 20px 12px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ 
              backgroundColor: `${color}15`, 
              color: color,
              padding: '6px', 
              borderRadius: '10px',
              border: `1px solid ${color}30`
            }}>
              {icon}
            </div>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>{title}</span>
          </div>
          <StatusBadge status={status} size="sm" />
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, marginTop: 12 }}>
          <span style={{ 
            fontSize: 38, 
            fontWeight: 800, 
            fontFamily: 'var(--font-mono)', 
            color,
            lineHeight: 1,
            textShadow: `0 0 20px ${color}40`,
            letterSpacing: '-0.02em'
          }}>
            {typeof value === 'number' ? value.toFixed(1) : value}
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2, paddingBottom: 4 }}>
            <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>{unit}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <TrendIcon trend={trend} />
              <span style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Trend</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sparkline */}
      <div style={{ height: 45, width: '100%', marginTop: 'auto' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 0, left: 0, bottom: 5 }}>
            <Line
              type="monotone"
              dataKey="v"
              stroke={color}
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Narrative Footer */}
      <div style={{ 
        padding: '12px 20px', 
        borderTop: '1px solid rgba(255,255,255,0.04)',
        background: 'rgba(0,0,0,0.1)'
      }}>
        <p style={{
          fontSize: 11,
          color: 'var(--text-muted)',
          margin: 0,
          fontWeight: 500,
          fontStyle: role === 'patient' ? 'normal' : 'italic',
        }}>
          {narrativeText}
        </p>
      </div>
    </div>
  );
}
