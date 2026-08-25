import { supabase } from '../lib/supabase';
import type { FormType } from './emailService';

/**
 * WhatsApp yönlendirmesi yalnizca kısa formlar icin anlamlıdır; iş başvurusu
 * gibi çoklu bölümden oluşan formlar wa.me bağlantısına sığmadığından
 * kapsam dışıdır ve admin panelindeki listede görünmez.
 */
export type WhatsAppFormType = Exclude<FormType, 'job_application'>;

/**
 * Form başvurularının şube bazında hangi WhatsApp numarasına
 * yönlendirileceğini tutan kural. Admin panelinden yönetilir
 * (Admin > WhatsApp Yönlendirme).
 */
export interface NotificationRoute {
  id?: number;
  form_type: WhatsAppFormType;
  /** null / boş => tüm şubeler için geçerli varsayılan kural */
  hospital_name: string | null;
  /** Uluslararası formatta, yalnızca rakam: 905321234567 */
  whatsapp_number: string;
  label: string | null;
  priority: number;
  is_active: boolean;
}

export const FORM_TYPE_LABELS: Record<WhatsAppFormType, string> = {
  second_opinion: 'İkinci Görüş Formu',
  contact: 'İletişim Formu',
  feedback: 'Hasta Geri Bildirim Formu',
};

const MESSAGE_TITLES: Record<WhatsAppFormType, string> = {
  second_opinion: 'YENİ İKİNCİ GÖRÜŞ BAŞVURUSU',
  contact: 'YENİ İLETİŞİM FORMU MESAJI',
  feedback: 'YENİ HASTA GERİ BİLDİRİMİ',
};

/** Form alanlarının WhatsApp mesajında görünecek Türkçe karşılıkları */
const FIELD_LABELS: Record<string, string> = {
  name: 'Ad Soyad',
  email: 'E-posta',
  phone: 'Telefon',
  hospital: 'Hastane',
  subject: 'Konu',
  department: 'Birim / Bölüm',
  type: 'Bildirim Türü',
  source: 'Başvuran',
  message: 'Mesaj',
  file_url: 'Ekli Dosya',
};

/** Mesajda alanların görüneceği sıra; listede olmayanlar sona eklenir */
const FIELD_ORDER = Object.keys(FIELD_LABELS);

/**
 * Telefon numarasını wa.me'nin beklediği biçime çevirir: yalnızca rakam,
 * ülke kodu dahil. "0532 123 45 67" ve "+90 532 123 45 67" gibi yaygın
 * girişleri 905321234567'ye normalize eder.
 */
export function normalizeWhatsAppNumber(raw: string): string {
  const digits = (raw || '').replace(/\D/g, '');
  if (!digits) return '';
  // 0 ile başlayan 11 haneli yerel format (05321234567) -> 90 ekle
  if (digits.length === 11 && digits.startsWith('0')) return `90${digits.slice(1)}`;
  // Ülke kodsuz 10 hane (5321234567) -> 90 ekle
  if (digits.length === 10 && digits.startsWith('5')) return `90${digits}`;
  return digits;
}

/**
 * Verilen form tipi ve şube için geçerli WhatsApp kuralını bulur.
 *
 * Eşleşme sırası: önce şubeye özel kural, yoksa şubesi boş bırakılmış
 * (tüm şubeler) varsayılan kural. Aynı seviyede birden fazla kural varsa
 * en yüksek `priority` kazanır — wa.me tek numara desteklediği için
 * tek bir kural seçilmek zorundadır.
 *
 * Hata durumunda null döner; çağıran taraf akışı bozmadan devam etmelidir.
 */
export async function findWhatsAppRoute(
  formType: WhatsAppFormType,
  hospitalName?: string | null,
): Promise<NotificationRoute | null> {
  try {
    const { data, error } = await supabase
      .from('notification_routes')
      .select('*')
      .eq('form_type', formType)
      .eq('is_active', true);

    if (error) {
      console.error('WhatsApp yönlendirme kuralları okunamadı:', error);
      return null;
    }

    const routes = (data || []) as NotificationRoute[];
    if (routes.length === 0) return null;

    const target = (hospitalName || '').trim().toLocaleLowerCase('tr');
    const matches = routes.filter((r) => {
      const scope = (r.hospital_name || '').trim().toLocaleLowerCase('tr');
      return scope === '' || (target !== '' && scope === target);
    });
    if (matches.length === 0) return null;

    // Şubeye özel kurallar varsayılanın önüne geçer, sonra öncelik
    matches.sort((a, b) => {
      const aSpecific = (a.hospital_name || '').trim() !== '';
      const bSpecific = (b.hospital_name || '').trim() !== '';
      if (aSpecific !== bSpecific) return aSpecific ? -1 : 1;
      return b.priority - a.priority;
    });

    return matches[0];
  } catch (err) {
    console.error('WhatsApp yönlendirmesi belirlenirken hata:', err);
    return null;
  }
}

/** Form verisini okunabilir bir WhatsApp mesajına dönüştürür. */
export function buildWhatsAppMessage(
  formType: WhatsAppFormType,
  data: Record<string, unknown>,
): string {
  const entries = Object.entries(data).filter(
    ([, v]) => v !== null && v !== undefined && String(v).trim() !== '',
  );

  entries.sort(([a], [b]) => {
    const ai = FIELD_ORDER.indexOf(a);
    const bi = FIELD_ORDER.indexOf(b);
    return (ai === -1 ? FIELD_ORDER.length : ai) - (bi === -1 ? FIELD_ORDER.length : bi);
  });

  const lines = entries.map(([key, value]) => {
    const label = FIELD_LABELS[key] || key;
    return `*${label}:* ${String(value).trim()}`;
  });

  const timestamp = new Date().toLocaleString('tr-TR', { timeZone: 'Europe/Istanbul' });

  return [
    `*${MESSAGE_TITLES[formType]}*`,
    'Anadolu Hastaneleri Grubu — web sitesi formu',
    '',
    ...lines,
    '',
    `_Gönderim: ${timestamp}_`,
  ].join('\n');
}

/**
 * Ziyaretçinin kendi WhatsApp'ında, mesajı hazır doldurulmuş bir
 * konuşma açan wa.me bağlantısını üretir.
 */
export function buildWhatsAppUrl(
  number: string,
  formType: WhatsAppFormType,
  data: Record<string, unknown>,
): string {
  const to = normalizeWhatsAppNumber(number);
  const text = encodeURIComponent(buildWhatsAppMessage(formType, data));
  return `https://wa.me/${to}?text=${text}`;
}

/**
 * WhatsApp bağlantısını yeni sekmede açar.
 *
 * Not: Tarayıcıların pop-up engelleyicisine takılmamak için bu fonksiyon
 * mutlaka bir kullanıcı tıklamasının içinden çağrılmalıdır — form gönderimi
 * gibi asenkron bir işlemin ardından otomatik çağrılmamalıdır.
 */
export function openWhatsApp(url: string): void {
  window.open(url, '_blank', 'noopener,noreferrer');
}
