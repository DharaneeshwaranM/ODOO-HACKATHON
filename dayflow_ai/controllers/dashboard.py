# -*- coding: utf-8 -*-
from odoo import http, _
from odoo.http import request

class DayflowDashboardController(http.Controller):

    @http.route('/dayflow/dashboard/data', type='json', auth='user', methods=['POST'])
    def get_dashboard_data(self, department_id=None, days=30, **kwargs):
        """Fetches comprehensive real-time dashboard data for OWL frontend"""
        user = request.env.user
        is_hr = user.has_group('hr.group_hr_user') or user.has_group('hr.group_hr_manager')

        # If pure employee, return only employee personalized dashboard
        if not is_hr:
            employee = request.env['hr.employee'].sudo().search([('user_id', '=', user.id)], limit=1)
            if not employee:
                return {'error': 'No linked employee profile found.'}

            # Return employee private payload
            return {
                'role': 'employee',
                'employee': {
                    'id': employee.id,
                    'name': employee.name,
                    'badge_id': employee.employee_badge_id,
                    'department': employee.department_id.name if employee.department_id else 'Unassigned',
                    'job_title': employee.job_title or 'Employee',
                    'work_email': employee.work_email,
                    'work_phone': employee.work_phone or '',
                    'attendance_rate': employee.attendance_rate,
                    'absence_count': employee.absence_count,
                    'leave_count': employee.leave_count,
                    'monthly_wage': employee.monthly_wage,
                    'hra_allowance': employee.hra_allowance,
                    'special_allowance': employee.special_allowance,
                }
            }

        # HR / Admin Organization-wide Intelligence Payload
        att_analyzer = request.env['dayflow.attendance.analyzer']
        dept_analyzer = request.env['dayflow.department.analyzer']
        trend_analyzer = request.env['dayflow.trend.analyzer']

        company_summary = att_analyzer.get_company_attendance_summary()
        dept_data = dept_analyzer.get_all_department_intelligence()
        trend_series = att_analyzer.get_attendance_trend_data(days=days)
        insights = trend_analyzer.generate_trend_insights()

        # Risk distribution query
        low_risk_count = request.env['hr.employee'].search_count([('risk_score', '<', 40)])
        medium_risk_count = request.env['hr.employee'].search_count([('risk_score', '>=', 40), ('risk_score', '<', 70)])
        high_risk_count = request.env['hr.employee'].search_count([('risk_score', '>=', 70)])

        # Calculate workforce health index
        workforce_health = int(round(
            0.40 * company_summary['availability_pct'] +
            0.35 * company_summary['attendance_pct'] +
            0.25 * max(0, 100 - (high_risk_count * 4.5))
        ))
        workforce_health = max(0, min(100, workforce_health))

        # Recent alerts
        alerts_records = request.env['dayflow.workforce.alert'].search([('is_dismissed', '=', False)], limit=6)
        alerts = [{
            'id': a.id,
            'title': a.title,
            'alert_type': a.alert_type,
            'severity': a.severity,
            'employee_name': a.employee_id.name if a.employee_id else '',
            'dept_name': a.department_id.name if a.department_id else '',
            'reason': a.reason,
            'recommended_action': a.recommended_action,
            'is_read': a.is_read,
            'create_date': a.create_date.strftime('%b %d, %H:%M') if a.create_date else '',
        } for a in alerts_records]

        # Top attention employees
        attention_emps = request.env['hr.employee'].search([('risk_score', '>=', 65)], order='risk_score desc', limit=8)
        attention_list = [{
            'id': e.id,
            'name': e.name,
            'department': e.department_id.name if e.department_id else 'General',
            'job_title': e.job_title or 'Specialist',
            'risk_score': e.risk_score,
            'risk_level': e.risk_level,
            'attendance_rate': e.attendance_rate,
            'absences': e.absence_count,
            'late_checkins': e.late_checkin_count,
            'trend': e.attendance_trend,
            'reasons': e.risk_reasons or '',
            'recommendation': e.risk_recommendation or '',
        } for e in attention_emps]

        return {
            'role': 'hr',
            'kpi': {
                'workforce_health': workforce_health,
                'total_employees': company_summary['total_employees'],
                'present_today': company_summary['present_count'],
                'on_leave_today': company_summary['on_leave_count'],
                'absent_today': company_summary['absent_count'],
                'late_today': company_summary['late_count'],
                'attendance_pct': company_summary['attendance_pct'],
                'availability_pct': company_summary['availability_pct'],
                'high_risk_count': high_risk_count,
                'medium_risk_count': medium_risk_count,
                'low_risk_count': low_risk_count,
            },
            'departments': dept_data,
            'trend_series': trend_series,
            'alerts': alerts,
            'insights': insights,
            'attention_employees': attention_list,
        }
