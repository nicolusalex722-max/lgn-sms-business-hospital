"use client";

import type { AuthenticatedUser } from "@/lib/types";
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
  BookSearch,
  GraduationCap,
  Briefcase,
  BookOpen,
} from "lucide-react";

/**
 * ============================================================
 * TYPES
 * ============================================================
 */

type UserRole = "SuperAdmin" | "CompanyAdmin" | "User";

type NavChild = {
  label: string;
  href: string;
};

type NavItem = {
  label: string;
  icon: React.ElementType;
  href?: string;
  children?: NavChild[];

  /**
   * Roles allowed to see this module.
   *
   * If omitted, the module is visible to every authenticated user.
   */
  roles?: UserRole[];
};

/**
 * ============================================================
 * NAVIGATION CONFIGURATION
 * ============================================================
 *
 * Access rules:
 *
 * SuperAdmin:
 * - Dashboard
 * - Settings
 * - Lgn Company
 *
 * CompanyAdmin:
 * - Dashboard
 * - All normal company modules
 * - Settings
 *
 * User:
 * - Dashboard
 * - All normal company modules
 * - Settings
 *
 * IMPORTANT:
 * The sidebar is only a UI-level permission check.
 * You MUST also protect the corresponding routes/server actions
 * on the backend.
 */

