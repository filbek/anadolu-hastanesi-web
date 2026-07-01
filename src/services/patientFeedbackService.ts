import { supabase } from '../lib/supabase';

export interface PatientFeedback {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  subject?: string;
  message: string;
  hospital_id?: number;
  source?: 'hasta' | 'personel';
  is_read: boolean;
  is_responded: boolean;
  admin_notes?: string;
  created_at: string;
}

export async function getPatientFeedback(): Promise<PatientFeedback[]> {
  const { data, error } = await supabase
    .from('patient_feedback')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching patient feedback:', error);
    return [];
  }
  return (data as PatientFeedback[]) || [];
}

export async function createPatientFeedback(feedback: Omit<PatientFeedback, 'id' | 'created_at' | 'is_read' | 'is_responded'>) {
  const payload = { ...feedback, is_read: false, is_responded: false } as Record<string, any>;

  let { data, error } = await supabase
    .from('patient_feedback')
    .insert([payload])
    .select();

  // 'source' kolonu henüz eklenmemişse (migration çalıştırılmadıysa) o alan olmadan tekrar dene
  if (error && 'source' in payload && /source/i.test(error.message || '')) {
    const { source: _omit, ...withoutSource } = payload;
    ({ data, error } = await supabase
      .from('patient_feedback')
      .insert([withoutSource])
      .select());
  }

  if (error) {
    console.error('Error creating patient feedback:', error);
    return { error, data: null };
  }
  return { data, error: null };
}

export async function updatePatientFeedback(id: number, updates: Partial<PatientFeedback>) {
  const { data, error } = await supabase
    .from('patient_feedback')
    .update(updates)
    .eq('id', id)
    .select();

  if (error) {
    console.error(`Error updating patient feedback ${id}:`, error);
    return { error, data: null };
  }
  return { data, error: null };
}

export async function deletePatientFeedback(id: number) {
  const { error } = await supabase
    .from('patient_feedback')
    .delete()
    .eq('id', id);

  if (error) {
    console.error(`Error deleting patient feedback ${id}:`, error);
    return { error };
  }
  return { error: null };
}
