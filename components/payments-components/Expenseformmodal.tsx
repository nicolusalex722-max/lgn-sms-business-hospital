"use client";

import { useState } from "react";
import Modal from "./Expensemodal";
import { ACCOUNTS, CATEGORIES, PAYMENT_METHODS } from "@/lib/expensedata";
import type { Expense, ExpenseCategory, PaymentMethod } from "@/lib/types";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function ExpenseFormModal({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (expense: Omit<Expense, "id">) => void;
}) {
  const [category, setCategory] = useState<ExpenseCategory>(CATEGORIES[0]);
  const [vendor, setVendor] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(todayISO());
  const [method, setMethod] = useState<PaymentMethod>("Cash");
  const [account, setAccount] = useState(ACCOUNTS[0]?.name ?? "");
  const [reference, setReference] = useState("");
  const [description, setDescription] = useState("");

  const amountNum = Number(amount) || 0;
  const canSave = vendor.trim().length > 0 && amountNum > 0 && !!account;

  function handleSubmit() {
    if (!canSave) return;
    onSave({
      date,
      category,
      vendor: vendor.trim(),
      amount: amountNum,
      method,
      account,
      reference: reference.trim() || undefined,
      description: description.trim() || undefined,
    });
  }

  return (
    <Modal title="New Expense" subtitle="Record a business expense" onClose={onClose} wide>
      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Details</p>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-800">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
              className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-[15px] text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-800">Vendor / Payee</label>
            <input
              autoFocus
              value={vendor}
              onChange={(e) => setVendor(e.target.value)}
              placeholder="e.g. TANESCO"
              className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-[15px] text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500"
            />
          </div>
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
      </div>

      <div className="mt-6">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Payment</p>
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
        <div className="mt-4">
          <label className="mb-1.5 block text-sm font-semibold text-slate-800">Paid from account</label>
          <select
            value={account}
            onChange={(e) => setAccount(e.target.value)}
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

      <div className="mt-6">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Notes</p>
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-800">
            Reference <span className="font-normal text-slate-400">(Optional)</span>
          </label>
          <input
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            placeholder="e.g. invoice / receipt no."
            className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-[15px] text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500"
          />
        </div>
        <div className="mt-4">
          <label className="mb-1.5 block text-sm font-semibold text-slate-800">
            Description <span className="font-normal text-slate-400">(Optional)</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="What was this expense for..."
            className="w-full resize-none rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-[15px] text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500"
          />
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
        <p className="text-xs text-slate-400">Fill in the vendor, amount, and account</p>
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
            className="rounded-lg bg-indigo-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-600 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
          >
            Save expense
          </button>
        </div>
      </div>
    </Modal>
  );
}