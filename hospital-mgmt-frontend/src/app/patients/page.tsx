"use client";

import { useState } from "react";

import PageContainer from "@/components/shared/PageContainer";

import PatientsStats from "@/components/Shared/patients/PatientsStats";
import PatientsToolbar from "@/components/Shared/patients/PatientsToolbar";
import PatientsTable from "@/components/Shared/patients/PatientsTable";

export default function Patients() {
  const [search, setSearch] = useState("");

  return (
    <PageContainer title="Patients">

      {/* STATS */}
      <PatientsStats />

      {/* TABLE SECTION */}
      <div className="mt-6 rounded-xl border border-border bg-card p-6 shadow-sm">

        {/* TOOLBAR */}
        <PatientsToolbar
          search={search}
          setSearch={setSearch}
        />

        {/* TABLE */}
        <PatientsTable  />

      </div>
    </PageContainer>
  );
}