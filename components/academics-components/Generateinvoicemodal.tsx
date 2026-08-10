"use client";

import { useState } from "react";
import { Receipt } from "lucide-react";
import type { Accommodation } from "./Accommodationmanager";
import type { AccommodationInvoice } from "./Accommodationinvoicetable";

interface GenerateInvoiceModalProps {
  accommodation: Accommodation;
  onSubmit: (data: Omit<AccommodationInvoice, "id" | "status">) => void;
  onCancel: () => void;
}

const TERM_OPTIONS = ["Term 1", "Term 2", "Term 3", "Annual"];

function formatCurrency(value: number) {
  return `TZS ${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

export default function GenerateInvoiceModal({ accommodation, onSubmit, onCancel }: GenerateInvoiceModalProps) {
  const [term, setTerm] = useState(TERM_OPTIONS[0]);
  const [amount, setAmount] = useState("500000");
  const [dueDate, setDueDate] = useState("");

  const numericAmount = Number(amount) || 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dueDate || numericAmount <= 0) return;
    onSubmit({
      studentName: accommodation.studentName,
      room: accommodation.room,
      term,
      amount: numericAmount,
      dueDate,
    });
  };

  const fieldClass = "px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="rounded-lg bg-slate-50 border border-slate-200 px-4 py-3 text-sm">
        <p className="font-semibold text-slate-800">{accommodation.studentName}</p>
        <p className="text-xs text-slate-500 mt-0.5">{accommodation.room} &middot; {accommodation.bedNumber}</p>
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
        <span className="text-slate-500">Invoice Total</span>
        <span className="font-semibold text-slate-800">{formatCurrency(numericAmount)}</span>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onCancel} className="px-4 py-2 rounded-lg border border-slate-300 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
          Cancel
        </button>
        <button type="submit" className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors">
          <Receipt className="w-4 h-4" />
          Generate Invoice
        </button>
      </div>
    </form>
  );
}