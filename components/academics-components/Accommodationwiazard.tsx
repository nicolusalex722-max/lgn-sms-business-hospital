"use client";

import { useState } from "react";
import { BedDouble, Receipt, ChevronRight } from "lucide-react";
import type { Accommodation } from "./Accommodationmanager";
import type { AccommodationInvoice } from "./Accommodationinvoicetable";

interface AccommodationWizardProps {
  onComplete: (room: Omit<Accommodation, "id">, bill: Omit<AccommodationInvoice, "id" | "status" | "studentName" | "room">) => void;
  onCancel: () => void;
}

const ROOM_STATUS_OPTIONS = ["Occupied", "Vacant", "Reserved"];
const TERM_OPTIONS = ["Term 1", "Term 2", "Term 3", "Annual"];

function formatCurrency(value: number) {
  return `TZS ${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

const fieldClass = "px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent";

export default function AccommodationWizard({ onComplete, onCancel }: AccommodationWizardProps) {
  const [step, setStep] = useState<1 | 2>(1);

  // Step 1 — room assignment
  const [studentName, setStudentName] = useState("");
  const [room, setRoom] = useState("");
  const [bedNumber, setBedNumber] = useState("");
  const [status, setStatus] = useState("Occupied");

  // Step 2 — bill
  const [term, setTerm] = useState(TERM_OPTIONS[0]);
  const [amount, setAmount] = useState("500000");
  const [dueDate, setDueDate] = useState("");

  const numericAmount = Number(amount) || 0;

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim() || !room.trim() || !bedNumber.trim()) return;
    setStep(2);
  };

  const handleStep2Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dueDate || numericAmount <= 0) return;
    onComplete(
      { studentName: studentName.trim(), room: room.trim(), bedNumber: bedNumber.trim(), status },
      { term, amount: numericAmount, dueDate }
    );
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Step indicator */}
      <div className="flex items-center gap-2">
        <div className={`flex items-center gap-2 ${step === 1 ? "text-indigo-600" : "text-slate-400"}`}>
          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${step === 1 ? "bg-indigo-600 text-white" : "bg-slate-100"}`}>1</span>
          <span className="text-sm font-medium">Assign Room</span>
        </div>
        <ChevronRight className="w-4 h-4 text-slate-300" />
        <div className={`flex items-center gap-2 ${step === 2 ? "text-indigo-600" : "text-slate-400"}`}>
          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${step === 2 ? "bg-indigo-600 text-white" : "bg-slate-100"}`}>2</span>
          <span className="text-sm font-medium">Generate Bill</span>
        </div>
      </div>

      {step === 1 ? (
        <form onSubmit={handleStep1Submit} className="flex flex-col gap-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
            <BedDouble className="w-4 h-4 text-indigo-600" />
            Room Details
          </div>

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
              {ROOM_STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onCancel} className="px-4 py-2 rounded-lg border border-slate-300 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
              Cancel
            </button>
            <button type="submit" className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors">
              Next: Generate Bill
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleStep2Submit} className="flex flex-col gap-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
            <Receipt className="w-4 h-4 text-indigo-600" />
            Accommodation Bill
          </div>

          <div className="rounded-lg bg-slate-50 border border-slate-200 px-4 py-3 text-sm">
            <p className="font-semibold text-slate-800">{studentName}</p>
            <p className="text-xs text-slate-500 mt-0.5">{room} &middot; {bedNumber}</p>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-500">Term / Period</label>
            <select value={term} onChange={(e) => setTerm(e.target.value)} className={`${fieldClass} bg-white`}>
              {TERM_OPTIONS.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-500">Amount (TZS)</label>
              <input type="number" min="0" value={amount} onChange={(e) => setAmount(e.target.value)} required className={fieldClass} />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-500">Due Date</label>
              <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required className={fieldClass} />
            </div>
          </div>

          <div className="rounded-lg border border-dashed border-slate-300 px-4 py-3 flex items-center justify-between text-sm">
            <span className="text-slate-500">Bill Total</span>
            <span className="font-semibold text-slate-800">{formatCurrency(numericAmount)}</span>
          </div>

          <p className="text-xs text-slate-400">
            This bill will appear in Accommodation Invoices as Unpaid. Payment is completed from the billing module.
          </p>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setStep(1)} className="px-4 py-2 rounded-lg border border-slate-300 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
              Back
            </button>
            <button type="submit" className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors">
              <Receipt className="w-4 h-4" />
              Assign Room &amp; Generate Bill
            </button>
          </div>
        </form>
      )}
    </div>
  );
}