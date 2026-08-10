"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";

/* -----------------------------------------------------------------------
 * Accounting Settings — GL Account Mapping / Currency / Tax
 * Drop this file in as: app/settings/accounting/page.tsx
 * Requires Tailwind CSS. No external UI deps.
 * ---------------------------------------------------------------------*/

type Account = { code: string; name: string };

const ACCOUNTS: Account[] = [
  { code: "1100", name: "NMB BANK" },
  { code: "1101", name: "Cash on Hand" },
  { code: "1102", name: "Bank Account" },
  { code: "1200", name: "Accounts Receivable" },
  { code: "1201", name: "Trade Receivables" },
  { code: "1202", name: "Loan Principal Receivable" },
  { code: "1203", name: "Loan Interest Receivable" },
  { code: "1204", name: "Loan Fees Receivable" },
  { code: "1205", name: "Loan Penalties Receivable" },
  { code: "1300", name: "Inventory" },
  { code: "2000", name: "SUPPLIER ACCOUNT" },
  { code: "2102", name: "Goods Received Not Invoiced" },
];

type MappingKey =
  | "cashAccount"
  | "bankAccount"
  | "mobileMoney"
  | "inventoryAccount"
  | "inventoryAdjustment"
  | "inventoryWriteoff"
  | "grniAccount"
  | "accountsPayable"
  | "purchaseReturns"
  | "accountsReceivable";

type MappingField = {
  key: MappingKey;
  label: string;
  helper: string;
  optional?: boolean;
};

const MAPPING_FIELDS: MappingField[] = [
  { key: "cashAccount", label: "Default Cash Account", helper: "Used for cash transactions" },
  {
    key: "bankAccount",
    label: "Default Bank",
    helper: "Used for BANK_TRANSFER, CHEQUE, CREDIT_CARD payments",
    optional: true,
  },
  { key: "mobileMoney", label: "Default Mobile Money", helper: "Used for MOBILE_MONEY payments", optional: true },
  { key: "inventoryAccount", label: "Default Inventory Account", helper: "Inventory valuation account" },
  {
    key: "inventoryAdjustment",
    label: "Inventory Adjustment",
    helper: "Offset account for inventory adjustments",
    optional: true,
  },
  {
    key: "inventoryWriteoff",
    label: "Inventory Writeoff",
    helper: "Expense account for stock write-offs",
    optional: true,
  },
  { key: "grniAccount", label: "GRNI Account", helper: "Goods received not invoiced" },
  { key: "accountsPayable", label: "Accounts Payable", helper: "Supplier invoices" },
  { key: "purchaseReturns", label: "Purchase Returns", helper: "Returns and purchase allowances", optional: true },
  { key: "accountsReceivable", label: "Accounts Receivable", helper: "Customer invoices" },
];

const DEFAULT_MAPPING: Record<MappingKey, string | null> = {
  cashAccount: "1100",
  bankAccount: "1102",
  mobileMoney: null,
  inventoryAccount: "1300",
  inventoryAdjustment: null,
  inventoryWriteoff: null,
  grniAccount: "2102",
  accountsPayable: "2000",
  purchaseReturns: null,
  accountsReceivable: "1200",
};

const CURRENCY_OPTIONS = [
  { code: "TZS", name: "Tanzanian Shilling" },
  { code: "USD", name: "US Dollar" },
  { code: "KES", name: "Kenyan Shilling" },
  { code: "UGX", name: "Ugandan Shilling" },
  { code: "EUR", name: "Euro" },
  { code: "GBP", name: "British Pound" },
];

type TaxType = "VAT" | "Withholding Tax" | "Excise Duty" | "Skills Dev. Levy" | "Custom";
type AppliesTo = "Sales" | "Purchases" | "Both";

type Tax = {
  id: string;
  name: string;
  type: TaxType;
  rate: number;
  appliesTo: AppliesTo;
  active: boolean;
};

const DEFAULT_TAXES: Tax[] = [
  { id: "t1", name: "VAT Standard", type: "VAT", rate: 18, appliesTo: "Both", active: true },
  { id: "t2", name: "Withholding Tax - Services", type: "Withholding Tax", rate: 5, appliesTo: "Purchases", active: true },
  { id: "t3", name: "Skills Development Levy", type: "Skills Dev. Levy", rate: 3.5, appliesTo: "Sales", active: false },
];

