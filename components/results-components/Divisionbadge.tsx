import type { Division } from "@/lib/types";

const STYLES: Record<Division, string> = {
  I: "bg-emerald-50 text-emerald-600",
  II: "bg-teal-50 text-teal-600",
  III: "bg-amber-50 text-amber-600",
  IV: "bg-orange-50 text-orange-600",
  "0": "bg-rose-50 text-rose-600",
};

export default function DivisionBadge({ division }: { division: Division }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${STYLES[division]}`}>
      Division {division}
    </span>
  );
}