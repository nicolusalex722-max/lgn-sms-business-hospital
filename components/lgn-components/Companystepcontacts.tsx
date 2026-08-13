
"use client";

import type { CompanyFormData } from "./Companywizardshell";

interface StepProps {
  data: CompanyFormData;
  onChange: (patch: Partial<CompanyFormData>) => void;
}

export default function CompanyStepContacts({
  data,
  onChange,
}: StepProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      {/* Company Email */}
      <div className="flex flex-col gap-1">
        <label
          htmlFor="company-email"
          className="text-xs font-semibold text-slate-500 uppercase tracking-wide"
        >
          Company Email <span className="text-rose-500">*</span>
        </label>

        <input
          id="company-email"
          type="email"
          value={data.email}
          onChange={(e) => onChange({ email: e.target.value })}
          placeholder="e.g. info@cityelectronics.co.tz"
          autoComplete="email"
          className="px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm
            focus:outline-none focus:ring-2 focus:ring-indigo-500
            focus:border-transparent"
        />
      </div>

      {/* Phone */}
      <div className="flex flex-col gap-1">
        <label
          htmlFor="company-phone"
          className="text-xs font-semibold text-slate-500 uppercase tracking-wide"
        >
          Phone Number
        </label>

        <input
          id="company-phone"
          type="tel"
          value={data.phone}
          onChange={(e) => onChange({ phone: e.target.value })}
          placeholder="e.g. +255 712 345 678"
          autoComplete="tel"
          className="px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm
            focus:outline-none focus:ring-2 focus:ring-indigo-500
            focus:border-transparent"
        />

        <p className="text-xs text-slate-400 mt-1">
          Include the country code when possible.
        </p>
      </div>

      {/* Address */}
      <div className="sm:col-span-2 flex flex-col gap-1">
        <label
          htmlFor="company-address"
          className="text-xs font-semibold text-slate-500 uppercase tracking-wide"
        >
          Address
        </label>

        <textarea
          id="company-address"
          value={data.address ?? ""}
          onChange={(e) => onChange({ address: e.target.value })}
          placeholder="e.g. Kariakoo, Dar es Salaam, Tanzania"
          rows={3}
          className="px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm
            resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500
            focus:border-transparent"
        />
      </div>
    </div>
  );
}

