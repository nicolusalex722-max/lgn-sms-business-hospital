"use client";

import { useState } from "react";
import { BookOpenCheck, Pencil, Trash2 } from "lucide-react";

export interface ChartAccount {
  id: string;
  name: string;
  code: string;
  accountGroup: string;
  description: string;
  status: string;
}

const STATUS_OPTIONS = ["Active", "Inactive"];

function StatusPill({ status }: { status: string }) {
  const style = status === "Active" ? "bg-sky-600 text-white" : "bg-slate-200 text-slate-600";
  return <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${style}`}>{status}</span>;
}

interface ChartAccountFormProps {
  initialValue?: ChartAccount | null;
  groupOptions: string[];
  onSubmit: (data: Omit<ChartAccount, "id">) => void;
  onCancel: () => void;
}

export function ChartAccountForm({ initialValue, groupOptions, onSubmit, onCancel }: ChartAccountFormProps) {
  const [name, setName] = useState(initialValue?.name ?? "");
  const [code, setCode] = useState(initialValue?.code ?? "");
  const [accountGroup, setAccountGroup] = useState(initialValue?.accountGroup ?? groupOptions[0] ?? "");
  const [description, setDescription] = useState(initialValue?.description ?? "");
  const [status, setStatus] = useState(initialValue?.status ?? "Active");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim() || !accountGroup) return;
    onSubmit({ name: name.trim(), code: code.trim().toUpperCase(), accountGroup, description: description.trim(), status });
  };

  const fieldClass = "px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-slate-500">Account Name</label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Cash at Bank" required autoFocus className={fieldClass} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Account Code</label>
          <input type="text" value={code} onChange={(e) => setCode(e.target.value)} placeholder="e.g. 1000" required className={`${fieldClass} uppercase`} />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Account Group</label>
          {groupOptions.length === 0 ? (
            <p className="text-xs text-rose-500 py-2">Create an Account Group first.</p>
          ) : (
            <select value={accountGroup} onChange={(e) => setAccountGroup(e.target.value)} className={`${fieldClass} bg-white`}>
              {groupOptions.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          )}
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-slate-500">Description</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className={`${fieldClass} resize-none`} />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-slate-500">Status</label>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className={`${fieldClass} bg-white`}>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onCancel} className="px-4 py-2 rounded-lg border border-slate-300 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
          Cancel
        </button>
        <button type="submit" disabled={groupOptions.length === 0} className="px-5 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
          {initialValue ? "Save Changes" : "Add Account"}
        </button>
      </div>
    </form>
  );
}

interface ChartAccountTableProps {
  accounts: ChartAccount[];
  onEdit: (account: ChartAccount) => void;
  onDelete: (id: string) => void;
}

export function ChartAccountTable({ accounts, onEdit, onDelete }: ChartAccountTableProps) {
  if (accounts.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-10 text-center">
        <p className="text-sm text-slate-500">No accounts match your search.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="text-left font-medium text-slate-500 px-5 py-4">Account</th>
              <th className="text-left font-medium text-slate-500 px-2 py-4">Code</th>
              <th className="text-left font-medium text-slate-500 px-2 py-4">Account Group</th>
              <th className="text-left font-medium text-slate-500 px-2 py-4">Status</th>
              <th className="text-right font-medium text-slate-500 px-5 py-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {accounts.map((a) => (
              <tr key={a.id} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
                      <BookOpenCheck className="w-4 h-4 text-indigo-600" />
                    </div>
                    <span className="font-semibold text-slate-800">{a.name}</span>
                  </div>
                </td>
                <td className="px-2 py-4 text-slate-500 font-mono text-xs">{a.code}</td>
                <td className="px-2 py-4">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700">{a.accountGroup}</span>
                </td>
                <td className="px-2 py-4"><StatusPill status={a.status} /></td>
                <td className="px-5 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <button type="button" onClick={() => onEdit(a)} aria-label={`Edit ${a.name}`} className="w-8 h-8 flex items-center justify-center rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button type="button" onClick={() => onDelete(a.id)} aria-label={`Delete ${a.name}`} className="w-8 h-8 flex items-center justify-center rounded-lg bg-rose-600 text-white hover:bg-rose-700 transition-colors">
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