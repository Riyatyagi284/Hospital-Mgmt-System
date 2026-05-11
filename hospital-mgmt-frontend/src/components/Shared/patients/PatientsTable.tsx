"use client";

import PatientsTableRow from "./PatientsTableRow";

import { usePatients, useDeletePatient } from '@/hooks/usePatients';
import { usePatientStore } from '@/store/patient.store';
import { Patient } from '@/types/api.types';
import LoadingState from "@/components/feedback/LoadingStats";
import ErrorState from "@/components/feedback/ErrorState";
import EmptyState from "@/components/feedback/EmptyState";
import PatientsPagination from "./PatientsPagination";

interface PatientsTableProps {
    patients: Patient[];
}

export default function PatientsTable({
    patients,
}: PatientsTableProps) {
    const { queryParams, setQueryParams, setSelectedPatientId, setIsCreateModalOpen } =
        usePatientStore();
    const { data, isLoading, error } = usePatients(queryParams);
    const deletePatient = useDeletePatient();
    
    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this patient?')) {
            await deletePatient.mutateAsync(id);
        }
    };

    const handleEdit = (patient: Patient) => {
        setSelectedPatientId(patient.id);
        setIsCreateModalOpen(true);
    };

    if (isLoading) {
        return (
            <LoadingState />
        );
    }

    if (error) {
        return (
            <ErrorState message="Failed to load patients list" />
        );
    }

    if (!data.data || data.data.length === 0) {
        return (
            <EmptyState
                title="No Patients Found"
                description="No patients are available right now."
            />
        );
    }

    return (
        <div className="overflow-x-auto">

            <table className="w-full text-sm">

                <thead>
                    <tr className="border-b border-border text-left text-muted-foreground">

                        <th className="pb-3 font-medium">#</th>
                        <th className="pb-3 font-medium">Patient Name</th>
                        <th className="pb-3 font-medium">Gender</th>
                        <th className="pb-3 font-medium">Age</th>
                        <th className="pb-3 font-medium">Phone</th>
                        <th className="pb-3 font-medium">Email</th>
                        <th className="pb-3 font-medium">Last Visit</th>
                        <th className="pb-3 font-medium">Status</th>
                        <th className="pb-3 font-medium">Actions</th>

                    </tr>
                </thead>

                <tbody>
                    {data.data.map((patient, index) => (
                        <PatientsTableRow
                            key={patient.id}
                            patient={patient}
                            index={index}
                            onDelete={handleDelete}
                            onEdit={handleEdit}
                        />
                    ))}

                </tbody>

            </table>

            <PatientsPagination
                pagination={data.pagination}
                onPageChange={(page) =>
                    setQueryParams({
                        ...queryParams,
                        page,
                    })
                }
            />
        </div>
    );
}