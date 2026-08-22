# -*- coding: utf-8 -*-
{
    'name': 'Dayflow AI - Workforce Risk & HR Intelligence',
    'version': '17.0.1.0.0',
    'category': 'Human Resources/Workforce Intelligence',
    'summary': 'Predict workforce risks, automate HR decisions, and improve productivity with explainable AI.',
    'description': """
Dayflow AI — Workforce Intelligence & HR Decision Support for Odoo 17
=====================================================================
Dayflow AI combines foundational HRMS (Attendance, Leave, Payroll, Profile, Security)
with an innovative Workforce Intelligence layer:
- Deterministic & Explainable Workforce Risk Scoring (0–100)
- Employee Risk Intelligence & Attendance Trend Analyzer
- Department Health & Workforce Capacity Monitoring
- Smart Leave Impact Analyzer with Capacity Simulation
- Leave Overlap Detection in Approval Workflows
- Proactive Automated HR Alerts (High Risk, Low Availability, Irregularity)
- AI HR Copilot with Natural Language Odoo ORM Query Resolution & Fallback Engine
- QWeb Real Payslip Generation and Email Notification Infrastructure
    """,
    'author': 'Dayflow AI Engineering Team',
    'website': 'https://github.com/dayflow-ai/dayflow-odoo17',
    'license': 'LGPL-3',
    'depends': [
        'base',
        'mail',
        'hr',
        'hr_attendance',
        'hr_holidays',
        'web',
    ],
    'data': [
        'security/security.xml',
        'security/ir.model.access.csv',
        'data/mail_templates.xml',
        'data/demo_departments.xml',
        'data/demo_employees.xml',
        'data/demo_attendance.xml',
        'data/demo_leave.xml',
        'views/menus.xml',
        'views/auth_views.xml',
        'views/employee_views.xml',
        'views/attendance_views.xml',
        'views/leave_views.xml',
        'views/department_views.xml',
        'views/risk_views.xml',
        'views/alert_views.xml',
        'views/insight_views.xml',
        'views/dashboard.xml',
        'views/payslip_report.xml',
    ],
    'assets': {
        'web.assets_backend': [
            'dayflow_ai/static/src/css/dayflow.css',
            'dayflow_ai/static/src/css/dashboard.css',
            'dayflow_ai/static/src/css/copilot.css',
            'dayflow_ai/static/src/css/charts.css',
            'dayflow_ai/static/src/js/charts.js',
            'dayflow_ai/static/src/js/leave_impact.js',
            'dayflow_ai/static/src/js/copilot.js',
            'dayflow_ai/static/src/js/dashboard.js',
            'dayflow_ai/static/src/xml/dashboard.xml',
            'dayflow_ai/static/src/xml/copilot.xml',
        ],
    },
    'demo': [
        'data/demo_departments.xml',
        'data/demo_employees.xml',
        'data/demo_attendance.xml',
        'data/demo_leave.xml',
    ],
    'installable': True,
    'application': True,
    'auto_install': False,
}
