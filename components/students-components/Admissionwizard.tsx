"use client";

import { useState } from "react";
import { User, Users, Wallet, ChevronRight } from "lucide-react";
import { FACULTY_OPTIONS, CLASS_OPTIONS, Student } from "./Studentdata";

interface AdmissionWizardProps {
  onComplete: (data: Omit<Student, "id">) => void;
  onCancel: () => void;
}

const fieldClass = "px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent";
const labelClass = "text-xs font-medium text-slate-500";

function formatCurrency(value: number) {
  return `TZS ${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

export default function AdmissionWizard({ onComplete, onCancel }: AdmissionWizardProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Step 1 — student
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [faculty, setFaculty] = useState(FACULTY_OPTIONS[0]);
  const [className, setClassName] = useState(CLASS_OPTIONS[0]);
  const [address, setAddress] = useState("");

  // Step 2 — parent
  const [parentFirstName, setParentFirstName] = useState("");
  const [parentLastName, setParentLastName] = useState("");
  const [parentPhone, setParentPhone] = useState("");
  const [parentEmail, setParentEmail] = useState("");

  // Step 3 — fee balance
  const [openingBalance, setOpeningBalance] = useState("0");
  const [advance, setAdvance] = useState("0");

  const steps = [
    { key: 1, label: "Student Details", icon: User },
    { key: 2, label: "Parent Details", icon: Users },
    { key: 3, label: "Fee Balance", icon: Wallet },
  ] as const;

  const handleStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim() || !studentId.trim()) return;
    setStep(2);
  };

  const handleStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    if (!parentFirstName.trim() || !parentLastName.trim() || !parentPhone.trim()) return;
    setStep(3);
  };

  const handleStep3 = (e: React.FormEvent) => {
    e.preventDefault();
    onComplete({
      firstName: firstName.trim(),
      middleName: middleName.trim(),
      lastName: lastName.trim(),
      studentId: studentId.trim(),
      faculty,
      className,
      address: address.trim(),
      parentFirstName: parentFirstName.trim(),
      parentLastName: parentLastName.trim(),
      parentPhone: parentPhone.trim(),
      parentEmail: parentEmail.trim(),
      openingBalance: Number(openingBalance) || 0,
      advance: Number(advance) || 0,
    });
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Step indicator */}
      <div className="flex items-center gap-1">
        {steps.map((s, idx) => (
          <div key={s.key} className="flex items-center gap-1 flex-1">
            <div className={`flex items-center gap-2 ${step === s.key ? "text-indigo-600" : step > s.key ? "text-emerald-600" : "text-slate-400"}`}>
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${
                  step === s.key ? "bg-indigo-600 text-white" : step > s.key ? "bg-emerald-100 text-emerald-700" : "bg-slate-100"
                }`}
              >
                {s.key}
              </span>
              <span className="text-xs font-medium whitespace-nowrap hidden sm:inline">{s.label}</span>
            </div>
            {idx < steps.length - 1 && <div className="flex-1 h-px bg-slate-200 mx-1" />}
          </div>
        ))}
      </div>

      {step === 1 && (
        <form onSubmit={handleStep1} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1">
              <label className={labelClass}>First Name *</label>
              <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} required autoFocus className={fieldClass} />
            </div>
            <div className="flex flex-col gap-1">
              <label className={labelClass}>Middle Name</label>
              <input type="text" value={middleName} onChange={(e) => setMiddleName(e.target.value)} className={fieldClass} />
            </div>
            <div className="flex flex-col gap-1">
              <label className={labelClass}>Last Name *</label>
              <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} required className={fieldClass} />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className={labelClass}>Student ID *</label>
            <input type="text" value={studentId} onChange={(e) => setStudentId(e.target.value)} placeholder="e.g. STU-2026-004" required className={fieldClass} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className={labelClass}>Faculty</label>
              <select value={faculty} onChange={(e) => setFaculty(e.target.value)} className={`${fieldClass} bg-white`}>
                {FACULTY_OPTIONS.map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className={labelClass}>Class</label>
              <select value={className} onChange={(e) => setClassName(e.target.value)} className={`${fieldClass} bg-white`}>
                {CLASS_OPTIONS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className={labelClass}>Address</label>
            <textarea value={address} onChange={(e) => setAddress(e.target.value)} rows={2} className={`${fieldClass} resize-none`} />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onCancel} className="px-4 py-2 rounded-lg border border-slate-300 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
              Cancel
            </button>
            <button type="submit" className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors">
              Next: Parent Details
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleStep2} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className={labelClass}>Parent First Name *</label>
              <input type="text" value={parentFirstName} onChange={(e) => setParentFirstName(e.target.value)} required autoFocus className={fieldClass} />
            </div>
            <div className="flex flex-col gap-1">
              <label className={labelClass}>Parent Last Name *</label>
              <input type="text" value={parentLastName} onChange={(e) => setParentLastName(e.target.value)} required className={fieldClass} />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className={labelClass}>Phone *</label>
              <input type="tel" value={parentPhone} onChange={(e) => setParentPhone(e.target.value)} required className={fieldClass} />
            </div>
            <div className="flex flex-col gap-1">
              <label className={labelClass}>Email</label>
              <input type="email" value={parentEmail} onChange={(e) => setParentEmail(e.target.value)} className={fieldClass} />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setStep(1)} className="px-4 py-2 rounded-lg border border-slate-300 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
              Back
            </button>
            <button type="submit" className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors">
              Next: Fee Balance
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      )}

      {step === 3 && (
        <form onSubmit={handleStep3} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className={labelClass}>Opening Balance (TZS)</label>
              <input type="number" min="0" value={openingBalance} onChange={(e) => setOpeningBalance(e.target.value)} autoFocus className={fieldClass} />
            </div>
            <div className="flex flex-col gap-1">
              <label className={labelClass}>Advance Paid (TZS)</label>
              <input type="number" min="0" value={advance} onChange={(e) => setAdvance(e.target.value)} className={fieldClass} />
            </div>
          </div>

          <div className="rounded-lg border border-dashed border-slate-300 px-4 py-3 flex items-center justify-between text-sm">
            <span className="text-slate-500">Net Balance</span>
            <span className="font-semibold text-slate-800">
              {formatCurrency((Number(openingBalance) || 0) - (Number(advance) || 0))}
            </span>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setStep(2)} className="px-4 py-2 rounded-lg border border-slate-300 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
              Back
            </button>
            <button type="submit" className="px-5 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors">
              Complete Admission
            </button>
          </div>
        </form>
      )}
    </div>
  );
}