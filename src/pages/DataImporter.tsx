import { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle2, AlertTriangle, TrendingUp, BarChart2, Check, Activity, ShieldCheck, Pill, FileUp, Sparkles } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

// Google AI API Key for Clinical Report Analysis
const GOOGLE_AI_API_KEY = 'AIzaSyCxSQJ15kTH0UpYoUK6QEi8U46qn4gFahk';

// Analyze clinical report using Google Gemini API
const analyzeClinicalReport = async (file: File): Promise<{ analysis: string; medications: string[] }> => {
  // Convert file to base64
  const reader = new FileReader();
  const base64Promise = new Promise<string>((resolve, reject) => {
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
  });
  reader.readAsDataURL(file);
  const base64Data = await base64Promise;
  const base64Content = base64Data.split(',')[1];

  // Determine mime type
  let mimeType = 'application/pdf';
  if (file.type.startsWith('image/')) {
    mimeType = file.type;
  } else if (file.name.endsWith('.txt')) {
    mimeType = 'text/plain';
  }

  const prompt = `You are a medical AI assistant. Analyze this clinical report and provide:
1. A detailed analysis of the patient's condition
2. A list of all medications that may be needed or recommended based on the findings

Format your response as:

**ANALYSIS:**
[Your detailed analysis here]

**SUGGESTED MEDICATIONS:**
- Medication 1: [Dosage if mentioned]
- Medication 2: [Dosage if mentioned]
- [Continue as needed]

Be thorough and evidence-based.`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${GOOGLE_AI_API_KEY}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { inlineData: { mimeType, data: base64Content } },
              { text: prompt }
            ]
          }
        ]
      })
    }
  );

  const data = await response.json();
  const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

  // Parse medications from response
  const medications: string[] = [];
  const lines = responseText.split('\n');
  let inMedicationsSection = false;

  for (const line of lines) {
    if (line.includes('SUGGESTED MEDICATIONS') || line.includes('Medications')) {
      inMedicationsSection = true;
      continue;
    }
    if (inMedicationsSection && line.trim().startsWith('-')) {
      medications.push(line.replace(/^[\-\*\s]+/, '').trim());
    }
  }

  return {
    analysis: responseText.split('SUGGESTED MEDICATIONS')[0] || responseText,
    medications: medications.length > 0 ? medications : ['No specific medications can be determined from this report']
  };
};

