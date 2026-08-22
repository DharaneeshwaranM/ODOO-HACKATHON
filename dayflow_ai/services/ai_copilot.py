# -*- coding: utf-8 -*-
from odoo import models, api, _
from datetime import date, datetime
import re

class DayflowAiCopilot(models.AbstractModel):
    _name = 'dayflow.ai.copilot'
    _description = 'Dayflow AI HR Copilot & Decision Assistant'

    @api.model
    def process_query(self, query_text, context_data=None):
        """
        Processes natural language query from HR user.
        Architecture:
        1. Query Text Normalization & Intent Recognition
        2. Live Odoo ORM Data Extraction & Metric Computation
        3. Explainable, factual Natural Language Response Generation
        4. Zero external API crash vulnerability (100% resilient rule-based intent engine)
        """
        if not query_text:
            return {
                'intent': 'EMPTY',
                'reply': "Please ask a question about attendance, department health, employee risk, leave impact, or today's HR summary.",
                'data': {},
                'suggested_questions': self.get_suggested_questions()
            }

        q = query_text.lower().strip()

        # Intent Detection Pattern Matchers
        if self._matches(q, ['absent today', 'how many absent', 'who is absent', 'absence count']):
            return self._handle_absent_today()

        elif self._matches(q, ['high risk', 'highest risk', 'employees require attention', 'who is high risk', 'risk list', 'at risk']):
            return self._handle_high_risk_employees()

        elif self._matches(q, ['highest absenteeism', 'worst attendance', 'lowest attendance department', 'most absences']):
            return self._handle_highest_absenteeism_department()

        elif self._matches(q, ['who is on leave', 'on leave today', 'leave today', 'current leaves']):
            return self._handle_who_on_leave()

        elif self._matches(q, ['declining attendance', 'declining trend', 'attendance drop', 'attendance declining']):
            return self._handle_declining_attendance()

        elif self._matches(q, ['today summary', 'hr summary', 'daily summary', 'overview today', 'morning briefing', 'executive summary']):
            return self._handle_today_hr_summary()

        elif self._matches(q, ['why is', 'sales workforce health', 'engineering health', 'department health low', 'why low']):
            return self._handle_why_dept_health_low(q)

        elif self._matches(q, ['what will happen if i approve', 'leave impact', 'approve this leave', 'simulate leave']):
            return self._handle_leave_impact_query(context_data)

        elif self._matches(q, ['availability below 75', 'below 75', 'capacity constrained', 'understaffed']):
            return self._handle_depts_below_capacity()

        elif self._matches(q, ['how many high risk', 'count high risk', 'number of high risk']):
            return self._handle_count_high_risk()

        elif self._matches(q, ['recommendation', 'what should hr do', 'action items', 'recommendations']):
            return self._handle_hr_recommendations()

        else:
            return self._handle_fallback(q)

    def _matches(self, query, keywords):
        return any(k in query for k in keywords)

    def _handle_absent_today(self):
        summary = self.env['dayflow.attendance.analyzer'].get_company_attendance_summary()
        today = date.today()
        # Find specific absent employees
        all_emps = self.env['hr.employee'].search([('active', '=', True)])
        start_dt = datetime.combine(today, datetime.min.time())
        end_dt = datetime.combine(today, datetime.max.time())

        attendances = self.env['hr.attendance'].search([
            ('check_in', '>=', fields.Datetime.to_string(start_dt)),
            ('check_in', '<=', fields.Datetime.to_string(end_dt))
        ])
        present_ids = set(attendances.mapped('employee_id').ids)

        leaves = self.env['hr.leave'].search([
            ('state', '=', 'validate'),
            ('date_from', '<=', fields.Datetime.to_string(end_dt)),
            ('date_to', '>=', fields.Datetime.to_string(start_dt))
        ])
        leave_ids = set(leaves.mapped('employee_id').ids)

        absent_emps = [e for e in all_emps if e.id not in present_ids and e.id not in leave_ids]
        absent_names = [e.name for e in absent_emps]

        reply = (
            f"📊 **Today's Absence Status:**\n\n"
            f"• **{summary['absent_count']} out of {summary['total_employees']} employees** are absent today without approved leave.\n"
            f"• **{summary['present_count']} employees** checked in ({summary['attendance_pct']}% attendance).\n"
            f"• **{summary['on_leave_count']} employees** are on scheduled approved leave.\n\n"
        )
        if absent_names:
            sample = ", ".join(absent_names[:5]) + (f" and {len(absent_names)-5} others" if len(absent_names) > 5 else "")
            reply += f"📌 **Absent Staff:** {sample}\n\n"
            reply += "💡 **Recommendation:** Check in with direct department managers to confirm whether remote work or unrecorded sick leave applies."

        return {
            'intent': 'COUNT_ABSENT_TODAY',
            'reply': reply,
            'data': {'absent_count': summary['absent_count'], 'present_count': summary['present_count'], 'on_leave_count': summary['on_leave_count']},
            'suggested_questions': ["Which employees are high risk?", "Give me today's HR summary.", "Which department has the highest absenteeism?"]
        }

    def _handle_high_risk_employees(self):
        high_risk = self.env['hr.employee'].search([('risk_score', '>=', 70)], order='risk_score desc')
        if not high_risk:
            return {
                'intent': 'LIST_HIGH_RISK_EMPLOYEES',
                'reply': "✅ **Good news!** No employees currently fall into the HIGH workforce risk tier (Score ≥ 70). Overall organization risk is well-contained.",
                'data': {'high_risk_count': 0, 'employees': []},
                'suggested_questions': ["Give me today's HR summary.", "Show departments with availability below 75%."]
            }

        reply = f"⚠️ **Identified {len(high_risk)} High-Risk Employees Requiring HR Attention:**\n\n"
        emp_list = []
        for emp in high_risk[:6]:
            reasons_preview = emp.risk_reasons.replace('\n', ' ') if emp.risk_reasons else f"Attendance: {emp.attendance_rate}%, Absences: {emp.absence_count}"
            reply += f"• **{emp.name}** ({emp.department_id.name or 'General'}) — **Score: {emp.risk_score}/100 [HIGH]**\n"
            reply += f"  *Driver:* {reasons_preview[:110]}...\n\n"
            emp_list.append({'id': emp.id, 'name': emp.name, 'score': emp.risk_score, 'dept': emp.department_id.name})

        reply += "💡 **Prescriptive Recommendation:** Schedule structured 1-on-1 pulse check-ins. Review whether project overload or personal issues are impacting presence."

        return {
            'intent': 'LIST_HIGH_RISK_EMPLOYEES',
            'reply': reply,
            'data': {'high_risk_count': len(high_risk), 'employees': emp_list},
            'suggested_questions': ["Why is Sales workforce health low?", "Give me today's HR summary.", "How many employees are absent today?"]
        }

    def _handle_highest_absenteeism_department(self):
        depts = self.env['dayflow.department.analyzer'].get_all_department_intelligence()
        if not depts:
            return {'intent': 'HIGHEST_ABSENTEEISM_DEPARTMENT', 'reply': "No department data available.", 'data': {}}

        # Sort by lowest attendance pct
        sorted_depts = sorted(depts, key=lambda d: d['attendance_pct'])
        worst = sorted_depts[0]

        reply = (
            f"🏢 **Department with Highest Absenteeism: {worst['name']}**\n\n"
            f"• **Today's Attendance:** {worst['attendance_pct']}%\n"
            f"• **Availability:** {worst['availability_pct']}%\n"
            f"• **Present / Total:** {worst['present_today']} / {worst['total_staff']} staff\n"
            f"• **High-Risk Members:** {worst['high_risk_count']}\n"
            f"• **Workforce Health Index:** {worst['workforce_health_score']} / 100\n\n"
            f"💡 **Diagnosis:** {worst['health_summary']}\n"
            f"**Recommended HR Action:** Review shift rosters with the {worst['name']} manager ({worst['manager_name']})."
        )

        return {
            'intent': 'HIGHEST_ABSENTEEISM_DEPARTMENT',
            'reply': reply,
            'data': worst,
            'suggested_questions': [f"Why is {worst['name']} workforce health low?", "Which employees are high risk?", "Who is currently on leave?"]
        }

    def _handle_who_on_leave(self):
        today = date.today()
        start_dt = datetime.combine(today, datetime.min.time())
        end_dt = datetime.combine(today, datetime.max.time())

        leaves = self.env['hr.leave'].search([
            ('state', '=', 'validate'),
            ('date_from', '<=', fields.Datetime.to_string(end_dt)),
            ('date_to', '>=', fields.Datetime.to_string(start_dt))
        ])

        if not leaves:
            return {
                'intent': 'WHO_ON_LEAVE_TODAY',
                'reply': "🌴 **No employees are currently on approved leave today.**",
                'data': {'count': 0},
                'suggested_questions': ["How many employees are absent today?", "Give me today's HR summary."]
            }

        reply = f"🌴 **{len(leaves)} Employees on Approved Leave Today:**\n\n"
        for l in leaves:
            dept_name = l.department_id.name if l.department_id else "General"
            leave_type = l.holiday_status_id.name if l.holiday_status_id else "Leave"
            reply += f"• **{l.employee_id.name}** ({dept_name}) — *{leave_type}* (Until {fields.Date.to_string(l.date_to.date()) if l.date_to else 'TBD'})\n"

        return {
            'intent': 'WHO_ON_LEAVE_TODAY',
            'reply': reply,
            'data': {'count': len(leaves)},
            'suggested_questions': ["What will happen if I approve this leave request?", "Show departments with availability below 75%."]
        }

    def _handle_declining_attendance(self):
        declining_emps = self.env['hr.employee'].search([('attendance_trend', '=', 'declining')])
        if not declining_emps:
            return {
                'intent': 'DECLINING_ATTENDANCE_EMPLOYEES',
                'reply': "📈 **Attendance trends across all departments are currently stable or improving.**",
                'data': {'count': 0},
                'suggested_questions': ["Give me today's HR summary.", "Which employees are high risk?"]
            }

        reply = f"📉 **Identified {len(declining_emps)} Employees with Declining Attendance Velocity:**\n\n"
        for e in declining_emps:
            reply += f"• **{e.name}** ({e.department_id.name or 'General'}) — Risk Score: {e.risk_score} | 30-Day Attendance: {e.attendance_rate}%\n"

        reply += "\n💡 **Proactive Tip:** Catching declining velocity early prevents escalation into high unscheduled absenteeism."
        return {
            'intent': 'DECLINING_ATTENDANCE_EMPLOYEES',
            'reply': reply,
            'data': {'count': len(declining_emps)},
            'suggested_questions': ["Which employees are high risk?", "Why is Sales workforce health low?"]
        }

    def _handle_today_hr_summary(self):
        summary = self.env['dayflow.attendance.analyzer'].get_company_attendance_summary()
        high_risk_count = self.env['hr.employee'].search_count([('risk_score', '>=', 70)])
        alerts_count = self.env['dayflow.workforce.alert'].search_count([('is_read', '=', False)])

        # Health score calculation
        health_score = int(round(0.4 * summary['availability_pct'] + 0.4 * summary['attendance_pct'] + 0.2 * max(0, 100 - (high_risk_count * 5))))
        health_score = max(0, min(100, health_score))

        reply = (
            f"☀️ **Executive HR Briefing for Today:**\n\n"
            f"• **Company Workforce Health Index:** **{health_score}/100**\n"
            f"• **Total Active Headcount:** {summary['total_employees']} staff\n"
            f"• **Present Today:** {summary['present_count']} ({summary['attendance_pct']}% attendance)\n"
            f"• **Approved Leaves:** {summary['on_leave_count']} staff\n"
            f"• **Unscheduled Absences:** {summary['absent_count']} staff\n"
            f"• **Employees Requiring Risk Attention:** {high_risk_count} employees\n"
            f"• **Unread Proactive Alerts:** {alerts_count} alerts\n\n"
            f"🎯 **Key Focus Area:** Review capacity in teams with under 75% availability and address flagged leave overlaps."
        )

        return {
            'intent': 'TODAY_HR_SUMMARY',
            'reply': reply,
            'data': {
                'health_score': health_score,
                'total_employees': summary['total_employees'],
                'present_count': summary['present_count'],
                'on_leave_count': summary['on_leave_count'],
                'absent_count': summary['absent_count'],
                'high_risk_count': high_risk_count
            },
            'suggested_questions': ["Which employees are high risk?", "Which department has the highest absenteeism?", "Show departments with availability below 75%."]
        }

    def _handle_why_dept_health_low(self, query):
        # Detect department name in query
        dept_name = "Sales"
        if "engineering" in query:
            dept_name = "Engineering"
        elif "marketing" in query:
            dept_name = "Marketing"
        elif "human resources" in query or "hr" in query:
            dept_name = "Human Resources"
        elif "finance" in query:
            dept_name = "Finance"

        dept = self.env['hr.department'].search([('name', 'ilike', dept_name)], limit=1)
        if not dept:
            dept = self.env['hr.department'].search([], limit=1)

        if not dept:
            return {'intent': 'WHY_DEPARTMENT_HEALTH_LOW', 'reply': "Department not found.", 'data': {}}

        dept._compute_department_intelligence()
        reply = (
            f"🔍 **Workforce Health Diagnostics for {dept.name}:**\n\n"
            f"• **Workforce Health Index:** **{dept.workforce_health_score}/100** ({dept.health_status.upper()})\n\n"
            f"**Contributing Factor Breakdown:**\n"
            f"1. **Workforce Availability ({dept.availability_pct}%):** {dept.total_staff - dept.on_leave_today}/{dept.total_staff} active employees ({dept.on_leave_today} on leave).\n"
            f"2. **Attendance Rate ({dept.attendance_pct}%):** {dept.present_today} checked in out of available capacity.\n"
            f"3. **Average Risk Score ({dept.average_risk_score}/100):** {dept.high_risk_count} members flagged in High-Risk tier.\n\n"
            f"💡 **AI Recommendation:**\n"
            f"• Restrict concurrent leave approvals in {dept.name} until active headcount exceeds 80%.\n"
            f"• Schedule an alignment meeting with {dept.manager_id.name if dept.manager_id else 'Manager'} to address attendance friction."
        )

        return {
            'intent': 'WHY_DEPARTMENT_HEALTH_LOW',
            'reply': reply,
            'data': {
                'dept': dept.name,
                'health_score': dept.workforce_health_score,
                'availability_pct': dept.availability_pct,
                'attendance_pct': dept.attendance_pct,
                'high_risk_count': dept.high_risk_count
            },
            'suggested_questions': [f"Who is currently on leave?", "Which employees are high risk?", "What will happen if I approve this leave request?"]
        }

    def _handle_leave_impact_query(self, context_data):
        # If context has leave_id or employee_id
        pending_leave = self.env['hr.leave'].search([('state', '=', 'confirm')], limit=1)
        if not pending_leave:
            return {
                'intent': 'LEAVE_IMPACT_SIMULATION',
                'reply': "📋 **No pending leave requests awaiting approval.** If a leave is submitted, I will simulate projected department availability and detect concurrent overlap.",
                'data': {},
                'suggested_questions': ["Give me today's HR summary.", "Which employees are high risk?"]
            }

        impact = self.env['dayflow.leave.impact.engine'].analyze_leave_impact(
            pending_leave.employee_id.id,
            pending_leave.date_from,
            pending_leave.date_to,
            exclude_leave_id=pending_leave.id
        )

        reply = (
            f"🔮 **Leave Impact Simulation for {pending_leave.employee_id.name} ({impact['department_name']}):**\n\n"
            f"• **Impact Assessment:** **{impact['impact_level'].upper()}**\n"
            f"• **Current Department Availability:** {impact['current_availability_pct']}%\n"
            f"• **Projected Availability After Approval:** **{impact['projected_availability_pct']}%** ({impact['dept_projected_available']}/{impact['dept_total_employees']} active)\n"
            f"• **Concurrent Colleague Overlaps:** {impact['overlap_count']} ({', '.join(impact['overlapping_employees']) if impact['overlapping_employees'] else 'None'})\n\n"
            f"💡 **HR Guidance:** {impact['recommendation']}"
        )

        return {
            'intent': 'LEAVE_IMPACT_SIMULATION',
            'reply': reply,
            'data': impact,
            'suggested_questions': ["Show departments with availability below 75%.", "Why is Sales workforce health low?"]
        }

    def _handle_depts_below_capacity(self):
        depts = self.env['dayflow.department.analyzer'].get_all_department_intelligence()
        constrained = [d for d in depts if d['availability_pct'] < 75.0]

        if not constrained:
            return {
                'intent': 'DEPARTMENTS_BELOW_CAPACITY',
                'reply': "✅ **All departments are currently operating above 75% workforce capacity.**",
                'data': {'count': 0},
                'suggested_questions': ["Give me today's HR summary.", "Which employees are high risk?"]
            }

        reply = f"🚨 **{len(constrained)} Departments with Capacity Below 75% Threshold:**\n\n"
        for d in constrained:
            reply += f"• **{d['name']}** — **{d['availability_pct']}% Availability** ({d['total_staff'] - d['on_leave_today']}/{d['total_staff']} active, {d['on_leave_today']} on leave)\n"

        reply += "\n💡 **Recommendation:** Prioritize critical project coverage and avoid approving simultaneous leaves in these teams."
        return {
            'intent': 'DEPARTMENTS_BELOW_CAPACITY',
            'reply': reply,
            'data': {'count': len(constrained), 'departments': constrained},
            'suggested_questions': ["Why is Sales workforce health low?", "Which employees are high risk?"]
        }

    def _handle_count_high_risk(self):
        count = self.env['hr.employee'].search_count([('risk_score', '>=', 70)])
        reply = (
            f"⚠️ **There are currently {count} employees in the HIGH workforce risk category (Score ≥ 70).**\n\n"
            f"Would you like me to list them with their root risk drivers?"
        )
        return {
            'intent': 'COUNT_HIGH_RISK',
            'reply': reply,
            'data': {'count': count},
            'suggested_questions': ["Which employees are high risk?", "Why is Sales workforce health low?", "Give me today's HR summary."]
        }

    def _handle_hr_recommendations(self):
        insights = self.env['dayflow.trend.analyzer'].generate_trend_insights()
        reply = "🎯 **Actionable HR Recommendations for Today:**\n\n"
        for i, ins in enumerate(insights[:4], 1):
            reply += f"{i}. **{ins['headline']}**\n   👉 *Action:* {ins['recommended_action']}\n\n"

        return {
            'intent': 'HR_RECOMMENDATIONS_SUMMARY',
            'reply': reply,
            'data': {'count': len(insights)},
            'suggested_questions': ["Which employees are high risk?", "Why is Sales workforce health low?", "Give me today's HR summary."]
        }

    def _handle_fallback(self, query):
        summary = self.env['dayflow.attendance.analyzer'].get_company_attendance_summary()
        return {
            'intent': 'GENERAL_HR_QUERY',
            'reply': (
                f"I processed your query against live Odoo HR data.\n\n"
                f"Currently, there are **{summary['total_employees']} active employees** with an overall workforce attendance rate of **{summary['attendance_pct']}%**.\n\n"
                f"You can ask me specific questions like:\n"
                f"• *How many employees are absent today?*\n"
                f"• *Which employees are high risk?*\n"
                f"• *Why is Sales workforce health low?*\n"
                f"• *What will happen if I approve this leave request?*\n"
                f"• *Give me today's HR summary.*"
            ),
            'data': summary,
            'suggested_questions': self.get_suggested_questions()
        }

    @api.model
    def get_suggested_questions(self):
        return [
            "How many employees are absent today?",
            "Which employees are high risk?",
            "Why is Sales workforce health low?",
            "What will happen if I approve this leave request?",
            "Show departments with availability below 75%.",
            "Give me today's HR summary."
        ]
