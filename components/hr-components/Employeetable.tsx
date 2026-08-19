"use client";

import { Pencil, Trash2 } from "lucide-react";
import type { Employee } from "@/lib/types";

/** @deprecated Legacy import/export and seed-data shape. */
export interface LegacyEmployee {
  id: string;
  firstName: string;
  middleName: string;
  lastName: string;
  email: string;
  department: string;
  branch: string;
  phone: string;
  salary: number;
  birthdate: string;
  position: string;
  nextOfKin: string;
  guarantorPhone: string;
}

export type { LegacyEmployee as Employee };

interface EmployeeTableProps { employees: Employee[]; onEdit: (employee: Employee) => void; onDelete: (employee: Employee) => void; }
const formatCurrency = (value: number | null) => value === null ? "—" : `TZS ${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
const shortId = (value: string | null) => value ? `${value.slice(0, 8)}…` : "Not assigned";

export default function EmployeeTable({ employees, onEdit, onDelete }: EmployeeTableProps) {
  if (!employees.length) return <div className="rounded-xl border border-slate-200 bg-white p-10 text-center"><p className="text-sm text-slate-500">No employees match your search.</p></div>;
  return <div className="overflow-hidden rounded-xl border border-slate-200 bg-white"><div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b border-slate-200"><th className="px-5 py-4 text-left font-medium text-slate-500">Employee</th><th className="px-2 py-4 text-left font-medium text-slate-500">Position</th><th className="px-2 py-4 text-left font-medium text-slate-500">Department</th><th className="px-2 py-4 text-left font-medium text-slate-500">Phone</th><th className="px-2 py-4 text-left font-medium text-slate-500">Email</th><th className="px-2 py-4 text-right font-medium text-slate-500">Salary</th><th className="px-5 py-4 text-right font-medium text-slate-500">Actions</th></tr></thead><tbody>{employees.map((employee) => <tr key={employee.id} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50"><td className="px-5 py-4"><p className="font-semibold text-slate-800">{[employee.firstName, employee.middleName, employee.lastName].filter(Boolean).join(" ")}</p><p className="font-mono text-xs text-slate-400">{employee.employeeNumber}</p></td><td className="px-2 py-4 text-slate-600">{employee.position}</td><td className="px-2 py-4"><span title={employee.departmentId ?? ""} className="inline-flex rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700">{shortId(employee.departmentId)}</span></td><td className="px-2 py-4 text-slate-500">{employee.phone || "—"}</td><td className="px-2 py-4 text-slate-500">{employee.email || "—"}</td><td className="px-2 py-4 text-right text-slate-700">{formatCurrency(employee.salary)}</td><td className="px-5 py-4 text-right"><div className="flex justify-end gap-2"><button type="button" onClick={() => onEdit(employee)} aria-label={`Edit ${employee.firstName} ${employee.lastName}`} className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"><Pencil className="h-3.5 w-3.5" /></button><button type="button" onClick={() => onDelete(employee)} aria-label={`Delete ${employee.firstName} ${employee.lastName}`} className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-rose-50 hover:text-rose-600"><Trash2 className="h-3.5 w-3.5" /></button></div></td></tr>)}</tbody></table></div></div>;
}
