"use client";

import Modal from "./Expensemodal";
import CategoryBadge from "./Expensecategorycard";
import type { Expense } from "@/lib/types";

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 py-3 last:border-0">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="text-sm font-medium text-slate-800">{value}</span>
    </div>
  );
}

export default function ExpenseViewModal({
  expense,
  onClose,
  onDelete,
}: {
  expense: Expense;
  onClose: () => void;
  onDelete: (id: string) => void;
}) {
  return (
    <Modal title="Expense details" subtitle={expense.date} onClose={onClose}>
      <div className="mb-5 flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-3">
        <div>
          <p className="text-sm font-semibold text-slate-800">{expense.vendor}</p>
          <div className="mt-1">
            <CategoryBadge category={expense.category} />
          </div>
        </div>
        <p className="text-xl font-bold text-slate-900">TZS {expense.amount.toLocaleString()}</p>
      </div>

      <div>
        <Row label="Date" value={expense.date} />
        <Row label="Category" value={expense.category} />
        <Row label="Vendor / Payee" value={expense.vendor} />
        <Row label="Payment method" value={expense.method} />
        <Row label="Paid from" value={expense.account} />
        <Row label="Reference" value={expense.reference ?? "—"} />
      </div>

      {expense.description && (
        <div className="mt-4">
          <p className="mb-1.5 text-sm font-semibold text-slate-800">Description</p>
          <p className="rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-600">{expense.description}</p>
        </div>
      )}

      <div className="mt-6 flex justify-end gap-2">
        <button
          type="button"
          onClick={() => onDelete(expense.id)}
          className="rounded-lg px-4 py-2.5 text-sm font-semibold text-rose-500 hover:bg-rose-50"
        >
          Delete
        </button>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg bg-indigo-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-600"
        >
          Close
        </button>
      </div>
    </Modal>
  );
}