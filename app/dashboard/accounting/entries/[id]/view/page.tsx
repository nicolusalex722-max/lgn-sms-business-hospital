"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Pencil, Calendar, DollarSign, FileText } from "lucide-react";
import { getJournalEntryById } from "@/components/accounting-components/Journalentrydata";

function formatCurrency(value: number, currency: string) {
  const symbol = currency === "TZS" ? "TSh" : currency;
  return `${symbol} ${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(value: string) {
  if (!value) return "\u2014";
  return new Date(value).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
}

export default function ViewJournalEntryPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const entry = getJournalEntryById(params.id);

  if (!entry) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-10 text-center">
        <p className="text-sm text-slate-500">Journal entry not found.</p>
        <button type="button" onClick={() => router.push("/dashboard/accounting/entries")} className="mt-3 text-sm font-medium text-indigo-600 hover:text-indigo-700">
          Back to Entries
        </button>
      </div>
    );
  }

  const totalDebit = entry.lines.reduce((sum, l) => sum + (l.debit || 0), 0);
  const totalCredit = entry.lines.reduce((sum, l) => sum + (l.credit || 0), 0);

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <button
            type="button"
            onClick={() => router.push("/dashboard/accounting/entries")}
            aria-label="Back to Entries"
            className="mt-1 w-9 h-9 flex items-center justify-center rounded-lg border border-slate-300 text-slate-500 hover:bg-slate-50 transition-colors shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold text-slate-800 font-mono">{entry.reference}</h1>
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${entry.posted ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                {entry.posted ? "Posted" : "Draft"}
              </span>
            </div>
            <p className="text-sm text-slate-500">Journal entry details</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => router.push(`/dashboard/accounting/entries/${entry.id}`)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors shrink-0"
        >
          <Pencil className="w-4 h-4" />
          Edit Entry
        </button>
      </div>

      {/* Summary */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-sm font-semibold text-slate-800 mb-4">Journal Entry Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-sky-50 flex items-center justify-center shrink-0">
              <Calendar className="w-4 h-4 text-sky-600" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Date</p>
              <p className="text-sm font-medium text-slate-800">{formatDate(entry.date)}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
              <DollarSign className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Currency</p>
              <p className="text-sm font-medium text-slate-800">{entry.currency}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4 text-indigo-600" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Description</p>
              <p className="text-sm font-medium text-slate-800">{entry.description || "\u2014"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Journal Lines (read-only) */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-sm font-semibold text-slate-800 mb-4">Journal Lines</h2>
        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left font-medium text-slate-500 px-4 py-2.5">Account</th>
                  <th className="text-left font-medium text-slate-500 px-4 py-2.5">Description</th>
                  <th className="text-right font-medium text-slate-500 px-4 py-2.5">Debit</th>
                  <th className="text-right font-medium text-slate-500 px-4 py-2.5">Credit</th>
                </tr>
              </thead>
              <tbody>
                {entry.lines.map((line) => (
                  <tr key={line.id} className="border-b border-slate-100 last:border-b-0">
                    <td className="px-4 py-2.5 font-medium text-slate-800">{line.account || "\u2014"}</td>
                    <td className="px-4 py-2.5 text-slate-600">{line.description || "\u2014"}</td>
                    <td className="px-4 py-2.5 text-right text-slate-700">
                      {line.debit > 0 ? formatCurrency(line.debit, entry.currency) : "\u2014"}
                    </td>
                    <td className="px-4 py-2.5 text-right text-slate-700">
                      {line.credit > 0 ? formatCurrency(line.credit, entry.currency) : "\u2014"}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-slate-50 border-t border-slate-200">
                  <td colSpan={2} className="px-4 py-3 text-sm font-semibold text-slate-800">Total</td>
                  <td className="px-4 py-3 text-right text-sm font-semibold text-slate-800">{formatCurrency(totalDebit, entry.currency)}</td>
                  <td className="px-4 py-3 text-right text-sm font-semibold text-slate-800">{formatCurrency(totalCredit, entry.currency)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}