"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { patientService } from "@/services/patient.service";
export const useCreatePatient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => patientService.createPatient(data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["patients"],
      });
    },
  });
};