
"use client";

import type { CompanyFormData } from "./Companywizardshell";

interface StepProps {
  data: CompanyFormData;
  onChange: (patch: Partial<CompanyFormData>) => void;
}

export default function CompanyStepCompliance({
  data,
  onChange,
}: StepProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      {/* TIN */}
      <div className="flex flex-col gap-1">
        <label
          htmlFor="company-tin"
          className="text-xs font-semibold text-slate-500 uppercase tracking-wide"
        >
          TIN
        </label>

        <input
          id="company-tin"
          type="text"
          value={data.tin ?? ""}
          onChange={(e) => onChange({ tin: e.target.value })}
          placeholder="e.g. 123-456-789"
          autoComplete="off"
          className="px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm
            focus:outline-none focus:ring-2 focus:ring-indigo-500
            focus:border-transparent"
        />

        <p className="text-xs text-slate-400 mt-1">
          Optional — enter the company's Tax Identification Number.
        </p>
      </div>

      {/* Registration Number */}
      <div className="flex flex-col gap-1">
        <label
          htmlFor="registration-number"
          className="text-xs font-semibold text-slate-500 uppercase tracking-wide"
        >
          Registration Number
        </label>

        <input
          id="registration-number"
          type="text"
          value={data?.registrationNumber ?? ""}
          onChange={(e) =>
            onChange({
              registrationNumber: e.target.value,
            })
          }
          placeholder="e.g. REG-2026-00123"
          autoComplete="off"
          className="px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm
            focus:outline-none focus:ring-2 focus:ring-indigo-500
            focus:border-transparent"
        />

        <p className="text-xs text-slate-400 mt-1">
          Optional — enter the official registration number.
        </p>
      </div>
    </div>
  );
}

