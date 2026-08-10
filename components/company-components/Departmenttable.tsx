"use client";

import { Layers, Eye, Pencil, Trash2 } from "lucide-react";

export interface Department {
  id: string;
  name: string;
  code: string;
  description: string;
  status: string;
}

interface DepartmentTableProps {
  departments: Department[];
  onView: (department: Department) => void;
  onEdit: (department: Department) => void;
  onDelete: (id: string) => void;
}

function StatusPill({ status }: { status: string }) {
  const style =
    status === "Active" ? "bg-sky-600 text-white" : "bg-slate-200 text-slate-600";
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${style}`}>
      {status}
    </span>
  );
}

export default function DepartmentTable({ departments, onView, onEdit, onDelete }: DepartmentTableProps) {
  if (departments.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-10 text-center">
        <p className="text-sm text-slate-500">No departments match your search.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="text-left font-medium text-slate-500 px-5 py-4">Department</th>
              <th className="text-left font-medium text-slate-500 px-2 py-4">Code</th>
              <th className="text-left font-medium text-slate-500 px-2 py-4">Description</th>
              <th className="text-left font-medium text-slate-500 px-2 py-4">Status</th>
              <th className="text-right font-medium text-slate-500 px-5 py-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {departments.map((dept) => (
              <tr key={dept.id} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
                      <Layers className="w-4 h-4 text-indigo-600" />
                    </div>
                    <span className="font-semibold text-slate-800">{dept.name}</span>
                  </div>
                </td>
                <td className="px-2 py-4 text-slate-500 font-mono text-xs">{dept.code}</td>
                <td className="px-2 py-4 text-slate-500 max-w-xs truncate" title={dept.description}>
                  {dept.description || "\u2014"}
                </td>
                <td className="px-2 py-4">
                  <StatusPill status={dept.status} />
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => onView(dept)}
                      aria-label={`View ${dept.name}`}
                      className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onEdit(dept)}
                      aria-label={`Edit ${dept.name}`}
                      className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-indigo-600 transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(dept.id)}
                      aria-label={`Delete ${dept.name}`}
                      className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}