"use client";

import { CheckCircle2 } from "lucide-react";

export interface AccommodationInvoice {
  id: string;
  studentName: string;
  room: string;
  term: string;
  amount: number;
  dueDate: string;
  status: "Unpaid" | "Paid";
}

interface AccommodationInvoiceTableProps {
  invoices: AccommodationInvoice[];
  onMarkPaid: (id: string) => void;
}

function formatCurrency(value: number) {
  return `TZS ${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

function formatDate(value: string) {
  if (!value) return "\u2014";
  return new Date(value).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function StatusPill({ status }: { status: string }) {
  const style = status === "Paid" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700";
  return <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${style}`}>{status}</span>;
}

export default function AccommodationInvoiceTable({ invoices, onMarkPaid }: AccommodationInvoiceTableProps) {
  if (invoices.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-10 text-center">
        <p className="text-sm text-slate-500">No invoices yet. Generate one from a room assignment above.</p>
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
              <th className="text-left font-medium text-slate-500 px-2 py-4">Term</th>
              <th className="text-right font-medium text-slate-500 px-2 py-4">Amount</th>
              <th className="text-left font-medium text-slate-500 px-2 py-4">Due Date</th>
              <th className="text-left font-medium text-slate-500 px-2 py-4">Status</th>
              <th className="text-right font-medium text-slate-500 px-5 py-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv) => (
              <tr key={inv.id} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50">
                <td className="px-5 py-4 font-semibold text-slate-800">{inv.studentName}</td>
                <td className="px-2 py-4 text-slate-600">{inv.room}</td>
                <td className="px-2 py-4 text-slate-600">{inv.term}</td>
                <td className="px-2 py-4 text-right text-slate-700">{formatCurrency(inv.amount)}</td>
                <td className="px-2 py-4 text-slate-500">{formatDate(inv.dueDate)}</td>
                <td className="px-2 py-4"><StatusPill status={inv.status} /></td>
                <td className="px-5 py-4 text-right">
                  {inv.status === "Unpaid" ? (
                    <button
                      type="button"
                      onClick={() => onMarkPaid(inv.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-700 transition-colors"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Mark as Paid
                    </button>
                  ) : (
                    <span className="text-xs text-slate-400">&mdash;</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}