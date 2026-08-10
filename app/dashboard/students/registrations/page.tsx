"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Plus, Search, SlidersHorizontal, Upload, Download } from "lucide-react";
import StudentTable from "@/components/students-components/Studenttable";
import AdmissionWizard from "@/components/students-components/Admissionwizard";
import StudentEditForm from "@/components/students-components/Studenteditform";
import Modal from "@/components/dashboard/Modal";
import FilterDropdown from "@/components/dashboard/Filterdropdown";
import PaginationBar from "@/components/dashboard/Pegination";
import { INITIAL_STUDENTS, FACULTY_OPTIONS, Student } from "@/components/students-components/Studentdata";
import { PENDING_STUDENT_IMPORT_KEY, REQUIRED_FIELDS } from "@/components/students-components/Studentimporttemplate";

export default function StudentAdmissionPage() {
  const [students, setStudents] = useState<Student[]>(INITIAL_STUDENTS);
  const [search, setSearch] = useState("");
  const [facultyFilter, setFacultyFilter] = useState("All");

  const [wizardOpen, setWizardOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<Student | null>(null);

  useEffect(() => {
    const pending = sessionStorage.getItem(PENDING_STUDENT_IMPORT_KEY);
    if (pending) {
      try {
        const parsed: Omit<Student, "id">[] = JSON.parse(pending);
        setStudents((prev) => [...parsed.map((p) => ({ ...p, id: crypto.randomUUID() })), ...prev]);
      } catch {
        // ignore malformed data
      } finally {
        sessionStorage.removeItem(PENDING_STUDENT_IMPORT_KEY);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    return students.filter((s) => {
      const q = search.toLowerCase();
      const fullName = `${s.firstName} ${s.middleName} ${s.lastName}`.toLowerCase();
      const matchesSearch = fullName.includes(q) || s.studentId.toLowerCase().includes(q);
      const matchesFaculty = facultyFilter === "All" || s.faculty === facultyFilter;
      return matchesSearch && matchesFaculty;
    });
  }, [students, search, facultyFilter]);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  useEffect(() => setPage(1), [search, facultyFilter, pageSize]);
  useEffect(() => { if (page > totalPages) setPage(totalPages); }, [totalPages, page]);
  const paginated = useMemo(() => filtered.slice((page - 1) * pageSize, page * pageSize), [filtered, page, pageSize]);

  const handleAdmit = (data: Omit<Student, "id">) => {
    setStudents((prev) => [{ ...data, id: crypto.randomUUID() }, ...prev]);
    setWizardOpen(false);
  };

  const openEdit = (s: Student) => { setEditing(s); setEditOpen(true); };
  const closeEdit = () => { setEditOpen(false); setEditing(null); };
  const handleEditSubmit = (data: Student) => {
    setStudents((prev) => prev.map((s) => (s.id === data.id ? data : s)));
    closeEdit();
  };

  const handleDelete = (id: string) => setStudents((prev) => prev.filter((s) => s.id !== id));

  const handleExport = () => {
    const headers = REQUIRED_FIELDS.map((f) => f.key);
    const escapeCsv = (v: string | number) => {
      const str = String(v ?? "");
      return str.includes(",") || str.includes('"') ? `"${str.replace(/"/g, '""')}"` : str;
    };
    const rows = [
      headers.join(","),
      ...filtered.map((s) => headers.map((h) => escapeCsv((s as unknown as Record<string, string | number>)[h])).join(",")),
    ];
    const blob = new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `students-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Student Admission</h1>
          <p className="text-sm text-slate-500 mt-1">Register new students and manage existing records.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Link
            href="/dashboard/students/import"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-300 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <Upload className="w-4 h-4" />
            Import
          </Link>
          <button
            type="button"
            onClick={handleExport}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-300 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
          <button type="button" onClick={() => setWizardOpen(true)} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors shrink-0">
            <Plus className="w-4 h-4" />
            New Admission
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or student ID..."
            className="w-full pl-11 pr-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
        <FilterDropdown label="Faculty" icon={SlidersHorizontal} value={facultyFilter} options={FACULTY_OPTIONS} allLabel="All Faculties" onChange={setFacultyFilter} />
      </div>

      <StudentTable students={paginated} onEdit={openEdit} onDelete={handleDelete} />

      <PaginationBar page={page} totalPages={totalPages} pageSize={pageSize} totalCount={filtered.length} itemLabel="students" onPageChange={setPage} onPageSizeChange={setPageSize} />

      {/* New Admission wizard */}
      <Modal open={wizardOpen} onClose={() => setWizardOpen(false)} title="New Student Admission">
        <AdmissionWizard onComplete={handleAdmit} onCancel={() => setWizardOpen(false)} />
      </Modal>

      {/* Edit modal */}
      <Modal open={editOpen} onClose={closeEdit} title="Edit Student">
        {editing && <StudentEditForm student={editing} onSubmit={handleEditSubmit} onCancel={closeEdit} />}
      </Modal>
    </div>
  );
}
