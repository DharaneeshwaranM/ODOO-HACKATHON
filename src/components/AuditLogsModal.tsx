import React, { useState } from 'react';
import { AuditLogEntry, AuthUser } from '../types';
import { 
  FileCheck2, 
  X, 
  ShieldCheck, 
  ShieldAlert, 
  Lock, 
  Search, 
  Calendar, 
  User, 
  Server, 
  CheckCircle2, 
  Filter, 
  Download
} from 'lucide-react';

interface AuditLogsModalProps {
  currentUser: AuthUser;
  auditLogs: AuditLogEntry[];
  onClose: () => void;
}

export const AuditLogsModal: React.FC<AuditLogsModalProps> = ({
  currentUser,
  auditLogs,
  onClose,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAction, setSelectedAction] = useState<string>('All');

  // Verify access
  if (currentUser.role !== 'hr') {
    return (
      <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
        <div className="bg-white rounded-xl max-w-md w-full p-6 text-center space-y-4 shadow-2xl border border-red-200">
          <div className="w-14 h-14 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h3 className="font-bold text-lg text-slate-900">403 Forbidden - Access Denied</h3>
          <p className="text-xs text-slate-600">
            Audit logs contain confidential compliance and role provisioning trails restricted exclusively to HR Administrators.
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold"
          >
            Return
          </button>
        </div>
      </div>
    );
  }

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = 
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.performedBy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.targetEmployee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.targetEmployee.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesAction = selectedAction === 'All' || log.action === selectedAction;

    return matchesSearch && matchesAction;
  });

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white text-slate-900 rounded-xl max-w-4xl w-full my-6 shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-sm">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-base text-white tracking-tight">HRMS Security &amp; Member Creation Audit Log</h2>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono">
                  Immutable
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Cryptographically tracked administrative actions, role assignments, and member provisioning
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Security Notice */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2 text-slate-700">
            <Lock className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              <strong>Compliance Guarantee:</strong> All account creations and security evaluations are permanently signed by HR actor badge IDs. Employees cannot modify or purge logs.
            </span>
          </div>

          <div className="text-[11px] font-mono text-slate-500 shrink-0">
            Total Entries: <strong>{auditLogs.length}</strong>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="p-4 bg-white border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search logs by actor, employee name, ID, or details..."
              className="w-full pl-9 pr-4 py-1.5 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedAction}
              onChange={e => setSelectedAction(e.target.value)}
              className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white focus:outline-none"
            >
              <option value="All">All Actions</option>
              <option value="Employee Created">Employee Created</option>
              <option value="Security Permission Check">Security Permission Check</option>
            </select>
          </div>
        </div>

        {/* Log Entries */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50">
          {filteredLogs.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              No audit logs matching search filters.
            </div>
          ) : (
            filteredLogs.map(log => (
              <div
                key={log.id}
                className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs hover:border-slate-300 transition space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold uppercase text-[10px]">
                      {log.action}
                    </span>
                    <span className="font-mono text-slate-500 font-medium">#{log.id}</span>
                  </div>

                  <div className="flex items-center gap-1.5 text-slate-400 font-mono text-[11px]">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{log.timestamp}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Performed By (HR / Admin)
                    </span>
                    <div className="font-bold text-slate-900">{log.performedBy.name}</div>
                    <div className="text-slate-500 text-[11px]">{log.performedBy.role} • ID: {log.performedBy.userId}</div>
                    <div className="text-slate-400 text-[10px]">{log.performedBy.email}</div>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Target Employee Record
                    </span>
                    <div className="font-bold text-slate-900">{log.targetEmployee.name}</div>
                    <div className="text-slate-500 text-[11px]">{log.targetEmployee.jobPosition} • {log.targetEmployee.department}</div>
                    <div className="text-blue-600 font-mono text-[11px] font-bold">Badge ID: {log.targetEmployee.employeeId}</div>
                  </div>
                </div>

                <div className="text-xs text-slate-700 space-y-1">
                  <div className="font-medium">{log.details}</div>
                  <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-1">
                    <span className="font-mono">IP: {log.ipAddress || '192.168.1.1'}</span>
                    <span>•</span>
                    <span className="text-emerald-700 font-medium flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      <span>Security: {log.securityGroupChecked}</span>
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-white border-t border-slate-200 flex items-center justify-between text-xs">
          <span className="text-slate-500">
            Viewing authenticated audit stream for <strong>{currentUser.name}</strong>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-lg cursor-pointer"
          >
            Close Audit Viewer
          </button>
        </div>
      </div>
    </div>
  );
};
