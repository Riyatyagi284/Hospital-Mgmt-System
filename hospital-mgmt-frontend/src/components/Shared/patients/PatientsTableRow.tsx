"use client";

import {
    Eye,
    Pencil,
    Trash2,
} from "lucide-react";

import StatusBadge from "@/components/shared/StatusBadge";
import { Patient } from "@/types";


interface PatientsTableRowProps {
    patient: Patient;
    index: number;
    onDelete: (id: string) => void;

    onEdit: (patient: Patient) => void;
}

export default function PatientsTableRow({
    patient,
    index,
}: PatientsTableRowProps) {

    return (
        <tr className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">

            <td className="py-3 text-muted-foreground">
                {index + 1}
            </td>

            <td className="py-3">

                <div className="flex items-center gap-3">

                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">

                        {/* {patient.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")} */}

                        {`${patient.firstName} ${patient.lastName}`
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}

                    </div>

                    <div>

                        <p className="font-medium text-foreground">
                            {patient.firstName} {patient.lastName}
                        </p>

                        <p className="text-xs text-muted-foreground">
                            PID: {patient.id}
                        </p>

                    </div>
                </div>
            </td>

            <td className="py-3 text-muted-foreground">
                {patient.gender}
            </td>

            <td className="py-3 text-muted-foreground">
                {patient.age}
            </td>

            <td className="py-3 text-muted-foreground">
                {patient.phoneNumber}
            </td>

            <td className="py-3 text-muted-foreground">
                {patient.emailAddress}
            </td>

            <td className="py-3 text-muted-foreground">
                {patient.lastVisit}
            </td>

            <td className="py-3">
                <StatusBadge status={patient.status} />
            </td>

            <td className="py-3">

                <div className="flex items-center gap-1">

                    <button className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-primary hover:text-white">
                        <Eye className="h-4 w-4" />
                    </button>

                    <button className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-green-500 hover:text-white">
                        <Pencil className="h-4 w-4" onClick={() => onEdit(patient)} />
                    </button>

                    <button className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-destructive hover:text-white">
                        <Trash2 className="h-4 w-4" onClick={() => onDelete(patient.id)} />
                    </button>

                </div>
            </td>
        </tr>
    );
}