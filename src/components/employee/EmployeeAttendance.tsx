import React, { useState, useEffect } from 'react';
import {
  CalendarCheck2,
  Clock,
  UserCheck,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { AttendanceRecord } from '../../types';
import { api } from '../../api';

export const EmployeeAttendance: React.FC = () => {
  const { user } = useAuth();
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [todayRecord, setTodayRecord] = useState<AttendanceRecord | null>(null);
  const [punchLoading, setPunchLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  const todayStr = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (user) {
      loadAttendance();
    }
  }, [user]);

  const loadAttendance = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await api.getAttendance({ employeeId: user.id });
      setRecords(data);
      const today = data.find((r) => r.date === todayStr);
      setTodayRecord(today || null);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleClockIn = async () => {
    setPunchLoading(true);
    try {
      const res = await api.checkIn();
      setTodayRecord(res.record);
      await loadAttendance();
    } catch (err: any) {
      alert(err.message || 'Failed to clock in.');
    } finally {
      setPunchLoading(false);
    }
  };

  const handleClockOut = async () => {
    setPunchLoading(true);
    try {
      const res = await api.checkOut();
      setTodayRecord(res.record);
      await loadAttendance();
    } catch (err: any) {
      alert(err.message || 'Failed to clock out.');
    } finally {
      setPunchLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 sm:text-2xl flex items-center gap-2">
            <CalendarCheck2 className="h-6 w-6 text-blue-600" />
            My Attendance & Timecard
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Log your daily work shifts, record punch-in/out timestamps, and track monthly hours.
          </p>
        </div>
      </div>

      {/* Clock In / Out Banner Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <Clock className="h-7 w-7" />
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Live Attendance Recorder
              </span>
              <p className="text-2xl font-extrabold text-slate-900 font-mono mt-0.5">
                {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </p>
              <p className="text-xs text-slate-500">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="text-right hidden sm:block">
              <span className="text-[11px] text-slate-400 block">Today's Session</span>
              <span className="font-bold text-slate-900 text-xs">
                {todayRecord?.checkIn ? `Clocked in at ${todayRecord.checkIn}` : 'Not clocked in yet'}
              </span>
            </div>

            {!todayRecord?.checkIn ? (
              <button
                onClick={handleClockIn}
                disabled={punchLoading}
                className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-xs font-bold text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-700 transition disabled:opacity-50"
              >
                <UserCheck className="h-4 w-4" />
                <span>{punchLoading ? 'Clocking In...' : 'Clock In Now'}</span>
              </button>
            ) : !todayRecord?.checkOut ? (
              <button
                onClick={handleClockOut}
                disabled={punchLoading}
                className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-slate-800 px-6 py-3 text-xs font-bold text-white shadow-md hover:bg-slate-900 transition disabled:opacity-50"
              >
                <Clock className="h-4 w-4" />
                <span>{punchLoading ? 'Clocking Out...' : 'Clock Out (Finish Day)'}</span>
              </button>
            ) : (
              <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-2.5 text-xs font-bold text-emerald-800">
                ✓ Shift Completed ({todayRecord.workingHours} hrs logged)
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Attendance History Table */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-slate-900">Attendance Log History</h2>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-4 py-3.5">Date</th>
                  <th className="px-4 py-3.5">Punch In</th>
                  <th className="px-4 py-3.5">Punch Out</th>
                  <th className="px-4 py-3.5">Working Hours</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {records.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-slate-400">
                      No attendance records found for your account.
                    </td>
                  </tr>
                ) : (
                  records.map((rec) => (
                    <tr key={rec.id} className="hover:bg-slate-50/80 transition">
                      <td className="px-4 py-3 font-semibold text-slate-900">{rec.date}</td>
                      <td className="px-4 py-3 font-mono text-slate-800">
                        {rec.checkIn || '—'}
                        {rec.lateMinutes && rec.lateMinutes > 0 ? (
                          <span className="ml-1.5 rounded bg-amber-100 px-1.5 py-0.2 text-[9px] font-bold text-amber-800">
                            +{rec.lateMinutes}m late
                          </span>
                        ) : null}
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-800">{rec.checkOut || '—'}</td>
                      <td className="px-4 py-3 font-bold text-slate-900">
                        {rec.workingHours ? `${rec.workingHours} hrs` : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                            rec.status === 'Present'
                              ? 'bg-blue-100 text-blue-800'
                              : rec.status === 'Late'
                              ? 'bg-amber-100 text-amber-800'
                              : rec.status === 'Absent'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-purple-100 text-purple-800'
                          }`}
                        >
                          {rec.status === 'Present' && <CheckCircle2 className="h-3 w-3" />}
                          {rec.status === 'Late' && <AlertTriangle className="h-3 w-3" />}
                          {rec.status === 'Absent' && <XCircle className="h-3 w-3" />}
                          {rec.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-400">{rec.notes || '—'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
