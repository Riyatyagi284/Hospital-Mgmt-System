"use client";

import { usePatientStats } from "@/hooks/usePatients";

import StatCard from "@/components/shared/StatCard";
import LoadingState from "@/components/feedback/LoadingStats";
import ErrorState from "@/components/feedback/ErrorState";

export default function PatientsStats() {

  const {
    data: statsData,
    isLoading,
    error,
  } = usePatientStats();

  const stats = [
    {
      title: "Total Patients",
      value: statsData?.totalPatients || 0,
      change: `${statsData?.percentageChange.total || 0}% from last month`,
      changeType: "up" as const,
      icon: "Users",
      iconBg: "bg-primary/10",
      iconColor: "text-primary",
    },
    {
      title: "New Patients (This Month)",
      value: statsData?.newPatientsThisMonth || 0,
      change: `${statsData?.percentageChange.new || 0}% from last month`,
      changeType: "up" as const,
      icon: "UserPlus",
      iconBg: "bg-success/10",
      iconColor: "text-success",
    },
    {
      title: "Active Patients",
      value: statsData?.activePatients || 0,
      change: `${statsData?.percentageChange.active || 0}% from last month`,
      changeType: "up" as const,
      icon: "UserCheck",
      iconBg: "bg-info/10",
      iconColor: "text-info",
    },
    {
      title: "Inactive Patients",
      value: statsData?.inactivePatients || 0,
      change: `${statsData?.percentageChange.inactive || 0}% from last month`,
      changeType: "down" as const,
      icon: "UserX",
      iconBg: "bg-destructive/10",
      iconColor: "text-destructive",
    },
  ];

  if (isLoading) {
    return (
    <LoadingState />
    )
  }

  if (error) {
    return (
    <ErrorState message="Failed to load patient statistics" />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">

      {stats.map((stat) => (
        <StatCard
          key={stat.title}
          {...stat}
        />
      ))}

    </div>
  );
}