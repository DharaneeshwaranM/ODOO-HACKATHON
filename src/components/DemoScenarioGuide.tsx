import React from 'react';
import { Compass, CheckCircle2, ArrowRight, Sparkles, ShieldAlert, Building2, CalendarClock, FileText, Bot } from 'lucide-react';

interface DemoScenarioGuideProps {
  onClose: () => void;
  onNavigateToStep: (stepNumber: number) => void;
}

export const DemoScenarioGuide: React.FC<DemoScenarioGuideProps> = ({ onClose, onNavigateToStep }) => {
  const steps = [
    {
      num: 1,
      title: 'Authentication & Email Token Verification',
      desc: 'Simulate registration with single-use cryptographic token, 24-hour expiration, and instant account activation in Odoo 17.',
      icon: CheckCircle2,
      actionText: 'Launch Sign Up Flow',
    },
    {
      num: 2,
      title: 'Executive Dashboard (Health 82/100)',
      desc: 'View organization-wide health dial (82/100), 42 staff roster, 8 high-risk alerts, and live department capacity.',
      icon: Sparkles,
      actionText: 'Open Executive Dashboard',
    },
    {
      num: 3,
      title: 'Department Hierarchy & Capacity (Interactive Org Chart)',
      desc: 'Explore reporting structures via interactive organizational chart, inspect node hierarchies, and diagnose availability thresholds across departments.',
      icon: Building2,
      actionText: 'Open Department Org Chart',
    },
    {
      num: 4,
      title: 'Employee Risk Drill-down (John Smith 82)',
      desc: 'Inspect John Smith (Score 82 [HIGH]): 71.0% attendance, 6 absences, 8 late arrivals, and prescriptive HR intervention plan.',
      icon: ShieldAlert,
      actionText: 'Inspect John Smith Risk Plan',
    },
    {
      num: 5,
      title: 'Smart Leave Impact & Overlap Warning',
      desc: 'Test real-time department availability simulation and concurrent colleague overlap alerts (Priya Sharma vs John Smith).',
      icon: CalendarClock,
      actionText: 'Open Leave & Overlap Engine',
    },
    {
      num: 6,
      title: 'Payroll & Printable QWeb Salary Slip',
      desc: 'Generate transparent compensation breakdown (Basic, HRA, Allowances, PF, TDS) and official printable QWeb PDF payslip.',
      icon: FileText,
      actionText: 'View QWeb Salary Slip',
    },
    {
      num: 7,
      title: 'AI HR Copilot Natural Language Assistant',
      desc: 'Ask grounded natural language questions directly against Odoo 17 ORM data with zero hallucination fallback.',
      icon: Bot,
      actionText: 'Ask AI Copilot',
    },
    {
      num: 8,
      title: 'Odoo 17 Module Source Code & Manifest',
      desc: 'Inspect complete Odoo 17 module codebase: Python models, services, controllers, XML views, OWL templates, security rules.',
      icon: Sparkles,
      actionText: 'Inspect Odoo 17 Source',
    },
    {
      num: 9,
      title: 'HR-Only Add Member & Welcome Email Trigger',
      desc: 'Test secure member creation, auto Employee role assignment, immutable audit logs, and automated "Welcome to Team" email dispatch trigger to employee address.',
      icon: CheckCircle2,
      actionText: 'Open Add Member Form',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full shadow-2xl border border-slate-200 p-6 space-y-5 animate-in fade-in zoom-in duration-150 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-blue-600 text-white flex items-center justify-center font-bold">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Dayflow AI • Hackathon Demo Guide</h3>
              <p className="text-xs text-slate-500 font-medium">8-Step Comprehensive Evaluation Sequence</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-md bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
          {steps.map(step => {
            const Icon = step.icon;
            return (
              <div
                key={step.num}
                className="p-3.5 rounded-lg border border-slate-200 hover:border-blue-400 bg-slate-50 hover:bg-blue-50/30 transition-colors flex items-center justify-between gap-3"
              >
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    {step.num}
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 text-xs">{step.title}</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{step.desc}</p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    onNavigateToStep(step.num);
                    onClose();
                  }}
                  className="px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium shrink-0 transition-colors flex items-center gap-1 cursor-pointer shadow-sm"
                >
                  <span>{step.actionText}</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
