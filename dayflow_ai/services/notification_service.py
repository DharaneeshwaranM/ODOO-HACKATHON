# -*- coding: utf-8 -*-
from odoo import models, api, _

class DayflowNotificationService(models.AbstractModel):
    _name = 'dayflow.notification.service'
    _description = 'Dayflow Multi-Channel Notification Orchestrator'

    @api.model
    def notify_leave_status_change(self, leave_record, status_type):
        """Send email & in-app notification when leave is approved, rejected, or submitted"""
        if status_type == 'submitted':
            template = self.env.ref('dayflow_ai.mail_template_leave_submitted', raise_if_not_found=False)
            if template and leave_record.department_id and leave_record.department_id.manager_id and leave_record.department_id.manager_id.work_email:
                template.send_mail(leave_record.id, force_send=True)
        elif status_type == 'approved':
            template = self.env.ref('dayflow_ai.mail_template_leave_approved', raise_if_not_found=False)
            if template and leave_record.employee_id.work_email:
                template.send_mail(leave_record.id, force_send=True)
        elif status_type == 'rejected':
            template = self.env.ref('dayflow_ai.mail_template_leave_rejected', raise_if_not_found=False)
            if template and leave_record.employee_id.work_email:
                template.send_mail(leave_record.id, force_send=True)

    @api.model
    def create_workforce_alert(self, title, alert_type, severity, reason, recommended_action, employee_id=False, department_id=False):
        return self.env['dayflow.workforce.alert'].create({
            'title': title,
            'alert_type': alert_type,
            'severity': severity,
            'employee_id': employee_id,
            'department_id': department_id,
            'reason': reason,
            'recommended_action': recommended_action,
        })
