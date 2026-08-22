import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  AlertOctagon,
  CheckCircle2,
  Clock,
  MessageSquare,
  FileText,
  Send,
  Target,
  ListTodo,
  TrendingUp,
  Award,
  Info,
  Calendar,
  X,
  Sparkles,
  ShieldCheck,
  Briefcase,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api';
import {
  EmployeeWarning,
  PerformanceImprovementPlan,
  EmployeeTask,
  EmployeeRiskScore,
} from '../../types';

export const EmployeePerformanceWarnings: React.FC = () => {
  const { user } = useAuth();
  const [warnings, setWarnings] = useState<EmployeeWarning[]>([]);
  const [pips, setPips] = useState<PerformanceImprovementPlan[]>([]);
  const [tasks, setTasks] = useState<EmployeeTask[]>([]);
  const [riskProfile, setRiskProfile] = useState<EmployeeRiskScore | null>(null);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Response Modal
  const [selectedWarningForResponse, setSelectedWarningForResponse] = useState<EmployeeWarning | null>(null);
  const [explanationText, setExplanationText] = useState('');
  const [supportingInfo, setSupportingInfo] = useState('');
  const [submittingResponse, setSubmittingResponse] = useState(false);

  // PIP Comment Modal
  const [selectedPipForComment, setSelectedPipForComment] = useState<PerformanceImprovementPlan | null>(null);
  const [pipCommentText, setPipCommentText] = useState('');
  const [submittingPipComment, setSubmittingPipComment] = useState(false);

  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  const fetchData = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const [warnsData, pipsData, tasksData, riskData, timelineData] = await Promise.all([
        api.getWarnings({ employeeId: user.employeeId }),
        api.getPips({ employeeId: user.employeeId }),
        api.getTasks({ employeeId: user.employeeId }),
        api.getEmployeeRiskProfile(user.employeeId).catch(() => null),
        api.getEmployee360Timeline(user.employeeId).catch(() => []),
      ]);
      setWarnings(warnsData);
      setPips(pipsData);
      setTasks(tasksData);
      setRiskProfile(riskData);
      setTimeline(timelineData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleSubmitExplanation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWarningForResponse || !explanationText) return;

    try {
      setSubmittingResponse(true);
      await api.submitWarningResponse(selectedWarningForResponse.id, {
        explanation: explanationText,
        supportingInfo,
      });
      showToast('Official written explanation recorded and forwarded to HR decision panel.');
      setSelectedWarningForResponse(null);
      setExplanationText('');
      setSupportingInfo('');
      fetchData();
    } catch (err: any) {
      showToast(err.message || 'Failed to submit response');
    } finally {
      setSubmittingResponse(false);
    }
  };

  const handleSubmitPipComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPipForComment || !pipCommentText) return;

    try {
      setSubmittingPipComment(true);
      await api.submitPipComment(selectedPipForComment.id, {
        employeeComments: pipCommentText,
      });
      showToast('Progress update and feedback submitted to your PIP manager.');
      setSelectedPipForComment(null);
      setPipCommentText('');
      fetchData();
    } catch (err: any) {
      showToast(err.message || 'Failed to submit comment');
    } finally {
      setSubmittingPipComment(false);
    }
  };

  const activeWarnings = warnings.filter((w) => w.status !== 'Resolved' && w.status !== 'Closed');

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="flex items-center justify-between p-3.5 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-900 shadow-xs text-xs font-semibold">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>{toastMsg}</span>
          </div>
          <button onClick={() => setToastMsg(null)} className="hover:opacity-70">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Performance, Governance & Notices</h1>
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-900 px-2.5 py-0.5 text-[11px] font-semibold text-white">
            <ShieldCheck className="h-3 w-3 text-emerald-400" />
            Fair Review Portal
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Review your performance standing, active warnings, PIP goals, and submit formal explanations directly to HR.
        </p>
      </div>

      {/* Explainable Performance & Standing Overview */}
      {riskProfile && (
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Governance & Performance Health Score
              </span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-2xl font-bold text-slate-900">{riskProfile.overallScore} / 100</span>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
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
            </div>

            <div className="flex items-center gap-4 text-xs">
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block">Work Performance</span>
                <span className="font-bold text-slate-800">{riskProfile.breakdown.workPerformanceScore}/100</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block">Attendance Standing</span>
                <span className="font-bold text-slate-800">{riskProfile.breakdown.attendanceScore}/100</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block">Compliance</span>
                <span className="font-bold text-slate-800">{riskProfile.breakdown.complianceScore}/100</span>
              </div>
            </div>
          </div>

          {/* Explainable Reasons */}
          {riskProfile.reasons.length > 0 ? (
            <div className="bg-slate-50 rounded-lg p-3 text-xs space-y-1">
              <span className="text-[10px] font-bold uppercase text-slate-500">Key Factors Influencing Score:</span>
              <ul className="list-disc list-inside text-[11px] text-slate-600 space-y-0.5">
                {riskProfile.reasons.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-[11px] text-emerald-700 font-medium">
              Excellent record: Zero active warnings, full sprint SLA adherence, and perfect attendance compliance.
            </p>
          )}
        </div>
      )}

      {/* Warnings & Notices Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-amber-500" />
            <h2 className="text-sm font-bold text-slate-900">Official Notices & Warnings ({warnings.length})</h2>
          </div>
          <span className="text-[11px] text-slate-500">
            {activeWarnings.length} active case{activeWarnings.length === 1 ? '' : 's'}
          </span>
        </div>

        {warnings.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-6 text-center text-slate-400 text-xs">
            <ShieldCheck className="h-8 w-8 text-emerald-500 mx-auto mb-2 opacity-80" />
            <p className="font-semibold text-slate-700">No warning dockets on file</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Your employment record is in good standing.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {warnings.map((w) => (
              <div key={w.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          w.severity === 'separation_review'
                            ? 'bg-rose-100 text-rose-800'
                            : w.severity === 'serious_review'
                            ? 'bg-orange-100 text-orange-800'
                            : w.severity === 'formal_warning'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {w.severity.replace('_', ' ').toUpperCase()}
                      </span>
                      <h3 className="font-bold text-slate-900 text-xs">{w.warningType}</h3>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Category: {w.category.toUpperCase()} • Incident Date: {w.incidentDate || w.createdAt.split('T')[0]} • Policy: {w.relatedPolicy}
                    </p>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded text-xs font-semibold w-fit ${
                      w.status === 'Resolved' || w.status === 'Closed'
                        ? 'bg-emerald-50 text-emerald-700'
                        : w.status === 'Employee Responded'
                        ? 'bg-blue-50 text-blue-700'
                        : 'bg-amber-50 text-amber-700 font-bold'
                    }`}
                  >
                    {w.status}
                  </span>
                </div>

                <div className="text-xs space-y-2">
                  <div className="bg-slate-50 p-2.5 rounded border border-slate-100">
                    <span className="text-[10px] font-bold uppercase text-slate-500">Notice Details:</span>
                    <p className="text-slate-800 mt-1 leading-relaxed">{w.description}</p>
                  </div>

                  {w.supportingEvidence && (
                    <div className="text-[11px] text-slate-600">
                      <strong>Supporting Evidence / Metrics:</strong> {w.supportingEvidence}
                    </div>
                  )}

                  {w.recommendedAction && (
                    <div className="text-[11px] text-blue-700 bg-blue-50 p-2 rounded border border-blue-100">
                      <strong>Recommended Improvement Action:</strong> {w.recommendedAction}
                    </div>
                  )}
                </div>

                {/* Response Area */}
                {w.employeeResponse ? (
                  <div className="bg-emerald-50/70 p-3 rounded-lg border border-emerald-200 text-xs space-y-1">
                    <div className="flex items-center justify-between text-emerald-900 font-bold text-[11px]">
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                        Your Submitted Written Explanation
                      </span>
                      <span className="font-mono text-[10px] text-emerald-700">
                        {new Date(w.employeeResponse.responseDate).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-slate-800 text-[11px] leading-relaxed">
                      "{w.employeeResponse.explanation}"
                    </p>
                    {w.employeeResponse.supportingInfo && (
                      <p className="text-[10px] text-slate-500 italic">
                        Context: {w.employeeResponse.supportingInfo}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <span className="text-[11px] text-amber-700 font-medium flex items-center gap-1">
                      <Info className="h-3.5 w-3.5" />
                      You have the right to provide an official written response to this docket.
                    </span>
                    <button
                      onClick={() => {
                        setSelectedWarningForResponse(w);
                        setExplanationText('');
                        setSupportingInfo('');
                      }}
                      className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 transition shadow-xs"
                    >
                      <MessageSquare className="h-3.5 w-3.5" />
                      <span>Submit Written Explanation</span>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Active Performance Improvement Plans (PIP) */}
      {pips.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-indigo-600" />
            <h2 className="text-sm font-bold text-slate-900">Performance Improvement Plan (PIP)</h2>
          </div>

          <div className="space-y-3">
            {pips.map((pip) => (
              <div key={pip.id} className="rounded-xl border border-indigo-200 bg-white p-4 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div>
                    <h3 className="font-bold text-slate-900 text-xs">Active 30-Day Improvement Plan</h3>
                    <p className="text-[10px] text-slate-500">
                      Timeline: {pip.startDate} to {pip.deadlineDate} • Manager: {pip.managerName}
                    </p>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800">
                    {pip.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="bg-rose-50/50 p-2 rounded border border-rose-100">
                    <span className="text-[10px] font-bold uppercase text-rose-700">Problem Areas</span>
                    <p className="text-slate-700 text-[11px] mt-0.5">{pip.problemAreas}</p>
                  </div>
                  <div className="bg-indigo-50/50 p-2 rounded border border-indigo-100">
                    <span className="text-[10px] font-bold uppercase text-indigo-700">Specific Goals & Milestones</span>
                    <p className="text-slate-700 text-[11px] mt-0.5">{pip.goals}</p>
                  </div>
                </div>

                {pip.employeeComments ? (
                  <div className="bg-slate-50 p-2.5 rounded text-xs text-slate-700">
                    <span className="text-[10px] font-bold text-slate-600">Your Progress Update:</span>
                    <p className="text-[11px] mt-0.5">{pip.employeeComments}</p>
                  </div>
                ) : (
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] text-slate-500">Provide weekly progress commentary for review.</span>
                    <button
                      onClick={() => {
                        setSelectedPipForComment(pip);
                        setPipCommentText('');
                      }}
                      className="rounded bg-indigo-50 px-2.5 py-1 text-[11px] font-semibold text-indigo-700 hover:bg-indigo-100"
                    >
                      Add Progress Comment
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sprint Tasks & SLA Tracker */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <ListTodo className="h-4 w-4 text-blue-600" />
          <h2 className="text-sm font-bold text-slate-900">Sprint Tasks & Delivery SLA ({tasks.length})</h2>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-2.5 px-3.5">Task</th>
                <th className="py-2.5 px-3.5">Due Date</th>
                <th className="py-2.5 px-3.5">Status</th>
                <th className="py-2.5 px-3.5">SLA Check</th>
                <th className="py-2.5 px-3.5">Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tasks.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-400">
                    No assigned sprint tasks recorded.
                  </td>
                </tr>
              ) : (
                tasks.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/70">
                    <td className="py-2.5 px-3.5">
                      <p className="font-semibold text-slate-800">{t.title}</p>
                      <p className="text-[10px] text-slate-400 line-clamp-1">{t.description}</p>
                    </td>
                    <td className="py-2.5 px-3.5 font-mono text-[11px] text-slate-600">{t.dueDate}</td>
                    <td className="py-2.5 px-3.5">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold ${
                          t.status === 'Completed'
                            ? 'bg-emerald-50 text-emerald-700'
                            : t.status === 'Overdue'
                            ? 'bg-rose-50 text-rose-700 font-bold'
                            : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {t.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3.5">
                      {t.wasLate ? (
                        <span className="text-[10px] font-bold text-rose-600">Late</span>
                      ) : (
                        <span className="text-[10px] text-emerald-600 font-semibold">On Time</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3.5 font-bold text-slate-700">
                      {t.qualityRating ? `${t.qualityRating}/5 ★` : '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Written Explanation Modal */}
      {selectedWarningForResponse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 my-8 text-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900">Submit Official Written Explanation</h3>
              </div>
              <button onClick={() => setSelectedWarningForResponse(null)} className="text-slate-400 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
              <span className="text-[10px] font-bold uppercase text-slate-400">Notice Under Review</span>
              <p className="font-semibold text-slate-800 text-xs mt-0.5">{selectedWarningForResponse.warningType}</p>
              <p className="text-[11px] text-slate-500 mt-0.5">{selectedWarningForResponse.description}</p>
            </div>

            <form onSubmit={handleSubmitExplanation} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Your Explanation & Context *
                </label>
                <textarea
                  rows={4}
                  value={explanationText}
                  onChange={(e) => setExplanationText(e.target.value)}
                  placeholder="Provide full factual context, unforeseen circumstances, technical blockers, or medical emergencies..."
                  required
                  className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-xs text-slate-800 focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Supporting Documentation / References
                </label>
                <input
                  type="text"
                  value={supportingInfo}
                  onChange={(e) => setSupportingInfo(e.target.value)}
                  placeholder="e.g. Jira ticket blocker ID, transit delay confirmation, medical certificate reference"
                  className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs text-slate-800 focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedWarningForResponse(null)}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingResponse}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>{submittingResponse ? 'Submitting...' : 'Submit to HR Decision Panel'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PIP Comment Modal */}
      {selectedPipForComment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 my-8 text-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900">PIP Progress Update</h3>
              </div>
              <button onClick={() => setSelectedPipForComment(null)} className="text-slate-400 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitPipComment} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Progress Commentary & Goal Milestones Achieved *
                </label>
                <textarea
                  rows={4}
                  value={pipCommentText}
                  onChange={(e) => setPipCommentText(e.target.value)}
                  placeholder="Detail deliverables completed this week, code coverage improvements, and current checkpoint status..."
                  required
                  className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-xs text-slate-800 focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedPipForComment(null)}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingPipComment}
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 transition"
                >
                  {submittingPipComment ? 'Submitting...' : 'Save Progress Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
