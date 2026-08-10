"use client";

import { useMemo, useState } from "react";
import StatCard from "@/components/results-components/Resultstatcard";
import DivisionBadge from "@/components/results-components/Divisionbadge";
import AddResultModal from "@/components/results-components/Addresultmodal";
import ImportResultsModal from "@/components/results-components/Importresultmodal";
import StudentResultModal from "@/components/results-components/Studentresultmodal";
import { CLASSES, EXAM_TYPES, MOCK_RESULTS, MOCK_STUDENTS } from "@/lib/data";
import { buildStudentSummaries, computeGrade } from "@/lib/grading";
import { exportRowsToExcel } from "@/lib/excel";
import type { SubjectResult } from "@/lib/types";

type SortField = "name" | "points";
type SortDir = "asc" | "desc";

export default function ResultsPage() {
  const [results, setResults] = useState<SubjectResult[]>(MOCK_RESULTS);
  const [className, setClassName] = useState(CLASSES[2]); // "Form 2A" — has the richest demo data
  const [examType, setExamType] = useState(EXAM_TYPES[0]);
  const [query, setQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const [addOpen, setAddOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [viewingStudentId, setViewingStudentId] = useState<string | null>(null);

  const summaries = useMemo(
    () => buildStudentSummaries(results, MOCK_STUDENTS, className, examType),
    [results, className, examType]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const rows = summaries.filter((s) => !q || s.studentName.toLowerCase().includes(q) || s.studentId.toLowerCase().includes(q));
    const sorted = [...rows].sort((a, b) => {
      const cmp = sortField === "name" ? a.studentName.localeCompare(b.studentName) : a.totalPoints - b.totalPoints;
      return sortDir === "asc" ? cmp : -cmp;
    });
    return sorted;
  }, [summaries, query, sortField, sortDir]);

  const stats = useMemo(() => {
    const total = summaries.length;
    const avgPoints = total > 0 ? summaries.reduce((s, r) => s + r.totalPoints, 0) / total : 0;
    const divisionI = summaries.filter((s) => s.division === "I").length;
    const needAttention = summaries.filter((s) => s.division === "0").length;
    return { total, avgPoints, divisionI, needAttention };
  }, [summaries]);

  function addResults(newResults: Omit<SubjectResult, "id" | "grade">[]) {
    const withGradeAndId: SubjectResult[] = newResults.map((r) => ({
      ...r,
      id: crypto.randomUUID(),
      grade: computeGrade(r.marks),
    }));
    setResults((rows) => [...rows, ...withGradeAndId]);
    setAddOpen(false);
    setImportOpen(false);
  }

  function handleExport() {
    const rows = filtered.map((s) => ({
      StudentID: s.studentId,
      StudentName: s.studentName,
      Class: s.className,
      ExamType: s.examType,
      Subjects: s.subjects.length,
      TotalPoints: s.totalPoints,
      Division: s.division,
    }));
    exportRowsToExcel(`${className.replace(/\s+/g, "_")}_${examType.replace(/\s+/g, "_")}_results.xlsx`, rows);
  }

  const viewingSummary = viewingStudentId ? summaries.find((s) => s.studentId === viewingStudentId) ?? null : null;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Results</h1>
            <p className="mt-1 text-sm text-slate-500">Record marks, compute divisions, and review results by class</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setImportOpen(true)}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50"
            >
              <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none">
                <path d="M10 13V4m0 0L6.5 7.5M10 4l3.5 3.5M4 16h12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Import Excel
            </button>
            <button
              type="button"
              onClick={() => setAddOpen(true)}
              className="flex items-center gap-1.5 rounded-lg bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-600"
            >
              <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none">
                <path d="M10 4v12M4 10h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
              Add Result
            </button>
          </div>
        </header>

        {/* Class / exam context selectors */}
        <div className="mb-6 flex flex-wrap gap-3">
          <select
            value={className}
            onChange={(e) => setClassName(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500"
          >
            {CLASSES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <select
            value={examType}
            onChange={(e) => setExamType(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500"
          >
            {EXAM_TYPES.map((e) => (
              <option key={e} value={e}>
                {e}
              </option>
            ))}
          </select>
        </div>

        {/* Summary cards */}
        <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard label="Students" value={stats.total} helper={`${className} · ${examType}`} />
          <StatCard label="Average points" value={stats.avgPoints.toFixed(1)} accent="indigo" helper="Lower is better" />
          <StatCard label="Division I" value={stats.divisionI} accent="emerald" />
          <StatCard label="Need attention" value={stats.needAttention} accent="rose" helper="Division 0" />
        </div>

        {/* Filters / sort / export */}
        <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 md:flex-row md:flex-wrap md:items-center">
          <div className="flex flex-1 items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 md:min-w-[200px]">
            <svg className="h-4 w-4 text-slate-400" viewBox="0 0 20 20" fill="none">
              <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.6" />
              <path d="M14 14l4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search student name or ID..."
              className="w-full text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm text-slate-500">Sort by</label>
            <select
              value={sortField}
              onChange={(e) => setSortField(e.target.value as SortField)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500"
            >
              <option value="name">Name</option>
              <option value="points">Total points</option>
            </select>
            <button
              type="button"
              onClick={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))}
              className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
            >
              <svg className={`h-4 w-4 transition-transform ${sortDir === "desc" ? "rotate-180" : ""}`} viewBox="0 0 20 20" fill="none">
                <path d="M10 16V4m0 0L5 9m5-5l5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {sortDir === "asc" ? "Ascending" : "Descending"}
            </button>
          </div>

          <button
            type="button"
            onClick={handleExport}
            className="ml-auto flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50"
          >
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none">
              <path d="M10 3v10m0 0l-3.5-3.5M10 13l3.5-3.5M4 16h12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Download
          </button>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60 text-xs font-semibold uppercase tracking-wide text-slate-400">
                <th className="px-6 py-3">Student ID</th>
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3 text-center">Subjects</th>
                <th className="px-6 py-3 text-right">Total Points</th>
                <th className="px-6 py-3">Division</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((s) => (
                <tr key={s.studentId} className="text-sm text-slate-700">
                  <td className="px-6 py-4 font-medium text-slate-900">{s.studentId}</td>
                  <td className="px-6 py-4 text-slate-700">{s.studentName}</td>
                  <td className="px-6 py-4 text-center text-slate-500">{s.subjects.length}</td>
                  <td className="px-6 py-4 text-right font-mono font-semibold text-slate-800">{s.totalPoints}</td>
                  <td className="px-6 py-4">
                    <DivisionBadge division={s.division} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      type="button"
                      onClick={() => setViewingStudentId(s.studentId)}
                      className="rounded-lg p-2 text-slate-400 transition hover:bg-indigo-50 hover:text-indigo-600"
                      aria-label={`View ${s.studentName}`}
                    >
                      <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none">
                        <path d="M1.5 10S4.5 4 10 4s8.5 6 8.5 6-3 6-8.5 6-8.5-6-8.5-6z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                        <circle cx="10" cy="10" r="2.2" stroke="currentColor" strokeWidth="1.5" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-sm text-slate-400">
                    No results yet for {className} · {examType}. Add or import some to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {addOpen && (
        <AddResultModal
          defaultClassName={className}
          defaultExamType={examType}
          onClose={() => setAddOpen(false)}
          onSave={addResults}
        />
      )}
      {importOpen && (
        <ImportResultsModal
          defaultClassName={className}
          defaultExamType={examType}
          onClose={() => setImportOpen(false)}
          onImport={addResults}
        />
      )}
      {viewingSummary && <StudentResultModal summary={viewingSummary} onClose={() => setViewingStudentId(null)} />}
    </div>
  );
}
