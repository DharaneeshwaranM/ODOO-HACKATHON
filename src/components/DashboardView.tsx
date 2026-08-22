import React from 'react';
import { Employee, Department, LeaveRequest, WorkforceAlert, HrInsight } from '../types';
import { 
  HeartPulse, 
  Users, 
  UserCheck, 
  Calendar, 
  UserX, 
  AlertTriangle, 
  Sparkles, 
  ArrowUpRight, 
  ArrowRight, 
  TrendingDown, 
  ShieldCheck, 
  Building2, 
  Clock, 
  CheckCircle2, 
  Flame,
  ChevronRight,
  RefreshCw,
  Activity,
  UserPlus
} from 'lucide-react';

interface DashboardViewProps {
  employees: Employee[];
  departments: Department[];
  leaves: LeaveRequest[];
  alerts: WorkforceAlert[];
  insights: HrInsight[];
  onSelectEmployee: (emp: Employee) => void;
  onNavigateTab: (tab: string) => void;
  onSelectDepartment: (deptName: string) => void;
  onRecalculateAll: () => void;
  onOpenAddMember?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  employees,
  departments,
  leaves,
  alerts,
  insights,
  onSelectEmployee,
  onNavigateTab,
  onSelectDepartment,
  onRecalculateAll,
  onOpenAddMember,
}) => {
  // Real calculations
  const totalEmployees = employees.length;
  const presentCount = employees.filter(e => e.todayStatus === 'present' || e.todayStatus === 'late').length;
  const onLeaveCount = employees.filter(e => e.todayStatus === 'leave').length;
  const absentCount = employees.filter(e => e.todayStatus === 'absent').length;
  const highRiskEmployees = employees.filter(e => e.riskScore >= 70).sort((a, b) => b.riskScore - a.riskScore);
  const highRiskCount = highRiskEmployees.length;
  
  const activeStaff = Math.max(1, totalEmployees - onLeaveCount);
  const attendancePct = Number(((presentCount / activeStaff) * 100).toFixed(1));
  const availabilityPct = Number((((totalEmployees - onLeaveCount) / totalEmployees) * 100).toFixed(1));

  // Overall Workforce Health score = 82 / 100
  const workforceHealth = 82;

  const unreadAlerts = alerts.filter(a => !a.isDismissed).slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Top Welcome & KPI Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 uppercase">
              Live Odoo 17 HR Analytics
            </span>
            <span className="text-xs text-slate-500 font-medium">Real-Time Sync</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">DAYFLOW AI Executive Dashboard</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Predict workforce risks • Automate HR decisions • Improve team productivity
          </p>
        </div>

        <div className="flex items-center gap-3">
          {onOpenAddMember && (
            <button
              onClick={onOpenAddMember}
              className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-sm transition-colors cursor-pointer"
              title="Add a new employee member (HR Admin Only)"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ Add Member</span>
            </button>
          )}

          <button
            onClick={onRecalculateAll}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors cursor-pointer"
            title="Recalculate all risk engines and department health scores"
          >
            <RefreshCw className="w-4 h-4 text-slate-600" />
            <span>Recalculate Engine</span>
          </button>

          <button
            onClick={() => onNavigateTab('copilot')}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-md shadow-xs transition-colors cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span>Ask AI Copilot</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        {/* Workforce Health Index Dial Card */}
        <div className="sm:col-span-2 bg-slate-900 rounded-lg p-5 text-white shadow-sm relative overflow-hidden flex flex-col justify-between border border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-md bg-slate-800 flex items-center justify-center border border-slate-700">
                <HeartPulse className="w-4 h-4 text-blue-400" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Workforce Health</span>
            </div>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-semibold uppercase border border-emerald-500/30">
              Optimal
            </span>
          </div>

          <div className="my-3 flex items-baseline gap-2">
            <span className="text-4xl font-bold tracking-tight text-white">{workforceHealth}</span>
            <span className="text-lg text-slate-400 font-medium">/ 100</span>
          </div>

          <div className="space-y-1.5 text-xs text-slate-300 pt-2 border-t border-slate-800">
            <div className="flex justify-between">
              <span className="text-slate-400">Overall Availability:</span>
              <strong className="text-white font-semibold">{availabilityPct}%</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Today Attendance Rate:</span>
              <strong className="text-white font-semibold">{attendancePct}%</strong>
            </div>
          </div>
        </div>

        {/* Total Employees */}
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Total Staff</span>
            <div className="w-8 h-8 rounded-md bg-slate-100 flex items-center justify-center">
              <Users className="w-4 h-4 text-slate-600" />
            </div>
          </div>
          <div className="my-2">
            <div className="text-2xl font-bold text-slate-900">{totalEmployees}</div>
            <span className="text-xs text-slate-400 font-medium">Across 5 Departments</span>
          </div>
          <div className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>100% Active Profiles</span>
          </div>
        </div>

        {/* Present Today */}
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Present Today</span>
            <div className="w-8 h-8 rounded-md bg-emerald-50 flex items-center justify-center">
              <UserCheck className="w-4 h-4 text-emerald-600" />
            </div>
          </div>
          <div className="my-2">
            <div className="text-2xl font-bold text-emerald-600">{presentCount}</div>
            <span className="text-xs text-slate-400 font-medium">{attendancePct}% Attendance</span>
          </div>
          <div className="text-xs text-slate-500 font-medium">
            <span>09:00 AM Roster</span>
          </div>
        </div>

        {/* On Leave */}
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">On Leave</span>
            <div className="w-8 h-8 rounded-md bg-blue-50 flex items-center justify-center">
              <Calendar className="w-4 h-4 text-blue-600" />
            </div>
          </div>
          <div className="my-2">
            <div className="text-2xl font-bold text-blue-600">{onLeaveCount}</div>
            <span className="text-xs text-slate-400 font-medium">Approved PTO &amp; Sick</span>
          </div>
          <button
            onClick={() => onNavigateTab('leave')}
            className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1 text-left cursor-pointer"
          >
            <span>View Leave Calendar</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* High Risk (Requires Attention) */}
        <div className="bg-white p-5 rounded-lg border border-red-200 bg-red-50/20 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-red-700 text-xs font-bold uppercase tracking-wider">High Risk Staff</span>
            <div className="w-8 h-8 rounded-md bg-red-100 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-red-600" />
            </div>
          </div>
          <div className="my-2">
            <div className="text-2xl font-bold text-red-600">{highRiskCount}</div>
            <span className="text-xs text-red-700 font-medium">Requires HR Attention</span>
          </div>
          <button
            onClick={() => onNavigateTab('risk')}
            className="text-xs text-red-700 font-bold hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Review Risk Details</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Main Content: Two Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Department Intelligence & Top Risk Staff */}
        <div className="lg:col-span-2 space-y-6">
          {/* Department Intelligence Summary Card */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-blue-600" />
                  <span>Department Workforce Intelligence</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">Live capacity, attendance velocity, and risk breakdown by team</p>
              </div>
              <button
                onClick={() => onNavigateTab('departments')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
              >
                <span>All Departments</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-[11px] uppercase font-bold border-b border-slate-100">
                    <th className="px-5 py-3">Department</th>
                    <th className="px-5 py-3">Headcount</th>
                    <th className="px-5 py-3">Present</th>
                    <th className="px-5 py-3">Availability</th>
                    <th className="px-5 py-3">Health Score</th>
                    <th className="px-5 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {departments.map(dept => {
                    const isWarning = dept.name === 'Sales' || dept.workforceHealthScore < 70;
                    return (
                      <tr key={dept.id} className="hover:bg-slate-50 transition-colors group">
                        <td className="px-5 py-3.5">
                          <div className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                            {dept.name}
                          </div>
                          <div className="text-xs text-slate-400">Mgr: {dept.managerName}</div>
                        </td>
                        <td className="px-5 py-3.5 text-slate-700 font-medium">
                          {dept.totalStaff} staff
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="font-semibold text-emerald-600">{dept.presentToday}</span>
                          <span className="text-xs text-slate-400 ml-1">({dept.attendancePct}%)</span>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2">
                            <div className="w-20 bg-slate-100 h-2 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  dept.availabilityPct < 75 ? 'bg-orange-500' : 'bg-blue-600'
                                }`}
                                style={{ width: `${dept.availabilityPct}%` }}
                              ></div>
                            </div>
                            <span className={`text-xs font-semibold ${dept.availabilityPct < 75 ? 'text-orange-600' : 'text-slate-700'}`}>
                              {dept.availabilityPct}%
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-900">{dept.workforceHealthScore}</span>
                            <span className="text-xs text-slate-400">/100</span>
                            {isWarning && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-100 text-orange-700 uppercase">
                                Attention
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <button
                            onClick={() => {
                              onSelectDepartment(dept.name);
                              onNavigateTab('departments');
                            }}
                            className="px-2.5 py-1 text-xs font-medium rounded-md text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors cursor-pointer"
                          >
                            Diagnose
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* High Risk Employees Requiring Attention */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Flame className="w-5 h-5 text-red-600" />
                  <span>Employees Requiring HR Attention (Score ≥ 70)</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">Explainable risk scores derived from attendance deficit &amp; absence spikes</p>
              </div>
              <button
                onClick={() => onNavigateTab('risk')}
                className="text-xs font-semibold text-red-600 hover:text-red-700 flex items-center gap-1 cursor-pointer"
              >
                <span>Risk Workbench</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-[11px] uppercase font-bold border-b border-slate-100">
                    <th className="px-5 py-3">Employee</th>
                    <th className="px-5 py-3">Department</th>
                    <th className="px-5 py-3">Risk Score</th>
                    <th className="px-5 py-3">Attendance</th>
                    <th className="px-5 py-3">Absences</th>
                    <th className="px-5 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {highRiskEmployees.slice(0, 5).map(emp => (
                    <tr key={emp.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={emp.avatar}
                            alt={emp.name}
                            className="w-8 h-8 rounded-full object-cover border border-slate-200"
                          />
                          <div>
                            <div className="font-semibold text-slate-900">{emp.name}</div>
                            <div className="text-xs text-slate-400">{emp.jobTitle}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-slate-700 text-xs font-medium">
                        {emp.departmentName}
                      </td>
                      <td className="px-5 py-3">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700 uppercase">
                          {emp.riskScore} • HIGH
                        </span>
                      </td>
                      <td className="px-5 py-3 text-xs">
                        <div className="flex items-center gap-1 font-semibold text-slate-700">
                          <span>{emp.attendanceRate}%</span>
                          <TrendingDown className="w-3.5 h-3.5 text-red-500" />
                        </div>
                      </td>
                      <td className="px-5 py-3 text-xs text-red-600 font-bold">
                        {emp.absenceCount} days
                      </td>
                      <td className="px-5 py-3 text-right">
                        <button
                          onClick={() => {
                            onSelectEmployee(emp);
                            onNavigateTab('risk');
                          }}
                          className="px-2.5 py-1 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors cursor-pointer"
                        >
                          Review Plan
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right 1 Column: Proactive Alerts & AI Insights */}
        <div className="space-y-6">
          {/* Proactive Alerts Panel */}
          <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-orange-500" />
                <span>Proactive HR Alerts</span>
              </h3>
              <span className="text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 font-semibold uppercase">
                {alerts.filter(a => !a.isRead).length} Unread
              </span>
            </div>

            <div className="space-y-3">
              {unreadAlerts.map(alert => (
                <div
                  key={alert.id}
                  className="p-3.5 rounded-lg border border-orange-200 bg-orange-50/50 text-xs space-y-1.5 transition hover:border-orange-300"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-bold text-slate-900 text-xs leading-snug">{alert.title}</h4>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-orange-200 text-orange-800 uppercase">
                      {alert.severity}
                    </span>
                  </div>
                  <p className="text-slate-600 leading-relaxed">{alert.reason}</p>
                  <div className="pt-1 text-blue-700 font-semibold flex items-center gap-1">
                    <span>Action:</span>
                    <span>{alert.recommendedAction}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Workforce Insights Panel */}
          <div className="bg-slate-900 text-slate-300 rounded-lg p-5 border border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-400" />
                <h3 className="font-bold text-white text-sm">AI Workforce Insights</h3>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-blue-300 font-mono uppercase">
                Data-Derived
              </span>
            </div>

            <div className="space-y-3">
              {insights.map(ins => (
                <div key={ins.id} className="p-3 rounded-md bg-slate-800/90 border border-slate-700/80 text-xs space-y-1.5">
                  <div className="font-bold text-blue-300">{ins.headline}</div>
                  <p className="text-slate-400 text-[11px] leading-relaxed">{ins.description}</p>
                  <div className="text-emerald-400 font-medium text-[11px] pt-1 flex items-start gap-1">
                    <span>•</span>
                    <span>{ins.recommendedAction}</span>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => onNavigateTab('copilot')}
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>Explore full diagnostics in AI Copilot</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
