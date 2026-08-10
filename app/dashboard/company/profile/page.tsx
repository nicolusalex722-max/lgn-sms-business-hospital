"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getTenantCompanyProfile, TenantCompanyProfile } from "@/components/company-components/Tenantprofiledata";
import TenantProfileEditForm from "@/components/company-components/Tenantprofileeditform";
import CompanyProfileHeader from "@/components/company-components/Companyprofileheader";
import CompanyOverviewTab from "@/components/company-components/Companyoverviewtab";
import Modal from "@/components/dashboard/Modal";

export default function CompanyProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<TenantCompanyProfile>(() => getTenantCompanyProfile());
  const [editOpen, setEditOpen] = useState(false);

  const handleSave = (data: TenantCompanyProfile) => {
    // TODO: persist via your API, e.g. PATCH /api/company-profile
    setProfile(data);
    setEditOpen(false);
  };

  const handleDeactivate = () => {
    // TODO: wire up to your real deactivate flow (confirmation + API call)
    console.log("Deactivate company requested");
  };

  return (
    <div className="flex flex-col">
      <CompanyProfileHeader
        name={profile.name}
        email={profile.companyEmail}
        status={profile.status}
        vendorNumber={profile.taxId}
        phone={profile.companyPhone}
        shopsCount={1}
        contractsCount={1}
        onBack={() => router.back()}
        onEdit={() => setEditOpen(true)}
        onDeactivate={handleDeactivate}
      />

      <CompanyOverviewTab profile={profile} />

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit Company Profile">
        <TenantProfileEditForm profile={profile} onSubmit={handleSave} onCancel={() => setEditOpen(false)} />
      </Modal>
    </div>
  );
}