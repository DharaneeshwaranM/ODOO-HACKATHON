import React, { useState } from 'react';
import { Employee } from '../types';
import { 
  Mail, 
  Copy, 
  Check, 
  Smartphone, 
  Monitor, 
  Code, 
  Eye, 
  Sparkles, 
  CheckCircle2, 
  Calendar, 
  Building2, 
  User, 
  ShieldCheck, 
  KeyRound, 
  ExternalLink,
  Sliders,
  Send,
  Download,
  Terminal
} from 'lucide-react';

export interface WelcomeEmailTemplateProps {
  employee: Employee;
  initialPassword?: string;
  loginUrl?: string;
  companyName?: string;
  senderName?: string;
  senderEmail?: string;
  onSendSimulation?: () => void;
}

export const WelcomeEmailTemplate: React.FC<WelcomeEmailTemplateProps> = ({
  employee,
  initialPassword = 'password123',
  loginUrl = 'https://dayflow.demo/login',
  companyName = 'Dayflow AI Inc.',
  senderName = 'Dayflow HR & People Operations',
  senderEmail = 'onboarding@dayflow.demo',
  onSendSimulation,
}) => {
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [activeTab, setActiveTab] = useState<'preview' | 'html' | 'placeholders'>('preview');
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedCreds, setCopiedCreds] = useState(false);

  // Dynamic placeholders
  const username = employee.username || employee.email.split('@')[0];
  const dateJoined = employee.dateOfJoining || new Date().toISOString().split('T')[0];
  const managerName = employee.managerName || 'Clara Oswald';
  const workLocation = employee.workLocation || 'Headquarters - San Francisco';

  // Generate responsive HTML source code
  const generatedHtmlCode = `<!DOCTYPE html>
<html lang="en" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8">
  <meta http-equiv="x-ua-compatible" content="ie=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="x-apple-disable-message-reformatting">
  <title>Welcome to the Team, ${employee.name}!</title>
  <style type="text/css">
    @media only screen and (max-width: 620px) {
      .email-container { width: 100% !important; padding: 16px !important; }
      .col-stack { display: block !important; width: 100% !important; margin-bottom: 12px !important; }
      .hero-title { font-size: 22px !important; line-height: 28px !important; }
      .mobile-center { text-align: center !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; width: 100%; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <center style="width: 100%; background-color: #f1f5f9; padding: 24px 0;">
    <!-- Container -->
    <table role="presentation" class="email-container" width="600" border="0" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01); border: 1px solid #e2e8f0;">
      
      <!-- Top Brand Accent Bar -->
      <tr>
        <td style="background: linear-gradient(90deg, #2563eb 0%, #4f46e5 50%, #7c3aed 100%); height: 6px; font-size: 0; line-height: 0;">&nbsp;</td>
      </tr>

      <!-- Header with Dayflow AI Logo -->
      <tr>
        <td style="padding: 32px 36px 24px 36px; border-bottom: 1px solid #f1f5f9;">
          <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0">
            <tr>
              <td valign="middle">
                <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="background: #2563eb; width: 36px; height: 36px; border-radius: 8px; text-align: center; color: #ffffff; font-weight: 800; font-size: 18px; line-height: 36px;">
                      D
                    </td>
                    <td style="padding-left: 12px;">
                      <span style="font-size: 18px; font-weight: 800; color: #0f172a; letter-spacing: -0.5px; display: block;">Dayflow AI</span>
                      <span style="font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; display: block;">Intelligent HRMS & Workforce Operations</span>
                    </td>
                  </tr>
                </table>
              </td>
              <td align="right" valign="middle">
                <span style="display: inline-block; background-color: #dcfce7; color: #15803d; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.5px;">
                  Active Onboarding
                </span>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- Hero Greeting -->
      <tr>
        <td style="padding: 32px 36px 16px 36px;">
          <h1 class="hero-title" style="margin: 0 0 12px 0; font-size: 26px; font-weight: 800; color: #0f172a; line-height: 32px; letter-spacing: -0.5px;">
            Welcome to the Team, <span style="color: #2563eb;">${employee.name}</span>! 🎉
          </h1>
          <p style="margin: 0; font-size: 15px; line-height: 24px; color: #475569;">
            We are thrilled to welcome you to <strong>${companyName}</strong> as our new <strong>${employee.jobTitle}</strong> in the <strong>${employee.departmentName}</strong> department. Your account and access workspace have been fully configured.
          </p>
        </td>
      </tr>

      <!-- Access Credentials Box -->
      <tr>
        <td style="padding: 16px 36px;">
          <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #0f172a; border-radius: 12px; padding: 24px; color: #ffffff;">
            <tr>
              <td>
                <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="color: #60a5fa; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; padding-bottom: 16px; border-bottom: 1px solid #1e293b;">
                      🔐 Your Secure Employee Portal Credentials
                    </td>
                  </tr>
                </table>

                <!-- 2x2 Grid for credentials -->
                <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="margin-top: 16px;">
                  <tr>
                    <td width="50%" class="col-stack" style="padding-right: 8px; padding-bottom: 12px;">
                      <div style="background-color: #1e293b; padding: 12px 14px; border-radius: 8px; border: 1px solid #334155;">
                        <span style="font-size: 10px; color: #94a3b8; font-weight: 700; text-transform: uppercase; display: block;">Portal URL</span>
                        <a href="${loginUrl}" style="color: #93c5fd; font-size: 13px; font-family: monospace; font-weight: 600; text-decoration: none; word-break: break-all;">${loginUrl}</a>
                      </div>
                    </td>
                    <td width="50%" class="col-stack" style="padding-left: 8px; padding-bottom: 12px;">
                      <div style="background-color: #1e293b; padding: 12px 14px; border-radius: 8px; border: 1px solid #334155;">
                        <span style="font-size: 10px; color: #94a3b8; font-weight: 700; text-transform: uppercase; display: block;">Employee ID</span>
                        <span style="color: #ffffff; font-size: 13px; font-family: monospace; font-weight: 700;">${employee.badgeId}</span>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td width="50%" class="col-stack" style="padding-right: 8px;">
                      <div style="background-color: #1e293b; padding: 12px 14px; border-radius: 8px; border: 1px solid #334155;">
                        <span style="font-size: 10px; color: #94a3b8; font-weight: 700; text-transform: uppercase; display: block;">Username / Login</span>
                        <span style="color: #ffffff; font-size: 13px; font-family: monospace; font-weight: 700;">${username}</span>
                      </div>
                    </td>
                    <td width="50%" class="col-stack" style="padding-left: 8px;">
                      <div style="background-color: #1e293b; padding: 12px 14px; border-radius: 8px; border: 1px solid #334155;">
                        <span style="font-size: 10px; color: #94a3b8; font-weight: 700; text-transform: uppercase; display: block;">Initial Password</span>
                        <span style="color: #fcd34d; font-size: 13px; font-family: monospace; font-weight: 700;">${initialPassword}</span>
                      </div>
                    </td>
                  </tr>
                </table>

                <!-- CTA Button Inside -->
                <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="margin-top: 20px;">
                  <tr>
                    <td align="center">
                      <a href="${loginUrl}" style="background-color: #2563eb; color: #ffffff; font-size: 14px; font-weight: 700; text-decoration: none; padding: 12px 28px; border-radius: 8px; display: inline-block; box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.4);">
                        Log In to Employee Portal &rarr;
                      </a>
                    </td>
                  </tr>
                </table>

              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- Job Position & Department Meta Card -->
      <tr>
        <td style="padding: 12px 36px;">
          <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px;">
            <tr>
              <td width="33%" class="col-stack" style="text-align: center; border-right: 1px solid #e2e8f0; padding: 6px 10px;">
                <span style="font-size: 10px; color: #64748b; text-transform: uppercase; font-weight: 700; display: block;">Department</span>
                <strong style="font-size: 13px; color: #0f172a; display: block; margin-top: 2px;">${employee.departmentName}</strong>
              </td>
              <td width="33%" class="col-stack" style="text-align: center; border-right: 1px solid #e2e8f0; padding: 6px 10px;">
                <span style="font-size: 10px; color: #64748b; text-transform: uppercase; font-weight: 700; display: block;">Reporting Manager</span>
                <strong style="font-size: 13px; color: #0f172a; display: block; margin-top: 2px;">${managerName}</strong>
              </td>
              <td width="33%" class="col-stack" style="text-align: center; padding: 6px 10px;">
                <span style="font-size: 10px; color: #64748b; text-transform: uppercase; font-weight: 700; display: block;">Start Date</span>
                <strong style="font-size: 13px; color: #0f172a; display: block; margin-top: 2px;">${dateJoined}</strong>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- Onboarding Checklist Section -->
      <tr>
        <td style="padding: 16px 36px 24px 36px;">
          <h3 style="margin: 0 0 14px 0; font-size: 14px; font-weight: 800; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px;">
            📋 Your First-Day Action Items
          </h3>
          
          <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding-bottom: 10px;">
                <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                  <tr>
                    <td valign="top" style="padding-right: 10px;">
                      <span style="background-color: #dbeafe; color: #1d4ed8; width: 20px; height: 20px; border-radius: 50%; display: inline-block; text-align: center; font-size: 12px; font-weight: 700; line-height: 20px;">1</span>
                    </td>
                    <td style="font-size: 13px; color: #334155; line-height: 20px;">
                      <strong>Sign in to Dayflow:</strong> Access your portal profile using the credentials above.
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding-bottom: 10px;">
                <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                  <tr>
                    <td valign="top" style="padding-right: 10px;">
                      <span style="background-color: #dbeafe; color: #1d4ed8; width: 20px; height: 20px; border-radius: 50%; display: inline-block; text-align: center; font-size: 12px; font-weight: 700; line-height: 20px;">2</span>
                    </td>
                    <td style="font-size: 13px; color: #334155; line-height: 20px;">
                      <strong>Daily Attendance Punch:</strong> Test the 1-click Check-in widget to register your attendance.
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding-bottom: 10px;">
                <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                  <tr>
                    <td valign="top" style="padding-right: 10px;">
                      <span style="background-color: #dbeafe; color: #1d4ed8; width: 20px; height: 20px; border-radius: 50%; display: inline-block; text-align: center; font-size: 12px; font-weight: 700; line-height: 20px;">3</span>
                    </td>
                    <td style="font-size: 13px; color: #334155; line-height: 20px;">
                      <strong>Compensation &amp; Payroll:</strong> Verify your salary structure, allowance metrics, and tax tier under Payroll.
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td>
                <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                  <tr>
                    <td valign="top" style="padding-right: 10px;">
                      <span style="background-color: #dbeafe; color: #1d4ed8; width: 20px; height: 20px; border-radius: 50%; display: inline-block; text-align: center; font-size: 12px; font-weight: 700; line-height: 20px;">4</span>
                    </td>
                    <td style="font-size: 13px; color: #334155; line-height: 20px;">
                      <strong>Manager Kickoff:</strong> Meet with <strong>${managerName}</strong> for your onboarding walkthrough.
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- Footer & Help Desk -->
      <tr>
        <td style="background-color: #f8fafc; padding: 24px 36px; border-top: 1px solid #e2e8f0;">
          <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0">
            <tr>
              <td style="font-size: 12px; color: #64748b; line-height: 18px;">
                <p style="margin: 0 0 6px 0; font-weight: 700; color: #334155;">Need help or have questions?</p>
                <p style="margin: 0 0 10px 0;">Reach out to the People Operations team at <a href="mailto:${senderEmail}" style="color: #2563eb; text-decoration: underline;">${senderEmail}</a>.</p>
                <p style="margin: 0; font-size: 11px; color: #94a3b8;">&copy; ${new Date().getFullYear()} ${companyName}. All rights reserved. Automated transmission via Dayflow AI HRMS.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>

    </table>
  </center>
</body>
</html>`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(generatedHtmlCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleCopyCreds = () => {
    const credText = `Dayflow HRMS Credentials:\nURL: ${loginUrl}\nEmployee ID: ${employee.badgeId}\nUsername: ${username}\nTemporary Password: ${initialPassword}`;
    navigator.clipboard.writeText(credText);
    setCopiedCreds(true);
    setTimeout(() => setCopiedCreds(false), 2500);
  };

  return (
    <div className="bg-slate-900 text-white rounded-2xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col">
      
      {/* Top Toolbar */}
      <div className="px-5 py-3.5 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        
        {/* Left: Branding Badge & Title */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-linear-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-xs font-bold text-sm">
            <Mail className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-white tracking-tight">Dayflow AI Responsive Email Engine</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-blue-950 text-blue-400 border border-blue-800 font-mono font-medium">
                HTML5 + MJML Tested
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Personalized template with dynamic tokens for <strong>{employee.name}</strong>
            </p>
          </div>
        </div>

        {/* Right Controls: Tabs & Device Frame */}
        <div className="flex items-center gap-2">
          
          {/* Tab Switcher */}
          <div className="flex items-center bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-3 py-1 rounded-md transition cursor-pointer flex items-center gap-1.5 font-semibold ${
                activeTab === 'preview' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Preview</span>
            </button>
            <button
              onClick={() => setActiveTab('html')}
              className={`px-3 py-1 rounded-md transition cursor-pointer flex items-center gap-1.5 font-semibold ${
                activeTab === 'html' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              <span>HTML Source</span>
            </button>
            <button
              onClick={() => setActiveTab('placeholders')}
              className={`px-3 py-1 rounded-md transition cursor-pointer flex items-center gap-1.5 font-semibold ${
                activeTab === 'placeholders' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Placeholders</span>
            </button>
          </div>

          {/* Device Frame Toggle (only in preview mode) */}
          {activeTab === 'preview' && (
            <div className="flex items-center bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs">
              <button
                onClick={() => setPreviewDevice('desktop')}
                className={`p-1.5 rounded transition cursor-pointer ${
                  previewDevice === 'desktop' ? 'bg-slate-800 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
                title="Desktop Layout (600px width)"
              >
                <Monitor className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setPreviewDevice('mobile')}
                className={`p-1.5 rounded transition cursor-pointer ${
                  previewDevice === 'mobile' ? 'bg-slate-800 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
                title="Mobile Client View (375px width)"
              >
                <Smartphone className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Copy HTML Button */}
          <button
            type="button"
            onClick={handleCopyCode}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition cursor-pointer"
          >
            {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedCode ? 'Copied HTML!' : 'Copy Code'}</span>
          </button>
        </div>

      </div>

      {/* Main Content Area */}
      <div className="bg-slate-950 p-4 sm:p-6 overflow-y-auto max-h-[70vh]">
        
        {/* ================= 1. RENDERED PREVIEW ================= */}
        {activeTab === 'preview' && (
          <div className="flex justify-center transition-all duration-200">
            <div
              className={`transition-all duration-300 rounded-2xl overflow-hidden border border-slate-300 shadow-2xl bg-white text-slate-900 ${
                previewDevice === 'mobile' ? 'w-[375px]' : 'w-full max-w-[600px]'
              }`}
            >
              {/* Device Header Bar */}
              <div className="bg-slate-100 px-4 py-2 border-b border-slate-200 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-400"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                </div>
                <div className="truncate max-w-[200px] text-slate-600 font-semibold">
                  Inbox: Welcome to the Team
                </div>
                <span className="text-[10px] text-slate-400">{previewDevice === 'mobile' ? '375px' : '600px'}</span>
              </div>

              {/* Email Visual Content */}
              <div>
                {/* Gradient Top Bar */}
                <div className="h-1.5 bg-linear-to-r from-blue-600 via-indigo-600 to-purple-600"></div>

                {/* Header with Dayflow AI Logo */}
                <div className="p-6 sm:p-8 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white font-extrabold text-lg shadow-sm">
                      D
                    </div>
                    <div>
                      <div className="text-lg font-black text-slate-900 tracking-tight leading-tight">Dayflow AI</div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Intelligent HRMS &amp; Workforce</div>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold uppercase tracking-wider">
                    Active Onboarding
                  </span>
                </div>

                {/* Email Body */}
                <div className="p-6 sm:p-8 space-y-6">
                  
                  {/* Salutation & Welcome */}
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug">
                      Welcome to the Team, <span className="text-blue-600">{employee.name}</span>! 🎉
                    </h2>
                    <p className="text-slate-600 text-sm leading-relaxed mt-2">
                      We are thrilled to welcome you to <strong>{companyName}</strong> as our new <strong>{employee.jobTitle}</strong> in the <strong>{employee.departmentName}</strong> department. Your employee profile and system workspace have been provisioned.
                    </p>
                  </div>

                  {/* Credentials Box */}
                  <div className="bg-slate-900 text-white rounded-xl p-5 shadow-inner space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                      <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-blue-400">
                        <KeyRound className="w-4 h-4" />
                        <span>Your Portal Access Credentials</span>
                      </div>
                      <button
                        type="button"
                        onClick={handleCopyCreds}
                        className="text-[11px] font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-2 py-0.5 rounded transition cursor-pointer flex items-center gap-1"
                      >
                        {copiedCreds ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedCreds ? 'Copied!' : 'Copy'}</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs font-mono">
                      <div className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700">
                        <span className="text-[10px] font-bold text-slate-400 block font-sans uppercase">Portal URL</span>
                        <a href={loginUrl} className="text-blue-300 underline truncate block">{loginUrl}</a>
                      </div>

                      <div className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700">
                        <span className="text-[10px] font-bold text-slate-400 block font-sans uppercase">Employee ID</span>
                        <span className="text-white font-bold">{employee.badgeId}</span>
                      </div>

                      <div className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700">
                        <span className="text-[10px] font-bold text-slate-400 block font-sans uppercase">Username / Login</span>
                        <span className="text-white font-bold">{username}</span>
                      </div>

                      <div className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700">
                        <span className="text-[10px] font-bold text-slate-400 block font-sans uppercase">Initial Password</span>
                        <span className="text-amber-300 font-bold">{initialPassword}</span>
                      </div>
                    </div>

                    <div className="text-center pt-1">
                      <a
                        href={loginUrl}
                        className="inline-flex items-center justify-center gap-2 w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg text-xs shadow-md transition"
                      >
                        <span>Log In to Employee Portal</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>

                  {/* Summary Meta */}
                  <div className="grid grid-cols-3 gap-2 bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-center text-xs">
                    <div className="border-r border-slate-200 pr-2">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Department</span>
                      <strong className="text-slate-900 block truncate mt-0.5">{employee.departmentName}</strong>
                    </div>
                    <div className="border-r border-slate-200 px-2">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Reporting Manager</span>
                      <strong className="text-slate-900 block truncate mt-0.5">{managerName}</strong>
                    </div>
                    <div className="pl-2">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Start Date</span>
                      <strong className="text-slate-900 block truncate mt-0.5">{dateJoined}</strong>
                    </div>
                  </div>

                  {/* Action Checklist */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                      📋 Your First-Day Action Items
                    </h3>

                    <div className="space-y-2 text-xs text-slate-700">
                      <div className="flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                          1
                        </span>
                        <div>
                          <strong>Sign in to Dayflow:</strong> Access your employee portal profile using the credentials provided above.
                        </div>
                      </div>

                      <div className="flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                          2
                        </span>
                        <div>
                          <strong>Daily Attendance Punch:</strong> Test the 1-click Check-in widget in your navigation bar to mark attendance.
                        </div>
                      </div>

                      <div className="flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                          3
                        </span>
                        <div>
                          <strong>Compensation &amp; Payroll:</strong> Review your salary structure, allowance metrics, and tax tier under Payroll.
                        </div>
                      </div>

                      <div className="flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                          4
                        </span>
                        <div>
                          <strong>Manager Kickoff:</strong> Meet with <strong>{managerName}</strong> for your onboarding walkthrough.
                        </div>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Footer */}
                <div className="bg-slate-50 p-6 border-t border-slate-200 text-xs text-slate-500 space-y-2">
                  <div className="font-bold text-slate-700">Need help or have questions?</div>
                  <p>
                    Reach out to the People Operations team at <a href={`mailto:${senderEmail}`} className="text-blue-600 underline font-semibold">{senderEmail}</a>.
                  </p>
                  <p className="text-[11px] text-slate-400 pt-1">
                    &copy; {new Date().getFullYear()} {companyName}. All rights reserved. Automated transmission via Dayflow AI HRMS.
                  </p>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* ================= 2. HTML SOURCE CODE ================= */}
        {activeTab === 'html' && (
          <div className="space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between text-slate-400 pb-2 border-b border-slate-800">
              <span className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-blue-400" />
                <span>Responsive HTML5 / MJML Compatible Source Code ({generatedHtmlCode.length} bytes)</span>
              </span>
              <button
                type="button"
                onClick={handleCopyCode}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-sans font-bold cursor-pointer transition flex items-center gap-1.5"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode ? 'Copied to Clipboard' : 'Copy HTML Code'}</span>
              </button>
            </div>

            <pre className="bg-slate-900 p-4 rounded-xl text-slate-300 overflow-x-auto border border-slate-800 text-[11px] leading-relaxed max-h-[50vh]">
              {generatedHtmlCode}
            </pre>
          </div>
        )}

        {/* ================= 3. PLACEHOLDER TOKENS ================= */}
        {activeTab === 'placeholders' && (
          <div className="space-y-4 text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <Sliders className="w-4 h-4 text-blue-400" />
              <span className="font-bold text-sm">Dynamic Placeholder Interpolation Map</span>
            </div>
            <p className="text-slate-400">
              The Dayflow AI email dispatcher replaces these tokens in real-time when the member creation event fires in <code className="text-blue-400 font-mono">hr.employee</code>:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                <div className="text-blue-400 font-mono font-bold text-xs">{`{{employee_name}}`}</div>
                <div className="text-slate-300 font-semibold">{employee.name}</div>
                <div className="text-[10px] text-slate-500 font-sans">Full legal name of the newly onboarded staff member.</div>
              </div>

              <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                <div className="text-blue-400 font-mono font-bold text-xs">{`{{job_title}}`}</div>
                <div className="text-slate-300 font-semibold">{employee.jobTitle}</div>
                <div className="text-[10px] text-slate-500 font-sans">Official job position assigned to the profile.</div>
              </div>

              <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                <div className="text-blue-400 font-mono font-bold text-xs">{`{{department_name}}`}</div>
                <div className="text-slate-300 font-semibold">{employee.departmentName}</div>
                <div className="text-[10px] text-slate-500 font-sans">Assigned business department / functional unit.</div>
              </div>

              <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                <div className="text-blue-400 font-mono font-bold text-xs">{`{{badge_id}}`}</div>
                <div className="text-slate-300 font-semibold font-mono">{employee.badgeId}</div>
                <div className="text-[10px] text-slate-500 font-sans">Unique organizational employee badge ID identifier.</div>
              </div>

              <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                <div className="text-blue-400 font-mono font-bold text-xs">{`{{username}}`}</div>
                <div className="text-slate-300 font-semibold font-mono">{username}</div>
                <div className="text-[10px] text-slate-500 font-sans">Odoo res.users login identifier.</div>
              </div>

              <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                <div className="text-blue-400 font-mono font-bold text-xs">{`{{initial_password}}`}</div>
                <div className="text-amber-400 font-semibold font-mono">{initialPassword}</div>
                <div className="text-[10px] text-slate-500 font-sans">Temporary credentials (prompted to reset on first login).</div>
              </div>

              <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                <div className="text-blue-400 font-mono font-bold text-xs">{`{{manager_name}}`}</div>
                <div className="text-slate-300 font-semibold">{managerName}</div>
                <div className="text-[10px] text-slate-500 font-sans">Direct reporting manager for team kickoff.</div>
              </div>

              <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                <div className="text-blue-400 font-mono font-bold text-xs">{`{{date_of_joining}}`}</div>
                <div className="text-slate-300 font-semibold font-mono">{dateJoined}</div>
                <div className="text-[10px] text-slate-500 font-sans">Effective official start date.</div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Footer Info */}
      <div className="px-5 py-3 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-400">
          <Sparkles className="w-4 h-4 text-blue-400" />
          <span>Dynamic Dayflow AI Branding with inline CSS &amp; table-based email client support</span>
        </div>

        {onSendSimulation && (
          <button
            type="button"
            onClick={onSendSimulation}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg text-xs cursor-pointer shadow-md transition"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Simulate Live Delivery</span>
          </button>
        )}
      </div>

    </div>
  );
};
