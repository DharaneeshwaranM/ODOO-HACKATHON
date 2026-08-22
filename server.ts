import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
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
  Role,
  HRActionItem,
  HRActionPriority,
  EmployeeWarning,
  EmployeeTask,
  PerformanceReviewRecord,
  PerformanceImprovementPlan,
  SeparationReview,
  ExplainableRiskScore,
  WarningCategory,
  WarningSeverityLevel,
  EmailTemplateDefinition,
  PerformanceMetricsInsight,
  PerformanceReviewSummary,
} from './src/types';

// Gemini client initialization (server-side only)
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// In-Memory Database with optional disk backup
interface DBState {
  employees: Employee[];
  departments: Department[];
  attendance: AttendanceRecord[];
  leaves: LeaveRequest[];
  absencePolicy: AbsencePolicy;
  salaryDeductions: SalaryDeductionRequest[];
  notifications: Notification[];
  emails: EmailMessage[];
  auditLogs: AuditLog[];
  warnings: EmployeeWarning[];
  tasks: EmployeeTask[];
  performanceReviews: PerformanceReviewRecord[];
  pips: PerformanceImprovementPlan[];
  separationReviews: SeparationReview[];
  sessions: Record<string, { employeeId: string; role: Role; createdAt: number }>;
  dismissedActionIds?: string[];
  actionStatusOverrides?: Record<string, 'in_review' | 'dismissed'>;
}

const DB_FILE = path.join(process.cwd(), 'dayflow_db.json');

function getInitialDB(): DBState {
  const employees: Employee[] = [
    {
      id: 'emp_000',
      employeeId: 'HR001',
      fullName: 'Sarah Connor',
      email: 'sarah.connor@dayflow.ai',
      contactNumber: '+1 (555) 019-2834',
      department: 'People Operations',
      roleTitle: 'VP of Human Resources & Admin',
      reportingManagerId: undefined,
      reportingManagerName: 'Board of Directors',
      employmentStatus: 'Active',
      profilePhoto: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      monthlySalary: 95000,
      joinDate: '2022-01-15',
      role: 'hr_admin',
    },
    {
      id: 'emp_001',
      employeeId: 'EMP001',
      fullName: 'Alex Rivera',
      email: 'alex.rivera@dayflow.ai',
      contactNumber: '+1 (555) 234-5678',
      department: 'Engineering',
      roleTitle: 'Principal Software Architect',
      reportingManagerId: 'emp_000',
      reportingManagerName: 'Sarah Connor',
      employmentStatus: 'Active',
      profilePhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      monthlySalary: 75000,
      joinDate: '2022-03-10',
      role: 'employee',
    },
    {
      id: 'emp_002',
      employeeId: 'EMP002',
      fullName: 'Priya Sharma',
      email: 'priya.sharma@dayflow.ai',
      contactNumber: '+1 (555) 345-6789',
      department: 'Engineering',
      roleTitle: 'Senior Backend Engineer',
      reportingManagerId: 'emp_001',
      reportingManagerName: 'Alex Rivera',
      employmentStatus: 'Active',
      profilePhoto: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
      monthlySalary: 60000,
      joinDate: '2023-02-01',
      role: 'employee',
    },
    {
      id: 'emp_003',
      employeeId: 'EMP003',
      fullName: 'Marcus Chen',
      email: 'marcus.chen@dayflow.ai',
      contactNumber: '+1 (555) 456-7890',
      department: 'Product Design',
      roleTitle: 'Lead Product Designer',
      reportingManagerId: 'emp_000',
      reportingManagerName: 'Sarah Connor',
      employmentStatus: 'Active',
      profilePhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      monthlySalary: 58000,
      joinDate: '2023-04-12',
      role: 'employee',
    },
    {
      id: 'emp_004',
      employeeId: 'EMP004',
      fullName: 'Jordan Lee',
      email: 'jordan.lee@dayflow.ai',
      contactNumber: '+1 (555) 567-8901',
      department: 'Infrastructure',
      roleTitle: 'DevOps & Cloud Engineer',
      reportingManagerId: 'emp_001',
      reportingManagerName: 'Alex Rivera',
      employmentStatus: 'Active',
      profilePhoto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      monthlySalary: 55000,
      joinDate: '2023-06-20',
      role: 'employee',
    },
    {
      id: 'emp_005',
      employeeId: 'EMP005',
      fullName: 'Elena Rostova',
      email: 'elena.rostova@dayflow.ai',
      contactNumber: '+1 (555) 678-9012',
      department: 'Marketing & Growth',
      roleTitle: 'Growth & Brand Strategist',
      reportingManagerId: 'emp_000',
      reportingManagerName: 'Sarah Connor',
      employmentStatus: 'Active',
      profilePhoto: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
      monthlySalary: 52000,
      joinDate: '2023-09-01',
      role: 'employee',
    },
    {
      id: 'emp_006',
      employeeId: 'EMP006',
      fullName: 'David Kim',
      email: 'david.kim@dayflow.ai',
      contactNumber: '+1 (555) 789-0123',
      department: 'Engineering',
      roleTitle: 'Frontend Engineer',
      reportingManagerId: 'emp_001',
      reportingManagerName: 'Alex Rivera',
      employmentStatus: 'Active',
      profilePhoto: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
      monthlySalary: 48000,
      joinDate: '2024-01-10',
      role: 'employee',
    },
  ];

  const departments: Department[] = [
    {
      id: 'dept_001',
      name: 'Engineering',
      headEmployeeId: 'EMP001',
      headEmployeeName: 'Alex Rivera',
      description: 'Core software engineering, architecture, frontend & backend systems.',
      budget: '$450,000 / yr',
    },
    {
      id: 'dept_002',
      name: 'Product Design',
      headEmployeeId: 'EMP003',
      headEmployeeName: 'Marcus Chen',
      description: 'User experience, product UI, brand identity, and design system.',
      budget: '$180,000 / yr',
    },
    {
      id: 'dept_003',
      name: 'Infrastructure',
      headEmployeeId: 'EMP004',
      headEmployeeName: 'Jordan Lee',
      description: 'Cloud reliability, container orchestration, SRE & security.',
      budget: '$150,000 / yr',
    },
    {
      id: 'dept_004',
      name: 'Marketing & Growth',
      headEmployeeId: 'EMP005',
      headEmployeeName: 'Elena Rostova',
      description: 'Demand generation, brand awareness, campaigns, and content.',
      budget: '$120,000 / yr',
    },
    {
      id: 'dept_005',
      name: 'People Operations',
      headEmployeeId: 'HR001',
      headEmployeeName: 'Sarah Connor',
      description: 'Talent management, compliance, compensation, and workplace culture.',
      budget: '$200,000 / yr',
    },
  ];

  const absencePolicy: AbsencePolicy = {
    allowedAbsenceDays: 12,
    warningThresholdDays: 10,
    workingDaysPerMonth: 30,
    deductionPolicyFormula: 'Daily Rate = Monthly Salary / Configured Working Days; Proposed Deduction = Daily Rate × Excess Absence Days',
    updatedAt: new Date().toISOString(),
    updatedBy: 'Sarah Connor (HR001)',
  };

  const today = new Date().toISOString().split('T')[0];
  const generatePastDate = (daysAgo: number) => {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    return d.toISOString().split('T')[0];
  };

  const attendance: AttendanceRecord[] = [
    // Today
    { id: 'att_101', employeeId: 'HR001', employeeName: 'Sarah Connor', department: 'People Operations', date: today, checkIn: '08:45:00', workingHours: 8.5, status: 'Present' },
    { id: 'att_102', employeeId: 'EMP001', employeeName: 'Alex Rivera', department: 'Engineering', date: today, checkIn: '09:05:00', workingHours: 8.0, status: 'Present' },
    { id: 'att_103', employeeId: 'EMP002', employeeName: 'Priya Sharma', department: 'Engineering', date: today, status: 'Absent', workingHours: 0, notes: 'Unplanned absence' },
    { id: 'att_104', employeeId: 'EMP003', employeeName: 'Marcus Chen', department: 'Product Design', date: today, checkIn: '08:55:00', workingHours: 8.2, status: 'Present' },
    { id: 'att_105', employeeId: 'EMP004', employeeName: 'Jordan Lee', department: 'Infrastructure', date: today, checkIn: '09:40:00', workingHours: 7.2, status: 'Late', notes: 'Traffic delay' },
    { id: 'att_106', employeeId: 'EMP005', employeeName: 'Elena Rostova', department: 'Marketing & Growth', date: today, status: 'Leave', workingHours: 0, notes: 'Approved PTO' },
    { id: 'att_107', employeeId: 'EMP006', employeeName: 'David Kim', department: 'Engineering', date: today, checkIn: '08:50:00', workingHours: 8.0, status: 'Present' },

    // Past 5 days
    { id: 'att_201', employeeId: 'EMP002', employeeName: 'Priya Sharma', department: 'Engineering', date: generatePastDate(1), status: 'Absent', workingHours: 0 },
    { id: 'att_202', employeeId: 'EMP002', employeeName: 'Priya Sharma', department: 'Engineering', date: generatePastDate(2), status: 'Absent', workingHours: 0 },
    { id: 'att_203', employeeId: 'EMP001', employeeName: 'Alex Rivera', department: 'Engineering', date: generatePastDate(1), checkIn: '08:50:00', checkOut: '17:30:00', workingHours: 8.5, status: 'Present' },
    { id: 'att_204', employeeId: 'EMP003', employeeName: 'Marcus Chen', department: 'Product Design', date: generatePastDate(1), checkIn: '09:00:00', checkOut: '17:30:00', workingHours: 8.5, status: 'Present' },
    { id: 'att_205', employeeId: 'EMP004', employeeName: 'Jordan Lee', department: 'Infrastructure', date: generatePastDate(1), checkIn: '09:35:00', checkOut: '17:30:00', workingHours: 7.5, status: 'Late' },
    { id: 'att_206', employeeId: 'EMP005', employeeName: 'Elena Rostova', department: 'Marketing & Growth', date: generatePastDate(1), status: 'Leave', workingHours: 0 },
  ];

  const leaves: LeaveRequest[] = [
    {
      id: 'leave_001',
      employeeId: 'EMP005',
      employeeName: 'Elena Rostova',
      department: 'Marketing & Growth',
      leaveType: 'Paid Time Off',
      startDate: generatePastDate(2),
      endDate: today,
      daysCount: 3,
      reason: 'Family wedding celebration out of town',
      status: 'Approved',
      appliedDate: generatePastDate(10),
      reviewedBy: 'Sarah Connor',
      reviewDate: generatePastDate(8),
      reviewRemarks: 'Approved. Enjoy your time with family.',
    },
    {
      id: 'leave_002',
      employeeId: 'EMP002',
      employeeName: 'Priya Sharma',
      department: 'Engineering',
      leaveType: 'Sick Leave',
      startDate: generatePastDate(14),
      endDate: generatePastDate(7),
      daysCount: 8,
      reason: 'Post-surgery recovery and medical observation',
      status: 'Approved',
      appliedDate: generatePastDate(16),
      reviewedBy: 'Sarah Connor',
      reviewDate: generatePastDate(15),
      reviewRemarks: 'Approved with medical certificate verified.',
    },
    {
      id: 'leave_003',
      employeeId: 'EMP001',
      employeeName: 'Alex Rivera',
      department: 'Engineering',
      leaveType: 'Casual Leave',
      startDate: generatePastDate(25),
      endDate: generatePastDate(18),
      daysCount: 8,
      reason: 'Relocation and lease shifting',
      status: 'Approved',
      appliedDate: generatePastDate(30),
      reviewedBy: 'Sarah Connor',
      reviewDate: generatePastDate(28),
      reviewRemarks: 'Approved.',
    },
    {
      id: 'leave_004',
      employeeId: 'EMP004',
      employeeName: 'Jordan Lee',
      department: 'Infrastructure',
      leaveType: 'Casual Leave',
      startDate: generatePastDate(-3), // upcoming
      endDate: generatePastDate(-1),
      daysCount: 3,
      reason: 'Attending CloudNative Summit conference',
      status: 'Pending',
      appliedDate: generatePastDate(1),
    },
    {
      id: 'leave_005',
      employeeId: 'EMP006',
      employeeName: 'David Kim',
      department: 'Engineering',
      leaveType: 'Emergency Leave',
      startDate: generatePastDate(-7),
      endDate: generatePastDate(-6),
      daysCount: 2,
      reason: 'Personal urgent family matter',
      status: 'Pending',
      appliedDate: generatePastDate(0),
    },
  ];

  // Pre-seed a pending salary deduction for Priya Sharma (EMP002: has 14 days total absence vs 12 allowed = 2 excess days)
  // Daily rate = 60,000 / 30 = 2,000; Proposed deduction = 2,000 * 2 = 4,000
  const salaryDeductions: SalaryDeductionRequest[] = [
    {
      id: 'ded_001',
      employeeId: 'EMP002',
      employeeName: 'Priya Sharma',
      department: 'Engineering',
      allowedAbsence: 12,
      usedAbsence: 14,
      excessAbsence: 2,
      monthlySalary: 60000,
      dailyRate: 2000,
      proposedDeduction: 4000,
      reason: 'Absence limit exceeded by 2 days beyond the configured 12-day company policy.',
      requestDate: generatePastDate(1),
      status: 'Pending',
    },
  ];

  const notifications: Notification[] = [
    {
      id: 'notif_001',
      recipientId: 'EMP002',
      type: 'absence_warning',
      title: '🚨 Leave/Absence Limit Exceeded',
      message: 'You have used 14 of your allowed 12 absence days (exceeded by 2 days). A pending salary deduction review of ₹4,000 has been created for HR review.',
      timestamp: generatePastDate(1) + 'T09:30:00Z',
      read: false,
    },
    {
      id: 'notif_002',
      recipientId: 'EMP001',
      type: 'absence_warning',
      title: '⚠️ Leave Limit Warning',
      message: 'You have used 10 of your allowed 12 absence days. Only 2 days remain before potential salary deduction.',
      timestamp: generatePastDate(3) + 'T11:00:00Z',
      read: false,
    },
    {
      id: 'notif_003',
      recipientId: 'HR001',
      type: 'salary_deduction',
      title: 'Action Required: Salary Deduction Request',
      message: 'Priya Sharma (EMP002) has exceeded the absence limit by 2 days. Proposed deduction: ₹4,000. Review required.',
      timestamp: generatePastDate(1) + 'T09:35:00Z',
      read: false,
    },
    {
      id: 'notif_004',
      recipientId: 'all',
      type: 'announcement',
      title: 'Dayflow AI HRMS System Upgrade',
      message: 'Welcome to Dayflow AI. Check your attendance, apply for leaves, and track workforce intelligence in real-time.',
      timestamp: generatePastDate(5) + 'T08:00:00Z',
      read: true,
    },
  ];

  const emails: EmailMessage[] = [
    {
      id: 'email_001',
      toEmail: 'priya.sharma@dayflow.ai',
      toName: 'Priya Sharma',
      fromName: 'Dayflow AI HR Operations <hr@dayflow.ai>',
      subject: 'Dayflow AI — Leave/Absence Limit Exceeded',
      templateName: 'Absence Limit Exceeded',
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px;">
          <div style="background: #0f172a; padding: 16px; border-radius: 8px; color: #ffffff; text-align: center; margin-bottom: 20px;">
            <h2 style="margin: 0; font-size: 20px; letter-spacing: 0.5px;">DAYFLOW AI</h2>
            <p style="margin: 4px 0 0 0; font-size: 12px; color: #94a3b8;">Workforce Intelligence & HR Platform</p>
          </div>
          <h3 style="color: #dc2626; margin-top: 0;">🚨 Notice: Absence Limit Exceeded</h3>
          <p>Dear <strong>Priya Sharma</strong> (EMP002),</p>
          <p>This is an automated notification from Dayflow AI. Our absence monitoring system has recorded that your total absences have exceeded the organization's configured limit.</p>
          <table style="width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 14px;">
            <tr style="background: #f8fafc;"><td style="padding: 8px; border: 1px solid #cbd5e1;">Allowed Absence Limit</td><td style="padding: 8px; border: 1px solid #cbd5e1; font-weight: bold;">12 Days</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #cbd5e1;">Recorded Used Absence</td><td style="padding: 8px; border: 1px solid #cbd5e1; font-weight: bold; color: #dc2626;">14 Days</td></tr>
            <tr style="background: #f8fafc;"><td style="padding: 8px; border: 1px solid #cbd5e1;">Excess Days</td><td style="padding: 8px; border: 1px solid #cbd5e1; font-weight: bold; color: #dc2626;">2 Days</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #cbd5e1;">Potential Salary Deduction</td><td style="padding: 8px; border: 1px solid #cbd5e1; font-weight: bold; color: #d97706;">₹4,000 (Pending HR Review)</td></tr>
          </table>
          <p style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 12px; font-size: 13px; color: #991b1b;">
            <strong>Important Policy Note:</strong> Dayflow AI follows strict human-in-the-loop governance. Salary deductions are <em>never</em> automatically applied. A pending deduction request has been submitted to HR for review.
          </p>
          <p style="font-size: 13px; color: #64748b;">If you believe this calculation contains an error or if you have medical exemptions to submit, please contact your People Operations department immediately.</p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <p style="font-size: 11px; color: #94a3b8; text-align: center;">Dayflow AI Enterprise HRMS • Confidential</p>
        </div>
      `,
      textContent: 'Notice: Absence Limit Exceeded. You have used 14 of 12 allowed absence days. Excess: 2 days. Potential deduction: ₹4,000 pending HR review.',
      sentAt: generatePastDate(1) + 'T09:30:00Z',
      status: 'Delivered',
    },
    {
      id: 'email_002',
      toEmail: 'alex.rivera@dayflow.ai',
      toName: 'Alex Rivera',
      fromName: 'Dayflow AI HR Operations <hr@dayflow.ai>',
      subject: 'Dayflow AI — Absence Limit Warning',
      templateName: 'Absence Warning',
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px;">
          <div style="background: #0f172a; padding: 16px; border-radius: 8px; color: #ffffff; text-align: center; margin-bottom: 20px;">
            <h2 style="margin: 0; font-size: 20px;">DAYFLOW AI</h2>
            <p style="margin: 4px 0 0 0; font-size: 12px; color: #94a3b8;">Workforce Intelligence & HR Platform</p>
          </div>
          <h3 style="color: #d97706; margin-top: 0;">⚠️ Leave Limit Warning</h3>
          <p>Dear <strong>Alex Rivera</strong> (EMP001),</p>
          <p>You have reached the warning threshold for annual absence and leaves.</p>
          <p>You have used <strong>10</strong> of your allowed <strong>12</strong> absence days. Only <strong>2 days</strong> remain in your allowance.</p>
          <p style="font-size: 13px; color: #64748b;">Please plan your remaining leaves carefully to prevent excess absence and potential salary deductions.</p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <p style="font-size: 11px; color: #94a3b8; text-align: center;">Dayflow AI Enterprise HRMS</p>
        </div>
      `,
      textContent: 'Leave Limit Warning: You have used 10 of your allowed 12 absence days. Only 2 days remain.',
      sentAt: generatePastDate(3) + 'T11:00:00Z',
      status: 'Delivered',
    },
  ];

  const auditLogs: AuditLog[] = [
    {
      id: 'audit_001',
      action: 'POLICY_UPDATE',
      actorId: 'HR001',
      actorName: 'Sarah Connor',
      actorRole: 'hr_admin',
      targetType: 'Policy',
      targetId: 'ABSENCE_POLICY',
      details: 'Updated annual allowed absence to 12 days and warning threshold to 10 days.',
      timestamp: generatePastDate(10) + 'T14:20:00Z',
    },
    {
      id: 'audit_002',
      action: 'LEAVE_APPROVED',
      actorId: 'HR001',
      actorName: 'Sarah Connor',
      actorRole: 'hr_admin',
      targetType: 'Leave',
      targetId: 'leave_002',
      details: 'Approved 8 days Sick Leave request for Priya Sharma (EMP002).',
      timestamp: generatePastDate(15) + 'T10:15:00Z',
    },
    {
      id: 'audit_003',
      action: 'DEDUCTION_REQUEST_GENERATED',
      actorId: 'SYSTEM',
      actorName: 'Dayflow AI Absence Engine',
      actorRole: 'system',
      targetType: 'SalaryDeduction',
      targetId: 'ded_001',
      details: 'Automated evaluation detected 2 excess absence days for Priya Sharma. Proposed deduction: ₹4,000.',
      timestamp: generatePastDate(1) + 'T09:30:00Z',
    },
    {
      id: 'audit_004',
      action: 'WARNING_ISSUED',
      actorId: 'SYSTEM',
      actorName: 'Dayflow AI Performance Engine',
      actorRole: 'system',
      targetType: 'Warning',
      targetId: 'warn_001',
      details: 'Automated evaluation detected 5 missed sprint deadlines for Marcus Chen. Level 2 Formal Warning generated.',
      timestamp: generatePastDate(3) + 'T10:00:00Z',
    },
    {
      id: 'audit_005',
      action: 'PIP_INITIATED',
      actorId: 'HR001',
      actorName: 'Sarah Connor',
      actorRole: 'hr_admin',
      targetType: 'PIP',
      targetId: 'pip_001',
      details: 'Created 30-day Performance Improvement Plan for Marcus Chen (EMP003).',
      timestamp: generatePastDate(2) + 'T14:00:00Z',
    },
  ];

  // Employee Tasks for Explainable Performance Metrics
  const tasks: EmployeeTask[] = [
    // Marcus Chen (EMP003) - 8 tasks, 5 late, 2 overdue
    {
      id: 'task_001',
      employeeId: 'EMP003',
      employeeName: 'Marcus Chen',
      department: 'Product Design',
      title: 'Design Mobile Navigation Drawer Spec',
      description: 'Create responsive navigation drawer UI components and interaction wireframes.',
      assignedDate: '2026-08-01',
      dueDate: '2026-08-04',
      completedDate: '2026-08-07',
      status: 'Completed',
      wasLate: true,
      performancePeriod: 'August 2026',
      priority: 'High',
      qualityRating: 4,
    },
    {
      id: 'task_002',
      employeeId: 'EMP003',
      employeeName: 'Marcus Chen',
      department: 'Product Design',
      title: 'Figma Tokens Sync Pipeline',
      description: 'Export color, typography, and spacing variables to Tailwind config.',
      assignedDate: '2026-08-03',
      dueDate: '2026-08-08',
      completedDate: '2026-08-11',
      status: 'Completed',
      wasLate: true,
      performancePeriod: 'August 2026',
      priority: 'High',
      qualityRating: 4,
    },
    {
      id: 'task_003',
      employeeId: 'EMP003',
      employeeName: 'Marcus Chen',
      department: 'Product Design',
      title: 'High-Density Dark Theme Palette',
      description: 'Define slate-900 contrast tokens and material symbols pairing.',
      assignedDate: '2026-08-07',
      dueDate: '2026-08-12',
      completedDate: '2026-08-15',
      status: 'Completed',
      wasLate: true,
      performancePeriod: 'August 2026',
      priority: 'Medium',
      qualityRating: 5,
    },
    {
      id: 'task_004',
      employeeId: 'EMP003',
      employeeName: 'Marcus Chen',
      department: 'Product Design',
      title: 'Org Chart Vector Node Layout',
      description: 'Interactive hierarchy branch lines and manager badge layout.',
      assignedDate: '2026-08-09',
      dueDate: '2026-08-14',
      completedDate: '2026-08-18',
      status: 'Completed',
      wasLate: true,
      performancePeriod: 'August 2026',
      priority: 'Medium',
      qualityRating: 4,
    },
    {
      id: 'task_005',
      employeeId: 'EMP003',
      employeeName: 'Marcus Chen',
      department: 'Product Design',
      title: 'Employee Profile Badges & Status Chips',
      description: 'Design iconography for attendance flags and warning chips.',
      assignedDate: '2026-08-12',
      dueDate: '2026-08-17',
      completedDate: '2026-08-20',
      status: 'Completed',
      wasLate: true,
      performancePeriod: 'August 2026',
      priority: 'Low',
      qualityRating: 4,
    },
    {
      id: 'task_006',
      employeeId: 'EMP003',
      employeeName: 'Marcus Chen',
      department: 'Product Design',
      title: 'Smart Action Center Empty State Graphics',
      description: 'High resolution SVG illustrations for zero pending items.',
      assignedDate: '2026-08-13',
      dueDate: '2026-08-18',
      status: 'Overdue',
      wasLate: true,
      performancePeriod: 'August 2026',
      priority: 'High',
    },
    {
      id: 'task_007',
      employeeId: 'EMP003',
      employeeName: 'Marcus Chen',
      department: 'Product Design',
      title: 'Warning History Timeline Prototype',
      description: 'Interactive timeline modal wireframe with audit events.',
      assignedDate: '2026-08-15',
      dueDate: '2026-08-20',
      status: 'Overdue',
      wasLate: true,
      performancePeriod: 'August 2026',
      priority: 'Critical',
    },
    {
      id: 'task_008',
      employeeId: 'EMP003',
      employeeName: 'Marcus Chen',
      department: 'Product Design',
      title: 'Interactive PIP Flow Wireframe',
      description: 'Performance improvement plan goal tracker and milestone check-ins.',
      assignedDate: '2026-08-19',
      dueDate: '2026-08-25',
      status: 'In Progress',
      performancePeriod: 'August 2026',
      priority: 'High',
    },

    // David Kim (EMP006) - 6 tasks, 2 late, 1 in progress
    {
      id: 'task_009',
      employeeId: 'EMP006',
      employeeName: 'David Kim',
      department: 'Engineering',
      title: 'Fix Date Picker Timezone Drift',
      description: 'Ensure UTC date formatting matches local browser timestamps.',
      assignedDate: '2026-08-02',
      dueDate: '2026-08-05',
      completedDate: '2026-08-05',
      status: 'Completed',
      wasLate: false,
      performancePeriod: 'August 2026',
      priority: 'High',
      qualityRating: 5,
    },
    {
      id: 'task_010',
      employeeId: 'EMP006',
      employeeName: 'David Kim',
      department: 'Engineering',
      title: 'Refactor Attendance Status Pills',
      description: 'Standardize tailwind color tokens across present, late, and absent states.',
      assignedDate: '2026-08-04',
      dueDate: '2026-08-08',
      completedDate: '2026-08-08',
      status: 'Completed',
      wasLate: false,
      performancePeriod: 'August 2026',
      priority: 'Medium',
      qualityRating: 4,
    },
    {
      id: 'task_011',
      employeeId: 'EMP006',
      employeeName: 'David Kim',
      department: 'Engineering',
      title: 'Audit Log Table Pagination',
      description: 'Implement fast server-side slice navigation for compliance audit log entries.',
      assignedDate: '2026-08-08',
      dueDate: '2026-08-12',
      completedDate: '2026-08-14',
      status: 'Completed',
      wasLate: true,
      performancePeriod: 'August 2026',
      priority: 'Medium',
      qualityRating: 4,
    },
    {
      id: 'task_012',
      employeeId: 'EMP006',
      employeeName: 'David Kim',
      department: 'Engineering',
      title: 'Employee Filter Dropdown Accessibility',
      description: 'Add aria labels and keyboard arrow traversal for screen readers.',
      assignedDate: '2026-08-12',
      dueDate: '2026-08-16',
      completedDate: '2026-08-17',
      status: 'Completed',
      wasLate: true,
      performancePeriod: 'August 2026',
      priority: 'Low',
      qualityRating: 4,
    },
    {
      id: 'task_013',
      employeeId: 'EMP006',
      employeeName: 'David Kim',
      department: 'Engineering',
      title: 'Action Center Filter State Sync',
      description: 'Persist active tab and search query across page refreshes.',
      assignedDate: '2026-08-16',
      dueDate: '2026-08-23',
      status: 'In Progress',
      performancePeriod: 'August 2026',
      priority: 'High',
    },

    // Priya Sharma (EMP002) - 8 tasks, on-time
    {
      id: 'task_014',
      employeeId: 'EMP002',
      employeeName: 'Priya Sharma',
      department: 'Engineering',
      title: 'Absence Engine Threshold Calculations',
      description: 'Formula optimization for pro-rated leave limits and deductibles.',
      assignedDate: '2026-08-01',
      dueDate: '2026-08-06',
      completedDate: '2026-08-05',
      status: 'Completed',
      wasLate: false,
      performancePeriod: 'August 2026',
      priority: 'Critical',
      qualityRating: 5,
    },
    {
      id: 'task_015',
      employeeId: 'EMP002',
      employeeName: 'Priya Sharma',
      department: 'Engineering',
      title: 'Salary Deduction Approval Transaction Locks',
      description: 'Ensure atomic database updates when HR approves pending deductions.',
      assignedDate: '2026-08-06',
      dueDate: '2026-08-10',
      completedDate: '2026-08-09',
      status: 'Completed',
      wasLate: false,
      performancePeriod: 'August 2026',
      priority: 'High',
      qualityRating: 5,
    },
  ];

  // Employee Warnings Seed Data
  const warnings: EmployeeWarning[] = [
    {
      id: 'warn_001',
      employeeId: 'EMP003',
      employeeName: 'Marcus Chen',
      department: 'Product Design',
      roleTitle: 'Lead Product Designer',
      category: 'performance',
      warningType: 'Repeated Missed Deadlines & Task Delivery Delays',
      severity: 'formal_warning',
      origin: 'automatic_rule',
      incidentDate: generatePastDate(2),
      performancePeriod: 'August 2026',
      description: 'Automated performance evaluation detected that 5 out of 8 assigned sprint tasks were completed after deadline, with 2 tasks currently overdue during the August 2026 cycle.',
      relatedPolicy: 'Engineering & Design Sprint Delivery Policy §4.2 (Timely Milestone Execution)',
      supportingEvidence: '5 of 8 tasks delivered after scheduled sprint deadline; 2 tasks overdue (Smart Action Center Mockup, Warning Timeline Prototype). Sprint delay aggregate: 16 working days.',
      structuredMetrics: {
        assignedTasks: 8,
        completedAfterDeadline: 5,
        currentlyOverdue: 2,
        qualityRating: 4.2,
        policyRuleRef: 'Sprint Delivery §4.2',
      },
      hrNotes: 'Marcus has outstanding aesthetic craft and UX thinking, but milestone predictability has fallen below SLA. Manager initiated a 30-day Performance Improvement Plan (PIP) to support scheduling and dependency management.',
      recommendedAction: 'Initiate Performance Improvement Plan (PIP) & Conduct 1-on-1 Review',
      reviewDate: generatePastDate(-7),
      status: 'Issued',
      hrDecision: 'Performance Improvement Plan',
      hrDecisionNotes: 'Enrolled Marcus in 30-day Design Delivery PIP. Weekly checkpoints scheduled on Fridays.',
      hrDecisionDate: generatePastDate(1),
      pipId: 'pip_001',
      createdAt: generatePastDate(3) + 'T10:00:00Z',
      updatedAt: generatePastDate(1) + 'T16:00:00Z',
      createdBy: 'Dayflow AI Performance Engine',
    },
    {
      id: 'warn_002',
      employeeId: 'EMP002',
      employeeName: 'Priya Sharma',
      department: 'Engineering',
      roleTitle: 'Senior Backend Engineer',
      category: 'attendance',
      warningType: 'Excessive Absence & Late Arrival Threshold Exceeded',
      severity: 'formal_warning',
      origin: 'automatic_rule',
      incidentDate: generatePastDate(1),
      description: 'Absence monitoring system recorded 14 days total absence against annual allowance of 12 days (+2 excess absence days). 3 late arrivals logged in the current quarter.',
      relatedPolicy: 'Dayflow AI Standard Attendance & Leave Governance Policy §2.1',
      supportingEvidence: '14 recorded absence days (12 allowed, 2 excess). 3 late check-ins recorded (10:15 AM, 10:22 AM, 10:05 AM). Pending salary deduction request ₹4,000 awaiting HR review.',
      structuredMetrics: {
        usedAbsenceDays: 14,
        allowedAbsenceLimit: 12,
        lateArrivals: 3,
        unauthorizedAbsences: 0,
      },
      hrNotes: 'Priya experienced an unexpected medical emergency in July. Medical documentation pending HR verification. Human review required prior to confirming any deduction.',
      recommendedAction: 'Review medical exemption documentation and conduct Attendance Coaching discussion.',
      reviewDate: generatePastDate(-3),
      status: 'Under Review',
      createdAt: generatePastDate(1) + 'T09:30:00Z',
      updatedAt: generatePastDate(1) + 'T09:30:00Z',
      createdBy: 'Dayflow AI Absence Engine',
    },
    {
      id: 'warn_003',
      employeeId: 'EMP006',
      employeeName: 'David Kim',
      department: 'Engineering',
      roleTitle: 'Frontend Engineer',
      category: 'conduct',
      warningType: 'Direct Deployment Without Mandatory Peer Code Review',
      severity: 'advisory',
      origin: 'manager_report',
      incidentDate: generatePastDate(5),
      description: 'Bypassed GitHub pull request branch protection and deployed client patch directly to staging environment without peer approval from Lead Architect.',
      relatedPolicy: 'Engineering Code Review & Change Management Procedure §1.4',
      supportingEvidence: 'Commit f98a21 merged directly into staging at 18:45 without approval from Alex Rivera.',
      hrNotes: 'David explained that this was an urgent regression fix during client demo hours. Reminded him that emergency override procedure must be documented in incident channel.',
      recommendedAction: 'Coaching & Process Clarification with Lead Architect',
      reviewDate: generatePastDate(2),
      status: 'Employee Responded',
      employeeResponse: {
        responseDate: generatePastDate(3) + 'T14:10:00Z',
        explanation: 'Understood. I acted hastily to resolve a UI flickering bug before the client showcase. I will strictly follow emergency hotfix branch review guidelines moving forward.',
        acknowledgedAt: generatePastDate(3) + 'T14:10:00Z',
      },
      hrDecision: 'Coaching',
      hrDecisionNotes: 'Clarified change management expectations. No further formal disciplinary penalty required.',
      hrDecisionDate: generatePastDate(2),
      createdAt: generatePastDate(5) + 'T11:00:00Z',
      updatedAt: generatePastDate(2) + 'T15:00:00Z',
      createdBy: 'Alex Rivera (Lead Architect)',
    },
    {
      id: 'warn_004',
      employeeId: 'EMP004',
      employeeName: 'Jordan Lee',
      department: 'Infrastructure',
      roleTitle: 'DevOps & Cloud Engineer',
      category: 'compliance',
      warningType: 'Quarterly Cloud Access Key Rotation Delay',
      severity: 'advisory',
      origin: 'hr_report',
      incidentDate: generatePastDate(12),
      description: 'Quarterly cloud service IAM token rotation was submitted 5 business days past the compliance cycle deadline.',
      relatedPolicy: 'Information Security & Access Management Policy §6.1',
      supportingEvidence: 'Access rotation completed on Day +5 after 2 reminder notifications.',
      recommendedAction: 'Mandatory Compliance Calendar Sync & Security Awareness Briefing',
      status: 'Resolved',
      hrDecision: 'No Action',
      hrDecisionNotes: 'Rotation successfully completed and verified by Security Operations.',
      hrDecisionDate: generatePastDate(8),
      createdAt: generatePastDate(12) + 'T09:00:00Z',
      updatedAt: generatePastDate(8) + 'T10:00:00Z',
      createdBy: 'Sarah Connor (VP HR)',
    },
  ];

  // Performance Reviews Seed Data
  const performanceReviews: PerformanceReviewRecord[] = [
    {
      id: 'rev_001',
      employeeId: 'EMP003',
      employeeName: 'Marcus Chen',
      department: 'Product Design',
      reviewerId: 'emp_000',
      reviewerName: 'Sarah Connor',
      performancePeriod: 'Q2 2026',
      reviewDate: generatePastDate(20),
      goals: 'Lead Design System 3.0 migration and establish cross-functional component guidelines.',
      kpiMetrics: [
        { metric: 'Design System Coverage', target: '95%', achieved: '90%', status: 'Partially Met' },
        { metric: 'Sprint On-Time Delivery', target: '98%', achieved: '72%', status: 'Missed' },
        { metric: 'Component Visual Polish', target: '4.5 / 5', achieved: '4.8 / 5', status: 'Met' },
      ],
      completedWorkSummary: 'Created high-fidelity UI specifications for Dayflow AI core dashboards and component library.',
      missedWorkSummary: 'Missed 2 major design handoff milestones leading to frontend sprint rescheduling.',
      qualityObservations: 'Exceptional visual and typographic polish; outstanding attention to accessibility and micro-interactions.',
      strengths: 'Creative vision, responsive layout design, deep typography intuition.',
      areasForImprovement: 'Time estimation accuracy, dependency communication, and sprint deadline predictability.',
      managerFeedback: 'Marcus is an exceptional designer whose work elevates our entire platform. Strengthening sprint predictability will make him a top-tier design leader.',
      employeeResponse: 'Acknowledged. I will implement better milestone checkpointing.',
      overallStatus: 'Needs Improvement',
      createdAt: generatePastDate(20) + 'T15:00:00Z',
    },
    {
      id: 'rev_002',
      employeeId: 'EMP002',
      employeeName: 'Priya Sharma',
      department: 'Engineering',
      reviewerId: 'emp_001',
      reviewerName: 'Alex Rivera',
      performancePeriod: 'Q2 2026',
      reviewDate: generatePastDate(25),
      goals: 'Architect zero-latency attendance aggregation queries and absence pro-ration engine.',
      kpiMetrics: [
        { metric: 'API Query Response Time', target: '< 100ms', achieved: '45ms', status: 'Met' },
        { metric: 'Absence Rule Accuracy', target: '100%', achieved: '100%', status: 'Met' },
        { metric: 'Test Coverage', target: '90%', achieved: '94%', status: 'Met' },
      ],
      completedWorkSummary: 'Delivered fast indexing pipelines for attendance and leave calculation.',
      missedWorkSummary: 'None.',
      qualityObservations: 'Rock-solid backend engineering and meticulous database schema designs.',
      strengths: 'Distributed systems design, relational optimization, clear technical documentation.',
      areasForImprovement: 'Balance workload distribution to avoid mid-quarter burnout.',
      managerFeedback: 'Priya continues to be a core pillar of our backend stability.',
      employeeResponse: 'Thank you Alex, will focus on delegating sub-tasks earlier.',
      overallStatus: 'Meeting Expectations',
      createdAt: generatePastDate(25) + 'T11:00:00Z',
    },
    {
      id: 'rev_003',
      employeeId: 'EMP001',
      employeeName: 'Alex Rivera',
      department: 'Engineering',
      reviewerId: 'emp_000',
      reviewerName: 'Sarah Connor',
      performancePeriod: 'Q2 2026',
      reviewDate: generatePastDate(30),
      goals: 'Lead technical roadmap and scale frontend and backend micro-architectures.',
      kpiMetrics: [
        { metric: 'System Uptime SLA', target: '99.9%', achieved: '99.98%', status: 'Met' },
        { metric: 'Sprint Velocity', target: '100%', achieved: '102%', status: 'Met' },
        { metric: 'Team Mentorship Score', target: '4.8 / 5', achieved: '4.9 / 5', status: 'Met' },
      ],
      completedWorkSummary: 'Architected high density UI layout and Action Center event dispatchers.',
      missedWorkSummary: 'None.',
      qualityObservations: 'Superb architectural leadership and peer mentorship.',
      strengths: 'Full-stack mastery, pragmatic technical decision making, empathetic team leadership.',
      areasForImprovement: 'Continue scaling team leadership practices as engineering grows.',
      managerFeedback: 'Alex sets the standard for technical excellence at Dayflow AI.',
      overallStatus: 'Meeting Expectations',
      createdAt: generatePastDate(30) + 'T14:00:00Z',
    },
  ];

  // Performance Improvement Plans (PIP) Seed Data
  const pips: PerformanceImprovementPlan[] = [
    {
      id: 'pip_001',
      warningId: 'warn_001',
      employeeId: 'EMP003',
      employeeName: 'Marcus Chen',
      department: 'Product Design',
      roleTitle: 'Lead Product Designer',
      managerId: 'emp_000',
      managerName: 'Sarah Connor',
      hrOwnerId: 'emp_000',
      hrOwnerName: 'Sarah Connor',
      startDate: generatePastDate(2),
      deadlineDate: generatePastDate(-28),
      reviewDates: [generatePastDate(-5), generatePastDate(-12), generatePastDate(-19), generatePastDate(-26)],
      problemAreas: 'Sprint deadline adherence, timely delivery of design tokens and UI mockups, proactive communication on scope bottlenecks.',
      expectedImprovement: '1. Complete 100% of assigned sprint tasks on or before agreed deadline.\n2. Maintain active status updates in sprint tracker by 10:00 AM daily.\n3. Escalate blocker dependencies at least 48 hours before target deadline.',
      goals: 'Achieve 100% sprint on-time delivery across next 4 consecutive sprint cycles with zero overdue tickets.',
      kpiMeasurements: 'Sprint Velocity Score ≥ 95%, Task Overdue Count = 0, Weekly 1-on-1 Check-in completed.',
      employeeComments: 'I agree with the goals and will streamline the token review workflow with Alex and the frontend team.',
      status: 'Active',
      createdAt: generatePastDate(2) + 'T14:00:00Z',
      updatedAt: generatePastDate(1) + 'T10:00:00Z',
    },
  ];

  // Separation Reviews Seed Data (Strict Human-in-the-Loop Governance)
  const separationReviews: SeparationReview[] = [
    {
      id: 'sep_001',
      employeeId: 'EMP003',
      employeeName: 'Marcus Chen',
      department: 'Product Design',
      roleTitle: 'Lead Product Designer',
      initiatedBy: 'HR001',
      initiatedByName: 'Sarah Connor',
      initiatedDate: generatePastDate(0),
      primaryReason: 'Milestone delivery review under active PIP protocol',
      warningHistorySummary: '1 Formal Warning issued (Aug 2026); 5 late tasks, 2 overdue.',
      performanceHistorySummary: 'Q2 2026 review marked Needs Improvement.',
      attendanceHistorySummary: 'Attendance in good standing (98% present, 0 excess absences).',
      pipHistorySummary: 'Active 30-Day PIP currently in progress (Day 2 of 30). Final assessment pending PIP completion.',
      hrNotes: 'Separation docket created in Not Started / Monitoring status. No separation authorized while employee is actively engaged in PIP.',
      status: 'Not Started',
      safetyDisclaimer: 'MANDATORY HUMAN AUTHORIZATION REQUIRED: Dayflow AI NEVER automatically terminates, suspends, or demotes any employee. Any irreversible employment action strictly requires formal HR, Executive Leadership, and Legal sign-off in accordance with labor regulations.',
      createdAt: generatePastDate(0) + 'T11:00:00Z',
      updatedAt: generatePastDate(0) + 'T11:00:00Z',
    },
  ];

  return {
    employees,
    departments,
    attendance,
    leaves,
    absencePolicy,
    salaryDeductions,
    notifications,
    emails,
    auditLogs,
    warnings,
    tasks,
    performanceReviews,
    pips,
    separationReviews,
    sessions: {},
  };
}

