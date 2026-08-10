"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Search, SlidersHorizontal } from "lucide-react";
import { ClassForm, ClassTable, SchoolClass } from "@/components/academics-components/Classmanager";
import Modal from "@/components/dashboard/Modal";
import FilterDropdown from "@/components/dashboard/Filterdropdown";
import PaginationBar from "@/components/dashboard/Pegination";

const STATUS_OPTIONS = ["Active", "Inactive"];

const INITIAL_DATA: SchoolClass[] = [
  { id: "cls-001", name: "Form 1 Red", code: "F1R", location: "Block A, Room 1", size: 42, status: "Active" },
  { id: "cls-002", name: "Form 2 Blue", code: "F2B", location: "Block A, Room 2", size: 38, status: "Active" },
  { id: "cls-003", name: "Form 3 Green", code: "F3G", location: "Block B, Room 1", size: 40, status: "Active" },
];

export default function ClassesPage() {
  const [classes, setClasses] = useState<SchoolClass[]>(INITIAL_DATA);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<SchoolClass | null>(null);

  const filtered = useMemo(() => {
    return classes.filter((c) => {
      const q = search.toLowerCase();
      const matchesSearch = c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q);
      const matchesStatus = statusFilter === "All" || c.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [classes, search, statusFilter]);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  useEffect(() => setPage(1), [search, statusFilter, pageSize]);
  useEffect(() => { if (page > totalPages) setPage(totalPages); }, [totalPages, page]);
  const paginated = useMemo(() => filtered.slice((page - 1) * pageSize, page * pageSize), [filtered, page, pageSize]);

  const openAdd = () => { setEditing(null); setFormOpen(true); };
  const openEdit = (c: SchoolClass) => { setEditing(c); setFormOpen(true); };
  const closeForm = () => { setFormOpen(false); setEditing(null); };
  const handleSubmit = (data: Omit<SchoolClass, "id">) => {
    if (editing) {
      setClasses((prev) => prev.map((c) => (c.id === editing.id ? { ...data, id: editing.id } : c)));
    } else {
      setClasses((prev) => [{ ...data, id: crypto.randomUUID() }, ...prev]);
    }
    closeForm();
  };
  const handleDelete = (id: string) => setClasses((prev) => prev.filter((c) => c.id !== id));

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Classes</h1>
          <p className="text-sm text-slate-500 mt-1">Manage classes, locations, and capacity.</p>
        </div>
        <button type="button" onClick={openAdd} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors shrink-0">
          <Plus className="w-4 h-4" />
          Add Class
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or code..." className="w-full pl-11 pr-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
        </div>
        <FilterDropdown label="Status" icon={SlidersHorizontal} value={statusFilter} options={STATUS_OPTIONS} allLabel="Filters" onChange={setStatusFilter} />
      </div>

      <ClassTable classes={paginated} onEdit={openEdit} onDelete={handleDelete} />

      <PaginationBar page={page} totalPages={totalPages} pageSize={pageSize} totalCount={filtered.length} itemLabel="classes" onPageChange={setPage} onPageSizeChange={setPageSize} />

      <Modal open={formOpen} onClose={closeForm} title={editing ? "Edit Class" : "Add Class"}>
        <ClassForm initialValue={editing} onSubmit={handleSubmit} onCancel={closeForm} />
      </Modal>
    </div>
  );
}