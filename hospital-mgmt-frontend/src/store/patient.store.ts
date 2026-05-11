import { create } from 'zustand';
import { PatientQueryParams } from '@/types/api.types';

interface PatientStore {
  // Query params
  queryParams: PatientQueryParams;
  setQueryParams: (params: Partial<PatientQueryParams>) => void;
  resetQueryParams: () => void;
  
  // UI
  isCreateModalOpen: boolean;
  setIsCreateModalOpen: (isOpen: boolean) => void;
  
  selectedPatientId: string | null;
  setSelectedPatientId: (id: string | null) => void;
  
  // Action 
  isSubmitting: boolean;
  setIsSubmitting: (isSubmitting: boolean) => void;
}

const initialQueryParams: PatientQueryParams = {
  page: 1,
  limit: 10,
  sortBy: 'createdAt',
  sortOrder: 'desc',
  search: '',
};

export const usePatientStore = create<PatientStore>((set) => ({
  // Query params
  queryParams: initialQueryParams,
  setQueryParams: (params) =>
    set((state) => ({
      queryParams: { ...state.queryParams, ...params },
    })),
  resetQueryParams: () => set({ queryParams: initialQueryParams }),
  
  // UI 
  isCreateModalOpen: false,
  setIsCreateModalOpen: (isOpen) => set({ isCreateModalOpen: isOpen }),
  
  selectedPatientId: null,
  setSelectedPatientId: (id) => set({ selectedPatientId: id }),
  
  // Action 
  isSubmitting: false,
  setIsSubmitting: (isSubmitting) => set({ isSubmitting: isSubmitting }),
}));