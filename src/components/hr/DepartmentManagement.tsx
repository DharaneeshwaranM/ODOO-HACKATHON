import React, { useState, useEffect } from 'react';
import {
  Building2,
  Users,
  Plus,
  Edit2,
  TrendingUp,
  HeartPulse,
  Sparkles,
  Network,
  Activity,
  X,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { Department, OrgNode } from '../../types';
import { api } from '../../api';
import { OrgChart } from './OrgChart';

export const DepartmentManagement: React.FC = () => {
  const [departments, setDepartments] = useState<(Department & { employeeCount: number })[]>([]);
  const [orgNodes, setOrgNodes] = useState<OrgNode[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'orgChart'>('overview');
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    headOfDepartment: '',
    budget: 250000,
    description: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [deptList, orgData] = await Promise.all([
        api.getDepartments(),
        api.getOrgChart(),
      ]);
      setDepartments(deptList);
      setOrgNodes(orgData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingDept(null);
    setFormData({
      name: '',
      code: '',
      headOfDepartment: '',
      budget: 250000,
      description: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (dept: Department) => {
    setEditingDept(dept);
    setFormData({
      name: dept.name,
      code: dept.code,
      headOfDepartment: dept.headOfDepartment,
      budget: dept.budget || 250000,
      description: dept.description || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingDept) {
        await api.updateDepartment(editingDept.id, formData);
      } else {
        await api.createDepartment(formData);
      }
      await loadData();
      setIsModalOpen(false);
    } catch (err: any) {
      alert(err.message || 'Failed to save department.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header with Tab switcher */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 sm:text-2xl flex items-center gap-2">
            <Building2 className="h-6 w-6 text-blue-600" />
            Departments & Organizational Chart
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage business units, divisional heads, operational health, and company hierarchy.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                activeTab === 'overview'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building2 className="h-4 w-4" />
              <span>Departments</span>
            </button>
            <button
              onClick={() => setActiveTab('orgChart')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                activeTab === 'orgChart'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Network className="h-4 w-4" />
              <span>Org Chart Tree</span>
            </button>
          </div>

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-700 transition"
          >
            <Plus className="h-4 w-4" />
            <span>Add Department</span>
          </button>
        </div>
      </div>

      {activeTab === 'overview' ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {departments.map((dept) => (
            <div
              key={dept.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition hover:shadow-md space-y-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                    {dept.code}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mt-1.5">{dept.name}</h3>
                </div>
                <button
                  onClick={() => handleOpenEdit(dept)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
              </div>

              <p className="text-xs text-slate-600 line-clamp-2 min-h-[32px]">
                {dept.description || 'Core organizational business unit.'}
              </p>

              <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-50 p-3 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-semibold text-slate-400 block">Department Head</span>
                  <span className="font-bold text-slate-900 truncate block">{dept.headOfDepartment}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-semibold text-slate-400 block">Headcount</span>
                  <span className="font-bold text-blue-700 flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" />
                    {dept.employeeCount || 0} Staff
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 text-xs text-slate-500 border-t border-slate-100">
                <span>Budget: ₹{(dept.budget || 0).toLocaleString()}</span>
                <span className="inline-flex items-center gap-1 font-semibold text-emerald-600">
                  <HeartPulse className="h-3.5 w-3.5" /> Optimal Health
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <OrgChart nodes={orgNodes} />
      )}

      {/* ADD / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-900 px-6 py-4 text-white">
              <h2 className="text-sm font-bold flex items-center gap-2">
                <Building2 className="h-4 w-4 text-blue-400" />
                {editingDept ? 'Edit Department' : 'Create New Department'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Department Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Artificial Intelligence Research"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Code *</label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="e.g. AI-RES"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 font-mono uppercase focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Head of Department *</label>
                  <input
                    type="text"
                    required
                    value={formData.headOfDepartment}
                    onChange={(e) => setFormData({ ...formData, headOfDepartment: e.target.value })}
                    placeholder="e.g. Dr. Jane Smith"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Annual Budget (₹)</label>
                <input
                  type="number"
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: Number(e.target.value) })}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Mandate and focus areas..."
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-slate-600 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-blue-600 px-5 py-2 font-bold text-white shadow-md hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Save Department'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
