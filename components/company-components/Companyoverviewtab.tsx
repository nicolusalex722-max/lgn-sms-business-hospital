import {
  Building2,
  User,
  Hash,
  Calendar,
  Phone,
  Mail,
  BriefcaseBusiness,
  Clock3,
  MapPin,
} from "lucide-react";
import { InfoRow, InfoCard } from "./Inforow";
import type { Company } from "@/lib/types";

interface OverviewTabProps {
  company: Company;
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value));
}

export default function CompanyOverviewTab({ company }: OverviewTabProps) {
  return (
    <div className="bg-white rounded-b-xl border border-slate-200 border-t-0 p-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <InfoCard title="Business Information">
          <InfoRow icon={Building2} iconBg="bg-indigo-50" iconColor="text-indigo-600" label="Business name" value={company.companyName} />
          <InfoRow icon={User} iconBg="bg-purple-50" iconColor="text-purple-600" label="Display name" value={company.displayName} />
          <InfoRow icon={Calendar} iconBg="bg-emerald-50" iconColor="text-emerald-600" label="Created" value={formatDate(company.createdAt)} />
        </InfoCard>

        <InfoCard title="Contact Information">
          <InfoRow icon={Phone} iconBg="bg-sky-50" iconColor="text-sky-600" label="Primary phone" value={company.phone ?? ""} />
          <InfoRow icon={Mail} iconBg="bg-blue-50" iconColor="text-blue-600" label="Email" value={company.email} />
          <InfoRow icon={MapPin} iconBg="bg-rose-50" iconColor="text-rose-600" label="Address" value={company.address ?? ""} />
        </InfoCard>

        <InfoCard title="Compliance">
          <InfoRow icon={Hash} iconBg="bg-amber-50" iconColor="text-amber-600" label="TIN number" value={company.tin ?? ""} />
          <InfoRow icon={Hash} iconBg="bg-amber-50" iconColor="text-amber-600" label="Registration number" value={company.registrationNumber ?? ""} />
        </InfoCard>

        <InfoCard title="Subscription">
          <InfoRow icon={BriefcaseBusiness} iconBg="bg-teal-50" iconColor="text-teal-600" label="Business type" value={company.businessType ?? ""} />
          <InfoRow icon={Clock3} iconBg="bg-indigo-50" iconColor="text-indigo-600" label="Subscription status" value={company.subscriptionStatus ?? ""} />
          <InfoRow icon={Calendar} iconBg="bg-slate-100" iconColor="text-slate-600" label="Last updated" value={formatDate(company.updatedAt)} />
        </InfoCard>
      </div>
    </div>
  );
}
