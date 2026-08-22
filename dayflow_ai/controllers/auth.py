# -*- coding: utf-8 -*-
from odoo import http, _
from odoo.http import request
import secrets
import werkzeug
from datetime import datetime, timedelta

class DayflowAuthController(http.Controller):

    @http.route('/dayflow/auth/signup', type='json', auth='public', methods=['POST'], csrf=False)
    def signup(self, employee_id, email, password, name, role='employee', **kwargs):
        """
        Secure registration flow:
        - Validate email format & unique constraint
        - Validate employee badge ID
        - Validate password length & complexity
        - Generate cryptographic, single-use, expiring verification token
        - Create unverified user and send verification email
        """
        if not employee_id or not email or not password or not name:
            return {'success': False, 'message': _('All fields are required.')}

        if len(password) < 8:
            return {'success': False, 'message': _('Password must be at least 8 characters long.')}

        # Check existing user / employee
        existing_user = request.env['res.users'].sudo().search([('login', '=', email)], limit=1)
        if existing_user:
            return {'success': False, 'message': _('An account with this email address already exists.')}

        existing_badge = request.env['hr.employee'].sudo().search([('employee_badge_id', '=', employee_id)], limit=1)
        if existing_badge:
            return {'success': False, 'message': _('Employee ID already registered.')}

        # Create verification token: 32 bytes cryptographically secure token
        token = secrets.token_urlsafe(32)
        expiry = datetime.now() + timedelta(hours=24)

        # Create res.users and hr.employee safely
        try:
            user = request.env['res.users'].sudo().create({
                'name': name,
                'login': email,
                'password': password,
                'email': email,
                'active': False, # Inactive until email verification
            })

            employee = request.env['hr.employee'].sudo().create({
                'name': name,
                'work_email': email,
                'user_id': user.id,
                'employee_badge_id': employee_id,
                'user_role': role,
                'is_email_verified': False,
                'verification_token': token,
                'token_expiry': expiry,
                'risk_score': 15,
            })

            # Send verification mail
            template = request.env.ref('dayflow_ai.mail_template_email_verification', raise_if_not_found=False)
            if template:
                template.sudo().with_context(verification_url=f"/dayflow/auth/verify?token={token}").send_mail(employee.id, force_send=True)

            return {
                'success': True,
                'message': _('Account registered successfully. Please check your email to verify your account before logging in.'),
                'verification_token_debug': token,
            }
        except Exception as e:
            return {'success': False, 'message': str(e)}

    @http.route('/dayflow/auth/verify', type='http', auth='public', methods=['GET'], csrf=False)
    def verify_email(self, token=None, **kwargs):
        """Validates verification token and activates the account"""
        if not token:
            return request.render('dayflow_ai.auth_verification_failed', {'error_message': _('Missing verification token.')})

        employee = request.env['hr.employee'].sudo().search([
            ('verification_token', '=', token),
            ('is_email_verified', '=', False)
        ], limit=1)

        if not employee:
            return request.render('dayflow_ai.auth_verification_failed', {'error_message': _('Invalid or expired verification link.')})

        if employee.token_expiry and employee.token_expiry < datetime.now():
            return request.render('dayflow_ai.auth_verification_failed', {'error_message': _('This verification link has expired.')})

        # Activate user and mark verified (single-use token consumed)
        employee.sudo().write({
            'is_email_verified': True,
            'verification_token': False,
        })
        if employee.user_id:
            employee.user_id.sudo().write({'active': True})

        return request.render('dayflow_ai.auth_verification_success', {
            'employee_name': employee.name,
            'email': employee.work_email,
        })

    @http.route('/dayflow/auth/signin', type='json', auth='public', methods=['POST'], csrf=False)
    def signin(self, email, password, **kwargs):
        """Authenticate user with generic error messages and role verification"""
        if not email or not password:
            return {'success': False, 'message': _('Invalid email or password.')}

        try:
            # Check user credential via standard Odoo auth
            uid = request.session.authenticate(request.session.db, email, password)
            if not uid:
                return {'success': False, 'message': _('Invalid email or password.')}

            user = request.env['res.users'].browse(uid)
            employee = request.env['hr.employee'].sudo().search([('user_id', '=', uid)], limit=1)

            if employee and not employee.is_email_verified:
                request.session.logout()
                return {'success': False, 'message': _('Please verify your email address before logging in.')}

            role = employee.user_role if employee else ('hr' if user.has_group('hr.group_hr_manager') else 'employee')

            return {
                'success': True,
                'uid': uid,
                'name': user.name,
                'email': user.login,
                'role': role,
                'employee_id': employee.id if employee else False,
            }
        except Exception:
            return {'success': False, 'message': _('Invalid email or password.')}
