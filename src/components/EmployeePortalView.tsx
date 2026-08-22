import React from 'react';
import { Employee, LeaveRequest } from '../types';
import { User, Clock, Calendar, FileText, CheckCircle2, ShieldCheck, TrendingUp, Sparkles } from 'lucide-react';

interface EmployeePortalViewProps {
  currentEmployee: Employee;
  leaves: LeaveRequest[];
  employeeCheckedIn: boolean;
  onToggleCheckIn: () => void;
  onNavigateTab: (tab: string) => void;
  onGeneratePayslip: (emp: Employee) => void;
}

export const EmployeePortalView: React.FC<EmployeePortalViewProps> = ({
  currentEmployee,
  leaves,
  employeeCheckedIn,
  onToggleCheckIn,
  onNavigateTab,
  onGeneratePayslip,
}) => {
  const myLeaves = leaves.filter(l => l.employeeId === currentEmployee.id);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-white text-slate-900 p-6 rounded-lg border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img
            src={currentEmployee.avatar}
            alt={currentEmployee.name}
            className="w-16 h-16 rounded-lg object-cover border border-slate-200 shadow-sm"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900">{currentEmployee.name}</h1>
              <span className="px-2 py-0.5 rounded text-xs font-mono bg-slate-100 text-slate-700 font-semibold">
                {currentEmployee.badgeId}
              </span>
            </div>
            <p className="text-slate-500 text-sm">{currentEmployee.jobTitle} • {currentEmployee.departmentName}</p>
            <p className="text-xs text-slate-400 mt-0.5">{currentEmployee.email}</p>
          </div>
        </div>

        {/* Quick Check-In Widget */}
        <div className="flex items-center gap-3 bg-slate-900 text-white p-3 rounded-lg border border-slate-800">
          <div className="text-xs pr-3 border-r border-slate-700">
            <div className="text-slate-400">Attendance Status:</div>
            <strong className={employeeCheckedIn ? 'text-emerald-400 font-semibold' : 'text-red-400 font-semibold'}>
              {employeeCheckedIn ? 'Currently Active' : 'Not Checked In'}
            </strong>
          </div>
          <button
            onClick={onToggleCheckIn}
            className={`px-4 py-2 rounded-md text-xs font-semibold transition-colors cursor-pointer shadow-sm ${
              employeeCheckedIn
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
          >
            {employeeCheckedIn ? 'Punch Check Out' : 'Punch Check In'}
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
          <div className="text-slate-500 text-xs font-bold uppercase tracking-wider">My Attendance Rate</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{currentEmployee.attendanceRate}%</div>
          <div className="text-xs text-emerald-600 font-semibold mt-1 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Optimal Engagement Tier</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
          <div className="text-slate-500 text-xs font-bold uppercase tracking-wider">Leave Balance Remaining</div>
          <div className="text-2xl font-bold text-blue-600 mt-1">18 Days</div>
          <div className="text-xs text-slate-400 mt-1 font-medium">Paid Vacation + Sick Leave</div>
        </div>

        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
          <div className="text-slate-500 text-xs font-bold uppercase tracking-wider">Monthly Net Salary</div>
          <div className="text-2xl font-bold text-emerald-600 mt-1">
            ${Math.round(currentEmployee.monthlyWage * 0.78).toLocaleString()}
          </div>
          <button
            onClick={() => onGeneratePayslip(currentEmployee)}
            className="text-xs text-blue-600 hover:underline font-semibold mt-1 block cursor-pointer"
          >
            Download August 2026 Payslip →
          </button>
        </div>
      </div>

      {/* My Leave Requests Section */}
      <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            <span>My Recent Leave History</span>
          </h3>
          <button
            onClick={() => onNavigateTab('leave')}
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-medium shadow-sm transition-colors cursor-pointer"
          >
            + Request Time Off
          </button>
        </div>

        {myLeaves.length === 0 ? (
          <p className="text-xs text-slate-500 italic py-3">No active leave requests filed.</p>
        ) : (
          <div className="space-y-3">
            {myLeaves.map(leave => (
              <div key={leave.id} className="p-4 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-slate-900 text-sm">{leave.leaveType}</div>
                  <div className="text-slate-500 mt-0.5">{leave.dateFrom} to {leave.dateTo} ({leave.numberOfDays} days) • Reason: {leave.reason}</div>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase ${
                  leave.state === 'validate' ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'
                }`}>
                  {leave.state === 'validate' ? 'Approved' : 'Pending Review'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
