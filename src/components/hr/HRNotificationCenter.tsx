import React, { useState, useEffect } from 'react';
import {
  BellRing,
  Megaphone,
  Mail,
  Send,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  UserCheck,
  Eye,
} from 'lucide-react';
import { Notification, EmailMessage } from '../../types';
import { api } from '../../api';

interface HRNotificationCenterProps {
  onOpenEmails: () => void;
}

export const HRNotificationCenter: React.FC<HRNotificationCenterProps> = ({ onOpenEmails }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [emails, setEmails] = useState<EmailMessage[]>([]);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [nList, eList] = await Promise.all([api.getNotifications(), api.getEmails()]);
      setNotifications(nList);
      setEmails(eList);
    } catch (e) {
      console.error(e);
    }
  };

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    setSubmitting(true);
    try {
      await api.broadcastNotification({ title, message });
      setTitle('');
      setMessage('');
      setSuccessMsg('Announcement broadcasted to all active company employees!');
      setTimeout(() => setSuccessMsg(null), 4000);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to broadcast announcement.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 sm:text-2xl flex items-center gap-2">
            <BellRing className="h-6 w-6 text-blue-600" />
            Communications & Notification Hub
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Broadcast organization announcements and inspect system notification logs.
          </p>
        </div>

        <button
          onClick={onOpenEmails}
          className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-slate-800 transition"
        >
          <Mail className="h-4 w-4 text-blue-400" />
          <span>Inspect Email Outbox ({emails.length})</span>
        </button>
      </div>

      {successMsg && (
        <div className="flex items-center gap-2.5 rounded-xl bg-emerald-50 border border-emerald-200 p-3.5 text-xs text-emerald-800 animate-in fade-in">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Broadcast Announcement Form */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
          <Megaphone className="h-4 w-4 text-blue-600" />
          <h2 className="text-sm font-bold text-slate-900">Broadcast Company-Wide Announcement</h2>
        </div>

        <form onSubmit={handleBroadcast} className="space-y-3 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Announcement Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Q3 Company Town Hall & Policy Updates"
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Message Content *</label>
            <textarea
              rows={3}
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter announcement details for all employees..."
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2 font-bold text-white shadow-md hover:bg-blue-700 transition disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
              <span>{submitting ? 'Broadcasting...' : 'Broadcast to All Staff'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Notifications Stream */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
          <h2 className="text-sm font-bold text-slate-900">Organization Notification Stream</h2>
          <span className="text-xs text-slate-400">{notifications.length} total events</span>
        </div>

        <div className="divide-y divide-slate-100">
          {notifications.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">No notifications logged.</div>
          ) : (
            notifications.map((n) => (
              <div key={n.id} className="py-3.5 flex items-start gap-3 text-xs">
                <div className="mt-0.5 shrink-0">
                  {n.type === 'absence_warning' ? (
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                  ) : n.type === 'salary_deduction' ? (
                    <FileText className="h-4 w-4 text-red-500" />
                  ) : (
                    <BellRing className="h-4 w-4 text-blue-500" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900">{n.title}</span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(n.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-slate-600 mt-0.5">{n.message}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
