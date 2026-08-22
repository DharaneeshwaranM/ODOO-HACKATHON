# -*- coding: utf-8 -*-
from odoo import models, fields, api, _
from datetime import date

class HrDepartment(models.Model):
    _inherit = 'hr.department'

    # Dayflow Department Intelligence Fields
    total_staff = fields.Integer(string="Total Staff", compute='_compute_department_intelligence', store=True)
    present_today = fields.Integer(string="Present Today", compute='_compute_department_intelligence', store=False)
    absent_today = fields.Integer(string="Absent Today", compute='_compute_department_intelligence', store=False)
    on_leave_today = fields.Integer(string="On Leave Today", compute='_compute_department_intelligence', store=False)

    attendance_pct = fields.Float(string="Today Attendance %", compute='_compute_department_intelligence', store=False)
    availability_pct = fields.Float(string="Current Availability %", compute='_compute_department_intelligence', store=False)
    average_risk_score = fields.Float(string="Average Risk Score", compute='_compute_department_intelligence', store=False)
    high_risk_count = fields.Integer(string="High Risk Staff Count", compute='_compute_department_intelligence', store=False)
    workforce_health_score = fields.Integer(string="Workforce Health Index", compute='_compute_department_intelligence', store=False)

    health_status = fields.Selection([
        ('excellent', 'Optimal (85–100)'),
        ('good', 'Stable (70–84)'),
        ('warning', 'Needs Attention (50–69)'),
        ('critical', 'High Risk (<50)')
    ], string="Department Health Status", compute='_compute_department_intelligence', store=False)

    health_summary = fields.Text(string="Intelligence Summary", compute='_compute_department_intelligence', store=False)

    def _compute_department_intelligence(self):
        today = date.today()
        for dept in self:
            employees = self.env['hr.employee'].search([('department_id', '=', dept.id)])
            total = len(employees)
            dept.total_staff = total

            if total == 0:
                dept.present_today = 0
                dept.absent_today = 0
                dept.on_leave_today = 0
                dept.attendance_pct = 100.0
                dept.availability_pct = 100.0
                dept.average_risk_score = 15.0
                dept.high_risk_count = 0
                dept.workforce_health_score = 100
                dept.health_status = 'excellent'
                dept.health_summary = "Department currently has no active staff members."
                continue

            emp_ids = employees.ids

            # Leaves active today
            leaves = self.env['hr.leave'].search([
                ('employee_id', 'in', emp_ids),
                ('state', '=', 'validate'),
                ('date_from', '<=', fields.Datetime.now()),
                ('date_to', '>=', fields.Datetime.now())
            ])
            on_leave = len(set(leaves.mapped('employee_id').ids))

            # Attendances active today
            attendances = self.env['hr.attendance'].search([
                ('employee_id', 'in', emp_ids),
                ('check_in', '>=', fields.Datetime.to_string(datetime.combine(today, datetime.min.time()))),
                ('check_in', '<=', fields.Datetime.to_string(datetime.combine(today, datetime.max.time())))
            ])
            present = len(set(attendances.mapped('employee_id').ids))

            absent = max(0, total - present - on_leave)

            # Metrics calculation
            available = max(0, total - on_leave)
            avail_pct = round((available / float(total)) * 100.0, 1)
            att_pct = round((present / float(total - on_leave if (total - on_leave) > 0 else total)) * 100.0, 1)

            risk_scores = [e.risk_score for e in employees]
            avg_risk = round(sum(risk_scores) / float(len(risk_scores)), 1) if risk_scores else 20.0
            high_risk_cnt = sum(1 for e in employees if (e.risk_score or 0) >= 70)

            # Department Health formula = 0.4 * Availability + 0.35 * Attendance + 0.25 * (100 - Avg_Risk)
            health_calc = int(round(0.40 * avail_pct + 0.35 * att_pct + 0.25 * (100.0 - avg_risk)))
            health_calc = max(0, min(100, health_calc))

            dept.present_today = present
            dept.absent_today = absent
            dept.on_leave_today = on_leave
            dept.attendance_pct = att_pct
            dept.availability_pct = avail_pct
            dept.average_risk_score = avg_risk
            dept.high_risk_count = high_risk_cnt
            dept.workforce_health_score = health_calc

            if health_calc >= 85:
                dept.health_status = 'excellent'
                dept.health_summary = f"Optimal workforce capacity at {avail_pct}% with steady {att_pct}% attendance."
            elif health_calc >= 70:
                dept.health_status = 'good'
                dept.health_summary = f"Stable operations. {present}/{total} present today, with average risk score {avg_risk}."
            elif health_calc >= 50:
                dept.health_status = 'warning'
                dept.health_summary = f"Capacity constraint alert: availability at {avail_pct}%, with {high_risk_cnt} high-risk members."
            else:
                dept.health_status = 'critical'
                dept.health_summary = f"CRITICAL: Low availability ({avail_pct}%) and high risk concentration ({high_risk_cnt} members)."

from datetime import datetime
