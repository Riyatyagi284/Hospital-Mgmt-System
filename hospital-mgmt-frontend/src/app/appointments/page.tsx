"use client";

import { useState } from "react";
import { Search, SlidersHorizontal, Plus, Eye, Pencil, XCircle, Calendar as CalendarIcon } from "lucide-react";
import PageContainer from "@/components/shared/PageContainer";
import StatCard from "@/components/shared/StatCard";
import StatusBadge from "@/components/shared/StatusBadge";
import { appointments } from "@/data/mockData";

const stats = [
  { title: "Total Appointments", value: "1,245", change: "12% from last month", changeType: "up" as const, icon: "Calendar", iconBg: "bg-primary/10", iconColor: "text-primary" },
  { title: "Appointments Today", value: "48", change: "8% from yesterday", changeType: "up" as const, icon: "CheckCircle2", iconBg: "bg-success/10", iconColor: "text-success" },
  { title: "Upcoming Appointments", value: "156", change: "15% from yesterday", changeType: "up" as const, icon: "Clock", iconBg: "bg-info/10", iconColor: "text-info" },
  { title: "Cancelled Appointments", value: "24", change: "5% from yesterday", changeType: "down" as const, icon: "XCircle", iconBg: "bg-destructive/10", iconColor: "text-destructive" },
];

const tabs = ["All", "Today", "Upcoming", "Completed", "Cancelled"] as const;

export default function Appointments() {
  const [activeTab, setActiveTab] = useState<string>("All");

  return (
    <PageContainer title="Appointments">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => <StatCard key={s.title} {...s} />)}
      </div>

      <div className="mt-6 rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-lg font-semibold text-foreground">Appointments List</h3>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm text-muted-foreground">
              <CalendarIcon className="h-4 w-4" />
              20 May 2024 - 26 May 2024
            </div>
            <button className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">
              <SlidersHorizontal className="h-4 w-4" /> Filters
            </button>
            <button className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
              <Plus className="h-4 w-4" /> New Appointment
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-5 flex items-center gap-2">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                activeTab === tab
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {tab}
            </button>
          ))}
          <div className="ml-auto">
            <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search appointments..."
                className="bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted-foreground">
                <th className="pb-3 font-medium">#</th>
                <th className="pb-3 font-medium">Patient Name</th>
                <th className="pb-3 font-medium">Doctor</th>
                <th className="pb-3 font-medium">Department</th>
                <th className="pb-3 font-medium">Date & Time</th>
                <th className="pb-3 font-medium">Purpose</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((a, i) => (
                <tr key={a.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="py-3 text-muted-foreground">{i + 1}</td>
                  <td className="py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                        {a.patientName.split(" ").map((n) => n[0]).join("")}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{a.patientName}</p>
                        <p className="text-xs text-muted-foreground">PID: {a.patientPid}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3">
                    <p className="text-foreground">{a.doctor}</p>
                    <p className="text-xs text-muted-foreground">{a.doctorSpecialty}</p>
                  </td>
                  <td className="py-3 text-muted-foreground">{a.department}</td>
                  <td className="py-3 text-muted-foreground whitespace-pre-line">{a.dateTime}</td>
                  <td className="py-3 text-muted-foreground">{a.purpose}</td>
                  <td className="py-3"><StatusBadge status={a.status} /></td>
                  <td className="py-3">
                    <div className="flex items-center gap-1">
                      <button className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-primary"><Eye className="h-4 w-4" /></button>
                      <button className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-primary"><Pencil className="h-4 w-4" /></button>
                      <button className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-destructive"><XCircle className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="mt-5 flex items-center justify-between text-sm text-muted-foreground">
          <span>Showing 1 to 8 of 1,245 results</span>
          <div className="flex items-center gap-1">
            <button className="rounded-lg px-3 py-1.5 transition-colors hover:bg-muted">&lt;</button>
            <button className="rounded-lg bg-primary px-3 py-1.5 text-primary-foreground">1</button>
            <button className="rounded-lg px-3 py-1.5 transition-colors hover:bg-muted">2</button>
            <button className="rounded-lg px-3 py-1.5 transition-colors hover:bg-muted">3</button>
            <span>...</span>
            <button className="rounded-lg px-3 py-1.5 transition-colors hover:bg-muted">156</button>
            <button className="rounded-lg px-3 py-1.5 transition-colors hover:bg-muted">&gt;</button>
          </div>
        </div>
      </div>

      {/* Bottom summary cards */}
      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Today's Schedule", val: 48, sub: "Appointments", color: "text-primary", bg: "bg-primary/10" },
          { label: "Upcoming (Next 7 Days)", val: 156, sub: "Appointments", color: "text-warning", bg: "bg-warning/10" },
          { label: "Completed (This Month)", val: 892, sub: "Appointments", color: "text-success", bg: "bg-success/10" },
          { label: "Cancelled (This Month)", val: 24, sub: "Appointments", color: "text-destructive", bg: "bg-destructive/10" },
        ].map((c) => (
          <div key={c.label} className="flex items-center gap-4 rounded-xl border border-border bg-card p-5 shadow-sm">
            <div className={`flex h-12 w-12 items-center justify-center rounded-full ${c.bg}`}>
              <CalendarIcon className={`h-5 w-5 ${c.color}`} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{c.label}</p>
              <p className={`text-2xl font-bold ${c.color}`}>{c.val}</p>
              <p className="text-xs text-muted-foreground">{c.sub}</p>
            </div>
          </div>
        ))}
      </div>
    </PageContainer>
  );
}