import Sidebar from "@/components/dashboard/Sidebar";
import { requireCurrentUser } from "@/lib/auth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const currentUser = await requireCurrentUser();

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar
        user={{
          id: currentUser.id,
          email: currentUser.email,
          role: currentUser.role,
          companyId: currentUser.companyId
        }}
      />

      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}