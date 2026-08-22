# -*- coding: utf-8 -*-
from odoo import models, fields, api, _
from datetime import datetime, time

class HrAttendance(models.Model):
    _inherit = 'hr.attendance'

    status = fields.Selection([
        ('present', 'Present'),
        ('late', 'Late Arrival'),
        ('half_day', 'Half Day'),
        ('early_departure', 'Early Departure')
    ], string="Dayflow Status", default='present', compute='_compute_attendance_status', store=True)

    is_late = fields.Boolean(string="Late Check-in", compute='_compute_attendance_status', store=True)
    late_minutes = fields.Integer(string="Minutes Late", compute='_compute_attendance_status', store=True)
    working_hours_actual = fields.Float(string="Effective Worked Hours", compute='_compute_worked_hours', store=True)

    @api.depends('check_in', 'check_out')
    def _compute_worked_hours(self):
        for att in self:
            if att.check_in and att.check_out:
                delta = att.check_out - att.check_in
                att.working_hours_actual = max(0.0, round(delta.total_seconds() / 3600.0, 2))
            else:
                att.working_hours_actual = 0.0

    @api.depends('check_in', 'working_hours_actual')
    def _compute_attendance_status(self):
        for att in self:
            if not att.check_in:
                att.status = 'present'
                att.is_late = False
                att.late_minutes = 0
                continue

            # Standard 09:00 AM check-in expectation (local time conversion)
            checkin_dt = fields.Datetime.context_timestamp(att, att.check_in)
            expected_hour = 9
            expected_minute = 15 # 15 min grace period
            checkin_hour = checkin_dt.hour
            checkin_minute = checkin_dt.minute

            total_minutes = checkin_hour * 60 + checkin_minute
            threshold_minutes = expected_hour * 60 + expected_minute

            if total_minutes > threshold_minutes:
                att.is_late = True
                att.late_minutes = total_minutes - (expected_hour * 60)
                att.status = 'late'
            else:
                att.is_late = False
                att.late_minutes = 0
                att.status = 'present'

            if att.working_hours_actual > 0 and att.working_hours_actual < 4.5:
                att.status = 'half_day'

    @api.model_create_multi
    def create(self, vals_list):
        records = super(HrAttendance, self).create(vals_list)
        # Notify attendance anomaly if late or irregular
        for rec in records:
            if rec.is_late and rec.late_minutes >= 45:
                self._trigger_late_checkin_alert(rec)
        return records

    def _trigger_late_checkin_alert(self, attendance_rec):
        AlertModel = self.env['dayflow.workforce.alert']
        AlertModel.create({
            'title': f"Late Check-in: {attendance_rec.employee_id.name}",
            'alert_type': 'UNUSUAL_ATTENDANCE_PATTERN',
            'severity': 'low' if attendance_rec.late_minutes < 60 else 'medium',
            'employee_id': attendance_rec.employee_id.id,
            'department_id': attendance_rec.employee_id.department_id.id if attendance_rec.employee_id.department_id else False,
            'reason': f"Employee arrived {attendance_rec.late_minutes} minutes past standard working hours.",
            'recommended_action': "Monitor attendance pattern and verify shift alignment.",
        })
