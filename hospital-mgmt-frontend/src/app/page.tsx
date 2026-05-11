import Link from "next/link";
import { UserPlus, CalendarPlus, UserCheck, Receipt, Eye } from "lucide-react";

import PageContainer from "@/components/shared/PageContainer";
import StatCard from "@/components/shared/StatCard";
import StatusBadge from "@/components/shared/StatusBadge";
import { recentAppointments } from "@/data/mockData";


const stats = [
  { title: "Total Patients", value: "1,245", change: "12% from last month", changeType: "up" as const, icon: "Users", iconBg: "bg-primary/10", iconColor: "text-primary" },
  { title: "Appointments Today", value: "48", change: "8% from yesterday", changeType: "up" as const, icon: "Calendar", iconBg: "bg-success/10", iconColor: "text-success" },
  { title: "Total Doctors", value: "32", change: "5% from last month", changeType: "up" as const, icon: "Stethoscope", iconBg: "bg-info/10", iconColor: "text-info" },
  { title: "Total Revenue", value: "₹2,45,320", change: "15% from last month", changeType: "up" as const, icon: "IndianRupee", iconBg: "bg-destructive/10", iconColor: "text-destructive" },
];

const quickActions = [
  { label: "Add Patient", icon: UserPlus, path: "/patients/add", color: "bg-primary/5 text-primary hover:bg-primary/10" },
  { label: "New Appointment", icon: CalendarPlus, path: "/appointments", color: "bg-success/5 text-success hover:bg-success/10" },
  { label: "Add Doctor", icon: UserCheck, path: "/doctors", color: "bg-info/5 text-info hover:bg-info/10" },
  { label: "Generate Bill", icon: Receipt, path: "/billing", color: "bg-warning/5 text-warning hover:bg-warning/10" },
];

export default function Dashboard() {
  return (
    <PageContainer title="Dashboard">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => <StatCard key={s.title} {...s} />)}
      </div>

      {/* Appointments Overview + Patients by Department — replaced charts with stat blocks */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground">Appointments Overview</h3>
            <span className="rounded-lg border border-border px-3 py-1.5 text-xs text-muted-foreground">This Week</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Monday", val: 32 }, { label: "Tuesday", val: 45 },
              { label: "Wednesday", val: 60 }, { label: "Thursday", val: 82 },
              { label: "Friday", val: 38 }, { label: "Saturday", val: 40 },
              { label: "Sunday", val: 28 },
            ].map((d) => (
              <div key={d.label} className="flex items-center justify-between rounded-lg bg-muted/50 px-4 py-3">
                <span className="text-sm text-muted-foreground">{d.label}</span>
                <span className="text-sm font-semibold text-foreground">{d.val}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-foreground">Patients by Department</h3>
          <div className="space-y-3">
            {[
              { dept: "General Medicine", pct: 35, color: "bg-primary" },
              { dept: "Cardiology", pct: 25, color: "bg-success" },
              { dept: "Orthopedics", pct: 20, color: "bg-info" },
              { dept: "Pediatrics", pct: 10, color: "bg-warning" },
              { dept: "Others", pct: 10, color: "bg-muted-foreground" },
            ].map((d) => (
              <div key={d.dept}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="text-muted-foreground">{d.dept}</span>
                  <span className="font-medium text-foreground">{d.pct}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div className={`h-full rounded-full ${d.color} transition-all`} style={{ width: `${d.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Appointments + Quick Actions */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="col-span-1 rounded-xl border border-border bg-card p-6 shadow-sm lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground">Recent Appointments</h3>
            <Link href="/appointments" className="rounded-lg border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted">
              View All
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="pb-3 font-medium">Patient Name</th>
                  <th className="pb-3 font-medium">Doctor</th>
                  <th className="pb-3 font-medium">Department</th>
                  <th className="pb-3 font-medium">Date & Time</th>
                  <th className="pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentAppointments.map((a) => (
                  <tr key={a.id} className="border-b border-border last:border-0">
                    <td className="py-3 font-medium text-foreground">{a.patientName}</td>
                    <td className="py-3 text-muted-foreground">{a.doctor}</td>
                    <td className="py-3 text-muted-foreground">{a.department}</td>
                    <td className="py-3 text-muted-foreground whitespace-pre-line">{a.dateTime}</td>
                    <td className="py-3"><StatusBadge status={a.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-foreground">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((qa) => {
              const Icon = qa.icon;
              return (
                <Link
                  key={qa.label}
                  href={qa.path}
                  className={`flex flex-col items-center gap-2 rounded-xl border border-border p-4 text-center transition-colors ${qa.color}`}
                >
                  <Icon className="h-6 w-6" />
                  <span className="text-xs font-medium">{qa.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}