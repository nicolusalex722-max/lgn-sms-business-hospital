"use client";

import { useState } from "react";

import type { Department } from "@/lib/types";
import type {
  DepartmentCreateInput,
  DepartmentUpdateInput,
} from "@/lib/validations/department-schema";

interface DepartmentFormProps {
  initialValue?: Department | null;
  submitting: boolean;
  error: string | null;
  onSubmit: (
    data: DepartmentCreateInput | DepartmentUpdateInput,
  ) => Promise<void>;
  onCancel: () => void;
}

const STATUS_OPTIONS = ["Active", "Inactive"] as const;

export default function DepartmentForm({
  initialValue,
  submitting,
  error,
  onSubmit,
  onCancel,
}: DepartmentFormProps) {
  const [name, setName] = useState(initialValue?.departmentName ?? "");
  const [code, setCode] = useState(initialValue?.departmentCode ?? "");
  const [description, setDescription] = useState(
    initialValue?.description ?? "",
  );
  const [status, setStatus] = useState<Department["status"]>(
    initialValue?.status ?? "Active",
  );

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const values: DepartmentCreateInput = {
      departmentName: name.trim(),
      departmentCode: code.trim().toUpperCase(),
      description: description.trim(),
    };
    await onSubmit(initialValue ? { ...values, status } : values);
  };

  const fieldClass =
    "rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label
          className="text-xs font-medium text-slate-500"
          htmlFor="department-name"
        >
          Department name
        </label>
        <input
          id="department-name"
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="e.g. Collections"
          required
          autoFocus
          className={fieldClass}
        />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <label
            className="text-xs font-medium text-slate-500"
            htmlFor="department-code"
          >
            Code
          </label>
          <input
            id="department-code"
            type="text"
            value={code}
            onChange={(event) => setCode(event.target.value)}
            placeholder="e.g. COL"
            required
            className={`${fieldClass} uppercase`}
          />
        </div>
        {initialValue && (
          <div className="flex flex-col gap-1">
            <label
              className="text-xs font-medium text-slate-500"
              htmlFor="department-status"
            >
              Status
            </label>
            <select
              id="department-status"
              value={status}
              onChange={(event) =>
                setStatus(event.target.value as Department["status"])
              }
              className={`${fieldClass} bg-white`}
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
      <div className="flex flex-col gap-1">
        <label
          className="text-xs font-medium text-slate-500"
          htmlFor="department-description"
        >
          Description
        </label>
        <textarea
          id="department-description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="e.g. Loan recovery and collections management"
          rows={3}
          className={`${fieldClass} resize-none`}
        />
      </div>
      {error && <p className="text-sm text-rose-600">{error}</p>}
      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting
            ? "Saving…"
            : initialValue
              ? "Save changes"
              : "Add department"}
        </button>
      </div>
    </form>
  );
}
