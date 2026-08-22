<div align="center">

# 🚀 Dayflow AI

### Workforce Risk & HR Intelligence Platform

**Intelligent • Explainable • Action-Oriented HR**

<p>
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 19"/>
  <img src="https://img.shields.io/badge/TypeScript-5.8-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript"/>
  <img src="https://img.shields.io/badge/Vite-6-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite"/>
  <img src="https://img.shields.io/badge/Express-4-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express"/>
  <img src="https://img.shields.io/badge/Gemini_AI-Enabled-4285F4?style=for-the-badge&logo=google&logoColor=white" alt="Gemini AI"/>
</p>

<p>
  <img src="https://img.shields.io/badge/HR-Management-2563EB?style=flat-square" alt="HR Management"/>
  <img src="https://img.shields.io/badge/Risk-Intelligence-F97316?style=flat-square" alt="Risk Intelligence"/>
  <img src="https://img.shields.io/badge/Human--in--the--Loop-✓-16A34A?style=flat-square" alt="Human in the Loop"/>
  <img src="https://img.shields.io/badge/License-MIT-22C55E?style=flat-square" alt="MIT License"/>
</p>

**Built by Byte Builders**

</div>

---

## 📌 Overview

**Dayflow AI** is a modern HR management and workforce intelligence platform designed to bring employee operations, workforce monitoring, explainable risk detection, and HR decision-making into one unified system.

Instead of simply storing HR information, Dayflow AI follows an action-oriented workflow:

```text
Observe
   ↓
Analyze
   ↓
Detect
   ↓
Explain
   ↓
Recommend
   ↓
Review
   ↓
Approve
   ↓
Act
   ↓
Audit
```

> **AI recommends. HR decides.**

Sensitive HR decisions remain under authorized human review.

---

## 🎯 Problem

Traditional HR systems often separate important workforce information across different screens and processes.

HR teams may need to manually monitor:

* 👥 Employee information
* ⏱️ Attendance
* 🏖️ Leave
* 📉 Absence
* 📈 Performance
* ⚠️ Employee warnings
* 💰 Salary-related requests
* 🏢 Department health
* 📋 HR actions
* 🔍 Workforce risks

This makes it harder to identify workforce issues early and respond consistently.

---

## 💡 Our Solution

Dayflow AI connects HR signals into a unified intelligence workflow.

```text
┌────────────────────────────────────────────┐
│              EMPLOYEE DATA                 │
│ Attendance • Leave • Performance • Tasks   │
└──────────────────────┬─────────────────────┘
                       ↓
┌────────────────────────────────────────────┐
│          WORKFORCE INTELLIGENCE            │
└──────────────────────┬─────────────────────┘
                       ↓
┌────────────────────────────────────────────┐
│          RISK / ISSUE DETECTION            │
└──────────────────────┬─────────────────────┘
                       ↓
┌────────────────────────────────────────────┐
│         EXPLAINABLE HR INSIGHT             │
└──────────────────────┬─────────────────────┘
                       ↓
┌────────────────────────────────────────────┐
│          SMART ACTION CENTER               │
└──────────────────────┬─────────────────────┘
                       ↓
┌────────────────────────────────────────────┐
│              HR REVIEW                     │
└──────────────────────┬─────────────────────┘
                       ↓
┌────────────────────────────────────────────┐
│        CONTROLLED HR ACTION                │
└──────────────────────┬─────────────────────┘
                       ↓
┌────────────────────────────────────────────┐
│          NOTIFICATION + AUDIT              │
└────────────────────────────────────────────┘
```

---

# ✨ Features

## 🔐 Authentication & Role-Based Access

* HR/Admin login
* Employee login
* Role-based dashboard access
* Protected API routes
* Session-based authentication
* Secure logout
* Employee data isolation

---

## 👥 Employee Management

HR administrators can manage:

* Employee profiles
* Employee IDs
* Departments
* Job roles
* Reporting managers
* Employment status
* Contact information
* Profile photos
* Employee search and filtering

### Profile permissions

**Employees can update:**

* Email
* Contact number
* Profile photo

**HR/Admin can manage:**

* Employee name
* Employee ID
* Department
* Role
* Employment status

---

## 📊 HR Dashboard

A centralized dashboard provides workforce visibility through:

