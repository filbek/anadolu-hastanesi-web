import { supabase, ManagementTeamMember } from '../lib/supabase';
import { createAuditLog } from './auditLogService';

export async function getManagementTeam(): Promise<ManagementTeamMember[]> {
  try {
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Yönetim ekibi yüklenirken zaman aşımı oluştu.')), 8000)
    );

    const fetchPromise = supabase
      .from('management_team')
      .select(`
        *,
        doctor:doctor_id(id, name, title, image, department_id)
      `)
      .eq('is_active', true)
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: true });

    const { data, error } = await Promise.race([fetchPromise, timeoutPromise]) as any;

    if (error) {
      console.error('Error fetching management team:', error);
      return [];
    }

    return (data as unknown as ManagementTeamMember[]) || [];
  } catch (err) {
    console.error('Fetch management team timeout or exception:', err);
    return [];
  }
}

export async function getAllManagementTeam(): Promise<ManagementTeamMember[]> {
  try {
    const { data, error } = await supabase
      .from('management_team')
      .select(`
        *,
        doctor:doctor_id(id, name, title, image, department_id)
      `)
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching all management team:', error);
      return [];
    }

    return (data as unknown as ManagementTeamMember[]) || [];
  } catch (err) {
    console.error('Fetch all management team exception:', err);
    return [];
  }
}

export async function createManagementTeamMember(member: Omit<ManagementTeamMember, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('management_team')
    .insert([member])
    .select();

  if (error) {
    console.error('Error creating management team member:', error);
    return { error, data: null };
  }
  if (data && data[0]) {
    await createAuditLog({
      action: 'CREATE',
      entity_type: 'management_team',
      entity_id: data[0].id,
      details: { name: member.name, title: member.title, role: member.role }
    });
  }
  return { data, error: null };
}

export async function updateManagementTeamMember(id: number, updates: Partial<ManagementTeamMember>) {
  const { data, error } = await supabase
    .from('management_team')
    .update(updates)
    .eq('id', id)
    .select();

  if (error) {
    console.error(`Error updating management team member with id ${id}:`, error);
    return { error, data: null };
  }
  await createAuditLog({
    action: 'UPDATE',
    entity_type: 'management_team',
    entity_id: id,
    details: updates
  });
  return { data, error: null };
}

export async function deleteManagementTeamMember(id: number) {
  const { error } = await supabase
    .from('management_team')
    .delete()
    .eq('id', id);

  if (error) {
    console.error(`Error deleting management team member with id ${id}:`, error);
    return { error };
  }
  await createAuditLog({
    action: 'DELETE',
    entity_type: 'management_team',
    entity_id: id,
    details: {}
  });
  return { error: null };
}

export async function uploadManagementTeamImage(file: File): Promise<{ url: string | null; error: any }> {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}-${Date.now()}.${fileExt}`;
    const filePath = `management-team/${fileName}`;

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
