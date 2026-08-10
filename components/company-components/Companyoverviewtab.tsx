import {
  Building2,
  User,
  Hash,
  Calendar,
  Phone,
  Mail,
  CreditCard,
  Landmark,
  Smartphone,
  FileText,
} from "lucide-react";
import { InfoRow, InfoCard } from "./Inforow";
import type { TenantCompanyProfile } from "./Tenantprofiledata";

interface OverviewTabProps {
  profile: TenantCompanyProfile;
}

export default function CompanyOverviewTab({ profile }: OverviewTabProps) {
  return (
    <div className="bg-white rounded-b-xl border border-slate-200 border-t-0 p-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <InfoCard title="Business Information">
          <InfoRow icon={Building2} iconBg="bg-indigo-50" iconColor="text-indigo-600" label="Business Name" value={profile.name} />
          <InfoRow icon={User} iconBg="bg-purple-50" iconColor="text-purple-600" label="Owner Name" value={profile.displayName} />
          <InfoRow icon={Hash} iconBg="bg-slate-100" iconColor="text-slate-500" label="Tax Number" value={profile.taxId} />
          <InfoRow icon={Calendar} iconBg="bg-emerald-50" iconColor="text-emerald-600" label="Subscribed At" value={profile.createdAt} />
        </InfoCard>

        <InfoCard title="Contact Information">
          <InfoRow icon={Phone} iconBg="bg-sky-50" iconColor="text-sky-600" label="Primary Phone" value={profile.companyPhone} />
          <InfoRow icon={Phone} iconBg="bg-sky-50" iconColor="text-sky-600" label="Alternate Phone" value={profile.supportPhone} />
          <InfoRow icon={Mail} iconBg="bg-blue-50" iconColor="text-blue-600" label="Email" value={profile.companyEmail} />
        </InfoCard>

        <InfoCard title="Compliance">
          <InfoRow icon={Hash} iconBg="bg-amber-50" iconColor="text-amber-600" label="TIN Number" value={profile.taxId} />
          <InfoRow icon={Hash} iconBg="bg-amber-50" iconColor="text-amber-600" label="Registration Number" value="" />
        </InfoCard>

        <InfoCard title="Banking & Payments">
          <InfoRow icon={CreditCard} iconBg="bg-teal-50" iconColor="text-teal-600" label="Bank Account Name" value="" />
          <InfoRow icon={CreditCard} iconBg="bg-teal-50" iconColor="text-teal-600" label="Bank Account Number" value="" />
          <InfoRow icon={Landmark} iconBg="bg-indigo-50" iconColor="text-indigo-600" label="Bank Branch" value="" />
          <InfoRow icon={Smartphone} iconBg="bg-pink-50" iconColor="text-pink-600" label="Mobile Money Number" value="" />
        </InfoCard>
      </div>

      {/* <div className="mt-4 pt-6 border-t border-slate-100 flex items-start gap-3">
        <FileText className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
        <div>
          <h3 className="text-sm font-semibold text-slate-800 mb-1">Notes</h3>
          <p className="text-sm text-slate-400">No additional notes on file.</p>
        </div>
      </div> */}
    </div>
  );
}