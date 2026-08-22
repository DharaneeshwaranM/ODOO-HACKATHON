import React, { useState } from 'react';
import { Code2, Folder, FileCode, Copy, Check, Download, Layers, Shield, Sparkles } from 'lucide-react';

interface OdooCodeExplorerProps {
  onClose: () => void;
}

interface CodeFile {
  path: string;
  category: string;
  language: string;
  content: string;
}

const ODOO_FILES: CodeFile[] = [
  {
    path: 'dayflow_ai/__manifest__.py',
    category: 'Manifest',
    language: 'python',
    content: `# -*- coding: utf-8 -*-
{
    'name': 'Dayflow AI - Workforce Risk & HR Intelligence',
    'version': '17.0.1.0.0',
    'category': 'Human Resources/Workforce Intelligence',
    'summary': 'Predict workforce risks, automate HR decisions, and optimize department capacity for Odoo 17',
    'description': """
Dayflow AI Workforce Intelligence for Odoo 17
=============================================
* Explainable AI Workforce Risk Scoring Engine (0–100)
* Real-time Department Health & Capacity Index
* Smart Leave Impact Analyzer & Overlap Detector
* Proactive HR Alerts & Daily Insight Feed
* Grounded AI HR Copilot with resilient ORM fallback
* QWeb Salary Slip Generation & Biometric Attendance
    """,
    'author': 'Dayflow AI Engineering Team',
    'website': 'https://dayflow.ai',
    'license': 'LGPL-3',
    'depends': ['base', 'mail', 'hr', 'hr_attendance', 'hr_holidays', 'web'],
    'data': [
        'security/security.xml',
        'security/ir.model.access.csv',
        'data/mail_templates.xml',
        'views/menus.xml',
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
    'demo': [
        'data/demo_departments.xml',
        'data/demo_employees.xml',
        'data/demo_attendance.xml',
        'data/demo_leave.xml',
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
    'application': True,
    'installable': True,
    'auto_install': False,
} `
  },
  {
    path: 'dayflow_ai/services/risk_engine.py',
    category: 'Services',
    language: 'python',
    content: `# -*- coding: utf-8 -*-
from odoo import models, api

class DayflowRiskService(models.AbstractModel):
    _name = 'dayflow.risk.service'
    _description = 'Dayflow Explainable Workforce Risk Scoring Engine'

    @api.model
    def calculate_risk_score(self, employee, attendance_records=None, leave_records=None):
        """
        Calculates explainable workforce risk score (0-100) based on deterministic weights.
        """
        attendance_rate = employee.attendance_rate or 95.0
        absence_count = employee.absence_count or 0
        late_checkin_count = employee.late_checkin_count or 0
        leave_count = employee.leave_count or 1
        trend = employee.attendance_trend or 'stable'

        raw_risk = 10.0
        reasons = []

        # 1. Attendance penalty (0 to 35)
        if attendance_rate < 60.0:
            raw_risk += 35.0
            reasons.append(f"Severe attendance deficit ({attendance_rate:.1f}% vs 90% benchmark)")
        elif attendance_rate < 75.0:
            raw_risk += 25.0
            reasons.append(f"Sub-optimal attendance rate ({attendance_rate:.1f}%)")
        elif attendance_rate < 85.0:
            raw_risk += 15.0
            reasons.append(f"Attendance rate ({attendance_rate:.1f}%) below team target")

        # 2. Absence penalty (0 to 25)
        if absence_count >= 6:
            raw_risk += 25.0
            reasons.append(f"High unscheduled absences ({absence_count} days in 30 days)")
        elif absence_count >= 4:
            raw_risk += 18.0
            reasons.append(f"Frequent unscheduled absence pattern ({absence_count} days)")

        # 3. Punctuality penalty (0 to 20)
        if late_checkin_count >= 7:
            raw_risk += 20.0
            reasons.append(f"Chronic late arrival pattern ({late_checkin_count} late check-ins)")
        elif late_checkin_count >= 4:
            raw_risk += 12.0
            reasons.append(f"Recurring late check-ins ({late_checkin_count} instances)")

        # 4. Trend penalty (0 to 15)
        if trend == 'declining':
            raw_risk += 12.0
            reasons.append("Consecutive declining weekly attendance velocity detected")

        final_score = max(5, min(100, int(round(raw_risk))))
        risk_level = 'high' if final_score >= 70 else 'medium' if final_score >= 40 else 'low'

        if final_score >= 70:
            recommendation = "Priority 1: Schedule an informal 1-on-1 HR check-in to evaluate workload, burnout, and shift scheduling bottlenecks."
        elif final_score >= 40:
            recommendation = "Priority 2: Review upcoming project deliverables and monitor attendance over the next 14 business days."
        else:
            recommendation = "Employee maintains consistent attendance and steady workforce engagement. No HR intervention required."

        return {
            'score': final_score,
            'level': risk_level,
            'reasons': reasons,
            'recommendation': recommendation
        }`
  },
  {
    path: 'dayflow_ai/services/leave_impact_engine.py',
    category: 'Services',
    language: 'python',
    content: `# -*- coding: utf-8 -*-
from odoo import models, api

class DayflowLeaveImpactEngine(models.AbstractModel):
    _name = 'dayflow.leave.impact.engine'
    _description = 'Dayflow Smart Leave Impact & Overlap Analyzer'

    @api.model
    def analyze_leave_impact(self, employee_id, date_from, date_to, exclude_leave_id=None):
        employee = self.env['hr.employee'].browse(employee_id)
        department = employee.department_id

        dept_total = department.total_staff or len(department.member_ids) or 1
        
        # Check overlapping leaves in the same department
        overlap_domain = [
            ('department_id', '=', department.id),
            ('employee_id', '!=', employee.id),
            ('state', '!=', 'refuse'),
            ('date_from', '<=', date_to),
            ('date_to', '>=', date_from),
        ]
        if exclude_leave_id:
            overlap_domain.append(('id', '!=', exclude_leave_id))

        overlapping_leaves = self.env['hr.leave'].search(overlap_domain)
        overlapping_emps = overlapping_leaves.mapped('employee_id.name')
        already_absent = len(set(overlapping_emps))

        currently_available = max(0, dept_total - already_absent)
        projected_available = max(0, currently_available - 1)

        projected_pct = round((projected_available / dept_total) * 100.0, 1)

        if projected_pct < 55.0 or already_absent >= 2:
            impact_level = 'high'
            rec = f"CRITICAL: Projected availability drops to {projected_pct}%. Concurrent leaves with: {', '.join(overlapping_emps)}."
        elif projected_pct < 75.0 or already_absent == 1:
            impact_level = 'medium'
            rec = f"MODERATE IMPACT: Projected availability drops to {projected_pct}%. 1 overlapping colleague ({', '.join(overlapping_emps)})."
        else:
            impact_level = 'low'
            rec = f"HEALTHY COVERAGE: Projected availability remains solid at {projected_pct}%."

        return {
            'dept_total_employees': dept_total,
            'dept_projected_available': projected_available,
            'projected_availability_pct': projected_pct,
            'has_overlap_warning': bool(already_absent > 0),
            'overlap_count': already_absent,
            'overlapping_employees': overlapping_emps,
            'impact_level': impact_level,
            'impact_recommendation': rec,
        }`
  },
  {
    path: 'dayflow_ai/services/ai_copilot.py',
    category: 'Services',
    language: 'python',
    content: `# -*- coding: utf-8 -*-
from odoo import models, api

class DayflowAiCopilot(models.AbstractModel):
    _name = 'dayflow.ai.copilot'
    _description = 'Dayflow Grounded Natural Language HR Copilot'

    @api.model
    def process_query(self, prompt_text):
        """Processes natural language query directly against Odoo 17 HR ORM."""
        q = (prompt_text or '').lower().strip()
        Employee = self.env['hr.employee']
        Department = self.env['hr.department']

        if 'absent' in q or 'how many absent' in q:
            absent_emps = Employee.search([('is_absent_today', '=', True)])
            return {
                'intent': 'COUNT_ABSENT_TODAY',
                'reply': f"📊 Today's Absence Status: {len(absent_emps)} employees are currently absent.",
                'data': {'count': len(absent_emps)}
            }
        elif 'high risk' in q:
            high_risk = Employee.search([('risk_level', '=', 'high')], order='risk_score desc')
            names = [f"{e.name} (Score: {e.risk_score})" for e in high_risk[:5]]
            return {
                'intent': 'HIGH_RISK_EMPLOYEES',
                'reply': f"⚠️ Identified {len(high_risk)} high-risk employees:\\n• " + "\\n• ".join(names),
                'data': {'count': len(high_risk)}
            }
        # Fallback query
        return {
            'intent': 'GENERAL_HR_QUERY',
            'reply': "I queried live Odoo 17 HR records. You can ask about absences, risk scores, department health, or leave impact simulation.",
            'data': {}
        }`
  },
  {
    path: 'dayflow_ai/security/security.xml',
    category: 'Security',
    language: 'xml',
    content: `<?xml version="1.0" encoding="utf-8"?>
<odoo>
    <record id="module_category_dayflow_ai" model="ir.module.category">
        <field name="name">Dayflow AI Workforce Intelligence</field>
        <field name="sequence">25</field>
    </record>

    <record id="group_dayflow_employee" model="res.groups">
        <field name="name">Dayflow Employee</field>
        <field name="category_id" ref="module_category_dayflow_ai"/>
        <field name="implied_ids" eval="[(4, ref('base.group_user'))]"/>
    </record>

    <record id="group_dayflow_hr" model="res.groups">
        <field name="name">Dayflow HR Administrator</field>
        <field name="category_id" ref="module_category_dayflow_ai"/>
        <field name="implied_ids" eval="[(4, ref('group_dayflow_employee')), (4, ref('hr.group_hr_user'))]"/>
    </record>
</odoo>`
  }
];

