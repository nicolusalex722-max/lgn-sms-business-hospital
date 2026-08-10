"use client";

// Requires the SheetJS package: npm install xlsx
import * as XLSX from "xlsx";
import type { Student } from "./types";

/**
 * Generates a fill-in-the-blank template: one row per student × subject,
 * with the Marks column left empty for the teacher to complete offline.
 */
export function downloadResultTemplate(className: string, students: Student[], subjects: string[]) {
  const rows = students.flatMap((s) =>
    subjects.map((subject) => ({
      StudentID: s.id,
      StudentName: s.name,
      Subject: subject,
      Marks: "",
    }))
  );
  const ws = XLSX.utils.json_to_sheet(rows);
  ws["!cols"] = [{ wch: 12 }, { wch: 22 }, { wch: 16 }, { wch: 10 }];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Results Template");
  XLSX.writeFile(wb, `${className.replace(/\s+/g, "_")}_results_template.xlsx`);
}

export type ParsedResultRow = {
  studentId: string;
  studentName?: string;
  subject: string;
  marks: number;
};

/**
 * Parses an uploaded .xlsx/.xls/.csv file. Accepts either "StudentID" or
 * "studentId" style headers (case-insensitive) for a little tolerance.
 */
export async function parseResultWorkbook(file: File): Promise<ParsedResultRow[]> {
  const buffer = await file.arrayBuffer();
  const wb = XLSX.read(buffer, { type: "array" });
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });

  function pick(row: Record<string, unknown>, ...keys: string[]) {
    for (const key of keys) {
      const found = Object.keys(row).find((k) => k.toLowerCase() === key.toLowerCase());
      if (found) return row[found];
    }
    return undefined;
  }

  return json
    .map((row) => ({
      studentId: String(pick(row, "StudentID", "studentId", "Student ID") ?? "").trim(),
      studentName: String(pick(row, "StudentName", "studentName", "Student Name") ?? "").trim() || undefined,
      subject: String(pick(row, "Subject", "subject") ?? "").trim(),
      marks: Number(pick(row, "Marks", "marks") ?? 0),
    }))
    .filter((r) => r.studentId && r.subject && !Number.isNaN(r.marks));
}

export function exportRowsToExcel(filename: string, rows: Record<string, string | number>[]) {
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Results");
  XLSX.writeFile(wb, filename);
}