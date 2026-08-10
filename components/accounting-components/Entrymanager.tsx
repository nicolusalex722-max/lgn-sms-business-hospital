"use client";

import { useState } from "react";
import { NotebookPen, Pencil, Trash2 } from "lucide-react";

export interface JournalEntry {
  id: string;
  date: string;
  account: string;
  type: string;
  amount: number;
  reference: string;
  description: string;
}

const ENTRY_TYPES = ["Debit", "Credit"];

function TypePill({ type }: { type: string }) {
  const style = type === "Debit" ? "bg-indigo-50 text-indigo-700" : "bg-teal-50 text-teal-700";
  return <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${style}`}>{type}</span>;
}

function formatCurrency(value: number) {
  return `TZS ${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

function formatDate(value: string) {
  if (!value) return "\u2014";
  return new Date(value).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

interface EntryFormProps {
  initialValue?: JournalEntry | null;
  accountOptions: string[];
  onSubmit: (data: Omit<JournalEntry, "id">) => void;
  onCancel: () => void;
}

export function EntryForm({ initialValue, accountOptions, onSubmit, onCancel }: EntryFormProps) {
  const [date, setDate] = useState(initialValue?.date ?? new Date().toISOString().split("T")[0]);
  const [account, setAccount] = useState(initialValue?.account ?? accountOptions[0] ?? "");
  const [type, setType] = useState(initialValue?.type ?? "Debit");
  const [amount, setAmount] = useState(initialValue ? String(initialValue.amount) : "");
  const [reference, setReference] = useState(initialValue?.reference ?? "");
  const [description, setDescription] = useState(initialValue?.description ?? "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !account || !amount) return;
    onSubmit({ date, account, type, amount: Number(amount) || 0, reference: reference.trim(), description: description.trim() });
  };

  const fieldClass = "px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Date</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required autoFocus className={fieldClass} />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Account</label>
          {accountOptions.length === 0 ? (
            <p className="text-xs text-rose-500 py-2">Create a Chart of Accounts entry first.</p>
          ) : (
            <select value={account} onChange={(e) => setAccount(e.target.value)} className={`${fieldClass} bg-white`}>
              {accountOptions.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Type</label>
          <select value={type} onChange={(e) => setType(e.target.value)} className={`${fieldClass} bg-white`}>
            {ENTRY_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Amount (TZS)</label>
          <input type="number" min="0" value={amount} onChange={(e) => setAmount(e.target.value)} required className={fieldClass} />
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-slate-500">Reference</label>
        <input type="text" value={reference} onChange={(e) => setReference(e.target.value)} placeholder="e.g. INV-2026-0451" className={fieldClass} />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-slate-500">Description</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className={`${fieldClass} resize-none`} />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onCancel} className="px-4 py-2 rounded-lg border border-slate-300 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
          Cancel
        </button>
        <button type="submit" disabled={accountOptions.length === 0} className="px-5 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
          {initialValue ? "Save Changes" : "Add Entry"}
        </button>
      </div>
    </form>
  );
}

interface EntryTableProps {
  entries: JournalEntry[];
  onEdit: (entry: JournalEntry) => void;
  onDelete: (id: string) => void;
}

export function EntryTable({ entries, onEdit, onDelete }: EntryTableProps) {
  if (entries.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-10 text-center">
        <p className="text-sm text-slate-500">No entries match your search.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="text-left font-medium text-slate-500 px-5 py-4">Date</th>
              <th className="text-left font-medium text-slate-500 px-2 py-4">Account</th>
              <th className="text-left font-medium text-slate-500 px-2 py-4">Type</th>
              <th className="text-right font-medium text-slate-500 px-2 py-4">Amount</th>
              <th className="text-left font-medium text-slate-500 px-2 py-4">Reference</th>
              <th className="text-right font-medium text-slate-500 px-5 py-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((e) => (
              <tr key={e.id} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
                      <NotebookPen className="w-4 h-4 text-indigo-600" />
                    </div>
                    <span className="font-semibold text-slate-800">{formatDate(e.date)}</span>
                  </div>
                </td>
                <td className="px-2 py-4 text-slate-600">{e.account}</td>
                <td className="px-2 py-4"><TypePill type={e.type} /></td>
                <td className="px-2 py-4 text-right text-slate-700">{formatCurrency(e.amount)}</td>
                <td className="px-2 py-4 text-slate-500">{e.reference || "\u2014"}</td>
                <td className="px-5 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <button type="button" onClick={() => onEdit(e)} aria-label="Edit entry" className="w-8 h-8 flex items-center justify-center rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button type="button" onClick={() => onDelete(e.id)} aria-label="Delete entry" className="w-8 h-8 flex items-center justify-center rounded-lg bg-rose-600 text-white hover:bg-rose-700 transition-colors">
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