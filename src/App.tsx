import React, { useState } from 'react';
import { UserRole, AuthUser, Employee, Department, LeaveRequest, WorkforceAlert, HrInsight, AuditLogEntry } from './types';
import { 
  INITIAL_EMPLOYEES, 
  INITIAL_DEPARTMENTS, 
  INITIAL_LEAVES, 
  INITIAL_ALERTS, 
  INITIAL_INSIGHTS,
  INITIAL_AUDIT_LOGS
} from './data/mockOdooData';
import { DayflowEngine } from './services/dayflowEngine';
import { ODOO_USERS_REGISTRY } from './services/authService';

import { LoginPage } from './components/LoginPage';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { EmployeeManagementView } from './components/EmployeeManagementView';
import { EmployeeRiskView } from './components/EmployeeRiskView';
import { DepartmentHealthView } from './components/DepartmentHealthView';
import { LeaveManagementView } from './components/LeaveManagementView';
import { AttendanceView } from './components/AttendanceView';
import { PayrollView } from './components/PayrollView';
import { CopilotView } from './components/CopilotView';
import { EmployeePortalView } from './components/EmployeePortalView';
import { AddMemberModal } from './components/AddMemberModal';
import { AuditLogsModal } from './components/AuditLogsModal';
import { WelcomeEmailModal } from './components/WelcomeEmailModal';
import { PayslipModal } from './components/PayslipModal';
import { NotificationsDrawer } from './components/NotificationsDrawer';
import { OdooCodeExplorer } from './components/OdooCodeExplorer';
import { DemoScenarioGuide } from './components/DemoScenarioGuide';
import { AuthDemoModal } from './components/AuthDemoModal';

