import { Settings, MoreHorizontal, ArrowRight } from "lucide-react";

interface FeeRow {
  studId: string;
  name: string;
  feeType: string;
  amount: string;
  status: "Paid" | "Not paid";
  initials: string;
  avatarBg: string;
}

const FEE_DATA: FeeRow[] = [
  { studId: "8A0168", name: "John Doe", feeType: "Monthly Fee", amount: "$1436", status: "Paid", initials: "JD", avatarBg: "bg-indigo-200" },
  { studId: "9C0189", name: "Jenny Wilson", feeType: "Annual Exam Fee", amount: "$800", status: "Not paid", initials: "JW", avatarBg: "bg-rose-200" },
  { studId: "6D0211", name: "Robert Fox", feeType: "Class Test", amount: "$275", status: "Not paid", initials: "RF", avatarBg: "bg-emerald-200" },
  { studId: "9B0078", name: "Jacob Jones", feeType: "Monthly Fee", amount: "$1436", status: "Paid", initials: "JJ", avatarBg: "bg-amber-200" },
  { studId: "7A0022", name: "Wade Warren", feeType: "Monthly Fee", amount: "$1436", status: "Paid", initials: "WW", avatarBg: "bg-sky-200" },
];

function StatusPill({ status }: { status: "Paid" | "Not paid" }) {
  const style =
    status === "Paid"
      ? "bg-emerald-100 text-emerald-700"
      : "bg-rose-100 text-rose-600";
  return (
    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${style}`}>
      {status}
    </span>
  );
}

export default function FeeDetailsTable() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-slate-800">Fee Details</h3>
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
              <th className="text-left font-medium text-slate-500 px-3 py-2.5">Fee Type</th>
              <th className="text-left font-medium text-slate-500 px-3 py-2.5">Fee Amount</th>
              <th className="text-left font-medium text-slate-500 px-3 py-2.5 rounded-r-lg">Status</th>
            </tr>
          </thead>
          <tbody>
            {FEE_DATA.map((row) => (
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
                <td className="px-3 py-3 text-slate-600">{row.feeType}</td>
                <td className="px-3 py-3 text-slate-700">{row.amount}</td>
                <td className="px-3 py-3">
                  <StatusPill status={row.status} />
                </td>
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