"use client";

import { useState } from "react";
import Modal from "./Budgetmodal";
import { CATEGORIES, PERIOD_TYPES } from "@/lib/data";
import type { Budget, BudgetPeriodType } from "@/lib/types";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function defaultPeriodLabel(type: BudgetPeriodType, start: string) {
  const d = new Date(start);
  if (type === "Yearly") return String(d.getFullYear());
  if (type === "Quarterly") {
    const q = Math.floor(d.getMonth() / 3) + 1;
    return `Q${q} ${d.getFullYear()}`;
  }
  return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

function defaultEndDate(type: BudgetPeriodType, start: string) {
  const d = new Date(start);
  if (type === "Yearly") return `${d.getFullYear()}-12-31`;
  if (type === "Quarterly") {
    const endMonth = new Date(d.getFullYear(), d.getMonth() + 3, 0);
    return endMonth.toISOString().slice(0, 10);
  }
  const endOfMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0);
  return endOfMonth.toISOString().slice(0, 10);
}

export default function BudgetFormModal({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (budget: Omit<Budget, "id" | "movements">) => void;
}) {
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [periodType, setPeriodType] = useState<BudgetPeriodType>("Monthly");
  const [startDate, setStartDate] = useState(todayISO());
  const [allocated, setAllocated] = useState("");
  const [notes, setNotes] = useState("");

  const allocatedNum = Number(allocated) || 0;
  const canSave = allocatedNum > 0 && !!category;

  function handleSubmit() {
    if (!canSave) return;
    onSave({
      category,
      periodType,
      periodLabel: defaultPeriodLabel(periodType, startDate),
      startDate,
      endDate: defaultEndDate(periodType, startDate),
      allocated: allocatedNum,
      notes: notes.trim() || undefined,
    });
  }

  return (
    <Modal title="New Budget Allocation" subtitle="Set a spending limit for a category and period" onClose={onClose} wide>
      <div className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-800">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
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
          <label className="mb-1.5 block text-sm font-semibold text-slate-800">Period type</label>
          <div className="flex gap-2">
            {PERIOD_TYPES.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPeriodType(p)}
                className={`flex-1 rounded-lg border px-3 py-2.5 text-sm font-medium transition ${
                  periodType === p
                    ? "border-indigo-500 bg-indigo-500 text-white"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-800">Start date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-[15px] text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500"
            />
            <p className="mt-1.5 text-xs text-slate-400">
              Period: {defaultPeriodLabel(periodType, startDate)} ({defaultEndDate(periodType, startDate)})
            </p>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-800">Allocated amount</label>
            <input
              type="number"
              min={0}
              value={allocated}
              onChange={(e) => setAllocated(e.target.value)}
              placeholder="0.00"
              className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-[15px] text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500"
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-800">
            Notes <span className="font-normal text-slate-400">(Optional)</span>
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="What this budget covers..."
            className="w-full resize-none rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-[15px] text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500"
          />
        </div>
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
          Create budget
        </button>
      </div>
    </Modal>
  );
}