"use client";

import { useState } from "react";

import type { Company } from "@/lib/types";
import type { CompanyProfileUpdateInput } from "@/lib/validations/company-profile-schema";

interface CompanyProfileEditFormProps {
  company: Company;
  updating: boolean;
  error: string | null;
  onSubmit: (data: CompanyProfileUpdateInput) => Promise<void>;
  onCancel: () => void;
}

function toFormValues(company: Company): CompanyProfileUpdateInput {
  return {
    companyName: company.companyName,
    displayName: company.displayName,
    email: company.email,
    phone: company.phone ?? "",
    address: company.address ?? "",
    tin: company.tin ?? "",
    registrationNumber: company.registrationNumber ?? "",
  };
}

export default function CompanyProfileEditForm({ company, updating, error, onSubmit, onCancel }: CompanyProfileEditFormProps) {
  const [form, setForm] = useState<CompanyProfileUpdateInput>(() => toFormValues(company));

  const patch = (fields: Partial<CompanyProfileUpdateInput>) => setForm((current) => ({ ...current, ...fields }));

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onSubmit(form);
  };

  const fieldClass = "rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500";
  const labelClass = "text-xs font-semibold uppercase tracking-wide text-slate-500";

  return (
    <form onSubmit={handleSubmit} className="flex max-h-[65vh] flex-col gap-6 overflow-y-auto pr-1">
      <div className="flex flex-col gap-4">
        <h4 className="text-sm font-semibold text-slate-800">Company information</h4>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Company name" value={form.companyName} onChange={(value) => patch({ companyName: value })} className={fieldClass} labelClass={labelClass} />
          <Field label="Display name" value={form.displayName} onChange={(value) => patch({ displayName: value })} className={fieldClass} labelClass={labelClass} />
          <Field label="Company email" type="email" value={form.email} onChange={(value) => patch({ email: value })} className={fieldClass} labelClass={labelClass} />
          <Field label="Phone" type="tel" value={form.phone} onChange={(value) => patch({ phone: value })} className={fieldClass} labelClass={labelClass} />
          <Field label="TIN" value={form.tin ?? ""} onChange={(value) => patch({ tin: value })} className={fieldClass} labelClass={labelClass} />
          <Field label="Registration number" value={form.registrationNumber ?? ""} onChange={(value) => patch({ registrationNumber: value })} className={fieldClass} labelClass={labelClass} />
        </div>
        <div className="flex flex-col gap-1">
          <label className={labelClass} htmlFor="company-address">Address</label>
          <textarea id="company-address" value={form.address ?? ""} onChange={(event) => patch({ address: event.target.value })} className={fieldClass} rows={3} />
        </div>
        <p className="-mt-2 text-xs text-slate-400">Company status and subscription details are managed by the platform administrator.</p>
      </div>

      {error && <p className="text-sm text-rose-600">{error}</p>}

      <div className="sticky bottom-0 flex justify-end gap-2 bg-white pt-2">
        <button type="button" onClick={onCancel} disabled={updating} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60">Cancel</button>
        <button type="submit" disabled={updating} className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60">{updating ? "Saving…" : "Save changes"}</button>
      </div>
    </form>
  );
}

function Field({ label, type = "text", value, onChange, className, labelClass }: { label: string; type?: string; value: string; onChange: (value: string) => void; className: string; labelClass: string }) {
  const id = `company-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;

  return (
    <div className="flex flex-col gap-1">
      <label className={labelClass} htmlFor={id}>{label}</label>
      <input id={id} type={type} value={value} onChange={(event) => onChange(event.target.value)} className={className} />
    </div>
  );
}
