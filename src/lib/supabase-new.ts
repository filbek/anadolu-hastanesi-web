import { createClient } from '@supabase/supabase-js';

// BRAND NEW: Force cloud Supabase configuration
const FORCE_CLOUD_URL = 'https://cfwwcxqpyxktikizjjxx.supabase.co';
const FORCE_CLOUD_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmd3djeHFweXhrdGlraXpqanh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcwNDUyOTcsImV4cCI6MjA2MjYyMTI5N30.YUD6Uwxyd38xXs7R60UC-199FE52VYkqOZSXHtrBiH0';

console.log('🆕 NEW FILE - Supabase URL:', FORCE_CLOUD_URL);
console.log('🆕 NEW FILE - Supabase Key:', FORCE_CLOUD_KEY.substring(0, 40));

// Create BRAND NEW Supabase client
export const supabaseNew = createClient(FORCE_CLOUD_URL, FORCE_CLOUD_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  }
});

console.log('🆕 NEW CLIENT URL:', (supabaseNew as any).supabaseUrl);

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
  role?: string;
};
