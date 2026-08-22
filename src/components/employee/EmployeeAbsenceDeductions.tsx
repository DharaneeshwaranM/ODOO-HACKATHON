import React, { useState, useEffect } from 'react';
import {
  Coins,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Clock,
  Calculator,
  Info,
  Building,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { SalaryDeductionRequest, AbsencePolicy } from '../../types';
import { api } from '../../api';

export const EmployeeAbsenceDeductions: React.FC = () => {
  const { user } = useAuth();
  const [deductions, setDeductions] = useState<SalaryDeductionRequest[]>([]);
  const [policy, setPolicy] = useState<AbsencePolicy | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [dedList, pol] = await Promise.all([
        api.getSalaryDeductions(),
        api.getAbsencePolicy(),
      ]);
      setDeductions(dedList.filter((d) => d.employeeId === user.id));
      setPolicy(pol);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const allowed = policy?.allowedAbsenceDays || 12;
  const warning = policy?.warningThresholdDays || 10;
  const workingDays = policy?.workingDaysPerMonth || 30;
  const used = user?.usedAbsenceDays || 0;
  const excess = Math.max(0, used - allowed);
  const remaining = Math.max(0, allowed - used);
  const dailyRate = Math.round((user?.monthlySalary || 50000) / workingDays);

  const isExceeded = used > allowed;
  const isWarning = used >= warning && used <= allowed;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 sm:text-2xl flex items-center gap-2">
            <Coins className="h-6 w-6 text-amber-500" />
            Absence Allowance & Salary Deductions
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Transparent breakdown of your organization absence quota, calculation formulas, and review status.
          </p>
        </div>
      </div>

      {/* Warning or Exceeded Critical Banner */}
      {isExceeded && (
        <div className="rounded-2xl border-2 border-red-300 bg-red-50 p-5 shadow-sm">
          <div className="flex items-start gap-3.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-600 text-white">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-red-950">
                🚨 Absence Threshold Exceeded (+{excess} Days Over Limit)
              </h3>
              <p className="text-xs text-red-800 mt-1">
                You have recorded {used} absence days this cycle, which exceeds the company allowance of {allowed} days. A proposed deduction of ₹{(excess * dailyRate).toLocaleString()} has been queued for HR evaluation. Under Dayflow AI governance, no salary is deducted until HR gives explicit review and approval.
              </p>
            </div>
          </div>
        </div>
      )}

      {isWarning && (
        <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4.5 shadow-sm">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 shrink-0 text-amber-600 mt-0.5" />
            <div>
              <h3 className="text-xs font-bold text-amber-950">
                ⚠️ Absence Warning State ({used} of {allowed} Days Used)
              </h3>
              <p className="text-xs text-amber-800 mt-0.5">
                You are nearing the allowed absence threshold with only {remaining} day(s) remaining.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Quota Breakdown Grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase">Allowed Absence</span>
          <p className="text-2xl font-extrabold text-blue-600 mt-1">{allowed} Days</p>
          <span className="text-[10px] text-slate-400">Annual standard policy</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase">Used Absences</span>
          <p className={`text-2xl font-extrabold mt-1 ${isExceeded ? 'text-red-600' : isWarning ? 'text-amber-500' : 'text-slate-900'}`}>
            {used} Days
          </p>
          <span className="text-[10px] text-slate-400">Total days recorded</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase">Remaining Allowed</span>
          <p className="text-2xl font-extrabold text-emerald-600 mt-1">{remaining} Days</p>
          <span className="text-[10px] text-slate-400">Before penalty trigger</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase">Excess Days</span>
          <p className={`text-2xl font-extrabold mt-1 ${excess > 0 ? 'text-red-600 font-bold' : 'text-slate-400'}`}>
            +{excess} Days
          </p>
          <span className="text-[10px] text-slate-400">Subject to daily wage rate</span>
        </div>
      </div>

      {/* Transparent Calculation Explainer */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Calculator className="h-5 w-5 text-blue-600" />
          <h2 className="text-sm font-bold text-slate-900">How Salary Deductions Are Calculated</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
            <span className="text-[10px] uppercase font-semibold text-slate-400 block">Step 1: Excess Calculation</span>
            <p className="font-mono text-slate-900 mt-1">
              Excess Days = Max(0, {used} - {allowed}) = <strong>{excess} days</strong>
            </p>
          </div>

          <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
            <span className="text-[10px] uppercase font-semibold text-slate-400 block">Step 2: Daily Rate</span>
            <p className="font-mono text-slate-900 mt-1">
              ₹{(user?.monthlySalary || 50000).toLocaleString()} ÷ {workingDays} days = <strong>₹{dailyRate} / day</strong>
            </p>
          </div>

          <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
            <span className="text-[10px] uppercase font-semibold text-slate-400 block">Step 3: Proposed Deduction</span>
            <p className="font-mono text-red-600 font-bold mt-1">
              {excess} × ₹{dailyRate} = ₹{(excess * dailyRate).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Deduction Status History Table */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-slate-900">Salary Deduction Audit Status</h2>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-4 py-3.5">Request Date</th>
                  <th className="px-4 py-3.5">Excess Days</th>
                  <th className="px-4 py-3.5">Daily Rate</th>
                  <th className="px-4 py-3.5">Proposed Deduction</th>
                  <th className="px-4 py-3.5">Current Status</th>
                  <th className="px-4 py-3.5">HR Review & Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {deductions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-slate-400">
                      No salary deduction requests found for your account. All within quota.
                    </td>
                  </tr>
                ) : (
                  deductions.map((d) => (
                    <tr key={d.id} className="hover:bg-slate-50/80 transition">
                      <td className="px-4 py-3 text-slate-900 font-medium">{d.requestDate}</td>
                      <td className="px-4 py-3 font-bold text-red-600">+{d.excessDays} day(s)</td>
                      <td className="px-4 py-3 font-mono text-slate-700">₹{Math.round(d.dailyRate).toLocaleString()}</td>
                      <td className="px-4 py-3 font-bold text-slate-900 text-sm">
                        ₹{d.proposedDeduction.toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                            d.status === 'Approved'
                              ? 'bg-red-100 text-red-700'
                              : d.status === 'Rejected'
                              ? 'bg-slate-100 text-slate-700'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {d.status === 'Approved' && <CheckCircle2 className="h-3 w-3 text-red-600" />}
                          {d.status === 'Pending' && <Clock className="h-3 w-3 text-amber-600" />}
                          {d.status === 'Rejected' && <CheckCircle2 className="h-3 w-3 text-slate-600" />}
                          {d.status === 'Pending' ? 'Pending HR Review' : d.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        {d.status === 'Pending' && (
                          <span className="italic text-amber-700">
                            Awaiting HR evaluation. Salary is not deducted.
                          </span>
                        )}
                        {d.status === 'Approved' && (
                          <span>Approved by {d.approvedBy} on {d.approvedAt} (Amount: ₹{d.approvedAmount?.toLocaleString()})</span>
                        )}
                        {d.status === 'Rejected' && (
                          <span>Waived by HR: {d.rejectionReason}</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
