import { Building2, CheckCircle2, GraduationCap, Briefcase } from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";

interface CompanyStatCardsProps {
  total: number;
  active: number;
  businessCount: number;
  schoolCount: number;
}

export default function CompanyStatCards({ total, active, businessCount, schoolCount }: CompanyStatCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard label="Total Companies" value={String(total)} icon={Building2} accent="indigo" />
      <StatCard label="Active Companies" value={String(active)} icon={CheckCircle2} accent="emerald" />
      <StatCard label="Business Clients" value={String(businessCount)} icon={Briefcase} accent="amber" />
      <StatCard label="School Clients" value={String(schoolCount)} icon={GraduationCap} accent="rose" />
    </div>
  );
}