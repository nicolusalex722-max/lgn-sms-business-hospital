"use client";

import { useState } from "react";
import { Receipt, FileCheck2 } from "lucide-react";
import type { Company } from "./Companytable";

interface SubscribeCompanyModalProps {
  company: Company;
  onClose: () => void;
  onSave: (subscription: {
    companyId: string;
    plan: string;
    billingCycle: string;
    amount: number;
    startDate: string;
  }) => void;
}

const PLANS = ["Basic", "Standard", "Premium", "Enterprise"];
const VAT_RATE = 0.18;

function formatCurrency(value: number) {
  return `TZS ${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

export default function SubscribeCompanyModal({ company, onClose, onSave }: SubscribeCompanyModalProps) {
  const [plan, setPlan] = useState("Standard");
  const [billingCycle, setBillingCycle] = useState("Monthly");
  const [amount, setAmount] = useState("");
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [billGenerated, setBillGenerated] = useState(false);

  const numericAmount = Number(amount) || 0;
  const vat = numericAmount * VAT_RATE;
  const total = numericAmount + vat;

  const handleGenerateBill = () => {
    if (numericAmount <= 0) return;
    setBillGenerated(true);
  };

  const handleSave = () => {
    onSave({
      companyId: company.id,
      plan,
      billingCycle,
      amount: numericAmount,
      startDate,
    });
  };

  return (
    <div className="flex flex-col gap-5">
      <p className="text-sm text-slate-500">
        Subscribing <span className="font-semibold text-slate-700">{company.name}</span> to a plan
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Plan</label>
          <select
            value={plan}
            onChange={(e) => setPlan(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            {PLANS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Billing Cycle</label>
          <select
            value={billingCycle}
            onChange={(e) => setBillingCycle(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option>Monthly</option>
            <option>Quarterly</option>
            <option>Yearly</option>
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Amount (TZS)</label>
          <input
            type="number"
            min="0"
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value);
              setBillGenerated(false);
            }}
            placeholder="e.g. 150000"
            className="px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
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

      {/* Generate Bill section */}
      <div className="rounded-lg border border-dashed border-slate-300 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Receipt className="w-4 h-4 text-indigo-600" />
            <h4 className="text-sm font-semibold text-slate-800">Generate Bill</h4>
          </div>
          <button
            type="button"
            onClick={handleGenerateBill}
            disabled={numericAmount <= 0}
            className="px-3 py-1.5 rounded-lg bg-slate-800 text-white text-xs font-medium hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Generate Bill
          </button>
        </div>

        {billGenerated ? (
          <div className="text-sm text-slate-600 flex flex-col gap-1.5">
            <div className="flex justify-between">
              <span>Subtotal ({plan}, {billingCycle})</span>
              <span>{formatCurrency(numericAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span>VAT (18%)</span>
              <span>{formatCurrency(vat)}</span>
            </div>
            <div className="flex justify-between font-semibold text-slate-800 pt-1.5 border-t border-slate-200">
              <span>Total Due</span>
              <span>{formatCurrency(total)}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 mt-1">
              <FileCheck2 className="w-3.5 h-3.5" />
              Bill ready to send to {company.name}
            </div>
          </div>
        ) : (
          <p className="text-xs text-slate-400">
            Enter an amount and click &ldquo;Generate Bill&rdquo; to preview VAT and total due.
          </p>
        )}
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 rounded-lg border border-slate-300 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={numericAmount <= 0}
          className="px-5 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Save Subscription
        </button>
      </div>
    </div>
  );
}