import React, { useState } from 'react';
import { UserCheck, Mail, CheckCircle2, ShieldCheck, ArrowRight, Sparkles, Key } from 'lucide-react';

interface AuthDemoModalProps {
  onClose: () => void;
  onSuccessLogin: (name: string, role: 'hr' | 'employee') => void;
}

export const AuthDemoModal: React.FC<AuthDemoModalProps> = ({ onClose, onSuccessLogin }) => {
  const [step, setStep] = useState<'signup' | 'email_sent' | 'verified' | 'login'>('signup');
  const [name, setName] = useState('Elena Vance');
  const [email, setEmail] = useState('elena.vance@dayflow.demo');
  const [badgeId, setBadgeId] = useState('EMP-2045');
  const [role, setRole] = useState<'hr' | 'employee'>('employee');
  const [simulatedToken, setSimulatedToken] = useState('tok_8f9a2b7c4d1e603');

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    const token = 'tok_' + Math.random().toString(36).substring(2, 15);
    setSimulatedToken(token);
    setStep('email_sent');
  };

  const handleVerifyClick = () => {
    setStep('verified');
  };

  const handleFinishLogin = () => {
    onSuccessLogin(name, role);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-lg w-full shadow-2xl border border-slate-200 p-6 space-y-5 animate-in fade-in zoom-in duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-md bg-blue-600 flex items-center justify-center text-white font-bold">
              <UserCheck className="w-4 h-4" />
            </span>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Authentication &amp; Verification Flow</h3>
              <p className="text-xs text-slate-500 font-medium">Odoo 17 Token-Based Email Verification</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-md bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-between text-xs font-bold text-slate-400 border-b pb-3 border-slate-100">
          <span className={step === 'signup' ? 'text-blue-600' : 'text-slate-400'}>1. Register</span>
          <span>→</span>
          <span className={step === 'email_sent' ? 'text-blue-600' : 'text-slate-400'}>2. Email Token</span>
          <span>→</span>
          <span className={step === 'verified' || step === 'login' ? 'text-emerald-600' : 'text-slate-400'}>3. Verified Active</span>
        </div>

        {/* Stage 1: Registration Form */}
        {step === 'signup' && (
          <form onSubmit={handleRegister} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md focus:ring-2 focus:ring-blue-500 font-medium"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Work Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md focus:ring-2 focus:ring-blue-500 font-medium"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Employee Badge ID</label>
                <input
                  type="text"
                  value={badgeId}
                  onChange={e => setBadgeId(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md focus:ring-2 focus:ring-blue-500 font-mono"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Access Role</label>
                <select
                  value={role}
                  onChange={e => setRole(e.target.value as any)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md focus:ring-2 focus:ring-blue-500 font-medium"
                >
                  <option value="employee">Dayflow Employee</option>
                  <option value="hr">HR Administrator</option>
                </select>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-md text-xs text-slate-500 flex items-start gap-2 border border-slate-200">
              <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <span>
                Dayflow generates a secure, single-use cryptographic token with 24-hour expiration stored in Odoo ORM.
              </span>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-md shadow-sm transition-colors cursor-pointer"
            >
              Register Account &amp; Send Verification Email
            </button>
          </form>
        )}

        {/* Stage 2: Simulated Verification Email Sent */}
        {step === 'email_sent' && (
          <div className="space-y-4">
            <div className="p-4 rounded-md bg-blue-50 border border-blue-200 text-xs text-blue-950 space-y-2">
              <div className="flex items-center gap-2 font-bold text-blue-900">
                <Mail className="w-4 h-4 text-blue-600" />
                <span>Simulated QWeb Email Dispatch</span>
              </div>
              <p>
                A verification link has been dispatched to <strong>{email}</strong> via Odoo 17 Mail Template (<code className="font-mono text-blue-800">mail_template_email_verification</code>).
              </p>
            </div>

            {/* Email Mock Box */}
            <div className="p-4 rounded-md border border-slate-200 bg-white space-y-3 shadow-inner">
              <div className="text-xs text-slate-400 border-b pb-2">
                From: <strong>noreply@dayflow.ai</strong> • Subject: <strong>Verify your Dayflow AI Account</strong>
              </div>
              <p className="text-xs text-slate-700">
                Hello <strong>{name}</strong>, thank you for joining Dayflow AI. Click below to verify your email:
              </p>
              <div className="text-center py-2">
                <button
                  type="button"
                  onClick={handleVerifyClick}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-md shadow-sm transition-colors cursor-pointer"
                >
                  Verify My Email Address (Token: {simulatedToken.slice(0, 8)}...)
                </button>
              </div>
              <div className="text-[10px] text-slate-400 text-center font-mono">
                Token expires in 24 hours • Target URL: /web/signup/verify?token={simulatedToken}
              </div>
            </div>
          </div>
        )}

        {/* Stage 3: Verification Success */}
        {step === 'verified' && (
          <div className="space-y-4 text-center py-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-slate-900">Email Verified &amp; Account Activated!</h4>
              <p className="text-xs text-slate-500 mt-1">
                Your Odoo 17 user record is now activated (<code className="text-emerald-700 font-semibold">is_email_verified = True</code>).
              </p>
            </div>

            <button
              type="button"
              onClick={handleFinishLogin}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-md shadow-sm transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Sign In as {name} ({role.toUpperCase()})</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