export default function DataImporter() {
  const [vitalsFile, setVitalsFile] = useState<File | null>(null);
  const [reportsFile, setReportsFile] = useState<File | null>(null);
  const [clinicalReportFile, setClinicalReportFile] = useState<File | null>(null);
  const [clinicalAnalysis, setClinicalAnalysis] = useState<{ analysis: string; medications: string[] } | null>(null);
  const [clinicalLoading, setClinicalLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // New state for Gemini AI CSV analysis
  const [csvAiInsight, setCsvAiInsight] = useState<string | null>(null);
  const [generatingCsvInsight, setGeneratingCsvInsight] = useState(false);

  const vitalsRef = useRef<HTMLInputElement>(null);
  const reportsRef = useRef<HTMLInputElement>(null);
  const clinicalRef = useRef<HTMLInputElement>(null);

  const generateCsvAiInsight = async (analysisData: any) => {
    setGeneratingCsvInsight(true);
    setCsvAiInsight(null);
    try {
      const prompt = `You are a clinical AI. Analyze this data summary from a patient vitals ML model training run. 
Accuracy: ${(analysisData.metrics.accuracy * 100).toFixed(1)}%
Rows trained: ${analysisData.metrics.train_size}
Provide a brief 3-sentence clinical insight on what these metrics indicate about the data reliability and patient trend stability. Be professional and concise.`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GOOGLE_AI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        }
      );

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) setCsvAiInsight(text);
    } catch (e) {
      console.error(e);
      setCsvAiInsight("AI analysis unavailable at this time due to network constraints.");
    }
    setGeneratingCsvInsight(false);
  };

  const handleAnalyze = async () => {
    if (!vitalsFile) {
      setError("Please upload at least a Vitals CSV file.");
      return;
    }

    setLoading(true);
    setError(null);
    setResults(null);
    setCsvAiInsight(null);

    try {
      const formData = new FormData();
      formData.append('vitals', vitalsFile);
      if (reportsFile) {
        formData.append('reports', reportsFile);
      }

      const res = await fetch('http://localhost:5000/api/analyze-csvs', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        setResults(data);
        generateCsvAiInsight(data); // Trigger Gemini AI Analysis 
      } else {
        setError(data.error || "Failed to analyze data.");
      }
    } catch (e: any) {
      setError(e.message || "Network error.");
    }
    setLoading(false);
  };

  // Handle clinical report analysis with AI
  const handleClinicalAnalysis = async (file: File) => {
    setClinicalReportFile(file);
    setClinicalLoading(true);
    setClinicalAnalysis(null);

    try {
      const result = await analyzeClinicalReport(file);
      setClinicalAnalysis(result);
    } catch (e: any) {
      setError("Failed to analyze clinical report: " + e.message);
    }
    setClinicalLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-white/90 drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]">
          <Upload className="inline-block w-8 h-8 mr-3 text-cyan-400" />
          Data Importer & AI Analysis
        </h1>
        <p className="text-sm text-white/60">Upload batch patient data to dynamically train a Random Forest and compare against historical reports.</p>
      </div>

      {/* CSV Batch Analysis Section */}
      <div className="rounded-2xl border border-white/10 bg-black/20 backdrop-blur-xl p-6 space-y-6 shadow-2xl">
        <div className="flex items-center space-x-3 border-b border-white/10 pb-4">
          <Activity className="w-6 h-6 text-cyan-400" />
          <h2 className="text-xl font-bold text-white/90">Batch Predictive Analysis</h2>
          <span className="bg-cyan-500/20 text-cyan-400 text-xs px-2 py-1 rounded-md font-medium">Train Model</span>
        </div>

        {/* Upload Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div
            className="rounded-xl border border-white/5 bg-white/5 backdrop-blur-xl p-6 cursor-pointer hover:bg-white/10 transition-colors group"
            onClick={() => vitalsRef.current?.click()}
          >
            <input type="file" ref={vitalsRef} className="hidden" accept=".csv" onChange={e => setVitalsFile(e.target.files?.[0] || null)} />
            <div className="flex flex-col items-center justify-center space-y-4 py-4">
              <div className="p-4 bg-cyan-500/20 text-cyan-400 rounded-full group-hover:scale-110 transition-transform">
                <Activity className="w-8 h-8" />
              </div>
              <div className="text-center">
                <h3 className="font-semibold text-white/80">Vitals CSV (Required)</h3>
                <p className="text-sm text-white/50 px-4 mt-1 leading-relaxed">
                  {vitalsFile ? vitalsFile.name : "Upload raw patient vitals data to train the model"}
                </p>
              </div>
              {vitalsFile && <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-2" />}
            </div>
          </div>

          <div
            className="rounded-xl border border-white/5 bg-white/5 backdrop-blur-xl p-6 cursor-pointer hover:bg-white/10 transition-colors group"
            onClick={() => reportsRef.current?.click()}
          >
            <input type="file" ref={reportsRef} className="hidden" accept=".csv" onChange={e => setReportsFile(e.target.files?.[0] || null)} />
            <div className="flex flex-col items-center justify-center space-y-4 py-4">
              <div className="p-4 bg-fuchsia-500/20 text-fuchsia-400 rounded-full group-hover:scale-110 transition-transform">
                <FileText className="w-8 h-8" />
              </div>
              <div className="text-center">
                <h3 className="font-semibold text-white/80">Reports CSV (Optional)</h3>
                <p className="text-sm text-white/50 px-4 mt-1 leading-relaxed">
                  {reportsFile ? reportsFile.name : "Upload historical diagnoses for deeper cross-validation"}
                </p>
              </div>
              {reportsFile && <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-2" />}
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4 pt-4">
          <button
            onClick={handleAnalyze}
            disabled={loading || !vitalsFile}
            className="w-full md:flex-1 md:max-w-xs flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:shadow-[0_0_25px_rgba(6,182,212,0.5)] disabled:opacity-50 disabled:shadow-none"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <Activity className="w-5 h-5" />
            )}
            <span>{loading ? "Training & Analyzing..." : "Run ML Analysis"}</span>
          </button>

          {error && (
            <div className="text-red-400 text-sm flex items-start bg-red-500/10 border border-red-500/20 p-3.5 rounded-xl flex-1 animate-in fade-in">
              <AlertTriangle className="w-5 h-5 mr-2 shrink-0 text-red-500" />
              <span className="break-all font-medium">{error}</span>
            </div>
          )}
        </div>
      </div>

      {/* Clinical Report AI Analysis Section */}
      <div className="rounded-2xl border shadow-xl bg-gradient-to-b from-purple-500/10 to-transparent border-purple-500/20 p-8 space-y-6">
        <div className="flex flex-col space-y-2">
          <div className="flex items-center space-x-3">
            <Sparkles className="w-6 h-6 text-purple-400" />
            <h2 className="text-xl font-bold text-white/90">Clinical Report Intelligence</h2>
            <span className="bg-purple-500/20 text-purple-300 text-xs px-2 py-1 rounded-md font-medium border border-purple-500/30">Gemini 1.5 Pro</span>
          </div>
          <p className="text-sm text-white/50">Instantly extract actionable medical insights and medication recommendations from any clinical document.</p>
        </div>

        <div
          className="rounded-xl border-2 border-dashed border-purple-500/30 bg-purple-500/5 hover:bg-purple-500/10 hover:border-purple-400/50 transition-all duration-300 p-10 text-center cursor-pointer group"
          onClick={() => clinicalRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const file = e.dataTransfer.files[0];
            if (file) handleClinicalAnalysis(file);
          }}
        >
          <input
            type="file"
            ref={clinicalRef}
            className="hidden"
            accept=".pdf,.txt,.jpg,.jpeg,.png,.doc,.docx"
            onChange={e => {
              const file = e.target.files?.[0];
              if (file) handleClinicalAnalysis(file);
            }}
          />
          <div className="flex flex-col items-center">
            <div className="p-4 bg-purple-500/10 rounded-full mb-4 group-hover:-translate-y-1 transition-transform">
              <FileUp className="w-8 h-8 text-purple-400" />
            </div>
            <p className="text-white/80 font-medium text-lg">Drop your clinical report here</p>
            <p className="text-sm text-white/40 mt-2">Supports PDF, Images, and Text files up to 10MB</p>
          </div>
        </div>

        {clinicalLoading && (
          <div className="flex items-center justify-center space-x-3 text-purple-400 bg-purple-500/10 border border-purple-500/20 p-6 rounded-xl animate-pulse">
            <div className="w-5 h-5 border-2 border-purple-400/30 border-t-purple-400 rounded-full animate-spin" />
            <span className="font-semibold text-purple-300 tracking-wide">Synthesizing clinical report using Google Gemini...</span>
          </div>
        )}

        {clinicalAnalysis && (
          <div className="mt-6 space-y-6 animate-in slide-in-from-bottom-8 duration-700">
            <div className="rounded-xl bg-black/40 border border-purple-500/20 p-6 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-3 opacity-20">
                <BrainCircuit className="w-24 h-24 text-purple-400" />
              </div>
              <h3 className="font-semibold text-purple-300 mb-4 flex items-center relative z-10 text-lg">
                <FileText className="w-5 h-5 mr-3" />
                Comprehensive AI Assessment
              </h3>
              <div className="text-white/80 text-sm leading-relaxed whitespace-pre-wrap max-h-80 overflow-y-auto relative z-10 pr-4 custom-scrollbar">
                {clinicalAnalysis.analysis}
              </div>
            </div>

            <div className="rounded-xl bg-gradient-to-br from-pink-500/10 to-fuchsia-500/5 border border-pink-500/20 p-6 shadow-xl">
              <h3 className="font-semibold text-pink-300 mb-4 flex items-center text-lg">
                <Pill className="w-5 h-5 mr-3" />
                Recommended Protocol Iterations
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {clinicalAnalysis.medications.map((med, index) => (
                  <div key={index} className="flex items-center space-x-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg px-4 py-3 transition-colors">
                    <Pill className="w-4 h-4 text-pink-400 shrink-0" />
                    <span className="text-white/90 font-medium text-sm truncate" title={med}>{med}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
        <button
          onClick={handleAnalyze}
          disabled={loading || !vitalsFile}
          className="w-full md:flex-1 md:max-w-xs flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold py-3 px-6 rounded-xl transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-50"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          ) : (
            <Activity className="w-5 h-5" />
          )}
          <span>{loading ? "Analyzing..." : "Run ML Analysis"}</span>
        </button>
        {error && (
          <div className="text-red-400 text-sm flex items-start bg-red-500/10 border border-red-500/20 p-3 rounded-xl flex-1">
            <AlertTriangle className="w-5 h-5 mr-2 shrink-0 text-red-500" />
            <span className="break-all">{error}</span>
          </div>
        )}
      </div>

      {/* Results Section */}
      {results && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

          {/* AI Insight Section for CSV Analysis */}
          <div className="rounded-xl border border-cyan-500/30 bg-gradient-to-r from-cyan-500/10 to-blue-500/5 backdrop-blur-xl p-6 flex flex-col space-y-4">
            <h3 className="font-semibold text-cyan-400 flex items-center text-lg">
              <Sparkles className="w-5 h-5 mr-2" />
              Gemini AI CSV Insight
            </h3>
            {generatingCsvInsight ? (
              <div className="flex items-center space-x-2 text-white/60">
                <div className="w-4 h-4 border-2 border-cyan-400/20 border-t-cyan-400 rounded-full animate-spin" />
                <span className="text-sm">Generating insight on CSV trends...</span>
              </div>
            ) : csvAiInsight ? (
              <div className="text-white/80 text-sm leading-relaxed whitespace-pre-wrap">
                {csvAiInsight}
              </div>
            ) : null}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="rounded-xl bg-white/5 border border-white/10 p-5">
              <p className="text-sm text-white/50 mb-1">Model Accuracy</p>
              <p className="text-2xl font-bold text-cyan-400">{(results.metrics.accuracy * 100).toFixed(1)}%</p>
            </div>
            <div className="rounded-xl bg-white/5 border border-white/10 p-5">
              <p className="text-sm text-white/50 mb-1">Agreement w/ Reports</p>
              <p className="text-2xl font-bold text-fuchsia-400">{results.agreement ? results.agreement.toFixed(1) + '%' : 'N/A'}</p>
            </div>
            <div className="rounded-xl bg-white/5 border border-white/10 p-5">
              <p className="text-sm text-white/50 mb-1">Rows Trained</p>
              <p className="text-2xl font-bold text-white/90">{results.metrics.train_size}</p>
            </div>
            <div className="rounded-xl bg-white/5 border border-white/10 p-5">
              <p className="text-sm text-white/50 mb-1">Latest Prediction</p>
              <p className="text-lg font-bold text-amber-400 truncate">{results.latest_prediction}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-xl bg-white/5 border border-white/10 p-6 h-80">
              <h3 className="font-semibold text-white/80 mb-4 flex items-center"><TrendingUp className="w-4 h-4 mr-2 text-cyan-400" /> Vital Trends</h3>
              <ResponsiveContainer width="100%" height="85%">
                <LineChart data={results.trend_data}>
                  <XAxis dataKey="timestamp" hide />
                  <YAxis stroke="#ffffff40" fontSize={10} width={30} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b' }} />
                  <Legend />
                  <Line type="monotone" dataKey="heart_rate" stroke="#ef4444" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="spo2" stroke="#3b82f6" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="rounded-xl bg-white/5 border border-white/10 p-6 h-80">
              <h3 className="font-semibold text-white/80 mb-4 flex items-center"><BarChart2 className="w-4 h-4 mr-2 text-fuchsia-400" /> Condition Distribution</h3>
              <ResponsiveContainer width="100%" height="85%">
                <BarChart data={results.dist_data}>
                  <XAxis dataKey="condition" stroke="#ffffff40" fontSize={11} />
                  <YAxis stroke="#ffffff40" fontSize={10} width={30} hide />
                  <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b' }} />
                  <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {results.comparisons && results.comparisons.length > 0 && (
            <div className="rounded-xl bg-white/5 border border-white/10 p-6">
              <h3 className="font-semibold text-white/80 mb-4 flex items-center"><ShieldCheck className="w-4 h-4 mr-2 text-emerald-400" /> Report Cross-Validation</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-white/70">
                  <thead className="text-xs text-white/50 uppercase bg-black/20">
                    <tr>
                      <th className="px-4 py-3 rounded-tl-lg">Patient ID</th>
                      <th className="px-4 py-3">Timestamp</th>
                      <th className="px-4 py-3">Predicted</th>
                      <th className="px-4 py-3">Reported</th>
                      <th className="px-4 py-3 rounded-tr-lg">Match</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.comparisons.map((row: any, i: number) => (
                      <tr key={i} className="border-b border-white/5 hover:bg-white/5">
                        <td className="px-4 py-3 text-white/90">{row.patient_id}</td>
                        <td className="px-4 py-3">{String(row.timestamp).split(' ')[0]}</td>
                        <td className="px-4 py-3">{row.predicted_condition}</td>
                        <td className="px-4 py-3">{row.reported_condition}</td>
                        <td className="px-4 py-3">
                          {row.match ? <Check className="w-4 h-4 text-emerald-500" /> : <AlertTriangle className="w-4 h-4 text-amber-500" />}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
