/**
 * Google Maps Yol Tarifi ve Harita Bağlantıları Yardımcı Fonksiyonları
 */

interface DirectionHospitalParams {
  latitude?: string | number;
  longitude?: string | number;
  address?: string;
  name?: string;
}

/**
 * Verilen hastane bilgilerine göre %100 çalışan Google Maps Yol Tarifi (Directions) URL'si üretir.
 */
export const getDirectionsUrl = (hospital: DirectionHospitalParams): string => {
  const lat = Number(hospital.latitude);
  const lng = Number(hospital.longitude);

  if (isFinite(lat) && isFinite(lng) && lat !== 0 && lng !== 0) {
    return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
  }

  if (hospital.address) {
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(hospital.address)}`;
  }

  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(hospital.name || 'Anadolu Hastanesi')}`;
};

/**
 * Embed iframe harita URL'si üretir.
 */
export const getMapEmbedUrl = (hospital: DirectionHospitalParams): string => {
  const lat = Number(hospital.latitude);
  const lng = Number(hospital.longitude);

  if (isFinite(lat) && isFinite(lng) && lat !== 0 && lng !== 0) {
    return `https://maps.google.com/maps?q=${lat},${lng}&z=16&ie=UTF8&iwloc=&output=embed`;
  }

  if (hospital.address) {
    return `https://maps.google.com/maps?q=${encodeURIComponent(hospital.address)}&z=16&ie=UTF8&iwloc=&output=embed`;
  }

  return `https://maps.google.com/maps?q=${encodeURIComponent(hospital.name || 'Anadolu Hastanesi')}&z=16&ie=UTF8&iwloc=&output=embed`;
};
