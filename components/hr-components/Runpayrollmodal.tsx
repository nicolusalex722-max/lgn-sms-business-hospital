"use client";

import { useMemo, useState } from "react";
import { PlayCircle } from "lucide-react";

export interface PayrollEmployee {
  name: string;
  salary: number;
}

interface RunPayrollModalProps {
  employees: PayrollEmployee[];
  onRun: (data: { month: string; payDate: string }) => void;
  onCancel: () => void;
}

function formatCurrency(value: number) {
  return `TZS ${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

function defaultMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export default function RunPayrollModal({ employees, onRun, onCancel }: RunPayrollModalProps) {
  const [month, setMonth] = useState(defaultMonth());
  const [payDate, setPayDate] = useState(new Date().toISOString().split("T")[0]);

  const total = useMemo(() => employees.reduce((sum, e) => sum + e.salary, 0), [employees]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!month || !payDate) return;
    onRun({ month, payDate });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Payroll Month *</label>
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            required
            className="px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Pay Date *</label>
          <input
            type="date"
            value={payDate}
            onChange={(e) => setPayDate(e.target.value)}
            required
            className="px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="border border-slate-200 rounded-lg overflow-hidden">
        <div className="bg-slate-50 px-4 py-2.5 flex items-center justify-between text-xs font-medium text-slate-500">
          <span>Employee</span>
          <span>Salary</span>
        </div>
        <div className="max-h-48 overflow-y-auto">
          {employees.map((emp) => (
            <div key={emp.name} className="px-4 py-2.5 flex items-center justify-between text-sm border-t border-slate-100">
              <span className="text-slate-700">{emp.name}</span>
              <span className="text-slate-600">{formatCurrency(emp.salary)}</span>
            </div>
          ))}
        </div>
        <div className="px-4 py-3 flex items-center justify-between text-sm font-semibold text-slate-800 border-t border-slate-200 bg-slate-50">
          <span>Total ({employees.length} employees)</span>
          <span>{formatCurrency(total)}</span>
        </div>
      </div>

      <p className="text-xs text-slate-400">
        Running payroll marks every employee&apos;s payment as &ldquo;Processing Payment&rdquo; for this month. Mark each one Paid once the transfer completes.
      </p>

      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-lg border border-slate-300 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          <PlayCircle className="w-4 h-4" />
          Run Payroll
        </button>
      </div>
    </form>
  );
}