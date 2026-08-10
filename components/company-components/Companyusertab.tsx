const USERS = [
  { name: "Asha M.", email: "asha@warisecondaryschool.com", role: "Admin", status: "Active" },
  { name: "John D.", email: "john@warisecondaryschool.com", role: "Finance", status: "Active" },
  { name: "Neema K.", email: "neema@warisecondaryschool.com", role: "Staff", status: "Inactive" },
  { name: "James K.", email: "james@warisecondaryschool.com", role: "Teacher", status: "Active" },
  {name: "Fatuma A.", email: "fatuma@warisecondaryschool.com", role: "Parent", status: "Active"}
];

const STATUS_STYLES: Record<string, string> = {
  Active: "border-emerald-300 text-emerald-700 bg-white",
  Inactive: "border-slate-300 text-slate-500 bg-white",
};

export default function CompanyUsersTab() {
  return (
    <div className="bg-white rounded-b-xl border border-slate-200 border-t-0 p-6">
      <h3 className="text-sm font-semibold text-slate-800 mb-4">Users</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="text-left font-medium text-slate-400 px-3 py-3">Name</th>
              <th className="text-left font-medium text-slate-400 px-3 py-3">Email</th>
              <th className="text-left font-medium text-slate-400 px-3 py-3">Role</th>
              <th className="text-left font-medium text-slate-400 px-3 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {USERS.map((u) => (
              <tr key={u.email} className="border-b border-slate-100 last:border-b-0">
                <td className="px-3 py-3.5 font-medium text-slate-800">{u.name}</td>
                <td className="px-3 py-3.5 text-slate-600">{u.email}</td>
                <td className="px-3 py-3.5 text-slate-600">{u.role}</td>
                <td className="px-3 py-3.5">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${STATUS_STYLES[u.status]}`}>
                    {u.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}