import { useQuery, useMutation, useQueryClient } from 'react-query';
import { getDepartments, getDepartmentsByCategory, getDepartmentBySlug, createDepartment, updateDepartment, deleteDepartment } from '../services';
import { Department } from '../lib/supabase';
import { CACHE_KEYS } from '../services';

export function useDepartments() {
  return useQuery(CACHE_KEYS.DEPARTMENTS, getDepartments);
}

export function useDepartmentsByCategory(category: string) {
  return useQuery(
    ['departments', 'category', category], 
    () => getDepartmentsByCategory(category),
    {
      enabled: !!category,
    }
  );
}

export function useDepartmentDetail(slug: string) {
  return useQuery(
    CACHE_KEYS.DEPARTMENT_DETAIL(slug), 
    () => getDepartmentBySlug(slug),
    {
      enabled: !!slug,
    }
  );
}

export function useCreateDepartment() {
  const queryClient = useQueryClient();
  
  return useMutation(
    (department: Omit<Department, 'id' | 'created_at'>) => createDepartment(department),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(CACHE_KEYS.DEPARTMENTS);
      },
    }
  );
}

export function useUpdateDepartment() {
  const queryClient = useQueryClient();
  
  return useMutation(
    ({ id, updates }: { id: number; updates: Partial<Department> }) => updateDepartment(id, updates),
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries(CACHE_KEYS.DEPARTMENTS);
        
        // If we have the slug, invalidate the detail query as well
        if (variables.updates.slug) {
          queryClient.invalidateQueries(CACHE_KEYS.DEPARTMENT_DETAIL(variables.updates.slug));
        }
      },
    }
  );
}

export function useDeleteDepartment() {
  const queryClient = useQueryClient();
  
  return useMutation(
    (id: number) => deleteDepartment(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(CACHE_KEYS.DEPARTMENTS);
      },
    }
  );
}
