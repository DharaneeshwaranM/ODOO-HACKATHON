# -*- coding: utf-8 -*-
from odoo.tests.common import TransactionCase

class TestDayflowRisk(TransactionCase):

    def setUp(self):
        super(TestDayflowRisk, self).setUp()
        self.Employee = self.env['hr.employee']
        self.RiskService = self.env['dayflow.risk.service']

    def test_01_low_risk_calculation(self):
        """Test calculation for employee with perfect attendance"""
        emp = self.Employee.create({
            'name': 'Low Risk Tester',
            'work_email': 'low.risk@test.com',
            'attendance_rate': 98.0,
            'absence_count': 0,
            'late_checkin_count': 0,
            'attendance_trend': 'stable',
        })
        res = self.RiskService.calculate_risk_score(emp, attendance_records=[], leave_records=[])
        self.assertLess(res['score'], 40)
        self.assertEqual(res['level'], 'low')

    def test_02_high_risk_calculation(self):
        """Test calculation for employee with high absenteeism and late check-ins"""
        emp = self.Employee.create({
            'name': 'High Risk Tester',
            'work_email': 'high.risk@test.com',
            'attendance_rate': 60.0,
            'absence_count': 8,
            'late_checkin_count': 8,
            'attendance_trend': 'declining',
        })
        res = self.RiskService.calculate_risk_score(emp, attendance_records=[], leave_records=[])
        self.assertGreaterEqual(res['score'], 70)
        self.assertEqual(res['level'], 'high')
        self.assertTrue(len(res['reasons']) > 0)
        self.assertTrue(len(res['recommendation']) > 0)

    def test_03_zero_division_resilience(self):
        """Test edge cases with empty records"""
        emp = self.Employee.create({
            'name': 'Edge Case Tester',
            'work_email': 'edge.case@test.com',
        })
        res = self.RiskService.calculate_risk_score(emp, attendance_records=[], leave_records=[])
        self.assertTrue(0 <= res['score'] <= 100)
