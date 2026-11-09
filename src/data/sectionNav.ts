/**
 * Footer'daki "Kurumsal" ve "Hasta Hizmetleri" grupları ile bu sayfalardaki
 * bölüm menüsünün (SectionNav) ortak kaynağı. Yeni sayfa eklenince yalnızca
 * burayı güncellemek yeterli — footer ve bölüm menüsü birlikte güncellenir.
 */
export type SectionNavLink = {
  /** footerLinks.* çeviri anahtarı */
  key: string;
  /** Çeviri yoksa kullanılacak Türkçe metin */
  fallback: string;
  path: string;
};

export type SectionNavGroup = {
  id: 'corporate' | 'patientServices';
  /** footer.* çeviri anahtarı */
  titleKey: string;
  titleFallback: string;
  links: SectionNavLink[];
};

export const SECTION_NAV_GROUPS: SectionNavGroup[] = [
  {
    id: 'corporate',
    titleKey: 'footer.corporate',
    titleFallback: 'Kurumsal',
    links: [
      { key: 'footerLinks.about', fallback: 'Hakkımızda', path: '/hakkimizda' },
      { key: 'footerLinks.presidentMessage', fallback: 'Başkanın Mesajı', path: '/baskanin-mesaji' },
      { key: 'footerLinks.missionVision', fallback: 'Misyon, Vizyon & Değerlerimiz', path: '/misyon-vizyon-ve-degerlerimiz' },
      { key: 'footerLinks.management', fallback: 'Yönetim', path: '/yonetim' },
      { key: 'footerLinks.qualityManagement', fallback: 'Kalite Yönetimi', path: '/kalite-yonetimi' },
      { key: 'footerLinks.socialResponsibility', fallback: 'Sosyal Sorumluluk Projeleri', path: '/sosyal-sorumluluk-projeleri' },
      { key: 'footerLinks.career', fallback: 'Kariyer', path: '/kariyer' },
    ],
  },
  {
    id: 'patientServices',
    titleKey: 'footer.patientServices',
    titleFallback: 'Hasta Hizmetleri',
    links: [
      { key: 'footerLinks.patientRights', fallback: 'Hasta Hakları', path: '/hasta-haklari' },
      { key: 'footerLinks.emergency', fallback: 'Acil Servis', path: '/acil-servis' },
      { key: 'footerLinks.companionRules', fallback: 'Refakatçi Kuralları', path: '/refakat-politikasi-ve-refakatci-kurallari' },
      { key: 'footerLinks.visitHours', fallback: 'Ziyaret Saatleri', path: '/ziyaret-kurallari-ve-saatleri' },
      { key: 'footerLinks.complaintPolicy', fallback: 'Şikayet Politikası', path: '/sikayet-politikasi' },
      { key: 'footerLinks.feedback', fallback: 'Sizi Dinliyoruz', path: '/sizi-dinliyoruz' },
      { key: 'footerLinks.hospitalGuide', fallback: 'Hastane İçi Rehber', path: '/hastane-ici-rehber' },
      { key: 'footerLinks.contractedInstitutions', fallback: 'Anlaşmalı Kurumlar', path: '/anlasmali-kurumlar' },
      { key: 'footerLinks.transport', fallback: 'Ulaşım', path: '/ulasim' },
      { key: 'footerLinks.prenatalSchool', fallback: 'Gebe Okulu', path: '/gebe-okulu' },
    ],
  },
];

const normalize = (path: string) => (path.length > 1 ? path.replace(/\/+$/, '') : path);

/** Verilen yolun ait olduğu grubu döndürür (yoksa null). */
export const findSectionGroup = (pathname: string): SectionNavGroup | null => {
  const current = normalize(pathname);
  return SECTION_NAV_GROUPS.find(g => g.links.some(l => l.path === current)) || null;
};
