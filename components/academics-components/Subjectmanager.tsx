"use client";

import { useState } from "react";
import { BookOpen, Pencil, Trash2 } from "lucide-react";
import { FACULTY_OPTIONS } from "./Facultymanager";

export interface Subject {
  id: string;
  name: string;
  faculty: string;
  code: string;
  status: string;
}

const STATUS_OPTIONS = ["Active", "Inactive"];

function StatusPill({ status }: { status: string }) {
  const style = status === "Active" ? "bg-sky-600 text-white" : "bg-slate-200 text-slate-600";
  return <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${style}`}>{status}</span>;
}

interface SubjectFormProps {
  initialValue?: Subject | null;
  onSubmit: (data: Omit<Subject, "id">) => void;
  onCancel: () => void;
}

export function SubjectForm({ initialValue, onSubmit, onCancel }: SubjectFormProps) {
  const [name, setName] = useState(initialValue?.name ?? "");
  const [faculty, setFaculty] = useState(initialValue?.faculty ?? FACULTY_OPTIONS[0]);
  const [code, setCode] = useState(initialValue?.code ?? "");
  const [status, setStatus] = useState(initialValue?.status ?? "Active");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) return;
    onSubmit({ name: name.trim(), faculty, code: code.trim().toUpperCase(), status });
  };

  const fieldClass = "px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-slate-500">Subject Name</label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Mathematics" required autoFocus className={fieldClass} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Faculty</label>
          <select value={faculty} onChange={(e) => setFaculty(e.target.value)} className={`${fieldClass} bg-white`}>
            {FACULTY_OPTIONS.map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Subject Code</label>
          <input type="text" value={code} onChange={(e) => setCode(e.target.value)} placeholder="e.g. MATH101" required className={`${fieldClass} uppercase`} />
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-slate-500">Status</label>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className={`${fieldClass} bg-white`}>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onCancel} className="px-4 py-2 rounded-lg border border-slate-300 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
          Cancel
        </button>
        <button type="submit" className="px-5 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors">
          {initialValue ? "Save Changes" : "Add Subject"}
        </button>
      </div>
    </form>
  );
}

interface SubjectTableProps {
  subjects: Subject[];
  onEdit: (subject: Subject) => void;
  onDelete: (id: string) => void;
}

export function SubjectTable({ subjects, onEdit, onDelete }: SubjectTableProps) {
  if (subjects.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-10 text-center">
        <p className="text-sm text-slate-500">No subjects match your search.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="text-left font-medium text-slate-500 px-5 py-4">Subject</th>
              <th className="text-left font-medium text-slate-500 px-2 py-4">Faculty</th>
              <th className="text-left font-medium text-slate-500 px-2 py-4">Code</th>
              <th className="text-left font-medium text-slate-500 px-2 py-4">Status</th>
              <th className="text-right font-medium text-slate-500 px-5 py-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {subjects.map((s) => (
              <tr key={s.id} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
                      <BookOpen className="w-4 h-4 text-indigo-600" />
                    </div>
                    <span className="font-semibold text-slate-800">{s.name}</span>
                  </div>
                </td>
                <td className="px-2 py-4">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700">{s.faculty}</span>
                </td>
                <td className="px-2 py-4 text-slate-500 font-mono text-xs">{s.code}</td>
                <td className="px-2 py-4"><StatusPill status={s.status} /></td>
                <td className="px-5 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <button type="button" onClick={() => onEdit(s)} aria-label={`Edit ${s.name}`} className="w-8 h-8 flex items-center justify-center rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button type="button" onClick={() => onDelete(s.id)} aria-label={`Delete ${s.name}`} className="w-8 h-8 flex items-center justify-center rounded-lg bg-rose-600 text-white hover:bg-rose-700 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}