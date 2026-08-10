"use client";

import { useState } from "react";
import { FACULTY_OPTIONS, CLASS_OPTIONS, Student } from "./Studentdata";

interface StudentEditFormProps {
  student: Student;
  onSubmit: (data: Student) => void;
  onCancel: () => void;
}

const fieldClass = "px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent";
const labelClass = "text-xs font-medium text-slate-500";

export default function StudentEditForm({ student, onSubmit, onCancel }: StudentEditFormProps) {
  const [form, setForm] = useState<Student>(student);
  const patch = (fields: Partial<Student>) => setForm((prev) => ({ ...prev, ...fields }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 max-h-[65vh] overflow-y-auto pr-1">
      <div className="flex flex-col gap-4">
        <h4 className="text-sm font-semibold text-slate-800">Student Details</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex flex-col gap-1">
            <label className={labelClass}>First Name</label>
            <input type="text" value={form.firstName} onChange={(e) => patch({ firstName: e.target.value })} required autoFocus className={fieldClass} />
          </div>
          <div className="flex flex-col gap-1">
            <label className={labelClass}>Middle Name</label>
            <input type="text" value={form.middleName} onChange={(e) => patch({ middleName: e.target.value })} className={fieldClass} />
          </div>
          <div className="flex flex-col gap-1">
            <label className={labelClass}>Last Name</label>
            <input type="text" value={form.lastName} onChange={(e) => patch({ lastName: e.target.value })} required className={fieldClass} />
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <label className={labelClass}>Student ID</label>
          <input type="text" value={form.studentId} onChange={(e) => patch({ studentId: e.target.value })} required className={fieldClass} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className={labelClass}>Faculty</label>
            <select value={form.faculty} onChange={(e) => patch({ faculty: e.target.value })} className={`${fieldClass} bg-white`}>
              {FACULTY_OPTIONS.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className={labelClass}>Class</label>
            <select value={form.className} onChange={(e) => patch({ className: e.target.value })} className={`${fieldClass} bg-white`}>
              {CLASS_OPTIONS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <label className={labelClass}>Address</label>
          <textarea value={form.address} onChange={(e) => patch({ address: e.target.value })} rows={2} className={`${fieldClass} resize-none`} />
        </div>
      </div>

      <div className="flex flex-col gap-4 pt-4 border-t border-slate-100">
        <h4 className="text-sm font-semibold text-slate-800">Parent Details</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className={labelClass}>Parent First Name</label>
            <input type="text" value={form.parentFirstName} onChange={(e) => patch({ parentFirstName: e.target.value })} className={fieldClass} />
          </div>
          <div className="flex flex-col gap-1">
            <label className={labelClass}>Parent Last Name</label>
            <input type="text" value={form.parentLastName} onChange={(e) => patch({ parentLastName: e.target.value })} className={fieldClass} />
          </div>
          <div className="flex flex-col gap-1">
            <label className={labelClass}>Phone</label>
            <input type="tel" value={form.parentPhone} onChange={(e) => patch({ parentPhone: e.target.value })} className={fieldClass} />
          </div>
          <div className="flex flex-col gap-1">
            <label className={labelClass}>Email</label>
            <input type="email" value={form.parentEmail} onChange={(e) => patch({ parentEmail: e.target.value })} className={fieldClass} />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 pt-4 border-t border-slate-100">
        <h4 className="text-sm font-semibold text-slate-800">Fee Balance</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className={labelClass}>Opening Balance (TZS)</label>
            <input type="number" min="0" value={form.openingBalance} onChange={(e) => patch({ openingBalance: Number(e.target.value) || 0 })} className={fieldClass} />
          </div>
          <div className="flex flex-col gap-1">
            <label className={labelClass}>Advance (TZS)</label>
            <input type="number" min="0" value={form.advance} onChange={(e) => patch({ advance: Number(e.target.value) || 0 })} className={fieldClass} />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2 sticky bottom-0 bg-white">
        <button type="button" onClick={onCancel} className="px-4 py-2 rounded-lg border border-slate-300 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
          Cancel
        </button>
        <button type="submit" className="px-5 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors">
          Save Changes
        </button>
      </div>
    </form>
  );
}