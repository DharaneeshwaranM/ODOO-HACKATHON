# -*- coding: utf-8 -*-
from odoo.tests.common import TransactionCase
from datetime import datetime, timedelta

class TestDayflowAuth(TransactionCase):

    def setUp(self):
        super(TestDayflowAuth, self).setUp()
        self.Employee = self.env['hr.employee']
        self.Users = self.env['res.users']

    def test_01_create_employee_with_verification_token(self):
        """Test employee creation with verification token and expiry"""
        emp = self.Employee.create({
            'name': 'Test Registration User',
            'work_email': 'test.user@dayflow.demo',
            'employee_badge_id': 'TEST-9901',
            'is_email_verified': False,
            'verification_token': 'secret_token_1234567890',
            'token_expiry': datetime.now() + timedelta(hours=24),
            'user_role': 'employee',
        })
        self.assertTrue(emp.id)
        self.assertFalse(emp.is_email_verified)
        self.assertEqual(emp.employee_badge_id, 'TEST-9901')

    def test_02_verify_email_activation(self):
        """Test email verification activation logic"""
        emp = self.Employee.create({
            'name': 'Pending Verified User',
            'work_email': 'pending.user@dayflow.demo',
            'employee_badge_id': 'TEST-9902',
            'is_email_verified': False,
            'verification_token': 'token_to_verify',
            'token_expiry': datetime.now() + timedelta(hours=24),
        })

        # Simulate controller verify action
        emp.write({'is_email_verified': True, 'verification_token': False})
        self.assertTrue(emp.is_email_verified)
        self.assertFalse(emp.verification_token)
