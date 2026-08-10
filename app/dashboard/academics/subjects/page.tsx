"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Search, SlidersHorizontal } from "lucide-react";
import { SubjectForm, SubjectTable, Subject } from "@/components/academics-components/Subjectmanager";
import { FACULTY_OPTIONS } from "@/components/academics-components/Facultymanager";
import Modal from "@/components/dashboard/Modal";
import FilterDropdown from "@/components/dashboard/Filterdropdown";
import PaginationBar from "@/components/dashboard/Pegination";

const INITIAL_DATA: Subject[] = [
  { id: "sub-001", name: "Mathematics", faculty: "Science", code: "MATH101", status: "Active" },
  { id: "sub-002", name: "English Language", faculty: "Arts", code: "ENG101", status: "Active" },
  { id: "sub-003", name: "Accountancy", faculty: "Business", code: "ACC101", status: "Active" },
];

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>(INITIAL_DATA);
  const [search, setSearch] = useState("");
  const [facultyFilter, setFacultyFilter] = useState("All");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Subject | null>(null);

  const filtered = useMemo(() => {
    return subjects.filter((s) => {
      const q = search.toLowerCase();
      const matchesSearch = s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q);
      const matchesFaculty = facultyFilter === "All" || s.faculty === facultyFilter;
      return matchesSearch && matchesFaculty;
    });
  }, [subjects, search, facultyFilter]);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  useEffect(() => setPage(1), [search, facultyFilter, pageSize]);
  useEffect(() => { if (page > totalPages) setPage(totalPages); }, [totalPages, page]);
  const paginated = useMemo(() => filtered.slice((page - 1) * pageSize, page * pageSize), [filtered, page, pageSize]);

  const openAdd = () => { setEditing(null); setFormOpen(true); };
  const openEdit = (s: Subject) => { setEditing(s); setFormOpen(true); };
  const closeForm = () => { setFormOpen(false); setEditing(null); };
  const handleSubmit = (data: Omit<Subject, "id">) => {
    if (editing) {
      setSubjects((prev) => prev.map((s) => (s.id === editing.id ? { ...data, id: editing.id } : s)));
    } else {
      setSubjects((prev) => [{ ...data, id: crypto.randomUUID() }, ...prev]);
    }
    closeForm();
  };
  const handleDelete = (id: string) => setSubjects((prev) => prev.filter((s) => s.id !== id));

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Subjects</h1>
          <p className="text-sm text-slate-500 mt-1">Manage the subjects taught across faculties.</p>
        </div>
        <button type="button" onClick={openAdd} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors shrink-0">
          <Plus className="w-4 h-4" />
          Add Subject
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or code..." className="w-full pl-11 pr-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
        </div>
        <FilterDropdown label="Faculty" icon={SlidersHorizontal} value={facultyFilter} options={FACULTY_OPTIONS} allLabel="All Faculties" onChange={setFacultyFilter} />
      </div>

      <SubjectTable subjects={paginated} onEdit={openEdit} onDelete={handleDelete} />

      <PaginationBar page={page} totalPages={totalPages} pageSize={pageSize} totalCount={filtered.length} itemLabel="subjects" onPageChange={setPage} onPageSizeChange={setPageSize} />

      <Modal open={formOpen} onClose={closeForm} title={editing ? "Edit Subject" : "Add Subject"}>
        <SubjectForm initialValue={editing} onSubmit={handleSubmit} onCancel={closeForm} />
      </Modal>
    </div>
  );
}