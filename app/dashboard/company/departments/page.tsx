"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Search, SlidersHorizontal } from "lucide-react";
import DepartmentTable, { Department } from "@/components/company-components/Departmenttable";
import DepartmentForm from "@/components/company-components/Departmentform";
import Modal from "@/components/dashboard/Modal";
import PaginationBar from "@/components/company-components/Pagination";
import FilterDropdown from "@/components/dashboard/Filterdropdown";

const STATUS_OPTIONS = ["Active", "Inactive"];

const INITIAL_DATA: Department[] = [
  { id: "dep-001", name: "Collections", code: "COL", description: "Loan recovery and collections management", status: "Active" },
  { id: "dep-002", name: "Credit", code: "CRD", description: "Loan origination, underwriting and risk assessment", status: "Active" },
  { id: "dep-003", name: "Customer Service", code: "CS", description: "Resolving customers and front-office issues", status: "Active" },
  { id: "dep-004", name: "Finance", code: "FIN", description: "Accounting, budgeting and financial reporting", status: "Active" },
  { id: "dep-005", name: "Human Resources", code: "HR", description: "Employee management and welfare", status: "Active" },
  { id: "dep-006", name: "Information Technology", code: "IT", description: "Technology infrastructure and systems", status: "Active" },
  { id: "dep-007", name: "Operations", code: "OPS", description: "Day-to-day business operations", status: "Active" },
];

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>(INITIAL_DATA);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);

  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewingDept, setViewingDept] = useState<Department | null>(null);

  const filtered = useMemo(() => {
    return departments.filter((d) => {
      const q = search.toLowerCase();
      const matchesSearch = d.name.toLowerCase().includes(q) || d.code.toLowerCase().includes(q);
      const matchesStatus = statusFilter === "All" || d.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [departments, search, statusFilter]);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

  useEffect(() => setPage(1), [search, statusFilter, pageSize]);
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [totalPages, page]);

  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  const openAdd = () => {
    setEditingDept(null);
    setFormModalOpen(true);
  };
  const openEdit = (dept: Department) => {
    setEditingDept(dept);
    setFormModalOpen(true);
  };
  const closeForm = () => {
    setFormModalOpen(false);
    setEditingDept(null);
  };
  const handleSubmit = (data: Omit<Department, "id">) => {
    if (editingDept) {
      setDepartments((prev) => prev.map((d) => (d.id === editingDept.id ? { ...data, id: editingDept.id } : d)));
    } else {
      setDepartments((prev) => [{ ...data, id: crypto.randomUUID() }, ...prev]);
    }
    closeForm();
  };

  const openView = (dept: Department) => {
    setViewingDept(dept);
    setViewModalOpen(true);
  };
  const closeView = () => {
    setViewModalOpen(false);
    setViewingDept(null);
  };

  const handleDelete = (id: string) => {
    setDepartments((prev) => prev.filter((d) => d.id !== id));
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Departments</h1>
          <p className="text-sm text-slate-500 mt-1">Manage your organisation&apos;s departments.</p>
        </div>
        <button
          type="button"
          onClick={openAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-sky-600 text-white text-sm font-medium hover:bg-sky-700 transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          Add Department
        </button>
      </div>

      {/* Search + filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or code..."
            className="w-full pl-11 pr-4 py-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
        <FilterDropdown
          label="Status"
          icon={SlidersHorizontal}
          value={statusFilter}
          options={STATUS_OPTIONS}
          allLabel="Filters"
          onChange={setStatusFilter}
        />
      </div>

      {/* Table */}
      <DepartmentTable departments={paginated} onView={openView} onEdit={openEdit} onDelete={handleDelete} />

      {/* Pagination */}
      <PaginationBar
        page={page}
        totalPages={totalPages}
        pageSize={pageSize}
        totalCount={filtered.length}
        itemLabel="departments"
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
      />

      {/* Add / Edit modal */}
      <Modal open={formModalOpen} onClose={closeForm} title={editingDept ? "Edit Department" : "Add Department"}>
        <DepartmentForm initialValue={editingDept} onSubmit={handleSubmit} onCancel={closeForm} />
      </Modal>

      {/* View modal */}
      <Modal open={viewModalOpen} onClose={closeView} title="Department Details">
        {viewingDept && (
          <div className="flex flex-col gap-4">
            <div>
              <p className="text-xs text-slate-400">Department Name</p>
              <p className="text-sm font-semibold text-slate-800">{viewingDept.name}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Code</p>
              <p className="text-sm font-semibold text-slate-800">{viewingDept.code}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Description</p>
              <p className="text-sm text-slate-700">{viewingDept.description || "\u2014"}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Status</p>
              <p className="text-sm font-semibold text-slate-800">{viewingDept.status}</p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}