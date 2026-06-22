import { supabase, Hospital } from '../lib/supabase';
import { createAuditLog } from './auditLogService';

export async function getHospitals(options: { onlyPublished?: boolean } = {}): Promise<Hospital[]> {
  try {
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Hastaneler yüklenirken zaman aşımı oluştu.')), 20000)
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
      console.error('🔴 [hospitalService] Supabase error:', error.code, error.message, error.hint);
      return [];
    }

    console.log(`✅ [hospitalService] Fetched ${data?.length ?? 0} hospitals`);
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

  try {
    await createAuditLog({ action: 'CREATE', entity_type: 'hospitals', entity_id: data[0].id, details: { name: hospital.name } });
  } catch (auditErr) {
    console.error('Audit log error (non-critical):', auditErr);
  }
  return { data, error: null };
}

export async function updateHospital(id: number | string, updates: Partial<Hospital>) {
  const { data, error } = await supabase
    .from('hospitals')
    .update(updates)
    .eq('id', id)
    .select();

  if (error) {
    console.error(`Error updating hospital with id ${id}:`, error);
    return { error, data: null };
  }

  try {
    await createAuditLog({ action: 'UPDATE', entity_type: 'hospitals', entity_id: Number(id), details: { name: updates.name || 'Güncelleme' } });
  } catch (auditErr) {
    console.error('Audit log error (non-critical):', auditErr);
  }
  return { data, error: null };
}

export async function deleteHospital(id: number | string) {
  const { error } = await supabase
    .from('hospitals')
    .delete()
    .eq('id', id);

  if (error) {
    console.error(`Error deleting hospital with id ${id}:`, error);
    return { error };
  }

  try {
    await createAuditLog({ action: 'DELETE', entity_type: 'hospitals', entity_id: Number(id), details: {} });
  } catch (auditErr) {
    console.error('Audit log error (non-critical):', auditErr);
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

export async function fetchHospitalGallery(hospitalId: string | number) {
  const { data, error } = await supabase
    .from('hospital_galleries')
    .select('*')
    .eq('hospital_id', hospitalId)
    .order('display_order', { ascending: true });

  if (error) {
    console.error(`Error fetching gallery for hospital ${hospitalId}:`, error);
    return { data: [], error };
  }
  return { data, error: null };
}

export async function addGalleryImage(hospitalId: string | number, file: File, displayOrder: number = 0) {
  const { url, error: uploadError } = await uploadHospitalImage(file);
  if (uploadError || !url) return { error: uploadError };

  const { data, error } = await supabase
    .from('hospital_galleries')
    .insert([{ hospital_id: hospitalId, image_url: url, display_order: displayOrder }])
    .select();

  if (error) {
    console.error('Error adding gallery image:', error);
    return { error, data: null };
  }
  return { data, error: null };
}

export async function deleteGalleryImage(id: string) {
  const { error } = await supabase
    .from('hospital_galleries')
    .delete()
    .eq('id', id);

  if (error) {
    console.error(`Error deleting gallery image ${id}:`, error);
  }
  return { error };
}
