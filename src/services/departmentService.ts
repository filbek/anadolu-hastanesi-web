import { supabase, Department } from '../lib/supabase';

export async function getDepartments(): Promise<Department[]> {
  const { data, error } = await supabase
    .from('departments')
    .select('*')
    .order('name');

  if (error) {
    console.error('Error fetching departments:', error);
    return [];
  }

  return data as Department[];
}

export async function getDepartmentsByCategory(category: string): Promise<Department[]> {
  const { data, error } = await supabase
    .from('departments')
    .select('*')
    .eq('category', category)
    .order('name');

  if (error) {
    console.error(`Error fetching departments with category ${category}:`, error);
    return [];
  }

  return data as Department[];
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

export async function createDepartment(department: Omit<Department, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('departments')
    .insert([department])
    .select();

  if (error) {
    console.error('Error creating department:', error);
    return { error, data: null };
  }

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

  return { error: null };
}
