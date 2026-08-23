import type { Employee } from "./Employeetable";

const CSV_HEADERS: (keyof Omit<Employee, "id">)[] = [
  "firstName",
  "middleName",
  "lastName",
  "email",
  "department",
  "branch",
  "phone",
  "salary",
  "birthdate",
  "position",
  "nextOfKin",
  "guarantorPhone",
];

function escapeCsvValue(value: string | number): string {
  const str = String(value ?? "");
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function exportEmployeesToCsv(employees: Employee[]) {
  const rows = [
    CSV_HEADERS.join(","),
    ...employees.map((emp) => CSV_HEADERS.map((key) => escapeCsvValue(emp[key])).join(",")),
  ];
  const csvContent = rows.join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `employees-${new Date().toISOString().split("T")[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Very small CSV line parser — handles quoted fields with commas, not full RFC 4180.
function parseCsvLine(line: string): string[] {
  const values: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      values.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  values.push(current);
  return values;
}

export function parseEmployeesCsv(text: string): Omit<Employee, "id">[] {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  if (lines.length < 2) return [];

  const header = parseCsvLine(lines[0]);
  const rows = lines.slice(1);

  return rows.map((line) => {
    const values = parseCsvLine(line);
    const record: Record<string, string> = {};
    header.forEach((key, idx) => {
      record[key] = values[idx] ?? "";
    });

    return {
      firstName: record.firstName ?? "",
      middleName: record.middleName ?? "",
      lastName: record.lastName ?? "",
      email: record.email ?? "",
      department: record.department ?? "",
      branch: record.branch ?? "",
      phone: record.phone ?? "",
      salary: Number(record.salary) || 0,
      birthdate: record.birthdate ?? "",
      position: record.position ?? "",
      nextOfKin: record.nextOfKin ?? "",
      guarantorPhone: record.guarantorPhone ?? "",
    };
  });
}