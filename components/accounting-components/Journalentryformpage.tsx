"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Calendar, Plus, Trash2, Save } from "lucide-react";
import { ACCOUNT_OPTIONS, CURRENCY_OPTIONS, generateReference } from "@/components/accounting-components/Journalentrydata";
import type { JournalEntry, JournalLine } from "@/components/accounting-components/Journalentrymanager";

interface JournalEntryFormPageProps {
  initialValue?: JournalEntry | null;
  onSave: (data: Omit<JournalEntry, "id"> & { id?: string }) => void;
}

function emptyLine(): JournalLine {
  return { id: crypto.randomUUID(), account: "", description: "", debit: 0, credit: 0 };
}

function formatDateInput(value: string) {
  if (!value) return "";
  return value;
}

export default function JournalEntryFormPage({ initialValue, onSave }: JournalEntryFormPageProps) {
  const router = useRouter();
  const isEdit = !!initialValue;

  const [reference, setReference] = useState(initialValue?.reference ?? generateReference());
  const [date, setDate] = useState(initialValue?.date ?? new Date().toISOString().split("T")[0]);
  const [currency, setCurrency] = useState(
    initialValue ? CURRENCY_OPTIONS.find((c) => c.startsWith(initialValue.currency)) ?? CURRENCY_OPTIONS[0] : CURRENCY_OPTIONS[0]
  );
  const [description, setDescription] = useState(initialValue?.description ?? "");
  const [postImmediately, setPostImmediately] = useState(initialValue?.posted ?? false);
  const [lines, setLines] = useState<JournalLine[]>(
    initialValue?.lines && initialValue.lines.length > 0 ? initialValue.lines : [emptyLine(), emptyLine()]
  );

  const currencyCode = currency.split(" - ")[0];
  const totalDebit = lines.reduce((sum, l) => sum + (Number(l.debit) || 0), 0);
  const totalCredit = lines.reduce((sum, l) => sum + (Number(l.credit) || 0), 0);
  const isBalanced = totalDebit === totalCredit && totalDebit > 0;

  const updateLine = (id: string, patch: Partial<JournalLine>) => {
    setLines((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  };

  const addLine = () => setLines((prev) => [...prev, emptyLine()]);

  const removeLine = (id: string) => {
    if (lines.length <= 2) return; // keep at least 2 lines for double-entry
    setLines((prev) => prev.filter((l) => l.id !== id));
  };

  const handleSave = () => {
    if (!isBalanced) return;
    onSave({
      id: initialValue?.id,
      reference,
      date,
      currency: currencyCode,
      description,
      posted: postImmediately,
      lines: lines.filter((l) => l.account),
    });
  };

  const fieldClass = "w-full px-4 py-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent";

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
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
          <h1 className="text-2xl font-bold text-slate-800">{isEdit ? "Edit Journal Entry" : "New Journal Entry"}</h1>
          <p className="text-sm text-slate-500">
            {isEdit ? "Update the details for this journal entry" : "Create a new journal entry in the general ledger"}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col gap-6">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Journal Entry Information</h2>
          <p className="text-sm text-slate-500">Enter the details for this journal entry</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-slate-800">Reference</label>
            <input type="text" value={reference} onChange={(e) => setReference(e.target.value)} className={fieldClass} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-slate-800">Date</label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input type="date" value={formatDateInput(date)} onChange={(e) => setDate(e.target.value)} className={`${fieldClass} pl-11`} />
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Preview: {date ? new Date(date).toLocaleDateString("en-GB") : "\u2014"}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-1 sm:w-1/2">
          <label className="text-sm font-semibold text-slate-800">Currency</label>
          <select value={currency} onChange={(e) => setCurrency(e.target.value)} className={`${fieldClass} bg-white`}>
            {CURRENCY_OPTIONS.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold text-slate-800">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Enter a description for this journal entry"
            className={`${fieldClass} resize-none`}
          />
        </div>

        <label className="flex items-center gap-3 cursor-pointer w-fit">
          <button
            type="button"
            onClick={() => setPostImmediately((v) => !v)}
            className={`w-10 h-6 rounded-full transition-colors relative ${postImmediately ? "bg-indigo-600" : "bg-slate-200"}`}
          >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${postImmediately ? "translate-x-4" : "translate-x-0"}`} />
          </button>
          <span className="text-sm font-medium text-slate-800">Post immediately</span>
        </label>

        {/* Journal Lines */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-bold text-slate-800">Journal Lines</h3>
            <button
              type="button"
              onClick={addLine}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-300 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Line
            </button>
          </div>

          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="text-left font-medium text-slate-500 px-4 py-2.5 min-w-[180px]">Account</th>
                    <th className="text-left font-medium text-slate-500 px-4 py-2.5 min-w-[180px]">Description</th>
                    <th className="text-right font-medium text-slate-500 px-4 py-2.5 min-w-[140px]">Debit</th>
                    <th className="text-right font-medium text-slate-500 px-4 py-2.5 min-w-[140px]">Credit</th>
                    <th className="w-10" />
                  </tr>
                </thead>
                <tbody>
                  {lines.map((line) => (
                    <tr key={line.id} className="border-b border-slate-100 last:border-b-0">
                      <td className="px-4 py-2.5">
                        <select
                          value={line.account}
                          onChange={(e) => updateLine(line.id, { account: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        >
                          <option value="">Select account</option>
                          {ACCOUNT_OPTIONS.map((a) => (
                            <option key={a} value={a}>{a}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-2.5">
                        <input
                          type="text"
                          value={line.description}
                          onChange={(e) => updateLine(line.id, { description: e.target.value })}
                          placeholder="Description"
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                      </td>
                      <td className="px-4 py-2.5">
                        <input
                          type="number"
                          min="0"
                          value={line.debit || ""}
                          onChange={(e) => updateLine(line.id, { debit: Number(e.target.value) || 0, credit: 0 })}
                          placeholder="0.00"
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm text-right focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                      </td>
                      <td className="px-4 py-2.5">
                        <input
                          type="number"
                          min="0"
                          value={line.credit || ""}
                          onChange={(e) => updateLine(line.id, { credit: Number(e.target.value) || 0, debit: 0 })}
                          placeholder="0.00"
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm text-right focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                      </td>
                      <td className="px-2 py-2.5 text-center">
                        <button
                          type="button"
                          onClick={() => removeLine(line.id)}
                          disabled={lines.length <= 2}
                          aria-label="Remove line"
                          className="text-slate-400 hover:text-rose-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-50 border-t border-slate-200">
                    <td colSpan={2} className="px-4 py-3 text-sm font-semibold text-slate-800">Total</td>
                    <td className="px-4 py-3 text-right text-sm font-semibold text-slate-800">
                      {currencyCode} {totalDebit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-semibold text-slate-800">
                      {currencyCode} {totalCredit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td />
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {!isBalanced && (
            <p className="text-xs text-rose-500 mt-2">
              Debit and Credit totals must be equal (and greater than zero) before saving.
            </p>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={() => router.push("/dashboard/accounting/entries")}
            className="px-5 py-2.5 rounded-lg border border-slate-300 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!isBalanced}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Save className="w-4 h-4" />
            Save Journal Entry
          </button>
        </div>
      </div>
    </div>
  );
}