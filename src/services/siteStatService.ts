import { supabase } from '../lib/supabase';
import { createAuditLog } from './auditLogService';

export interface SiteStat {
  id: number;
  label: string;
  value: string;
  suffix?: string;
  icon?: string;
  order_index: number;
  is_active: boolean;
  created_at: string;
}

export async function getSiteStats(): Promise<SiteStat[]> {
  const { data, error } = await supabase
    .from('site_stats')
    .select('*')
    .eq('is_active', true)
    .order('order_index', { ascending: true });

  if (error) {
    console.error('Error fetching site stats:', error);
    return [];
  }
  return (data as SiteStat[]) || [];
}

export async function getAllSiteStats(): Promise<SiteStat[]> {
  const { data, error } = await supabase
    .from('site_stats')
    .select('*')
    .order('order_index', { ascending: true });

  if (error) {
    console.error('Error fetching all site stats:', error);
    return [];
  }
  return (data as SiteStat[]) || [];
}

export async function createSiteStat(stat: Omit<SiteStat, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('site_stats')
    .insert([stat])
    .select();

  if (error) {
    console.error('Error creating site stat:', error);
    return { error, data: null };
  }
  await createAuditLog({ action: 'CREATE', entity_type: 'site_stats', entity_id: data[0].id, details: { label: stat.label } });
  return { data, error: null };
}

export async function updateSiteStat(id: number, updates: Partial<SiteStat>) {
  const { data, error } = await supabase
    .from('site_stats')
    .update(updates)
    .eq('id', id)
    .select();

  if (error) {
    console.error(`Error updating site stat ${id}:`, error);
    return { error, data: null };
  }
  await createAuditLog({ action: 'UPDATE', entity_type: 'site_stats', entity_id: id, details: updates });
  return { data, error: null };
}

export async function deleteSiteStat(id: number) {
  const { error } = await supabase
    .from('site_stats')
    .delete()
    .eq('id', id);

  if (error) {
    console.error(`Error deleting site stat ${id}:`, error);
    return { error };
  }
  await createAuditLog({ action: 'DELETE', entity_type: 'site_stats', entity_id: id, details: {} });
  return { error: null };
}
