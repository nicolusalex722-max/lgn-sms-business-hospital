"use client";

import { useState } from "react";
import type { TenantCompanyProfile } from "./Tenantprofiledata";

interface TenantProfileEditFormProps {
  profile: TenantCompanyProfile;
  onSubmit: (data: TenantCompanyProfile) => void;
  onCancel: () => void;
}

export default function TenantProfileEditForm({ profile, onSubmit, onCancel }: TenantProfileEditFormProps) {
  const [form, setForm] = useState<TenantCompanyProfile>(profile);

  const patch = (fields: Partial<TenantCompanyProfile>) => setForm((prev) => ({ ...prev, ...fields }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  const fieldClass =
    "px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent";
  const labelClass = "text-xs font-semibold text-slate-500 uppercase tracking-wide";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 max-h-[65vh] overflow-y-auto pr-1">
      {/* Overview */}
      <div className="flex flex-col gap-4">
        <h4 className="text-sm font-semibold text-slate-800">Company Overview</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className={labelClass}>Name</label>
            <input type="text" value={form.name} onChange={(e) => patch({ name: e.target.value })} className={fieldClass} />
          </div>
          <div className="flex flex-col gap-1">
            <label className={labelClass}>Display Name</label>
            <input
              type="text"
              value={form.displayName}
              onChange={(e) => patch({ displayName: e.target.value })}
              className={fieldClass}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className={labelClass}>Tax ID</label>
            <input type="text" value={form.taxId} onChange={(e) => patch({ taxId: e.target.value })} className={fieldClass} />
          </div>
        </div>
        <p className="text-xs text-slate-400 -mt-2">
          Status is managed by your account administrator and can&apos;t be changed here.
        </p>
      </div>

      {/* Business & Localization */}
      <div className="flex flex-col gap-4 pt-4 border-t border-slate-100">
        <h4 className="text-sm font-semibold text-slate-800">Business &amp; Localization</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className={labelClass}>Business Structure</label>
            <input
              type="text"
              value={form.businessStructure}
              onChange={(e) => patch({ businessStructure: e.target.value })}
              className={fieldClass}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className={labelClass}>Business Type</label>
            <input
              type="text"
              value={form.businessType}
              onChange={(e) => patch({ businessType: e.target.value })}
              className={fieldClass}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className={labelClass}>Industry</label>
            <input type="text" value={form.industry} onChange={(e) => patch({ industry: e.target.value })} className={fieldClass} />
          </div>
          <div className="flex flex-col gap-1">
            <label className={labelClass}>Base Currency</label>
            <input
              type="text"
              value={form.baseCurrency}
              onChange={(e) => patch({ baseCurrency: e.target.value })}
              className={fieldClass}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className={labelClass}>Timezone</label>
            <input type="text" value={form.timezone} onChange={(e) => patch({ timezone: e.target.value })} className={fieldClass} />
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="flex flex-col gap-4 pt-4 border-t border-slate-100">
        <h4 className="text-sm font-semibold text-slate-800">Contact Information</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className={labelClass}>Company Email</label>
            <input
              type="email"
              value={form.companyEmail}
              onChange={(e) => patch({ companyEmail: e.target.value })}
              className={fieldClass}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className={labelClass}>Company Phone</label>
            <input
              type="tel"
              value={form.companyPhone}
              onChange={(e) => patch({ companyPhone: e.target.value })}
              className={fieldClass}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className={labelClass}>Website</label>
            <input type="url" value={form.website} onChange={(e) => patch({ website: e.target.value })} className={fieldClass} />
          </div>
        </div>
      </div>

      {/* Support Contacts */}
      <div className="flex flex-col gap-4 pt-4 border-t border-slate-100">
        <h4 className="text-sm font-semibold text-slate-800">Support Contacts</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className={labelClass}>Support Email</label>
            <input
              type="email"
              value={form.supportEmail}
              onChange={(e) => patch({ supportEmail: e.target.value })}
              className={fieldClass}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className={labelClass}>Support Phone</label>
            <input
              type="tel"
              value={form.supportPhone}
              onChange={(e) => patch({ supportPhone: e.target.value })}
              className={fieldClass}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className={labelClass}>Support URL</label>
            <input
              type="url"
              value={form.supportUrl}
              onChange={(e) => patch({ supportUrl: e.target.value })}
              className={fieldClass}
            />
          </div>
        </div>
      </div>

      {/* Primary Address */}
      <div className="flex flex-col gap-4 pt-4 border-t border-slate-100">
        <h4 className="text-sm font-semibold text-slate-800">Primary Address</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className={labelClass}>Line 1</label>
            <input
              type="text"
              value={form.addressLine1}
              onChange={(e) => patch({ addressLine1: e.target.value })}
              className={fieldClass}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className={labelClass}>Line 2</label>
            <input
              type="text"
              value={form.addressLine2}
              onChange={(e) => patch({ addressLine2: e.target.value })}
              className={fieldClass}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className={labelClass}>City</label>
            <input type="text" value={form.city} onChange={(e) => patch({ city: e.target.value })} className={fieldClass} />
          </div>
          <div className="flex flex-col gap-1">
            <label className={labelClass}>State</label>
            <input type="text" value={form.state} onChange={(e) => patch({ state: e.target.value })} className={fieldClass} />
          </div>
          <div className="flex flex-col gap-1">
            <label className={labelClass}>Postal Code</label>
            <input
              type="text"
              value={form.postalCode}
              onChange={(e) => patch({ postalCode: e.target.value })}
              className={fieldClass}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className={labelClass}>Country</label>
            <input type="text" value={form.country} onChange={(e) => patch({ country: e.target.value })} className={fieldClass} />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2 sticky bottom-0 bg-white">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-lg border border-slate-300 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-5 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          Save Changes
        </button>
      </div>
    </form>
  );
}