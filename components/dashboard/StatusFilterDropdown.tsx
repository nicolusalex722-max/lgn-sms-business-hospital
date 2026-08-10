"use client";

import { useEffect, useRef, useState } from "react";
import { Filter, ChevronDown, Check } from "lucide-react";

const STATUS_FILTERS = ["All", "Active", "Trial", "Expired", "Cancelled"];

interface StatusFilterDropdownProps {
  value: string;
  onChange: (value: string) => void;
}

export default function StatusFilterDropdown({
  value,
  onChange,
}: StatusFilterDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 pl-3.5 pr-3 py-2.5 rounded-lg border border-slate-300 text-sm bg-white hover:bg-slate-50 transition-colors min-w-[160px]"
      >
        <Filter className="w-4 h-4 text-slate-400 shrink-0" />
        <span className="flex-1 text-left text-slate-700">
          {value === "All" ? "All Statuses" : value}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute right-0 sm:left-0 top-full mt-2 w-48 bg-white rounded-lg border border-slate-200 shadow-lg z-30 py-1">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => {
                onChange(s);
                setOpen(false);
              }}
              className="w-full flex items-center justify-between px-3.5 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <span>{s === "All" ? "All Statuses" : s}</span>
              {value === s && <Check className="w-4 h-4 text-indigo-600" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
