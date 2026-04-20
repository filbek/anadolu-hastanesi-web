import { useQuery } from 'react-query';
import { getDepartments, getDepartmentBySlug } from '../services/departmentService';

const CACHE_KEYS = {
  DEPARTMENTS: ['departments'],
  DEPARTMENT: (slug: string) => ['department', slug],
};

export function useDepartments(options: { onlyPublished?: boolean } = {}) {
  return useQuery(
    [...CACHE_KEYS.DEPARTMENTS, options],
    () => getDepartments(options),
    {
      staleTime: 1000 * 60 * 5, // 5 minutes
    }
  );
}

export function useDepartment(slug: string) {
  return useQuery(
    CACHE_KEYS.DEPARTMENT(slug),
    () => getDepartmentBySlug(slug),
    {
      enabled: !!slug,
      staleTime: 1000 * 60 * 5, // 5 minutes
    }
  );
}
