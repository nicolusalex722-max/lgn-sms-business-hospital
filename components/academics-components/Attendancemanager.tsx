"use client";

import { useState } from "react";
import { CalendarCheck2, Pencil, Trash2 } from "lucide-react";

export interface AttendanceRecord {
  id: string;
  className: string;
  subject: string;
  date: string;
  present: number;
  total: number;
  status: string;
}

const CLASS_OPTIONS = ["Form 1 Red", "Form 2 Blue", "Form 3 Green", "Form 4 Gold"];
const SUBJECT_OPTIONS = ["Mathematics", "English", "Physics", "Chemistry", "Biology", "History"];
const STATUS_OPTIONS = ["Recorded", "Pending"];

function StatusPill({ status }: { status: string }) {
  const style = status === "Recorded" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700";
  return <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${style}`}>{status}</span>;
}

function formatDate(value: string) {
  if (!value) return "\u2014";
  return new Date(value).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

interface AttendanceFormProps {
  initialValue?: AttendanceRecord | null;
  onSubmit: (data: Omit<AttendanceRecord, "id">) => void;
  onCancel: () => void;
}

export function AttendanceForm({ initialValue, onSubmit, onCancel }: AttendanceFormProps) {
  const [className, setClassName] = useState(initialValue?.className ?? CLASS_OPTIONS[0]);
  const [subject, setSubject] = useState(initialValue?.subject ?? SUBJECT_OPTIONS[0]);
  const [date, setDate] = useState(initialValue?.date ?? "");
  const [present, setPresent] = useState(initialValue ? String(initialValue.present) : "");
  const [total, setTotal] = useState(initialValue ? String(initialValue.total) : "");
  const [status, setStatus] = useState(initialValue?.status ?? "Recorded");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) return;
    onSubmit({ className, subject, date, present: Number(present) || 0, total: Number(total) || 0, status });
  };

  const fieldClass = "px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Class</label>
          <select value={className} onChange={(e) => setClassName(e.target.value)} className={`${fieldClass} bg-white`}>
            {CLASS_OPTIONS.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Subject</label>
          <select value={subject} onChange={(e) => setSubject(e.target.value)} className={`${fieldClass} bg-white`}>
            {SUBJECT_OPTIONS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-slate-500">Date</label>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required autoFocus className={fieldClass} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Present</label>
          <input type="number" min="0" value={present} onChange={(e) => setPresent(e.target.value)} className={fieldClass} />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Total Students</label>
          <input type="number" min="0" value={total} onChange={(e) => setTotal(e.target.value)} className={fieldClass} />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Status</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className={`${fieldClass} bg-white`}>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onCancel} className="px-4 py-2 rounded-lg border border-slate-300 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
          Cancel
        </button>
        <button type="submit" className="px-5 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors">
          {initialValue ? "Save Changes" : "Add Attendance"}
        </button>
      </div>
    </form>
  );
}

interface AttendanceTableProps {
  records: AttendanceRecord[];
  onEdit: (record: AttendanceRecord) => void;
  onDelete: (id: string) => void;
}

export function AttendanceTable({ records, onEdit, onDelete }: AttendanceTableProps) {
  if (records.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-10 text-center">
        <p className="text-sm text-slate-500">No attendance records match your search.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="text-left font-medium text-slate-500 px-5 py-4">Class</th>
              <th className="text-left font-medium text-slate-500 px-2 py-4">Subject</th>
              <th className="text-left font-medium text-slate-500 px-2 py-4">Date</th>
              <th className="text-left font-medium text-slate-500 px-2 py-4">Present / Total</th>
              <th className="text-left font-medium text-slate-500 px-2 py-4">Status</th>
              <th className="text-right font-medium text-slate-500 px-5 py-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {records.map((rec) => (
              <tr key={rec.id} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
                      <CalendarCheck2 className="w-4 h-4 text-indigo-600" />
                    </div>
                    <span className="font-semibold text-slate-800">{rec.className}</span>
                  </div>
                </td>
                <td className="px-2 py-4 text-slate-600">{rec.subject}</td>
                <td className="px-2 py-4 text-slate-500">{formatDate(rec.date)}</td>
                <td className="px-2 py-4 text-slate-600">{rec.present} / {rec.total}</td>
                <td className="px-2 py-4"><StatusPill status={rec.status} /></td>
                <td className="px-5 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <button type="button" onClick={() => onEdit(rec)} aria-label={`Edit attendance for ${rec.className}`} className="w-8 h-8 flex items-center justify-center rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button type="button" onClick={() => onDelete(rec.id)} aria-label={`Delete attendance for ${rec.className}`} className="w-8 h-8 flex items-center justify-center rounded-lg bg-rose-600 text-white hover:bg-rose-700 transition-colors">
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