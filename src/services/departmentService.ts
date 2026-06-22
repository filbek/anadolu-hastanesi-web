import { supabase, Department } from '../lib/supabase';
import { createAuditLog } from './auditLogService';

export async function getDepartments(options: { onlyPublished?: boolean } = {}): Promise<Department[]> {
  try {
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Bölümler yüklenirken zaman aşımı oluştu.')), 20000)
    );

    let query = supabase
      .from('departments')
      .select('*')
      .order('display_order', { ascending: true })
      .order('name', { ascending: true });

    if (options.onlyPublished) {
      query = query.eq('is_published', true);
    }

    const { data, error } = await Promise.race([query, timeoutPromise]) as any;

    if (error) {
      console.error('🔴 [departmentService] Supabase error:', error.code, error.message, error.hint);
      return [];
    }

    console.log(`✅ [departmentService] Fetched ${data?.length ?? 0} departments`);
    return (data as Department[]) || [];
  } catch (err) {
    console.error('Fetch departments timeout or exception:', err);
    return [];
  }
}

export async function getDepartmentBySlug(slug: string): Promise<Department | null> {
  const { data, error } = await supabase
    .from('departments')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) {
    console.error(`Error fetching department with slug ${slug}:`, error);
    return null;
  }

  return data as Department;
}

export async function getDepartmentByName(name: string): Promise<Department | null> {
  const { data, error } = await supabase
    .from('departments')
    .select('*')
    .ilike('name', name)
    .single();

  if (error) {
    console.error(`Error fetching department with name ${name}:`, error);
    return null;
  }

  return data as Department;
}

export async function createDepartment(department: Omit<Department, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('departments')
    .insert([department])
    .select();

  if (error) {
    console.error('Error creating department:', error);
    return { error, data: null };
  }

  await createAuditLog({ action: 'CREATE', entity_type: 'departments', entity_id: data[0].id, details: { name: department.name } });
  return { data, error: null };
}

export async function updateDepartment(id: number, updates: Partial<Department>) {
  const { data, error } = await supabase
    .from('departments')
    .update(updates)
    .eq('id', id)
    .select();

  if (error) {
    console.error(`Error updating department with id ${id}:`, error);
    return { error, data: null };
  }

  await createAuditLog({ action: 'UPDATE', entity_type: 'departments', entity_id: id, details: updates });
  return { data, error: null };
}

export async function deleteDepartment(id: number) {
  const { error } = await supabase
    .from('departments')
    .delete()
    .eq('id', id);

  if (error) {
    console.error(`Error deleting department with id ${id}:`, error);
    return { error };
  }

  await createAuditLog({ action: 'DELETE', entity_type: 'departments', entity_id: id, details: {} });
  return { error: null };
}

export async function uploadDepartmentImage(file: File): Promise<{ url: string | null; error: any }> {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}-${Date.now()}.${fileExt}`;
    const filePath = `department-images/${fileName}`;

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
