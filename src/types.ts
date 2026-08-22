export type Role = 'hr_admin' | 'employee';

export type EmploymentStatus = 'Active' | 'On Leave' | 'Probation' | 'Inactive';

export type AttendanceStatus = 'Present' | 'Late' | 'Absent' | 'Leave' | 'Early Departure';

export type LeaveType = 'Sick Leave' | 'Casual Leave' | 'Paid Time Off' | 'Emergency Leave' | 'Maternity/Paternity';

export type LeaveStatus = 'Pending' | 'Approved' | 'Rejected';

export type DeductionStatus = 'Pending' | 'Approved' | 'Rejected' | 'Applied';

export type WarningSeverity = 'none' | 'warning' | 'exceeded';

export interface Employee {
  id: string;
  employeeId: string; // e.g. EMP001, HR001
  fullName: string;
  email: string;
  contactNumber: string;
  department: string;
  roleTitle: string; // Designation e.g. "Senior Backend Engineer"
  reportingManagerId?: string; // ID of another employee
  reportingManagerName?: string;
  employmentStatus: EmploymentStatus;
  profilePhoto: string;
  monthlySalary: number;
  joinDate: string;
  role: Role; // Access role: hr_admin or employee
  passwordHash?: string; // used for demo auth
}

export interface Department {
  id: string;
  name: string;
  code?: string;
  headOfDepartment?: string;
  headEmployeeId?: string;
  headEmployeeName?: string;
  description: string;
  budget?: number | string;
  employeeCount?: number;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string; // e.g. EMP001
  employeeName: string;
  department: string;
  date: string; // YYYY-MM-DD
  checkIn?: string; // HH:mm:ss
  checkOut?: string; // HH:mm:ss
  workingHours: number; // e.g. 8.5
  status: AttendanceStatus;
  notes?: string;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  leaveType: LeaveType;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  daysCount: number;
  reason: string;
  status: LeaveStatus;
  appliedDate: string;
  reviewedBy?: string;
  reviewDate?: string;
  reviewRemarks?: string;
}

export interface LeaveBalance {
  sickLeave: { total: number; used: number };
  casualLeave: { total: number; used: number };
  paidTimeOff: { total: number; used: number };
  emergencyLeave: { total: number; used: number };
}

export interface AbsencePolicy {
  allowedAbsenceDays: number; // e.g. 12
  warningThresholdDays: number; // e.g. 10
  workingDaysPerMonth: number; // e.g. 30
  deductionPolicyFormula: string; // e.g. "Daily Rate = Monthly Salary / Working Days; Deduction = Daily Rate * Excess Days"
  updatedAt: string;
  updatedBy: string;
}

export interface SalaryDeductionRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  allowedAbsence: number;
  usedAbsence: number;
  excessAbsence: number;
  monthlySalary: number;
  dailyRate: number;
  proposedDeduction: number;
  approvedDeduction?: number;
  reason: string;
  requestDate: string;
  status: DeductionStatus;
  hrApprover?: string;
  approvalDate?: string;
  rejectionReason?: string;
  appliedDate?: string;
  auditRef?: string;
}

export interface WorkforceInsight {
  id: string;
  category: 'Attendance Risk' | 'Absence Risk' | 'Department Health Warning' | 'Repeated Late Attendance' | 'Leave Concentration' | 'Workforce Stability';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  whatHappened: string;
  whyFlagged: string;
  supportingData: string;
  recommendedAction: string;
  targetDepartment?: string;
  targetEmployee?: string;
  generatedAt: string;
}

export interface Notification {
  id: string;
  recipientId: string; // 'all' or specific employeeId
  type: 'leave' | 'attendance' | 'absence_warning' | 'salary_deduction' | 'announcement' | 'profile_update' | 'welcome' | 'warning' | 'governance';
  title: string;
  message: string;
  timestamp: string;
  read?: boolean;
  isRead?: boolean;
  actionLink?: string;
  actionUrl?: string;
  category?: string;
  priority?: string;
  meta?: Record<string, any>;
}

export interface EmailMessage {
  id: string;
  toEmail: string;
  toName: string;
  fromName: string;
  subject: string;
  templateName: string;
  htmlContent: string;
  textContent: string;
  sentAt: string;
  status: 'Delivered' | 'Pending' | 'Failed';
}

export interface AuditLog {
  id: string;
  action: string;
  actorId: string;
  actorName: string;
  actorRole: string;
  targetType: 'Employee' | 'Department' | 'Leave' | 'Attendance' | 'Policy' | 'SalaryDeduction' | 'Profile' | 'Warning' | 'PIP' | 'PerformanceReview' | 'SeparationReview' | 'EmailMessage' | 'EmailTemplate';
  targetId: string;
  details: string;
  timestamp: string;
}