export function App() {
  // Authentication State
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);

  // Application Data State
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);
  const [departments, setDepartments] = useState<Department[]>(INITIAL_DEPARTMENTS);
  const [leaves, setLeaves] = useState<LeaveRequest[]>(INITIAL_LEAVES);
  const [alerts, setAlerts] = useState<WorkforceAlert[]>(INITIAL_ALERTS);
  const [insights, setInsights] = useState<HrInsight[]>(INITIAL_INSIGHTS);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(INITIAL_AUDIT_LOGS);

  // Selected Entities
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(INITIAL_EMPLOYEES[0]);
  const [selectedDeptName, setSelectedDeptName] = useState<string>('Sales');
  const [payslipEmployee, setPayslipEmployee] = useState<Employee | null>(null);
  const [welcomeEmailEmployee, setWelcomeEmailEmployee] = useState<Employee | null>(null);
  const [welcomeEmailPassword, setWelcomeEmailPassword] = useState<string>('password123');

  // Modals & Drawers
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showAuditLogsModal, setShowAuditLogsModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showCodeExplorer, setShowCodeExplorer] = useState(false);
  const [showDemoGuide, setShowDemoGuide] = useState(false);
  const [showAuthDemo, setShowAuthDemo] = useState(false);

  // Employee Check-In state
  const [employeeCheckedIn, setEmployeeCheckedIn] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Handle Login
  const handleLoginSuccess = (user: AuthUser) => {
    setCurrentUser(user);
    if (user.role === 'hr') {
      setCurrentTab('dashboard');
      showToast(`👋 Welcome, ${user.name}! Connected to HR Administrator Portal.`);
    } else {
      setCurrentTab('employee_portal');
      showToast(`👋 Welcome, ${user.name}! Connected to Employee Self-Service.`);
    }
  };

  // Handle Logout
  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentTab('dashboard');
    setShowAddMemberModal(false);
    setShowAuditLogsModal(false);
    setWelcomeEmailEmployee(null);
    showToast('👋 You have been logged out. Return to Dayflow AI anytime.');
  };

  // Guard tab changes against privilege escalation
  const handleSetTab = (tab: string) => {
    const hrOnlyTabs = ['dashboard', 'employees', 'risk', 'departments', 'copilot'];
    if (currentUser?.role === 'employee' && hrOnlyTabs.includes(tab)) {
      showToast('⛔ 403 Forbidden: Access Denied to HR administrative functions.');
      setCurrentTab('employee_portal');
      return;
    }
    setCurrentTab(tab);
  };

  // Open Add Member Modal with strict permission check
  const handleOpenAddMember = () => {
    if (!currentUser || currentUser.role !== 'hr') {
      showToast('⛔ 403 Forbidden: Only HR/Admin accounts can add new members.');
      return;
    }
    setShowAddMemberModal(true);
  };

  // Open Audit Logs with strict permission check
  const handleOpenAuditLogs = () => {
    if (!currentUser || currentUser.role !== 'hr') {
      showToast('⛔ 403 Forbidden: Audit trails are restricted to HR Administrators.');
      return;
    }
    setShowAuditLogsModal(true);
  };

  // Member created callback - with automated Welcome Email notification trigger
  const handleMemberCreated = (newEmployee: Employee, auditDetails: string, initialPass?: string) => {
    if (initialPass) {
      setWelcomeEmailPassword(initialPass);
    }

    // 1. Prepend new employee to active list
    setEmployees(prev => [newEmployee, ...prev]);

    // 2. Increment department count
    setDepartments(prev => prev.map(d => {
      if (d.id === newEmployee.departmentId || d.name === newEmployee.departmentName) {
        return {
          ...d,
          totalStaff: d.totalStaff + 1,
        };
      }
      return d;
    }));

    // 3. Create Audit Log
    const now = new Date();
    const formattedTimestamp = `${now.toISOString().replace('T', ' ').substring(0, 19)} UTC`;
    const newLog: AuditLogEntry = {
      id: `AUD-2026-${String(Date.now()).slice(-4)}`,
      action: 'Employee Created',
      performedBy: {
        name: currentUser?.name || 'HR Admin',
        userId: currentUser?.userId || 'HR-001',
        role: 'HR Admin (dayflow_ai.group_dayflow_hr)',
        email: currentUser?.email || 'hr@dayflow.demo',
      },
      targetEmployee: {
        name: newEmployee.name,
        employeeId: newEmployee.badgeId,
        department: newEmployee.departmentName,
        jobPosition: newEmployee.jobTitle,
        email: newEmployee.email,
      },
      timestamp: formattedTimestamp,
      details: auditDetails,
      ipAddress: '192.168.1.84',
      securityGroupChecked: 'dayflow_ai.group_dayflow_hr (Access Verified & Approved)',
    };
    setAuditLogs(prev => [newLog, ...prev]);

    // 4. FIRE NOTIFICATION TRIGGER: Automated "Welcome to Team" email dispatched to employee address
    const welcomeAlert: WorkforceAlert = {
      id: `ALERT-WELCOME-${Date.now()}`,
      title: `✉️ Welcome Email Sent: ${newEmployee.name}`,
      alertType: 'WELCOME_EMAIL_DISPATCHED',
      severity: 'low',
      employeeId: newEmployee.id,
      employeeName: newEmployee.name,
      departmentName: newEmployee.departmentName,
      reason: `Automated onboarding package and login credentials dispatched to ${newEmployee.email}. Reporting manager (${newEmployee.managerName || 'Operations'}) alerted.`,
      recommendedAction: 'Verify first-day portal sign-in and attendance punch.',
      isRead: false,
      isDismissed: false,
      createdAt: 'Just now',
      metadata: {
        emailTo: newEmployee.email,
        subject: `Welcome to the Dayflow Team, ${newEmployee.name}! 🎉 [Onboarding & Credentials]`,
        deliveredAt: formattedTimestamp,
        smtpStatus: '250 2.0.0 OK Message Accepted',
      },
    };
    setAlerts(prev => [welcomeAlert, ...prev]);

    // 5. Rich Toast feedback
    showToast(`🎉 ${newEmployee.name} added! ✉️ Welcome email dispatched to ${newEmployee.email}`);
  };

  // Update employee record
  const handleUpdateEmployee = (updated: Employee) => {
    setEmployees(prev => prev.map(e => e.id === updated.id ? updated : e));
    showToast(`✅ Profile for ${updated.name} (${updated.badgeId}) updated.`);
  };

  // Toggle punch check in/out
  const handleToggleCheckIn = () => {
    const nextState = !employeeCheckedIn;
    setEmployeeCheckedIn(nextState);
    showToast(nextState ? '✅ Check-In Punched at 09:02 AM!' : '👋 Checked Out at 05:30 PM');

    const activeEmpId = currentUser?.employeeId || 9;
    setEmployees(prev => prev.map(emp => {
      if (emp.id === activeEmpId) {
        return {
          ...emp,
          todayCheckedIn: nextState,
          todayStatus: nextState ? 'present' : 'absent',
        };
      }
      return emp;
    }));
  };

  // Recalculate Engine
  const handleRecalculateAll = () => {
    // 1. Recalculate all employee risks
    const updatedEmployees = employees.map(emp => {
      const calc = DayflowEngine.calculateEmployeeRisk(emp);
      return {
        ...emp,
        riskScore: calc.score,
        riskLevel: calc.level,
        riskReasons: calc.reasons,
        riskRecommendation: calc.recommendation,
      };
    });
    setEmployees(updatedEmployees);

    // 2. Recalculate department health scores
    const updatedDepts = departments.map(d => DayflowEngine.computeDepartmentHealth(d, updatedEmployees));
    setDepartments(updatedDepts);

    showToast('⚡ Dayflow Risk & Capacity Engines recalculated across workforce!');
  };

  // Approve leave
  const handleApproveLeave = (leaveId: string) => {
    setLeaves(prev => prev.map(l => l.id === leaveId ? { ...l, state: 'validate' } : l));
    showToast('🎉 Leave request approved and logged in Odoo 17 HR Holidays!');
  };

  // Reject leave
  const handleRejectLeave = (leaveId: string) => {
    setLeaves(prev => prev.map(l => l.id === leaveId ? { ...l, state: 'refuse' } : l));
    showToast('⚠️ Leave request declined due to department availability constraint.');
  };

  // Submit new leave
  const handleSubmitLeave = (newLeave: Partial<LeaveRequest>) => {
    const fullLeave: LeaveRequest = {
      id: `LEAVE-2026-00${leaves.length + 1}`,
      employeeId: newLeave.employeeId || currentUser?.employeeId || 1,
      employeeName: newLeave.employeeName || currentUser?.name || 'Staff Member',
      departmentId: newLeave.departmentId || currentUser?.departmentId || 1,
      departmentName: newLeave.departmentName || currentUser?.departmentName || 'Engineering',
      leaveType: newLeave.leaveType || 'Paid Vacation',
      dateFrom: newLeave.dateFrom || '2026-08-25',
      dateTo: newLeave.dateTo || '2026-08-27',
      numberOfDays: newLeave.numberOfDays || 3,
      state: 'confirm',
      reason: newLeave.reason || 'Personal time off',
      impactLevel: newLeave.impactLevel || 'low',
      currentAvailabilityPct: newLeave.currentAvailabilityPct || 80,
      projectedAvailabilityPct: newLeave.projectedAvailabilityPct || 70,
      hasOverlapWarning: newLeave.hasOverlapWarning || false,
      overlapCount: newLeave.overlapCount || 0,
      overlappingEmployees: newLeave.overlappingEmployees || [],
      impactRecommendation: newLeave.impactRecommendation || 'Safe for approval',
      submittedDate: 'Today',
    };
    setLeaves(prev => [fullLeave, ...prev]);
    showToast('📨 Leave request submitted with real-time impact simulation!');
  };

  // Mark all notifications read
  const handleMarkAllAlertsRead = () => {
    setAlerts(prev => prev.map(a => ({ ...a, isRead: true })));
    showToast('🔔 All notifications marked as read.');
  };

  // Navigate to step in Hackathon Demo Sequence
  const handleNavigateToDemoStep = (stepNum: number) => {
    if (stepNum === 1) {
      setShowAuthDemo(true);
    } else if (stepNum === 2) {
      if (!currentUser || currentUser.role !== 'hr') {
        const adminUser = ODOO_USERS_REGISTRY[0];
        setCurrentUser(adminUser);
      }
      setCurrentTab('dashboard');
    } else if (stepNum === 3) {
      if (!currentUser || currentUser.role !== 'hr') {
        const adminUser = ODOO_USERS_REGISTRY[0];
        setCurrentUser(adminUser);
      }
      setSelectedDeptName('Sales');
      setCurrentTab('departments');
    } else if (stepNum === 4) {
      if (!currentUser || currentUser.role !== 'hr') {
        const adminUser = ODOO_USERS_REGISTRY[0];
        setCurrentUser(adminUser);
      }
      setSelectedEmployee(employees.find(e => e.id === 1) || employees[0]); // John Smith
      setCurrentTab('risk');
    } else if (stepNum === 5) {
      if (!currentUser || currentUser.role !== 'hr') {
        const adminUser = ODOO_USERS_REGISTRY[0];
        setCurrentUser(adminUser);
      }
      setCurrentTab('leave');
    } else if (stepNum === 6) {
      if (!currentUser || currentUser.role !== 'hr') {
        const adminUser = ODOO_USERS_REGISTRY[0];
        setCurrentUser(adminUser);
      }
      setPayslipEmployee(employees.find(e => e.id === 1) || employees[0]);
      setCurrentTab('payroll');
    } else if (stepNum === 7) {
      if (!currentUser || currentUser.role !== 'hr') {
        const adminUser = ODOO_USERS_REGISTRY[0];
        setCurrentUser(adminUser);
      }
      setCurrentTab('copilot');
    } else if (stepNum === 8) {
      setShowCodeExplorer(true);
    } else if (stepNum === 9) {
      if (!currentUser || currentUser.role !== 'hr') {
        const adminUser = ODOO_USERS_REGISTRY[0];
        setCurrentUser(adminUser);
      }
      setShowAddMemberModal(true);
    }
  };

  // If user is not logged in, render the dedicated Login Page
  if (!currentUser) {
    return (
      <>
        {toastMessage && (
          <div className="fixed top-6 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-lg shadow-xl border border-blue-500/30 flex items-center gap-2 text-sm font-medium animate-in slide-in-from-top duration-200">
            <span>{toastMessage}</span>
          </div>
        )}
        <LoginPage
          onLoginSuccess={handleLoginSuccess}
          employees={employees}
        />
      </>
    );
  }

  // Determine active employee for Employee view
  const activeEmployee = employees.find(e => e.id === currentUser.employeeId) || employees[0];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-lg shadow-xl border border-blue-500/30 flex items-center gap-2 text-sm font-medium animate-in slide-in-from-top duration-200">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Top Header Navigation */}
      <Navbar
        currentUser={currentUser}
        onLogout={handleLogout}
        currentTab={currentTab}
        setCurrentTab={handleSetTab}
        alerts={alerts}
        onOpenNotifications={() => setShowNotifications(true)}
        onOpenCodeExplorer={() => setShowCodeExplorer(true)}
        onOpenDemoGuide={() => setShowDemoGuide(true)}
        employeeCheckedIn={employeeCheckedIn}
        onToggleCheckIn={handleToggleCheckIn}
        onOpenAddMember={currentUser.role === 'hr' ? handleOpenAddMember : undefined}
        onOpenAuditLogs={currentUser.role === 'hr' ? handleOpenAuditLogs : undefined}
      />

      {/* Main App Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 md:p-8">
        {currentUser.role === 'hr' ? (
          // ================= HR / ADMIN DASHBOARD VIEWS =================
          <>
            {currentTab === 'dashboard' && (
              <DashboardView
                employees={employees}
                departments={departments}
                leaves={leaves}
                alerts={alerts}
                insights={insights}
                onSelectEmployee={emp => {
                  setSelectedEmployee(emp);
                  setCurrentTab('risk');
                }}
                onNavigateTab={tab => handleSetTab(tab)}
                onSelectDepartment={deptName => {
                  setSelectedDeptName(deptName);
                  setCurrentTab('departments');
                }}
                onRecalculateAll={handleRecalculateAll}
                onOpenAddMember={handleOpenAddMember}
              />
            )}

            {currentTab === 'employees' && (
              <EmployeeManagementView
                employees={employees}
                departments={departments}
                currentUser={currentUser}
                onOpenAddMember={handleOpenAddMember}
                onSelectEmployee={emp => {
                  setSelectedEmployee(emp);
                  setCurrentTab('risk');
                }}
                onGeneratePayslip={emp => setPayslipEmployee(emp)}
                onUpdateEmployee={handleUpdateEmployee}
              />
            )}

            {currentTab === 'risk' && (
              <EmployeeRiskView
                employees={employees}
                selectedEmployee={selectedEmployee}
                onSelectEmployee={setSelectedEmployee}
                onGeneratePayslip={emp => setPayslipEmployee(emp)}
                onScheduleCheckin={emp => {
                  showToast(`📅 1-on-1 retention check-in invite sent to ${emp.name} & manager.`);
                }}
              />
            )}

            {currentTab === 'departments' && (
              <DepartmentHealthView
                departments={departments}
                employees={employees}
                selectedDepartmentName={selectedDeptName}
                onSelectDepartment={setSelectedDeptName}
                onSelectEmployee={emp => {
                  setSelectedEmployee(emp);
                  setCurrentTab('risk');
                }}
                onNavigateTab={tab => handleSetTab(tab)}
                onGeneratePayslip={emp => setPayslipEmployee(emp)}
              />
            )}

            {currentTab === 'leave' && (
              <LeaveManagementView
                leaves={leaves}
                employees={employees}
                departments={departments}
                userRole={currentUser.role}
                onApproveLeave={handleApproveLeave}
                onRejectLeave={handleRejectLeave}
                onSubmitLeave={handleSubmitLeave}
              />
            )}

            {currentTab === 'attendance' && (
              <AttendanceView
                employees={employees}
                userRole={currentUser.role}
                employeeCheckedIn={employeeCheckedIn}
                onToggleCheckIn={handleToggleCheckIn}
              />
            )}

            {currentTab === 'copilot' && (
              <CopilotView
                employees={employees}
                departments={departments}
                leaves={leaves}
                alerts={alerts}
                onNavigateTab={tab => handleSetTab(tab)}
              />
            )}

            {currentTab === 'payroll' && (
              <PayrollView
                employees={employees}
                userRole={currentUser.role}
                onSelectEmployee={emp => setPayslipEmployee(emp)}
              />
            )}
          </>
        ) : (
          // ================= EMPLOYEE SELF-SERVICE VIEWS =================
          <>
            {currentTab === 'employee_portal' && (
              <EmployeePortalView
                currentEmployee={activeEmployee}
                leaves={leaves}
                employeeCheckedIn={employeeCheckedIn}
                onToggleCheckIn={handleToggleCheckIn}
                onNavigateTab={tab => handleSetTab(tab)}
                onGeneratePayslip={emp => setPayslipEmployee(emp)}
              />
            )}

            {currentTab === 'attendance' && (
              <AttendanceView
                employees={employees.filter(e => e.id === currentUser.employeeId)}
                userRole={currentUser.role}
                employeeCheckedIn={employeeCheckedIn}
                onToggleCheckIn={handleToggleCheckIn}
              />
            )}

            {currentTab === 'leave' && (
              <LeaveManagementView
                leaves={leaves}
                employees={employees}
                departments={departments}
                userRole={currentUser.role}
                onApproveLeave={handleApproveLeave}
                onRejectLeave={handleRejectLeave}
                onSubmitLeave={handleSubmitLeave}
              />
            )}

            {currentTab === 'payroll' && (
              <PayrollView
                employees={employees.filter(e => e.id === currentUser.employeeId)}
                userRole={currentUser.role}
                onSelectEmployee={emp => setPayslipEmployee(emp)}
              />
            )}
          </>
        )}
      </main>

      {/* Add Member Modal (HR Only) */}
      {showAddMemberModal && currentUser.role === 'hr' && (
        <AddMemberModal
          currentUser={currentUser}
          departments={departments}
          employees={employees}
          onClose={() => setShowAddMemberModal(false)}
          onMemberCreated={handleMemberCreated}
        />
      )}

      {/* Audit Logs Modal (HR Only) */}
      {showAuditLogsModal && currentUser.role === 'hr' && (
        <AuditLogsModal
          currentUser={currentUser}
          auditLogs={auditLogs}
          onClose={() => setShowAuditLogsModal(false)}
        />
      )}

      {/* Payslip Modal */}
      {payslipEmployee && (
        <PayslipModal
          employee={payslipEmployee}
          onClose={() => setPayslipEmployee(null)}
        />
      )}

      {/* Notifications Drawer */}
      {showNotifications && (
        <NotificationsDrawer
          alerts={alerts}
          onClose={() => setShowNotifications(false)}
          onMarkAllRead={handleMarkAllAlertsRead}
          onOpenWelcomeEmail={empId => {
            const found = employees.find(e => e.id === empId) || employees[0];
            setWelcomeEmailEmployee(found);
            setShowNotifications(false);
          }}
        />
      )}

      {/* Welcome Email Modal Preview */}
      {welcomeEmailEmployee && (
        <WelcomeEmailModal
          employee={welcomeEmailEmployee}
          initialPassword={welcomeEmailPassword}
          onClose={() => setWelcomeEmailEmployee(null)}
          onResend={() => {
            showToast(`✉️ Welcome email re-dispatched to ${welcomeEmailEmployee.email}`);
          }}
        />
      )}

      {/* Odoo 17 Code Explorer */}
      {showCodeExplorer && (
        <OdooCodeExplorer onClose={() => setShowCodeExplorer(false)} />
      )}

      {/* Demo Scenario Guide */}
      {showDemoGuide && (
        <DemoScenarioGuide
          onClose={() => setShowDemoGuide(false)}
          onNavigateToStep={handleNavigateToDemoStep}
        />
      )}

      {/* Auth Demo Modal */}
      {showAuthDemo && (
        <AuthDemoModal
          onClose={() => setShowAuthDemo(false)}
          onSuccessLogin={(name, role) => {
            const matched = ODOO_USERS_REGISTRY.find(u => u.role === role) || ODOO_USERS_REGISTRY[0];
            setCurrentUser(matched);
            showToast(`🎉 Signed in as ${name} (${role.toUpperCase()})!`);
          }}
        />
      )}
    </div>
  );
}

export default App;
