"use client";

import { ArrowLeft, Pencil, Trash2, Hash, Building2, Phone, Store, FileText } from "lucide-react";

interface CompanyProfileHeaderProps {
  name: string;
  email: string;
  status: string;
  vendorNumber: string;
  phone: string;
  shopsCount: number;
  contractsCount: number;
  onBack: () => void;
  onEdit: () => void;
  onDeactivate: () => void;
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

function Chip({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 text-xs font-medium text-slate-600">
      <Icon className="w-3.5 h-3.5 text-slate-400" />
      {label}
    </span>
  );
}

export default function CompanyProfileHeader({
  name,
  email,
  status,
  vendorNumber,
  phone,
  shopsCount,
  contractsCount,
  onBack,
  onEdit,
  onDeactivate,
}: CompanyProfileHeaderProps) {
  return (
    <div>
      {/* Top bar */}
      <div className="flex items-center justify-between mb-5">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Companies
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onEdit}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-300 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" />
            Edit
          </button>
          <button
            type="button"
            onClick={onDeactivate}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-rose-200 text-sm font-medium text-rose-600 hover:bg-rose-50 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Deactivate
          </button>
        </div>
      </div>

      {/* Identity card */}
      <div className="bg-white rounded-t-xl border border-slate-200 border-b-0 p-6">
        <div className="h-1 -mt-6 -mx-6 mb-6 rounded-t-xl bg-indigo-500" />
        <div className="flex items-start gap-4">
          <div className="relative shrink-0">
            <div className="w-16 h-16 rounded-2xl bg-indigo-500 flex items-center justify-center text-white text-xl font-bold">
              {initials(name)}
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-slate-800">{name}</h1>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                {status}
              </span>
            </div>
            <p className="text-sm text-slate-400 mt-0.5">{email}</p>

            <div className="flex items-center gap-2 flex-wrap mt-3">
              <Chip icon={Hash} label={vendorNumber} />
              <Chip icon={Building2} label={name} />
              <Chip icon={Phone} label={phone} />
              {/* <Chip icon={Store} label={`${shopsCount} Shops`} /> */}
              <Chip icon={FileText} label={`${contractsCount} Contracts`} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}