import React, { useState } from 'react';
import { Employee, Department, AuthUser } from '../types';
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter, 
  Building2, 
  ShieldAlert, 
  FileText, 
  Edit3, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Mail, 
  Phone, 
  Calendar, 
  MapPin, 
  ChevronRight,
  ShieldCheck,
  Sparkles,
  X
} from 'lucide-react';

interface EmployeeManagementViewProps {
  employees: Employee[];
  departments: Department[];
  currentUser: AuthUser;
  onOpenAddMember: () => void;
  onSelectEmployee: (emp: Employee) => void;
  onGeneratePayslip: (emp: Employee) => void;
  onUpdateEmployee: (updated: Employee) => void;
}

export const EmployeeManagementView: React.FC<EmployeeManagementViewProps> = ({
  employees,
  departments,
  currentUser,
  onOpenAddMember,
  onSelectEmployee,
  onGeneratePayslip,
  onUpdateEmployee,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');

  // Edit Modal state
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [editJobTitle, setEditJobTitle] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editDeptName, setEditDeptName] = useState('');
  const [editManager, setEditManager] = useState('');
  const [editStatus, setEditStatus] = useState<any>('active');

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = 
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.badgeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.jobTitle.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDept = selectedDept === 'All' || emp.departmentName === selectedDept;
    const matchesStatus = selectedStatus === 'All' || (emp.accountStatus || 'active') === selectedStatus;

    return matchesSearch && matchesDept && matchesStatus;
  });

  const handleOpenEdit = (emp: Employee) => {
    setEditingEmployee(emp);
    setEditJobTitle(emp.jobTitle);
    setEditPhone(emp.phone || '');
    setEditDeptName(emp.departmentName);
    setEditManager(emp.managerName || 'Clara Oswald');
    setEditStatus(emp.accountStatus || 'active');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEmployee) return;

    const matchedDept = departments.find(d => d.name === editDeptName);
    const updated: Employee = {
      ...editingEmployee,
      jobTitle: editJobTitle,
      phone: editPhone,
      departmentName: editDeptName,
      departmentId: matchedDept ? matchedDept.id : editingEmployee.departmentId,
      managerName: editManager,
      accountStatus: editStatus,
    };

    onUpdateEmployee(updated);
    setEditingEmployee(null);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Action Header */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Odoo HR Directory</span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono font-medium">
              Model: hr.employee
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Workforce Members &amp; Employee Roster</span>
            <span className="text-sm px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold">
              {employees.length} Staff
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage employee records, security group linkage, personal profiles, and organizational designations
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* HR-Only Add Member Button */}
          <button
            onClick={onOpenAddMember}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm transition cursor-pointer uppercase tracking-wider"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Add Member</span>
          </button>
        </div>
      </div>

      {/* Quick Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
            <span>Total Members</span>
            <Users className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{employees.length}</div>
          <p className="text-[11px] text-slate-500 mt-0.5">Across {departments.length} departments</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
            <span>Active Status</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-emerald-600">
            {employees.filter(e => (e.accountStatus || 'active') === 'active').length}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">Full portal access</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
            <span>Onboarding / Probation</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-amber-600">
            {employees.filter(e => (e.accountStatus || 'active') !== 'active').length}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">Initial 90-day review</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
            <span>High Risk Monitored</span>
            <ShieldAlert className="w-4 h-4 text-red-500" />
          </div>
          <div className="text-2xl font-bold text-red-600">
            {employees.filter(e => e.riskScore >= 70).length}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">Retention action flagged</p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-[260px]">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search by name, ID (EMP-XXXX), title, email..."
              className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Department Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedDept}
              onChange={e => setSelectedDept(e.target.value)}
              className="px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">All Departments ({departments.length})</option>
              {departments.map(d => (
                <option key={d.id} value={d.name}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
            className="px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="All">All Statuses</option>
            <option value="active">Active</option>
            <option value="onboarding">Onboarding</option>
            <option value="probation">Probation</option>
          </select>
        </div>
      </div>

      {/* Main Employee Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Employee</th>
                <th className="py-3.5 px-4">Employee ID</th>
                <th className="py-3.5 px-4">Department &amp; Title</th>
                <th className="py-3.5 px-4">Contact Info</th>
                <th className="py-3.5 px-4">Joining Date</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Risk Tier</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No employees matching filter criteria.
                  </td>
                </tr>
              ) : (
                filteredEmployees.map(emp => {
                  const status = emp.accountStatus || 'active';
                  return (
                    <tr key={emp.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Name & Avatar */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={emp.avatar}
                            alt={emp.name}
                            className="w-9 h-9 rounded-full object-cover border border-slate-200"
                          />
                          <div>
                            <div className="font-bold text-slate-900">{emp.name}</div>
                            <div className="text-[11px] text-slate-400">{emp.username || emp.email.split('@')[0]}</div>
                          </div>
                        </div>
                      </td>

                      {/* Employee ID */}
                      <td className="py-3 px-4 font-mono font-bold text-slate-700">
                        {emp.badgeId}
                      </td>

                      {/* Department & Title */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800">{emp.jobTitle}</div>
                        <div className="text-[11px] text-blue-600 flex items-center gap-1">
                          <Building2 className="w-3 h-3" />
                          <span>{emp.departmentName}</span>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="py-3 px-4">
                        <div className="text-slate-600 flex items-center gap-1">
                          <Mail className="w-3 h-3 text-slate-400" />
                          <span>{emp.email}</span>
                        </div>
                        <div className="text-slate-500 text-[11px] flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{emp.phone || '+1 (555) 000-0000'}</span>
                        </div>
                      </td>

                      {/* Joining Date */}
                      <td className="py-3 px-4 text-slate-600">
                        {emp.dateOfJoining || '2024-03-15'}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          status === 'active'
                            ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                            : status === 'onboarding'
                            ? 'bg-blue-100 text-blue-700 border border-blue-200'
                            : 'bg-amber-100 text-amber-700 border border-amber-200'
                        }`}>
                          {status}
                        </span>
                      </td>

                      {/* Risk Tier */}
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          emp.riskScore >= 70
                            ? 'bg-red-100 text-red-700 border border-red-200'
                            : emp.riskScore >= 40
                            ? 'bg-orange-100 text-orange-700 border border-orange-200'
                            : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                        }`}>
                          <span>Score {emp.riskScore}</span>
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(emp)}
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded transition cursor-pointer"
                            title="Edit Employee Info"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => onSelectEmployee(emp)}
                            className="p-1.5 text-slate-500 hover:text-orange-600 hover:bg-orange-50 rounded transition cursor-pointer"
                            title="View Risk & Retention Analysis"
                          >
                            <ShieldAlert className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => onGeneratePayslip(emp)}
                            className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded transition cursor-pointer"
                            title="View QWeb Payslip"
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Employee Modal */}
      {editingEmployee && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <img
                  src={editingEmployee.avatar}
                  alt={editingEmployee.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Edit Employee Information</h3>
                  <p className="text-xs text-slate-500">{editingEmployee.name} ({editingEmployee.badgeId})</p>
                </div>
              </div>
              <button
                onClick={() => setEditingEmployee(null)}
                className="w-7 h-7 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Job Position / Title</label>
                <input
                  type="text"
                  value={editJobTitle}
                  onChange={e => setEditJobTitle(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Department</label>
                  <select
                    value={editDeptName}
                    onChange={e => setEditDeptName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
                  >
                    {departments.map(d => (
                      <option key={d.id} value={d.name}>{d.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Account Status</label>
                  <select
                    value={editStatus}
                    onChange={e => setEditStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
                  >
                    <option value="active">Active</option>
                    <option value="onboarding">Onboarding</option>
                    <option value="probation">Probation</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Reporting Manager</label>
                <input
                  type="text"
                  value={editManager}
                  onChange={e => setEditManager(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={editPhone}
                  onChange={e => setEditPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingEmployee(null)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
