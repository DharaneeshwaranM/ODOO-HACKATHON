import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  Coins,
  CalendarDays,
  CalendarCheck2,
  Building2,
  UserCheck,
  UserX,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  RefreshCw,
  Sparkles,
  Info,
  ChevronRight,
  Eye,
  Check,
  X,
  SlidersHorizontal,
  Flame,
  Zap,
  RotateCcw,
  CheckCheck,
  Scale,
} from 'lucide-react';
import { api } from '../../api';
import { HRActionItem, HRActionPriority, HRActionCategory, HRActionStatus } from '../../types';

interface SmartActionCenterProps {
  setCurrentView: (view: string) => void;
}

export const SmartActionCenter: React.FC<SmartActionCenterProps> = ({ setCurrentView }) => {
  const [actions, setActions] = useState<HRActionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<'all' | HRActionPriority>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | HRActionCategory>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending_only' | 'completed_only'>('all');

  // Quick Action Modals
  const [selectedDeductionModal, setSelectedDeductionModal] = useState<HRActionItem | null>(null);
  const [customDeductionAmount, setCustomDeductionAmount] = useState<number>(0);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isRejectingDeduction, setIsRejectingDeduction] = useState(false);
  const [submittingAction, setSubmittingAction] = useState(false);

  const [selectedLeaveModal, setSelectedLeaveModal] = useState<HRActionItem | null>(null);
  const [leaveRemarks, setLeaveRemarks] = useState('');

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const loadActions = async () => {
    setLoading(true);
    try {
      const data = await api.getActionCenter();
      setActions(data);
    } catch (err: any) {
      console.error('Failed to load Action Center data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActions();
  }, []);

  const handleDismiss = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.dismissAction(id);
      setActions((prev) => prev.filter((a) => a.id !== id));
      showToast('Action item dismissed from your active dashboard.');
    } catch (err: any) {
      alert(err.message || 'Failed to dismiss action');
    }
  };

  const handleStatusChange = async (id: string, newStatus: HRActionStatus, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.updateActionStatus(id, newStatus);
      setActions((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a))
      );
      showToast(`Status updated to "${newStatus.replace('_', ' ')}".`);
    } catch (err: any) {
      alert(err.message || 'Failed to update action status');
    }
  };

  const handleResetActions = async () => {
    try {
      await api.resetActionCenter();
      await loadActions();
      showToast('All dismissed action cards have been restored.');
    } catch (err: any) {
      alert(err.message || 'Failed to reset action center');
    }
  };

  // Salary deduction in-place approval
  const handleApproveSalaryDeduction = async () => {
    if (!selectedDeductionModal || !selectedDeductionModal.targetEntityId) return;
    setSubmittingAction(true);
    try {
      await api.approveSalaryDeduction(
        selectedDeductionModal.targetEntityId,
        customDeductionAmount || selectedDeductionModal.details.potentialDeduction
      );
      showToast('Salary deduction approved and queued for payroll.');
      setSelectedDeductionModal(null);
      await loadActions();
    } catch (err: any) {
      alert(err.message || 'Failed to approve deduction');
    } finally {
      setSubmittingAction(false);
    }
  };

  // Salary deduction in-place rejection
  const handleRejectSalaryDeduction = async () => {
    if (!selectedDeductionModal || !selectedDeductionModal.targetEntityId) return;
    setSubmittingAction(true);
    try {
      await api.rejectSalaryDeduction(
        selectedDeductionModal.targetEntityId,
        rejectionReason.trim() || 'HR Medical Exemption / Policy Discretionary Clearance'
      );
      showToast('Salary deduction rejected. Full employee salary protected.');
      setSelectedDeductionModal(null);
      await loadActions();
    } catch (err: any) {
      alert(err.message || 'Failed to reject deduction');
    } finally {
      setSubmittingAction(false);
    }
  };

  // Leave in-place review
  const handleReviewLeave = async (status: 'Approved' | 'Rejected') => {
    if (!selectedLeaveModal || !selectedLeaveModal.targetEntityId) return;
    setSubmittingAction(true);
    try {
      await api.reviewLeave(selectedLeaveModal.targetEntityId, {
        status,
        remarks: leaveRemarks.trim() || undefined,
      });
      showToast(`Leave request ${status.toLowerCase()} successfully.`);
      setSelectedLeaveModal(null);
      await loadActions();
    } catch (err: any) {
      alert(err.message || 'Failed to review leave');
    } finally {
      setSubmittingAction(false);
    }
  };

  // Filter actions
  const filteredActions = actions.filter((item) => {
    if (priorityFilter !== 'all' && item.priority !== priorityFilter) return false;
    if (categoryFilter !== 'all' && item.category !== categoryFilter) return false;
    if (statusFilter === 'pending_only') {
      if (item.status === 'completed' || item.status === 'rejected') return false;
    }
    if (statusFilter === 'completed_only') {
      if (item.status !== 'completed' && item.status !== 'rejected') return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        item.title.toLowerCase().includes(q) ||
        (item.subtitle && item.subtitle.toLowerCase().includes(q)) ||
        (item.employeeName && item.employeeName.toLowerCase().includes(q)) ||
        (item.employeeId && item.employeeId.toLowerCase().includes(q)) ||
        (item.department && item.department.toLowerCase().includes(q)) ||
        item.whyFlagged.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const criticalCount = actions.filter((a) => a.priority === 'critical' && a.status !== 'completed' && a.status !== 'rejected').length;
  const highCount = actions.filter((a) => a.priority === 'high' && a.status !== 'completed' && a.status !== 'rejected').length;
  const mediumCount = actions.filter((a) => a.priority === 'medium' && a.status !== 'completed' && a.status !== 'rejected').length;
  const infoCount = actions.filter((a) => a.priority === 'informational' || a.status === 'completed' || a.status === 'rejected').length;
  const totalPending = criticalCount + highCount + mediumCount;

  const getPriorityBadge = (priority: HRActionPriority) => {
    switch (priority) {
      case 'critical':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse"></span>
            Critical Attention
          </span>
        );
      case 'high':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            High Priority
          </span>
        );
      case 'medium':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-yellow-50 text-yellow-800 border border-yellow-200">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-500"></span>
            Review Needed
          </span>
        );
      case 'informational':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
            Informational
          </span>
        );
    }
  };

  const getCategoryIcon = (category: HRActionCategory) => {
    switch (category) {
      case 'salary':
        return <Coins className="w-3.5 h-3.5 text-amber-600" />;
      case 'leave':
        return <CalendarDays className="w-3.5 h-3.5 text-indigo-600" />;
      case 'attendance':
        return <CalendarCheck2 className="w-3.5 h-3.5 text-emerald-600" />;
      case 'absence':
        return <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />;
      case 'warning':
      case 'conduct':
        return <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />;
      case 'performance':
      case 'pip':
        return <Flame className="w-3.5 h-3.5 text-indigo-600" />;
      case 'compliance':
      case 'separation':
        return <Scale className="w-3.5 h-3.5 text-rose-600" />;
      case 'department':
        return <Building2 className="w-3.5 h-3.5 text-purple-600" />;
      case 'employee':
        return <UserCheck className="w-3.5 h-3.5 text-blue-600" />;
      default:
        return <Zap className="w-3.5 h-3.5 text-slate-600" />;
    }
  };

  const getCategoryLabel = (category: HRActionCategory) => {
    switch (category) {
      case 'salary':
        return 'Salary Deduction';
      case 'leave':
        return 'Leave Governance';
      case 'attendance':
        return 'Attendance Anomaly';
      case 'absence':
        return 'Absence Limit';
      case 'warning':
        return 'Warning & Notice';
      case 'performance':
        return 'Work Performance';
      case 'conduct':
        return 'Workplace Conduct';
      case 'compliance':
        return 'Policy & Compliance';
      case 'pip':
        return 'Performance Plan (PIP)';
      case 'separation':
        return 'Separation Review';
      case 'department':
        return 'Department Health';
      case 'employee':
        return 'Employee Profile';
      default:
        return 'Governance Action';
    }
  };

  const getStatusBadge = (status: HRActionStatus) => {
    switch (status) {
      case 'pending':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            Pending HR Decision
          </span>
        );
      case 'in_review':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
            In Review
          </span>
        );
      case 'completed':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Resolved / Applied
          </span>
        );
      case 'rejected':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
            Exempt / Rejected
          </span>
        );
      case 'new':
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
            Action Required
          </span>
        );
    }
  };

  const handleExecuteAction = (item: HRActionItem) => {
    if (item.category === 'salary' && item.status === 'pending') {
      setSelectedDeductionModal(item);
      setCustomDeductionAmount(item.details.potentialDeduction || 0);
      setIsRejectingDeduction(false);
      setRejectionReason('');
    } else if (item.category === 'leave' && item.status === 'pending') {
      setSelectedLeaveModal(item);
      setLeaveRemarks('');
    } else {
      setCurrentView(item.targetView);
    }
  };

  return (
    <div className="space-y-4 pb-12">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-lg shadow-lg border border-slate-700 text-xs font-semibold flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          {toastMessage}
        </div>
      )}

      {/* Page Header */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900">Smart HR Action Center</h1>
              <p className="text-xs text-slate-500">
                Centralized HR decision intelligence & real-time executive action panel
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadActions}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer transition"
            title="Refresh action queues"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-indigo-600' : ''}`} />
            Refresh
          </button>
          <button
            onClick={handleResetActions}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer transition"
            title="Restore any dismissed actions"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Restore Dismissed
          </button>
        </div>
      </div>

      {/* Attention Callout Banner */}
      {criticalCount > 0 ? (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-3.5 flex items-start gap-3">
          <div className="p-1 bg-rose-100 text-rose-700 rounded-md shrink-0 mt-0.5">
            <Flame className="w-4 h-4 text-rose-600" />
          </div>
          <div className="flex-1">
            <div className="text-xs font-bold text-rose-900">
              {criticalCount} Critical Action{criticalCount > 1 ? 's' : ''} Require Immediate HR Attention
            </div>
            <div className="text-xs text-rose-700 mt-0.5 leading-relaxed">
              Salary deduction approvals and major absence violations are pending review. Unresolved items will block payroll finalization.
            </div>
          </div>
          <button
            onClick={() => {
              setPriorityFilter('critical');
              setStatusFilter('pending_only');
            }}
            className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-md shrink-0 cursor-pointer shadow-xs"
          >
            View Critical
          </button>
        </div>
      ) : (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <CheckCheck className="w-5 h-5 text-emerald-600" />
            <div>
              <div className="text-xs font-bold text-emerald-900">
                All Critical Actions Cleared
              </div>
              <div className="text-xs text-emerald-700">
                No high-priority salary deductions or policy breaches are currently blocking operations.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Priority Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Critical */}
        <div
          onClick={() => {
            setPriorityFilter(priorityFilter === 'critical' ? 'all' : 'critical');
          }}
          className={`p-3.5 rounded-xl border cursor-pointer transition ${
            priorityFilter === 'critical'
              ? 'bg-rose-50 border-rose-400 ring-2 ring-rose-200'
              : 'bg-white border-slate-200 hover:border-rose-300'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-1">
            <span className="flex items-center gap-1 text-rose-700 font-bold">
              <span className="w-2 h-2 rounded-full bg-rose-600"></span> Critical Attention
            </span>
          </div>
          <div className="text-2xl font-bold text-slate-900">{criticalCount}</div>
          <div className="text-[10px] text-slate-500 mt-1">Salary & severe absence breaches</div>
        </div>

        {/* High */}
        <div
          onClick={() => {
            setPriorityFilter(priorityFilter === 'high' ? 'all' : 'high');
          }}
          className={`p-3.5 rounded-xl border cursor-pointer transition ${
            priorityFilter === 'high'
              ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-200'
              : 'bg-white border-slate-200 hover:border-amber-300'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-1">
            <span className="flex items-center gap-1 text-amber-700 font-bold">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span> High Priority
            </span>
          </div>
          <div className="text-2xl font-bold text-slate-900">{highCount}</div>
          <div className="text-[10px] text-slate-500 mt-1">Urgent leaves & attendance spikes</div>
        </div>

        {/* Medium */}
        <div
          onClick={() => {
            setPriorityFilter(priorityFilter === 'medium' ? 'all' : 'medium');
          }}
          className={`p-3.5 rounded-xl border cursor-pointer transition ${
            priorityFilter === 'medium'
              ? 'bg-yellow-50 border-yellow-400 ring-2 ring-yellow-200'
              : 'bg-white border-slate-200 hover:border-yellow-300'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-1">
            <span className="flex items-center gap-1 text-yellow-800 font-bold">
              <span className="w-2 h-2 rounded-full bg-yellow-500"></span> Review Needed
            </span>
          </div>
          <div className="text-2xl font-bold text-slate-900">{mediumCount}</div>
          <div className="text-[10px] text-slate-500 mt-1">Warnings, late logs & profiles</div>
        </div>

        {/* Informational / Completed */}
        <div
          onClick={() => {
            setPriorityFilter(priorityFilter === 'informational' ? 'all' : 'informational');
          }}
          className={`p-3.5 rounded-xl border cursor-pointer transition ${
            priorityFilter === 'informational'
              ? 'bg-slate-100 border-slate-400 ring-2 ring-slate-200'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-1">
            <span className="flex items-center gap-1 text-slate-700 font-bold">
              <span className="w-2 h-2 rounded-full bg-slate-400"></span> Resolved / Info
            </span>
          </div>
          <div className="text-2xl font-bold text-slate-900">{infoCount}</div>
          <div className="text-[10px] text-slate-500 mt-1">Archived & audit logs</div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by employee, ID, department, reason, or action keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Status Segmented Control */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs shrink-0 self-start md:self-auto">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-2.5 py-1 rounded-md font-semibold transition cursor-pointer ${
                statusFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Status
            </button>
            <button
              onClick={() => setStatusFilter('pending_only')}
              className={`px-2.5 py-1 rounded-md font-semibold transition cursor-pointer ${
                statusFilter === 'pending_only'
                  ? 'bg-white text-indigo-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Action Required ({totalPending})
            </button>
            <button
              onClick={() => setStatusFilter('completed_only')}
              className={`px-2.5 py-1 rounded-md font-semibold transition cursor-pointer ${
                statusFilter === 'completed_only'
                  ? 'bg-white text-emerald-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Resolved ({infoCount})
            </button>
          </div>
        </div>

        {/* Category Pill Filters */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-100">
          <span className="text-[11px] font-bold text-slate-500 mr-1 flex items-center gap-1">
            <SlidersHorizontal className="w-3 h-3" /> Module:
          </span>
          {[
            { id: 'all', label: 'All Modules' },
            { id: 'warning', label: '🛡️ Warnings & Notices' },
            { id: 'performance', label: '📈 Performance & PIP' },
            { id: 'conduct', label: '⚖️ Conduct & Compliance' },
            { id: 'salary', label: '💰 Salary Deductions' },
            { id: 'leave', label: '🏖️ Leaves' },
            { id: 'absence', label: '⚠️ Absence Limits' },
            { id: 'attendance', label: '⏱️ Attendance' },
            { id: 'department', label: '🏢 Departments' },
            { id: 'employee', label: '👤 Profiles' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoryFilter(cat.id as any)}
              className={`px-2.5 py-1 rounded-full text-xs font-semibold transition cursor-pointer ${
                categoryFilter === cat.id
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Action Cards List */}
      {loading ? (
        <div className="p-12 text-center bg-white rounded-xl border border-slate-200">
          <RefreshCw className="w-6 h-6 animate-spin text-indigo-600 mx-auto mb-2" />
          <div className="text-xs font-semibold text-slate-600">Evaluating organization events and compiling actions...</div>
        </div>
      ) : filteredActions.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-xl border border-slate-200">
          <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
          <div className="text-sm font-bold text-slate-800">No Action Items Match Your Filters</div>
          <div className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            Try adjusting your search query, module selection, or priority filters.
          </div>
          {(priorityFilter !== 'all' || categoryFilter !== 'all' || searchQuery || statusFilter !== 'all') && (
            <button
              onClick={() => {
                setPriorityFilter('all');
                setCategoryFilter('all');
                setStatusFilter('all');
                setSearchQuery('');
              }}
              className="mt-3 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg cursor-pointer"
            >
              Clear All Filters
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredActions.map((item) => {
            const isCompleted = item.status === 'completed' || item.status === 'rejected';

            return (
              <div
                key={item.id}
                className={`bg-white rounded-xl border transition-all overflow-hidden ${
                  item.priority === 'critical' && !isCompleted
                    ? 'border-rose-300 shadow-xs hover:border-rose-400'
                    : item.priority === 'high' && !isCompleted
                    ? 'border-amber-300 shadow-xs hover:border-amber-400'
                    : 'border-slate-200 shadow-xs hover:border-indigo-300'
                }`}
              >
                {/* Top Badge Bar */}
                <div className="bg-slate-50/70 px-4 py-2 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {getPriorityBadge(item.priority)}
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                      {getCategoryIcon(item.category)}
                      {getCategoryLabel(item.category)}
                    </span>
                    {getStatusBadge(item.status)}
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-slate-400">
                    <Clock className="w-3 h-3" />
                    <span>{item.createdAt}</span>
                  </div>
                </div>

                {/* Main Card Content */}
                <div className="p-4">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2.5">
                        {item.avatar && (
                          <img
                            src={item.avatar}
                            alt={item.employeeName || 'Staff'}
                            className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-200 shrink-0"
                          />
                        )}
                        <div>
                          <h2 className="text-sm font-bold text-slate-900 leading-tight">{item.title}</h2>
                          {item.subtitle && (
                            <div className="text-xs text-slate-500 font-medium">{item.subtitle}</div>
                          )}
                        </div>
                      </div>

                      {/* Why Flagged Box */}
                      <div className="mt-2 bg-slate-50 border border-slate-200/80 rounded-lg p-2.5 text-xs text-slate-700 flex items-start gap-2">
                        <Info className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-slate-900">Why this was flagged:</strong>{' '}
                          <span>{item.whyFlagged}</span>
                        </div>
                      </div>

                      {/* Supporting Data Key Metrics Badges */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        {item.details.potentialDeduction !== undefined && (
                          <span className="text-[11px] font-bold bg-amber-50 text-amber-800 px-2 py-0.5 rounded border border-amber-200">
                            Potential Deduction: ₹{item.details.potentialDeduction.toLocaleString()}
                          </span>
                        )}
                        {item.details.usedAbsence !== undefined && item.details.absenceLimit !== undefined && (
                          <span className="text-[11px] font-bold bg-rose-50 text-rose-800 px-2 py-0.5 rounded border border-rose-200">
                            Absence: {item.details.usedAbsence}/{item.details.absenceLimit} Days
                          </span>
                        )}
                        {item.details.excessDays !== undefined && item.details.excessDays > 0 && (
                          <span className="text-[11px] font-bold bg-red-50 text-red-800 px-2 py-0.5 rounded border border-red-200">
                            +{item.details.excessDays} Excess Days
                          </span>
                        )}
                        {item.details.remainingDays !== undefined && (
                          <span className="text-[11px] font-bold bg-yellow-50 text-yellow-800 px-2 py-0.5 rounded border border-yellow-200">
                            {item.details.remainingDays} Days Left
                          </span>
                        )}
                        {item.details.leaveDays !== undefined && (
                          <span className="text-[11px] font-bold bg-indigo-50 text-indigo-800 px-2 py-0.5 rounded border border-indigo-200">
                            Duration: {item.details.leaveDays} Day(s)
                          </span>
                        )}
                        {item.details.lateCount !== undefined && (
                          <span className="text-[11px] font-bold bg-amber-50 text-amber-800 px-2 py-0.5 rounded border border-amber-200">
                            {item.details.lateCount} Late Arrivals
                          </span>
                        )}
                        {item.details.attendanceRate !== undefined && (
                          <span className="text-[11px] font-bold bg-purple-50 text-purple-800 px-2 py-0.5 rounded border border-purple-200">
                            Dept Attendance: {item.details.attendanceRate}%
                          </span>
                        )}
                        {item.details.missingFields && item.details.missingFields.length > 0 && (
                          <span className="text-[11px] font-bold bg-blue-50 text-blue-800 px-2 py-0.5 rounded border border-blue-200">
                            Missing: {item.details.missingFields.join(', ')}
                          </span>
                        )}
                      </div>

                      {/* Recommended HR Action */}
                      <div className="text-[11px] text-slate-500 pt-1 flex items-center gap-1.5">
                        <strong className="text-slate-700">Recommended Action:</strong>{' '}
                        <span>{item.recommendedAction}</span>
                      </div>
                    </div>

                    {/* Direct Action Controls */}
                    <div className="flex md:flex-col items-center md:items-end gap-2 shrink-0 pt-2 md:pt-0">
                      <button
                        onClick={() => handleExecuteAction(item)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition shadow-xs ${
                          item.priority === 'critical' && !isCompleted
                            ? 'bg-rose-600 hover:bg-rose-700 text-white'
                            : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                        }`}
                      >
                        <span>{item.primaryActionLabel || 'Review & Decide'}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>

                      {/* Status / Dismiss Buttons */}
                      <div className="flex items-center gap-1">
                        {!isCompleted && item.status !== 'in_review' && (
                          <button
                            onClick={(e) => handleStatusChange(item.id, 'in_review', e)}
                            className="px-2 py-1 text-[11px] font-semibold rounded text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 cursor-pointer"
                            title="Mark as In Review"
                          >
                            In Review
                          </button>
                        )}
                        {item.dismissible && (
                          <button
                            onClick={(e) => handleDismiss(item.id, e)}
                            className="px-2 py-1 text-[11px] font-semibold rounded text-slate-500 hover:text-slate-700 hover:bg-slate-100 border border-slate-200 cursor-pointer"
                            title="Dismiss this action card"
                          >
                            Dismiss
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* QUICK IN-PLACE SALARY DEDUCTION DECISION MODAL */}
      {selectedDeductionModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in duration-150">
            <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Coins className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold">HR Salary Deduction Determination</h3>
              </div>
              <button
                onClick={() => setSelectedDeductionModal(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs text-slate-700">
              {/* Employee & Violation Overview */}
              <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-2">
                <div className="flex justify-between font-bold text-slate-900 text-sm">
                  <span>{selectedDeductionModal.employeeName}</span>
                  <span className="text-slate-500">{selectedDeductionModal.employeeId}</span>
                </div>
                <div className="text-slate-600">Department: {selectedDeductionModal.department}</div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200">
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase font-bold">Absence Record</div>
                    <div className="font-bold text-rose-700">
                      {selectedDeductionModal.details.usedAbsence} days used / {selectedDeductionModal.details.absenceLimit} allowed (+{selectedDeductionModal.details.excessDays} excess)
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase font-bold">Calculated Deduction</div>
                    <div className="font-bold text-amber-700 text-sm">
                      ₹{selectedDeductionModal.details.potentialDeduction?.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Human in the loop guidance */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-blue-900 leading-relaxed">
                <strong>HR Discretionary Rule:</strong> The system never deducts salary automatically. Review whether the excess absence was due to documented medical emergencies before approving or granting exemption.
              </div>

              {!isRejectingDeduction ? (
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Approved Deduction Amount (₹):
                  </label>
                  <input
                    type="number"
                    value={customDeductionAmount}
                    onChange={(e) => setCustomDeductionAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    You may adjust the final approved amount if partial company leave exemption was approved.
                  </p>
                </div>
              ) : (
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    HR Exemption / Rejection Reason:
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Enter justification for full salary protection (e.g. Medical emergency verified, Director approval, or COVID recovery period)..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <button
                onClick={() => setIsRejectingDeduction(!isRejectingDeduction)}
                className="text-xs font-semibold text-slate-600 hover:text-slate-900 underline cursor-pointer"
              >
                {isRejectingDeduction ? '← Switch to Approval' : 'Switch to Reject / Grant Exemption'}
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedDeductionModal(null)}
                  className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-200 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                {!isRejectingDeduction ? (
                  <button
                    disabled={submittingAction}
                    onClick={handleApproveSalaryDeduction}
                    className="px-4 py-1.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-xs cursor-pointer flex items-center gap-1.5"
                  >
                    {submittingAction ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                    Confirm & Approve ₹{customDeductionAmount.toLocaleString()}
                  </button>
                ) : (
                  <button
                    disabled={submittingAction}
                    onClick={handleRejectSalaryDeduction}
                    className="px-4 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs cursor-pointer flex items-center gap-1.5"
                  >
                    {submittingAction ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                    Confirm Exemption (No Deduction)
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* QUICK IN-PLACE LEAVE REVIEW MODAL */}
      {selectedLeaveModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in duration-150">
            <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-bold">Review Leave Request</h3>
              </div>
              <button
                onClick={() => setSelectedLeaveModal(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3.5 text-xs text-slate-700">
              <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-2">
                <div className="flex justify-between font-bold text-slate-900 text-sm">
                  <span>{selectedLeaveModal.employeeName}</span>
                  <span className="text-slate-500">{selectedLeaveModal.employeeId}</span>
                </div>
                <div className="text-slate-600">Department: {selectedLeaveModal.department}</div>
                <div className="pt-2 border-t border-slate-200 text-slate-800">
                  <strong>Type & Period:</strong> {selectedLeaveModal.details.leaveType} ({selectedLeaveModal.details.leaveDays} days, {selectedLeaveModal.details.leaveStartDate} to {selectedLeaveModal.details.leaveEndDate})
                </div>
                <div className="text-slate-600">
                  <strong>Reason:</strong> "{selectedLeaveModal.details.reason}"
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  HR Review Remarks (Optional):
                </label>
                <textarea
                  rows={2}
                  placeholder="Add notes for the employee..."
                  value={leaveRemarks}
                  onChange={(e) => setLeaveRemarks(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2">
              <button
                onClick={() => setSelectedLeaveModal(null)}
                className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-200 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                disabled={submittingAction}
                onClick={() => handleReviewLeave('Rejected')}
                className="px-3 py-1.5 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg cursor-pointer flex items-center gap-1"
              >
                <X className="w-3 h-3" /> Reject Leave
              </button>
              <button
                disabled={submittingAction}
                onClick={() => handleReviewLeave('Approved')}
                className="px-4 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs cursor-pointer flex items-center gap-1"
              >
                <Check className="w-3 h-3" /> Approve Leave
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
