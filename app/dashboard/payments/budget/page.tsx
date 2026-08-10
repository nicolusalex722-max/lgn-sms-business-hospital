"use client";

import { useMemo, useState } from "react";
import StatCard from "@/components/budget-components/Budgetstatcard";
import StatusBadge from "@/components/budget-components/Budgetstatusbadge";
import ProgressBar from "@/components/budget-components/Budgetprogressbar";
import BudgetFormModal from "@/components/budget-components/Budgetformmodal";
import MovementsModal from "@/components/budget-components/Movementmodal";
import { CATEGORIES, MOCK_BUDGETS, PERIOD_TYPES } from "@/lib/data";
import { computeBudgetStatus, computeBudgetTotals, formatTZS } from "@/lib/utils";
import type { Budget, BudgetMovement, BudgetPeriodType, BudgetStatus } from "@/lib/types";

type CategoryFilter = "All" | (typeof CATEGORIES)[number];
type PeriodFilter = "All" | BudgetPeriodType;
type StatusFilter = "All" | BudgetStatus;

export default function BudgetPage() {
  const [budgets, setBudgets] = useState<Budget[]>(MOCK_BUDGETS);
  const [createOpen, setCreateOpen] = useState(false);
  const [viewingId, setViewingId] = useState<string | null>(null);

  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("All");
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>("All");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");

  const filtered = useMemo(() => {
    return budgets.filter((b) => {
      const q = query.trim().toLowerCase();
      const haystack = `${b.category} ${b.periodLabel}`.toLowerCase();
      const matchesQuery = !q || haystack.includes(q);
      const matchesCategory = categoryFilter === "All" || b.category === categoryFilter;
      const matchesPeriod = periodFilter === "All" || b.periodType === periodFilter;
      const matchesStatus = statusFilter === "All" || computeBudgetStatus(b) === statusFilter;
      return matchesQuery && matchesCategory && matchesPeriod && matchesStatus;
    });
  }, [budgets, query, categoryFilter, periodFilter, statusFilter]);

  const summary = useMemo(() => {
    let allocated = 0;
    let spent = 0;
    let overBudget = 0;
    for (const b of filtered) {
      const t = computeBudgetTotals(b);
      allocated += b.allocated;
      spent += t.spent;
      if (computeBudgetStatus(b) === "Over Budget") overBudget += 1;
    }
    return { allocated, spent, remaining: allocated - spent, overBudget };
  }, [filtered]);

  function saveBudget(data: Omit<Budget, "id" | "movements">) {
    setBudgets((rows) => [{ ...data, id: crypto.randomUUID(), movements: [] }, ...rows]);
    setCreateOpen(false);
  }

  function logMovement(budgetId: string, movement: Omit<BudgetMovement, "id">) {
    setBudgets((rows) =>
      rows.map((b) =>
        b.id === budgetId ? { ...b, movements: [...b.movements, { ...movement, id: crypto.randomUUID() }] } : b
      )
    );
  }

  function clearFilters() {
    setQuery("");
    setCategoryFilter("All");
    setPeriodFilter("All");
    setStatusFilter("All");
  }

  const hasFilters = query || categoryFilter !== "All" || periodFilter !== "All" || statusFilter !== "All";
  const viewingBudget = viewingId ? budgets.find((b) => b.id === viewingId) ?? null : null;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <header className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Budget</h1>
            <p className="mt-1 text-sm text-slate-500">Allocate spending limits and track budget movement by category</p>
          </div>
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="flex items-center gap-1.5 rounded-lg bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-600"
          >
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none">
              <path d="M10 4v12M4 10h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
            New Budget
          </button>
        </header>

        {/* Summary cards */}
        <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard label="Total allocated" value={formatTZS(summary.allocated)} helper={hasFilters ? "Matching current filters" : "All budgets"} />
          <StatCard label="Total spent" value={formatTZS(summary.spent)} accent="indigo" />
          <StatCard
            label="Remaining"
            value={formatTZS(summary.remaining)}
            accent={summary.remaining < 0 ? "rose" : "emerald"}
          />
          <StatCard label="Over budget" value={summary.overBudget} accent="rose" helper="Categories exceeding allocation" />
        </div>

        {/* Filters */}
        <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 md:flex-row md:flex-wrap md:items-center">
          <div className="flex flex-1 items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 md:min-w-[200px]">
            <svg className="h-4 w-4 text-slate-400" viewBox="0 0 20 20" fill="none">
              <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.6" />
              <path d="M14 14l4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search category or period..."
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
            value={periodFilter}
            onChange={(e) => setPeriodFilter(e.target.value as PeriodFilter)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500"
          >
            <option value="All">All periods</option>
            {PERIOD_TYPES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500"
          >
            <option value="All">All statuses</option>
            <option value="On Track">On Track</option>
            <option value="Near Limit">Near Limit</option>
            <option value="Over Budget">Over Budget</option>
          </select>

          {hasFilters && (
            <button type="button" onClick={clearFilters} className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
              Clear filters
            </button>
          )}
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60 text-xs font-semibold uppercase tracking-wide text-slate-400">
                <th className="px-6 py-3">Category</th>
                <th className="px-6 py-3">Period</th>
                <th className="px-6 py-3 text-right">Allocated</th>
                <th className="px-6 py-3 text-right">Spent</th>
                <th className="px-6 py-3 text-right">Remaining</th>
                <th className="px-6 py-3">Movement</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((b) => {
                const { spent, remaining, percentUsed } = computeBudgetTotals(b);
                const status = computeBudgetStatus(b);
                return (
                  <tr key={b.id} className="text-sm text-slate-700">
                    <td className="px-6 py-4 font-medium text-slate-900">{b.category}</td>
                    <td className="px-6 py-4 text-slate-500">
                      {b.periodLabel}
                      <p className="text-xs text-slate-400">{b.periodType}</p>
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-slate-700">{formatTZS(b.allocated)}</td>
                    <td className="px-6 py-4 text-right font-mono text-slate-700">{formatTZS(spent)}</td>
                    <td className={`px-6 py-4 text-right font-mono font-semibold ${remaining < 0 ? "text-rose-500" : "text-slate-800"}`}>
                      {formatTZS(remaining)}
                    </td>
                    <td className="px-6 py-4">
                      <ProgressBar percent={percentUsed} status={status} />
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => setViewingId(b.id)}
                        className="whitespace-nowrap rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
                      >
                        Log spend
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-10 text-center text-sm text-slate-400">
                    No budgets match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {createOpen && <BudgetFormModal onClose={() => setCreateOpen(false)} onSave={saveBudget} />}
      {viewingBudget && (
        <MovementsModal
          budget={viewingBudget}
          onClose={() => setViewingId(null)}
          onLogMovement={(movement) => logMovement(viewingBudget.id, movement)}
        />
      )}
    </div>
  );
}
