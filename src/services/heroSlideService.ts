import { supabase } from '../lib/supabase';
import { createAuditLog } from './auditLogService';

export interface HeroSlide {
  id: number;
  title: string;
  subtitle?: string;
  image: string;
  button_text?: string;
  button_link?: string;
  theme_color?: string;
  order_index: number;
  is_active: boolean;
  created_at: string;
}

export async function getHeroSlides(): Promise<HeroSlide[]> {
  const { data, error } = await supabase
    .from('hero_slides')
    .select('*')
    .eq('is_active', true)
    .order('order_index', { ascending: true });

  if (error) {
    console.error('Error fetching hero slides:', error);
    return [];
  }
  return (data as HeroSlide[]) || [];
}

export async function getAllHeroSlides(): Promise<HeroSlide[]> {
  const { data, error } = await supabase
    .from('hero_slides')
    .select('*')
    .order('order_index', { ascending: true });

  if (error) {
    console.error('Error fetching all hero slides:', error);
    return [];
  }
  return (data as HeroSlide[]) || [];
}

export async function createHeroSlide(slide: Omit<HeroSlide, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('hero_slides')
    .insert([slide])
    .select();

  if (error) {
    console.error('Error creating hero slide:', error);
    return { error, data: null };
  }
  await createAuditLog({ action: 'CREATE', entity_type: 'hero_slides', entity_id: data[0].id, details: { title: slide.title } });
  return { data, error: null };
}

export async function updateHeroSlide(id: number, updates: Partial<HeroSlide>) {
  const { data, error } = await supabase
    .from('hero_slides')
    .update(updates)
    .eq('id', id)
    .select();

  if (error) {
    console.error(`Error updating hero slide ${id}:`, error);
    return { error, data: null };
  }
  await createAuditLog({ action: 'UPDATE', entity_type: 'hero_slides', entity_id: id, details: updates });
  return { data, error: null };
}

export async function uploadHeroSlideImage(file: File): Promise<{ url: string | null; error: any }> {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}-${Date.now()}.${fileExt}`;
    const filePath = `hero-images/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('hero-images')
      .upload(filePath, file);

    if (uploadError) {
      return { error: uploadError, url: null };
    }

    const { data } = supabase.storage.from('hero-images').getPublicUrl(filePath);
    return { url: data.publicUrl, error: null };
  } catch (error) {
    return { error, url: null };
  }
}

export async function deleteHeroSlide(id: number) {
  const { error } = await supabase
    .from('hero_slides')
    .delete()
    .eq('id', id);

  if (error) {
    console.error(`Error deleting hero slide ${id}:`, error);
    return { error };
  }
  await createAuditLog({ action: 'DELETE', entity_type: 'hero_slides', entity_id: id, details: {} });
  return { error: null };
}
