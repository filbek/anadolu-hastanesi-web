import { supabase, HealthArticle } from '../lib/supabase';

export async function getHealthArticles(): Promise<HealthArticle[]> {
  const { data, error } = await supabase
    .from('health_articles')
    .select(`
      *,
      authors:author_id(id, name, slug, title, image)
    `)
    .order('date', { ascending: false });

  if (error) {
    console.error('Error fetching health articles:', error);
    return [];
  }

  return data as unknown as HealthArticle[];
}

export async function getHealthArticlesByCategory(category: string): Promise<HealthArticle[]> {
  const { data, error } = await supabase
    .from('health_articles')
    .select(`
      *,
      authors:author_id(id, name, slug, title, image)
    `)
    .eq('category', category)
    .order('date', { ascending: false });

  if (error) {
    console.error(`Error fetching health articles with category ${category}:`, error);
    return [];
  }

  return data as unknown as HealthArticle[];
}

export async function getHealthArticlesByType(type: string): Promise<HealthArticle[]> {
  const { data, error } = await supabase
    .from('health_articles')
    .select(`
      *,
      authors:author_id(id, name, slug, title, image)
    `)
    .eq('type', type)
    .order('date', { ascending: false });

  if (error) {
    console.error(`Error fetching health articles with type ${type}:`, error);
    return [];
  }

  return data as unknown as HealthArticle[];
}

export async function getHealthArticleBySlug(slug: string): Promise<HealthArticle | null> {
  const { data, error } = await supabase
    .from('health_articles')
    .select(`
      *,
      authors:author_id(id, name, slug, title, image)
    `)
    .eq('slug', slug)
    .single();

  if (error) {
    console.error(`Error fetching health article with slug ${slug}:`, error);
    return null;
  }

  // Increment view count
  await supabase
    .from('health_articles')
    .update({ views: (data as HealthArticle).views + 1 })
    .eq('id', (data as HealthArticle).id);

  return data as unknown as HealthArticle;
}

export async function createHealthArticle(article: Omit<HealthArticle, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('health_articles')
    .insert([article])
    .select();

  if (error) {
    console.error('Error creating health article:', error);
    return { error, data: null };
  }

  return { data, error: null };
}

export async function updateHealthArticle(id: number, updates: Partial<HealthArticle>) {
  const { data, error } = await supabase
    .from('health_articles')
    .update(updates)
    .eq('id', id)
    .select();

  if (error) {
    console.error(`Error updating health article with id ${id}:`, error);
    return { error, data: null };
  }

  return { data, error: null };
}

export async function deleteHealthArticle(id: number) {
  const { error } = await supabase
    .from('health_articles')
    .delete()
    .eq('id', id);

  if (error) {
    console.error(`Error deleting health article with id ${id}:`, error);
    return { error };
  }

  return { error: null };
}

export async function uploadArticleImage(file: File): Promise<{ url: string | null; error: any }> {
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
