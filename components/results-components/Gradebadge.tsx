import type { Grade } from "@/lib/types";

const STYLES: Record<Grade, string> = {
  A: "bg-emerald-50 text-emerald-600",
  "B+": "bg-teal-50 text-teal-600",
  B: "bg-sky-50 text-sky-600",
  C: "bg-amber-50 text-amber-600",
  D: "bg-orange-50 text-orange-600",
  F: "bg-rose-50 text-rose-600",
};

export default function GradeBadge({ grade }: { grade: Grade }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${STYLES[grade]}`}>
      {grade}
    </span>
  );
}