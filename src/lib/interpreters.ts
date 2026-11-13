/** Tercüman / danışman kaydı — tablo: interpreters (src/sql/interpreters_migration.sql) */
export type Interpreter = {
  id: number;
  name: string;
  /** Virgülle ayrılmış dil / bölge listesi */
  languages: string;
  phone: string;
  display_order: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
};

/** QR kodun açtığı sayfanın yolu. Sitede hiçbir yerden bağlantı verilmez. */
export const INTERPRETERS_PATH = '/tercumanlar';

export const splitLanguages = (languages: string) =>
  languages.split(',').map((s) => s.trim()).filter(Boolean);

/** Telefonu yalnızca rakamlara indirip uluslararası biçime (90XXXXXXXXXX) çevirir. */
export const toInternational = (phone: string): string => {
  let d = phone.replace(/\D/g, '');
  if (d.startsWith('0090')) d = d.slice(2);
  if (d.startsWith('0')) d = '90' + d.slice(1);
  else if (d.length === 10) d = '90' + d; // 5XX XXX XX XX
  return d;
};

/** Ekranda gösterim: 0537 303 69 19 */
export const formatPhone = (phone: string): string => {
  const d = toInternational(phone);
  if (d.length === 12 && d.startsWith('90')) {
    const n = d.slice(2);
    return `0${n.slice(0, 3)} ${n.slice(3, 6)} ${n.slice(6, 8)} ${n.slice(8, 10)}`;
  }
  return phone.trim();
};

export const telHref = (phone: string) => `tel:+${toInternational(phone)}`;
export const whatsappHref = (phone: string) => `https://wa.me/${toInternational(phone)}`;
