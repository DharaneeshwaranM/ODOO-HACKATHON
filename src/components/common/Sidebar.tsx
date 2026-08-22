import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Users,
  Building2,
  CalendarCheck2,
  CalendarDays,
  ShieldAlert,
  Coins,
  BrainCircuit,
  BellRing,
  History,
  UserCircle2,
  LogOut,
  ChevronRight,
  Menu,
  X,
  Sparkles,
  ArrowRight,
  Zap,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api';

interface SidebarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  setCurrentView,
  mobileOpen,
  setMobileOpen,
}) => {
  const { user, role, logout } = useAuth();
  const [pendingDeductionsCount, setPendingDeductionsCount] = useState(0);
  const [pendingLeavesCount, setPendingLeavesCount] = useState(0);
  const [criticalActionsCount, setCriticalActionsCount] = useState(0);
  const [activeWarningsCount, setActiveWarningsCount] = useState(0);

  const fetchBadges = async () => {
    try {
      if (role === 'hr_admin') {
        const [deds, leaves, actions, warns] = await Promise.all([
          api.getSalaryDeductions(),
          api.getLeaves({ status: 'Pending' }),
          api.getActionCenter().catch(() => []),
          api.getWarnings().catch(() => []),
        ]);
        setPendingDeductionsCount(deds.filter((d) => d.status === 'Pending').length);
        setPendingLeavesCount(leaves.length);
        const urgent = actions.filter((a) => (a.priority === 'critical' || a.priority === 'high') && a.status !== 'completed' && a.status !== 'rejected');
        setCriticalActionsCount(urgent.length);
        const activeW = warns.filter((w: any) => w.status === 'Employee Responded' || w.severity === 'serious_review' || w.severity === 'separation_review');
        setActiveWarningsCount(activeW.length);
      } else if (role === 'employee' && user) {
        const myWarns = await api.getWarnings({ employeeId: user.employeeId }).catch(() => []);
        const unresponded = myWarns.filter((w: any) => w.status === 'Issued' || w.status === 'Under Review');
        setActiveWarningsCount(unresponded.length);
      }
    } catch (e) {
      // ignore
    }
  };

  useEffect(() => {
    fetchBadges();
    const interval = setInterval(fetchBadges, 15000);
    return () => clearInterval(interval);
  }, [role, currentView, user]);

  const hrNavItems = [
    {
      group: 'Core Management',
      items: [
        { id: 'hr_dashboard', label: 'Dashboard', icon: LayoutDashboard },
        {
          id: 'hr_action_center',
          label: 'Action Center',
          icon: Zap,
          badge: criticalActionsCount,
          isActionCenterBadge: true,
        },
        { id: 'hr_employees', label: 'Employees', icon: Users },
        { id: 'hr_departments', label: 'Departments', icon: Building2 },
        { id: 'hr_attendance', label: 'Attendance', icon: CalendarCheck2 },
        { id: 'hr_leaves', label: 'Leave Requests', icon: CalendarDays, badge: pendingLeavesCount },
        { id: 'hr_absence_monitoring', label: 'Absence Limits', icon: ShieldAlert },
        {
          id: 'hr_salary_deductions',
          label: 'Salary Deductions',
          icon: Coins,
          badge: pendingDeductionsCount,
          isCriticalWarning: true,
        },
        {
          id: 'hr_warnings',
          label: 'Warning & Conduct',
          icon: ShieldAlert,
          badge: activeWarningsCount,
          isCriticalWarning: activeWarningsCount > 0,
        },
      ],
    },
    {
      group: 'Intelligence',
      items: [
        { id: 'hr_workforce_intelligence', label: 'Workforce Risk', icon: BrainCircuit, aiBadge: true },
        { id: 'hr_notifications', label: 'Notifications & Outbox', icon: BellRing },
        { id: 'hr_audit', label: 'Compliance Audit', icon: History },
      ],
    },
  ];

  const employeeNavItems = [
    {
      group: 'My Workspace',
      items: [
        { id: 'emp_dashboard', label: 'Employee Dashboard', icon: LayoutDashboard },
        { id: 'emp_attendance', label: 'Attendance & Clock', icon: CalendarCheck2 },
        { id: 'emp_leaves', label: 'Leave Balances', icon: CalendarDays },
        {
          id: 'emp_performance',
          label: 'Performance & Warnings',
          icon: ShieldAlert,
          badge: activeWarningsCount,
          isCriticalWarning: activeWarningsCount > 0,
        },
      ],
    },
    {
      group: 'Governance & Status',
      items: [
        { id: 'emp_absence', label: 'Absence & Deductions', icon: Coins },
        { id: 'emp_notifications', label: 'Inbox & Notifications', icon: BellRing },
        { id: 'emp_profile', label: 'My Profile', icon: UserCircle2 },
      ],
    },
  ];

  const navGroups = role === 'hr_admin' ? hrNavItems : employeeNavItems;

  const handleNavClick = (viewId: string) => {
    setCurrentView(viewId);
    setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 flex w-60 shrink-0 flex-col bg-slate-900 text-slate-400 transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between px-5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center font-bold text-white italic text-base shadow-sm">
              D
            </div>
            <span className="text-white font-bold tracking-tight text-lg">Dayflow AI</span>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="rounded-md p-1 text-slate-400 hover:bg-slate-800 hover:text-white lg:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
          {navGroups.map((group, gIdx) => (
            <div key={gIdx} className="space-y-1">
              <div className="text-slate-500 text-[10px] font-bold uppercase tracking-widest px-2 mb-1.5">
                {group.group}
              </div>
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.id;
                const isCriticalWarning = 'isCriticalWarning' in item && item.isCriticalWarning && pendingDeductionsCount > 0;

                return (
                  <button
                    key={item.id}
                    id={`nav-link-${item.id}`}
                    onClick={() => handleNavClick(item.id)}
                    className={`flex items-center gap-2.5 w-full px-2.5 py-2 rounded-md text-xs font-medium transition-colors cursor-pointer text-left ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-xs font-semibold'
                        : isCriticalWarning
                        ? 'text-yellow-400 hover:text-yellow-300 hover:bg-slate-800/80 font-bold'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <Icon
                      className={`h-4 w-4 shrink-0 opacity-80 ${
                        isActive
                          ? 'text-white'
                          : isCriticalWarning
                          ? 'text-yellow-400'
                          : 'text-slate-400'
                      }`}
                    />
                    <span className="truncate">{item.label}</span>

                    {/* AI Pill Badge */}
                    {'aiBadge' in item && item.aiBadge && (
                      <span className="ml-auto rounded bg-indigo-500/20 text-indigo-300 text-[9px] font-bold px-1.5 py-0.2 ring-1 ring-indigo-500/30">
                        AI
                      </span>
                    )}

                    {/* Counter Badge */}
                    {'badge' in item && typeof item.badge === 'number' && item.badge > 0 && (
                      <span
                        className={`ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded ${
                          isCriticalWarning
                            ? 'bg-yellow-500 text-slate-900'
                            : 'isActionCenterBadge' in item && item.isActionCenterBadge
                            ? 'bg-rose-500 text-white animate-pulse'
                            : 'bg-indigo-500 text-white'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* User Card & Profile Section in High Density Theme */}
        <div className="p-3.5 border-t border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-2.5 mb-3">
            <img
              src={user?.profilePhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
              alt={user?.fullName || 'User'}
              className="w-9 h-9 rounded-full object-cover ring-2 ring-indigo-500 shrink-0"
            />
            <div className="min-w-0 flex-1">
              <div className="text-white text-xs font-bold truncate leading-tight">{user?.fullName}</div>
              <div className="text-slate-500 text-[10px] truncate leading-tight mt-0.5">
                {role === 'hr_admin' ? 'HR Director' : user?.roleTitle || 'Employee'}
              </div>
            </div>
          </div>

          <div
            onClick={logout}
            className="text-slate-400 text-xs px-2 py-1.5 hover:text-white hover:bg-slate-800/50 rounded-md cursor-pointer flex items-center justify-between transition"
          >
            <span>Logout</span>
            <span className="text-slate-500 text-xs">→</span>
          </div>
        </div>
      </aside>
    </>
  );
};

