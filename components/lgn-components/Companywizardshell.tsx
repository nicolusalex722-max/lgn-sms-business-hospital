
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ChevronRight,
  Save,
  Building2,
  Phone,
  ShieldCheck,
} from "lucide-react";

import CompanyStepBasics from "./Companystepbasics";
import CompanyStepContacts from "./Companystepcontacts";
import CompanyStepCompliance from "./Companystepcompliance";

import { useCompanies } from "@/hooks/use-company";
import type { CompanyCreateInput } from "@/lib/validations/company-schema";

export type CompanyFormData = CompanyCreateInput;

const INITIAL_FORM: CompanyFormData = {
  companyName: "",
  displayName: "",
  email: "",
  phone: "",
  address: "",
  tin: "",
  registrationNumber: "",
};

const STEPS = [
  {
    key: "basics",
    label: "Company Basics",
    subtitle: "Company name & display name",
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
] as const;

export default function CompanyWizardShell() {
  const router = useRouter();

  const { createCompany, loading } = useCompanies();

  const [stepIndex, setStepIndex] = useState(0);
  const [form, setForm] = useState<CompanyFormData>(INITIAL_FORM);
  const [validationError, setValidationError] = useState<string | null>(null);

  const currentStep = STEPS[stepIndex];
  const StepComponent = currentStep.Component;

  const isFirstStep = stepIndex === 0;
  const isLastStep = stepIndex === STEPS.length - 1;

  /* -------------------------------------------------------------------------- */
  /* FORM                                                                       */
  /* -------------------------------------------------------------------------- */

  const updateForm = (patch: Partial<CompanyFormData>) => {
    setForm((current) => ({
      ...current,
      ...patch,
    }));

    setValidationError(null);
  };

  /* -------------------------------------------------------------------------- */
  /* VALIDATION                                                                 */
  /* -------------------------------------------------------------------------- */

  const validateCurrentStep = () => {
    setValidationError(null);

    switch (currentStep.key) {
      case "basics": {
        if (!form.companyName.trim()) {
          setValidationError("Company name is required.");
          return false;
        }

        if (form.companyName.trim().length < 2) {
          setValidationError(
            "Company name must contain at least 2 characters.",
          );
          return false;
        }

        if (!form.displayName.trim()) {
          setValidationError("Display name is required.");
          return false;
        }

        if (form.displayName.trim().length < 2) {
          setValidationError(
            "Display name must contain at least 2 characters.",
          );
          return false;
        }

        return true;
      }

      case "contacts": {
        if (!form.email.trim()) {
          setValidationError("Company email is required.");
          return false;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
          setValidationError(
            "Please enter a valid company email address.",
          );
          return false;
        }

        if (form.phone && form.phone.trim().length < 10) {
          setValidationError(
            "Phone number must contain at least 10 characters.",
          );
          return false;
        }

        return true;
      }

      case "compliance":
        return true;

      default:
        return true;
    }
  };

  /* -------------------------------------------------------------------------- */
  /* SAVE                                                                       */
  /* -------------------------------------------------------------------------- */

  const handleSave = async () => {
    setValidationError(null);

    const result = await createCompany({
      companyName: form.companyName.trim(),
      displayName: form.displayName.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      address: form.address?.trim() || null,
      tin: form.tin?.trim() || null,
      registrationNumber:
        form.registrationNumber?.trim() || null,
    });

    if (!result.success) {
      setValidationError(
        result.error ?? "Failed to create company.",
      );
      return;
    }

    router.push("/dashboard/lgn/company-management");
  };

  /* -------------------------------------------------------------------------- */
  /* NAVIGATION                                                                 */
  /* -------------------------------------------------------------------------- */

  const goNext = async () => {
    if (!validateCurrentStep()) {
      return;
    }

    if (isLastStep) {
      await handleSave();
      return;
    }

    setStepIndex((current) => current + 1);
  };

  const goBack = () => {
    if (isFirstStep || loading) {
      return;
    }

    setStepIndex((current) => current - 1);
    setValidationError(null);
  };

  const goToStep = (index: number) => {
    if (loading || index === stepIndex) {
      return;
    }

    setStepIndex(index);
    setValidationError(null);
  };

  /* -------------------------------------------------------------------------- */
  /* RENDER                                                                     */
  /* -------------------------------------------------------------------------- */

  return (
    <div className="flex flex-col gap-0">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            aria-label="Go back"
            disabled={loading}
            className="text-slate-400 transition-colors hover:text-slate-600 disabled:opacity-50"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          <div>
            <div className="mb-0.5 flex items-center gap-1.5 text-xs text-slate-400">
              <span>Companies</span>
              <ChevronRight className="h-3 w-3" />
              <span>New Company</span>
            </div>

            <h1 className="text-xl font-bold text-slate-800">
              Add New Company
            </h1>
          </div>
        </div>

        {/* Header Save */}
        <button
          type="button"
          onClick={handleSave}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Save className="h-4 w-4" />

          {loading ? "Saving..." : "Save Company"}
        </button>
      </div>

      {/* Validation / Server Error */}
      {validationError && (
        <div
          role="alert"
          className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
        >
          {validationError}
        </div>
      )}

      {/* Wizard */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        {/* Step Navigator */}
        <div className="flex flex-col gap-1 lg:col-span-1">
          {STEPS.map((stepItem, index) => {
            const isActive = index === stepIndex;
            const isDone = index < stepIndex;

            return (
              <button
                key={stepItem.key}
                type="button"
                onClick={() => goToStep(index)}
                disabled={loading}
                className={`flex items-start gap-3 rounded-xl px-4 py-3 text-left transition-colors disabled:opacity-60 ${
                  isActive
                    ? "bg-indigo-50"
                    : "hover:bg-slate-50"
                }`}
              >
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                    isActive
                      ? "bg-indigo-600 text-white"
                      : isDone
                        ? "bg-indigo-100 text-indigo-600"
                        : "bg-slate-200 text-slate-500"
                  }`}
                >
                  {index + 1}
                </span>

                <span>
                  <span
                    className={`block text-sm font-semibold ${
                      isActive
                        ? "text-indigo-700"
                        : "text-slate-700"
                    }`}
                  >
                    {stepItem.label}
                  </span>

                  <span className="block text-xs text-slate-400">
                    {stepItem.subtitle}
                  </span>
                </span>
              </button>
            );
          })}

          {/* Progress */}
          <div className="flex items-center gap-1.5 px-4 pt-3">
            {STEPS.map((stepItem, index) => (
              <span
                key={stepItem.key}
                className={`h-1.5 rounded-full transition-all ${
                  index === stepIndex
                    ? "w-6 bg-indigo-600"
                    : index < stepIndex
                      ? "w-1.5 bg-indigo-300"
                      : "w-1.5 bg-slate-200"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 lg:col-span-3">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-600">
              <currentStep.icon className="h-5 w-5 text-white" />
            </div>

            <div>
              <h2 className="text-base font-semibold text-slate-800">
                {currentStep.label}
              </h2>

              <p className="text-xs text-slate-400">
                {currentStep.subtitle}
              </p>
            </div>
          </div>

          <div className="mb-6 border-b border-slate-100 pb-6">
            <StepComponent
              data={form}
              onChange={updateForm}
            />
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={goBack}
              disabled={isFirstStep || loading}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:pointer-events-none disabled:opacity-0"
            >
              Back
            </button>

            <button
              type="button"
              onClick={goNext}
              disabled={loading}
              className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "Saving..."
                : isLastStep
                  ? "Save Company"
                  : `Next: ${STEPS[stepIndex + 1].label}`}

              {!loading && !isLastStep && (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

