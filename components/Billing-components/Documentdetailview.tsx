"use client";

import { useState } from "react";
import Link from "next/link";
import DocumentTemplate from "./Documenttemplate";
import StatusBadge from "./Billingstatusbadge";
import RecordPaymentModal from "./Billingrecordpaymentmodal";
import SendEmailModal from "./Billingsendmailmodal";
import { MOCK_DOCUMENTS } from "@/lib/data";
import { computeStatus, formatDateDMY, formatTZS } from "@/lib/utils";
import type { BillingDocument, DocType, PaymentRecord } from "@/lib/types";

export default function DocumentDetailView({ type, id }: { type: DocType; id: string }) {
  const isInvoice = type === "invoice";
  const docLabel = isInvoice ? "Invoice" : "Bill";
  const partyLabel = isInvoice ? "Customer" : "Supplier";

  const initial = MOCK_DOCUMENTS.find((d) => d.id === id && d.type === type) ?? null;
  const [doc, setDoc] = useState<BillingDocument | null>(initial);
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [emailModalOpen, setEmailModalOpen] = useState(false);

  if (!doc) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <p className="text-sm font-medium text-slate-500">{docLabel} not found.</p>
          <Link href="/billing" className="mt-2 inline-block text-sm font-semibold text-indigo-600 hover:text-indigo-700">
            Back to Billing
          </Link>
        </div>
      </div>
    );
  }

  const status = computeStatus(doc);
  const canRecordPayment = status === "Not Paid" || status === "Partially Paid";

  function recordPayment(payment: Omit<PaymentRecord, "id">) {
    setDoc((d) => (d ? { ...d, payments: [...d.payments, { ...payment, id: crypto.randomUUID() }] } : d));
    setPayModalOpen(false);
  }

  function handleVoid() {
    if (!doc) return;
    const confirmed = window.confirm(`Void ${doc.number}? This cannot be undone here.`);
    if (confirmed) setDoc((d) => (d ? { ...d, voided: true } : d));
  }

  function handlePrint() {
    window.print();
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Print-only styles: hide everything except the document template when printing */}
      <style>{`
        @media print {
          .print-hidden { display: none !important; }
          body { background: white; }
          #billing-print-area { box-shadow: none !important; border: none !important; }
        }
      `}</style>

      <div className="print-hidden mx-auto max-w-3xl px-6 py-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              href="/billing"
              className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
              aria-label="Back to billing"
            >
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="none">
                <path d="M12 5l-5 5 5 5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-slate-900">{doc.number}</h1>
                <StatusBadge status={status} />
              </div>
              <p className="text-sm text-slate-500">
                {docLabel} · {doc.partyName}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {canRecordPayment && (
              <button
                type="button"
                onClick={() => setPayModalOpen(true)}
                className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-600"
              >
                Record Payment
              </button>
            )}
            {!isInvoice && !doc.voided && (
              <button
                type="button"
                onClick={handleVoid}
                className="rounded-lg border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-50"
              >
                Void
              </button>
            )}
            <button
              type="button"
              onClick={() => setEmailModalOpen(true)}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50"
            >
              <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none">
                <path d="M3 5h14v10H3V5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                <path d="M3 5l7 6 7-6" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
              </svg>
              Email
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50"
            >
              <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none">
                <path d="M5 8V3h10v5M5 14h10v3H5v-3zM3 8h14v6H3V8z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
              </svg>
              Print
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
            >
              <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none">
                <path d="M10 3v10m0 0l-3.5-3.5M10 13l3.5-3.5M4 16h12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Download
            </button>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{docLabel} Date</p>
            <p className="mt-1 text-sm font-semibold text-slate-800">{formatDateDMY(doc.date)}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Due Date</p>
            <p className="mt-1 text-sm font-semibold text-slate-800">{formatDateDMY(doc.dueDate)}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{partyLabel}</p>
            <p className="mt-1 text-sm font-semibold text-slate-800">{doc.partyName}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Status</p>
            <p className="mt-1 text-sm font-semibold text-slate-800">{status}</p>
          </div>
        </div>

        {doc.payments.length > 0 && (
          <div className="mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div className="border-b border-slate-100 px-6 py-4">
              <h3 className="text-sm font-semibold text-slate-900">Payment history</h3>
            </div>
            <div className="divide-y divide-slate-100">
              {doc.payments.map((p) => (
                <div key={p.id} className="flex items-center justify-between px-6 py-3 text-sm">
                  <div>
                    <p className="font-medium text-slate-800">{formatDateDMY(p.date)}</p>
                    <p className="text-xs text-slate-400">
                      {p.method}
                      {p.reference && ` · ${p.reference}`}
                    </p>
                  </div>
                  <p className="font-mono font-semibold text-emerald-600">{formatTZS(p.amount)}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mx-auto mb-10 max-w-3xl px-6">
        <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
          <DocumentTemplate doc={doc} />
        </div>
      </div>

      {payModalOpen && (
        <div className="print-hidden">
          <RecordPaymentModal doc={doc} onClose={() => setPayModalOpen(false)} onRecord={recordPayment} />
        </div>
      )}
      {emailModalOpen && (
        <div className="print-hidden">
          <SendEmailModal doc={doc} onClose={() => setEmailModalOpen(false)} />
        </div>
      )}
    </div>
  );
}