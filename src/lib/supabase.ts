import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase URL or Anon Key. Check your .env variables.');
}

// Create NEW Supabase client instance
export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '', {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  }
});

// Database types
//
// `translations` alanı: Türkçeden otomatik üretilen diğer dil çevirileri.
// Yapı: { en: { name: "...", description: "..." }, ar: { ... } }
// Bkz. src/services/translationService.ts ve src/sql/translations_migration.sql
export type Translations = Partial<Record<'en' | 'ar', Record<string, any>>>;

export type Hospital = {
  id: number | string;
  name: string;
  slug: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  working_hours: string;
  emergency_hours: string;
  emergency_phone?: string;
  transportation_info?: string;
  images: string[];
  display_on_homepage?: boolean;
  is_active?: boolean;
  image_url?: string;
  logo_url?: string;
  latitude?: string;
  longitude?: string;
  display_order: number;
  meta_title?: string;
  meta_description?: string;
  hero_title?: string;
  hero_subtitle?: string;
  map_url?: string;
  is_published?: boolean;
  // Bu şubede "her zaman göster" denilen bölüm id'leri (doktor kaydı olmasa da).
  // Bölümlerimiz sayfasındaki şube sekmelerinde doktorlardan türeyen listeye eklenir.
  department_ids?: number[];
  translations?: Translations;
  created_at: string;
  updated_at?: string;
};

export type Department = {
  id: number;
  name: string;
  slug: string;
  icon: string;
  description: string;
  category: string;
  long_description?: string;
  meta_title?: string;
  meta_description?: string;
  hero_title?: string;
  hero_subtitle?: string;
  is_published?: boolean;
  display_order?: number;
  image_url?: string;
  images?: string[];
  treatments?: any[]; // JSONB data
  equipment?: any[]; // JSONB data
  translations?: Translations;
  created_at: string;
};

export type Doctor = {
  id: number;
  name: string;
  slug: string;
  title: string;
  department_id: number;
  hospital_id: number;
  image: string;
  education: string;
  experience: string;
  about?: string;
  cv_url?: string;
  specialties?: string[];
  treatments?: string[];
  is_active?: boolean;
  display_order?: number;
  translations?: Translations;
  created_at: string;
};

export type HealthArticle = {
  id: number;
  title: string;
  slug: string;
  category: string;
  image: string;
  date: string;
  views: number;
  author_id?: number;
  author_name?: string;
  author_title?: string;
  author_image?: string;
  content: string;
  tags: string[];
  type: 'article' | 'video' | 'pdf';
  is_published?: boolean;
  is_featured?: boolean;
  excerpt?: string;
  read_time?: string;
  related_article_ids?: number[];
  translations?: Translations;
  created_at: string;
};

// Authentication types
export type UserCredentials = {
  email: string;
  password: string;
};

export type NewUser = UserCredentials & {
  full_name: string;
  phone?: string;
};

export type ManagementTeamMember = {
  id: number;
  name: string;
  title: string;
  role: 'board' | 'chief_physician' | 'assistant_chief' | 'health_care_manager' | 'it_unit' | 'general_manager_deputy' | 'financial_affairs_manager' | 'hospitality_services_manager' | 'quality_management_manager' | 'administrative';
  department?: string;
  doctor_id?: number | null;
  hospital_id?: number | string | null;
  image?: string;
  display_order?: number;
  is_active?: boolean;
  created_at?: string;
  doctor?: Doctor | null;
};

export type QualityOrgChart = {
  id: number;
  hospital_id: number | string;
  pdf_url: string | null;
  updated_at?: string;
};

export type UserProfile = {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  avatar_url?: string;
  role?: string; // Admin rolü için eklendi
  created_at?: string;
};

// Type definitions will remain here.
// SQL for table creation should be run directly in the Supabase SQL editor
// or managed via migration files.
