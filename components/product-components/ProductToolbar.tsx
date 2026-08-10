"use client";

import { Search } from "lucide-react";
import { Tags } from "lucide-react";
import FilterDropdown from "./ProductFilter";

interface ProductToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  typeFilter: string;
  onTypeFilterChange: (value: string) => void;
}

const TYPE_OPTIONS = ["Business", "Education", "Hospital"];

export default function ProductToolbar({
  search,
  onSearchChange,
  typeFilter,
  onTypeFilterChange,
}: ProductToolbarProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search products..."
          className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
      </div>

      <FilterDropdown
        label="Type"
        icon={Tags}
        value={typeFilter}
        options={TYPE_OPTIONS}
        allLabel="All Types"
        onChange={onTypeFilterChange}
      />
    </div>
  );
}