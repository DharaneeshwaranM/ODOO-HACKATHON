# DAYFLOW AI
## Workforce Risk & HR Intelligence for Odoo 17
> *"Predict workforce risks. Automate HR decisions. Improve productivity."*

---

### 🌟 Executive Overview
**DAYFLOW AI** is an intelligent decision-support layer engineered directly on top of **Odoo 17 HRMS** (`hr`, `hr_attendance`, `hr_holidays`, `mail`, `web`).

Traditional HRMS tells managers what happened in the past. **Dayflow AI explains what is happening right now, diagnoses why capacity or engagement issues are occurring, and prescribes actionable HR interventions** before burnout, unmanaged leave overlap, or productivity deficits impact business operations.

---

### 🚀 Key Features

#### 1. Baseline HRMS Layer
- **Secure Authentication & Token-based Email Verification**: Single-use cryptographic tokens with 24-hour expiration.
- **Role-based Authorization**: Strict separation between Employee self-service and HR/Admin management.
- **Employee Management**: Profile records, compensation structure, documents, and department hierarchy.
- **Attendance Tracking**: Real-time Check-in / Check-out, automatic tardiness calculation, working hours, and anomaly alerts.
- **Leave Management**: Paid, Sick, and Unpaid leave workflows with instant status updates and email dispatch.
- **Payroll & QWeb Salary Slips**: Transparent salary component breakdown (Basic, HRA, Allowances, PF, TDS) and printable QWeb PDF slips.
- **Reports**: Standardized attendance, leave, and compensation reports.

#### 2. Workforce Intelligence & Innovation Layer
- **Explainable AI Workforce Risk Engine (0–100)**: Transparent, deterministic rule-based scoring classifying staff into LOW (0–39), MEDIUM (40–69), and HIGH (70–100) risk tiers with explicit penalty breakdown and prescriptive HR action plans.
- **Employee Risk Intelligence**: Dedicated HR workbench for drill-down into employee risk factors, absence patterns, and attendance velocities.
- **Department Health Index (0–100)**: Real-time department capacity calculations tracking present, absent, on-leave, availability %, and risk concentration.
- **Smart Leave Impact Analyzer**: Evaluates projected department availability before leave approval. Categorizes impact into LOW, MEDIUM, and HIGH without taking final decision power away from HR.
- **Leave Overlap Warning**: Automatically flags concurrent leave requests among colleagues in the same department during the review workflow.
- **Proactive HR Alerts**: Real-time alert feed notifying HR of high-risk staff, department capacity dips under 75%, and recurring punctuality anomalies.
- **AI Insights & Recommendations Engine**: Generates data-grounded insights with empirical metrics and suggested manager actions.
- **AI HR Copilot**: Conversational natural language assistant querying live Odoo ORM data directly with a 100% resilient fallback engine requiring zero external API keys to function.

---

### 🏗 Architecture

```
                    DAYFLOW AI (Odoo 17)
                             │
                             ▼
                    ODOO ORM HR DATA
           (hr.employee, hr.attendance, hr.leave)
                             │
              ┌──────────────┼──────────────┐
              ▼              ▼              ▼
        Attendance        Leave         Employee
              │              │              │
              └──────────────┼──────────────┘
                             ▼
                  WORKFORCE INTELLIGENCE
                             │
            ┌────────────────┼─────────────────┐
            ▼                ▼                 ▼
       Risk Engine      Trend Engine     Dept Health
            │                │                 │
            └────────────────┼─────────────────┘
                             ▼
                  LEAVE IMPACT ANALYZER
                             │
                             ▼
                     PROACTIVE ALERTS
                             │
                             ▼
                     AI HR COPILOT
                             │
                             ▼
                   BETTER HR DECISIONS
```

---

### 📦 Installation & Setup

#### Prerequisites
- **Odoo 17.0 Community or Enterprise**
- **Python 3.10+**
- **PostgreSQL 14+**
- Core Odoo addons: `base`, `mail`, `hr`, `hr_attendance`, `hr_holidays`, `web`

#### Installation Steps
1. Place the `dayflow_ai` module directory into your Odoo addons path:
   ```bash
   cp -r dayflow_ai /opt/odoo/custom_addons/
   ```
2. Update your Odoo server configuration file (`odoo.conf`):
   ```ini
   addons_path = /opt/odoo/odoo/addons,/opt/odoo/custom_addons
   ```
3. Restart your Odoo 17 instance:
   ```bash
   python3 odoo-bin -c odoo.conf -d your_db -u dayflow_ai
   ```
4. Log in as Administrator, navigate to **Apps**, remove the "Apps" filter, search for `dayflow_ai`, and click **Install**.

---

### 🧪 Automated Testing
Run the comprehensive test suite with:
```bash
python3 odoo-bin -c odoo.conf -d your_test_db -i dayflow_ai --test-enable --stop-after-init
```

Tests verify:
- Authentication & single-use email verification tokens
- Explainable Risk Engine scoring and zero-division resilience
- Smart Leave Impact & Overlap calculation
- Attendance status & tardiness calculation
- Department workforce health index
- Model access rights and security record rules

---

### 👤 Demo Credentials
- **HR Administrator**: `hr.admin@dayflow.demo` / `admin1234`
- **Employee**: `alex.chen@dayflow.demo` / `employee1234`
- **High-Risk Employee**: `john.smith@dayflow.demo` / `employee1234`

---

### ⚖️ AI Transparency Statement
Dayflow AI's Workforce Risk Score is a deterministic, explainable, rule-based algorithm derived from empirical attendance and leave records. It does not use opaque deep learning or claim scientifically validated psychological predictions. All metrics and Copilot answers are traceable directly to Odoo database records.
