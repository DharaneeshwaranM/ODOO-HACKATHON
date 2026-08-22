# -*- coding: utf-8 -*-
from odoo import http, _
from odoo.http import request

class DayflowAnalyticsController(http.Controller):

    @http.route('/dayflow/analytics/leave_impact', type='json', auth='user', methods=['POST'])
    def calculate_leave_impact(self, employee_id, date_from, date_to, leave_id=None, **kwargs):
        """Live endpoint for Smart Leave Impact Analyzer & Overlap Detector"""
        result = request.env['dayflow.leave.impact.engine'].analyze_leave_impact(
            employee_id=employee_id,
            date_from=date_from,
            date_to=date_to,
            exclude_leave_id=leave_id
        )
        return result

    @http.route('/dayflow/analytics/recalculate_employee_risk', type='json', auth='user', methods=['POST'])
    def recalculate_risk(self, employee_id, **kwargs):
        """Trigger risk engine recalculation for specific employee"""
        employee = request.env['hr.employee'].browse(employee_id)
        if not employee.exists():
            return {'error': 'Employee not found.'}

        result = request.env['dayflow.risk.service'].recalculate_employee_risk(employee)
        return result

    @http.route('/dayflow/analytics/alerts/mark_read', type='json', auth='user', methods=['POST'])
    def mark_alert_read(self, alert_id, **kwargs):
        alert = request.env['dayflow.workforce.alert'].browse(alert_id)
        if alert.exists():
            alert.action_mark_read()
            return {'success': True}
        return {'error': 'Alert not found'}
