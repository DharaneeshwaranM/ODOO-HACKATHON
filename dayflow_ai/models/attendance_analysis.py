# -*- coding: utf-8 -*-
from odoo import models, fields, api, _

class DayflowAttendanceAnalysis(models.Model):
    _name = 'dayflow.attendance.analysis'
    _description = 'Dayflow Aggregated Attendance Analysis'
    _auto = False
    _order = 'analysis_date desc'

    employee_id = fields.Many2one('hr.employee', string="Employee", readonly=True)
    department_id = fields.Many2one('hr.department', string="Department", readonly=True)
    analysis_date = fields.Date(string="Date", readonly=True)
    total_hours = fields.Float(string="Hours Worked", readonly=True)
    status = fields.Selection([
        ('present', 'Present'),
        ('late', 'Late Arrival'),
        ('half_day', 'Half Day'),
        ('absent', 'Absent'),
        ('leave', 'On Approved Leave')
    ], string="Status", readonly=True)
    is_late = fields.Boolean(string="Late Check-in", readonly=True)
    late_minutes = fields.Integer(string="Late Minutes", readonly=True)

    def init(self):
        self._cr.execute("""
            CREATE OR REPLACE VIEW dayflow_attendance_analysis AS (
                SELECT
                    att.id AS id,
                    att.employee_id AS employee_id,
                    emp.department_id AS department_id,
                    att.check_in::date AS analysis_date,
                    COALESCE(att.working_hours_actual, 8.0) AS total_hours,
                    COALESCE(att.status, 'present') AS status,
                    COALESCE(att.is_late, false) AS is_late,
                    COALESCE(att.late_minutes, 0) AS late_minutes
                FROM hr_attendance att
                JOIN hr_employee emp ON att.employee_id = emp.id
            )
        """)
