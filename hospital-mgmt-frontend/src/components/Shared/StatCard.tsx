'use client';

import {
  Users,
  UserPlus,
  UserCheck,
  UserX,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  Stethoscope,
  IndianRupee,
  TrendingUp,
  TrendingDown,
} from "lucide-react";


const iconMap: Record<string, React.ElementType> = {
  Users, UserPlus, UserCheck, UserX, Calendar, Clock, CheckCircle2, XCircle,
  Stethoscope, IndianRupee, TrendingUp, TrendingDown,
};

interface StatCardProps {
  title: string;
  value: string | number;
  change: string;
  changeType: "up" | "down";
  icon: string;
  iconBg: string;
  iconColor: string;
}

export default function StatCard({
  title, value, change, changeType, icon, iconBg, iconColor,
}: StatCardProps) {
  const Icon = iconMap[icon] || Users;

  return (
    <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className={`flex h-14 w-14 items-center justify-center rounded-full ${iconBg}`}>
        <Icon className={`h-6 w-6 ${iconColor}`} />
      </div>
      <div>
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="text-2xl font-bold text-foreground">{value}</p>
        <p className={`mt-0.5 text-xs font-medium ${changeType === "up" ? "text-success" : "text-destructive"}`}>
          {changeType === "up" ? "↑" : "↓"} {change}
        </p>
      </div>
    </div>
  );
}