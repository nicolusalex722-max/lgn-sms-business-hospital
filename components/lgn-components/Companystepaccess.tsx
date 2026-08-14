"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import type { CompanyFormData } from "./Companywizardshell";

interface StepProps {
  data: CompanyFormData;
  onChange: (patch: Partial<CompanyFormData>) => void;
}

export default function CompanyStepAccess({ data, onChange }: StepProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
          Login Email <span className="text-rose-500">*</span>
        </label>
        <input
          type="email"
          value={data.loginEmail}
          onChange={(e) => onChange({ loginEmail: e.target.value })}
          placeholder="e.g. admin@cityelectronics.co.tz"
          required
          className="px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
          Password <span className="text-rose-500">*</span>
        </label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            value={data.password}
            onChange={(e) => onChange({ password: e.target.value })}
            placeholder="Set an initial password"
            required
            className="w-full px-3.5 py-2.5 pr-10 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          The company admin can change this after their first login.
        </p>
      </div>
    </div>
  );
}