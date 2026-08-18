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
  // NULL ise paylaşım tüm şubeler için geçerlidir.
  hospital_id?: number | null;
  hospitals?: { id: number; name: string; slug: string } | null;
  order_index: number;
  is_active: boolean;
  translations?: any;
  created_at?: string;
  updated_at?: string;
}

const SELECT_WITH_HOSPITAL = '*, hospitals:hospital_id(id, name, slug)';

// hospital_id kolonu henüz eklenmemişse (gebe_okulu_hospital_migration.sql
// çalıştırılmadıysa) join'li sorgu şema hatası verir; bu durumda şubesiz
// sorguya düşerek sayfanın çalışmaya devam etmesini sağlıyoruz.
const isMissingHospitalColumn = (error: any) =>
  typeof error?.message === 'string' && error.message.includes('hospital_id');

async function fetchSeminars(activeOnly: boolean): Promise<GebeOkuluSeminar[]> {
  const build = (select: string) => {
    const query = supabase.from('gebe_okulu_seminars').select(select);
    return (activeOnly ? query.eq('is_active', true) : query)
      .order('order_index', { ascending: true });
  };

  let { data, error } = await build(SELECT_WITH_HOSPITAL);
  if (error && isMissingHospitalColumn(error)) {
    console.warn('gebe_okulu_seminars.hospital_id bulunamadı, şube bilgisi olmadan yükleniyor.');
    ({ data, error } = await build('*'));
  }

  if (error) {
    console.error('Error fetching seminars:', error);
    throw error;
  }
  return (data as unknown as GebeOkuluSeminar[]) || [];
}

export async function getActiveSeminars(): Promise<GebeOkuluSeminar[]> {
  return fetchSeminars(true);
}

export async function getAllSeminars(): Promise<GebeOkuluSeminar[]> {
  return fetchSeminars(false);
}

// Join ile gelen "hospitals" alanı tabloda kolon olmadığı için insert/update
// gövdesinden çıkarılmalı; aksi halde Supabase şema hatası döner.
const stripJoins = <T extends Record<string, any>>(payload: T) => {
  const { hospitals, ...rest } = payload;
  return rest;
};

export async function createSeminar(seminar: Omit<GebeOkuluSeminar, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('gebe_okulu_seminars')
    .insert([stripJoins(seminar)])
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
    .update(stripJoins(updates))
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
