import { supabase, Hospital } from '../lib/supabase';

export async function getHospitals(): Promise<Hospital[]> {
  const { data, error } = await supabase
    .from('hospitals')
    .select('*')
    .order('name');

  if (error) {
    console.error('Error fetching hospitals:', error);
    return [];
  }

  return data as Hospital[];
}

export async function getHospitalBySlug(slug: string): Promise<Hospital | null> {
  const { data, error } = await supabase
    .from('hospitals')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) {
    console.error(`Error fetching hospital with slug ${slug}:`, error);
    return null;
  }

  return data as Hospital;
}

export async function createHospital(hospital: Omit<Hospital, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('hospitals')
    .insert([hospital])
    .select();

  if (error) {
    console.error('Error creating hospital:', error);
    return { error, data: null };
  }

  return { data, error: null };
}

export async function updateHospital(id: number, updates: Partial<Hospital>) {
  const { data, error } = await supabase
    .from('hospitals')
    .update(updates)
    .eq('id', id)
    .select();

  if (error) {
    console.error(`Error updating hospital with id ${id}:`, error);
    return { error, data: null };
  }

  return { data, error: null };
}

export async function deleteHospital(id: number) {
  const { error } = await supabase
    .from('hospitals')
    .delete()
    .eq('id', id);

  if (error) {
    console.error(`Error deleting hospital with id ${id}:`, error);
    return { error };
  }

  return { error: null };
}

export async function uploadHospitalImage(file: File): Promise<{ url: string | null; error: any }> {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}-${Date.now()}.${fileExt}`;
    const filePath = `hospital-images/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('hospital-images')
      .upload(filePath, file);

    if (uploadError) {
      return { error: uploadError, url: null };
    }

    const { data } = supabase.storage.from('hospital-images').getPublicUrl(filePath);
    return { url: data.publicUrl, error: null };
  } catch (error) {
    return { error, url: null };
  }
}
