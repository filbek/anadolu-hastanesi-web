import { supabase, HospitalDepartmentHbys } from '../lib/supabase';

// Şube bazlı bölüm kodu eşlemesi: "<hospitalId>:<departmentId>" -> HBYS kodu
export type HbysDepartmentMap = Record<string, string>;

export const hbysDepartmentKey = (hospitalId: number | string, departmentId: number | string) =>
  `${hospitalId}:${departmentId}`;

// Tablo birkaç yüz satırı geçmez (şube × bölüm); tek seferde çekip
// react-query cache'inde tutmak, sayfa başına sorgudan ucuz.
export async function getHbysDepartmentMap(): Promise<HbysDepartmentMap> {
  const { data, error } = await supabase
    .from('hospital_department_hbys')
    .select('hospital_id, department_id, hbys_department_id');

  if (error) {
    console.error('Error fetching HBYS department map:', error);
    return {};
  }

  const map: HbysDepartmentMap = {};
  for (const row of (data as HospitalDepartmentHbys[]) || []) {
    if (row.hbys_department_id) {
      map[hbysDepartmentKey(row.hospital_id, row.department_id)] = row.hbys_department_id;
    }
  }
  return map;
}

// Bir bölümün tüm şubelerdeki kodlarını getirir (bölüm düzenleme ekranı için).
export async function getHbysIdsForDepartment(departmentId: number): Promise<Record<number, string>> {
  const { data, error } = await supabase
    .from('hospital_department_hbys')
    .select('hospital_id, hbys_department_id')
    .eq('department_id', departmentId);

  if (error) {
    console.error('Error fetching HBYS ids for department:', error);
    return {};
  }

  const result: Record<number, string> = {};
  for (const row of (data as any[]) || []) {
    result[Number(row.hospital_id)] = row.hbys_department_id || '';
  }
  return result;
}

// Bölüm ekranındaki şube→kod tablosunu kaydeder.
// Boş bırakılan şubelerin kaydı silinir; dolu olanlar upsert edilir.
export async function saveHbysIdsForDepartment(
  departmentId: number,
  idsByHospital: Record<number, string>
): Promise<{ error: any }> {
  const rows = Object.entries(idsByHospital)
    .filter(([, value]) => (value || '').trim() !== '')
    .map(([hospitalId, value]) => ({
      hospital_id: Number(hospitalId),
      department_id: departmentId,
      hbys_department_id: value.trim(),
      updated_at: new Date().toISOString(),
    }));

  const emptyHospitalIds = Object.entries(idsByHospital)
    .filter(([, value]) => (value || '').trim() === '')
    .map(([hospitalId]) => Number(hospitalId));

  if (emptyHospitalIds.length > 0) {
    const { error } = await supabase
      .from('hospital_department_hbys')
      .delete()
      .eq('department_id', departmentId)
      .in('hospital_id', emptyHospitalIds);
    if (error) {
      console.error('Error clearing HBYS department ids:', error);
      return { error };
    }
  }

  if (rows.length > 0) {
    const { error } = await supabase
      .from('hospital_department_hbys')
      .upsert(rows, { onConflict: 'hospital_id,department_id' });
    if (error) {
      console.error('Error saving HBYS department ids:', error);
      return { error };
    }
  }

  return { error: null };
}
