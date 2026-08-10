"use client";

import { useEffect, useMemo, useState } from "react";
import { PlayCircle, Search, SlidersHorizontal } from "lucide-react";
import PayrollStatCards from "@/components/hr-components/Payrollstatcards";
import PayrollTable, { PayrollRecord } from "@/components/hr-components/Payrolltable";
import RunPayrollModal, { PayrollEmployee } from "@/components/hr-components/Runpayrollmodal";
import Modal from "@/components/dashboard/Modal";
import FilterDropdown from "@/components/dashboard/Filterdropdown";
import PaginationBar from "@/components/dashboard/Pegination";

// Sample employees to run payroll against — swap for your real Employee Management data.
const EMPLOYEES: PayrollEmployee[] = [
  { name: "Asha Mwakalinga", salary: 1200000 },
  { name: "John David Mushi", salary: 1500000 },
  { name: "Neema Kilonzo", salary: 850000 },
];

const STATUS_OPTIONS = ["Paid", "Processing Payment"];

const INITIAL_HISTORY: PayrollRecord[] = [
  { id: "pr-001", employeeName: "Asha Mwakalinga", salary: 1200000, month: "2026-06", payDate: "2026-06-28", status: "Paid" },
  { id: "pr-002", employeeName: "John David Mushi", salary: 1500000, month: "2026-06", payDate: "2026-06-28", status: "Paid" },
  { id: "pr-003", employeeName: "Neema Kilonzo", salary: 850000, month: "2026-06", payDate: "2026-06-28", status: "Paid" },
  { id: "pr-004", employeeName: "Asha Mwakalinga", salary: 1200000, month: "2026-07", payDate: "2026-07-28", status: "Paid" },
  { id: "pr-005", employeeName: "John David Mushi", salary: 1500000, month: "2026-07", payDate: "2026-07-28", status: "Processing Payment" },
  { id: "pr-006", employeeName: "Neema Kilonzo", salary: 850000, month: "2026-07", payDate: "2026-07-28", status: "Paid" },
];

export default function PayrollPage() {
  const [history, setHistory] = useState<PayrollRecord[]>(INITIAL_HISTORY);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [runModalOpen, setRunModalOpen] = useState(false);

  const stats = useMemo(() => {
    const totalPaid = history.filter((r) => r.status === "Paid").reduce((sum, r) => sum + r.salary, 0);
    const pendingCount = history.filter((r) => r.status === "Processing Payment").length;
    const lastMonth = history.reduce((latest, r) => (r.month > latest ? r.month : latest), "");
    const lastRunMonth = lastMonth
      ? new Date(Number(lastMonth.split("-")[0]), Number(lastMonth.split("-")[1]) - 1, 1).toLocaleDateString("en-GB", {
          month: "long",
          year: "numeric",
        })
      : "";
    return { totalPaid, pendingCount, lastRunMonth };
  }, [history]);

  const filtered = useMemo(() => {
    return history
      .filter((r) => {
        const matchesSearch = r.employeeName.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === "All" || r.status === statusFilter;
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => (a.month < b.month ? 1 : -1));
  }, [history, search, statusFilter]);

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

  const handleRunPayroll = ({ month, payDate }: { month: string; payDate: string }) => {
    const newRecords: PayrollRecord[] = EMPLOYEES.map((emp) => ({
      id: crypto.randomUUID(),
      employeeName: emp.name,
      salary: emp.salary,
      month,
      payDate,
      status: "Processing Payment",
    }));
    setHistory((prev) => [...newRecords, ...prev]);
    setRunModalOpen(false);
  };

  const handleMarkPaid = (id: string) => {
    setHistory((prev) => prev.map((r) => (r.id === id ? { ...r, status: "Paid" } : r)));
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Payroll</h1>
        <p className="text-sm text-slate-500 mt-1">Run payroll and keep a record of every payment made</p>
      </div>

      {/* Summary cards */}
      <PayrollStatCards totalPaid={stats.totalPaid} pendingCount={stats.pendingCount} lastRunMonth={stats.lastRunMonth} />

      {/* Run Payroll — directly above the history table */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setRunModalOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          <PlayCircle className="w-4 h-4" />
          Run Payroll
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
            placeholder="Search by employee name..."
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

      {/* Payroll History table */}
      <div>
        <h2 className="text-base font-semibold text-slate-800 mb-3">Payroll History</h2>
        <PayrollTable records={paginated} onMarkPaid={handleMarkPaid} />
      </div>

      {/* Pagination */}
      <PaginationBar
        page={page}
        totalPages={totalPages}
        pageSize={pageSize}
        totalCount={filtered.length}
        itemLabel="payroll records"
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
      />

      {/* Run Payroll modal */}
      <Modal open={runModalOpen} onClose={() => setRunModalOpen(false)} title="Run Payroll">
        <RunPayrollModal employees={EMPLOYEES} onRun={handleRunPayroll} onCancel={() => setRunModalOpen(false)} />
      </Modal>
    </div>
  );
}