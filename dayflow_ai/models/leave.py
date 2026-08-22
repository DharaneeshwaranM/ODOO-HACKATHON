# -*- coding: utf-8 -*-
from odoo import models, fields, api, _
from odoo.exceptions import UserError
from datetime import datetime, timedelta

class HrLeave(models.Model):
    _inherit = 'hr.leave'

    # Smart Leave Impact Intelligence
    impact_level = fields.Selection([
        ('low', 'LOW IMPACT'),
        ('medium', 'MEDIUM IMPACT'),
        ('high', 'HIGH IMPACT')
    ], string="Workforce Impact Level", compute='_compute_leave_impact', store=True, default='low')

    dept_total_employees = fields.Integer(string="Dept Headcount", compute='_compute_leave_impact', store=True)
    dept_current_available = fields.Integer(string="Currently Available", compute='_compute_leave_impact', store=True)
    dept_projected_available = fields.Integer(string="Projected Available", compute='_compute_leave_impact', store=True)
    current_availability_pct = fields.Float(string="Current Availability %", compute='_compute_leave_impact', store=True)
    projected_availability_pct = fields.Float(string="Projected Availability %", compute='_compute_leave_impact', store=True)

    # Overlap Warning
    has_overlap_warning = fields.Boolean(string="Overlap Warning", compute='_compute_leave_impact', store=True)
    overlap_count = fields.Integer(string="Overlapping Colleague Leaves", compute='_compute_leave_impact', store=True)
    overlapping_employees_str = fields.Char(string="Overlapping Employees", compute='_compute_leave_impact', store=True)
    impact_recommendation = fields.Text(string="AI Recommendation", compute='_compute_leave_impact', store=True)

    @api.depends('employee_id', 'date_from', 'date_to', 'state')
    def _compute_leave_impact(self):
        for leave in self:
            if not leave.employee_id or not leave.date_from or not leave.date_to:
                leave.impact_level = 'low'
                leave.dept_total_employees = 0
                leave.dept_current_available = 0
                leave.dept_projected_available = 0
                leave.current_availability_pct = 100.0
                leave.projected_availability_pct = 100.0
                leave.has_overlap_warning = False
                leave.overlap_count = 0
                leave.overlapping_employees_str = ""
                leave.impact_recommendation = "Standard leave request. No capacity constraint."
                continue

            dept = leave.employee_id.department_id
            if not dept:
                leave.impact_level = 'low'
                leave.dept_total_employees = 1
                leave.dept_current_available = 1
                leave.dept_projected_available = 0
                leave.current_availability_pct = 100.0
                leave.projected_availability_pct = 0.0
                leave.has_overlap_warning = False
                leave.overlap_count = 0
                leave.overlapping_employees_str = ""
                leave.impact_recommendation = "Employee has no assigned department."
                continue

            # Query department members
            all_dept_members = self.env['hr.employee'].search([('department_id', '=', dept.id)])
            total_dept_count = len(all_dept_members)
            if total_dept_count == 0:
                total_dept_count = 1

            # Query already approved or validating leaves within target date window
            overlapping_leaves = self.env['hr.leave'].search([
                ('department_id', '=', dept.id),
                ('id', '!=', leave.id if leave.id else False),
                ('employee_id', '!=', leave.employee_id.id),
                ('state', 'in', ['confirm', 'validate', 'validate1']),
                ('date_from', '<=', leave.date_to),
                ('date_to', '>=', leave.date_from)
            ])

            overlapping_emp_names = list(set([l.employee_id.name for l in overlapping_leaves if l.employee_id]))
            already_absent_count = len(overlapping_emp_names)
            currently_available = max(0, total_dept_count - already_absent_count)
            projected_available = max(0, currently_available - 1)

            curr_pct = round((currently_available / float(total_dept_count)) * 100.0, 1)
            proj_pct = round((projected_available / float(total_dept_count)) * 100.0, 1)

            leave.dept_total_employees = total_dept_count
            leave.dept_current_available = currently_available
            leave.dept_projected_available = projected_available
            leave.current_availability_pct = curr_pct
            leave.projected_availability_pct = proj_pct
            leave.overlap_count = already_absent_count
            leave.overlapping_employees_str = ", ".join(overlapping_emp_names) if overlapping_emp_names else ""
            leave.has_overlap_warning = (already_absent_count > 0)

            # Impact determination rule:
            # Low: projected >= 75%
            # Medium: 55% <= projected < 75%
            # High: projected < 55% or multiple overlap
            if proj_pct < 55.0 or already_absent_count >= 2:
                leave.impact_level = 'high'
                leave.impact_recommendation = (
                    f"CRITICAL: Projected department availability drops to {proj_pct}% "
                    f"({projected_available}/{total_dept_count} available). "
                    f"Concurrent leaves with: {leave.overlapping_employees_str or 'Multiple members'}. "
                    "Review critical project coverage before approving."
                )
            elif proj_pct < 75.0 or already_absent_count == 1:
                leave.impact_level = 'medium'
                leave.impact_recommendation = (
                    f"MODERATE IMPACT: Projected availability drops to {proj_pct}%. "
                    f"1 overlapping colleague ({leave.overlapping_employees_str}). "
                    "Ensure secondary backup is assigned."
                )
            else:
                leave.impact_level = 'low'
                leave.impact_recommendation = (
                    f"HEALTHY COVERAGE: Projected availability remains solid at {proj_pct}% "
                    f"({projected_available}/{total_dept_count} staff active). Safe for approval."
                )

    def action_approve(self):
        res = super(HrLeave, self).action_approve()
        # Trigger email notification to employee
        for leave in self:
            template = self.env.ref('dayflow_ai.mail_template_leave_approved', raise_if_not_found=False)
            if template and leave.employee_id.work_email:
                template.send_mail(leave.id, force_send=True)
        return res

    def action_refuse(self):
        res = super(HrLeave, self).action_refuse()
        # Trigger email notification to employee
        for leave in self:
            template = self.env.ref('dayflow_ai.mail_template_leave_rejected', raise_if_not_found=False)
            if template and leave.employee_id.work_email:
                template.send_mail(leave.id, force_send=True)
        return res