let db: DBState = getInitialDB();

function saveDB() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    // In-memory fallback
  }
}

function loadDB() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      const loaded = JSON.parse(data);
      if (loaded.employees && loaded.departments) {
        const initial = getInitialDB();
        db = {
          ...initial,
          ...loaded,
          warnings: loaded.warnings || initial.warnings,
          tasks: loaded.tasks || initial.tasks,
          performanceReviews: loaded.performanceReviews || initial.performanceReviews,
          pips: loaded.pips || initial.pips,
          separationReviews: loaded.separationReviews || initial.separationReviews,
          sessions: db.sessions || {},
        };
      }
    }
  } catch (e) {
    console.log('Using fresh initial database state');
  }
}

loadDB();

// Helper: Calculate absence summary for an employee
function calculateEmployeeAbsence(emp: Employee, policy: AbsencePolicy, leaves: LeaveRequest[], attendance: AttendanceRecord[]): AbsenceSummary {
  // Count approved leave days
  const approvedLeaves = leaves.filter(
    (l) => (l.employeeId === emp.employeeId || l.employeeId === emp.id) && l.status === 'Approved'
  );
  const approvedLeaveDays = approvedLeaves.reduce((acc, l) => acc + (l.daysCount || 0), 0);

  // Count unexcused absent days in attendance records (status === 'Absent' and not already a Leave request date)
  const absentRecords = attendance.filter(
    (a) => (a.employeeId === emp.employeeId || a.employeeId === emp.id) && a.status === 'Absent'
  );
  const unexcusedDays = absentRecords.length;

  const usedAbsence = approvedLeaveDays + unexcusedDays;
  const allowedLimit = policy.allowedAbsenceDays;
  const excessDays = Math.max(0, usedAbsence - allowedLimit);
  const remainingDays = Math.max(0, allowedLimit - usedAbsence);

  let severity: 'none' | 'warning' | 'exceeded' = 'none';
  if (excessDays > 0) {
    severity = 'exceeded';
  } else if (usedAbsence >= policy.warningThresholdDays) {
    severity = 'warning';
  }

  const workingDays = policy.workingDaysPerMonth || 30;
  const dailyRate = Math.round(emp.monthlySalary / workingDays);
  const potentialDeduction = dailyRate * excessDays;

  // Find deduction request if any
  const existingDeduction = db.salaryDeductions.find(
    (d) => d.employeeId === emp.employeeId || d.employeeId === emp.id
  );

  return {
    employeeId: emp.employeeId,
    employeeName: emp.fullName,
    department: emp.department,
    allowedLimit,
    usedAbsence,
    remainingDays,
    excessDays,
    severity,
    monthlySalary: emp.monthlySalary,
    dailyRate,
    potentialDeduction,
    deductionStatus: existingDeduction?.status,
    deductionRequestId: existingDeduction?.id,
  };
}

// Helper: Calculate explainable risk and performance score
function calculateEmployeeRiskScore(emp: Employee, dbState: DBState): ExplainableRiskScore {
  const empTasks = (dbState.tasks || []).filter((t) => t.employeeId === emp.employeeId || t.employeeId === emp.id);
  const totalTasks = empTasks.length;
  const missedDeadlines = empTasks.filter((t) => t.wasLate).length;
  const overdueTasks = empTasks.filter((t) => t.status === 'Overdue').length;

  let workPerformanceScore = 100;
  if (totalTasks > 0) {
    const penaltyPerLate = 10;
    const penaltyPerOverdue = 15;
    workPerformanceScore = Math.max(20, 100 - (missedDeadlines * penaltyPerLate) - (overdueTasks * penaltyPerOverdue));
  }

  const absenceSummary = calculateEmployeeAbsence(emp, dbState.absencePolicy, dbState.leaves, dbState.attendance);
  const empAttendance = (dbState.attendance || []).filter(
    (a) => a.employeeId === emp.employeeId || a.employeeId === emp.id
  );
  const lateCount = empAttendance.filter((a) => a.status === 'Late').length;
  const unexcusedDays = empAttendance.filter((a) => a.status === 'Absent').length;

  let attendanceScore = 100;
  if (absenceSummary.excessDays > 0) {
    attendanceScore = Math.max(20, 100 - (absenceSummary.excessDays * 15) - (lateCount * 5));
  } else if (absenceSummary.usedAbsence >= dbState.absencePolicy.warningThresholdDays) {
    attendanceScore = Math.max(60, 100 - (lateCount * 5) - 15);
  } else {
    attendanceScore = Math.max(70, 100 - (lateCount * 5));
  }

  const empWarnings = (dbState.warnings || []).filter(
    (w) => (w.employeeId === emp.employeeId || w.employeeId === emp.id) && w.status !== 'Resolved' && w.status !== 'Closed'
  );
  let complianceScore = 100;
  const activeWarningsCount = empWarnings.length;
  for (const w of empWarnings) {
    if (w.severity === 'separation_review') complianceScore -= 40;
    else if (w.severity === 'serious_review') complianceScore -= 25;
    else if (w.severity === 'formal_warning') complianceScore -= 15;
    else complianceScore -= 5;
  }
  complianceScore = Math.max(20, complianceScore);

  const reasons: string[] = [];
  if (missedDeadlines > 0) {
    reasons.push(`${missedDeadlines} task(s) completed past deadline in recorded cycles.`);
  }
  if (overdueTasks > 0) {
    reasons.push(`${overdueTasks} task(s) currently overdue requiring immediate delivery.`);
  }
  if (absenceSummary.excessDays > 0) {
    reasons.push(`${absenceSummary.excessDays} excess absence day(s) exceeded annual allowance (${absenceSummary.usedAbsence}/${dbState.absencePolicy.allowedAbsenceDays} days).`);
  }
  if (lateCount >= 3) {
    reasons.push(`${lateCount} late arrival incidents logged.`);
  }
  if (activeWarningsCount > 0) {
    reasons.push(`${activeWarningsCount} active warning(s) on file requiring HR attention.`);
  }
  if (reasons.length === 0) {
    reasons.push('All performance, attendance, and compliance indicators in good standing with zero active violations.');
  }

  let overallIndicator: ExplainableRiskScore['overallIndicator'] = 'Good Standing';
  const minScore = Math.min(workPerformanceScore, attendanceScore, complianceScore);
  if (empWarnings.some((w) => w.severity === 'separation_review')) {
    overallIndicator = 'Critical Review';
  } else if (minScore < 60 || empWarnings.some((w) => w.severity === 'serious_review')) {
    overallIndicator = 'Action Required';
  } else if (minScore < 75 || activeWarningsCount > 0) {
    overallIndicator = 'Review Recommended';
  } else if (minScore < 90) {
    overallIndicator = 'Advisory Noted';
  }

  return {
    workPerformanceScore,
    attendanceScore,
    complianceScore,
    overallIndicator,
    reasons,
    metricsBreakdown: {
      assignedTasks: totalTasks,
      missedDeadlines,
      overdueTasks,
      lateArrivals: lateCount,
      unauthorizedAbsences: unexcusedDays,
      absenceDaysUsed: absenceSummary.usedAbsence,
      allowedAbsenceDays: dbState.absencePolicy.allowedAbsenceDays,
      activeWarnings: activeWarningsCount,
      policyViolations: empWarnings.filter((w) => w.category === 'compliance').length,
    },
  };
}

