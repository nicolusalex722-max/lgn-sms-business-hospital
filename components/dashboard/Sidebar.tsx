"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Landmark,
  Users,
  Package,
  BarChart3,
  Settings,
  ChevronDown,
  Menu,
  X,
  LogOut,
  Laptop,
  FileText,
  ShoppingCart,
  BookSearch,
  GraduationCap,
  Briefcase,
  BookOpen,
} from "lucide-react";

type NavItem = {
  label: string;
  icon: React.ElementType;
  children?: { label: string; href: string }[];
  href?: string;
};

// const NAV_ITEMS: NavItem[] = [
//   { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
//   {
//     label: "Finance",
//     icon: Landmark,
//     children: [
//       { label: "Transactions", href: "/dashboard/finance/transactions" },
//       { label: "Invoices", href: "/dashboard/finance/invoices" },
//       { label: "Payroll", href: "/dashboard/finance/payroll" },
//     ],
//   },
//   {
//     label: "Customers",
//     icon: Users,
//     children: [
//       { label: "All Customers", href: "/dashboard/customers" },
//       { label: "Leads", href: "/dashboard/customers/leads" },
//     ],
//   },
//   {
//     label: "Inventory",
//     icon: Package,
//     children: [
//       { label: "Stock Levels", href: "/dashboard/inventory/stock" },
//       { label: "Purchase Orders", href: "/dashboard/inventory/orders" },
//     ],
//   },
//   {
//     label: "Reports",
//     icon: BarChart3,
//     children: [
//       { label: "Sales Reports", href: "/dashboard/reports/sales" },
//       { label: "Tax Reports", href: "/dashboard/reports/tax" },
//     ],
//   },
//   {
//     label: "Settings",
//     icon: Settings,
//     children: [
//       { label: "Company Profile", href: "/dashboard/settings/company" },
//       { label: "Users & Roles", href: "/dashboard/settings/roles" },
//     ],
//   },
// ];

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  {
    label: "Accounting",
    icon: BookOpen,
    children: [
       { label: "Account Group", href: "/dashboard/accounting/account-group" },
       { label: "Entries", href: "/dashboard/accounting/entries" },
       { label: "Chart of Accounting", href: "/dashboard/accounting/chart-accounts" },
       { label: "Bank reconcialition", href: "/dashboard/accounting/bank-reconcialition" },
      
    ],
  },
   {
    label: "Payments & Financials",
    icon: Landmark,
    children: [  
      { label: "Fees Receive & Pay Payments", href: "/dashboard/payments/receive-pay-payments" },
    //   { label: "Transfer Funds", href: "/dashboard/payments/transfer-funds" },
      { label: "Expenses", href: "/dashboard/payments/expenses" },
      { label: "Bills & Invoice", href: "/dashboard/payments/bills-invoice" },
      { label: "Budget", href: "/dashboard/payments/budget"},
    //   { label: "Invoices", href: "/dashboard/payments/invoices" },
      
    ],
  },

  {
    label: "Hr Management",
    icon: Briefcase,
    children: [
      { label: "Employees", href: "/dashboard/hr/employees" },
      { label: "Leave Management", href: "/dashboard/hr/leave" },
      { label: "Payroll", href: "/dashboard/hr/payroll" },
    ],
  },

  {
    label: "Students & Parents",
    icon: Users,
    children: [
      { label: "Registration", href: "/dashboard/students/registrations" },
    //   { label: "Students Managements", href: "/dashboard/students/student-management" },
    //   { label: "Parents Management", href: "/dashboard/students/parents-management" },
    ],
  },

  {
    label: "Academics",
    icon: GraduationCap,
    children: [
      { label: "Subjects", href: "/dashboard/academics/subjects" },
      { label: "Classes", href: "/dashboard/academics/classes" },
      { label: "Faculties", href: "/dashboard/academics/faculties" },
      { label: "Results", href: "/dashboard/academics/results" },
      { label: "Exams", href: "/dashboard/academics/exams" },
      { label: "Attendance", href: "/dashboard/academics/attendance" },
      { label: "Accommodations", href: "/dashboard/academics/accommodations" },
    ],
  },
    {
    label: "Library",
    icon: BookSearch,
    children: [
      { label: "Library-management", href: "/dashboard/library/library-management" },
      { label: "Catalog", href: "/dashboard/library/catalog" },
      { label: "Operations", href: "/dashboard/library/operations" },
    ],
  },
   {
    label: "Sales",
    icon: ShoppingCart,
    children: [
      { label: "Order Management", href: "/dashboard/sales/order-management" },
      { label: "Customers", href: "/dashboard/sales/customers" },
      
    ],
  },
  {
    label: "Inventory & Procurement",
    icon: Package,
    children: [
      { label: "Inventory", href: "/dashboard/inventory-procurement/inventory" },
      { label: "Purchase Orders", href: "/dashboard/inventory-procurement/purchase-orders" },
      { label: "Suppliers", href: "/dashboard/inventory-procurement/suppliers" },
      { label: "Stock Take", href: "/dashboard/inventory-procurement/stock-take" },
      { label: "Stock Adjustments", href: "/dashboard/inventory-procurement/stock-adjustments" },
    ],
  },
  {
    label: "Reports",
    icon: BarChart3,
    children: [
      { label: "Academic Reports", href: "/dashboard/reports/academic-reports" },
      {label:"Sales Reports",href:"/dashboard/reports/sales-reports"},
      { label: "Financial Reports", href: "/dashboard/reports/financial-reports" },
      { label: "Supplier&Payable Reports", href: "/dashboard/reports/supplier-reports" },
      { label: "Inventory Reports", href: "/dashboard/reports/inventory-reports" },
      
    ],
  },
   {
    label: "Company",
    icon: FileText,
    children: [
      { label: "Profile", href: "/dashboard/company/profile" },
      { label: "Departments", href: "/dashboard/company/departments" },
      { label: "Branches", href: "/dashboard/company/branches" },
      { label: "Message Broadcast", href: "/dashboard/company/message-broadcast" },
      { label: "User Management", href: "/dashboard/company/user-management"},
      { label: "Access & Roles", href: "/dashboard/company/access-roles"},

    ],
  },
  {
    label: "Settings",
    icon: Settings,
    children: [
      { label: "Accounting Settings", href: "/dashboard/settings/gl-settings" },
      { label: "Academic Settings", href: "/dashboard/settings/academic-settings" },
      { label: "System Settings", href: "/dashboard/settings/system-settings" },
    ],
  },
  {
    label: "Lgn Company",
    icon: Laptop,
    children: [
      { label: "Company Management", href: "/dashboard/lgn/company-management" },
      { label: "Subscriptions Plan", href: "/dashboard/lgn/sub-plan" },
      { label: "Software Products", href: "/dashboard/lgn/software-products" },
    ],
  },

];
function NavLink({ item, pathname }: { item: NavItem; pathname: string }) {
  const isChildActive = item.children?.some((c) => pathname === c.href) ?? false;
  const [open, setOpen] = useState(isChildActive);
  const Icon = item.icon;

  if (!item.children) {
    const isActive = pathname === item.href;
    return (
      <a
        href={item.href}
        className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
          isActive
            ? "bg-indigo-500 text-white"
            : "text-slate-300 hover:bg-indigo-500 hover:text-white"
        }`}
      >
        <Icon className="w-5 h-5 shrink-0" />
        <span className="text-sm font-medium">{item.label}</span>
      </a>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
          isChildActive
            ? "text-white"
            : "text-slate-300 hover:bg-indigo-500 hover:text-white"
        }`}
      >
        <Icon className="w-5 h-5 shrink-0" />
        <span className="text-sm font-medium flex-1 text-left">{item.label}</span>
        <ChevronDown
          className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="ml-8 mt-1 flex flex-col gap-0.5 border-l border-slate-700 pl-3">
          {item.children.map((child) => {
            const isActive = pathname === child.href;
            return (
              <a
                key={child.href}
                href={child.href}
                className={`px-3 py-2 rounded-md text-sm transition-colors ${
                  isActive
                    ? "text-white font-medium"
                    : "text-slate-400 hover:bg-indigo-500 hover:text-white"
                }`}
              >
                {child.label}
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  const sidebarContent = (
    <div className="flex flex-col h-full bg-slate-900">
      <div className="flex items-center gap-2 px-5 h-16 border-b border-slate-800 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center font-bold text-white text-sm">
          B
        </div>
        <span className="text-white font-semibold text-sm tracking-wide">
          Business Dashboard
        </span>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-4 flex flex-col gap-1">
        {NAV_ITEMS.map((item) => (
          <NavLink key={item.label} item={item} pathname={pathname} />
        ))}
      </nav>

      <div className="border-t border-slate-800 p-2 shrink-0">
        <button
          type="button"
          onClick={() => {
            // Wire this up to your sign-out logic, e.g. NextAuth's signOut()
            console.log("logout clicked");
          }}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-slate-300 hover:bg-indigo-500 hover:text-white transition-colors"
        >
          <LogOut className="w-5 h-5 shrink-0" />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      <div className="md:hidden flex items-center justify-between h-14 px-4 bg-slate-900 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-indigo-500 flex items-center justify-center font-bold text-white text-xs">
            B
          </div>
          <span className="text-white font-semibold text-sm">Business Dashboard</span>
        </div>
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
          className="text-slate-300 p-1"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      <aside className="hidden md:block w-64 h-screen sticky top-0 shrink-0">
        {sidebarContent}
      </aside>

      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full w-64">
            <div className="relative h-full">
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
                className="absolute top-4 right-[-40px] text-white p-1"
              >
                <X className="w-6 h-6" />
              </button>
              {sidebarContent}
            </div>
          </div>
        </div>
      )}
    </>
  );
}