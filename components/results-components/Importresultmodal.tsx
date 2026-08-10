"use client";

import { useRef, useState, type ChangeEvent } from "react";
import Modal from "./Resultmodal";
import { CLASSES, EXAM_TYPES, MOCK_STUDENTS, SUBJECTS } from "@/lib/data";
import { downloadResultTemplate, parseResultWorkbook, type ParsedResultRow } from "@/lib/excel";
import type { SubjectResult } from "@/lib/types";

export default function ImportResultsModal({
  defaultClassName,
  defaultExamType,
  onClose,
  onImport,
}: {
  defaultClassName: string;
  defaultExamType: string;
  onClose: () => void;
  onImport: (results: Omit<SubjectResult, "id" | "grade">[]) => void;
}) {
  const [className, setClassName] = useState(defaultClassName || CLASSES[0]);
  const [examType, setExamType] = useState(defaultExamType || EXAM_TYPES[0]);
  const [parsed, setParsed] = useState<ParsedResultRow[]>([]);
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const classStudents = MOCK_STUDENTS.filter((s) => s.className === className);

  function handleDownloadTemplate() {
    downloadResultTemplate(className, classStudents, SUBJECTS);
  }

  async function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setError("");
    try {
      const rows = await parseResultWorkbook(file);
      if (rows.length === 0) {
        setError("No valid rows found. Make sure StudentID, Subject, and Marks columns are filled in.");
      }
      setParsed(rows);
    } catch {
      setError("Could not read that file. Please upload the .xlsx template.");
      setParsed([]);
    }
  }

  const knownIds = new Set(classStudents.map((s) => s.id));
  const validRows = parsed.filter((r) => r.marks >= 0 && r.marks <= 100);
  const unknownStudentCount = parsed.filter((r) => !knownIds.has(r.studentId)).length;

  function handleImport() {
    if (validRows.length === 0) return;
    const results = validRows.map((r) => {
      const known = classStudents.find((s) => s.id === r.studentId);
      return {
        studentId: r.studentId,
        studentName: known?.name ?? r.studentName ?? r.studentId,
        className,
        examType,
        subject: r.subject,
        marks: r.marks,
      };
    });
    onImport(results);
  }

  return (
    <Modal title="Import Results" subtitle="Download a template, fill it in, then upload it back" onClose={onClose} wide>
      <div className="mb-5 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-800">Class</label>
          <select
            value={className}
            onChange={(e) => {
              setClassName(e.target.value);
              setParsed([]);
              setFileName("");
            }}
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
          <label className="mb-1.5 block text-sm font-semibold text-slate-800">Exam type</label>
          <select
            value={examType}
            onChange={(e) => setExamType(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-[15px] text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500"
          >
            {EXAM_TYPES.map((e) => (
              <option key={e} value={e}>
                {e}
              </option>
            ))}
          </select>
          <p className="mt-1.5 text-xs text-slate-400">Applied to every row you import</p>
        </div>
      </div>

      <div className="mb-5 flex items-center justify-between rounded-xl border border-indigo-100 bg-indigo-50/50 px-4 py-3">
        <div>
          <p className="text-sm font-semibold text-slate-800">1. Download the template</p>
          <p className="text-xs text-slate-500">
            Pre-filled with every student in {className} × {SUBJECTS.length} subjects — just fill in Marks
          </p>
        </div>
        <button
          type="button"
          onClick={handleDownloadTemplate}
          className="flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-indigo-200 bg-white px-3 py-2 text-sm font-semibold text-indigo-600 shadow-sm transition hover:bg-indigo-50"
        >
          <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none">
            <path d="M10 3v10m0 0l-3.5-3.5M10 13l3.5-3.5M4 16h12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Download .xlsx
        </button>
      </div>

      <div className="mb-5">
        <p className="mb-2 text-sm font-semibold text-slate-800">2. Upload the completed file</p>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 px-4 py-6 text-sm font-medium text-slate-500 transition hover:border-indigo-300 hover:bg-indigo-50/40"
        >
          <svg className="h-5 w-5" viewBox="0 0 20 20" fill="none">
            <path d="M10 13V4m0 0L6.5 7.5M10 4l3.5 3.5M4 16h12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {fileName || "Click to choose a .xlsx, .xls, or .csv file"}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={handleFileChange}
          className="hidden"
        />
        {error && <p className="mt-2 text-xs font-medium text-rose-500">{error}</p>}
      </div>

      {parsed.length > 0 && (
        <div className="mb-5">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-800">Preview</p>
            <p className="text-xs text-slate-400">
              {validRows.length} row{validRows.length === 1 ? "" : "s"} ready
              {unknownStudentCount > 0 && ` · ${unknownStudentCount} unrecognized student ID(s)`}
            </p>
          </div>
          <div className="max-h-52 overflow-y-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-sm">
              <thead className="sticky top-0 bg-slate-50">
                <tr className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  <th className="px-4 py-2">Student ID</th>
                  <th className="px-4 py-2">Subject</th>
                  <th className="px-4 py-2 text-right">Marks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {parsed.slice(0, 50).map((r, idx) => (
                  <tr key={idx} className={knownIds.has(r.studentId) ? "" : "bg-amber-50/50"}>
                    <td className="px-4 py-2 text-slate-700">{r.studentId}</td>
                    <td className="px-4 py-2 text-slate-600">{r.subject}</td>
                    <td className="px-4 py-2 text-right font-mono text-slate-700">{r.marks}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="mt-6 flex justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg px-4 py-2.5 text-sm font-semibold text-slate-500 hover:bg-slate-100"
        >
          Cancel
        </button>
        <button
          type="button"
          disabled={validRows.length === 0}
          onClick={handleImport}
          className="rounded-lg bg-indigo-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-600 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
        >
          Import {validRows.length > 0 ? validRows.length : ""} results
        </button>
      </div>
    </Modal>
  );
}