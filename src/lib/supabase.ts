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
export type Hospital = {
  id: number;
  name: string;
  slug: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  working_hours: string;
  emergency_hours: string;
  images: string[];
  display_on_homepage?: boolean;
  is_active?: boolean;
  image_url?: string;
  display_order: number;
  meta_title?: string;
  meta_description?: string;
  hero_title?: string;
  hero_subtitle?: string;
  map_url?: string;
  is_published?: boolean;
  created_at: string;
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
  images?: string[];
  treatments?: any[]; // JSONB data
  equipment?: any[]; // JSONB data
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
  author_id: number;
  content: string;
  tags: string[];
  type: 'article' | 'video' | 'pdf';
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
