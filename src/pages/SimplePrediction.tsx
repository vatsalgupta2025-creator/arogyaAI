import { useState, useEffect } from 'react';
import { HeartPulse, CheckCircle2, AlertTriangle, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

export default function SimplePrediction() {
  const [heartRate, setHeartRate] = useState(72);
  const [temperature, setTemperature] = useState(36.5);
  const [spo2, setSpo2] = useState(98);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{prediction: string, chartData: any[]} | null>(null);

  const handlePredict = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/predict-basic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ heart_rate: heartRate, temperature: temperature, spo2: spo2 })
      });
      const data = await res.json();
      
      const chartData = [
        { name: "Heart Rate", value: data.vitals["Heart Rate"], fill: "#ef4444" },
        { name: "SpO2", value: data.vitals["SpO2"], fill: "#3b82f6" },
        { name: "Temperature", value: data.vitals["Temperature"], fill: "#fbbf24" }
      ];
      
      setResult({ prediction: data.prediction, chartData });
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  // Auto-predict when values change
  useEffect(() => {
    const timer = setTimeout(() => {
      handlePredict();
    }, 400); // 400ms debounce
    return () => clearTimeout(timer);
  }, [heartRate, temperature, spo2]);

  return (
    <div className="space-y-8 animate-in fade-in zoom-in duration-500 max-w-5xl mx-auto">
      <div className="flex flex-col space-y-3 text-center md:text-left">
        <h1 className="text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300 drop-shadow-[0_0_15px_rgba(56,189,248,0.4)]">
          AI Health Risk Assessment
        </h1>
        <p className="text-base text-white/60 max-w-2xl">
          Use the interactive sliders below to receive an instant machine learning-driven clinical risk evaluation based on historical datasets.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Input Form */}
        <div className="rounded-2xl border shadow-2xl bg-gradient-to-b from-white/10 to-white/5 border-white/10 backdrop-blur-2xl p-8 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          <div className="space-y-8 relative z-10">
            <h3 className="text-xl font-semibold text-white/90 flex items-center border-b border-white/10 pb-4 mb-2">
              <Activity className="w-5 h-5 mr-3 text-cyan-400" />
              Patient Vitals Simulation
            </h3>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-sm font-semibold text-white/70 uppercase tracking-wider ml-1">Heart Rate</label>
                <div className="flex items-center space-x-2">
                  <span className="text-white/80 font-bold text-xl">{heartRate}</span>
                  <span className="text-white/40 text-xs font-medium">BPM</span>
                </div>
              </div>
              <input 
                type="range" 
                min="40" max="220" 
                value={heartRate} 
                onChange={(e) => setHeartRate(Number(e.target.value))}
                className="w-full accent-red-500 h-2 bg-white/10 rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-500/50"
              />
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-sm font-semibold text-white/70 uppercase tracking-wider ml-1">Temperature</label>
                <div className="flex items-center space-x-2">
                  <span className="text-white/80 font-bold text-xl">{temperature.toFixed(1)}</span>
                  <span className="text-white/40 text-xs font-medium">°C</span>
                </div>
              </div>
              <input 
                type="range" 
                min="34.0" max="41.5" step="0.1"
                value={temperature} 
                onChange={(e) => setTemperature(Number(e.target.value))}
                className="w-full accent-amber-500 h-2 bg-white/10 rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-sm font-semibold text-white/70 uppercase tracking-wider ml-1">SpO2 Level</label>
                <div className="flex items-center space-x-2">
                  <span className="text-white/80 font-bold text-xl">{spo2}</span>
                  <span className="text-white/40 text-xs font-medium">%</span>
                </div>
              </div>
              <input 
                type="range" 
                min="70" max="100" 
                value={spo2} 
                onChange={(e) => setSpo2(Number(e.target.value))}
                className="w-full accent-blue-500 h-2 bg-white/10 rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>
          </div>
        </div>

        {/* Results Panel */}
        {result ? (
          <div className="rounded-2xl border shadow-2xl bg-gradient-to-b from-white/10 to-white/5 border-white/10 backdrop-blur-2xl p-8 flex flex-col justify-between animate-in slide-in-from-right-8 duration-500">
            <div>
              <h2 className="text-xl font-semibold text-white/90 mb-6 flex items-center border-b border-white/10 pb-4">
                🩺 ML Prediction Result
              </h2>
              
              {result.prediction === "Risk" ? (
                <div className="bg-gradient-to-r from-red-500/20 to-rose-500/10 border border-red-500/30 text-red-200 px-6 py-5 rounded-xl flex items-center shadow-[0_0_30px_rgba(239,68,68,0.15)] animate-pulse-slow">
                  <div className="p-3 bg-red-500/20 rounded-full mr-4">
                    <AlertTriangle className="w-7 h-7 text-red-400 drop-shadow-[0_0_8px_rgba(248,113,113,0.8)]" />
                  </div>
                  <div>
                    <span className="block font-bold text-xl text-red-400">High Risk Detected</span>
                    <span className="text-sm opacity-80 pt-1 block">Immediate clinical review recommended.</span>
                  </div>
                </div>
              ) : (
                <div className="bg-gradient-to-r from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 text-emerald-200 px-6 py-5 rounded-xl flex items-center shadow-[0_0_30px_rgba(16,185,129,0.15)]">
                  <div className="p-3 bg-emerald-500/20 rounded-full mr-4">
                    <CheckCircle2 className="w-7 h-7 text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                  </div>
                  <div>
                    <span className="block font-bold text-xl text-emerald-400">Normal Parameters</span>
                    <span className="text-sm opacity-80 pt-1 block">Vitals are within stable expected ranges.</span>
                  </div>
                </div>
              )}
            </div>

            <div className="w-full h-56 mt-8 p-4 bg-black/20 rounded-xl border border-white/5">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={result.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="#ffffff60" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                  <YAxis stroke="#ffffff60" fontSize={12} tickLine={false} axisLine={false} />
                  <RechartsTooltip 
                    cursor={{fill: 'rgba(255,255,255,0.08)'}} 
                    contentStyle={{ backgroundColor: 'rgba(15,23,42,0.9)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)' }}
                  />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]} animationDuration={1500} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-white/5 bg-white/5 backdrop-blur-2xl p-8 flex flex-col items-center justify-center text-center opacity-50">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
              <Activity className="w-10 h-10 text-white/30" />
            </div>
            <p className="text-white/60 font-medium text-lg">Awaiting Input</p>
            <p className="text-sm text-white/40 max-w-xs mt-2">Enter patient vitals and click analyze to see risk predictions.</p>
          </div>
        )}
      </div>
    </div>
  );
}