const NAV_ITEMS: NavItem[] = [
  /**
   * ------------------------------------------------------------
   * SHARED MODULES
   * ------------------------------------------------------------
   */

  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
    roles: ["SuperAdmin", "CompanyAdmin", "User"],
  },

  /**
   * ------------------------------------------------------------
   * COMPANY MODULES
   * ------------------------------------------------------------
   *
   * These are available to CompanyAdmin and User.
   * SuperAdmin does not see them.
   */

  {
    label: "Accounting",
    icon: BookOpen,
    roles: ["CompanyAdmin", "User"],
    children: [
      {
        label: "Account Group",
        href: "/dashboard/accounting/account-group",
      },
      {
        label: "Entries",
        href: "/dashboard/accounting/entries",
      },
      {
        label: "Chart of Accounting",
        href: "/dashboard/accounting/chart-accounts",
      },
      {
        label: "Bank Reconciliation",
        href: "/dashboard/accounting/bank-reconcialition",
      },
    ],
  },

  {
    label: "Payments & Financials",
    icon: Landmark,
    roles: ["CompanyAdmin", "User"],
    children: [
      {
        label: "Fees Receive & Pay Payments",
        href: "/dashboard/payments/receive-pay-payments",
      },
      {
        label: "Expenses",
        href: "/dashboard/payments/expenses",
      },
      {
        label: "Bills & Invoice",
        href: "/dashboard/payments/bills-invoice",
      },
      {
        label: "Budget",
        href: "/dashboard/payments/budget",
      },
    ],
  },

  {
    label: "HR Management",
    icon: Briefcase,
    roles: ["CompanyAdmin", "User"],
    children: [
      {
        label: "Employees",
        href: "/dashboard/hr/employees",
      },
      {
        label: "Leave Management",
        href: "/dashboard/hr/leave",
      },
      {
        label: "Payroll",
        href: "/dashboard/hr/payroll",
      },
    ],
  },

  {
    label: "Students & Parents",
    icon: Users,
    roles: ["CompanyAdmin", "User"],
    children: [
      {
        label: "Registration",
        href: "/dashboard/students/registrations",
      },
    ],
  },

  {
    label: "Academics",
    icon: GraduationCap,
    roles: ["CompanyAdmin", "User"],
    children: [
      {
        label: "Subjects",
        href: "/dashboard/academics/subjects",
      },
      {
        label: "Classes",
        href: "/dashboard/academics/classes",
      },
      {
        label: "Faculties",
        href: "/dashboard/academics/faculties",
      },
      {
        label: "Results",
        href: "/dashboard/academics/results",
      },
      {
        label: "Exams",
        href: "/dashboard/academics/exams",
      },
      {
        label: "Attendance",
        href: "/dashboard/academics/attendance",
      },
      {
        label: "Accommodations",
        href: "/dashboard/academics/accommodations",
      },
    ],
  },

  {
    label: "Library",
    icon: BookSearch,
    roles: ["CompanyAdmin", "User"],
    children: [
      {
        label: "Library Management",
        href: "/dashboard/library/library-management",
      },
      {
        label: "Catalog",
        href: "/dashboard/library/catalog",
      },
      {
        label: "Operations",
        href: "/dashboard/library/operations",
      },
    ],
  },

  {
    label: "Inventory & Procurement",
    icon: Package,
    roles: ["CompanyAdmin", "User"],
    children: [
      {
        label: "Inventory",
        href: "/dashboard/inventory-procurement/inventory",
      },
      {
        label: "Purchase Orders",
        href: "/dashboard/inventory-procurement/purchase-orders",
      },
      {
        label: "Suppliers",
        href: "/dashboard/inventory-procurement/suppliers",
      },
      {
        label: "Stock Take",
        href: "/dashboard/inventory-procurement/stock-take",
      },
      {
        label: "Stock Adjustments",
        href: "/dashboard/inventory-procurement/stock-adjustments",
      },
    ],
  },

  {
    label: "Reports",
    icon: BarChart3,
    roles: ["CompanyAdmin", "User"],
    children: [
      {
        label: "Academic Reports",
        href: "/dashboard/reports/academic-reports",
      },
      {
        label: "Sales Reports",
        href: "/dashboard/reports/sales-reports",
      },
      {
        label: "Financial Reports",
        href: "/dashboard/reports/financial-reports",
      },
      {
        label: "Supplier & Payable Reports",
        href: "/dashboard/reports/supplier-reports",
      },
      {
        label: "Inventory Reports",
        href: "/dashboard/reports/inventory-reports",
      },
    ],
  },

  {
    label: "Company",
    icon: FileText,
    roles: ["CompanyAdmin", "User"],
    children: [
      {
        label: "Profile",
        href: "/dashboard/company/profile",
      },
      {
        label: "Departments",
        href: "/dashboard/company/departments",
      },
      {
        label: "Branches",
        href: "/dashboard/company/branches",
      },
      {
        label: "Message Broadcast",
        href: "/dashboard/company/message-broadcast",
      },
      {
        label: "User Management",
        href: "/dashboard/company/user-management",
      },
      {
        label: "Access & Roles",
        href: "/dashboard/company/access-roles",
      },
    ],
  },

  /**
   * ------------------------------------------------------------
   * SETTINGS
   * ------------------------------------------------------------
   *
   * Available to EVERY authenticated role.
   */

  {
    label: "Settings",
    icon: Settings,
    roles: ["SuperAdmin", "CompanyAdmin", "User"],
    children: [
      {
        label: "Accounting Settings",
        href: "/dashboard/settings/gl-settings",
      },
      {
        label: "Academic Settings",
        href: "/dashboard/settings/academic-settings",
      },
      {
        label: "System Settings",
        href: "/dashboard/settings/system-settings",
      },
    ],
  },

  /**
   * ------------------------------------------------------------
   * LGN COMPANY
   * ------------------------------------------------------------
   *
   * ONLY SuperAdmin can see this module.
   */

  {
    label: "Lgn Company",
    icon: Laptop,
    roles: ["SuperAdmin"],
    children: [
      {
        label: "Company Management",
        href: "/dashboard/lgn/company-management",
      },
      {
        label: "Subscriptions Plan",
        href: "/dashboard/lgn/sub-plan",
      },
      {
        label: "Software Products",
        href: "/dashboard/lgn/software-products",
      },
    ],
  },
];

/**
 * ============================================================
 * ROLE CHECK
 * ============================================================
 */

function canAccessNavItem(item: NavItem, role: UserRole): boolean {
  /**
   * If no roles are specified, allow every authenticated user.
   */
  if (!item.roles || item.roles.length === 0) {
    return true;
  }

  return item.roles.includes(role);
}

/**
 * ============================================================
 * NAV LINK
 * ============================================================
 */

