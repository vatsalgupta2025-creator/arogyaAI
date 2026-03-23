interface StatusBadgeProps {
  status: 'normal' | 'warning' | 'critical' | 'info' | 'learning';
  label?: string;
  pulse?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const statusConfig = {
  normal: { bg: 'rgba(52, 211, 153, 0.15)', color: '#34d399', border: 'rgba(52, 211, 153, 0.3)', defaultLabel: 'Normal' },
  warning: { bg: 'rgba(251, 191, 36, 0.15)', color: '#fbbf24', border: 'rgba(251, 191, 36, 0.3)', defaultLabel: 'Warning' },
  critical: { bg: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', border: 'rgba(239, 68, 68, 0.3)', defaultLabel: 'Critical' },
  info: { bg: 'rgba(96, 165, 250, 0.15)', color: '#60a5fa', border: 'rgba(96, 165, 250, 0.3)', defaultLabel: 'Info' },
  learning: { bg: 'rgba(167, 139, 250, 0.15)', color: '#a78bfa', border: 'rgba(167, 139, 250, 0.3)', defaultLabel: 'Learning' },
};

const sizeConfig = {
  sm: { padding: '2px 8px', fontSize: '10px', dotSize: 6 },
  md: { padding: '4px 12px', fontSize: '11px', dotSize: 8 },
  lg: { padding: '6px 16px', fontSize: '13px', dotSize: 10 },
};

export default function StatusBadge({ status, label, pulse = true, size = 'md' }: StatusBadgeProps) {
  const cfg = statusConfig[status];
  const sz = sizeConfig[size];

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      padding: sz.padding,
      borderRadius: 100,
      background: cfg.bg,
      border: `1px solid ${cfg.border}`,
      fontSize: sz.fontSize,
      fontWeight: 600,
      color: cfg.color,
      letterSpacing: '0.02em',
      textTransform: 'uppercase',
    }}>
      <span
        className={pulse ? `pulse-${status === 'info' ? 'normal' : status}` : ''}
        style={{
          width: sz.dotSize,
          height: sz.dotSize,
          borderRadius: '50%',
          backgroundColor: cfg.color,
          flexShrink: 0,
        }}
      />
      {label || cfg.defaultLabel}
    </span>
  );
}
