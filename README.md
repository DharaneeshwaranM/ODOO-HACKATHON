# 🚀 DAYFLOW AI

### AI-Powered Workforce Intelligence & Proactive HR Automation for Odoo 17

<p align="center">
  <strong>Turn HR data into actionable workforce intelligence.</strong>
</p>

<p align="center">
  <em>Monitor • Analyze • Predict Risk • Alert • Recommend • Assist</em>
</p>

<p align="center">

[![Odoo](https://img.shields.io/badge/Odoo-17.0-714B67?style=for-the-badge\&logo=odoo\&logoColor=white)](https://www.odoo.com/)
[![Python](https://img.shields.io/badge/Python-3.x-3776AB?style=for-the-badge\&logo=python\&logoColor=white)](https://www.python.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-4169E1?style=for-the-badge\&logo=postgresql\&logoColor=white)](https://www.postgresql.org/)
[![React](https://img.shields.io/badge/React-18+-61DAFB?style=for-the-badge\&logo=react\&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge\&logo=typescript\&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-Fast-646CFF?style=for-the-badge\&logo=vite\&logoColor=white)](https://vite.dev/)

</p>

<p align="center">

![Status](https://img.shields.io/badge/Status-Hackathon%20Project-orange?style=flat-square)
![HRMS](https://img.shields.io/badge/Domain-HRMS-success?style=flat-square)
![AI](https://img.shields.io/badge/AI-Workforce%20Intelligence-blue?style=flat-square)
![Architecture](https://img.shields.io/badge/Architecture-Odoo%20%2B%20React-purple?style=flat-square)

</p>

---

## 📌 Overview

**DAYFLOW AI** is an intelligent workforce management and HR decision-support platform built around **Odoo 17**.

Traditional HR systems primarily store employee, attendance, leave, and payroll information. DAYFLOW AI transforms this operational data into **explainable workforce intelligence**.

It helps HR teams identify:

* 🔴 Employees requiring attention
* 📉 Declining attendance patterns
* 🏢 Departments with low workforce availability
* 🏖️ Leave conflicts and potential capacity impact
* 🚨 Proactive HR alerts
* 💡 Workforce insights
* 🎯 Actionable recommendations
* 🤖 Natural-language HR queries through an AI Copilot

> **DAYFLOW AI does not replace HR decision-making. It gives HR the intelligence required to make better decisions faster.**

---

# ✨ Why DAYFLOW AI?

Traditional HR workflow:

```text
Employee Data
      ↓
HR Reports
      ↓
Manual Analysis
      ↓
HR Decision
```

DAYFLOW AI:

```text
Odoo HR Data
      ↓
Workforce Intelligence
      ↓
Risk + Trend Analysis
      ↓
Alerts + Insights
      ↓
Recommendations
      ↓
AI HR Copilot
      ↓
Better HR Decisions
```

---

# 🧠 Core Intelligence

| Intelligence Layer         | What DAYFLOW AI Does                                    |
| -------------------------- | ------------------------------------------------------- |
| 👤 Employee Risk           | Identifies employees requiring attention                |
| ❤️ Workforce Health        | Measures overall workforce health                       |
| 🏢 Department Intelligence | Compares workforce conditions across departments        |
| 📈 Trend Analysis          | Detects attendance and absenteeism trends               |
| 🏖️ Leave Impact           | Estimates workforce availability after leave            |
| ⚠️ Leave Overlap           | Detects overlapping leave within teams                  |
| 🚨 Alerts                  | Generates proactive HR alerts                           |
| 💡 Insights                | Converts workforce metrics into understandable insights |
| 🎯 Recommendations         | Suggests appropriate HR actions                         |
| 🤖 AI Copilot              | Answers natural-language HR questions                   |

---

# 🚀 Key Features

## 🔐 Authentication & Role-Based Access

DAYFLOW AI provides separate experiences for different user roles.

### Employee

* Personal dashboard
* Attendance
* Leave
* Payroll
* Notifications
* Profile

### HR / Administrator

* Workforce dashboard
* Employee management
* Attendance management
* Leave approval
* Payroll
* Employee risk
* Department intelligence
* Alerts
* Audit logs
* AI HR Copilot

Security is enforced through the Odoo authorization layer.

---

## 👥 Employee Management

HR can manage the complete employee lifecycle.

**Capabilities**

* Add employees
* Edit employee information
* Assign departments
* Assign job positions
* Search and filter employees
* View employee profiles
* Manage employee onboarding

### Add Member

`AddMemberModal.tsx`

Provides an intuitive employee onboarding form for:

* Employee name
* Employee ID
* Email
* Department
* Job position
* Phone
* Joining date
* Role

---

# ⏱️ Attendance Intelligence

DAYFLOW AI extends Odoo Attendance with workforce analytics.

### Monitor

* Check-in
* Check-out
* Attendance history
* Attendance percentage
* Late check-ins
* Absence patterns

### Analyze

* 7-day trends
* 30-day trends
* Employee trends
* Department trends
* Organization trends

Example:

```text
Engineering Attendance

91%
     ↓
87%
     ↓
82%
     ↓
78%

⚠ Declining Attendance Detected
```

---

# 🏖️ Smart Leave Management

DAYFLOW AI doesn't simply process leave requests.

It analyzes their **potential workforce impact**.

```text
Leave Request
      ↓
Existing Approved Leave
      ↓
Department Capacity
      ↓
Projected Availability
      ↓
Impact Level
      ↓
HR Recommendation
```

### Example

```text
Current Availability     82%
Projected Availability   70%

Impact                    HIGH

Recommendation:
Review team coverage before approval.
```

> The system provides decision support. HR retains final approval authority.

---

# ⚠️ Leave Overlap Detection

DAYFLOW AI identifies overlapping leave requests within departments.

```text
Employee A → Aug 25–27
Employee B → Aug 25–27
Employee C → Aug 26–28

        ↓

⚠ LEAVE OVERLAP DETECTED

Affected Employees: 3
```

HR can review team coverage before approving additional leave.

---

# 🎯 Workforce Risk Engine

DAYFLOW AI calculates an explainable workforce risk score between **0 and 100**.

|    Score | Level     |
| -------: | --------- |
|   `0–39` | 🟢 LOW    |
|  `40–69` | 🟡 MEDIUM |
| `70–100` | 🔴 HIGH   |

Risk indicators may include:

* Attendance percentage
* Absence frequency
* Late check-ins
* Leave frequency
* Attendance trend
* Department availability
* Workforce capacity

### Example

```text
┌──────────────────────────────┐
│ EMPLOYEE RISK               │
├──────────────────────────────┤
│ Score        82 / 100       │
│ Status       HIGH           │
│                              │
│ Factors                      │
│ • Low attendance             │
│ • Frequent absences          │
│ • Repeated late check-ins    │
│ • Declining trend            │
│                              │
│ Suggested Action             │
│ HR check-in recommended      │
└──────────────────────────────┘
```

### Explainability

Every risk indicator is designed to answer:

**What happened? → Why? → What should HR consider?**

> The current risk engine is **rule-based and explainable**, not presented as scientifically validated predictive machine learning.

---

# ❤️ Workforce Health Score

DAYFLOW AI provides an organization-level and department-level health indicator.

Example:

```text
        WORKFORCE HEALTH

             82 / 100

        ━━━━━━━━━━━━━━━
```

Factors can include:

* Attendance health
* Absence rate
* Leave load
* Workforce availability
* Attendance trends
* Risk distribution

---

# 🏢 Department Intelligence

HR can analyze departments individually.

### Department Metrics

* Employee count
* Present employees
* Absent employees
* Employees on leave
* Attendance
* Availability
* Average risk
* High-risk employees
* Workforce health

Example:

```text
ENGINEERING

Employees          12
Present             9
Absent              1
On Leave            2

Attendance          91%
Availability        75%
Average Risk        42
High Risk            2

Workforce Health    78
```

---

# 🌳 Organizational Chart

### `DepartmentOrgChart.tsx`

DAYFLOW AI provides an interactive organizational structure view.

```text
Department Head
       │
 ┌─────┴─────┐
 ↓           ↓
Team Lead   Team Lead
 │           │
 ├── Staff   ├── Staff
 └── Staff   └── Staff
```

The organizational chart helps HR understand:

* Reporting structure
* Department hierarchy
* Team composition
* Employee distribution

This works alongside Department Health to combine:

**Organizational Structure + Workforce Intelligence**

---

# 🚨 Proactive HR Alerts

DAYFLOW AI monitors workforce conditions and generates actionable alerts.

### Alert Types

```text
HIGH_RISK_EMPLOYEE
LOW_DEPARTMENT_AVAILABILITY
DECLINING_ATTENDANCE
LEAVE_OVERLAP
HIGH_ABSENTEEISM
UNUSUAL_ATTENDANCE_PATTERN
```

Each alert can contain:

* Severity
* Alert type
* Employee / department
* Reason
* Recommended action
* Timestamp
* Read/unread status

---

# 💡 AI Insight Engine

The Insight Engine converts workforce data into understandable HR insights.

Example:

> **Sales attendance is 14% below the organization average.**

> **3 employees have experienced continuous attendance decline.**

> **Engineering availability is below the configured threshold.**

Insights are generated from workforce metrics rather than arbitrary responses.

---

# 🎯 HR Recommendation Engine

DAYFLOW AI connects detected workforce conditions with suggested HR actions.

| Detected Condition     | Suggested Action               |
| ---------------------- | ------------------------------ |
| Declining attendance   | Schedule employee check-in     |
| High employee risk     | Review workload and attendance |
| Low availability       | Review team coverage           |
| Leave overlap          | Review workforce capacity      |
| Increasing absenteeism | Monitor attendance trends      |

---

# 🤖 AI HR Copilot

Ask HR questions using natural language.

### Example Questions

```text
Which employees require HR attention?

Who is currently on leave?

Which department has the highest absenteeism?

Which employees have declining attendance?

Why is Sales workforce health low?

Show departments with availability below 75%.

How many high-risk employees are there?

Give me today's HR summary.
```

### Copilot Flow

```text
HR Question
     ↓
Intent Detection
     ↓
Odoo / Workforce Data
     ↓
Metric Calculation
     ↓
Response Generation
     ↓
HR Answer
```

The Copilot is designed to work with actual workforce data rather than relying exclusively on hardcoded responses.

---

# 📧 Employee Onboarding

DAYFLOW AI includes a reusable employee welcome workflow.

### Components

* `WelcomeEmailModal.tsx`
* `WelcomeEmailTemplate.tsx`

### Workflow

```text
Add Employee
      ↓
Employee Created
      ↓
Welcome Email
      ↓
Preview
      ↓
Send / Trigger Notification
```

Dynamic information can include:

```text
{{employee_name}}
{{employee_role}}
{{department_name}}
{{joining_date}}
```

---

# 🔔 Notifications

### `NotificationsDrawer.tsx`

Centralized notification interface for:

* Leave approvals
* Leave rejections
* New leave requests
* Attendance alerts
* Workforce risk alerts
* Department availability warnings
* HR announcements

---

# 📋 Audit Logs

### `AuditLogsModal.tsx`

Provides traceability for important HR actions.

Examples:

```text
Employee Added
Employee Updated
Leave Approved
Leave Rejected
Attendance Updated
Payroll Viewed
Configuration Changed
```

Audit records can include:

* User
* Action
* Target record
* Timestamp
* Status

---

# 💰 Payroll & Payslips

### `PayrollView.tsx`

Authorized users can access payroll-related information.

### `PayslipModal.tsx`

Provides a detailed payslip view including:

* Employee
* Employee ID
* Department
* Pay period
* Basic salary
* Allowances
* Deductions
* Net salary

> Payroll functionality depends on the appropriate Odoo Payroll installation and permissions.

---

# 🧑‍💻 Odoo Code Explorer

### `OdooCodeExplorer.tsx`

A developer-focused component for demonstrating how DAYFLOW AI integrates with Odoo.

It can visualize:

```text
DAYFLOW Feature
      ↓
Odoo Model
      ↓
Service Layer
      ↓
Odoo ORM
      ↓
PostgreSQL
```

This is particularly useful during technical hackathon presentations.

---

# 🎬 Demo Scenario Guide

### `DemoScenarioGuide.tsx`

Provides guided hackathon demonstration scenarios.

### Scenario 01 — Employee Risk

```text
Select Employee
      ↓
Risk Score
      ↓
Risk Factors
      ↓
Attendance Trend
      ↓
Recommendation
```

### Scenario 02 — Smart Leave

```text
Leave Request
      ↓
Current Availability
      ↓
Projected Availability
      ↓
Impact
      ↓
Recommendation
```

### Scenario 03 — Department Health

```text
Department
      ↓
Organization Chart
      ↓
Attendance
      ↓
Availability
      ↓
Workforce Health
```

### Scenario 04 — AI Copilot

```text
HR Question
      ↓
Workforce Query
      ↓
Data Analysis
      ↓
AI Response
```

---

# 🖥️ Frontend Architecture

DAYFLOW AI contains a **React + TypeScript + Vite frontend** alongside the Odoo application.

```text
┌─────────────────────────────────────────────┐
│              DAYFLOW AI FRONTEND             │
│                                              │
│          React + TypeScript + Vite           │
│                                              │
│ Login • Dashboard • Employee Portal          │
│ Risk • Leave • Attendance • Payroll          │
│ Org Chart • Alerts • Copilot                 │
└──────────────────────┬──────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────┐
│                 ODOO 17                     │
│                                              │
│ HR • Attendance • Time Off • Payroll         │
│ Security • ORM • Mail • Reports              │
└──────────────────────┬──────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────┐
│        DAYFLOW INTELLIGENCE SERVICES         │
│                                              │
│ Risk Engine                                  │
│ Attendance Analyzer                          │
│ Leave Impact Analyzer                        │
│ Department Analyzer                          │
│ Trend Analyzer                               │
│ Alert Engine                                 │
│ Insight Engine                               │
│ AI Copilot                                   │
└──────────────────────┬──────────────────────┘
                       │
                       ▼
                  PostgreSQL
```

### Architecture Principle

**React** → User experience
**Odoo** → Business platform + security
**DAYFLOW Services** → Workforce intelligence
**PostgreSQL** → Persistent data

---

# 🛠️ Technology Stack

### Frontend

* React
* TypeScript
* Vite
* Modern component-based UI
* Responsive design

### Backend

* Odoo 17
* Python
* Odoo ORM
* Odoo Controllers
* Odoo Security

### Database

* PostgreSQL

### Intelligence

* Rule-based workforce intelligence
* Explainable risk scoring
* Trend analysis
* Recommendation engine
* Optional external LLM integration

### Enterprise Services

* Odoo HR
* Odoo Attendance
* Odoo Time Off
* Odoo Payroll
* Odoo Mail

---

# 📁 Project Structure

```text
dayflow-ai/
│
├── README.md
├── LICENSE
├── metadata.json
├── package.json
├── bun.lock
├── tsconfig.json
├── vite.config.ts
├── index.html
├── .env.example
├── .gitignore
│
├── dayflow_ai/                         # Odoo 17 Module
│   ├── __init__.py
│   ├── __manifest__.py
│   │
│   ├── models/
│   │   ├── __init__.py
│   │   ├── employee.py
│   │   ├── attendance_analysis.py
│   │   ├── department.py
│   │   ├── workforce_risk.py
│   │   ├── workforce_alert.py
│   │   └── hr_insight.py
│   │
│   ├── services/
│   │   ├── __init__.py
│   │   ├── risk_engine.py
│   │   ├── attendance_analyzer.py
│   │   ├── leave_impact_engine.py
│   │   ├── department_analyzer.py
│   │   ├── trend_analyzer.py
│   │   ├── notification_service.py
│   │   └── ai_copilot.py
│   │
│   ├── controllers/
│   │   ├── __init__.py
│   │   ├── dashboard.py
│   │   ├── analytics.py
│   │   └── copilot.py
│   │
│   ├── views/
│   │   ├── menus.xml
│   │   ├── employee_views.xml
│   │   ├── attendance_views.xml
│   │   ├── leave_views.xml
│   │   ├── department_views.xml
│   │   ├── risk_views.xml
│   │   ├── alert_views.xml
│   │   ├── insight_views.xml
│   │   ├── dashboard.xml
│   │   └── reports.xml
│   │
│   ├── static/
│   │   └── src/
│   │       ├── components/
│   │       ├── js/
│   │       ├── css/
│   │       └── xml/
│   │
│   ├── security/
│   │   ├── security.xml
│   │   └── ir.model.access.csv
│   │
│   ├── data/
│   │   └── mail_templates.xml
│   │
│   ├── demo/
│   │   └── demo_data.xml
│   │
│   └── tests/
│       ├── __init__.py
│       ├── test_risk.py
│       ├── test_leave.py
│       ├── test_attendance.py
│       ├── test_department.py
│       └── test_security.py
│
├── src/                                # React + TypeScript
│   ├── App.tsx
│   ├── main.tsx
│   ├── index.css
│   │
│   ├── types/
│   │   └── index.ts
│   │
│   ├── data/
│   │   └── mockOdooData.ts
│   │
│   ├── services/
│   │   ├── dayflowEngine.ts
│   │   └── authService.ts
│   │
│   └── components/
│       ├── Navbar.tsx
│       ├── LoginPage.tsx
│       ├── AuthDemoModal.tsx
│       ├── DashboardView.tsx
│       ├── EmployeeRiskView.tsx
│       ├── DepartmentHealthView.tsx
│       ├── DepartmentOrgChart.tsx
│       ├── EmployeePortalView.tsx
│       ├── EmployeeManagementView.tsx
│       ├── AddMemberModal.tsx
│       ├── AttendanceView.tsx
│       ├── LeaveManagementView.tsx
│       ├── PayrollView.tsx
│       ├── PayslipModal.tsx
│       ├── NotificationsDrawer.tsx
│       ├── AuditLogsModal.tsx
│       ├── WelcomeEmailModal.tsx
│       ├── WelcomeEmailTemplate.tsx
│       ├── CopilotView.tsx
│       ├── OdooCodeExplorer.tsx
│       └── DemoScenarioGuide.tsx
│
└── docs/
    └── architecture.md
```

---

# 🧪 Testing & Reliability

DAYFLOW AI should validate:

* Authentication
* Role-based access
* Employee management
* Attendance calculations
* Leave calculations
* Leave overlap
* Leave impact
* Workforce risk
* Department health
* Alert generation
* Security rules
* Copilot queries

### Edge Cases

* No employees
* No attendance records
* No leave records
* Empty departments
* 0% attendance
* 100% attendance
* All employees absent
* All employees present
* Multiple overlapping leaves
* Multiple high-risk employees
* No external AI provider
* Payroll module unavailable

---

# 🔒 Security

DAYFLOW AI follows Odoo's security model.

### Security Controls

* Odoo user groups
* Access Control Lists
* Record Rules
* Server-side authorization
* ORM-based data access
* Protected payroll information
* Role-based UI

> Frontend visibility is never considered the primary security boundary. Sensitive authorization must be enforced by the backend.

---

# 🚀 Installation

## Prerequisites

* Odoo 17
* PostgreSQL
* Python supported by Odoo 17
* Odoo HR
* Odoo Attendance
* Odoo Time Off

Optional:

* Odoo Payroll
* External LLM provider

### Clone

```bash
git clone <YOUR_REPOSITORY_URL>
cd dayflow-ai
```

### Add Odoo Module

```text
odoo/
├── addons/
└── custom_addons/
    └── dayflow_ai/
```

### Configure Odoo

```ini
addons_path = addons,custom_addons
```

### Start Odoo

```bash
python odoo-bin -c odoo.conf
```

### Open

```text
http://localhost:8069
```

Then:

```text
Apps
 → Update Apps List
 → Search "Dayflow AI"
 → Install
```

---

# ⚙️ Frontend Development

Install dependencies:

```bash
npm install
```

Start the Vite development server:

```bash
npm run dev
```

The frontend can then be used for UI development and demonstration.

> For production integration, the frontend should communicate with the authoritative Odoo backend rather than relying on mock data.

---

# 🔑 Environment Variables

Example:

```env
DAYFLOW_AI_PROVIDER=
DAYFLOW_AI_API_KEY=
DAYFLOW_AI_MODEL=
```

Never commit real API credentials.

Use:

```text
.env
```

and keep it excluded through `.gitignore`.

---

# 🎬 Hackathon Demo Flow

The recommended presentation flow is:

```text
01  LOGIN
      ↓
02  EMPLOYEE / HR ROLE
      ↓
03  WORKFORCE DASHBOARD
      ↓
04  EMPLOYEE MANAGEMENT
      ↓
05  DEPARTMENT HEALTH
      ↓
06  ORGANIZATION CHART
      ↓
07  EMPLOYEE RISK
      ↓
08  SMART LEAVE IMPACT
      ↓
09  PROACTIVE ALERT
      ↓
10  PAYROLL / PAYSLIP
      ↓
11  AUDIT LOG
      ↓
12  AI HR COPILOT
      ↓
13  ODOO CODE EXPLORER
```

---

# 🏆 What Makes DAYFLOW AI Different?

### Traditional HRMS

> **Record → Store → Report**

### DAYFLOW AI

> **Record → Analyze → Detect → Explain → Recommend → Assist**

The platform combines:

* Enterprise HR management
* Workforce analytics
* Explainable risk scoring
* Department intelligence
* Proactive alerts
* Smart leave analysis
* Employee self-service
* Organizational visualization
* HR auditability
* AI-assisted HR interaction

---

# 🧭 Design Principles

### 01 — Data First

Workforce metrics should originate from actual HR data.

### 02 — Explainability

Every risk indicator should have understandable contributing factors.

### 03 — Human-in-the-Loop

The platform recommends. HR decides.

### 04 — Security First

Sensitive workforce information must remain protected by server-side authorization.

### 05 — Odoo First

DAYFLOW AI extends Odoo instead of attempting to replace the underlying ERP/HR platform.

### 06 — Modular Intelligence

Risk, attendance, leave, department, alerts, and Copilot functionality are separated into reusable services.

---

# 🔮 Roadmap

### Current

* [x] Odoo HR integration
* [x] Employee management
* [x] Attendance management
* [x] Leave management
* [x] Workforce risk
* [x] Department intelligence
* [x] Workforce health
* [x] Leave impact analysis
* [x] Leave overlap detection
* [x] Proactive alerts
* [x] HR insights
* [x] Recommendations
* [x] Employee portal
* [x] Payroll interface
* [x] Organization chart
* [x] Notifications
* [x] Audit logs
* [x] AI HR Copilot
* [x] React/Vite frontend

### Future

* [ ] ML-based workforce forecasting
* [ ] Workforce capacity forecasting
* [ ] Shift optimization
* [ ] Skill-based workforce planning
* [ ] Advanced anomaly detection
* [ ] Mobile HR application
* [ ] Multi-company workforce intelligence
* [ ] Advanced workforce simulation

---

# ⚠️ Limitations

* Workforce risk scoring is currently rule-based.
* Risk scores are decision-support indicators, not scientifically validated employee predictions.
* Intelligence quality depends on the available HR data.
* External LLM integration is optional.
* Payroll functionality depends on Odoo Payroll availability and permissions.
* Mock data is intended for frontend development/demo purposes.
* Production authentication and authorization should be handled by Odoo.

---

# 👥 Team

### BYTE BUILDERS

**Project:** DAYFLOW AI
**Hackathon:** Odoo Hackathon

| Member                |
| --------------------- |
| **DHARANEESHWARAN M** |
| **MOHAN KUMAR.M**     |

---

# 📜 License

Add the appropriate license for your project.

---

<div align="center">

## 🚀 DAYFLOW AI

**From HR Data → Workforce Intelligence → Better Decisions**

### Built with Odoo 17 • React • TypeScript • Python • PostgreSQL

⭐ **Star the repository if you like DAYFLOW AI**

</div>
