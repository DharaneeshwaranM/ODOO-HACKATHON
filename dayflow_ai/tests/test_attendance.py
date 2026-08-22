# -*- coding: utf-8 -*-
from odoo.tests.common import TransactionCase
from datetime import datetime

class TestDayflowAttendance(TransactionCase):

    def setUp(self):
        super(TestDayflowAttendance, self).setUp()
        self.Employee = self.env['hr.employee']
        self.Attendance = self.env['hr.attendance']

    def test_01_attendance_status_calculation(self):
        emp = self.Employee.create({'name': 'Attendance Tester'})
        # Create standard on-time attendance
        att = self.Attendance.create({
            'employee_id': emp.id,
            'check_in': datetime.now().strftime('%Y-%m-%d 08:45:00'),
            'check_out': datetime.now().strftime('%Y-%m-%d 17:00:00'),
        })
        self.assertEqual(att.status, 'present')
        self.assertFalse(att.is_late)
