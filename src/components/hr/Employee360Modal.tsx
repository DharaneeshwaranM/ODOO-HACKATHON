import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Award,
  TrendingDown,
  Clock,
  Calendar,
  AlertTriangle,
  FileText,
  MessageSquare,
  Target,
  ListTodo,
  CheckCircle2,
  X,
  ExternalLink,
  Plus,
} from 'lucide-react';
import { api } from '../../api';
import { Employee, EmployeeRiskScore, EmployeeWarning, PerformanceImprovementPlan, EmployeeTask } from '../../types';

interface Employee360ModalProps {
  employee: Employee;
  onClose: () => void;
  onIssueWarning?: (employeeId: string) => void;
  onInitiatePip?: (employeeId: string) => void;
}

export const Employee360Modal: React.FC<Employee360ModalProps> = ({
  employee,
  onClose,
  onIssueWarning,
  onInitiatePip,
}) => {
  const [riskProfile, setRiskProfile] = useState<EmployeeRiskScore | null>(null);
  const [warnings, setWarnings] = useState<EmployeeWarning[]>([]);
  const [pips, setPips] = useState<PerformanceImprovementPlan[]>([]);
  const [tasks, setTasks] = useState<EmployeeTask[]>([]);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load360 = async () => {
      try {
        setLoading(true);
        const [risk, warns, pipList, taskList, timeList] = await Promise.all([
          api.getEmployeeRiskProfile(employee.employeeId).catch(() => null),
          api.getWarnings({ employeeId: employee.employeeId }),
          api.getPips({ employeeId: employee.employeeId }),
          api.getTasks({ employeeId: employee.employeeId }),
          api.getEmployee360Timeline(employee.employeeId).catch(() => []),
        ]);
        setRiskProfile(risk);
        setWarnings(warns);
        setPips(pipList);
        setTasks(taskList);
        setTimeline(timeList);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load360();
  }, [employee]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-3xl rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 my-8 space-y-4 text-xs">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-3">
            {employee.profilePhoto ? (
              <img
                src={employee.profilePhoto}
                alt={employee.fullName}
                className="h-10 w-10 rounded-full object-cover border border-slate-200 shadow-xs"
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-700 text-sm">
                {employee.fullName.charAt(0)}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">{employee.fullName}</h2>
                <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-mono text-slate-600 font-bold">
                  {employee.employeeId}
                </span>
                <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] text-blue-700 font-semibold">
                  {employee.roleTitle}
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Department: {employee.department} • Joined: {employee.joinDate}
              </p>
            </div>
          </div>

          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* 360 Risk Score Banner */}
        {riskProfile && (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-slate-900">{riskProfile.overallScore} / 100</span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                    riskProfile.overallIndicator === 'Good Standing'
                      ? 'bg-emerald-100 text-emerald-800'
                      : riskProfile.overallIndicator === 'Review Recommended'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {riskProfile.overallIndicator}
                </span>
              </div>

              <div className="flex items-center gap-3 text-slate-600 text-[11px]">
                <span>Performance: <strong>{riskProfile.breakdown.workPerformanceScore}%</strong></span>
                <span>Attendance: <strong>{riskProfile.breakdown.attendanceScore}%</strong></span>
                <span>Compliance: <strong>{riskProfile.breakdown.complianceScore}%</strong></span>
              </div>
            </div>

            {riskProfile.reasons.length > 0 && (
              <div className="border-t border-slate-200 pt-2 text-[11px] text-slate-600 space-y-0.5">
                <p className="font-semibold text-slate-700">Governance Metric Drivers:</p>
                <ul className="list-disc list-inside space-y-0.5">
                  {riskProfile.reasons.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* 3 Column Stats Overview */}
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Warning Dockets</span>
            <p className="text-lg font-bold text-slate-900 mt-0.5">{warnings.length}</p>
          </div>
          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Active PIPs</span>
            <p className="text-lg font-bold text-indigo-700 mt-0.5">{pips.length}</p>
          </div>
          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Sprint Tasks</span>
            <p className="text-lg font-bold text-blue-700 mt-0.5">{tasks.length}</p>
          </div>
        </div>

        {/* 360 Unified Timeline */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">360 Unified Employment & Governance Timeline</h3>
          <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
            {timeline.length === 0 ? (
              <p className="text-slate-400 text-center py-4">No events logged in timeline.</p>
            ) : (
              timeline.map((item, idx) => (
                <div key={idx} className="flex items-start gap-2.5 bg-slate-50 p-2 rounded-lg border border-slate-100 text-xs">
                  <div
                    className={`h-6 w-6 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5 ${
                      item.type === 'warning'
                        ? 'bg-rose-100 text-rose-700'
                        : item.type === 'pip'
                        ? 'bg-indigo-100 text-indigo-700'
                        : item.type === 'attendance'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {item.type === 'warning' ? 'W' : item.type === 'pip' ? 'P' : item.type === 'attendance' ? 'A' : 'T'}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800">{item.title}</span>
                      <span className="text-[10px] font-mono text-slate-400">{item.date}</span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-0.5">{item.description}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
          <button
            onClick={onClose}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
