"use client";

import { useEffect, useMemo, useState } from "react";
import StatCard from "@/components/attendance-components/Attendancestatcard";
import StudentAttendanceRow from "@/components/attendance-components/Studentattendancerow";
import AttendanceRecordModal from "@/components/attendance-components/Attendancerecordmodal";
import { CLASSES, MOCK_RECORDS, MOCK_STUDENTS, SUBJECTS } from "@/lib/data";
import { formatDateDMY, recordStats, todayISO } from "@/lib/utils";
import type { AttendanceRecord, AttendanceStatus } from "@/lib/types";

export default function AttendancePage() {
  const [records, setRecords] = useState<AttendanceRecord[]>(MOCK_RECORDS);

  // Marking session state
  const [className, setClassName] = useState(CLASSES[2]); // "Form 2A"
  const [subject, setSubject] = useState(SUBJECTS[0]);
  const [date, setDate] = useState(todayISO());
  const [statuses, setStatuses] = useState<Record<string, AttendanceStatus>>({});
  const [justSaved, setJustSaved] = useState<AttendanceRecord | null>(null);

  const classStudents = useMemo(() => MOCK_STUDENTS.filter((s) => s.className === className), [className]);

  // Default everyone to Present whenever the class changes
  useEffect(() => {
    setStatuses(Object.fromEntries(classStudents.map((s) => [s.id, "Present" as AttendanceStatus])));
    setJustSaved(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [className]);

  function setStatus(studentId: string, status: AttendanceStatus) {
    setStatuses((s) => ({ ...s, [studentId]: status }));
  }

  function markAll(status: AttendanceStatus) {
    setStatuses(Object.fromEntries(classStudents.map((s) => [s.id, status])));
  }

  function handleSubmit() {
    const record: AttendanceRecord = {
      id: crypto.randomUUID(),
      className,
      subject,
      date,
      takenAt: new Date().toISOString(),
      entries: classStudents.map((s) => ({
        studentId: s.id,
        studentName: s.name,
        photoUrl: s.photoUrl,
        status: statuses[s.id] ?? "Present",
      })),
    };
    setRecords((rows) => [record, ...rows]);
    setJustSaved(record);
  }

  function startNewSession() {
    setJustSaved(null);
    setStatuses(Object.fromEntries(classStudents.map((s) => [s.id, "Present" as AttendanceStatus])));
  }

  // --- Records table ---
  const [filterClass, setFilterClass] = useState("All");
  const [filterDate, setFilterDate] = useState("");
  const [viewingRecord, setViewingRecord] = useState<AttendanceRecord | null>(null);

  const filteredRecords = useMemo(() => {
    return records
      .filter((r) => filterClass === "All" || r.className === filterClass)
      .filter((r) => !filterDate || r.date === filterDate)
      .sort((a, b) => (a.date < b.date ? 1 : -1));
  }, [records, filterClass, filterDate]);

  const summary = useMemo(() => {
    const total = filteredRecords.length;
    const avgRate = total > 0 ? filteredRecords.reduce((sum, r) => sum + recordStats(r).rate, 0) / total : 0;
    const totalAbsences = filteredRecords.reduce((sum, r) => sum + recordStats(r).absent, 0);
    return { total, avgRate, totalAbsences };
  }, [filteredRecords]);

  const sessionPresentCount = classStudents.filter((s) => statuses[s.id] === "Present").length;
  const sessionAbsentCount = classStudents.filter((s) => statuses[s.id] === "Absent").length;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-5xl px-6 py-10">
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Attendance</h1>
          <p className="mt-1 text-sm text-slate-500">Record daily attendance by class and subject</p>
        </header>

        {/* Session selectors */}
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-800">Class</label>
              <select
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-[15px] text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500"
              >
                {CLASSES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-800">Subject</label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-[15px] text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500"
              >
                {SUBJECTS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-800">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-[15px] text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Marking session or success state */}
        {justSaved ? (
          <div className="mb-8 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-6 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500">
              <svg className="h-6 w-6 text-white" viewBox="0 0 20 20" fill="none">
                <path
                  d="M16.7 5.3a1 1 0 010 1.4l-7.6 7.6a1 1 0 01-1.4 0L3.3 10a1 1 0 111.4-1.4l3.7 3.7 6.9-6.9a1 1 0 011.4 0z"
                  fill="currentColor"
                />
              </svg>
            </div>
            <p className="text-sm font-semibold text-slate-800">
              Attendance recorded for {justSaved.className} · {justSaved.subject} · {formatDateDMY(justSaved.date)}
            </p>
            <p className="mt-1 text-sm text-slate-500">
              {recordStats(justSaved).present} present, {recordStats(justSaved).absent} absent
            </p>
            <button
              type="button"
              onClick={startNewSession}
              className="mt-4 rounded-lg bg-indigo-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-600"
            >
              Take another attendance
            </button>
          </div>
        ) : (
          <div className="mb-8 overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  {className} · {subject}
                </p>
                <p className="text-xs text-slate-500">
                  {sessionPresentCount} present · {sessionAbsentCount} absent · {classStudents.length} total
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => markAll("Present")}
                  className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100"
                >
                  Mark all present
                </button>
                <button
                  type="button"
                  onClick={() => markAll("Absent")}
                  className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-100"
                >
                  Mark all absent
                </button>
              </div>
            </div>

            <div className="max-h-[420px] divide-y divide-slate-100 overflow-y-auto">
              {classStudents.map((s) => (
                <StudentAttendanceRow
                  key={s.id}
                  student={s}
                  status={statuses[s.id] ?? "Present"}
                  onChange={(status) => setStatus(s.id, status)}
                />
              ))}
              {classStudents.length === 0 && (
                <p className="px-5 py-8 text-center text-sm text-slate-400">No students in this class.</p>
              )}
            </div>

            {classStudents.length > 0 && (
              <div className="border-t border-slate-100 px-5 py-4">
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="w-full rounded-lg bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-600 md:w-auto"
                >
                  Submit &amp; Close Attendance
                </button>
              </div>
            )}
          </div>
        )}

        {/* Records */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Attendance Records</h2>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-3">
          <StatCard label="Sessions" value={summary.total} helper={filterDate ? formatDateDMY(filterDate) : "All dates"} />
          <StatCard label="Average attendance" value={`${Math.round(summary.avgRate)}%`} accent="indigo" />
          <StatCard label="Total absences" value={summary.totalAbsences} accent="rose" />
        </div>

        <div className="mb-4 flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4">
          <select
            value={filterClass}
            onChange={(e) => setFilterClass(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500"
          >
            <option value="All">All classes</option>
            {CLASSES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500"
          />
          {filterDate && (
            <button
              type="button"
              onClick={() => setFilterDate("")}
              className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
            >
              Clear date
            </button>
          )}
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60 text-xs font-semibold uppercase tracking-wide text-slate-400">
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Class</th>
                <th className="px-6 py-3">Subject</th>
                <th className="px-6 py-3 text-center">Present</th>
                <th className="px-6 py-3 text-center">Absent</th>
                <th className="px-6 py-3 text-right">Rate</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.map((r) => {
                const { present, absent, rate } = recordStats(r);
                return (
                  <tr key={r.id} className="text-sm text-slate-700">
                    <td className="px-6 py-4 font-medium text-slate-900">{formatDateDMY(r.date)}</td>
                    <td className="px-6 py-4 text-slate-600">{r.className}</td>
                    <td className="px-6 py-4 text-slate-600">{r.subject}</td>
                    <td className="px-6 py-4 text-center font-mono text-emerald-600">{present}</td>
                    <td className="px-6 py-4 text-center font-mono text-rose-600">{absent}</td>
                    <td className="px-6 py-4 text-right font-mono font-semibold text-slate-800">
                      {Math.round(rate)}%
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => setViewingRecord(r)}
                        className="rounded-lg p-2 text-slate-400 transition hover:bg-indigo-50 hover:text-indigo-600"
                        aria-label={`View ${r.className} ${r.subject} ${r.date}`}
                      >
                        <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none">
                          <path d="M1.5 10S4.5 4 10 4s8.5 6 8.5 6-3 6-8.5 6-8.5-6-8.5-6z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                          <circle cx="10" cy="10" r="2.2" stroke="currentColor" strokeWidth="1.5" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filteredRecords.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-sm text-slate-400">
                    No attendance records match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {viewingRecord && <AttendanceRecordModal record={viewingRecord} onClose={() => setViewingRecord(null)} />}
    </div>
  );
}