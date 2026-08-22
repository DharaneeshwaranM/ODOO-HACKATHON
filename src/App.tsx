import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { LoginPage } from './components/auth/LoginPage';
import { EmailModal } from './components/common/EmailModal';

// HR Views
import { HRDashboard } from './components/hr/HRDashboard';
import { SmartActionCenter } from './components/hr/SmartActionCenter';
import { EmployeeManagement } from './components/hr/EmployeeManagement';
import { DepartmentManagement } from './components/hr/DepartmentManagement';
import { AttendanceManagement } from './components/hr/AttendanceManagement';
import { LeaveManagement } from './components/hr/LeaveManagement';
import { AbsenceMonitoring } from './components/hr/AbsenceMonitoring';
import { SalaryDeductionRequests } from './components/hr/SalaryDeductionRequests';
import { WorkforceIntelligence } from './components/hr/WorkforceIntelligence';
import { WarningManagement } from './components/hr/WarningManagement';
import { HRNotificationCenter } from './components/hr/HRNotificationCenter';
import { AuditTrailView } from './components/hr/AuditTrailView';
import { HRProfile } from './components/hr/HRProfile';

// Employee Views
import { EmployeeDashboard } from './components/employee/EmployeeDashboard';
import { EmployeeAttendance } from './components/employee/EmployeeAttendance';
import { EmployeeLeaves } from './components/employee/EmployeeLeaves';
import { EmployeePerformanceWarnings } from './components/employee/EmployeePerformanceWarnings';
import { EmployeeAbsenceDeductions } from './components/employee/EmployeeAbsenceDeductions';
import { EmployeeNotifications } from './components/employee/EmployeeNotifications';
import { EmployeeProfile } from './components/employee/EmployeeProfile';

import { Menu, Sparkles, ShieldAlert } from 'lucide-react';

const AppContent: React.FC = () => {
  const { isAuthenticated, role, isLoading } = useAuth();
  const [currentView, setCurrentView] = useState<string>('hr_dashboard');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);

  // Set default view whenever role changes
  useEffect(() => {
    if (role === 'hr_admin') {
      setCurrentView((prev) => (prev.startsWith('hr_') ? prev : 'hr_dashboard'));
    } else if (role === 'employee') {
      setCurrentView((prev) => (prev.startsWith('emp_') ? prev : 'emp_dashboard'));
    }
  }, [role]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-400 text-white shadow-xl animate-pulse">
          <Sparkles className="h-6 w-6" />
        </div>
        <p className="mt-4 text-xs font-semibold text-slate-300">Initializing Dayflow AI HRMS...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const renderActiveView = () => {
    if (role === 'hr_admin') {
      switch (currentView) {
        case 'hr_dashboard':
          return <HRDashboard setCurrentView={setCurrentView} />;
        case 'hr_action_center':
          return <SmartActionCenter setCurrentView={setCurrentView} />;
        case 'hr_employees':
          return <EmployeeManagement />;
        case 'hr_departments':
          return <DepartmentManagement />;
        case 'hr_attendance':
          return <AttendanceManagement />;
        case 'hr_leaves':
          return <LeaveManagement />;
        case 'hr_absence_monitoring':
          return <AbsenceMonitoring setCurrentView={setCurrentView} />;
        case 'hr_salary_deductions':
          return <SalaryDeductionRequests />;
        case 'hr_warnings':
          return <WarningManagement />;
        case 'hr_workforce_intelligence':
          return <WorkforceIntelligence />;
        case 'hr_notifications':
          return <HRNotificationCenter onOpenEmails={() => setIsEmailModalOpen(true)} />;
        case 'hr_audit':
          return <AuditTrailView />;
        case 'hr_profile':
          return <HRProfile />;
        default:
          return <HRDashboard setCurrentView={setCurrentView} />;
      }
    } else {
      switch (currentView) {
        case 'emp_dashboard':
          return <EmployeeDashboard setCurrentView={setCurrentView} />;
        case 'emp_attendance':
          return <EmployeeAttendance />;
        case 'emp_leaves':
          return <EmployeeLeaves />;
        case 'emp_performance':
          return <EmployeePerformanceWarnings />;
        case 'emp_absence':
          return <EmployeeAbsenceDeductions />;
        case 'emp_notifications':
          return <EmployeeNotifications onOpenEmails={() => setIsEmailModalOpen(true)} />;
        case 'emp_profile':
          return <EmployeeProfile />;
        default:
          return <EmployeeDashboard setCurrentView={setCurrentView} />;
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col antialiased">
      {/* Top Header */}
      <Header
        currentView={currentView}
        setCurrentView={setCurrentView}
        onOpenEmails={() => setIsEmailModalOpen(true)}
      />

      {/* Main Body Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          currentView={currentView}
          setCurrentView={setCurrentView}
          mobileOpen={mobileSidebarOpen}
          setMobileOpen={setMobileSidebarOpen}
        />

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto bg-slate-50/50 p-4 sm:p-6 lg:p-8">
          {/* Mobile toggle button */}
          <div className="mb-4 lg:hidden">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-xs"
            >
              <Menu className="h-4 w-4 text-blue-600" />
              <span>Navigation Menu</span>
            </button>
          </div>

          <div className="mx-auto max-w-7xl">
            {renderActiveView()}
          </div>
        </main>
      </div>

      {/* Email Outbox Live Inspection Modal */}
      <EmailModal isOpen={isEmailModalOpen} onClose={() => setIsEmailModalOpen(false)} />
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
