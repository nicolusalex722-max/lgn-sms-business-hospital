"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Search, SlidersHorizontal } from "lucide-react";
import { AccountGroupForm, AccountGroupTable, AccountGroup, ACCOUNT_TYPE_OPTIONS } from "@/components/accounting-components/Accountgroupmanager";
import Modal from "@/components/dashboard/Modal";
import FilterDropdown from "@/components/dashboard/Filterdropdown";
import PaginationBar from "@/components/dashboard/Pegination";

const INITIAL_DATA: AccountGroup[] = [
  { id: "ag-001", name: "Assets", type: "Debit", description: "Resources owned by the business" },
  { id: "ag-002", name: "Liability", type: "Credit", description: "Obligations owed to others" },
  { id: "ag-003", name: "Revenue", type: "Credit", description: "Income earned from operations" },
];

export default function AccountGroupPage() {
  const [groups, setGroups] = useState<AccountGroup[]>(INITIAL_DATA);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<AccountGroup | null>(null);

  const filtered = useMemo(() => {
    return groups.filter((g) => {
      const matchesSearch = g.name.toLowerCase().includes(search.toLowerCase());
      const matchesType = typeFilter === "All" || g.type === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [groups, search, typeFilter]);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  useEffect(() => setPage(1), [search, typeFilter, pageSize]);
  useEffect(() => { if (page > totalPages) setPage(totalPages); }, [totalPages, page]);
  const paginated = useMemo(() => filtered.slice((page - 1) * pageSize, page * pageSize), [filtered, page, pageSize]);

  const openAdd = () => { setEditing(null); setFormOpen(true); };
  const openEdit = (g: AccountGroup) => { setEditing(g); setFormOpen(true); };
  const closeForm = () => { setFormOpen(false); setEditing(null); };
  const handleSubmit = (data: Omit<AccountGroup, "id">) => {
    if (editing) {
      setGroups((prev) => prev.map((g) => (g.id === editing.id ? { ...data, id: editing.id } : g)));
    } else {
      setGroups((prev) => [{ ...data, id: crypto.randomUUID() }, ...prev]);
    }
    closeForm();
  };
  const handleDelete = (id: string) => setGroups((prev) => prev.filter((g) => g.id !== id));

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Account Group</h1>
          <p className="text-sm text-slate-500 mt-1">Classify accounts into Assets, Capital, Liability, Revenue, or Expenses.</p>
        </div>
        <button type="button" onClick={openAdd} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors shrink-0">
          <Plus className="w-4 h-4" />
          Add Account Group
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search account groups..." className="w-full pl-11 pr-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
        </div>
        <FilterDropdown label="Type" icon={SlidersHorizontal} value={typeFilter} options={ACCOUNT_TYPE_OPTIONS} allLabel="All Types" onChange={setTypeFilter} />
      </div>

      <AccountGroupTable groups={paginated} onEdit={openEdit} onDelete={handleDelete} />

      <PaginationBar page={page} totalPages={totalPages} pageSize={pageSize} totalCount={filtered.length} itemLabel="account groups" onPageChange={setPage} onPageSizeChange={setPageSize} />

      <Modal open={formOpen} onClose={closeForm} title={editing ? "Edit Account Group" : "Add Account Group"}>
        <AccountGroupForm initialValue={editing} existingNames={groups.map((g) => g.name)} onSubmit={handleSubmit} onCancel={closeForm} />
      </Modal>
    </div>
  );
}