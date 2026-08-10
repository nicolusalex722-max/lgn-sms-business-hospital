"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, User, Users, Mail, Phone, MapPin, Hash, GraduationCap,
  Wallet, TrendingUp, Download, FileText,
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { getStudentById } from "@/components/students-components/Studentdata";
import { InfoRow, InfoCard } from "@/components/dashboard/Inforow";

type ViewTab = "details" | "balance" | "reports" | "analytics";

const TABS: { key: ViewTab; label: string }[] = [
  { key: "details", label: "Student Detail" },
  { key: "balance", label: "Opening Balance" },
  { key: "reports", label: "Reports Result" },
  { key: "analytics", label: "Performance Analytics" },
];

const TERM_OPTIONS = ["All Terms", "Term 1", "Term 2", "Term 3", "Annual"];

const SAMPLE_REPORTS = [
  { id: "rep-1", term: "Term 1", title: "Term 1 Result Report", date: "2026-04-10" },
  { id: "rep-2", term: "Term 2", title: "Term 2 Result Report", date: "2026-07-12" },
  { id: "rep-3", term: "Annual", title: "Annual Progress Report", date: "2026-07-20" },
];

const PERFORMANCE_DATA = [
  { term: "Term 1", average: 65 },
  { term: "Term 2", average: 72 },
  { term: "Term 3", average: 80 },
];

function formatCurrency(value: number) {
  return `TZS ${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

function downloadReport(title: string) {
  const content = `${title}\nGenerated: ${new Date().toLocaleDateString()}\n\nThis is a placeholder report file.`;
  const blob = new Blob([content], { type: "text/plain;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${title.replace(/\s+/g, "_")}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export default function StudentViewPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const student = getStudentById(params.id);

  const [tab, setTab] = useState<ViewTab>("details");
  const [termFilter, setTermFilter] = useState("All Terms");

  if (!student) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-10 text-center">
        <p className="text-sm text-slate-500">Student not found.</p>
        <button type="button" onClick={() => router.push("/dashboard/company-profile/academics/students")} className="mt-3 text-sm font-medium text-indigo-600 hover:text-indigo-700">
          Back to Student Admission
        </button>
      </div>
    );
  }

  const fullName = `${student.firstName} ${student.middleName ? student.middleName + " " : ""}${student.lastName}`;
  const netBalance = student.openingBalance - student.advance;
  const filteredReports = termFilter === "All Terms" ? SAMPLE_REPORTS : SAMPLE_REPORTS.filter((r) => r.term === termFilter);

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <button type="button" onClick={() => router.push("/dashboard/company-profile/academics/students")} aria-label="Back to Student Admission" className="mt-2 text-slate-400 hover:text-slate-600 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center text-white text-lg font-bold shrink-0">
          {student.firstName[0]}{student.lastName[0]}
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-800">{fullName}</h1>
          <p className="text-sm text-slate-500">{student.studentId}</p>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700">{student.faculty}</span>
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">{student.className}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border border-slate-200 rounded-t-xl">
        <div className="flex items-center gap-1 px-4 overflow-x-auto">
          {TABS.map((t) => {
            const isActive = t.key === tab;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => setTab(t.key)}
                className={`relative px-4 py-3.5 text-sm font-medium whitespace-nowrap transition-colors ${isActive ? "text-indigo-600" : "text-slate-500 hover:text-slate-700"}`}
              >
                {t.label}
                {isActive && <span className="absolute left-0 right-0 -bottom-px h-0.5 bg-indigo-600 rounded-full" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab content */}
      <div className="bg-white rounded-b-xl border border-slate-200 border-t-0 p-6 -mt-6">
        {tab === "details" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <InfoCard title="Personal Information">
              <InfoRow icon={User} iconBg="bg-indigo-50" iconColor="text-indigo-600" label="Full Name" value={fullName} />
              <InfoRow icon={Hash} iconBg="bg-slate-100" iconColor="text-slate-500" label="Student ID" value={student.studentId} />
              <InfoRow icon={GraduationCap} iconBg="bg-amber-50" iconColor="text-amber-600" label="Faculty" value={student.faculty} />
              <InfoRow icon={GraduationCap} iconBg="bg-teal-50" iconColor="text-teal-600" label="Class" value={student.className} />
              <InfoRow icon={MapPin} iconBg="bg-rose-50" iconColor="text-rose-600" label="Address" value={student.address} />
            </InfoCard>

            <InfoCard title="Parent / Guardian">
              <InfoRow icon={Users} iconBg="bg-purple-50" iconColor="text-purple-600" label="Full Name" value={`${student.parentFirstName} ${student.parentLastName}`} />
              <InfoRow icon={Phone} iconBg="bg-sky-50" iconColor="text-sky-600" label="Phone" value={student.parentPhone} />
              <InfoRow icon={Mail} iconBg="bg-blue-50" iconColor="text-blue-600" label="Email" value={student.parentEmail} />
            </InfoCard>
          </div>
        )}

        {tab === "balance" && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
              <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center mb-3">
                <Wallet className="w-5 h-5 text-indigo-600" />
              </div>
              <p className="text-xs text-slate-400">Opening Balance</p>
              <p className="text-lg font-bold text-slate-800">{formatCurrency(student.openingBalance)}</p>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center mb-3">
                <Wallet className="w-5 h-5 text-emerald-600" />
              </div>
              <p className="text-xs text-slate-400">Advance Paid</p>
              <p className="text-lg font-bold text-slate-800">{formatCurrency(student.advance)}</p>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
              <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center mb-3">
                <Wallet className="w-5 h-5 text-amber-600" />
              </div>
              <p className="text-xs text-slate-400">Net Balance</p>
              <p className="text-lg font-bold text-slate-800">{formatCurrency(netBalance)}</p>
            </div>
          </div>
        )}

        {tab === "reports" && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <h3 className="text-sm font-semibold text-slate-800">Result Reports</h3>
              <select
                value={termFilter}
                onChange={(e) => setTermFilter(e.target.value)}
                className="px-3 py-2 rounded-lg border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                {TERM_OPTIONS.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            {filteredReports.length === 0 ? (
              <p className="text-sm text-slate-500 py-6 text-center">No reports found for this term.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {filteredReports.map((r) => (
                  <div key={r.id} className="flex items-center justify-between border border-slate-200 rounded-lg px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4 text-indigo-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-800">{r.title}</p>
                        <p className="text-xs text-slate-400">{r.term} &middot; {new Date(r.date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => downloadReport(r.title)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-medium hover:bg-indigo-700 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === "analytics" && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-semibold text-slate-800">Performance Trend</h3>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={PERFORMANCE_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eef1f5" />
                <XAxis dataKey="term" tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
                <Tooltip formatter={(value) => `${value}%`} contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }} />
                <Line type="monotone" dataKey="average" name="Average Score" stroke="#4f46e5" strokeWidth={2.5} dot={{ r: 4, fill: "#4f46e5" }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}