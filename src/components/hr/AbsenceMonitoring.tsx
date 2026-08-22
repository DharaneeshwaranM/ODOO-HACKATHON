import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Sliders,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Coins,
  TrendingDown,
  Sparkles,
  Search,
  Save,
  Users,
} from 'lucide-react';
import { AbsencePolicy, AbsenceSummary } from '../../types';
import { api } from '../../api';

export const AbsenceMonitoring: React.FC<{ setCurrentView?: (v: string) => void }> = ({
  setCurrentView,
}) => {
  const [policy, setPolicy] = useState<AbsencePolicy>({
    allowedAbsenceDays: 12,
    warningThresholdDays: 10,
    workingDaysPerMonth: 30,
    updatedAt: '',
    updatedBy: '',
  });
  const [summaries, setSummaries] = useState<AbsenceSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingPolicy, setSavingPolicy] = useState(false);
  const [policySavedMsg, setPolicySavedMsg] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Policy Form State
  const [allowedDays, setAllowedDays] = useState(12);
  const [warningDays, setWarningDays] = useState(10);
  const [workingDays, setWorkingDays] = useState(30);

  useEffect(() => {
    loadMonitoringData();
  }, []);

  const loadMonitoringData = async () => {
    setLoading(true);
    try {
      const data = await api.getAbsenceMonitoring();
      setPolicy(data.policy);
      setSummaries(data.summaries);
      setAllowedDays(data.policy.allowedAbsenceDays);
      setWarningDays(data.policy.warningThresholdDays);
      setWorkingDays(data.policy.workingDaysPerMonth);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSavePolicy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (warningDays > allowedDays) {
      alert('Warning threshold cannot exceed the allowed absence limit.');
      return;
    }
    setSavingPolicy(true);
    try {
      const updated = await api.updateAbsencePolicy({
        allowedAbsenceDays: Number(allowedDays),
        warningThresholdDays: Number(warningDays),
        workingDaysPerMonth: Number(workingDays),
      });
      setPolicy(updated);
      setPolicySavedMsg(true);
      setTimeout(() => setPolicySavedMsg(false), 4000);
      await loadMonitoringData();
    } catch (err: any) {
      alert(err.message || 'Failed to update absence policy.');
    } finally {
      setSavingPolicy(false);
    }
  };

  const filteredSummaries = summaries.filter(
    (s) =>
      s.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.employeeCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const exceededCount = summaries.filter((s) => s.status === 'exceeded').length;
  const warningCount = summaries.filter((s) => s.status === 'warning').length;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 sm:text-2xl flex items-center gap-2">
            <ShieldAlert className="h-6 w-6 text-blue-600" />
            Absence Policy & Limits Monitoring
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure enterprise absence thresholds, track workforce limits, and govern deduction triggers.
          </p>
        </div>

        {setCurrentView && exceededCount > 0 && (
          <button
            onClick={() => setCurrentView('hr_salary_deductions')}
            className="flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-red-700 transition"
          >
            <Coins className="h-4 w-4" />
            <span>View {exceededCount} Pending Deduction Request(s)</span>
          </button>
        )}
      </div>

      {/* Top Config & Summary Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Policy Configuration Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs lg:col-span-1">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
            <Sliders className="h-4 w-4 text-blue-600" />
            <h2 className="text-sm font-bold text-slate-900">Absence Policy Rules</h2>
          </div>

          <form onSubmit={handleSavePolicy} className="space-y-4 text-xs">
            {policySavedMsg && (
              <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 p-2.5 text-emerald-800 animate-in fade-in">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>Policy parameters saved & recalculated!</span>
              </div>
            )}

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Allowed Absence Limit (Days / Year)
              </label>
              <input
                type="number"
                min={1}
                max={60}
                required
                value={allowedDays}
                onChange={(e) => setAllowedDays(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-900 focus:border-blue-500 focus:outline-none"
              />
              <p className="text-[10px] text-slate-400 mt-1">Exceeding this creates a Pending Salary Deduction.</p>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Warning Threshold (Days)
              </label>
              <input
                type="number"
                min={1}
                max={allowedDays}
                required
                value={warningDays}
                onChange={(e) => setWarningDays(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-900 focus:border-blue-500 focus:outline-none"
              />
              <p className="text-[10px] text-slate-400 mt-1">Triggers automated alert to Employee & HR.</p>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Working Days / Month (for Daily Wage Rate)
              </label>
              <input
                type="number"
                min={15}
                max={31}
                required
                value={workingDays}
                onChange={(e) => setWorkingDays(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-900 focus:border-blue-500 focus:outline-none"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Formula: Daily Rate = Monthly Salary ÷ {workingDays}
              </p>
            </div>

            <button
              type="submit"
              disabled={savingPolicy}
              className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 py-2.5 text-xs font-bold text-white shadow-md hover:bg-blue-700 transition disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              <span>{savingPolicy ? 'Updating...' : 'Save Absence Policy'}</span>
            </button>
          </form>
        </div>

        {/* Live Threshold Status Cards */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs lg:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Workforce Absence Status</h2>
                <p className="text-xs text-slate-500">Live limit tracking across all employees</p>
              </div>
              <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700">
                Policy: {policy.allowedAbsenceDays} Max Days
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-4">
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-center">
                <span className="text-[11px] font-semibold uppercase text-slate-500">Normal Range</span>
                <p className="text-2xl font-extrabold text-emerald-600 mt-1">
                  {summaries.filter((s) => s.status === 'normal').length}
                </p>
                <span className="text-[10px] text-slate-400">Within safe threshold</span>
              </div>

              <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4 text-center">
                <span className="text-[11px] font-semibold uppercase text-amber-800">Near Limit (Warning)</span>
                <p className="text-2xl font-extrabold text-amber-600 mt-1">{warningCount}</p>
                <span className="text-[10px] text-amber-700">≥ {policy.warningThresholdDays} days used</span>
              </div>

              <div className="rounded-xl border border-red-200 bg-red-50/60 p-4 text-center">
                <span className="text-[11px] font-semibold uppercase text-red-800">Limit Exceeded</span>
                <p className="text-2xl font-extrabold text-red-600 mt-1">{exceededCount}</p>
                <span className="text-[10px] text-red-700">&gt; {policy.allowedAbsenceDays} days used</span>
              </div>
            </div>

            <div className="rounded-xl bg-blue-50/60 border border-blue-100 p-3.5 text-xs text-blue-900">
              <span className="font-bold">System Governance Rule:</span> When an employee exceeds {policy.allowedAbsenceDays} absence days, the system automatically calculates the daily rate and creates a <strong>Pending Salary Deduction Request</strong> for HR approval. Salary is never deducted automatically.
            </div>
          </div>
        </div>
      </div>

      {/* Employee Absence Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">Employee-by-Employee Absence Log</h2>
          <div className="relative w-64">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter employee..."
              className="w-full rounded-xl border border-slate-200 bg-white pl-8 pr-3 py-1.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-4 py-3.5">Employee</th>
                  <th className="px-4 py-3.5">Department</th>
                  <th className="px-4 py-3.5">Allowed</th>
                  <th className="px-4 py-3.5">Used Absences</th>
                  <th className="px-4 py-3.5">Remaining</th>
                  <th className="px-4 py-3.5">Excess Days</th>
                  <th className="px-4 py-3.5">Progress Bar</th>
                  <th className="px-4 py-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSummaries.map((item) => {
                  const pct = Math.min(100, Math.round((item.usedDays / item.allowedDays) * 100));
                  return (
                    <tr key={item.employeeId} className="hover:bg-slate-50/80 transition">
                      <td className="px-4 py-3 font-semibold text-slate-900">
                        {item.employeeName}{' '}
                        <span className="font-mono text-[10px] text-blue-600">({item.employeeCode})</span>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{item.department}</td>
                      <td className="px-4 py-3 font-medium text-slate-700">{item.allowedDays} days</td>
                      <td className="px-4 py-3 font-bold text-slate-900">{item.usedDays} days</td>
                      <td className="px-4 py-3 font-medium text-slate-700">{item.remainingDays} days</td>
                      <td className="px-4 py-3">
                        {item.excessDays > 0 ? (
                          <span className="font-bold text-red-600">+{item.excessDays} day(s) excess</span>
                        ) : (
                          <span className="text-slate-400">0</span>
                        )}
                      </td>
                      <td className="px-4 py-3 w-40">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${
                                item.status === 'exceeded'
                                  ? 'bg-red-500'
                                  : item.status === 'warning'
                                  ? 'bg-amber-500'
                                  : 'bg-blue-600'
                              }`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-[10px] text-slate-500 font-semibold w-8">{pct}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                            item.status === 'exceeded'
                              ? 'bg-red-100 text-red-700'
                              : item.status === 'warning'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-emerald-100 text-emerald-700'
                          }`}
                        >
                          {item.status === 'exceeded' && <AlertTriangle className="h-3 w-3" />}
                          {item.status === 'warning' && <AlertCircle className="h-3 w-3" />}
                          {item.status === 'normal' && <CheckCircle2 className="h-3 w-3" />}
                          {item.status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
