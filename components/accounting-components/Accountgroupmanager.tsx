"use client";

import { useState } from "react";
import { Layers, Pencil, Trash2 } from "lucide-react";

export interface AccountGroup {
  id: string;
  name: string;
  type: string;
  description: string;
}

export const ACCOUNT_GROUP_NAMES = ["Assets", "Capital", "Liability", "Revenue", "Expenses"];
export const ACCOUNT_TYPE_OPTIONS = ["Debit", "Credit"];

// Default debit/credit nature per group — used to prefill Type when a name is picked.
const DEFAULT_TYPE: Record<string, string> = {
  Assets: "Debit",
  Expenses: "Debit",
  Capital: "Credit",
  Liability: "Credit",
  Revenue: "Credit",
};

function TypePill({ type }: { type: string }) {
  const style = type === "Debit" ? "bg-indigo-50 text-indigo-700" : "bg-teal-50 text-teal-700";
  return <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${style}`}>{type}</span>;
}

interface AccountGroupFormProps {
  initialValue?: AccountGroup | null;
  existingNames: string[];
  onSubmit: (data: Omit<AccountGroup, "id">) => void;
  onCancel: () => void;
}

export function AccountGroupForm({ initialValue, existingNames, onSubmit, onCancel }: AccountGroupFormProps) {
  const [name, setName] = useState(initialValue?.name ?? ACCOUNT_GROUP_NAMES[0]);
  const [type, setType] = useState(initialValue?.type ?? DEFAULT_TYPE[ACCOUNT_GROUP_NAMES[0]]);
  const [description, setDescription] = useState(initialValue?.description ?? "");

  // Only offer names not already created, plus keep the current one when editing.
  const availableNames = ACCOUNT_GROUP_NAMES.filter(
    (n) => !existingNames.includes(n) || n === initialValue?.name
  );

  const handleNameChange = (value: string) => {
    setName(value);
    if (!initialValue) setType(DEFAULT_TYPE[value] ?? "Debit");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    onSubmit({ name, type, description: description.trim() });
  };

  const fieldClass = "px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-slate-500">Account Group Name</label>
        <select value={name} onChange={(e) => handleNameChange(e.target.value)} className={`${fieldClass} bg-white`} disabled={!!initialValue}>
          {availableNames.map((n) => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-slate-500">Type</label>
        <select value={type} onChange={(e) => setType(e.target.value)} className={`${fieldClass} bg-white`}>
          {ACCOUNT_TYPE_OPTIONS.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-slate-500">Description</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Briefly describe this account group..." className={`${fieldClass} resize-none`} />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onCancel} className="px-4 py-2 rounded-lg border border-slate-300 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
          Cancel
        </button>
        <button type="submit" className="px-5 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors">
          {initialValue ? "Save Changes" : "Add Account Group"}
        </button>
      </div>
    </form>
  );
}

interface AccountGroupTableProps {
  groups: AccountGroup[];
  onEdit: (group: AccountGroup) => void;
  onDelete: (id: string) => void;
}

export function AccountGroupTable({ groups, onEdit, onDelete }: AccountGroupTableProps) {
  if (groups.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-10 text-center">
        <p className="text-sm text-slate-500">No account groups match your search.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="text-left font-medium text-slate-500 px-5 py-4">Account Group</th>
              <th className="text-left font-medium text-slate-500 px-2 py-4">Type</th>
              <th className="text-left font-medium text-slate-500 px-2 py-4">Description</th>
              <th className="text-right font-medium text-slate-500 px-5 py-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {groups.map((g) => (
              <tr key={g.id} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
                      <Layers className="w-4 h-4 text-indigo-600" />
                    </div>
                    <span className="font-semibold text-slate-800">{g.name}</span>
                  </div>
                </td>
                <td className="px-2 py-4"><TypePill type={g.type} /></td>
                <td className="px-2 py-4 text-slate-500 max-w-xs truncate" title={g.description}>{g.description || "\u2014"}</td>
                <td className="px-5 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <button type="button" onClick={() => onEdit(g)} aria-label={`Edit ${g.name}`} className="w-8 h-8 flex items-center justify-center rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button type="button" onClick={() => onDelete(g.id)} aria-label={`Delete ${g.name}`} className="w-8 h-8 flex items-center justify-center rounded-lg bg-rose-600 text-white hover:bg-rose-700 transition-colors">
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