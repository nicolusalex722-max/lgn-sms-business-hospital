import { Building2 } from "lucide-react";

const DEPARTMENTS = [
  { name: "Sales", head: "Asha M.", staffCount: 6 },
  { name: "Finance", head: "John D.", staffCount: 3 },
  { name: "Operations", head: "Neema K.", staffCount: 5 },
];

export default function CompanyDepartmentsTab() {
  return (
    <div className="bg-white rounded-b-xl border border-slate-200 border-t-0 p-6">
      <h3 className="text-sm font-semibold text-slate-800 mb-4">Departments</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="text-left font-medium text-slate-400 px-3 py-3">Department</th>
              <th className="text-left font-medium text-slate-400 px-3 py-3">Head</th>
              <th className="text-left font-medium text-slate-400 px-3 py-3">Staff Count</th>
            </tr>
          </thead>
          <tbody>
            {DEPARTMENTS.map((d) => (
              <tr key={d.name} className="border-b border-slate-100 last:border-b-0">
                <td className="px-3 py-3.5 flex items-center gap-2 font-medium text-slate-800">
                  <Building2 className="w-4 h-4 text-slate-400" />
                  {d.name}
                </td>
                <td className="px-3 py-3.5 text-slate-600">{d.head}</td>
                <td className="px-3 py-3.5 text-slate-600">{d.staffCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}