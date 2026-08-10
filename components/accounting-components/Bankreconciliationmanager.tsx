"use client";

import { useState } from "react";
import { Landmark, Pencil, Trash2 } from "lucide-react";

export interface BankReconciliation {
  id: string;
  bankAccount: string;
  statementDate: string;
  statementBalance: number;
  bookBalance: number;
  status: string;
}

const STATUS_OPTIONS = ["Reconciled", "Pending"];

function formatCurrency(value: number) {
  return `TZS ${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

function formatDate(value: string) {
  if (!value) return "\u2014";
  return new Date(value).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function StatusPill({ status }: { status: string }) {
  const style = status === "Reconciled" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700";
  return <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${style}`}>{status}</span>;
}

interface BankReconciliationFormProps {
  initialValue?: BankReconciliation | null;
  onSubmit: (data: Omit<BankReconciliation, "id">) => void;
  onCancel: () => void;
}

export function BankReconciliationForm({ initialValue, onSubmit, onCancel }: BankReconciliationFormProps) {
  const [bankAccount, setBankAccount] = useState(initialValue?.bankAccount ?? "");
  const [statementDate, setStatementDate] = useState(initialValue?.statementDate ?? new Date().toISOString().split("T")[0]);
  const [statementBalance, setStatementBalance] = useState(initialValue ? String(initialValue.statementBalance) : "");
  const [bookBalance, setBookBalance] = useState(initialValue ? String(initialValue.bookBalance) : "");
  const [status, setStatus] = useState(initialValue?.status ?? "Pending");

  const difference = (Number(statementBalance) || 0) - (Number(bookBalance) || 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bankAccount.trim() || !statementDate) return;
    onSubmit({
      bankAccount: bankAccount.trim(),
      statementDate,
      statementBalance: Number(statementBalance) || 0,
      bookBalance: Number(bookBalance) || 0,
      status,
    });
  };

  const fieldClass = "px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-slate-500">Bank Account</label>
        <input type="text" value={bankAccount} onChange={(e) => setBankAccount(e.target.value)} placeholder="e.g. NMB - 0123456789" required autoFocus className={fieldClass} />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-slate-500">Statement Date</label>
        <input type="date" value={statementDate} onChange={(e) => setStatementDate(e.target.value)} required className={fieldClass} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Statement Balance (TZS)</label>
          <input type="number" value={statementBalance} onChange={(e) => setStatementBalance(e.target.value)} required className={fieldClass} />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Book Balance (TZS)</label>
          <input type="number" value={bookBalance} onChange={(e) => setBookBalance(e.target.value)} required className={fieldClass} />
        </div>
      </div>

      <div className="rounded-lg border border-dashed border-slate-300 px-4 py-3 flex items-center justify-between text-sm">
        <span className="text-slate-500">Difference</span>
        <span className={`font-semibold ${difference === 0 ? "text-emerald-600" : "text-rose-600"}`}>{formatCurrency(difference)}</span>
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
          {initialValue ? "Save Changes" : "Add Reconciliation"}
        </button>
      </div>
    </form>
  );
}

interface BankReconciliationTableProps {
  records: BankReconciliation[];
  onEdit: (record: BankReconciliation) => void;
  onDelete: (id: string) => void;
}

export function BankReconciliationTable({ records, onEdit, onDelete }: BankReconciliationTableProps) {
  if (records.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-10 text-center">
        <p className="text-sm text-slate-500">No reconciliation records match your search.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="text-left font-medium text-slate-500 px-5 py-4">Bank Account</th>
              <th className="text-left font-medium text-slate-500 px-2 py-4">Statement Date</th>
              <th className="text-right font-medium text-slate-500 px-2 py-4">Statement Balance</th>
              <th className="text-right font-medium text-slate-500 px-2 py-4">Book Balance</th>
              <th className="text-right font-medium text-slate-500 px-2 py-4">Difference</th>
              <th className="text-left font-medium text-slate-500 px-2 py-4">Status</th>
              <th className="text-right font-medium text-slate-500 px-5 py-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {records.map((r) => {
              const difference = r.statementBalance - r.bookBalance;
              return (
                <tr key={r.id} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
                        <Landmark className="w-4 h-4 text-indigo-600" />
                      </div>
                      <span className="font-semibold text-slate-800">{r.bankAccount}</span>
                    </div>
                  </td>
                  <td className="px-2 py-4 text-slate-500">{formatDate(r.statementDate)}</td>
                  <td className="px-2 py-4 text-right text-slate-700">{formatCurrency(r.statementBalance)}</td>
                  <td className="px-2 py-4 text-right text-slate-700">{formatCurrency(r.bookBalance)}</td>
                  <td className={`px-2 py-4 text-right font-medium ${difference === 0 ? "text-emerald-600" : "text-rose-600"}`}>{formatCurrency(difference)}</td>
                  <td className="px-2 py-4"><StatusPill status={r.status} /></td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button type="button" onClick={() => onEdit(r)} aria-label={`Edit ${r.bankAccount}`} className="w-8 h-8 flex items-center justify-center rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button type="button" onClick={() => onDelete(r.id)} aria-label={`Delete ${r.bankAccount}`} className="w-8 h-8 flex items-center justify-center rounded-lg bg-rose-600 text-white hover:bg-rose-700 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}