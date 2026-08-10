"use client";

import Link from "next/link";
import { Eye, Pencil, Trash2, GraduationCap } from "lucide-react";
import type { Student } from "./Studentdata";

interface StudentTableProps {
  students: Student[];
  onEdit: (student: Student) => void;
  onDelete: (id: string) => void;
}

export default function StudentTable({ students, onEdit, onDelete }: StudentTableProps) {
  if (students.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-10 text-center">
        <p className="text-sm text-slate-500">No students match your search.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="text-left font-medium text-slate-500 px-5 py-4">Student</th>
              <th className="text-left font-medium text-slate-500 px-2 py-4">Student ID</th>
              <th className="text-left font-medium text-slate-500 px-2 py-4">Faculty</th>
              <th className="text-left font-medium text-slate-500 px-2 py-4">Class</th>
              <th className="text-left font-medium text-slate-500 px-2 py-4">Parent</th>
              <th className="text-right font-medium text-slate-500 px-5 py-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s.id} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
                      <GraduationCap className="w-4 h-4 text-indigo-600" />
                    </div>
                    <span className="font-semibold text-slate-800">
                      {s.firstName} {s.middleName ? `${s.middleName} ` : ""}{s.lastName}
                    </span>
                  </div>
                </td>
                <td className="px-2 py-4 text-slate-500 font-mono text-xs">{s.studentId}</td>
                <td className="px-2 py-4">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700">{s.faculty}</span>
                </td>
                <td className="px-2 py-4 text-slate-600">{s.className}</td>
                <td className="px-2 py-4 text-slate-500">{s.parentFirstName} {s.parentLastName}</td>
                <td className="px-5 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/dashboard/students/registrations/${s.id}`}
                      aria-label={`View ${s.firstName} ${s.lastName}`}
                      className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </Link>
                    <button type="button" onClick={() => onEdit(s)} aria-label={`Edit ${s.firstName} ${s.lastName}`} className="w-8 h-8 flex items-center justify-center rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button type="button" onClick={() => onDelete(s.id)} aria-label={`Delete ${s.firstName} ${s.lastName}`} className="w-8 h-8 flex items-center justify-center rounded-lg bg-rose-600 text-white hover:bg-rose-700 transition-colors">
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