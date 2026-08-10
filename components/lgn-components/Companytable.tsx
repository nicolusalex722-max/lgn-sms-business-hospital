"use client";

import { Pencil, Trash2, CreditCard } from "lucide-react";

export interface Company {
  id: string;
  name: string;
  businessType: string;
  email: string;
  status: string;
}

interface CompanyTableProps {
  companies: Company[];
  onEdit: (company: Company) => void;
  onDelete: (id: string) => void;
  onSubscribe: (company: Company) => void;
}

const TYPE_STYLES: Record<string, string> = {
  Business: "bg-indigo-50 text-indigo-700",
  Education: "bg-sky-50 text-sky-700",
  Hospital: "bg-teal-50 text-teal-700",
};

const STATUS_STYLES: Record<string, string> = {
  Active: "border-emerald-300 text-emerald-700 bg-white",
  Inactive: "border-slate-300 text-slate-500 bg-white",
};

function TypeBadge({ type }: { type: string }) {
  const style = TYPE_STYLES[type] ?? "bg-slate-100 text-slate-600";
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${style}`}>
      {type}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const style = STATUS_STYLES[status] ?? STATUS_STYLES["Inactive"];
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${style}`}>
      {status}
    </span>
  );
}

export default function CompanyTable({ companies, onEdit, onDelete, onSubscribe }: CompanyTableProps) {
  if (companies.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-10 text-center">
        <p className="text-sm text-slate-500">No companies match your search.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="text-left font-medium text-slate-400 px-5 py-4">Company Name</th>
              <th className="text-left font-medium text-slate-400 px-2 py-4">Business Type</th>
              <th className="text-left font-medium text-slate-400 px-2 py-4">Email</th>
              <th className="text-left font-medium text-slate-400 px-2 py-4">Status</th>
              <th className="text-right font-medium text-slate-400 px-5 py-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {companies.map((company) => (
              <tr key={company.id} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50">
                <td className="px-5 py-4 font-semibold text-slate-800">{company.name}</td>
                <td className="px-2 py-4">
                  <TypeBadge type={company.businessType} />
                </td>
                <td className="px-2 py-4 text-slate-600">{company.email || "\u2014"}</td>
                <td className="px-2 py-4">
                  <StatusBadge status={company.status} />
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => onSubscribe(company)}
                      aria-label={`Manage subscription for ${company.name}`}
                      title="Subscription"
                      className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onEdit(company)}
                      aria-label={`Edit ${company.name}`}
                      className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-indigo-600 transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(company.id)}
                      aria-label={`Delete ${company.name}`}
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

