"use client";

interface EmptyStateProps {
  title?: string;
  description?: string;
}

export default function EmptyState({
  title = "No Data Found",
  description = "There is no data available right now.",
}: EmptyStateProps) {

  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border p-10 text-center">

      <h3 className="text-lg font-semibold text-foreground">
        {title}
      </h3>

      <p className="mt-2 text-sm text-muted-foreground">
        {description}
      </p>

    </div>
  );
}