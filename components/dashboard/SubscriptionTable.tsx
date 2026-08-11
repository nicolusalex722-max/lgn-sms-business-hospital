
"use client";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";

import type { Subscription } from "@/lib/types";

interface SubscriptionTableProps {
  subscriptions: Subscription[];
  onEdit: (subscription: Subscription) => void;
  onDelete: (id: string) => void;
  loading?: boolean;
}

// -----------------------------------------------------------------------------
// Styles
// -----------------------------------------------------------------------------

const STATUS_STYLES: Record<
  Subscription["status"],
  string
> = {
  Active:
    "border-emerald-300 text-emerald-700 bg-white",

  Trial:
    "border-sky-300 text-sky-700 bg-white",

  Expired:
    "border-amber-300 text-amber-700 bg-white",

  Cancelled:
    "border-rose-300 text-rose-700 bg-white",
};

// -----------------------------------------------------------------------------
// Status Badge
// -----------------------------------------------------------------------------

function StatusBadge({
  status,
}: {
  status: Subscription["status"];
}) {
  const style = STATUS_STYLES[status];

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${style}`}
    >
      {status}
    </span>
  );
}

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-TZ", {
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(value: string) {
  if (!value) return "—";

  // Date-only values from PostgreSQL should be
  // formatted without introducing timezone shifts.
  const parts = value.split("-");

  if (parts.length === 3) {
    const [year, month, day] = parts;

    if (year && month && day) {
      return `${day}/${month}/${year}`;
    }
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

// Skeleton

function SubscriptionTableSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full min-w-190">
          <thead className="border-b border-slate-200 bg-slate-50/70">
            <tr>
              {[
                "",
                "Plan",
                "Status",
                "Amount",
                "Billing Cycle",
                "Start Date",
                "Actions",
              ].map((heading, index) => (
                <th
                  key={`${heading}-${index}`}
                  className="px-4 py-3 text-left text-xs font-semibold text-slate-500"
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {[1, 2, 3, 4].map((row) => (
              <tr key={row}>
                {/* Checkbox */}
                <td className="px-4 py-4">
                  <div className="h-4 w-4 rounded bg-slate-200 animate-pulse" />
                </td>

                {/* Plan */}
                <td className="px-4 py-4">
                  <div className="h-4 w-32 rounded bg-slate-200 animate-pulse" />
                </td>

                {/* Status */}
                <td className="px-4 py-4">
                  <div className="h-6 w-20 rounded-full bg-slate-200 animate-pulse" />
                </td>

                {/* Amount */}
                <td className="px-4 py-4">
                  <div className="h-4 w-28 rounded bg-slate-200 animate-pulse" />
                </td>

                {/* Billing Cycle */}
                <td className="px-4 py-4">
                  <div className="h-4 w-24 rounded bg-slate-200 animate-pulse" />
                </td>

                {/* Start Date */}
                <td className="px-4 py-4">
                  <div className="h-4 w-24 rounded bg-slate-200 animate-pulse" />
                </td>

                {/* Actions */}
                <td className="px-4 py-4">
                  <div className="flex gap-2">
                    <div className="h-8 w-8 rounded-lg bg-slate-200 animate-pulse" />
                    <div className="h-8 w-8 rounded-lg bg-slate-200 animate-pulse" />
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

// -----------------------------------------------------------------------------
// Empty State
// -----------------------------------------------------------------------------

function EmptyState() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-6 py-12 text-center">
      <p className="text-sm font-medium text-slate-700">
        No subscriptions found
      </p>

      <p className="mt-1 text-xs text-slate-400">
        No subscription plans match your search.
      </p>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Subscription Table
// -----------------------------------------------------------------------------

export default function SubscriptionTable({
  subscriptions,
  onEdit,
  onDelete,
  loading = false,
}: SubscriptionTableProps) {
  const [selected, setSelected] =
    useState<Set<string>>(new Set());

  const allSelected =
    subscriptions.length > 0 &&
    selected.size === subscriptions.length;

  const toggleAll = () => {
    setSelected(
      allSelected
        ? new Set()
        : new Set(
            subscriptions.map(
              (subscription) =>
                subscription.id
            )
          )
    );
  };

  const toggleOne = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);

      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }

      return next;
    });
  };

  if (loading) {
    return <SubscriptionTableSkeleton />;
  }

  if (subscriptions.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full min-w-212.5">
          <thead className="border-b border-slate-200 bg-slate-50/70">
            <tr>
              {/* Select all */}
              <th className="w-12 px-4 py-3 text-left">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleAll}
                  aria-label="Select all subscriptions"
                  className="h-4 w-4 cursor-pointer rounded accent-indigo-600"
                />
              </th>

              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">
                Plan
              </th>

              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">
                Status
              </th>

              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">
                Amount
              </th>

              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">
                Billing Cycle
              </th>

              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">
                Start Date
              </th>

              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {subscriptions.map(
              (subscription) => (
                <tr
                  key={subscription.id}
                  className="transition-colors hover:bg-slate-50/70"
                >
                  {/* Checkbox */}
                  <td className="px-4 py-4">
                    <input
                      type="checkbox"
                      checked={selected.has(
                        subscription.id
                      )}
                      onChange={() =>
                        toggleOne(
                          subscription.id
                        )
                      }
                      aria-label={`Select ${subscription.plan}`}
                      className="h-4 w-4 cursor-pointer rounded accent-indigo-600"
                    />
                  </td>

                  {/* Plan */}
                  <td className="px-4 py-4">
                    <div className="text-sm font-medium text-slate-800">
                      {subscription.plan}
                    </div>

                    <div className="mt-0.5 text-xs text-slate-400">
                      {subscription.id.slice(
                        0,
                        8
                      )}
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-4">
                    <StatusBadge
                      status={
                        subscription.status
                      }
                    />
                  </td>

                  {/* Amount */}
                  <td className="px-4 py-4">
                    <div className="text-sm font-medium text-slate-700">
                      TZS{" "}
                      {formatCurrency(
                        subscription.amount
                      )}
                    </div>
                  </td>

                  {/* Billing Cycle */}
                  <td className="px-4 py-4">
                    <span className="text-sm text-slate-600">
                      {
                        subscription.billingCycle
                      }
                    </span>
                  </td>

                  {/* Start Date */}
                  <td className="px-4 py-4">
                    <span className="text-sm text-slate-600">
                      {formatDate(
                        subscription.startDate
                      )}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          onEdit(
                            subscription
                          )
                        }
                        aria-label={`Edit ${subscription.plan}`}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-colors hover:bg-slate-50 hover:text-indigo-600"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          onDelete(
                            subscription.id
                          )
                        }
                        aria-label={`Delete ${subscription.plan}`}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-colors hover:bg-rose-50 hover:text-rose-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>

      {/* Selection footer */}
      {selected.size > 0 && (
        <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-4 py-3">
          <p className="text-xs font-medium text-slate-600">
            {selected.size}{" "}
            {selected.size === 1
              ? "subscription"
              : "subscriptions"}{" "}
            selected
          </p>

          <button
            type="button"
            onClick={() =>
              setSelected(new Set())
            }
            className="text-xs font-medium text-slate-500 hover:text-slate-800"
          >
            Clear selection
          </button>
        </div>
      )}
    </div>
  );
}
