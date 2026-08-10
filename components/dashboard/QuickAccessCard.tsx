import { ArrowRight } from "lucide-react";

interface QuickAccessCardProps {
  title: string;
  description: string;
  href: string;
  icon: React.ElementType;
}

export default function QuickAccessCard({
  title,
  description,
  href,
  icon: Icon,
}: QuickAccessCardProps) {
  return (
    <a
      href={href}
      className="group bg-white rounded-xl border border-slate-200 p-5 flex items-start gap-4 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all"
    >
      <div className="w-10 h-10 rounded-lg bg-slate-100 group-hover:bg-indigo-50 flex items-center justify-center shrink-0 transition-colors">
        <Icon className="w-5 h-5 text-slate-600 group-hover:text-indigo-600 transition-colors" />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
        <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{description}</p>
      </div>
      <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-0.5 transition-all shrink-0 mt-1" />
    </a>
  );
}