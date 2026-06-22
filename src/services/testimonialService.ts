import { supabase } from '../lib/supabase';
import { createAuditLog } from './auditLogService';

export interface Testimonial {
  id: number;
  name: string;
  title?: string;
  comment: string;
  rating: number;
  image?: string;
  hospital_id?: number;
  department_id?: number;
  order_index: number;
  is_active: boolean;
  created_at: string;
}

export async function getTestimonials(): Promise<Testimonial[]> {
  const { data, error } = await supabase
    .from('testimonials')
    .select('*')
    .eq('is_active', true)
    .order('order_index', { ascending: true });

  if (error) {
    console.error('Error fetching testimonials:', error);
    return [];
  }
  return (data as Testimonial[]) || [];
}

export async function getAllTestimonials(): Promise<Testimonial[]> {
  const { data, error } = await supabase
    .from('testimonials')
    .select('*')
    .order('order_index', { ascending: true });

  if (error) {
    console.error('Error fetching all testimonials:', error);
    return [];
  }
  return (data as Testimonial[]) || [];
}

export async function createTestimonial(testimonial: Omit<Testimonial, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('testimonials')
    .insert([testimonial])
    .select();

  if (error) {
    console.error('Error creating testimonial:', error);
    return { error, data: null };
  }
  await createAuditLog({ action: 'CREATE', entity_type: 'testimonials', entity_id: data[0].id, details: { name: testimonial.name } });
  return { data, error: null };
}

export async function updateTestimonial(id: number, updates: Partial<Testimonial>) {
  const { data, error } = await supabase
    .from('testimonials')
    .update(updates)
    .eq('id', id)
    .select();

  if (error) {
    console.error(`Error updating testimonial ${id}:`, error);
    return { error, data: null };
  }
  await createAuditLog({ action: 'UPDATE', entity_type: 'testimonials', entity_id: id, details: updates });
  return { data, error: null };
}

export async function uploadTestimonialImage(file: File): Promise<{ url: string | null; error: any }> {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}-${Date.now()}.${fileExt}`;
    const filePath = `testimonial-images/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('testimonial-images')
      .upload(filePath, file);

    if (uploadError) {
      return { error: uploadError, url: null };
    }

    const { data } = supabase.storage.from('testimonial-images').getPublicUrl(filePath);
    return { url: data.publicUrl, error: null };
  } catch (error) {
    return { error, url: null };
  }
}

export async function deleteTestimonial(id: number) {
  const { error } = await supabase
    .from('testimonials')
    .delete()
    .eq('id', id);

  if (error) {
    console.error(`Error deleting testimonial ${id}:`, error);
    return { error };
  }
  await createAuditLog({ action: 'DELETE', entity_type: 'testimonials', entity_id: id, details: {} });
  return { error: null };
}
