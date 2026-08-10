import type { BudgetStatus } from "@/lib/types";

const STYLES: Record<BudgetStatus, string> = {
  "On Track": "bg-emerald-50 text-emerald-600",
  "Near Limit": "bg-amber-50 text-amber-600",
  "Over Budget": "bg-rose-50 text-rose-600",
};

export default function StatusBadge({ status }: { status: BudgetStatus }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${STYLES[status]}`}>
      {status}
    </span>
  );
}