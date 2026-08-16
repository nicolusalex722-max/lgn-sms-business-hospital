"use client";

import { Eye, Layers, Pencil, Trash2 } from "lucide-react";
import type { Department } from "@/lib/types";

interface DepartmentTableProps {
  departments: Department[];
  onView: (department: Department) => void;
  onEdit: (department: Department) => void;
  onDelete: (department: Department) => void;
}

function StatusPill({ status }: { status: Department["status"] }) {
  const style = status === "Active" ? "bg-sky-600 text-white" : "bg-slate-200 text-slate-600";
  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${style}`}>{status}</span>;
}

export default function DepartmentTable({ departments, onView, onEdit, onDelete }: DepartmentTableProps) {
  if (!departments.length) return <div className="rounded-xl border border-slate-200 bg-white p-10 text-center"><p className="text-sm text-slate-500">No departments match your search.</p></div>;

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white"><div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b border-slate-200"><th className="px-5 py-4 text-left font-medium text-slate-500">Department</th><th className="px-2 py-4 text-left font-medium text-slate-500">Code</th><th className="px-2 py-4 text-left font-medium text-slate-500">Description</th><th className="px-2 py-4 text-left font-medium text-slate-500">Status</th><th className="px-5 py-4 text-right font-medium text-slate-500">Actions</th></tr></thead><tbody>
      {departments.map((department) => <tr key={department.id} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50"><td className="px-5 py-4"><div className="flex items-center gap-3"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50"><Layers className="h-4 w-4 text-indigo-600" /></div><span className="font-semibold text-slate-800">{department.departmentName}</span></div></td><td className="px-2 py-4 font-mono text-xs text-slate-500">{department.departmentCode}</td><td className="max-w-xs truncate px-2 py-4 text-slate-500" title={department.description ?? ""}>{department.description || "—"}</td><td className="px-2 py-4"><StatusPill status={department.status} /></td><td className="px-5 py-4"><div className="flex items-center justify-end gap-2"><Action label={`View ${department.departmentName}`} onClick={() => onView(department)}><Eye className="h-3.5 w-3.5" /></Action><Action label={`Edit ${department.departmentName}`} onClick={() => onEdit(department)}><Pencil className="h-3.5 w-3.5" /></Action><Action label={`Delete ${department.departmentName}`} onClick={() => onDelete(department)} danger><Trash2 className="h-3.5 w-3.5" /></Action></div></td></tr>)}
    </tbody></table></div></div>
  );
}

function Action({ label, onClick, danger = false, children }: { label: string; onClick: () => void; danger?: boolean; children: React.ReactNode }) {
  return <button type="button" onClick={onClick} aria-label={label} className={`flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-colors hover:bg-slate-50 ${danger ? "hover:bg-rose-50 hover:text-rose-600" : "hover:text-indigo-600"}`}>{children}</button>;
}
