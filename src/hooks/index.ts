export * from './useHospitals';
export * from './useDepartments';
export * from './useDoctors';
export * from './useHealthArticles';

// Custom hook for authentication state
import { useSupabase } from '../contexts/SupabaseContext';

export const useAuth = () => {
  const { user, userProfile, loading, signIn, signUp, signOut } = useSupabase();
  
  return {
    user,
    userProfile,
    loading,
    signIn,
    signUp,
    signOut,
    isAuthenticated: !!user,
  };
};

// Custom hook for form handling
import { useState, useCallback } from 'react';

export function useForm<T>(initialValues: T) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    setTouched((prev) => ({ ...prev, [name]: true }));
  }, []);

  const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
  }, []);

  const setFieldValue = useCallback((name: keyof T, value: any) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  }, []);

  const setFieldError = useCallback((name: keyof T, error: string) => {
    setErrors((prev) => ({ ...prev, [name]: error }));
  }, []);

  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    setFieldValue,
    setFieldError,
    setValues,
    setErrors,
    setTouched,
    setIsSubmitting,
    resetForm,
  };
}

// Custom hook for modal state
import { useCallback } from 'react';

export function useModal() {
  const [isOpen, setIsOpen] = useState(false);
  
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);
  
  return { isOpen, open, close, toggle };
}

// Custom hook for pagination
export function usePagination<T>(items: T[], itemsPerPage: number = 10) {
  const [currentPage, setCurrentPage] = useState(1);
  
  const totalPages = Math.ceil(items.length / itemsPerPage);
  
  const currentItems = items.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  const goToPage = useCallback((page: number) => {
    const pageNumber = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(pageNumber);
  }, [totalPages]);
  
  const nextPage = useCallback(() => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  }, [currentPage, totalPages]);
  
  const prevPage = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  }, [currentPage]);
  
  return {
    currentPage,
    totalPages,
    currentItems,
    goToPage,
    nextPage,
    prevPage,
  };
}

// Custom hook for local storage
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });
  
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  };
  
  return [storedValue, setValue] as const;
}
