import React, { useState, useEffect } from 'react';
import { BellRing, Mail, CheckCircle2, AlertTriangle, FileText, Clock } from 'lucide-react';
import { Notification } from '../../types';
import { api } from '../../api';

interface EmployeeNotificationsProps {
  onOpenEmails: () => void;
}

export const EmployeeNotifications: React.FC<EmployeeNotificationsProps> = ({ onOpenEmails }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifs();
  }, []);

  const loadNotifs = async () => {
    setLoading(true);
    try {
      const list = await api.getNotifications();
      setNotifications(list);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      await api.markNotificationRead(id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    } catch (e) {
      // ignore
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 sm:text-2xl flex items-center gap-2">
            <BellRing className="h-6 w-6 text-blue-600" />
            Notifications & Corporate Messages
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            System alerts regarding your attendance, leave applications, and HR announcements.
          </p>
        </div>

        <button
          onClick={onOpenEmails}
          className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-slate-800 transition"
        >
          <Mail className="h-4 w-4 text-blue-400" />
          <span>View Transactional Emails</span>
        </button>
      </div>

      {/* List */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="divide-y divide-slate-100">
          {notifications.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              <CheckCircle2 className="mx-auto h-8 w-8 text-slate-300 mb-2" />
              You have no new notifications.
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => handleMarkRead(n.id)}
                className={`py-4 flex items-start gap-3.5 text-xs cursor-pointer transition rounded-xl px-2 ${
                  !n.read ? 'bg-blue-50/50' : 'hover:bg-slate-50'
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  {n.type === 'absence_warning' ? (
                    <AlertTriangle className="h-5 w-5 text-amber-500" />
                  ) : n.type === 'salary_deduction' ? (
                    <FileText className="h-5 w-5 text-red-500" />
                  ) : (
                    <BellRing className="h-5 w-5 text-blue-500" />
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className={`text-slate-900 text-sm ${!n.read ? 'font-bold' : 'font-semibold'}`}>
                      {n.title}
                    </span>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(n.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-slate-600 mt-1">{n.message}</p>
                </div>

                {!n.read && <span className="h-2 w-2 rounded-full bg-blue-600 shrink-0 mt-2" />}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
