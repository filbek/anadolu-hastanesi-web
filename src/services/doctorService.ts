import { supabase, Doctor } from '../lib/supabase';
import { createAuditLog } from './auditLogService';

// display_order'a göre sırala: 1+ küçükten büyüğe (üstte), 0/boş en sona (isme göre)
function sortByDisplayOrder(list: Doctor[]): Doctor[] {
  return [...list].sort((a, b) => {
    const ao = a.display_order && a.display_order > 0 ? a.display_order : Number.MAX_SAFE_INTEGER;
    const bo = b.display_order && b.display_order > 0 ? b.display_order : Number.MAX_SAFE_INTEGER;
    if (ao !== bo) return ao - bo;
    return a.name.localeCompare(b.name, 'tr');
  });
}

export async function getDoctors(): Promise<Doctor[]> {
  try {
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Doktorlar yüklenirken zaman aşımı oluştu.')), 8000)
    );

    const fetchPromise = supabase
      .from('doctors')
      .select(`
        *,
        departments:department_id(name, slug, translations),
        hospitals:hospital_id(name, slug, translations)
      `)
      .eq('is_active', true)
      .order('name');

    const { data, error } = await Promise.race([fetchPromise, timeoutPromise]) as any;

    if (error) {
      console.error('Error fetching doctors:', error);
      return [];
    }

    return (data as unknown as Doctor[]) || [];
  } catch (err) {
    console.error('Fetch doctors timeout or exception:', err);
    return [];
  }
}

export async function getDoctorsByDepartment(departmentId: number): Promise<Doctor[]> {
  const { data, error } = await supabase
    .from('doctors')
    .select(`
      *,
      departments:department_id(name, slug, translations),
      hospitals:hospital_id(name, slug, translations)
    `)
    .eq('department_id', departmentId)
    .eq('is_active', true)
    .order('name');

  if (error) {
    console.error(`Error fetching doctors with department id ${departmentId}:`, error);
    return [];
  }

  return sortByDisplayOrder(data as unknown as Doctor[]);
}

export async function getDoctorsByHospital(hospitalId: number): Promise<Doctor[]> {
  const { data, error } = await supabase
    .from('doctors')
    .select(`
      *,
      departments:department_id(name, slug, translations),
      hospitals:hospital_id(name, slug, translations)
    `)
    .eq('hospital_id', hospitalId)
    .eq('is_active', true)
    .order('name');

  if (error) {
    console.error(`Error fetching doctors with hospital id ${hospitalId}:`, error);
    return [];
  }

  return sortByDisplayOrder(data as unknown as Doctor[]);
}

export async function getDoctorBySlug(slug: string): Promise<Doctor | null> {
  const { data, error } = await supabase
    .from('doctors')
    .select(`
      *,
      departments:department_id(name, slug, translations),
      hospitals:hospital_id(name, slug, translations)
    `)
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (error) {
    console.error(`Error fetching doctor with slug ${slug}:`, error);
    return null;
  }

  return data as unknown as Doctor;
}

export async function createDoctor(doctor: Omit<Doctor, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('doctors')
    .insert([doctor])
    .select();

  if (error) {
    console.error('Error creating doctor:', error);
    return { error, data: null };
  }
  if (data && data[0]) {
    await createAuditLog({ action: 'CREATE', entity_type: 'doctors', entity_id: data[0].id, details: { name: doctor.name, slug: doctor.slug } });
  }
  return { data, error: null };
}

export async function updateDoctor(id: number, updates: Partial<Doctor>) {
  const { data, error } = await supabase
    .from('doctors')
    .update(updates)
    .eq('id', id)
    .select();

  if (error) {
    console.error(`Error updating doctor with id ${id}:`, error);
    return { error, data: null };
  }
  await createAuditLog({ action: 'UPDATE', entity_type: 'doctors', entity_id: id, details: updates });
  return { data, error: null };
}

export async function deleteDoctor(id: number) {
  const { error } = await supabase
    .from('doctors')
    .delete()
    .eq('id', id);

  if (error) {
    console.error(`Error deleting doctor with id ${id}:`, error);
    return { error };
  }
  await createAuditLog({ action: 'DELETE', entity_type: 'doctors', entity_id: id, details: {} });
  return { error: null };
}

export async function uploadDoctorImage(file: File): Promise<{ url: string | null; error: any }> {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}-${Date.now()}.${fileExt}`;
    const filePath = `doctor-images/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('doctor-images')
      .upload(filePath, file);

    if (uploadError) {
      return { error: uploadError, url: null };
    }

    const { data } = supabase.storage.from('doctor-images').getPublicUrl(filePath);
    return { url: data.publicUrl, error: null };
  } catch (error) {
    return { error, url: null };
  }
}
