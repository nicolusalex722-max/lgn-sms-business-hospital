import type { DocStatus } from "@/lib/types";

const STYLES: Record<DocStatus, string> = {
  Paid: "bg-emerald-50 text-emerald-600",
  "Partially Paid": "bg-amber-50 text-amber-600",
  "Not Paid": "bg-rose-50 text-rose-600",
  Void: "bg-slate-100 text-slate-500",
};

export default function StatusBadge({ status }: { status: DocStatus }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${STYLES[status]}`}>
      {status}
    </span>
  );
}