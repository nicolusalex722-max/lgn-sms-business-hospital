import * as XLSX from "xlsx";
import type { Employee } from "./Employeetable";

// Reads either a .csv or .xlsx/.xls file and maps its rows onto the Employee shape.
// Column headers in the file must match TEMPLATE_HEADERS from employeeImportTemplate.ts.
export async function parseEmployeeFile(file: File): Promise<Omit<Employee, "id">[]> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array" });
  const firstSheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[firstSheetName];
  const rows = XLSX.utils.sheet_to_json<Record<string, string | number>>(sheet, { defval: "" });

  return rows
    .filter((row) => String(row.firstName ?? "").trim() !== "" || String(row.lastName ?? "").trim() !== "")
    .map((row) => ({
      firstName: String(row.firstName ?? "").trim(),
      middleName: String(row.middleName ?? "").trim(),
      lastName: String(row.lastName ?? "").trim(),
      email: String(row.email ?? "").trim(),
      department: String(row.department ?? "").trim(),
      branch: String(row.branch ?? "").trim(),
      phone: String(row.phone ?? "").trim(),
      salary: Number(row.salary) || 0,
      birthdate: String(row.birthdate ?? "").trim(),
      position: String(row.position ?? "").trim(),
      nextOfKin: String(row.nextOfKin ?? "").trim(),
      guarantorPhone: String(row.guarantorPhone ?? "").trim(),
    }));
}