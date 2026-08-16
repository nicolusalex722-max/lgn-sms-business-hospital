"use client";

import { useMemo, useState } from "react";
import { Plus, Search, SlidersHorizontal } from "lucide-react";

import DepartmentTable from "@/components/company-components/Departmenttable";
import DepartmentForm from "@/components/company-components/Departmentform";
import PaginationBar from "@/components/company-components/Pagination";
import FilterDropdown from "@/components/dashboard/Filterdropdown";
import Modal from "@/components/dashboard/Modal";
import { useDepartments } from "@/hooks/use-department";
import type { Department } from "@/lib/types";
import type { DepartmentCreateInput, DepartmentUpdateInput } from "@/lib/validations/department-schema";

const STATUS_OPTIONS = ["Active", "Inactive"];

export default function DepartmentsPage() {
  const { departments, loading, error, fetchDepartments, createDepartment, updateDepartment, deleteDepartment } = useDepartments();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [viewingDept, setViewingDept] = useState<Department | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return departments.filter((department) => {
      const matchesSearch = !query || department.departmentName.toLowerCase().includes(query) || department.departmentCode.toLowerCase().includes(query);
      return matchesSearch && (statusFilter === "All" || department.status === statusFilter);
    });
  }, [departments, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginated = useMemo(() => filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize), [currentPage, filtered, pageSize]);

  const closeForm = () => {
    if (submitting) return;
    setFormModalOpen(false);
    setEditingDept(null);
  };

  const handleSubmit = async (data: DepartmentCreateInput | DepartmentUpdateInput) => {
    setSubmitting(true);
    const result = editingDept
      ? await updateDepartment(editingDept.id, data as DepartmentUpdateInput)
      : await createDepartment(data as DepartmentCreateInput);
    setSubmitting(false);

    if (result.success) {
      setFormModalOpen(false);
      setEditingDept(null);
    }
  };

  const handleDelete = async (department: Department) => {
    if (!window.confirm(`Delete ${department.departmentName}? This cannot be undone.`)) return;
    await deleteDepartment(department.id);
  };

  if (loading) return <p className="py-10 text-center text-sm text-slate-500">Loading departments…</p>;

  if (!departments.length && error) {
    return <div className="py-10 text-center"><p className="text-sm text-rose-600">{error}</p><button type="button" onClick={() => void fetchDepartments()} className="mt-4 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Try again</button></div>;
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div><h1 className="text-2xl font-bold text-slate-800">Departments</h1><p className="mt-1 text-sm text-slate-500">Manage your organisation&apos;s departments.</p></div>
        <button type="button" onClick={() => { setEditingDept(null); setFormModalOpen(true); }} className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-sky-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-sky-700"><Plus className="h-4 w-4" />Add Department</button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1"><Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input type="text" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Search by name or code..." className="w-full rounded-lg border border-slate-200 py-3 pl-11 pr-4 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500" /></div>
        <FilterDropdown label="Status" icon={SlidersHorizontal} value={statusFilter} options={STATUS_OPTIONS} allLabel="Filters" onChange={(value) => { setStatusFilter(value); setPage(1); }} />
      </div>

      {error && <p className="text-sm text-rose-600">{error}</p>}
      <DepartmentTable departments={paginated} onView={setViewingDept} onEdit={(department) => { setEditingDept(department); setFormModalOpen(true); }} onDelete={handleDelete} />
      <PaginationBar page={currentPage} totalPages={totalPages} pageSize={pageSize} totalCount={filtered.length} itemLabel="departments" onPageChange={setPage} onPageSizeChange={(size) => { setPageSize(size); setPage(1); }} />

      <Modal open={formModalOpen} onClose={closeForm} title={editingDept ? "Edit Department" : "Add Department"}><DepartmentForm initialValue={editingDept} submitting={submitting} error={error} onSubmit={handleSubmit} onCancel={closeForm} /></Modal>
      <Modal open={Boolean(viewingDept)} onClose={() => setViewingDept(null)} title="Department Details">
        {viewingDept && <div className="flex flex-col gap-4"><Detail label="Department name" value={viewingDept.departmentName} /><Detail label="Code" value={viewingDept.departmentCode} mono /><Detail label="Description" value={viewingDept.description} /><Detail label="Status" value={viewingDept.status} /></div>}
      </Modal>
    </div>
  );
}

function Detail({ label, value, mono = false }: { label: string; value: string | null; mono?: boolean }) {
  return <div><p className="text-xs text-slate-400">{label}</p><p className={`text-sm text-slate-800 ${mono ? "font-mono" : "font-semibold"}`}>{value || "—"}</p></div>;
}
