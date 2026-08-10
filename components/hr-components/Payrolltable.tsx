"use client";

import { CheckCircle2 } from "lucide-react";

export interface PayrollRecord {
  id: string;
  employeeName: string;
  salary: number;
  month: string; // "YYYY-MM"
  payDate: string; // "YYYY-MM-DD"
  status: "Paid" | "Processing Payment";
}

interface PayrollTableProps {
  records: PayrollRecord[];
  onMarkPaid: (id: string) => void;
}

function formatCurrency(value: number) {
  return `TZS ${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

function formatMonth(value: string) {
  if (!value) return "\u2014";
  const [year, month] = value.split("-");
  const date = new Date(Number(year), Number(month) - 1, 1);
  return date.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
}

function formatDate(value: string) {
  if (!value) return "\u2014";
  return new Date(value).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function StatusBadge({ status }: { status: string }) {
  const style = status === "Paid" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700";
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${style}`}>
      {status}
    </span>
  );
}

export default function PayrollTable({ records, onMarkPaid }: PayrollTableProps) {
  if (records.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-10 text-center">
        <p className="text-sm text-slate-500">No payroll history yet. Run payroll to get started.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="text-left font-medium text-slate-500 px-5 py-4">Employee</th>
              <th className="text-right font-medium text-slate-500 px-2 py-4">Salary</th>
              <th className="text-left font-medium text-slate-500 px-2 py-4">Month</th>
              <th className="text-left font-medium text-slate-500 px-2 py-4">Pay Date</th>
              <th className="text-left font-medium text-slate-500 px-2 py-4">Status</th>
              <th className="text-right font-medium text-slate-500 px-5 py-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {records.map((rec) => (
              <tr key={rec.id} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50">
                <td className="px-5 py-4 font-semibold text-slate-800">{rec.employeeName}</td>
                <td className="px-2 py-4 text-right text-slate-700">{formatCurrency(rec.salary)}</td>
                <td className="px-2 py-4 text-slate-600">{formatMonth(rec.month)}</td>
                <td className="px-2 py-4 text-slate-500">{formatDate(rec.payDate)}</td>
                <td className="px-2 py-4">
                  <StatusBadge status={rec.status} />
                </td>
                <td className="px-5 py-4 text-right">
                  {rec.status === "Processing Payment" ? (
                    <button
                      type="button"
                      onClick={() => onMarkPaid(rec.id)}
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