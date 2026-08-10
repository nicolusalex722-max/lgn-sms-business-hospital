import { GraduationCap, User, Users, Coins } from "lucide-react";

interface SchoolStatCardProps {
  label: string;
  value: string;
  icon: React.ElementType;
  bg: string; // tailwind bg color class for the circle
}

function SchoolStatCard({ label, value, icon: Icon, bg }: SchoolStatCardProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4 shadow-sm">
      <div className={`w-14 h-14 rounded-full flex items-center justify-center shrink-0 ${bg}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div>
        <p className="text-sm text-slate-400">{label}</p>
        <p className="text-2xl font-bold text-slate-800">{value}</p>
      </div>
    </div>
  );
}

export default function SchoolStatCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <SchoolStatCard label="Students" value="1279" icon={GraduationCap} bg="bg-amber-400" />
      <SchoolStatCard label="Faculty" value="254" icon={User} bg="bg-sky-400" />
      <SchoolStatCard label="Parents" value="872" icon={Users} bg="bg-teal-500" />
      <SchoolStatCard label="Earnings" value="$42.8k" icon={Coins} bg="bg-rose-500" />
    </div>
  );
}