import React, { useState } from 'react';
import {
  UserCircle2,
  ShieldCheck,
  Mail,
  Phone,
  Save,
  CheckCircle2,
  Building,
  KeyRound,
  Cpu,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api';

export const HRProfile: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [email, setEmail] = useState(user?.email || '');
  const [contactNumber, setContactNumber] = useState(user?.contactNumber || '');
  const [profilePhoto, setProfilePhoto] = useState(user?.profilePhoto || '');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);
    try {
      await api.updateEmployee(user.id, { email, contactNumber, profilePhoto });
      await refreshUser();
      setSuccessMsg('Administrator profile saved successfully!');
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      alert(err.message || 'Failed to update admin profile.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 sm:text-2xl flex items-center gap-2">
          <UserCircle2 className="h-6 w-6 text-blue-600" />
          HR Administrator Profile & System Governance
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Manage your executive credentials, administrative role permissions, and company governance profile.
        </p>
      </div>

      {successMsg && (
        <div className="flex items-center gap-2.5 rounded-xl bg-emerald-50 border border-emerald-200 p-3.5 text-xs text-emerald-800 animate-in fade-in">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Admin Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col sm:flex-row items-center gap-6">
        <img
          src={profilePhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
          alt={user?.fullName}
          className="h-20 w-20 rounded-full object-cover ring-4 ring-indigo-500/20 shadow-md"
        />
        <div className="text-center sm:text-left text-xs">
          <div className="flex items-center gap-2 justify-center sm:justify-start">
            <h2 className="text-base font-bold text-slate-900">{user?.fullName}</h2>
            <span className="rounded bg-indigo-100 px-2 py-0.5 text-[10px] font-bold text-indigo-700">
              HR / Admin Role
            </span>
          </div>
          <p className="text-slate-500 mt-0.5">{user?.roleTitle} • Human Resources Department</p>
          <div className="mt-2 flex flex-wrap gap-2 justify-center sm:justify-start">
            <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-mono text-slate-700">
              Employee ID: {user?.employeeId}
            </span>
            <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 flex items-center gap-1">
              <ShieldCheck className="h-3 w-3" /> Full Administrative Authority
            </span>
          </div>
        </div>
      </div>

      {/* Profile Form */}
      <form onSubmit={handleSave} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900">Administrator Contact Details</h3>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Official Email</label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2 text-xs focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
            <div className="relative">
              <Phone className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                required
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
                className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2 text-xs focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-blue-700 transition disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            <span>{submitting ? 'Saving...' : 'Save Admin Details'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
