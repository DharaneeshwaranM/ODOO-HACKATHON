import React, { useState, useEffect } from 'react';
import {
  Coins,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Check,
  X,
  FileText,
  Calculator,
  ShieldCheck,
  Building,
  User,
  ArrowRight,
} from 'lucide-react';
import { SalaryDeductionRequest } from '../../types';
import { api } from '../../api';

export const SalaryDeductionRequests: React.FC = () => {
  const [deductions, setDeductions] = useState<SalaryDeductionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  // Action Modals
  const [selectedDeduction, setSelectedDeduction] = useState<SalaryDeductionRequest | null>(null);
  const [modalAction, setModalAction] = useState<'approve' | 'reject' | null>(null);
  const [approvedAmount, setApprovedAmount] = useState<number>(0);
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    loadDeductions();
  }, []);

  const loadDeductions = async () => {
    setLoading(true);
    try {
      const data = await api.getSalaryDeductions();
      setDeductions(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenApprove = (req: SalaryDeductionRequest) => {
    setSelectedDeduction(req);
    setApprovedAmount(req.proposedDeduction);
    setModalAction('approve');
  };

  const handleOpenReject = (req: SalaryDeductionRequest) => {
    setSelectedDeduction(req);
    setRejectionReason('Medical certificate verified. Management approved special absence waiver.');
    setModalAction('reject');
  };

  const handleConfirmApprove = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDeduction) return;
    setSubmitting(true);
    try {
      const res = await api.approveSalaryDeduction(selectedDeduction.id, approvedAmount);
      setDeductions((prev) => prev.map((d) => (d.id === selectedDeduction.id ? res.deduction : d)));
      setModalAction(null);
      setSelectedDeduction(null);
      setSuccessMessage(`Deduction request for ${res.deduction.employeeName} approved (₹${approvedAmount.toLocaleString()}). Email confirmation dispatched.`);
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err: any) {
      alert(err.message || 'Failed to approve salary deduction.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDeduction) return;
    setSubmitting(true);
    try {
      const res = await api.rejectSalaryDeduction(selectedDeduction.id, rejectionReason);
      setDeductions((prev) => prev.map((d) => (d.id === selectedDeduction.id ? res.deduction : d)));
      setModalAction(null);
      setSelectedDeduction(null);
      setSuccessMessage(`Deduction request for ${res.deduction.employeeName} rejected & waived. Employee notified.`);
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err: any) {
      alert(err.message || 'Failed to reject salary deduction.');
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = deductions.filter(
    (d) => statusFilter === 'all' || d.status === statusFilter
  );

  const pendingCount = deductions.filter((d) => d.status === 'Pending').length;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 sm:text-2xl flex items-center gap-2">
            <Coins className="h-6 w-6 text-amber-500" />
            Salary Deduction Approval Workflow
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Strict HR review gate for absence limit overages. Salary deductions are never applied automatically.
          </p>
        </div>

        {pendingCount > 0 && (
          <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 px-4 py-2 text-xs font-bold text-red-700 animate-pulse">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <span>{pendingCount} Pending Deduction(s) Require Decision</span>
          </div>
        )}
      </div>

      {successMessage && (
        <div className="flex items-center gap-2.5 rounded-xl bg-emerald-50 border border-emerald-200 p-3.5 text-xs text-emerald-800 animate-in fade-in">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Governance Explainer Card */}
      <div className="rounded-2xl border border-blue-200 bg-blue-50/60 p-4.5 text-xs text-blue-900">
        <div className="flex items-center gap-2 font-bold mb-1">
          <ShieldCheck className="h-4 w-4 text-blue-600" />
          <span>Payroll Governance & Calculation Protocol</span>
        </div>
        <p className="text-blue-800">
          When an employee crosses the allowed absence limit, Dayflow AI generates a <em>Pending Request</em> with formula:{' '}
          <code className="bg-blue-100 px-1 py-0.5 rounded text-[11px] font-mono">
            Excess Days × (Monthly Salary ÷ Working Days)
          </code>
          . Deductions are only committed to payroll once an HR Administrator explicitly reviews and approves the request.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setStatusFilter('all')}
          className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
            statusFilter === 'all' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          All Requests ({deductions.length})
        </button>
        <button
          onClick={() => setStatusFilter('Pending')}
          className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
            statusFilter === 'Pending' ? 'bg-amber-500 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Pending Action ({deductions.filter((d) => d.status === 'Pending').length})
        </button>
        <button
          onClick={() => setStatusFilter('Approved')}
          className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
            statusFilter === 'Approved' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Approved ({deductions.filter((d) => d.status === 'Approved').length})
        </button>
        <button
          onClick={() => setStatusFilter('Rejected')}
          className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
            statusFilter === 'Rejected' ? 'bg-red-600 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Rejected / Waived ({deductions.filter((d) => d.status === 'Rejected').length})
        </button>
      </div>

      {/* Deduction Requests Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3.5">Employee</th>
                <th className="px-4 py-3.5">Absences</th>
                <th className="px-4 py-3.5">Base Salary</th>
                <th className="px-4 py-3.5">Daily Rate</th>
                <th className="px-4 py-3.5">Proposed Deduction</th>
                <th className="px-4 py-3.5">Request Date</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5 text-right">HR Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No salary deduction requests found in this category.
                  </td>
                </tr>
              ) : (
                filtered.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/80 transition">
                    <td className="px-4 py-3">
                      <div>
                        <span className="font-semibold text-slate-900">{req.employeeName}</span>
                        <span className="ml-1.5 font-mono text-[10px] text-blue-600">({req.employeeCode})</span>
                        <p className="text-[11px] text-slate-400">{req.department}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="space-y-0.5">
                        <span className="text-slate-700">Used: <strong>{req.usedAbsences}</strong> / {req.allowedAbsences}</span>
                        <p className="font-bold text-red-600">+{req.excessDays} excess day(s)</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-800">
                      ₹{req.monthlySalary.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-700">
                      ₹{Math.round(req.dailyRate).toLocaleString()} / day
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-bold text-red-700 text-sm">
                        ₹{req.proposedDeduction.toLocaleString()}
                      </span>
                      {req.approvedAmount !== undefined && req.status === 'Approved' && (
                        <p className="text-[10px] text-emerald-600 font-semibold">
                          Approved: ₹{req.approvedAmount.toLocaleString()}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-500">{req.requestDate}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                          req.status === 'Approved'
                            ? 'bg-emerald-100 text-emerald-700'
                            : req.status === 'Rejected'
                            ? 'bg-slate-100 text-slate-700'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {req.status === 'Approved' && <CheckCircle2 className="h-3 w-3 text-emerald-600" />}
                        {req.status === 'Rejected' && <XCircle className="h-3 w-3 text-slate-600" />}
                        {req.status === 'Pending' && <Clock className="h-3 w-3 text-amber-600" />}
                        {req.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {req.status === 'Pending' ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenApprove(req)}
                            className="flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-bold text-white hover:bg-emerald-700 transition"
                          >
                            <Check className="h-3.5 w-3.5" />
                            <span>Approve</span>
                          </button>
                          <button
                            onClick={() => handleOpenReject(req)}
                            className="flex items-center gap-1 rounded-lg bg-slate-600 px-2.5 py-1 text-xs font-bold text-white hover:bg-slate-700 transition"
                          >
                            <X className="h-3.5 w-3.5" />
                            <span>Reject</span>
                          </button>
                        </div>
                      ) : (
                        <div className="text-[11px] text-slate-400">
                          {req.status === 'Approved' ? (
                            <span>Processed by {req.approvedBy} on {req.approvedAt}</span>
                          ) : (
                            <span className="italic">Waived: {req.rejectionReason}</span>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* APPROVE DEDUCTION MODAL */}
      {modalAction === 'approve' && selectedDeduction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-200 bg-emerald-700 px-6 py-4 text-white">
              <h2 className="text-sm font-bold flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" />
                Approve Salary Deduction
              </h2>
              <button
                onClick={() => setModalAction(null)}
                className="rounded-lg p-1 text-white/80 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmApprove} className="p-6 space-y-4 text-xs">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-900 text-sm">{selectedDeduction.employeeName}</span>
                  <span className="font-mono font-bold text-blue-600">{selectedDeduction.employeeCode}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-slate-600 pt-2 border-t border-slate-200">
                  <div>Allowed Limit: <strong>{selectedDeduction.allowedAbsences} days</strong></div>
                  <div>Used Absences: <strong>{selectedDeduction.usedAbsences} days</strong></div>
                  <div>Excess Absence: <strong className="text-red-600">+{selectedDeduction.excessDays} days</strong></div>
                  <div>Daily Rate: <strong>₹{Math.round(selectedDeduction.dailyRate).toLocaleString()}</strong></div>
                </div>
                <div className="pt-2 border-t border-slate-200 text-slate-700 flex items-center justify-between">
                  <span>Calculated Proposed Amount:</span>
                  <span className="font-extrabold text-red-600 text-sm">
                    ₹{selectedDeduction.proposedDeduction.toLocaleString()}
                  </span>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Approved Deduction Amount (₹) (HR may adjust for partial relief)
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  max={selectedDeduction.monthlySalary}
                  value={approvedAmount}
                  onChange={(e) => setApprovedAmount(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold text-slate-900 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-[11px] text-amber-900">
                ⚠️ Approving will apply this deduction to the employee's payroll record, log a compliance audit entry, and dispatch an official confirmation email.
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalAction(null)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-slate-600 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-emerald-600 px-5 py-2 font-bold text-white shadow-md hover:bg-emerald-700 transition disabled:opacity-50"
                >
                  {submitting ? 'Applying...' : 'Confirm & Apply Deduction'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REJECT DEDUCTION MODAL */}
      {modalAction === 'reject' && selectedDeduction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-800 px-6 py-4 text-white">
              <h2 className="text-sm font-bold flex items-center gap-2">
                <XCircle className="h-5 w-5 text-red-400" />
                Reject / Waive Salary Deduction
              </h2>
              <button
                onClick={() => setModalAction(null)}
                className="rounded-lg p-1 text-white/80 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmReject} className="p-6 space-y-4 text-xs">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                <p className="font-bold text-slate-900">
                  {selectedDeduction.employeeName} ({selectedDeduction.employeeCode})
                </p>
                <p className="text-slate-600 mt-0.5">
                  Proposed amount of ₹{selectedDeduction.proposedDeduction.toLocaleString()} for +{selectedDeduction.excessDays} excess absence day(s).
                </p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Reason for Rejection / Waiver Justification * (Audited)
                </label>
                <textarea
                  rows={3}
                  required
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalAction(null)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-slate-600 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-slate-800 px-5 py-2 font-bold text-white shadow-md hover:bg-slate-900 transition disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Reject Deduction & Waive'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
