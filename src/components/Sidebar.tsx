import { NavLink } from 'react-router-dom';
import { useRole, Role } from '../hooks/RoleContext';
import {
  Activity, TrendingUp, Stethoscope, AlertTriangle,
  FileText, Clock, Users, ShieldCheck, Sliders, ChevronLeft, ChevronRight, Bot, HeartPulse, Pill, Heart, Download, Upload
} from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { path: '/dashboard', label: 'Vitals Overview', icon: <Activity size={18} />, end: true },
  { path: '/dashboard/trajectory', label: 'Trajectory Forecast', icon: <TrendingUp size={18} /> },
  { path: '/dashboard/chatbot', label: 'AI Health Copilot', icon: <Bot size={18} /> },
  { path: '/dashboard/diagnosis', label: 'Differential Dx', icon: <Stethoscope size={18} /> },
  { path: '/dashboard/sepsis', label: 'Sepsis Warning', icon: <AlertTriangle size={18} /> },
  { path: '/dashboard/simple-predict', label: 'Quick Health Check', icon: <HeartPulse size={18} /> },
  { path: '/dashboard/data-importer', label: 'Data Importer', icon: <Upload size={18} /> },
  { path: '/dashboard/fetal-monitoring', label: 'Fetal Monitoring', icon: <HeartPulse size={18} /> },
  { path: '/dashboard/reports', label: 'Medical Reports', icon: <FileText size={18} /> },
  { path: '/dashboard/timeline', label: 'Patient Timeline', icon: <Clock size={18} /> },
  { divider: true },
  { path: '/dashboard/medications', label: 'Medications', icon: <Pill size={18} /> },
  { path: '/dashboard/health-score', label: 'Health Score', icon: <Heart size={18} /> },
  { path: '/dashboard/export', label: 'Export Reports', icon: <Download size={18} /> },
  { divider: true },
  { path: '/dashboard/caregiver', label: 'Caregiver View', icon: <Users size={18} /> },
  { path: '/dashboard/equity', label: 'Equity Audit', icon: <ShieldCheck size={18} /> },
  { path: '/dashboard/baseline', label: 'Personal Baseline', icon: <Sliders size={18} /> },
] as const;

const roles: { value: Role; label: string; color: string }[] = [
  { value: 'patient', label: 'Patient', color: '#34d399' },
  { value: 'caregiver', label: 'Caregiver', color: '#fbbf24' },
  { value: 'physician', label: 'Physician', color: '#60a5fa' },
];

export default function Sidebar() {
  const { role, setRole, roleColor } = useRole();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside style={{
      width: collapsed ? 72 : 280,
      minHeight: '100vh',
      background: 'rgba(6, 10, 20, 0.95)',
      borderRight: '1px solid var(--border-glass)',
      backdropFilter: 'blur(20px)',
      display: 'flex',
      flexDirection: 'column',
      transition: 'width 0.3s cubic-bezier(0.4,0,0.2,1)',
      position: 'fixed',
      top: 0,
      left: 0,
      zIndex: 100,
      overflow: 'hidden',
    }}>
      {/* Logo */}
      <div style={{
        padding: collapsed ? '20px 16px' : '20px 24px',
        borderBottom: '1px solid var(--border-glass)',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        justifyContent: collapsed ? 'center' : 'flex-start',
      }}>
        <div className="flex items-center text-amber-500 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 shrink-0">
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
          </svg>
        </div>
        {!collapsed && (
          <span className="text-xl font-heading italic font-bold tracking-tight bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-600 bg-clip-text text-transparent drop-shadow-[0_0_8px_rgba(251,191,36,0.3)]">
            Arogya
          </span>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          style={{
            marginLeft: collapsed ? 0 : 'auto',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid var(--border-glass)',
            borderRadius: 8,
            padding: 4,
            cursor: 'pointer',
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '12px 8px', overflowY: 'auto' }}>
        {navItems.map((item, i) => {
          if ('divider' in item) return <div key={i} style={{ height: 1, background: 'var(--border-glass)', margin: '8px 12px' }} />;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={'end' in item ? item.end : false}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: collapsed ? '10px 0' : '10px 16px',
                justifyContent: collapsed ? 'center' : 'flex-start',
                borderRadius: 10,
                marginBottom: 2,
                fontSize: 13,
                fontWeight: isActive ? 600 : 400,
                color: isActive ? '#22d3ee' : 'var(--text-secondary)',
                background: isActive ? 'rgba(34,211,238,0.08)' : 'transparent',
                borderLeft: isActive ? '3px solid #22d3ee' : '3px solid transparent',
                textDecoration: 'none',
                transition: 'all 0.2s ease',
              })}
            >
              <span style={{ flexShrink: 0 }}>{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Role Switcher */}
      <div style={{
        padding: collapsed ? '16px 8px' : '16px 20px',
        borderTop: '1px solid var(--border-glass)',
      }}>
        {!collapsed && (
          <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8, display: 'block' }}>
            View Mode
          </span>
        )}
        <div style={{ display: 'flex', flexDirection: collapsed ? 'column' : 'row', gap: 4 }}>
          {roles.map(r => (
            <button
              key={r.value}
              onClick={() => setRole(r.value)}
              style={{
                flex: collapsed ? undefined : 1,
                padding: collapsed ? '8px' : '6px 8px',
                borderRadius: 8,
                border: role === r.value ? `1px solid ${r.color}` : '1px solid var(--border-glass)',
                background: role === r.value ? `${r.color}15` : 'transparent',
                color: role === r.value ? r.color : 'var(--text-muted)',
                fontSize: 11,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              title={r.label}
            >
              {collapsed ? r.label[0] : r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Status */}
      <div style={{
        padding: collapsed ? '12px 8px' : '12px 20px',
        borderTop: '1px solid var(--border-glass)',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        justifyContent: collapsed ? 'center' : 'flex-start',
      }}>
        <span
          className="pulse-normal"
          style={{ width: 8, height: 8, borderRadius: '50%', background: roleColor, flexShrink: 0 }}
        />
        {!collapsed && (
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>System Active</span>
        )}
      </div>
    </aside>
  );
}
