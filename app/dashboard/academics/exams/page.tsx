"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Search, SlidersHorizontal } from "lucide-react";
import { ExamForm, ExamTable, Exam } from "@/components/academics-components/Exammanager";
import Modal from "@/components/dashboard/Modal";
import FilterDropdown from "@/components/dashboard/Filterdropdown";
import PaginationBar from "@/components/dashboard/Pegination";

const STATUS_OPTIONS = ["Scheduled", "Completed", "Cancelled"];

const INITIAL_DATA: Exam[] = [
  { id: "exm-001", name: "Mid-Term Examination", subject: "Mathematics", className: "Form 3 Green", examDate: "2026-08-20", status: "Scheduled" },
  { id: "exm-002", name: "End of Term Test", subject: "English", className: "Form 2 Blue", examDate: "2026-07-15", status: "Completed" },
];

export default function ExamsPage() {
  const [exams, setExams] = useState<Exam[]>(INITIAL_DATA);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Exam | null>(null);

  const filtered = useMemo(() => {
    return exams.filter((ex) => {
      const q = search.toLowerCase();
      const matchesSearch = ex.name.toLowerCase().includes(q) || ex.subject.toLowerCase().includes(q);
      const matchesStatus = statusFilter === "All" || ex.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [exams, search, statusFilter]);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  useEffect(() => setPage(1), [search, statusFilter, pageSize]);
  useEffect(() => { if (page > totalPages) setPage(totalPages); }, [totalPages, page]);
  const paginated = useMemo(() => filtered.slice((page - 1) * pageSize, page * pageSize), [filtered, page, pageSize]);

  const openAdd = () => { setEditing(null); setFormOpen(true); };
  const openEdit = (ex: Exam) => { setEditing(ex); setFormOpen(true); };
  const closeForm = () => { setFormOpen(false); setEditing(null); };
  const handleSubmit = (data: Omit<Exam, "id">) => {
    if (editing) {
      setExams((prev) => prev.map((ex) => (ex.id === editing.id ? { ...data, id: editing.id } : ex)));
    } else {
      setExams((prev) => [{ ...data, id: crypto.randomUUID() }, ...prev]);
    }
    closeForm();
  };
  const handleDelete = (id: string) => setExams((prev) => prev.filter((ex) => ex.id !== id));

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Exams</h1>
          <p className="text-sm text-slate-500 mt-1">Schedule and track examinations.</p>
        </div>
        <button type="button" onClick={openAdd} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors shrink-0">
          <Plus className="w-4 h-4" />
          Add Exam
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by exam or subject..." className="w-full pl-11 pr-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
        </div>
        <FilterDropdown label="Status" icon={SlidersHorizontal} value={statusFilter} options={STATUS_OPTIONS} allLabel="All Statuses" onChange={setStatusFilter} />
      </div>

      <ExamTable exams={paginated} onEdit={openEdit} onDelete={handleDelete} />

      <PaginationBar page={page} totalPages={totalPages} pageSize={pageSize} totalCount={filtered.length} itemLabel="exams" onPageChange={setPage} onPageSizeChange={setPageSize} />

      <Modal open={formOpen} onClose={closeForm} title={editing ? "Edit Exam" : "Add Exam"}>
        <ExamForm initialValue={editing} onSubmit={handleSubmit} onCancel={closeForm} />
      </Modal>
    </div>
  );
}