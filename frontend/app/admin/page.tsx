import { AdminHeader } from "@/components/admin/admin-header";
import { FleetStats } from "@/components/admin/fleet-stats";
import { MachineTable } from "@/components/admin/machine-table";
import { RecentInspections } from "@/components/admin/recent-inspections";

export default function AdminDashboard() {
  return (
    <div className="min-h-screen">
      <AdminHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-white mb-2">Fleet Overview</h1>
          <p className="text-white/60">
            Monitor all machines and inspection statuses across your sites.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="mb-8">
          <FleetStats />
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Machine Table - Takes 2 columns */}
          <div className="lg:col-span-2">
            <MachineTable />
          </div>

          {/* Recent Inspections - Takes 1 column */}
          <div className="lg:col-span-1">
            <RecentInspections />
          </div>
        </div>
      </main>
    </div>
  );
}
