import { useQuery, useMutation, useQueryClient } from 'react-query';
import { getDoctors, getDoctorsByDepartment, getDoctorsByHospital, getDoctorBySlug, createDoctor, updateDoctor, deleteDoctor } from '../services';
import { Doctor } from '../lib/supabase';
import { CACHE_KEYS } from '../services';

export function useDoctors() {
  return useQuery(CACHE_KEYS.DOCTORS, getDoctors);
}

export function useDoctorsByDepartment(departmentId: number) {
  return useQuery(
    ['doctors', 'department', departmentId], 
    () => getDoctorsByDepartment(departmentId),
    {
      enabled: !!departmentId,
    }
  );
}

export function useDoctorsByHospital(hospitalId: number) {
  return useQuery(
    ['doctors', 'hospital', hospitalId], 
    () => getDoctorsByHospital(hospitalId),
    {
      enabled: !!hospitalId,
    }
  );
}

export function useDoctorDetail(slug: string) {
  return useQuery(
    CACHE_KEYS.DOCTOR_DETAIL(slug), 
    () => getDoctorBySlug(slug),
    {
      enabled: !!slug,
    }
  );
}

export function useCreateDoctor() {
  const queryClient = useQueryClient();
  
  return useMutation(
    (doctor: Omit<Doctor, 'id' | 'created_at'>) => createDoctor(doctor),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(CACHE_KEYS.DOCTORS);
      },
    }
  );
}

export function useUpdateDoctor() {
  const queryClient = useQueryClient();
  
  return useMutation(
    ({ id, updates }: { id: number; updates: Partial<Doctor> }) => updateDoctor(id, updates),
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries(CACHE_KEYS.DOCTORS);
        
        // If we have the slug, invalidate the detail query as well
        if (variables.updates.slug) {
          queryClient.invalidateQueries(CACHE_KEYS.DOCTOR_DETAIL(variables.updates.slug));
        }
      },
    }
  );
}

export function useDeleteDoctor() {
  const queryClient = useQueryClient();
  
  return useMutation(
    (id: number) => deleteDoctor(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(CACHE_KEYS.DOCTORS);
      },
    }
  );
}
