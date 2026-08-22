import React, { useState } from 'react';
import {
  Sparkles,
  Lock,
  User,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Users,
  Building2,
  Cpu,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const LoginPage: React.FC = () => {
  const { login, quickLogin, isLoading } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setError('Please enter your Employee ID, Username, or Email.');
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await login(username.trim(), password);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please verify your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemoClick = async (empId: string) => {
    setError(null);
    setSubmitting(true);
    try {
      await quickLogin(empId);
    } catch (err: any) {
      setError(err.message || 'Quick login failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-slate-100">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center px-4">
        {/* Brand Logo */}
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-400 text-white shadow-xl shadow-blue-500/25 ring-4 ring-white/10 mb-4">
          <Sparkles className="h-8 w-8" />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">Dayflow AI</h1>
        <p className="mt-2 text-sm text-slate-300">
          Enterprise Human Resource Management & Explainable Workforce Intelligence
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white/10 backdrop-blur-xl border border-white/15 py-8 px-6 shadow-2xl rounded-2xl sm:px-10 text-slate-900">
          {error && (
            <div className="mb-5 flex items-center gap-2.5 rounded-xl bg-red-500/15 border border-red-500/30 p-3.5 text-xs text-red-200 animate-in fade-in">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-200 mb-1.5">
                User ID / Username / Email
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <User className="h-4 w-4" />
                </div>
                <input
                  id="login-username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. HR001 or EMP001"
                  required
                  className="block w-full rounded-xl border border-white/20 bg-white/90 pl-10 pr-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 shadow-inner"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-200 mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="login-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="block w-full rounded-xl border border-white/20 bg-white/90 pl-10 pr-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 shadow-inner"
                />
              </div>
            </div>

            <button
              id="login-submit-btn"
              type="submit"
              disabled={submitting || isLoading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/30 hover:from-blue-500 hover:to-indigo-500 focus:outline-none focus:ring-2 focus:ring-blue-400 transition disabled:opacity-50"
            >
              {submitting ? (
                <span>Authenticating & Detecting Role...</span>
              ) : (
                <>
                  <span>Sign In to Dayflow AI</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick 1-Click Role Login Presets */}
          <div className="mt-8 border-t border-white/10 pt-6">
            <p className="text-xs font-semibold text-slate-300 mb-3 flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-blue-400" />
              Quick One-Click Test Accounts:
            </p>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => handleDemoClick('HR001')}
                className="flex flex-col rounded-xl border border-indigo-400/30 bg-indigo-950/40 p-3 text-left hover:bg-indigo-900/50 hover:border-indigo-400 transition text-slate-200 group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white group-hover:text-indigo-300">HR Admin</span>
                  <span className="rounded bg-indigo-500/30 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-200">
                    HR001
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 mt-0.5">Sarah Connor • Full Access</span>
              </button>

              <button
                type="button"
                onClick={() => handleDemoClick('EMP002')}
                className="flex flex-col rounded-xl border border-red-400/30 bg-red-950/40 p-3 text-left hover:bg-red-900/50 hover:border-red-400 transition text-slate-200 group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white group-hover:text-red-300">Staff Employee</span>
                  <span className="rounded bg-red-500/30 px-1.5 py-0.5 text-[10px] font-semibold text-red-200">
                    EMP002
                  </span>
                </div>
                <span className="text-[11px] text-red-300 mt-0.5">Priya Sharma • Exceeded Limit</span>
              </button>

              <button
                type="button"
                onClick={() => handleDemoClick('EMP001')}
                className="flex flex-col rounded-xl border border-amber-400/30 bg-amber-950/40 p-3 text-left hover:bg-amber-900/50 hover:border-amber-400 transition text-slate-200 group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white group-hover:text-amber-300">Staff Employee</span>
                  <span className="rounded bg-amber-500/30 px-1.5 py-0.5 text-[10px] font-semibold text-amber-200">
                    EMP001
                  </span>
                </div>
                <span className="text-[11px] text-amber-300 mt-0.5">Alex Rivera • Warning Threshold</span>
              </button>

              <button
                type="button"
                onClick={() => handleDemoClick('EMP003')}
                className="flex flex-col rounded-xl border border-emerald-400/30 bg-emerald-950/40 p-3 text-left hover:bg-emerald-900/50 hover:border-emerald-400 transition text-slate-200 group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white group-hover:text-emerald-300">Staff Employee</span>
                  <span className="rounded bg-emerald-500/30 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-200">
                    EMP003
                  </span>
                </div>
                <span className="text-[11px] text-emerald-300 mt-0.5">Marcus Chen • Design Lead</span>
              </button>
            </div>
          </div>
        </div>

        {/* Feature Highlights Footer */}
        <div className="mt-8 grid grid-cols-3 gap-2 text-center text-xs text-slate-400">
          <div className="flex flex-col items-center gap-1 p-2 rounded-lg bg-white/5 border border-white/5">
            <Building2 className="h-4 w-4 text-blue-400" />
            <span>Strict RBAC</span>
          </div>
          <div className="flex flex-col items-center gap-1 p-2 rounded-lg bg-white/5 border border-white/5">
            <Cpu className="h-4 w-4 text-cyan-400" />
            <span>AI Intelligence</span>
          </div>
          <div className="flex flex-col items-center gap-1 p-2 rounded-lg bg-white/5 border border-white/5">
            <ShieldCheck className="h-4 w-4 text-indigo-400" />
            <span>Salary Governance</span>
          </div>
        </div>
      </div>
    </div>
  );
};
