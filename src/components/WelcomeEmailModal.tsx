import React, { useState } from 'react';
import { Employee } from '../types';
import { WelcomeEmailTemplate } from './WelcomeEmailTemplate';
import { 
  Mail, 
  X, 
  CheckCircle2, 
  Send, 
  ShieldCheck, 
  Calendar, 
  Building2, 
  User, 
  Copy, 
  ExternalLink,
  Sparkles,
  Server,
  KeyRound,
  Check
} from 'lucide-react';

interface WelcomeEmailModalProps {
  employee: Employee;
  initialPassword?: string;
  onClose: () => void;
  onResend?: () => void;
}

export const WelcomeEmailModal: React.FC<WelcomeEmailModalProps> = ({
  employee,
  initialPassword = 'password123',
  onClose,
  onResend,
}) => {
  const [resending, setResending] = useState(false);
  const [resentSuccess, setResentSuccess] = useState(false);

  const handleTriggerResend = () => {
    setResending(true);
    setTimeout(() => {
      setResending(false);
      setResentSuccess(true);
      if (onResend) onResend();
      setTimeout(() => setResentSuccess(false), 3000);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white text-slate-900 rounded-2xl max-w-3xl w-full my-6 shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-950 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-linear-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-base text-white tracking-tight">Automated Welcome Email Template</h2>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono font-medium">
                  SMTP 250 OK
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Triggered automatically upon employee record creation in <code className="font-mono text-slate-300">hr.employee</code>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Email Metadata Header Bar */}
        <div className="bg-slate-50 p-4 border-b border-slate-200 text-xs space-y-1.5 font-mono">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-600">
              <span className="font-bold text-slate-500 uppercase text-[10px] w-14">From:</span>
              <span className="text-slate-800">Dayflow HR Operations &lt;onboarding@dayflow.demo&gt;</span>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded text-[10px] font-bold uppercase font-sans">
              <CheckCircle2 className="w-3 h-3" />
              <span>Delivered</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-slate-600">
            <span className="font-bold text-slate-500 uppercase text-[10px] w-14">To:</span>
            <span className="font-bold text-blue-700 underline">{employee.name} &lt;{employee.email}&gt;</span>
          </div>

          <div className="flex items-center gap-2 text-slate-600">
            <span className="font-bold text-slate-500 uppercase text-[10px] w-14">Subject:</span>
            <span className="font-semibold text-slate-900">Welcome to the Dayflow Team, {employee.name}! 🎉 [Onboarding &amp; Credentials]</span>
          </div>

          <div className="flex items-center justify-between text-slate-400 text-[11px] pt-1 border-t border-slate-200/80">
            <span>Relay: mail.dayflow.internal:587 (TLSv1.3 Encrypted)</span>
            <span>Trigger Event: <code className="text-slate-600 font-bold">auth.member.created</code></span>
          </div>
        </div>

        {/* Main Body: Fully Styled Responsive Email Template */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-100/70 font-sans space-y-4">
          <WelcomeEmailTemplate
            employee={employee}
            initialPassword={initialPassword}
            loginUrl="https://dayflow.demo/login"
            companyName="Dayflow AI Inc."
            senderName="Dayflow People Operations & HR Team"
            senderEmail="onboarding@dayflow.demo"
            onSendSimulation={handleTriggerResend}
          />
        </div>

        {/* Modal Footer Controls */}
        <div className="px-6 py-3.5 bg-white border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-500">
            <Server className="w-4 h-4 text-emerald-600" />
            <span>Automated SMTP Notification Trigger logged in system audit trail</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleTriggerResend}
              disabled={resending}
              className="flex items-center gap-1.5 px-3.5 py-1.5 font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer transition"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{resending ? 'Dispatching...' : resentSuccess ? 'Dispatched!' : 'Simulate Resend'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-5 py-1.5 font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-lg cursor-pointer transition"
            >
              Close Template
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
