"use client";

import {
  Pencil,
  Trash2,
  CreditCard,
} from "lucide-react";

import type {
  Company,
  ProductType,
} from "@/lib/types";

interface CompanyTableProps {
  companies: Company[];
  onEdit: (company: Company) => void;
  onDelete: (id: string) => void;
  onSubscribe: (company: Company) => void;
}

const STATUS_STYLES: Record<
  Company["status"],
  string
> = {
  Active:
    "border-emerald-300 text-emerald-700 bg-white",

  Inactive:
    "border-slate-300 text-slate-500 bg-white",

  Suspended:
    "border-amber-300 text-amber-700 bg-white",
};

const PRODUCT_TYPE_STYLES: Record<
  ProductType,
  string
> = {
  Business:
    "border-blue-300 text-blue-700 bg-blue-50",

  Education:
    "border-violet-300 text-violet-700 bg-violet-50",

  Hospital:
    "border-rose-300 text-rose-700 bg-rose-50",
};

function StatusBadge({
  status,
}: {
  status: Company["status"];
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${
        STATUS_STYLES[status]
      }`}
    >
      {status}
    </span>
  );
}

function ProductTypeBadge({
  type,
}: {
  type: Company["businessType"];
}) {
  if (!type) {
    return (
      <span className="text-sm text-slate-400">
        —
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${
        PRODUCT_TYPE_STYLES[type]
      }`}
    >
      {type}
    </span>
  );
}

export default function CompanyTable({
  companies,
  onEdit,
  onDelete,
  onSubscribe,
}: CompanyTableProps) {
  if (companies.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
        <p className="text-sm text-slate-500">
          No companies match your search.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="px-5 py-4 text-left font-medium text-slate-400">
                Company Name
              </th>

              <th className="px-2 py-4 text-left font-medium text-slate-400">
                Product Type
              </th>

              <th className="px-2 py-4 text-left font-medium text-slate-400">
                Email
              </th>

              <th className="px-2 py-4 text-left font-medium text-slate-400">
                Phone
              </th>

              <th className="px-2 py-4 text-left font-medium text-slate-400">
                TIN
              </th>

              <th className="px-2 py-4 text-left font-medium text-slate-400">
                Status
              </th>

              <th className="px-5 py-4 text-right font-medium text-slate-400">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {companies.map((company) => (
              <tr
                key={company.id}
                className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50"
              >
                <td className="px-5 py-4">
                  <div className="font-semibold text-slate-800">
                    {company.companyName}
                  </div>

                  {company.displayName &&
                    company.displayName !==
                      company.companyName && (
                      <div className="mt-0.5 text-xs text-slate-400">
                        {company.displayName}
                      </div>
                    )}
                </td>

                <td className="px-2 py-4">
                  <ProductTypeBadge
                    type={company.businessType}
                  />
                </td>

                <td className="px-2 py-4 text-slate-600">
                  {company.email || "—"}
                </td>

                <td className="px-2 py-4 text-slate-600">
                  {company.phone || "—"}
                </td>

                <td className="px-2 py-4 text-slate-600">
                  {company.tin || "—"}
                </td>

                <td className="px-2 py-4">
                  <StatusBadge
                    status={company.status}
                  />
                </td>

                <td className="px-5 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        onSubscribe(company)
                      }
                      aria-label={`Manage subscription for ${company.companyName}`}
                      title="Subscription"
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-colors hover:bg-indigo-50 hover:text-indigo-600"
                    >
                      <CreditCard className="h-3.5 w-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        onEdit(company)
                      }
                      aria-label={`Edit ${company.companyName}`}
                      title="Edit"
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-colors hover:bg-slate-50 hover:text-indigo-600"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        onDelete(company.id)
                      }
                      aria-label={`Delete ${company.companyName}`}
                      title="Delete"
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-colors hover:bg-rose-50 hover:text-rose-600"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
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