"use client";

import { useState } from "react";
import { Briefcase, School } from "lucide-react";
import BusinessDashboardView from "@/components/dashboard/BusinessDashboardView";
import SchoolDashboardView from "@/components/dashboard/SchoolDashboardView";
import type { ClientType } from "@/lib/clientType";

type DashboardType = "business" | "school";

interface DashboardShellProps {
  clientType: ClientType;
}

export default function DashboardShell({ clientType }: DashboardShellProps) {
  // Sales-management clients only ever see the business dashboard, no choice offered.
  // School-management clients get a toggle and can switch between both views.
  const [selected, setSelected] = useState<DashboardType>(
    clientType === "sales" ? "business" : "school"
  );

  const showToggle = clientType === "school";

  return (
    <div className="flex flex-col gap-6">
      {showToggle && (
        <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1 w-fit">
          <button
            type="button"
            onClick={() => setSelected("business")}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              selected === "business"
                ? "bg-white text-slate-800 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <Briefcase className="w-4 h-4" />
            Business
          </button>
          <button
            type="button"
            onClick={() => setSelected("school")}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              selected === "school"
                ? "bg-white text-slate-800 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <School className="w-4 h-4" />
            School
          </button>
          
        </div>
      )}

      {selected === "business" ? <BusinessDashboardView /> : <SchoolDashboardView />}
    </div>
  );
}