import { supabase, Doctor } from '../lib/supabase';

export async function getDoctors(): Promise<Doctor[]> {
  const { data, error } = await supabase
    .from('doctors')
    .select(`
      *,
      departments:department_id(name, slug),
      hospitals:hospital_id(name, slug)
    `)
    .order('name');

  if (error) {
    console.error('Error fetching doctors:', error);
    return [];
  }

  return data as unknown as Doctor[];
}

export async function getDoctorsByDepartment(departmentId: number): Promise<Doctor[]> {
  const { data, error } = await supabase
    .from('doctors')
    .select(`
      *,
      departments:department_id(name, slug),
      hospitals:hospital_id(name, slug)
    `)
    .eq('department_id', departmentId)
    .order('name');

  if (error) {
    console.error(`Error fetching doctors with department id ${departmentId}:`, error);
    return [];
  }

  return data as unknown as Doctor[];
}

export async function getDoctorsByHospital(hospitalId: number): Promise<Doctor[]> {
  const { data, error } = await supabase
    .from('doctors')
    .select(`
      *,
      departments:department_id(name, slug),
      hospitals:hospital_id(name, slug)
    `)
    .eq('hospital_id', hospitalId)
    .order('name');

  if (error) {
    console.error(`Error fetching doctors with hospital id ${hospitalId}:`, error);
    return [];
  }

  return data as unknown as Doctor[];
}

export async function getDoctorBySlug(slug: string): Promise<Doctor | null> {
  const { data, error } = await supabase
    .from('doctors')
    .select(`
      *,
      departments:department_id(name, slug),
      hospitals:hospital_id(name, slug)
    `)
    .eq('slug', slug)
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
