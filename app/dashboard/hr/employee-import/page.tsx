"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, FileSpreadsheet, Download, UploadCloud, CheckCircle2, AlertCircle } from "lucide-react";
import { downloadEmployeeTemplate, PENDING_IMPORT_KEY, TEMPLATE_HEADERS } from "@/components/hr-components/Employeeimporttemplate";
import { parseEmployeeFile } from "@/components/hr-components/Employeefileparser";
import type { Employee } from "@/components/hr-components/Employeetable";

function formatCurrency(value: number) {
  return `TZS ${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

export default function ImportEmployeesPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [fileName, setFileName] = useState("");
  const [rows, setRows] = useState<Omit<Employee, "id">[]>([]);
  const [error, setError] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [importing, setImporting] = useState(false);

  const processFile = async (file: File) => {
    setError("");
    setFileName(file.name);

    const validExtensions = [".csv", ".xlsx", ".xls"];
    const isValid = validExtensions.some((ext) => file.name.toLowerCase().endsWith(ext));
    if (!isValid) {
      setError("Please upload a .csv, .xlsx, or .xls file.");
      setRows([]);
      return;
    }

    try {
      const parsed = await parseEmployeeFile(file);
      if (parsed.length === 0) {
        setError("No employee rows found in that file. Make sure it matches the template columns.");
        setRows([]);
        return;
      }
      setRows(parsed);
    } catch {
      setError("Couldn't read that file. Please make sure it's a valid CSV or Excel file.");
      setRows([]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleConfirmImport = () => {
    if (rows.length === 0) return;
    setImporting(true);
    // TODO: replace with a real bulk-create API call, e.g. POST /api/employees/bulk
    sessionStorage.setItem(PENDING_IMPORT_KEY, JSON.stringify(rows));
    router.push("/dashboard/company-profile/employees");
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => router.push("/dashboard/company-profile/employees")}
          aria-label="Back to Employee Management"
          className="text-slate-400 hover:text-slate-600 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Import Employees</h1>
          <p className="text-sm text-slate-500">Add a batch of employees from a CSV or Excel file</p>
        </div>
      </div>

      {/* Step 1: template */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
              <FileSpreadsheet className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-800">1. Download the template</h2>
              <p className="text-xs text-slate-500 mt-0.5 max-w-md">
                Fill in your employees using this exact column order, then upload it below.
                Department and Branch can be left blank.
              </p>
              <p className="text-xs text-slate-400 mt-2 font-mono break-all">{TEMPLATE_HEADERS.join(", ")}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={downloadEmployeeTemplate}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors shrink-0"
          >
            <Download className="w-4 h-4" />
            Download Template
          </button>
        </div>
      </div>

      {/* Step 2: upload */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-sm font-semibold text-slate-800 mb-1">2. Upload your file</h2>
        <p className="text-xs text-slate-500 mb-4">Accepts .csv, .xlsx, or .xls</p>

        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl py-10 px-4 cursor-pointer transition-colors ${
            dragActive ? "border-indigo-400 bg-indigo-50" : "border-slate-300 hover:border-indigo-300"
          }`}
        >
          <UploadCloud className="w-8 h-8 text-slate-400" />
          <p className="text-sm text-slate-600">
            <span className="font-medium text-indigo-600">Click to upload</span> or drag and drop
          </p>
          <p className="text-xs text-slate-400">CSV, XLSX, or XLS</p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.xlsx,.xls"
            className="hidden"
            onChange={handleFileInput}
          />
        </div>

        {fileName && !error && rows.length > 0 && (
          <div className="flex items-center gap-2 mt-4 text-sm text-emerald-700 bg-emerald-50 rounded-lg px-4 py-2.5">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>
              <span className="font-medium">{fileName}</span> &mdash; {rows.length} employee{rows.length !== 1 ? "s" : ""} ready to import.
            </span>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 mt-4 text-sm text-rose-700 bg-rose-50 rounded-lg px-4 py-2.5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Step 3: preview + confirm */}
      {rows.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-sm font-semibold text-slate-800 mb-4">3. Preview &amp; confirm</h2>

          <div className="overflow-x-auto border border-slate-200 rounded-lg mb-5">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left font-medium text-slate-500 px-4 py-2.5">Name</th>
                  <th className="text-left font-medium text-slate-500 px-4 py-2.5">Email</th>
                  <th className="text-left font-medium text-slate-500 px-4 py-2.5">Department</th>
                  <th className="text-left font-medium text-slate-500 px-4 py-2.5">Position</th>
                  <th className="text-right font-medium text-slate-500 px-4 py-2.5">Salary</th>
                </tr>
              </thead>
              <tbody>
                {rows.slice(0, 8).map((row, idx) => (
                  <tr key={idx} className="border-b border-slate-100 last:border-b-0">
                    <td className="px-4 py-2.5 font-medium text-slate-800">
                      {row.firstName} {row.lastName}
                    </td>
                    <td className="px-4 py-2.5 text-slate-600">{row.email}</td>
                    <td className="px-4 py-2.5 text-slate-600">{row.department || "\u2014"}</td>
                    <td className="px-4 py-2.5 text-slate-600">{row.position}</td>
                    <td className="px-4 py-2.5 text-right text-slate-700">{formatCurrency(row.salary)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {rows.length > 8 && (
            <p className="text-xs text-slate-400 mb-5">
              Showing 8 of {rows.length} rows &mdash; all {rows.length} will be imported.
            </p>
          )}

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => router.push("/dashboard/company-profile/employees")}
              className="px-4 py-2 rounded-lg border border-slate-300 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmImport}
              disabled={importing}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-60 transition-colors"
            >
              <UploadCloud className="w-4 h-4" />
              Import {rows.length} Employee{rows.length !== 1 ? "s" : ""}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}