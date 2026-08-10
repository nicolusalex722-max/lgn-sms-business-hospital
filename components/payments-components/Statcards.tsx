export default function StatCard({
  label,
  value,
  helper,
  accent = "slate",
}: {
  label: string;
  value: string | number;
  helper?: string;
  accent?: "slate" | "emerald" | "rose" | "indigo";
}) {
  const valueColor: Record<string, string> = {
    slate: "text-slate-900",
    emerald: "text-emerald-600",
    rose: "text-rose-600",
    indigo: "text-indigo-600",
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className={`mt-2 text-2xl font-bold ${valueColor[accent]}`}>{value}</p>
      {helper && <p className="mt-1 text-xs text-slate-400">{helper}</p>}
    </div>
  );
}