import React, { useState } from 'react';
import { Employee, UserRole } from '../types';
import { FileText, Printer, Download, DollarSign, Search, CheckCircle2 } from 'lucide-react';
import { PayslipModal } from './PayslipModal';

interface PayrollViewProps {
  employees: Employee[];
  userRole: UserRole;
  onSelectEmployee?: (emp: Employee) => void;
}

export const PayrollView: React.FC<PayrollViewProps> = ({
  employees,
  userRole,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPayslipEmp, setSelectedPayslipEmp] = useState<Employee | null>(null);

  const filtered = employees.filter(e => 
    e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.badgeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.departmentName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 uppercase">
              Odoo 17 QWeb Payroll Engine
            </span>
            <span className="text-xs text-slate-500 font-medium">Automated Allowances &amp; Deductions</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FileText className="w-6 h-6 text-blue-600" />
            <span>Payroll Management &amp; Salary Slips</span>
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            View transparent compensation structures, deductions, and generate printable QWeb PDF payslips.
          </p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search employee for salary slips..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <span className="text-xs text-slate-500 font-semibold uppercase">{filtered.length} Employees Loaded</span>
      </div>

      {/* Salary Roster Table */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 text-[11px] uppercase font-bold">
            <tr>
              <th className="px-5 py-3">Employee</th>
              <th className="px-5 py-3">Department</th>
              <th className="px-5 py-3">Basic Wage</th>
              <th className="px-5 py-3">HRA (20%)</th>
              <th className="px-5 py-3">Special Allowance</th>
              <th className="px-5 py-3">Gross Earnings</th>
              <th className="px-5 py-3">Net Take-Home</th>
              <th className="px-5 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map(emp => {
              const basic = emp.monthlyWage || 5000;
              const hra = emp.hraAllowance || basic * 0.20;
              const special = emp.specialAllowance || 600;
              const gross = basic + hra + special;
              const pf = basic * (emp.pfRate / 100);
              const tax = gross * (emp.taxRate / 100);
              const net = gross - pf - tax;

              return (
                <tr key={emp.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <img src={emp.avatar} alt={emp.name} className="w-8 h-8 rounded-full object-cover border border-slate-200" />
                      <div>
                        <div className="font-semibold text-slate-900">{emp.name}</div>
                        <div className="text-xs text-slate-400 font-mono">{emp.badgeId}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-xs font-medium text-slate-700">{emp.departmentName}</td>
                  <td className="px-5 py-3.5 text-xs font-mono font-semibold">${basic.toLocaleString()}</td>
                  <td className="px-5 py-3.5 text-xs font-mono text-slate-600">${hra.toLocaleString()}</td>
                  <td className="px-5 py-3.5 text-xs font-mono text-slate-600">${special.toLocaleString()}</td>
                  <td className="px-5 py-3.5 text-xs font-mono font-bold text-slate-900">${gross.toLocaleString()}</td>
                  <td className="px-5 py-3.5 text-xs font-mono font-bold text-emerald-600">${Math.round(net).toLocaleString()}</td>
                  <td className="px-5 py-3.5 text-right">
                    <button
                      onClick={() => setSelectedPayslipEmp(emp)}
                      className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-sm transition-colors cursor-pointer flex items-center gap-1 ml-auto"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>View Payslip</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Payslip Modal */}
      {selectedPayslipEmp && (
        <PayslipModal
          employee={selectedPayslipEmp}
          onClose={() => setSelectedPayslipEmp(null)}
        />
      )}
    </div>
  );
};
