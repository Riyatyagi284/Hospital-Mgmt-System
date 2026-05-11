"use client";

interface LoadingStateProps {
  count?: number;
}

export default function LoadingState({
  count = 4,
}: LoadingStateProps) {

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">

      {Array.from({ length: count }).map((_, index) => (

        <div
          key={index}
          className="rounded-xl border border-border bg-card p-5 shadow-sm animate-pulse"
        >
          <div className="mb-4 h-5 w-24 rounded bg-muted"></div>

          <div className="h-8 w-16 rounded bg-muted"></div>
        </div>

      ))}

    </div>
  );
}