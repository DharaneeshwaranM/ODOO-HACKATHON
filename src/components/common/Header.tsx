import React, { useState, useEffect } from 'react';
import {
  Bell,
  Mail,
  User,
  LogOut,
  ShieldCheck,
  ChevronDown,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Clock,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Notification, EmailMessage } from '../../types';
import { api } from '../../api';

interface HeaderProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  onOpenEmails?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentView, setCurrentView, onOpenEmails }) => {
  const { user, role, logout, quickLogin } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [emails, setEmails] = useState<EmailMessage[]>([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);

  const fetchNotifsAndEmails = async () => {
    try {
      const [nList, eList] = await Promise.all([api.getNotifications(), api.getEmails()]);
      setNotifications(nList);
      setEmails(eList);
    } catch (e) {
      // ignore
    }
  };

  useEffect(() => {
    fetchNotifsAndEmails();
    const interval = setInterval(fetchNotifsAndEmails, 12000);
    return () => clearInterval(interval);
  }, [user]);

  const unreadNotifs = notifications.filter((n) => !n.read);

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (e) {
      // ignore
    }
  };

  const handleNotifClick = async (n: Notification) => {
    try {
      await api.markNotificationRead(n.id);
      setNotifications((prev) => prev.map((item) => (item.id === n.id ? { ...item, read: true } : item)));
      setShowNotifs(false);
      if (n.type === 'salary_deduction') {
        setCurrentView(role === 'hr_admin' ? 'hr_salary_deductions' : 'emp_absence');
      } else if (n.type === 'leave') {
        setCurrentView(role === 'hr_admin' ? 'hr_leaves' : 'emp_leaves');
      } else if (n.type === 'absence_warning') {
        setCurrentView(role === 'hr_admin' ? 'hr_absence_monitoring' : 'emp_absence');
      }
    } catch (e) {
      // ignore
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-8 flex-shrink-0">
      {/* Title & Brand */}
      <div className="flex items-center gap-3">
        <h1 className="text-lg sm:text-xl font-bold text-slate-800 tracking-tight">
          {role === 'hr_admin' ? 'HR Enterprise Dashboard' : 'Employee Self-Service'}
        </h1>
      </div>

      {/* Right Actions & Search */}
      <div className="flex items-center gap-3 sm:gap-6">
        {/* Search records input */}
        <div className="relative hidden md:block h-9 w-52 sm:w-64">
          <input
            type="text"
            placeholder="Search records, staff, logs..."
            className="w-full h-full bg-slate-100 border-none rounded-full px-4 text-xs focus:ring-2 focus:ring-indigo-500 text-slate-800 placeholder:text-slate-400 outline-none"
          />
        </div>

        {/* Quick Role / Persona Switcher */}
        <div className="relative">
          <button
            id="role-switcher-btn"
            onClick={() => {
              setShowRoleSwitcher(!showRoleSwitcher);
              setShowNotifs(false);
              setShowUserMenu(false);
            }}
            className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-200"
          >
            <ShieldCheck className="h-3.5 w-3.5 text-indigo-600" />
            <span className="hidden sm:inline">Role:</span>
            <span className="font-bold text-slate-900">
              {role === 'hr_admin' ? 'HR Director' : user?.fullName?.split(' ')[0] || 'Employee'}
            </span>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
          </button>

          {showRoleSwitcher && (
            <div className="absolute right-0 mt-2 w-72 rounded-xl border border-slate-200 bg-white p-2 shadow-xl ring-1 ring-black/5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Switch Test Persona
              </div>
              <div className="space-y-1">
                <button
                  onClick={async () => {
                    await quickLogin('HR001');
                    setShowRoleSwitcher(false);
                    setCurrentView('hr_dashboard');
                  }}
                  className={`w-full flex items-center justify-between rounded-lg px-3 py-2 text-left text-xs transition ${
                    user?.employeeId === 'HR001' ? 'bg-indigo-50 text-indigo-900 font-semibold' : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div>
                    <p className="font-medium text-slate-900">Sarah Connor (HR Admin)</p>
                    <p className="text-[10px] text-slate-500">VP of HR • Full Access</p>
                  </div>
                  <span className="rounded bg-indigo-100 px-1.5 py-0.5 text-[10px] font-bold text-indigo-700">HR</span>
                </button>

                <button
                  onClick={async () => {
                    await quickLogin('EMP002');
                    setShowRoleSwitcher(false);
                    setCurrentView('emp_dashboard');
                  }}
                  className={`w-full flex items-center justify-between rounded-lg px-3 py-2 text-left text-xs transition ${
                    user?.employeeId === 'EMP002' ? 'bg-orange-50 text-orange-950 font-semibold' : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div>
                    <p className="font-medium text-slate-900">Priya Sharma (Sr. Engineer)</p>
                    <p className="text-[10px] text-orange-600 font-bold">14 Absences • Exceeded Limit</p>
                  </div>
                  <span className="rounded bg-orange-100 px-1.5 py-0.5 text-[10px] font-bold text-orange-700">Excess</span>
                </button>

                <button
                  onClick={async () => {
                    await quickLogin('EMP001');
                    setShowRoleSwitcher(false);
                    setCurrentView('emp_dashboard');
                  }}
                  className={`w-full flex items-center justify-between rounded-lg px-3 py-2 text-left text-xs transition ${
                    user?.employeeId === 'EMP001' ? 'bg-indigo-50 text-indigo-900 font-semibold' : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div>
                    <p className="font-medium text-slate-900">Alex Rivera (Lead Architect)</p>
                    <p className="text-[10px] text-amber-600 font-semibold">10 Absences • Warning Limit</p>
                  </div>
                  <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-700">Warn</span>
                </button>

                <button
                  onClick={async () => {
                    await quickLogin('EMP003');
                    setShowRoleSwitcher(false);
                    setCurrentView('emp_dashboard');
                  }}
                  className={`w-full flex items-center justify-between rounded-lg px-3 py-2 text-left text-xs transition ${
                    user?.employeeId === 'EMP003' ? 'bg-indigo-50 text-indigo-900 font-semibold' : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div>
                    <p className="font-medium text-slate-900">Marcus Chen (Product Lead)</p>
                    <p className="text-[10px] text-emerald-600 font-medium">Normal Attendance (4 Days)</p>
                  </div>
                  <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700">Normal</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Email Simulation / Outbox */}
        <button
          id="emails-modal-btn"
          onClick={() => onOpenEmails && onOpenEmails()}
          className="relative w-9 h-9 flex items-center justify-center bg-slate-100 hover:bg-slate-200 rounded-full text-slate-600 transition"
          title="Dayflow AI Mailbox & Dispatch Center"
        >
          <Mail className="h-4 w-4" />
          {emails.length > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500"></span>
          )}
        </button>

        {/* Notification Bell */}
        <div className="relative">
          <button
            id="notifications-bell-btn"
            onClick={() => {
              setShowNotifs(!showNotifs);
              setShowUserMenu(false);
              setShowRoleSwitcher(false);
            }}
            className="relative w-9 h-9 flex items-center justify-center bg-slate-100 hover:bg-slate-200 rounded-full text-slate-600 transition"
          >
            <Bell className="h-4 w-4" />
            {unreadNotifs.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-600 animate-pulse"></span>
            )}
          </button>

          {showNotifs && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl border border-slate-200 bg-white shadow-xl ring-1 ring-black/5 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-xs">Notifications</span>
                  {unreadNotifs.length > 0 && (
                    <span className="rounded bg-indigo-100 px-1.5 py-0.5 text-[10px] font-bold text-indigo-700">
                      {unreadNotifs.length} new
                    </span>
                  )}
                </div>
                {unreadNotifs.length > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[11px] text-indigo-600 hover:text-indigo-700 font-bold"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-500">
                    <CheckCircle2 className="mx-auto h-8 w-8 text-slate-300 mb-2" />
                    No notifications right now
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => handleNotifClick(n)}
                      className={`flex gap-3 px-4 py-3 cursor-pointer transition text-xs ${
                        !n.read ? 'bg-indigo-50/40 hover:bg-indigo-50/70' : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="mt-0.5 shrink-0">
                        {n.type === 'absence_warning' ? (
                          <AlertTriangle className="h-4 w-4 text-amber-500" />
                        ) : n.type === 'salary_deduction' ? (
                          <FileText className="h-4 w-4 text-orange-600" />
                        ) : (
                          <Bell className="h-4 w-4 text-indigo-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className={`text-slate-900 ${!n.read ? 'font-bold' : 'font-medium'}`}>{n.title}</p>
                        <p className="text-slate-600 mt-0.5 line-clamp-2 text-[11px]">{n.message}</p>
                        <span className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      {!n.read && <span className="h-2 w-2 rounded-full bg-indigo-600 shrink-0 mt-1.5" />}
                    </div>
                  ))
                )}
              </div>

              <div className="border-t border-slate-100 bg-slate-50 px-4 py-2 text-center">
                <button
                  onClick={() => {
                    setShowNotifs(false);
                    setCurrentView(role === 'hr_admin' ? 'hr_notifications' : 'emp_notifications');
                  }}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-700"
                >
                  View all notifications →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Avatar */}
        <div className="relative">
          <button
            id="user-profile-menu-btn"
            onClick={() => {
              setShowUserMenu(!showUserMenu);
              setShowNotifs(false);
              setShowRoleSwitcher(false);
            }}
            className="flex items-center gap-2 rounded-full p-0.5 hover:ring-2 hover:ring-indigo-300 transition"
          >
            <img
              src={user?.profilePhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
              alt={user?.fullName || 'Avatar'}
              className="h-8 w-8 rounded-full object-cover ring-2 ring-indigo-500"
            />
            <ChevronDown className="h-3.5 w-3.5 text-slate-400 hidden sm:block" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-60 rounded-xl border border-slate-200 bg-white p-2 shadow-xl ring-1 ring-black/5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="border-b border-slate-100 px-3 py-2 mb-1">
                <p className="text-xs font-bold text-slate-900">{user?.fullName}</p>
                <p className="text-[11px] text-slate-500">{user?.email}</p>
                <div className="mt-1.5 inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
                  <span className="text-indigo-600 font-bold">{user?.employeeId}</span> • {user?.roleTitle}
                </div>
              </div>

              <button
                onClick={() => {
                  setShowUserMenu(false);
                  setCurrentView(role === 'hr_admin' ? 'hr_profile' : 'emp_profile');
                }}
                className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
              >
                <User className="h-4 w-4 text-slate-500" />
                <span>My Profile</span>
              </button>

              <button
                onClick={async () => {
                  setShowUserMenu(false);
                  await logout();
                }}
                className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-medium text-red-600 hover:bg-red-50 transition"
              >
                <LogOut className="h-4 w-4 text-red-500" />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
