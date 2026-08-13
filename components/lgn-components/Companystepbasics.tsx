
"use client";

import type { CompanyFormData } from "./Companywizardshell";

interface StepProps {
  data: CompanyFormData;
  onChange: (patch: Partial<CompanyFormData>) => void;
}

export default function CompanyStepBasics({
  data,
  onChange,
}: StepProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      {/* Company Name */}
      <div className="flex flex-col gap-1">
        <label
          htmlFor="company-name"
          className="text-xs font-semibold text-slate-500 uppercase tracking-wide"
        >
          Company Name <span className="text-rose-500">*</span>
        </label>

        <input
          id="company-name"
          type="text"
          value={data.companyName}
          onChange={(e) =>
            onChange({
              companyName: e.target.value,
            })
          }
          placeholder="e.g. City Electronics"
          autoFocus
          autoComplete="organization"
          className="px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm
            focus:outline-none focus:ring-2 focus:ring-indigo-500
            focus:border-transparent"
        />

        <p className="text-xs text-slate-400 mt-1">
          The official registered name of the company.
        </p>
      </div>

      {/* Display Name */}
      <div className="flex flex-col gap-1">
        <label
          htmlFor="display-name"
          className="text-xs font-semibold text-slate-500 uppercase tracking-wide"
        >
          Display Name <span className="text-rose-500">*</span>
        </label>

        <input
          id="display-name"
          type="text"
          value={data.displayName}
          onChange={(e) =>
            onChange({
              displayName: e.target.value,
            })
          }
          placeholder="e.g. City Electronics Ltd."
          autoComplete="organization"
          className="px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm
            focus:outline-none focus:ring-2 focus:ring-indigo-500
            focus:border-transparent"
        />

        <p className="text-xs text-slate-400 mt-1">
          The name displayed throughout the application.
        </p>
      </div>
    </div>
  );
}

