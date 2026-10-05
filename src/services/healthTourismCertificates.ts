import { supabase } from '../lib/supabase';

/** site_settings.health_tourism_certificates içindeki tek bir yetki belgesi. */
export interface HealthTourismCertificate {
  id: string;
  /** Belgenin ait olduğu hastane, ör. "Avcılar Anadolu Hastanesi" */
  title: string;
  /** Belge adı, ör. "Uluslararası Sağlık Turizmi Yetki Belgesi" */
  subtitle?: string;
  image_url: string;
}

/** Migration çalıştırılmamışsa veya veri okunamazsa gösterilen mevcut belge. */
export const DEFAULT_HEALTH_TOURISM_CERTIFICATES: HealthTourismCertificate[] = [
  {
    id: 'silivri',
    title: 'Silivri Anadolu Hastanesi',
    subtitle: 'Uluslararası Sağlık Turizmi Yetki Belgesi',
    image_url: '/uploads/saglik-turizmi-yetki-belgesi.png',
  },
];

export const fetchHealthTourismCertificates = async (): Promise<{
  settingsId: string | number | null;
  certificates: HealthTourismCertificate[];
}> => {
  const { data, error } = await supabase
    .from('site_settings')
    .select('id, health_tourism_certificates')
    .limit(1)
    .maybeSingle();
  if (error) throw error;

  const list = Array.isArray(data?.health_tourism_certificates)
    ? (data!.health_tourism_certificates as HealthTourismCertificate[]).filter((c) => c?.image_url)
    : [];

  return { settingsId: data?.id ?? null, certificates: list };
};
