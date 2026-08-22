import React, { useState, useMemo } from 'react';
import { LeaveRequest, Employee, Department, UserRole } from '../types';
import { DayflowEngine } from '../services/dayflowEngine';
import { 
  CalendarClock, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Plus, 
  Users, 
  ShieldAlert, 
  Info, 
  Sparkles, 
  Calendar,
  Layers,
  ArrowRight
} from 'lucide-react';

interface LeaveManagementViewProps {
  leaves: LeaveRequest[];
  employees: Employee[];
  departments: Department[];
  userRole: UserRole;
  onApproveLeave: (leaveId: string) => void;
  onRejectLeave: (leaveId: string) => void;
  onSubmitLeave: (newLeave: Partial<LeaveRequest>) => void;
}

export const LeaveManagementView: React.FC<LeaveManagementViewProps> = ({
  leaves,
  employees,
  departments,
  userRole,
  onApproveLeave,
  onRejectLeave,
  onSubmitLeave,
}) => {
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedEmpId, setSelectedEmpId] = useState<number>(3); // Default Priya Sharma
  const [leaveType, setLeaveType] = useState<'Paid Vacation' | 'Sick Leave' | 'Casual Leave' | 'Unpaid Leave'>('Paid Vacation');
  const [dateFrom, setDateFrom] = useState('2026-08-26');
  const [dateTo, setDateTo] = useState('2026-08-28');
  const [reason, setReason] = useState('Personal and family commitment');

  const selectedEmployee = employees.find(e => e.id === selectedEmpId) || employees[0];

  // Live Smart Leave Impact calculation in real-time
  const liveImpact = useMemo(() => {
    return DayflowEngine.analyzeLeaveImpact(
      selectedEmpId,
      selectedEmployee.departmentId,
      dateFrom,
      dateTo,
      employees,
      leaves
    );
  }, [selectedEmpId, selectedEmployee.departmentId, dateFrom, dateTo, employees, leaves]);

  const handleCreateLeave = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitLeave({
      employeeId: selectedEmployee.id,
      employeeName: selectedEmployee.name,
      departmentId: selectedEmployee.departmentId,
      departmentName: selectedEmployee.departmentName,
      leaveType,
      dateFrom,
      dateTo,
      numberOfDays: 3,
      reason,
      state: 'confirm',
      impactLevel: liveImpact.impactLevel,
      currentAvailabilityPct: liveImpact.currentAvailabilityPct,
      projectedAvailabilityPct: liveImpact.projectedAvailabilityPct,
      hasOverlapWarning: liveImpact.hasOverlapWarning,
      overlapCount: liveImpact.overlapCount,
      overlappingEmployees: liveImpact.overlappingEmployees,
      impactRecommendation: liveImpact.impactRecommendation,
      submittedDate: 'Today',
    });
    setShowApplyModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 uppercase">
              Smart Leave Impact &amp; Overlap Engine
            </span>
            <span className="text-xs text-slate-500 font-medium">Live Capacity Simulation</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <CalendarClock className="w-6 h-6 text-blue-600" />
            <span>Leave Management &amp; Impact Analysis</span>
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Evaluate projected workforce capacity and concurrent colleague overlaps before approval.
          </p>
        </div>

        <button
          onClick={() => setShowApplyModal(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-sm transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Apply for Leave</span>
        </button>
      </div>

      {/* Pending Leave Requests with Smart Impact Highlight */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <span>Active &amp; Pending Leave Requests</span>
          </h2>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold uppercase">
            {leaves.length} Total
          </span>
        </div>

        <div className="space-y-4">
          {leaves.map(req => {
            const isHigh = req.impactLevel === 'high';
            const isPending = req.state === 'confirm';

            return (
              <div
                key={req.id}
                className={`bg-white rounded-lg border p-5 shadow-sm transition-colors ${
                  isHigh ? 'border-orange-300 bg-orange-50/10' : 'border-slate-200'
                }`}
              >
                {/* Overlap / High Impact Alert Banner inside Leave Card */}
                {req.hasOverlapWarning && (
                  <div className="mb-4 p-3 rounded-md bg-orange-50 border border-orange-200 text-xs flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-orange-900 block font-bold">
                        LEAVE OVERLAP WARNING ({req.overlapCount} Concurrent Colleague):
                      </strong>
                      <span className="text-orange-800">
                        {req.overlappingEmployees?.join(', ')} already has scheduled leave during this period.
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-md bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                      <Calendar className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-slate-900 text-base">{req.employeeName}</h3>
                        <span className="text-xs text-slate-500 font-medium">• {req.departmentName}</span>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 uppercase">
                          {req.leaveType}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        <strong>{req.dateFrom}</strong> to <strong>{req.dateTo}</strong> ({req.numberOfDays} days) • Reason: <em>"{req.reason}"</em>
                      </p>
                    </div>
                  </div>

                  {/* Impact Metrics Pill */}
                  <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-md border border-slate-200">
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase font-bold">Projected Availability</div>
                      <div className="text-base font-bold text-slate-900">{req.projectedAvailabilityPct}%</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase font-bold">Impact Level</div>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase ${
                        isHigh ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {req.impactLevel} IMPACT
                      </span>
                    </div>
                  </div>
                </div>

                {/* AI Impact Guidance */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                  <div className="text-slate-600 flex items-start gap-1.5 flex-1">
                    <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <span><strong>AI Guidance:</strong> {req.impactRecommendation}</span>
                  </div>

                  {/* State & HR Decision Buttons */}
                  <div className="flex items-center gap-2 shrink-0">
                    {isPending ? (
                      userRole === 'hr' ? (
                        <>
                          <button
                            onClick={() => onRejectLeave(req.id)}
                            className="px-3 py-1.5 rounded-md text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors cursor-pointer flex items-center gap-1"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Decline Request</span>
                          </button>
                          <button
                            onClick={() => onApproveLeave(req.id)}
                            className="px-3 py-1.5 rounded-md text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-colors cursor-pointer flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Approve Leave</span>
                          </button>
                        </>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase bg-orange-100 text-orange-700">
                          Pending HR Approval
                        </span>
                      )
                    ) : req.state === 'validate' ? (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase bg-emerald-100 text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Approved &amp; Scheduled</span>
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase bg-red-100 text-red-700 flex items-center gap-1">
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Declined</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Apply Leave Modal with Live Capacity Simulation */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-xl w-full p-6 shadow-xl border border-slate-200 space-y-5 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Submit New Leave Request</h3>
                <p className="text-xs text-slate-500">Includes real-time smart workforce impact simulation</p>
              </div>
              <button
                onClick={() => setShowApplyModal(false)}
                className="w-8 h-8 rounded-md bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateLeave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Employee</label>
                <select
                  value={selectedEmpId}
                  onChange={e => setSelectedEmpId(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md focus:ring-2 focus:ring-blue-500 font-medium"
                >
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} ({emp.departmentName} - {emp.jobTitle})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Start Date</label>
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={e => setDateFrom(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md focus:ring-2 focus:ring-blue-500 font-medium"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">End Date</label>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={e => setDateTo(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md focus:ring-2 focus:ring-blue-500 font-medium"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Leave Type</label>
                <select
                  value={leaveType}
                  onChange={e => setLeaveType(e.target.value as any)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md focus:ring-2 focus:ring-blue-500 font-medium"
                >
                  <option value="Paid Vacation">Paid Vacation</option>
                  <option value="Sick Leave">Sick Leave</option>
                  <option value="Casual Leave">Casual Leave</option>
                  <option value="Unpaid Leave">Unpaid Leave</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Reason / Remarks</label>
                <textarea
                  rows={2}
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  placeholder="Provide context for manager review..."
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* LIVE Smart Leave Impact Simulation Box */}
              <div className="p-4 rounded-md bg-slate-50 border border-blue-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase text-blue-900 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    <span>Live Workforce Impact Preview</span>
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase ${
                    liveImpact.impactLevel === 'high' ? 'bg-red-100 text-red-700' :
                    liveImpact.impactLevel === 'medium' ? 'bg-orange-100 text-orange-700' : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    {liveImpact.impactLevel} IMPACT
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs py-1">
                  <div>Current Dept Availability: <strong>{liveImpact.currentAvailabilityPct}%</strong></div>
                  <div>Projected Availability: <strong className={liveImpact.projectedAvailabilityPct < 75 ? 'text-red-600 font-bold' : 'text-emerald-600 font-bold'}>{liveImpact.projectedAvailabilityPct}%</strong></div>
                </div>

                {liveImpact.hasOverlapWarning && (
                  <div className="text-xs text-orange-800 bg-orange-50 p-2 rounded border border-orange-200">
                    ⚠️ Overlaps with colleague(s): <strong>{liveImpact.overlappingEmployees.join(', ')}</strong>
                  </div>
                )}

                <p className="text-xs text-slate-600 italic">
                  👉 {liveImpact.impactRecommendation}
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowApplyModal(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-sm transition-colors cursor-pointer"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
