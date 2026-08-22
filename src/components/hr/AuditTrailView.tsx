import React, { useState, useEffect } from 'react';
import { History, Search, ShieldCheck, Filter, Download, Lock } from 'lucide-react';
import { AuditLog } from '../../types';
import { api } from '../../api';

export const AuditTrailView: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('all');

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const data = await api.getAuditLogs();
      setLogs(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter((log) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      log.action.toLowerCase().includes(term) ||
      log.actorName.toLowerCase().includes(term) ||
      log.details.toLowerCase().includes(term) ||
      (log.targetName || '').toLowerCase().includes(term);

    const matchesFilter = actionFilter === 'all' || log.action === actionFilter;

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 sm:text-2xl flex items-center gap-2">
            <History className="h-6 w-6 text-blue-600" />
            Compliance & Payroll Audit Trail
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Immutable log of all HR administrative decisions, salary deduction actions, and leave reviews.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-xl bg-slate-100 border border-slate-200 px-3.5 py-1.5 text-xs text-slate-700 font-medium">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          <span>SOC-2 & Labor Law Compliant</span>
        </div>
      </div>

      {/* Filter Row */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search action, actor, target employee..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-9 pr-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-400 shrink-0" />
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none"
            >
              <option value="all">All Action Types</option>
              <option value="APPROVE_SALARY_DEDUCTION">Salary Deduction Approvals</option>
              <option value="REJECT_SALARY_DEDUCTION">Salary Deduction Rejections</option>
              <option value="APPROVE_LEAVE">Leave Approvals</option>
              <option value="REJECT_LEAVE">Leave Rejections</option>
              <option value="CREATE_EMPLOYEE">Employee Additions</option>
              <option value="UPDATE_EMPLOYEE">Employee Edits</option>
              <option value="UPDATE_ABSENCE_POLICY">Policy Updates</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3.5">Timestamp</th>
                <th className="px-4 py-3.5">Action</th>
                <th className="px-4 py-3.5">Actor (HR / System)</th>
                <th className="px-4 py-3.5">Target Employee / Entity</th>
                <th className="px-4 py-3.5">Audit Details & Justification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400 font-sans text-xs">
                    No matching audit logs found.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition">
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded bg-slate-100 px-2 py-0.5 font-bold text-slate-800">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-sans font-medium text-slate-900">{log.actorName}</td>
                    <td className="px-4 py-3 font-sans text-blue-700">{log.targetName || '—'}</td>
                    <td className="px-4 py-3 font-sans text-slate-700 max-w-md">{log.details}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
