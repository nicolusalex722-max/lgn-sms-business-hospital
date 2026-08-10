"use client";

import { useState } from "react";
import DocumentsTab from "@/components/Billing-components/Documenttab";
import { MOCK_DOCUMENTS } from "@/lib/data";
import type { BillingDocument, PaymentRecord } from "@/lib/types";

const TABS = [
  { id: "bills", label: "Bills" },
  { id: "invoices", label: "Invoices" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function BillingPage() {
  const [active, setActive] = useState<TabId>("bills");
  const [documents, setDocuments] = useState<BillingDocument[]>(MOCK_DOCUMENTS);

  function recordPayment(docId: string, payment: Omit<PaymentRecord, "id">) {
    setDocuments((docs) =>
      docs.map((d) =>
        d.id === docId ? { ...d, payments: [...d.payments, { ...payment, id: crypto.randomUUID() }] } : d
      )
    );
  }

  const bills = documents.filter((d) => d.type === "bill");
  const invoices = documents.filter((d) => d.type === "invoice");

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Billing</h1>
          <p className="mt-1 text-sm text-slate-500">Manage bills from suppliers and invoices to customers</p>
        </header>

        <div className="mb-8 border-b border-slate-200">
          <nav className="flex gap-1">
            {TABS.map((tab) => {
              const isActive = tab.id === active;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActive(tab.id)}
                  className={`relative px-4 py-3 text-sm font-semibold transition ${
                    isActive ? "text-indigo-600" : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {tab.label}
                  {isActive && <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-indigo-500" />}
                </button>
              );
            })}
          </nav>
        </div>

        {active === "bills" && <DocumentsTab type="bill" documents={bills} onRecordPayment={recordPayment} />}
        {active === "invoices" && (
          <DocumentsTab type="invoice" documents={invoices} onRecordPayment={recordPayment} />
        )}
      </div>
    </div>
  );
}