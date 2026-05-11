"use client";

import Link from "next/link";

import {
  Search,
  Plus,
} from "lucide-react";
import PatientsFilter from "./PatientsFilter";
import { usePatientStore } from "@/store/patient.store";

export default function PatientsToolbar() {

  const {
    queryParams,
    setQueryParams,
  } = usePatientStore();

  return (
    <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

      <h3 className="text-lg font-semibold text-foreground">
        All Patients
      </h3>

      <div className="flex items-center gap-3">

        <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2">

          <Search className="h-4 w-4 text-muted-foreground" />

          <input
            type="text"
            placeholder="Search patients..."
            value={queryParams.search || ""}
            onChange={(e) =>
              setQueryParams({
                ...queryParams,

                search: e.target.value,

                page: 1,
              })
            }
            className="bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>

        {/* <button className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">
          <SlidersHorizontal className="h-4 w-4" />
          Filters
        </button> */}

        <PatientsFilter />

        <Link
          href="/patients/add"
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Add Patient
        </Link>

      </div>
    </div>
  );
}