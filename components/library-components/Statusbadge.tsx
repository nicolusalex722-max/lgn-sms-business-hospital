const STYLES: Record<string, string> = {
  Available: "bg-emerald-50 text-emerald-600",
  "Low Stock": "bg-amber-50 text-amber-600",
  "Out of Stock": "bg-rose-50 text-rose-600",
  Pending: "bg-amber-50 text-amber-600",
  Approved: "bg-emerald-50 text-emerald-600",
  Rejected: "bg-rose-50 text-rose-600",
  Active: "bg-indigo-50 text-indigo-600",
  Overdue: "bg-rose-50 text-rose-600",
  Returned: "bg-slate-100 text-slate-500",
};

export default function StatusBadge({ label }: { label: string }) {
  const style = STYLES[label] ?? "bg-slate-100 text-slate-500";
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${style}`}>
      {label}
    </span>
  );
}