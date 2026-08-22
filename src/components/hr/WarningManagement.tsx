import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  AlertOctagon,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  Plus,
  Search,
  Filter,
  ArrowUpRight,
  TrendingDown,
  User,
  Building2,
  Calendar,
  Sparkles,
  RefreshCw,
  MessageSquare,
  Scale,
  Target,
  ChevronRight,
  Eye,
  Edit3,
  Check,
  X,
  Info,
  Layers,
  Award,
  ListTodo,
  ExternalLink,
  ShieldCheck,
  Briefcase,
  Mail,
  Send,
  FileCode,
  BarChart3,
  Activity,
  Star,
  Sliders,
  CheckCircle,
} from 'lucide-react';
import { api } from '../../api';
import {
  EmployeeWarning,
  PerformanceImprovementPlan,
  EmployeeTask,
  SeparationReview,
  WarningCategory,
  WarningSeverityLevel,
  Employee,
  Department,
  EmailTemplateDefinition,
  PerformanceMetricsInsight,
  PerformanceReviewSummary,
  EmailMessage,
} from '../../types';

interface WarningManagementProps {
  initialEmployeeId?: string;
  onViewEmployeeProfile?: (empId: string) => void;
}

export const WarningManagement: React.FC<WarningManagementProps> = ({
  initialEmployeeId,
  onViewEmployeeProfile,
}) => {
  const [activeTab, setActiveTab] = useState<'warnings' | 'insights' | 'pips' | 'tasks' | 'templates' | 'separations'>('warnings');
  const [warnings, setWarnings] = useState<EmployeeWarning[]>([]);
  const [pips, setPips] = useState<PerformanceImprovementPlan[]>([]);
  const [tasks, setTasks] = useState<EmployeeTask[]>([]);
  const [separations, setSeparations] = useState<SeparationReview[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  // Performance Review Service State
  const [perfSummary, setPerfSummary] = useState<PerformanceReviewSummary | null>(null);
  const [perfPeriod, setPerfPeriod] = useState('August 2026');
  const [perfDepartment, setPerfDepartment] = useState('all');
  const [selectedPerfEmpId, setSelectedPerfEmpId] = useState<string>(initialEmployeeId || 'all');
  const [loadingPerfMetrics, setLoadingPerfMetrics] = useState(false);
  const [generatingReviewId, setGeneratingReviewId] = useState<string | null>(null);

  // Email Templates Engine State
  const [templatesCatalog, setTemplatesCatalog] = useState<EmailTemplateDefinition[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplateDefinition | null>(null);
  const [previewEmail, setPreviewEmail] = useState<EmailMessage | null>(null);
  const [templateEmpId, setTemplateEmpId] = useState<string>(initialEmployeeId || '');
  const [templatePlaceholders, setTemplatePlaceholders] = useState<Record<string, string>>({});
  const [customEmailSubject, setCustomEmailSubject] = useState('');
  const [customEmailNote, setCustomEmailNote] = useState('');
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [employeeFilter, setEmployeeFilter] = useState<string>(initialEmployeeId || 'all');

  // Modals
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [selectedWarning, setSelectedWarning] = useState<EmployeeWarning | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isCreatePipModalOpen, setIsCreatePipModalOpen] = useState(false);
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);
  const [isSeparationModalOpen, setIsSeparationModalOpen] = useState(false);
  const [autoDetectRunning, setAutoDetectRunning] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Form States for Issue Warning
  const [targetEmpId, setTargetEmpId] = useState(initialEmployeeId || '');
  const [warningCategory, setWarningCategory] = useState<WarningCategory>('attendance');
  const [warningType, setWarningType] = useState('Repeated Late Arrival');
  const [warningSeverity, setWarningSeverity] = useState<WarningSeverityLevel>('formal_warning');
  const [incidentDate, setIncidentDate] = useState(new Date().toISOString().split('T')[0]);
  const [performancePeriod, setPerformancePeriod] = useState('August 2026');
  const [warningDesc, setWarningDesc] = useState('');
  const [relatedPolicy, setRelatedPolicy] = useState('Attendance & Timekeeping Policy §3.1');
  const [supportingEvidence, setSupportingEvidence] = useState('');
  const [hrNotes, setHrNotes] = useState('');
  const [recommendedAction, setRecommendedAction] = useState('Conduct punctuality review and mandatory attendance check-in.');
  const [submitting, setSubmitting] = useState(false);

  // HR Decision Form on detail modal
  const [hrDecisionType, setHrDecisionType] = useState('Performance Discussion');
  const [hrDecisionNotes, setHrDecisionNotes] = useState('');

  // PIP Form
  const [pipTargetEmpId, setPipTargetEmpId] = useState('');
  const [pipStartDate, setPipStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [pipDeadlineDate, setPipDeadlineDate] = useState('');
  const [pipProblemAreas, setPipProblemAreas] = useState('');
  const [pipGoals, setPipGoals] = useState('');
  const [pipExpectedImprovement, setPipExpectedImprovement] = useState('');
  const [pipReviewDates, setPipReviewDates] = useState('');
  const [pipKpiMeasurements, setPipKpiMeasurements] = useState('');

  // Task Form
  const [taskTargetEmpId, setTaskTargetEmpId] = useState('');
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [taskPriority, setTaskPriority] = useState<'Low' | 'Medium' | 'High' | 'Critical'>('Medium');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [warnsData, pipsData, tasksData, sepsData, empsData, deptsData, tmplsData] = await Promise.all([
        api.getWarnings(),
        api.getPips(),
        api.getTasks(),
        api.getSeparationReviews().catch(() => []),
        api.getEmployees(),
        api.getDepartments(),
        api.getEmailTemplates().catch(() => []),
      ]);
      setWarnings(warnsData);
      setPips(pipsData);
      setTasks(tasksData);
      setSeparations(sepsData);
      const activeEmps = empsData.filter((e) => e.employmentStatus !== 'Inactive');
      setEmployees(activeEmps);
      setDepartments(deptsData);
      setTemplatesCatalog(tmplsData);

      if (tmplsData.length > 0 && !selectedTemplate) {
        setSelectedTemplate(tmplsData[0]);
        setTemplatePlaceholders(tmplsData[0].samplePlaceholders || {});
      }
      if (activeEmps.length > 0 && !templateEmpId) {
        setTemplateEmpId(activeEmps[0].employeeId);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPerformanceMetrics = async (period = perfPeriod, dept = perfDepartment) => {
    try {
      setLoadingPerfMetrics(true);
      const res = await api.getPerformanceServiceMetrics({
        period: period !== 'all' ? period : undefined,
        department: dept !== 'all' ? dept : undefined,
      });
      setPerfSummary(res);
    } catch (err: any) {
      console.error('Error loading performance metrics:', err);
    } finally {
      setLoadingPerfMetrics(false);
    }
  };

  useEffect(() => {
    fetchData();
    fetchPerformanceMetrics();
  }, []);

  useEffect(() => {
    if (initialEmployeeId) {
      setEmployeeFilter(initialEmployeeId);
      setTargetEmpId(initialEmployeeId);
      setSelectedPerfEmpId(initialEmployeeId);
      setTemplateEmpId(initialEmployeeId);
    }
  }, [initialEmployeeId]);

  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setNotificationMsg({ text, type });
    setTimeout(() => setNotificationMsg(null), 4000);
  };

  const handleAutoDetect = async () => {
    try {
      setAutoDetectRunning(true);
      const res = await api.runAutoDetectWarnings();
      if (res.newWarningsCount > 0) {
        showToast(`AI Rules Engine detected and logged ${res.newWarningsCount} performance/attendance anomaly docket(s).`, 'success');
      } else {
        showToast('Auto-detect scan complete: No new unflagged threshold violations identified.', 'info');
      }
      fetchData();
      fetchPerformanceMetrics();
    } catch (err: any) {
      showToast(err.message || 'Auto detect error', 'error');
    } finally {
      setAutoDetectRunning(false);
    }
  };

  const handleIssueWarning = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetEmpId || !warningDesc) {
      showToast('Please select an employee and enter description.', 'error');
      return;
    }

    try {
      setSubmitting(true);
      await api.createWarning({
        employeeId: targetEmpId,
        category: warningCategory,
        warningType,
        severity: warningSeverity,
        incidentDate,
        performancePeriod,
        description: warningDesc,
        relatedPolicy,
        supportingEvidence,
        hrNotes,
        recommendedAction,
      });

      showToast(`Warning docket recorded and official notice dispatched to employee.`, 'success');
      setIsIssueModalOpen(false);
      resetIssueForm();
      fetchData();
      fetchPerformanceMetrics();
    } catch (err: any) {
      showToast(err.message || 'Failed to issue warning', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const resetIssueForm = () => {
    setTargetEmpId(initialEmployeeId || '');
    setWarningCategory('attendance');
    setWarningType('Repeated Late Arrival');
    setWarningSeverity('formal_warning');
    setWarningDesc('');
    setSupportingEvidence('');
    setHrNotes('');
  };

  const handleRecordDecision = async () => {
    if (!selectedWarning) return;
    try {
      setSubmitting(true);
      await api.recordWarningDecision(selectedWarning.id, {
        hrDecision: hrDecisionType,
        hrDecisionNotes,
        recommendedAction: selectedWarning.recommendedAction,
      });
      showToast('HR Decision formally logged and audit trail updated.', 'success');
      setIsDetailModalOpen(false);
      fetchData();
      fetchPerformanceMetrics();
    } catch (err: any) {
      showToast(err.message || 'Failed to record decision', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreatePip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pipTargetEmpId || !pipDeadlineDate || !pipGoals) {
      showToast('Please fill all mandatory PIP fields.', 'error');
      return;
    }

    try {
      setSubmitting(true);
      await api.createPip({
        employeeId: pipTargetEmpId,
        warningId: selectedWarning?.id,
        startDate: pipStartDate,
        deadlineDate: pipDeadlineDate,
        problemAreas: pipProblemAreas,
        goals: pipGoals,
        expectedImprovement: pipExpectedImprovement,
        reviewDates: pipReviewDates,
        kpiMeasurements: pipKpiMeasurements,
      });
      showToast('Performance Improvement Plan initiated and employee notified.', 'success');
      setIsCreatePipModalOpen(false);
      fetchData();
      fetchPerformanceMetrics();
    } catch (err: any) {
      showToast(err.message || 'Failed to create PIP', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGenerateFormalReview = async (empId: string) => {
    try {
      setGeneratingReviewId(empId);
      const res = await api.generateReviewFromPerformanceMetrics({
        employeeId: empId,
        performancePeriod: perfPeriod,
        customNotes: 'Automated milestone velocity & quality evaluation synthesized by Performance Review Service.',
      });
      showToast(`Performance review generated for ${res.metrics.employeeName} (Score: ${res.metrics.calculatedPerformanceScore}/100).`, 'success');
      fetchData();
      fetchPerformanceMetrics();
    } catch (err: any) {
      showToast(err.message || 'Failed to generate review', 'error');
    } finally {
      setGeneratingReviewId(null);
    }
  };

  const handleSelectTemplate = (tmpl: EmailTemplateDefinition, empId?: string) => {
    setSelectedTemplate(tmpl);
    const targetId = empId || templateEmpId || employees[0]?.employeeId;
    const targetEmp = employees.find((e) => e.employeeId === targetId || e.id === targetId);

    const merged = { ...(tmpl.samplePlaceholders || {}) };
    if (targetEmp) {
      merged.employee_name = targetEmp.fullName;
      merged.employee_id = targetEmp.employeeId;
      merged.role_title = targetEmp.roleTitle;
      merged.department = targetEmp.department;
    }
    setTemplatePlaceholders(merged);
    handlePreviewTemplate(tmpl.templateName, targetId, merged);
  };

  const handlePreviewTemplate = async (
    tmplName: string,
    empId: string,
    placeholders: Record<string, string>
  ) => {
    try {
      setLoadingPreview(true);
      const preview = await api.previewEmailTemplate({
        templateName: tmplName,
        employeeId: empId,
        placeholders,
      });
      setPreviewEmail(preview);
    } catch (err: any) {
      console.error('Error previewing template:', err);
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleSendTemplateEmail = async () => {
    if (!selectedTemplate || !templateEmpId) {
      showToast('Please select a template and employee.', 'error');
      return;
    }

    // Validate required placeholders
    for (const reqP of selectedTemplate.requiredPlaceholders) {
      if (!templatePlaceholders[reqP] || templatePlaceholders[reqP].trim() === '') {
        showToast(`Placeholder "${reqP}" is required for ${selectedTemplate.templateName}.`, 'error');
        return;
      }
    }

    try {
      setSendingEmail(true);
      await api.sendEmailTemplate({
        templateName: selectedTemplate.templateName,
        employeeId: templateEmpId,
        placeholders: templatePlaceholders,
        customSubject: customEmailSubject || undefined,
        customMessage: customEmailNote || undefined,
      });
      showToast(`Template "${selectedTemplate.templateName}" successfully dispatched to employee.`, 'success');
      setCustomEmailNote('');
      fetchData();
    } catch (err: any) {
      showToast(err.message || 'Failed to dispatch email template', 'error');
    } finally {
      setSendingEmail(false);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTargetEmpId || !taskTitle || !taskDueDate) {
      showToast('Please fill all required task fields.', 'error');
      return;
    }

    try {
      setSubmitting(true);
      await api.createTask({
        employeeId: taskTargetEmpId,
        title: taskTitle,
        description: taskDesc,
        dueDate: taskDueDate,
        priority: taskPriority,
        performancePeriod: 'August 2026',
      });
      showToast('Sprint Task added to employee performance log.', 'success');
      setIsCreateTaskModalOpen(false);
      setTaskTitle('');
      setTaskDesc('');
      setTaskDueDate('');
      fetchData();
    } catch (err: any) {
      showToast(err.message || 'Failed to create task', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Filtered lists
  const filteredWarnings = warnings.filter((w) => {
    const matchSearch =
      w.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.warningType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.department.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCategory = categoryFilter === 'all' || w.category === categoryFilter;
    const matchSeverity = severityFilter === 'all' || w.severity === severityFilter;
    const matchStatus = statusFilter === 'all' || w.status === statusFilter;
    const matchEmployee = employeeFilter === 'all' || w.employeeId === employeeFilter;
    return matchSearch && matchCategory && matchSeverity && matchStatus && matchEmployee;
  });

  const activeWarningsCount = warnings.filter((w) => w.status !== 'Resolved' && w.status !== 'Closed').length;
  const criticalWarningsCount = warnings.filter((w) => w.severity === 'serious_review' || w.severity === 'separation_review').length;
  const pendingResponsesCount = warnings.filter((w) => w.status === 'Employee Responded').length;
  const activePipsCount = pips.filter((p) => p.status === 'Active' || p.status === 'Progress Review').length;

  const categoryPresets: Record<WarningCategory, string[]> = {
    attendance: ['Repeated Late Arrival', 'Unexcused Absence Streak', 'Pattern Absenteeism (Mondays/Fridays)', 'Missing Check-in Logs'],
    performance: ['Repeated Sprint Deadline Delays', 'Work Quality Deficiencies', 'Failure to Meet KPI Benchmarks', 'Client Milestone Breach'],
    conduct: ['Workplace Insubordination', 'Disruptive Team Communication', 'Inappropriate Language / Behavior', 'Harassment Policy Concern'],
    compliance: ['Information Security Violation', 'Non-Disclosure Compliance Gap', 'Missing Compliance Training Certification', 'Client Confidentiality Leak'],
    administrative: ['Uncompleted Profile Compliance', 'Unauthorized Leave Overstay', 'Equipment Policy Non-Compliance'],
  };

  return (
    <div className="space-y-6">
      {/* Toast Banner */}
      {notificationMsg && (
        <div
          className={`flex items-center justify-between p-3.5 rounded-xl border shadow-xs text-xs font-semibold ${
            notificationMsg.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : notificationMsg.type === 'error'
              ? 'bg-rose-50 text-rose-800 border-rose-200'
              : 'bg-blue-50 text-blue-800 border-blue-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 shrink-0" />
            <span>{notificationMsg.text}</span>
          </div>
          <button onClick={() => setNotificationMsg(null)} className="hover:opacity-70">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Header & Primary Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Performance, Conduct & Compliance System</h1>
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-900 px-2.5 py-0.5 text-[11px] font-semibold text-white">
              <ShieldCheck className="h-3 w-3 text-emerald-400" />
              Governance & Fair Review
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Structured issue documentation, transparent employee response rights, PIP progression, and objective HR decisioning.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleAutoDetect}
            disabled={autoDetectRunning}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition disabled:opacity-50"
            title="Scan task SLAs and attendance records for threshold anomalies"
          >
            <Sparkles className={`h-3.5 w-3.5 text-blue-600 ${autoDetectRunning ? 'animate-spin' : ''}`} />
            <span>{autoDetectRunning ? 'Scanning...' : 'Run Auto-Detection Scan'}</span>
          </button>

          <button
            onClick={() => {
              setTargetEmpId(initialEmployeeId || (employees[0]?.employeeId ?? ''));
              setIsIssueModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition"
          >
            <Plus className="h-4 w-4" />
            <span>Issue Warning / Docket</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Active Dockets</span>
            <ShieldAlert className="h-4 w-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-1">{activeWarningsCount}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Total logged: {warnings.length}</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Serious / Separation</span>
            <AlertOctagon className="h-4 w-4 text-rose-600" />
          </div>
          <p className="text-2xl font-bold text-rose-600 mt-1">{criticalWarningsCount}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Human signoff required</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Employee Responses</span>
            <MessageSquare className="h-4 w-4 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-blue-600 mt-1">{pendingResponsesCount}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Awaiting HR decision review</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Active PIPs</span>
            <Target className="h-4 w-4 text-indigo-600" />
          </div>
          <p className="text-2xl font-bold text-indigo-600 mt-1">{activePipsCount}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">30-day milestone tracker</p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-6 overflow-x-auto">
          <button
            onClick={() => setActiveTab('warnings')}
            className={`pb-3 text-xs font-semibold border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'warnings'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <ShieldAlert className="h-3.5 w-3.5" />
            <span>Warning Dockets</span>
            <span className="ml-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-600 font-bold">
              {warnings.length}
            </span>
          </button>

          <button
            onClick={() => {
              setActiveTab('insights');
              fetchPerformanceMetrics();
            }}
            className={`pb-3 text-xs font-semibold border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'insights'
                ? 'border-indigo-600 text-indigo-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <BarChart3 className="h-3.5 w-3.5 text-indigo-600" />
            <span>Performance Review Service</span>
            {perfSummary && perfSummary.pipRecommendedCount > 0 && (
              <span className="ml-1 rounded-full bg-purple-100 text-purple-800 px-2 py-0.5 text-[10px] font-bold">
                {perfSummary.pipRecommendedCount} Action
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('pips')}
            className={`pb-3 text-xs font-semibold border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'pips'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Target className="h-3.5 w-3.5" />
            <span>Improvement Plans (PIP)</span>
            <span className="ml-1 rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] text-indigo-700 font-bold">
              {pips.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('tasks')}
            className={`pb-3 text-xs font-semibold border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'tasks'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <ListTodo className="h-3.5 w-3.5" />
            <span>Sprint Tasks & SLA</span>
            <span className="ml-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-600 font-bold">
              {tasks.length}
            </span>
          </button>

          <button
            onClick={() => {
              setActiveTab('templates');
              if (templatesCatalog.length > 0) {
                handleSelectTemplate(selectedTemplate || templatesCatalog[0], templateEmpId);
              }
            }}
            className={`pb-3 text-xs font-semibold border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'templates'
                ? 'border-blue-600 text-blue-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Mail className="h-3.5 w-3.5 text-blue-600" />
            <span>PIP & Notice Templates</span>
            <span className="ml-1 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] text-blue-700 font-bold">
              {templatesCatalog.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('separations')}
            className={`pb-3 text-xs font-semibold border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'separations'
                ? 'border-rose-600 text-rose-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Scale className="h-3.5 w-3.5" />
            <span>Separation Reviews (Human Signoff)</span>
            <span className="ml-1 rounded-full bg-rose-50 px-2 py-0.5 text-[10px] text-rose-700 font-bold">
              {separations.length}
            </span>
          </button>
        </nav>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: WARNING DOCKETS LIST */}
      {/* ========================================================= */}
      {activeTab === 'warnings' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search warning dockets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-hidden"
              />
            </div>

            <div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 focus:border-blue-500 focus:outline-hidden"
              >
                <option value="all">All Categories</option>
                <option value="attendance">Attendance & Time</option>
                <option value="performance">Work Performance</option>
                <option value="conduct">Workplace Conduct</option>
                <option value="compliance">Policy & Compliance</option>
                <option value="administrative">Administrative</option>
              </select>
            </div>

            <div>
              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 focus:border-blue-500 focus:outline-hidden"
              >
                <option value="all">All Severities</option>
                <option value="advisory">Advisory</option>
                <option value="formal_warning">Formal Warning</option>
                <option value="serious_review">Serious Review</option>
                <option value="separation_review">Separation Review</option>
              </select>
            </div>

            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 focus:border-blue-500 focus:outline-hidden"
              >
                <option value="all">All Statuses</option>
                <option value="Issued">Issued</option>
                <option value="Under Review">Under Review</option>
                <option value="Employee Responded">Employee Responded</option>
                <option value="Action Implemented">Action Implemented</option>
                <option value="Resolved">Resolved</option>
                <option value="Closed">Closed</option>
              </select>
            </div>

            <div>
              <select
                value={employeeFilter}
                onChange={(e) => setEmployeeFilter(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 focus:border-blue-500 focus:outline-hidden"
              >
                <option value="all">All Employees</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.employeeId}>
                    {emp.fullName} ({emp.employeeId})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Table of Warnings */}
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-2.5 px-3.5">Employee</th>
                    <th className="py-2.5 px-3.5">Category & Type</th>
                    <th className="py-2.5 px-3.5">Severity</th>
                    <th className="py-2.5 px-3.5">Incident Date</th>
                    <th className="py-2.5 px-3.5">Origin</th>
                    <th className="py-2.5 px-3.5">Status & Response</th>
                    <th className="py-2.5 px-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredWarnings.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        No warning dockets match the selected criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredWarnings.map((w) => {
                      const emp = employees.find((e) => e.employeeId === w.employeeId);
                      return (
                        <tr key={w.id} className="hover:bg-slate-50/70 transition">
                          <td className="py-2.5 px-3.5">
                            <div className="flex items-center gap-2.5">
                              {emp?.profilePhoto ? (
                                <img
                                  src={emp.profilePhoto}
                                  alt={w.employeeName}
                                  className="h-7 w-7 rounded-full object-cover border border-slate-200"
                                />
                              ) : (
                                <div className="h-7 w-7 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600 text-[10px]">
                                  {w.employeeName.charAt(0)}
                                </div>
                              )}
                              <div>
                                <p className="font-semibold text-slate-900 leading-tight">{w.employeeName}</p>
                                <p className="text-[10px] text-slate-400">
                                  {w.employeeId} • {w.department}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="py-2.5 px-3.5">
                            <div>
                              <p className="font-semibold text-slate-800 leading-tight">{w.warningType}</p>
                              <span className="inline-block text-[10px] font-medium text-slate-500 capitalize">
                                {w.category}
                              </span>
                            </div>
                          </td>

                          <td className="py-2.5 px-3.5">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                w.severity === 'separation_review'
                                  ? 'bg-rose-100 text-rose-800'
                                  : w.severity === 'serious_review'
                                  ? 'bg-orange-100 text-orange-800'
                                  : w.severity === 'formal_warning'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {w.severity.replace('_', ' ').toUpperCase()}
                            </span>
                          </td>

                          <td className="py-2.5 px-3.5 text-slate-600 font-mono text-[11px]">
                            {w.incidentDate || w.createdAt.split('T')[0]}
                          </td>

                          <td className="py-2.5 px-3.5">
                            <span className="inline-flex items-center gap-1 text-[11px] text-slate-600 capitalize">
                              {w.origin === 'automatic_rule' ? (
                                <>
                                  <Sparkles className="h-3 w-3 text-blue-600" />
                                  <span>Automated Rule</span>
                                </>
                              ) : (
                                <>
                                  <User className="h-3 w-3 text-slate-500" />
                                  <span>{w.origin.replace('_', ' ')}</span>
                                </>
                              )}
                            </span>
                          </td>

                          <td className="py-2.5 px-3.5">
                            <div className="flex flex-col gap-0.5">
                              <span
                                className={`inline-flex items-center w-fit px-2 py-0.5 rounded text-[10px] font-semibold ${
                                  w.status === 'Resolved' || w.status === 'Closed'
                                    ? 'bg-emerald-50 text-emerald-700'
                                    : w.status === 'Employee Responded'
                                    ? 'bg-blue-50 text-blue-700 font-bold animate-pulse'
                                    : w.status === 'Under Review'
                                    ? 'bg-indigo-50 text-indigo-700'
                                    : 'bg-amber-50 text-amber-700'
                                }`}
                              >
                                {w.status}
                              </span>
                              {w.employeeResponse && (
                                <span className="text-[10px] text-blue-600 flex items-center gap-0.5">
                                  <MessageSquare className="h-2.5 w-2.5" /> Response Submitted
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="py-2.5 px-3.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => {
                                  setSelectedWarning(w);
                                  setHrDecisionNotes(w.hrDecisionNotes || '');
                                  if (w.hrDecision) setHrDecisionType(w.hrDecision);
                                  setIsDetailModalOpen(true);
                                }}
                                className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition"
                              >
                                <Eye className="h-3 w-3" />
                                <span>Inspect Docket</span>
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
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: PERFORMANCE REVIEW SERVICE INSIGHTS */}
      {/* ========================================================= */}
      {activeTab === 'insights' && (
        <div className="space-y-4">
          {/* Header & Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div>
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900">Performance Review Backend Service</h3>
                <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700">
                  Task & Milestone SLA Engine
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Calculates objective performance scores, on-time delivery rates, and sprint completion velocity directly from deliverable logs.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={perfPeriod}
                onChange={(e) => {
                  setPerfPeriod(e.target.value);
                  fetchPerformanceMetrics(e.target.value, perfDepartment);
                }}
                className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-700 focus:border-indigo-500 focus:outline-hidden font-medium"
              >
                <option value="August 2026">Period: August 2026</option>
                <option value="July 2026">Period: July 2026</option>
                <option value="Q3 2026">Period: Q3 2026</option>
                <option value="all">All Sprint Periods</option>
              </select>

              <select
                value={perfDepartment}
                onChange={(e) => {
                  setPerfDepartment(e.target.value);
                  fetchPerformanceMetrics(perfPeriod, e.target.value);
                }}
                className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-700 focus:border-indigo-500 focus:outline-hidden font-medium"
              >
                <option value="all">All Departments</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.name}>
                    {dept.name}
                  </option>
                ))}
              </select>

              <select
                value={selectedPerfEmpId}
                onChange={(e) => setSelectedPerfEmpId(e.target.value)}
                className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-700 focus:border-indigo-500 focus:outline-hidden font-medium"
              >
                <option value="all">All Employees</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.employeeId}>
                    {emp.fullName} ({emp.employeeId})
                  </option>
                ))}
              </select>

              <button
                onClick={() => fetchPerformanceMetrics(perfPeriod, perfDepartment)}
                disabled={loadingPerfMetrics}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                <RefreshCw className={`h-3.5 w-3.5 text-indigo-600 ${loadingPerfMetrics ? 'animate-spin' : ''}`} />
                <span>Calculate</span>
              </button>
            </div>
          </div>

          {/* Org Metrics Banner */}
          {perfSummary && (
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-xs">
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Avg Delivery Score</span>
                <p className="text-xl font-bold text-slate-900 mt-1">{perfSummary.averageOrgScore} <span className="text-xs font-normal text-slate-400">/ 100</span></p>
                <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
                  <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: `${perfSummary.averageOrgScore}%` }} />
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-xs">
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">On-Time SLA Rate</span>
                <p className="text-xl font-bold text-emerald-600 mt-1">{perfSummary.overallOnTimeRate}%</p>
                <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
                  <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${perfSummary.overallOnTimeRate}%` }} />
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-xs">
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Completion Velocity</span>
                <p className="text-xl font-bold text-blue-600 mt-1">{perfSummary.overallCompletionRate}%</p>
                <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
                  <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${perfSummary.overallCompletionRate}%` }} />
                </div>
              </div>

              <div className="rounded-xl border border-purple-200 bg-purple-50/70 p-3 shadow-xs">
                <span className="text-[10px] font-bold text-purple-900 uppercase tracking-wider">PIP Recommended</span>
                <p className="text-xl font-bold text-purple-700 mt-1">{perfSummary.pipRecommendedCount}</p>
                <p className="text-[10px] text-purple-600 mt-0.5">Below milestone benchmark</p>
              </div>

              <div className="rounded-xl border border-rose-200 bg-rose-50/70 p-3 shadow-xs">
                <span className="text-[10px] font-bold text-rose-900 uppercase tracking-wider">Critical SLA Risks</span>
                <p className="text-xl font-bold text-rose-700 mt-1">{perfSummary.criticalRiskCount}</p>
                <p className="text-[10px] text-rose-600 mt-0.5">High overdue count</p>
              </div>
            </div>
          )}

          {/* Performance Insights Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {loadingPerfMetrics ? (
              <div className="col-span-2 rounded-xl border border-slate-200 bg-white p-12 text-center text-slate-500 text-xs">
                <RefreshCw className="h-6 w-6 animate-spin mx-auto text-indigo-600 mb-2" />
                Calculating performance metrics from sprint task and deliverable logs...
              </div>
            ) : !perfSummary || perfSummary.insights.length === 0 ? (
              <div className="col-span-2 rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-400 text-xs">
                No performance data found for the selected filter.
              </div>
            ) : (
              perfSummary.insights
                .filter((ins) => selectedPerfEmpId === 'all' || ins.employeeId === selectedPerfEmpId)
                .map((ins) => {
                  const isPipRec = ins.pipRecommended;
                  const isExceeding = ins.performanceStanding === 'Exceeding SLA';
                  const isMeeting = ins.performanceStanding === 'Meeting Benchmarks';

                  return (
                    <div
                      key={ins.employeeId}
                      className={`rounded-xl border bg-white p-4 shadow-xs space-y-3.5 transition ${
                        isPipRec
                          ? 'border-purple-300 ring-1 ring-purple-200'
                          : ins.performanceStanding === 'Critical Delivery Risk'
                          ? 'border-rose-300 ring-1 ring-rose-200'
                          : 'border-slate-200'
                      }`}
                    >
                      {/* Top Row: Employee Profile & Standing Badge */}
                      <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-3">
                          {ins.avatar ? (
                            <img
                              src={ins.avatar}
                              alt={ins.employeeName}
                              className="h-10 w-10 rounded-full object-cover border border-slate-200"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                              {ins.employeeName.charAt(0)}
                            </div>
                          )}
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-slate-900 text-sm">{ins.employeeName}</h4>
                              <span className="text-[10px] font-mono text-slate-400">({ins.employeeId})</span>
                            </div>
                            <p className="text-[11px] text-slate-500 font-medium">
                              {ins.roleTitle} • {ins.department}
                            </p>
                          </div>
                        </div>

                        <div className="text-right">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              isExceeding
                                ? 'bg-emerald-100 text-emerald-800'
                                : isMeeting
                                ? 'bg-blue-100 text-blue-800'
                                : isPipRec
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            <Activity className="h-3 w-3" />
                            {ins.performanceStanding}
                          </span>
                          <p className="text-[10px] font-bold text-slate-700 mt-1">
                            Score: <span className="text-indigo-600 text-xs">{ins.calculatedPerformanceScore}</span> / 100
                          </p>
                        </div>
                      </div>

                      {/* 4 Metric Columns */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50/80 p-2.5 rounded-lg border border-slate-100 text-center text-xs">
                        <div>
                          <span className="text-[10px] font-semibold text-slate-400 uppercase">On-Time SLA</span>
                          <p className={`font-bold text-xs mt-0.5 ${ins.onTimeDeliveryRate >= 90 ? 'text-emerald-700' : ins.onTimeDeliveryRate >= 75 ? 'text-blue-700' : 'text-rose-600'}`}>
                            {ins.onTimeDeliveryRate}%
                          </p>
                          <span className="text-[9px] text-slate-400">{ins.onTimeCompletions} / {ins.completedTasks} on-time</span>
                        </div>

                        <div>
                          <span className="text-[10px] font-semibold text-slate-400 uppercase">Completion</span>
                          <p className="font-bold text-xs text-slate-800 mt-0.5">{ins.completionRate}%</p>
                          <span className="text-[9px] text-slate-400">{ins.completedTasks} / {ins.totalTasks} tasks</span>
                        </div>

                        <div>
                          <span className="text-[10px] font-semibold text-slate-400 uppercase">Quality Rating</span>
                          <p className="font-bold text-xs text-amber-600 mt-0.5 flex items-center justify-center gap-0.5">
                            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                            {ins.averageQualityRating} / 5.0
                          </p>
                          <span className="text-[9px] text-slate-400">Code/Design QA</span>
                        </div>

                        <div>
                          <span className="text-[10px] font-semibold text-slate-400 uppercase">Overdue / Delayed</span>
                          <p className={`font-bold text-xs mt-0.5 ${ins.overdueTasks > 0 ? 'text-rose-600' : 'text-slate-600'}`}>
                            {ins.overdueTasks} past SLA
                          </p>
                          <span className="text-[9px] text-slate-400">{ins.delayedCompletions} delayed</span>
                        </div>
                      </div>

                      {/* Flagged Anomalies */}
                      {ins.flaggedAnomalies.length > 0 && (
                        <div className="bg-amber-50/70 border border-amber-200 rounded-lg p-2.5 text-xs text-amber-900">
                          <div className="flex items-center gap-1.5 font-bold text-[11px] text-amber-950 mb-1">
                            <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
                            <span>Identified Performance Anomalies & Delays</span>
                          </div>
                          <ul className="space-y-0.5 pl-4 list-disc text-[11px] text-amber-800">
                            {ins.flaggedAnomalies.map((anom, idx) => (
                              <li key={idx}>{anom}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Strengths & Improvement Areas */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        <div className="bg-emerald-50/50 p-2 rounded border border-emerald-100">
                          <span className="text-[10px] font-bold text-emerald-900 uppercase">Demonstrated Strengths</span>
                          <p className="text-[11px] text-emerald-800 mt-0.5">{ins.strengths.join(' ')}</p>
                        </div>

                        <div className="bg-slate-50 p-2 rounded border border-slate-200">
                          <span className="text-[10px] font-bold text-slate-700 uppercase">Areas for Guidance</span>
                          <p className="text-[11px] text-slate-600 mt-0.5">{ins.areasForImprovement.join(' ')}</p>
                        </div>
                      </div>

                      {/* Recommended Actions & Action Trigger Buttons */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
                        <div className="flex items-center gap-1.5 text-xs text-slate-600">
                          <span className="font-bold text-[10px] uppercase text-slate-500">Recommended:</span>
                          <span className="text-[11px] font-semibold text-slate-800">{ins.recommendedActions[0]}</span>
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5">
                          <button
                            onClick={() => handleGenerateFormalReview(ins.employeeId)}
                            disabled={generatingReviewId === ins.employeeId}
                            className="inline-flex items-center gap-1 rounded bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-200 transition"
                            title="Synthesizes metrics into a formal Performance Review Record in database"
                          >
                            <FileText className="h-3 w-3 text-indigo-600" />
                            <span>{generatingReviewId === ins.employeeId ? 'Generating...' : 'Save Formal Review'}</span>
                          </button>

                          {ins.pipRecommended && !ins.activePipId && (
                            <button
                              onClick={() => {
                                setPipTargetEmpId(ins.employeeId);
                                setPipProblemAreas(ins.flaggedAnomalies.join('\n') || 'Sprint milestone velocity and delivery deadlines.');
                                setPipGoals(`Achieve 100% on-time sprint task completion across next 4 sprints with zero overdue deliverables.`);
                                setPipExpectedImprovement(`1. Complete 100% of assigned sprint deliverables on or before agreed deadline.\n2. Maintain active status updates daily by 10:00 AM.\n3. Escalate blockers at least 48 hours in advance.`);
                                setPipReviewDates('Weekly Checkpoint: Every Friday at 15:00 UTC');
                                setPipKpiMeasurements('Sprint SLA Delivery Rate ≥ 95%, Task Overdue Count = 0');
                                setIsCreatePipModalOpen(true);
                              }}
                              className="inline-flex items-center gap-1 rounded bg-purple-600 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-purple-700 transition shadow-xs"
                            >
                              <Target className="h-3 w-3" />
                              <span>Initiate 30-Day PIP</span>
                            </button>
                          )}

                          <button
                            onClick={() => {
                              const tmpl = templatesCatalog.find((t) => t.id === 'tmpl_pip_notification') || templatesCatalog[0];
                              if (tmpl) {
                                handleSelectTemplate(tmpl, ins.employeeId);
                                setActiveTab('templates');
                              }
                            }}
                            className="inline-flex items-center gap-1 rounded bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-700 hover:bg-blue-100 transition"
                          >
                            <Mail className="h-3 w-3" />
                            <span>Send Notice Template</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: PERFORMANCE IMPROVEMENT PLANS (PIP) */}
      {/* ========================================================= */}
      {activeTab === 'pips' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500">
              Structured 30-Day Performance Improvement Plans with transparent KPI measurements and periodic progress checkpoints.
            </p>
            <button
              onClick={() => {
                setPipTargetEmpId(employees[0]?.employeeId || '');
                setIsCreatePipModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 transition shadow-xs"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Initiate New PIP</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {pips.length === 0 ? (
              <div className="col-span-2 rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-400">
                No active Performance Improvement Plans.
              </div>
            ) : (
              pips.map((pip) => (
                <div key={pip.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-xs">
                        {pip.employeeName.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-xs">{pip.employeeName}</h3>
                        <p className="text-[11px] text-slate-400">
                          {pip.employeeId} • {pip.department}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        pip.status === 'Completed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : pip.status === 'Active'
                          ? 'bg-indigo-100 text-indigo-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {pip.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-slate-50 p-2 rounded-lg">
                      <span className="text-[10px] font-semibold text-slate-400 uppercase">Duration</span>
                      <p className="font-medium text-slate-700 mt-0.5">
                        {pip.startDate} to {pip.deadlineDate}
                      </p>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-lg">
                      <span className="text-[10px] font-semibold text-slate-400 uppercase">Manager & HR Owner</span>
                      <p className="font-medium text-slate-700 mt-0.5">{pip.managerName}</p>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <p className="text-[11px] font-semibold text-slate-700">Problem Areas:</p>
                    <p className="text-slate-600 bg-rose-50/50 p-2 rounded border border-rose-100 text-[11px]">
                      {pip.problemAreas}
                    </p>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <p className="text-[11px] font-semibold text-slate-700">Specific Goals & Deliverables:</p>
                    <p className="text-slate-600 bg-indigo-50/50 p-2 rounded border border-indigo-100 text-[11px]">
                      {pip.goals}
                    </p>
                  </div>

                  {pip.employeeComments && (
                    <div className="bg-blue-50/50 p-2.5 rounded border border-blue-100 text-xs">
                      <span className="text-[10px] font-bold text-blue-700">Employee Feedback:</span>
                      <p className="text-slate-700 text-[11px] mt-0.5">{pip.employeeComments}</p>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                    <span className="text-[10px] text-slate-400">Target Checkpoint: {pip.deadlineDate}</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={async () => {
                          const nextStatus = pip.status === 'Active' ? 'Progress Review' : 'Completed';
                          await api.updatePip(pip.id, { status: nextStatus });
                          showToast(`Updated PIP status to ${nextStatus}`, 'success');
                          fetchData();
                        }}
                        className="rounded bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition"
                      >
                        Advance Checkpoint
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: SPRINT TASKS & SLA TRACKING */}
      {/* ========================================================= */}
      {activeTab === 'tasks' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500">
              Objective Task Delivery Records: Tracks completion velocity, missed deadlines, and work quality benchmarks.
            </p>
            <button
              onClick={() => {
                setTaskTargetEmpId(employees[0]?.employeeId || '');
                setIsCreateTaskModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 transition shadow-xs"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Assign Sprint Task</span>
            </button>
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-2.5 px-3.5">Task & Description</th>
                  <th className="py-2.5 px-3.5">Employee</th>
                  <th className="py-2.5 px-3.5">Due Date</th>
                  <th className="py-2.5 px-3.5">Status</th>
                  <th className="py-2.5 px-3.5">SLA Flag</th>
                  <th className="py-2.5 px-3.5">Quality Rating</th>
                  <th className="py-2.5 px-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tasks.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      No sprint tasks logged.
                    </td>
                  </tr>
                ) : (
                  tasks.map((task) => (
                    <tr key={task.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-2.5 px-3.5 max-w-xs">
                        <p className="font-semibold text-slate-900 leading-tight">{task.title}</p>
                        <p className="text-[10px] text-slate-500 line-clamp-1">{task.description}</p>
                      </td>

                      <td className="py-2.5 px-3.5 font-medium text-slate-700">
                        {task.employeeName} ({task.employeeId})
                      </td>

                      <td className="py-2.5 px-3.5 font-mono text-[11px] text-slate-600">
                        {task.dueDate}
                      </td>

                      <td className="py-2.5 px-3.5">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold ${
                            task.status === 'Completed'
                              ? 'bg-emerald-50 text-emerald-700'
                              : task.status === 'Overdue'
                              ? 'bg-rose-50 text-rose-700 font-bold'
                              : 'bg-amber-50 text-amber-700'
                          }`}
                        >
                          {task.status}
                        </span>
                      </td>

                      <td className="py-2.5 px-3.5">
                        {task.wasLate ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">
                            <Clock className="h-2.5 w-2.5" /> Late Delivery
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600">
                            <Check className="h-2.5 w-2.5" /> On Time
                          </span>
                        )}
                      </td>

                      <td className="py-2.5 px-3.5 font-bold text-slate-700">
                        {task.qualityRating ? `${task.qualityRating}/5 ★` : '—'}
                      </td>

                      <td className="py-2.5 px-3.5 text-right">
                        {task.status !== 'Completed' && (
                          <button
                            onClick={async () => {
                              await api.updateTask(task.id, { status: 'Completed', qualityRating: 4 });
                              showToast('Marked task as completed', 'success');
                              fetchData();
                            }}
                            className="rounded bg-slate-100 px-2 py-1 text-[10px] font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700"
                          >
                            Mark Completed
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 5: PIP & NOTICE EMAIL TEMPLATES ENGINE */}
      {/* ========================================================= */}
      {activeTab === 'templates' && (
        <div className="space-y-4">
          {/* Top Bar / Catalog Selector */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-blue-600" />
                  <h3 className="text-sm font-bold text-slate-900">Official HR Email Templates Catalog</h3>
                  <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700">
                    Dynamic Parameter Engine
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Standardized, legally vetted notification templates with real-time placeholder interpolation and live preview.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-600">Select Template:</span>
                <select
                  value={selectedTemplate?.id || ''}
                  onChange={(e) => {
                    const tmpl = templatesCatalog.find((t) => t.id === e.target.value);
                    if (tmpl) handleSelectTemplate(tmpl, templateEmpId);
                  }}
                  className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-800 font-bold focus:border-blue-500 focus:outline-hidden"
                >
                  {templatesCatalog.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.templateName} ({t.category})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Template Pills */}
            <div className="flex flex-wrap gap-2 pt-1 border-t border-slate-100">
              {templatesCatalog.map((t) => (
                <button
                  key={t.id}
                  onClick={() => handleSelectTemplate(t, templateEmpId)}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition ${
                    selectedTemplate?.id === t.id
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <FileCode className="h-3 w-3" />
                  <span>{t.templateName}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 2-Column Split: Form on Left, Live Preview on Right */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
            {/* Left Column: Form & Placeholders (5 cols) */}
            <div className="lg:col-span-5 bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-4 text-xs">
              <div className="border-b border-slate-100 pb-2.5">
                <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <Sliders className="h-3.5 w-3.5 text-blue-600" />
                  <span>Configure Template Parameters</span>
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Dynamic placeholders for <strong>{selectedTemplate?.templateName}</strong>
                </p>
              </div>

              {/* Target Employee */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Target Employee *</label>
                <select
                  value={templateEmpId}
                  onChange={(e) => {
                    setTemplateEmpId(e.target.value);
                    if (selectedTemplate) {
                      handleSelectTemplate(selectedTemplate, e.target.value);
                    }
                  }}
                  className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs text-slate-800 font-semibold focus:border-blue-500 focus:outline-hidden"
                >
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.employeeId}>
                      {emp.fullName} ({emp.employeeId}) • {emp.department}
                    </option>
                  ))}
                </select>
              </div>

              {/* Dynamic Required & Optional Placeholders */}
              {selectedTemplate && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <span>Template Placeholders</span>
                    <span className="text-[10px] text-blue-600 font-normal">
                      {selectedTemplate.requiredPlaceholders.length} Required
                    </span>
                  </div>

                  {/* Required PIP specific placeholders rendered as rich inputs */}
                  {selectedTemplate.requiredPlaceholders.map((ph) => {
                    const isMultiline =
                      ph === 'expected_improvement' ||
                      ph === 'goals' ||
                      ph === 'problem_areas' ||
                      ph === 'custom_message';

                    return (
                      <div key={ph}>
                        <div className="flex items-center justify-between mb-1">
                          <label className="font-semibold text-slate-700 capitalize">
                            {ph.replace(/_/g, ' ')} <span className="text-rose-500 font-bold">*</span>
                          </label>
                          <span className="font-mono text-[9px] text-slate-400">{'{{' + ph + '}}'}</span>
                        </div>
                        {isMultiline ? (
                          <textarea
                            rows={ph === 'expected_improvement' || ph === 'goals' ? 3 : 2}
                            value={templatePlaceholders[ph] || ''}
                            onChange={(e) => {
                              const updated = { ...templatePlaceholders, [ph]: e.target.value };
                              setTemplatePlaceholders(updated);
                              handlePreviewTemplate(selectedTemplate.templateName, templateEmpId, updated);
                            }}
                            placeholder={`Enter ${ph.replace(/_/g, ' ')}...`}
                            className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs text-slate-800 focus:border-blue-500 focus:outline-hidden"
                          />
                        ) : (
                          <input
                            type="text"
                            value={templatePlaceholders[ph] || ''}
                            onChange={(e) => {
                              const updated = { ...templatePlaceholders, [ph]: e.target.value };
                              setTemplatePlaceholders(updated);
                              handlePreviewTemplate(selectedTemplate.templateName, templateEmpId, updated);
                            }}
                            placeholder={`e.g. ${ph === 'review_dates' ? 'Weekly every Friday at 15:00 UTC' : ph}`}
                            className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs text-slate-800 focus:border-blue-500 focus:outline-hidden"
                          />
                        )}
                      </div>
                    );
                  })}

                  {/* Optional Placeholders */}
                  {selectedTemplate.optionalPlaceholders
                    .filter((ph) => !selectedTemplate.requiredPlaceholders.includes(ph))
                    .map((ph) => (
                      <div key={ph}>
                        <div className="flex items-center justify-between mb-1">
                          <label className="font-semibold text-slate-600 capitalize">
                            {ph.replace(/_/g, ' ')} <span className="text-slate-400 font-normal text-[10px]">(Optional)</span>
                          </label>
                          <span className="font-mono text-[9px] text-slate-400">{'{{' + ph + '}}'}</span>
                        </div>
                        <input
                          type="text"
                          value={templatePlaceholders[ph] || ''}
                          onChange={(e) => {
                            const updated = { ...templatePlaceholders, [ph]: e.target.value };
                            setTemplatePlaceholders(updated);
                            handlePreviewTemplate(selectedTemplate.templateName, templateEmpId, updated);
                          }}
                          placeholder={`Enter ${ph.replace(/_/g, ' ')}...`}
                          className="w-full rounded-lg border border-slate-200 bg-white p-1.5 text-xs text-slate-800 focus:border-blue-500 focus:outline-hidden"
                        />
                      </div>
                    ))}
                </div>
              )}

              {/* Subject Customization */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Custom Subject Override (Optional)</label>
                <input
                  type="text"
                  value={customEmailSubject}
                  onChange={(e) => setCustomEmailSubject(e.target.value)}
                  placeholder={selectedTemplate?.subjectTemplate || 'Default template subject'}
                  className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs text-slate-800 focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              {/* Custom HR Addendum */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">HR Note / Special Instructions (Optional)</label>
                <textarea
                  rows={2}
                  value={customEmailNote}
                  onChange={(e) => setCustomEmailNote(e.target.value)}
                  placeholder="e.g. Please acknowledge receipt of this notification within 48 business hours."
                  className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs text-slate-800 focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    if (selectedTemplate) {
                      handlePreviewTemplate(selectedTemplate.templateName, templateEmpId, templatePlaceholders);
                    }
                  }}
                  disabled={loadingPreview}
                  className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
                >
                  {loadingPreview ? 'Refreshing...' : 'Refresh Live Preview'}
                </button>

                <button
                  type="button"
                  onClick={handleSendTemplateEmail}
                  disabled={sendingEmail || !selectedTemplate}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition disabled:opacity-50"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>{sendingEmail ? 'Dispatching...' : 'Dispatch Official Email'}</span>
                </button>
              </div>
            </div>

            {/* Right Column: Live Email Render Preview (7 cols) */}
            <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
              {/* Mail Client Header */}
              <div className="bg-slate-900 text-white p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-blue-400" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                      Live Notification Preview
                    </span>
                  </div>
                  <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
                    Template: {selectedTemplate?.templateName}
                  </span>
                </div>

                {previewEmail && (
                  <div className="text-xs space-y-1 pt-1 border-t border-slate-800 text-slate-300">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-400 w-14">To:</span>
                      <span className="font-bold text-white">{previewEmail.to}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-400 w-14">From:</span>
                      <span>Dayflow AI People Operations & Governance &lt;governance@dayflow.internal&gt;</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-400 w-14">Subject:</span>
                      <span className="font-bold text-amber-300">{customEmailSubject || previewEmail.subject}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Email Content Body */}
              <div className="p-5 bg-slate-50 min-h-[420px]">
                {loadingPreview ? (
                  <div className="flex items-center justify-center h-64 text-xs text-slate-400 gap-2">
                    <RefreshCw className="h-5 w-5 animate-spin text-blue-600" />
                    Rendering template preview...
                  </div>
                ) : previewEmail ? (
                  <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
                    {/* Brand Banner */}
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-black text-xs">
                          D
                        </div>
                        <span className="font-bold text-slate-900 text-sm tracking-tight">Dayflow AI</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>

                    {/* HTML Content Render */}
                    <div
                      className="text-xs text-slate-700 space-y-3 leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: previewEmail.htmlContent || '' }}
                    />

                    {/* Custom Note Addendum if entered */}
                    {customEmailNote && (
                      <div className="rounded-lg bg-blue-50 border border-blue-200 p-3 text-xs text-blue-900 mt-3">
                        <span className="font-bold block mb-0.5">HR Officer Addendum:</span>
                        <p>{customEmailNote}</p>
                      </div>
                    )}

                    {/* Official Signature */}
                    <div className="pt-4 border-t border-slate-100 text-xs text-slate-500 space-y-1">
                      <p className="font-bold text-slate-700">Dayflow AI People Operations Team</p>
                      <p className="text-[11px] text-slate-400">
                        Governance, Talent Growth & Compliance Division • Strictly Confidential
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-64 text-xs text-slate-400">
                    Select a template and employee to generate live preview.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 6: SEPARATION REVIEWS (HUMAN SIGNOFF PROTECTED) */}
      {/* ========================================================= */}
      {activeTab === 'separations' && (
        <div className="space-y-4">
          {/* Mandatory Human Authorization Safety Banner */}
          <div className="rounded-xl border border-rose-200 bg-rose-50/80 p-4 shadow-xs">
            <div className="flex items-start gap-3">
              <AlertOctagon className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-rose-900 uppercase tracking-wide">
                  MANDATORY HUMAN AUTHORIZATION REQUIREMENT
                </h4>
                <p className="text-xs text-rose-700 mt-1 leading-relaxed">
                  Dayflow AI is an intelligence & governance platform that <strong>NEVER</strong> automatically terminates, penalizes, or makes irreversible employment decisions about employees.
                  All separation reviews require documented evidence from multiple categories, comprehensive PIP evaluation, executive review, and multi-party human authorization.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500">
              Formal separation review dockets requiring multi-source evidence synthesis and senior management sign-off.
            </p>
            <button
              onClick={() => {
                setTargetEmpId(employees[0]?.employeeId || '');
                setIsSeparationModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-rose-700 transition shadow-xs"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Initiate Separation Review Docket</span>
            </button>
          </div>

          <div className="space-y-3">
            {separations.length === 0 ? (
              <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-400 text-xs">
                Zero open separation reviews.
              </div>
            ) : (
              separations.map((sep) => (
                <div key={sep.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-xs">
                        {sep.employeeName.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-xs">{sep.employeeName}</h4>
                        <p className="text-[11px] text-slate-400">
                          {sep.employeeId} • {sep.department} • Initiated: {sep.initiatedDate}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        sep.status === 'Completed'
                          ? 'bg-rose-100 text-rose-800'
                          : sep.status === 'Under Review'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {sep.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
                      <span className="text-[10px] font-bold text-slate-500 uppercase">Primary Reason</span>
                      <p className="text-slate-800 font-semibold mt-0.5">{sep.primaryReason}</p>
                    </div>

                    <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
                      <span className="text-[10px] font-bold text-slate-500 uppercase">PIP & Performance History</span>
                      <p className="text-slate-700 mt-0.5 text-[11px]">{sep.pipHistorySummary}</p>
                    </div>
                  </div>

                  <div className="bg-rose-50/50 p-2.5 rounded border border-rose-100 text-xs">
                    <span className="text-[10px] font-bold text-rose-800 uppercase">Warning History Summary</span>
                    <p className="text-slate-700 mt-0.5 text-[11px]">{sep.warningHistorySummary}</p>
                  </div>

                  {sep.managementNotes && (
                    <div className="bg-slate-50 p-2.5 rounded text-xs text-slate-700">
                      <span className="text-[10px] font-bold text-slate-600">Executive Notes:</span>
                      <p className="text-[11px] mt-0.5">{sep.managementNotes}</p>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <span className="text-[10px] text-slate-400">Safety Ref: {sep.safetyDisclaimer}</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={async () => {
                          const note = prompt('Enter Management Decision Notes:');
                          if (note) {
                            await api.recordSeparationDecision(sep.id, {
                              status: 'Completed',
                              managementNotes: note,
                            });
                            showToast('Separation review formally closed with authorized signoff.', 'success');
                            fetchData();
                          }
                        }}
                        className="rounded bg-rose-50 px-2.5 py-1 text-[11px] font-semibold text-rose-700 hover:bg-rose-100"
                      >
                        Record Final Decision
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 1: ISSUE NEW WARNING DOCKET */}
      {/* ========================================================= */}
      {isIssueModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-amber-500" />
                <h3 className="text-base font-bold text-slate-900">Issue Employee Warning / Notice Docket</h3>
              </div>
              <button onClick={() => setIsIssueModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleIssueWarning} className="space-y-4 mt-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Target Employee *</label>
                  <select
                    value={targetEmpId}
                    onChange={(e) => setTargetEmpId(e.target.value)}
                    required
                    className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs text-slate-800 focus:border-blue-500 focus:outline-hidden"
                  >
                    <option value="">Select Employee...</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.employeeId}>
                        {emp.fullName} ({emp.employeeId}) • {emp.department}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Warning Category *</label>
                  <select
                    value={warningCategory}
                    onChange={(e) => {
                      const cat = e.target.value as WarningCategory;
                      setWarningCategory(cat);
                      setWarningType(categoryPresets[cat][0] || 'General Concern');
                    }}
                    className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs text-slate-800 focus:border-blue-500 focus:outline-hidden"
                  >
                    <option value="attendance">Attendance & Time</option>
                    <option value="performance">Work Performance</option>
                    <option value="conduct">Workplace Conduct</option>
                    <option value="compliance">Policy & Compliance</option>
                    <option value="administrative">Administrative</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Specific Issue Type *</label>
                  <select
                    value={warningType}
                    onChange={(e) => setWarningType(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs text-slate-800 focus:border-blue-500 focus:outline-hidden"
                  >
                    {categoryPresets[warningCategory].map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Severity Level *</label>
                  <select
                    value={warningSeverity}
                    onChange={(e) => setWarningSeverity(e.target.value as WarningSeverityLevel)}
                    className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs text-slate-800 focus:border-blue-500 focus:outline-hidden font-semibold"
                  >
                    <option value="advisory">Advisory Notice (Informal)</option>
                    <option value="formal_warning">Formal Warning (Recorded)</option>
                    <option value="serious_review">Serious Governance Review</option>
                    <option value="separation_review">Separation Review Docket</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Incident / Evaluation Date</label>
                  <input
                    type="date"
                    value={incidentDate}
                    onChange={(e) => setIncidentDate(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs text-slate-800 focus:border-blue-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Related Policy / Guideline</label>
                  <input
                    type="text"
                    value={relatedPolicy}
                    onChange={(e) => setRelatedPolicy(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs text-slate-800 focus:border-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Factual Description & Incident Narrative *</label>
                <textarea
                  rows={3}
                  value={warningDesc}
                  onChange={(e) => setWarningDesc(e.target.value)}
                  placeholder="Detail the specific observable events, timestamps, sprint metrics, or policy infractions..."
                  required
                  className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs text-slate-800 focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Supporting Evidence / Metrics Reference</label>
                <input
                  type="text"
                  value={supportingEvidence}
                  onChange={(e) => setSupportingEvidence(e.target.value)}
                  placeholder="e.g. 4 missed sprint deliverables on Jira, 5 late check-ins logged in August"
                  className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs text-slate-800 focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Recommended Action</label>
                  <input
                    type="text"
                    value={recommendedAction}
                    onChange={(e) => setRecommendedAction(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs text-slate-800 focus:border-blue-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Confidential HR Notes</label>
                  <input
                    type="text"
                    value={hrNotes}
                    onChange={(e) => setHrNotes(e.target.value)}
                    placeholder="Internal notes visible strictly to HR admins"
                    className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs text-slate-800 focus:border-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="rounded-lg bg-blue-50 p-2.5 text-slate-600 text-[11px] border border-blue-100 flex items-start gap-2">
                <Info className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Employee Rights:</strong> Issuing this warning will immediately dispatch an official notice to the employee's portal and email inbox, with full rights to submit a written explanation and supporting documents.
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsIssueModalOpen(false)}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {submitting ? 'Recording Docket...' : 'Issue Warning & Notify Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: WARNING CASE DETAIL & DECISION ENGINE */}
      {/* ========================================================= */}
      {isDetailModalOpen && selectedWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-3xl rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 my-8 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-amber-500" />
                <div>
                  <h3 className="text-base font-bold text-slate-900 leading-tight">{selectedWarning.warningType}</h3>
                  <p className="text-[11px] text-slate-500">
                    Docket ID: {selectedWarning.id} • Category: {selectedWarning.category.toUpperCase()}
                  </p>
                </div>
              </div>
              <button onClick={() => setIsDetailModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="bg-slate-50 p-2 rounded">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Employee</span>
                <p className="font-semibold text-slate-800 mt-0.5">{selectedWarning.employeeName}</p>
                <p className="text-[10px] text-slate-500">{selectedWarning.employeeId}</p>
              </div>
              <div className="bg-slate-50 p-2 rounded">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Department</span>
                <p className="font-semibold text-slate-800 mt-0.5">{selectedWarning.department}</p>
              </div>
              <div className="bg-slate-50 p-2 rounded">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Severity Level</span>
                <p className="font-bold text-rose-600 mt-0.5 capitalize">{selectedWarning.severity.replace('_', ' ')}</p>
              </div>
              <div className="bg-slate-50 p-2 rounded">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Current Status</span>
                <p className="font-semibold text-blue-600 mt-0.5">{selectedWarning.status}</p>
              </div>
            </div>

            <div className="space-y-1 bg-slate-50/70 p-3 rounded-lg border border-slate-200">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Incident Narrative & Description</span>
              <p className="text-slate-800 leading-relaxed text-xs mt-1">{selectedWarning.description}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Supporting Evidence</span>
                <p className="text-slate-700 text-[11px] mt-0.5">{selectedWarning.supportingEvidence || 'None'}</p>
              </div>
              <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Related Policy Reference</span>
                <p className="text-slate-700 text-[11px] mt-0.5">{selectedWarning.relatedPolicy}</p>
              </div>
            </div>

            {/* Employee Written Response Section */}
            <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-blue-900 font-bold text-xs">
                  <MessageSquare className="h-4 w-4 text-blue-600" />
                  <span>Employee Written Explanation & Defense</span>
                </div>
                {selectedWarning.employeeResponse ? (
                  <span className="text-[10px] text-blue-700 font-medium font-mono">
                    Submitted: {new Date(selectedWarning.employeeResponse.responseDate).toLocaleDateString()}
                  </span>
                ) : (
                  <span className="text-[10px] text-amber-700 bg-amber-100 px-2 py-0.5 rounded font-bold">
                    Pending Employee Response
                  </span>
                )}
              </div>

              {selectedWarning.employeeResponse ? (
                <div className="space-y-1.5 bg-white p-3 rounded-lg border border-blue-100">
                  <p className="text-slate-800 text-xs leading-relaxed">
                    "{selectedWarning.employeeResponse.explanation}"
                  </p>
                  {selectedWarning.employeeResponse.supportingInfo && (
                    <p className="text-[11px] text-slate-500 italic border-t border-slate-100 pt-1">
                      Supporting context: {selectedWarning.employeeResponse.supportingInfo}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-[11px] text-slate-500 italic">
                  The employee has been notified and may submit an official response via their employee portal.
                </p>
              )}
            </div>

            {/* Decision Engine */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
              <div className="flex items-center gap-1.5 text-slate-900 font-bold text-xs">
                <Scale className="h-4 w-4 text-indigo-600" />
                <span>HR Action Decision Engine</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Select HR Decision Outcome</label>
                  <select
                    value={hrDecisionType}
                    onChange={(e) => setHrDecisionType(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs text-slate-800 focus:border-blue-500 focus:outline-hidden font-semibold"
                  >
                    <option value="Performance Discussion">1-on-1 Performance Discussion</option>
                    <option value="Performance Improvement Plan">Initiate 30-Day PIP</option>
                    <option value="Internal Role Transfer">Internal Department / Role Reassignment</option>
                    <option value="Salary Deduction Escalation">Salary Deduction Escalation</option>
                    <option value="Serious Governance Review">Serious Governance Review</option>
                    <option value="Formal Separation Review">Initiate Separation Review (Multi-Party)</option>
                    <option value="No Action">No Further Action (Case Closed)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Decision Notes & Audit Justification</label>
                  <input
                    type="text"
                    value={hrDecisionNotes}
                    onChange={(e) => setHrDecisionNotes(e.target.value)}
                    placeholder="Enter formal justification for recorded outcome..."
                    className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs text-slate-800 focus:border-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setPipTargetEmpId(selectedWarning.employeeId);
                      setPipProblemAreas(selectedWarning.description);
                      setPipGoals(`Improve adherence to ${selectedWarning.relatedPolicy}`);
                      setIsCreatePipModalOpen(true);
                    }}
                    className="inline-flex items-center gap-1 rounded bg-indigo-50 px-2.5 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 transition"
                  >
                    <Target className="h-3.5 w-3.5" />
                    <span>Convert to 30-Day PIP</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsDetailModalOpen(false)}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    onClick={handleRecordDecision}
                    disabled={submitting}
                    className="rounded-lg bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition"
                  >
                    {submitting ? 'Saving...' : 'Record Decision & Notify'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 3: INITIATE PIP */}
      {/* ========================================================= */}
      {isCreatePipModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900">Initiate Performance Improvement Plan (PIP)</h3>
              </div>
              <button onClick={() => setIsCreatePipModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreatePip} className="space-y-3 mt-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Target Employee *</label>
                <select
                  value={pipTargetEmpId}
                  onChange={(e) => setPipTargetEmpId(e.target.value)}
                  required
                  className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs text-slate-800 focus:border-blue-500 focus:outline-hidden"
                >
                  <option value="">Select Employee...</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.employeeId}>
                      {emp.fullName} ({emp.employeeId}) • {emp.department}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={pipStartDate}
                    onChange={(e) => setPipStartDate(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs text-slate-800 focus:border-blue-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Target Deadline Date *</label>
                  <input
                    type="date"
                    value={pipDeadlineDate}
                    onChange={(e) => setPipDeadlineDate(e.target.value)}
                    required
                    className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs text-slate-800 focus:border-blue-500 focus:outline-hidden font-bold text-indigo-700"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Identified Problem Areas *</label>
                <textarea
                  rows={2}
                  value={pipProblemAreas}
                  onChange={(e) => setPipProblemAreas(e.target.value)}
                  placeholder="e.g. Consistently missed sprint delivery dates, substandard code coverage..."
                  required
                  className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs text-slate-800 focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Target Goals & Measurable Deliverables *</label>
                <textarea
                  rows={2}
                  value={pipGoals}
                  onChange={(e) => setPipGoals(e.target.value)}
                  placeholder="e.g. 100% on-time sprint task completion over 30 days, zero unexcused absences..."
                  required
                  className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs text-slate-800 focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Expected Improvement *</label>
                <textarea
                  rows={2}
                  value={pipExpectedImprovement}
                  onChange={(e) => setPipExpectedImprovement(e.target.value)}
                  placeholder="e.g. Daily blocker escalation before 10:00 AM, minimum 85% test code coverage..."
                  className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs text-slate-800 focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Review Dates & Checkpoints *</label>
                  <input
                    type="text"
                    value={pipReviewDates}
                    onChange={(e) => setPipReviewDates(e.target.value)}
                    placeholder="e.g. Weekly every Friday at 15:00 UTC"
                    className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs text-slate-800 focus:border-blue-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">KPI Measurement Benchmarks</label>
                  <input
                    type="text"
                    value={pipKpiMeasurements}
                    onChange={(e) => setPipKpiMeasurements(e.target.value)}
                    placeholder="e.g. Sprint SLA Delivery Rate ≥ 95%"
                    className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs text-slate-800 focus:border-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    const pipTmpl = templatesCatalog.find((t) => t.id === 'tmpl_pip_notification') || templatesCatalog[0];
                    if (pipTmpl) {
                      const emp = employees.find((e) => e.employeeId === pipTargetEmpId);
                      setTemplateEmpId(pipTargetEmpId);
                      setTemplatePlaceholders({
                        employee_name: emp?.fullName || '',
                        employee_id: emp?.employeeId || '',
                        role_title: emp?.roleTitle || '',
                        department: emp?.department || '',
                        start_date: pipStartDate,
                        deadline_date: pipDeadlineDate,
                        problem_areas: pipProblemAreas,
                        goals: pipGoals,
                        expected_improvement: pipExpectedImprovement,
                        review_dates: pipReviewDates,
                        kpi_measurements: pipKpiMeasurements,
                        manager_name: emp?.managerName || 'Operations Lead',
                        hr_owner_name: 'HR Governance Desk',
                      });
                      setIsCreatePipModalOpen(false);
                      setActiveTab('templates');
                    }
                  }}
                  className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-semibold"
                >
                  <Mail className="h-3.5 w-3.5" />
                  <span>Preview Email Notice Template</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsCreatePipModalOpen(false)}
                    className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 transition"
                  >
                    {submitting ? 'Initiating...' : 'Initiate 30-Day PIP'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 4: CREATE SPRINT TASK */}
      {/* ========================================================= */}
      {isCreateTaskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <ListTodo className="h-5 w-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900">Assign Sprint Task</h3>
              </div>
              <button onClick={() => setIsCreateTaskModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-3 mt-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Employee *</label>
                <select
                  value={taskTargetEmpId}
                  onChange={(e) => setTaskTargetEmpId(e.target.value)}
                  required
                  className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs text-slate-800 focus:border-blue-500 focus:outline-hidden"
                >
                  <option value="">Select Employee...</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.employeeId}>
                      {emp.fullName} ({emp.employeeId}) • {emp.department}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Task Title *</label>
                <input
                  type="text"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="e.g. Implement payment gateway webhook idempotency"
                  required
                  className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs text-slate-800 focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={taskDesc}
                  onChange={(e) => setTaskDesc(e.target.value)}
                  placeholder="Deliverable specifications, testing requirements..."
                  className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs text-slate-800 focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Due Date *</label>
                  <input
                    type="date"
                    value={taskDueDate}
                    onChange={(e) => setTaskDueDate(e.target.value)}
                    required
                    className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs text-slate-800 focus:border-blue-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Priority</label>
                  <select
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value as any)}
                    className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs text-slate-800 focus:border-blue-500 focus:outline-hidden"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateTaskModalOpen(false)}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition"
                >
                  {submitting ? 'Assigning...' : 'Assign Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 5: INITIATE SEPARATION REVIEW */}
      {/* ========================================================= */}
      {isSeparationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl border border-rose-200 my-8 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Scale className="h-5 w-5 text-rose-600" />
                <h3 className="text-base font-bold text-slate-900">Initiate Separation Review Docket</h3>
              </div>
              <button onClick={() => setIsSeparationModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="rounded-lg bg-rose-50 p-3 border border-rose-100 text-rose-900 text-[11px] leading-relaxed">
              <strong>Human Sign-off Enforcement:</strong> This action creates a formal review docket requiring multi-source evidence synthesis. It does NOT automatically terminate or penalize the employee.
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Target Employee *</label>
              <select
                value={targetEmpId}
                onChange={(e) => setTargetEmpId(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs text-slate-800 focus:border-blue-500 focus:outline-hidden"
              >
                <option value="">Select Employee...</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.employeeId}>
                    {emp.fullName} ({emp.employeeId}) • {emp.department}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Primary Grounds for Review</label>
              <input
                type="text"
                placeholder="e.g. Critical policy violation or unfulfilled PIP benchmarks"
                id="sep_reason"
                className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs text-slate-800 focus:border-blue-500 focus:outline-hidden"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsSeparationModalOpen(false)}
                className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  const input = (document.getElementById('sep_reason') as HTMLInputElement)?.value;
                  await api.createSeparationReview({
                    employeeId: targetEmpId,
                    primaryReason: input || 'Multi-category formal review',
                  });
                  showToast('Separation Review docket created for executive authorization.', 'success');
                  setIsSeparationModalOpen(false);
                  fetchData();
                }}
                className="rounded-lg bg-rose-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-rose-700 transition"
              >
                Create Separation Review Docket
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
