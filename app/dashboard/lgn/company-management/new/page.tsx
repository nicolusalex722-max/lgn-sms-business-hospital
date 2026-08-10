"use client";

import { useRouter } from "next/navigation";
import CompanyWizardShell, { CompanyFormData } from "@/components/lgn-components/Companywizardshell";

export default function NewCompanyPage() {
  const router = useRouter();

  const handleSave = (data: CompanyFormData) => {
    // TODO: replace with a real API call / Prisma mutation, e.g.:
    // await fetch("/api/companies", { method: "POST", body: JSON.stringify(data) });
    console.log("Saving company:", data);
    router.push("/dashboard/lgn/company-management");
  };

  return <CompanyWizardShell onSave={handleSave} />;
}