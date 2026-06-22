import { supabase } from '../lib/supabase';

export interface AuditLog {
  id: number;
  user_id?: string;
  action: string;
  entity_type: string;
  entity_id?: number;
  details?: Record<string, any>;
  created_at: string;
}

export async function getAuditLogs(limit: number = 50): Promise<AuditLog[]> {
  const { data, error } = await supabase
    .from('audit_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching audit logs:', error);
    return [];
  }
  return (data as AuditLog[]) || [];
}

export async function createAuditLog(log: Omit<AuditLog, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('audit_logs')
    .insert([log])
    .select();

  if (error) {
    console.error('Error creating audit log:', error);
    return { error, data: null };
  }
  return { data, error: null };
}

export async function deleteOldAuditLogs(days: number = 90) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);

  const { error } = await supabase
    .from('audit_logs')
    .delete()
    .lt('created_at', cutoff.toISOString());

  if (error) {
    console.error('Error deleting old audit logs:', error);
    return { error };
  }
  return { error: null };
}
