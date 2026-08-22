# -*- coding: utf-8 -*-
from odoo.tests.common import TransactionCase
from datetime import datetime, timedelta

class TestDayflowLeave(TransactionCase):

    def setUp(self):
        super(TestDayflowLeave, self).setUp()
        self.Department = self.env['hr.department']
        self.Employee = self.env['hr.employee']
        self.LeaveImpactEngine = self.env['dayflow.leave.impact.engine']

    def test_01_leave_impact_and_overlap(self):
        dept = self.Department.create({'name': 'QA Department'})
        emp1 = self.Employee.create({'name': 'QA Eng 1', 'department_id': dept.id})
        emp2 = self.Employee.create({'name': 'QA Eng 2', 'department_id': dept.id})

        impact = self.LeaveImpactEngine.analyze_leave_impact(
            employee_id=emp1.id,
            date_from=datetime.now().strftime('%Y-%m-%d 09:00:00'),
            date_to=(datetime.now() + timedelta(days=3)).strftime('%Y-%m-%d 18:00:00'),
        )
        self.assertIn('projected_availability_pct', impact)
        self.assertIn('impact_level', impact)
        self.assertTrue(impact['dept_total_employees'] >= 1)
