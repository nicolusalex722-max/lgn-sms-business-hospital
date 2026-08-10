"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Plus, Search, SlidersHorizontal } from "lucide-react";
import { JournalEntryTable, JournalEntry } from "@/components/accounting-components/Journalentrymanager";
import { INITIAL_ENTRIES, PENDING_ENTRY_KEY } from "@/components/accounting-components/Journalentrydata";
import FilterDropdown from "@/components/dashboard/Filterdropdown";
import PaginationBar from "@/components/dashboard/Pegination";

const STATUS_OPTIONS = ["Posted", "Draft"];

export default function EntriesPage() {
  const [entries, setEntries] = useState<JournalEntry[]>(INITIAL_ENTRIES);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // Pick up a create/update from the New/Edit journal entry pages
  useEffect(() => {
    const pending = sessionStorage.getItem(PENDING_ENTRY_KEY);
    if (pending) {
      try {
        const { type, entry }: { type: "create" | "update"; entry: JournalEntry } = JSON.parse(pending);
        setEntries((prev) => {
          if (type === "update") {
            return prev.map((e) => (e.id === entry.id ? entry : e));
          }
          return [entry, ...prev];
        });
      } catch {
        // ignore malformed data
      } finally {
        sessionStorage.removeItem(PENDING_ENTRY_KEY);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    return entries
      .filter((e) => {
        const q = search.toLowerCase();
        const matchesSearch = e.reference.toLowerCase().includes(q) || e.description.toLowerCase().includes(q);
        const matchesStatus = statusFilter === "All" || (statusFilter === "Posted" ? e.posted : !e.posted);
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => (a.date < b.date ? 1 : -1));
  }, [entries, search, statusFilter]);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  useEffect(() => setPage(1), [search, statusFilter, pageSize]);
  useEffect(() => { if (page > totalPages) setPage(totalPages); }, [totalPages, page]);
  const paginated = useMemo(() => filtered.slice((page - 1) * pageSize, page * pageSize), [filtered, page, pageSize]);

  const handleDelete = (id: string) => setEntries((prev) => prev.filter((e) => e.id !== id));

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Entries</h1>
          <p className="text-sm text-slate-500 mt-1">Journal entries recorded in the general ledger.</p>
        </div>
        <Link
          href="/dashboard/accounting/entries/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          New Journal Entry
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by reference or description..."
            className="w-full pl-11 pr-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
        <FilterDropdown label="Status" icon={SlidersHorizontal} value={statusFilter} options={STATUS_OPTIONS} allLabel="All Statuses" onChange={setStatusFilter} />
      </div>

      <JournalEntryTable entries={paginated} onDelete={handleDelete} />

      <PaginationBar page={page} totalPages={totalPages} pageSize={pageSize} totalCount={filtered.length} itemLabel="entries" onPageChange={setPage} onPageSizeChange={setPageSize} />
    </div>
  );
}