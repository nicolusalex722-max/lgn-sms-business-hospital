"use client";

import type { CompanyFormData } from "./Companywizardshell";

interface StepProps {
  data: CompanyFormData;
  onChange: (patch: Partial<CompanyFormData>) => void;
}

const BUSINESS_TYPES = ["Business", "Education", "Hospital"];

export default function CompanyStepBasics({ data, onChange }: StepProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
          Company Name <span className="text-rose-500">*</span>
        </label>
        <input
          type="text"
          value={data.name}
          onChange={(e) => onChange({ name: e.target.value })}
          placeholder="e.g. City Electronics"
          required
          className="px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
          Display Name
        </label>
        <input
          type="text"
          value={data.displayName}
          onChange={(e) => onChange({ displayName: e.target.value })}
          placeholder="e.g. City Electronics Ltd."
          className="px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
          Business Type
        </label>
        <select
          value={data.businessType}
          onChange={(e) => onChange({ businessType: e.target.value })}
          className="px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        >
          {BUSINESS_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}