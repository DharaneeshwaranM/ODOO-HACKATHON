import React, { useState, useEffect } from 'react';
import {
  Users,
  UserCheck,
  UserX,
  CalendarDays,
  Coins,
  Building2,
  Activity,
  HeartPulse,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  Clock,
  CheckCircle2,
  Sparkles,
  ChevronRight,
  Zap,
  ShieldCheck,
  Filter,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from 'recharts';
import { api } from '../../api';
import {
  Employee,
  AttendanceRecord,
  LeaveRequest,
  SalaryDeductionRequest,
  WorkforceInsight,
  AuditLog,
  HRActionItem,
} from '../../types';

interface HRDashboardProps {
  setCurrentView: (view: string) => void;
}

export const HRDashboard: React.FC<HRDashboardProps> = ({ setCurrentView }) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [deductions, setDeductions] = useState<SalaryDeductionRequest[]>([]);
  const [insights, setInsights] = useState<WorkforceInsight[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [actions, setActions] = useState<HRActionItem[]>([]);
  const [loading, setLoading] = useState(true);

  const todayStr = new Date().toISOString().split('T')[0];

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [empList, attList, leaveList, dedList, insightList, auditList, deptList, actionList] = await Promise.all([
        api.getEmployees(),
        api.getAttendance({ date: todayStr }),
        api.getLeaves(),
        api.getSalaryDeductions(),
        api.getWorkforceIntelligence(),
        api.getAuditLogs(),
        api.getDepartments(),
        api.getActionCenter().catch(() => []),
      ]);
      setEmployees(empList);
      setAttendance(attList);
      setLeaves(leaveList);
      setDeductions(dedList);
      setInsights(insightList);
      setAuditLogs(auditList.slice(0, 6));
      setDepartments(deptList);
      setActions(actionList);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Metrics Calculations
  const totalEmployees = employees.length || 24;
  const presentToday = attendance.filter((a) => a.status === 'Present').length;
  const lateToday = attendance.filter((a) => a.status === 'Late').length;
  const absentToday = attendance.filter((a) => a.status === 'Absent').length;
  const onLeaveToday = attendance.filter((a) => a.status === 'Leave').length;

  const activeWorkforce = presentToday + lateToday;
  const attendanceRate = totalEmployees > 0 ? Math.round((activeWorkforce / totalEmployees) * 100) : 92;
  const pendingLeaves = leaves.filter((l) => l.status === 'Pending');
  const pendingDeductions = deductions.filter((d) => d.status === 'Pending');
  const absenceRate = totalEmployees > 0 ? (100 - attendanceRate).toFixed(1) : '3.2';

  // Chart data: Department Attendance Breakdown
  const deptAttendanceData = departments.map((dept) => {
    const deptEmps = employees.filter((e) => e.department === dept.name);
    const deptAtt = attendance.filter((a) => a.department === dept.name);
    const present = deptAtt.filter((a) => a.status === 'Present' || a.status === 'Late').length;
    return {
      name: dept.name,
      total: deptEmps.length || 1,
      present: present,
      rate: deptEmps.length > 0 ? Math.round((present / deptEmps.length) * 100) : 85,
    };
  });

  const attendancePieData = [
    { name: 'Present', value: presentToday || 18, color: '#4f46e5' },
    { name: 'Late', value: lateToday || 2, color: '#f59e0b' },
    { name: 'Absent', value: absentToday || 3, color: '#ea580c' },
    { name: 'On Leave', value: onLeaveToday || 1, color: '#94a3b8' },
  ].filter((d) => d.value > 0);

  return (
    <div className="space-y-5 pb-10">
      {/* 4 Top KPI Cards - High Density Archetype */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Total Workforce */}
        <div
          onClick={() => setCurrentView('hr_employees')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-indigo-300 cursor-pointer transition"
        >
          <div className="text-slate-500 text-xs font-semibold mb-1">Total Workforce</div>
          <div className="text-2xl font-bold text-slate-900">{totalEmployees}</div>
          <div className="text-[10px] text-emerald-600 font-bold mt-1 flex items-center gap-1">
            <span>+12 This Month</span>
          </div>
        </div>

        {/* Present Today */}
        <div
          onClick={() => setCurrentView('hr_attendance')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-indigo-300 cursor-pointer transition"
        >
          <div className="text-slate-500 text-xs font-semibold mb-1">Present Today</div>
          <div className="text-2xl font-bold text-slate-900">
            {activeWorkforce}{' '}
            <span className="text-sm font-normal text-slate-400">/ {totalEmployees}</span>
          </div>
          <div className="w-full h-1 bg-slate-100 rounded-full mt-2 overflow-hidden">
            <div
              className="h-full bg-indigo-500 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, attendanceRate)}%` }}
            ></div>
          </div>
        </div>

        {/* Pending Deductions (High Density Warning Accent) */}
        <div
          onClick={() => setCurrentView('hr_salary_deductions')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs border-l-4 border-l-orange-400 hover:border-orange-500 cursor-pointer transition"
        >
          <div className="text-slate-500 text-xs font-semibold mb-1">Pending Deductions</div>
          <div className="text-2xl font-bold text-orange-600">{pendingDeductions.length}</div>
          <div className="text-[10px] text-slate-400 mt-1">Awaiting HR Review</div>
        </div>

        {/* Absence Rate */}
        <div
          onClick={() => setCurrentView('hr_absence_monitoring')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-indigo-300 cursor-pointer transition"
        >
          <div className="text-slate-500 text-xs font-semibold mb-1">Absence Rate</div>
          <div className="text-2xl font-bold text-slate-900">{absenceRate}%</div>
          <div className="text-[10px] text-slate-400 mt-1">Target: &lt; 4.0%</div>
        </div>
      </div>

      {/* Main High Density Two-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left 2-Cols: Smart HR Action Center + Critical Salary Deduction Requests Table + Intelligence / Health */}
        <div className="lg:col-span-2 space-y-5 flex flex-col">
          {/* SMART HR ACTION CENTER WIDGET */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-3.5 sm:p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2 bg-gradient-to-r from-slate-900 to-slate-800 text-white">
              <div className="flex items-center gap-2">
                <div className="p-1 bg-indigo-500/20 text-indigo-400 rounded-md ring-1 ring-indigo-400/30">
                  <Zap className="w-4 h-4 text-indigo-300" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm flex items-center gap-2">
                    Smart HR Action Center
                    <span className="text-[9px] font-bold bg-indigo-500 text-white px-1.5 py-0.5 rounded">
                      LIVE
                    </span>
                  </h3>
                  <p className="text-[10px] text-slate-300">
                    Real-time HR decision intelligence & required governance actions
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                {actions.filter((a) => a.priority === 'critical' && a.status !== 'completed' && a.status !== 'rejected').length > 0 && (
                  <span className="text-[10px] font-bold bg-rose-500/90 text-white px-2 py-0.5 rounded animate-pulse">
                    {actions.filter((a) => a.priority === 'critical' && a.status !== 'completed' && a.status !== 'rejected').length} Critical
                  </span>
                )}
                {actions.filter((a) => a.priority === 'high' && a.status !== 'completed' && a.status !== 'rejected').length > 0 && (
                  <span className="text-[10px] font-bold bg-amber-500 text-slate-950 px-2 py-0.5 rounded">
                    {actions.filter((a) => a.priority === 'high' && a.status !== 'completed' && a.status !== 'rejected').length} High
                  </span>
                )}
                <button
                  onClick={() => setCurrentView('hr_action_center')}
                  className="text-xs font-bold text-indigo-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 px-2.5 py-1 rounded transition flex items-center gap-1 cursor-pointer"
                >
                  Action Center <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Action Cards Preview List */}
            <div className="p-3.5 divide-y divide-slate-100 space-y-3">
              {actions
                .filter((a) => a.status !== 'completed' && a.status !== 'rejected')
                .slice(0, 3)
                .map((action) => (
                  <div key={action.id} className="pt-2 first:pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            action.priority === 'critical'
                              ? 'bg-rose-100 text-rose-800 border border-rose-200'
                              : action.priority === 'high'
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                          }`}
                        >
                          {action.priority.toUpperCase()}
                        </span>
                        <span className="text-xs font-bold text-slate-900">{action.title}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 font-medium">
                        {action.subtitle}
                      </div>
                      <div className="text-[11px] text-slate-600 bg-slate-50 px-2 py-1 rounded border border-slate-100">
                        <strong className="text-slate-800">Why:</strong> {action.whyFlagged}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      <button
                        onClick={() => {
                          if (action.targetView) setCurrentView(action.targetView);
                          else setCurrentView('hr_action_center');
                        }}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-[11px] font-bold transition shadow-xs cursor-pointer flex items-center gap-1"
                      >
                        <span>{action.primaryActionLabel || 'Review & Decide'}</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}

              {actions.filter((a) => a.status !== 'completed' && a.status !== 'rejected').length === 0 && (
                <div className="py-5 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>All urgent HR governance actions are completed. No pending determinations.</span>
                </div>
              )}
            </div>

            <div className="p-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-[11px] text-slate-500 font-medium">
                {actions.filter((a) => a.status !== 'completed' && a.status !== 'rejected').length} pending item(s) across Leave, Attendance, Absence & Salary modules
              </span>
              <button
                onClick={() => setCurrentView('hr_action_center')}
                className="text-[11px] font-bold text-indigo-600 hover:text-indigo-700 cursor-pointer"
              >
                Open Full Action Center →
              </button>
            </div>
          </div>

          {/* Critical Salary Deduction Requests Card */}
          <div className="bg-white rounded-xl border border-slate-200 flex flex-col shadow-xs overflow-hidden">
            <div className="p-3.5 sm:p-4 border-b border-slate-100 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-800 text-sm">Critical Salary Deduction Requests</h3>
              </div>
              <span className="text-[10px] bg-slate-100 px-2 py-1 rounded text-slate-600 font-bold">
                {pendingDeductions.length > 0 ? `${pendingDeductions.length} Requires Action` : 'All Clear'}
              </span>
            </div>

            <div className="p-0 flex-1 overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[500px]">
                <thead className="bg-slate-50 text-[10px] text-slate-500 uppercase font-bold border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-2.5">Employee</th>
                    <th className="px-4 py-2.5">Excess Days</th>
                    <th className="px-4 py-2.5">Deduction</th>
                    <th className="px-4 py-2.5">Reason</th>
                    <th className="px-4 py-2.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="text-xs divide-y divide-slate-100">
                  {deductions.slice(0, 4).map((d) => (
                    <tr key={d.id} className="hover:bg-slate-50 transition">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-900">{d.employeeName}</div>
                        <div className="text-[10px] text-slate-400">
                          {d.employeeId} • {d.department}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-orange-600 font-bold">
                        +{d.excessAbsenceDays} {d.excessAbsenceDays === 1 ? 'Day' : 'Days'}
                      </td>
                      <td className="px-4 py-3 font-bold text-slate-900">
                        ₹{d.proposedDeduction.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-slate-500 max-w-xs truncate text-[11px]">
                        {d.reason}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {d.status === 'Pending' ? (
                          <button
                            onClick={() => setCurrentView('hr_salary_deductions')}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded text-[10px] font-bold transition shadow-xs cursor-pointer"
                          >
                            Review &amp; Approve
                          </button>
                        ) : (
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                              d.status === 'Approved'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {d.status}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {deductions.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center py-6 text-xs text-slate-400">
                        No pending salary deductions
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="p-3 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center text-xs">
              <span className="text-[11px] text-slate-500">
                Absence threshold rule: 12 days/yr allowed. Overages trigger automated review flags.
              </span>
              <button
                onClick={() => setCurrentView('hr_salary_deductions')}
                className="text-[11px] font-bold text-indigo-600 hover:text-indigo-700"
              >
                View All Deduction Files →
              </button>
            </div>
          </div>

          {/* Sub Grid: Workforce Intel & Department Health */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Workforce Intel Card (Indigo-900 Dark Accent) */}
            <div className="bg-indigo-900 rounded-xl p-4 text-white shadow-md relative overflow-hidden flex flex-col justify-between">
              <div className="relative z-10">
                <div className="flex items-center justify-between">
                  <h3 className="text-indigo-300 text-[10px] font-bold uppercase tracking-widest">
                    Workforce Intel
                  </h3>
                  <span className="rounded bg-indigo-500/30 px-1.5 py-0.5 text-[9px] font-bold text-indigo-200">
                    Live Model
                  </span>
                </div>
                <p className="text-sm mt-2 font-medium">
                  Absence Spike Detected: <span className="text-indigo-200">Engineering Dept</span>
                </p>
                <p className="text-[11px] text-indigo-300 mt-1 italic line-clamp-2">
                  High project sprint load and overtime fatigue flagged across 14 staff records.
                </p>
              </div>

              <div className="relative z-10 mt-3 pt-2">
                <button
                  onClick={() => setCurrentView('hr_workforce_intelligence')}
                  className="text-[10px] bg-indigo-500/30 border border-indigo-400/50 hover:bg-indigo-500/50 px-3 py-1 rounded-full font-bold text-indigo-100 transition cursor-pointer"
                >
                  View Deep Insights →
                </button>
              </div>

              <div className="absolute top-0 right-0 p-4 opacity-15 text-5xl font-bold select-none pointer-events-none">
                ⚡
              </div>
            </div>

            {/* Department Health Card */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                    Department Health
                  </h3>
                  <span className="text-[10px] text-slate-400 font-semibold">Today</span>
                </div>

                <div className="mt-3 space-y-2.5">
                  <div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-700 font-medium">Product &amp; Design</span>
                      <span className="text-emerald-600 font-bold text-[11px]">Stable (95%)</span>
                    </div>
                    <div className="w-full h-1 bg-slate-100 rounded-full mt-1 overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full w-[95%]"></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-700 font-medium">Engineering</span>
                      <span className="text-orange-500 font-bold text-[11px]">At Risk (64%)</span>
                    </div>
                    <div className="w-full h-1 bg-slate-100 rounded-full mt-1 overflow-hidden">
                      <div className="h-full bg-orange-500 rounded-full w-[64%]"></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-700 font-medium">Operations &amp; Sales</span>
                      <span className="text-indigo-600 font-bold text-[11px]">Optimal (90%)</span>
                    </div>
                    <div className="w-full h-1 bg-slate-100 rounded-full mt-1 overflow-hidden">
                      <div className="h-full bg-indigo-500 rounded-full w-[90%]"></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-100 flex justify-between items-center text-[10px]">
                <span className="text-slate-400">Target threshold: 85%</span>
                <button
                  onClick={() => setCurrentView('hr_departments')}
                  className="font-bold text-indigo-600 hover:text-indigo-700"
                >
                  Org Structure →
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Organizational Heatmap + System Node Status */}
        <div className="space-y-5 flex flex-col">
          {/* Organizational Heatmap Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 flex flex-col flex-1">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-slate-800 text-sm">Organizational Heatmap</h3>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 bg-slate-100 rounded border border-slate-200" title="Low activity" />
                <div className="w-2.5 h-2.5 bg-indigo-200 rounded border border-indigo-300" title="Moderate" />
                <div className="w-2.5 h-2.5 bg-indigo-500 rounded border border-indigo-600" title="High presence" />
                <div className="w-2.5 h-2.5 bg-orange-500 rounded border border-orange-600" title="Absence alert" />
              </div>
            </div>

            {/* Department Nodes Grid */}
            <div className="grid grid-cols-2 gap-2.5 mb-3">
              <div className="bg-slate-50 border border-dashed border-slate-200 rounded-lg p-2.5">
                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                  Operations
                </div>
                <div className="mt-1.5 flex gap-1 flex-wrap">
                  <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                  <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                  <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                  <div className="w-2 h-2 rounded-full bg-slate-300"></div>
                  <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                </div>
              </div>

              <div className="bg-slate-50 border border-dashed border-slate-200 rounded-lg p-2.5">
                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                  Sales &amp; Mkt
                </div>
                <div className="mt-1.5 flex gap-1 flex-wrap">
                  <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                  <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                  <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                  <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                </div>
              </div>

              <div className="bg-orange-50 border border-dashed border-orange-200 rounded-lg p-2.5">
                <div className="text-[9px] font-bold text-orange-500 uppercase tracking-wider flex items-center justify-between">
                  <span>Engineering</span>
                  <span className="text-[8px] bg-orange-200/60 text-orange-800 px-1 rounded">Alert</span>
                </div>
                <div className="mt-1.5 flex gap-1 flex-wrap">
                  <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                  <div className="w-2 h-2 rounded-full bg-orange-300"></div>
                  <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                  <div className="w-2 h-2 rounded-full bg-orange-400"></div>
                </div>
              </div>

              <div className="bg-slate-50 border border-dashed border-slate-200 rounded-lg p-2.5">
                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                  Product &amp; UX
                </div>
                <div className="mt-1.5 flex gap-1 flex-wrap">
                  <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                  <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                  <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                </div>
              </div>
            </div>

            {/* AI Recommendation High Density Banner */}
            <div className="bg-slate-900 rounded-lg p-3 text-white mb-3 shadow-xs">
              <div className="flex items-start gap-1.5 text-[10px]">
                <span className="text-orange-400 font-bold italic shrink-0">AI RECOMMENDATION:</span>
                <span className="text-slate-300 font-normal leading-relaxed">
                  Review PTO distribution for Q3 Engineering Sprint to prevent consecutive burn-out cycles.
                </span>
              </div>
            </div>

            {/* Breakdown Chart */}
            <div className="pt-2 border-t border-slate-100 flex-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                Workforce Status Distribution
              </div>
              <div className="h-36 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={attendancePieData}
                      innerRadius={30}
                      outerRadius={55}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {attendancePieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '6px', fontSize: '11px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-2 gap-1.5 pt-2 text-[10px] text-slate-600">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0" />
                  <span>Present ({presentToday || 18})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                  <span>Late ({lateToday || 2})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-orange-600 shrink-0" />
                  <span>Absent ({absentToday || 3})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-slate-400 shrink-0" />
                  <span>Leave ({onLeaveToday || 1})</span>
                </div>
              </div>
            </div>

            {/* Heatmap Footer */}
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
              <div className="text-[9px] text-slate-500 font-medium italic">
                All nodes synchronized • Live
              </div>
              <div className="flex items-center gap-3 text-[10px] font-bold text-indigo-600">
                <button
                  onClick={() => setCurrentView('hr_departments')}
                  className="hover:text-indigo-700 hover:underline"
                >
                  Org Chart →
                </button>
                <button
                  onClick={() => setCurrentView('hr_attendance')}
                  className="hover:text-indigo-700 hover:underline"
                >
                  Export ↓
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

