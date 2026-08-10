import { Wallet, Clock, CalendarCheck } from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";

interface PayrollStatCardsProps {
  totalPaid: number;
  pendingCount: number;
  lastRunMonth: string;
}

function formatCurrency(value: number) {
  return `TZS ${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

export default function PayrollStatCards({ totalPaid, pendingCount, lastRunMonth }: PayrollStatCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <StatCard label="Total Paid" value={formatCurrency(totalPaid)} icon={Wallet} accent="emerald" />
      <StatCard label="Pending Payments" value={String(pendingCount)} icon={Clock} accent="amber" />
      <StatCard label="Last Payroll Run" value={lastRunMonth || "\u2014"} icon={CalendarCheck} accent="indigo" />
    </div>
  );
}