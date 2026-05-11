"use client";

import { PaginationMeta } from "@/types/api.types";

interface PatientsPaginationProps {
    pagination: PaginationMeta;

    onPageChange: (page: number) => void;
}

export default function PatientsPagination({
    pagination,
    onPageChange,
}: PatientsPaginationProps) {

    const {
        page,
        totalPages,
        hasNext,
        hasPrev,
        total,
        limit,
    } = pagination;

    const start = (page - 1) * limit + 1;

    const end = Math.min(page * limit, total);

    return (
        <div className="mt-5 flex items-center justify-between text-sm text-muted-foreground">

            <span>
                {/* Showing 1 to 8 of 1,245 results */}
                Showing {start} to {end} of {total} results
            </span>

            <div className="flex items-center gap-1">

                <button className="rounded-lg px-3 py-1.5 transition-colors hover:bg-muted"
                    disabled={!hasPrev}
                    onClick={() => onPageChange(page - 1)}>
                    &lt;
                </button>

                {Array.from(
                    { length: totalPages },
                    (_, i) => i + 1
                ).map((pageNumber) => (

                    <button
                        key={pageNumber}
                        onClick={() => onPageChange(pageNumber)}
                        className={`rounded-lg px-3 py-1.5 transition-colors
              
              ${page === pageNumber
                                ? "bg-primary text-primary-foreground"
                                : "hover:bg-muted"
                            }
            `}
                    >
                        {pageNumber}
                    </button>

                ))}

                {/* <button className="rounded-lg bg-primary px-3 py-1.5 text-primary-foreground">
                    1
                </button>

                <button className="rounded-lg px-3 py-1.5 transition-colors hover:bg-muted">
                    2
                </button>

                <button className="rounded-lg px-3 py-1.5 transition-colors hover:bg-muted">
                    3
                </button>

                <span>...</span>

                <button className="rounded-lg px-3 py-1.5 transition-colors hover:bg-muted">
                    156
                </button> */}

                <button className="rounded-lg px-3 py-1.5 transition-colors hover:bg-muted"
                    disabled={!hasNext}
                    onClick={() => onPageChange(page + 1)}>
                    &gt;
                </button>

            </div>
        </div>
    );
}