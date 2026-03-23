import { useState, useEffect, useMemo } from 'react';
import {
  CheckCircle2, AlertTriangle, Activity, Sparkles,
  Stethoscope, Heart, Thermometer, Wind, Pill, ClipboardList, Flame
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip,
  ResponsiveContainer, CartesianGrid, Cell
} from 'recharts';

const GEMINI_KEY = 'AIzaSyCxSQJ15kTH0UpYoUK6QEi8U46qn4gFahk';

/* ── classify each vital ── */
function getFlags(hr: number, temp: number, spo2: number) {
  const f: string[] = [];
  if (hr < 60) f.push('Bradycardia (HR < 60)');
  if (hr > 100) f.push('Tachycardia (HR > 100)');
  if (temp > 38) f.push('Fever (Temp > 38°C)');
  if (temp > 39.5) f.push('High Fever (> 39.5°C)');
  if (temp < 36) f.push('Hypothermia (< 36°C)');
  if (spo2 < 90) f.push('Severe Hypoxemia (SpO2 < 90%)');
  else if (spo2 < 95) f.push('Mild Hypoxemia (SpO2 < 95%)');
  return f;
}

/* ── clinical protocols ── */
const PROTOCOLS: Record<string, { steps: string[]; meds: string[] }> = {
  Normal: {
    steps: [
      'Continue regular monitoring every 4-6 hours',
      'Maintain adequate hydration (2-3L/day)',
      'Encourage light ambulation & deep breathing',
      'Document vitals in patient chart',
    ],
    meds: ['No pharmacological intervention needed', 'Maintain current care plan'],
  },
  Low: {
    steps: [
      'Increase monitoring to every 2 hours',
      'Assess for early signs of deterioration',
      'Ensure IV access is established',
      'Notify attending physician of borderline values',
    ],
    meds: [
      'Acetaminophen 500mg PO if temp > 37.5°C',
      'Supplemental O₂ via nasal cannula if SpO2 < 95%',
    ],
  },
  Medium: {
    steps: [
      'Continuous cardiac monitoring',
      'Hourly vital assessment',
      'Obtain 12-lead ECG if tachycardic',
      'Blood cultures ×2 if febrile',
      'Notify rapid response team if worsening',
    ],
    meds: [
      'Ibuprofen 400mg PO or Acetaminophen 1g IV for fever',
      'NS bolus 500mL if tachycardic',
      'O₂ titrate to SpO2 ≥ 95% via Venturi mask',
    ],
  },
  High: {
    steps: [
      'ACTIVATE RAPID RESPONSE TEAM',
      'Continuous telemetry & pulse oximetry',
      'ABG analysis STAT',
      'Chest X-ray and CBC STAT',
      'Prepare for ICU transfer',
    ],
    meds: [
      'Crystalloid bolus 1L NS over 30 min',
      'Piperacillin-Tazobactam 4.5g IV if sepsis suspected',
      'High-flow O₂ (15L/min non-rebreather) for SpO2 < 90%',
      'Antipyretic: Acetaminophen 1g IV q6h PRN',
    ],
  },
  Critical: {
    steps: [
      'CODE BLUE — IMMEDIATE ICU ESCALATION',
      'Secure airway — prepare for intubation',
      'Central venous access & arterial line',
      'Continuous invasive BP monitoring',
      'Consult critical care immediately',
    ],
    meds: [
      'RSI: Propofol 2mg/kg + Rocuronium 1.2mg/kg',
      'Vasopressor: Norepinephrine 0.1-0.5 mcg/kg/min',
      'Meropenem 1g IV + Vancomycin 25mg/kg IV',
      'Hydrocortisone 100mg IV q8h (refractory shock)',
    ],
  },
};

