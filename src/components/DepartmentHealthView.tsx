import React, { useState } from 'react';
import { Department, Employee } from '../types';
import { DepartmentOrgChart } from './DepartmentOrgChart';
import { 
  Building2, 
  Users, 
  UserCheck, 
  UserX, 
  Calendar, 
  ShieldAlert, 
  Activity, 
  CheckCircle2, 
  AlertTriangle,
  ArrowRight,
  TrendingDown,
  Layers,
  Table as TableIcon,
  Sparkles,
  GitFork
} from 'lucide-react';

interface DepartmentHealthViewProps {
  departments: Department[];
  employees: Employee[];
  selectedDepartmentName: string;
  onSelectDepartment: (deptName: string) => void;
  onSelectEmployee: (emp: Employee) => void;
  onNavigateTab: (tab: string) => void;
  onGeneratePayslip?: (emp: Employee) => void;
}

export const DepartmentHealthView: React.FC<DepartmentHealthViewProps> = ({
  departments,
  employees,
  selectedDepartmentName,
  onSelectDepartment,
  onSelectEmployee,
  onNavigateTab,
  onGeneratePayslip,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'org_chart' | 'diagnostics' | 'roster'>('org_chart');
  
  const currentDept = departments.find(d => d.name === selectedDepartmentName) || departments[1]; // default Sales
  const deptEmployees = employees.filter(e => e.departmentName === currentDept.name);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 uppercase flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-blue-600" />
              <span>Department Intelligence &amp; Hierarchy</span>
            </span>
            <span className="text-xs text-slate-500 font-medium">Real-Time Roster, Health &amp; Org Structure</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Building2 className="w-6 h-6 text-blue-600" />
            <span>Department Intelligence &amp; Organizational Chart</span>
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Visualize reporting hierarchies, monitor availability % thresholds, and detect team burnout in real-time.
          </p>
        </div>

        {/* View Segment Switcher */}
        <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-semibold self-start md:self-auto">
          <button
            onClick={() => setActiveSubTab('org_chart')}
            className={`px-3.5 py-1.5 rounded-md transition cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'org_chart'
                ? 'bg-blue-600 text-white shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
            }`}
          >
            <GitFork className="w-3.5 h-3.5" />
            <span>Interactive Org Chart</span>
          </button>

          <button
            onClick={() => setActiveSubTab('diagnostics')}
            className={`px-3.5 py-1.5 rounded-md transition cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'diagnostics'
                ? 'bg-blue-600 text-white shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Capacity Diagnostics</span>
          </button>

          <button
            onClick={() => setActiveSubTab('roster')}
            className={`px-3.5 py-1.5 rounded-md transition cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'roster'
                ? 'bg-blue-600 text-white shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
            }`}
          >
            <TableIcon className="w-3.5 h-3.5" />
            <span>Staff Roster Table</span>
          </button>
        </div>
      </div>

      {/* Department Selection Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {departments.map(dept => {
          const isSelected = dept.name === currentDept.name;
          const isWarning = dept.availabilityPct < 75 || dept.workforceHealthScore < 70;

          return (
            <div
              key={dept.id}
              onClick={() => onSelectDepartment(dept.name)}
              className={`p-4 rounded-xl border transition cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'border-blue-600 bg-blue-50/40 shadow-sm ring-1 ring-blue-500/30'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{dept.name}</h3>
                  <span className="text-xs text-slate-400 font-medium">{dept.totalStaff} staff</span>
                </div>
                {isWarning ? (
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-500 ring-4 ring-orange-100"></span>
                ) : (
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-100"></span>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-baseline justify-between">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Health Score</div>
                  <div className="text-lg font-bold text-slate-900">{dept.workforceHealthScore}/100</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Availability</div>
                  <div className={`text-sm font-bold ${dept.availabilityPct < 75 ? 'text-orange-600' : 'text-emerald-600'}`}>
                    {dept.availabilityPct}%
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* SUB-VIEW 1: Interactive Org Chart */}
      {activeSubTab === 'org_chart' && (
        <div className="space-y-4">
          <DepartmentOrgChart
            department={currentDept}
            employees={employees}
            allEmployees={employees}
            onSelectEmployee={onSelectEmployee}
            onNavigateTab={onNavigateTab}
            onGeneratePayslip={onGeneratePayslip}
          />
        </div>
      )}

      {/* SUB-VIEW 2 & 3: Deep-Dive Diagnostics or Table */}
      {(activeSubTab === 'diagnostics' || activeSubTab === 'roster') && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold text-slate-900">{currentDept.name} Department</h2>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase ${
                  currentDept.healthStatus === 'excellent' ? 'bg-emerald-100 text-emerald-700' :
                  currentDept.healthStatus === 'good' ? 'bg-blue-100 text-blue-700' :
                  currentDept.healthStatus === 'warning' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'
                }`}>
                  {currentDept.healthStatus} Health
                </span>
              </div>
              <p className="text-sm text-slate-500 mt-1">Department Manager: <strong className="text-slate-800">{currentDept.managerName}</strong></p>
            </div>

            <div className="flex items-center gap-6">
              <div>
                <div className="text-slate-500 text-xs font-bold uppercase tracking-wider">Workforce Health Index</div>
                <div className="text-3xl font-bold text-blue-600">{currentDept.workforceHealthScore} <span className="text-sm text-slate-400">/ 100</span></div>
              </div>
              <div>
                <div className="text-slate-500 text-xs font-bold uppercase tracking-wider">Current Availability</div>
                <div className={`text-3xl font-bold ${currentDept.availabilityPct < 75 ? 'text-orange-600' : 'text-emerald-600'}`}>
                  {currentDept.availabilityPct}%
                </div>
              </div>
            </div>
          </div>

          {/* Diagnosis Narrative */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
            <span className="font-bold text-slate-700 uppercase tracking-wider">AI Capacity Diagnostics &amp; Operational Narrative:</span>
            <p className="text-slate-700 leading-relaxed font-medium">
              {currentDept.healthSummary}
            </p>
          </div>

          {/* Key Department Metric Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs">
              <div className="text-slate-500 text-xs font-bold uppercase tracking-wider">Present Today</div>
              <div className="text-2xl font-bold text-emerald-600 mt-1">{currentDept.presentToday} staff</div>
              <div className="text-xs text-slate-400 mt-0.5 font-medium">{currentDept.attendancePct}% active attendance</div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs">
              <div className="text-slate-500 text-xs font-bold uppercase tracking-wider">On Scheduled Leave</div>
              <div className="text-2xl font-bold text-blue-600 mt-1">{currentDept.onLeaveToday} staff</div>
              <div className="text-xs text-slate-400 mt-0.5 font-medium">Approved PTO &amp; Sick</div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs">
              <div className="text-slate-500 text-xs font-bold uppercase tracking-wider">Unscheduled Absences</div>
              <div className="text-2xl font-bold text-red-600 mt-1">{currentDept.absentToday} staff</div>
              <div className="text-xs text-slate-400 mt-0.5 font-medium">Requires manager confirmation</div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs">
              <div className="text-slate-500 text-xs font-bold uppercase tracking-wider">High Risk Staff Count</div>
              <div className="text-2xl font-bold text-red-600 mt-1">{currentDept.highRiskCount} members</div>
              <div className="text-xs text-slate-400 mt-0.5 font-medium">Avg Risk: {currentDept.averageRiskScore}/100</div>
            </div>
          </div>

          {/* Department Staff Roster Table */}
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {currentDept.name} Staff Roster ({deptEmployees.length} Members)
            </h3>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 text-[11px] uppercase font-bold">
                  <tr>
                    <th className="px-4 py-3">Employee</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">Today Status</th>
                    <th className="px-4 py-3">Risk Score</th>
                    <th className="px-4 py-3">30-Day Attendance</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {deptEmployees.map(emp => (
                    <tr key={emp.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <img src={emp.avatar} alt={emp.name} className="w-7 h-7 rounded-full object-cover shadow-xs" />
                          <div>
                            <span className="font-semibold text-slate-900 block leading-tight">{emp.name}</span>
                            <span className="text-[11px] font-mono text-slate-400">{emp.badgeId}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-600 text-xs">{emp.jobTitle}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase ${
                          emp.todayStatus === 'present' ? 'bg-emerald-100 text-emerald-700' :
                          emp.todayStatus === 'late' ? 'bg-orange-100 text-orange-700' :
                          emp.todayStatus === 'leave' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {emp.todayStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase ${
                          emp.riskLevel === 'high' ? 'bg-red-100 text-red-700' :
                          emp.riskLevel === 'medium' ? 'bg-orange-100 text-orange-700' : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          {emp.riskScore} • {emp.riskLevel}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs font-medium text-slate-700">{emp.attendanceRate}%</td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => {
                            onSelectEmployee(emp);
                            onNavigateTab('risk');
                          }}
                          className="px-2.5 py-1 text-xs font-semibold text-blue-600 hover:bg-blue-50 rounded-md transition-colors cursor-pointer"
                        >
                          Inspect Risk
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
