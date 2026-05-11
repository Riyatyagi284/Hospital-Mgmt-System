interface StatusBadgeProps {
  status: string;
}

const statusStyles: Record<string, string> = {
  Active: "bg-success/10 text-success",
  Inactive: "bg-destructive/10 text-destructive",
  Confirmed: "bg-success/10 text-success",
  Pending: "bg-warning/10 text-warning",
  Cancelled: "bg-destructive/10 text-destructive",
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[status] ?? "bg-muted text-muted-foreground"}`}>
      {status}
    </span>
  );
}