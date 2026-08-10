"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Search, SlidersHorizontal } from "lucide-react";
import LeaveTable, { LeaveRequest } from "@/components/hr-components/Leavetable";
import LeaveForm from "@/components/hr-components/Leaveform";
import Modal from "@/components/dashboard/Modal";
import FilterDropdown from "@/components/dashboard/Filterdropdown";
import PaginationBar from "@/components/dashboard/Pegination";

const STATUS_OPTIONS = ["Pending", "Approved", "Rejected"];

const INITIAL_DATA: LeaveRequest[] = [
  {
    id: "lv-001",
    employee: "Asha Mwakalinga",
    leaveType: "Annual Leave",
    startDate: "2026-08-10",
    endDate: "2026-08-14",
    description: "Family trip upcountry",
    approver: "Admin warisecondary",
    status: "Pending",
    requestedAt: "2026-08-01",
  },
  {
    id: "lv-002",
    employee: "John David Mushi",
    leaveType: "Sick Leave",
    startDate: "2026-07-20",
    endDate: "2026-07-22",
    description: "Flu recovery",
    approver: "Inno Mallya",
    status: "Approved",
    requestedAt: "2026-07-19",
  },
  {
    id: "lv-003",
    employee: "Neema Kilonzo",
    leaveType: "Compassionate Leave",
    startDate: "2026-06-05",
    endDate: "2026-06-07",
    description: "Family bereavement",
    approver: "Boss Hussein",
    status: "Rejected",
    requestedAt: "2026-06-03",
  },
];

export default function LeavesPage() {
  const [leaves, setLeaves] = useState<LeaveRequest[]>(INITIAL_DATA);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [formOpen, setFormOpen] = useState(false);

  const filtered = useMemo(() => {
    return leaves.filter((l) => {
      const q = search.toLowerCase();
      const matchesSearch = l.employee.toLowerCase().includes(q) || l.leaveType.toLowerCase().includes(q);
      const matchesStatus = statusFilter === "All" || l.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [leaves, search, statusFilter]);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

  useEffect(() => setPage(1), [search, statusFilter, pageSize]);
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [totalPages, page]);

  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  const handleSubmit = (data: Omit<LeaveRequest, "id" | "status" | "requestedAt">) => {
    setLeaves((prev) => [
      { ...data, id: crypto.randomUUID(), status: "Pending", requestedAt: new Date().toISOString().split("T")[0] },
      ...prev,
    ]);
    setFormOpen(false);
  };

  const updateStatus = (id: string, status: string) => {
    setLeaves((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)));
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Leave Management</h1>
          <p className="text-sm text-slate-500 mt-1">Request and track employee leave</p>
        </div>
        <button
          type="button"
          onClick={() => setFormOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          Request Leave
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
            placeholder="Search by employee or leave type..."
            className="w-full pl-11 pr-4 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
        <FilterDropdown
          label="Status"
          icon={SlidersHorizontal}
          value={statusFilter}
          options={STATUS_OPTIONS}
          allLabel="All Statuses"
          onChange={setStatusFilter}
        />
      </div>

      {/* Table */}
      <LeaveTable
        leaves={paginated}
        onApprove={(id) => updateStatus(id, "Approved")}
        onReject={(id) => updateStatus(id, "Rejected")}
      />

      {/* Pagination */}
      <PaginationBar
        page={page}
        totalPages={totalPages}
        pageSize={pageSize}
        totalCount={filtered.length}
        itemLabel="leave requests"
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
      />

      {/* Request Leave modal */}
      <Modal open={formOpen} onClose={() => setFormOpen(false)} title="Request Leave">
        <LeaveForm onSubmit={handleSubmit} onCancel={() => setFormOpen(false)} />
      </Modal>
    </div>
  );
}