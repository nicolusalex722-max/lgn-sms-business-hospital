"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Layers,
  CheckCircle2,
  DollarSign,
  AlertTriangle,
  Plus,
} from "lucide-react";
import { toast } from "sonner";
import StatCard from "@/components/dashboard/StatCard";
import SubscriptionToolbar from "@/components/dashboard/SubscriptionToolbar";
import SubscriptionTable from "@/components/dashboard/SubscriptionTable";
import SubscriptionForm from "@/components/dashboard/SubscriptionForm";
import Pagination from "@/components/dashboard/Pegination";
import Modal from "@/components/dashboard/Modal";

import type { Subscription } from "@/lib/types";
import type { SubscriptionFormData } from "@/lib/validations/sub-plan-schema";

import { useSubscriptions } from "@/hooks/use-subscriptions";

const PAGE_SIZE = 7;

export default function SubscriptionsPage() {
  const {
    subscriptions,
    loading,
    error,
    createSubscription,
    updateSubscription,
    deleteSubscription,
  } = useSubscriptions();

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("All");

  const [modalOpen, setModalOpen] =
    useState(false);

  const [editingSub, setEditingSub] =
    useState<Subscription | null>(null);

  const [page, setPage] =
    useState(1);

  // STATS

  const stats = useMemo(() => {
    const total = subscriptions.length;

    const active =
      subscriptions.filter(
        (subscription) =>
          subscription.status === "Active"
      ).length;

    const monthlyRevenue =
      subscriptions
        .filter(
          (subscription) =>
            subscription.status === "Active"
        )
        .reduce((sum, subscription) => {
          if (
            subscription.billingCycle ===
            "Yearly"
          ) {
            return (
              sum +
              subscription.amount / 12
            );
          }

          if (
            subscription.billingCycle ===
            "Quarterly"
          ) {
            return (
              sum +
              subscription.amount / 3
            );
          }

          return (
            sum + subscription.amount
          );
        }, 0);

    const expired =
      subscriptions.filter(
        (subscription) =>
          subscription.status === "Expired"
      ).length;

    return {
      total,
      active,
      monthlyRevenue:
        Math.round(monthlyRevenue),
      expired,
    };
  }, [subscriptions]);

  // FILTER

  const filtered = useMemo(() => {
    const normalizedSearch =
      search.trim().toLowerCase();

    return subscriptions.filter(
      (subscription) => {
        const matchesSearch =
          subscription.plan
            .toLowerCase()
            .includes(normalizedSearch);

        const matchesStatus =
          statusFilter === "All" ||
          subscription.status ===
            statusFilter;

        return (
          matchesSearch &&
          matchesStatus
        );
      }
    );
  }, [
    subscriptions,
    search,
    statusFilter,
  ]);

  // PAGINATION

  const totalPages = Math.max(
    1,
    Math.ceil(
      filtered.length / PAGE_SIZE
    )
  );

  useEffect(() => {
    setPage(1);
  }, [
    search,
    statusFilter,
  ]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const paginated =
    useMemo(() => {
      const start =
        (page - 1) * PAGE_SIZE;

      return filtered.slice(
        start,
        start + PAGE_SIZE
      );
    }, [filtered, page]);

  // MODAL

  const openAddModal = () => {
    setEditingSub(null);
    setModalOpen(true);
  };

  const openEditModal = (
    subscription: Subscription
  ) => {
    setEditingSub(subscription);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingSub(null);
  };

// SUBMIT

const handleSubmit = async (
  data: SubscriptionFormData
): Promise<{
  success: boolean;
  error?: string;
}> => {
  if (editingSub) {
    return await updateSubscription(
      editingSub.id,
      data
    );
  }

  return await createSubscription(data);
};

// DELETE

const handleDelete = async (
  id: string
) => {
  try {
    const result = await deleteSubscription(id);

    if (!result?.success) {
      toast.error(
        result?.error ?? "Failed to delete subscription."
      );

      return;
    }

    toast.success(
      "Subscription deleted successfully."
    );
  } catch (error) {
    console.error(
      "Subscription deletion error:",
      error
    );

    toast.error(
      "Failed to delete subscription."
    );
  }
};

  // UI

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-slate-900">
          Subscription Plans
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Manage plans, billing status,
          and revenue for your company
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

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

      {/* Add button */}
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
        onStatusFilterChange={
          setStatusFilter
        }
      />

      {/* Loading */}
      {loading ? (
        <div className="rounded-xl border border-slate-200 bg-white px-6 py-12 text-center">
          <p className="text-sm text-slate-500">
            Loading subscription plans...
          </p>
        </div>
      ) : (
        <>
          {/* Table */}
          <SubscriptionTable
            subscriptions={paginated}
            onEdit={openEditModal}
            onDelete={handleDelete}
          />

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-slate-500">
              Showing{" "}
              {filtered.length === 0
                ? 0
                : (page - 1) *
                    PAGE_SIZE +
                  1}
              &ndash;
              {Math.min(
                page * PAGE_SIZE,
                filtered.length
              )}{" "}
              of {filtered.length}
            </p>

            <Pagination
              page={page}
              totalPages={totalPages}
              pageSize={PAGE_SIZE}
              totalCount={filtered.length}
              itemLabel="subscriptions"
              onPageChange={setPage}
              onPageSizeChange={() => {}}
            />
          </div>
        </>
      )}

      {/* Add / Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={
          editingSub
            ? "Edit Subscription"
            : "Add Subscription"
        }
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