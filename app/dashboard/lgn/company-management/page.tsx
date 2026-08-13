"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Plus, Tags } from "lucide-react";

import CompanyStatCards from "@/components/lgn-components/Companystatcards";
import CompanyTable from "@/components/lgn-components/Companytable";
import CompanyEditForm from "@/components/lgn-components/Companyeditform";
import SubscribeCompanyModal from "@/components/lgn-components/Subscribeccompanymodal";

import Modal from "@/components/dashboard/Modal";
import Pagination from "@/components/dashboard/Pegination";
import FilterDropdown from "@/components/dashboard/Filterdropdown";

import { useCompanies } from "@/hooks/use-company";
import { useCompanySubscriptions } from "@/hooks/use-company-subscription";

import type { Company } from "@/lib/types";
import type { CompanySubscriptionCreateInput } from "@/lib/validations/company-subscription-schema";

const PAGE_SIZE = 10;

const TYPE_OPTIONS = ["Business", "Education", "Hospital"];

export default function CompaniesPage() {
  /* ------------------------------------------------------------------------ */
  /* Companies                                                                */
  /* ------------------------------------------------------------------------ */

  const {
    companies,
    loading,
    error,
    updateCompany,
    deleteCompany,
    refreshCompanies,
  } = useCompanies();

  const { createCompanySubscription } = useCompanySubscriptions();

  /* ------------------------------------------------------------------------ */
  /* Filters                                                                  */
  /* ------------------------------------------------------------------------ */

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [page, setPage] = useState(1);

  /* ------------------------------------------------------------------------ */
  /* Edit Modal                                                               */
  /* ------------------------------------------------------------------------ */

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);

  /* ------------------------------------------------------------------------ */
  /* Subscription Modal                                                       */
  /* ------------------------------------------------------------------------ */

  const [subscribeModalOpen, setSubscribeModalOpen] = useState(false);

  const [subscribingCompany, setSubscribingCompany] = useState<Company | null>(
    null,
  );

  const handleSubscriptionSave = async (
    data: CompanySubscriptionCreateInput,
  ) => {
    const result = await createCompanySubscription(data);

    if (!result.success) {
      throw new Error(result.error ?? "Failed to create company subscription.");
    }

    await refreshCompanies();

    closeSubscribe();
  };
  /* ------------------------------------------------------------------------ */
  /* Stats                                                                    */
  /* ------------------------------------------------------------------------ */

  const stats = useMemo(() => {
    return {
      total: companies.length,

      active: companies.filter((company) => company.status === "Active").length,

      businessCount: companies.filter(
        (company) => company.businessType === "Business",
      ).length,

      schoolCount: companies.filter(
        (company) => company.businessType === "Education",
      ).length,
    };
  }, [companies]);

  /* ------------------------------------------------------------------------ */
  /* Search + Filter                                                          */
  /* ------------------------------------------------------------------------ */

  const filtered = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return companies.filter((company) => {
      const matchesSearch =
        normalizedSearch === "" ||
        company.companyName.toLowerCase().includes(normalizedSearch) ||
        company.displayName.toLowerCase().includes(normalizedSearch) ||
        company.email.toLowerCase().includes(normalizedSearch);

      const matchesType =
        typeFilter === "All" || company.businessType === typeFilter;

      return matchesSearch && matchesType;
    });
  }, [companies, search, typeFilter]);

  /* ------------------------------------------------------------------------ */
  /* Pagination                                                               */
  /* ------------------------------------------------------------------------ */

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  useEffect(() => {
    setPage(1);
  }, [search, typeFilter]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const paginated = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;

    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  /* ------------------------------------------------------------------------ */
  /* Edit                                                                     */
  /* ------------------------------------------------------------------------ */

  const openEdit = (company: Company) => {
    setEditingCompany(company);
    setEditModalOpen(true);
  };

  const closeEdit = () => {
    setEditModalOpen(false);
    setEditingCompany(null);
  };

  const handleEditSubmit = async (
    id: string,
    data: Parameters<typeof updateCompany>[1],
  ) => {
    const result = await updateCompany(id, data);

    if (!result.success) {
      return;
    }

    closeEdit();
  };

  /* ------------------------------------------------------------------------ */
  /* Delete                                                                   */
  /* ------------------------------------------------------------------------ */

  const handleDelete = async (id: string) => {
    await deleteCompany(id);
  };

  /* ------------------------------------------------------------------------ */
  /* Subscribe                                                                */
  /* ------------------------------------------------------------------------ */

  const openSubscribe = (company: Company) => {
    setSubscribingCompany(company);
    setSubscribeModalOpen(true);
  };

  const closeSubscribe = () => {
    setSubscribeModalOpen(false);
    setSubscribingCompany(null);
  };

  /* ------------------------------------------------------------------------ */
  /* Render                                                                   */
  /* ------------------------------------------------------------------------ */

  return (
    <div className="flex flex-col gap-6">
      {/* ------------------------------------------------------------------ */}
      {/* Header                                                             */}
      {/* ------------------------------------------------------------------ */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">
            Company Management
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage registered companies and their subscriptions
          </p>
        </div>

        <Link
          href="/dashboard/lgn/company-management/new"
          className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4" />
          Add Company
        </Link>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Stats                                                              */}
      {/* ------------------------------------------------------------------ */}

      <CompanyStatCards {...stats} />

      {/* ------------------------------------------------------------------ */}
      {/* Search + Filter                                                    */}
      {/* ------------------------------------------------------------------ */}

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search companies..."
            className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <FilterDropdown
          label="Type"
          icon={Tags}
          value={typeFilter}
          options={TYPE_OPTIONS}
          allLabel="All Types"
          onChange={setTypeFilter}
        />
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Loading                                                             */}
      {/* ------------------------------------------------------------------ */}

      {loading && (
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
          <p className="text-sm text-slate-500">Loading companies...</p>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Error                                                               */}
      {/* ------------------------------------------------------------------ */}

      {!loading && error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-5">
          <p className="text-sm text-rose-700">{error}</p>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Company Table                                                       */}
      {/* ------------------------------------------------------------------ */}

      {!loading && !error && (
        <CompanyTable
          companies={paginated}
          onEdit={openEdit}
          onDelete={handleDelete}
          onSubscribe={openSubscribe}
        />
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Pagination                                                          */}
      {/* ------------------------------------------------------------------ */}

      {!loading && !error && (
        <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
          <p className="text-xs text-slate-500">
            Showing {filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}
            &ndash;
            {Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
          </p>

          <Pagination
            page={page}
            totalPages={totalPages}
            pageSize={PAGE_SIZE}
            totalCount={filtered.length}
            itemLabel="companies"
            onPageChange={setPage}
            onPageSizeChange={() => {}}
          />
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Edit Company Modal                                                  */}
      {/* ------------------------------------------------------------------ */}

      <Modal open={editModalOpen} onClose={closeEdit} title="Edit Company">
        {editingCompany && (
          <CompanyEditForm
            company={editingCompany}
            onSubmit={(data) => handleEditSubmit(editingCompany.id, data)}
            onCancel={closeEdit}
          />
        )}
      </Modal>

      {/* ------------------------------------------------------------------ */}
      {/* Company Subscription Modal                                          */}
      {/* ------------------------------------------------------------------ */}

      <Modal
        open={subscribeModalOpen}
        onClose={closeSubscribe}
        title="Manage Subscription"
      >
        {subscribingCompany && (
          <SubscribeCompanyModal
            company={subscribingCompany}
            onClose={closeSubscribe}
            onSave={handleSubscriptionSave}
          />
        )}
      </Modal>
    </div>
  );
}
