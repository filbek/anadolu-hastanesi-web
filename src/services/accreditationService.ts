import { supabase } from '../lib/supabase';
import { createAuditLog } from './auditLogService';

export interface Accreditation {
  id: number;
  name: string;
  logo_url?: string;
  link?: string;
  order_index: number;
  is_active: boolean;
  created_at: string;
}

export async function getAccreditations(): Promise<Accreditation[]> {
  const { data, error } = await supabase
    .from('accreditations')
    .select('*')
    .eq('is_active', true)
    .order('order_index', { ascending: true });

  if (error) {
    console.error('Error fetching accreditations:', error);
    return [];
  }
  return (data as Accreditation[]) || [];
}

export async function getAllAccreditations(): Promise<Accreditation[]> {
  const { data, error } = await supabase
    .from('accreditations')
    .select('*')
    .order('order_index', { ascending: true });

  if (error) {
    console.error('Error fetching all accreditations:', error);
    return [];
  }
  return (data as Accreditation[]) || [];
}

export async function createAccreditation(acc: Omit<Accreditation, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('accreditations')
    .insert([acc])
    .select();

  if (error) {
    console.error('Error creating accreditation:', error);
    return { error, data: null };
  }
  await createAuditLog({ action: 'CREATE', entity_type: 'accreditations', entity_id: data[0].id, details: { name: acc.name } });
  return { data, error: null };
}

export async function updateAccreditation(id: number, updates: Partial<Accreditation>) {
  const { data, error } = await supabase
    .from('accreditations')
    .update(updates)
    .eq('id', id)
    .select();

  if (error) {
    console.error(`Error updating accreditation ${id}:`, error);
    return { error, data: null };
  }
  await createAuditLog({ action: 'UPDATE', entity_type: 'accreditations', entity_id: id, details: updates });
  return { data, error: null };
}

export async function deleteAccreditation(id: number) {
  const { error } = await supabase
    .from('accreditations')
    .delete()
    .eq('id', id);

  if (error) {
    console.error(`Error deleting accreditation ${id}:`, error);
    return { error };
  }
  await createAuditLog({ action: 'DELETE', entity_type: 'accreditations', entity_id: id, details: {} });
  return { error: null };
}
