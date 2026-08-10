"use client";

import { useMemo, useState } from "react";
import StatCard from "@/components/payments-components/Expensestatcard";
import CategoryBadge from "@/components/payments-components/Expensecategorycard";
import ExpenseFormModal from "@/components/payments-components/Expenseformmodal";
import ExpenseViewModal from "@/components/payments-components/Expenseviewmodal";
import { CATEGORIES, MOCK_EXPENSES, PAYMENT_METHODS } from "@/lib/expensedata";
import type { Expense } from "@/lib/types";

type CategoryFilter = "All" | (typeof CATEGORIES)[number];
type MethodFilter = "All" | (typeof PAYMENT_METHODS)[number];

function isThisMonth(dateISO: string) {
  const today = new Date();
  const d = new Date(dateISO);
  return d.getFullYear() === today.getFullYear() && d.getMonth() === today.getMonth();
}

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>(MOCK_EXPENSES);
  const [createOpen, setCreateOpen] = useState(false);
  const [viewing, setViewing] = useState<Expense | null>(null);

  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("All");
  const [methodFilter, setMethodFilter] = useState<MethodFilter>("All");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const filtered = useMemo(() => {
    return expenses
      .filter((e) => {
        const q = query.trim().toLowerCase();
        const haystack = [e.vendor, e.reference, e.description].filter(Boolean).join(" ").toLowerCase();
        const matchesQuery = !q || haystack.includes(q);
        const matchesCategory = categoryFilter === "All" || e.category === categoryFilter;
        const matchesMethod = methodFilter === "All" || e.method === methodFilter;
        const matchesFrom = !dateFrom || e.date >= dateFrom;
        const matchesTo = !dateTo || e.date <= dateTo;
        return matchesQuery && matchesCategory && matchesMethod && matchesFrom && matchesTo;
      })
      .sort((a, b) => (a.date < b.date ? 1 : -1));
  }, [expenses, query, categoryFilter, methodFilter, dateFrom, dateTo]);

  const summary = useMemo(() => {
    const total = filtered.reduce((s, e) => s + e.amount, 0);
    const thisMonth = filtered.filter((e) => isThisMonth(e.date)).reduce((s, e) => s + e.amount, 0);
    return { total, thisMonth, count: filtered.length };
  }, [filtered]);

  function saveExpense(data: Omit<Expense, "id">) {
    setExpenses((rows) => [{ ...data, id: crypto.randomUUID() }, ...rows]);
    setCreateOpen(false);
  }

  function deleteExpense(id: string) {
    setExpenses((rows) => rows.filter((e) => e.id !== id));
    setViewing(null);
  }

  function clearFilters() {
    setQuery("");
    setCategoryFilter("All");
    setMethodFilter("All");
    setDateFrom("");
    setDateTo("");
  }

  const hasFilters = query || categoryFilter !== "All" || methodFilter !== "All" || dateFrom || dateTo;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <header className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Expenses</h1>
            <p className="mt-1 text-sm text-slate-500">Track and record business expenses</p>
          </div>
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="flex items-center gap-1.5 rounded-lg bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-600"
          >
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none">
              <path d="M10 4v12M4 10h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
            New Expense
          </button>
        </header>

        {/* Summary cards — reflect the current table filters */}
        <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-3">
          <StatCard label="Total expenses" value={`TZS ${summary.total.toLocaleString()}`} helper={hasFilters ? "Matching current filters" : "All time"} />
          <StatCard label="This month" value={`TZS ${summary.thisMonth.toLocaleString()}`} helper="Within the filtered results" />
          <StatCard label="Transactions" value={summary.count} />
        </div>

        {/* Filters */}
        <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 md:flex-row md:flex-wrap md:items-center">
          <div className="flex flex-1 items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 md:min-w-[220px]">
            <svg className="h-4 w-4 text-slate-400" viewBox="0 0 20 20" fill="none">
              <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.6" />
              <path d="M14 14l4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search vendor, reference, or description..."
              className="w-full text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as CategoryFilter)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500"
          >
            <option value="All">All categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value as MethodFilter)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500"
          >
            <option value="All">All methods</option>
            {PAYMENT_METHODS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-2">
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500"
            />
            <span className="text-sm text-slate-400">to</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500"
            />
          </div>

          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60 text-xs font-semibold uppercase tracking-wide text-slate-400">
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Vendor</th>
                <th className="px-6 py-3">Category</th>
                <th className="px-6 py-3">Method</th>
                <th className="px-6 py-3">Account</th>
                <th className="px-6 py-3 text-right">Amount</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((e) => (
                <tr key={e.id} className="text-sm text-slate-700">
                  <td className="px-6 py-4 text-slate-500">{e.date}</td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-slate-900">{e.vendor}</p>
                    {e.reference && <p className="text-xs text-slate-400">{e.reference}</p>}
                  </td>
                  <td className="px-6 py-4">
                    <CategoryBadge category={e.category} />
                  </td>
                  <td className="px-6 py-4 text-slate-500">{e.method}</td>
                  <td className="px-6 py-4 text-slate-500">{e.account}</td>
                  <td className="px-6 py-4 text-right font-mono font-semibold text-slate-700">
                    TZS {e.amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      type="button"
                      onClick={() => setViewing(e)}
                      className="rounded-lg p-2 text-slate-400 transition hover:bg-indigo-50 hover:text-indigo-600"
                      aria-label={`View ${e.vendor}`}
                    >
                      <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none">
                        <path
                          d="M1.5 10S4.5 4 10 4s8.5 6 8.5 6-3 6-8.5 6-8.5-6-8.5-6z"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinejoin="round"
                        />
                        <circle cx="10" cy="10" r="2.2" stroke="currentColor" strokeWidth="1.5" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-sm text-slate-400">
                    No expenses match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {createOpen && <ExpenseFormModal onClose={() => setCreateOpen(false)} onSave={saveExpense} />}
      {viewing && <ExpenseViewModal expense={viewing} onClose={() => setViewing(null)} onDelete={deleteExpense} />}
    </div>
  );
}