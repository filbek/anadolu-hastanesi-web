import { useCallback } from 'react';
import { useQuery } from 'react-query';
import { getHbysDepartmentMap, hbysDepartmentKey } from '../services/hbysService';
import { useHospitals } from './useHospitals';
import { buildAppointmentUrl, APPOINTMENT_BASE_URL } from '../utils/appointmentUrl';

/**
 * Online randevu linklerini kuran yardımcı.
 *
 * Kullanım:
 *   const appointmentUrl = useAppointmentUrl();
 *   <a href={appointmentUrl({ hospitalId, departmentId, physicianId })}>
 *
 * Eksik ID'lerde otomatik olarak bir üst kırılıma (şube → grup ana sayfası)
 * düşer, yani link hiçbir zaman kırık olmaz.
 */
export function useAppointmentUrl() {
  const { data: hospitals = [] } = useHospitals();
  const { data: departmentMap = {} } = useQuery('hbys-department-map', getHbysDepartmentMap, {
    staleTime: 5 * 60 * 1000,
  });

  return useCallback(
    (opts: {
      hospitalId?: number | string | null;
      departmentId?: number | string | null;
      physicianId?: string | null;
    } = {}) => {
      const { hospitalId, departmentId, physicianId } = opts;
      if (!hospitalId) return APPOINTMENT_BASE_URL;

      const hospital = hospitals.find((h) => String(h.id) === String(hospitalId));
      const facilityId = hospital?.hbys_facility_id;
      if (!facilityId) return APPOINTMENT_BASE_URL;

      const hbysDepartmentId = departmentId
        ? departmentMap[hbysDepartmentKey(hospitalId, departmentId)]
        : undefined;

      return buildAppointmentUrl({
        facilityId,
        departmentId: hbysDepartmentId,
        physicianId,
      });
    },
    [hospitals, departmentMap]
  );
}
