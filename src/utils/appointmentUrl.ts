// kendineiyibak.app online randevu linkleri.
//
// Parametresiz kök adres randevu sisteminin ana sayfasını açar ve hasta
// şube/bölüm/doktor seçimini baştan yapmak zorunda kalır. Elimizde HBYS
// karşılıkları varsa doğrudan ilgili takvimi açan derin link kurarız:
//
//   ?type=clinic&facilityId=<GUID>&departmentId=<kod>&physicianId=<kod>
//
// Kodlar admin panelinden girilir; bkz. src/sql/hbys_appointment_ids_migration.sql

export const APPOINTMENT_BASE_URL = 'https://anadoluhastaneleri.kendineiyibak.app/';

// Randevu sisteminde poliklinik randevusunun tipi; şimdilik sabit.
const APPOINTMENT_TYPE = 'clinic';

export type AppointmentLinkParams = {
  facilityId?: string | null;
  departmentId?: string | null;
  physicianId?: string | null;
};

/**
 * Elde olan ID'lerle en spesifik randevu linkini kurar.
 * facilityId yoksa hiçbir parametre anlam taşımadığı için kök adrese döner.
 * departmentId olmadan physicianId gönderilmez (randevu sistemi zinciri bekler).
 */
export function buildAppointmentUrl({ facilityId, departmentId, physicianId }: AppointmentLinkParams = {}): string {
  const facility = (facilityId || '').trim();
  if (!facility) return APPOINTMENT_BASE_URL;

  const params = new URLSearchParams({ type: APPOINTMENT_TYPE, facilityId: facility });

  const department = (departmentId || '').trim();
  if (department) {
    params.set('departmentId', department);

    const physician = (physicianId || '').trim();
    if (physician) {
      params.set('physicianId', physician);
    }
  }

  return `${APPOINTMENT_BASE_URL}?${params.toString()}`;
}
