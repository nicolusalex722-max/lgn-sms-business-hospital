"use client";

import { useState } from "react";

import type { Branch } from "@/lib/types";
import type { BranchCreateInput, BranchUpdateInput } from "@/lib/validations/branches-schema";

interface BranchFormProps { initialValue?: Branch | null; submitting: boolean; error: string | null; onSubmit: (data: BranchCreateInput | BranchUpdateInput) => Promise<void>; onCancel: () => void; }

const STATUS_OPTIONS = ["Active", "Inactive"] as const;

export default function BranchForm({ initialValue, submitting, error, onSubmit, onCancel }: BranchFormProps) {
  const [name, setName] = useState(initialValue?.branchName ?? "");
  const [code, setCode] = useState(initialValue?.branchCode ?? "");
  const [location, setLocation] = useState(initialValue?.location ?? "");
  const [status, setStatus] = useState<Branch["status"]>(initialValue?.status ?? "Active");
  const inputClass = "rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500";

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const values: BranchCreateInput = { branchName: name.trim(), branchCode: code.trim().toUpperCase(), location: location.trim() };
    await onSubmit(initialValue ? { ...values, status } : values);
  };

  return <form onSubmit={handleSubmit} className="flex flex-col gap-4">
    <div className="flex flex-col gap-1"><label className="text-xs font-medium text-slate-500" htmlFor="branch-name">Branch name</label><input id="branch-name" type="text" value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. Mwanza Branch" required autoFocus className={inputClass} /></div>
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2"><div className="flex flex-col gap-1"><label className="text-xs font-medium text-slate-500" htmlFor="branch-code">Code</label><input id="branch-code" type="text" value={code} onChange={(event) => setCode(event.target.value)} placeholder="e.g. MWZ" required className={`${inputClass} uppercase`} /></div>{initialValue && <div className="flex flex-col gap-1"><label className="text-xs font-medium text-slate-500" htmlFor="branch-status">Status</label><select id="branch-status" value={status} onChange={(event) => setStatus(event.target.value as Branch["status"])} className={`${inputClass} bg-white`}>{STATUS_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}</select></div>}</div>
    <div className="flex flex-col gap-1"><label className="text-xs font-medium text-slate-500" htmlFor="branch-location">Location</label><input id="branch-location" type="text" value={location} onChange={(event) => setLocation(event.target.value)} placeholder="e.g. Mwanza City, Tanzania" className={inputClass} /></div>
    {error && <p className="text-sm text-rose-600">{error}</p>}
    <div className="flex justify-end gap-2 pt-2"><button type="button" onClick={onCancel} disabled={submitting} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60">Cancel</button><button type="submit" disabled={submitting} className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60">{submitting ? "Saving…" : initialValue ? "Save changes" : "Add branch"}</button></div>
  </form>;
}
