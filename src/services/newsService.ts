import { supabase } from '../lib/supabase';
import { createAuditLog } from './auditLogService';

export interface NewsItem {
  id: number;
  title: string;
  slug: string;
  excerpt?: string;
  content?: string;
  image?: string;
  category?: string;
  is_published: boolean;
  published_at?: string;
  created_at: string;
}

export async function getNewsItems(): Promise<NewsItem[]> {
  const { data, error } = await supabase
    .from('news_items')
    .select('*')
    .eq('is_published', true)
    .order('published_at', { ascending: false });

  if (error) {
    console.error('Error fetching news items:', error);
    return [];
  }
  return (data as NewsItem[]) || [];
}

export async function getAllNewsItems(): Promise<NewsItem[]> {
  const { data, error } = await supabase
    .from('news_items')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching all news items:', error);
    return [];
  }
  return (data as NewsItem[]) || [];
}

export async function getNewsItemBySlug(slug: string): Promise<NewsItem | null> {
  const { data, error } = await supabase
    .from('news_items')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) {
    console.error(`Error fetching news item ${slug}:`, error);
    return null;
  }
  return data as NewsItem;
}

export async function createNewsItem(item: Omit<NewsItem, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('news_items')
    .insert([item])
    .select();

  if (error) {
    console.error('Error creating news item:', error);
    return { error, data: null };
  }
  await createAuditLog({ action: 'CREATE', entity_type: 'news_items', entity_id: data[0].id, details: { title: item.title, slug: item.slug } });
  return { data, error: null };
}

export async function updateNewsItem(id: number, updates: Partial<NewsItem>) {
  const { data, error } = await supabase
    .from('news_items')
    .update(updates)
    .eq('id', id)
    .select();

  if (error) {
    console.error(`Error updating news item ${id}:`, error);
    return { error, data: null };
  }
  await createAuditLog({ action: 'UPDATE', entity_type: 'news_items', entity_id: id, details: updates });
  return { data, error: null };
}

export async function uploadNewsImage(file: File): Promise<{ url: string | null; error: any }> {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}-${Date.now()}.${fileExt}`;
    const filePath = `news-images/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('news-images')
      .upload(filePath, file);

    if (uploadError) {
      return { error: uploadError, url: null };
    }

    const { data } = supabase.storage.from('news-images').getPublicUrl(filePath);
    return { url: data.publicUrl, error: null };
  } catch (error) {
    return { error, url: null };
  }
}

export async function deleteNewsItem(id: number) {
  const { error } = await supabase
    .from('news_items')
    .delete()
    .eq('id', id);

  if (error) {
    console.error(`Error deleting news item ${id}:`, error);
    return { error };
  }
  await createAuditLog({ action: 'DELETE', entity_type: 'news_items', entity_id: id, details: {} });
  return { error: null };
}