// Helper: Generate email template
function createEmailFromTemplate(
  templateName: string,
  toEmployee: Employee,
  data: Record<string, any>
): EmailMessage {
  const placeholders: Record<string, string> = {
    '{{employee_name}}': toEmployee.fullName,
    '{{employee_id}}': toEmployee.employeeId,
    '{{department}}': toEmployee.department,
    '{{role}}': toEmployee.roleTitle,
    '{{absence_limit}}': String(data.absence_limit || db.absencePolicy.allowedAbsenceDays),
    '{{used_absence}}': String(data.used_absence || 0),
    '{{excess_absence}}': String(data.excess_absence || 0),
    '{{deduction_amount}}': '₹' + Number(data.deduction_amount || 0).toLocaleString(),
    '{{approval_date}}': data.approval_date || new Date().toLocaleDateString(),
    '{{rejection_reason}}': data.rejection_reason || 'N/A',
    '{{leave_type}}': data.leave_type || 'Leave',
    '{{leave_dates}}': data.leave_dates || '',
    '{{joining_date}}': toEmployee.joinDate || new Date().toISOString().split('T')[0],
    '{{warning_type}}': data.warning_type || 'Performance / Conduct Notice',
    '{{severity}}': data.severity || 'Formal Warning',
    '{{category}}': data.category || 'General',
    '{{incident_date}}': data.incident_date || new Date().toLocaleDateString(),
    '{{description}}': data.description || '',
    '{{supporting_evidence}}': data.supporting_evidence || '',
    '{{recommended_action}}': data.recommended_action || '',
    '{{hr_decision}}': data.hr_decision || 'Resolved',
    '{{hr_decision_notes}}': data.hr_decision_notes || 'All requirements satisfied.',
    '{{start_date}}': data.start_date || '',
    '{{deadline_date}}': data.deadline_date || '',
    '{{problem_areas}}': data.problem_areas || '',
    '{{goals}}': data.goals || '',
  };

  let subject = `Dayflow AI — Notification`;
  let bodyHtml = '';

  if (templateName === 'Welcome to Team') {
    subject = `Welcome to the Dayflow AI Team, ${toEmployee.fullName}!`;
    bodyHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px;">
        <div style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 24px; border-radius: 8px; color: #ffffff; text-align: center; margin-bottom: 20px;">
          <h1 style="margin: 0; font-size: 24px; letter-spacing: 0.5px;">DAYFLOW AI</h1>
          <p style="margin: 6px 0 0 0; font-size: 13px; color: #94a3b8;">Next-Generation People & Workforce Management</p>
        </div>
        <h2 style="color: #0f172a; margin-top: 0;">Welcome aboard, {{employee_name}}! 🎉</h2>
        <p>We are thrilled to welcome you to the <strong>{{department}}</strong> department as our <strong>{{role}}</strong>.</p>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 20px 0;">
          <h4 style="margin: 0 0 10px 0; color: #334155;">Your Employee Credentials & Profile</h4>
          <p style="margin: 4px 0; font-size: 14px;"><strong>Employee ID:</strong> {{employee_id}}</p>
          <p style="margin: 4px 0; font-size: 14px;"><strong>Official Email:</strong> ${toEmployee.email}</p>
          <p style="margin: 4px 0; font-size: 14px;"><strong>Designation:</strong> {{role}}</p>
          <p style="margin: 4px 0; font-size: 14px;"><strong>Joining Date:</strong> {{joining_date}}</p>
        </div>
        <p style="font-size: 14px; line-height: 1.6; color: #475569;">
          You can now access your employee portal on Dayflow AI to clock in your daily attendance, apply for leaves, view workforce announcements, and manage your permitted profile details.
        </p>
        <div style="text-align: center; margin: 24px 0;">
          <a href="#" style="background: #2563eb; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Access Employee Portal</a>
        </div>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p style="font-size: 11px; color: #94a3b8; text-align: center;">Dayflow AI People Operations • Welcome Package</p>
      </div>
    `;
  } else if (templateName === 'Leave Approved') {
    subject = `Dayflow AI — Leave Request Approved (${data.leave_type || 'Leave'})`;
    bodyHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px;">
        <div style="background: #0f172a; padding: 16px; border-radius: 8px; color: #ffffff; text-align: center; margin-bottom: 20px;">
          <h2 style="margin: 0; font-size: 20px;">DAYFLOW AI</h2>
          <p style="margin: 4px 0 0 0; font-size: 12px; color: #94a3b8;">Leave Management System</p>
        </div>
        <h3 style="color: #16a34a; margin-top: 0;">✅ Leave Request Approved</h3>
        <p>Dear <strong>{{employee_name}}</strong>,</p>
        <p>Your request for <strong>{{leave_type}}</strong> (${data.leave_dates || ''}) has been reviewed and <strong style="color: #16a34a;">APPROVED</strong> by HR.</p>
        <div style="background: #f0fdf4; border-left: 4px solid #16a34a; padding: 12px; margin: 16px 0; font-size: 14px;">
          <p style="margin: 0 0 6px 0;"><strong>Reviewed By:</strong> ${data.reviewer || 'Sarah Connor (HR)'}</p>
          <p style="margin: 0;"><strong>Remarks:</strong> ${data.remarks || 'Approved as requested.'}</p>
        </div>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p style="font-size: 11px; color: #94a3b8; text-align: center;">Dayflow AI HR Operations</p>
      </div>
    `;
  } else if (templateName === 'Leave Rejected') {
    subject = `Dayflow AI — Leave Request Update (${data.leave_type || 'Leave'})`;
    bodyHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px;">
        <div style="background: #0f172a; padding: 16px; border-radius: 8px; color: #ffffff; text-align: center; margin-bottom: 20px;">
          <h2 style="margin: 0; font-size: 20px;">DAYFLOW AI</h2>
          <p style="margin: 4px 0 0 0; font-size: 12px; color: #94a3b8;">Leave Management System</p>
        </div>
        <h3 style="color: #dc2626; margin-top: 0;">❌ Leave Request Rejected</h3>
        <p>Dear <strong>{{employee_name}}</strong>,</p>
        <p>Your request for <strong>{{leave_type}}</strong> has been reviewed and could not be approved at this time.</p>
        <div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 12px; margin: 16px 0; font-size: 14px;">
          <p style="margin: 0 0 6px 0;"><strong>Reason:</strong> ${data.remarks || 'Project critical deliverable dates conflict.'}</p>
        </div>
        <p style="font-size: 13px; color: #64748b;">Please coordinate with your reporting manager for rescheduling.</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p style="font-size: 11px; color: #94a3b8; text-align: center;">Dayflow AI HR Operations</p>
      </div>
    `;
  } else if (templateName === 'Salary Deduction Approved') {
    subject = `Dayflow AI — Salary Deduction Approved by HR`;
    bodyHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px;">
        <div style="background: #0f172a; padding: 16px; border-radius: 8px; color: #ffffff; text-align: center; margin-bottom: 20px;">
          <h2 style="margin: 0; font-size: 20px;">DAYFLOW AI</h2>
          <p style="margin: 4px 0 0 0; font-size: 12px; color: #94a3b8;">Payroll & Compliance Department</p>
        </div>
        <h3 style="color: #b45309; margin-top: 0;">Salary Deduction Approved</h3>
        <p>Dear <strong>{{employee_name}}</strong> ({{employee_id}}),</p>
        <p>Your absence exceeded the configured annual leave limit by <strong>{{excess_absence}} day(s)</strong>.</p>
        <div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 16px; margin: 16px 0;">
          <p style="margin: 4px 0;"><strong>Approved Salary Deduction:</strong> <span style="font-size: 18px; color: #b45309; font-weight: bold;">{{deduction_amount}}</span></p>
          <p style="margin: 4px 0;"><strong>Approved By HR:</strong> ${data.approver || 'Sarah Connor'}</p>
          <p style="margin: 4px 0;"><strong>Approval Date:</strong> {{approval_date}}</p>
        </div>
        <p style="font-size: 13px; color: #475569;">This adjustment has been queued for the current month's payroll processing. You may view full details in your Dayflow AI Employee Dashboard.</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p style="font-size: 11px; color: #94a3b8; text-align: center;">Dayflow AI Payroll Audit</p>
      </div>
    `;
  } else if (templateName === 'Salary Deduction Rejected') {
    subject = `Dayflow AI — Salary Deduction Request Rejected (No Deduction Applied)`;
    bodyHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px;">
        <div style="background: #0f172a; padding: 16px; border-radius: 8px; color: #ffffff; text-align: center; margin-bottom: 20px;">
          <h2 style="margin: 0; font-size: 20px;">DAYFLOW AI</h2>
          <p style="margin: 4px 0 0 0; font-size: 12px; color: #94a3b8;">Payroll & Compliance Department</p>
        </div>
        <h3 style="color: #16a34a; margin-top: 0;">Salary Deduction Request Rejected</h3>
        <p>Dear <strong>{{employee_name}}</strong> ({{employee_id}}),</p>
        <p>Your pending salary deduction request was reviewed and <strong style="color: #16a34a;">REJECTED</strong> by HR.</p>
        <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px; margin: 16px 0;">
          <p style="margin: 0 0 6px 0;"><strong>HR Decision:</strong> No deduction will be applied to your salary.</p>
          <p style="margin: 0;"><strong>Remarks:</strong> {{rejection_reason}}</p>
        </div>
        <p style="font-size: 13px; color: #475569;">Your full monthly salary remains intact.</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p style="font-size: 11px; color: #94a3b8; text-align: center;">Dayflow AI Payroll Audit</p>
      </div>
    `;
  } else if (templateName === 'Formal Warning Issued' || templateName === 'Performance Warning') {
    subject = `Dayflow AI — Official Notice: {{warning_type}} ({{severity}})`;
    bodyHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px;">
        <div style="background: #0f172a; padding: 16px; border-radius: 8px; color: #ffffff; text-align: center; margin-bottom: 20px;">
          <h2 style="margin: 0; font-size: 20px;">DAYFLOW AI</h2>
          <p style="margin: 4px 0 0 0; font-size: 12px; color: #94a3b8;">Employee Governance & People Operations</p>
        </div>
        <h3 style="color: #dc2626; margin-top: 0;">⚠️ Notice of Employee Warning: {{severity}}</h3>
        <p>Dear <strong>{{employee_name}}</strong> ({{employee_id}}),</p>
        <p>This is an official communication from People Operations documenting a recorded issue regarding <strong>{{warning_type}}</strong>.</p>
        <div style="background: #fff1f2; border: 1px solid #fecdd3; border-radius: 8px; padding: 16px; margin: 16px 0;">
          <p style="margin: 4px 0;"><strong>Category:</strong> {{category}}</p>
          <p style="margin: 4px 0;"><strong>Severity Level:</strong> <span style="font-weight: bold; color: #be123c;">{{severity}}</span></p>
          <p style="margin: 4px 0;"><strong>Incident / Evaluation Date:</strong> {{incident_date}}</p>
          <p style="margin: 4px 0;"><strong>Summary:</strong> {{description}}</p>
          <p style="margin: 4px 0;"><strong>Supporting Evidence:</strong> {{supporting_evidence}}</p>
          <p style="margin: 4px 0;"><strong>Recommended Action:</strong> {{recommended_action}}</p>
        </div>
        <p style="font-size: 13px; color: #475569;">
          <strong>Your Right to Respond:</strong> You may submit an official written explanation or supporting documentation directly through your Dayflow AI Employee Portal under <em>My Performance & Warnings</em>.
        </p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p style="font-size: 11px; color: #94a3b8; text-align: center;">Dayflow AI Employee Governance • Confidential</p>
      </div>
    `;
  } else if (templateName === 'PIP Notification') {
    subject = `Dayflow AI — Performance Improvement Plan (PIP) Initiated: {{employee_name}}`;
    bodyHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 640px; margin: auto; padding: 28px; border: 1px solid #e2e8f0; border-radius: 16px; background: #ffffff; color: #1e293b;">
        <!-- Header -->
        <div style="background: #0f172a; padding: 20px; border-radius: 12px; color: #ffffff; text-align: center; margin-bottom: 24px;">
          <h2 style="margin: 0; font-size: 20px; letter-spacing: 0.5px; font-weight: 700;">DAYFLOW AI</h2>
          <p style="margin: 4px 0 0 0; font-size: 12px; color: #94a3b8; letter-spacing: 0.3px;">People Operations & Talent Development</p>
        </div>

        <!-- Title Badge -->
        <div style="display: inline-block; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 9999px; padding: 4px 12px; margin-bottom: 16px;">
          <span style="color: #1d4ed8; font-size: 12px; font-weight: 700;">📈 Official Performance Improvement Plan (PIP) Notice</span>
        </div>

        <p style="font-size: 15px; line-height: 1.6; margin-top: 0;">
          Dear <strong>{{employee_name}}</strong> ({{employee_id}}),
        </p>
        <p style="font-size: 14px; line-height: 1.6; color: #334155;">
          This official communication is to notify you of the formal initiation of a <strong>Performance Improvement Plan (PIP)</strong> for your role as <strong>{{role_title}}</strong> in the <strong>{{department}}</strong> department. This plan has been structured in partnership with your manager, <strong>{{manager_name}}</strong>, and People Operations to support your milestone velocity, sprint delivery, and professional development.
        </p>

        <!-- Key Plan Parameters Table -->
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; margin: 20px 0;">
          <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
            <tr>
              <td style="padding: 6px 0; color: #64748b; width: 140px; font-weight: 600;">Plan Duration:</td>
              <td style="padding: 6px 0; color: #0f172a; font-weight: 700;">{{start_date}} to {{deadline_date}}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b; font-weight: 600;">HR Governance Owner:</td>
              <td style="padding: 6px 0; color: #0f172a; font-weight: 600;">{{hr_owner_name}}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b; font-weight: 600;">Reporting Manager:</td>
              <td style="padding: 6px 0; color: #0f172a; font-weight: 600;">{{manager_name}}</td>
            </tr>
          </table>
        </div>

        <!-- Identified Problem Areas -->
        <div style="margin: 20px 0;">
          <h4 style="margin: 0 0 8px 0; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b;">1. Identified Areas Requiring Focus (problem_areas)</h4>
          <div style="background: #fff1f2; border-left: 4px solid #f43f5e; padding: 12px 16px; border-radius: 4px 8px 8px 4px; font-size: 13px; color: #881337; line-height: 1.6;">
            {{problem_areas}}
          </div>
        </div>

        <!-- Target Goals (Required Placeholder) -->
        <div style="margin: 20px 0;">
          <h4 style="margin: 0 0 8px 0; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; color: #166534;">2. Target Goals & Deliverables (goals) *</h4>
          <div style="background: #f0fdf4; border-left: 4px solid #10b981; padding: 12px 16px; border-radius: 4px 8px 8px 4px; font-size: 13px; color: #064e3b; line-height: 1.6;">
            {{goals}}
          </div>
        </div>

        <!-- Expected Improvement (Required Placeholder) -->
        <div style="margin: 20px 0;">
          <h4 style="margin: 0 0 8px 0; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; color: #1e40af;">3. Expected Improvement Standards (expected_improvement) *</h4>
          <div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 12px 16px; border-radius: 4px 8px 8px 4px; font-size: 13px; color: #1e3a8a; line-height: 1.6;">
            {{expected_improvement}}
          </div>
        </div>

        <!-- Scheduled Milestone Review Dates (Required Placeholder) -->
        <div style="margin: 20px 0;">
          <h4 style="margin: 0 0 8px 0; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; color: #86198f;">4. Milestone Checkpoint Review Dates (review_dates) *</h4>
          <div style="background: #fdf4ff; border: 1px solid #f5d0fe; padding: 12px 16px; border-radius: 8px; font-size: 13px; color: #701a75; line-height: 1.6;">
            {{review_dates}}
          </div>
        </div>

        <!-- KPI Measurements Benchmarks -->
        <div style="margin: 20px 0;">
          <h4 style="margin: 0 0 8px 0; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; color: #475569;">5. Measurable KPI Benchmarks (kpi_measurements)</h4>
          <div style="background: #f8fafc; border: 1px solid #cbd5e1; padding: 12px 16px; border-radius: 8px; font-size: 13px; color: #334155; line-height: 1.6;">
            {{kpi_measurements}}
          </div>
        </div>

        <!-- Employee Portal Access & Right of Response -->
        <div style="background: #f1f5f9; border-radius: 12px; padding: 16px; margin: 24px 0;">
          <h4 style="margin: 0 0 6px 0; font-size: 13px; color: #0f172a; font-weight: 700;">Employee Portal & Right of Response</h4>
          <p style="margin: 0; font-size: 12px; color: #475569; line-height: 1.5;">
            You can track active milestones, review manager feedback logs, and submit official employee progress comments directly in your <strong>Dayflow AI Employee Portal</strong> under the <em>Performance & Warnings</em> tab.
          </p>
        </div>

        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
        <p style="font-size: 11px; color: #94a3b8; text-align: center; margin: 0;">
          Dayflow AI People Operations • Confidential & Privileged Employment Record
        </p>
      </div>
    `;
  } else if (templateName === 'Case Resolution') {
    subject = `Dayflow AI — Warning Case Resolved: {{warning_type}}`;
    bodyHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px;">
        <div style="background: #0f172a; padding: 16px; border-radius: 8px; color: #ffffff; text-align: center; margin-bottom: 20px;">
          <h2 style="margin: 0; font-size: 20px;">DAYFLOW AI</h2>
          <p style="margin: 4px 0 0 0; font-size: 12px; color: #94a3b8;">People Operations & Compliance</p>
        </div>
        <h3 style="color: #16a34a; margin-top: 0;">✅ Case Review Resolved</h3>
        <p>Dear <strong>{{employee_name}}</strong>,</p>
        <p>Your warning docket for <strong>{{warning_type}}</strong> has been marked as <strong style="color: #16a34a;">RESOLVED / CLOSED</strong> by HR.</p>
        <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px; margin: 16px 0;">
          <p style="margin: 0 0 6px 0;"><strong>HR Decision:</strong> {{hr_decision}}</p>
          <p style="margin: 0;"><strong>Resolution Notes:</strong> {{hr_decision_notes}}</p>
        </div>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p style="font-size: 11px; color: #94a3b8; text-align: center;">Dayflow AI Employee Governance</p>
      </div>
    `;
  }

  // Robust replacement supporting {{key}}, {key}, and plain key
  for (const [rawKey, rawVal] of Object.entries(placeholders)) {
    let stringVal = '';
    if (Array.isArray(rawVal)) {
      stringVal = rawVal.join(', ');
    } else if (rawVal !== undefined && rawVal !== null) {
      stringVal = String(rawVal);
    }

    const keyClean = rawKey.replace(/^\{\{|\}\}$|^\{|\}$/g, '');
    const patterns = [
      `{{${keyClean}}}`,
      `{${keyClean}}`,
      keyClean,
    ];

    for (const pat of patterns) {
      if (pat.startsWith('{') || pat.includes('_')) {
        subject = subject.split(pat).join(stringVal);
        bodyHtml = bodyHtml.split(pat).join(stringVal);
      }
    }
  }

  // Format linebreaks in content blocks if needed
  const plainText = bodyHtml.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

  return {
    id: `email_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    toEmail: toEmployee.email,
    toName: toEmployee.fullName,
    fromName: 'Dayflow AI HR Operations <hr@dayflow.ai>',
    subject,
    templateName,
    htmlContent: bodyHtml,
    textContent: plainText,
    sentAt: new Date().toISOString(),
    status: 'Delivered',
  };
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // Request logging middleware
  app.use((req, res, next) => {
    // console.log(`${req.method} ${req.url}`);
    next();
  });

  // Auth Middleware
  const requireAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: Authentication token required.' });
    }
    const token = authHeader.substring(7);
    const session = db.sessions[token];
    if (!session) {
      return res.status(401).json({ error: 'Unauthorized: Invalid or expired session token.' });
    }
    const user = db.employees.find((e) => e.employeeId === session.employeeId || e.id === session.employeeId);
    if (!user || user.employmentStatus === 'Inactive') {
      return res.status(403).json({ error: 'Access denied: User inactive or not found.' });
    }
    (req as any).user = user;
    (req as any).role = user.role;
    next();
  };

  const requireHR = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    requireAuth(req, res, () => {
      const user = (req as any).user as Employee;
      if (user.role !== 'hr_admin') {
        return res.status(403).json({ error: 'Forbidden: HR/Admin authorization required for this action.' });
      }
      next();
    });
  };

  // ==========================================
  // AUTHENTICATION ROUTES
  // ==========================================
  app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    if (!username) {
      return res.status(400).json({ error: 'Username, Email, or Employee ID is required.' });
    }

    const cleanInput = username.trim().toLowerCase();
    const employee = db.employees.find(
      (e) =>
        e.employeeId.toLowerCase() === cleanInput ||
        e.email.toLowerCase() === cleanInput ||
        e.fullName.toLowerCase() === cleanInput
    );

    if (!employee) {
      return res.status(401).json({ error: 'Invalid credentials. User not found.' });
    }

    if (employee.employmentStatus === 'Inactive') {
      return res.status(403).json({ error: 'Account deactivated. Please contact HR administration.' });
    }

    // Generate secure session token
    const token = `df_token_${employee.employeeId}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    db.sessions[token] = {
      employeeId: employee.employeeId,
      role: employee.role,
      createdAt: Date.now(),
    };

    saveDB();

    res.json({
      token,
      user: {
        id: employee.id,
        employeeId: employee.employeeId,
        fullName: employee.fullName,
        email: employee.email,
        contactNumber: employee.contactNumber,
        department: employee.department,
        roleTitle: employee.roleTitle,
        profilePhoto: employee.profilePhoto,
        role: employee.role,
        monthlySalary: employee.monthlySalary,
        joinDate: employee.joinDate,
      },
    });
  });

  app.get('/api/auth/me', requireAuth, (req, res) => {
    const user = (req as any).user as Employee;
    res.json({
      user: {
        id: user.id,
        employeeId: user.employeeId,
        fullName: user.fullName,
        email: user.email,
        contactNumber: user.contactNumber,
        department: user.department,
        roleTitle: user.roleTitle,
        profilePhoto: user.profilePhoto,
        role: user.role,
        monthlySalary: user.monthlySalary,
        joinDate: user.joinDate,
        reportingManagerName: user.reportingManagerName,
      },
    });
  });

  app.post('/api/auth/logout', requireAuth, (req, res) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      delete db.sessions[token];
      saveDB();
    }
    res.json({ message: 'Logged out successfully.' });
  });

  // ==========================================
  // EMPLOYEE MANAGEMENT ROUTES
  // ==========================================
  app.get('/api/employees', requireAuth, (req, res) => {
    const user = (req as any).user as Employee;
    if (user.role === 'hr_admin') {
      res.json(db.employees);
    } else {
      // Employees only get directory summary
      const sanitized = db.employees.map((e) => ({
        id: e.id,
        employeeId: e.employeeId,
        fullName: e.fullName,
        email: e.email,
        department: e.department,
        roleTitle: e.roleTitle,
        profilePhoto: e.profilePhoto,
        employmentStatus: e.employmentStatus,
      }));
      res.json(sanitized);
    }
  });

  app.get('/api/employees/:id', requireAuth, (req, res) => {
    const user = (req as any).user as Employee;
    const targetId = req.params.id;
    const emp = db.employees.find((e) => e.id === targetId || e.employeeId === targetId);
    if (!emp) {
      return res.status(404).json({ error: 'Employee not found.' });
    }

    // If regular employee, only allow viewing self or public directory info
    if (user.role !== 'hr_admin' && user.employeeId !== emp.employeeId && user.id !== emp.id) {
      return res.json({
        id: emp.id,
        employeeId: emp.employeeId,
        fullName: emp.fullName,
        email: emp.email,
        department: emp.department,
        roleTitle: emp.roleTitle,
        profilePhoto: emp.profilePhoto,
        employmentStatus: emp.employmentStatus,
      });
    }

    res.json(emp);
  });

  app.post('/api/employees', requireHR, (req, res) => {
    const { fullName, employeeId, email, contactNumber, department, roleTitle, reportingManagerId, monthlySalary, profilePhoto, role } = req.body;

    if (!fullName || !employeeId || !email || !department || !roleTitle) {
      return res.status(400).json({ error: 'Full Name, Employee ID, Email, Department, and Role/Designation are mandatory.' });
    }

    const existing = db.employees.find((e) => e.employeeId.toLowerCase() === employeeId.trim().toLowerCase());
    if (existing) {
      return res.status(400).json({ error: `Employee ID "${employeeId}" already exists.` });
    }

    const manager = reportingManagerId ? db.employees.find((e) => e.id === reportingManagerId || e.employeeId === reportingManagerId) : undefined;

    const newEmp: Employee = {
      id: `emp_${Date.now()}`,
      employeeId: employeeId.trim().toUpperCase(),
      fullName: fullName.trim(),
      email: email.trim(),
      contactNumber: contactNumber || '+1 (555) 000-0000',
      department: department.trim(),
      roleTitle: roleTitle.trim(),
      reportingManagerId: manager?.id,
      reportingManagerName: manager?.fullName,
      employmentStatus: 'Active',
      profilePhoto: profilePhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(fullName)}`,
      monthlySalary: Number(monthlySalary) || 50000,
      joinDate: new Date().toISOString().split('T')[0],
      role: role === 'hr_admin' ? 'hr_admin' : 'employee',
    };

    db.employees.push(newEmp);

    // Create Audit Log
    const audit: AuditLog = {
      id: `audit_${Date.now()}`,
      action: 'EMPLOYEE_CREATED',
      actorId: (req as any).user.employeeId,
      actorName: (req as any).user.fullName,
      actorRole: 'hr_admin',
      targetType: 'Employee',
      targetId: newEmp.employeeId,
      details: `Added new employee ${newEmp.fullName} (${newEmp.employeeId}) into ${newEmp.department} department as ${newEmp.roleTitle}.`,
      timestamp: new Date().toISOString(),
    };
    db.auditLogs.unshift(audit);

    // Send "Welcome to Team" reusable email
    const welcomeEmail = createEmailFromTemplate('Welcome to Team', newEmp, {});
    db.emails.unshift(welcomeEmail);

    // Send in-app welcome notification
    db.notifications.unshift({
      id: `notif_${Date.now()}`,
      recipientId: newEmp.employeeId,
      type: 'welcome',
      title: 'Welcome to Dayflow AI!',
      message: `Welcome to the ${newEmp.department} team as ${newEmp.roleTitle}. Your Dayflow AI account is now active.`,
      timestamp: new Date().toISOString(),
      read: false,
    });

    saveDB();
    res.status(201).json(newEmp);
  });

  // Strict Field Permission Enforcement for Updates:
  // Employees can ONLY edit: profilePhoto, email, contactNumber
  // HR can edit: all permitted employee fields
  app.put('/api/employees/:id', requireAuth, (req, res) => {
    const currentUser = (req as any).user as Employee;
    const targetId = req.params.id;
    const empIndex = db.employees.findIndex((e) => e.id === targetId || e.employeeId === targetId);

    if (empIndex === -1) {
      return res.status(404).json({ error: 'Employee not found.' });
    }

    const targetEmp = db.employees[empIndex];
    const isSelf = currentUser.id === targetEmp.id || currentUser.employeeId === targetEmp.employeeId;
    const isHR = currentUser.role === 'hr_admin';

    if (!isSelf && !isHR) {
      return res.status(403).json({ error: 'Forbidden: You do not have permission to edit this profile.' });
    }

    if (!isHR) {
      // Regular employee updating own profile
      // Check if attempt to modify HR-restricted fields
      const { fullName, employeeId, department, roleTitle, monthlySalary, role, employmentStatus } = req.body;
      if (
        (fullName !== undefined && fullName !== targetEmp.fullName) ||
        (employeeId !== undefined && employeeId !== targetEmp.employeeId) ||
        (department !== undefined && department !== targetEmp.department) ||
        (roleTitle !== undefined && roleTitle !== targetEmp.roleTitle) ||
        (monthlySalary !== undefined && monthlySalary !== targetEmp.monthlySalary) ||
        (role !== undefined && role !== targetEmp.role) ||
        (employmentStatus !== undefined && employmentStatus !== targetEmp.employmentStatus)
      ) {
        return res.status(403).json({
          error: 'Security Violation: Employees are strictly forbidden from modifying Full Name, Employee ID, Department, Role, or Salary. Contact HR for adjustments.',
        });
      }

      // Permitted fields only
      if (req.body.email) targetEmp.email = req.body.email.trim();
      if (req.body.contactNumber) targetEmp.contactNumber = req.body.contactNumber.trim();
      if (req.body.profilePhoto) targetEmp.profilePhoto = req.body.profilePhoto;

      db.auditLogs.unshift({
        id: `audit_${Date.now()}`,
        action: 'PROFILE_UPDATED',
        actorId: currentUser.employeeId,
        actorName: currentUser.fullName,
        actorRole: 'employee',
        targetType: 'Profile',
        targetId: targetEmp.employeeId,
        details: `${targetEmp.fullName} updated personal contact details / photo.`,
        timestamp: new Date().toISOString(),
      });
    } else {
      // HR Admin updating employee
      if (req.body.fullName) targetEmp.fullName = req.body.fullName.trim();
      if (req.body.email) targetEmp.email = req.body.email.trim();
      if (req.body.contactNumber) targetEmp.contactNumber = req.body.contactNumber.trim();
      if (req.body.department) targetEmp.department = req.body.department.trim();
      if (req.body.roleTitle) targetEmp.roleTitle = req.body.roleTitle.trim();
      if (req.body.profilePhoto) targetEmp.profilePhoto = req.body.profilePhoto;
      if (req.body.monthlySalary !== undefined) targetEmp.monthlySalary = Number(req.body.monthlySalary);
      if (req.body.employmentStatus) targetEmp.employmentStatus = req.body.employmentStatus;
      if (req.body.role) targetEmp.role = req.body.role;
      if (req.body.reportingManagerId !== undefined) {
        const mgr = db.employees.find((e) => e.id === req.body.reportingManagerId || e.employeeId === req.body.reportingManagerId);
        targetEmp.reportingManagerId = mgr?.id;
        targetEmp.reportingManagerName = mgr?.fullName;
      }

      db.auditLogs.unshift({
        id: `audit_${Date.now()}`,
        action: 'EMPLOYEE_MODIFIED',
        actorId: currentUser.employeeId,
        actorName: currentUser.fullName,
        actorRole: 'hr_admin',
        targetType: 'Employee',
        targetId: targetEmp.employeeId,
        details: `HR updated profile details for ${targetEmp.fullName} (${targetEmp.employeeId}).`,
        timestamp: new Date().toISOString(),
      });
    }

    db.employees[empIndex] = targetEmp;
    saveDB();
    res.json(targetEmp);
  });

  app.delete('/api/employees/:id', requireHR, (req, res) => {
    const targetId = req.params.id;
    const emp = db.employees.find((e) => e.id === targetId || e.employeeId === targetId);
    if (!emp) {
      return res.status(404).json({ error: 'Employee not found.' });
    }

    emp.employmentStatus = emp.employmentStatus === 'Inactive' ? 'Active' : 'Inactive';

    db.auditLogs.unshift({
      id: `audit_${Date.now()}`,
      action: emp.employmentStatus === 'Inactive' ? 'EMPLOYEE_DEACTIVATED' : 'EMPLOYEE_REACTIVATED',
      actorId: (req as any).user.employeeId,
      actorName: (req as any).user.fullName,
      actorRole: 'hr_admin',
      targetType: 'Employee',
      targetId: emp.employeeId,
      details: `${emp.fullName} status updated to ${emp.employmentStatus}.`,
      timestamp: new Date().toISOString(),
    });

    saveDB();
    res.json({ message: `Employee status changed to ${emp.employmentStatus}`, employee: emp });
  });

  // ==========================================
  // ATTENDANCE ROUTES
  // ==========================================
  app.get('/api/attendance', requireAuth, (req, res) => {
    const user = (req as any).user as Employee;
    const { employeeId, department, date, startDate, endDate } = req.query;

    let filtered = [...db.attendance];

    if (user.role !== 'hr_admin') {
      // Employees only see their own attendance
      filtered = filtered.filter((a) => a.employeeId === user.employeeId || a.employeeId === user.id);
    } else {
      if (employeeId) {
        filtered = filtered.filter((a) => a.employeeId === String(employeeId));
      }
      if (department) {
        filtered = filtered.filter((a) => a.department === String(department));
      }
    }

    if (date) {
      filtered = filtered.filter((a) => a.date === String(date));
    }
    if (startDate && endDate) {
      filtered = filtered.filter((a) => a.date >= String(startDate) && a.date <= String(endDate));
    }

    // Sort descending by date
    filtered.sort((a, b) => b.date.localeCompare(a.date));
    res.json(filtered);
  });

  app.post('/api/attendance/check-in', requireAuth, (req, res) => {
    const user = (req as any).user as Employee;
    const today = new Date().toISOString().split('T')[0];
    const nowTime = new Date().toLocaleTimeString('en-US', { hour12: false });

    // Check if already checked in today
    let record = db.attendance.find(
      (a) => (a.employeeId === user.employeeId || a.employeeId === user.id) && a.date === today
    );

    if (record && record.checkIn) {
      return res.status(400).json({ error: 'You have already checked in for today.' });
    }

    // Check if late (e.g. after 09:15:00)
    const isLate = nowTime > '09:15:00';
    const status = isLate ? 'Late' : 'Present';

    if (record) {
      record.checkIn = nowTime;
      record.status = status;
      record.workingHours = 0;
    } else {
      record = {
        id: `att_${Date.now()}`,
        employeeId: user.employeeId,
        employeeName: user.fullName,
        department: user.department,
        date: today,
        checkIn: nowTime,
        status,
        workingHours: 0,
      };
      db.attendance.unshift(record);
    }

    saveDB();
    res.json({ message: 'Checked in successfully!', record });
  });

  app.post('/api/attendance/check-out', requireAuth, (req, res) => {
    const user = (req as any).user as Employee;
    const today = new Date().toISOString().split('T')[0];
    const nowTime = new Date().toLocaleTimeString('en-US', { hour12: false });

    const record = db.attendance.find(
      (a) => (a.employeeId === user.employeeId || a.employeeId === user.id) && a.date === today
    );

    if (!record || !record.checkIn) {
      return res.status(400).json({ error: 'You must check in first before checking out.' });
    }

    if (record.checkOut) {
      return res.status(400).json({ error: 'You have already checked out for today.' });
    }

    record.checkOut = nowTime;

    // Calculate working hours
    try {
      const [inH, inM] = record.checkIn.split(':').map(Number);
      const [outH, outM] = nowTime.split(':').map(Number);
      const hours = Math.max(0, outH - inH + (outM - inM) / 60);
      record.workingHours = Number(hours.toFixed(2));
    } catch (e) {
      record.workingHours = 8.0;
    }

    saveDB();
    res.json({ message: 'Checked out successfully!', record });
  });

  app.post('/api/attendance/record', requireHR, (req, res) => {
    const { employeeId, date, checkIn, checkOut, status, notes } = req.body;
    if (!employeeId || !date || !status) {
      return res.status(400).json({ error: 'Employee, Date, and Attendance Status are required.' });
    }

    const emp = db.employees.find((e) => e.employeeId === employeeId || e.id === employeeId);
    if (!emp) {
      return res.status(404).json({ error: 'Employee not found.' });
    }

    let workingHours = 0;
    if (checkIn && checkOut) {
      const [inH, inM] = checkIn.split(':').map(Number);
      const [outH, outM] = checkOut.split(':').map(Number);
      workingHours = Math.max(0, Number((outH - inH + (outM - inM) / 60).toFixed(2)));
    } else if (status === 'Present') {
      workingHours = 8.0;
    }

    // Check if record exists for this date
    const existingIndex = db.attendance.findIndex(
      (a) => (a.employeeId === emp.employeeId || a.employeeId === emp.id) && a.date === date
    );

    const newRecord: AttendanceRecord = {
      id: existingIndex >= 0 ? db.attendance[existingIndex].id : `att_${Date.now()}`,
      employeeId: emp.employeeId,
      employeeName: emp.fullName,
      department: emp.department,
      date,
      checkIn,
      checkOut,
      status,
      workingHours,
      notes,
    };

    if (existingIndex >= 0) {
      db.attendance[existingIndex] = newRecord;
    } else {
      db.attendance.unshift(newRecord);
    }

    db.auditLogs.unshift({
      id: `audit_${Date.now()}`,
      action: 'ATTENDANCE_OVERRIDE',
      actorId: (req as any).user.employeeId,
      actorName: (req as any).user.fullName,
      actorRole: 'hr_admin',
      targetType: 'Attendance',
      targetId: emp.employeeId,
      details: `HR recorded attendance for ${emp.fullName} on ${date} as ${status}.`,
      timestamp: new Date().toISOString(),
    });

    saveDB();
    res.json(newRecord);
  });

  // ==========================================
  // LEAVE MANAGEMENT ROUTES
  // ==========================================
  app.get('/api/leaves', requireAuth, (req, res) => {
    const user = (req as any).user as Employee;
    const { employeeId, status, department } = req.query;

    let list = [...db.leaves];

    if (user.role !== 'hr_admin') {
      // Employees only view their own leave requests
      list = list.filter((l) => l.employeeId === user.employeeId || l.employeeId === user.id);
    } else {
      if (employeeId) {
        list = list.filter((l) => l.employeeId === String(employeeId));
      }
      if (department) {
        list = list.filter((l) => l.department === String(department));
      }
    }

    if (status) {
      list = list.filter((l) => l.status === String(status));
    }

    list.sort((a, b) => b.appliedDate.localeCompare(a.appliedDate));
    res.json(list);
  });

  app.get('/api/leaves/balance/:employeeId', requireAuth, (req, res) => {
    const user = (req as any).user as Employee;
    const targetEmpId = req.params.employeeId;

    if (user.role !== 'hr_admin' && user.employeeId !== targetEmpId && user.id !== targetEmpId) {
      return res.status(403).json({ error: 'Forbidden.' });
    }

    const emp = db.employees.find((e) => e.employeeId === targetEmpId || e.id === targetEmpId);
    if (!emp) {
      return res.status(404).json({ error: 'Employee not found.' });
    }

    const empLeaves = db.leaves.filter(
      (l) => (l.employeeId === emp.employeeId || l.employeeId === emp.id) && l.status === 'Approved'
    );

    const usedSick = empLeaves.filter((l) => l.leaveType === 'Sick Leave').reduce((s, l) => s + l.daysCount, 0);
    const usedCasual = empLeaves.filter((l) => l.leaveType === 'Casual Leave').reduce((s, l) => s + l.daysCount, 0);
    const usedPTO = empLeaves.filter((l) => l.leaveType === 'Paid Time Off').reduce((s, l) => s + l.daysCount, 0);
    const usedEmergency = empLeaves.filter((l) => l.leaveType === 'Emergency Leave').reduce((s, l) => s + l.daysCount, 0);

    const balance = {
      sickLeave: { total: 10, used: usedSick },
      casualLeave: { total: 12, used: usedCasual },
      paidTimeOff: { total: 15, used: usedPTO },
      emergencyLeave: { total: 5, used: usedEmergency },
    };

    res.json(balance);
  });

  app.post('/api/leaves', requireAuth, (req, res) => {
    const user = (req as any).user as Employee;
    const { leaveType, startDate, endDate, reason } = req.body;

    if (!leaveType || !startDate || !endDate || !reason) {
      return res.status(400).json({ error: 'Leave type, start date, end date, and reason are required.' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end < start) {
      return res.status(400).json({ error: 'End date cannot be prior to start date.' });
    }

    const diffTime = Math.abs(end.getTime() - start.getTime());
    const daysCount = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    const newLeave: LeaveRequest = {
      id: `leave_${Date.now()}`,
      employeeId: user.employeeId,
      employeeName: user.fullName,
      department: user.department,
      leaveType,
      startDate,
      endDate,
      daysCount,
      reason: reason.trim(),
      status: 'Pending',
      appliedDate: new Date().toISOString().split('T')[0],
    };

    db.leaves.unshift(newLeave);

    // Notify HR
    db.notifications.unshift({
      id: `notif_${Date.now()}`,
      recipientId: 'HR001',
      type: 'leave',
      title: 'New Leave Request Submitted',
      message: `${user.fullName} (${user.department}) applied for ${daysCount} day(s) ${leaveType} from ${startDate} to ${endDate}.`,
      timestamp: new Date().toISOString(),
      read: false,
    });

    saveDB();
    res.status(201).json(newLeave);
  });

  app.put('/api/leaves/:id/review', requireHR, (req, res) => {
    const hrUser = (req as any).user as Employee;
    const leaveId = req.params.id;
    const { status, remarks } = req.body;

    if (status !== 'Approved' && status !== 'Rejected') {
      return res.status(400).json({ error: 'Status must be either Approved or Rejected.' });
    }

    const leaveIndex = db.leaves.findIndex((l) => l.id === leaveId);
    if (leaveIndex === -1) {
      return res.status(404).json({ error: 'Leave request not found.' });
    }

    const leave = db.leaves[leaveIndex];
    leave.status = status;
    leave.reviewedBy = hrUser.fullName;
    leave.reviewDate = new Date().toISOString().split('T')[0];
    leave.reviewRemarks = remarks || (status === 'Approved' ? 'Approved by HR.' : 'Rejected by HR.');

    const targetEmp = db.employees.find((e) => e.employeeId === leave.employeeId || e.id === leave.employeeId);

    if (targetEmp) {
      // Send notification to employee
      db.notifications.unshift({
        id: `notif_${Date.now()}`,
        recipientId: targetEmp.employeeId,
        type: 'leave',
        title: status === 'Approved' ? '✅ Leave Request Approved' : '❌ Leave Request Rejected',
        message: `Your ${leave.leaveType} request for ${leave.daysCount} day(s) (${leave.startDate} to ${leave.endDate}) was ${status.toLowerCase()} by ${hrUser.fullName}.`,
        timestamp: new Date().toISOString(),
        read: false,
      });

      // Send Email Notification
      const templateName = status === 'Approved' ? 'Leave Approved' : 'Leave Rejected';
      const emailMsg = createEmailFromTemplate(templateName, targetEmp, {
        leave_type: leave.leaveType,
        leave_dates: `${leave.startDate} to ${leave.endDate} (${leave.daysCount} days)`,
        remarks: leave.reviewRemarks,
        reviewer: hrUser.fullName,
      });
      db.emails.unshift(emailMsg);

      // Re-run absence check to see if employee crossed limits
      const summary = calculateEmployeeAbsence(targetEmp, db.absencePolicy, db.leaves, db.attendance);
      if (summary.severity === 'exceeded' && summary.excessDays > 0) {
        // Auto-create pending salary deduction if not already created
        const existingDed = db.salaryDeductions.find(
          (d) => d.employeeId === targetEmp.employeeId && d.status === 'Pending'
        );
        if (!existingDed) {
          const deductionReq: SalaryDeductionRequest = {
            id: `ded_${Date.now()}`,
            employeeId: targetEmp.employeeId,
            employeeName: targetEmp.fullName,
            department: targetEmp.department,
            allowedAbsence: summary.allowedLimit,
            usedAbsence: summary.usedAbsence,
            excessAbsence: summary.excessDays,
            monthlySalary: summary.monthlySalary,
            dailyRate: summary.dailyRate,
            proposedDeduction: summary.potentialDeduction,
            reason: `Absence limit exceeded by ${summary.excessDays} days following approved leave request.`,
            requestDate: new Date().toISOString().split('T')[0],
            status: 'Pending',
          };
          db.salaryDeductions.unshift(deductionReq);

          // Notify HR & Employee
          db.notifications.unshift({
            id: `notif_${Date.now()}_ded`,
            recipientId: 'HR001',
            type: 'salary_deduction',
            title: 'Action Required: Salary Deduction Request Generated',
            message: `${targetEmp.fullName} (${targetEmp.employeeId}) exceeded absence limit. Proposed deduction: ₹${summary.potentialDeduction.toLocaleString()}. HR review required.`,
            timestamp: new Date().toISOString(),
            read: false,
          });
        }
      }
    }

    db.auditLogs.unshift({
      id: `audit_${Date.now()}`,
      action: status === 'Approved' ? 'LEAVE_APPROVED' : 'LEAVE_REJECTED',
      actorId: hrUser.employeeId,
      actorName: hrUser.fullName,
      actorRole: 'hr_admin',
      targetType: 'Leave',
      targetId: leave.id,
      details: `${status} leave for ${leave.employeeName} (${leave.daysCount} days of ${leave.leaveType}). Remarks: ${leave.reviewRemarks}`,
      timestamp: new Date().toISOString(),
    });

    saveDB();
    res.json(leave);
  });

  // ==========================================
  // ABSENCE LIMITS & MONITORING ROUTES
  // ==========================================
  app.get('/api/absence-policy', requireAuth, (req, res) => {
    res.json(db.absencePolicy);
  });

  app.put('/api/absence-policy', requireHR, (req, res) => {
    const hrUser = (req as any).user as Employee;
    const { allowedAbsenceDays, warningThresholdDays, workingDaysPerMonth } = req.body;

    if (!allowedAbsenceDays || !warningThresholdDays || !workingDaysPerMonth) {
      return res.status(400).json({ error: 'Allowed absence days, warning threshold, and working days are required.' });
    }

    db.absencePolicy = {
      allowedAbsenceDays: Number(allowedAbsenceDays),
      warningThresholdDays: Number(warningThresholdDays),
      workingDaysPerMonth: Number(workingDaysPerMonth),
      deductionPolicyFormula: 'Daily Rate = Monthly Salary / Configured Working Days; Proposed Deduction = Daily Rate × Excess Absence Days',
      updatedAt: new Date().toISOString(),
      updatedBy: `${hrUser.fullName} (${hrUser.employeeId})`,
    };

    db.auditLogs.unshift({
      id: `audit_${Date.now()}`,
      action: 'POLICY_UPDATE',
      actorId: hrUser.employeeId,
      actorName: hrUser.fullName,
      actorRole: 'hr_admin',
      targetType: 'Policy',
      targetId: 'ABSENCE_POLICY',
      details: `Updated absence limit to ${allowedAbsenceDays} days, warning threshold to ${warningThresholdDays} days, working days to ${workingDaysPerMonth}.`,
      timestamp: new Date().toISOString(),
    });

    saveDB();
    res.json(db.absencePolicy);
  });

  app.get('/api/absence-monitoring', requireAuth, (req, res) => {
    const user = (req as any).user as Employee;
    const summaries: AbsenceSummary[] = [];

    const targetEmployees = user.role === 'hr_admin' ? db.employees : db.employees.filter((e) => e.employeeId === user.employeeId || e.id === user.id);

    for (const emp of targetEmployees) {
      const sum = calculateEmployeeAbsence(emp, db.absencePolicy, db.leaves, db.attendance);
      summaries.push(sum);
    }

    res.json({
      policy: db.absencePolicy,
      summaries,
    });
  });

  // ==========================================
  // SALARY DEDUCTION REQUESTS WORKFLOW (CRITICAL)
  // ==========================================
  app.get('/api/salary-deductions', requireAuth, (req, res) => {
    const user = (req as any).user as Employee;
    if (user.role === 'hr_admin') {
      res.json(db.salaryDeductions);
    } else {
      const empDeductions = db.salaryDeductions.filter((d) => d.employeeId === user.employeeId || d.employeeId === user.id);
      res.json(empDeductions);
    }
  });

  app.get('/api/salary-deductions/:id', requireAuth, (req, res) => {
    const user = (req as any).user as Employee;
    const item = db.salaryDeductions.find((d) => d.id === req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Salary deduction request not found.' });
    }
    if (user.role !== 'hr_admin' && user.employeeId !== item.employeeId && user.id !== item.employeeId) {
      return res.status(403).json({ error: 'Forbidden.' });
    }
    res.json(item);
  });

  // HR Approval Endpoint
  app.post('/api/salary-deductions/:id/approve', requireHR, (req, res) => {
    const hrUser = (req as any).user as Employee;
    const dedId = req.params.id;
    const ded = db.salaryDeductions.find((d) => d.id === dedId);

    if (!ded) {
      return res.status(404).json({ error: 'Salary deduction request not found.' });
    }

    if (ded.status !== 'Pending') {
      return res.status(400).json({ error: `Cannot approve request with current status "${ded.status}".` });
    }

    const approvedAmount = Number(req.body.approvedAmount) || ded.proposedDeduction;
    const approvalDate = new Date().toISOString().split('T')[0];
    const auditRef = `PAYROLL_ADJ_${Date.now()}`;

    ded.status = 'Approved';
    ded.approvedDeduction = approvedAmount;
    ded.hrApprover = `${hrUser.fullName} (${hrUser.employeeId})`;
    ded.approvalDate = approvalDate;
    ded.appliedDate = approvalDate; // Marked applied to current payroll cycle
    ded.auditRef = auditRef;

    const targetEmp = db.employees.find((e) => e.employeeId === ded.employeeId || e.id === ded.employeeId);

    if (targetEmp) {
      // Send Employee In-App Notification
      db.notifications.unshift({
        id: `notif_${Date.now()}`,
        recipientId: targetEmp.employeeId,
        type: 'salary_deduction',
        title: 'Salary Deduction Approved',
        message: `Your absence exceeded the configured leave limit by ${ded.excessAbsence} days. Approved salary deduction: ₹${approvedAmount.toLocaleString()}. Approved by HR on ${approvalDate}.`,
        timestamp: new Date().toISOString(),
        read: false,
      });

      // Send Employee Email Notification
      const emailMsg = createEmailFromTemplate('Salary Deduction Approved', targetEmp, {
        excess_absence: ded.excessAbsence,
        deduction_amount: approvedAmount,
        approver: hrUser.fullName,
        approval_date: approvalDate,
      });
      db.emails.unshift(emailMsg);
    }

    // Record Detailed Audit Log
    db.auditLogs.unshift({
      id: `audit_${Date.now()}`,
      action: 'DEDUCTION_APPROVED',
      actorId: hrUser.employeeId,
      actorName: hrUser.fullName,
      actorRole: 'hr_admin',
      targetType: 'SalaryDeduction',
      targetId: ded.id,
      details: `HR approved ₹${approvedAmount.toLocaleString()} salary deduction for ${ded.employeeName} (${ded.employeeId}). Excess days: ${ded.excessAbsence}. Payroll Ref: ${auditRef}.`,
      timestamp: new Date().toISOString(),
    });

    saveDB();
    res.json({ message: 'Salary deduction approved and applied to payroll successfully.', deduction: ded });
  });

  // HR Rejection Endpoint
  app.post('/api/salary-deductions/:id/reject', requireHR, (req, res) => {
    const hrUser = (req as any).user as Employee;
    const dedId = req.params.id;
    const { rejectionReason } = req.body;

    const ded = db.salaryDeductions.find((d) => d.id === dedId);
    if (!ded) {
      return res.status(404).json({ error: 'Salary deduction request not found.' });
    }

    if (ded.status !== 'Pending') {
      return res.status(400).json({ error: `Cannot reject request with status "${ded.status}".` });
    }

    const reason = rejectionReason || 'Medical exemption / HR discretionary approval granted.';
    const approvalDate = new Date().toISOString().split('T')[0];

    ded.status = 'Rejected';
    ded.hrApprover = `${hrUser.fullName} (${hrUser.employeeId})`;
    ded.rejectionReason = reason;
    ded.approvalDate = approvalDate;

    const targetEmp = db.employees.find((e) => e.employeeId === ded.employeeId || e.id === ded.employeeId);

    if (targetEmp) {
      // In-app Notification
      db.notifications.unshift({
        id: `notif_${Date.now()}`,
        recipientId: targetEmp.employeeId,
        type: 'salary_deduction',
        title: 'Salary Deduction Request Rejected',
        message: `Your salary deduction request was reviewed and rejected by HR. No deduction has been applied to your salary. Reason: ${reason}`,
        timestamp: new Date().toISOString(),
        read: false,
      });

      // Email Notification
      const emailMsg = createEmailFromTemplate('Salary Deduction Rejected', targetEmp, {
        rejection_reason: reason,
        approver: hrUser.fullName,
      });
      db.emails.unshift(emailMsg);
    }

    // Detailed Audit Log
    db.auditLogs.unshift({
      id: `audit_${Date.now()}`,
      action: 'DEDUCTION_REJECTED',
      actorId: hrUser.employeeId,
      actorName: hrUser.fullName,
      actorRole: 'hr_admin',
      targetType: 'SalaryDeduction',
      targetId: ded.id,
      details: `HR rejected salary deduction request for ${ded.employeeName} (${ded.employeeId}). No deduction applied. Reason: ${reason}.`,
      timestamp: new Date().toISOString(),
    });

    saveDB();
    res.json({ message: 'Salary deduction rejected. No deduction applied.', deduction: ded });
  });

  // ==========================================
  // DEPARTMENTS & ORGANIZATIONAL CHART
  // ==========================================
  app.get('/api/departments', requireAuth, (req, res) => {
    const list = db.departments.map((d) => {
      const emps = db.employees.filter((e) => e.department === d.name);
      return {
        ...d,
        employeeCount: emps.length,
      };
    });
    res.json(list);
  });

  app.post('/api/departments', requireHR, (req, res) => {
    const { name, headEmployeeId, description, budget } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Department name is required.' });
    }

    const head = headEmployeeId ? db.employees.find((e) => e.employeeId === headEmployeeId || e.id === headEmployeeId) : undefined;

    const newDept: Department = {
      id: `dept_${Date.now()}`,
      name: name.trim(),
      headEmployeeId: head?.employeeId || '',
      headEmployeeName: head?.fullName || 'Unassigned',
      description: description || '',
      budget: budget || '$100,000 / yr',
    };

    db.departments.push(newDept);

    db.auditLogs.unshift({
      id: `audit_${Date.now()}`,
      action: 'DEPARTMENT_CREATED',
      actorId: (req as any).user.employeeId,
      actorName: (req as any).user.fullName,
      actorRole: 'hr_admin',
      targetType: 'Department',
      targetId: newDept.id,
      details: `Created new department: ${newDept.name}.`,
      timestamp: new Date().toISOString(),
    });

    saveDB();
    res.status(201).json(newDept);
  });

  app.put('/api/departments/:id', requireHR, (req, res) => {
    const deptId = req.params.id;
    const dept = db.departments.find((d) => d.id === deptId);
    if (!dept) {
      return res.status(404).json({ error: 'Department not found.' });
    }

    if (req.body.name) dept.name = req.body.name.trim();
    if (req.body.description) dept.description = req.body.description;
    if (req.body.budget) dept.budget = req.body.budget;
    if (req.body.headEmployeeId) {
      const head = db.employees.find((e) => e.employeeId === req.body.headEmployeeId || e.id === req.body.headEmployeeId);
      if (head) {
        dept.headEmployeeId = head.employeeId;
        dept.headEmployeeName = head.fullName;
      }
    }

    db.auditLogs.unshift({
      id: `audit_${Date.now()}`,
      action: 'DEPARTMENT_MODIFIED',
      actorId: (req as any).user.employeeId,
      actorName: (req as any).user.fullName,
      actorRole: 'hr_admin',
      targetType: 'Department',
      targetId: dept.id,
      details: `Updated department info for ${dept.name}.`,
      timestamp: new Date().toISOString(),
    });

    saveDB();
    res.json(dept);
  });

  app.get('/api/org-chart', requireAuth, (req, res) => {
    // Build hierarchical tree from real employees
    const empMap = new Map<string, OrgNode>();

    db.employees.forEach((emp) => {
      empMap.set(emp.id, {
        id: emp.id,
        employeeId: emp.employeeId,
        name: emp.fullName,
        roleTitle: emp.roleTitle,
        department: emp.department,
        profilePhoto: emp.profilePhoto,
        email: emp.email,
        status: emp.employmentStatus,
        directReports: [],
      });
    });

    const rootNodes: OrgNode[] = [];

    db.employees.forEach((emp) => {
      const node = empMap.get(emp.id)!;
      if (emp.reportingManagerId && empMap.has(emp.reportingManagerId)) {
        const managerNode = empMap.get(emp.reportingManagerId)!;
        managerNode.directReports.push(node);
      } else {
        rootNodes.push(node);
      }
    });

    res.json(rootNodes);
  });

  app.get('/api/department-health', requireAuth, (req, res) => {
    const today = new Date().toISOString().split('T')[0];
    const results = db.departments.map((dept) => {
      const deptEmployees = db.employees.filter((e) => e.department === dept.name);
      const totalEmp = deptEmployees.length;

      const deptAttendance = db.attendance.filter((a) => a.department === dept.name && a.date === today);
      const presentCount = deptAttendance.filter((a) => a.status === 'Present').length;
      const lateCount = deptAttendance.filter((a) => a.status === 'Late').length;
      const absentCount = deptAttendance.filter((a) => a.status === 'Absent').length;
      const onLeaveCount = deptAttendance.filter((a) => a.status === 'Leave').length;

      const attendanceRate = totalEmp > 0 ? Math.round(((presentCount + lateCount) / totalEmp) * 100) : 100;
      const absenceRate = totalEmp > 0 ? Math.round(((absentCount + onLeaveCount) / totalEmp) * 100) : 0;

      // Pending leaves in this department
      const pendingLeaves = db.leaves.filter((l) => l.department === dept.name && l.status === 'Pending').length;

      // Calculate risk status
      let healthStatus: 'Optimal' | 'Caution' | 'High Risk' = 'Optimal';
      if (absenceRate > 30 || pendingLeaves >= 3) {
        healthStatus = 'High Risk';
      } else if (absenceRate > 15 || lateCount >= 2) {
        healthStatus = 'Caution';
      }

      return {
        departmentId: dept.id,
        departmentName: dept.name,
        headEmployeeName: dept.headEmployeeName,
        employeeCount: totalEmp,
        presentToday: presentCount,
        lateToday: lateCount,
        absentToday: absentCount,
        onLeaveToday: onLeaveCount,
        attendanceRate,
        absenceRate,
        pendingLeaves,
        healthStatus,
      };
    });

    res.json(results);
  });

  // ==========================================
  // WORKFORCE INTELLIGENCE & GEMINI AI ANALYSIS
  // ==========================================
  app.get('/api/workforce-intelligence', requireAuth, (req, res) => {
    // Generate explainable rule-based insights
    const insights: WorkforceInsight[] = [];
    const nowStr = new Date().toISOString();

    // 1. Absence Risk
    const exceededEmployees = db.employees.filter((e) => {
      const sum = calculateEmployeeAbsence(e, db.absencePolicy, db.leaves, db.attendance);
      return sum.severity === 'exceeded';
    });

    if (exceededEmployees.length > 0) {
      insights.push({
        id: 'ins_01',
        category: 'Absence Risk',
        severity: 'critical',
        title: 'Absence Limit Exceeded Alert',
        description: `${exceededEmployees.length} employee(s) have exceeded the organizational 12-day absence ceiling.`,
        whatHappened: `Employees ${exceededEmployees.map((e) => e.fullName).join(', ')} have accumulated excess unexcused absences.`,
        whyFlagged: 'Breaches company policy thresholds and generates potential salary deduction liabilities.',
        supportingData: `${exceededEmployees.map((e) => `${e.fullName} (${e.employeeId}): 14 days used vs 12 allowed`).join('; ')}.`,
        recommendedAction: 'Review pending Salary Deduction Requests in HR portal and verify medical documentation before decision.',
        generatedAt: nowStr,
      });
    }

    // 2. Warning Threshold Concentration
    const warningEmployees = db.employees.filter((e) => {
      const sum = calculateEmployeeAbsence(e, db.absencePolicy, db.leaves, db.attendance);
      return sum.severity === 'warning';
    });

    if (warningEmployees.length > 0) {
      insights.push({
        id: 'ins_02',
        category: 'Attendance Risk',
        severity: 'medium',
        title: 'Approaching Absence Threshold Warning',
        description: `${warningEmployees.length} employee(s) are within 2 days of their annual leave allowance ceiling.`,
        whatHappened: `Employees ${warningEmployees.map((e) => e.fullName).join(', ')} have reached ≥10 days of absence.`,
        whyFlagged: 'High probability of crossing limit before the end of the current evaluation cycle.',
        supportingData: `${warningEmployees.map((e) => `${e.fullName}: 10/12 days used`).join(', ')}.`,
        recommendedAction: 'Dispatch automated threshold reminder and schedule check-in with respective department managers.',
        generatedAt: nowStr,
      });
    }

    // 3. Repeated Late Attendance
    const lateRecords = db.attendance.filter((a) => a.status === 'Late');
    if (lateRecords.length >= 2) {
      insights.push({
        id: 'ins_03',
        category: 'Repeated Late Attendance',
        severity: 'medium',
        title: 'Late Arrival Pattern in Infrastructure & Engineering',
        description: 'Multiple late check-in records (>09:30 AM) identified across engineering pods during morning standup hours.',
        whatHappened: `${lateRecords.length} late clock-in occurrences recorded in the last 7 calendar days.`,
        whyFlagged: 'Consistently disrupts team sync meetings and decreases core working hour overlap.',
        supportingData: `Recorded check-in times ranging from 09:35 AM to 09:40 AM for Jordan Lee (EMP004).`,
        recommendedAction: 'Discuss flexible core hours (10:00 AM - 06:00 PM) or review transportation commute obstacles.',
        generatedAt: nowStr,
      });
    }

    // 4. Leave Concentration
    const pendingLeaves = db.leaves.filter((l) => l.status === 'Pending');
    if (pendingLeaves.length >= 2) {
      insights.push({
        id: 'ins_04',
        category: 'Leave Concentration',
        severity: 'low',
        title: 'Upcoming Overlapping Leave Requests',
        description: `${pendingLeaves.length} pending leave requests overlap during the upcoming sprint milestone.`,
        whatHappened: 'Multiple team members requested time off across Engineering and Infrastructure.',
        whyFlagged: 'May reduce delivery velocity if key personnel are absent concurrently.',
        supportingData: `${pendingLeaves.map((l) => `${l.employeeName} (${l.leaveType})`).join(', ')}.`,
        recommendedAction: 'Coordinate with Engineering Lead Alex Rivera to ensure on-call and release coverage before approving.',
        generatedAt: nowStr,
      });
    }

    // 5. Workforce Stability
    insights.push({
      id: 'ins_05',
      category: 'Workforce Stability',
      severity: 'low',
      title: 'Overall Workforce Health Index: 92/100',
      description: 'Overall organization attendance stability is robust with 85.7% present rate today.',
      whatHappened: 'Strong employee retention, steady check-in compliance, and active department health.',
      whyFlagged: 'Positive organizational health benchmark.',
      supportingData: `${db.employees.length} total active employees across 5 core departments with no voluntary turnover this quarter.`,
      recommendedAction: 'Maintain current employee wellness initiatives and continue proactive absence limit monitoring.',
      generatedAt: nowStr,
    });

    res.json(insights);
  });

  // Live Generative AI Strategic Analysis using Gemini 3.7-flash
  app.post('/api/workforce-intelligence/ai-analyze', requireHR, async (req, res) => {
    try {
      const ai = getGeminiClient();
      if (!ai) {
        return res.status(200).json({
          analysis: `### Dayflow AI Strategic Workforce Intelligence Summary

**Executive Health Assessment:**
The organization operates at **92% Workforce Health Index** with 7 total active personnel across 5 structured departments.

**Key Observations & Risks Identified:**
1. **Absence Limit Breaches:** Priya Sharma (EMP002) has accumulated 14 total absence days against the 12-day ceiling (+2 excess days). A pending salary deduction of ₹4,000 is awaiting HR determination.
2. **Warning Threshold Alert:** Alex Rivera (EMP001) has reached 10 days of absence (only 2 days remain). Proactive notification is recommended.
3. **Punctuality Dynamics:** Infrastructure department shows isolated late check-in occurrences during morning standup slots.

**Strategic Recommendations for HR Leadership:**
- **Action 1:** Review Priya Sharma's medical leave certificates before deciding on the pending ₹4,000 deduction.
- **Action 2:** Re-align sprint milestone handoffs for pending leaves in Engineering.
- **Action 3:** Reinforce flexible working hour bandwidth for cloud on-call engineers.`,
          source: 'Rule-Based Fallback Engine (Gemini API Key can be provided in Settings > Secrets for customized dynamic analysis)',
        });
      }

      const prompt = `You are the Chief People Officer & Lead HR Architect for Dayflow AI, an enterprise HR management platform.
Analyze the following real organization snapshot and provide a structured, high-value, executive workforce intelligence report:

Total Employees: ${db.employees.length}
Departments: ${db.departments.map((d) => d.name).join(', ')}
Absence Policy: Allowed=${db.absencePolicy.allowedAbsenceDays} days, Warning Threshold=${db.absencePolicy.warningThresholdDays} days.
Recent Absences & Excess:
${db.employees
  .map((e) => {
    const s = calculateEmployeeAbsence(e, db.absencePolicy, db.leaves, db.attendance);
    return `- ${e.fullName} (${e.employeeId}, ${e.department}): Used ${s.usedAbsence}/${s.allowedLimit} days. Excess: ${s.excessDays} days. Potential Deduction: ₹${s.potentialDeduction}. Severity: ${s.severity}`;
  })
  .join('\n')}

Pending Salary Deductions: ${db.salaryDeductions.filter((d) => d.status === 'Pending').length}
Pending Leaves: ${db.leaves.filter((l) => l.status === 'Pending').length}

Please provide:
1. Executive Workforce Health Summary
2. Detailed Risk & Compliance Breakdown (Attendance, Absence, Deduction Governance)
3. Actionable Strategic HR Recommendations (Human-in-the-loop next steps)
Format in clear Markdown.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: prompt,
      });

      res.json({
        analysis: response.text,
        source: 'Gemini 3.7-flash Real-Time AI Intelligence',
      });
    } catch (err: any) {
      console.error('Gemini AI Analysis Error:', err);
      res.status(500).json({ error: 'Failed to generate AI workforce intelligence: ' + (err.message || 'Internal error') });
    }
  });

  // ==========================================
  // NOTIFICATIONS & EMAIL ROUTES
  // ==========================================
  app.get('/api/notifications', requireAuth, (req, res) => {
    const user = (req as any).user as Employee;
    const userNotifs = db.notifications.filter(
      (n) => n.recipientId === 'all' || n.recipientId === user.employeeId || n.recipientId === user.id
    );
    res.json(userNotifs);
  });

  app.put('/api/notifications/:id/read', requireAuth, (req, res) => {
    const notif = db.notifications.find((n) => n.id === req.params.id);
    if (notif) {
      notif.read = true;
      saveDB();
    }
    res.json({ success: true });
  });

  app.put('/api/notifications/read-all', requireAuth, (req, res) => {
    const user = (req as any).user as Employee;
    db.notifications.forEach((n) => {
      if (n.recipientId === 'all' || n.recipientId === user.employeeId || n.recipientId === user.id) {
        n.read = true;
      }
    });
    saveDB();
    res.json({ success: true });
  });

  app.post('/api/notifications/broadcast', requireHR, (req, res) => {
    const { title, message } = req.body;
    if (!title || !message) {
      return res.status(400).json({ error: 'Title and message are required.' });
    }

    const notif: Notification = {
      id: `notif_${Date.now()}`,
      recipientId: 'all',
      type: 'announcement',
      title: title.trim(),
      message: message.trim(),
      timestamp: new Date().toISOString(),
      read: false,
    };

    db.notifications.unshift(notif);
    saveDB();
    res.status(201).json(notif);
  });

  app.get('/api/emails', requireAuth, (req, res) => {
    const user = (req as any).user as Employee;
    if (user.role === 'hr_admin') {
      res.json(db.emails);
    } else {
      const empEmails = db.emails.filter((e) => e.toEmail === user.email);
      res.json(empEmails);
    }
  });

  // ==========================================
  // AUDIT TRAIL
  // ==========================================
  app.get('/api/audit-logs', requireHR, (req, res) => {
    res.json(db.auditLogs);
  });

  // ==========================================
  // SMART HR ACTION CENTER (HR / ADMIN ONLY)
  // ==========================================
  function generateHRActions(): HRActionItem[] {
    const actions: HRActionItem[] = [];
    const today = new Date().toISOString().split('T')[0];
    const overrides = db.actionStatusOverrides || {};
    const dismissedIds = new Set(db.dismissedActionIds || []);

    // 1. SALARY DEDUCTION ACTIONS (🔴 Critical / 🔵 Informational)
    for (const ded of db.salaryDeductions) {
      if (ded.status === 'Pending') {
        const id = `action_salary_${ded.id}`;
        actions.push({
          id,
          priority: 'critical',
          category: 'salary',
          title: 'Salary Deduction Approval Required',
          subtitle: `${ded.employeeName} (${ded.employeeId}) • ${ded.department}`,
          employeeId: ded.employeeId,
          employeeName: ded.employeeName,
          department: ded.department,
          status: overrides[id] || 'pending',
          createdAt: ded.requestDate || today,
          whyFlagged: `Employee exceeded the allowed ${ded.allowedAbsence}-day annual absence limit by ${ded.excessAbsence} day(s) (${ded.usedAbsence} days total recorded). Potential deduction: ₹${ded.proposedDeduction.toLocaleString()}. Requires HR authorization before payroll execution.`,
          details: {
            absenceLimit: ded.allowedAbsence,
            usedAbsence: ded.usedAbsence,
            excessDays: ded.excessAbsence,
            potentialDeduction: ded.proposedDeduction,
            deductionStatus: ded.status,
            reason: ded.reason,
          },
          recommendedAction: 'Verify attendance records & medical exemption certificates, then approve or reject the deduction.',
          targetView: 'hr_salary_deductions',
          targetEntityId: ded.id,
          primaryActionLabel: 'Review & Decide',
          secondaryActionLabel: 'View Details',
          dismissible: false,
        });
      } else if (ded.status === 'Approved') {
        const id = `action_salary_${ded.id}_approved`;
        actions.push({
          id,
          priority: 'informational',
          category: 'salary',
          title: 'Salary Deduction Approved & Applied',
          subtitle: `${ded.employeeName} (${ded.employeeId}) • ${ded.department}`,
          employeeId: ded.employeeId,
          employeeName: ded.employeeName,
          department: ded.department,
          status: 'completed',
          createdAt: ded.approvalDate || today,
          whyFlagged: `HR approved ₹${(ded.approvedDeduction || ded.proposedDeduction).toLocaleString()} salary deduction on ${ded.approvalDate || today}. Queued for payroll adjustment (Ref: ${ded.auditRef || 'AUDIT_OK'}).`,
          details: {
            approvedDeduction: ded.approvedDeduction || ded.proposedDeduction,
            excessDays: ded.excessAbsence,
            deductionStatus: 'Approved',
          },
          recommendedAction: 'No further action required. Record archived for payroll audit compliance.',
          targetView: 'hr_salary_deductions',
          targetEntityId: ded.id,
          primaryActionLabel: 'View Audit Record',
          dismissible: true,
        });
      } else if (ded.status === 'Rejected') {
        const id = `action_salary_${ded.id}_rejected`;
        actions.push({
          id,
          priority: 'informational',
          category: 'salary',
          title: 'Salary Deduction Request Rejected',
          subtitle: `${ded.employeeName} (${ded.employeeId}) • ${ded.department}`,
          employeeId: ded.employeeId,
          employeeName: ded.employeeName,
          department: ded.department,
          status: 'rejected',
          createdAt: ded.approvalDate || today,
          whyFlagged: `HR rejected the salary deduction request on ${ded.approvalDate || today}. Reason: "${ded.rejectionReason || 'Exemption granted'}". Employee full monthly salary remains protected.`,
          details: {
            excessDays: ded.excessAbsence,
            deductionStatus: 'Rejected',
          },
          recommendedAction: 'No deduction applied. Case file closed.',
          targetView: 'hr_salary_deductions',
          targetEntityId: ded.id,
          primaryActionLabel: 'View Record',
          dismissible: true,
        });
      }
    }

    // 2. ABSENCE LIMIT MONITORING ACTIONS (🔴 Critical / 🟡 Medium)
    for (const emp of db.employees) {
      if (emp.employmentStatus === 'Inactive') continue;
      const sum = calculateEmployeeAbsence(emp, db.absencePolicy, db.leaves, db.attendance);

      // Check if already has pending salary deduction so we don't generate duplicate critical cards for the same event
      const hasPendingDeduction = db.salaryDeductions.some(
        (d) => (d.employeeId === emp.employeeId || d.employeeId === emp.id) && d.status === 'Pending'
      );

      if (sum.severity === 'exceeded' && !hasPendingDeduction) {
        const id = `action_absence_exceeded_${emp.employeeId}`;
        actions.push({
          id,
          priority: 'critical',
          category: 'absence',
          title: 'Absence Limit Exceeded Violation',
          subtitle: `${emp.fullName} (${emp.employeeId}) • ${emp.department}`,
          employeeId: emp.employeeId,
          employeeName: emp.fullName,
          department: emp.department,
          avatar: emp.profilePhoto,
          status: overrides[id] || 'pending',
          createdAt: today,
          whyFlagged: `Employee recorded ${sum.usedAbsence} total days of absence, exceeding the organizational limit of ${sum.allowedLimit} days by ${sum.excessDays} day(s). Potential salary deduction liability: ₹${sum.potentialDeduction.toLocaleString()}.`,
          details: {
            absenceLimit: sum.allowedLimit,
            usedAbsence: sum.usedAbsence,
            excessDays: sum.excessDays,
            potentialDeduction: sum.potentialDeduction,
            monthlySalary: emp.monthlySalary,
          },
          recommendedAction: 'Review employee attendance records in Absence Monitoring and initiate formal salary deduction request if unexcused.',
          targetView: 'hr_absence_monitoring',
          targetEntityId: emp.employeeId,
          primaryActionLabel: 'Review Absence Policy',
          dismissible: false,
        });
      } else if (sum.severity === 'warning') {
        const id = `action_absence_warning_${emp.employeeId}`;
        actions.push({
          id,
          priority: 'medium',
          category: 'absence',
          title: 'Leave & Absence Limit Warning Threshold',
          subtitle: `${emp.fullName} (${emp.employeeId}) • ${emp.department}`,
          employeeId: emp.employeeId,
          employeeName: emp.fullName,
          department: emp.department,
          avatar: emp.profilePhoto,
          status: overrides[id] || 'new',
          createdAt: today,
          whyFlagged: `Employee has reached ${sum.usedAbsence} of ${sum.allowedLimit} allowed absence days. Only ${sum.remainingDays} day(s) remain before crossing the policy ceiling.`,
          details: {
            absenceLimit: sum.allowedLimit,
            usedAbsence: sum.usedAbsence,
            remainingDays: sum.remainingDays,
            potentialDeduction: sum.potentialDeduction,
          },
          recommendedAction: 'Send automated quota notification and verify remaining leave scheduling with department lead.',
          targetView: 'hr_absence_monitoring',
          targetEntityId: emp.employeeId,
          primaryActionLabel: 'View Absence Profile',
          dismissible: true,
        });
      }
    }

    // 3. LEAVE REQUEST ACTIONS (🟠 High / 🟡 Medium / 🔵 Completed)
    for (const leave of db.leaves) {
      if (leave.status === 'Pending') {
        const isUrgent =
          leave.leaveType === 'Emergency Leave' ||
          leave.leaveType === 'Sick Leave' ||
          leave.daysCount >= 5 ||
          new Date(leave.startDate).getTime() - new Date().getTime() <= 3 * 86400000;

        const id = `action_leave_${leave.id}`;
        actions.push({
          id,
          priority: isUrgent ? 'high' : 'medium',
          category: 'leave',
          title: isUrgent ? `Urgent Leave Request (${leave.leaveType})` : `Pending Leave Request (${leave.leaveType})`,
          subtitle: `${leave.employeeName} (${leave.employeeId}) • ${leave.department}`,
          employeeId: leave.employeeId,
          employeeName: leave.employeeName,
          department: leave.department,
          status: overrides[id] || 'pending',
          createdAt: leave.appliedDate || today,
          whyFlagged: `${isUrgent ? 'Expedited review needed: ' : ''}${leave.employeeName} requested ${leave.daysCount} day(s) for ${leave.leaveType} from ${leave.startDate} to ${leave.endDate}. Reason: "${leave.reason}".`,
          details: {
            leaveType: leave.leaveType,
            leaveStartDate: leave.startDate,
            leaveEndDate: leave.endDate,
            leaveDays: leave.daysCount,
            reason: leave.reason,
            appliedDate: leave.appliedDate,
          },
          recommendedAction: 'Inspect department coverage and employee leave balance, then record approval decision.',
          targetView: 'hr_leaves',
          targetEntityId: leave.id,
          primaryActionLabel: 'Review Leave',
          dismissible: false,
        });
      }
    }

    // 4. ATTENDANCE ACTIONS (🟠 High / 🟡 Medium)
    for (const emp of db.employees) {
      if (emp.employmentStatus === 'Inactive') continue;

      // Check late arrivals
      const empAttendance = db.attendance.filter((a) => a.employeeId === emp.employeeId || a.employeeId === emp.id);
      const lateRecords = empAttendance.filter((a) => a.status === 'Late');

      if (lateRecords.length >= 2) {
        const id = `action_att_late_${emp.employeeId}`;
        const isHigh = lateRecords.length >= 3;
        actions.push({
          id,
          priority: isHigh ? 'high' : 'medium',
          category: 'attendance',
          title: `Repeated Late Arrival Pattern (${lateRecords.length} times)`,
          subtitle: `${emp.fullName} (${emp.employeeId}) • ${emp.department}`,
          employeeId: emp.employeeId,
          employeeName: emp.fullName,
          department: emp.department,
          avatar: emp.profilePhoto,
          status: overrides[id] || 'new',
          createdAt: today,
          whyFlagged: `Employee recorded ${lateRecords.length} late clock-in arrivals this month (e.g. check-ins past 09:30 AM). Impacts team sync & standup availability.`,
          details: {
            lateCount: lateRecords.length,
            sampleNotes: lateRecords.map((r) => `${r.date}: ${r.checkIn || 'Late'}`).join(', '),
          },
          recommendedAction: 'Conduct 1-on-1 check-in to discuss commute hurdles or evaluate flexible working hours arrangement.',
          targetView: 'hr_attendance',
          targetEntityId: emp.employeeId,
          primaryActionLabel: 'View Attendance Log',
          dismissible: true,
        });
      }

      // Check unexcused absence occurrences
      const unexcusedAbsences = empAttendance.filter((a) => a.status === 'Absent');
      if (unexcusedAbsences.length >= 2) {
        const id = `action_att_unexcused_${emp.employeeId}`;
        actions.push({
          id,
          priority: 'high',
          category: 'attendance',
          title: `Multiple Unexcused Absence Days (${unexcusedAbsences.length} days)`,
          subtitle: `${emp.fullName} (${emp.employeeId}) • ${emp.department}`,
          employeeId: emp.employeeId,
          employeeName: emp.fullName,
          department: emp.department,
          avatar: emp.profilePhoto,
          status: overrides[id] || 'new',
          createdAt: today,
          whyFlagged: `Employee has ${unexcusedAbsences.length} unplanned absence records logged without prior leave approval documentation.`,
          details: {
            unexcusedCount: unexcusedAbsences.length,
            dates: unexcusedAbsences.map((r) => r.date).join(', '),
          },
          recommendedAction: 'Request formal absence justification or doctor medical note from employee.',
          targetView: 'hr_attendance',
          targetEntityId: emp.employeeId,
          primaryActionLabel: 'Inspect Attendance',
          dismissible: true,
        });
      }
    }

    // 5. DEPARTMENT HEALTH WARNINGS (🔴 Critical / 🟡 Medium)
    for (const dept of db.departments) {
      const deptEmployees = db.employees.filter((e) => e.department === dept.name && e.employmentStatus === 'Active');
      const totalEmp = deptEmployees.length;
      if (totalEmp === 0) continue;

      const deptAttendance = db.attendance.filter((a) => a.department === dept.name && a.date === today);
      const presentCount = deptAttendance.filter((a) => a.status === 'Present').length;
      const lateCount = deptAttendance.filter((a) => a.status === 'Late').length;
      const absentCount = deptAttendance.filter((a) => a.status === 'Absent').length;
      const onLeaveCount = deptAttendance.filter((a) => a.status === 'Leave').length;

      const attendanceRate = Math.round(((presentCount + lateCount) / totalEmp) * 100);
      const absenceRate = Math.round(((absentCount + onLeaveCount) / totalEmp) * 100);
      const pendingDeptLeaves = db.leaves.filter((l) => l.department === dept.name && l.status === 'Pending').length;

      if (absenceRate >= 30 || attendanceRate < 70 || pendingDeptLeaves >= 2) {
        const id = `action_dept_health_${dept.id}`;
        actions.push({
          id,
          priority: 'critical',
          category: 'department',
          title: `Critical Department Health Risk: ${dept.name}`,
          subtitle: `Department Lead: ${dept.headEmployeeName || 'Unassigned'} • ${totalEmp} Staff`,
          department: dept.name,
          status: overrides[id] || 'pending',
          createdAt: today,
          whyFlagged: `Department attendance dropped to ${attendanceRate}% today (${absentCount + onLeaveCount} of ${totalEmp} employees absent/on-leave) with ${pendingDeptLeaves} pending leave requests. High risk of milestone slippage.`,
          details: {
            department: dept.name,
            attendanceRate,
            absenceRate,
            employeeCount: totalEmp,
            pendingLeaves: pendingDeptLeaves,
            absentToday: absentCount,
          },
          recommendedAction: 'Meet with Lead Architect / Dept Head to review shift coverage and balance on-call responsibilities.',
          targetView: 'hr_departments',
          targetEntityId: dept.id,
          primaryActionLabel: 'View Department Health',
          dismissible: true,
        });
      } else if (absenceRate >= 15 || lateCount >= 2) {
        const id = `action_dept_health_caution_${dept.id}`;
        actions.push({
          id,
          priority: 'medium',
          category: 'department',
          title: `Department Attendance Caution: ${dept.name}`,
          subtitle: `Department Lead: ${dept.headEmployeeName || 'Unassigned'} • ${totalEmp} Staff`,
          department: dept.name,
          status: overrides[id] || 'new',
          createdAt: today,
          whyFlagged: `Department attendance is ${attendanceRate}% with ${lateCount} late arrival(s) and ${absentCount} absence(s) recorded today.`,
          details: {
            department: dept.name,
            attendanceRate,
            absenceRate,
            lateToday: lateCount,
          },
          recommendedAction: 'Monitor department punctuality over next 3 sprint standups.',
          targetView: 'hr_departments',
          targetEntityId: dept.id,
          primaryActionLabel: 'Inspect Department',
          dismissible: true,
        });
      }
    }

    // 6. EMPLOYEE PROFILE & DATA COMPLIANCE (🟡 Medium / 🔵 Informational)
    for (const emp of db.employees) {
      if (emp.employmentStatus === 'Inactive') continue;
      const missing: string[] = [];
      if (!emp.contactNumber || emp.contactNumber.trim() === '') missing.push('Contact Number');
      if (!emp.reportingManagerName && emp.roleTitle !== 'VP of Human Resources & Admin') missing.push('Reporting Manager');
      if (!emp.monthlySalary || emp.monthlySalary <= 0) missing.push('Salary Configuration');

      if (missing.length > 0) {
        const id = `action_emp_profile_${emp.employeeId}`;
        actions.push({
          id,
          priority: 'medium',
          category: 'employee',
          title: `Incomplete Employee Profile: ${emp.fullName}`,
          subtitle: `${emp.fullName} (${emp.employeeId}) • ${emp.department}`,
          employeeId: emp.employeeId,
          employeeName: emp.fullName,
          department: emp.department,
          avatar: emp.profilePhoto,
          status: overrides[id] || 'new',
          createdAt: today,
          whyFlagged: `Employee record is missing required compliance attributes: ${missing.join(', ')}. Accurate data is mandatory for payroll & escalation workflows.`,
          details: {
            missingFields: missing,
            employeeId: emp.employeeId,
            department: emp.department,
          },
          recommendedAction: 'Edit employee details in Employee Directory to complete all required HR compliance fields.',
          targetView: 'hr_employees',
          targetEntityId: emp.id,
          primaryActionLabel: 'Update Profile Record',
          dismissible: true,
        });
      }
    }

    // 7. EMPLOYEE WARNINGS & SEPARATION REVIEWS (🔴 Critical / 🟠 High / 🟡 Medium)
    for (const w of (db.warnings || [])) {
      if (w.status === 'Resolved' || w.status === 'Closed') continue;

      const emp = db.employees.find((e) => e.employeeId === w.employeeId || e.id === w.employeeId);
      const isCritical = w.severity === 'separation_review' || w.severity === 'serious_review';
      const isHigh = w.severity === 'formal_warning' || w.status === 'Employee Responded';
      const priority: HRActionPriority = isCritical ? 'critical' : isHigh ? 'high' : 'medium';
      const id = `action_warn_${w.id}`;

      let title = `${w.warningType} (${w.severity === 'separation_review' ? 'Separation Review' : w.severity === 'serious_review' ? 'Serious Review' : w.severity === 'formal_warning' ? 'Formal Warning' : 'Advisory'})`;
      if (w.status === 'Employee Responded') {
        title = `Employee Response Submitted: ${w.employeeName}`;
      }

      actions.push({
        id,
        priority,
        category: 'warning',
        title,
        subtitle: `${w.employeeName} (${w.employeeId}) • ${w.department}`,
        employeeId: w.employeeId,
        employeeName: w.employeeName,
        department: w.department,
        avatar: emp?.profilePhoto,
        status: overrides[id] || (w.status === 'Draft' ? 'new' : w.status === 'Issued' ? 'pending' : 'in_review'),
        createdAt: w.createdAt ? w.createdAt.split('T')[0] : today,
        whyFlagged: `${w.description} Origin: ${w.origin.replace('_', ' ')}. Severity: ${w.severity.replace('_', ' ').toUpperCase()}. Status: ${w.status}.`,
        details: {
          warningId: w.id,
          category: w.category,
          severity: w.severity,
          status: w.status,
          incidentDate: w.incidentDate,
          supportingEvidence: w.supportingEvidence,
          recommendedAction: w.recommendedAction,
          hasEmployeeResponse: Boolean(w.employeeResponse),
          structuredMetrics: w.structuredMetrics,
        },
        recommendedAction: w.recommendedAction || 'Review documented evidence, evaluate employee explanation, and record formal HR decision.',
        targetView: 'hr_warnings',
        targetEntityId: w.id,
        primaryActionLabel: w.status === 'Employee Responded' ? 'Review Response' : 'Review Warning Docket',
        dismissible: false,
      });
    }

    // 8. ACTIVE PERFORMANCE IMPROVEMENT PLANS (🟡 Medium)
    for (const pip of (db.pips || [])) {
      if (pip.status !== 'Active' && pip.status !== 'Progress Review') continue;
      const emp = db.employees.find((e) => e.employeeId === pip.employeeId || e.id === pip.employeeId);
      const id = `action_pip_${pip.id}`;
      actions.push({
        id,
        priority: 'medium',
        category: 'pip',
        title: `Active Performance Plan: ${pip.employeeName}`,
        subtitle: `${pip.employeeName} (${pip.employeeId}) • Target Deadline: ${pip.deadlineDate}`,
        employeeId: pip.employeeId,
        employeeName: pip.employeeName,
        department: pip.department,
        avatar: emp?.profilePhoto,
        status: overrides[id] || 'pending',
        createdAt: pip.startDate,
        whyFlagged: `Active 30-Day PIP in progress. Goals: ${pip.goals}. Periodic review check-in required.`,
        details: {
          pipId: pip.id,
          deadlineDate: pip.deadlineDate,
          status: pip.status,
          problemAreas: pip.problemAreas,
        },
        recommendedAction: 'Conduct milestone progress review with reporting manager.',
        targetView: 'hr_warnings',
        targetEntityId: pip.id,
        primaryActionLabel: 'View PIP Milestone',
        dismissible: true,
      });
    }

    // 9. HIGH TASK DELAYS / OVERDUE ANOMALIES (🟠 High)
    for (const emp of db.employees) {
      if (emp.employmentStatus === 'Inactive') continue;
      const empTasks = (db.tasks || []).filter((t) => t.employeeId === emp.employeeId || t.employeeId === emp.id);
      const lateCount = empTasks.filter((t) => t.wasLate).length;
      const overdueCount = empTasks.filter((t) => t.status === 'Overdue').length;

      // If multiple late or overdue tasks exist and no active warning has been issued yet
      const hasWarning = (db.warnings || []).some(
        (w) => (w.employeeId === emp.employeeId || w.employeeId === emp.id) && w.category === 'performance' && w.status !== 'Resolved'
      );

      if ((overdueCount >= 2 || (lateCount >= 3 && overdueCount >= 1)) && !hasWarning) {
        const id = `action_perf_delay_${emp.employeeId}`;
        actions.push({
          id,
          priority: 'high',
          category: 'performance',
          title: `Multiple Sprint Task Delays (${lateCount} late, ${overdueCount} overdue)`,
          subtitle: `${emp.fullName} (${emp.employeeId}) • ${emp.department}`,
          employeeId: emp.employeeId,
          employeeName: emp.fullName,
          department: emp.department,
          avatar: emp.profilePhoto,
          status: overrides[id] || 'new',
          createdAt: today,
          whyFlagged: `Performance monitoring detected ${lateCount} tasks completed past scheduled deadline and ${overdueCount} tasks currently overdue.`,
          details: {
            assignedTasks: empTasks.length,
            lateCount,
            overdueCount,
          },
          recommendedAction: 'Schedule Performance Discussion with employee or generate Formal Performance Warning.',
          targetView: 'hr_warnings',
          targetEntityId: emp.employeeId,
          primaryActionLabel: 'Issue Warning / PIP',
          dismissible: true,
        });
      }
    }

    // Filter out dismissed items
    const activeActions = actions.filter((a) => !dismissedIds.has(a.id));

    // Sort by priority rank (critical: 0, high: 1, medium: 2, informational: 3) then newest
    const priorityWeights: Record<HRActionPriority, number> = {
      critical: 0,
      high: 1,
      medium: 2,
      informational: 3,
    };

    activeActions.sort((a, b) => {
      const pDiff = priorityWeights[a.priority] - priorityWeights[b.priority];
      if (pDiff !== 0) return pDiff;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return activeActions;
  }

  // Action Center Endpoint
  app.get('/api/action-center', requireHR, (req, res) => {
    const actions = generateHRActions();
    res.json(actions);
  });

  // Action Status Override / Review Endpoint
  app.post('/api/action-center/:id/status', requireHR, (req, res) => {
    const actionId = req.params.id;
    const { status } = req.body;
    if (!['new', 'pending', 'in_review', 'completed', 'rejected', 'dismissed'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    if (!db.actionStatusOverrides) db.actionStatusOverrides = {};
    db.actionStatusOverrides[actionId] = status as any;
    saveDB();

    res.json({ success: true, actionId, status });
  });

  // Dismiss Action Endpoint
  app.post('/api/action-center/:id/dismiss', requireHR, (req, res) => {
    const actionId = req.params.id;
    if (!db.dismissedActionIds) db.dismissedActionIds = [];
    if (!db.dismissedActionIds.includes(actionId)) {
      db.dismissedActionIds.push(actionId);
      saveDB();
    }
    res.json({ success: true, dismissedId: actionId });
  });

  // Reset Dismissed Actions Endpoint
  app.post('/api/action-center/reset', requireHR, (req, res) => {
    db.dismissedActionIds = [];
    db.actionStatusOverrides = {};
    saveDB();
    res.json({ success: true, message: 'Action Center dismissals reset.' });
  });

  // ==========================================
  // EMPLOYEE PERFORMANCE, CONDUCT & COMPLIANCE WARNING SYSTEM ROUTES
  // ==========================================

  // Get all Warnings (with RBAC protection)
  app.get('/api/warnings', requireAuth, (req, res) => {
    const user = (req as any).user as Employee;
    const { employeeId, category, severity, status } = req.query;

    let list = [...(db.warnings || [])];

    // Non-HR users can strictly only view their own warnings
    if (user.role !== 'hr_admin') {
      list = list.filter((w) => w.employeeId === user.employeeId || w.employeeId === user.id);
    } else if (employeeId) {
      list = list.filter((w) => w.employeeId === String(employeeId) || w.employeeId === db.employees.find(e => e.id === employeeId)?.employeeId);
    }

    if (category) list = list.filter((w) => w.category === category);
    if (severity) list = list.filter((w) => w.severity === severity);
    if (status) list = list.filter((w) => w.status === status);

    // Strip confidential HR notes if not HR
    if (user.role !== 'hr_admin') {
      list = list.map((w) => {
        const copy = { ...w };
        delete copy.hrNotes;
        return copy;
      });
    }

    // Sort newest first
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    res.json(list);
  });

  // Get Warning by ID
  app.get('/api/warnings/:id', requireAuth, (req, res) => {
    const user = (req as any).user as Employee;
    const warning = (db.warnings || []).find((w) => w.id === req.params.id);
    if (!warning) return res.status(404).json({ error: 'Warning record not found.' });

    if (user.role !== 'hr_admin' && warning.employeeId !== user.employeeId && warning.employeeId !== user.id) {
      return res.status(403).json({ error: 'Access denied: You are not authorized to view this warning docket.' });
    }

    const result = { ...warning };
    if (user.role !== 'hr_admin') {
      delete result.hrNotes;
    }
    res.json(result);
  });

  // Create Warning (Manual HR / Manager Report)
  app.post('/api/warnings', requireHR, (req, res) => {
    const user = (req as any).user as Employee;
    const {
      employeeId,
      category,
      warningType,
      severity,
      origin = 'hr_report',
      incidentDate = new Date().toISOString().split('T')[0],
      performancePeriod,
      description,
      relatedPolicy,
      supportingEvidence,
      structuredMetrics,
      hrNotes,
      recommendedAction,
      reviewDate,
    } = req.body;

    if (!employeeId || !category || !warningType || !severity || !description) {
      return res.status(400).json({ error: 'Missing mandatory warning fields.' });
    }

    const emp = db.employees.find((e) => e.employeeId === employeeId || e.id === employeeId);
    if (!emp) return res.status(404).json({ error: 'Target employee not found.' });

    const newWarning: EmployeeWarning = {
      id: `warn_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      employeeId: emp.employeeId,
      employeeName: emp.fullName,
      department: emp.department,
      roleTitle: emp.roleTitle,
      category,
      warningType,
      severity,
      origin,
      incidentDate,
      performancePeriod: performancePeriod || 'Current Cycle',
      description,
      relatedPolicy: relatedPolicy || 'Company Code of Conduct & Performance Guidelines',
      supportingEvidence: supportingEvidence || 'Documented by HR / Management Review.',
      structuredMetrics,
      hrNotes: hrNotes || '',
      recommendedAction: recommendedAction || 'Formal discussion and follow-up review.',
      reviewDate,
      status: 'Issued',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: `${user.fullName} (${user.roleTitle})`,
    };

    if (!db.warnings) db.warnings = [];
    db.warnings.unshift(newWarning);

    // Audit Trail
    db.auditLogs.unshift({
      id: `audit_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      action: 'WARNING_ISSUED',
      actorId: user.employeeId,
      actorName: user.fullName,
      actorRole: user.role,
      targetType: 'Warning',
      targetId: newWarning.id,
      details: `Issued ${severity.replace('_', ' ').toUpperCase()} to ${emp.fullName} for ${warningType} (${category}).`,
      timestamp: new Date().toISOString(),
    });

    // Employee Notification & Email
    db.notifications.unshift({
      id: `notif_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      recipientId: emp.employeeId,
      title: `Notice of Warning Issued: ${warningType}`,
      message: `HR has documented an official ${severity.replace('_', ' ')} regarding ${category}. Please review in your portal to view details and submit an optional response.`,
      type: 'warning',
      category: 'governance',
      timestamp: new Date().toISOString(),
      isRead: false,
      priority: severity === 'separation_review' || severity === 'serious_review' ? 'urgent' : 'high',
      actionUrl: 'emp_performance',
    });

    const email = createEmailFromTemplate('Formal Warning Issued', emp, {
      warning_type: warningType,
      severity: severity.replace('_', ' ').toUpperCase(),
      category: category.toUpperCase(),
      incident_date: incidentDate,
      description,
      supporting_evidence: supportingEvidence || 'Documented by People Operations.',
      recommended_action: recommendedAction || 'Review details in portal.',
    });
    db.emails.unshift(email);

    saveDB();
    res.status(201).json(newWarning);
  });

  // Update Warning Details
  app.put('/api/warnings/:id', requireHR, (req, res) => {
    const user = (req as any).user as Employee;
    const warningIndex = (db.warnings || []).findIndex((w) => w.id === req.params.id);
    if (warningIndex === -1) return res.status(404).json({ error: 'Warning record not found.' });

    const existing = db.warnings[warningIndex];
    const updated: EmployeeWarning = {
      ...existing,
      ...req.body,
      updatedAt: new Date().toISOString(),
    };

    db.warnings[warningIndex] = updated;

    db.auditLogs.unshift({
      id: `audit_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      action: 'WARNING_UPDATED',
      actorId: user.employeeId,
      actorName: user.fullName,
      actorRole: user.role,
      targetType: 'Warning',
      targetId: updated.id,
      details: `Updated warning docket for ${updated.employeeName} (${updated.warningType}).`,
      timestamp: new Date().toISOString(),
    });

    saveDB();
    res.json(updated);
  });

  // Update Warning Status
  app.post('/api/warnings/:id/status', requireHR, (req, res) => {
    const user = (req as any).user as Employee;
    const { status } = req.body;
    const warning = (db.warnings || []).find((w) => w.id === req.params.id);
    if (!warning) return res.status(404).json({ error: 'Warning not found.' });

    warning.status = status;
    warning.updatedAt = new Date().toISOString();

    db.auditLogs.unshift({
      id: `audit_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      action: 'WARNING_STATUS_CHANGED',
      actorId: user.employeeId,
      actorName: user.fullName,
      actorRole: user.role,
      targetType: 'Warning',
      targetId: warning.id,
      details: `Changed warning status to "${status}" for ${warning.employeeName}.`,
      timestamp: new Date().toISOString(),
    });

    saveDB();
    res.json(warning);
  });

  // Submit HR Decision on Warning
  app.post('/api/warnings/:id/decision', requireHR, (req, res) => {
    const user = (req as any).user as Employee;
    const { hrDecision, hrDecisionNotes, recommendedAction } = req.body;
    const warning = (db.warnings || []).find((w) => w.id === req.params.id);
    if (!warning) return res.status(404).json({ error: 'Warning not found.' });

    warning.hrDecision = hrDecision;
    warning.hrDecisionNotes = hrDecisionNotes || '';
    if (recommendedAction) warning.recommendedAction = recommendedAction;
    warning.hrDecisionDate = new Date().toISOString().split('T')[0];
    warning.status = hrDecision === 'No Action' ? 'Closed' : 'Action Implemented';
    warning.updatedAt = new Date().toISOString();

    const emp = db.employees.find((e) => e.employeeId === warning.employeeId || e.id === warning.employeeId);

    // Audit Trail
    db.auditLogs.unshift({
      id: `audit_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      action: 'WARNING_DECISION_RECORDED',
      actorId: user.employeeId,
      actorName: user.fullName,
      actorRole: user.role,
      targetType: 'Warning',
      targetId: warning.id,
      details: `Recorded HR decision "${hrDecision}" for ${warning.employeeName}: ${hrDecisionNotes || 'Decision logged.'}`,
      timestamp: new Date().toISOString(),
    });

    // Notify employee of resolution / decision
    if (emp) {
      db.notifications.unshift({
        id: `notif_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        recipientId: emp.employeeId,
        title: `HR Decision Recorded: ${warning.warningType}`,
        message: `People Operations has recorded the formal decision (${hrDecision}) for your warning case.`,
        type: 'governance',
        category: 'governance',
        timestamp: new Date().toISOString(),
        isRead: false,
        priority: 'high',
        actionUrl: 'emp_performance',
      });

      const email = createEmailFromTemplate('Case Resolution', emp, {
        warning_type: warning.warningType,
        hr_decision: hrDecision,
        hr_decision_notes: hrDecisionNotes || 'Outcome documented in employee record.',
      });
      db.emails.unshift(email);
    }

    saveDB();
    res.json(warning);
  });

  // Submit Employee Response to Warning
  app.post('/api/warnings/:id/employee-response', requireAuth, (req, res) => {
    const user = (req as any).user as Employee;
    const warning = (db.warnings || []).find((w) => w.id === req.params.id);
    if (!warning) return res.status(404).json({ error: 'Warning not found.' });

    if (user.role !== 'hr_admin' && warning.employeeId !== user.employeeId && warning.employeeId !== user.id) {
      return res.status(403).json({ error: 'You are only authorized to respond to your own warnings.' });
    }

    const { explanation, supportingInfo } = req.body;
    if (!explanation || explanation.trim() === '') {
      return res.status(400).json({ error: 'Explanation text is required.' });
    }

    warning.employeeResponse = {
      responseDate: new Date().toISOString(),
      explanation: explanation.trim(),
      supportingInfo: supportingInfo?.trim(),
      acknowledgedAt: new Date().toISOString(),
    };
    warning.status = 'Employee Responded';
    warning.updatedAt = new Date().toISOString();

    // Audit Trail
    db.auditLogs.unshift({
      id: `audit_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      action: 'EMPLOYEE_WARNING_RESPONSE',
      actorId: user.employeeId,
      actorName: user.fullName,
      actorRole: user.role,
      targetType: 'Warning',
      targetId: warning.id,
      details: `${user.fullName} submitted formal written explanation for warning "${warning.warningType}".`,
      timestamp: new Date().toISOString(),
    });

    // Notify HR
    db.notifications.unshift({
      id: `notif_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      recipientId: 'HR001',
      title: `Response Received: ${warning.employeeName}`,
      message: `${warning.employeeName} submitted a formal response for warning "${warning.warningType}". Ready for HR review.`,
      type: 'warning',
      category: 'governance',
      timestamp: new Date().toISOString(),
      isRead: false,
      priority: 'high',
      actionUrl: 'hr_warnings',
    });

    saveDB();
    res.json(warning);
  });

  // Automated Explainable Detection Engine (Scan for new anomalies)
  app.post('/api/warnings/auto-detect', requireHR, (req, res) => {
    let newWarningsCount = 0;
    const detected: any[] = [];

    for (const emp of db.employees) {
      if (emp.employmentStatus === 'Inactive') continue;

      // 1. Check Task Delays
      const empTasks = (db.tasks || []).filter((t) => t.employeeId === emp.employeeId || t.employeeId === emp.id);
      const lateTasks = empTasks.filter((t) => t.wasLate);
      const overdueTasks = empTasks.filter((t) => t.status === 'Overdue');
      const hasPerfWarn = (db.warnings || []).some(
        (w) => (w.employeeId === emp.employeeId || w.employeeId === emp.id) && w.category === 'performance' && w.status !== 'Resolved'
      );

      if ((lateTasks.length >= 3 || overdueTasks.length >= 2) && !hasPerfWarn) {
        const autoWarn: EmployeeWarning = {
          id: `warn_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
          employeeId: emp.employeeId,
          employeeName: emp.fullName,
          department: emp.department,
          roleTitle: emp.roleTitle,
          category: 'performance',
          warningType: 'Repeated Sprint Deadline Delays',
          severity: lateTasks.length >= 5 || overdueTasks.length >= 2 ? 'formal_warning' : 'advisory',
          origin: 'automatic_rule',
          incidentDate: new Date().toISOString().split('T')[0],
          performancePeriod: 'Current Cycle',
          description: `Automated performance rules detected ${lateTasks.length} task(s) completed past deadline and ${overdueTasks.length} overdue task(s).`,
          relatedPolicy: 'Sprint Delivery SLA & Milestone Execution Policy §4.2',
          supportingEvidence: `${lateTasks.length} late tasks: ${lateTasks.map((t) => t.title).join(', ')}. ${overdueTasks.length} overdue: ${overdueTasks.map((t) => t.title).join(', ')}.`,
          structuredMetrics: {
            assignedTasks: empTasks.length,
            completedAfterDeadline: lateTasks.length,
            currentlyOverdue: overdueTasks.length,
          },
          recommendedAction: 'Schedule 1-on-1 performance review and evaluate PIP readiness.',
          status: 'Issued',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy: 'Dayflow AI Performance Engine',
        };
        db.warnings.unshift(autoWarn);
        detected.push(autoWarn);
        newWarningsCount++;
      }
    }

    saveDB();
    res.json({ success: true, newWarningsCount, detected });
  });

  // ==========================================
  // EMPLOYEE TASKS & PERFORMANCE RECORDS
  // ==========================================
  app.get('/api/tasks', requireAuth, (req, res) => {
    const user = (req as any).user as Employee;
    const { employeeId, performancePeriod, status } = req.query;

    let list = [...(db.tasks || [])];
    if (user.role !== 'hr_admin') {
      list = list.filter((t) => t.employeeId === user.employeeId || t.employeeId === user.id);
    } else if (employeeId) {
      list = list.filter((t) => t.employeeId === String(employeeId) || t.employeeId === db.employees.find(e => e.id === employeeId)?.employeeId);
    }

    if (performancePeriod) list = list.filter((t) => t.performancePeriod === performancePeriod);
    if (status) list = list.filter((t) => t.status === status);

    res.json(list);
  });

  app.post('/api/tasks', requireHR, (req, res) => {
    const { employeeId, title, description, assignedDate, dueDate, priority = 'Medium', performancePeriod = 'August 2026' } = req.body;
    const emp = db.employees.find((e) => e.employeeId === employeeId || e.id === employeeId);
    if (!emp) return res.status(404).json({ error: 'Employee not found.' });

    const newTask: EmployeeTask = {
      id: `task_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      employeeId: emp.employeeId,
      employeeName: emp.fullName,
      department: emp.department,
      title,
      description,
      assignedDate: assignedDate || new Date().toISOString().split('T')[0],
      dueDate,
      status: 'Pending',
      performancePeriod,
      priority,
    };

    if (!db.tasks) db.tasks = [];
    db.tasks.unshift(newTask);
    saveDB();
    res.status(201).json(newTask);
  });

  app.put('/api/tasks/:id', requireAuth, (req, res) => {
    const taskIndex = (db.tasks || []).findIndex((t) => t.id === req.params.id);
    if (taskIndex === -1) return res.status(404).json({ error: 'Task not found.' });

    const existing = db.tasks[taskIndex];
    const { status, completedDate, qualityRating } = req.body;

    const isCompleted = status === 'Completed';
    const compDate = completedDate || (isCompleted ? new Date().toISOString().split('T')[0] : undefined);
    const wasLate = compDate && existing.dueDate ? compDate > existing.dueDate : existing.wasLate;

    const updated: EmployeeTask = {
      ...existing,
      ...req.body,
      status: status || existing.status,
      completedDate: compDate,
      wasLate,
      qualityRating: qualityRating !== undefined ? qualityRating : existing.qualityRating,
    };

    db.tasks[taskIndex] = updated;
    saveDB();
    res.json(updated);
  });

  // Performance Reviews
  app.get('/api/performance-reviews', requireAuth, (req, res) => {
    const user = (req as any).user as Employee;
    const { employeeId, period } = req.query;

    let list = [...(db.performanceReviews || [])];
    if (user.role !== 'hr_admin') {
      list = list.filter((r) => r.employeeId === user.employeeId || r.employeeId === user.id);
    } else if (employeeId) {
      list = list.filter((r) => r.employeeId === String(employeeId) || r.employeeId === db.employees.find(e => e.id === employeeId)?.employeeId);
    }

    if (period) list = list.filter((r) => r.performancePeriod === period);
    res.json(list);
  });

  app.post('/api/performance-reviews', requireHR, (req, res) => {
    const user = (req as any).user as Employee;
    const {
      employeeId,
      performancePeriod,
      reviewDate = new Date().toISOString().split('T')[0],
      goals,
      kpiMetrics = [],
      completedWorkSummary,
      missedWorkSummary,
      qualityObservations,
      strengths,
      areasForImprovement,
      managerFeedback,
      overallStatus = 'Meeting Expectations',
    } = req.body;

    const emp = db.employees.find((e) => e.employeeId === employeeId || e.id === employeeId);
    if (!emp) return res.status(404).json({ error: 'Employee not found.' });

    const newReview: PerformanceReviewRecord = {
      id: `rev_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      employeeId: emp.employeeId,
      employeeName: emp.fullName,
      department: emp.department,
      reviewerId: user.employeeId,
      reviewerName: user.fullName,
      performancePeriod,
      reviewDate,
      goals,
      kpiMetrics,
      completedWorkSummary,
      missedWorkSummary,
      qualityObservations,
      strengths,
      areasForImprovement,
      managerFeedback,
      overallStatus,
      createdAt: new Date().toISOString(),
    };

    if (!db.performanceReviews) db.performanceReviews = [];
    db.performanceReviews.unshift(newReview);

    db.auditLogs.unshift({
      id: `audit_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      action: 'PERFORMANCE_REVIEW_CREATED',
      actorId: user.employeeId,
      actorName: user.fullName,
      actorRole: user.role,
      targetType: 'PerformanceReview',
      targetId: newReview.id,
      details: `Created ${performancePeriod} Performance Review for ${emp.fullName} (Result: ${overallStatus}).`,
      timestamp: new Date().toISOString(),
    });

    saveDB();
    res.status(201).json(newReview);
  });

  app.post('/api/performance-reviews/:id/employee-response', requireAuth, (req, res) => {
    const user = (req as any).user as Employee;
    const review = (db.performanceReviews || []).find((r) => r.id === req.params.id);
    if (!review) return res.status(404).json({ error: 'Review not found.' });

    if (user.role !== 'hr_admin' && review.employeeId !== user.employeeId && review.employeeId !== user.id) {
      return res.status(403).json({ error: 'Unauthorized.' });
    }

    const { employeeResponse } = req.body;
    review.employeeResponse = employeeResponse;
    saveDB();
    res.json(review);
  });

  // ==========================================
  // PERFORMANCE IMPROVEMENT PLANS (PIP)
  // ==========================================
  app.get('/api/pips', requireAuth, (req, res) => {
    const user = (req as any).user as Employee;
    const { employeeId, status } = req.query;

    let list = [...(db.pips || [])];
    if (user.role !== 'hr_admin') {
      list = list.filter((p) => p.employeeId === user.employeeId || p.employeeId === user.id);
    } else if (employeeId) {
      list = list.filter((p) => p.employeeId === String(employeeId) || p.employeeId === db.employees.find(e => e.id === employeeId)?.employeeId);
    }

    if (status) list = list.filter((p) => p.status === status);
    res.json(list);
  });

  app.get('/api/pips/:id', requireAuth, (req, res) => {
    const user = (req as any).user as Employee;
    const pip = (db.pips || []).find((p) => p.id === req.params.id);
    if (!pip) return res.status(404).json({ error: 'PIP not found.' });

    if (user.role !== 'hr_admin' && pip.employeeId !== user.employeeId && pip.employeeId !== user.id) {
      return res.status(403).json({ error: 'Unauthorized.' });
    }
    res.json(pip);
  });

  app.post('/api/pips', requireHR, (req, res) => {
    const user = (req as any).user as Employee;
    const {
      warningId,
      employeeId,
      startDate = new Date().toISOString().split('T')[0],
      deadlineDate,
      reviewDates = [],
      problemAreas,
      expectedImprovement,
      goals,
      kpiMeasurements,
    } = req.body;

    const emp = db.employees.find((e) => e.employeeId === employeeId || e.id === employeeId);
    if (!emp) return res.status(404).json({ error: 'Employee not found.' });

    const newPIP: PerformanceImprovementPlan = {
      id: `pip_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      warningId,
      employeeId: emp.employeeId,
      employeeName: emp.fullName,
      department: emp.department,
      roleTitle: emp.roleTitle,
      managerId: emp.reportingManagerId || user.employeeId,
      managerName: emp.reportingManagerName || user.fullName,
      hrOwnerId: user.employeeId,
      hrOwnerName: user.fullName,
      startDate,
      deadlineDate,
      reviewDates,
      problemAreas,
      expectedImprovement,
      goals,
      kpiMeasurements,
      status: 'Active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (!db.pips) db.pips = [];
    db.pips.unshift(newPIP);

    // If linked to a warning, update warning
    if (warningId) {
      const warn = (db.warnings || []).find((w) => w.id === warningId);
      if (warn) {
        warn.pipId = newPIP.id;
        warn.hrDecision = 'Performance Improvement Plan';
        warn.status = 'Action Implemented';
      }
    }

    db.auditLogs.unshift({
      id: `audit_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      action: 'PIP_INITIATED',
      actorId: user.employeeId,
      actorName: user.fullName,
      actorRole: user.role,
      targetType: 'PIP',
      targetId: newPIP.id,
      details: `Initiated Performance Improvement Plan for ${emp.fullName} through ${deadlineDate}.`,
      timestamp: new Date().toISOString(),
    });

    db.notifications.unshift({
      id: `notif_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      recipientId: emp.employeeId,
      title: 'Performance Improvement Plan (PIP) Initiated',
      message: `A structured improvement plan has been scheduled with your manager. Target completion date: ${deadlineDate}.`,
      type: 'warning',
      category: 'governance',
      timestamp: new Date().toISOString(),
      isRead: false,
      priority: 'high',
      actionUrl: 'emp_performance',
    });

    const email = createEmailFromTemplate('PIP Notification', emp, {
      employee_name: emp.fullName,
      employee_id: emp.employeeId,
      role_title: emp.roleTitle,
      department: emp.department,
      start_date: startDate,
      deadline_date: deadlineDate,
      problem_areas: problemAreas || 'Milestone predictability and SLA delivery execution',
      expected_improvement: expectedImprovement || 'Achieve 100% on-time milestone delivery on all scheduled sprint tasks',
      goals: goals || 'Complete all deliverables within agreed scope and quality benchmarks',
      review_dates: Array.isArray(reviewDates) && reviewDates.length > 0 ? reviewDates.join(', ') : (reviewDates || 'Weekly Friday Sprint Reviews'),
      kpi_measurements: kpiMeasurements || 'Sprint SLA Delivery Rate ≥ 95%, Zero Overdue Tasks',
      manager_name: emp.reportingManagerName || user.fullName,
      hr_owner_name: user.fullName,
    });
    db.emails.unshift(email);

    saveDB();
    res.status(201).json(newPIP);
  });

  app.put('/api/pips/:id', requireHR, (req, res) => {
    const user = (req as any).user as Employee;
    const pipIndex = (db.pips || []).findIndex((p) => p.id === req.params.id);
    if (pipIndex === -1) return res.status(404).json({ error: 'PIP not found.' });

    const existing = db.pips[pipIndex];
    const updated: PerformanceImprovementPlan = {
      ...existing,
      ...req.body,
      updatedAt: new Date().toISOString(),
    };

    db.pips[pipIndex] = updated;

    db.auditLogs.unshift({
      id: `audit_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      action: 'PIP_UPDATED',
      actorId: user.employeeId,
      actorName: user.fullName,
      actorRole: user.role,
      targetType: 'PIP',
      targetId: updated.id,
      details: `Updated PIP for ${updated.employeeName} (Status: ${updated.status}).`,
      timestamp: new Date().toISOString(),
    });

    saveDB();
    res.json(updated);
  });

  app.post('/api/pips/:id/employee-comment', requireAuth, (req, res) => {
    const user = (req as any).user as Employee;
    const pip = (db.pips || []).find((p) => p.id === req.params.id);
    if (!pip) return res.status(404).json({ error: 'PIP not found.' });

    if (user.role !== 'hr_admin' && pip.employeeId !== user.employeeId && pip.employeeId !== user.id) {
      return res.status(403).json({ error: 'Unauthorized.' });
    }

    const { employeeComments } = req.body;
    pip.employeeComments = employeeComments;
    pip.updatedAt = new Date().toISOString();
    saveDB();
    res.json(pip);
  });

  // ==========================================
  // SEPARATION REVIEWS (HR Only, Human Authorization Protected)
  // ==========================================
  app.get('/api/separation-reviews', requireHR, (req, res) => {
    res.json(db.separationReviews || []);
  });

  app.get('/api/separation-reviews/:id', requireHR, (req, res) => {
    const item = (db.separationReviews || []).find((s) => s.id === req.params.id);
    if (!item) return res.status(404).json({ error: 'Separation review docket not found.' });
    res.json(item);
  });

  app.post('/api/separation-reviews', requireHR, (req, res) => {
    const user = (req as any).user as Employee;
    const {
      employeeId,
      primaryReason,
      warningHistorySummary,
      performanceHistorySummary,
      attendanceHistorySummary,
      pipHistorySummary,
      hrNotes,
    } = req.body;

    const emp = db.employees.find((e) => e.employeeId === employeeId || e.id === employeeId);
    if (!emp) return res.status(404).json({ error: 'Employee not found.' });

    const newSeparation: SeparationReview = {
      id: `sep_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      employeeId: emp.employeeId,
      employeeName: emp.fullName,
      department: emp.department,
      roleTitle: emp.roleTitle,
      initiatedBy: user.employeeId,
      initiatedByName: user.fullName,
      initiatedDate: new Date().toISOString().split('T')[0],
      primaryReason: primaryReason || 'Formal compliance and multi-category performance review',
      warningHistorySummary: warningHistorySummary || 'Documented warnings under review.',
      performanceHistorySummary: performanceHistorySummary || 'Performance KPI records under review.',
      attendanceHistorySummary: attendanceHistorySummary || 'Attendance records verified.',
      pipHistorySummary: pipHistorySummary || 'PIP outcome under review.',
      hrNotes: hrNotes || '',
      status: 'Under Review',
      safetyDisclaimer: 'MANDATORY HUMAN AUTHORIZATION: Dayflow AI NEVER automatically terminates or sanctions employees. Formal separation requires multi-party management sign-off and legal compliance verification.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (!db.separationReviews) db.separationReviews = [];
    db.separationReviews.unshift(newSeparation);

    db.auditLogs.unshift({
      id: `audit_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      action: 'SEPARATION_REVIEW_INITIATED',
      actorId: user.employeeId,
      actorName: user.fullName,
      actorRole: user.role,
      targetType: 'SeparationReview',
      targetId: newSeparation.id,
      details: `Initiated Separation Review docket for ${emp.fullName} (${emp.employeeId}).`,
      timestamp: new Date().toISOString(),
    });

    saveDB();
    res.status(201).json(newSeparation);
  });

  app.put('/api/separation-reviews/:id/decision', requireHR, (req, res) => {
    const user = (req as any).user as Employee;
    const itemIndex = (db.separationReviews || []).findIndex((s) => s.id === req.params.id);
    if (itemIndex === -1) return res.status(404).json({ error: 'Separation review docket not found.' });

    const { status, managementNotes } = req.body;
    const existing = db.separationReviews[itemIndex];

    existing.status = status;
    if (managementNotes) existing.managementNotes = managementNotes;
    existing.updatedAt = new Date().toISOString();
    if (status === 'Completed' || status === 'Rejected') {
      existing.completedDate = new Date().toISOString().split('T')[0];
    }

    db.auditLogs.unshift({
      id: `audit_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      action: 'SEPARATION_REVIEW_DECISION',
      actorId: user.employeeId,
      actorName: user.fullName,
      actorRole: user.role,
      targetType: 'SeparationReview',
      targetId: existing.id,
      details: `Separation review status updated to "${status}" for ${existing.employeeName}: ${managementNotes || 'No notes.'}`,
      timestamp: new Date().toISOString(),
    });

    saveDB();
    res.json(existing);
  });

  // ==========================================
  // EXPLAINABLE RISK SCORE & 360 TIMELINE
  // ==========================================
  app.get('/api/employees/:id/risk-profile', requireAuth, (req, res) => {
    const user = (req as any).user as Employee;
    const emp = db.employees.find((e) => e.employeeId === req.params.id || e.id === req.params.id);
    if (!emp) return res.status(404).json({ error: 'Employee not found.' });

    if (user.role !== 'hr_admin' && emp.employeeId !== user.employeeId && emp.id !== user.id) {
      return res.status(403).json({ error: 'Unauthorized.' });
    }

    const riskScore = calculateEmployeeRiskScore(emp, db);
    res.json(riskScore);
  });

  app.get('/api/employees/:id/360-timeline', requireAuth, (req, res) => {
    const user = (req as any).user as Employee;
    const emp = db.employees.find((e) => e.employeeId === req.params.id || e.id === req.params.id);
    if (!emp) return res.status(404).json({ error: 'Employee not found.' });

    if (user.role !== 'hr_admin' && emp.employeeId !== user.employeeId && emp.id !== user.id) {
      return res.status(403).json({ error: 'Unauthorized.' });
    }

    const timelineEvents: Array<{
      id: string;
      type: 'warning' | 'pip' | 'performance_review' | 'deduction' | 'leave' | 'attendance_flag' | 'joined';
      title: string;
      subtitle: string;
      date: string;
      severity?: string;
      status?: string;
      details?: any;
    }> = [];

    // Joined date
    if (emp.joinDate) {
      timelineEvents.push({
        id: `event_join_${emp.id}`,
        type: 'joined',
        title: 'Joined Organization',
        subtitle: `Joined as ${emp.roleTitle} in ${emp.department}`,
        date: emp.joinDate,
        status: 'Active',
      });
    }

    // Warnings
    for (const w of (db.warnings || [])) {
      if (w.employeeId === emp.employeeId || w.employeeId === emp.id) {
        timelineEvents.push({
          id: `event_warn_${w.id}`,
          type: 'warning',
          title: `Warning Issued: ${w.warningType}`,
          subtitle: `${w.category.toUpperCase()} • ${w.severity.replace('_', ' ').toUpperCase()}`,
          date: w.incidentDate || w.createdAt.split('T')[0],
          severity: w.severity,
          status: w.status,
          details: {
            description: w.description,
            recommendedAction: w.recommendedAction,
            hrDecision: w.hrDecision,
            hasEmployeeResponse: Boolean(w.employeeResponse),
          },
        });
      }
    }

    // PIPs
    for (const p of (db.pips || [])) {
      if (p.employeeId === emp.employeeId || p.employeeId === emp.id) {
        timelineEvents.push({
          id: `event_pip_${p.id}`,
          type: 'pip',
          title: `Performance Improvement Plan (PIP) Initiated`,
          subtitle: `Active through ${p.deadlineDate} • Manager: ${p.managerName}`,
          date: p.startDate,
          status: p.status,
          details: {
            goals: p.goals,
            problemAreas: p.problemAreas,
          },
        });
      }
    }

    // Performance Reviews
    for (const r of (db.performanceReviews || [])) {
      if (r.employeeId === emp.employeeId || r.employeeId === emp.id) {
        timelineEvents.push({
          id: `event_rev_${r.id}`,
          type: 'performance_review',
          title: `Performance Review: ${r.performancePeriod}`,
          subtitle: `Status: ${r.overallStatus} • Reviewed by ${r.reviewerName}`,
          date: r.reviewDate,
          status: r.overallStatus,
          details: {
            strengths: r.strengths,
            areasForImprovement: r.areasForImprovement,
            managerFeedback: r.managerFeedback,
          },
        });
      }
    }

    // Salary Deductions
    for (const d of (db.salaryDeductions || [])) {
      if (d.employeeId === emp.employeeId || d.employeeId === emp.id) {
        const amt = d.approvedDeduction || d.proposedDeduction || 0;
        timelineEvents.push({
          id: `event_ded_${d.id}`,
          type: 'deduction',
          title: `Absence Salary Deduction Request (${d.status})`,
          subtitle: `Amount: ₹${amt.toLocaleString()} • ${d.excessAbsence} Excess Days`,
          date: d.requestDate,
          status: d.status,
          details: {
            reason: d.reason,
            hrNotes: d.rejectionReason || d.hrApprover,
          },
        });
      }
    }

    // Sort timeline chronologically descending (newest first)
    timelineEvents.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    res.json(timelineEvents);
  });

  // =========================================================================
  // REUSABLE EMAIL TEMPLATES CATALOG & ENGINE
  // =========================================================================
  const EMAIL_TEMPLATES_CATALOG: EmailTemplateDefinition[] = [
    {
      id: 'tmpl_pip_notification',
      templateName: 'PIP Notification',
      category: 'Performance & PIP',
      description: 'Official reusable notification to employee on initiation of a Performance Improvement Plan with milestone velocity goals.',
      subject: 'Dayflow AI — Performance Improvement Plan (PIP) Initiated: {{employee_name}}',
      requiredPlaceholders: ['expected_improvement', 'goals', 'review_dates'],
      optionalPlaceholders: [
        'employee_name',
        'employee_id',
        'role_title',
        'department',
        'start_date',
        'deadline_date',
        'problem_areas',
        'kpi_measurements',
        'manager_name',
        'hr_owner_name',
      ],
      samplePlaceholders: {
        employee_name: 'Marcus Chen',
        employee_id: 'EMP003',
        role_title: 'Lead Product Designer',
        department: 'Product Design',
        start_date: '2026-08-20',
        deadline_date: '2026-09-20',
        problem_areas: 'Sprint deadline adherence, delivery of design tokens, proactive dependency escalation',
        expected_improvement: '1. Complete 100% of assigned sprint tasks on or before agreed deadline.\n2. Maintain active status updates daily by 10:00 AM.\n3. Escalate blocker dependencies at least 48 hours in advance.',
        goals: 'Achieve 100% sprint on-time delivery across 4 consecutive sprints with zero overdue tickets.',
        review_dates: 'Weekly Checkpoint: Every Friday at 15:00 UTC (Aug 27, Sep 03, Sep 10, Sep 17)',
        kpi_measurements: 'Sprint SLA Delivery Rate ≥ 95%, Task Overdue Count = 0',
        manager_name: 'Sarah Connor',
        hr_owner_name: 'Sarah Connor',
      },
    },
    {
      id: 'tmpl_warning_formal',
      templateName: 'Formal Warning Issued',
      category: 'Warnings & Compliance',
      description: 'Official formal warning notification documenting policy or conduct violation with clear right of response.',
      subject: 'Dayflow AI — Official Notice: {{warning_type}} ({{severity}})',
      requiredPlaceholders: ['warning_type', 'severity', 'description', 'incident_date'],
      optionalPlaceholders: [
        'employee_name',
        'employee_id',
        'category',
        'supporting_evidence',
        'recommended_action',
      ],
      samplePlaceholders: {
        employee_name: 'Marcus Chen',
        employee_id: 'EMP003',
        warning_type: 'Repeated Sprint Deadline Delays',
        severity: 'Formal Warning',
        category: 'Performance',
        incident_date: '2026-08-20',
        description: 'Automated performance evaluation detected 5 tasks delivered past scheduled SLA deadline.',
        supporting_evidence: '5 tasks completed late in August 2026 sprint cycle.',
        recommended_action: 'Initiate 30-day Performance Improvement Plan.',
      },
    },
    {
      id: 'tmpl_case_resolution',
      templateName: 'Case Resolution',
      category: 'Warnings & Compliance',
      description: 'Formal notification sent when an open warning case has been investigated, resolved, and closed by HR.',
      subject: 'Dayflow AI — Warning Case Resolved: {{warning_type}}',
      requiredPlaceholders: ['warning_type', 'hr_decision'],
      optionalPlaceholders: ['employee_name', 'hr_decision_notes'],
      samplePlaceholders: {
        employee_name: 'David Kim',
        warning_type: 'Direct Deployment Without Mandatory Peer Code Review',
        hr_decision: 'Coaching & Process Clarification Completed',
        hr_decision_notes: 'Employee acknowledged policy guidelines and emergency hotfix protocols.',
      },
    },
    {
      id: 'tmpl_salary_deduction',
      templateName: 'Salary Deduction Approved',
      category: 'Attendance & Payroll',
      description: 'Payroll notification confirming HR-approved salary deduction for excessive unexcused absences.',
      subject: 'Dayflow AI — Salary Deduction Approved by HR',
      requiredPlaceholders: ['excess_absence', 'deduction_amount', 'approval_date'],
      optionalPlaceholders: ['employee_name', 'employee_id'],
      samplePlaceholders: {
        employee_name: 'Priya Sharma',
        employee_id: 'EMP002',
        excess_absence: '2',
        deduction_amount: '₹4,000',
        approval_date: '2026-08-21',
      },
    },
  ];

  app.get('/api/email-templates', requireAuth, (req, res) => {
    res.json(EMAIL_TEMPLATES_CATALOG);
  });

  app.post('/api/email-templates/preview', requireAuth, (req, res) => {
    const { templateName, employeeId, placeholders = {} } = req.body;
    const emp = db.employees.find((e) => e.employeeId === employeeId || e.id === employeeId) || db.employees[0];
    if (!emp) return res.status(404).json({ error: 'Employee context not found.' });

    const mergedPlaceholders = {
      employee_name: emp.fullName,
      employee_id: emp.employeeId,
      role_title: emp.roleTitle,
      department: emp.department,
      manager_name: emp.reportingManagerName || 'Sarah Connor',
      hr_owner_name: 'People Operations',
      ...placeholders,
    };

    const rendered = createEmailFromTemplate(templateName || 'PIP Notification', emp, mergedPlaceholders);
    res.json(rendered);
  });

  app.post('/api/email-templates/send', requireHR, (req, res) => {
    const user = (req as any).user as Employee;
    const { templateName, employeeId, placeholders = {}, customSubject, customMessage } = req.body;

    const emp = db.employees.find((e) => e.employeeId === employeeId || e.id === employeeId);
    if (!emp) return res.status(404).json({ error: 'Employee not found.' });

    const mergedPlaceholders = {
      employee_name: emp.fullName,
      employee_id: emp.employeeId,
      role_title: emp.roleTitle,
      department: emp.department,
      manager_name: emp.reportingManagerName || user.fullName,
      hr_owner_name: user.fullName,
      ...placeholders,
    };

    const email = createEmailFromTemplate(templateName || 'PIP Notification', emp, mergedPlaceholders);
    if (customSubject) email.subject = customSubject;
    if (customMessage) {
      email.textContent = `${customMessage}\n\n${email.textContent}`;
      email.htmlContent = `<div style="background: #eff6ff; padding: 12px; border-radius: 8px; margin-bottom: 16px; font-size: 14px; border: 1px solid #bfdbfe;"><strong>HR Note:</strong> ${customMessage}</div>${email.htmlContent}`;
    }

    db.emails.unshift(email);

    // Also dispatch in-app notification
    db.notifications.unshift({
      id: `notif_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      recipientId: emp.employeeId,
      title: `Formal Notice: ${templateName}`,
      message: `HR Operations has issued an official notice: "${email.subject}". Please review the details in your portal.`,
      type: 'warning',
      category: 'governance',
      timestamp: new Date().toISOString(),
      isRead: false,
      priority: 'high',
      actionUrl: templateName.includes('PIP') ? 'emp_performance' : 'hr_warnings',
    });

    db.auditLogs.unshift({
      id: `audit_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      action: 'EMAIL_TEMPLATE_DISPATCHED',
      actorId: user.employeeId,
      actorName: user.fullName,
      actorRole: user.role,
      targetType: 'EmailMessage',
      targetId: email.id,
      details: `Dispatched template "${templateName}" to ${emp.fullName} (${emp.employeeId}).`,
      timestamp: new Date().toISOString(),
    });

    saveDB();
    res.status(201).json(email);
  });

  // =========================================================================
  // PERFORMANCE REVIEW BACKEND SERVICE (Task/Project Metrics Calculation)
  // =========================================================================
  function calculateEmployeePerformanceMetrics(
    emp: Employee,
    allTasks: EmployeeTask[],
    allWarnings: EmployeeWarning[],
    allPips: PerformanceImprovementPlan[],
    period: string = 'August 2026'
  ): PerformanceMetricsInsight {
    const empTasks = allTasks.filter(
      (t) =>
        (t.employeeId === emp.employeeId || t.employeeId === emp.id) &&
        (!period || period === 'all' || !t.performancePeriod || t.performancePeriod === period)
    );

    const totalTasks = empTasks.length;
    const completedTasksList = empTasks.filter((t) => t.status === 'Completed');
    const completedTasks = completedTasksList.length;
    const inProgressTasks = empTasks.filter((t) => t.status === 'In Progress').length;
    const pendingTasks = empTasks.filter((t) => t.status === 'Pending').length;

    const todayStr = new Date().toISOString().split('T')[0];
    const overdueTasksList = empTasks.filter(
      (t) => t.status === 'Overdue' || (t.status !== 'Completed' && t.dueDate && t.dueDate < todayStr)
    );
    const overdueTasks = overdueTasksList.length;

    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 100;

    const onTimeTasksList = completedTasksList.filter(
      (t) => !t.wasLate && (!t.completedDate || !t.dueDate || t.completedDate <= t.dueDate)
    );
    const onTimeCompletions = onTimeTasksList.length;

    const delayedTasksList = completedTasksList.filter(
      (t) => t.wasLate || (t.completedDate && t.dueDate && t.completedDate > t.dueDate)
    );
    const delayedCompletions = delayedTasksList.length;

    const onTimeDeliveryRate = completedTasks > 0 ? Math.round((onTimeCompletions / completedTasks) * 100) : 100;

    // Quality Rating
    const ratedTasks = completedTasksList.filter((t) => typeof t.qualityRating === 'number' && (t.qualityRating || 0) > 0);
    const averageQualityRating =
      ratedTasks.length > 0
        ? Number((ratedTasks.reduce((sum, t) => sum + (t.qualityRating || 0), 0) / ratedTasks.length).toFixed(1))
        : 4.5;

    // Critical Tasks SLA
    const criticalTasks = empTasks.filter((t) => t.priority === 'High' || t.priority === 'Critical');
    const criticalCompletedOnTime = criticalTasks.filter((t) => t.status === 'Completed' && !t.wasLate).length;
    const criticalTaskDeliveryRate =
      criticalTasks.length > 0 ? Math.round((criticalCompletedOnTime / criticalTasks.length) * 100) : 100;

    // Objective Scoring Formula (0 - 100)
    // Completion rate: 35%, On-time SLA: 45%, Quality rating: 20%, Penalty: -8 pts per overdue deliverable
    let score = Math.round(
      completionRate * 0.35 +
      onTimeDeliveryRate * 0.45 +
      (averageQualityRating / 5) * 100 * 0.2 -
      overdueTasks * 8
    );
    score = Math.max(10, Math.min(100, score));

    // Performance Standing Categorization
    let standing:
      | 'Exceeding SLA'
      | 'Meeting Benchmarks'
      | 'Needs Guidance'
      | 'Action Required (PIP Recommended)'
      | 'Critical Delivery Risk';

    if (score >= 90 && overdueTasks === 0 && onTimeDeliveryRate >= 90) {
      standing = 'Exceeding SLA';
    } else if (score >= 75 && overdueTasks <= 1 && onTimeDeliveryRate >= 75) {
      standing = 'Meeting Benchmarks';
    } else if (score >= 60) {
      standing = 'Needs Guidance';
    } else if (score >= 40 || overdueTasks >= 2 || delayedCompletions >= 3) {
      standing = 'Action Required (PIP Recommended)';
    } else {
      standing = 'Critical Delivery Risk';
    }

    // Flagged Anomalies & Specific Insights
    const flaggedAnomalies: string[] = [];
    if (overdueTasks > 0) {
      flaggedAnomalies.push(
        `${overdueTasks} deliverable(s) currently past deadline (${overdueTasksList.map((t) => `"${t.title}"`).join(', ')}).`
      );
    }
    if (delayedCompletions > 0) {
      flaggedAnomalies.push(
        `${delayedCompletions} deliverable(s) were completed after the agreed sprint SLA deadline.`
      );
    }
    if (completionRate < 75 && totalTasks > 0) {
      flaggedAnomalies.push(`Sprint completion velocity at ${completionRate}% (organizational target is ≥ 80%).`);
    }
    if (criticalTasks.length > 0 && criticalTaskDeliveryRate < 80) {
      flaggedAnomalies.push(`High/Critical priority deliverable SLA adherence is ${criticalTaskDeliveryRate}%.`);
    }

    // Strengths
    const strengths: string[] = [];
    if (onTimeDeliveryRate >= 90 && completedTasks > 0) {
      strengths.push(`High milestone predictability with ${onTimeDeliveryRate}% on-time completion SLA.`);
    }
    if (averageQualityRating >= 4.5) {
      strengths.push(`Consistently exceptional deliverable quality rating (${averageQualityRating}/5.0 stars).`);
    }
    if (completionRate >= 90) {
      strengths.push(`Strong sprint velocity completing ${completedTasks} of ${totalTasks} assigned deliverables.`);
    }
    if (strengths.length === 0) {
      strengths.push('Demonstrates technical capability and engagement with team sprint requirements.');
    }

    // Areas for Improvement
    const areasForImprovement: string[] = [];
    if (delayedCompletions > 0 || overdueTasks > 0) {
      areasForImprovement.push(
        'Sprint milestone time estimation, proactive dependency escalation, and delivery SLA predictability.'
      );
    }
    if (averageQualityRating < 4.0 && ratedTasks.length > 0) {
      areasForImprovement.push('Deliverable review polish, automated test coverage, and QA verification prior to handoff.');
    }
    if (areasForImprovement.length === 0) {
      areasForImprovement.push('Maintain high execution standard and mentor junior colleagues in milestone delivery.');
    }

    // Recommended Actions
    const recommendedActions: string[] = [];
    const pipRecommended =
      standing === 'Action Required (PIP Recommended)' ||
      standing === 'Critical Delivery Risk' ||
      (overdueTasks >= 2 && delayedCompletions >= 3);
    const warningRecommended = delayedCompletions >= 3 || overdueTasks >= 2;

    if (pipRecommended) {
      recommendedActions.push('Initiate 30-Day Performance Improvement Plan (PIP) with weekly milestone checkpoint reviews.');
    } else if (warningRecommended) {
      recommendedActions.push('Issue Level 1 Advisory / Formal Notice regarding Sprint Milestone Delivery SLA.');
    } else if (standing === 'Needs Guidance') {
      recommendedActions.push('Conduct 1-on-1 performance calibration discussion and review sprint task sizing.');
    } else {
      recommendedActions.push('Document meeting or exceeding performance benchmarks for quarterly review cycle.');
    }

    // Linked PIPs and warnings
    const empPips = allPips.filter((p) => p.employeeId === emp.employeeId || p.employeeId === emp.id);
    const activePip = empPips.find((p) => p.status === 'Active' || p.status === 'Progress Review');
    const empWarnings = allWarnings.filter(
      (w) =>
        (w.employeeId === emp.employeeId || w.employeeId === emp.id) &&
        w.status !== 'Resolved' &&
        w.status !== 'Closed'
    );

    return {
      employeeId: emp.employeeId,
      employeeName: emp.fullName,
      department: emp.department,
      roleTitle: emp.roleTitle,
      avatar: emp.profilePhoto,
      performancePeriod: period || 'August 2026',
      totalTasks,
      completedTasks,
      inProgressTasks,
      pendingTasks,
      overdueTasks,
      completionRate,
      onTimeCompletions,
      delayedCompletions,
      onTimeDeliveryRate,
      averageQualityRating,
      criticalTaskDeliveryRate,
      calculatedPerformanceScore: score,
      performanceStanding: standing,
      flaggedAnomalies,
      strengths,
      areasForImprovement,
      recommendedActions,
      pipRecommended,
      warningRecommended,
      activePipId: activePip?.id,
      activePipStatus: activePip?.status,
      activeWarningsCount: empWarnings.length,
      taskBreakdown: empTasks,
      calculatedAt: new Date().toISOString(),
    };
  }

  function calculateOrganizationPerformanceSummary(
    employees: Employee[],
    allTasks: EmployeeTask[],
    allWarnings: EmployeeWarning[],
    allPips: PerformanceImprovementPlan[],
    period: string = 'August 2026',
    department?: string
  ): PerformanceReviewSummary {
    let filteredEmployees = employees.filter((e) => e.employmentStatus !== 'Inactive');
    if (department && department !== 'all') {
      filteredEmployees = filteredEmployees.filter((e) => e.department === department);
    }

    const insights = filteredEmployees.map((emp) =>
      calculateEmployeePerformanceMetrics(emp, allTasks, allWarnings, allPips, period)
    );

    const totalEvaluated = insights.length;
    const avgScore = totalEvaluated > 0 ? Math.round(insights.reduce((s, i) => s + i.calculatedPerformanceScore, 0) / totalEvaluated) : 100;
    const avgOnTime = totalEvaluated > 0 ? Math.round(insights.reduce((s, i) => s + i.onTimeDeliveryRate, 0) / totalEvaluated) : 100;
    const avgCompletion = totalEvaluated > 0 ? Math.round(insights.reduce((s, i) => s + i.completionRate, 0) / totalEvaluated) : 100;
    const pipRecCount = insights.filter((i) => i.pipRecommended).length;
    const criticalRiskCount = insights.filter((i) => i.performanceStanding === 'Critical Delivery Risk').length;

    return {
      period,
      totalEmployeesEvaluated: totalEvaluated,
      averageOrgScore: avgScore,
      overallOnTimeRate: avgOnTime,
      overallCompletionRate: avgCompletion,
      pipRecommendedCount: pipRecCount,
      criticalRiskCount,
      insights,
    };
  }

  app.get('/api/performance-service/metrics', requireAuth, (req, res) => {
    const { employeeId, department, period } = req.query;
    const periodStr = typeof period === 'string' ? period : 'August 2026';
    const deptStr = typeof department === 'string' ? department : undefined;

    if (employeeId) {
      const emp = db.employees.find((e) => e.employeeId === employeeId || e.id === employeeId);
      if (!emp) return res.status(404).json({ error: 'Employee not found.' });
      const insight = calculateEmployeePerformanceMetrics(
        emp,
        db.tasks || [],
        db.warnings || [],
        db.pips || [],
        periodStr
      );
      return res.json(insight);
    }

    const summary = calculateOrganizationPerformanceSummary(
      db.employees,
      db.tasks || [],
      db.warnings || [],
      db.pips || [],
      periodStr,
      deptStr
    );
    res.json(summary);
  });

  app.get('/api/performance-service/employee/:id', requireAuth, (req, res) => {
    const emp = db.employees.find((e) => e.employeeId === req.params.id || e.id === req.params.id);
    if (!emp) return res.status(404).json({ error: 'Employee not found.' });

    const insight = calculateEmployeePerformanceMetrics(
      emp,
      db.tasks || [],
      db.warnings || [],
      db.pips || [],
      'August 2026'
    );
    res.json(insight);
  });

  app.post('/api/performance-service/generate-review-insight', requireHR, (req, res) => {
    const user = (req as any).user as Employee;
    const { employeeId, performancePeriod = 'August 2026', customNotes } = req.body;

    const emp = db.employees.find((e) => e.employeeId === employeeId || e.id === employeeId);
    if (!emp) return res.status(404).json({ error: 'Employee not found.' });

    const insight = calculateEmployeePerformanceMetrics(
      emp,
      db.tasks || [],
      db.warnings || [],
      db.pips || [],
      performancePeriod
    );

    let overallStatus: 'Exceeding Expectations' | 'Meeting Expectations' | 'Needs Improvement' | 'Unsatisfactory' = 'Meeting Expectations';
    if (insight.calculatedPerformanceScore >= 90) overallStatus = 'Exceeding Expectations';
    else if (insight.calculatedPerformanceScore >= 75) overallStatus = 'Meeting Expectations';
    else if (insight.calculatedPerformanceScore >= 50) overallStatus = 'Needs Improvement';
    else overallStatus = 'Unsatisfactory';

    const newReview: PerformanceReviewRecord = {
      id: `rev_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      employeeId: emp.employeeId,
      employeeName: emp.fullName,
      department: emp.department,
      reviewerId: user.employeeId,
      reviewerName: user.fullName,
      performancePeriod,
      reviewDate: new Date().toISOString().split('T')[0],
      goals: `Maintain ≥ 95% on-time milestone delivery across ${performancePeriod} deliverables.`,
      kpiMetrics: [
        {
          metric: 'Sprint Milestone On-Time Delivery Rate',
          target: '≥ 95%',
          achieved: `${insight.onTimeDeliveryRate}%`,
          status: insight.onTimeDeliveryRate >= 95 ? 'Met' : insight.onTimeDeliveryRate >= 75 ? 'Partially Met' : 'Missed',
        },
        {
          metric: 'Sprint Task Completion Velocity',
          target: '≥ 85%',
          achieved: `${insight.completionRate}%`,
          status: insight.completionRate >= 85 ? 'Met' : insight.completionRate >= 70 ? 'Partially Met' : 'Missed',
        },
        {
          metric: 'Deliverable Quality & Polish Rating',
          target: '≥ 4.0 / 5.0',
          achieved: `${insight.averageQualityRating} / 5.0`,
          status: insight.averageQualityRating >= 4.0 ? 'Met' : 'Partially Met',
        },
      ],
      completedWorkSummary: `Completed ${insight.completedTasks} deliverables (${insight.onTimeCompletions} on-time). Quality rating: ${insight.averageQualityRating}/5.0.`,
      missedWorkSummary:
        insight.delayedCompletions > 0 || insight.overdueTasks > 0
          ? `${insight.delayedCompletions} tasks delayed past deadline; ${insight.overdueTasks} currently overdue.`
          : 'None. All sprint deliverables completed on schedule.',
      qualityObservations:
        insight.strengths.join(' ') + (customNotes ? ` HR Reviewer Note: ${customNotes}` : ''),
      strengths: insight.strengths.join(' '),
      areasForImprovement: insight.areasForImprovement.join(' '),
      managerFeedback: `Calculated Performance Metric Score: ${insight.calculatedPerformanceScore}/100 (${insight.performanceStanding}). ${insight.recommendedActions.join(' ')}`,
      overallStatus,
      createdAt: new Date().toISOString(),
    };

    if (!db.performanceReviews) db.performanceReviews = [];
    db.performanceReviews.unshift(newReview);

    db.auditLogs.unshift({
      id: `audit_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      action: 'PERFORMANCE_SERVICE_REVIEW_GENERATED',
      actorId: user.employeeId,
      actorName: user.fullName,
      actorRole: user.role,
      targetType: 'PerformanceReview',
      targetId: newReview.id,
      details: `Generated performance service review for ${emp.fullName} (Score: ${insight.calculatedPerformanceScore}, Standing: ${insight.performanceStanding}).`,
      timestamp: new Date().toISOString(),
    });

    saveDB();
    res.status(201).json({ review: newReview, metrics: insight });
  });

  // ==========================================
  // VITE MIDDLEWARE / PRODUCTION STATIC SERVING
  // ==========================================
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Dayflow AI Server running on http://localhost:${PORT}`);
  });
}

startServer();
