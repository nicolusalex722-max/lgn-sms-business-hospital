import { getClientType } from "@/lib/clientType";
import DashboardShell from "@/components/dashboard/DashboardShell";

export default async function DashboardPage() {
  const clientType = await getClientType();

  return <DashboardShell clientType={clientType} />;
}