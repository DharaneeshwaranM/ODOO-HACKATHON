# -*- coding: utf-8 -*-
from odoo import models, api, _
from datetime import date, timedelta

class DayflowTrendAnalyzer(models.AbstractModel):
    _name = 'dayflow.trend.analyzer'
    _description = 'Dayflow Predictive Trend & Anomaly Detector'

    @api.model
    def generate_trend_insights(self):
        insights = []
        departments = self.env['hr.department'].search([])

        # 1. Department Attendance Comparison Insight
        company_summary = self.env['dayflow.attendance.analyzer'].get_company_attendance_summary()
        avg_company_att = company_summary['attendance_pct']

        for dept in departments:
            dept._compute_department_intelligence()
            if dept.total_staff > 0 and dept.attendance_pct < (avg_company_att - 10.0):
                diff = round(avg_company_att - dept.attendance_pct, 1)
                insights.append({
                    'headline': f"{dept.name} attendance is {diff}% below company average",
                    'category': 'department',
                    'impact_scope': 'warning',
                    'metric_evidence': f"{dept.name}: {dept.attendance_pct}% vs Company: {avg_company_att}%",
                    'description': f"Attendance velocity in {dept.name} has fallen significantly below overall organization levels ({avg_company_att}%).",
                    'recommended_action': f"Conduct department sync with {dept.manager_id.name if dept.manager_id else 'Department Head'} to review team bandwidth.",
                    'department_id': dept.id,
                })

            if dept.total_staff > 0 and dept.availability_pct < 75.0:
                insights.append({
                    'headline': f"{dept.name} workforce availability is constrained at {dept.availability_pct}%",
                    'category': 'capacity',
                    'impact_scope': 'critical' if dept.availability_pct < 60.0 else 'warning',
                    'metric_evidence': f"Availability {dept.availability_pct}% ({dept.total_staff - dept.on_leave_today}/{dept.total_staff} active)",
                    'description': f"More than {100 - int(dept.availability_pct)}% of {dept.name} personnel are simultaneously on leave or absent today.",
                    'recommended_action': "Implement temporary leave blackout or arrange cross-department backup.",
                    'department_id': dept.id,
                })

        # 2. High Risk Employee Cohort Insight
        high_risk_emps = self.env['hr.employee'].search([('risk_score', '>=', 70)])
        if high_risk_emps:
            emp_names = [e.name for e in high_risk_emps[:3]]
            names_str = ", ".join(emp_names) + (f" (+{len(high_risk_emps)-3} more)" if len(high_risk_emps) > 3 else "")
            insights.append({
                'headline': f"{len(high_risk_emps)} employees have entered HIGH workforce risk tier",
                'category': 'retention',
                'impact_scope': 'critical',
                'metric_evidence': f"{len(high_risk_emps)} high-risk employees identified (Scores 70–100)",
                'description': f"Individuals experiencing compounding risk factors (frequent absences, repeated late arrivals, declining trends): {names_str}.",
                'recommended_action': "Initiate proactive HR retention check-ins and workload rebalancing conversations.",
                'department_id': False,
            })

        return insights
