"use client";

import { useState } from "react";

import type { Employee } from "@/lib/types";
import type { EmployeeCreateInput, EmployeeUpdateInput } from "@/lib/validations/employees-schema";

interface EmployeeFormProps { initialValue?: Employee | null; submitting: boolean; error: string | null; onSubmit: (data: EmployeeCreateInput | EmployeeUpdateInput) => Promise<void>; onCancel: () => void; }
const STATUSES = ["Active", "Inactive", "Suspended"] as const;
const emptyToNull = (value: string) => value.trim() || null;

export default function EmployeeForm({ initialValue, submitting, error, onSubmit, onCancel }: EmployeeFormProps) {
  const [form, setForm] = useState({
    employeeNumber: initialValue?.employeeNumber ?? "",
    firstName: initialValue?.firstName ?? "", middleName: initialValue?.middleName ?? "", lastName: initialValue?.lastName ?? "",
    email: initialValue?.email ?? "", phone: initialValue?.phone ?? "", departmentId: initialValue?.departmentId ?? "", branchId: initialValue?.branchId ?? "",
    position: initialValue?.position ?? "", salary: initialValue?.salary?.toString() ?? "", birthdate: initialValue?.birthdate ?? "",
    nextOfKinName: initialValue?.nextOfKinName ?? "", nextOfKinPhone: initialValue?.nextOfKinPhone ?? "", guarantorName: initialValue?.guarantorName ?? "", guarantorPhone: initialValue?.guarantorPhone ?? "",
    status: initialValue?.status ?? "Active" as Employee["status"],
  });
  const patch = (fields: Partial<typeof form>) => setForm((current) => ({ ...current, ...fields }));
  const fieldClass = "rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500";
  const labelClass = "text-xs font-medium text-slate-500";

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const values: EmployeeCreateInput = {
      employeeNumber: form.employeeNumber.trim(), firstName: form.firstName.trim(), middleName: emptyToNull(form.middleName), lastName: form.lastName.trim(),
      email: emptyToNull(form.email), phone: emptyToNull(form.phone), departmentId: emptyToNull(form.departmentId), branchId: emptyToNull(form.branchId),
      position: form.position.trim(), salary: form.salary === "" ? null : Number(form.salary), birthdate: emptyToNull(form.birthdate),
      nextOfKinName: emptyToNull(form.nextOfKinName), nextOfKinPhone: emptyToNull(form.nextOfKinPhone), guarantorName: emptyToNull(form.guarantorName), guarantorPhone: emptyToNull(form.guarantorPhone),
    };
    await onSubmit(initialValue ? { ...values, status: form.status } : values);
  };

  return <form onSubmit={handleSubmit} className="flex max-h-[70vh] flex-col gap-5 overflow-y-auto pr-1">
    <Section title="Identity"><Grid><Field label="Employee number" value={form.employeeNumber} onChange={(value) => patch({ employeeNumber: value })} className={fieldClass} labelClass={labelClass} required autoFocus /><Field label="First name" value={form.firstName} onChange={(value) => patch({ firstName: value })} className={fieldClass} labelClass={labelClass} required /><Field label="Middle name" value={form.middleName} onChange={(value) => patch({ middleName: value })} className={fieldClass} labelClass={labelClass} /><Field label="Last name" value={form.lastName} onChange={(value) => patch({ lastName: value })} className={fieldClass} labelClass={labelClass} required /></Grid></Section>
    <Section title="Contact and assignment"><Grid><Field label="Email" type="email" value={form.email} onChange={(value) => patch({ email: value })} className={fieldClass} labelClass={labelClass} /><Field label="Phone" type="tel" value={form.phone} onChange={(value) => patch({ phone: value })} className={fieldClass} labelClass={labelClass} /><Field label="Department ID" value={form.departmentId} onChange={(value) => patch({ departmentId: value })} className={fieldClass} labelClass={labelClass} /><Field label="Branch ID" value={form.branchId} onChange={(value) => patch({ branchId: value })} className={fieldClass} labelClass={labelClass} /></Grid></Section>
    <Section title="Employment"><Grid><Field label="Position" value={form.position} onChange={(value) => patch({ position: value })} className={fieldClass} labelClass={labelClass} required /><Field label="Salary (TZS)" type="number" value={form.salary} onChange={(value) => patch({ salary: value })} className={fieldClass} labelClass={labelClass} min="0" /><Field label="Birthdate" type="date" value={form.birthdate} onChange={(value) => patch({ birthdate: value })} className={fieldClass} labelClass={labelClass} />{initialValue && <div className="flex flex-col gap-1"><label className={labelClass} htmlFor="employee-status">Status</label><select id="employee-status" value={form.status} onChange={(event) => patch({ status: event.target.value as Employee["status"] })} className={`${fieldClass} bg-white`}>{STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}</select></div>}</Grid></Section>
    <Section title="Emergency contacts"><Grid><Field label="Next of kin name" value={form.nextOfKinName} onChange={(value) => patch({ nextOfKinName: value })} className={fieldClass} labelClass={labelClass} /><Field label="Next of kin phone" type="tel" value={form.nextOfKinPhone} onChange={(value) => patch({ nextOfKinPhone: value })} className={fieldClass} labelClass={labelClass} /><Field label="Guarantor name" value={form.guarantorName} onChange={(value) => patch({ guarantorName: value })} className={fieldClass} labelClass={labelClass} /><Field label="Guarantor phone" type="tel" value={form.guarantorPhone} onChange={(value) => patch({ guarantorPhone: value })} className={fieldClass} labelClass={labelClass} /></Grid></Section>
    {error && <p className="text-sm text-rose-600">{error}</p>}<div className="sticky bottom-0 flex justify-end gap-2 bg-white pt-2"><button type="button" onClick={onCancel} disabled={submitting} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60">Cancel</button><button type="submit" disabled={submitting} className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60">{submitting ? "Saving…" : initialValue ? "Save changes" : "Add employee"}</button></div>
  </form>;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) { return <section className="flex flex-col gap-3"><h4 className="text-sm font-semibold text-slate-800">{title}</h4>{children}</section>; }
function Grid({ children }: { children: React.ReactNode }) { return <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{children}</div>; }
function Field({ label, type = "text", value, onChange, className, labelClass, required = false, min, autoFocus = false }: { label: string; type?: string; value: string; onChange: (value: string) => void; className: string; labelClass: string; required?: boolean; min?: string; autoFocus?: boolean }) { const id = `employee-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`; return <div className="flex flex-col gap-1"><label className={labelClass} htmlFor={id}>{label}{required && " *"}</label><input id={id} type={type} value={value} onChange={(event) => onChange(event.target.value)} className={className} required={required} min={min} autoFocus={autoFocus} /></div>; }
