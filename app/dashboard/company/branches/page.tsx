"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Search, SlidersHorizontal } from "lucide-react";
import BranchTable, { Branch } from "@/components/company-components/Branchtable";
import BranchForm from "@/components/company-components/Branchform";
import Modal from "@/components/dashboard/Modal";
import PaginationBar from "@/components/company-components/Pagination";
import FilterDropdown from "@/components/dashboard/Filterdropdown";

const STATUS_OPTIONS = ["Active", "Inactive"];

const INITIAL_DATA: Branch[] = [
  { id: "br-001", name: "Head Office", code: "HQ", location: "Kariakoo, Dar es Salaam", status: "Active" },
  { id: "br-002", name: "Mwanza Branch", code: "MWZ", location: "Mwanza City", status: "Active" },
  { id: "br-003", name: "Arusha Branch", code: "ARU", location: "Arusha City", status: "Active" },
];

export default function BranchesPage() {
  const [branches, setBranches] = useState<Branch[]>(INITIAL_DATA);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);

  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewingBranch, setViewingBranch] = useState<Branch | null>(null);

  const filtered = useMemo(() => {
    return branches.filter((b) => {
      const q = search.toLowerCase();
      const matchesSearch = b.name.toLowerCase().includes(q) || b.code.toLowerCase().includes(q);
      const matchesStatus = statusFilter === "All" || b.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [branches, search, statusFilter]);

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
    setEditingBranch(null);
    setFormModalOpen(true);
  };
  const openEdit = (branch: Branch) => {
    setEditingBranch(branch);
    setFormModalOpen(true);
  };
  const closeForm = () => {
    setFormModalOpen(false);
    setEditingBranch(null);
  };
  const handleSubmit = (data: Omit<Branch, "id">) => {
    if (editingBranch) {
      setBranches((prev) => prev.map((b) => (b.id === editingBranch.id ? { ...data, id: editingBranch.id } : b)));
    } else {
      setBranches((prev) => [{ ...data, id: crypto.randomUUID() }, ...prev]);
    }
    closeForm();
  };

  const openView = (branch: Branch) => {
    setViewingBranch(branch);
    setViewModalOpen(true);
  };
  const closeView = () => {
    setViewModalOpen(false);
    setViewingBranch(null);
  };

  const handleDelete = (id: string) => {
    setBranches((prev) => prev.filter((b) => b.id !== id));
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Branches</h1>
          <p className="text-sm text-slate-500 mt-1">Manage your organisation&apos;s branch locations.</p>
        </div>
        <button
          type="button"
          onClick={openAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-sky-600 text-white text-sm font-medium hover:bg-sky-700 transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          Add Branch
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
      <BranchTable branches={paginated} onView={openView} onEdit={openEdit} onDelete={handleDelete} />

      {/* Pagination */}
      <PaginationBar
        page={page}
        totalPages={totalPages}
        pageSize={pageSize}
        totalCount={filtered.length}
        itemLabel="branches"
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
      />

      {/* Add / Edit modal */}
      <Modal open={formModalOpen} onClose={closeForm} title={editingBranch ? "Edit Branch" : "Add Branch"}>
        <BranchForm initialValue={editingBranch} onSubmit={handleSubmit} onCancel={closeForm} />
      </Modal>

      {/* View modal */}
      <Modal open={viewModalOpen} onClose={closeView} title="Branch Details">
        {viewingBranch && (
          <div className="flex flex-col gap-4">
            <div>
              <p className="text-xs text-slate-400">Branch Name</p>
              <p className="text-sm font-semibold text-slate-800">{viewingBranch.name}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Code</p>
              <p className="text-sm font-semibold text-slate-800">{viewingBranch.code}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Location</p>
              <p className="text-sm text-slate-700">{viewingBranch.location || "\u2014"}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Status</p>
              <p className="text-sm font-semibold text-slate-800">{viewingBranch.status}</p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}