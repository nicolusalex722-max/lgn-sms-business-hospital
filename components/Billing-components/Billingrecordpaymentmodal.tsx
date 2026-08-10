"use client";

import { useState } from "react";
import Modal from "./Billingmodal";
import { computeTotals, formatTZS, todayISO } from "@/lib/utils";
import type { BillingDocument, PaymentMethod, PaymentRecord } from "@/lib/types";

const METHODS: PaymentMethod[] = ["Mobile Money", "Cash", "Bank"];

export default function RecordPaymentModal({
  doc,
  onClose,
  onRecord,
}: {
  doc: BillingDocument;
  onClose: () => void;
  onRecord: (payment: Omit<PaymentRecord, "id">) => void;
}) {
  const { total, amountPaid, balanceDue } = computeTotals(doc);
  const isInvoice = doc.type === "invoice";

  const [date, setDate] = useState(todayISO());
  const [method, setMethod] = useState<PaymentMethod>("Cash");
  const [amount, setAmount] = useState(balanceDue > 0 ? String(balanceDue) : "");
  const [reference, setReference] = useState("");

  const amountNum = Number(amount) || 0;
  const canSave = amountNum > 0;
  const overpaying = amountNum > balanceDue;

  function handleSubmit() {
    if (!canSave) return;
    onRecord({ date, amount: amountNum, method, reference: reference.trim() || undefined });
  }

  return (
    <Modal
      title="Record Payment"
      subtitle={`${doc.number} · ${doc.partyName}`}
      onClose={onClose}
    >
      <div className="mb-5 rounded-xl border border-indigo-100 bg-indigo-50/50 px-4 py-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500">Total {isInvoice ? "invoice" : "bill"} amount</span>
          <span className="font-medium text-slate-800">{formatTZS(total)}</span>
        </div>
        <div className="mt-1.5 flex items-center justify-between text-sm">
          <span className="text-slate-500">Already paid</span>
          <span className="font-medium text-slate-800">{formatTZS(amountPaid)}</span>
        </div>
        <div className="mt-1.5 flex items-center justify-between border-t border-indigo-100 pt-1.5">
          <span className="text-sm font-semibold text-slate-700">Balance due</span>
          <span className="text-base font-bold text-slate-900">{formatTZS(balanceDue)}</span>
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-800">Amount</label>
            <input
              type="number"
              min={0}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-[15px] text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-800">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-[15px] text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500"
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-800">Payment method</label>
          <div className="flex gap-2">
            {METHODS.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMethod(m)}
                className={`flex-1 rounded-lg border px-3 py-2.5 text-sm font-medium transition ${
                  method === m
                    ? "border-indigo-500 bg-indigo-500 text-white"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-800">
            Reference <span className="font-normal text-slate-400">(Optional)</span>
          </label>
          <input
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            placeholder="e.g. slip / txn no."
            className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-[15px] text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500"
          />
        </div>

        {overpaying && (
          <p className="text-xs font-medium text-amber-600">
            This amount is more than the balance due ({formatTZS(balanceDue)}).
          </p>
        )}
      </div>

      <div className="mt-6 flex justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg px-4 py-2.5 text-sm font-semibold text-slate-500 hover:bg-slate-100"
        >
          Cancel
        </button>
        <button
          type="button"
          disabled={!canSave}
          onClick={handleSubmit}
          className="rounded-lg bg-indigo-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-600 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
        >
          Record payment
        </button>
      </div>
    </Modal>
  );
}