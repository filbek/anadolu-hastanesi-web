import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
  created_at: string;
};

export type Department = {
  id: number;
  name: string;
  slug: string;
  icon: string;
  description: string;
  category: string;
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
};

// Type definitions will remain here.
// SQL for table creation should be run directly in the Supabase SQL editor
// or managed via migration files.
