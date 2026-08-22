import React, { useState, useEffect } from 'react';
import {
  CalendarDays,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Filter,
  Eye,
  Check,
  X,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { LeaveRequest } from '../../types';
import { api } from '../../api';

export const LeaveManagement: React.FC = () => {
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // Review Modal State
  const [selectedLeave, setSelectedLeave] = useState<LeaveRequest | null>(null);
  const [actionType, setActionType] = useState<'Approved' | 'Rejected'>('Approved');
  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    loadLeaves();
  }, [statusFilter]);

  const loadLeaves = async () => {
    setLoading(true);
    try {
      const data = await api.getLeaves({
        status: statusFilter !== 'all' ? statusFilter : undefined,
      });
      setLeaves(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenReview = (leave: LeaveRequest, action: 'Approved' | 'Rejected') => {
    setSelectedLeave(leave);
    setActionType(action);
    setRemarks(action === 'Approved' ? 'Approved by HR operations.' : 'Denied due to project staffing constraints.');
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLeave) return;

    setSubmitting(true);
    try {
      const updated = await api.reviewLeave(selectedLeave.id, {
        status: actionType,
        remarks,
      });
      setLeaves((prev) => prev.map((l) => (l.id === selectedLeave.id ? updated : l)));
      setSelectedLeave(null);
      setSuccessMessage(`Leave request for ${updated.employeeName} marked as ${actionType}. Email confirmation dispatched.`);
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err: any) {
      alert(err.message || 'Failed to review leave.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredLeaves = leaves.filter((l) => {
    const term = searchTerm.toLowerCase();
    return (
      l.employeeName.toLowerCase().includes(term) ||
      l.employeeCode.toLowerCase().includes(term) ||
      l.leaveType.toLowerCase().includes(term) ||
      l.department.toLowerCase().includes(term)
    );
  });

  const pendingCount = leaves.filter((l) => l.status === 'Pending').length;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 sm:text-2xl flex items-center gap-2">
            <CalendarDays className="h-6 w-6 text-blue-600" />
            Leave Applications & Approvals
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Review PTO, sick leave, and casual leave requests submitted by staff.
          </p>
        </div>

        {pendingCount > 0 && (
          <div className="flex items-center gap-2 rounded-xl bg-amber-50 border border-amber-200 px-3.5 py-2 text-xs font-semibold text-amber-900">
            <Clock className="h-4 w-4 text-amber-600 animate-spin" />
            <span>{pendingCount} Pending Application(s) Awaiting Review</span>
          </div>
        )}
      </div>

      {successMessage && (
        <div className="flex items-center gap-2.5 rounded-xl bg-emerald-50 border border-emerald-200 p-3.5 text-xs text-emerald-800 animate-in fade-in">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search employee, leave type, department..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-9 pr-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-400 shrink-0" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none"
            >
              <option value="all">All Request Statuses</option>
              <option value="Pending">Pending Review</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3.5">Employee</th>
                <th className="px-4 py-3.5">Type</th>
                <th className="px-4 py-3.5">Duration</th>
                <th className="px-4 py-3.5">Total Days</th>
                <th className="px-4 py-3.5">Reason</th>
                <th className="px-4 py-3.5">Applied Date</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5 text-right">HR Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLeaves.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No leave requests found for this filter.
                  </td>
                </tr>
              ) : (
                filteredLeaves.map((leave) => (
                  <tr key={leave.id} className="hover:bg-slate-50/80 transition">
                    <td className="px-4 py-3">
                      <div>
                        <span className="font-semibold text-slate-900">{leave.employeeName}</span>
                        <span className="ml-1.5 font-mono text-[10px] text-blue-600">({leave.employeeCode})</span>
                        <p className="text-[11px] text-slate-400">{leave.department}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded bg-slate-100 px-2 py-0.5 font-medium text-slate-700">
                        {leave.leaveType}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-800">
                      {leave.startDate} <span className="text-slate-400">to</span> {leave.endDate}
                    </td>
                    <td className="px-4 py-3 font-bold text-slate-900">{leave.days} day(s)</td>
                    <td className="px-4 py-3 text-slate-600 max-w-xs truncate" title={leave.reason}>
                      {leave.reason}
                    </td>
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
                    <td className="px-4 py-3 text-right">
                      {leave.status === 'Pending' ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenReview(leave, 'Approved')}
                            className="flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-bold text-white hover:bg-emerald-700 transition"
                          >
                            <Check className="h-3.5 w-3.5" />
                            <span>Approve</span>
                          </button>
                          <button
                            onClick={() => handleOpenReview(leave, 'Rejected')}
                            className="flex items-center gap-1 rounded-lg bg-red-600 px-2.5 py-1 text-xs font-bold text-white hover:bg-red-700 transition"
                          >
                            <X className="h-3.5 w-3.5" />
                            <span>Reject</span>
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">
                          {leave.remarks ? `Remarks: ${leave.remarks}` : 'Resolved'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* REVIEW LEAVE MODAL */}
      {selectedLeave && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden border border-slate-200">
            <div
              className={`flex items-center justify-between px-6 py-4 text-white ${
                actionType === 'Approved' ? 'bg-emerald-700' : 'bg-red-700'
              }`}
            >
              <h2 className="text-sm font-bold flex items-center gap-2">
                {actionType === 'Approved' ? <CheckCircle2 className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
                Confirm Leave {actionType}
              </h2>
              <button
                onClick={() => setSelectedLeave(null)}
                className="rounded-lg p-1 text-white/80 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleReviewSubmit} className="p-6 space-y-4 text-xs">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-1">
                <p className="font-bold text-slate-900 text-sm">{selectedLeave.employeeName}</p>
                <p className="text-slate-600">
                  {selectedLeave.leaveType} • {selectedLeave.days} Day(s) ({selectedLeave.startDate} to {selectedLeave.endDate})
                </p>
                <p className="text-slate-500 italic mt-1">"{selectedLeave.reason}"</p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  HR Review Remarks / Justification (Included in Employee Email)
                </label>
                <textarea
                  rows={3}
                  required
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedLeave(null)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-slate-600 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className={`rounded-xl px-5 py-2 font-bold text-white shadow-md transition disabled:opacity-50 ${
                    actionType === 'Approved' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {submitting ? 'Submitting & Emailing...' : `Confirm & Mark as ${actionType}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
