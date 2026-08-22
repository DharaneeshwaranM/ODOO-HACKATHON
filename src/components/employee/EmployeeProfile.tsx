import React, { useState } from 'react';
import {
  UserCircle2,
  Lock,
  Mail,
  Phone,
  Camera,
  Save,
  CheckCircle2,
  AlertCircle,
  Building,
  Briefcase,
  ShieldAlert,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api';

export const EmployeeProfile: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [email, setEmail] = useState(user?.email || '');
  const [contactNumber, setContactNumber] = useState(user?.contactNumber || '');
  const [profilePhoto, setProfilePhoto] = useState(user?.profilePhoto || '');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!email.trim() || !contactNumber.trim()) {
      setErrorMsg('Please fill in all permitted contact fields.');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);
    try {
      await api.updateEmployee(user.id, {
        email,
        contactNumber,
        profilePhoto,
      });
      await refreshUser();
      setSuccessMsg('Profile contact info and photo updated successfully!');
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update profile.');
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
          My Profile & Account Settings
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          View your organizational credentials and manage your permitted personal contact details.
        </p>
      </div>

      {successMsg && (
        <div className="flex items-center gap-2.5 rounded-xl bg-emerald-50 border border-emerald-200 p-3.5 text-xs text-emerald-800 animate-in fade-in">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="flex items-center gap-2.5 rounded-xl bg-red-50 border border-red-200 p-3.5 text-xs text-red-800 animate-in fade-in">
          <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Profile Avatar Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <h2 className="text-sm font-bold text-slate-900 mb-4">Profile Photo (Permitted Edit)</h2>
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative group">
              <img
                src={profilePhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                alt={user?.fullName}
                className="h-24 w-24 rounded-full object-cover ring-4 ring-slate-100 shadow-md"
              />
              <label
                htmlFor="photo-upload-input"
                className="absolute inset-0 flex items-center justify-center rounded-full bg-slate-900/60 text-white opacity-0 group-hover:opacity-100 transition cursor-pointer"
              >
                <Camera className="h-6 w-6" />
              </label>
              <input
                id="photo-upload-input"
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </div>

            <div className="text-xs space-y-2 text-center sm:text-left">
              <p className="font-semibold text-slate-900">{user?.fullName}</p>
              <p className="text-slate-500">
                Click the avatar to upload a new profile image from your computer, or choose an avatar preset.
              </p>
              <div className="flex flex-wrap gap-2 pt-1 justify-center sm:justify-start">
                <button
                  type="button"
                  onClick={() => setProfilePhoto(`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.fullName}_1`)}
                  className="rounded-lg border border-slate-200 px-2 py-1 text-[11px] font-medium text-slate-600 hover:bg-slate-50"
                >
                  Generate Avatar 1
                </button>
                <button
                  type="button"
                  onClick={() => setProfilePhoto(`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.fullName}_2`)}
                  className="rounded-lg border border-slate-200 px-2 py-1 text-[11px] font-medium text-slate-600 hover:bg-slate-50"
                >
                  Generate Avatar 2
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Permitted Contact Info Editor */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900">Personal Contact Details (Editable by You)</h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Official / Primary Email *</label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Contact Phone Number *</label>
              <div className="relative">
                <Phone className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Locked Organization Fields (Strict Security Gate) */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-slate-500" />
              <h2 className="text-sm font-bold text-slate-900">Company Record (HR Admin Locked)</h2>
            </div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider bg-slate-200 px-2 py-0.5 rounded">
              Read-Only
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 text-xs text-slate-600">
            <div>
              <span className="text-[10px] uppercase font-semibold text-slate-400 block">Full Name</span>
              <span className="font-bold text-slate-900 block mt-0.5">{user?.fullName}</span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-semibold text-slate-400 block">Employee ID</span>
              <span className="font-mono font-bold text-blue-700 block mt-0.5">{user?.employeeId}</span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-semibold text-slate-400 block">Department</span>
              <span className="font-bold text-slate-900 block mt-0.5">{user?.department}</span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-semibold text-slate-400 block">Role / Designation</span>
              <span className="font-bold text-slate-900 block mt-0.5">{user?.roleTitle}</span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-semibold text-slate-400 block">Monthly Base Salary</span>
              <span className="font-bold text-slate-900 block mt-0.5">
                ₹{(user?.monthlySalary || 0).toLocaleString()}
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-semibold text-slate-400 block">Reporting Manager</span>
              <span className="font-bold text-slate-900 block mt-0.5">
                {user?.reportingManagerName || 'Executive Leadership'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-blue-700 transition disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            <span>{submitting ? 'Saving Profile...' : 'Save Contact Updates'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
