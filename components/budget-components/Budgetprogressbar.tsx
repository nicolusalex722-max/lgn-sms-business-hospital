import type { BudgetStatus } from "@/lib/types";

const BAR_COLOR: Record<BudgetStatus, string> = {
  "On Track": "bg-emerald-500",
  "Near Limit": "bg-amber-500",
  "Over Budget": "bg-rose-500",
};

export default function ProgressBar({
  percent,
  status,
}: {
  percent: number;
  status: BudgetStatus;
}) {
  const clamped = Math.max(0, Math.min(100, percent));

  return (
    <div className="w-full min-w-[140px]">
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full transition-all ${BAR_COLOR[status]}`}
          style={{ width: `${clamped}%` }}
        />
      </div>
      <p className="mt-1 text-xs text-slate-400">
        {percent > 100 ? (
          <span className="font-medium text-rose-500">{Math.round(percent - 100)}% over</span>
        ) : (
          `${Math.round(percent)}% used`
        )}
      </p>
    </div>
  );
}