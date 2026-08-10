"use client";

import { useState } from "react";
import Modal from "./Budgetmodal";
import ProgressBar from "./Budgetprogressbar";
import { computeBudgetStatus, computeBudgetTotals, formatDateDMY, formatTZS, todayISO } from "@/lib/utils";
import type { Budget, BudgetMovement } from "@/lib/types";

export default function MovementsModal({
  budget,
  onClose,
  onLogMovement,
}: {
  budget: Budget;
  onClose: () => void;
  onLogMovement: (movement: Omit<BudgetMovement, "id">) => void;
}) {
  const { spent, remaining, percentUsed } = computeBudgetTotals(budget);
  const status = computeBudgetStatus(budget);

  const [date, setDate] = useState(todayISO());
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");

  const amountNum = Number(amount) || 0;
  const canLog = amountNum > 0;

  function handleLog() {
    if (!canLog) return;
    onLogMovement({ date, amount: amountNum, note: note.trim() || undefined });
    setAmount("");
    setNote("");
  }

  const movements = [...budget.movements].sort((a, b) => (a.date < b.date ? 1 : -1));

  return (
    <Modal title={budget.category} subtitle={`${budget.periodLabel} · ${budget.periodType}`} onClose={onClose} wide>
      <div className="mb-5 rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-4">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="text-slate-500">Allocated</span>
          <span className="font-semibold text-slate-800">{formatTZS(budget.allocated)}</span>
        </div>
        <ProgressBar percent={percentUsed} status={status} />
        <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-xs text-slate-400">Spent</p>
            <p className="font-semibold text-slate-800">{formatTZS(spent)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Remaining</p>
            <p className={`font-semibold ${remaining < 0 ? "text-rose-500" : "text-slate-800"}`}>
              {formatTZS(remaining)}
            </p>
          </div>
        </div>
      </div>

      <div className="mb-5">
        <p className="mb-2 text-sm font-semibold text-slate-800">Movements</p>
        <div className="max-h-52 overflow-y-auto rounded-xl border border-slate-200">
          {movements.length === 0 && (
            <p className="px-4 py-6 text-center text-sm text-slate-400">No spend logged yet.</p>
          )}
          <div className="divide-y divide-slate-100">
            {movements.map((m) => (
              <div key={m.id} className="flex items-center justify-between px-4 py-3 text-sm">
                <div>
                  <p className="font-medium text-slate-800">{formatDateDMY(m.date)}</p>
                  {m.note && <p className="text-xs text-slate-400">{m.note}</p>}
                </div>
                <p className="font-mono font-semibold text-slate-700">{formatTZS(m.amount)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm font-semibold text-slate-800">Log spend</p>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <input
            type="number"
            min={0}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Amount"
            className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-[15px] text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500"
          />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-[15px] text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500"
          />
        </div>
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Note (optional)"
          className="mt-3 w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-[15px] text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500"
        />
      </div>

      <div className="mt-6 flex justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg px-4 py-2.5 text-sm font-semibold text-slate-500 hover:bg-slate-100"
        >
          Close
        </button>
        <button
          type="button"
          disabled={!canLog}
          onClick={handleLog}
          className="rounded-lg bg-indigo-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-600 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
        >
          Log spend
        </button>
      </div>
    </Modal>
  );
}