| Metric               | Purpose             |
| -------------------- | ------------------- |
| 👥 Total Employees   | Workforce overview  |
| 🟢 Present           | Daily attendance    |
| 🔴 Absent            | Absence monitoring  |
| 🏖️ On Leave         | Leave overview      |
| 📈 Attendance Rate   | Workforce health    |
| ⚠️ Active Warnings   | Risk monitoring     |
| 🎯 Pending Actions   | HR action tracking  |
| 💰 Salary Requests   | Approval workflow   |
| 🏢 Department Health | Department analysis |

---

## 👤 Employee Dashboard

Employees can access their own:

* Profile
* Attendance
* Working hours
* Leave balance
* Leave history
* Absence information
* Performance information
* Warnings
* Notifications
* HR messages
* Salary deduction status

---

# ⏱️ Attendance Management

Track employee attendance with:

* Check-in
* Check-out
* Working hours
* Late arrivals
* Early departures
* Absence
* Attendance history

### Employee workflow

```text
CHECK IN
   ↓
WORKING
   ↓
CHECK OUT
   ↓
ATTENDANCE RECORD
```

---

# 🏖️ Leave Management

### Employees

Employees can:

* Apply for leave
* Select leave type
* Select dates
* Provide a reason
* View leave balance
* Track request status
* View leave history

### HR

HR can:

* Review leave requests
* Approve requests
* Reject requests
* Monitor leave usage
* Analyze leave patterns

---

# 🚨 Absence Monitoring

Dayflow AI monitors configured absence policies.

Example:

```text
Allowed Absence       12 Days
Used Absence          14 Days
──────────────────────────────
Exceeded               2 Days
```

The system can identify employees who:

* Approach the configured threshold
* Reach the threshold
* Exceed the threshold

Warnings can appear through:

* 🔔 Dashboard notifications
* 📧 Email workflows
* ⚠️ Smart Action Center

---

# 💰 Salary Deduction Workflow

When an absence policy is exceeded, Dayflow AI can calculate a **potential salary deduction request**.

```text
Absence Limit Exceeded
          ↓
    Warning Generated
          ↓
 Potential Deduction
          ↓
     HR Review
          ↓
     ┌────┴────┐
     ↓         ↓
  APPROVE    REJECT
     ↓         ↓
 Payroll     No Deduction
 Workflow
     ↓
 Employee Notification
     ↓
    Audit Trail
```

> ⚠️ Salary-related actions require HR review and approval.

Example:

```text
Monthly Salary       ₹30,000
Working Days              30
Daily Rate             ₹1,000
Excess Absence              2
────────────────────────────
Potential Deduction     ₹2,000
```

---

# ⚠️ Employee Warning System

Dayflow AI supports structured employee warnings across multiple categories.

### Attendance

* Repeated late arrivals
* Unauthorized absence
* Attendance violations

### Work

* Missed deadlines
* Incomplete work
* Quality concerns
* KPI concerns

### Conduct

* Documented misconduct
* Workplace policy violations
* Procedural violations

### Compliance

* Company policy violations
* Security/compliance concerns
* Mandatory procedure violations

### Automated Detection

Warnings can also be detected through:

```text
Employee Data
     ↓
Rule / Pattern Analysis
     ↓
Potential Issue
     ↓
Explainable Warning
     ↓
HR Review
```

---

# 📈 Performance Management

Dayflow AI supports structured performance reviews and improvement workflows.

Track:

* Goals
* KPIs
* Performance metrics
* Areas for improvement
* Manager feedback
* Review dates
* Employee responses
* Progress
* Final outcomes

---

# 🎯 Performance Improvement Plans

HR/Admin users can create structured **Performance Improvement Plans (PIPs)**.

### PIP lifecycle

```text
DRAFT
  ↓
ACTIVE
  ↓
PROGRESS REVIEW
  ↓
COMPLETED
  │
  ├── EXTENDED
  │
  └── UNSUCCESSFUL
```

PIPs can track:

* Goals
* KPIs
* Expected improvements
* Review dates
* HR owner
* Manager
* Employee response
* Progress
* Outcome

---

# 🧠 Workforce Intelligence

Dayflow AI combines workforce information to produce explainable insights.

The platform can analyze:

* Attendance
* Absence
* Leave activity
* Performance
* Warnings
* Department health
* Employee risk indicators

Gemini AI can be used for workforce analysis and performance-related insights when `GEMINI_API_KEY` is configured.

---

# 🎯 Smart HR Action Center

The **Smart Action Center** provides HR with a centralized list of items requiring attention.