export default function SimplePrediction() {
  const [heartRate, setHeartRate] = useState(72);
  const [temperature, setTemperature] = useState(36.5);
  const [spo2, setSpo2] = useState(98);
  const [result, setResult] = useState<{ prediction: string; chartData: any[] } | null>(null);
  const [aiRec, setAiRec] = useState<{ reasoning: string; medication: string; routine: string } | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  /* ML prediction */
  const handlePredict = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/predict-basic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ heart_rate: heartRate, temperature, spo2 }),
      });
      const data = await res.json();
      setResult({
        prediction: data.prediction,
        chartData: [
          { name: 'Heart Rate', value: data.vitals['Heart Rate'], normal: 75 },
          { name: 'SpO2', value: data.vitals['SpO2'], normal: 98 },
          { name: 'Temperature', value: data.vitals['Temperature'], normal: 36.8 },
        ],
      });
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    const t = setTimeout(handlePredict, 350);
    return () => clearTimeout(t);
  }, [heartRate, temperature, spo2]);

  /* Gemini AI */
  const [aiError, setAiError] = useState<string | null>(null);

  const getAiRecommendation = async () => {
    setIsAiLoading(true);
    setAiRec(null);
    setAiError(null);
    try {
      const prompt = `You are a clinical decision-support AI. Patient vitals: HR ${heartRate} BPM, SpO2 ${spo2}%, Temp ${temperature.toFixed(1)}°C. ML result: ${result?.prediction}.
Return EXACTLY three sections separated by "---":
Section 1 (REASONING): 3-4 sentences explaining WHY these vitals indicate ${result?.prediction === 'Risk' ? 'high risk' : 'stable status'}.
---
Section 2 (MEDICATION): 3-5 specific medications with dosages. Each on new line starting with a bullet.
---
Section 3 (ROUTINE): 4-6 step-by-step actions. Each on new line starting with numbered steps.
Plain text only, no markdown formatting.`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
          }),
        }
      );

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData?.error?.message || `API returned ${response.status}`);
      }

      const data = await response.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      const parts = text.split('---').map((s: string) => s.trim());
      setAiRec({
        reasoning: parts[0] || 'Analysis pending.',
        medication: parts[1] || 'Consult physician.',
        routine: parts[2] || 'Follow standard protocols.',
      });
    } catch (err: any) {
      console.error('Gemini error:', err);
      setAiError(err?.message || 'Failed to connect to Gemini AI.');
    }
    setIsAiLoading(false);
  };

  /* Heatmap */
  const hrZone = heartRate < 60 ? 0 : heartRate > 100 ? 2 : 1;
  const spoZone = spo2 < 90 ? 2 : spo2 < 95 ? 1 : 0;
  const heatmap = [
    [{ risk: 'Low', bg: '#10b981' }, { risk: 'Medium', bg: '#f59e0b' }, { risk: 'High', bg: '#ef4444' }],
    [{ risk: 'Normal', bg: '#06b6d4' }, { risk: 'Medium', bg: '#f59e0b' }, { risk: 'High', bg: '#ef4444' }],
    [{ risk: 'High', bg: '#ef4444' }, { risk: 'High', bg: '#ef4444' }, { risk: 'Critical', bg: '#e11d48' }],
  ];
  const hrLabels = ['<60 Brady', '60-100 Normal', '>100 Tachy'];
  const spoLabels = ['≥95% Normal', '90-94% Low', '<90% Critical'];
  /* ── Compute effective risk tier (heatmap + temperature) ── */
  const heatmapTier = heatmap[hrZone][spoZone].risk;
  const TIER_ORDER = ['Normal', 'Low', 'Medium', 'High', 'Critical'];
  let tierIdx = TIER_ORDER.indexOf(heatmapTier);

  // Temperature escalation: fever or hypothermia bumps tier up
  if (temperature > 39.5) tierIdx = Math.min(tierIdx + 2, 4);       // High fever → +2 tiers
  else if (temperature > 38) tierIdx = Math.min(tierIdx + 1, 4);    // Moderate fever → +1 tier
  else if (temperature < 35) tierIdx = Math.min(tierIdx + 2, 4);    // Severe hypothermia → +2
  else if (temperature < 36) tierIdx = Math.min(tierIdx + 1, 4);    // Mild hypothermia → +1

  const currentTier = TIER_ORDER[tierIdx];
  const protocol = PROTOCOLS[currentTier] || PROTOCOLS.Normal;

  // Temperature-specific medication additions
  const tempMeds: string[] = [];
  if (temperature > 39.5) {
    tempMeds.push('Acetaminophen 1g IV q6h — high fever management');
    tempMeds.push('Ibuprofen 400mg PO q8h as adjunct antipyretic');
    tempMeds.push('Tepid sponging & active cooling measures');
    tempMeds.push('Blood cultures ×2 before starting antibiotics');
  } else if (temperature > 38) {
    tempMeds.push('Acetaminophen 500-1000mg PO q6h PRN for fever');
    tempMeds.push('Increase fluid intake to 2.5-3L/day');
    tempMeds.push('Monitor temperature every 2 hours');
  } else if (temperature < 35) {
    tempMeds.push('Active rewarming: Bair Hugger warming blanket');
    tempMeds.push('Warm IV fluids (NS 40-42°C)');
    tempMeds.push('Continuous core temperature monitoring');
    tempMeds.push('Check thyroid function (TSH, Free T4)');
  } else if (temperature < 36) {
    tempMeds.push('Passive rewarming with heated blankets');
    tempMeds.push('Warm oral fluids if patient alert');
    tempMeds.push('Monitor temperature every 1 hour');
  }
  const flags = useMemo(() => getFlags(heartRate, temperature, spo2), [heartRate, temperature, spo2]);

  const tierColor: Record<string, string> = {
    Normal: '#06b6d4', Low: '#10b981', Medium: '#f59e0b', High: '#ef4444', Critical: '#e11d48',
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* ━━ Header ━━ */}
      <div>
        <h1 className="text-3xl font-black text-white tracking-tight">Quick Health Check</h1>
        <p className="text-white/50 mt-1">Interactive ML risk prediction with built-in clinical protocols & Gemini AI recommendations</p>
      </div>

      {/* ━━ Row 1: Sliders + Risk Status ━━ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vitals Sliders */}
        <div className="rounded-2xl bg-[#0d1525] border border-white/[0.07] p-6">
          <h3 className="text-sm font-bold text-white/60 uppercase tracking-widest mb-6">Vital Parameters</h3>
          <div className="space-y-6">
            {/* Heart Rate */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-rose-400" />
                  <span className="text-sm font-semibold text-white/80">Heart Rate</span>
                  <span className="text-[11px] text-white/30">60-100 BPM</span>
                </div>
                <span className="font-mono font-black text-2xl text-white tabular-nums">{heartRate} <span className="text-sm text-white/40 font-medium">BPM</span></span>
              </div>
              <input type="range" min={40} max={220} value={heartRate}
                onChange={e => setHeartRate(+e.target.value)}
                className="w-full h-2 rounded-full appearance-none bg-slate-800 accent-rose-500 cursor-pointer" />
            </div>
            {/* Temperature */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <Thermometer className="w-4 h-4 text-amber-400" />
                  <span className="text-sm font-semibold text-white/80">Temperature</span>
                  <span className="text-[11px] text-white/30">36.5-37.5 °C</span>
                </div>
                <span className="font-mono font-black text-2xl text-white tabular-nums">{temperature.toFixed(1)} <span className="text-sm text-white/40 font-medium">°C</span></span>
              </div>
              <input type="range" min={34} max={42} step={0.1} value={temperature}
                onChange={e => setTemperature(+e.target.value)}
                className="w-full h-2 rounded-full appearance-none bg-slate-800 accent-amber-500 cursor-pointer" />
            </div>
            {/* SpO2 */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <Wind className="w-4 h-4 text-blue-400" />
                  <span className="text-sm font-semibold text-white/80">Blood Oxygen (SpO2)</span>
                  <span className="text-[11px] text-white/30">≥ 95%</span>
                </div>
                <span className="font-mono font-black text-2xl text-white tabular-nums">{spo2} <span className="text-sm text-white/40 font-medium">%</span></span>
              </div>
              <input type="range" min={70} max={100} value={spo2}
                onChange={e => setSpo2(+e.target.value)}
                className="w-full h-2 rounded-full appearance-none bg-slate-800 accent-blue-500 cursor-pointer" />
            </div>
          </div>
          {/* Flags */}
          <div className="mt-5 pt-4 border-t border-white/[0.06]">
            {flags.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {flags.map((f, i) => (
                  <span key={i} className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-red-300 bg-red-500/10 border border-red-500/20 rounded-lg px-2.5 py-1">
                    <AlertTriangle className="w-3 h-3" />{f}
                  </span>
                ))}
              </div>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-2.5 py-1">
                <CheckCircle2 className="w-3 h-3" />All vitals within normal range
              </span>
            )}
          </div>
        </div>

        {/* Risk Status + Chart */}
        <div className="rounded-2xl bg-[#0d1525] border border-white/[0.07] p-6">
          {result ? (
            <div className="space-y-5">
              {/* Status Banner */}
              <div className={`rounded-xl p-4 flex items-center gap-4 ${result.prediction === 'Risk'
                  ? 'bg-red-500/10 border border-red-500/20'
                  : 'bg-emerald-500/10 border border-emerald-500/20'
                }`}>
                {result.prediction === 'Risk'
                  ? <AlertTriangle className="w-7 h-7 text-red-400 flex-shrink-0" />
                  : <CheckCircle2 className="w-7 h-7 text-emerald-400 flex-shrink-0" />
                }
                <div>
                  <p className={`font-black text-xl ${result.prediction === 'Risk' ? 'text-red-400' : 'text-emerald-400'}`}>
                    {result.prediction === 'Risk' ? 'ELEVATED RISK' : 'VITALS STABLE'}
                  </p>
                  <p className="text-xs text-white/40 mt-0.5">
                    Zone: <span className="font-bold text-white/60">{currentTier}</span> · {flags.length} anomal{flags.length === 1 ? 'y' : 'ies'}
                  </p>
                </div>
              </div>

              {/* Bar Chart */}
              <div>
                <p className="text-xs font-bold text-white/40 uppercase tracking-widest mb-3">Vitals vs Healthy Baseline</p>
                <div className="h-48 bg-black/20 rounded-xl p-3 border border-white/[0.04]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={result.chartData} barGap={6} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                      <XAxis dataKey="name" stroke="#ffffff40" fontSize={11} tickLine={false} axisLine={false} />
                      <YAxis stroke="#ffffff40" fontSize={10} tickLine={false} axisLine={false} />
                      <RechartsTooltip
                        contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff', fontSize: 12 }}
                      />
                      <Bar dataKey="normal" name="Baseline" radius={[4, 4, 0, 0]}>
                        {result.chartData.map((_, i) => <Cell key={i} fill="rgba(255,255,255,0.07)" />)}
                      </Bar>
                      <Bar dataKey="value" name="Current" radius={[4, 4, 0, 0]} animationDuration={600}>
                        {result.chartData.map((_, i) => <Cell key={i} fill={['#f43f5e', '#3b82f6', '#f59e0b'][i]} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-white/30">
              <Activity className="w-6 h-6 mr-2" /> Loading prediction...
            </div>
          )}
        </div>
      </div>

      {/* ━━ Row 2: Heatmap + Protocol ━━ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Heatmap */}
        <div className="rounded-2xl bg-[#0d1525] border border-white/[0.07] p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-bold text-white/60 uppercase tracking-widest flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-400" /> HR × SpO2 Risk Matrix
            </h3>
            <div className="flex items-center gap-3 text-[10px] font-bold text-white/30 uppercase">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-emerald-500" />Safe</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-amber-500" />Warn</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-red-500" />Danger</span>
            </div>
          </div>

          <div className="flex gap-3">
            {/* Y labels */}
            <div className="flex flex-col justify-around w-20 flex-shrink-0">
              {[...hrLabels].reverse().map((l, i) => (
                <p key={i} className={`text-[10px] font-bold text-right leading-tight ${[2, 1, 0][i] === hrZone ? 'text-white' : 'text-white/20'}`}>{l}</p>
              ))}
            </div>
            {/* Grid */}
            <div className="flex-1">
              <div className="grid grid-cols-3 gap-2">
                {[2, 1, 0].map(row =>
                  [0, 1, 2].map(col => {
                    const cell = heatmap[row][col];
                    const active = row === hrZone && col === spoZone;
                    return (
                      <div key={`${row}-${col}`}
                        className={`h-14 rounded-lg flex flex-col items-center justify-center transition-all duration-500 relative ${active ? 'scale-105 ring-2 ring-white shadow-lg z-10' : 'opacity-20'}`}
                        style={{ backgroundColor: cell.bg }}>
                        <span className="text-[11px] font-black text-white drop-shadow-md">{active ? '● YOU' : cell.risk}</span>
                        {active && <span className="text-[9px] font-bold text-white/70 mt-0.5">{cell.risk}</span>}
                      </div>
                    );
                  })
                )}
              </div>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {spoLabels.map((l, i) => (
                  <p key={i} className={`text-[10px] font-bold text-center ${i === spoZone ? 'text-white' : 'text-white/20'}`}>{l}</p>
                ))}
              </div>
            </div>
          </div>
          <p className="text-[10px] text-white/20 text-center mt-4 uppercase tracking-widest">← Heart Rate (Y) · SpO2 (X) →</p>
        </div>

        {/* Clinical Protocol */}
        <div className="rounded-2xl bg-[#0d1525] border border-white/[0.07] p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-bold text-white/60 uppercase tracking-widest flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-cyan-400" /> Clinical Protocol
            </h3>
            <span className="text-xs font-black px-3 py-1 rounded-full border" style={{
              color: tierColor[currentTier], borderColor: tierColor[currentTier] + '40', backgroundColor: tierColor[currentTier] + '15'
            }}>
              {currentTier} Risk
            </span>
          </div>

          {/* Steps */}
          <div className="mb-5">
            <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-3 flex items-center gap-1.5">
              <ClipboardList className="w-3 h-3" /> Procedure Steps
            </p>
            <div className="space-y-1.5">
              {protocol.steps.map((s, i) => (
                <div key={i} className="flex items-start gap-3 bg-white/[0.02] rounded-lg px-3 py-2 border border-white/[0.04]">
                  <span className="text-xs font-black text-white/30 mt-0.5 w-4 flex-shrink-0">{i + 1}.</span>
                  <span className="text-[13px] text-white/75 leading-relaxed">{s}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Medications */}
          <div>
            <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-3 flex items-center gap-1.5">
              <Pill className="w-3 h-3" /> Recommended Medication
            </p>
            <div className="space-y-1.5">
              {protocol.meds.map((m, i) => (
                <div key={i} className="flex items-start gap-3 bg-white/[0.02] rounded-lg px-3 py-2 border border-white/[0.04]">
                  <Pill className="w-3.5 h-3.5 text-white/20 mt-0.5 flex-shrink-0" />
                  <span className="text-[13px] text-white/75 leading-relaxed">{m}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Temperature-Specific Medications */}
          {tempMeds.length > 0 && (
            <div className="mt-4 pt-4 border-t border-white/[0.06]">
              <p className="text-[10px] font-bold text-amber-400/60 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                <Thermometer className="w-3 h-3" /> Temperature-Based Intervention
              </p>
              <div className="space-y-1.5">
                {tempMeds.map((m, i) => (
                  <div key={i} className="flex items-start gap-3 bg-amber-500/[0.04] rounded-lg px-3 py-2 border border-amber-500/10">
                    <Thermometer className="w-3.5 h-3.5 text-amber-400/50 mt-0.5 flex-shrink-0" />
                    <span className="text-[13px] text-white/75 leading-relaxed">{m}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ━━ Row 3: Gemini AI Analysis ━━ */}
      <div className="rounded-2xl bg-[#0d1525] border border-white/[0.07] p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-sm font-bold text-white/60 uppercase tracking-widest flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400" /> Gemini AI Clinical Analysis
          </h3>
          {aiRec && (
            <button onClick={() => setAiRec(null)} className="text-[11px] text-purple-400 hover:text-white transition-colors font-bold uppercase tracking-wider">
              Clear
            </button>
          )}
        </div>

        {/* Error State */}
        {aiError && (
          <div className="flex flex-col sm:flex-row items-center gap-4 bg-red-500/5 border border-red-500/15 rounded-xl p-4">
            <div className="flex-1">
              <p className="text-sm font-bold text-red-400 mb-1">AI Analysis Failed</p>
              <p className="text-xs text-white/40">{aiError}</p>
            </div>
            <button
              onClick={getAiRecommendation}
              disabled={isAiLoading}
              className="px-5 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm flex items-center gap-2 transition-all flex-shrink-0"
            >
              {isAiLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Sparkles className="w-4 h-4" />}
              Retry
            </button>
          </div>
        )}

        {/* Default State */}
        {!aiRec && !aiError && (
          <div className="flex flex-col sm:flex-row items-center gap-5">
            <p className="text-sm text-white/40 flex-1">
              Get AI-powered reasoning on <strong className="text-white/60">why</strong> your vitals indicate this risk level, plus personalized medication & daily routine suggestions.
            </p>
            <button
              onClick={getAiRecommendation}
              disabled={isAiLoading || !result}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm flex items-center gap-2 transition-all shadow-lg hover:shadow-purple-500/20 disabled:opacity-40 flex-shrink-0"
            >
              {isAiLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {isAiLoading ? 'Analyzing...' : 'Generate AI Analysis'}
            </button>
          </div>
        )}

        {/* Success State */}
        {aiRec && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Reasoning */}
            <div className="rounded-xl bg-purple-500/5 border border-purple-500/15 p-4 relative overflow-hidden">
              <div className="absolute top-2 right-2 opacity-5"><Stethoscope className="w-16 h-16" /></div>
              <h4 className="text-[11px] font-black text-purple-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                <Activity className="w-3 h-3" /> Why This Risk?
              </h4>
              <p className="text-[13px] text-white/70 leading-relaxed relative z-10">{aiRec.reasoning}</p>
            </div>
            {/* Medication */}
            <div className="rounded-xl bg-indigo-500/5 border border-indigo-500/15 p-4">
              <h4 className="text-[11px] font-black text-indigo-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                <Pill className="w-3 h-3" /> Medication
              </h4>
              <div className="text-[13px] text-white/70 leading-relaxed whitespace-pre-line">{aiRec.medication}</div>
            </div>
            {/* Routine */}
            <div className="rounded-xl bg-cyan-500/5 border border-cyan-500/15 p-4">
              <h4 className="text-[11px] font-black text-cyan-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                <ClipboardList className="w-3 h-3" /> Daily Routine
              </h4>
              <div className="text-[13px] text-white/70 leading-relaxed whitespace-pre-line">{aiRec.routine}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
