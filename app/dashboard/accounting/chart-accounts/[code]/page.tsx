"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { ArrowLeft, RotateCcw } from "lucide-react";
import { seedAccounts } from "@/lib/data";
import { Account, Transaction } from "@/lib/types";
import { money, balanceOf } from "@/lib/utils";
import ReverseTransactionModal from "@/components/accounting-components/Reversetransactionmodal";

export default function AccountTransactionsPage() {
  const params = useParams<{ code: string }>();

  // Replace seedAccounts() with a real fetch/query for this account's
  // transactions once a backend is wired up.
  const initial = useMemo(
    () => seedAccounts().find((a) => a.code === params.code) ?? null,
    [params.code]
  );

  const [account, setAccount] = useState<Account | null>(initial);
  const [reversing, setReversing] = useState<Transaction | null>(null);

  if (!account) {
    notFound();
  }

  function handleReverse(transaction: Transaction) {
    setAccount((prev) => {
      if (!prev) return prev;
      const reversal: Transaction = {
        id: `rev-${Date.now()}`,
        date: new Date().toISOString().slice(0, 10),
        by: "You",
        description: `Reversal of "${transaction.description}"`,
        debit: transaction.credit,
        credit: transaction.debit,
      };
      return { ...prev, transactions: [...prev.transactions, reversal] };
    });
    setReversing(null);
  }

  let running = 0;

  return (
    <div className="min-h-screen bg-slate-50 font-serif text-slate-900">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <Link
          href="/accounting/chart-accounts"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700"
        >
          <ArrowLeft size={16} />
          Back to chart of accounts
        </Link>

        <div className="mt-4 flex items-start justify-between">
          <div>
            <div className="text-sm text-slate-400">
              {account.code} · {account.type}
            </div>
            <h1 className="mt-1 text-3xl font-bold tracking-tight">{account.name}</h1>
            <p className="mt-1 text-slate-500">{account.description}</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-slate-500">Account balance</div>
            <div
              className={`text-2xl font-bold ${
                balanceOf(account) < 0 ? "text-red-600" : ""
              }`}
            >
              {money(balanceOf(account), account.currency)}
            </div>
          </div>
        </div>

        <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="px-6 py-4 font-normal">Date</th>
                <th className="px-6 py-4 font-normal">Made by</th>
                <th className="px-6 py-4 font-normal">Description</th>
                <th className="px-6 py-4 text-right font-normal">Debit</th>
                <th className="px-6 py-4 text-right font-normal">Credit</th>
                <th className="px-6 py-4 text-right font-normal">Running balance</th>
                <th className="px-6 py-4 text-right font-normal">Actions</th>
              </tr>
            </thead>
            <tbody>
              {account.transactions.map((t) => {
                running += t.debit - t.credit;
                const isReversal = t.id.startsWith("rev-");
                return (
                  <tr key={t.id} className="border-b border-slate-100 last:border-0">
                    <td className="px-6 py-4 text-slate-500">{t.date}</td>
                    <td className="px-6 py-4">{t.by}</td>
                    <td className="px-6 py-4">{t.description}</td>
                    <td className="px-6 py-4 text-right">
                      {t.debit ? t.debit.toLocaleString() : "—"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {t.credit ? t.credit.toLocaleString() : "—"}
                    </td>
                    <td
                      className={`px-6 py-4 text-right ${
                        running < 0 ? "text-red-600" : ""
                      }`}
                    >
                      {money(running, account.currency)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {isReversal ? (
                        <span className="text-sm text-slate-400">—</span>
                      ) : (
                        <button
                          onClick={() => setReversing(t)}
                          aria-label={`Reverse ${t.description}`}
                          className="ml-auto flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
                        >
                          <RotateCcw size={16} />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {account.transactions.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-slate-400">
                    No transactions have been posted to this account.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {reversing && (
        <ReverseTransactionModal
          transaction={reversing}
          currency={account.currency}
          onCancel={() => setReversing(null)}
          onConfirm={() => handleReverse(reversing)}
        />
      )}
    </div>
  );
}