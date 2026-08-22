# -*- coding: utf-8 -*-
from odoo import models, api, _
from datetime import date, datetime

class DayflowDepartmentAnalyzer(models.AbstractModel):
    _name = 'dayflow.department.analyzer'
    _description = 'Dayflow Department Workforce Health Analyzer'

    @api.model
    def get_all_department_intelligence(self):
        departments = self.env['hr.department'].search([])
        dept_data = []

        for dept in departments:
            # Trigger intelligence calculation
            dept._compute_department_intelligence()
            dept_data.append({
                'id': dept.id,
                'name': dept.name,
                'manager_name': dept.manager_id.name if dept.manager_id else 'Unassigned',
                'total_staff': dept.total_staff,
                'present_today': dept.present_today,
                'absent_today': dept.absent_today,
                'on_leave_today': dept.on_leave_today,
                'attendance_pct': dept.attendance_pct,
                'availability_pct': dept.availability_pct,
                'average_risk_score': dept.average_risk_score,
                'high_risk_count': dept.high_risk_count,
                'workforce_health_score': dept.workforce_health_score,
                'health_status': dept.health_status,
                'health_summary': dept.health_summary,
            })

        return dept_data
