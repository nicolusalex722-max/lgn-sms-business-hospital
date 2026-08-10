const STATUS_STYLES: Record<string, string> = {
  Active: "border-emerald-300 text-emerald-700 bg-white",
  Trial: "border-amber-300 text-amber-700 bg-white",
  Expired: "border-rose-300 text-rose-700 bg-white",
  Cancelled: "border-slate-300 text-slate-500 bg-white",
};

export default function StatusBadge({ status }: { status: string }) {
  const style = STATUS_STYLES[status] ?? STATUS_STYLES["Cancelled"];
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${style}`}>
      {status}
    </span>
  );
}