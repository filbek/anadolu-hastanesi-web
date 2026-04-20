import { supabase, Hospital } from '../lib/supabase';

export async function getHospitals(options: { onlyPublished?: boolean } = {}): Promise<Hospital[]> {
  try {
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Hastaneler yüklenirken zaman aşımı oluştu.')), 15000)
    );

    let query = supabase
      .from('hospitals')
      .select('*')
      .order('display_order', { ascending: true })
      .order('name', { ascending: true });

    if (options.onlyPublished) {
      query = query.eq('is_published', true);
    }

    const { data, error } = await Promise.race([query, timeoutPromise]) as any;

    if (error) {
      console.error('Error fetching hospitals:', error);
      return [];
    }

    return (data as Hospital[]) || [];
  } catch (err) {
    console.error('Fetch hospitals timeout or exception:', err);
    return [];
  }
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

    console.log('Attempting to upload file to:', filePath);

    const { error: uploadError } = await supabase.storage
      .from('hospital-images')
      .upload(filePath, file);

    if (uploadError) {
      console.error('Supabase storage upload error:', uploadError);
      return { error: uploadError, url: null };
    }

    const { data } = supabase.storage.from('hospital-images').getPublicUrl(filePath);
    return { url: data.publicUrl, error: null };
  } catch (error) {
    console.error('Unexpected error during image upload:', error);
    return { error, url: null };
  }
}
