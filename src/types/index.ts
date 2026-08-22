export type UserRole = 'hr' | 'employee';

export interface AuthUser {
  id: number;
  username: string;
  userId: string;
  name: string;
  email: string;
  role: UserRole;
  odooGroups: string[];
  departmentName: string;
  departmentId: number;
  jobTitle: string;
  avatar: string;
  employeeId: number;
}

export type RiskLevel = 'low' | 'medium' | 'high';
export type AttendanceTrend = 'improving' | 'stable' | 'declining';
export type AttendanceStatus = 'present' | 'late' | 'half_day' | 'absent' | 'leave';
export type LeaveStatus = 'confirm' | 'validate' | 'refuse';
export type LeaveType = 'Paid Vacation' | 'Sick Leave' | 'Casual Leave' | 'Unpaid Leave';

export type AccountStatus = 'active' | 'onboarding' | 'probation' | 'inactive';
export type EmploymentType = 'Full-time' | 'Part-time' | 'Contract' | 'Intern';

export interface Employee {
  id: number;
  badgeId: string;
  username?: string;
  name: string;
  email: string;
  phone: string;
  jobTitle: string;
  departmentId: number;
  departmentName: string;
  managerName?: string;
  dateOfJoining?: string;
  employmentType?: EmploymentType;
  workLocation?: string;
  accountStatus?: AccountStatus;
  avatar: string;
  riskScore: number;
  riskLevel: RiskLevel;
  attendanceRate: number; // 0-100%
  absenceCount: number; // last 30 days
  leaveCount: number; // last 90 days
  lateCheckinCount: number; // last 30 days
  attendanceTrend: AttendanceTrend;
  riskReasons: string[];
  riskRecommendation: string;
  monthlyWage: number;
  hraAllowance: number;
  specialAllowance: number;
  pfRate: number;
  taxRate: number;
  isEmailVerified: boolean;
  todayCheckedIn: boolean;
  todayCheckinTime?: string;
  todayCheckoutTime?: string;
  todayStatus: AttendanceStatus;
}

export interface CreateMemberPayload {
  name: string;
  employeeId: string;
  username: string;
  email: string;
  phone: string;
  departmentId: number;
  departmentName: string;
  jobPosition: string;
  manager: string;
  dateOfJoining: string;
  employmentType: EmploymentType;
  workLocation: string;
  password: string;
  confirmPassword: string;
  profilePhoto: string;
  accountStatus: AccountStatus;
}

export interface AuditLogEntry {
  id: string;
  action: string;
  performedBy: {
    name: string;
    userId: string;
    role: string;
    email: string;
  };
  targetEmployee: {
    name: string;
    employeeId: string;
    department: string;
    jobPosition: string;
    email: string;
  };
  timestamp: string;
  details: string;
  ipAddress?: string;
  securityGroupChecked: string;
}

export interface Department {
  id: number;
  name: string;
  managerName: string;
  totalStaff: number;
  presentToday: number;
  absentToday: number;
  onLeaveToday: number;
  attendancePct: number;
  availabilityPct: number;
  averageRiskScore: number;
  highRiskCount: number;
  workforceHealthScore: number; // 0-100
  healthStatus: 'excellent' | 'good' | 'warning' | 'critical';
  healthSummary: string;
}

export interface AttendanceRecord {
  id: string;
  employeeId: number;
  employeeName: string;
  departmentName: string;
  date: string;
  checkIn: string;
  checkOut?: string;
  workedHours: number;
  status: AttendanceStatus;
  isLate: boolean;
  lateMinutes: number;
}

export interface LeaveRequest {
  id: string;
  employeeId: number;
  employeeName: string;
  departmentId: number;
  departmentName: string;
  leaveType: LeaveType;
  dateFrom: string;
  dateTo: string;
  numberOfDays: number;
  state: LeaveStatus;
  reason: string;
  impactLevel: 'low' | 'medium' | 'high';
  currentAvailabilityPct: number;
  projectedAvailabilityPct: number;
  hasOverlapWarning: boolean;
  overlapCount: number;
  overlappingEmployees: string[];
  impactRecommendation: string;
  submittedDate: string;
}

export interface WorkforceAlert {
  id: string;
  title: string;
  alertType: 'HIGH_RISK_EMPLOYEE' | 'LOW_DEPARTMENT_AVAILABILITY' | 'DECLINING_ATTENDANCE' | 'LEAVE_OVERLAP' | 'HIGH_ABSENTEEISM' | 'UNUSUAL_ATTENDANCE_PATTERN' | 'WELCOME_EMAIL_DISPATCHED' | 'NEW_MEMBER_ONBOARDED';
  severity: 'low' | 'medium' | 'high' | 'critical';
  employeeId?: number;
  employeeName?: string;
  departmentName?: string;
  reason: string;
  recommendedAction: string;
  isRead: boolean;
  isDismissed: boolean;
  createdAt: string;
  metadata?: {
    emailTo?: string;
    subject?: string;
    deliveredAt?: string;
    smtpStatus?: string;
  };
}

export interface HrInsight {
  id: string;
  headline: string;
  category: 'department' | 'attendance' | 'capacity' | 'retention' | 'payroll';
  impactScope: 'positive' | 'neutral' | 'warning' | 'critical';
  metricEvidence: string;
  description: string;
  recommendedAction: string;
  departmentName?: string;
  confidenceScore: number;
}

export interface CopilotMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  intent?: string;
  data?: any;
  suggestedQuestions?: string[];
}
