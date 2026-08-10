"use client";

import Link from "next/link";
import { Eye, Trash2, BookOpen } from "lucide-react";
import { Account } from "@/lib/types";
import { money, balanceOf } from "@/lib/utils";

export default function AccountsTable({
  accounts,
  onDelete,
}: {
  accounts: Account[];
  onDelete: (account: Account) => void;
}) {
  return (
    <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="border-b border-slate-200 text-slate-500">
            <th className="px-6 py-4 font-normal">Code</th>
            <th className="px-6 py-4 font-normal">Account name</th>
            <th className="px-6 py-4 font-normal">Type</th>
            <th className="px-6 py-4 font-normal">Currency</th>
            <th className="px-6 py-4 font-normal">Description</th>
            <th className="px-6 py-4 text-right font-normal">Balance</th>
            <th className="px-6 py-4 text-right font-normal">Actions</th>
          </tr>
        </thead>
        <tbody>
          {accounts.map((a) => {
            const bal = balanceOf(a);
            return (
              <tr key={a.code} className="border-b border-slate-100 last:border-0">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                      <BookOpen size={16} />
                    </span>
                    <span className="font-bold">{a.code}</span>
                  </div>
                </td>
                <td className="px-6 py-4">{a.name}</td>
                <td className="px-6 py-4">
                  <span className="rounded-full bg-indigo-50 px-3 py-1 text-sm text-indigo-700">
                    {a.type}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-600">{a.currency}</td>
                <td className="px-6 py-4 text-slate-500">{a.description}</td>
                <td className={`px-6 py-4 text-right ${bal < 0 ? "text-red-600" : ""}`}>
                  {money(bal, a.currency)}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/dashboard/accounting/chart-accounts/${a.code}`}
                      aria-label={`View transactions for ${a.code}`}
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
                    >
                      <Eye size={16} />
                    </Link>
                    <button
                      onClick={() => onDelete(a)}
                      aria-label={`Delete ${a.code}`}
                      className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-600 text-white hover:bg-red-700"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
          {accounts.length === 0 && (
            <tr>
              <td colSpan={7} className="px-6 py-10 text-center text-slate-400">
                No accounts match your search.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}