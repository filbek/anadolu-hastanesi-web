export * from './hospitalService';
export * from './departmentService';
export * from './doctorService';
export * from './healthArticleService';

// Authentication related exports
export type { UserCredentials, NewUser, UserProfile } from '../lib/supabase';

// Database initialization utilities
export { initializeDatabase } from '../utils/initializeDatabase';
export { seedDatabase } from '../utils/seedDatabase';

// Helper functions for common operations
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

export const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const generateSlug = (text: string): string => {
  return text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
};

// Error handling helper
export const handleError = (error: any, defaultMessage: string = 'Bir hata oluştu'): string => {
  if (error?.message) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  return defaultMessage;
};

// Validation helpers
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPhone = (phone: string): boolean => {
  // Basic Turkish phone number validation
  const phoneRegex = /^(05|5|\+905)[0-9]{9}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

// Image handling helpers
export const getImagePlaceholder = (type: 'hospital' | 'doctor' | 'department' | 'article'): string => {
  switch (type) {
    case 'hospital':
      return 'https://placehold.co/600x400?text=Hastane+Görseli';
    case 'doctor':
      return 'https://placehold.co/300x300?text=Doktor+Görseli';
    case 'department':
      return 'https://placehold.co/600x400?text=Bölüm+Görseli';
    case 'article':
      return 'https://placehold.co/800x500?text=Makale+Görseli';
    default:
      return 'https://placehold.co/600x400?text=Görsel+Bulunamadı';
  }
};

export const getValidImageUrl = (url: string | null | undefined, type: 'hospital' | 'doctor' | 'department' | 'article'): string => {
  if (!url) {
    return getImagePlaceholder(type);
  }
  
  // Check if URL is valid
  try {
    new URL(url);
    return url;
  } catch (e) {
    return getImagePlaceholder(type);
  }
};

// Pagination helper
export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export const getPaginationRange = ({ page, pageSize }: PaginationParams): { from: number; to: number } => {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  return { from, to };
};

// Search and filter helpers
export interface SearchParams {
  term?: string;
  filters?: Record<string, any>;
  sort?: {
    field: string;
    direction: 'asc' | 'desc';
  };
}

// Cache helper
export const CACHE_KEYS = {
  HOSPITALS: 'hospitals',
  HOSPITAL_DETAIL: (slug: string) => ['hospital', slug],
  DEPARTMENTS: 'departments',
  DEPARTMENT_DETAIL: (slug: string) => ['department', slug],
  DOCTORS: 'doctors',
  DOCTOR_DETAIL: (slug: string) => ['doctor', slug],
  HEALTH_ARTICLES: 'health-articles',
  HEALTH_ARTICLE_DETAIL: (slug: string) => ['health-article', slug],
};
