"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Search, SlidersHorizontal } from "lucide-react";
import { FacultyForm, FacultyTable, Faculty } from "@/components/academics-components/Facultymanager";
import Modal from "@/components/dashboard/Modal";
import FilterDropdown from "@/components/dashboard/Filterdropdown";
import PaginationBar from "@/components/dashboard/Pegination";

const STATUS_OPTIONS = ["Active", "Inactive"];

const INITIAL_DATA: Faculty[] = [
  { id: "fac-001", name: "Science", code: "SCI", status: "Active" },
  { id: "fac-002", name: "Arts", code: "ART", status: "Active" },
  { id: "fac-003", name: "Business", code: "BUS", status: "Active" },
];

export default function FacultiesPage() {
  const [faculties, setFaculties] = useState<Faculty[]>(INITIAL_DATA);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Faculty | null>(null);

  const filtered = useMemo(() => {
    return faculties.filter((f) => {
      const q = search.toLowerCase();
      const matchesSearch = f.name.toLowerCase().includes(q) || f.code.toLowerCase().includes(q);
      const matchesStatus = statusFilter === "All" || f.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [faculties, search, statusFilter]);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  useEffect(() => setPage(1), [search, statusFilter, pageSize]);
  useEffect(() => { if (page > totalPages) setPage(totalPages); }, [totalPages, page]);
  const paginated = useMemo(() => filtered.slice((page - 1) * pageSize, page * pageSize), [filtered, page, pageSize]);

  const openAdd = () => { setEditing(null); setFormOpen(true); };
  const openEdit = (f: Faculty) => { setEditing(f); setFormOpen(true); };
  const closeForm = () => { setFormOpen(false); setEditing(null); };
  const handleSubmit = (data: Omit<Faculty, "id">) => {
    if (editing) {
      setFaculties((prev) => prev.map((f) => (f.id === editing.id ? { ...data, id: editing.id } : f)));
    } else {
      setFaculties((prev) => [{ ...data, id: crypto.randomUUID() }, ...prev]);
    }
    closeForm();
  };
  const handleDelete = (id: string) => setFaculties((prev) => prev.filter((f) => f.id !== id));

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Faculties</h1>
          <p className="text-sm text-slate-500 mt-1">Manage your school&apos;s faculties.</p>
        </div>
        <button type="button" onClick={openAdd} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors shrink-0">
          <Plus className="w-4 h-4" />
          Add Faculty
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or code..." className="w-full pl-11 pr-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
        </div>
        <FilterDropdown label="Status" icon={SlidersHorizontal} value={statusFilter} options={STATUS_OPTIONS} allLabel="Filters" onChange={setStatusFilter} />
      </div>

      <FacultyTable faculties={paginated} onEdit={openEdit} onDelete={handleDelete} />

      <PaginationBar page={page} totalPages={totalPages} pageSize={pageSize} totalCount={filtered.length} itemLabel="faculties" onPageChange={setPage} onPageSizeChange={setPageSize} />

      <Modal open={formOpen} onClose={closeForm} title={editing ? "Edit Faculty" : "Add Faculty"}>
        <FacultyForm initialValue={editing} onSubmit={handleSubmit} onCancel={closeForm} />
      </Modal>
    </div>
  );
}