import { MapPin } from "lucide-react";

const BRANCHES = [
  { name: "Head Office", location: "Kariakoo, Dar es Salaam", manager: "Asha M." },
  { name: "Mwanza Branch", location: "Mwanza City", manager: "James K." },
];

export default function CompanyBranchesTab() {
  return (
    <div className="bg-white rounded-b-xl border border-slate-200 border-t-0 p-6">
      <h3 className="text-sm font-semibold text-slate-800 mb-4">Branches</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {BRANCHES.map((b) => (
          <div key={b.name} className="border border-slate-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-4 h-4 text-indigo-600" />
              <h4 className="text-sm font-semibold text-slate-800">{b.name}</h4>
            </div>
            <p className="text-xs text-slate-500">{b.location}</p>
            <p className="text-xs text-slate-400 mt-1">Manager: {b.manager}</p>
          </div>
        ))}
      </div>
    </div>
  );
}