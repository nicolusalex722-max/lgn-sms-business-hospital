import { Users, Building2, Wallet } from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";

interface EmployeeStatCardsProps {
  totalEmployees: number;
  totalDepartments: number;
  annualSalary: number;
}

function formatCurrency(value: number) {
  return `TZS ${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

export default function EmployeeStatCards({ totalEmployees, totalDepartments, annualSalary }: EmployeeStatCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <StatCard label="Total Employees" value={String(totalEmployees)} icon={Users} accent="indigo" />
      <StatCard label="Departments" value={String(totalDepartments)} icon={Building2} accent="emerald" />
      <StatCard label="Annual Salary" value={formatCurrency(annualSalary)} icon={Wallet} accent="amber" />
    </div>
  );
}