function NavLink({
  item,
  pathname,
}: {
  item: NavItem;
  pathname: string;
}) {
  const isChildActive =
    item.children?.some((child) => pathname === child.href) ?? false;

  const [open, setOpen] = useState(isChildActive);

  const Icon = item.icon;

  /**
   * ----------------------------------------------------------
   * SIMPLE LINK
   * ----------------------------------------------------------
   */

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

  /**
   * ----------------------------------------------------------
   * PARENT WITH CHILDREN
   * ----------------------------------------------------------
   */

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
          isChildActive
            ? "text-white"
            : "text-slate-300 hover:bg-indigo-500 hover:text-white"
        }`}
        aria-expanded={open}
      >
        <Icon className="w-5 h-5 shrink-0" />

        <span className="text-sm font-medium flex-1 text-left">
          {item.label}
        </span>

        <ChevronDown
          className={`w-4 h-4 transition-transform ${
            open ? "rotate-180" : ""
          }`}
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

/**
 * ============================================================
 * SIDEBAR PROPS
 * ============================================================
 */

type SidebarProps = {
  user: AuthenticatedUser;
};

/**
 * ============================================================
 * SIDEBAR
 * ============================================================
 */

export default function Sidebar({ user }: SidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const pathname = usePathname();

  /**
   * ----------------------------------------------------------
   * NORMALIZE ROLE
   * ----------------------------------------------------------
   *
   * AuthenticatedUser.role should already contain one of:
   *
   * - SuperAdmin
   * - CompanyAdmin
   * - User
   *
   * Keeping this explicit gives us a single place to handle
   * unexpected role values.
   */

  const role = user.role as UserRole;

  /**
   * ----------------------------------------------------------
   * FILTER NAVIGATION
   * ----------------------------------------------------------
   *
   * This is the important part.
   *
   * Instead of rendering every NAV_ITEMS entry and trying to
   * hide individual elements later, we first filter the
   * navigation according to the authenticated user's role.
   */

  const visibleNavItems = NAV_ITEMS.filter((item) =>
    canAccessNavItem(item, role)
  );

  /**
   * ----------------------------------------------------------
   * SIDEBAR CONTENT
   * ----------------------------------------------------------
   */

  const sidebarContent = (
    <div className="flex flex-col h-full bg-slate-900">
      {/* -----------------------------------------------------
          BRAND
      ----------------------------------------------------- */}

      <div className="flex items-center gap-2 px-5 h-16 border-b border-slate-800 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center font-bold text-white text-sm">
          B
        </div>

        <span className="text-white font-semibold text-sm tracking-wide">
          Business Dashboard
        </span>
      </div>

      {/* -----------------------------------------------------
          NAVIGATION
      ----------------------------------------------------- */}

      <nav className="flex-1 overflow-y-auto px-2 py-4 flex flex-col gap-1">
        {visibleNavItems.map((item) => (
          <NavLink
            key={item.label}
            item={item}
            pathname={pathname}
          />
        ))}
      </nav>

      {/* -----------------------------------------------------
          USER SECTION
      ----------------------------------------------------- */}

      <div className="border-t border-slate-800 p-3 shrink-0">
        <div className="flex items-center gap-3 px-2 py-3">
          {/* Avatar */}

          <div className="w-9 h-9 rounded-full bg-indigo-500 flex items-center justify-center text-white font-semibold text-sm shrink-0">
            {user.email.charAt(0).toUpperCase()}
          </div>

          {/* User information */}

          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-white truncate">
              {user.email}
            </p>

            <p className="text-xs text-slate-400">
              {user.role}
            </p>
          </div>
        </div>

        {/* Logout */}

        <button
          type="button"
          onClick={() => {
            console.log("logout clicked");
          }}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-slate-300 hover:bg-indigo-500 hover:text-white transition-colors"
        >
          <LogOut className="w-5 h-5 shrink-0" />

          <span className="text-sm font-medium">
            Logout
          </span>
        </button>
      </div>
    </div>
  );

  /**
   * ----------------------------------------------------------
   * MOBILE + DESKTOP SIDEBAR
   * ----------------------------------------------------------
   */

  return (
    <>
      {/* =====================================================
          MOBILE TOP BAR
      ===================================================== */}

      <div className="md:hidden flex items-center justify-between h-14 px-4 bg-slate-900 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-indigo-500 flex items-center justify-center font-bold text-white text-xs">
            B
          </div>

          <span className="text-white font-semibold text-sm">
            Business Dashboard
          </span>
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

      {/* =====================================================
          DESKTOP SIDEBAR
      ===================================================== */}

      <aside className="hidden md:block w-64 h-screen sticky top-0 shrink-0">
        {sidebarContent}
      </aside>

      {/* =====================================================
          MOBILE SIDEBAR
      ===================================================== */}

      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          {/* Overlay */}

          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileOpen(false)}
          />

          {/* Drawer */}

          <div className="absolute left-0 top-0 h-full w-64">
            <div className="relative h-full">
              {/* Close button */}

              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
                className="absolute top-4 -right-10 text-white p-1"
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