```text
┌─────────────────────────────────────┐
│        SMART ACTION CENTER          │
├─────────────────────────────────────┤
│ 🔴 Critical                         │
│ 🟠 High                             │
│ 🟡 Medium                           │
├─────────────────────────────────────┤
│ Salary Approval          REVIEW     │
│ Performance Warning      REVIEW     │
│ Leave Limit              VIEW       │
│ Attendance Issue         VIEW       │
│ Department Health        VIEW       │
└─────────────────────────────────────┘
```

Supported action types include:

* Leave approvals
* Attendance issues
* Absence warnings
* Salary deduction requests
* Performance warnings
* Compliance warnings
* Department health warnings

---

# 👤 Employee 360° View

HR can access a consolidated view of an employee.

### Profile

* Name
* Employee ID
* Department
* Role
* Contact
* Profile photo

### Workforce

* Attendance
* Leave
* Absence
* Performance
* Warnings
* PIPs

### Financial

* Salary deduction history
* Approved deductions

### Organization

* Reporting manager
* Department
* Organizational position

### Timeline

Important HR events can be viewed through an employee timeline.

---

# 🏢 Department Health

Monitor workforce health by department.

Metrics include:

* Employee count
* Attendance rate
* Absence rate
* Leave activity
* Late attendance
* Warnings
* Performance indicators

---

# 🌳 Organizational Chart

Visualize employee reporting relationships.

```text
                 Department Head
                       │
              ┌────────┴────────┐
              │                 │
           Manager           Manager
              │                 │
        ┌─────┴─────┐     ┌─────┴─────┐
        │           │     │           │
    Employee    Employee Employee    Employee
```

Features:

* Expand / collapse
* Department navigation
* Reporting relationships
* Employee details

---

# 📧 Notifications & Email

The application supports HR notification workflows including:

* Welcome messages
* Leave approval notifications
* Leave rejection notifications
* Attendance warnings
* Absence warnings
* Performance warnings
* Salary-related notifications
* HR action notifications

Email templates support dynamic fields such as:

```text
{{employee_name}}
{{employee_id}}
{{department}}
{{role}}
{{warning_type}}
{{severity}}
{{incident_date}}
{{deduction_amount}}
{{review_date}}
```

---

# 🧾 Audit Trail

Important HR actions are recorded for traceability.

The audit system tracks events such as:

* Employee changes
* Leave approvals
* Leave rejections
* Attendance changes
* Salary approval/rejection
* Warning creation
* Warning updates
* Performance reviews
* HR decisions

Every important action should answer:

> **Who → What → When → Why**

---

# 🔒 Security & Governance

Dayflow AI follows a **Human-in-the-Loop** approach.

### Access Control

* Role-based permissions
* Protected API routes
* Employee data isolation
* HR-only sensitive operations
* Session validation
* Audit logging

### Responsible HR Intelligence

```text
AI
 ↓
RECOMMEND
 ↓
EXPLAIN
 ↓
HR REVIEW
 ↓
DECISION
 ↓
ACTION
```

> 🛡️ **AI recommends. HR decides.**

The system is designed so that sensitive HR actions require authorized review rather than unrestricted automated decision-making.

---

# 🏗️ Architecture

```text
┌─────────────────────────────────────────────┐
│                  FRONTEND                   │
│                                             │
│        React + TypeScript + Vite            │
│                                             │
│  HR Dashboard • Employee Dashboard          │
│  Attendance • Leave • Warnings • PIP        │
└──────────────────────┬──────────────────────┘
                       │
                       │ REST API
                       ↓
┌─────────────────────────────────────────────┐
│                  BACKEND                    │
│                                             │
│             Express + TypeScript            │
│                                             │
│ Authentication • HR APIs • Audit • Actions  │
└───────────────┬─────────────────┬───────────┘
                │                 │
                ↓                 ↓
      ┌─────────────────┐   ┌────────────────┐
      │ Dayflow Data    │   │  Gemini AI     │
      │                 │   │                │
      │ JSON Persistence│   │ Workforce      │
      │                 │   │ Intelligence   │
      └─────────────────┘   └────────────────┘
```

---

# 🛠️ Technology Stack

