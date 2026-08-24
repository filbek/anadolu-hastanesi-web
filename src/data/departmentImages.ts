// Bölüm görselleri için güvenli varsayılanlar.
//
// Bölüm görseli normalde admin panelinden yüklenir (department.image_url /
// department.images). Kayıtta görsel yoksa buradaki bölüme özel varsayılan
// kullanılır. Daha önce kullanılan varsayılan Unsplash adresi 404 döndüğü için
// "Tedavi Süreci" sekmesinde kırık görsel çıkıyordu; buradaki tüm adresler
// HTTP 200 döndüğü doğrulanarak seçilmiştir.

const U = (id: string, w = 1200) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

// Hiçbir eşleşme yoksa ve görsel yüklenemezse kullanılan son çare.
export const DEPARTMENT_FALLBACK_IMAGE = U('photo-1612349317150-e413f6a5b16d');

// Bölüm slug'ı -> temsili görsel
const DEPARTMENT_IMAGES: Record<string, string> = {
  // Cerrahi branşlar — ameliyathane
  'genel-cerrahi': U('photo-1581595220892-b0739db3ba8c'),
  'kalp-ve-damar-cerrahisi': U('photo-1504439468489-c8920d796a29'),
  'beyin-ve-sinir-cerrahisi': U('photo-1559757148-5c350d0d3c56'),
  'ortopedi-ve-travmatoloji': U('photo-1579684385127-1ef15d508118'),
  'cocuk-cerrahisi': U('photo-1581595220892-b0739db3ba8c'),
  'el-ve-mikro-cerrahisi': U('photo-1579684385127-1ef15d508118'),
  'plastik-rekonstruktif-ve-estetik-cerrahi': U('photo-1551076805-e1869033e561'),
  'uroloji': U('photo-1551076805-e1869033e561'),
  'kadin-hastaliklari-ve-dogum': U('photo-1538108149393-fbbd81895907'),
  'goz-sagligi-ve-hastaliklari': U('photo-1551076805-e1869033e561'),
  'kulak-burun-bogaz': U('photo-1551076805-e1869033e561'),

  // Nöro branşlar — beyin anatomisi
  'noroloji': U('photo-1559757148-5c350d0d3c56'),
  'algoloji-agri': U('photo-1559757148-5c350d0d3c56'),

  // Yatan hasta / yoğun bakım
  'yogun-bakim': U('photo-1538108149393-fbbd81895907'),
  'yenidogan-yogun-bakim-unitesi': U('photo-1538108149393-fbbd81895907'),
  'anestezi-ve-reanimasyon': U('photo-1504439468489-c8920d796a29'),
  'acil-servis': U('photo-1516549655169-df83a0774514'),

  // Görüntüleme / laboratuvar — cihaz ve klinik ortam
  'radyoloji': U('photo-1516549655169-df83a0774514'),
  'girisimsel-radyoloji': U('photo-1516549655169-df83a0774514'),
  'biyokimya': U('photo-1516549655169-df83a0774514'),
  'patoloji': U('photo-1516549655169-df83a0774514'),

  // Poliklinik branşları — hekim/muayene
  'kardiyoloji': U('photo-1532938911079-1b06ac7ceec7'),
  'cocuk-kardiyoloji': U('photo-1532938911079-1b06ac7ceec7'),
  'ic-hastaliklari-dahiliye': U('photo-1584982751601-97dcc096659c'),
  'gogus-hastaliklari': U('photo-1584982751601-97dcc096659c'),
  'gastroenteroloji': U('photo-1584982751601-97dcc096659c'),
  'nefroloji': U('photo-1584982751601-97dcc096659c'),
  'endokrinoloji-ve-metabolizma': U('photo-1584982751601-97dcc096659c'),
  'diyabet-poliklinigi': U('photo-1584982751601-97dcc096659c'),
  'enfeksiyon-hastaliklari-ve-mikrobiyoloji': U('photo-1584982751601-97dcc096659c'),
  'medikal-onkoloji': U('photo-1582213782179-e0d53f98f2ca'),
  'cocuk-sagligi-ve-hastaliklari': U('photo-1631217868264-e5b90bb7e133'),
  'dermatoloji': U('photo-1612349317150-e413f6a5b16d'),
  'medikal-estetik': U('photo-1612349317150-e413f6a5b16d'),
  'fizik-tedavi-ve-rehabilitasyon': U('photo-1519494026892-80bbd2d6fd0d'),
  'check-up': U('photo-1584982751601-97dcc096659c'),

  // Danışmanlık / destek birimleri — hasta ile görüşme
  'psikiyatri': U('photo-1631217868264-e5b90bb7e133'),
  'psikoloji': U('photo-1631217868264-e5b90bb7e133'),
  'cocuk-ve-ergen-ruh-sagligi': U('photo-1631217868264-e5b90bb7e133'),
  'beslenme-ve-diyet': U('photo-1631217868264-e5b90bb7e133'),
  'agiz-ve-dis-sagligi': U('photo-1551076805-e1869033e561'),
  'ortodonti': U('photo-1551076805-e1869033e561'),
};

/** Bölüm için temsili görsel; kayıtta görsel yoksa kullanılır. */
export function getDepartmentImage(slug?: string | null): string {
  if (!slug) return DEPARTMENT_FALLBACK_IMAGE;
  return DEPARTMENT_IMAGES[slug] || DEPARTMENT_FALLBACK_IMAGE;
}

/**
 * <img onError> için: adres yüklenemezse son çare görsele geçer.
 * Sonsuz döngüye girmemesi için bir kez çalışır.
 */
export function handleDepartmentImageError(e: React.SyntheticEvent<HTMLImageElement>) {
  const img = e.currentTarget;
  if (img.dataset.fallbackApplied) return;
  img.dataset.fallbackApplied = '1';
  img.src = DEPARTMENT_FALLBACK_IMAGE;
}
