# -*- coding: utf-8 -*-
from odoo.tests.common import TransactionCase
from odoo.exceptions import AccessError

class TestDayflowSecurity(TransactionCase):

    def setUp(self):
        super(TestDayflowSecurity, self).setUp()
        self.Users = self.env['res.users']
        self.Employee = self.env['hr.employee']
        self.RiskModel = self.env['dayflow.workforce.risk']

        self.group_emp = self.env.ref('dayflow_ai.group_dayflow_employee')
        self.group_hr = self.env.ref('dayflow_ai.group_dayflow_hr')

        # Create Standard Employee User
        self.user_employee = self.Users.create({
            'name': 'Standard Employee User',
            'login': 'std.emp@dayflow.demo',
            'groups_id': [(6, 0, [self.group_emp.id])],
        })

        # Create HR Admin User
        self.user_hr = self.Users.create({
            'name': 'HR Admin User',
            'login': 'hr.admin@dayflow.demo',
            'groups_id': [(6, 0, [self.group_hr.id])],
        })

    def test_01_employee_cannot_access_workforce_risk_model(self):
        """Standard employees must be forbidden from accessing raw workforce risk models"""
        with self.assertRaises(AccessError):
            self.RiskModel.with_user(self.user_employee).search([])

    def test_02_hr_can_access_workforce_risk_model(self):
        """HR users must have read access to workforce risk records"""
        records = self.RiskModel.with_user(self.user_hr).search([])
        self.assertIsNotNone(records)
