"use client";

import { useState } from "react";
import Modal from "./Paymentmodal";
import { ACCOUNTS } from "@/lib/data";
import type { TransactionPayment } from "@/lib/types";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function TransferFundsModal({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (tx: Omit<TransactionPayment, "id" | "type">) => void;
}) {
  const [fromAccount, setFromAccount] = useState(ACCOUNTS[0]?.name ?? "");
  const [toAccount, setToAccount] = useState(ACCOUNTS[1]?.name ?? "");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(todayISO());
  const [reference, setReference] = useState("");
  const [note, setNote] = useState("");

  const amountNum = Number(amount) || 0;
  const sameAccount = !!fromAccount && fromAccount === toAccount;
  const canSave = !!fromAccount && !!toAccount && !sameAccount && amountNum > 0;

  function handleSubmit() {
    if (!canSave) return;
    onSubmit({
      date,
      amount: amountNum,
      method: "Account Transfer",
      reference: reference.trim() || undefined,
      note: note.trim() || undefined,
      fromAccount,
      toAccount,
    });
  }

  return (
    <Modal title="Transfer Funds" subtitle="Move money between your accounts" onClose={onClose} wide>
      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Accounts</p>
        <div className="flex items-end gap-3">
          <div className="flex-1">
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400">
              From
            </label>
            <select
              value={fromAccount}
              onChange={(e) => setFromAccount(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-[15px] text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500"
            >
              {ACCOUNTS.map((a) => (
                <option key={a.code} value={a.name}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>
          <div className="pb-2.5 text-slate-300">
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="none">
              <path
                d="M3 10h14M12 5l5 5-5 5"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className="flex-1">
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400">To</label>
            <select
              value={toAccount}
              onChange={(e) => setToAccount(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-[15px] text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500"
            >
              {ACCOUNTS.map((a) => (
                <option key={a.code} value={a.name}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        {sameAccount && (
          <p className="mt-2 text-xs font-medium text-rose-500">Source and destination accounts must be different</p>
        )}
      </div>

      <div className="mt-6">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Details</p>
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

        <div className="mt-4">
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
      </div>

      <div className="mt-6">
        <label className="mb-1.5 block text-sm font-semibold text-slate-800">Note</label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          placeholder="Reason for the transfer..."
          className="w-full resize-none rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-[15px] text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500"
        />
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
        <p className="text-xs text-slate-400">Choose the source and destination accounts</p>
        <div className="flex gap-2">
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
            className="flex items-center gap-1.5 rounded-lg bg-indigo-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-600 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
          >
            Transfer
          </button>
        </div>
      </div>
    </Modal>
  );
}