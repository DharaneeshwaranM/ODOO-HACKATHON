import React, { useState, useEffect } from 'react';
import {
  CalendarDays,
  Send,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  Plus,
  X,
  FileText,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { LeaveRequest } from '../../types';
import { api } from '../../api';

export const EmployeeLeaves: React.FC = () => {
  const { user } = useAuth();
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [balances, setBalances] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Apply Form State
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [leaveType, setLeaveType] = useState('Paid Time Off (PTO)');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadLeaveData();
    }
  }, [user]);

  const loadLeaveData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [leaveList, bal] = await Promise.all([
        api.getLeaves({ employeeId: user.id }),
        api.getLeaveBalance(user.id),
      ]);
      setLeaves(leaveList);
      setBalances(bal);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Calculate days between start and end
  const calcDays = () => {
    if (!startDate || !endDate) return 1;
    const s = new Date(startDate);
    const e = new Date(endDate);
    const diffTime = e.getTime() - s.getTime();
    if (diffTime < 0) return 0;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const days = calcDays();
    if (days <= 0) {
      alert('End date cannot be prior to start date.');
      return;
    }
    if (!reason.trim()) {
      alert('Please provide a reason for the leave application.');
      return;
    }

    setSubmitting(true);
    try {
      const newLeave = await api.applyLeave({
        leaveType,
        startDate,
        endDate,
        reason,
      });
      setLeaves((prev) => [newLeave, ...prev]);
      setIsApplyModalOpen(false);
      setReason('');
      setSuccessMessage('Leave application submitted successfully! HR has been notified for review.');
      setTimeout(() => setSuccessMessage(null), 5000);
      await loadLeaveData();
    } catch (err: any) {
      alert(err.message || 'Failed to submit leave application.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 sm:text-2xl flex items-center gap-2">
            <CalendarDays className="h-6 w-6 text-blue-600" />
            Leave Management & Entitlements
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Submit time-off requests, track approval status, and monitor remaining leave quotas.
          </p>
        </div>

        <button
          onClick={() => setIsApplyModalOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-blue-700 transition"
        >
          <Plus className="h-4 w-4" />
          <span>Apply for Leave</span>
        </button>
      </div>

      {successMessage && (
        <div className="flex items-center gap-2.5 rounded-xl bg-emerald-50 border border-emerald-200 p-3.5 text-xs text-emerald-800 animate-in fade-in">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Balance Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase">Paid Time Off (PTO)</span>
          <p className="text-2xl font-extrabold text-blue-600 mt-1">
            {balances ? balances.paidTimeOff.total - balances.paidTimeOff.used : 14}
            <span className="text-xs font-medium text-slate-400"> days left</span>
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            Total quota: {balances?.paidTimeOff.total || 14} days
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase">Sick Leave</span>
          <p className="text-2xl font-extrabold text-emerald-600 mt-1">
            {balances ? balances.sickLeave.total - balances.sickLeave.used : 10}
            <span className="text-xs font-medium text-slate-400"> days left</span>
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            Total quota: {balances?.sickLeave.total || 10} days
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase">Casual Leave</span>
          <p className="text-2xl font-extrabold text-indigo-600 mt-1">
            {balances ? balances.casualLeave.total - balances.casualLeave.used : 6}
            <span className="text-xs font-medium text-slate-400"> days left</span>
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            Total quota: {balances?.casualLeave.total || 6} days
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase">Emergency Leave</span>
          <p className="text-2xl font-extrabold text-purple-600 mt-1">
            {balances ? balances.emergencyLeave.total - balances.emergencyLeave.used : 3}
            <span className="text-xs font-medium text-slate-400"> days left</span>
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            Total quota: {balances?.emergencyLeave.total || 3} days
          </p>
        </div>
      </div>

      {/* Submitted Requests Table */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-slate-900">My Leave Applications</h2>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-4 py-3.5">Leave Type</th>
                  <th className="px-4 py-3.5">Duration</th>
                  <th className="px-4 py-3.5">Days</th>
                  <th className="px-4 py-3.5">Reason</th>
                  <th className="px-4 py-3.5">Applied Date</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5">HR Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {leaves.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      No leave requests submitted yet.
                    </td>
                  </tr>
                ) : (
                  leaves.map((leave) => (
                    <tr key={leave.id} className="hover:bg-slate-50/80 transition">
                      <td className="px-4 py-3 font-semibold text-slate-900">{leave.leaveType}</td>
                      <td className="px-4 py-3 text-slate-700">
                        {leave.startDate} <span className="text-slate-400">to</span> {leave.endDate}
                      </td>
                      <td className="px-4 py-3 font-bold text-slate-900">{leave.days} day(s)</td>
                      <td className="px-4 py-3 text-slate-600 max-w-xs">{leave.reason}</td>
                      <td className="px-4 py-3 text-slate-400">{leave.appliedAt}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                            leave.status === 'Approved'
                              ? 'bg-emerald-100 text-emerald-700'
                              : leave.status === 'Rejected'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {leave.status === 'Approved' && <CheckCircle2 className="h-3 w-3" />}
                          {leave.status === 'Rejected' && <XCircle className="h-3 w-3" />}
                          {leave.status === 'Pending' && <Clock className="h-3 w-3" />}
                          {leave.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-500 italic">
                        {leave.remarks || (leave.status === 'Pending' ? 'Awaiting HR decision' : 'None')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* APPLY LEAVE MODAL */}
      {isApplyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-900 px-6 py-4 text-white">
              <h2 className="text-sm font-bold flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-blue-400" />
                Submit Time-Off Application
              </h2>
              <button
                onClick={() => setIsApplyModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleApplySubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Leave Category *</label>
                <select
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 focus:border-blue-500 focus:outline-none"
                >
                  <option value="Paid Time Off (PTO)">Paid Time Off (PTO)</option>
                  <option value="Sick Leave">Sick Leave</option>
                  <option value="Casual Leave">Casual Leave</option>
                  <option value="Emergency Leave">Emergency Leave</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Start Date *</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">End Date *</label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="rounded-xl bg-blue-50 p-3 text-blue-900 font-semibold flex items-center justify-between">
                <span>Calculated Duration:</span>
                <span className="font-bold text-sm text-blue-700">{calcDays()} Day(s)</span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Reason / Justification *</label>
                <textarea
                  rows={3}
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Provide brief context for HR and your manager..."
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsApplyModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-slate-600 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-blue-600 px-5 py-2 font-bold text-white shadow-md hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
