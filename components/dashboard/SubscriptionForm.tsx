"use client";

import { useState } from "react";
import type { Subscription } from "./SubscriptionTable";

interface SubscriptionFormProps {
  initialValue?: Subscription | null;
  onSubmit: (sub: Omit<Subscription, "id">) => void;
  onCancel: () => void;
}

const STATUS_OPTIONS = ["Active", "Trial", "Expired", "Cancelled"];

export default function SubscriptionForm({ initialValue, onSubmit, onCancel }: SubscriptionFormProps) {
  const [plan, setPlan] = useState(initialValue?.plan ?? "");
  const [status, setStatus] = useState(initialValue?.status ?? "Active");
  const [amount, setAmount] = useState(initialValue ? String(initialValue.amount) : "");
  const [billingCycle, setBillingCycle] = useState(initialValue?.billingCycle ?? "Monthly");
  const [startDate, setStartDate] = useState(initialValue?.startDate ?? "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!plan.trim() || !amount) return;

    onSubmit({
      plan: plan.trim(),
      status,
      amount: Number(amount),
      billingCycle,
      startDate: startDate || new Date().toISOString().split("T")[0],
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-slate-500">Plan Name</label>
        <input
          type="text"
          value={plan}
          onChange={(e) => setPlan(e.target.value)}
          placeholder="e.g. Premium"
          required
          autoFocus
          className="px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Amount (TZS)</label>
          <input
            type="number"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="e.g. 50000"
            required
            className="px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Billing Cycle</label>
          <select
            value={billingCycle}
            onChange={(e) => setBillingCycle(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
          >
            <option>Monthly</option>
            <option>Quarterly</option>
            <option>Yearly</option>
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-lg border border-slate-300 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-5 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          {initialValue ? "Save Changes" : "Add Subscription"}
        </button>
      </div>
    </form>
  );
}