export interface AbsenceSummary {
  employeeId: string;
  employeeName: string;
  department: string;
  allowedLimit: number;
  usedAbsence: number;
  remainingDays: number;
  excessDays: number;
  severity: WarningSeverity;
  monthlySalary: number;
  dailyRate: number;
  potentialDeduction: number;
  deductionStatus?: DeductionStatus;
  deductionRequestId?: string;
  lastAbsenceDate?: string;
}

export type OrgNode = {
  id: string;
  employeeId: string;
  name: string;
  roleTitle: string;
  department: string;
  profilePhoto: string;
  email: string;
  status: EmploymentStatus;
  directReports: OrgNode[];
};

export type HRActionPriority = 'critical' | 'high' | 'medium' | 'informational';
export type HRActionCategory = 'salary' | 'leave' | 'attendance' | 'absence' | 'department' | 'employee' | 'warning' | 'performance' | 'conduct' | 'compliance' | 'pip' | 'separation';
export type HRActionStatus = 'new' | 'pending' | 'in_review' | 'completed' | 'rejected' | 'dismissed';

export type WarningCategory = 'attendance' | 'performance' | 'conduct' | 'compliance' | 'administrative';
export type WarningSeverityLevel = 'advisory' | 'formal_warning' | 'serious_review' | 'separation_review';

export interface EmployeeTask {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  title: string;
  description: string;
  assignedDate: string;
  dueDate: string;
  completedDate?: string;
  status: 'Pending' | 'In Progress' | 'Completed' | 'Overdue';
  wasLate?: boolean;
  performancePeriod: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  qualityRating?: number; // 1 to 5
}

export interface EmployeeWarning {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  roleTitle: string;
  category: WarningCategory;
  warningType: string;
  severity: WarningSeverityLevel;
  origin: 'automatic_rule' | 'manager_report' | 'hr_report';
  incidentDate: string;
  performancePeriod?: string;
  description: string;
  relatedPolicy?: string;
  supportingEvidence: string;
  structuredMetrics?: {
    assignedTasks?: number;
    completedAfterDeadline?: number;
    currentlyOverdue?: number;
    lateArrivals?: number;
    unauthorizedAbsences?: number;
    usedAbsenceDays?: number;
    allowedAbsenceLimit?: number;
    qualityRating?: number;
    policyRuleRef?: string;
    [key: string]: any;
  };
  hrNotes?: string; // confidential, visible only to HR/Admin
  recommendedAction: string;
  reviewDate?: string;
  status: 'Draft' | 'Issued' | 'Under Review' | 'Employee Responded' | 'Action Implemented' | 'Follow-up' | 'Resolved' | 'Closed';
  hrDecision?: 'No Action' | 'Coaching' | 'Verbal Discussion' | 'Written Warning' | 'Performance Improvement Plan' | 'Additional Training' | 'Further Investigation' | 'Management Escalation' | 'Separation Review' | 'Other';
  hrDecisionNotes?: string;
  hrDecisionDate?: string;
  employeeResponse?: {
    responseDate: string;
    explanation: string;
    supportingInfo?: string;
    acknowledgedAt?: string;
  };
  pipId?: string;
  separationReviewId?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface PerformanceReviewRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  reviewerId: string;
  reviewerName: string;
  performancePeriod: string;
  reviewDate: string;
  goals: string;
  kpiMetrics: { metric: string; target: string; achieved: string; status: 'Met' | 'Partially Met' | 'Missed' }[];
  completedWorkSummary: string;
  missedWorkSummary: string;
  qualityObservations: string;
  strengths: string;
  areasForImprovement: string;
  managerFeedback: string;
  employeeResponse?: string;
  overallStatus: 'Meeting Expectations' | 'Needs Improvement' | 'Improvement Required' | 'Exceeding Expectations' | 'Unsatisfactory' | 'Under Review';
  createdAt: string;
}

