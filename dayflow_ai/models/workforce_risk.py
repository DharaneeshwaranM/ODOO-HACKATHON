# -*- coding: utf-8 -*-
from odoo import models, fields, api, _

class DayflowWorkforceRisk(models.Model):
    _name = 'dayflow.workforce.risk'
    _description = 'Dayflow Workforce Risk Assessment'
    _order = 'assessment_date desc, risk_score desc'

    name = fields.Char(string="Assessment Reference", required=True, copy=False, default=lambda self: _('New'))
    employee_id = fields.Many2one('hr.employee', string="Employee", required=True, ondelete='cascade')
    department_id = fields.Many2one('hr.department', string="Department", related='employee_id.department_id', store=True)
    assessment_date = fields.Datetime(string="Assessment Date", default=fields.Datetime.now, required=True)

    risk_score = fields.Integer(string="Risk Score (0–100)", required=True, default=15)
    risk_level = fields.Selection([
        ('low', 'LOW (0–39)'),
        ('medium', 'MEDIUM (40–69)'),
        ('high', 'HIGH (70–100)')
    ], string="Risk Tier", compute='_compute_risk_level', store=True)

    # Explainable Component Scores
    attendance_penalty = fields.Float(string="Attendance Deficiency Penalty", default=0.0)
    absence_penalty = fields.Float(string="Unscheduled Absence Penalty", default=0.0)
    punctuality_penalty = fields.Float(string="Late Check-in Penalty", default=0.0)
    leave_intensity_penalty = fields.Float(string="Leave Frequency Penalty", default=0.0)
    trend_penalty = fields.Float(string="Declining Velocity Penalty", default=0.0)

    reasons = fields.Text(string="Identified Contributing Factors", required=True)
    recommendation = fields.Text(string="Prescriptive HR Action Plan", required=True)
    is_latest = fields.Boolean(string="Latest Assessment", default=True)

    @api.depends('risk_score')
    def _compute_risk_level(self):
        for rec in self:
            score = rec.risk_score or 0
            if score >= 70:
                rec.risk_level = 'high'
            elif score >= 40:
                rec.risk_level = 'medium'
            else:
                rec.risk_level = 'low'

    @api.model_create_multi
    def create(self, vals_list):
        for vals in vals_list:
            if vals.get('name', _('New')) == _('New'):
                vals['name'] = self.env['ir.sequence'].next_by_code('dayflow.workforce.risk') or _('WRA-%s') % fields.Datetime.now().strftime('%Y%m%d%H%M')
        return super(DayflowWorkforceRisk, self).create(vals_list)
