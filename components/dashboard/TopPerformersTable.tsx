import { Settings, MoreHorizontal, ArrowRight } from "lucide-react";

interface PerformerRow {
  studId: string;
  name: string;
  classSection: string;
  percentage: string;
  rank: string;
  initials: string;
  avatarBg: string;
}

const PERFORMER_DATA: PerformerRow[] = [
  { studId: "8A0168", name: "Ralph Edwards", classSection: "8.A", percentage: "98.5%", rank: "1st Rank", initials: "RE", avatarBg: "bg-indigo-200" },
  { studId: "9C0189", name: "Jane Cooper", classSection: "9.C", percentage: "97%", rank: "3rd Rank", initials: "JC", avatarBg: "bg-rose-200" },
  { studId: "8D0072", name: "Wade Warren", classSection: "8.D", percentage: "96.25%", rank: "1st Rank", initials: "WW", avatarBg: "bg-sky-200" },
  { studId: "6B0231", name: "Cody Fisher", classSection: "6.B", percentage: "97.83%", rank: "2nd Rank", initials: "CF", avatarBg: "bg-amber-200" },
  { studId: "7D0147", name: "Kristin Watson", classSection: "7.D", percentage: "96.46%", rank: "1st Rank", initials: "KW", avatarBg: "bg-emerald-200" },
];

export default function TopPerformersTable() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-slate-800">Top Performers</h3>
        <div className="flex items-center gap-3 text-slate-400">
          <button type="button" aria-label="Settings" className="hover:text-slate-600">
            <Settings className="w-4.5 h-4.5" />
          </button>
          <button type="button" aria-label="More options" className="hover:text-slate-600">
            <MoreHorizontal className="w-4.5 h-4.5" />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50">
              <th className="text-left font-medium text-slate-500 px-3 py-2.5 rounded-l-lg">Stud ID</th>
              <th className="text-left font-medium text-slate-500 px-3 py-2.5">Name</th>
              <th className="text-left font-medium text-slate-500 px-3 py-2.5">Class.Section</th>
              <th className="text-left font-medium text-slate-500 px-3 py-2.5">Percentage</th>
              <th className="text-left font-medium text-slate-500 px-3 py-2.5 rounded-r-lg">Class Rank</th>
            </tr>
          </thead>
          <tbody>
            {PERFORMER_DATA.map((row) => (
              <tr key={row.studId} className="border-b border-slate-100 last:border-b-0">
                <td className="px-3 py-3 text-slate-500">{row.studId}</td>
                <td className="px-3 py-3">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-slate-700 ${row.avatarBg}`}
                    >
                      {row.initials}
                    </span>
                    <span className="font-medium text-slate-800">{row.name}</span>
                  </div>
                </td>
                <td className="px-3 py-3 text-slate-600">{row.classSection}</td>
                <td className="px-3 py-3">
                  <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-600">
                    {row.percentage}
                  </span>
                </td>
                <td className="px-3 py-3 text-slate-600">{row.rank}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button
        type="button"
        className="mt-4 flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
      >
        See All
        <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}