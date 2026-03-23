import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  glow?: 'cyan' | 'emerald' | 'rose' | 'amber' | 'none';
  onClick?: () => void;
  style?: React.CSSProperties;
}

const glowMap = {
  cyan: 'var(--glow-cyan)',
  emerald: 'var(--glow-emerald)',
  rose: 'var(--glow-rose)',
  amber: 'var(--glow-amber)',
  none: 'none',
};

export default function GlassCard({ children, className = '', hover = true, glow = 'none', onClick, style }: GlassCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={`glass-card ${className}`}
      style={{
        padding: '24px',
        cursor: onClick ? 'pointer' : 'default',
        boxShadow: glow !== 'none' ? glowMap[glow] : undefined,
        ...style,
      }}
      whileHover={hover ? { scale: 1.01, y: -2 } : undefined}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
}
