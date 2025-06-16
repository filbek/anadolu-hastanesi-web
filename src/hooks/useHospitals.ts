import { useQuery, useMutation, useQueryClient } from 'react-query';
import { getHospitals, getHospitalBySlug, createHospital, updateHospital, deleteHospital } from '../services';
import { Hospital } from '../lib/supabase';
import { CACHE_KEYS } from '../services';

export function useHospitals() {
  return useQuery(CACHE_KEYS.HOSPITALS, getHospitals);
}

export function useHospitalDetail(slug: string) {
  return useQuery(CACHE_KEYS.HOSPITAL_DETAIL(slug), () => getHospitalBySlug(slug), {
    enabled: !!slug,
  });
}

export function useCreateHospital() {
  const queryClient = useQueryClient();
  
  return useMutation(
    (hospital: Omit<Hospital, 'id' | 'created_at'>) => createHospital(hospital),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(CACHE_KEYS.HOSPITALS);
      },
    }
  );
}

export function useUpdateHospital() {
  const queryClient = useQueryClient();
  
  return useMutation(
    ({ id, updates }: { id: number; updates: Partial<Hospital> }) => updateHospital(id, updates),
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries(CACHE_KEYS.HOSPITALS);
        
        // If we have the slug, invalidate the detail query as well
        if (variables.updates.slug) {
          queryClient.invalidateQueries(CACHE_KEYS.HOSPITAL_DETAIL(variables.updates.slug));
        }
      },
    }
  );
}

export function useDeleteHospital() {
  const queryClient = useQueryClient();
  
  return useMutation(
    (id: number) => deleteHospital(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(CACHE_KEYS.HOSPITALS);
      },
    }
  );
}
