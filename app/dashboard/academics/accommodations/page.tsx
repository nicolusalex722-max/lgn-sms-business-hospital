"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Search, SlidersHorizontal } from "lucide-react";
import { AccommodationTable, Accommodation } from "@/components/academics-components/Accommodationmanager";
import { AccommodationForm } from "@/components/academics-components/Accommodationmanager";
import AccommodationWizard from "@/components/academics-components/Accommodationwiazard";
import GenerateInvoiceModal from "@/components/academics-components/Generateinvoicemodal";
import { AccommodationInvoice } from "@/components/academics-components/Accommodationinvoicetable";
import Modal from "@/components/dashboard/Modal";
import FilterDropdown from "@/components/dashboard/Filterdropdown";
import PaginationBar from "@/components/dashboard/Pegination";

const STATUS_OPTIONS = ["Occupied", "Vacant", "Reserved"];

const INITIAL_DATA: Accommodation[] = [
  { id: "acc-001", studentName: "Ralph Edwards", room: "Hostel A - 204", bedNumber: "Bed 1", status: "Occupied" },
  { id: "acc-002", studentName: "Jane Cooper", room: "Hostel A - 204", bedNumber: "Bed 2", status: "Occupied" },
  { id: "acc-003", studentName: "\u2014", room: "Hostel B - 110", bedNumber: "Bed 1", status: "Vacant" },
];

export default function AccommodationsPage() {
  const [accommodations, setAccommodations] = useState<Accommodation[]>(INITIAL_DATA);
  // Invoices generated here still get created — they just aren't displayed on this page anymore.
  // TODO: once the central Invoices page/module exists, push these there (API call or shared store)
  // instead of local state, so payment status is tracked in one place.
  const [invoices, setInvoices] = useState<AccommodationInvoice[]>([]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Accommodation | null>(null);

  const [wizardOpen, setWizardOpen] = useState(false);

  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [invoicingFor, setInvoicingFor] = useState<Accommodation | null>(null);

  const filtered = useMemo(() => {
    return accommodations.filter((a) => {
      const q = search.toLowerCase();
      const matchesSearch = a.studentName.toLowerCase().includes(q) || a.room.toLowerCase().includes(q);
      const matchesStatus = statusFilter === "All" || a.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [accommodations, search, statusFilter]);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  useEffect(() => setPage(1), [search, statusFilter, pageSize]);
  useEffect(() => { if (page > totalPages) setPage(totalPages); }, [totalPages, page]);
  const paginated = useMemo(() => filtered.slice((page - 1) * pageSize, page * pageSize), [filtered, page, pageSize]);

  const openWizard = () => setWizardOpen(true);
  const closeWizard = () => setWizardOpen(false);
  const handleWizardComplete = (
    roomData: Omit<Accommodation, "id">,
    billData: Omit<AccommodationInvoice, "id" | "status" | "studentName" | "room">
  ) => {
    const newAccommodation: Accommodation = { ...roomData, id: crypto.randomUUID() };
    const newInvoice: AccommodationInvoice = {
      ...billData,
      studentName: roomData.studentName,
      room: roomData.room,
      id: crypto.randomUUID(),
      status: "Unpaid",
    };
    setAccommodations((prev) => [newAccommodation, ...prev]);
    setInvoices((prev) => [newInvoice, ...prev]);
    closeWizard();
  };

  const openEdit = (a: Accommodation) => { setEditing(a); setFormOpen(true); };
  const closeForm = () => { setFormOpen(false); setEditing(null); };
  const handleSubmit = (data: Omit<Accommodation, "id">) => {
    if (editing) {
      setAccommodations((prev) => prev.map((a) => (a.id === editing.id ? { ...data, id: editing.id } : a)));
    }
    closeForm();
  };
  const handleDelete = (id: string) => setAccommodations((prev) => prev.filter((a) => a.id !== id));

  const openInvoice = (a: Accommodation) => {
    setInvoicingFor(a);
    setInvoiceModalOpen(true);
  };
  const closeInvoice = () => {
    setInvoiceModalOpen(false);
    setInvoicingFor(null);
  };
  const handleGenerateInvoice = (data: Omit<AccommodationInvoice, "id" | "status">) => {
    setInvoices((prev) => [{ ...data, id: crypto.randomUUID(), status: "Unpaid" }, ...prev]);
    closeInvoice();
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Accommodations</h1>
          <p className="text-sm text-slate-500 mt-1">Assign rooms and beds, and invoice students for accommodation.</p>
        </div>
        <button type="button" onClick={openWizard} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors shrink-0">
          <Plus className="w-4 h-4" />
          Assign Room
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
            placeholder="Search by student or room..."
            className="w-full pl-11 pr-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
        <FilterDropdown label="Status" icon={SlidersHorizontal} value={statusFilter} options={STATUS_OPTIONS} allLabel="All Statuses" onChange={setStatusFilter} />
      </div>

      {/* Room / bed assignments table */}
      <AccommodationTable accommodations={paginated} onEdit={openEdit} onDelete={handleDelete} onInvoice={openInvoice} />

      <PaginationBar page={page} totalPages={totalPages} pageSize={pageSize} totalCount={filtered.length} itemLabel="assignments" onPageChange={setPage} onPageSizeChange={setPageSize} />

      {/* Assign Room + Generate Bill wizard (for new assignments) */}
      <Modal open={wizardOpen} onClose={closeWizard} title="Assign Room">
        <AccommodationWizard onComplete={handleWizardComplete} onCancel={closeWizard} />
      </Modal>

      {/* Edit modal (existing assignments only — no bill step here) */}
      <Modal open={formOpen} onClose={closeForm} title="Edit Room Assignment">
        {editing && <AccommodationForm initialValue={editing} onSubmit={handleSubmit} onCancel={closeForm} />}
      </Modal>

      {/* Generate Invoice modal */}
      <Modal open={invoiceModalOpen} onClose={closeInvoice} title="Generate Accommodation Invoice">
        {invoicingFor && <GenerateInvoiceModal accommodation={invoicingFor} onSubmit={handleGenerateInvoice} onCancel={closeInvoice} />}
      </Modal>
    </div>
  );
}