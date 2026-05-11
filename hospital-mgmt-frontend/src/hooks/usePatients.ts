import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { patientService } from '@/services/patient.service';
import { queryKeys } from '@/constants/queryKeys';
import { PatientQueryParams, CreatePatientDTO, UpdatePatientDTO } from '@/types/api.types';
import { toast } from 'react-hot-toast'; 

export const usePatients = (params: PatientQueryParams) => {
  return useQuery({
    queryKey: queryKeys.patients.list(params),
    queryFn: () => patientService.getPatients(params),
    staleTime: 5 * 60 * 1000, 
  });
};

export const usePatient = (id: string) => {
  return useQuery({
    queryKey: queryKeys.patients.detail(id),
    queryFn: () => patientService.getPatientById(id),
    enabled: !!id,
  });
};

export const usePatientStats = () => {
  return useQuery({
    queryKey: queryKeys.patients.stats(),
    queryFn: () => patientService.getPatientStats(),
    staleTime: 10 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  });
};

export const useCreatePatient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePatientDTO) => patientService.createPatient(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.patients.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.patients.stats() });
      toast.success('Patient created successfully!');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to create patient');
    },
  });
};

export const useUpdatePatient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePatientDTO }) =>
      patientService.updatePatient(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.patients.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.patients.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.patients.stats() });
      toast.success('Patient updated successfully!');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update patient');
    },
  });
};

export const useDeletePatient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => patientService.deletePatient(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.patients.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.patients.stats() });
      toast.success('Patient deleted successfully!');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to delete patient');
    },
  });
};

export const useSearchPatients = (searchTerm: string) => {
  return useQuery({
    queryKey: ['patients', 'search', searchTerm],
    queryFn: () => patientService.searchPatients(searchTerm),
    enabled: searchTerm.length > 2, 
    staleTime: 30 * 1000, 
  });
};