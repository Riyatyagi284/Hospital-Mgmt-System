"use client";

import { useState } from "react";

import { SlidersHorizontal, X } from "lucide-react";

import { usePatientStore } from "@/store/patient.store";

export default function PatientsFilter() {

  const [isOpen, setIsOpen] = useState(false);

  const {
    queryParams,
    setQueryParams,
  } = usePatientStore();

  return (
    <div className="relative">

      {/* Filter Button */}

      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
      >
        <SlidersHorizontal className="h-4 w-4" />

        Filters
      </button>

      {/* Dropdown */}

      {isOpen && (

        <div className="absolute right-0 z-50 mt-3 w-80 rounded-xl border border-border bg-card p-5 shadow-xl">

          {/* Header */}

          <div className="mb-5 flex items-center justify-between">

            <h3 className="text-base font-semibold text-foreground">
              Filters
            </h3>

            <button
              onClick={() => setIsOpen(false)}
              className="rounded-md p-1 transition-colors hover:bg-muted"
            >
              <X className="h-4 w-4" />
            </button>

          </div>

          {/* Status */}

          <div className="mb-4">

            <label className="mb-2 block text-sm font-medium text-foreground">
              Status
            </label>

            <select
              value={queryParams.status || ""}
              onChange={(e) =>
                setQueryParams({
                  ...queryParams,
                  status: e.target.value || undefined,
                  page: 1,
                })
              }
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            >
              <option value="">All Status</option>

              <option value="ACTIVE">
                Active
              </option>

              <option value="INACTIVE">
                Inactive
              </option>

            </select>

          </div>

          {/* Sort By */}

          <div className="mb-4">

            <label className="mb-2 block text-sm font-medium text-foreground">
              Sort By
            </label>

            <select
              value={queryParams.sortBy || "createdAt"}
              onChange={(e) =>
                setQueryParams({
                  ...queryParams,
                  sortBy: e.target.value,
                })
              }
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            >
              <option value="createdAt">
                Created At
              </option>

              <option value="firstName">
                First Name
              </option>

              <option value="age">
                Age
              </option>

            </select>

          </div>

          {/* Sort Order */}

          <div className="mb-5">

            <label className="mb-2 block text-sm font-medium text-foreground">
              Sort Order
            </label>

            <select
              value={queryParams.sortOrder || "DESC"}
              onChange={(e) =>
                setQueryParams({
                  ...queryParams,
                  sortOrder: e.target.value,
                })
              }
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            >
              <option value="ASC">
                Ascending
              </option>

              <option value="DESC">
                Descending
              </option>

            </select>

          </div>

          {/* Footer */}

          <div className="flex items-center justify-between gap-3">

            <button
              onClick={() =>
                setQueryParams({
                  page: 1,
                  limit: 10,
                })
              }
              className="flex-1 rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
            >
              Reset
            </button>

            <button
              onClick={() => setIsOpen(false)}
              className="flex-1 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Apply
            </button>

          </div>

        </div>

      )}

    </div>
  );
}