| Layer            | Technology                    |
| ---------------- | ----------------------------- |
| Frontend         | React 19                      |
| Language         | TypeScript 5.8                |
| Build Tool       | Vite 6                        |
| Backend          | Express 4                     |
| Runtime          | Node.js / TypeScript          |
| AI               | Google Gemini API             |
| Charts           | Recharts                      |
| UI Icons         | Lucide React                  |
| Animation        | Motion                        |
| Styling          | CSS / Tailwind tooling        |
| Data Persistence | JSON file (`dayflow_db.json`) |
| API              | REST                          |

> **Important:** The current repository is a standalone React/Express application. It does **not** currently contain an Odoo module structure, Python Odoo models, or PostgreSQL configuration.

---

# 📁 Project Structure

```text
dayflow-ai-hr-management-system/
│
├── 📄 metadata.json
├── 📄 package.json
├── 📄 server.ts
├── 📄 index.html
├── 📄 vite.config.ts
├── 📄 tsconfig.json
├── 📄 bun.lock
├── 📄 .env.example
├── 📄 .gitignore
├── 📄 README.md
│
├── 📁 assets/
│   └── 📁 .aistudio/
│       └── .gitignore
│
└── 📁 src/
    │
    ├── 📄 main.tsx
    ├── 📄 App.tsx
    ├── 📄 api.ts
    ├── 📄 types.ts
    ├── 📄 index.css
    │
    ├── 📁 context/
    │   └── 📄 AuthContext.tsx
    │
    └── 📁 components/
        │
        ├── 📁 auth/
        │   └── 📄 LoginPage.tsx
        │
        ├── 📁 common/
        │   ├── 📄 Header.tsx
        │   ├── 📄 Sidebar.tsx
        │   └── 📄 EmailModal.tsx
        │
        ├── 📁 hr/
        │   ├── 📄 HRDashboard.tsx
        │   ├── 📄 EmployeeManagement.tsx
        │   ├── 📄 OrgChart.tsx
        │   ├── 📄 DepartmentManagement.tsx
        │   ├── 📄 AttendanceManagement.tsx
        │   ├── 📄 LeaveManagement.tsx
        │   ├── 📄 AbsenceMonitoring.tsx
        │   ├── 📄 SalaryDeductionRequests.tsx
        │   ├── 📄 WorkforceIntelligence.tsx
        │   ├── 📄 HRNotificationCenter.tsx
        │   ├── 📄 AuditTrailView.tsx
        │   ├── 📄 HRProfile.tsx
        │   ├── 📄 SmartActionCenter.tsx
        │   ├── 📄 WarningManagement.tsx
        │   └── 📄 Employee360Modal.tsx
        │
        └── 📁 employee/
            ├── 📄 EmployeeDashboard.tsx
            ├── 📄 EmployeeAttendance.tsx
            ├── 📄 EmployeeLeaves.tsx
            ├── 📄 EmployeeAbsenceDeductions.tsx
            ├── 📄 EmployeeProfile.tsx
            ├── 📄 EmployeeNotifications.tsx
            └── 📄 EmployeePerformanceWarnings.tsx
```

---

# 🚀 Getting Started

## 1. Clone the repository

```bash
git clone <your-repository-url>
cd dayflow-ai-hr-management-system
```

## 2. Install dependencies

Using npm:

```bash
npm install
```

Or using Bun:

```bash
bun install
```

---

## 3. Configure environment variables

Create a `.env` file in the project root.

```env
GEMINI_API_KEY=your_gemini_api_key
APP_URL=http://localhost:3000
```

### Environment variables

| Variable         | Required  | Description                                  |
| ---------------- | --------- | -------------------------------------------- |
| `GEMINI_API_KEY` | Optional* | Enables Gemini-powered intelligence features |
| `APP_URL`        | Optional  | Application URL used by the server           |

* The application can initialize without a Gemini key, but Gemini-powered analysis requires it.

---

## 4. Start the application

```bash
npm run dev
```

The application runs on:

```text
http://localhost:3000
```

---

# 📦 Production Build

Build both the frontend and backend:

```bash
npm run build
```

Start the production server:

```bash
npm start
```

---

# 🧪 Development Commands

| Command           | Description                   |
| ----------------- | ----------------------------- |
| `npm run dev`     | Start development server      |
| `npm run build`   | Build frontend and backend    |
| `npm start`       | Start production server       |
| `npm run preview` | Preview Vite production build |
| `npm run lint`    | Run TypeScript validation     |
| `npm run clean`   | Remove generated build files  |

---

# 🔌 API Modules

The backend exposes REST endpoints for major HR workflows.

### Authentication

```text
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me
```

### Employees

