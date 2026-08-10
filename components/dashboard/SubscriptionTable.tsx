"use client";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import StatusBadge from "@/components/dashboard/StatusBadge";

export interface Subscription {
  id: string;
  plan: string;
  status: string;
  amount: number;
  billingCycle: string;
  startDate: string;
}

interface SubscriptionTableProps {
  subscriptions: Subscription[];
  onEdit: (sub: Subscription) => void;
  onDelete: (id: string) => void;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-TZ", { maximumFractionDigits: 0 }).format(value);
}

function formatDate(value: string) {
  if (!value) return "\u2014";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "\u2014";
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export default function SubscriptionTable({ subscriptions, onEdit, onDelete }: SubscriptionTableProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const allSelected = subscriptions.length > 0 && selected.size === subscriptions.length;

  const toggleAll = () => {
    setSelected(allSelected ? new Set() : new Set(subscriptions.map((s) => s.id)));
  };

  const toggleOne = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (subscriptions.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-10 text-center">
        <p className="text-sm text-slate-500">No subscriptions match your search.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="w-10 px-5 py-4">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleAll}
                  className="w-4 h-4 rounded accent-indigo-600 cursor-pointer"
                />
              </th>
              <th className="text-left font-medium text-slate-400 px-2 py-4">Plan</th>
              <th className="text-left font-medium text-slate-400 px-2 py-4">Status</th>
              <th className="text-left font-medium text-slate-400 px-2 py-4">Amount</th>
              <th className="text-left font-medium text-slate-400 px-2 py-4">Billing Cycle</th>
              <th className="text-left font-medium text-slate-400 px-2 py-4">Start Date</th>
              <th className="text-right font-medium text-slate-400 px-5 py-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {subscriptions.map((sub) => (
              <tr key={sub.id} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50">
                <td className="px-5 py-4">
                  <input
                    type="checkbox"
                    checked={selected.has(sub.id)}
                    onChange={() => toggleOne(sub.id)}
                    className="w-4 h-4 rounded accent-indigo-600 cursor-pointer"
                  />
                </td>
                <td className="px-2 py-4">
                  <div className="font-semibold text-slate-800">{sub.plan}</div>
                  <div className="text-xs text-slate-400">{sub.id.slice(0, 8)}</div>
                </td>
                <td className="px-2 py-4">
                  <StatusBadge status={sub.status} />
                </td>
                <td className="px-2 py-4 text-slate-700">TZS {formatCurrency(sub.amount)}</td>
                <td className="px-2 py-4 text-slate-600">{sub.billingCycle}</td>
                <td className="px-2 py-4 text-slate-600">{formatDate(sub.startDate)}</td>
                <td className="px-5 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => onEdit(sub)}
                      aria-label={`Edit ${sub.plan}`}
                      className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-indigo-600 transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(sub.id)}
                      aria-label={`Delete ${sub.plan}`}
                      className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}