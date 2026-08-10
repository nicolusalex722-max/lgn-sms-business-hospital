"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import StatCard from "./Billingstatcard";
import StatusBadge from "./Billingstatusbadge";
import RecordPaymentModal from "./Billingrecordpaymentmodal";
import { computeStatus, computeTotals, formatDateDMY, formatTZS, isOverdue } from "@/lib/utils";
import type { BillingDocument, DocStatus, DocType, PaymentRecord } from "@/lib/types";

type StatusFilter = "All" | DocStatus;

export default function DocumentsTab({
  type,
  documents,
  onRecordPayment,
}: {
  type: DocType;
  documents: BillingDocument[];
  onRecordPayment: (docId: string, payment: Omit<PaymentRecord, "id">) => void;
}) {
  const isInvoice = type === "invoice";
  const partyColumnLabel = isInvoice ? "Customer" : "Supplier";

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [payingDoc, setPayingDoc] = useState<BillingDocument | null>(null);

  const filtered = useMemo(() => {
    return documents
      .filter((d) => {
        const q = query.trim().toLowerCase();
        const haystack = `${d.number} ${d.partyName}`.toLowerCase();
        const matchesQuery = !q || haystack.includes(q);
        const matchesStatus = statusFilter === "All" || computeStatus(d) === statusFilter;
        const matchesFrom = !dateFrom || d.date >= dateFrom;
        const matchesTo = !dateTo || d.date <= dateTo;
        return matchesQuery && matchesStatus && matchesFrom && matchesTo;
      })
      .sort((a, b) => (a.date < b.date ? 1 : -1));
  }, [documents, query, statusFilter, dateFrom, dateTo]);

  const summary = useMemo(() => {
    let outstanding = 0;
    let paid = 0;
    let overdue = 0;
    for (const d of filtered) {
      const t = computeTotals(d);
      outstanding += t.balanceDue;
      paid += t.amountPaid;
      if (isOverdue(d)) overdue += 1;
    }
    return { outstanding, paid, overdue, count: filtered.length };
  }, [filtered]);

  function clearFilters() {
    setQuery("");
    setStatusFilter("All");
    setDateFrom("");
    setDateTo("");
  }

  const hasFilters = query || statusFilter !== "All" || dateFrom || dateTo;

  return (
    <div>
      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Outstanding" value={formatTZS(summary.outstanding)} accent="amber" helper={isInvoice ? "Owed by customers" : "Owed to suppliers"} />
        <StatCard label="Paid" value={formatTZS(summary.paid)} accent="emerald" />
        <StatCard label="Overdue" value={summary.overdue} accent="rose" helper="Past due date" />
        <StatCard label={isInvoice ? "Invoices" : "Bills"} value={summary.count} helper={hasFilters ? "Matching filters" : "All time"} />
      </div>

      <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 md:flex-row md:flex-wrap md:items-center">
        <div className="flex flex-1 items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 md:min-w-[220px]">
          <svg className="h-4 w-4 text-slate-400" viewBox="0 0 20 20" fill="none">
            <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.6" />
            <path d="M14 14l4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search ${isInvoice ? "invoice" : "bill"} number or ${partyColumnLabel.toLowerCase()}...`}
            className="w-full text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500"
        >
          <option value="All">All statuses</option>
          <option value="Paid">Paid</option>
          <option value="Partially Paid">Partially Paid</option>
          <option value="Not Paid">Not Paid</option>
          <option value="Void">Void</option>
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
          <button type="button" onClick={clearFilters} className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
            Clear filters
          </button>
        )}
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/60 text-xs font-semibold uppercase tracking-wide text-slate-400">
              <th className="px-6 py-3">Number</th>
              <th className="px-6 py-3">{partyColumnLabel}</th>
              <th className="px-6 py-3">Date</th>
              <th className="px-6 py-3">Due Date</th>
              <th className="px-6 py-3 text-right">Total</th>
              <th className="px-6 py-3 text-right">Balance Due</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((d) => {
              const status = computeStatus(d);
              const { total, balanceDue } = computeTotals(d);
              const canRecordPayment = status === "Not Paid" || status === "Partially Paid";
              return (
                <tr key={d.id} className="text-sm text-slate-700">
                  <td className="px-6 py-4 font-medium text-slate-900">{d.number}</td>
                  <td className="px-6 py-4 text-slate-600">{d.partyName}</td>
                  <td className="px-6 py-4 text-slate-500">{formatDateDMY(d.date)}</td>
                  <td className={`px-6 py-4 ${isOverdue(d) ? "font-medium text-rose-500" : "text-slate-500"}`}>
                    {formatDateDMY(d.dueDate)}
                  </td>
                  <td className="px-6 py-4 text-right font-mono text-slate-700">{formatTZS(total)}</td>
                  <td className="px-6 py-4 text-right font-mono font-semibold text-slate-800">{formatTZS(balanceDue)}</td>
                  <td className="px-6 py-4">
                    <StatusBadge status={status} />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      {canRecordPayment && (
                        <button
                          type="button"
                          onClick={() => setPayingDoc(d)}
                          className="whitespace-nowrap rounded-lg bg-indigo-500 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-indigo-600"
                        >
                          Record Payment
                        </button>
                      )}
                      <Link
                        href={`/billing/${type === "invoice" ? "invoices" : "bills"}/${d.id}`}
                        className="rounded-lg p-2 text-slate-400 transition hover:bg-indigo-50 hover:text-indigo-600"
                        aria-label={`View ${d.number}`}
                      >
                        <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none">
                          <path d="M1.5 10S4.5 4 10 4s8.5 6 8.5 6-3 6-8.5 6-8.5-6-8.5-6z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                          <circle cx="10" cy="10" r="2.2" stroke="currentColor" strokeWidth="1.5" />
                        </svg>
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="px-6 py-10 text-center text-sm text-slate-400">
                  No {isInvoice ? "invoices" : "bills"} match your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {payingDoc && (
        <RecordPaymentModal
          doc={payingDoc}
          onClose={() => setPayingDoc(null)}
          onRecord={(payment) => {
            onRecordPayment(payingDoc.id, payment);
            setPayingDoc(null);
          }}
        />
      )}
    </div>
  );
}