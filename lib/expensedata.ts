import type { Account, AccountExpense, Expense, ExpenseCategory } from "./types";

export const CATEGORIES: ExpenseCategory[] = [
  "Utilities",
  "Rent",
  "Salaries & Wages",
  "Office Supplies",
  "Maintenance & Repairs",
  "Transport",
  "Marketing",
  "Professional Fees",
  "Other",
];

export const ACCOUNTS: AccountExpense[] = [
  { code: "1100", name: "NMB Bank" },
  { code: "1101", name: "Cash on Hand" },
  { code: "1103", name: "Mobile Money Wallet" },
  { code: "1104", name: "CRDB Bank" },
];

export const PAYMENT_METHODS: readonly ["Mobile Money", "Cash", "Bank"] = ["Mobile Money", "Cash", "Bank"];

export const MOCK_EXPENSES: Expense[] = [
  {
    id: "e1",
    date: "2026-08-05",
    category: "Utilities",
    vendor: "TANESCO",
    amount: 180000,
    method: "Bank",
    account: "NMB Bank",
    reference: "INV-88213",
    description: "Electricity bill for July",
  },
  {
    id: "e2",
    date: "2026-08-04",
    category: "Office Supplies",
    vendor: "NMB Stationery Ltd",
    amount: 95000,
    method: "Mobile Money",
    account: "Mobile Money Wallet",
    reference: "MP240804",
    description: "Printer paper, toner, and folders",
  },
  {
    id: "e3",
    date: "2026-08-02",
    category: "Transport",
    vendor: "Bolt",
    amount: 32000,
    method: "Mobile Money",
    account: "Mobile Money Wallet",
    description: "Staff transport to branch meeting",
  },
  {
    id: "e4",
    date: "2026-07-31",
    category: "Salaries & Wages",
    vendor: "Payroll — July",
    amount: 4200000,
    method: "Bank",
    account: "CRDB Bank",
    reference: "PR-2026-07",
  },
  {
    id: "e5",
    date: "2026-07-28",
    category: "Maintenance & Repairs",
    vendor: "Kilimanjaro Foods Co.",
    amount: 65000,
    method: "Cash",
    account: "Cash on Hand",
    description: "Kitchen equipment repair",
  },
  {
    id: "e6",
    date: "2026-07-20",
    category: "Marketing",
    vendor: "TecPrint Suppliers",
    amount: 150000,
    method: "Bank",
    account: "NMB Bank",
    reference: "INV-6621",
    description: "Banner and flyer printing",
  },
];