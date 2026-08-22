# -*- coding: utf-8 -*-
from odoo import models, fields, api, _
from datetime import datetime, timedelta

class HrEmployee(models.Model):
    _inherit = 'hr.employee'

    # Dayflow Authentication & Security extensions
    employee_badge_id = fields.Char(string="Employee ID", copy=False, index=True)
    is_email_verified = fields.Boolean(string="Email Verified", default=False)
    verification_token = fields.Char(string="Verification Token", copy=False)
    token_expiry = fields.Datetime(string="Token Expiration")
    user_role = fields.Selection([
        ('employee', 'Employee'),
        ('hr', 'HR / Admin')
    ], string="Dayflow Role", default='employee', required=True)

    # Dayflow Workforce Risk Metrics (Explainable Rule-Based AI)
    risk_score = fields.Integer(string="Workforce Risk Score", default=15, help="Calculated score from 0 to 100")
    risk_level = fields.Selection([
        ('low', 'LOW'),
        ('medium', 'MEDIUM'),
        ('high', 'HIGH')
    ], string="Risk Level", compute='_compute_risk_metrics', store=True, default='low')
    risk_reasons = fields.Text(string="Identified Risk Factors", help="Bullet points explaining risk score calculation")
    risk_recommendation = fields.Text(string="HR Action Recommendation", help="Actionable recommendation for HR")
    attendance_rate = fields.Float(string="30-Day Attendance %", default=95.0)
    absence_count = fields.Integer(string="30-Day Absences", default=1)
    leave_count = fields.Integer(string="Recent Leaves (90 Days)", default=2)
    late_checkin_count = fields.Integer(string="Late Check-ins (30 Days)", default=0)
    attendance_trend = fields.Selection([
        ('improving', 'Improving'),
        ('stable', 'Stable'),
        ('declining', 'Declining')
    ], string="Attendance Trend", default='stable')

    # Payroll & Compensation Details
    monthly_wage = fields.Monetary(string="Base Monthly Wage", currency_field='currency_id', default=4500.0)
    hra_allowance = fields.Monetary(string="HRA / Housing Allowance", currency_field='currency_id', default=900.0)
    special_allowance = fields.Monetary(string="Special Allowance", currency_field='currency_id', default=600.0)
    provident_fund_rate = fields.Float(string="PF Deduction %", default=12.0)
    tax_deduction_rate = fields.Float(string="Tax Deduction %", default=10.0)
    currency_id = fields.Many2one('res.currency', string="Currency", default=lambda self: self.env.company.currency_id)

    # Relational Risk Record
    workforce_risk_ids = fields.One2many('dayflow.workforce.risk', 'employee_id', string="Risk Assessments")
    workforce_alert_ids = fields.One2many('dayflow.workforce.alert', 'employee_id', string="Proactive Alerts")

    @api.depends('risk_score')
    def _compute_risk_metrics(self):
        for rec in self:
            score = rec.risk_score or 0
            if score >= 70:
                rec.risk_level = 'high'
            elif score >= 40:
                rec.risk_level = 'medium'
            else:
                rec.risk_level = 'low'

    def action_recalculate_risk(self):
        """Invoke Dayflow Risk Engine for this employee"""
        RiskEngine = self.env['dayflow.workforce.risk']
        for emp in self:
            engine_service = self.env['dayflow.risk.service'].recalculate_employee_risk(emp)
        return {
            'type': 'ir.actions.client',
            'tag': 'display_notification',
            'params': {
                'title': _('Risk Recalculated'),
                'message': _('AI Workforce risk assessment updated for %s') % self.name,
                'type': 'success',
                'sticky': False,
            }
        }

    def action_generate_payslip_report(self):
        """Trigger QWeb Payslip Report generation for current month"""
        self.ensure_one()
        return self.env.ref('dayflow_ai.action_report_dayflow_payslip').report_action(self)
