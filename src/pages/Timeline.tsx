import { useState, useMemo, useEffect } from 'react';
import {
  Clock, Activity, Pill, FileText, Filter, ChevronRight,
  Stethoscope, Syringe, Zap, X, User
} from 'lucide-react';
import { usePatient } from '../hooks/PatientContext';

// ─── Data ────────────────────────────────────────────────────────────────────
interface Event {
  id: string;
  type: 'vital' | 'medication' | 'alert' | 'lab' | 'clinical' | 'procedure';
  severity: 'critical' | 'warning' | 'normal' | 'info';
  title: string;
  detail: string;
  values?: { label: string; value: string; flag?: 'H' | 'L' | 'C' }[];
  timestamp: Date;
  tag?: string;
}
// ─── Event Generator ──────────────────────────────────────────────────────────
const generateEvents = (patient: any): Event[] => {
  const events: Event[] = [];
  const now = new Date();
  
  for (let i = 0; i <= 72; i++) {
    const dt = new Date(now.getTime() - i * 3600000);
    const hr = Math.floor(70 + Math.random() * 20);
    const sbp = Math.floor(110 + Math.random() * 30);
    const dbp = Math.floor(70 + Math.random() * 15);
    const spo2 = Math.floor(95 + Math.random() * 5);
    
    let severity: 'normal' | 'warning' | 'critical' = 'normal';
    let title = 'Routine Vitals Check';
    let type: 'vital' | 'medication' | 'alert' | 'lab' | 'clinical' | 'procedure' = 'vital';
    let detail = `Routine hourly vitals recorded. Patient is resting comfortably.`;
    
    if (hr > 100 || sbp > 140) {
        severity = 'warning';
        title = 'Elevated Vitals Detected';
        detail = `Mildly elevated metrics observed during hourly check. Monitoring closely.`;
    }
    if (spo2 < 92) {
        severity = 'critical';
        title = 'Critical SpO₂ Dip';
        detail = `SpO₂ has dropped below 92%. Automated alert sent to duty nurse.`;
        type = 'alert';
    }

    events.push({
       id: `evt-${i}`,
       type,
       severity,
       timestamp: dt,
       title,
       tag: 'Hourly',
       detail,
       values: [
          { label: 'HR', value: `${hr} bpm`, flag: hr > 100 ? 'H' : undefined },
          { label: 'BP', value: `${sbp}/${dbp} mmHg`, flag: sbp > 140 ? 'H' : undefined },
          { label: 'SpO₂', value: `${spo2}%`, flag: spo2 < 92 ? 'C' : undefined }
       ]
    });

    if (i % 8 === 0) {
       events.push({
          id: `med-${i}`,
          type: 'medication',
          severity: 'info',
          timestamp: new Date(dt.getTime() + 1800000), // Off by 30 mins
          title: 'Scheduled Medication',
          tag: 'MAR',
          detail: 'Routine scheduled medication administered successfully.',
          values: [{ label: 'Status', value: 'Administered ✓' }]
       });
    }
  }
  
  // Admission Event
  events.push({
     id: 'admission',
     type: 'clinical',
     severity: 'info',
     timestamp: new Date(now.getTime() - 72 * 3600000),
     title: 'Patient Admission — ED',
     tag: 'Admission',
     detail: `${patient?.name || 'Patient'}, ${patient?.age || '67'} ${patient?.gender || 'F'}, admitted with primary condition: ${patient?.disease || 'Not Specified'}. Arogya AI Timeline initialized.`,
     values: [{ label: 'Source', value: 'Emergency Dept' }, { label: 'Status', value: 'Admitted' }]
  });

  return events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const SEV: Record<string, { grad: string; glow: string; ring: string; badge: string; icon: string; leftBorder: string }> = {
  critical: {
    grad: 'from-red-500/10 via-transparent',
    glow: 'shadow-[0_0_20px_rgba(239,68,68,0.15)]',
    ring: 'border-white/[0.04]',
    leftBorder: 'border-l-red-500',
    badge: 'bg-red-500/10 text-red-400 border-red-500/20',
    icon: 'bg-red-500/10 text-red-400 border-red-500/20',
  },
  warning: {
    grad: 'from-amber-500/5 via-transparent',
    glow: 'shadow-[0_0_15px_rgba(245,158,11,0.08)]',
    ring: 'border-white/[0.04]',
    leftBorder: 'border-l-amber-500',
    badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    icon: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  },
  normal: {
    grad: 'from-emerald-500/5 via-transparent',
    glow: '',
    ring: 'border-white/[0.04]',
    leftBorder: 'border-l-emerald-500',
    badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    icon: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  },
  info: {
    grad: 'from-indigo-500/5 via-transparent',
    glow: '',
    ring: 'border-white/[0.04]',
    leftBorder: 'border-l-indigo-500',
    badge: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    icon: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  },
};

const TYPE_ICON: Record<string, React.ReactElement> = {
  vital: <Activity className="w-5 h-5" />,
  medication: <Pill className="w-5 h-5" />,
  alert: <Zap className="w-5 h-5" />,
  lab: <FileText className="w-5 h-5" />,
  clinical: <Stethoscope className="w-5 h-5" />,
  procedure: <Syringe className="w-5 h-5" />,
};

const FLAG_CLS: Record<string, string> = {
  H: 'text-red-300 bg-red-500/10 border-red-500/30',
  L: 'text-amber-300 bg-amber-500/10 border-amber-500/30',
  C: 'text-red-300 bg-red-500/20 border-red-400/50 animate-pulse font-black',
};

type FilterType = 'all' | Event['type'];

// ─── Component ────────────────────────────────────────────────────────────────
export default function Timeline() {
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [expandedId, setExpandedId] = useState<string | null>('e1');
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const { patient } = usePatient();
  useEffect(() => { setTimeout(() => setMounted(true), 50); }, []);

  const ALL_EVENTS = useMemo(() => generateEvents(patient), [patient]);

  const filtered = useMemo(() => {
    return activeFilter === 'all' ? ALL_EVENTS : ALL_EVENTS.filter(e => e.type === activeFilter);
  }, [activeFilter, ALL_EVENTS]);

  // Group by date
  const grouped = useMemo(() => {
    const map: { date: string; events: Event[]; daysAgo: number }[] = [];
    for (const evt of filtered) {
      const label = evt.timestamp.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: '2-digit' });
      const last = map[map.length - 1];
      if (last?.date === label) last.events.push(evt);
      else {
        const now = new Date(); const then = new Date(evt.timestamp);
        const days = Math.floor((now.getTime() - then.getTime()) / 86400000);
        map.push({ date: label, events: [evt], daysAgo: days });
      }
    }
    return map;
  }, [filtered]);

  const detailEvent = ALL_EVENTS.find(e => e.id === detailId);

  const FILTERS: { key: FilterType; label: string; color: string }[] = [
    { key: 'all', label: 'All Events', color: 'text-white' },
    { key: 'alert', label: 'Alerts', color: 'text-red-400' },
    { key: 'vital', label: 'Vitals', color: 'text-emerald-400' },
    { key: 'medication', label: 'Medications', color: 'text-purple-400' },
    { key: 'lab', label: 'Labs', color: 'text-cyan-400' },
    { key: 'clinical', label: 'Clinical', color: 'text-indigo-400' },
    { key: 'procedure', label: 'Procedures', color: 'text-amber-400' },
  ];

  return (
    <>
      {/* Detail Modal */}
      {detailEvent && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
          onClick={() => setDetailId(null)}
        >
          <div
            className={`w-full max-w-lg rounded-2xl bg-[#0a1020] border ${SEV[detailEvent.severity].ring} ${SEV[detailEvent.severity].glow} overflow-hidden`}
            onClick={e => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className={`p-6 bg-gradient-to-br ${SEV[detailEvent.severity].grad} to-transparent border-b border-white/[0.06]`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl border ${SEV[detailEvent.severity].icon}`}>
                    {TYPE_ICON[detailEvent.type]}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${SEV[detailEvent.severity].badge}`}>
                        {detailEvent.type}
                      </span>
                      {detailEvent.tag && (
                        <span className="text-[10px] text-white/30 bg-white/[0.05] border border-white/[0.08] px-2 py-0.5 rounded-full">
                          {detailEvent.tag}
                        </span>
                      )}
                    </div>
                    <h2 className="text-base font-bold text-white leading-tight">{detailEvent.title}</h2>
                  </div>
                </div>
                <button onClick={() => setDetailId(null)} className="text-white/30 hover:text-white/80 transition-colors mt-1">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-xs text-white/40 mt-3">
                {detailEvent.timestamp.toLocaleString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>

            {/* Modal body */}
            <div className="p-6 space-y-4">
              <p className="text-sm text-white/70 leading-relaxed">{detailEvent.detail}</p>
              {detailEvent.values && (
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {detailEvent.values.map((v, i) => (
                    <div key={i} className={`flex items-center justify-between px-3 py-2.5 rounded-xl border text-xs ${v.flag ? FLAG_CLS[v.flag] : 'bg-white/[0.04] border-white/[0.08] text-white/70'}`}>
                      <span className="text-white/40">{v.label}</span>
                      <span className="font-black">{v.value} {v.flag && (v.flag === 'L' ? '↓' : v.flag === 'C' ? '⚠' : '↑')}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto pb-16 space-y-6">
        {/* ── Header ── */}
        <div
          className="rounded-2xl bg-gradient-to-br from-[#0e1a2e] to-[#0a1020] border border-white/[0.08] p-7 relative overflow-hidden"
          style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(-12px)', transition: 'all 0.5s cubic-bezier(0.16,1,0.3,1)' }}
        >
          {/* background glow */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(56,189,248,0.07),transparent_60%)] pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(139,92,246,0.05),transparent_60%)] pointer-events-none" />

          <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-cyan-500/15 rounded-xl border border-cyan-500/20">
                  <Clock className="w-5 h-5 text-cyan-400" />
                </div>
                <h1 className="text-3xl font-black text-white tracking-tight">Patient Timeline</h1>
              </div>
              <p className="text-white/40 text-sm ml-[52px]">Chronological clinical audit — {patient?.name || 'Patient'} · PT-2024-0847</p>
            </div>

            {/* Stats */}
            <div className="flex gap-3 ml-[52px] sm:ml-0">
              {[
                { v: ALL_EVENTS.length, l: 'Events', c: 'text-white', bg: 'bg-white/[0.04]', border: 'border-white/[0.08]' },
                { v: ALL_EVENTS.filter(e => e.severity === 'critical').length, l: 'Critical', c: 'text-red-400', bg: 'bg-red-500/5', border: 'border-red-500/20' },
                { v: ALL_EVENTS.filter(e => e.type === 'alert').length, l: 'Alerts', c: 'text-amber-400', bg: 'bg-amber-500/5', border: 'border-amber-500/20' },
                { v: 3, l: 'Days', c: 'text-cyan-400', bg: 'bg-cyan-500/5', border: 'border-cyan-500/20' },
              ].map(s => (
                <div key={s.l} className={`rounded-xl px-4 py-2.5 text-center border ${s.bg} ${s.border}`}>
                  <div className={`text-2xl font-black ${s.c}`}>{s.v}</div>
                  <div className="text-[10px] text-white/25 uppercase tracking-wider mt-0.5">{s.l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Patient pill */}
          <div className="relative mt-5 flex items-center gap-3 bg-white/[0.04] border border-white/[0.07] rounded-xl px-4 py-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-500/30 to-purple-500/20 border border-white/10 flex items-center justify-center flex-shrink-0">
              <User className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-black text-white">{patient?.name || 'Patient'} <span className="font-normal text-white/30">· {patient?.age || '67'}y {patient?.gender?.charAt(0) || 'F'} · PT-2024-0847</span></p>
              <p className="text-[11px] text-white/35 mt-0.5">{patient?.disease || 'Condition not specified'} · Active Monitoring</p>
            </div>
            <div className="hidden sm:flex gap-2">
              <span className="text-[10px] font-black px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">● ACTIVE MONITORING</span>
              <span className="text-[10px] font-black px-2.5 py-1 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-full">PHYSICIAN VIEW</span>
            </div>
          </div>
        </div>

        {/* ── Filters ── */}
        <div
          className="flex flex-wrap gap-2"
          style={{ opacity: mounted ? 1 : 0, transition: 'opacity 0.5s 0.15s' }}
        >
          {FILTERS.map(f => {
            const count = f.key === 'all' ? ALL_EVENTS.length : ALL_EVENTS.filter(e => e.type === f.key).length;
            const active = activeFilter === f.key;
            return (
              <button
                key={f.key}
                onClick={() => setActiveFilter(f.key)}
                className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition-all duration-200 ${active
                  ? 'bg-white/10 border-white/20 text-white shadow-lg scale-105'
                  : 'bg-white/[0.02] border-white/[0.07] text-white/40 hover:bg-white/[0.05] hover:text-white/70 hover:border-white/15'
                  }`}
              >
                {f.key !== 'all' && <span className={`w-1.5 h-1.5 rounded-full ${active ? 'opacity-100' : 'opacity-40'} ${f.color.replace('text-', 'bg-')}`} />}
                <span className={active ? f.color : ''}>{f.label}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${active ? 'bg-white/15 text-white' : 'bg-white/[0.05] text-white/25'}`}>{count}</span>
              </button>
            );
          })}
        </div>

        {/* ── Timeline ── */}
        <div className="flex overflow-x-auto pb-24 pt-8 px-12 snap-x custom-scrollbar">
          {grouped.map(({ date, events: dayEvts, daysAgo }, gi) => (
            <div
              key={date}
              className="flex flex-col flex-shrink-0 snap-start"
              style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'translateX(0)' : 'translateX(30px)', transition: `all 0.6s cubic-bezier(0.16,1,0.3,1) ${0.1 + gi * 0.1}s` }}
            >
              {/* ── The Track Row (Horizontal Line & Day Node) ── */}
              <div className="relative flex items-center h-16 w-full">
                {/* The continuous horizontal line */}
                <div className="absolute w-full h-[2px] bg-gradient-to-r from-white/10 via-white/10 to-transparent top-1/2 -translate-y-1/2 left-0" />
                
                {/* The Day Date Node */}
                <div className="relative z-10 flex items-center gap-3 bg-[#0a1020] border border-cyan-500/30 px-5 py-2 rounded-full shadow-[0_0_20px_rgba(34,211,238,0.15)] ml-4">
                  <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,1)]" />
                  <span className="text-xs font-black text-cyan-400 tracking-widest uppercase">{date}</span>
                  {daysAgo === 0 && <span className="text-[9px] font-black text-[#0a1020] bg-cyan-400 px-2 py-0.5 rounded-full ml-1">TODAY</span>}
                </div>
              </div>

              {/* ── Events Horizontal List (Hanging below the track) ── */}
              <div className="flex gap-10 px-8 pt-10">
                {dayEvts.map((evt, ei) => {
                  const s = SEV[evt.severity];
                  const expanded = expandedId === evt.id;
                  const hovered = hoveredId === evt.id;
                  return (
                    <div
                      key={evt.id}
                      className="relative w-[340px] flex-shrink-0 flex flex-col items-center group cursor-pointer"
                      style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(20px)', transition: `all 0.4s cubic-bezier(0.16,1,0.3,1) ${0.25 + gi * 0.05 + ei * 0.04}s` }}
                      onMouseEnter={() => setHoveredId(evt.id)}
                      onMouseLeave={() => setHoveredId(null)}
                      onClick={() => setExpandedId(expanded ? null : evt.id)}
                    >
                      {/* Vertical connector line up to the main track */}
                      <div className={`absolute w-[2px] h-10 -top-10 left-1/2 -translate-x-1/2 transition-colors duration-300 ${hovered || expanded ? s.icon.split(' ')[1].replace('text-', 'bg-') : 'bg-white/10'}`} />
                      
                      {/* Node on the track connection point */}
                      <div className={`absolute w-3 h-3 rounded-full border-[3px] border-[#0a1020] -top-10 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 transition-colors duration-300 ${hovered || expanded ? s.icon.split(' ')[1].replace('text-', 'bg-') : 'bg-white/30'}`} />

                      {/* Interactive Rich "Image" Card */}
                      <div className={`w-full flex flex-col rounded-[24px] border border-white/10 bg-white/[0.02] backdrop-blur-md overflow-hidden transition-all duration-400 shadow-xl ${hovered || expanded ? 'shadow-[0_20px_50px_-15px_rgba(0,0,0,0.5)] -translate-y-2 border-white/20' : ''}`}>
                        
                        {/* Card Header (Rich Banner) */}
                        <div className={`relative w-full h-20 bg-gradient-to-r ${s.grad} border-b border-white/[0.05] flex items-center px-5 overflow-hidden`}>
                          {/* Aesthetic backdrop rings */}
                          <div className={`absolute -right-4 -top-8 w-24 h-24 rounded-full border-[20px] opacity-10 blur-xl ${s.leftBorder.replace('border-l', 'border')}`} />
                          
                          <div className={`w-11 h-11 rounded-2xl bg-[#0a1020]/40 backdrop-blur-md flex items-center justify-center border border-white/10 ${s.icon} shadow-lg z-10`}>
                            {TYPE_ICON[evt.type]}
                          </div>
                          <div className="ml-4 z-10 relative">
                            <div className="flex gap-2 items-center">
                              <span className={`text-[10px] font-black uppercase tracking-widest ${s.icon.split(' ')[1]}`}>{evt.type}</span>
                              {evt.tag && <span className="text-[9px] font-bold text-white/30 border border-white/10 px-1.5 py-0.5 rounded-full">{evt.tag}</span>}
                            </div>
                            <div className="text-white/40 text-[11px] font-bold mt-1 flex flex-row items-center gap-1.5">
                              <Clock className="w-3 h-3" />
                              {evt.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        </div>

                        {/* Card Body */}
                        <div className="p-6">
                          <h3 className="text-[16px] font-bold text-white/90 leading-tight mb-3 line-clamp-2 min-h-[40px]">{evt.title}</h3>
                          
                          {evt.severity === 'critical' && (
                            <div className="mb-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 text-red-400 text-[10px] font-black border border-red-500/20 uppercase tracking-widest">
                              <div className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping" />
                              Critical Alert
                            </div>
                          )}
                          {evt.severity === 'warning' && (
                            <div className="mb-4 inline-flex px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-[10px] font-black border border-amber-500/20 uppercase tracking-widest">
                              Warning Intervention
                            </div>
                          )}

                          {/* Expandable Details */}
                          <div className={`transition-all duration-300 overflow-hidden ${expanded ? 'max-h-[300px] opacity-100 mt-2' : 'max-h-0 opacity-0'}`}>
                            <div className="pt-4 border-t border-white/[0.06]">
                              <p className="text-[13px] text-white/60 leading-relaxed mb-4">{evt.detail}</p>
                              {evt.values && (
                                <div className="flex flex-wrap gap-2">
                                  {evt.values.map((v, i) => (
                                    <div key={i} className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs ${v.flag ? FLAG_CLS[v.flag] : 'border-white/10 bg-white/[0.03] text-white/70'}`}>
                                      <span className="text-white/40">{v.label}</span>
                                      <span className="font-black text-white/90">{v.value}</span>
                                      {v.flag === 'H' && <span className="text-[10px] font-black">↑</span>}
                                      {v.flag === 'L' && <span className="text-[10px] font-black">↓</span>}
                                      {v.flag === 'C' && <span className="text-[10px] font-black">⚠</span>}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {/* Accordion Toggle Indicator */}
                          <div className={`pt-4 mt-2 border-t border-white/[0.03] flex justify-center items-center transition-all ${expanded ? 'opacity-50' : 'opacity-30 hover:opacity-100'}`}>
                            <div className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                              {expanded ? 'Hide Details' : 'View Details'}
                              <ChevronRight className={`w-3.5 h-3.5 transition-transform duration-300 ${expanded ? '-rotate-90' : 'rotate-90'}`} />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-white/20">
            <Filter className="w-12 h-12 opacity-20" />
            <p className="text-sm">No events match this filter</p>
            <button onClick={() => setActiveFilter('all')} className="text-xs text-cyan-400 hover:underline">Clear filter</button>
          </div>
        )}
      </div>
    </>
  );
}
