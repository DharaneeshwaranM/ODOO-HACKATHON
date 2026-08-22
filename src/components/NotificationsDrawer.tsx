import React from 'react';
import { WorkforceAlert } from '../types';
import { Bell, AlertTriangle, CheckCircle2, ShieldAlert, X, Mail, Sparkles, Send } from 'lucide-react';

interface NotificationsDrawerProps {
  alerts: WorkforceAlert[];
  onClose: () => void;
  onMarkAllRead: () => void;
  onSelectAlert?: (alert: WorkforceAlert) => void;
  onOpenWelcomeEmail?: (employeeId?: number) => void;
}

export const NotificationsDrawer: React.FC<NotificationsDrawerProps> = ({
  alerts,
  onClose,
  onMarkAllRead,
  onSelectAlert,
  onOpenWelcomeEmail,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex justify-end animate-in fade-in">
      <div className="bg-white w-full max-w-md h-full shadow-2xl border-l border-slate-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-blue-600" />
            <h3 className="font-bold text-slate-900 text-sm">System &amp; Onboarding Notifications</h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-semibold uppercase">
              {alerts.length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onMarkAllRead}
              className="text-xs text-blue-600 hover:text-blue-700 font-semibold cursor-pointer"
            >
              Mark all read
            </button>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-md bg-slate-200 hover:bg-slate-300 flex items-center justify-center text-slate-600 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* List of Alerts */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {alerts.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              No notifications at this time.
            </div>
          ) : (
            alerts.map(alert => {
              const isWelcomeEmail = alert.alertType === 'WELCOME_EMAIL_DISPATCHED' || alert.title.includes('Welcome Email');

              return (
                <div
                  key={alert.id}
                  className={`p-4 rounded-lg border transition-colors text-xs space-y-2 ${
                    isWelcomeEmail
                      ? 'border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50'
                      : alert.severity === 'critical' || alert.severity === 'high'
                      ? 'border-red-200 bg-red-50/40'
                      : 'border-slate-200 bg-white hover:bg-slate-50/70'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs leading-snug">
                      {isWelcomeEmail ? (
                        <Mail className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      ) : (
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      )}
                      <span>{alert.title}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono shrink-0">{alert.createdAt}</span>
                  </div>

                  <p className="text-slate-600 leading-relaxed">{alert.reason}</p>

                  {/* Metadata Pill */}
                  {alert.metadata?.emailTo && (
                    <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-500 bg-white/80 p-1.5 rounded border border-slate-200">
                      <Send className="w-3 h-3 text-emerald-600" />
                      <span>Recipient: <strong>{alert.metadata.emailTo}</strong></span>
                      <span className="text-emerald-700 font-bold ml-auto font-sans text-[10px] uppercase">Delivered</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-1">
                    <div className="text-blue-700 font-semibold flex items-start gap-1">
                      <span>Action:</span>
                      <span>{alert.recommendedAction}</span>
                    </div>

                    {isWelcomeEmail && onOpenWelcomeEmail && (
                      <button
                        type="button"
                        onClick={() => onOpenWelcomeEmail(alert.employeeId)}
                        className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-bold shrink-0 cursor-pointer shadow-xs transition"
                      >
                        View Email
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
