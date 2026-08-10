interface InfoRowProps {
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  label: string;
  value: string;
}

export function InfoRow({ icon: Icon, iconBg, iconColor, label, value }: InfoRowProps) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-slate-100 last:border-b-0">
      <div className="flex items-center gap-3">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${iconBg}`}>
          <Icon className={`w-4 h-4 ${iconColor}`} />
        </div>
        <span className="text-sm text-slate-500">{label}</span>
      </div>
      <span className="text-sm font-medium text-slate-800 text-right">{value || "\u2014"}</span>
    </div>
  );
}

interface InfoCardProps {
  title: string;
  children: React.ReactNode;
}

export function InfoCard({ title, children }: InfoCardProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <h3 className="text-sm font-semibold text-slate-800 mb-1">{title}</h3>
      <div className="mt-3">{children}</div>
    </div>
  );
}