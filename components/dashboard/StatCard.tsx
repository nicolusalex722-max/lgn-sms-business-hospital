import { ArrowDownRight, ArrowUpRight } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string;
  change?: number; // e.g. 12.4 or -3.2 (percent)
  icon: React.ElementType;
  accent?: "indigo" | "emerald" | "amber" | "rose";
}

const ACCENTS = {
  indigo: "bg-indigo-50 text-indigo-600",
  emerald: "bg-emerald-50 text-emerald-600",
  amber: "bg-amber-50 text-amber-600",
  rose: "bg-rose-50 text-rose-600",
};

export default function StatCard({
  label,
  value,
  change,
  icon: Icon,
  accent = "indigo",
}: StatCardProps) {
  const isPositive = (change ?? 0) >= 0;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col gap-3 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-500">{label}</span>
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${ACCENTS[accent]}`}>
          <Icon className="w-4.5 h-4.5" />
        </div>
      </div>
      <div className="text-2xl font-semibold text-slate-800">{value}</div>
      {change !== undefined && (
        <div
          className={`inline-flex items-center gap-1 text-xs font-medium w-fit ${
            isPositive ? "text-emerald-600" : "text-rose-600"
          }`}
        >
          {isPositive ? (
            <ArrowUpRight className="w-3.5 h-3.5" />
          ) : (
            <ArrowDownRight className="w-3.5 h-3.5" />
          )}
          <span>{Math.abs(change)}% vs last month</span>
        </div>
      )}
    </div>
  );
}