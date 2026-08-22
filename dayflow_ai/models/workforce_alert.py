# -*- coding: utf-8 -*-
from odoo import models, fields, api, _

class DayflowWorkforceAlert(models.Model):
    _name = 'dayflow.workforce.alert'
    _description = 'Dayflow Proactive HR Alert'
    _order = 'create_date desc, severity desc'

    title = fields.Char(string="Alert Summary", required=True)
    alert_type = fields.Selection([
        ('HIGH_RISK_EMPLOYEE', 'High Risk Employee Detected'),
        ('LOW_DEPARTMENT_AVAILABILITY', 'Low Department Availability'),
        ('DECLINING_ATTENDANCE', 'Declining Attendance Pattern'),
        ('LEAVE_OVERLAP', 'Critical Leave Overlap Alert'),
        ('HIGH_ABSENTEEISM', 'Elevated Absenteeism'),
        ('UNUSUAL_ATTENDANCE_PATTERN', 'Punctuality Anomaly')
    ], string="Alert Category", required=True, index=True)

    severity = fields.Selection([
        ('low', 'Low Notice'),
        ('medium', 'Medium Priority'),
        ('high', 'High Priority'),
        ('critical', 'Urgent / Critical')
    ], string="Severity Level", default='medium', required=True, index=True)

    employee_id = fields.Many2one('hr.employee', string="Target Employee", ondelete='set null')
    department_id = fields.Many2one('hr.department', string="Target Department", ondelete='set null')
    reason = fields.Text(string="Trigger Cause / Root Analysis", required=True)
    recommended_action = fields.Text(string="Prescriptive Action", required=True)
    is_read = fields.Boolean(string="Read by HR", default=False, index=True)
    is_dismissed = fields.Boolean(string="Resolved / Dismissed", default=False, index=True)

    def action_mark_read(self):
        self.write({'is_read': True})

    def action_mark_unread(self):
        self.write({'is_read': False})

    def action_dismiss(self):
        self.write({'is_dismissed': True, 'is_read': True})
