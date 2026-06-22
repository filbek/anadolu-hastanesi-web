import { supabase } from '../lib/supabase';
import { createAuditLog } from './auditLogService';

export interface GebeOkuluSeminar {
  id: number;
  title: string;
  date: string;
  image: string;
  summary?: string;
  topics?: string[];
  link_url?: string | null;
  order_index: number;
  is_active: boolean;
  translations?: any;
  created_at?: string;
  updated_at?: string;
}

export async function getActiveSeminars(): Promise<GebeOkuluSeminar[]> {
  const { data, error } = await supabase
    .from('gebe_okulu_seminars')
    .select('*')
    .eq('is_active', true)
    .order('order_index', { ascending: true });

  if (error) {
    console.error('Error fetching active seminars:', error);
    throw error;
  }
  return (data as GebeOkuluSeminar[]) || [];
}

export async function getAllSeminars(): Promise<GebeOkuluSeminar[]> {
  const { data, error } = await supabase
    .from('gebe_okulu_seminars')
    .select('*')
    .order('order_index', { ascending: true });

  if (error) {
    console.error('Error fetching all seminars:', error);
    throw error;
  }
  return (data as GebeOkuluSeminar[]) || [];
}

export async function createSeminar(seminar: Omit<GebeOkuluSeminar, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('gebe_okulu_seminars')
    .insert([seminar])
    .select();

  if (error) {
    console.error('Error creating seminar:', error);
    return { error, data: null };
  }
  await createAuditLog({ action: 'CREATE', entity_type: 'gebe_okulu_seminars', entity_id: data[0].id, details: { title: seminar.title } });
  return { data, error: null };
}

export async function updateSeminar(id: number, updates: Partial<GebeOkuluSeminar>) {
  const { data, error } = await supabase
    .from('gebe_okulu_seminars')
    .update(updates)
    .eq('id', id)
    .select();

  if (error) {
    console.error(`Error updating seminar ${id}:`, error);
    return { error, data: null };
  }
  await createAuditLog({ action: 'UPDATE', entity_type: 'gebe_okulu_seminars', entity_id: id, details: updates });
  return { data, error: null };
}

export async function deleteSeminar(id: number) {
  const { error } = await supabase
    .from('gebe_okulu_seminars')
    .delete()
    .eq('id', id);

  if (error) {
    console.error(`Error deleting seminar ${id}:`, error);
    return { error };
  }
  await createAuditLog({ action: 'DELETE', entity_type: 'gebe_okulu_seminars', entity_id: id, details: {} });
  return { error: null };
}

export async function uploadSeminarImage(file: File): Promise<{ url: string | null; error: any }> {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}-${Date.now()}.${fileExt}`;
    const filePath = `article-images/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('article-images')
      .upload(filePath, file);

    if (uploadError) {
      return { error: uploadError, url: null };
    }

    const { data } = supabase.storage.from('article-images').getPublicUrl(filePath);
    return { url: data.publicUrl, error: null };
  } catch (error) {
    return { error, url: null };
  }
}
