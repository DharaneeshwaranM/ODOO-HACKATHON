import {
  Employee,
  Department,
  AttendanceRecord,
  LeaveRequest,
  AbsencePolicy,
  SalaryDeductionRequest,
  WorkforceInsight,
  Notification,
  EmailMessage,
  AuditLog,
  AbsenceSummary,
  OrgNode,
  HRActionItem,
  EmailTemplateDefinition,
  PerformanceMetricsInsight,
  PerformanceReviewSummary,
} from './types';

const TOKEN_KEY = 'dayflow_auth_token';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeStoredToken() {
  localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || `HTTP error ${response.status}`);
  }

  return data as T;
}

export const api = {
  // Auth
  login: (username: string, password?: string) =>
    request<{ token: string; user: Employee }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),

  getCurrentUser: () =>
    request<{ user: Employee }>('/api/auth/me'),

  logout: () =>
    request<{ message: string }>('/api/auth/logout', {
      method: 'POST',
    }),

  // Employees
  getEmployees: () =>
    request<Employee[]>('/api/employees'),

  getEmployee: (id: string) =>
    request<Employee>(`/api/employees/${id}`),

  createEmployee: (data: Partial<Employee>) =>
    request<Employee>('/api/employees', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateEmployee: (id: string, data: Partial<Employee>) =>
    request<Employee>(`/api/employees/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  toggleEmployeeStatus: (id: string) =>
    request<{ message: string; employee: Employee }>(`/api/employees/${id}`, {
      method: 'DELETE',
    }),

  // Attendance
  getAttendance: (params: { employeeId?: string; department?: string; date?: string; startDate?: string; endDate?: string } = {}) => {
    const search = new URLSearchParams();
    if (params.employeeId) search.set('employeeId', params.employeeId);
    if (params.department) search.set('department', params.department);
    if (params.date) search.set('date', params.date);
    if (params.startDate) search.set('startDate', params.startDate);
    if (params.endDate) search.set('endDate', params.endDate);
    const qs = search.toString() ? `?${search.toString()}` : '';
    return request<AttendanceRecord[]>(`/api/attendance${qs}`);
  },

  checkIn: () =>
    request<{ message: string; record: AttendanceRecord }>('/api/attendance/check-in', {
      method: 'POST',
    }),

  checkOut: () =>
    request<{ message: string; record: AttendanceRecord }>('/api/attendance/check-out', {
      method: 'POST',
    }),

  recordAttendance: (data: { employeeId: string; date: string; checkIn?: string; checkOut?: string; status: string; notes?: string }) =>
    request<AttendanceRecord>('/api/attendance/record', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Leaves
  getLeaves: (params: { employeeId?: string; status?: string; department?: string } = {}) => {
    const search = new URLSearchParams();
    if (params.employeeId) search.set('employeeId', params.employeeId);
    if (params.status) search.set('status', params.status);
    if (params.department) search.set('department', params.department);
    const qs = search.toString() ? `?${search.toString()}` : '';
    return request<LeaveRequest[]>(`/api/leaves${qs}`);
  },

  getLeaveBalance: (employeeId: string) =>
    request<{
      sickLeave: { total: number; used: number };
      casualLeave: { total: number; used: number };
      paidTimeOff: { total: number; used: number };
      emergencyLeave: { total: number; used: number };
    }>(`/api/leaves/balance/${employeeId}`),

  applyLeave: (data: { leaveType: string; startDate: string; endDate: string; reason: string }) =>
    request<LeaveRequest>('/api/leaves', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  reviewLeave: (id: string, data: { status: 'Approved' | 'Rejected'; remarks?: string }) =>
    request<LeaveRequest>(`/api/leaves/${id}/review`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Absence Policy & Monitoring
  getAbsencePolicy: () =>
    request<AbsencePolicy>('/api/absence-policy'),

  updateAbsencePolicy: (data: { allowedAbsenceDays: number; warningThresholdDays: number; workingDaysPerMonth: number }) =>
    request<AbsencePolicy>('/api/absence-policy', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  getAbsenceMonitoring: () =>
    request<{ policy: AbsencePolicy; summaries: AbsenceSummary[] }>('/api/absence-monitoring'),

  // Salary Deductions Workflow
  getSalaryDeductions: () =>
    request<SalaryDeductionRequest[]>('/api/salary-deductions'),

  getSalaryDeduction: (id: string) =>
    request<SalaryDeductionRequest>(`/api/salary-deductions/${id}`),

  approveSalaryDeduction: (id: string, approvedAmount?: number) =>
    request<{ message: string; deduction: SalaryDeductionRequest }>(`/api/salary-deductions/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify({ approvedAmount }),
    }),

  rejectSalaryDeduction: (id: string, rejectionReason?: string) =>
    request<{ message: string; deduction: SalaryDeductionRequest }>(`/api/salary-deductions/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ rejectionReason }),
    }),

  // Departments & Org Chart
  getDepartments: () =>
    request<(Department & { employeeCount: number })[]>('/api/departments'),

  createDepartment: (data: Partial<Department>) =>
    request<Department>('/api/departments', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateDepartment: (id: string, data: Partial<Department>) =>
    request<Department>(`/api/departments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  getOrgChart: () =>
    request<OrgNode[]>('/api/org-chart'),

  getDepartmentHealth: () =>
    request<any[]>('/api/department-health'),

  // Workforce Intelligence
  getWorkforceIntelligence: () =>
    request<WorkforceInsight[]>('/api/workforce-intelligence'),

  runGeminiAIAnalysis: () =>
    request<{ analysis: string; source: string }>('/api/workforce-intelligence/ai-analyze', {
      method: 'POST',
    }),

  // Notifications & Emails
  getNotifications: () =>
    request<Notification[]>('/api/notifications'),

  markNotificationRead: (id: string) =>
    request<{ success: boolean }>(`/api/notifications/${id}/read`, {
      method: 'PUT',
    }),

  markAllNotificationsRead: () =>
    request<{ success: boolean }>('/api/notifications/read-all', {
      method: 'PUT',
    }),

  broadcastNotification: (data: { title: string; message: string }) =>
    request<Notification>('/api/notifications/broadcast', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getEmails: () =>
    request<EmailMessage[]>('/api/emails'),

  // Audit Logs
  getAuditLogs: () =>
    request<AuditLog[]>('/api/audit-logs'),

  // Smart HR Action Center
  getActionCenter: () =>
    request<HRActionItem[]>('/api/action-center'),

  updateActionStatus: (id: string, status: string) =>
    request<{ success: boolean; actionId: string; status: string }>(`/api/action-center/${id}/status`, {
      method: 'POST',
      body: JSON.stringify({ status }),
    }),

  dismissAction: (id: string) =>
    request<{ success: boolean; dismissedId: string }>(`/api/action-center/${id}/dismiss`, {
      method: 'POST',
    }),

  resetActionCenter: () =>
    request<{ success: boolean; message: string }>('/api/action-center/reset', {
      method: 'POST',
    }),

  // Employee Performance, Conduct & Compliance Warning System
  getWarnings: (params: { employeeId?: string; category?: string; severity?: string; status?: string } = {}) => {
    const search = new URLSearchParams();
    if (params.employeeId) search.set('employeeId', params.employeeId);
    if (params.category) search.set('category', params.category);
    if (params.severity) search.set('severity', params.severity);
    if (params.status) search.set('status', params.status);
    const qs = search.toString() ? `?${search.toString()}` : '';
    return request<any[]>(`/api/warnings${qs}`);
  },

  getWarning: (id: string) =>
    request<any>(`/api/warnings/${id}`),

  createWarning: (data: any) =>
    request<any>('/api/warnings', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateWarning: (id: string, data: any) =>
    request<any>(`/api/warnings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  updateWarningStatus: (id: string, status: string) =>
    request<any>(`/api/warnings/${id}/status`, {
      method: 'POST',
      body: JSON.stringify({ status }),
    }),

  recordWarningDecision: (id: string, data: { hrDecision: string; hrDecisionNotes?: string; recommendedAction?: string }) =>
    request<any>(`/api/warnings/${id}/decision`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  submitWarningResponse: (id: string, data: { explanation: string; supportingInfo?: string }) =>
    request<any>(`/api/warnings/${id}/employee-response`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  runAutoDetectWarnings: () =>
    request<{ success: boolean; newWarningsCount: number; detected: any[] }>('/api/warnings/auto-detect', {
      method: 'POST',
    }),

  // Tasks & Performance KPI
  getTasks: (params: { employeeId?: string; performancePeriod?: string; status?: string } = {}) => {
    const search = new URLSearchParams();
    if (params.employeeId) search.set('employeeId', params.employeeId);
    if (params.performancePeriod) search.set('performancePeriod', params.performancePeriod);
    if (params.status) search.set('status', params.status);
    const qs = search.toString() ? `?${search.toString()}` : '';
    return request<any[]>(`/api/tasks${qs}`);
  },

  createTask: (data: any) =>
    request<any>('/api/tasks', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateTask: (id: string, data: any) =>
    request<any>(`/api/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Performance Reviews
  getPerformanceReviews: (params: { employeeId?: string; period?: string } = {}) => {
    const search = new URLSearchParams();
    if (params.employeeId) search.set('employeeId', params.employeeId);
    if (params.period) search.set('period', params.period);
    const qs = search.toString() ? `?${search.toString()}` : '';
    return request<any[]>(`/api/performance-reviews${qs}`);
  },

  createPerformanceReview: (data: any) =>
    request<any>('/api/performance-reviews', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  submitPerformanceReviewResponse: (id: string, data: { employeeResponse: string }) =>
    request<any>(`/api/performance-reviews/${id}/employee-response`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // PIPs
  getPips: (params: { employeeId?: string; status?: string } = {}) => {
    const search = new URLSearchParams();
    if (params.employeeId) search.set('employeeId', params.employeeId);
    if (params.status) search.set('status', params.status);
    const qs = search.toString() ? `?${search.toString()}` : '';
    return request<any[]>(`/api/pips${qs}`);
  },

  getPip: (id: string) =>
    request<any>(`/api/pips/${id}`),

  createPip: (data: any) =>
    request<any>('/api/pips', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updatePip: (id: string, data: any) =>
    request<any>(`/api/pips/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  submitPipComment: (id: string, data: { employeeComments: string }) =>
    request<any>(`/api/pips/${id}/employee-comment`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Separation Reviews (Mandatory Human Authorization)
  getSeparationReviews: () =>
    request<any[]>('/api/separation-reviews'),

  getSeparationReview: (id: string) =>
    request<any>(`/api/separation-reviews/${id}`),

  createSeparationReview: (data: any) =>
    request<any>('/api/separation-reviews', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  recordSeparationDecision: (id: string, data: { status: string; managementNotes?: string }) =>
    request<any>(`/api/separation-reviews/${id}/decision`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Explainable Risk Profile & 360 Timeline
  getEmployeeRiskProfile: (employeeId: string) =>
    request<any>(`/api/employees/${employeeId}/risk-profile`),

  getEmployee360Timeline: (employeeId: string) =>
    request<any[]>(`/api/employees/${employeeId}/360-timeline`),

  // Reusable Email Templates Engine
  getEmailTemplates: () =>
    request<EmailTemplateDefinition[]>('/api/email-templates'),

  previewEmailTemplate: (data: { templateName: string; employeeId?: string; placeholders?: Record<string, any> }) =>
    request<EmailMessage>('/api/email-templates/preview', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  sendEmailTemplate: (data: {
    templateName: string;
    employeeId: string;
    placeholders?: Record<string, any>;
    customSubject?: string;
    customMessage?: string;
  }) =>
    request<EmailMessage>('/api/email-templates/send', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Performance Review Backend Service (Task/Project Metrics Calculation)
  getPerformanceServiceMetrics: (params?: { employeeId?: string; department?: string; period?: string }) => {
    const query = new URLSearchParams();
    if (params?.employeeId) query.set('employeeId', params.employeeId);
    if (params?.department) query.set('department', params.department);
    if (params?.period) query.set('period', params.period);
    const qs = query.toString();
    return request<PerformanceReviewSummary>(`/api/performance-service/metrics${qs ? `?${qs}` : ''}`);
  },

  getEmployeePerformanceServiceMetrics: (employeeId: string) =>
    request<PerformanceMetricsInsight>(`/api/performance-service/employee/${employeeId}`),

  generateReviewFromPerformanceMetrics: (data: {
    employeeId: string;
    performancePeriod?: string;
    customNotes?: string;
  }) =>
    request<{ review: any; metrics: PerformanceMetricsInsight }>('/api/performance-service/generate-review-insight', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};
