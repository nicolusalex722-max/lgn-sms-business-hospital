"use client";

import { useMemo, useState } from "react";
import StatCard from "@/components/payments-components/Statcards";
import TransactionTypeBadge from "@/components/payments-components/Transactiontypebadge";
import PayReceiveModal from "@/components/payments-components/Payreceivemodal";
import TransferFundsModal from "@/components/payments-components/Transferfundsmodal";
import { MOCK_TRANSACTIONS, PAYMENT_METHODS } from "@/lib/data";
import type { TransactionPayment, TransactionType } from "@/lib/types";

type TypeFilter = "All" | TransactionType;
type MethodFilter = "All" | (typeof PAYMENT_METHODS)[number] | "Account Transfer";

type ModalKind = "pay" | "receive" | "transfer" | null;

export default function PaymentsPage() {
  const [transactions, setTransactions] = useState<TransactionPayment[]>(MOCK_TRANSACTIONS);
  const [modal, setModal] = useState<ModalKind>(null);

  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("All");
  const [methodFilter, setMethodFilter] = useState<MethodFilter>("All");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      const q = query.trim().toLowerCase();
      const haystack = [t.partyName, t.fromAccount, t.toAccount, t.reference].filter(Boolean).join(" ").toLowerCase();
      const matchesQuery = !q || haystack.includes(q);
      const matchesType = typeFilter === "All" || t.type === typeFilter;
      const matchesMethod = methodFilter === "All" || t.method === methodFilter;
      const matchesFrom = !dateFrom || t.date >= dateFrom;
      const matchesTo = !dateTo || t.date <= dateTo;
      return matchesQuery && matchesType && matchesMethod && matchesFrom && matchesTo;
    });
  }, [transactions, query, typeFilter, methodFilter, dateFrom, dateTo]);

  const summary = useMemo(() => {
    const received = filtered.filter((t) => t.type === "Receive").reduce((s, t) => s + t.amount, 0);
    const paid = filtered.filter((t) => t.type === "Pay").reduce((s, t) => s + t.amount, 0);
    const transferred = filtered.filter((t) => t.type === "Transfer").reduce((s, t) => s + t.amount, 0);
    return { received, paid, transferred, count: filtered.length };
  }, [filtered]);

  function addTransaction(type: TransactionType, data: Omit<TransactionPayment, "id" | "type">) {
    setTransactions((rows) => [{ ...data, id: crypto.randomUUID(), type }, ...rows]);
    setModal(null);
  }

  function clearFilters() {
    setQuery("");
    setTypeFilter("All");
    setMethodFilter("All");
    setDateFrom("");
    setDateTo("");
  }

  const hasFilters = query || typeFilter !== "All" || methodFilter !== "All" || dateFrom || dateTo;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Payments</h1>
          <p className="mt-1 text-sm text-slate-500">Pay suppliers, receive from students, and move funds between accounts</p>
        </header>

        {/* Summary cards — reflect the current table filters */}
        <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard label="Total received" value={`TZS ${summary.received.toLocaleString()}`} accent="emerald" helper="From students" />
          <StatCard label="Total paid" value={`TZS ${summary.paid.toLocaleString()}`} accent="rose" helper="To suppliers" />
          <StatCard label="Total transferred" value={`TZS ${summary.transferred.toLocaleString()}`} accent="indigo" helper="Between accounts" />
          <StatCard label="Transactions" value={summary.count} helper={hasFilters ? "Matching current filters" : "All time"} />
        </div>

        {/* Actions */}
        <div className="mb-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setModal("receive")}
            className="flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-700 shadow-sm transition hover:bg-emerald-100"
          >
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none">
              <path d="M10 4v9m0 0l-3.5-3.5M10 13l3.5-3.5M4 16h12" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Receive
          </button>
          <button
            type="button"
            onClick={() => setModal("pay")}
            className="flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-semibold text-rose-700 shadow-sm transition hover:bg-rose-100"
          >
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none">
              <path d="M10 16V7m0 0l-3.5 3.5M10 7l3.5 3.5M4 4h12" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Pay
          </button>
          <button
            type="button"
            onClick={() => setModal("transfer")}
            className="flex items-center gap-1.5 rounded-lg bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-600"
          >
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none">
              <path d="M3 8h10m0 0l-3-3m3 3l-3 3M17 12H7m0 0l3 3m-3-3l3-3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Transfer Funds
          </button>
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
              placeholder="Search party, account, or reference..."
              className="w-full text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
            />
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as TypeFilter)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500"
          >
            <option value="All">All types</option>
            <option value="Pay">Pay</option>
            <option value="Receive">Receive</option>
            <option value="Transfer">Transfer</option>
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
            <option value="Account Transfer">Account Transfer</option>
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
                <th className="px-6 py-3">Type</th>
                <th className="px-6 py-3">Party / Accounts</th>
                <th className="px-6 py-3">Method</th>
                <th className="px-6 py-3">Reference</th>
                <th className="px-6 py-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((t) => (
                <tr key={t.id} className="text-sm text-slate-700">
                  <td className="px-6 py-4 text-slate-500">{t.date}</td>
                  <td className="px-6 py-4">
                    <TransactionTypeBadge type={t.type} />
                  </td>
                  <td className="px-6 py-4">
                    {t.type === "Transfer" ? (
                      <span className="font-medium text-slate-900">
                        {t.fromAccount} <span className="text-slate-400">→</span> {t.toAccount}
                      </span>
                    ) : (
                      <div>
                        <p className="font-medium text-slate-900">{t.partyName}</p>
                        <p className="text-xs text-slate-400">{t.partyType}</p>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-slate-500">{t.method}</td>
                  <td className="px-6 py-4 text-slate-500">{t.reference ?? "—"}</td>
                  <td
                    className={`px-6 py-4 text-right font-mono font-semibold ${
                      t.type === "Receive" ? "text-emerald-600" : t.type === "Pay" ? "text-rose-600" : "text-slate-700"
                    }`}
                  >
                    {t.type === "Receive" ? "+" : t.type === "Pay" ? "-" : ""}
                    TZS {t.amount.toLocaleString()}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-sm text-slate-400">
                    No transactions match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modal === "pay" && (
        <PayReceiveModal mode="Pay" onClose={() => setModal(null)} onSubmit={(data) => addTransaction("Pay", data)} />
      )}
      {modal === "receive" && (
        <PayReceiveModal
          mode="Receive"
          onClose={() => setModal(null)}
          onSubmit={(data) => addTransaction("Receive", data)}
        />
      )}
      {modal === "transfer" && (
        <TransferFundsModal onClose={() => setModal(null)} onSubmit={(data) => addTransaction("Transfer", data)} />
      )}
    </div>
  );
}