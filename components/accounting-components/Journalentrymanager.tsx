"use client";

import Link from "next/link";
import { NotebookPen, Eye, Pencil, Trash2 } from "lucide-react";

export interface JournalLine {
  id: string;
  account: string;
  description: string;
  debit: number;
  credit: number;
}

export interface JournalEntry {
  id: string;
  reference: string;
  date: string;
  currency: string;
  description: string;
  posted: boolean;
  lines: JournalLine[];
}

function formatCurrency(value: number, currency: string) {
  const symbol = currency === "TZS" ? "TSh" : currency;
  return `${symbol} ${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(value: string) {
  if (!value) return "\u2014";
  return new Date(value).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function totals(entry: JournalEntry) {
  const debit = entry.lines.reduce((sum, l) => sum + (l.debit || 0), 0);
  const credit = entry.lines.reduce((sum, l) => sum + (l.credit || 0), 0);
  return { debit, credit };
}

function StatusPill({ posted }: { posted: boolean }) {
  const style = posted ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600";
  return <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${style}`}>{posted ? "Posted" : "Draft"}</span>;
}

interface JournalEntryTableProps {
  entries: JournalEntry[];
  onDelete: (id: string) => void;
}

export function JournalEntryTable({ entries, onDelete }: JournalEntryTableProps) {
  if (entries.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-10 text-center">
        <p className="text-sm text-slate-500">No journal entries match your search.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="text-left font-medium text-slate-500 px-5 py-4">Reference</th>
              <th className="text-left font-medium text-slate-500 px-2 py-4">Date</th>
              <th className="text-left font-medium text-slate-500 px-2 py-4">Description</th>
              <th className="text-right font-medium text-slate-500 px-2 py-4">Debit</th>
              <th className="text-right font-medium text-slate-500 px-2 py-4">Credit</th>
              <th className="text-left font-medium text-slate-500 px-2 py-4">Status</th>
              <th className="text-right font-medium text-slate-500 px-5 py-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => {
              const { debit, credit } = totals(entry);
              return (
                <tr key={entry.id} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
                        <NotebookPen className="w-4 h-4 text-indigo-600" />
                      </div>
                      <Link
                        href={`/dashboard/accounting/entries/${entry.id}/view`}
                        className="font-semibold text-slate-800 font-mono text-xs hover:text-indigo-600 hover:underline transition-colors"
                      >
                        {entry.reference}
                      </Link>
                    </div>
                  </td>
                  <td className="px-2 py-4 text-slate-500">{formatDate(entry.date)}</td>
                  <td className="px-2 py-4 text-slate-600 max-w-xs truncate" title={entry.description}>{entry.description || "\u2014"}</td>
                  <td className="px-2 py-4 text-right text-slate-700">{formatCurrency(debit, entry.currency)}</td>
                  <td className="px-2 py-4 text-right text-slate-700">{formatCurrency(credit, entry.currency)}</td>
                  <td className="px-2 py-4"><StatusPill posted={entry.posted} /></td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/dashboard/accounting/entries/${entry.id}/view`}
                        aria-label={`View ${entry.reference}`}
                        className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Link>
                      <Link
                        href={`/dashboard/accounting/entries/${entry.id}`}
                        aria-label={`Edit ${entry.reference}`}
                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </Link>
                      <button type="button" onClick={() => onDelete(entry.id)} aria-label={`Delete ${entry.reference}`} className="w-8 h-8 flex items-center justify-center rounded-lg bg-rose-600 text-white hover:bg-rose-700 transition-colors">
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