"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Plus, Tags } from "lucide-react";
import CompanyStatCards from "@/components/lgn-components/Companystatcards";
import CompanyTable,{ Company } from "@/components/lgn-components/Companytable";
import CompanyEditForm from "@/components/lgn-components/Companyeditform";
import SubscribeCompanyModal from "@/components/lgn-components/Subscribeccompanymodal";
import Modal from "@/components/dashboard/Modal";
import Pagination from "@/components/dashboard/Pegination";
import FilterDropdown from "@/components/dashboard/StatusFilterDropdown";

const PAGE_SIZE = 10;
const TYPE_OPTIONS = ["Business", "Education", "Hospital"];

const INITIAL_DATA: Company[] = [
  { id: "co-001", name: "City Electronics", businessType: "Business", email: "info@cityelectronics.co.tz", status: "Active" },
  { id: "co-002", name: "Ifakara Secondary School", businessType: "Education", email: "admin@ifakarasec.ac.tz", status: "Active" },
  { id: "co-003", name: "Mwenge Traders", businessType: "Business", email: "sales@mwengetraders.co.tz", status: "Inactive" },
  { id: "co-004", name: "St. Mary's Academy", businessType: "Education", email: "info@stmarys.ac.tz", status: "Active" },
];

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>(INITIAL_DATA);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);

  const [subscribeModalOpen, setSubscribeModalOpen] = useState(false);
  const [subscribingCompany, setSubscribingCompany] = useState<Company | null>(null);

  const stats = useMemo(() => {
    return {
      total: companies.length,
      active: companies.filter((c) => c.status === "Active").length,
      businessCount: companies.filter((c) => c.businessType === "Business").length,
      schoolCount: companies.filter((c) => c.businessType === "Education").length,
    };
  }, [companies]);

  const filtered = useMemo(() => {
    return companies.filter((c) => {
      const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase());
      const matchesType = typeFilter === "All" || c.businessType === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [companies, search, typeFilter]);

  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  useEffect(() => setPage(1), [search, typeFilter]);
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [totalPages, page]);

  const paginated = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  const openEdit = (company: Company) => {
    setEditingCompany(company);
    setEditModalOpen(true);
  };
  const closeEdit = () => {
    setEditModalOpen(false);
    setEditingCompany(null);
  };
  const handleEditSubmit = (data: Company) => {
    setCompanies((prev) => prev.map((c) => (c.id === data.id ? data : c)));
    closeEdit();
  };

  const handleDelete = (id: string) => {
    setCompanies((prev) => prev.filter((c) => c.id !== id));
  };

  const openSubscribe = (company: Company) => {
    setSubscribingCompany(company);
    setSubscribeModalOpen(true);
  };
  const closeSubscribe = () => {
    setSubscribeModalOpen(false);
    setSubscribingCompany(null);
  };
  const handleSubscribeSave = (subscription: {
    companyId: string;
    plan: string;
    billingCycle: string;
    amount: number;
    startDate: string;
  }) => {
    // TODO: persist this via your API/Prisma (e.g. create a Subscription row linked to companyId)
    console.log("Saving subscription:", subscription);
    closeSubscribe();
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">Company Management</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage registered companies and their subscriptions
          </p>
        </div>
        <Link
          href="/dashboard/lgn/company-management/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          Add Company
        </Link>
      </div>

      {/* Summary cards */}
      <CompanyStatCards {...stats} />

      {/* Search + filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search companies..."
            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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

      {/* Table */}
      <CompanyTable
        companies={paginated}
        onEdit={openEdit}
        onDelete={handleDelete}
        onSubscribe={openSubscribe}
      />

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-xs text-slate-500">
          Showing {filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}
          &ndash;{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
        </p>
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      {/* Edit modal (quick edit — full creation flow is the /new page) */}
      <Modal open={editModalOpen} onClose={closeEdit} title="Edit Company">
        {editingCompany && (
          <CompanyEditForm company={editingCompany} onSubmit={handleEditSubmit} onCancel={closeEdit} />
        )}
      </Modal>

      {/* Subscribe / billing modal */}
      <Modal open={subscribeModalOpen} onClose={closeSubscribe} title="Manage Subscription">
        {subscribingCompany && (
          <SubscribeCompanyModal
            company={subscribingCompany}
            onClose={closeSubscribe}
            onSave={handleSubscribeSave}
          />
        )}
      </Modal>
    </div>
  );
}