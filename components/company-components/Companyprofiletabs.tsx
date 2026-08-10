"use client";

export type CompanyProfileTab =
  | "overview"
  | "departments"
  | "branches"
  | "users"
  | "broadcast"
  | "access";

const TABS: { key: CompanyProfileTab; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "departments", label: "Departments" },
  { key: "branches", label: "Branches" },
  { key: "users", label: "Users" },
  { key: "broadcast", label: "Message Broadcast" },
  { key: "access", label: "Access & Roles" },
];

interface CompanyProfileTabsProps {
  active: CompanyProfileTab;
  onChange: (tab: CompanyProfileTab) => void;
}

export default function CompanyProfileTabs({ active, onChange }: CompanyProfileTabsProps) {
  return (
    <div className="bg-white border-x border-slate-200">
      <div className="flex items-center gap-1 px-4 overflow-x-auto">
        {TABS.map((tab) => {
          const isActive = tab.key === active;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => onChange(tab.key)}
              className={`relative px-4 py-3.5 text-sm font-medium whitespace-nowrap transition-colors ${
                isActive ? "text-indigo-600" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {tab.label}
              {isActive && <span className="absolute left-0 right-0 -bottom-px h-0.5 bg-indigo-600 rounded-full" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}