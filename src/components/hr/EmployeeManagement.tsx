import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  ArrowUpDown,
  Edit2,
  Eye,
  UserX,
  UserCheck,
  Mail,
  Phone,
  Building,
  Briefcase,
  X,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ShieldAlert,
} from 'lucide-react';
import { Employee, Department } from '../../types';
import { api } from '../../api';
import { Employee360Modal } from './Employee360Modal';

export const EmployeeManagement: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortBy, setSortBy] = useState<'name' | 'id' | 'dept' | 'date'>('name');

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [is360ModalOpen, setIs360ModalOpen] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState<Employee | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    employeeId: '',
    email: '',
    contactNumber: '',
    department: 'Engineering',
    roleTitle: '',
    reportingManagerId: '',
    monthlySalary: 50000,
    role: 'employee' as 'employee' | 'hr_admin',
    profilePhoto: '',
    employmentStatus: 'Active' as const,
  });

  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [empList, deptList] = await Promise.all([api.getEmployees(), api.getDepartments()]);
      setEmployees(empList);
      setDepartments(deptList);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setFormData({
      fullName: '',
      employeeId: `EMP00${employees.length + 1}`,
      email: '',
      contactNumber: '+1 (555) 000-0000',
      department: departments[0]?.name || 'Engineering',
      roleTitle: '',
      reportingManagerId: '',
      monthlySalary: 50000,
      role: 'employee',
      profilePhoto: `https://api.dicebear.com/7.x/avataaars/svg?seed=new_${Date.now()}`,
      employmentStatus: 'Active',
    });
    setFormError(null);
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (emp: Employee) => {
    setCurrentEmployee(emp);
    setFormData({
      fullName: emp.fullName,
      employeeId: emp.employeeId,
      email: emp.email,
      contactNumber: emp.contactNumber,
      department: emp.department,
      roleTitle: emp.roleTitle,
      reportingManagerId: emp.reportingManagerId || '',
      monthlySalary: emp.monthlySalary,
      role: emp.role,
      profilePhoto: emp.profilePhoto,
      employmentStatus: emp.employmentStatus,
    });
    setFormError(null);
    setIsEditModalOpen(true);
  };

  const handleOpenView = (emp: Employee) => {
    setCurrentEmployee(emp);
    setIsViewModalOpen(true);
  };

  const handleToggleStatus = async (emp: Employee) => {
    const action = emp.employmentStatus === 'Active' ? 'deactivate' : 'reactivate';
    if (!confirm(`Are you sure you want to ${action} ${emp.fullName}?`)) return;

    try {
      const res = await api.toggleEmployeeStatus(emp.id);
      setEmployees((prev) => prev.map((e) => (e.id === emp.id ? res.employee : e)));
      setSuccessMessage(`Employee status updated to ${res.employee.employmentStatus}`);
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      alert(err.message || 'Failed to update employee status.');
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName.trim() || !formData.employeeId.trim() || !formData.email.trim() || !formData.roleTitle.trim()) {
      setFormError('Please fill in all mandatory employee fields.');
      return;
    }

    setSubmitting(true);
    setFormError(null);
    try {
      const newEmp = await api.createEmployee(formData);
      setEmployees((prev) => [...prev, newEmp]);
      setIsAddModalOpen(false);
      setSuccessMessage(`Employee ${newEmp.fullName} created successfully! Welcome email dispatched.`);
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err: any) {
      setFormError(err.message || 'Failed to create employee.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentEmployee) return;

    setSubmitting(true);
    setFormError(null);
    try {
      const updated = await api.updateEmployee(currentEmployee.id, formData);
      setEmployees((prev) => prev.map((e) => (e.id === currentEmployee.id ? updated : e)));
      setIsEditModalOpen(false);
      setSuccessMessage(`Employee ${updated.fullName} updated successfully!`);
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      setFormError(err.message || 'Failed to update employee.');
    } finally {
      setSubmitting(false);
    }
  };

  // Filter & Sort Logic
  const filteredEmployees = employees
    .filter((emp) => {
      const matchesSearch =
        emp.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.roleTitle.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesDept = selectedDept === 'all' || emp.department === selectedDept;
      const matchesStatus = selectedStatus === 'all' || emp.employmentStatus === selectedStatus;

      return matchesSearch && matchesDept && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'name') return a.fullName.localeCompare(b.fullName);
      if (sortBy === 'id') return a.employeeId.localeCompare(b.employeeId);
      if (sortBy === 'dept') return a.department.localeCompare(b.department);
      if (sortBy === 'date') return (b.joinDate || '').localeCompare(a.joinDate || '');
      return 0;
    });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 sm:text-2xl flex items-center gap-2">
            <Users className="h-6 w-6 text-blue-600" />
            Employee Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage organization staff directory, reporting lines, profiles, and credentials.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-600/20 hover:bg-blue-700 transition"
        >
          <UserPlus className="h-4 w-4" />
          <span>Add New Employee</span>
        </button>
      </div>

      {successMessage && (
        <div className="flex items-center gap-2.5 rounded-xl bg-emerald-50 border border-emerald-200 p-3.5 text-xs text-emerald-800 animate-in fade-in">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs space-y-3">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, ID, email..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-9 pr-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none"
            />
          </div>

          {/* Department Filter */}
          <div className="flex items-center gap-2">
            <Building className="h-4 w-4 text-slate-400 shrink-0" />
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none"
            >
              <option value="all">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.name}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-400 shrink-0" />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="Active">Active</option>
              <option value="On Leave">On Leave</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          {/* Sort Control */}
          <div className="flex items-center gap-2">
            <ArrowUpDown className="h-4 w-4 text-slate-400 shrink-0" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none"
            >
              <option value="name">Sort by Name</option>
              <option value="id">Sort by Employee ID</option>
              <option value="dept">Sort by Department</option>
              <option value="date">Sort by Joining Date</option>
            </select>
          </div>
        </div>
      </div>

      {/* Employee Data Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3.5">Employee</th>
                <th className="px-4 py-3.5">ID</th>
                <th className="px-4 py-3.5">Department</th>
                <th className="px-4 py-3.5">Designation</th>
                <th className="px-4 py-3.5">Reporting Manager</th>
                <th className="px-4 py-3.5">Salary</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No employees matching the criteria found.
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50/80 transition">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={emp.profilePhoto}
                          alt={emp.fullName}
                          className="h-9 w-9 rounded-full object-cover ring-1 ring-slate-200"
                        />
                        <div>
                          <p className="font-semibold text-slate-900">{emp.fullName}</p>
                          <p className="text-[11px] text-slate-400">{emp.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-semibold text-blue-700">{emp.employeeId}</td>
                    <td className="px-4 py-3">
                      <span className="rounded bg-slate-100 px-2 py-0.5 font-medium text-slate-700">
                        {emp.department}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-800">{emp.roleTitle}</td>
                    <td className="px-4 py-3 text-slate-500">{emp.reportingManagerName || '—'}</td>
                    <td className="px-4 py-3 font-medium text-slate-900">
                      ₹{emp.monthlySalary.toLocaleString()} / mo
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          emp.employmentStatus === 'Active'
                            ? 'bg-emerald-100 text-emerald-700'
                            : emp.employmentStatus === 'On Leave'
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {emp.employmentStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setCurrentEmployee(emp);
                            setIs360ModalOpen(true);
                          }}
                          className="rounded-lg p-1.5 text-amber-600 hover:bg-amber-50 transition"
                          title="View 360 Governance Profile"
                        >
                          <ShieldAlert className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleOpenView(emp)}
                          className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-blue-600 transition"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(emp)}
                          className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-blue-600 transition"
                          title="Edit Employee"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(emp)}
                          className={`rounded-lg p-1.5 transition ${
                            emp.employmentStatus === 'Active'
                              ? 'text-red-500 hover:bg-red-50'
                              : 'text-emerald-500 hover:bg-emerald-50'
                          }`}
                          title={emp.employmentStatus === 'Active' ? 'Deactivate Employee' : 'Reactivate Employee'}
                        >
                          {emp.employmentStatus === 'Active' ? (
                            <UserX className="h-4 w-4" />
                          ) : (
                            <UserCheck className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD EMPLOYEE MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl overflow-hidden border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-900 px-6 py-4 text-white">
              <h2 className="text-sm font-bold flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-blue-400" />
                Add New Employee (Dispatches Welcome Email)
              </h2>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-6 space-y-4 text-xs">
              {formError && (
                <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 p-3 text-red-700">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="e.g. Johnathan Doe"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Employee ID *</label>
                  <input
                    type="text"
                    required
                    value={formData.employeeId}
                    onChange={(e) => setFormData({ ...formData, employeeId: e.target.value.toUpperCase() })}
                    placeholder="e.g. EMP007"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 font-mono uppercase focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Official Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="johnathan@dayflow.ai"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Contact Number</label>
                  <input
                    type="text"
                    value={formData.contactNumber}
                    onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                    placeholder="+1 (555) 019-2834"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Department *</label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 focus:border-blue-500 focus:outline-none"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.name}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Role / Designation *</label>
                  <input
                    type="text"
                    required
                    value={formData.roleTitle}
                    onChange={(e) => setFormData({ ...formData, roleTitle: e.target.value })}
                    placeholder="e.g. Full Stack Engineer"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Reporting Manager</label>
                  <select
                    value={formData.reportingManagerId}
                    onChange={(e) => setFormData({ ...formData, reportingManagerId: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 focus:border-blue-500 focus:outline-none"
                  >
                    <option value="">None (Reports to Board / Head)</option>
                    {employees.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.fullName} ({e.roleTitle})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Monthly Salary (₹)</label>
                  <input
                    type="number"
                    value={formData.monthlySalary}
                    onChange={(e) => setFormData({ ...formData, monthlySalary: Number(e.target.value) })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-slate-600 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-blue-600 px-5 py-2 font-bold text-white shadow-md hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {submitting ? 'Creating Employee...' : 'Save & Send Welcome Email'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT EMPLOYEE MODAL */}
      {isEditModalOpen && currentEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl overflow-hidden border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-900 px-6 py-4 text-white">
              <h2 className="text-sm font-bold flex items-center gap-2">
                <Edit2 className="h-4 w-4 text-blue-400" />
                Edit Employee Details: {currentEmployee.fullName}
              </h2>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4 text-xs">
              {formError && (
                <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 p-3 text-red-700">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Employee ID (HR Locked in App)</label>
                  <input
                    type="text"
                    value={formData.employeeId}
                    disabled
                    className="w-full rounded-xl border border-slate-200 bg-slate-100 px-3 py-2 font-mono text-slate-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Contact Number</label>
                  <input
                    type="text"
                    value={formData.contactNumber}
                    onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Department</label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 focus:border-blue-500 focus:outline-none"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.name}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Role / Designation</label>
                  <input
                    type="text"
                    required
                    value={formData.roleTitle}
                    onChange={(e) => setFormData({ ...formData, roleTitle: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Monthly Salary (₹)</label>
                  <input
                    type="number"
                    value={formData.monthlySalary}
                    onChange={(e) => setFormData({ ...formData, monthlySalary: Number(e.target.value) })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Employment Status</label>
                  <select
                    value={formData.employmentStatus}
                    onChange={(e) => setFormData({ ...formData, employmentStatus: e.target.value as any })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 focus:border-blue-500 focus:outline-none"
                  >
                    <option value="Active">Active</option>
                    <option value="On Leave">On Leave</option>
                    <option value="Probation">Probation</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-slate-600 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-blue-600 px-5 py-2 font-bold text-white shadow-md hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Save Profile Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW DETAILS MODAL */}
      {isViewModalOpen && currentEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden border border-slate-200">
            <div className="relative bg-slate-900 p-6 text-white text-center">
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="absolute top-4 right-4 rounded-lg p-1 text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
              <img
                src={currentEmployee.profilePhoto}
                alt={currentEmployee.fullName}
                className="mx-auto h-20 w-20 rounded-full object-cover ring-4 ring-white/20 shadow-lg"
              />
              <h2 className="mt-3 text-base font-bold">{currentEmployee.fullName}</h2>
              <p className="text-xs text-slate-300">{currentEmployee.roleTitle}</p>
              <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-blue-500/30 px-2.5 py-0.5 text-xs text-blue-200 font-semibold">
                {currentEmployee.department} • {currentEmployee.employeeId}
              </div>
            </div>

            <div className="p-6 text-xs space-y-3">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Email</span>
                  <span className="font-medium text-slate-900">{currentEmployee.email}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Contact</span>
                  <span className="font-medium text-slate-900">{currentEmployee.contactNumber}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Monthly Salary</span>
                  <span className="font-medium text-slate-900">₹{currentEmployee.monthlySalary.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Joined</span>
                  <span className="font-medium text-slate-900">{currentEmployee.joinDate}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Reporting Line</span>
                  <span className="font-medium text-slate-900">
                    Reports to: {currentEmployee.reportingManagerName || 'Executive Leadership'}
                  </span>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => {
                    setIsViewModalOpen(false);
                    handleOpenEdit(currentEmployee);
                  }}
                  className="rounded-xl bg-blue-600 px-4 py-2 font-bold text-white hover:bg-blue-700 transition"
                >
                  Edit Employee Record
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 360 GOVERNANCE PROFILE MODAL */}
      {is360ModalOpen && currentEmployee && (
        <Employee360Modal
          employee={currentEmployee}
          onClose={() => setIs360ModalOpen(false)}
        />
      )}
    </div>
  );
};
