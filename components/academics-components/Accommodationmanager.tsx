"use client";

import { useState } from "react";
import { BedDouble, Pencil, Trash2, Receipt } from "lucide-react";

export interface Accommodation {
  id: string;
  studentName: string;
  room: string;
  bedNumber: string;
  status: string;
}

const STATUS_OPTIONS = ["Occupied", "Vacant", "Reserved"];

const STATUS_STYLES: Record<string, string> = {
  Occupied: "bg-indigo-100 text-indigo-700",
  Vacant: "bg-emerald-100 text-emerald-700",
  Reserved: "bg-amber-100 text-amber-700",
};

function StatusPill({ status }: { status: string }) {
  return <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${STATUS_STYLES[status] ?? "bg-slate-100 text-slate-600"}`}>{status}</span>;
}

interface AccommodationFormProps {
  initialValue?: Accommodation | null;
  onSubmit: (data: Omit<Accommodation, "id">) => void;
  onCancel: () => void;
}

export function AccommodationForm({ initialValue, onSubmit, onCancel }: AccommodationFormProps) {
  const [studentName, setStudentName] = useState(initialValue?.studentName ?? "");
  const [room, setRoom] = useState(initialValue?.room ?? "");
  const [bedNumber, setBedNumber] = useState(initialValue?.bedNumber ?? "");
  const [status, setStatus] = useState(initialValue?.status ?? "Occupied");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim() || !room.trim() || !bedNumber.trim()) return;
    onSubmit({ studentName: studentName.trim(), room: room.trim(), bedNumber: bedNumber.trim(), status });
  };

  const fieldClass = "px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-slate-500">Student Name</label>
        <input type="text" value={studentName} onChange={(e) => setStudentName(e.target.value)} placeholder="e.g. Ralph Edwards" required autoFocus className={fieldClass} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Room Number</label>
          <input type="text" value={room} onChange={(e) => setRoom(e.target.value)} placeholder="e.g. Hostel A - 204" required className={fieldClass} />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Bed Number</label>
          <input type="text" value={bedNumber} onChange={(e) => setBedNumber(e.target.value)} placeholder="e.g. Bed 2" required className={fieldClass} />
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
          {initialValue ? "Save Changes" : "Assign Room"}
        </button>
      </div>
    </form>
  );
}

interface AccommodationTableProps {
  accommodations: Accommodation[];
  onEdit: (item: Accommodation) => void;
  onDelete: (id: string) => void;
  onInvoice: (item: Accommodation) => void;
}

export function AccommodationTable({ accommodations, onEdit, onDelete, onInvoice }: AccommodationTableProps) {
  if (accommodations.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-10 text-center">
        <p className="text-sm text-slate-500">No room assignments match your search.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="text-left font-medium text-slate-500 px-5 py-4">Student</th>
              <th className="text-left font-medium text-slate-500 px-2 py-4">Room</th>
              <th className="text-left font-medium text-slate-500 px-2 py-4">Bed</th>
              <th className="text-left font-medium text-slate-500 px-2 py-4">Status</th>
              <th className="text-right font-medium text-slate-500 px-5 py-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {accommodations.map((a) => (
              <tr key={a.id} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
                      <BedDouble className="w-4 h-4 text-indigo-600" />
                    </div>
                    <span className="font-semibold text-slate-800">{a.studentName}</span>
                  </div>
                </td>
                <td className="px-2 py-4 text-slate-600">{a.room}</td>
                <td className="px-2 py-4 text-slate-600">{a.bedNumber}</td>
                <td className="px-2 py-4"><StatusPill status={a.status} /></td>
                <td className="px-5 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <button type="button" onClick={() => onInvoice(a)} aria-label={`Generate invoice for ${a.studentName}`} title="Generate Invoice" className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
                      <Receipt className="w-3.5 h-3.5" />
                    </button>
                    <button type="button" onClick={() => onEdit(a)} aria-label={`Edit ${a.studentName}`} className="w-8 h-8 flex items-center justify-center rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button type="button" onClick={() => onDelete(a.id)} aria-label={`Delete ${a.studentName}`} className="w-8 h-8 flex items-center justify-center rounded-lg bg-rose-600 text-white hover:bg-rose-700 transition-colors">
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