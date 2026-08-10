"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ChevronRight, Save, Building2, Phone, ShieldCheck, KeyRound } from "lucide-react";
import CompanyStepBasics from "./Companystepbasics";
import CompanyStepContacts from "./Companystepcontacts";
import CompanyStepCompliance from "./Companystepcompliance";
import CompanyStepAccess from "./Companystepaccess";

export interface CompanyFormData {
  name: string;
  displayName: string;
  businessType: string;
  email: string;
  phone: string;
  address: string;
  tin: string;
  registrationNumber: string;
  loginEmail: string;
  password: string;
}

const EMPTY_FORM: CompanyFormData = {
  name: "",
  displayName: "",
  businessType: "Business",
  email: "",
  phone: "",
  address: "",
  tin: "",
  registrationNumber: "",
  loginEmail: "",
  password: "",
};

const STEPS = [
  {
    key: "basics",
    label: "Company Basics",
    subtitle: "Name, display name & type",
    icon: Building2,
    Component: CompanyStepBasics,
  },
  {
    key: "contacts",
    label: "Contacts",
    subtitle: "Email, phone & address",
    icon: Phone,
    Component: CompanyStepContacts,
  },
  {
    key: "compliance",
    label: "Compliance",
    subtitle: "TIN & registration",
    icon: ShieldCheck,
    Component: CompanyStepCompliance,
  },
  {
    key: "access",
    label: "Accessibility",
    subtitle: "Login email & password",
    icon: KeyRound,
    Component: CompanyStepAccess,
  },
] as const;

interface CompanyWizardShellProps {
  onSave: (data: CompanyFormData) => void;
}

export default function CompanyWizardShell({ onSave }: CompanyWizardShellProps) {
  const router = useRouter();
  const [stepIndex, setStepIndex] = useState(0);
  const [form, setForm] = useState<CompanyFormData>(EMPTY_FORM);

  const step = STEPS[stepIndex];
  const StepComponent = step.Component;
  const isLastStep = stepIndex === STEPS.length - 1;

  const patchForm = (patch: Partial<CompanyFormData>) => {
    setForm((prev) => ({ ...prev, ...patch }));
  };

  const goToStep = (index: number) => setStepIndex(index);
  const goNext = () => {
    if (isLastStep) {
      onSave(form);
    } else {
      setStepIndex((i) => i + 1);
    }
  };
  const goBack = () => setStepIndex((i) => Math.max(0, i - 1));

  return (
    <div className="flex flex-col gap-0">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            aria-label="Go back"
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-0.5">
              <span>Companies</span>
              <ChevronRight className="w-3 h-3" />
              <span>New Company</span>
            </div>
            <h1 className="text-xl font-bold text-slate-800">Add New Company</h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 rounded-lg border border-slate-300 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onSave(form)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            <Save className="w-4 h-4" />
            Save Company
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Step navigator */}
        <div className="lg:col-span-1 flex flex-col gap-1">
          {STEPS.map((s, idx) => {
            const isActive = idx === stepIndex;
            const isDone = idx < stepIndex;
            return (
              <button
                key={s.key}
                type="button"
                onClick={() => goToStep(idx)}
                className={`flex items-start gap-3 px-4 py-3 rounded-xl text-left transition-colors ${
                  isActive ? "bg-indigo-50" : "hover:bg-slate-50"
                }`}
              >
                <span
                  className={`w-7 h-7 shrink-0 rounded-full flex items-center justify-center text-xs font-semibold ${
                    isActive
                      ? "bg-indigo-600 text-white"
                      : isDone
                      ? "bg-indigo-100 text-indigo-600"
                      : "bg-slate-200 text-slate-500"
                  }`}
                >
                  {idx + 1}
                </span>
                <span>
                  <span className={`block text-sm font-semibold ${isActive ? "text-indigo-700" : "text-slate-700"}`}>
                    {s.label}
                  </span>
                  <span className="block text-xs text-slate-400">{s.subtitle}</span>
                </span>
              </button>
            );
          })}

          {/* progress dots */}
          <div className="flex items-center gap-1.5 px-4 pt-3">
            {STEPS.map((s, idx) => (
              <span
                key={s.key}
                className={`h-1.5 rounded-full transition-all ${
                  idx === stepIndex ? "w-6 bg-indigo-600" : "w-1.5 bg-slate-200"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Step content card */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-11 h-11 rounded-xl bg-indigo-600 flex items-center justify-center shrink-0">
              <step.icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-800">{step.label}</h2>
              <p className="text-xs text-slate-400">{step.subtitle}</p>
            </div>
          </div>

          <div className="pb-6 mb-6 border-b border-slate-100">
            <StepComponent data={form} onChange={patchForm} />
          </div>

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={goBack}
              disabled={stepIndex === 0}
              className="px-4 py-2 rounded-lg border border-slate-300 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-0 disabled:pointer-events-none transition-colors"
            >
              Back
            </button>
            <button
              type="button"
              onClick={goNext}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors"
            >
              {isLastStep ? "Save Company" : `Next: ${STEPS[stepIndex + 1].label}`}
              {!isLastStep && <ChevronRight className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}