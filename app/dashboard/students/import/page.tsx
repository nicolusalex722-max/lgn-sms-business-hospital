"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FileSpreadsheet, Download, Upload as UploadIcon, ArrowRight, ArrowLeft,
  CheckCircle2, AlertTriangle, ArrowLeftCircle,
} from "lucide-react";
import {
  REQUIRED_FIELDS, downloadStudentTemplate, guessColumnMatch, PENDING_STUDENT_IMPORT_KEY,
} from "@/components/students-components/Studentimporttemplate";
import { parseRawFile, RawParseResult } from "@/components/students-components/Studentrawparser";
import type { Student } from "@/components/students-components/Studentdata";

type ImportTab = "upload" | "review" | "results";

interface ImportResult {
  successCount: number;
  errorRows: { row: number; reason: string }[];
}

export default function ImportStudentsPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [tab, setTab] = useState<ImportTab>("upload");
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState("");
  const [parsed, setParsed] = useState<RawParseResult | null>(null);
  const [uploadError, setUploadError] = useState("");

  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [result, setResult] = useState<ImportResult | null>(null);

  const canGoToReview = parsed !== null && parsed.rows.length > 0;

  // --- Step 1: Upload ---
  const processFile = async (file: File) => {
    setUploadError("");
    setFileName(file.name);

    const validExtensions = [".csv", ".xlsx", ".xls"];
    if (!validExtensions.some((ext) => file.name.toLowerCase().endsWith(ext))) {
      setUploadError("Please upload a .csv, .xlsx, or .xls file.");
      setParsed(null);
      return;
    }

    try {
      const result = await parseRawFile(file);
      if (result.rows.length === 0) {
        setUploadError("That file has no data rows.");
        setParsed(null);
        return;
      }
      setParsed(result);

      // Auto-guess column mapping
      const guessed: Record<string, string> = {};
      REQUIRED_FIELDS.forEach((f) => {
        guessed[f.key] = guessColumnMatch(f.key, f.label, result.headers);
      });
      setMapping(guessed);
    } catch {
      setUploadError("Couldn't read that file. Please make sure it's a valid CSV or Excel file.");
      setParsed(null);
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

  // --- Step 2: Review / mapping ---
  const previewRows = useMemo(() => parsed?.rows.slice(0, 5) ?? [], [parsed]);

  const missingRequired = REQUIRED_FIELDS.filter((f) => f.required && !mapping[f.key]);

  const handleConfirmImport = () => {
    if (!parsed) return;

    const students: Omit<Student, "id">[] = [];
    const errorRows: { row: number; reason: string }[] = [];

    parsed.rows.forEach((row, idx) => {
      const get = (key: string) => (mapping[key] ? String(row[mapping[key]] ?? "").trim() : "");
      const firstName = get("firstName");
      const lastName = get("lastName");
      const studentId = get("studentId");

      if (!firstName || !lastName || !studentId) {
        errorRows.push({ row: idx + 2, reason: "Missing First Name, Last Name, or Student ID" });
        return;
      }

      students.push({
        firstName,
        middleName: get("middleName"),
        lastName,
        studentId,
        faculty: get("faculty"),
        className: get("className"),
        address: get("address"),
        parentFirstName: get("parentFirstName"),
        parentLastName: get("parentLastName"),
        parentPhone: get("parentPhone"),
        parentEmail: get("parentEmail"),
        openingBalance: Number(get("openingBalance")) || 0,
        advance: Number(get("advance")) || 0,
      });
    });

    if (students.length > 0) {
      sessionStorage.setItem(PENDING_STUDENT_IMPORT_KEY, JSON.stringify(students));
    }

    setResult({ successCount: students.length, errorRows });
    setTab("results");
  };

  return (
    <div className="flex flex-col gap-5 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Import Students</h1>
        <p className="text-sm text-slate-500 mt-1">Import student admissions from a CSV file or enter them manually.</p>
      </div>

      {/* Tab strip */}
      <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1 w-fit">
        {[
          { key: "upload", label: "Upload CSV" },
          { key: "review", label: "Review Data" },
          { key: "results", label: "Results" },
        ].map((t) => (
          <button
            key={t.key}
            type="button"
            disabled={t.key === "review" && !canGoToReview}
            onClick={() => (t.key !== "review" || canGoToReview) && setTab(t.key as ImportTab)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
              tab === t.key ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Upload tab */}
      {tab === "upload" && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-base font-bold text-slate-800">Upload CSV File</h2>
          <p className="text-sm text-slate-500 mt-1 mb-5">
            Upload a CSV or Excel file containing student data. The file should have headers matching the required fields.
          </p>

          <div
            onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`flex flex-col items-center justify-center gap-3 border-2 border-dashed rounded-xl py-14 px-4 cursor-pointer transition-colors ${
              dragActive ? "border-indigo-400 bg-indigo-50" : "border-slate-300 hover:border-indigo-300"
            }`}
          >
            <FileSpreadsheet className="w-10 h-10 text-slate-400" />
            <p className="text-base font-semibold text-slate-800">Drag and drop your CSV file here</p>
            <p className="text-sm text-slate-500">or click the button below to browse your files</p>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-300 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors mt-1"
            >
              <UploadIcon className="w-4 h-4" />
              Select CSV File
            </button>
            <input ref={fileInputRef} type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={handleFileInput} />
          </div>

          {fileName && !uploadError && parsed && (
            <div className="flex items-center gap-2 mt-4 text-sm text-emerald-700 bg-emerald-50 rounded-lg px-4 py-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span><span className="font-medium">{fileName}</span> &mdash; {parsed.rows.length} row{parsed.rows.length !== 1 ? "s" : ""} detected.</span>
            </div>
          )}
          {uploadError && (
            <div className="flex items-center gap-2 mt-4 text-sm text-rose-700 bg-rose-50 rounded-lg px-4 py-2.5">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{uploadError}</span>
            </div>
          )}

          <div className="flex items-center gap-3 mt-6">
            <button
              type="button"
              onClick={downloadStudentTemplate}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-300 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <Download className="w-4 h-4" />
              Download Template
            </button>
            <span className="text-sm text-slate-400">Download a template CSV file to see the required format</span>
          </div>

          <div className="flex items-center justify-between mt-8 pt-5 border-t border-slate-100">
            <button
              type="button"
              onClick={() => router.push("/dashboard/company-profile/academics/students")}
              className="px-4 py-2 rounded-lg border border-slate-300 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!canGoToReview}
              onClick={() => setTab("review")}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Review Data
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Review tab */}
      {tab === "review" && parsed && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-base font-bold text-slate-800">Match Your Columns</h2>
          <p className="text-sm text-slate-500 mt-1 mb-5">
            Match each column from your file to the correct field. We&apos;ve auto-matched what we could &mdash; double-check before importing.
          </p>

          <div className="border border-slate-200 rounded-lg overflow-hidden mb-6">
            <div className="grid grid-cols-2 bg-slate-50 px-4 py-2.5 text-xs font-medium text-slate-500">
              <span>Required Field</span>
              <span>Your Column</span>
            </div>
            <div className="divide-y divide-slate-100">
              {REQUIRED_FIELDS.map((f) => (
                <div key={f.key} className="grid grid-cols-2 items-center px-4 py-2.5 gap-3">
                  <span className="text-sm text-slate-700">
                    {f.label} {f.required && <span className="text-rose-500">*</span>}
                  </span>
                  <select
                    value={mapping[f.key] ?? ""}
                    onChange={(e) => setMapping((prev) => ({ ...prev, [f.key]: e.target.value }))}
                    className="px-3 py-1.5 rounded-lg border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="">&mdash; Not mapped &mdash;</option>
                    {parsed.headers.map((h) => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>

          {missingRequired.length > 0 && (
            <div className="flex items-center gap-2 mb-5 text-sm text-amber-700 bg-amber-50 rounded-lg px-4 py-2.5">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>Map {missingRequired.map((f) => f.label).join(", ")} before importing &mdash; these are required.</span>
            </div>
          )}

          <h3 className="text-sm font-semibold text-slate-800 mb-3">Preview (first {previewRows.length} rows)</h3>
          <div className="overflow-x-auto border border-slate-200 rounded-lg mb-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  {REQUIRED_FIELDS.map((f) => (
                    <th key={f.key} className="text-left font-medium text-slate-500 px-3 py-2 whitespace-nowrap">{f.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {previewRows.map((row, idx) => (
                  <tr key={idx} className="border-b border-slate-100 last:border-b-0">
                    {REQUIRED_FIELDS.map((f) => (
                      <td key={f.key} className="px-3 py-2 text-slate-600 whitespace-nowrap">
                        {mapping[f.key] ? String(row[mapping[f.key]] ?? "\u2014") : "\u2014"}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between pt-5 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setTab("upload")}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-300 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <button
              type="button"
              disabled={missingRequired.length > 0}
              onClick={handleConfirmImport}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Import {parsed.rows.length} Student{parsed.rows.length !== 1 ? "s" : ""}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Results tab */}
      {tab === "results" && result && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-base font-bold text-slate-800 mb-5">Import Results</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span className="text-sm font-medium text-emerald-800">Successfully Imported</span>
              </div>
              <p className="text-2xl font-bold text-emerald-800">{result.successCount}</p>
            </div>
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-5">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
                <span className="text-sm font-medium text-rose-800">Rows With Errors</span>
              </div>
              <p className="text-2xl font-bold text-rose-800">{result.errorRows.length}</p>
            </div>
          </div>

          {result.errorRows.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-slate-800 mb-2">Error Details</h3>
              <div className="border border-slate-200 rounded-lg divide-y divide-slate-100">
                {result.errorRows.map((err) => (
                  <div key={err.row} className="px-4 py-2.5 text-sm flex items-center justify-between">
                    <span className="text-slate-600">Row {err.row}</span>
                    <span className="text-rose-600">{err.reason}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={() => router.push("/dashboard/company-profile/academics/students")}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            <ArrowLeftCircle className="w-4 h-4" />
            Go to Student Admission
          </button>
        </div>
      )}
    </div>
  );
}