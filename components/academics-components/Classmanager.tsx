"use client";

import { useState } from "react";
import { Users2, Pencil, Trash2 } from "lucide-react";

export interface SchoolClass {
  id: string;
  name: string;
  code: string;
  location: string;
  size: number;
  status: string;
}

const STATUS_OPTIONS = ["Active", "Inactive"];

function StatusPill({ status }: { status: string }) {
  const style = status === "Active" ? "bg-sky-600 text-white" : "bg-slate-200 text-slate-600";
  return <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${style}`}>{status}</span>;
}

interface ClassFormProps {
  initialValue?: SchoolClass | null;
  onSubmit: (data: Omit<SchoolClass, "id">) => void;
  onCancel: () => void;
}

export function ClassForm({ initialValue, onSubmit, onCancel }: ClassFormProps) {
  const [name, setName] = useState(initialValue?.name ?? "");
  const [code, setCode] = useState(initialValue?.code ?? "");
  const [location, setLocation] = useState(initialValue?.location ?? "");
  const [size, setSize] = useState(initialValue ? String(initialValue.size) : "");
  const [status, setStatus] = useState(initialValue?.status ?? "Active");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) return;
    onSubmit({ name: name.trim(), code: code.trim().toUpperCase(), location: location.trim(), size: Number(size) || 0, status });
  };

  const fieldClass = "px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-slate-500">Class Name</label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Form 3 Blue" required autoFocus className={fieldClass} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Class Code</label>
          <input type="text" value={code} onChange={(e) => setCode(e.target.value)} placeholder="e.g. F3B" required className={`${fieldClass} uppercase`} />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Class Size</label>
          <input type="number" min="0" value={size} onChange={(e) => setSize(e.target.value)} placeholder="e.g. 40" className={fieldClass} />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Location</label>
          <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Block B, Room 4" className={fieldClass} />
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
          {initialValue ? "Save Changes" : "Add Class"}
        </button>
      </div>
    </form>
  );
}

interface ClassTableProps {
  classes: SchoolClass[];
  onEdit: (item: SchoolClass) => void;
  onDelete: (id: string) => void;
}

export function ClassTable({ classes, onEdit, onDelete }: ClassTableProps) {
  if (classes.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-10 text-center">
        <p className="text-sm text-slate-500">No classes match your search.</p>
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
              <th className="text-left font-medium text-slate-500 px-2 py-4">Code</th>
              <th className="text-left font-medium text-slate-500 px-2 py-4">Location</th>
              <th className="text-left font-medium text-slate-500 px-2 py-4">Size</th>
              <th className="text-left font-medium text-slate-500 px-2 py-4">Status</th>
              <th className="text-right font-medium text-slate-500 px-5 py-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {classes.map((c) => (
              <tr key={c.id} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
                      <Users2 className="w-4 h-4 text-indigo-600" />
                    </div>
                    <span className="font-semibold text-slate-800">{c.name}</span>
                  </div>
                </td>
                <td className="px-2 py-4 text-slate-500 font-mono text-xs">{c.code}</td>
                <td className="px-2 py-4 text-slate-500">{c.location || "\u2014"}</td>
                <td className="px-2 py-4 text-slate-600">{c.size || "\u2014"}</td>
                <td className="px-2 py-4"><StatusPill status={c.status} /></td>
                <td className="px-5 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <button type="button" onClick={() => onEdit(c)} aria-label={`Edit ${c.name}`} className="w-8 h-8 flex items-center justify-center rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button type="button" onClick={() => onDelete(c.id)} aria-label={`Delete ${c.name}`} className="w-8 h-8 flex items-center justify-center rounded-lg bg-rose-600 text-white hover:bg-rose-700 transition-colors">
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