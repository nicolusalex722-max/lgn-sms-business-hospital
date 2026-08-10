"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Search, SlidersHorizontal } from "lucide-react";
import { BankReconciliationForm, BankReconciliationTable, BankReconciliation } from "@/components/accounting-components/Bankreconciliationmanager";
import Modal from "@/components/dashboard/Modal";
import FilterDropdown from "@/components/dashboard/Filterdropdown";
import PaginationBar from "@/components/dashboard/Pegination";

const STATUS_OPTIONS = ["Reconciled", "Pending"];

const INITIAL_DATA: BankReconciliation[] = [
  { id: "br-001", bankAccount: "NMB - 0123456789", statementDate: "2026-07-31", statementBalance: 12500000, bookBalance: 12500000, status: "Reconciled" },
  { id: "br-002", bankAccount: "CRDB - 9988776655", statementDate: "2026-07-31", statementBalance: 8250000, bookBalance: 8100000, status: "Pending" },
];

export default function BankReconciliationPage() {
  const [records, setRecords] = useState<BankReconciliation[]>(INITIAL_DATA);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<BankReconciliation | null>(null);

  const filtered = useMemo(() => {
    return records.filter((r) => {
      const matchesSearch = r.bankAccount.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "All" || r.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [records, search, statusFilter]);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  useEffect(() => setPage(1), [search, statusFilter, pageSize]);
  useEffect(() => { if (page > totalPages) setPage(totalPages); }, [totalPages, page]);
  const paginated = useMemo(() => filtered.slice((page - 1) * pageSize, page * pageSize), [filtered, page, pageSize]);

  const openAdd = () => { setEditing(null); setFormOpen(true); };
  const openEdit = (r: BankReconciliation) => { setEditing(r); setFormOpen(true); };
  const closeForm = () => { setFormOpen(false); setEditing(null); };
  const handleSubmit = (data: Omit<BankReconciliation, "id">) => {
    if (editing) {
      setRecords((prev) => prev.map((r) => (r.id === editing.id ? { ...data, id: editing.id } : r)));
    } else {
      setRecords((prev) => [{ ...data, id: crypto.randomUUID() }, ...prev]);
    }
    closeForm();
  };
  const handleDelete = (id: string) => setRecords((prev) => prev.filter((r) => r.id !== id));

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Bank Reconciliation</h1>
          <p className="text-sm text-slate-500 mt-1">Match your book balances against bank statements.</p>
        </div>
        <button type="button" onClick={openAdd} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors shrink-0">
          <Plus className="w-4 h-4" />
          Add Reconciliation
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by bank account..." className="w-full pl-11 pr-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
        </div>
        <FilterDropdown label="Status" icon={SlidersHorizontal} value={statusFilter} options={STATUS_OPTIONS} allLabel="All Statuses" onChange={setStatusFilter} />
      </div>

      <BankReconciliationTable records={paginated} onEdit={openEdit} onDelete={handleDelete} />

      <PaginationBar page={page} totalPages={totalPages} pageSize={pageSize} totalCount={filtered.length} itemLabel="records" onPageChange={setPage} onPageSizeChange={setPageSize} />

      <Modal open={formOpen} onClose={closeForm} title={editing ? "Edit Reconciliation" : "Add Reconciliation"}>
        <BankReconciliationForm initialValue={editing} onSubmit={handleSubmit} onCancel={closeForm} />
      </Modal>
    </div>
  );
}