```text
GET    /api/employees
POST   /api/employees
GET    /api/employees/:id
PUT    /api/employees/:id
DELETE /api/employees/:id
```

### Attendance

```text
GET  /api/attendance
POST /api/attendance/check-in
POST /api/attendance/check-out
POST /api/attendance/record
```

### Leave

```text
GET  /api/leaves
POST /api/leaves
GET  /api/leaves/balance/:employeeId
POST /api/leaves/:id/review
```

### Workforce Intelligence

```text
GET  /api/workforce-intelligence
POST /api/workforce-intelligence/ai-analyze
```

### Warnings

```text
GET  /api/warnings
POST /api/warnings
PUT  /api/warnings/:id
POST /api/warnings/auto-detect
```

### Performance

```text
GET  /api/performance-reviews
POST /api/performance-reviews
GET  /api/pips
POST /api/pips
```

### HR Action Center

```text
GET  /api/action-center
POST /api/action-center/:id/status
POST /api/action-center/:id/dismiss
POST /api/action-center/reset
```

### Audit

```text
GET /api/audit-logs
```

---

# 🧪 Testing Checklist

### Authentication

* [ ] HR/Admin login
* [ ] Employee login
* [ ] Invalid login
* [ ] Role-based redirect
* [ ] Logout
* [ ] Protected API routes

### Employee Management

* [ ] Create employee
* [ ] Update employee
* [ ] Employee profile editing
* [ ] HR-controlled fields
* [ ] Employee search
* [ ] Employee filtering

### Attendance

* [ ] Check-in
* [ ] Check-out
* [ ] Attendance records
* [ ] Working hours
* [ ] Late attendance
* [ ] Absence detection

### Leave

* [ ] Leave application
* [ ] Leave balance
* [ ] Leave approval
* [ ] Leave rejection
* [ ] Leave history

### Workforce Intelligence

* [ ] Workforce analysis
* [ ] Risk detection
* [ ] Warning generation
* [ ] Explainable insights
* [ ] Department health

### Salary Workflow

* [ ] Deduction calculation
* [ ] HR approval
* [ ] HR rejection
* [ ] Employee notification
* [ ] Audit record

---

# 🏆 Why Dayflow AI?

### Traditional HRMS

```text
STORE
  ↓
SEARCH
  ↓
REPORT
```

### Dayflow AI

```text
OBSERVE
  ↓
ANALYZE
  ↓
EXPLAIN
  ↓
DETECT
  ↓
RECOMMEND
  ↓
REVIEW
  ↓
APPROVE
  ↓
ACT
  ↓
AUDIT
```

Dayflow AI aims to transform HR from a **data management system** into an **action-oriented workforce intelligence platform**.

---

# 🔮 Future Roadmap

* [ ] Native Odoo 17 module integration
* [ ] PostgreSQL production database
* [ ] Advanced workforce risk scoring
* [ ] More AI-powered HR insights
* [ ] Advanced analytics dashboards
* [ ] Real-time notifications
* [ ] Production-grade email service
* [ ] Automated deployment
* [ ] Comprehensive automated testing
* [ ] Enhanced audit and compliance controls

---

# 🤝 Contributing

Contributions are welcome.

```bash
git checkout -b feature/your-feature
```

Make your changes, test them, and open a pull request.

---

# 👥 Team

## Byte Builders

| Role           | Member            |
| -------------- | ----------------- |
| 👑 Team Leader | DHARANEESHWARAN.M |
| 💻 Team Member | Mohan Kumar       |

---
🌐 Live Prototype

<div align="center">

🚀 Experience Dayflow AI

Explore the working prototype and experience the HR management platform in action.

<br>

<a href="https://dayflow-ai.ai.studio">

<img src="https://img.shields.io/badge/🚀%20OPEN%20LIVE%20PROTOTYPE-Dayflow%20AI-2563EB?style=for-the-badge" alt="Open Dayflow AI Prototype">

</a>

<br><br>

🔗 https://dayflow-ai.ai.studio

</div>

<div align="center">

Dayflow AI — Workforce Risk & HR Intelligence

Intelligent • Explainable • Action-Oriented

</div>

---

# 📄 License

This project is licensed under the **MIT License**.

---

<div align="center">

## 🚀 Dayflow AI

### Workforce Risk & HR Intelligence

**Intelligent • Explainable • Action-Oriented**

> **AI recommends. HR decides.**

**Built by Byte Builders**

</div>
