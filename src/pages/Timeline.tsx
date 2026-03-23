import { useState, useMemo } from 'react';
import { generateTimelineEvents, TimelineEvent } from '../data/patient';
import { Clock, Activity, Pill, FileText, AlertTriangle, Play, Filter } from 'lucide-react';
import GlassCard from '../components/GlassCard';

export default function Timeline() {
  const [events] = useState<TimelineEvent[]>(generateTimelineEvents());
  const [filter, setFilter] = useState<'all' | 'alert' | 'medication' | 'vital'>('all');

  const filteredEvents = useMemo(() => {
    return events.filter(e => filter === 'all' || e.type === filter).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }, [events, filter]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'vital': return <Activity size={18} />;
      case 'medication': return <Pill size={18} />;
      case 'report': return <FileText size={18} />;
      case 'prediction': return <Play size={18} />;
      case 'alert':
      case 'action': return <AlertTriangle size={18} />;
      default: return <Clock size={18} />;
    }
  };

  const getColor = (severity: string) => {
    switch (severity) {
      case 'critical': return '#ef4444';
      case 'warning': return '#fbbf24';
      case 'info': return '#34d399';
      default: return '#60a5fa';
    }
  };

  const formatTime = (d: Date) => d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const formatDate = (d: Date) => d.toLocaleDateString([], { month: 'short', day: 'numeric' });

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <div style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, margin: '0 0 8px 0' }}>Patient Timeline</h1>
          <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
            Chronological audit log of multi-modal events and AI inferences.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {(['all', 'alert', 'medication', 'vital'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                background: filter === f ? 'rgba(56,189,248,0.1)' : 'transparent',
                border: filter === f ? '1px solid var(--accent-cyan)' : '1px solid var(--border-glass)',
                color: filter === f ? 'var(--accent-cyan)' : 'var(--text-muted)',
                padding: '6px 12px',
                borderRadius: 20,
                fontSize: 13,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                textTransform: 'capitalize'
              }}
            >
              {f === 'all' ? <Filter size={14} /> : null} {f}
            </button>
          ))}
        </div>
      </div>

      <GlassCard style={{ padding: '32px 24px' }}>
        <div style={{ position: 'relative' }}>
          {/* Vertical line */}
          <div style={{
            position: 'absolute', top: 0, bottom: 0, left: 160, width: 2,
            background: 'linear-gradient(to bottom, var(--accent-cyan), var(--bg-card))'
          }} />

          {filteredEvents.map((evt, i) => {
            const color = getColor(evt.severity);
            return (
              <div key={evt.id} style={{
                display: 'flex',
                alignItems: 'flex-start',
                marginBottom: i === filteredEvents.length - 1 ? 0 : 32,
                position: 'relative'
              }}>
                {/* Time col */}
                <div style={{ width: 140, textAlign: 'right', paddingRight: 32, paddingTop: 4 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{formatTime(evt.timestamp)}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{formatDate(evt.timestamp)}</div>
                </div>

                {/* Node icon */}
                <div style={{
                  width: 32, height: 32, borderRadius: '50%', background: 'var(--bg-primary)',
                  border: `2px solid ${color}`, position: 'absolute', left: 160, top: 0, transform: 'translateX(-50%)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: color, zIndex: 10
                }}>
                  {getIcon(evt.type)}
                </div>

                {/* Content col */}
                <div style={{ flex: 1, paddingLeft: 40 }}>
                  <div style={{
                    background: `linear-gradient(90deg, ${color}11, transparent)`,
                    border: `1px solid ${color}33`,
                    borderLeft: `3px solid ${color}`,
                    borderRadius: 8,
                    padding: 16,
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                      <h4 style={{ margin: 0, fontSize: 16, color: 'var(--text-primary)' }}>{evt.title}</h4>
                      <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 100, background: `${color}22`, color: color, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        {evt.type}
                      </span>
                    </div>
                    <p style={{ margin: 0, fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                      {evt.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </GlassCard>
    </div>
  );
}
