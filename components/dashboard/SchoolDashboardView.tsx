import SchoolStatCards from "@/components/dashboard/SchoolStatCards";
import TotalEarningsChart from "@/components/dashboard/Charts";
//import FeeDetailsTable from "@/components/dashboard/FeeDetailsTable";
import TopPerformersTable from "@/components/dashboard/TopPerformersTable";
import EventsCalendar from "@/components/dashboard/EventsCalendar";
import AttendanceDonut from "@/components/dashboard/AttendanceDonut";

export default function SchoolDashboardView() {
  return (
    <div className="flex flex-col gap-4">
      <SchoolStatCards />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
        <div className="lg:col-span-2 flex flex-col gap-4">
          <TotalEarningsChart />
          {/* <FeeDetailsTable /> */}
          <TopPerformersTable />
        </div>
        <div className="flex flex-col gap-4">
          <EventsCalendar />
          <AttendanceDonut />
        </div>
      </div>
    </div>
  );
}