const TABS = [
  { id: "mapping", label: "Account Mapping" },
  { id: "currency", label: "Currency" },
  { id: "tax", label: "Tax" },
] as const;

type TabId = (typeof TABS)[number]["id"];

/* -------------------------- Searchable Select -------------------------- */

function AccountSelect({
  value,
  onChange,
  placeholder = "None",
}: {
  value: string | null;
  onChange: (code: string | null) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const selected = ACCOUNTS.find((a) => a.code === value) ?? null;
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ACCOUNTS;
    return ACCOUNTS.filter(
      (a) => a.code.toLowerCase().includes(q) || a.name.toLowerCase().includes(q)
    );
  }, [query]);

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-left text-[15px] text-slate-800 shadow-sm transition hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500"
      >
        <span className={selected ? "text-slate-800" : "text-slate-400"}>
          {selected ? `${selected.code} - ${selected.name}` : placeholder}
        </span>
        <svg
          className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`}
          viewBox="0 0 20 20"
          fill="none"
        >
          <path d="M6 8l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div className="absolute z-20 mt-1.5 w-full min-w-[280px] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
          <div className="flex items-center gap-2 border-b border-slate-100 px-3 py-2.5">
            <svg className="h-4 w-4 text-slate-400" viewBox="0 0 20 20" fill="none">
              <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.6" />
              <path d="M14 14l4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search accounts..."
              className="w-full text-[15px] text-slate-700 placeholder:text-slate-400 focus:outline-none"
            />
          </div>

          <div className="max-h-64 overflow-y-auto py-1">
            {placeholder === "None" && (
              <button
                type="button"
                onClick={() => {
                  onChange(null);
                  setOpen(false);
                  setQuery("");
                }}
                className={`flex w-full items-center gap-2 px-4 py-2.5 text-left text-[15px] transition ${
                  value === null ? "bg-indigo-500 text-white" : "text-slate-500 hover:bg-slate-50"
                }`}
              >
                {value === null && (
                  <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M16.7 5.3a1 1 0 010 1.4l-7.6 7.6a1 1 0 01-1.4 0L3.3 10a1 1 0 111.4-1.4l3.7 3.7 6.9-6.9a1 1 0 011.4 0z" />
                  </svg>
                )}
                <span>None</span>
              </button>
            )}
            {filtered.length === 0 && (
              <p className="px-4 py-3 text-sm text-slate-400">No accounts match &ldquo;{query}&rdquo;</p>
            )}
            {filtered.map((a) => {
              const isSelected = value === a.code;
              return (
                <button
                  key={a.code}
                  type="button"
                  onClick={() => {
                    onChange(a.code);
                    setOpen(false);
                    setQuery("");
                  }}
                  className={`flex w-full items-center gap-2 px-4 py-2.5 text-left text-[15px] transition ${
                    isSelected ? "bg-indigo-500 text-white" : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {isSelected && (
                    <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M16.7 5.3a1 1 0 010 1.4l-7.6 7.6a1 1 0 01-1.4 0L3.3 10a1 1 0 111.4-1.4l3.7 3.7 6.9-6.9a1 1 0 011.4 0z" />
                    </svg>
                  )}
                  <span className={isSelected ? "" : "ml-5"}>
                    {a.code} - {a.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------- Modal shell ------------------------------- */

function Modal({
  title,
  subtitle,
  onClose,
  children,
}: {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
}) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
        <div className="mb-5 flex items-start justify-between">
          <div>
            <h3 className="text-base font-semibold text-slate-900">{title}</h3>
            {subtitle && <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            aria-label="Close"
          >
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none">
              <path d="M6 6l8 8M14 6l-8 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

/* ------------------------------- Tab: Mapping ------------------------------- */

type CustomMapping = {
  id: string;
  label: string;
  description: string;
  accountCode: string | null;
};

function AddMappingModal({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (m: Omit<CustomMapping, "id">) => void;
}) {
  const [label, setLabel] = useState("");
  const [description, setDescription] = useState("");
  const [accountCode, setAccountCode] = useState<string | null>(null);
  const canSave = label.trim().length > 0;

  return (
    <Modal
      title="Add mapping transaction"
      subtitle="Create a custom transaction-to-account mapping"
      onClose={onClose}
    >
      <div className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-800">Transaction name</label>
          <input
            autoFocus
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="e.g. Loyalty Points Redemption"
            className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-[15px] text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-800">
            Description
            <span className="ml-1 font-normal text-slate-400">(Optional)</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            placeholder="What this mapping is used for"
            className="w-full resize-none rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-[15px] text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-800">Account</label>
          <AccountSelect value={accountCode} onChange={setAccountCode} />
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg px-4 py-2.5 text-sm font-semibold text-slate-500 hover:bg-slate-100"
        >
          Cancel
        </button>
        <button
          type="button"
          disabled={!canSave}
          onClick={() => canSave && onAdd({ label: label.trim(), description: description.trim(), accountCode })}
          className="rounded-lg bg-indigo-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-600 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
        >
          Add mapping
        </button>
      </div>
    </Modal>
  );
}

function MappingTab() {
  const [mapping, setMapping] = useState(DEFAULT_MAPPING);
  const [currency, setCurrency] = useState("TZS");
  const [dirty, setDirty] = useState(false);
  const [customMappings, setCustomMappings] = useState<CustomMapping[]>([]);
  const [modalOpen, setModalOpen] = useState(false);

  function set(key: MappingKey, code: string | null) {
    setMapping((m) => ({ ...m, [key]: code }));
    setDirty(true);
  }

  function setCustom(id: string, code: string | null) {
    setCustomMappings((rows) => rows.map((r) => (r.id === id ? { ...r, accountCode: code } : r)));
    setDirty(true);
  }

  function addCustomMapping(m: Omit<CustomMapping, "id">) {
    setCustomMappings((rows) => [...rows, { ...m, id: crypto.randomUUID() }]);
    setDirty(true);
    setModalOpen(false);
  }

  function removeCustomMapping(id: string) {
    setCustomMappings((rows) => rows.filter((r) => r.id !== id));
    setDirty(true);
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">GL Account Mapping</h2>
          <p className="mt-0.5 text-sm text-slate-500">Configure default GL accounts per currency</p>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5">
          <span className="text-xs font-medium uppercase tracking-wide text-slate-400">Currency</span>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="bg-transparent text-sm font-semibold text-slate-800 focus:outline-none"
          >
            {CURRENCY_OPTIONS.map((c) => (
              <option key={c.code} value={c.code}>
                {c.code}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white">
        <button
          type="button"
          className="flex w-full items-center justify-between px-6 py-4"
        >
          <span className="text-base font-semibold text-slate-900">{currency} Mapping</span>
          <svg className="h-5 w-5 text-slate-400" viewBox="0 0 20 20" fill="none">
            <path d="M6 8l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div className="border-t border-slate-100 px-6 py-6">
          <div className="grid grid-cols-1 gap-x-10 gap-y-6 md:grid-cols-2">
            {MAPPING_FIELDS.map((f) => (
              <div key={f.key}>
                <label className="mb-1.5 block text-sm font-semibold text-slate-800">
                  {f.label}
                  {f.optional && <span className="ml-1 font-normal text-slate-400">(Optional)</span>}
                </label>
                <AccountSelect value={mapping[f.key]} onChange={(code) => set(f.key, code)} />
                <p className="mt-1.5 text-xs text-slate-400">{f.helper}</p>
              </div>
            ))}

            {customMappings.map((m) => (
              <div key={m.id}>
                <div className="mb-1.5 flex items-center justify-between">
                  <label className="block text-sm font-semibold text-slate-800">
                    {m.label}
                    <span className="ml-1 font-normal text-slate-400">(Custom)</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => removeCustomMapping(m.id)}
                    className="rounded-md p-1 text-slate-300 transition hover:bg-rose-50 hover:text-rose-500"
                    aria-label={`Remove ${m.label}`}
                  >
                    <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="none">
                      <path d="M6 6l8 8M14 6l-8 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>
                <AccountSelect value={m.accountCode} onChange={(code) => setCustom(m.id, code)} />
                <p className="mt-1.5 text-xs text-slate-400">{m.description || "Custom transaction mapping"}</p>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="mt-8 flex items-center gap-1.5 rounded-lg border border-dashed border-slate-300 px-4 py-2.5 text-sm font-semibold text-indigo-600 transition hover:border-indigo-300 hover:bg-indigo-50/50"
          >
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none">
              <path d="M10 4v12M4 10h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
            Add mapping transaction
          </button>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-end gap-3">
        {dirty && <span className="text-sm text-slate-400">Unsaved changes</span>}
        <button
          type="button"
          onClick={() => setDirty(false)}
          className="rounded-lg bg-indigo-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
        >
          Save mapping
        </button>
      </div>

      {modalOpen && <AddMappingModal onClose={() => setModalOpen(false)} onAdd={addCustomMapping} />}
    </div>
  );
}

/* ------------------------------- Tab: Currency ------------------------------- */

type CurrencyRow = { code: string; enabled: boolean; rate: string };

function CurrencyTab() {
  const [base, setBase] = useState("TZS");
  const [rounding, setRounding] = useState("2");
  const [rows, setRows] = useState<CurrencyRow[]>([
    { code: "USD", enabled: true, rate: "2600.00" },
    { code: "KES", enabled: true, rate: "20.10" },
    { code: "UGX", enabled: false, rate: "0.70" },
    { code: "EUR", enabled: false, rate: "2820.00" },
    { code: "GBP", enabled: false, rate: "3300.00" },
  ]);

  function updateRow(code: string, patch: Partial<CurrencyRow>) {
    setRows((rs) => rs.map((r) => (r.code === code ? { ...r, ...patch } : r)));
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-slate-900">Currency Settings</h2>
        <p className="mt-0.5 text-sm text-slate-500">Set your base currency and exchange rates</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="grid grid-cols-1 gap-x-10 gap-y-6 md:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-800">Base Currency</label>
            <select
              value={base}
              onChange={(e) => setBase(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-[15px] text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500"
            >
              {CURRENCY_OPTIONS.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code} - {c.name}
                </option>
              ))}
            </select>
            <p className="mt-1.5 text-xs text-slate-400">All ledger entries post in this currency</p>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-800">Rounding Precision</label>
            <select
              value={rounding}
              onChange={(e) => setRounding(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-[15px] text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500"
            >
              <option value="0">0 decimal places</option>
              <option value="2">2 decimal places</option>
              <option value="4">4 decimal places</option>
            </select>
            <p className="mt-1.5 text-xs text-slate-400">Applied to converted amounts</p>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white">
        <div className="border-b border-slate-100 px-6 py-4">
          <h3 className="text-base font-semibold text-slate-900">Exchange Rates</h3>
          <p className="mt-0.5 text-sm text-slate-500">Rate expressed as 1 unit → {base}</p>
        </div>
        <div className="divide-y divide-slate-100">
          {rows.map((r) => (
            <div key={r.code} className="flex items-center gap-4 px-6 py-4">
              <button
                type="button"
                onClick={() => updateRow(r.code, { enabled: !r.enabled })}
                className={`relative h-6 w-11 shrink-0 rounded-full transition ${
                  r.enabled ? "bg-indigo-500" : "bg-slate-200"
                }`}
              >
                <span
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                    r.enabled ? "translate-x-5" : "translate-x-0.5"
                  }`}
                />
              </button>
              <div className="w-40 shrink-0">
                <p className="text-sm font-semibold text-slate-800">{r.code}</p>
                <p className="text-xs text-slate-400">
                  {CURRENCY_OPTIONS.find((c) => c.code === r.code)?.name}
                </p>
              </div>
              <div className="flex flex-1 items-center gap-2">
                <span className="text-sm text-slate-400">1 {r.code} =</span>
                <input
                  value={r.rate}
                  disabled={!r.enabled}
                  onChange={(e) => updateRow(r.code, { rate: e.target.value })}
                  className="w-36 rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 disabled:bg-slate-50 disabled:text-slate-300"
                />
                <span className="text-sm text-slate-400">{base}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          type="button"
          className="rounded-lg bg-indigo-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
        >
          Save currency settings
        </button>
      </div>
    </div>
  );
}

/* ------------------------------- Tab: Tax ------------------------------- */

const TAX_TYPES: TaxType[] = ["VAT", "Withholding Tax", "Excise Duty", "Skills Dev. Levy", "Custom"];
const APPLIES_TO: AppliesTo[] = ["Sales", "Purchases", "Both"];

function TaxTab() {
  const [taxes, setTaxes] = useState<Tax[]>(DEFAULT_TAXES);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState<Omit<Tax, "id">>({
    name: "",
    type: "VAT",
    rate: 0,
    appliesTo: "Both",
    active: true,
  });

  function addTax() {
    if (!draft.name.trim()) return;
    setTaxes((t) => [...t, { ...draft, id: crypto.randomUUID() }]);
    setDraft({ name: "", type: "VAT", rate: 0, appliesTo: "Both", active: true });
    setAdding(false);
  }

  function removeTax(id: string) {
    setTaxes((t) => t.filter((x) => x.id !== id));
  }

  function toggleActive(id: string) {
    setTaxes((t) => t.map((x) => (x.id === id ? { ...x, active: !x.active } : x)));
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Tax Settings</h2>
          <p className="mt-0.5 text-sm text-slate-500">Configure tax types and rates by transaction</p>
        </div>
        <button
          type="button"
          onClick={() => setAdding((a) => !a)}
          className="flex items-center gap-1.5 rounded-lg bg-indigo-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
        >
          <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none">
            <path d="M10 4v12M4 10h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          Add tax
        </button>
      </div>

      {adding && (
        <div className="mb-6 rounded-2xl border border-indigo-200 bg-indigo-50/40 p-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div className="md:col-span-2">
              <label className="mb-1.5 block text-sm font-semibold text-slate-800">Tax name</label>
              <input
                value={draft.name}
                onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
                placeholder="e.g. VAT Reduced Rate"
                className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-[15px] text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-800">Type</label>
              <select
                value={draft.type}
                onChange={(e) => setDraft((d) => ({ ...d, type: e.target.value as TaxType }))}
                className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-[15px] text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500"
              >
                {TAX_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-800">Rate (%)</label>
              <input
                type="number"
                step="0.01"
                value={draft.rate}
                onChange={(e) => setDraft((d) => ({ ...d, rate: Number(e.target.value) }))}
                className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-[15px] text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="mb-1.5 block text-sm font-semibold text-slate-800">Applies to</label>
              <div className="flex gap-2">
                {APPLIES_TO.map((a) => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => setDraft((d) => ({ ...d, appliesTo: a }))}
                    className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${
                      draft.appliesTo === a
                        ? "border-indigo-500 bg-indigo-500 text-white"
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-end gap-2 md:col-span-2 md:justify-end">
              <button
                type="button"
                onClick={() => setAdding(false)}
                className="rounded-lg px-4 py-2.5 text-sm font-semibold text-slate-500 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={addTax}
                className="rounded-lg bg-indigo-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-600"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/60 text-xs font-semibold uppercase tracking-wide text-slate-400">
              <th className="px-6 py-3">Tax name</th>
              <th className="px-6 py-3">Type</th>
              <th className="px-6 py-3">Rate</th>
              <th className="px-6 py-3">Applies to</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {taxes.map((t) => (
              <tr key={t.id} className="text-sm text-slate-700">
                <td className="px-6 py-4 font-medium text-slate-900">{t.name}</td>
                <td className="px-6 py-4 text-slate-500">{t.type}</td>
                <td className="px-6 py-4 font-mono text-slate-700">{t.rate.toFixed(2)}%</td>
                <td className="px-6 py-4">
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                    {t.appliesTo}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <button
                    type="button"
                    onClick={() => toggleActive(t.id)}
                    className={`relative h-6 w-11 shrink-0 rounded-full transition ${
                      t.active ? "bg-indigo-500" : "bg-slate-200"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                        t.active ? "translate-x-5" : "translate-x-0.5"
                      }`}
                    />
                  </button>
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    type="button"
                    onClick={() => removeTax(t.id)}
                    className="rounded-lg p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-500"
                    aria-label={`Remove ${t.name}`}
                  >
                    <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none">
                      <path
                        d="M6 6l8 8M14 6l-8 8"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                      />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
            {taxes.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-sm text-slate-400">
                  No taxes configured yet. Add one to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ------------------------------- Page shell ------------------------------- */

export default function AccountingSettingsPage() {
  const [active, setActive] = useState<TabId>("mapping");

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-5xl px-6 py-10">
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Accounting Settings</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage GL account mapping, currency, and tax configuration
          </p>
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
                  {isActive && (
                    <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-indigo-500" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {active === "mapping" && <MappingTab />}
        {active === "currency" && <CurrencyTab />}
        {active === "tax" && <TaxTab />}
      </div>
    </div>
  );
}