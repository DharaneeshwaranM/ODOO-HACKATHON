import React, { useState, useEffect } from 'react';
import {
  BrainCircuit,
  Sparkles,
  AlertTriangle,
  HeartPulse,
  TrendingUp,
  TrendingDown,
  Activity,
  CheckCircle2,
  RefreshCw,
  Zap,
  Building,
  Users,
  ShieldAlert,
} from 'lucide-react';
import { WorkforceInsight } from '../../types';
import { api } from '../../api';

export const WorkforceIntelligence: React.FC = () => {
  const [insights, setInsights] = useState<WorkforceInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    loadInsights();
  }, []);

  const loadInsights = async () => {
    setLoading(true);
    try {
      const data = await api.getWorkforceIntelligence();
      setInsights(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleRunAiAnalysis = async () => {
    setAiAnalyzing(true);
    try {
      const res = await api.runGeminiAIAnalysis();
      setAiResult(res.analysis);
    } catch (err: any) {
      alert(err.message || 'AI analysis request failed.');
    } finally {
      setAiAnalyzing(false);
    }
  };

  const categories = [
    { id: 'all', label: 'All Insights' },
    { id: 'Absence Risk', label: 'Absence Risk' },
    { id: 'Attendance Risk', label: 'Attendance Risk' },
    { id: 'Department Health', label: 'Department Health' },
    { id: 'Leave Concentration', label: 'Leave Concentration' },
  ];

  const filteredInsights = insights.filter(
    (ins) => selectedCategory === 'all' || ins.category === selectedCategory
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 text-white shadow-xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-cyan-500/30 px-2 py-0.5 text-xs font-semibold text-cyan-200">
                Gemini 3.7 Intelligence Layer
              </span>
            </div>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl flex items-center gap-2">
              <BrainCircuit className="h-7 w-7 text-cyan-400" />
              Explainable Workforce Intelligence
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-300">
              Deterministic absence rule evaluation augmented with real-time strategic HR insights.
            </p>
          </div>

          <button
            onClick={handleRunAiAnalysis}
            disabled={aiAnalyzing}
            className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-3 text-xs font-bold text-white shadow-lg shadow-cyan-500/25 hover:from-cyan-400 hover:to-blue-500 transition disabled:opacity-50"
          >
            {aiAnalyzing ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Running Gemini Analysis...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 text-cyan-200" />
                <span>Run Live Gemini AI Analysis</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* AI Analysis Live Output Banner */}
      {aiResult && (
        <div className="rounded-2xl border border-cyan-300 bg-gradient-to-br from-cyan-50/80 to-blue-50/60 p-6 shadow-sm animate-in fade-in">
          <div className="flex items-center justify-between border-b border-cyan-200 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-cyan-600" />
              <h3 className="font-bold text-slate-900 text-sm">Gemini AI Executive Intelligence Synthesis</h3>
            </div>
            <span className="rounded-full bg-cyan-200/80 px-2.5 py-0.5 text-[10px] font-bold text-cyan-900">
              Live Evaluation
            </span>
          </div>
          <div className="prose prose-sm max-w-none text-slate-800 text-xs leading-relaxed whitespace-pre-line">
            {aiResult}
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelectedCategory(c.id)}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              selectedCategory === c.id
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Insights Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {filteredInsights.map((ins) => (
          <div
            key={ins.id}
            className={`rounded-2xl border bg-white p-5 shadow-xs transition hover:shadow-md ${
              ins.severity === 'critical'
                ? 'border-red-200 ring-1 ring-red-500/10'
                : ins.severity === 'medium'
                ? 'border-amber-200'
                : 'border-slate-200'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    ins.severity === 'critical'
                      ? 'bg-red-100 text-red-700'
                      : ins.severity === 'medium'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}
                >
                  {ins.severity.toUpperCase()}
                </span>
                <span className="text-[11px] font-semibold text-slate-500">{ins.category}</span>
              </div>

              <div className="flex items-center gap-1 text-[11px] text-slate-400">
                {ins.trend === 'increasing' ? (
                  <TrendingUp className="h-3.5 w-3.5 text-red-500" />
                ) : (
                  <Activity className="h-3.5 w-3.5 text-slate-400" />
                )}
                <span>Trend: {ins.trend}</span>
              </div>
            </div>

            <h3 className="text-sm font-bold text-slate-900 mt-2.5">{ins.title}</h3>
            <p className="text-xs text-slate-600 mt-1">{ins.description}</p>

            <div className="mt-3 flex flex-wrap gap-1.5">
              {ins.affectedEmployees.map((emp) => (
                <span
                  key={emp}
                  className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700"
                >
                  {emp}
                </span>
              ))}
              {ins.affectedDepartments.map((dept) => (
                <span
                  key={dept}
                  className="rounded bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700"
                >
                  {dept} Dept
                </span>
              ))}
            </div>

            <div className="mt-4 rounded-xl bg-slate-50 p-3 text-xs border border-slate-100">
              <span className="font-bold text-blue-900 block mb-0.5">Recommended Action:</span>
              <p className="text-slate-700">{ins.recommendedAction}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
