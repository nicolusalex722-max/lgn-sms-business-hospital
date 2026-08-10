"use client";

import Link from "next/link";
import { Pencil } from "lucide-react";

export interface Employee {
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

interface EmployeeTableProps {
  employees: Employee[];
  onEdit: (employee: Employee) => void;
}

function formatCurrency(value: number) {
  return `TZS ${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

export default function EmployeeTable({ employees, onEdit }: EmployeeTableProps) {
  if (employees.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-10 text-center">
        <p className="text-sm text-slate-500">No employees match your search.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="text-left font-medium text-slate-500 px-5 py-4">Name</th>
              <th className="text-left font-medium text-slate-500 px-2 py-4">Position</th>
              <th className="text-left font-medium text-slate-500 px-2 py-4">Department</th>
              <th className="text-left font-medium text-slate-500 px-2 py-4">Phone</th>
              <th className="text-left font-medium text-slate-500 px-2 py-4">Email</th>
              <th className="text-right font-medium text-slate-500 px-2 py-4">Salary</th>
              <th className="text-right font-medium text-slate-500 px-5 py-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((emp) => (
              <tr key={emp.id} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50">
                <td className="px-5 py-4 font-semibold text-slate-800">
                  <Link
                    href={`/dashboard/company-profile/employees/${emp.id}`}
                    className="hover:text-indigo-600 hover:underline transition-colors"
                  >
                    {emp.firstName} {emp.middleName ? `${emp.middleName} ` : ""}
                    {emp.lastName}
                  </Link>
                </td>
                <td className="px-2 py-4 text-slate-600">{emp.position || "\u2014"}</td>
                <td className="px-2 py-4">
                  {emp.department ? (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700">
                      {emp.department}
                    </span>
                  ) : (
                    <span className="text-slate-400">Not assigned</span>
                  )}
                </td>
                <td className="px-2 py-4 text-slate-500">{emp.phone || "\u2014"}</td>
                <td className="px-2 py-4 text-slate-500">{emp.email}</td>
                <td className="px-2 py-4 text-right text-slate-700">{formatCurrency(emp.salary)}</td>
                <td className="px-5 py-4 text-right">
                  <button
                    type="button"
                    onClick={() => onEdit(emp)}
                    aria-label={`Edit ${emp.firstName} ${emp.lastName}`}
                    className="w-8 h-8 inline-flex items-center justify-center rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}