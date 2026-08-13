
"use client";

import { useState } from "react";

import type {
  Company,
  CompanyStatus,
} from "@/lib/types";

import type {
  CompanyUpdateInput,
} from "@/lib/validations/company-schema";

interface CompanyEditFormProps {
  company: Company;
  onSubmit: (data: CompanyUpdateInput) => Promise<void>;
  onCancel: () => void;
}

const STATUS_OPTIONS: CompanyStatus[] = [
  "Active",
  "Inactive",
  "Suspended",
];

export default function CompanyEditForm({
  company,
  onSubmit,
  onCancel,
}: CompanyEditFormProps) {
  const [companyName, setCompanyName] = useState(
    company.companyName
  );

  const [displayName, setDisplayName] = useState(
    company.displayName
  );

  const [email, setEmail] = useState(
    company.email
  );

  const [phone, setPhone] = useState(
    company.phone ?? ""
  );

  const [address, setAddress] = useState(
    company.address ?? ""
  );

  const [tin, setTin] = useState(
    company.tin ?? ""
  );

  const [registrationNumber, setRegistrationNumber] =
    useState(company.registrationNumber ?? "");

  const [status, setStatus] = useState<CompanyStatus>(
    company.status
  );

  const [saving, setSaving] = useState(false);

  const [formError, setFormError] =
    useState<string | null>(null);

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setFormError(null);
    setSaving(true);

    try {
      await onSubmit({
        companyName,
        displayName,
        email,
        phone,
        address: address || null,
        tin: tin || null,
        registrationNumber:
          registrationNumber || null,
        status,
      });
    } catch (error) {
      console.error(
        "CompanyEditForm submit error:",
        error
      );

      setFormError(
        "Something went wrong while updating the company."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-5"
    >
      {formError && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3">
          <p className="text-sm text-rose-700">
            {formError}
          </p>
        </div>
      )}

      {/* Company Name */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-slate-500">
          Company Name
        </label>

        <input
          type="text"
          value={companyName}
          onChange={(event) =>
            setCompanyName(event.target.value)
          }
          required
          autoFocus
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Display Name */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-slate-500">
          Display Name
        </label>

        <input
          type="text"
          value={displayName}
          onChange={(event) =>
            setDisplayName(event.target.value)
          }
          required
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Email */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-slate-500">
          Company Email
        </label>

        <input
          type="email"
          value={email}
          onChange={(event) =>
            setEmail(event.target.value)
          }
          required
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Phone */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-slate-500">
          Phone
        </label>

        <input
          type="tel"
          value={phone}
          onChange={(event) =>
            setPhone(event.target.value)
          }
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Address */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-slate-500">
          Address
        </label>

        <textarea
          value={address}
          onChange={(event) =>
            setAddress(event.target.value)
          }
          rows={3}
          className="resize-none rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Compliance */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">
            TIN
          </label>

          <input
            type="text"
            value={tin}
            onChange={(event) =>
              setTin(event.target.value)
            }
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">
            Registration Number
          </label>

          <input
            type="text"
            value={registrationNumber}
            onChange={(event) =>
              setRegistrationNumber(event.target.value)
            }
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Status */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-slate-500">
          Status
        </label>

        <select
          value={status}
          onChange={(event) =>
            setStatus(
              event.target.value as CompanyStatus
            )
          }
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {STATUS_OPTIONS.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </form>
  );
}

