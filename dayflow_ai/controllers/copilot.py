# -*- coding: utf-8 -*-
from odoo import http, _
from odoo.http import request

class DayflowCopilotController(http.Controller):

    @http.route('/dayflow/copilot/query', type='json', auth='user', methods=['POST'])
    def query(self, prompt, context_data=None, **kwargs):
        """AI HR Copilot endpoint for natural language query answering with Odoo ORM integration"""
        user = request.env.user
        if not (user.has_group('hr.group_hr_user') or user.has_group('hr.group_hr_manager')):
            return {'error': 'Access Denied: AI HR Copilot is restricted to HR Administrators.'}

        response = request.env['dayflow.ai.copilot'].process_query(prompt, context_data)
        return response

    @http.route('/dayflow/copilot/suggestions', type='json', auth='user', methods=['GET', 'POST'])
    def get_suggestions(self, **kwargs):
        return {
            'suggestions': request.env['dayflow.ai.copilot'].get_suggested_questions()
        }
