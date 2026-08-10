"use client";

import { useMemo, useState, useEffect } from "react";
import {
  Layers,
  CheckCircle2,
  DollarSign,
  AlertTriangle,
  Plus,
} from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";
import SubscriptionToolbar from "@/components/dashboard/SubscriptionToolbar";
import SubscriptionTable, {
  Subscription,
} from "@/components/dashboard/SubscriptionTable";
import SubscriptionForm from "@/components/dashboard/SubscriptionForm";
import Pagination from "@/components/dashboard/Pegination";
import Modal from "@/components/dashboard/Modal";

const PAGE_SIZE = 7;

const INITIAL_DATA: Subscription[] = [
  {
    id: "sub-001",
    plan: "Premium",
    status: "Active",
    amount: 150000,
    billingCycle: "Monthly",
    startDate: "2026-05-01",
  },
  {
    id: "sub-002",
    plan: "Basic",
    status: "Trial",
    amount: 0,
    billingCycle: "Monthly",
    startDate: "2026-07-20",
  },
  {
    id: "sub-003",
    plan: "Enterprise",
    status: "Expired",
    amount: 500000,
    billingCycle: "Yearly",
    startDate: "2025-06-15",
  },
  {
    id: "sub-004",
    plan: "Starter",
    status: "Active",
    amount: 25000,
    billingCycle: "Monthly",
    startDate: "2026-06-10",
  },
  {
    id: "sub-005",
    plan: "Standard",
    status: "Active",
    amount: 60000,
    billingCycle: "Monthly",
    startDate: "2026-04-02",
  },
  {
    id: "sub-006",
    plan: "Premium",
    status: "Cancelled",
    amount: 150000,
    billingCycle: "Monthly",
    startDate: "2026-01-15",
  },
];

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] =
    useState<Subscription[]>(INITIAL_DATA);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingSub, setEditingSub] = useState<Subscription | null>(null);

  const stats = useMemo(() => {
    const total = subscriptions.length;
    const active = subscriptions.filter((s) => s.status === "Active").length;
    const monthlyRevenue = subscriptions
      .filter((s) => s.status === "Active")
      .reduce((sum, s) => {
        if (s.billingCycle === "Yearly") return sum + s.amount / 12;
        if (s.billingCycle === "Quarterly") return sum + s.amount / 3;
        return sum + s.amount;
      }, 0);
    const expired = subscriptions.filter((s) => s.status === "Expired").length;
    return {
      total,
      active,
      monthlyRevenue: Math.round(monthlyRevenue),
      expired,
    };
  }, [subscriptions]);

  const filtered = useMemo(() => {
    return subscriptions.filter((s) => {
      const matchesSearch = s.plan.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "All" || s.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [subscriptions, search, statusFilter]);

  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  // Reset to page 1 whenever the search or filter changes
  useEffect(() => {
    setPage(1);
  }, [search, statusFilter]);

  // Keep page in range if the list shrinks (e.g. after deleting)
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [totalPages, page]);

  const paginated = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  const openAddModal = () => {
    setEditingSub(null);
    setModalOpen(true);
  };

  const openEditModal = (sub: Subscription) => {
    setEditingSub(sub);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingSub(null);
  };

  const handleSubmit = (data: Omit<Subscription, "id">) => {
    if (editingSub) {
      setSubscriptions((prev) =>
        prev.map((s) =>
          s.id === editingSub.id ? { ...data, id: editingSub.id } : s,
        ),
      );
    } else {
      setSubscriptions((prev) => [
        { ...data, id: crypto.randomUUID() },
        ...prev,
      ]);
    }
    closeModal();
  };

  const handleDelete = (id: string) => {
    setSubscriptions((prev) => prev.filter((s) => s.id !== id));
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">
            Subscription Plans
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage plans, billing status, and revenue for your company
            subscriptions
          </p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Plans"
          value={String(stats.total)}
          icon={Layers}
          accent="indigo"
        />
        <StatCard
          label="Active Subscriptions"
          value={String(stats.active)}
          icon={CheckCircle2}
          accent="emerald"
        />
        <StatCard
          label="Monthly Revenue"
          value={`TZS ${stats.monthlyRevenue.toLocaleString()}`}
          icon={DollarSign}
          accent="amber"
        />
        <StatCard
          label="Expired Plans"
          value={String(stats.expired)}
          icon={AlertTriangle}
          accent="rose"
        />
      </div>
      {/* Add Subscription button */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          Add Subscription
        </button>
      </div>

      {/* Search + filter */}
      <SubscriptionToolbar
        search={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
      />

      {/* Table */}
      <SubscriptionTable
        subscriptions={paginated}
        onEdit={openEditModal}
        onDelete={handleDelete}
      />

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-xs text-slate-500">
          Showing {filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}
          &ndash;{Math.min(page * PAGE_SIZE, filtered.length)} of{" "}
          {filtered.length}
        </p>
        <Pagination
          page={page}
          totalPages={totalPages}
          pageSize={PAGE_SIZE}
          totalCount={filtered.length}
          itemLabel="products"
          onPageChange={setPage}
          onPageSizeChange={() => {}}
        />
      </div>

      {/* Add / Edit modal */}
      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editingSub ? "Edit Subscription" : "Add Subscription"}
      >
        <SubscriptionForm
          initialValue={editingSub}
          onSubmit={handleSubmit}
          onCancel={closeModal}
        />
      </Modal>
    </div>
  );
}