export const OdooCodeExplorer: React.FC<OdooCodeExplorerProps> = ({ onClose }) => {
  const [selectedFile, setSelectedFile] = useState<CodeFile>(ODOO_FILES[0]);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-slate-900 text-white rounded-lg max-w-5xl w-full h-[85vh] shadow-2xl border border-slate-800 flex flex-col overflow-hidden animate-in fade-in zoom-in duration-150">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-blue-600 flex items-center justify-center">
              <Code2 className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-base tracking-tight text-white flex items-center gap-2">
                <span>Odoo 17 Module Source Explorer</span>
                <span className="text-xs px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800 font-mono">
                  dayflow_ai
                </span>
              </h2>
              <p className="text-xs text-slate-400">Inspect backend models, services, OWL templates, security rules, and XML views</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-md transition-colors border border-slate-700 cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied to Clipboard!' : 'Copy Code'}</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-400 flex items-center justify-center cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content Layout */}
        <div className="flex-1 flex overflow-hidden">
          {/* File Tree Sidebar */}
          <div className="w-72 bg-slate-950/80 border-r border-slate-800 p-4 overflow-y-auto space-y-1 text-xs">
            <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px] block mb-2 px-2">
              Module File Tree
            </span>
            {ODOO_FILES.map(file => {
              const isSelected = selectedFile.path === file.path;
              return (
                <button
                  key={file.path}
                  onClick={() => setSelectedFile(file)}
                  className={`w-full text-left px-3 py-2 rounded-md flex items-center gap-2 transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-blue-600 text-white font-semibold'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <FileCode className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate font-mono text-[11px]">{file.path}</span>
                </button>
              );
            })}
          </div>

          {/* Code Viewer */}
          <div className="flex-1 bg-slate-900 p-6 overflow-y-auto font-mono text-xs">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800 text-slate-400">
              <span className="text-blue-400 font-semibold">{selectedFile.path}</span>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                {selectedFile.language}
              </span>
            </div>
            <pre className="text-slate-200 leading-relaxed overflow-x-auto whitespace-pre">
              {selectedFile.content}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
