# -*- coding: utf-8 -*-
from odoo import models, api, _

class DayflowLeaveImpactEngine(models.AbstractModel):
    _name = 'dayflow.leave.impact.engine'
    _description = 'Dayflow Smart Leave Capacity & Overlap Analyzer'

    @api.model
    def analyze_leave_impact(self, employee_id, date_from, date_to, exclude_leave_id=None):
        employee = self.env['hr.employee'].browse(employee_id)
        if not employee.exists():
            return {
                'impact_level': 'low',
                'dept_total_employees': 0,
                'dept_current_available': 0,
                'dept_projected_available': 0,
                'current_availability_pct': 100.0,
                'projected_availability_pct': 100.0,
                'has_overlap_warning': False,
                'overlap_count': 0,
                'overlapping_employees': [],
                'recommendation': "No employee found."
            }

        department = employee.department_id
        if not department:
            return {
                'impact_level': 'low',
                'dept_total_employees': 1,
                'dept_current_available': 1,
                'dept_projected_available': 0,
                'current_availability_pct': 100.0,
                'projected_availability_pct': 0.0,
                'has_overlap_warning': False,
                'overlap_count': 0,
                'overlapping_employees': [],
                'recommendation': "Employee has no assigned department."
            }

        dept_members = self.env['hr.employee'].search([('department_id', '=', department.id), ('active', '=', True)])
        total_members = len(dept_members)
        if total_members == 0:
            total_members = 1

        # Search overlapping leaves in the department
        domain = [
            ('department_id', '=', department.id),
            ('employee_id', '!=', employee.id),
            ('state', 'in', ['confirm', 'validate', 'validate1']),
            ('date_from', '<=', date_to),
            ('date_to', '>=', date_from)
        ]
        if exclude_leave_id:
            domain.append(('id', '!=', exclude_leave_id))

        overlapping_leaves = self.env['hr.leave'].search(domain)
        overlapping_emps = list(set([l.employee_id for l in overlapping_leaves if l.employee_id]))
        overlap_count = len(overlapping_emps)

        currently_available = max(0, total_members - overlap_count)
        projected_available = max(0, currently_available - 1)

        curr_pct = round((currently_available / float(total_members)) * 100.0, 1)
        proj_pct = round((projected_available / float(total_members)) * 100.0, 1)

        overlap_names = [e.name for e in overlapping_emps]

        if proj_pct < 55.0 or overlap_count >= 2:
            impact_level = 'high'
            rec = (
                f"HIGH RISK IMPACT: Projected department capacity will drop to {proj_pct}% "
                f"({projected_available}/{total_members} team members active). "
                f"Concurrent leaves detected for: {', '.join(overlap_names) if overlap_names else 'multiple peers'}. "
                "Urgent: Check sprint deadlines and customer coverage prior to authorization."
            )
        elif proj_pct < 75.0 or overlap_count == 1:
            impact_level = 'medium'
            rec = (
                f"MODERATE IMPACT: Projected department availability will be {proj_pct}%. "
                f"1 colleague ({', '.join(overlap_names)}) already on leave. "
                "Verify task delegation."
            )
        else:
            impact_level = 'low'
            rec = (
                f"LOW IMPACT: Department remains well-staffed at {proj_pct}% capacity "
                f"({projected_available}/{total_members} members on duty). Standard approval permitted."
            )

        return {
            'department_name': department.name,
            'impact_level': impact_level,
            'dept_total_employees': total_members,
            'dept_current_available': currently_available,
            'dept_projected_available': projected_available,
            'current_availability_pct': curr_pct,
            'projected_availability_pct': proj_pct,
            'has_overlap_warning': (overlap_count > 0),
            'overlap_count': overlap_count,
            'overlapping_employees': overlap_names,
            'recommendation': rec
        }
