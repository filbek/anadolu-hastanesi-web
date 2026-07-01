import { supabase } from '../lib/supabase';
import { createAuditLog } from './auditLogService';

export interface ContractedInstitution {
  id: number;
  hospital_id: number;
  category: string;
  items: string[];
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

/** Yayında olan tüm anlaşmalı kurum kategorileri (herkese açık sayfa için). */
export async function getActiveContractedInstitutions(): Promise<ContractedInstitution[]> {
  const { data, error } = await supabase
    .from('contracted_institutions')
    .select('*')
    .eq('is_active', true)
    .order('hospital_id', { ascending: true })
    .order('display_order', { ascending: true });

  if (error) {
    console.error('Error fetching contracted institutions:', error);
    return [];
  }
  return (data as ContractedInstitution[]) || [];
}

/** Bir hastanenin tüm kategorileri (admin için — pasifler dahil). */
export async function getContractedByHospital(hospitalId: number): Promise<ContractedInstitution[]> {
  const { data, error } = await supabase
    .from('contracted_institutions')
    .select('*')
    .eq('hospital_id', hospitalId)
    .order('display_order', { ascending: true });

  if (error) {
    console.error(`Error fetching contracted institutions for hospital ${hospitalId}:`, error);
    return [];
  }
  return (data as ContractedInstitution[]) || [];
}

export async function createContractedInstitution(row: Omit<ContractedInstitution, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('contracted_institutions')
    .insert([row])
    .select();

  if (error) {
    console.error('Error creating contracted institution:', error);
    return { error, data: null };
  }
  await createAuditLog({ action: 'CREATE', entity_type: 'contracted_institutions', entity_id: data[0].id, details: { category: row.category, hospital_id: row.hospital_id } });
  return { data, error: null };
}

export async function updateContractedInstitution(id: number, updates: Partial<ContractedInstitution>) {
  const { data, error } = await supabase
    .from('contracted_institutions')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select();

  if (error) {
    console.error(`Error updating contracted institution ${id}:`, error);
    return { error, data: null };
  }
  await createAuditLog({ action: 'UPDATE', entity_type: 'contracted_institutions', entity_id: id, details: { category: updates.category } });
  return { data, error: null };
}

export async function deleteContractedInstitution(id: number) {
  const { error } = await supabase
    .from('contracted_institutions')
    .delete()
    .eq('id', id);

  if (error) {
    console.error(`Error deleting contracted institution ${id}:`, error);
    return { error };
  }
  await createAuditLog({ action: 'DELETE', entity_type: 'contracted_institutions', entity_id: id, details: {} });
  return { error: null };
}

/** Birden çok kategoriyi toplu ekler (statik listeden içe aktarma için). */
export async function bulkInsertContractedInstitutions(rows: Omit<ContractedInstitution, 'id' | 'created_at' | 'updated_at'>[]) {
  if (rows.length === 0) return { data: [], error: null };
  const { data, error } = await supabase
    .from('contracted_institutions')
    .insert(rows)
    .select();

  if (error) {
    console.error('Error bulk inserting contracted institutions:', error);
    return { error, data: null };
  }
  await createAuditLog({ action: 'CREATE', entity_type: 'contracted_institutions', entity_id: 0, details: { bulk: rows.length, hospital_id: rows[0]?.hospital_id } });
  return { data, error: null };
}
