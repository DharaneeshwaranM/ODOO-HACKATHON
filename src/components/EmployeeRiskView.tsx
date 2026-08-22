import React, { useState } from 'react';
import { Employee, RiskLevel } from '../types';
import { 
  ShieldAlert, 
  Search, 
  Filter, 
  TrendingDown, 
  TrendingUp, 
  Minus, 
  AlertCircle, 
  CheckCircle2, 
  FileText, 
  Calendar, 
  Clock, 
  UserCheck, 
  Sparkles,
  ArrowRight,
  Info
} from 'lucide-react';

interface EmployeeRiskViewProps {
  employees: Employee[];
  selectedEmployee: Employee | null;
  onSelectEmployee: (emp: Employee) => void;
  onGeneratePayslip: (emp: Employee) => void;
  onScheduleCheckin: (emp: Employee) => void;
}

export const EmployeeRiskView: React.FC<EmployeeRiskViewProps> = ({
  employees,
  selectedEmployee,
  onSelectEmployee,
  onGeneratePayslip,
  onScheduleCheckin,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDept, setFilterDept] = useState('All');
  const [filterTier, setFilterTier] = useState<'All' | 'low' | 'medium' | 'high'>('All');

  // Filtered employees
  const filtered = employees.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          emp.badgeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          emp.jobTitle.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = filterDept === 'All' || emp.departmentName === filterDept;
    const matchesTier = filterTier === 'All' || emp.riskLevel === filterTier;
    return matchesSearch && matchesDept && matchesTier;
  });

  const activeEmp = selectedEmployee || filtered[0] || employees[0];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700 uppercase">
              Workforce Intelligence Tier
            </span>
            <span className="text-xs text-slate-500 font-medium">Explainable • Rule-Based • Zero Blackbox</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-red-600" />
            <span>Employee Risk Intelligence</span>
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Identify engagement friction, attendance velocity shifts, and proactive HR action plans.
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="font-semibold">0–39 LOW</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-orange-50 text-orange-800 border border-orange-200">
            <span className="w-2 h-2 rounded-full bg-orange-500"></span>
            <span className="font-semibold">40–69 MEDIUM</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-50 text-red-800 border border-red-200">
            <span className="w-2 h-2 rounded-full bg-red-500"></span>
            <span className="font-semibold">70–100 HIGH</span>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search employee name, badge ID (e.g. EMP-1004), or position..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Department Select */}
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

          {/* Risk Tier Filter */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-md">
            <button
              onClick={() => setFilterTier('All')}
              className={`px-2.5 py-1 text-xs font-semibold rounded transition-colors ${
                filterTier === 'All' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              All ({employees.length})
            </button>
            <button
              onClick={() => setFilterTier('high')}
              className={`px-2.5 py-1 text-xs font-semibold rounded transition-colors ${
                filterTier === 'high' ? 'bg-red-600 text-white shadow-sm' : 'text-red-700 hover:text-red-800'
              }`}
            >
              High ({employees.filter(e => e.riskLevel === 'high').length})
            </button>
            <button
              onClick={() => setFilterTier('medium')}
              className={`px-2.5 py-1 text-xs font-semibold rounded transition-colors ${
                filterTier === 'medium' ? 'bg-orange-600 text-white shadow-sm' : 'text-orange-700 hover:text-orange-800'
              }`}
            >
              Medium ({employees.filter(e => e.riskLevel === 'medium').length})
            </button>
            <button
              onClick={() => setFilterTier('low')}
              className={`px-2.5 py-1 text-xs font-semibold rounded transition-colors ${
                filterTier === 'low' ? 'bg-emerald-600 text-white shadow-sm' : 'text-emerald-700 hover:text-emerald-800'
              }`}
            >
              Low ({employees.filter(e => e.riskLevel === 'low').length})
            </button>
          </div>
        </div>
      </div>

      {/* Main Two-Panel Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Employee List (5 Cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500 px-1 font-bold uppercase tracking-wider">
            <span>SHOWING {filtered.length} EMPLOYEES</span>
            <span>SORTED BY RISK SCORE</span>
          </div>

          <div className="space-y-2 max-h-[700px] overflow-y-auto pr-1">
            {filtered.map(emp => {
              const isSelected = activeEmp?.id === emp.id;
              const isHigh = emp.riskLevel === 'high';
              const isMed = emp.riskLevel === 'medium';

              return (
                <div
                  key={emp.id}
                  onClick={() => onSelectEmployee(emp)}
                  className={`p-4 rounded-lg border transition-colors cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/40 shadow-sm ring-1 ring-blue-500/30'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={emp.avatar}
                      alt={emp.name}
                      className="w-10 h-10 rounded-full object-cover border border-slate-200"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{emp.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{emp.badgeId}</span>
                      </div>
                      <div className="text-xs text-slate-500">{emp.jobTitle} • {emp.departmentName}</div>
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                        <span>Att: <strong>{emp.attendanceRate}%</strong></span>
                        <span>•</span>
                        <span>Absences: <strong className={emp.absenceCount > 3 ? 'text-red-600 font-bold' : ''}>{emp.absenceCount}</strong></span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right flex flex-col items-end">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-tight ${
                        isHigh
                          ? 'bg-red-100 text-red-700'
                          : isMed
                          ? 'bg-orange-100 text-orange-700'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {emp.riskScore} / 100
                    </span>
                    <span className="text-[10px] text-slate-400 uppercase font-bold mt-1">
                      {emp.riskLevel} Tier
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: In-Depth Explainable Risk Dossier (7 Cols) */}
        {activeEmp && (
          <div className="lg:col-span-7 bg-white rounded-lg border border-slate-200 p-6 shadow-sm space-y-6">
            {/* Header Profile Info */}
            <div className="flex items-start justify-between pb-6 border-b border-slate-100">
              <div className="flex items-center gap-4">
                <img
                  src={activeEmp.avatar}
                  alt={activeEmp.name}
                  className="w-16 h-16 rounded-lg object-cover border border-slate-200 shadow-sm"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-slate-900">{activeEmp.name}</h2>
                    <span className="text-xs font-mono px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
                      {activeEmp.badgeId}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 font-medium">{activeEmp.jobTitle} • {activeEmp.departmentName}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{activeEmp.email} • {activeEmp.phone}</p>
                </div>
              </div>

              {/* Risk Score Big Stamp */}
              <div className="text-right">
                <div className="text-slate-500 text-xs font-bold uppercase tracking-wider">Workforce Risk Score</div>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span
                    className={`text-4xl font-bold ${
                      activeEmp.riskLevel === 'high'
                        ? 'text-red-600'
                        : activeEmp.riskLevel === 'medium'
                        ? 'text-orange-600'
                        : 'text-emerald-600'
                    }`}
                  >
                    {activeEmp.riskScore}
                  </span>
                  <span className="text-slate-400 font-bold text-sm">/ 100</span>
                </div>
                <span
                  className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase mt-1 ${
                    activeEmp.riskLevel === 'high'
                      ? 'bg-red-100 text-red-700'
                      : activeEmp.riskLevel === 'medium'
                      ? 'bg-orange-100 text-orange-700'
                      : 'bg-emerald-100 text-emerald-700'
                  }`}
                >
                  {activeEmp.riskLevel} Risk Tier
                </span>
              </div>
            </div>

            {/* Metric Breakdown Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-100">
                <div className="text-xs text-slate-500 font-medium">30-Day Attendance</div>
                <div className="text-lg font-bold text-slate-900 mt-1">{activeEmp.attendanceRate}%</div>
                <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                  {activeEmp.attendanceTrend === 'declining' ? (
                    <span className="text-red-600 flex items-center gap-0.5 font-semibold">
                      <TrendingDown className="w-3 h-3" /> Declining
                    </span>
                  ) : (
                    <span className="text-emerald-600 flex items-center gap-0.5 font-semibold">
                      <TrendingUp className="w-3 h-3" /> Stable
                    </span>
                  )}
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-100">
                <div className="text-xs text-slate-500 font-medium">Unscheduled Absences</div>
                <div className="text-lg font-bold text-red-600 mt-1">{activeEmp.absenceCount} days</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Past 30 business days</div>
              </div>

              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-100">
                <div className="text-xs text-slate-500 font-medium">Late Arrivals</div>
                <div className="text-lg font-bold text-orange-600 mt-1">{activeEmp.lateCheckinCount} times</div>
                <div className="text-[10px] text-slate-400 mt-0.5">&gt;15 min past 9:00 AM</div>
              </div>

              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-100">
                <div className="text-xs text-slate-500 font-medium">Recent Leaves</div>
                <div className="text-lg font-bold text-slate-900 mt-1">{activeEmp.leaveCount} requests</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Past 90 calendar days</div>
              </div>
            </div>

            {/* Explainable Contributing Factors / Reasons */}
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Info className="w-4 h-4 text-blue-600" />
                <span>Identified Risk Drivers &amp; Calculation Breakdown</span>
              </h3>
              <ul className="space-y-1.5 text-xs text-slate-700">
                {activeEmp.riskReasons.map((reason, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-red-500 font-bold">•</span>
                    <span className="leading-relaxed">{reason}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Prescriptive HR Action Recommendation */}
            <div className="p-4 rounded-lg bg-blue-50/70 border border-blue-200 space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-blue-900 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span>Prescriptive HR Action Plan</span>
              </h3>
              <p className="text-xs text-blue-950 font-medium leading-relaxed">
                {activeEmp.riskRecommendation}
              </p>
            </div>

            {/* Actions Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100">
              <button
                onClick={() => onGeneratePayslip(activeEmp)}
                className="flex items-center gap-2 px-3.5 py-2 rounded-md text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <FileText className="w-4 h-4 text-slate-600" />
                <span>Generate Salary Slip</span>
              </button>

              <button
                onClick={() => onScheduleCheckin(activeEmp)}
                className="flex items-center gap-2 px-4 py-2 rounded-md text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-colors cursor-pointer"
              >
                <Calendar className="w-4 h-4 text-blue-200" />
                <span>Initiate HR Retention Check-in</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
