import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { Account } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export function money(n: number, currency: string) {
  const sign = n < 0 ? "-" : "";
  return `${sign}${currency} ${Math.abs(Math.round(n)).toLocaleString()}.00`;
}

export function balanceOf(account: Account) {
  return account.transactions.reduce((sum, t) => sum + t.debit - t.credit, 0);
}

//Billing & Invoice
import type { BillingDocument, DocStatus } from "./types";

export function lineTotal(item: BillingDocument["items"][number]) {
  return item.qty * item.unitPrice - item.discount;
}

export function computeTotals(doc: BillingDocument) {
  const subtotal = doc.items.reduce((sum, i) => sum + lineTotal(i), 0);
  const tax = subtotal * (doc.taxRate / 100);
  const total = subtotal + tax;
  const amountPaid = doc.payments.reduce((sum, p) => sum + p.amount, 0);
  const balanceDue = Math.max(0, Math.round((total - amountPaid) * 100) / 100);
  return { subtotal, tax, total, amountPaid, balanceDue };
}

export function computeStatus(doc: BillingDocument): DocStatus {
  if (doc.voided) return "Void";
  const { total, amountPaid } = computeTotals(doc);
  if (amountPaid <= 0) return "Not Paid";
  if (amountPaid >= total) return "Paid";
  return "Partially Paid";
}

export function formatTZS(n: number) {
  return `TSh ${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatDateDMY(iso: string) {
  const d = new Date(iso);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function isOverdue(doc: BillingDocument) {
  const status = computeStatus(doc);
  if (status === "Paid" || status === "Void") return false;
  return doc.dueDate < todayISO();
}


//Budget
import type { Budget, BudgetStatus } from "./types";

export function computeSpent(budget: Budget) {
  return budget.movements.reduce((sum, m) => sum + m.amount, 0);
}

export function computeBudgetTotals(budget: Budget) {
  const spent = computeSpent(budget);
  const remaining = budget.allocated - spent;
  const percentUsed = budget.allocated > 0 ? (spent / budget.allocated) * 100 : 0;
  return { spent, remaining, percentUsed };
}

export function computeBudgetStatus(budget: Budget): BudgetStatus {
  const { percentUsed } = computeBudgetTotals(budget);
  if (percentUsed > 100) return "Over Budget";
  if (percentUsed >= 80) return "Near Limit";
  return "On Track";
}

//Attendance
import type { AttendanceRecord } from "./types";


export function recordStats(record: AttendanceRecord) {
  const present = record.entries.filter((e) => e.status === "Present").length;
  const absent = record.entries.filter((e) => e.status === "Absent").length;
  const total = record.entries.length;
  const rate = total > 0 ? (present / total) * 100 : 0;
  return { present, absent, total, rate };
}