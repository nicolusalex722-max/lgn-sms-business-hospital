"use client";

import type { CompanyFormData } from "./Companywizardshell";

interface StepProps {
  data: CompanyFormData;
  onChange: (patch: Partial<CompanyFormData>) => void;
}

export default function CompanyStepContacts({ data, onChange }: StepProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
          Company Email
        </label>
        <input
          type="email"
          value={data.email}
          onChange={(e) => onChange({ email: e.target.value })}
          placeholder="e.g. info@cityelectronics.co.tz"
          className="px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
          Phone Number
        </label>
        <input
          type="tel"
          value={data.phone}
          onChange={(e) => onChange({ phone: e.target.value })}
          placeholder="e.g. +255 712 345 678"
          className="px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
      </div>

      <div className="sm:col-span-2 flex flex-col gap-1">
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
          Address
        </label>
        <textarea
          value={data.address}
          onChange={(e) => onChange({ address: e.target.value })}
          placeholder="e.g. Kariakoo, Dar es Salaam, Tanzania"
          rows={3}
          className="px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
      </div>
    </div>
  );
}