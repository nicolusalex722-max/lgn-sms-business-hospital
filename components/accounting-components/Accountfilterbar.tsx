"use client";

import { useState } from "react";
import { Search, SlidersHorizontal, ChevronDown } from "lucide-react";
import { ACCOUNT_TYPES } from "@/lib/types";

export default function AccountsFilterBar({
  query,
  onQueryChange,
  typeFilter,
  onTypeFilterChange,
}: {
  query: string;
  onQueryChange: (value: string) => void;
  typeFilter: string;
  onTypeFilterChange: (value: string) => void;
}) {
  const [filterOpen, setFilterOpen] = useState(false);

  return (
    <div className="mt-6 flex gap-3">
      <div className="flex flex-1 items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-400">
        <Search size={18} />
        <input
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Search by code or account name..."
          className="w-full bg-transparent text-slate-700 placeholder:text-slate-400 focus:outline-none"
        />
      </div>
      <div className="relative">
        <button
          onClick={() => setFilterOpen((o) => !o)}
          className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-600"
        >
          <SlidersHorizontal size={16} />
          {typeFilter}
          <ChevronDown size={16} />
        </button>
        {filterOpen && (
          <div className="absolute right-0 z-10 mt-2 w-44 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
            {["All Types", ...ACCOUNT_TYPES].map((t) => (
              <button
                key={t}
                onClick={() => {
                  onTypeFilterChange(t);
                  setFilterOpen(false);
                }}
                className="block w-full px-4 py-2 text-left text-sm text-slate-600 hover:bg-indigo-50"
              >
                {t}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}