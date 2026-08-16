"use client";

import { useMemo, useState } from "react";
import { Plus, Search, SlidersHorizontal } from "lucide-react";

import BranchForm from "@/components/company-components/Branchform";
import BranchTable from "@/components/company-components/Branchtable";
import PaginationBar from "@/components/company-components/Pagination";
import FilterDropdown from "@/components/dashboard/Filterdropdown";
import Modal from "@/components/dashboard/Modal";
import { useBranches } from "@/hooks/use-branches";
import type { Branch } from "@/lib/types";
import type { BranchCreateInput, BranchUpdateInput } from "@/lib/validations/branches-schema";

const STATUS_OPTIONS = ["Active", "Inactive"];

export default function BranchesPage() {
  const { branches, loading, error, fetchBranches, createBranch, updateBranch, deleteBranch } = useBranches();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [viewingBranch, setViewingBranch] = useState<Branch | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return branches.filter((branch) => {
      const matchesSearch = !query || branch.branchName.toLowerCase().includes(query) || branch.branchCode.toLowerCase().includes(query) || branch.location?.toLowerCase().includes(query);
      return matchesSearch && (statusFilter === "All" || branch.status === statusFilter);
    });
  }, [branches, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginated = useMemo(() => filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize), [currentPage, filtered, pageSize]);

  const closeForm = () => {
    if (submitting) return;
    setFormModalOpen(false);
    setEditingBranch(null);
  };

  const handleSubmit = async (data: BranchCreateInput | BranchUpdateInput) => {
    setSubmitting(true);
    const result = editingBranch
      ? await updateBranch(editingBranch.id, data as BranchUpdateInput)
      : await createBranch(data as BranchCreateInput);
    setSubmitting(false);

    if (result.success) {
      setFormModalOpen(false);
      setEditingBranch(null);
    }
  };

  const handleDelete = async (branch: Branch) => {
    if (!window.confirm(`Delete ${branch.branchName}? This cannot be undone.`)) return;
    await deleteBranch(branch.id);
  };

  if (loading) return <p className="py-10 text-center text-sm text-slate-500">Loading branches…</p>;

  if (!branches.length && error) {
    return <div className="py-10 text-center"><p className="text-sm text-rose-600">{error}</p><button type="button" onClick={() => void fetchBranches()} className="mt-4 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Try again</button></div>;
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><h1 className="text-2xl font-bold text-slate-800">Branches</h1><p className="mt-1 text-sm text-slate-500">Manage your organisation&apos;s branch locations.</p></div><button type="button" onClick={() => { setEditingBranch(null); setFormModalOpen(true); }} className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-sky-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-sky-700"><Plus className="h-4 w-4" />Add Branch</button></div>
      <div className="flex flex-col gap-3 sm:flex-row"><div className="relative flex-1"><Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input type="text" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Search by name, code, or location..." className="w-full rounded-lg border border-slate-200 py-3 pl-11 pr-4 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500" /></div><FilterDropdown label="Status" icon={SlidersHorizontal} value={statusFilter} options={STATUS_OPTIONS} allLabel="Filters" onChange={(value) => { setStatusFilter(value); setPage(1); }} /></div>
      {error && <p className="text-sm text-rose-600">{error}</p>}
      <BranchTable branches={paginated} onView={setViewingBranch} onEdit={(branch) => { setEditingBranch(branch); setFormModalOpen(true); }} onDelete={handleDelete} />
      <PaginationBar page={currentPage} totalPages={totalPages} pageSize={pageSize} totalCount={filtered.length} itemLabel="branches" onPageChange={setPage} onPageSizeChange={(size) => { setPageSize(size); setPage(1); }} />
      <Modal open={formModalOpen} onClose={closeForm} title={editingBranch ? "Edit Branch" : "Add Branch"}><BranchForm initialValue={editingBranch} submitting={submitting} error={error} onSubmit={handleSubmit} onCancel={closeForm} /></Modal>
      <Modal open={Boolean(viewingBranch)} onClose={() => setViewingBranch(null)} title="Branch Details">{viewingBranch && <div className="flex flex-col gap-4"><Detail label="Branch name" value={viewingBranch.branchName} /><Detail label="Code" value={viewingBranch.branchCode} mono /><Detail label="Location" value={viewingBranch.location} /><Detail label="Status" value={viewingBranch.status} /></div>}</Modal>
    </div>
  );
}

function Detail({ label, value, mono = false }: { label: string; value: string | null; mono?: boolean }) {
  return <div><p className="text-xs text-slate-400">{label}</p><p className={`text-sm text-slate-800 ${mono ? "font-mono" : "font-semibold"}`}>{value || "—"}</p></div>;
}
