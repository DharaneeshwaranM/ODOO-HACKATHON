# -*- coding: utf-8 -*-
from odoo import models, api, _
from datetime import datetime, timedelta, date

class DayflowRiskService(models.AbstractModel):
    _name = 'dayflow.risk.service'
    _description = 'Dayflow Explainable Workforce Risk Scoring Service'

    @api.model
    def calculate_risk_score(self, employee, attendance_records=None, leave_records=None):
        """
        Deterministic, explainable rule-based scoring engine.
        Returns a dictionary:
        {
            'score': int (0-100),
            'level': 'low' | 'medium' | 'high',
            'penalties': {
                'attendance': float,
                'absence': float,
                'punctuality': float,
                'leave': float,
                'trend': float
            },
            'reasons': list of strings,
            'recommendation': string
        }
        """
        today = date.today()
        thirty_days_ago = today - timedelta(days=30)
        ninety_days_ago = today - timedelta(days=90)

        # Retrieve attendances if not supplied
        if attendance_records is None:
            attendance_records = self.env['hr.attendance'].search([
                ('employee_id', '=', employee.id),
                ('check_in', '>=', fields.Datetime.to_string(datetime.combine(thirty_days_ago, datetime.min.time())))
            ])

        # Retrieve leaves if not supplied
        if leave_records is None:
            leave_records = self.env['hr.leave'].search([
                ('employee_id', '=', employee.id),
                ('state', 'in', ['confirm', 'validate']),
                ('date_from', '>=', fields.Datetime.to_string(datetime.combine(ninety_days_ago, datetime.min.time())))
            ])

        total_working_days_30 = 22 # standard business working days in 30 days
        actual_present_days = len(set([fields.Datetime.to_datetime(a.check_in).date() for a in attendance_records if a.check_in]))
        late_checkins = sum(1 for a in attendance_records if getattr(a, 'is_late', False) or (a.check_in and fields.Datetime.context_timestamp(a, a.check_in).hour >= 9 and fields.Datetime.context_timestamp(a, a.check_in).minute > 15))

        # Attendance calculation
        attendance_rate = min(100.0, round((actual_present_days / float(total_working_days_30)) * 100.0, 1)) if total_working_days_30 > 0 else 100.0
        absences = max(0, total_working_days_30 - actual_present_days)
        leave_count = len(leave_records)

        # Baseline starting risk: 10 points base buffer
        raw_risk = 10.0
        reasons = []
        penalties = {
            'attendance': 0.0,
            'absence': 0.0,
            'punctuality': 0.0,
            'leave': 0.0,
            'trend': 0.0
        }

        # 1. Attendance Rate Penalty (0 to 35 points)
        if attendance_rate < 60.0:
            p = 35.0
            reasons.append(f"Severe attendance deficit ({attendance_rate}% in past 30 days vs 90% benchmark)")
        elif attendance_rate < 75.0:
            p = 25.0
            reasons.append(f"Sub-optimal attendance rate ({attendance_rate}%)")
        elif attendance_rate < 85.0:
            p = 15.0
            reasons.append(f"Attendance rate ({attendance_rate}%) below team target (90%)")
        elif attendance_rate < 92.0:
            p = 5.0
        else:
            p = 0.0
        penalties['attendance'] = p
        raw_risk += p

        # 2. Unscheduled Absence Penalty (0 to 25 points)
        if absences >= 6:
            p = 25.0
            reasons.append(f"High unscheduled absences ({absences} days absent in 30 days)")
        elif absences >= 4:
            p = 18.0
            reasons.append(f"Frequent unscheduled absence pattern ({absences} days)")
        elif absences >= 2:
            p = 8.0
            reasons.append(f"Moderate absence occurrences ({absences} days)")
        else:
            p = 0.0
        penalties['absence'] = p
        raw_risk += p

        # 3. Punctuality / Late Check-in Penalty (0 to 20 points)
        if late_checkins >= 7:
            p = 20.0
            reasons.append(f"Chronic late arrival pattern ({late_checkins} late check-ins in 30 days)")
        elif late_checkins >= 4:
            p = 12.0
            reasons.append(f"Recurring late check-ins ({late_checkins} instances recorded)")
        elif late_checkins >= 2:
            p = 6.0
            reasons.append(f"Occasional late arrival ({late_checkins} instances)")
        else:
            p = 0.0
        penalties['punctuality'] = p
        raw_risk += p

        # 4. Leave Load & Frequency Penalty (0 to 15 points)
        if leave_count >= 5:
            p = 15.0
            reasons.append(f"Intense leave request velocity ({leave_count} requests in 90 days)")
        elif leave_count >= 3:
            p = 8.0
            reasons.append(f"Elevated leave frequency ({leave_count} requests)")
        else:
            p = 0.0
        penalties['leave'] = p
        raw_risk += p

        # 5. Trend Analysis Penalty (0 to 15 points)
        trend = getattr(employee, 'attendance_trend', 'stable')
        if trend == 'declining':
            p = 12.0
            reasons.append("Consecutive declining weekly attendance velocity detected")
        elif trend == 'improving':
            p = -8.0 # Positive recovery discount
        else:
            p = 0.0
        penalties['trend'] = p
        raw_risk += p

        # Cap score between 0 and 100
        final_score = int(round(max(5.0, min(100.0, raw_risk))))

        if final_score >= 70:
            level = 'high'
            recommendation = (
                "Priority 1: Schedule an informal 1-on-1 HR check-in to evaluate workload and team burnout. "
                "Assess shift scheduling bottlenecks and check for personal circumstance constraints."
            )
        elif final_score >= 40:
            level = 'medium'
            recommendation = (
                "Priority 2: Review upcoming project deliverables and monitor attendance over the next 14 business days. "
                "Verify if punctuality is tied to transport or commute factors."
            )
        else:
            level = 'low'
            recommendation = "Employee maintains consistent attendance and steady workforce engagement. No HR intervention required."
            if not reasons:
                reasons.append("Consistent punctuality, solid attendance rate, and balanced leave utilization.")

        return {
            'score': final_score,
            'level': level,
            'penalties': penalties,
            'reasons': reasons,
            'recommendation': recommendation,
            'attendance_rate': attendance_rate,
            'absences': absences,
            'late_checkins': late_checkins,
            'leave_count': leave_count
        }

    @api.model
    def recalculate_employee_risk(self, employee):
        """Calculates and writes risk data back to employee & creates history entry"""
        result = self.calculate_risk_score(employee)
        employee.write({
            'risk_score': result['score'],
            'attendance_rate': result['attendance_rate'],
            'absence_count': result['absences'],
            'late_checkin_count': result['late_checkins'],
            'leave_count': result['leave_count'],
            'risk_reasons': "\n".join([f"• {r}" for r in result['reasons']]),
            'risk_recommendation': result['recommendation'],
        })

        # Save historical assessment record
        self.env['dayflow.workforce.risk'].create({
            'employee_id': employee.id,
            'risk_score': result['score'],
            'attendance_penalty': result['penalties']['attendance'],
            'absence_penalty': result['penalties']['absence'],
            'punctuality_penalty': result['penalties']['punctuality'],
            'leave_intensity_penalty': result['penalties']['leave'],
            'trend_penalty': result['penalties']['trend'],
            'reasons': "\n".join([f"• {r}" for r in result['reasons']]),
            'recommendation': result['recommendation'],
        })

        # If high risk, trigger proactive alert
        if result['score'] >= 70:
            self.env['dayflow.workforce.alert'].create({
                'title': f"High Workforce Risk: {employee.name} (Score {result['score']})",
                'alert_type': 'HIGH_RISK_EMPLOYEE',
                'severity': 'high' if result['score'] < 85 else 'critical',
                'employee_id': employee.id,
                'department_id': employee.department_id.id if employee.department_id else False,
                'reason': f"Risk score reached {result['score']}/100. Primary drivers: {', '.join(result['reasons'][:2])}",
                'recommended_action': result['recommendation'],
            })

        return result
