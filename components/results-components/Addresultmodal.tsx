"use client";

import { useMemo, useState } from "react";
import Modal from "./Resultmodal";
import { CLASSES, EXAM_TYPES, MOCK_STUDENTS, SUBJECTS } from "@/lib/data";
import { computeGrade } from "@/lib/grading";
import type { SubjectResult } from "@/lib/types";

type Mode = "single" | "batch";

type SubjectRow = { id: string; subject: string; marks: string };

export default function AddResultModal({
  defaultClassName,
  defaultExamType,
  onClose,
  onSave,
}: {
  defaultClassName: string;
  defaultExamType: string;
  onClose: () => void;
  onSave: (results: Omit<SubjectResult, "id" | "grade">[]) => void;
}) {
  const [mode, setMode] = useState<Mode>("single");
  const [className, setClassName] = useState(defaultClassName || CLASSES[0]);
  const [examType, setExamType] = useState(defaultExamType || EXAM_TYPES[0]);

  const classStudents = useMemo(() => MOCK_STUDENTS.filter((s) => s.className === className), [className]);

  // --- Single student mode ---
  const [studentId, setStudentId] = useState(classStudents[0]?.id ?? "");
  const [rows, setRows] = useState<SubjectRow[]>([{ id: crypto.randomUUID(), subject: SUBJECTS[0], marks: "" }]);

  function addRow() {
    setRows((r) => [...r, { id: crypto.randomUUID(), subject: SUBJECTS[0], marks: "" }]);
  }
  function updateRow(id: string, patch: Partial<SubjectRow>) {
    setRows((r) => r.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  }
  function removeRow(id: string) {
    setRows((r) => r.filter((row) => row.id !== id));
  }

  // --- Batch entry mode ---
  const [batchSubject, setBatchSubject] = useState(SUBJECTS[0]);
  const [batchMarks, setBatchMarks] = useState<Record<string, string>>({});

  const singleCanSave = !!studentId && rows.some((r) => r.marks.trim() !== "" && !Number.isNaN(Number(r.marks)));
  const batchCanSave = Object.values(batchMarks).some((v) => v.trim() !== "" && !Number.isNaN(Number(v)));

  function handleSaveSingle() {
    const student = classStudents.find((s) => s.id === studentId);
    if (!student) return;
    const results = rows
      .filter((r) => r.marks.trim() !== "" && !Number.isNaN(Number(r.marks)))
      .map((r) => ({
        studentId: student.id,
        studentName: student.name,
        className,
        examType,
        subject: r.subject,
        marks: Number(r.marks),
      }));
    if (results.length === 0) return;
    onSave(results);
  }

  function handleSaveBatch() {
    const results = classStudents
      .filter((s) => (batchMarks[s.id] ?? "").trim() !== "" && !Number.isNaN(Number(batchMarks[s.id])))
      .map((s) => ({
        studentId: s.id,
        studentName: s.name,
        className,
        examType,
        subject: batchSubject,
        marks: Number(batchMarks[s.id]),
      }));
    if (results.length === 0) return;
    onSave(results);
  }

  return (
    <Modal title="Add Result" subtitle="Enter marks for a student or a whole class" onClose={onClose} wide>
      <div className="mb-5 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-800">Class</label>
          <select
            value={className}
            onChange={(e) => {
              setClassName(e.target.value);
              setStudentId("");
              setBatchMarks({});
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
        </div>
      </div>

      <div className="mb-5 flex gap-2 rounded-lg bg-slate-100 p-1">
        <button
          type="button"
          onClick={() => setMode("single")}
          className={`flex-1 rounded-md px-3 py-2 text-sm font-semibold transition ${
            mode === "single" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
          }`}
        >
          Single Student
        </button>
        <button
          type="button"
          onClick={() => setMode("batch")}
          className={`flex-1 rounded-md px-3 py-2 text-sm font-semibold transition ${
            mode === "batch" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
          }`}
        >
          Batch Entry (whole class)
        </button>
      </div>

      {mode === "single" ? (
        <div>
          <div className="mb-4">
            <label className="mb-1.5 block text-sm font-semibold text-slate-800">Student</label>
            <select
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-[15px] text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500"
            >
              {classStudents.length === 0 && <option value="">No students in this class</option>}
              {classStudents.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.id} — {s.name}
                </option>
              ))}
            </select>
          </div>

          <p className="mb-2 text-sm font-semibold text-slate-800">Subjects</p>
          <div className="space-y-2">
            {rows.map((row) => {
              const marksNum = Number(row.marks);
              const grade = row.marks.trim() !== "" && !Number.isNaN(marksNum) ? computeGrade(marksNum) : null;
              return (
                <div key={row.id} className="flex items-center gap-2">
                  <select
                    value={row.subject}
                    onChange={(e) => updateRow(row.id, { subject: e.target.value })}
                    className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500"
                  >
                    {SUBJECTS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={row.marks}
                    onChange={(e) => updateRow(row.id, { marks: e.target.value })}
                    placeholder="Marks"
                    className="w-24 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500"
                  />
                  <span className="w-10 text-center text-xs font-semibold text-slate-500">{grade ?? "—"}</span>
                  <button
                    type="button"
                    onClick={() => removeRow(row.id)}
                    className="rounded-lg p-2 text-slate-300 transition hover:bg-rose-50 hover:text-rose-500"
                    aria-label="Remove subject"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none">
                      <path d="M6 6l8 8M14 6l-8 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>
              );
            })}
          </div>
          <button
            type="button"
            onClick={addRow}
            className="mt-3 flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
          >
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none">
              <path d="M10 4v12M4 10h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
            Add subject
          </button>
        </div>
      ) : (
        <div>
          <div className="mb-4">
            <label className="mb-1.5 block text-sm font-semibold text-slate-800">Subject</label>
            <select
              value={batchSubject}
              onChange={(e) => setBatchSubject(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-[15px] text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500"
            >
              {SUBJECTS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <p className="mt-1.5 text-xs text-slate-400">
              Enter marks for {classStudents.length} student{classStudents.length === 1 ? "" : "s"} in {className}
            </p>
          </div>

          <div className="max-h-64 overflow-y-auto rounded-xl border border-slate-200">
            <div className="divide-y divide-slate-100">
              {classStudents.map((s) => {
                const val = batchMarks[s.id] ?? "";
                const marksNum = Number(val);
                const grade = val.trim() !== "" && !Number.isNaN(marksNum) ? computeGrade(marksNum) : null;
                return (
                  <div key={s.id} className="flex items-center gap-3 px-4 py-2.5">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-800">{s.name}</p>
                      <p className="text-xs text-slate-400">{s.id}</p>
                    </div>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={val}
                      onChange={(e) => setBatchMarks((m) => ({ ...m, [s.id]: e.target.value }))}
                      placeholder="Marks"
                      className="w-24 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500"
                    />
                    <span className="w-8 text-center text-xs font-semibold text-slate-500">{grade ?? "—"}</span>
                  </div>
                );
              })}
              {classStudents.length === 0 && (
                <p className="px-4 py-6 text-center text-sm text-slate-400">No students in this class.</p>
              )}
            </div>
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
          disabled={mode === "single" ? !singleCanSave : !batchCanSave}
          onClick={mode === "single" ? handleSaveSingle : handleSaveBatch}
          className="rounded-lg bg-indigo-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-600 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
        >
          Save results
        </button>
      </div>
    </Modal>
  );
}