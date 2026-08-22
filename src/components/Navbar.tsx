import React from 'react';
import { AuthUser, WorkforceAlert, UserRole } from '../types';
import { 
  Sparkles, 
  Users, 
  UserPlus,
  ShieldAlert, 
  Building2, 
  CalendarClock, 
  FileText, 
  Bell, 
  Code2, 
  Compass, 
  Clock, 
  LogOut, 
  Activity,
  UserCheck,
  Shield,
  Briefcase,
  FileCheck2
} from 'lucide-react';

interface NavbarProps {
  currentUser: AuthUser;
  onLogout: () => void;
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  alerts: WorkforceAlert[];
  onOpenNotifications: () => void;
  onOpenCodeExplorer: () => void;
  onOpenDemoGuide: () => void;
  employeeCheckedIn: boolean;
  onToggleCheckIn: () => void;
  onOpenAddMember?: () => void;
  onOpenAuditLogs?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onLogout,
  currentTab,
  setCurrentTab,
  alerts,
  onOpenNotifications,
  onOpenCodeExplorer,
  onOpenDemoGuide,
  employeeCheckedIn,
  onToggleCheckIn,
  onOpenAddMember,
  onOpenAuditLogs,
}) => {
  const unreadAlerts = alerts.filter(a => !a.isRead).length;
  const isHr = currentUser.role === 'hr';

  return (
    <header className="bg-slate-900 text-slate-300 sticky top-0 z-40 shadow-sm border-b border-slate-800 font-sans">
      {/* Top Utility Bar */}
      <div className="px-6 py-2 bg-slate-950/80 border-b border-slate-800/80 flex flex-wrap items-center justify-between text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-blue-950/60 text-blue-300 px-2.5 py-0.5 rounded border border-blue-800/60">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-semibold text-[11px] uppercase tracking-wider">Odoo 17.0 Enterprise Engine</span>
          </div>
          <span className="text-slate-400 hidden sm:inline">Module: <code className="text-blue-400 font-mono">dayflow_ai</code></span>
          <span className="text-slate-600 hidden md:inline">|</span>
          <span className="text-slate-400 hidden md:inline font-medium">Role verified via Odoo ORM Security Groups</span>
        </div>

        <div className="flex items-center gap-2 mt-1 sm:mt-0">
          {/* HR-Only Audit Log Viewer */}
          {isHr && onOpenAuditLogs && (
            <button
              onClick={onOpenAuditLogs}
              className="flex items-center gap-1.5 bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-800/60 px-2.5 py-1 rounded text-xs font-semibold transition cursor-pointer"
              title="View HR & Member Creation Audit Logs"
            >
              <FileCheck2 className="w-3.5 h-3.5" />
              <span>Audit Logs</span>
            </button>
          )}

          {/* Demo Sequence Quick Launcher */}
          <button
            onClick={onOpenDemoGuide}
            className="flex items-center gap-1.5 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 border border-amber-500/30 px-2.5 py-1 rounded text-xs font-semibold transition cursor-pointer"
            title="Step-by-step evaluation guide"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Evaluation Guide (1–8)</span>
          </button>

          {/* Odoo Code Explorer Button */}
          <button
            onClick={onOpenCodeExplorer}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-2.5 py-1 rounded text-xs font-medium transition cursor-pointer"
            title="Inspect full Odoo 17 Python, XML, OWL & manifest code"
          >
            <Code2 className="w-3.5 h-3.5 text-blue-400" />
            <span>Odoo 17 Source</span>
          </button>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="px-6 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-3">
          <div 
            onClick={() => setCurrentTab(isHr ? 'dashboard' : 'employee_portal')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center font-bold text-white shadow-sm group-hover:bg-blue-500 transition-colors">
              D
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-lg text-white tracking-tight">DAYFLOW</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-600 text-white font-bold tracking-wider uppercase">
                  {isHr ? 'HR' : 'PORTAL'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 tracking-tight leading-none">Workforce Intelligence &amp; Risk</p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto py-1">
          {isHr ? (
            // HR / Admin Navigation
            <>
              <button
                onClick={() => setCurrentTab('dashboard')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                  currentTab === 'dashboard'
                    ? 'bg-slate-800 text-white font-semibold'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Activity className="w-4 h-4 opacity-80" />
                <span>Dashboard</span>
              </button>

              {/* HR Employee Directory */}
              <button
                onClick={() => setCurrentTab('employees')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                  currentTab === 'employees'
                    ? 'bg-slate-800 text-white font-semibold'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Users className="w-4 h-4 opacity-80" />
                <span>Employees</span>
              </button>

              <button
                onClick={() => setCurrentTab('risk')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                  currentTab === 'risk'
                    ? 'bg-slate-800 text-white font-semibold'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <ShieldAlert className="w-4 h-4 text-orange-400" />
                <span>Employee Risk</span>
              </button>

              <button
                onClick={() => setCurrentTab('departments')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                  currentTab === 'departments'
                    ? 'bg-slate-800 text-white font-semibold'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Building2 className="w-4 h-4 opacity-80" />
                <span>Department Health</span>
              </button>

              <button
                onClick={() => setCurrentTab('leave')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                  currentTab === 'leave'
                    ? 'bg-slate-800 text-white font-semibold'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <CalendarClock className="w-4 h-4 opacity-80" />
                <span>Leave Approvals</span>
              </button>

              <button
                onClick={() => setCurrentTab('attendance')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                  currentTab === 'attendance'
                    ? 'bg-slate-800 text-white font-semibold'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Clock className="w-4 h-4 opacity-80" />
                <span>Attendance</span>
              </button>

              <button
                onClick={() => setCurrentTab('copilot')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                  currentTab === 'copilot'
                    ? 'bg-blue-600 text-white font-semibold shadow-sm'
                    : 'bg-slate-800/80 text-blue-300 hover:bg-slate-800 hover:text-white border border-slate-700/60'
                }`}
              >
                <Sparkles className="w-4 h-4 text-blue-400" />
                <span>AI Copilot</span>
              </button>

              <button
                onClick={() => setCurrentTab('payroll')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                  currentTab === 'payroll'
                    ? 'bg-slate-800 text-white font-semibold'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <FileText className="w-4 h-4 opacity-80" />
                <span>Payroll</span>
              </button>
            </>
          ) : (
            // Employee Navigation (Strictly Employee Self-Service Only)
            <>
              <button
                onClick={() => setCurrentTab('employee_portal')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                  currentTab === 'employee_portal'
                    ? 'bg-slate-800 text-white font-semibold'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Users className="w-4 h-4 opacity-80" />
                <span>My Profile</span>
              </button>

              <button
                onClick={() => setCurrentTab('attendance')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                  currentTab === 'attendance'
                    ? 'bg-slate-800 text-white font-semibold'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Clock className="w-4 h-4 opacity-80" />
                <span>My Attendance</span>
              </button>

              <button
                onClick={() => setCurrentTab('leave')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                  currentTab === 'leave'
                    ? 'bg-slate-800 text-white font-semibold'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <CalendarClock className="w-4 h-4 opacity-80" />
                <span>Apply Leave</span>
              </button>

              <button
                onClick={() => setCurrentTab('payroll')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                  currentTab === 'payroll'
                    ? 'bg-slate-800 text-white font-semibold'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <FileText className="w-4 h-4 opacity-80" />
                <span>My Salary Slip</span>
              </button>
            </>
          )}
        </nav>

        {/* Right Controls: Add Member (HR Only), Check-in, Bell, User Badge & Logout */}
        <div className="flex items-center gap-3">
          {/* HR-Only Quick Add Member Button */}
          {isHr && onOpenAddMember && (
            <button
              onClick={onOpenAddMember}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-md text-xs font-bold shadow-sm transition cursor-pointer"
              title="Add New Member (HR Admin)"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>+ Add Member</span>
            </button>
          )}

          {/* Employee Check-In / Check-Out Widget */}
          <button
            onClick={onToggleCheckIn}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold border transition cursor-pointer ${
              employeeCheckedIn
                ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/60'
                : 'bg-red-950/60 border-red-500/40 text-red-300 hover:bg-red-900/60'
            }`}
            title="Toggle check-in status"
          >
            <span className={`w-2 h-2 rounded-full ${employeeCheckedIn ? 'bg-emerald-400' : 'bg-red-400'}`}></span>
            <span>{employeeCheckedIn ? 'CHECKED IN' : 'CHECKED OUT'}</span>
          </button>

          {/* In-App Notifications Bell */}
          <button
            onClick={onOpenNotifications}
            className="relative p-2 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer border border-slate-700/60"
            title="Proactive HR Alerts & Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadAlerts > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center">
                {unreadAlerts}
              </span>
            )}
          </button>

          {/* User Account Details Pill */}
          <div className="flex items-center gap-2.5 bg-slate-800/90 pl-2 pr-3 py-1 rounded-lg border border-slate-700">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-7 h-7 rounded-full object-cover border border-slate-600"
            />
            <div className="text-left">
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <span>{currentUser.name}</span>
                <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
                  isHr ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-200'
                }`}>
                  {isHr ? 'HR Admin' : 'Employee'}
                </span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono">
                {currentUser.userId} • {currentUser.departmentName}
              </div>
            </div>

            {/* Logout Action */}
            <button
              onClick={onLogout}
              className="ml-2 p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-700/70 rounded transition cursor-pointer"
              title="Logout from account"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

