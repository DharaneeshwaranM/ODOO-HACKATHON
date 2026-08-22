import React, { useState } from 'react';
import { AuthUser, Employee, Department, CreateMemberPayload, EmploymentType, AccountStatus } from '../types';
import { AuthService } from '../services/authService';
import { WelcomeEmailModal } from './WelcomeEmailModal';
import { 
  UserPlus, 
  X, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  Building2, 
  Briefcase, 
  Mail, 
  Phone, 
  Lock, 
  User, 
  Calendar, 
  MapPin, 
  Sparkles, 
  ShieldAlert,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Send,
  ExternalLink
} from 'lucide-react';

interface AddMemberModalProps {
  currentUser: AuthUser;
  departments: Department[];
  employees: Employee[];
  onClose: () => void;
  onMemberCreated: (newEmployee: Employee, auditDetails: string, initialPass?: string) => void;
}

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
];

export const AddMemberModal: React.FC<AddMemberModalProps> = ({
  currentUser,
  departments,
  employees,
  onClose,
  onMemberCreated,
}) => {
  // Suggest next ID
  const nextIdNumber = 1000 + employees.length + 1;
  const suggestedEmpId = `EMP-${nextIdNumber}`;

  // Form State
  const [fullName, setFullName] = useState('');
  const [employeeId, setEmployeeId] = useState(suggestedEmpId);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+1 (555) ');
  const [selectedDeptId, setSelectedDeptId] = useState<number>(departments[0]?.id || 1);
  const [jobPosition, setJobPosition] = useState('');
  const [manager, setManager] = useState(departments[0]?.managerName || 'Clara Oswald');
  const [dateOfJoining, setDateOfJoining] = useState(new Date().toISOString().split('T')[0]);
  const [employmentType, setEmploymentType] = useState<EmploymentType>('Full-time');
  const [workLocation, setWorkLocation] = useState('Headquarters - SF');
  const [password, setPassword] = useState('password123');
  const [confirmPassword, setConfirmPassword] = useState('password123');
  const [profilePhoto, setProfilePhoto] = useState(PRESET_AVATARS[0]);
  const [accountStatus, setAccountStatus] = useState<AccountStatus>('active');

  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [createdSuccess, setCreatedSuccess] = useState<Employee | null>(null);
  const [showWelcomePreview, setShowWelcomePreview] = useState(false);

  // Auto-generate username & email when typing full name
  const handleNameChange = (val: string) => {
    setFullName(val);
    if (!username || username === fullName.toLowerCase().replace(/\s+/g, '.')) {
      const generated = val.toLowerCase().replace(/[^a-z0-9]/g, '.').replace(/\.+/g, '.').replace(/^\.|\.$/g, '');
      setUsername(generated);
      setEmail(generated ? `${generated}@dayflow.demo` : '');
    }
  };

  // Department change
  const handleDeptChange = (deptId: number) => {
    setSelectedDeptId(deptId);
    const dept = departments.find(d => d.id === deptId);
    if (dept) {
      setManager(dept.managerName);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    setGlobalError(null);

    // Get selected department name
    const dept = departments.find(d => d.id === selectedDeptId);
    const deptName = dept ? dept.name : 'Engineering';

    const payload: CreateMemberPayload = {
      name: fullName,
      employeeId,
      username,
      email,
      phone,
      departmentId: selectedDeptId,
      departmentName: deptName,
      jobPosition,
      manager,
      dateOfJoining,
      employmentType,
      workLocation,
      password,
      confirmPassword,
      profilePhoto,
      accountStatus,
    };

    setIsSubmitting(true);

    // Call server-side RBAC validation and creation engine
    setTimeout(() => {
      const result = AuthService.createEmployeeMember(currentUser, payload, employees);
      setIsSubmitting(false);

      if (!result.success) {
        if (result.status === 403) {
          setGlobalError(result.error || '403 Forbidden: Unauthorized access.');
        } else if (result.fieldErrors) {
          setFieldErrors(result.fieldErrors);
          setGlobalError(result.error || 'Please correct the highlighted errors.');
        } else {
          setGlobalError(result.error || 'Failed to create employee member.');
        }
        return;
      }

      if (result.newEmployee) {
        setCreatedSuccess(result.newEmployee);
        onMemberCreated(
          result.newEmployee,
          `Employee ${result.newEmployee.name} (${result.newEmployee.badgeId}) created with role [Employee]. Automated Welcome Email dispatched to ${result.newEmployee.email}.`,
          password
        );
      }
    }, 450);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white text-slate-900 rounded-xl max-w-3xl w-full my-6 shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-base text-white tracking-tight">Add New Workforce Member</h2>
                <span className="text-[10px] px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800 font-mono">
                  HR Admin Only
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Create employee profile, link Odoo <code className="font-mono text-slate-300">res.users</code> login, and assign Employee role
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

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Security Banner */}
          <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-900 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong className="font-semibold block">Role-Based Access Control Enforced:</strong>
              <span>
                Authenticated as <strong>{currentUser.name}</strong> ({currentUser.jobTitle}). New accounts are locked strictly to the <strong>Employee</strong> security group (<code className="font-mono text-blue-800">dayflow_ai.group_dayflow_employee</code>).
              </span>
            </div>
          </div>

          {/* Error Banner */}
          {globalError && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-semibold block">Validation &amp; Security Notice:</strong>
                <span>{globalError}</span>
              </div>
            </div>
          )}

          {/* Success State Screen */}
          {createdSuccess ? (
            <div className="py-6 text-center space-y-5">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">Employee Created Successfully!</h3>
                <p className="text-sm text-slate-500 mt-1">
                  Profile registered in Odoo <code className="font-mono text-blue-700">hr.employee</code> &amp; login credentials active.
                </p>
              </div>

              {/* Summary Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 max-w-md mx-auto text-left space-y-3">
                <div className="flex items-center gap-3 pb-3 border-b border-slate-200">
                  <img
                    src={createdSuccess.avatar}
                    alt={createdSuccess.name}
                    className="w-12 h-12 rounded-full object-cover border border-slate-300"
                  />
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{createdSuccess.name}</h4>
                    <p className="text-xs text-slate-500">{createdSuccess.jobTitle} • {createdSuccess.departmentName}</p>
                    <span className="inline-block mt-0.5 text-[10px] px-2 py-0.2 rounded font-bold uppercase bg-blue-100 text-blue-700">
                      Role: Employee
                    </span>
                  </div>
                </div>

                <div className="text-xs space-y-1.5 text-slate-600 font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Employee ID:</span>
                    <strong className="text-slate-900">{createdSuccess.badgeId}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Username:</span>
                    <strong className="text-slate-900">{createdSuccess.username}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Password:</span>
                    <strong className="text-slate-900">{password}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Joining Date:</span>
                    <span className="text-slate-900">{createdSuccess.dateOfJoining}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Audit Status:</span>
                    <span className="text-emerald-700 font-semibold">Logged in Odoo Audit Trail</span>
                  </div>
                </div>

                {/* Automated Notification Trigger Status */}
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-start gap-2 text-xs text-emerald-900">
                  <Mail className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="leading-snug">
                    <div className="font-bold flex items-center gap-1.5">
                      <span>Automated 'Welcome to Team' Email Dispatched!</span>
                      <span className="text-[10px] px-1.5 py-0.2 bg-emerald-200 text-emerald-800 rounded font-mono font-bold">250 OK</span>
                    </div>
                    <p className="text-slate-600 text-[11px] mt-0.5">
                      Sent to <strong>{createdSuccess.email}</strong> with initial login credentials &amp; onboarding packet.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowWelcomePreview(true)}
                  className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 rounded-lg transition cursor-pointer"
                >
                  <Mail className="w-4 h-4 text-blue-600" />
                  <span>View Welcome Email Sent</span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition cursor-pointer"
                >
                  Close &amp; View in Employees List
                </button>
              </div>
            </div>
          ) : (
            /* Creation Form */
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* SECTION 1: Personal & Identification Details */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                  <User className="w-4 h-4 text-blue-600" />
                  <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700">
                    1. Personal &amp; Identification Details
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={e => handleNameChange(e.target.value)}
                      placeholder="e.g. Robert Lang"
                      required
                      className={`w-full px-3.5 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                        fieldErrors.name ? 'border-red-400 bg-red-50' : 'border-slate-300'
                      }`}
                    />
                    {fieldErrors.name && <p className="text-[11px] text-red-600 mt-1">{fieldErrors.name}</p>}
                  </div>

                  {/* Employee ID */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Employee ID <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={employeeId}
                      onChange={e => setEmployeeId(e.target.value)}
                      placeholder="e.g. EMP-1045"
                      required
                      className={`w-full px-3.5 py-2 text-sm border font-mono font-medium rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                        fieldErrors.employeeId ? 'border-red-400 bg-red-50' : 'border-slate-300'
                      }`}
                    />
                    {fieldErrors.employeeId && <p className="text-[11px] text-red-600 mt-1">{fieldErrors.employeeId}</p>}
                  </div>

                  {/* Username */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Username <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={username}
                      onChange={e => setUsername(e.target.value)}
                      placeholder="e.g. robert.lang"
                      required
                      className={`w-full px-3.5 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                        fieldErrors.username ? 'border-red-400 bg-red-50' : 'border-slate-300'
                      }`}
                    />
                    {fieldErrors.username && <p className="text-[11px] text-red-600 mt-1">{fieldErrors.username}</p>}
                  </div>

                  {/* Profile Photo Preset Picker */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Profile Avatar
                    </label>
                    <div className="flex items-center gap-2">
                      {PRESET_AVATARS.slice(0, 5).map((url, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setProfilePhoto(url)}
                          className={`w-8 h-8 rounded-full overflow-hidden border-2 transition cursor-pointer ${
                            profilePhoto === url ? 'border-blue-600 ring-2 ring-blue-300' : 'border-slate-200 opacity-60 hover:opacity-100'
                          }`}
                        >
                          <img src={url} alt="preset" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 2: Organization & Work Details */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                  <Briefcase className="w-4 h-4 text-blue-600" />
                  <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700">
                    2. Organization &amp; Job Details
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Department */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Department <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={selectedDeptId}
                      onChange={e => handleDeptChange(Number(e.target.value))}
                      className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                    >
                      {departments.map(d => (
                        <option key={d.id} value={d.id}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Job Position */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Job Position <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={jobPosition}
                      onChange={e => setJobPosition(e.target.value)}
                      placeholder="e.g. Senior Backend Engineer"
                      required
                      className={`w-full px-3.5 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                        fieldErrors.jobPosition ? 'border-red-400 bg-red-50' : 'border-slate-300'
                      }`}
                    />
                    {fieldErrors.jobPosition && <p className="text-[11px] text-red-600 mt-1">{fieldErrors.jobPosition}</p>}
                  </div>

                  {/* Manager */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Reporting Manager
                    </label>
                    <input
                      type="text"
                      value={manager}
                      onChange={e => setManager(e.target.value)}
                      placeholder="e.g. Clara Oswald"
                      className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                    </input>
                  </div>

                  {/* Date of Joining */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Date of Joining <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={dateOfJoining}
                      onChange={e => setDateOfJoining(e.target.value)}
                      required
                      className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  {/* Employment Type */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Employment Type
                    </label>
                    <select
                      value={employmentType}
                      onChange={e => setEmploymentType(e.target.value as EmploymentType)}
                      className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                    >
                      <option value="Full-time">Full-time</option>
                      <option value="Part-time">Part-time</option>
                      <option value="Contract">Contract</option>
                      <option value="Intern">Intern</option>
                    </select>
                  </div>

                  {/* Work Location */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Work Location
                    </label>
                    <select
                      value={workLocation}
                      onChange={e => setWorkLocation(e.target.value)}
                      className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                    >
                      <option value="Headquarters - SF">Headquarters - SF</option>
                      <option value="Remote - USA">Remote - USA</option>
                      <option value="London Tech Hub">London Tech Hub</option>
                      <option value="Singapore Office">Singapore Office</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* SECTION 3: Authentication, Contact & Credentials */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                  <Lock className="w-4 h-4 text-blue-600" />
                  <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700">
                    3. Contact Information &amp; Login Credentials
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Email */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Work Email <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="e.g. robert.lang@dayflow.demo"
                        required
                        className={`w-full pl-9 pr-3.5 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                          fieldErrors.email ? 'border-red-400 bg-red-50' : 'border-slate-300'
                        }`}
                      />
                    </div>
                    {fieldErrors.email && <p className="text-[11px] text-red-600 mt-1">{fieldErrors.email}</p>}
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        placeholder="+1 (555) 492-8812"
                        required
                        className={`w-full pl-9 pr-3.5 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                          fieldErrors.phone ? 'border-red-400 bg-red-50' : 'border-slate-300'
                        }`}
                      />
                    </div>
                    {fieldErrors.phone && <p className="text-[11px] text-red-600 mt-1">{fieldErrors.phone}</p>}
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Initial Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="Min 6 characters"
                        required
                        className={`w-full pl-9 pr-10 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                          fieldErrors.password ? 'border-red-400 bg-red-50' : 'border-slate-300'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {fieldErrors.password && <p className="text-[11px] text-red-600 mt-1">{fieldErrors.password}</p>}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Confirm Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter password"
                        required
                        className={`w-full pl-9 pr-3.5 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                          fieldErrors.confirmPassword ? 'border-red-400 bg-red-50' : 'border-slate-300'
                        }`}
                      />
                    </div>
                    {fieldErrors.confirmPassword && (
                      <p className="text-[11px] text-red-600 mt-1">{fieldErrors.confirmPassword}</p>
                    )}
                  </div>

                  {/* Account Status */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Account Status
                    </label>
                    <select
                      value={accountStatus}
                      onChange={e => setAccountStatus(e.target.value as AccountStatus)}
                      className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                    >
                      <option value="active">Active (Full Access)</option>
                      <option value="onboarding">Onboarding (Pending Setup)</option>
                      <option value="probation">Probationary Period</option>
                    </select>
                  </div>

                  {/* Assigned System Role (Locked) */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Assigned Security Role <span className="text-slate-400 font-normal">(System Locked)</span>
                    </label>
                    <div className="px-3.5 py-2 text-xs bg-slate-100 border border-slate-200 rounded-lg text-slate-700 font-medium flex items-center justify-between">
                      <span className="font-mono text-blue-700 font-semibold">Employee (group_dayflow_employee)</span>
                      <span className="text-[10px] px-1.5 py-0.2 bg-blue-100 text-blue-800 rounded font-bold">Standard</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 text-xs font-bold bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg shadow-sm transition flex items-center gap-2 cursor-pointer uppercase tracking-wider"
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      <span>Saving Member...</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      <span>Save Member</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Welcome Email Preview Modal */}
      {showWelcomePreview && createdSuccess && (
        <WelcomeEmailModal
          employee={createdSuccess}
          initialPassword={password}
          onClose={() => setShowWelcomePreview(false)}
        />
      )}
    </div>
  );
};