export interface PerformanceImprovementPlan {
  id: string;
  warningId?: string;
  employeeId: string;
  employeeName: string;
  department: string;
  roleTitle: string;
  managerId: string;
  managerName: string;
  hrOwnerId: string;
  hrOwnerName: string;
  startDate: string;
  deadlineDate: string;
  reviewDates: string[];
  problemAreas: string;
  expectedImprovement: string;
  goals: string;
  kpiMeasurements: string;
  employeeComments?: string;
  status: 'Draft' | 'Active' | 'Progress Review' | 'Successfully Completed' | 'Extended' | 'Unsuccessful' | 'Closed';
  finalReviewNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SeparationReview {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  roleTitle: string;
  initiatedBy: string;
  initiatedByName: string;
  initiatedDate: string;
  primaryReason: string;
  warningHistorySummary: string;
  performanceHistorySummary: string;
  attendanceHistorySummary: string;
  pipHistorySummary: string;
  hrNotes: string; // Confidential
  employeeResponseSummary?: string;
  status: 'Not Started' | 'Under Review' | 'Management Review' | 'Approved' | 'Rejected' | 'Completed';
  managementNotes?: string;
  safetyDisclaimer: string;
  completedDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExplainableRiskScore {
  workPerformanceScore: number; // 0-100%
  attendanceScore: number; // 0-100%
  complianceScore: number; // 0-100%
  overallIndicator: 'Good Standing' | 'Advisory Noted' | 'Review Recommended' | 'Action Required' | 'Critical Review';
  reasons: string[];
  metricsBreakdown: {
    assignedTasks: number;
    missedDeadlines: number;
    overdueTasks: number;
    lateArrivals: number;
    unauthorizedAbsences: number;
    absenceDaysUsed: number;
    allowedAbsenceDays: number;
    activeWarnings: number;
    policyViolations: number;
  };
}

export type EmployeeRiskScore = ExplainableRiskScore;

export interface EmailTemplateDefinition {
  id: string;
  templateName: string;
  name?: string;
  category: 'Performance & PIP' | 'Warnings & Discipline' | 'Warnings & Compliance' | 'Absence & Leave' | 'Payroll & Deductions' | 'Attendance & Payroll' | 'General';
  description: string;
  subject?: string;
  subjectTemplate?: string;
  bodyHtmlTemplate?: string;
  bodyTextTemplate?: string;
  requiredPlaceholders: string[];
  optionalPlaceholders: string[];
  samplePlaceholders?: Record<string, string>;
}

export interface PerformanceMetricsInsight {
  employeeId: string;
  employeeName: string;
  department: string;
  roleTitle: string;
  avatar?: string;
  performancePeriod: string;
  
  // Calculated Task / Project Metrics
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  pendingTasks: number;
  overdueTasks: number;
  
  completionRate: number; // 0-100%
  onTimeCompletions: number;
  delayedCompletions: number;
  onTimeDeliveryRate: number; // 0-100%
  
  averageQualityRating: number; // 1-5 scale
  criticalTaskDeliveryRate: number; // 0-100%
  
  // Calculated Performance Score & Standing
  calculatedPerformanceScore: number; // 0-100
  performanceStanding: 'Exceeding SLA' | 'Meeting Benchmarks' | 'Needs Guidance' | 'Action Required (PIP Recommended)' | 'Critical Delivery Risk';
  
  // Intelligence & Insights
  flaggedAnomalies: string[];
  strengths: string[];
  areasForImprovement: string[];
  recommendedActions: string[];
  pipRecommended: boolean;
  warningRecommended: boolean;
  
  // Existing Status
  activePipId?: string;
  activePipStatus?: string;
  activeWarningsCount: number;
  
  taskBreakdown: EmployeeTask[];
  calculatedAt: string;
}

export interface PerformanceReviewSummary {
  period: string;
  totalEmployeesEvaluated: number;
  averageOrgScore: number;
  overallOnTimeRate: number;
  overallCompletionRate: number;
  pipRecommendedCount: number;
  criticalRiskCount: number;
  insights: PerformanceMetricsInsight[];
}

export interface HRActionItem {
  id: string;
  priority: HRActionPriority;
  category: HRActionCategory;
  title: string;
  subtitle?: string;
  employeeId?: string;
  employeeName?: string;
  department?: string;
  avatar?: string;
  status: HRActionStatus;
  createdAt: string;
  whyFlagged: string;
  details: {
    absenceLimit?: number;
    usedAbsence?: number;
    excessDays?: number;
    remainingDays?: number;
    potentialDeduction?: number;
    approvedDeduction?: number;
    deductionStatus?: string;
    leaveType?: string;
    leaveStartDate?: string;
    leaveEndDate?: string;
    leaveDays?: number;
    lateCount?: number;
    unexcusedCount?: number;
    attendanceRate?: number;
    departmentHealth?: string;
    missingFields?: string[];
    [key: string]: any;
  };
  recommendedAction: string;
  targetView: string;
  targetEntityId?: string;
  primaryActionLabel?: string;
  secondaryActionLabel?: string;
  dismissible?: boolean;
}
