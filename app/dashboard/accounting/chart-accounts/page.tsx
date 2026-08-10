"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { Account } from "@/lib/types";
import { seedAccounts } from "@/lib/data";
import AccountsFilterBar from "@/components/accounting-components/Accountfilterbar";
import AccountsTable from "@/components/accounting-components/Accounttable";
import DeleteAccountModal from "@/components/accounting-components/Deleteaccountmodel";
import AddAccountModal from "@/components/accounting-components/Addaccountmodal";

export default function ChartOfAccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>(seedAccounts);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("All Types");
  const [deleting, setDeleting] = useState<Account | null>(null);
  const [adding, setAdding] = useState(false);

  const filtered = useMemo(() => {
    return accounts.filter((a) => {
      const matchesType = typeFilter === "All Types" || a.type === typeFilter;
      const q = query.trim().toLowerCase();
      const matchesQuery =
        !q || a.code.toLowerCase().includes(q) || a.name.toLowerCase().includes(q);
      return matchesType && matchesQuery;
    });
  }, [accounts, query, typeFilter]);

  function handleDelete(code: string) {
    setAccounts((prev) => prev.filter((a) => a.code !== code));
    setDeleting(null);
  }

  function handleCreate(account: Account) {
    setAccounts((prev) => [...prev, account]);
    setAdding(false);
  }

  return (
    <div className="min-h-screen bg-slate-50 font-serif text-slate-900">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Chart of accounts</h1>
            <p className="mt-1 text-slate-500">
              Manage individual accounts under each account group.
            </p>
          </div>
          <button
            onClick={() => setAdding(true)}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 font-medium text-white shadow-sm transition hover:bg-indigo-700"
          >
            <Plus size={18} strokeWidth={2.5} />
            Add account
          </button>
        </div>

        <AccountsFilterBar
          query={query}
          onQueryChange={setQuery}
          typeFilter={typeFilter}
          onTypeFilterChange={setTypeFilter}
        />

        <AccountsTable accounts={filtered} onDelete={setDeleting} />
      </div>

      {deleting && (
        <DeleteAccountModal
          account={deleting}
          onCancel={() => setDeleting(null)}
          onConfirm={() => handleDelete(deleting.code)}
        />
      )}

      {adding && <AddAccountModal onCancel={() => setAdding(false)} onCreate={handleCreate} />}
    </div>
  );
}