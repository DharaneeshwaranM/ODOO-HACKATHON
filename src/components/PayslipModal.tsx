import React from 'react';
import { Employee } from '../types';
import { Printer, Download, Sparkles, Building2, CheckCircle2 } from 'lucide-react';

interface PayslipModalProps {
  employee: Employee;
  onClose: () => void;
}

export const PayslipModal: React.FC<PayslipModalProps> = ({ employee, onClose }) => {
  const basic = employee.monthlyWage || 5000;
  const hra = employee.hraAllowance || basic * 0.20;
  const special = employee.specialAllowance || 600;
  const gross = basic + hra + special;

  const pf = basic * (employee.pfRate / 100);
  const tax = gross * (employee.taxRate / 100);
  const totalDeductions = pf + tax;
  const net = gross - totalDeductions;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-150">
        {/* Top Actions Bar */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold tracking-tight">DAYFLOW HR</span>
            <span className="text-xs px-2 py-0.5 rounded bg-blue-600 font-mono">QWeb Payslip #SLIP-2026-08-{employee.badgeId}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-md transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print PDF</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Printable QWeb Payslip Body */}
        <div className="p-8 overflow-y-auto space-y-6 text-slate-900 print:p-0">
          {/* Header */}
          <div className="flex items-start justify-between border-b pb-6 border-slate-200">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">DAYFLOW ENTERPRISES LTD.</h1>
              <p className="text-xs text-slate-500 mt-1">100 Innovation Parkway, Suite 400 • San Francisco, CA 94107</p>
              <p className="text-xs text-slate-500">Tax ID / EIN: 94-2849102 • payroll@dayflow.ai</p>
            </div>
            <div className="text-right">
              <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">SALARY STATEMENT</span>
              <div className="text-base font-bold text-slate-900 mt-1">Pay Period: August 2026</div>
              <div className="text-xs text-slate-500">Payment Date: Aug 31, 2026</div>
            </div>
          </div>

          {/* Employee Information Block */}
          <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-slate-50 border border-slate-200 text-xs">
            <div className="space-y-1">
              <div><strong className="text-slate-500">Employee Name:</strong> <span className="font-bold text-slate-900">{employee.name}</span></div>
              <div><strong className="text-slate-500">Employee ID:</strong> <span className="font-mono font-bold text-slate-900">{employee.badgeId}</span></div>
              <div><strong className="text-slate-500">Designation:</strong> {employee.jobTitle}</div>
            </div>
            <div className="space-y-1">
              <div><strong className="text-slate-500">Department:</strong> {employee.departmentName}</div>
              <div><strong className="text-slate-500">Bank Account:</strong> **** **** **** 8842</div>
              <div><strong className="text-slate-500">Payment Mode:</strong> Direct Automated ACH</div>
            </div>
          </div>

          {/* Earnings & Deductions Tables */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Earnings */}
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <div className="bg-slate-50 px-4 py-2.5 text-xs font-bold uppercase text-slate-700 tracking-wider border-b border-slate-200">
                Earnings (Gross Inflows)
              </div>
              <table className="w-full text-xs">
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="p-3 text-slate-600">Basic Wage</td>
                    <td className="p-3 text-right font-mono font-bold text-slate-900">${basic.toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td className="p-3 text-slate-600">House Rent Allowance (HRA 20%)</td>
                    <td className="p-3 text-right font-mono text-slate-800">${hra.toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td className="p-3 text-slate-600">Special Role Allowance</td>
                    <td className="p-3 text-right font-mono text-slate-800">${special.toLocaleString()}</td>
                  </tr>
                  <tr className="bg-slate-50 font-bold">
                    <td className="p-3 text-slate-900">Total Gross Earnings</td>
                    <td className="p-3 text-right font-mono text-blue-600">${gross.toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Deductions */}
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <div className="bg-slate-50 px-4 py-2.5 text-xs font-bold uppercase text-slate-700 tracking-wider border-b border-slate-200">
                Deductions (Statutory &amp; Taxes)
              </div>
              <table className="w-full text-xs">
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="p-3 text-slate-600">Provident Fund (PF {employee.pfRate}%)</td>
                    <td className="p-3 text-right font-mono text-slate-800">${pf.toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td className="p-3 text-slate-600">Tax Deducted at Source (TDS {employee.taxRate}%)</td>
                    <td className="p-3 text-right font-mono text-slate-800">${tax.toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td className="p-3 text-slate-600">Other Statutory Contributions</td>
                    <td className="p-3 text-right font-mono text-slate-800">$0.00</td>
                  </tr>
                  <tr className="bg-slate-50 font-bold">
                    <td className="p-3 text-slate-900">Total Deductions</td>
                    <td className="p-3 text-right font-mono text-red-600">${totalDeductions.toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Net Pay Grand Box */}
          <div className="p-5 rounded-lg bg-slate-900 text-white flex items-center justify-between border border-slate-800">
            <div>
              <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">Net Take-Home Salary</span>
              <div className="text-3xl font-bold mt-0.5 text-white">${Math.round(net).toLocaleString()} USD</div>
            </div>
            <div className="text-right text-xs text-slate-300">
              <div className="font-semibold text-white">Authorized by Odoo 17 HRMS</div>
              <div className="text-slate-400">Digitally Signed &amp; Audited</div>
            </div>
          </div>

          {/* Footer Notes */}
          <div className="text-[11px] text-slate-400 text-center pt-4 border-t border-slate-100">
            This payslip is a system-generated document from Dayflow AI / Odoo 17 HR Payroll Module.
          </div>
        </div>
      </div>
    </div>
  );
};
