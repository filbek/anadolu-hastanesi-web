import { useQuery, useMutation, useQueryClient } from 'react-query';
import { getDepartments, getDepartmentBySlug, createDepartment, updateDepartment, deleteDepartment } from '../services/departmentService';
import { Department } from '../lib/supabase';

const CACHE_KEYS = {
  DEPARTMENTS: ['departments'],
  DEPARTMENT: (slug: string) => ['department', slug],
};

export function useDepartments(options: { onlyPublished?: boolean } = {}) {
  return useQuery(
    [...CACHE_KEYS.DEPARTMENTS, options],
    () => getDepartments(options),
  );
}

export function useDepartment(slug: string) {
  return useQuery(
    CACHE_KEYS.DEPARTMENT(slug),
    () => getDepartmentBySlug(slug),
    {
      enabled: !!slug,
      staleTime: 1000 * 60 * 5,
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
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries(CACHE_KEYS.DEPARTMENTS);
        if (variables.updates.slug) {
          queryClient.invalidateQueries(CACHE_KEYS.DEPARTMENT(variables.updates.slug));
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
