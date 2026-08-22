import React, { useState, useEffect } from 'react';
import {
  Clock,
  CalendarCheck2,
  CalendarDays,
  Coins,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Sparkles,
  UserCheck,
  Send,
  Building,
  History,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { AttendanceRecord, LeaveRequest, SalaryDeductionRequest, AbsencePolicy } from '../../types';
import { api } from '../../api';

interface EmployeeDashboardProps {
  setCurrentView: (v: string) => void;
}

export const EmployeeDashboard: React.FC<EmployeeDashboardProps> = ({ setCurrentView }) => {
  const { user } = useAuth();
  const [todayRecord, setTodayRecord] = useState<AttendanceRecord | null>(null);
  const [leaveBalances, setLeaveBalances] = useState<any>(null);
  const [recentLeaves, setRecentLeaves] = useState<LeaveRequest[]>([]);
  const [myDeductions, setMyDeductions] = useState<SalaryDeductionRequest[]>([]);
  const [absencePolicy, setAbsencePolicy] = useState<AbsencePolicy | null>(null);
  const [loading, setLoading] = useState(true);
  const [punchLoading, setPunchLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  const todayStr = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (user) {
      loadEmployeeDashboard();
    }
  }, [user]);

  const loadEmployeeDashboard = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [attList, balanceData, leaveList, dedList, policyData] = await Promise.all([
        api.getAttendance({ employeeId: user.id, date: todayStr }),
        api.getLeaveBalance(user.id),
        api.getLeaves({ employeeId: user.id }),
        api.getSalaryDeductions(),
        api.getAbsencePolicy(),
      ]);

      if (attList.length > 0) {
        setTodayRecord(attList[0]);
      } else {
        setTodayRecord(null);
      }
      setLeaveBalances(balanceData);
      setRecentLeaves(leaveList.slice(0, 3));
      setMyDeductions(dedList.filter((d) => d.employeeId === user.id));
      setAbsencePolicy(policyData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleClockIn = async () => {
    setPunchLoading(true);
    try {
      const res = await api.checkIn();
      setTodayRecord(res.record);
    } catch (err: any) {
      alert(err.message || 'Failed to clock in.');
    } finally {
      setPunchLoading(false);
    }
  };

  const handleClockOut = async () => {
    setPunchLoading(true);
    try {
      const res = await api.checkOut();
      setTodayRecord(res.record);
    } catch (err: any) {
      alert(err.message || 'Failed to clock out.');
    } finally {
      setPunchLoading(false);
    }
  };

  // Absence computations for this employee
  const allowedAbsence = absencePolicy?.allowedAbsenceDays || 12;
  const warningThreshold = absencePolicy?.warningThresholdDays || 10;
  const usedAbsence = user?.usedAbsenceDays || 0;
  const excessAbsence = Math.max(0, usedAbsence - allowedAbsence);

  const isExceeded = usedAbsence > allowedAbsence;
  const isWarning = usedAbsence >= warningThreshold && usedAbsence <= allowedAbsence;

  return (
    <div className="space-y-6 pb-12">
      {/* Welcome Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 p-6 text-white shadow-xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-blue-500/30 px-2 py-0.5 text-xs font-semibold text-blue-200">
                Employee Self-Service Portal
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            </div>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Welcome back, {user?.fullName?.split(' ')[0]}!
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-300">
              {user?.roleTitle} • {user?.department} Department (ID: {user?.employeeId})
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setCurrentView('emp_leaves')}
              className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-blue-500 transition"
            >
              <CalendarDays className="h-4 w-4" />
              <span>Apply for Leave</span>
            </button>
          </div>
        </div>
      </div>

      {/* ABSENCE & SALARY DEDUCTION CRITICAL BANNER */}
      {isExceeded && (
        <div className="rounded-2xl border-2 border-red-400 bg-red-50 p-5 shadow-sm animate-in fade-in">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-600 text-white">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-red-950">
                    🚨 Absence Limit Exceeded: {usedAbsence} / {allowedAbsence} Days Used
                  </h3>
                  <span className="rounded bg-red-200 px-2 py-0.5 text-[10px] font-bold text-red-900">
                    +{excessAbsence} Excess Days
                  </span>
                </div>
                <p className="text-xs text-red-800 mt-1">
                  You have exceeded your company-allowed absence limit. A proposed salary deduction has been calculated and submitted to HR for formal review.
                </p>
              </div>
            </div>
            <button
              onClick={() => setCurrentView('emp_absence')}
              className="shrink-0 rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700 transition shadow-sm flex items-center gap-1.5"
            >
              <span>View Deduction Status</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {isWarning && (
        <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4.5 shadow-sm animate-in fade-in">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 shrink-0 text-amber-600 mt-0.5" />
            <div>
              <h3 className="text-xs font-bold text-amber-950">
                ⚠️ Absence Warning: {usedAbsence} of {allowedAbsence} Allowed Days Used
              </h3>
              <p className="text-xs text-amber-800 mt-0.5">
                You have {allowedAbsence - usedAbsence} absence days remaining before crossing the threshold. Any further absences beyond {allowedAbsence} days will generate a pending salary deduction request.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Clock In / Out & Attendance Card */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Attendance Punch Box */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs lg:col-span-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-600" />
                <h2 className="text-sm font-bold text-slate-900">Today's Punch Clock</h2>
              </div>
              <span className="text-xs font-medium text-slate-500">{todayStr}</span>
            </div>

            <div className="text-center py-3">
              <p className="text-3xl font-extrabold text-slate-900 font-mono">
                {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
              <p className="text-xs text-slate-400 mt-1">Real-time attendance recording</p>
            </div>

            <div className="grid grid-cols-2 gap-2 my-3 rounded-xl bg-slate-50 p-3 text-xs">
              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-400 block">Check In</span>
                <span className="font-bold text-slate-900 font-mono">
                  {todayRecord?.checkIn || 'Not Clocked In'}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-400 block">Check Out</span>
                <span className="font-bold text-slate-900 font-mono">
                  {todayRecord?.checkOut || 'Active Session'}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-2">
            {!todayRecord?.checkIn ? (
              <button
                id="clock-in-btn"
                onClick={handleClockIn}
                disabled={punchLoading}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-xs font-bold text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-700 transition disabled:opacity-50"
              >
                <UserCheck className="h-4 w-4" />
                <span>{punchLoading ? 'Recording Clock In...' : 'Clock In Now'}</span>
              </button>
            ) : !todayRecord?.checkOut ? (
              <button
                id="clock-out-btn"
                onClick={handleClockOut}
                disabled={punchLoading}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-800 py-3 text-xs font-bold text-white shadow-md hover:bg-slate-900 transition disabled:opacity-50"
              >
                <Clock className="h-4 w-4" />
                <span>{punchLoading ? 'Recording Clock Out...' : 'Clock Out (Finish Day)'}</span>
              </button>
            ) : (
              <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-2.5 text-center text-xs font-bold text-emerald-800">
                ✓ Shift Completed ({todayRecord.workingHours || 8} hrs logged)
              </div>
            )}
          </div>
        </div>

        {/* Leave Balance Breakdown */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Annual Leave Balances</h2>
              <p className="text-xs text-slate-500">Track paid time off and medical leaves</p>
            </div>
            <button
              onClick={() => setCurrentView('emp_leaves')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              Apply Leave <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {/* Paid Time Off */}
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-3.5 text-center">
              <span className="text-[11px] font-semibold text-slate-500 block">Paid Time Off (PTO)</span>
              <p className="text-xl font-extrabold text-blue-700 mt-1">
                {leaveBalances ? leaveBalances.paidTimeOff.total - leaveBalances.paidTimeOff.used : 14}
              </p>
              <span className="text-[10px] text-slate-400">
                {leaveBalances?.paidTimeOff.used || 0} / {leaveBalances?.paidTimeOff.total || 14} used
              </span>
            </div>

            {/* Sick Leave */}
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-3.5 text-center">
              <span className="text-[11px] font-semibold text-slate-500 block">Sick Leave</span>
              <p className="text-xl font-extrabold text-emerald-700 mt-1">
                {leaveBalances ? leaveBalances.sickLeave.total - leaveBalances.sickLeave.used : 10}
              </p>
              <span className="text-[10px] text-slate-400">
                {leaveBalances?.sickLeave.used || 0} / {leaveBalances?.sickLeave.total || 10} used
              </span>
            </div>

            {/* Casual Leave */}
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-3.5 text-center">
              <span className="text-[11px] font-semibold text-slate-500 block">Casual Leave</span>
              <p className="text-xl font-extrabold text-indigo-700 mt-1">
                {leaveBalances ? leaveBalances.casualLeave.total - leaveBalances.casualLeave.used : 6}
              </p>
              <span className="text-[10px] text-slate-400">
                {leaveBalances?.casualLeave.used || 0} / {leaveBalances?.casualLeave.total || 6} used
              </span>
            </div>

            {/* Emergency Leave */}
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-3.5 text-center">
              <span className="text-[11px] font-semibold text-slate-500 block">Emergency Leave</span>
              <p className="text-xl font-extrabold text-purple-700 mt-1">
                {leaveBalances ? leaveBalances.emergencyLeave.total - leaveBalances.emergencyLeave.used : 3}
              </p>
              <span className="text-[10px] text-slate-400">
                {leaveBalances?.emergencyLeave.used || 0} / {leaveBalances?.emergencyLeave.total || 3} used
              </span>
            </div>
          </div>

          {/* Absence Progress Meter */}
          <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50/50 p-4">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-semibold text-slate-700">Company Absence Allowance Usage</span>
              <span className="font-bold text-slate-900">
                {usedAbsence} / {allowedAbsence} Days Used
              </span>
            </div>
            <div className="h-2.5 w-full rounded-full bg-slate-200 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isExceeded ? 'bg-red-500' : isWarning ? 'bg-amber-500' : 'bg-blue-600'
                }`}
                style={{ width: `${Math.min(100, (usedAbsence / allowedAbsence) * 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>0 Days</span>
              <span>Warning Threshold ({warningThreshold} Days)</span>
              <span>Limit ({allowedAbsence} Days)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Two Columns: Recent Leaves & Salary Deduction Status */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Leave Submissions */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-blue-600" />
              <h2 className="text-sm font-bold text-slate-900">My Recent Leave Requests</h2>
            </div>
            <button
              onClick={() => setCurrentView('emp_leaves')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700"
            >
              View All →
            </button>
          </div>

          <div className="space-y-3 divide-y divide-slate-100">
            {recentLeaves.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400">
                No recent leave applications.
              </div>
            ) : (
              recentLeaves.map((l) => (
                <div key={l.id} className="pt-3 first:pt-0 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{l.leaveType}</span>
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        l.status === 'Approved'
                          ? 'bg-emerald-100 text-emerald-700'
                          : l.status === 'Rejected'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {l.status}
                    </span>
                  </div>
                  <p className="text-slate-600 mt-0.5">
                    {l.startDate} to {l.endDate} ({l.days} days)
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5 truncate">Reason: {l.reason}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Salary Deduction Status Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <Coins className="h-4 w-4 text-amber-500" />
              <h2 className="text-sm font-bold text-slate-900">Salary Deduction Inquiries</h2>
            </div>
            <button
              onClick={() => setCurrentView('emp_absence')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700"
            >
              Details →
            </button>
          </div>

          <div className="space-y-3 divide-y divide-slate-100">
            {myDeductions.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400">
                <CheckCircle2 className="mx-auto h-7 w-7 text-emerald-500 mb-1" />
                No salary deductions recorded or pending for your account.
              </div>
            ) : (
              myDeductions.map((d) => (
                <div key={d.id} className="pt-3 first:pt-0 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">
                      Excess Absence Deduction: ₹{d.proposedDeduction.toLocaleString()}
                    </span>
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        d.status === 'Approved'
                          ? 'bg-red-100 text-red-700'
                          : d.status === 'Rejected'
                          ? 'bg-slate-100 text-slate-700'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {d.status === 'Pending' ? 'Pending HR Review' : d.status}
                    </span>
                  </div>
                  <p className="text-slate-600">
                    +{d.excessDays} excess day(s) beyond {d.allowedAbsences} allowed limit.
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {d.status === 'Pending'
                      ? 'Under review by HR Administrator. Salary is not deducted until approved.'
                      : d.status === 'Approved'
                      ? `Approved by ${d.approvedBy} on ${d.approvedAt}`
                      : `Waived: ${d.rejectionReason}`}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
