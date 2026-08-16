"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import CompanyProfileEditForm from "@/components/company-components/Tenantprofileeditform";
import CompanyProfileHeader from "@/components/company-components/Companyprofileheader";
import CompanyOverviewTab from "@/components/company-components/Companyoverviewtab";
import Modal from "@/components/dashboard/Modal";
import { useCompanyProfile } from "@/hooks/use-company-profile";
import type { CompanyProfileUpdateInput } from "@/lib/validations/company-profile-schema";

export default function CompanyProfilePage() {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const {
    company,
    loading,
    updating,
    error,
    updateCompanyProfile,
    clearMessages,
    fetchCompanyProfile,
  } = useCompanyProfile();

  const handleOpenEdit = () => {
    clearMessages();
    setEditOpen(true);
  };

  const handleSave = async (data: CompanyProfileUpdateInput) => {
    const result = await updateCompanyProfile(data);

    if (result.success) {
      setEditOpen(false);
    }
  };

  if (loading) {
    return <p className="py-10 text-center text-sm text-slate-500">Loading company profile…</p>;
  }

  if (!company) {
    return (
      <div className="py-10 text-center">
        <p className="text-sm text-rose-600">{error ?? "Company profile could not be loaded."}</p>
        <button type="button" onClick={() => void fetchCompanyProfile()} className="mt-4 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <CompanyProfileHeader
        company={company}
        onBack={() => router.back()}
        onEdit={handleOpenEdit}
      />

      {error && !editOpen && <p className="mt-4 text-sm text-rose-600">{error}</p>}
      <CompanyOverviewTab company={company} />

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit Company Profile">
        <CompanyProfileEditForm company={company} updating={updating} error={error} onSubmit={handleSave} onCancel={() => setEditOpen(false)} />
      </Modal>
    </div>
  );
}
