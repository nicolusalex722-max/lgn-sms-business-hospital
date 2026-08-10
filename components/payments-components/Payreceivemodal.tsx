"use client";

import { useState } from "react";
import Modal from "./Paymentmodal";
import PartySearchSelect from "./Partysearchselect";
import { PAYMENT_METHODS } from "@/lib/data";
import type { Party, PaymentMethod, TransactionPayment } from "@/lib/types";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function PayReceiveModal({
  mode,
  onClose,
  onSubmit,
}: {
  mode: "Pay" | "Receive";
  onClose: () => void;
  onSubmit: (tx: Omit<TransactionPayment, "id" | "type">) => void;
}) {
  const isPay = mode === "Pay";

  const [party, setParty] = useState<Party | null>(null);
  const [date, setDate] = useState(todayISO());
  const [method, setMethod] = useState<PaymentMethod>("Cash");
  const [amount, setAmount] = useState("");
  const [reference, setReference] = useState("");
  const [note, setNote] = useState("");

  const amountNum = Number(amount) || 0;
  const canSave = !!party && amountNum > 0;
  const newBalance = party ? party.balance - amountNum : null;

  function handleSubmit() {
    if (!party || amountNum <= 0) return;
    onSubmit({
      date,
      amount: amountNum,
      method,
      reference: reference.trim() || undefined,
      note: note.trim() || undefined,
      partyName: party.name,
      partyType: party.type,
    });
  }

  return (
    <Modal
      title={isPay ? "Pay" : "Receive Payment"}
      subtitle={isPay ? "Send a payment to a supplier" : "Record a payment from a student"}
      onClose={onClose}
      wide
    >
      <div className="space-y-5">
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-800">Student / Supplier</label>
          <PartySearchSelect value={party} onSelect={setParty} />
        </div>

        {party && (
          <div className="flex items-center justify-between rounded-xl border border-indigo-100 bg-indigo-50/50 px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-slate-800">{party.name}</p>
              <p className="text-xs text-slate-500">{party.type}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-400">Current balance</p>
              <p className="text-base font-bold text-slate-900">TZS {party.balance.toLocaleString()}</p>
            </div>
          </div>
        )}

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
            {PAYMENT_METHODS.map((m) => (
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

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-800">
            Note <span className="font-normal text-slate-400">(Optional)</span>
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            placeholder={isPay ? "Reason for the payment..." : "Reason for the receipt..."}
            className="w-full resize-none rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-[15px] text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500"
          />
        </div>

        {party && amountNum > 0 && (
          <p className="text-xs text-slate-400">
            Balance after this {isPay ? "payment" : "receipt"}:{" "}
            <span className="font-semibold text-slate-600">TZS {newBalance!.toLocaleString()}</span>
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
          className={`rounded-lg px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 ${
            isPay ? "bg-rose-500 hover:bg-rose-600" : "bg-emerald-500 hover:bg-emerald-600"
          }`}
        >
          {isPay ? "Pay" : "Receive"} {amountNum > 0 ? `TZS ${amountNum.toLocaleString()}` : ""}
        </button>
      </div>
    </Modal>
  );
}