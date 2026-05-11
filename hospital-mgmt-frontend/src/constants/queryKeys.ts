export const queryKeys = {
  patients: {
    all: ['patients'] as const,
    lists: () => [...queryKeys.patients.all, 'list'] as const,
    list: (filters: any) => [...queryKeys.patients.lists(), { filters }] as const,
    details: () => [...queryKeys.patients.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.patients.details(), id] as const,
    stats: () => [...queryKeys.patients.all, 'stats'] as const,
  },
};