"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { PARTIES } from "@/lib/data";
import type { Party } from "@/lib/types";

export default function PartySearchSelect({
  value,
  onSelect,
}: {
  value: Party | null;
  onSelect: (party: Party) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return PARTIES;
    return PARTIES.filter((p) => p.name.toLowerCase().includes(q) || p.type.toLowerCase().includes(q));
  }, [query]);

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-left text-[15px] text-slate-800 shadow-sm transition hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500"
      >
        <span className={value ? "text-slate-800" : "text-slate-400"}>
          {value ? `${value.name} · ${value.type}` : "Search student or supplier..."}
        </span>
        <svg
          className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`}
          viewBox="0 0 20 20"
          fill="none"
        >
          <path d="M6 8l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div className="absolute z-20 mt-1.5 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
          <div className="flex items-center gap-2 border-b border-slate-100 px-3 py-2.5">
            <svg className="h-4 w-4 text-slate-400" viewBox="0 0 20 20" fill="none">
              <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.6" />
              <path d="M14 14l4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name..."
              className="w-full text-[15px] text-slate-700 placeholder:text-slate-400 focus:outline-none"
            />
          </div>

          <div className="max-h-64 overflow-y-auto py-1">
            {filtered.length === 0 && (
              <p className="px-4 py-3 text-sm text-slate-400">No matches for &ldquo;{query}&rdquo;</p>
            )}
            {filtered.map((p) => {
              const isSelected = value?.id === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    onSelect(p);
                    setOpen(false);
                    setQuery("");
                  }}
                  className={`flex w-full items-center justify-between px-4 py-2.5 text-left text-[15px] transition ${
                    isSelected ? "bg-indigo-500 text-white" : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {p.name}
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        isSelected ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {p.type}
                    </span>
                  </span>
                  <span className={`font-mono text-xs ${isSelected ? "text-white" : "text-slate-400"}`}>
                    {p.balance.toLocaleString()}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}