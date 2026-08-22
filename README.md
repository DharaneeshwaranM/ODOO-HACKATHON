<div align="center">

# 🚀 Dayflow AI

### Human Resource Management System

**Intelligent • Explainable • Action-Oriented HR**

[![Odoo](https://img.shields.io/badge/Odoo-17.0-714B67?style=for-the-badge&logo=odoo&logoColor=white)](#)
[![Python](https://img.shields.io/badge/Python-3.x-3776AB?style=for-the-badge&logo=python&logoColor=white)](#)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-336791?style=for-the-badge&logo=postgresql&logoColor=white)](#)
[![OWL](https://img.shields.io/badge/OWL-Frontend-714B67?style=for-the-badge)](#)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](#)

**Built by Byte Builders for the Odoo Hackathon**

</div>

---

## ✨ Overview

**Dayflow AI** is a modern **Human Resource Management System** built on the Odoo HR ecosystem.

It brings employee management, attendance, leave, performance, workforce warnings, department health, HR actions, notifications, and auditability into one unified platform.

> **Observe → Analyze → Explain → Review → Act → Audit**

Dayflow AI helps HR move from simply viewing HR data to taking **structured and explainable HR actions**.

---

## 🎯 The Problem

Traditional HR systems often keep important workforce information separated across different modules.

HR teams may need to manually monitor:

- 👥 Employee information
- ⏱️ Attendance
- 🏖️ Leave
- 📉 Absence
- 📈 Performance
- 🏢 Department health
- ⚠️ Employee warnings
- 💰 Salary-related actions
- 📋 Compliance

This makes it difficult to identify problems early and respond consistently.

---

## 💡 Our Solution

Dayflow AI connects HR signals into a single workflow:

```text
┌─────────────────────────────────────────────┐
│               EMPLOYEE DATA                 │
│ Attendance • Leave • Performance • Conduct  │
└──────────────────────┬──────────────────────┘
                       ↓
┌─────────────────────────────────────────────┐
│            WORKFORCE ANALYSIS               │
└──────────────────────┬──────────────────────┘
                       ↓
┌─────────────────────────────────────────────┐
│          PATTERN / ISSUE DETECTION          │
└──────────────────────┬──────────────────────┘
                       ↓
┌─────────────────────────────────────────────┐
│          EXPLAINABLE HR WARNING             │
└──────────────────────┬──────────────────────┘
                       ↓
┌─────────────────────────────────────────────┐
│           SMART HR ACTION CENTER            │
└──────────────────────┬──────────────────────┘
                       ↓
┌─────────────────────────────────────────────┐
│                 HR REVIEW                   │
└──────────────────────┬──────────────────────┘
                       ↓
┌─────────────────────────────────────────────┐
│            CONTROLLED HR ACTION             │
└──────────────────────┬──────────────────────┘
                       ↓
┌─────────────────────────────────────────────┐
│             NOTIFICATION + AUDIT            │
└─────────────────────────────────────────────┘
```

---

# 🌟 Key Features

## 🔐 Authentication & Access Control

- HR / Admin login
- Employee login
- Role-based dashboard access
- Protected routes
- Backend authorization
- Secure logout

## 👥 Employee Management

HR can manage:

- Employee profiles
- Employee ID
- Department
- Role
- Reporting manager
- Employee status
- Employee search
- Employee filtering

### Profile Editing Rules

**Employees can edit:**
- 📧 Email
- 📱 Contact number
- 🖼️ Profile photo

**Authorized HR users can edit:**
- 👤 Name
- 🆔 Employee ID
- 🏢 Department
- 💼 Role

---

## 📊 HR Dashboard

The HR dashboard provides a centralized overview of the organization.

### Key Metrics

| Metric | Purpose |
|---|---|
| 👥 Total employees | Workforce overview |
| 🟢 Present employees | Daily attendance |
| 🔴 Absent employees | Absence monitoring |
| 🏖️ Employees on leave | Leave overview |
| 📈 Attendance rate | Workforce health |
| 📋 Leave statistics | Leave analysis |
| ⚠️ Active warnings | Risk monitoring |
| 🎯 Pending HR actions | Action tracking |
| 💰 Salary deduction approvals | Financial workflow |
| 🏢 Department health | Department analysis |

---

## 👤 Employee Dashboard

Employees can view:

- Profile
- Attendance
- Working hours
- Leave balance
- Leave history
- Warnings
- Notifications
- HR messages
- Salary deduction status

> Employees only access information they are authorized to view.

---

# ⏱️ Attendance Management

Track:

- Check-in
- Check-out
- Working hours
- Late arrivals
- Early departures
- Absence
- Attendance history

---

# 🏖️ Leave Management

### Employee

Employees can:

- Apply for leave
- Select leave type
- Select dates
- Add reason
- View leave balance
- Track request status
- View leave history

### HR

HR can:

- Approve leave
- Reject leave
- Review leave history
- Monitor leave usage
- Analyze leave patterns

---

# 🚨 Absence Limit Warning

Dayflow AI monitors configured absence limits.

### Example

```text
Allowed Absence     12 Days
Used Absence        14 Days
────────────────────────────
Exceeded             2 Days
```

The system can generate warnings when an employee:

- Approaches the limit
- Reaches the limit
- Crosses the limit

### Notification Channels

- 🔔 Dashboard notification
- 📧 Email
- ⚠️ HR Action Center

---

# 💰 HR-Approved Salary Deduction

When an employee exceeds the configured absence limit, the system can calculate a **potential salary deduction**.

```text
Absence Limit Crossed
        ↓
Warning Generated
        ↓
Potential Deduction
        ↓
HR Approval Required
        ↓
     ┌───────┴───────┐
     ↓               ↓
  APPROVE          REJECT
     ↓
Payroll Workflow
     ↓
Employee Notification
     ↓
Audit Trail
```

> ⚠️ **Salary is never automatically deducted. HR approval is mandatory.**

### Example

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

Dayflow AI can monitor issues related to:

### Attendance
- Repeated late arrivals
- Unauthorized absence
- Attendance violations

### Work
- Repeated missed deadlines
- Incomplete work
- Documented quality issues
- KPI concerns

### Conduct
- Documented misconduct
- Workplace policy violations
- Repeated procedural violations

### Compliance
- Company policy violations
- Security/compliance issues
- Mandatory procedure violations

---

# 📈 Performance Improvement Plan

HR / authorized managers can create a **Performance Improvement Plan (PIP)** for employees requiring structured improvement.

### Track

- Goals
- KPIs
- Expected improvements
- Review dates
- Manager
- HR owner
- Employee response
- Progress
- Final outcome

### Lifecycle

```text
DRAFT
  ↓
ACTIVE
  ↓
PROGRESS REVIEW
  ↓
COMPLETED / EXTENDED / UNSUCCESSFUL
```

---

# 🎯 Smart HR Action Center

A centralized command center showing everything that requires HR attention.

```text
┌─────────────────────────────────────┐
│       SMART HR ACTION CENTER        │
├─────────────────────────────────────┤
│ 🔴 Critical              2          │
│ 🟠 High                  5          │
│ 🟡 Medium                7          │
├─────────────────────────────────────┤
│ 🔴 Salary Approval       REVIEW     │
│ 🟠 Performance Warning   REVIEW     │
│ 🟡 Leave Limit           VIEW       │
│ 🟠 Attendance Issue      VIEW       │
│ 🔴 Department Health     VIEW       │
└─────────────────────────────────────┘
```

### Action Types

- Leave approvals
- Attendance issues
- Absence warnings
- Salary deduction approvals
- Performance warnings
- Compliance warnings
- Department health warnings

---

# 👤 Employee 360° View

HR can view an employee's complete HR information from one place.

### Profile
- Name
- Employee ID
- Department
- Role
- Contact
- Profile photo

### Workforce
- Attendance
- Leave
- Absence
- Performance
- Warnings
- PIP

### Financial
- Salary deduction history
- Approved deductions

### Organization
- Reporting manager
- Department
- Organizational position

### Timeline
Complete history of important HR events.

---

# 🏢 Department Health

Monitor workforce health by department.

### Metrics

- Employee count
- Attendance rate
- Absence rate
- Leave activity
- Late attendance
- Warnings
- Performance indicators

---

# 🌳 Interactive Organizational Chart

Visualize reporting relationships using real organizational data.

```text
                  Department Head
                         │
              ┌──────────┴──────────┐
              │                     │
           Manager               Manager
              │                     │
        ┌─────┴─────┐         ┌─────┴─────┐
        │           │         │           │
    Employee    Employee  Employee    Employee
```

### Features

- Expand / collapse
- Department navigation
- Reporting relationships
- Employee details

---

# 📧 Notifications & Email

Dayflow AI supports:

- Welcome emails
- Leave approval
- Leave rejection
- Attendance warnings
- Absence warnings
- Performance warnings
- Salary deduction notifications
- HR action notifications

### Dynamic Email Fields

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

# ⚙️ Profile & Settings

### Employee Editable

- Email
- Contact Number
- Profile Photo

### HR Controlled

- Name
- Employee ID
- Department
- Role

Also includes:

- 👤 Profile
- 🚪 Logout

---

# 🧾 Audit Trail

Important HR actions are recorded.

### Tracks

- Employee changes
- Leave approvals
- Leave rejections
- Attendance changes
- Salary deduction approvals
- Salary deduction rejections
- Warning creation
- Warning updates
- Performance reviews
- HR decisions

Every important action answers:

> **Who → What → When → Why**

---

# 🔒 Security & Governance

Dayflow AI follows a **Human-in-the-Loop** approach.

### Access Control

- Role-based permissions
- Backend authorization
- Employee data isolation
- HR-only sensitive information
- Protected routes
- Audit logging

### 🛡️ Critical Principle

> **AI recommends. HR decides.**

The system must never independently:

- ❌ Terminate an employee
- ❌ Reduce salary
- ❌ Declare an employee guilty
- ❌ Apply disciplinary punishment

Sensitive actions require authorized HR review and approval.

---

# 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| Platform | Odoo |
| Backend | Python |
| Framework | Odoo ORM |
| Frontend | OWL / JavaScript |
| UI | HTML / CSS |
| Database | PostgreSQL |
| HR | Odoo HR Ecosystem |
| Intelligence | Explainable Rule-Based Analysis |

### Odoo Integration

- `hr`
- `hr_attendance`
- `hr_holidays`
- Payroll / HR modules

---

# 📁 Project Structure

```text
dayflow_ai/
│
├── __init__.py
├── __manifest__.py
│
├── models/
│   ├── employee.py
│   ├── attendance.py
│   ├── leave.py
│   ├── department.py
│   ├── warning.py
│   ├── performance.py
│   ├── salary_deduction.py
│   ├── action_center.py
│   └── audit.py
│
├── views/
│   ├── dashboard_views.xml
│   ├── employee_views.xml
│   ├── attendance_views.xml
│   ├── leave_views.xml
│   ├── department_views.xml
│   ├── warning_views.xml
│   ├── performance_views.xml
│   ├── deduction_views.xml
│   └── action_center_views.xml
│
├── security/
│   ├── security.xml
│   └── ir.model.access.csv
│
├── data/
│   ├── mail_templates.xml
│   └── configuration.xml
│
├── static/
│   └── src/
│       ├── js/
│       ├── css/
│       └── xml/
│
└── README.md
```

---

# 🚀 Installation

### 1. Clone Repository

```bash
git clone <your-repository-url>
cd <your-project-directory>
```

### 2. Configure Odoo

Install the required Odoo dependencies and configure PostgreSQL.

### 3. Install Dayflow AI

Place the module inside the Odoo addons directory.

### 4. Update Module

```bash
./odoo-bin -u dayflow_ai -d <database_name>
```

### 5. Start Odoo

```bash
./odoo-bin -d <database_name>
```

Open the Odoo web interface and log in.

---

# 🧪 Testing

### Authentication
- HR Login
- Employee Login
- Invalid Login
- Role-Based Redirect
- Secure Logout
- Protected Routes

### Employee Management
- Employee Creation
- Profile Update
- HR-Controlled Fields
- Employee-Controlled Fields
- Employee Search

### Attendance & Leave
- Check-In
- Check-Out
- Attendance Tracking
- Leave Application
- Leave Approval
- Leave Rejection
- Absence Warning

### Salary
- Deduction Calculation
- HR Approval
- HR Rejection
- Payroll Workflow
- Employee Notification
- Audit Trail

### Workforce Management
- Warning Generation
- Explainable Warnings
- Department Health
- Smart Action Center
- Performance Warning
- Compliance Warning

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
ALERT
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

Dayflow AI transforms HR from a **data management system** into an **action-oriented HR platform**.

---

# 🎯 Project Vision

Build a smarter HR ecosystem where workforce data becomes **explainable intelligence** and **responsible action**.

```text
HR Management
      +
Workforce Intelligence
      +
Explainable Warnings
      +
Controlled Automation
      +
Human Approval
      +
Auditability
      │
      ▼
┌───────────────────────────┐
│       DAYFLOW AI          │
│ Unified HR Intelligence   │
└───────────────────────────┘
```

---

# 🏅 Hackathon

**Odoo Hackathon**

### 👥 Team — Byte Builders

| Role | Member |
|---|---|
| 👑 Team Leader | DHARANEESHWARAN.M |
| 💻 Team Member | Mohan Kumar |

---

<div align="center">

## 🚀 Dayflow AI

**Human Resource Management System**

*Intelligent • Explainable • Action-Oriented*

**Built by Byte Builders for the Odoo Hackathon**

</div>
