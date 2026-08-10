import type { TransactionType } from "@/lib/types";

const STYLES: Record<TransactionType, string> = {
  Receive: "bg-emerald-50 text-emerald-600",
  Pay: "bg-rose-50 text-rose-600",
  Transfer: "bg-indigo-50 text-indigo-600",
};

export default function TransactionTypeBadge({ type }: { type: TransactionType }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${STYLES[type]}`}>
      {type}
    </span>
  );
}