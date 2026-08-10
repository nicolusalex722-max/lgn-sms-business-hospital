import { DollarSign, ShoppingCart, Users, Package, FileText, UserPlus, ClipboardList, Settings2 } from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";
import QuickAccessCard from "@/components/dashboard/QuickAccessCard";
import { RevenueChart, CategoryChart } from "@/components/dashboard/BusinessCharts";

export default function BusinessDashboardView() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-800">Business Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">Overview of your business performance</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Revenue" value="TZS 6.8M" change={12.4} icon={DollarSign} accent="indigo" />
        <StatCard label="Orders" value="342" change={8.1} icon={ShoppingCart} accent="emerald" />
        <StatCard label="Customers" value="1,204" change={-2.3} icon={Users} accent="amber" />
        <StatCard label="Low Stock Items" value="18" icon={Package} accent="rose" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <RevenueChart />
        <CategoryChart />
      </div>

      <div>
        <h2 className="text-base font-semibold text-slate-800 mb-3">Quick Access</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <QuickAccessCard title="New Invoice" description="Create and send an invoice" href="/dashboard/finance/invoices/new" icon={FileText} />
          <QuickAccessCard title="Add Customer" description="Register a new customer" href="/dashboard/customers/new" icon={UserPlus} />
          <QuickAccessCard title="Stock Take" description="Review current inventory" href="/dashboard/inventory/stock" icon={ClipboardList} />
          <QuickAccessCard title="Settings" description="Manage company preferences" href="/dashboard/settings/company" icon={Settings2} />
        </div>
      </div>
    </div>
  );
}