import React, { useState } from 'react';
import { Employee, UserRole } from '../types';
import { 
  Clock, 
  UserCheck, 
  UserX, 
  AlertCircle, 
  Calendar, 
  Search, 
  CheckCircle2, 
  Flame, 
  LogIn, 
  LogOut 
} from 'lucide-react';

interface AttendanceViewProps {
  employees: Employee[];
  userRole: UserRole;
  employeeCheckedIn: boolean;
  onToggleCheckIn: () => void;
}

export const AttendanceView: React.FC<AttendanceViewProps> = ({
  employees,
  userRole,
  employeeCheckedIn,
  onToggleCheckIn,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDept, setFilterDept] = useState('All');

  const presentCount = employees.filter(e => e.todayStatus === 'present' || e.todayStatus === 'late').length;
  const lateCount = employees.filter(e => e.todayStatus === 'late').length;
  const absentCount = employees.filter(e => e.todayStatus === 'absent').length;
  const onLeaveCount = employees.filter(e => e.todayStatus === 'leave').length;

  const filtered = employees.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          emp.badgeId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = filterDept === 'All' || emp.departmentName === filterDept;
    return matchesSearch && matchesDept;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 uppercase">
              Odoo 17 Attendance Tracking
            </span>
            <span className="text-xs text-slate-500 font-medium">Live Kiosk &amp; Web Punch</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Clock className="w-6 h-6 text-blue-600" />
            <span>Attendance &amp; Punctuality Monitor</span>
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Real-time biometric check-in stream, tardiness detection, and daily roster compliance.
          </p>
        </div>

        {/* Employee Check-In / Check-Out Action Banner */}
        <div className="flex items-center gap-3 bg-slate-900 text-white p-3 rounded-lg border border-slate-800">
          <div className="text-xs pr-3 border-r border-slate-700">
            <div className="text-slate-400">My Status:</div>
            <strong className={employeeCheckedIn ? 'text-emerald-400 font-semibold' : 'text-red-400 font-semibold'}>
              {employeeCheckedIn ? 'Active (Checked In)' : 'Not Checked In'}
            </strong>
          </div>
          <button
            onClick={onToggleCheckIn}
            className={`px-4 py-2 rounded-md text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm ${
              employeeCheckedIn
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
          >
            {employeeCheckedIn ? (
              <>
                <LogOut className="w-3.5 h-3.5" />
                <span>Check Out Now</span>
              </>
            ) : (
              <>
                <LogIn className="w-3.5 h-3.5" />
                <span>Punch Check In</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
          <div className="text-slate-500 text-xs font-bold uppercase tracking-wider">Present Today</div>
          <div className="text-2xl font-bold text-emerald-600 mt-1">{presentCount}</div>
          <div className="text-xs text-slate-400 mt-1 font-medium">{((presentCount / (employees.length || 1)) * 100).toFixed(1)}% of total staff</div>
        </div>

        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
          <div className="text-slate-500 text-xs font-bold uppercase tracking-wider">Late Check-Ins</div>
          <div className="text-2xl font-bold text-orange-600 mt-1">{lateCount}</div>
          <div className="text-xs text-slate-400 mt-1 font-medium">Arrived after 09:15 AM</div>
        </div>

        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
          <div className="text-slate-500 text-xs font-bold uppercase tracking-wider">Unscheduled Absences</div>
          <div className="text-2xl font-bold text-red-600 mt-1">{absentCount}</div>
          <div className="text-xs text-slate-400 mt-1 font-medium">No leave record found</div>
        </div>

        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
          <div className="text-slate-500 text-xs font-bold uppercase tracking-wider">Scheduled On Leave</div>
          <div className="text-2xl font-bold text-blue-600 mt-1">{onLeaveCount}</div>
          <div className="text-xs text-slate-400 mt-1 font-medium">Approved PTO &amp; Sick</div>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search employee attendance roster..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <select
          value={filterDept}
          onChange={e => setFilterDept(e.target.value)}
          className="px-3 py-2 text-sm border border-slate-200 rounded-md bg-white text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="All">All Departments</option>
          <option value="Engineering">Engineering</option>
          <option value="Sales">Sales</option>
          <option value="Marketing">Marketing</option>
          <option value="Human Resources">Human Resources</option>
          <option value="Finance">Finance</option>
        </select>
      </div>

      {/* Attendance Table */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 text-[11px] uppercase font-bold">
            <tr>
              <th className="px-5 py-3">Employee</th>
              <th className="px-5 py-3">Department</th>
              <th className="px-5 py-3">Check-In Time</th>
              <th className="px-5 py-3">Today Status</th>
              <th className="px-5 py-3">30-Day Rate</th>
              <th className="px-5 py-3">Late Count (30d)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map(emp => (
              <tr key={emp.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <img src={emp.avatar} alt={emp.name} className="w-8 h-8 rounded-full object-cover border border-slate-200" />
                    <div>
                      <div className="font-semibold text-slate-900">{emp.name}</div>
                      <div className="text-xs text-slate-400 font-mono">{emp.badgeId} • {emp.jobTitle}</div>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3.5 text-xs font-medium text-slate-700">{emp.departmentName}</td>
                <td className="px-5 py-3.5 text-xs font-mono font-semibold text-slate-800">
                  {emp.todayCheckinTime || '—'}
                </td>
                <td className="px-5 py-3.5">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase ${
                    emp.todayStatus === 'present' ? 'bg-emerald-100 text-emerald-700' :
                    emp.todayStatus === 'late' ? 'bg-orange-100 text-orange-700' :
                    emp.todayStatus === 'leave' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {emp.todayStatus}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-xs font-semibold text-slate-700">{emp.attendanceRate}%</td>
                <td className="px-5 py-3.5 text-xs text-slate-600">
                  {emp.lateCheckinCount > 0 ? (
                    <span className="font-semibold text-orange-600">{emp.lateCheckinCount} times</span>
                  ) : (
                    <span className="text-slate-400">0</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
