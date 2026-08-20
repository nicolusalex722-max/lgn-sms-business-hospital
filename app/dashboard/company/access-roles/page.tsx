"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import CompanyAccessRolesTab from "@/components/company-components/Companyaccessrolestab";

export default function AccessRolesPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => router.push("/dashboard/company/profile")}
          aria-label="Back to Company Profile"
          className="text-slate-400 hover:text-slate-600 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">Access &amp; Roles</h1>
          <p className="text-sm text-slate-500">Control what each role can view, create, edit, or delete</p>
        </div>
      </div>

      <CompanyAccessRolesTab />
    </div>
  );
}