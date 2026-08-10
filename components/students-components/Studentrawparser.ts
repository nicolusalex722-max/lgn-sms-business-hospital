import * as XLSX from "xlsx";

export interface RawParseResult {
  headers: string[];
  rows: Record<string, string>[];
}

export async function parseRawFile(file: File): Promise<RawParseResult> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];

  const rows = XLSX.utils.sheet_to_json<Record<string, string>>(sheet, { defval: "" });
  const headers = rows.length > 0 ? Object.keys(rows[0]) : [];

  return { headers, rows };
}