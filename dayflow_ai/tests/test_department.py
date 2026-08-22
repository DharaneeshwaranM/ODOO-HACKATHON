# -*- coding: utf-8 -*-
from odoo.tests.common import TransactionCase

class TestDayflowDepartment(TransactionCase):

    def setUp(self):
        super(TestDayflowDepartment, self).setUp()
        self.Department = self.env['hr.department']
        self.Employee = self.env['hr.employee']

    def test_01_department_workforce_health(self):
        dept = self.Department.create({'name': 'Design Studio'})
        emp = self.Employee.create({
            'name': 'Lead Designer',
            'department_id': dept.id,
            'risk_score': 15,
        })
        dept._compute_department_intelligence()
        self.assertEqual(dept.total_staff, 1)
        self.assertTrue(0 <= dept.workforce_health_score <= 100)
