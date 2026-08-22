# -*- coding: utf-8 -*-
from odoo import models, fields, api, _

class DayflowHrInsight(models.Model):
    _name = 'dayflow.hr.insight'
    _description = 'Dayflow AI HR Insight'
    _order = 'confidence_score desc, create_date desc'

    headline = fields.Char(string="Insight Headline", required=True)
    category = fields.Selection([
        ('department', 'Department Performance'),
        ('attendance', 'Attendance Velocity'),
        ('capacity', 'Workforce Capacity'),
        ('retention', 'Workforce Risk & Stability'),
        ('payroll', 'Compensation & Overtime')
    ], string="Intelligence Category", required=True, default='attendance')

    impact_scope = fields.Selection([
        ('positive', 'Positive Indicator'),
        ('neutral', 'Informational'),
        ('warning', 'Action Required'),
        ('critical', 'Severe Risk')
    ], string="Scope", default='warning', required=True)

    metric_evidence = fields.Char(string="Empirical Metric Evidence", help="e.g. Sales attendance 74% vs Company average 91%")
    description = fields.Text(string="Insight Narrative", required=True)
    recommended_action = fields.Text(string="Actionable Recommendation", required=True)
    department_id = fields.Many2one('hr.department', string="Department Scope")
    confidence_score = fields.Float(string="Calculation Confidence", default=95.0)
    is_active = fields.Boolean(string="Active Insight", default=True)
