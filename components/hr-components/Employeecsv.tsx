import type { Employee } from "@/lib/types";

const HEADERS = ["employeeNumber", "firstName", "middleName", "lastName", "email", "phone", "departmentId", "branchId", "position", "salary", "birthdate", "nextOfKinName", "nextOfKinPhone", "guarantorName", "guarantorPhone", "status"] as const;
const escape = (value: string | number | null) => { const text = String(value ?? ""); return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text; };

export function exportEmployeesToCsv(employees: Employee[]) {
  const rows = employees.map((employee) => HEADERS.map((header) => escape(employee[header])).join(","));
  const blob = new Blob([[HEADERS.join(","), ...rows].join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob); const link = document.createElement("a"); link.href = url; link.download = `employees-${new Date().toISOString().slice(0, 10)}.csv`; document.body.appendChild(link); link.click(); link.remove(); URL.revokeObjectURL(url);
}
