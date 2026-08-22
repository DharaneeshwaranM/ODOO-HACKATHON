# -*- coding: utf-8 -*-
from odoo import models, api, _
from datetime import date, datetime, timedelta

class DayflowAttendanceAnalyzer(models.AbstractModel):
    _name = 'dayflow.attendance.analyzer'
    _description = 'Dayflow Multi-Dimension Attendance Analytics'

    @api.model
    def get_company_attendance_summary(self, target_date=None):
        if not target_date:
            target_date = date.today()

        employees = self.env['hr.employee'].search([('active', '=', True)])
        total_employees = len(employees)

        if total_employees == 0:
            return {
                'total_employees': 0,
                'present_count': 0,
                'absent_count': 0,
                'on_leave_count': 0,
                'late_count': 0,
                'attendance_pct': 100.0,
                'availability_pct': 100.0,
            }

        start_dt = datetime.combine(target_date, datetime.min.time())
        end_dt = datetime.combine(target_date, datetime.max.time())

        # Today attendances
        attendances = self.env['hr.attendance'].search([
            ('check_in', '>=', fields.Datetime.to_string(start_dt)),
            ('check_in', '<=', fields.Datetime.to_string(end_dt))
        ])
        present_emp_ids = set(attendances.mapped('employee_id').ids)
        present_count = len(present_emp_ids)
        late_count = sum(1 for a in attendances if getattr(a, 'is_late', False))

        # Today leaves
        leaves = self.env['hr.leave'].search([
            ('state', '=', 'validate'),
            ('date_from', '<=', fields.Datetime.to_string(end_dt)),
            ('date_to', '>=', fields.Datetime.to_string(start_dt))
        ])
        leave_emp_ids = set(leaves.mapped('employee_id').ids)
        on_leave_count = len(leave_emp_ids)

        absent_count = max(0, total_employees - present_count - on_leave_count)
        available_count = max(0, total_employees - on_leave_count)

        att_pct = round((present_count / float(available_count if available_count > 0 else total_employees)) * 100.0, 1)
        avail_pct = round((available_count / float(total_employees)) * 100.0, 1)

        return {
            'total_employees': total_employees,
            'present_count': present_count,
            'absent_count': absent_count,
            'on_leave_count': on_leave_count,
            'late_count': late_count,
            'attendance_pct': att_pct,
            'availability_pct': avail_pct,
        }

    @api.model
    def get_attendance_trend_data(self, days=30):
        """Generates date series attendance percentages and absent count"""
        today = date.today()
        trend_series = []

        for i in range(days - 1, -1, -1):
            day_dt = today - timedelta(days=i)
            # Skip weekends in business calculation if desired, but include all days
            day_summary = self.get_company_attendance_summary(day_dt)
            trend_series.append({
                'date': day_dt.strftime('%b %d'),
                'attendance_pct': day_summary['attendance_pct'],
                'present': day_summary['present_count'],
                'absent': day_summary['absent_count'],
                'on_leave': day_summary['on_leave_count'],
            })

        return trend_series
