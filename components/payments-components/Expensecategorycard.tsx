const COLORS = [
  "bg-indigo-50 text-indigo-600",
  "bg-emerald-50 text-emerald-600",
  "bg-amber-50 text-amber-600",
  "bg-rose-50 text-rose-600",
  "bg-sky-50 text-sky-600",
  "bg-violet-50 text-violet-600",
  "bg-teal-50 text-teal-600",
  "bg-orange-50 text-orange-600",
  "bg-slate-100 text-slate-600",
];

function colorFor(category: string) {
  let hash = 0;
  for (let i = 0; i < category.length; i++) hash = (hash * 31 + category.charCodeAt(i)) >>> 0;
  return COLORS[hash % COLORS.length];
}

export default function CategoryBadge({ category }: { category: string }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${colorFor(category)}`}>
      {category}
    </span>
  );
}