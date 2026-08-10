import type { JournalEntry } from "./Journalentrymanager";

export const PENDING_ENTRY_KEY = "pendingJournalEntry";

// Replace with real Prisma queries once your backend exists.
export const ACCOUNT_OPTIONS = ["Cash at Bank", "Accounts Payable", "Sales Revenue", "Office Rent Expense", "Accounts Receivable"];
export const CURRENCY_OPTIONS = ["TZS - Tanzanian Shilling", "USD - US Dollar", "EUR - Euro"];

export const INITIAL_ENTRIES: JournalEntry[] = [
  {
    id: "je-001",
    reference: "JE-0001",
    date: "2026-08-01",
    currency: "TZS",
    description: "Cash sale of electronics",
    posted: true,
    lines: [
      { id: "je-001-l1", account: "Cash at Bank", description: "Deposit from cash sale", debit: 850000, credit: 0 },
      { id: "je-001-l2", account: "Sales Revenue", description: "Cash sale of electronics", debit: 0, credit: 850000 },
    ],
  },
  {
    id: "je-002",
    reference: "JE-0002",
    date: "2026-07-28",
    currency: "TZS",
    description: "Supplier invoice for stock",
    posted: false,
    lines: [
      { id: "je-002-l1", account: "Accounts Payable", description: "Supplier invoice for stock", debit: 0, credit: 320000 },
      { id: "je-002-l2", account: "Cash at Bank", description: "Stock purchase", debit: 320000, credit: 0 },
    ],
  },
];

export function getJournalEntryById(id: string): JournalEntry | undefined {
  return INITIAL_ENTRIES.find((e) => e.id === id);
}

export function generateReference(): string {
  const code = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `JE-${code}`;
}