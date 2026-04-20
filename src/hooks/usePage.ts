import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface PageData {
  id: number;
  title: string;
  slug: string;
  content: string;
  hero_title?: string;
  hero_subtitle?: string;
  hero_image?: string;
  meta_title?: string;
  meta_description?: string;
  is_published: boolean;
  page_type: 'static' | 'dynamic' | 'landing';
  template: string;
  sections?: PageSection[];
}

interface PageSection {
  id: string;
  type: 'hero' | 'text' | 'image' | 'gallery' | 'cta' | 'features' | 'testimonials' | 'contact';
  title?: string;
  subtitle?: string;
  content?: string;
  image?: string;
  images?: string[];
  button_text?: string;
  button_link?: string;
  settings?: Record<string, any>;
  order: number;
}

interface PageContent {
  page_slug: string;
  sections: PageSection[];
}

export const usePage = (slug: string) => {
  const [state, setState] = useState<{
    pageData: PageData | null;
    pageContent: PageContent | null;
    loading: boolean;
    error: string | null;
  }>({
    pageData: null,
    pageContent: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    fetchPageData();
  }, [slug]);

  const fetchPageData = async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      // Add a timeout to prevent hanging the whole home page
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Sayfa verisi yüklenirken zaman aşımı oluştu.')), 15000)
      );

      // Fetch page basic data with timeout
      const pagePromise = supabase
        .from('pages')
        .select('*')
        .eq('slug', slug === 'ana-sayfa' ? '/' : slug)
        .eq('is_published', true)
        .single();

      const { data: page, error: pageError } = await Promise.race([pagePromise, timeoutPromise]) as any;
      if (pageError && pageError.code !== 'PGRST116') { // PGRST116 is "no rows found"
        console.warn('Page fetch error:', pageError);
      }

      // Fetch page content sections with timeout
      const sectionsPromise = supabase
        .from('page_sections')
        .select('*')
        .eq('page_slug', slug === 'ana-sayfa' ? '/' : slug)
        .eq('is_visible', true)
        .order('order_index');

      const { data: sections, error: sectionsError } = await Promise.race([sectionsPromise, timeoutPromise]) as any;
      if (sectionsError) {
        console.warn('Page sections fetch error:', sectionsError);
      }

      setState({
        pageData: page || getDefaultPageData(slug),
        pageContent: sections ? { page_slug: slug, sections: sections.map((s: any) => ({
          id: s.id,
          type: s.section_type,
          title: s.title,
          subtitle: s.subtitle,
          content: typeof s.content === 'string' ? s.content : JSON.stringify(s.content),
          image: s.image_url,
          order: s.order_index
        })) } : getDefaultPageContent(slug),
        loading: false,
        error: null
      });

    } catch (err: any) {
      console.error('Error fetching page (resorted to defaults):', err);
      setState({
        pageData: getDefaultPageData(slug),
        pageContent: getDefaultPageContent(slug),
        loading: false,
        error: err.message
      });
    }
  };

  const getDefaultPageData = (slug: string): PageData => {
    const pageDefaults: Record<string, Partial<PageData>> = {
      'ana-sayfa': {
        title: 'Ana Sayfa',
        hero_title: 'Sağlığınız Bizim Önceliğimiz',
        hero_subtitle: 'Modern tıbbi teknolojiler ve uzman kadromuzla yanınızdayız',
        hero_image: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=1200',
        meta_title: 'Anadolu Hastaneleri Grubu - Sağlığınız Bizim Önceliğimiz',
        meta_description: 'Modern tıbbi teknolojiler ve uzman kadrosuyla hizmet veren öncü sağlık kuruluşu.',
        page_type: 'landing',
        template: 'homepage'
      },
      'hastanelerimiz': {
        title: 'Hastanelerimiz',
        hero_title: 'Hastanelerimiz',
        hero_subtitle: 'Modern teknoloji ve uzman kadromuzla hizmet veriyoruz',
        meta_title: 'Hastanelerimiz - Anadolu Hastaneleri',
        meta_description: 'Anadolu Hastaneleri Grubu hastaneleri ve hizmetleri.',
        page_type: 'dynamic',
        template: 'hospitals'
      },
      'bolumlerimiz': {
        title: 'Bölümlerimiz',
        hero_title: 'Tıbbi Bölümlerimiz',
        hero_subtitle: 'Uzman doktorlarımız ve modern teknolojimizle yanınızdayız',
        meta_title: 'Bölümlerimiz - Anadolu Hastaneleri',
        meta_description: 'Anadolu Hastaneleri tıbbi bölümleri ve uzman doktorları.',
        page_type: 'dynamic',
        template: 'departments'
      },
      'doktorlar': {
        title: 'Doktorlarımız',
        hero_title: 'Uzman Doktorlarımız',
        hero_subtitle: 'Alanında uzman, deneyimli doktorlarımızla hizmetinizdeyiz',
        meta_title: 'Doktorlarımız - Anadolu Hastaneleri',
        meta_description: 'Anadolu Hastaneleri uzman doktorları ve branşları.',
        page_type: 'dynamic',
        template: 'doctors'
      },
      'saglik-rehberi': {
        title: 'Sağlık Rehberi',
        hero_title: 'Sağlık Rehberi',
        hero_subtitle: 'Sağlığınız için faydalı bilgiler ve uzman tavsiyeleri',
        meta_title: 'Sağlık Rehberi - Anadolu Hastaneleri',
        meta_description: 'Sağlık konularında faydalı makaleler ve uzman tavsiyeleri.',
        page_type: 'dynamic',
        template: 'health-guide'
      },
      'saglik-turizmi': {
        title: 'Sağlık Turizmi',
        hero_title: 'Sağlık Turizmi',
        hero_subtitle: 'Uluslararası hastalara özel hizmetler',
        meta_title: 'Sağlık Turizmi - Anadolu Hastaneleri',
        meta_description: 'Anadolu Hastaneleri sağlık turizmi hizmetleri.',
        page_type: 'static',
        template: 'health-tourism'
      },
      'iletisim': {
        title: 'İletişim',
        hero_title: 'İletişim',
        hero_subtitle: 'Bizimle iletişime geçin',
        meta_title: 'İletişim - Anadolu Hastaneleri',
        meta_description: 'Anadolu Hastaneleri ile iletişim bilgileri.',
        page_type: 'static',
        template: 'contact'
      },
      'hakkimizda': {
        title: 'Hakkımızda',
        hero_title: 'Hakkımızda',
        hero_subtitle: '25 yılı aşkın deneyimimizle sağlık sektöründe öncüyüz',
        meta_title: 'Hakkımızda - Anadolu Hastaneleri',
        meta_description: 'Anadolu Hastaneleri Grubu hakkında detaylı bilgi.',
        page_type: 'static',
        template: 'about'
      }
    };

    const defaults = pageDefaults[slug] || {
      title: 'Sayfa',
      hero_title: 'Sayfa Başlığı',
      hero_subtitle: 'Sayfa açıklaması',
      meta_title: 'Anadolu Hastaneleri',
      meta_description: 'Anadolu Hastaneleri Grubu',
      page_type: 'static' as const,
      template: 'default'
    };

    return {
      id: 0,
      slug,
      content: '',
      is_published: true,
      ...defaults
    } as PageData;
  };

  const getDefaultPageContent = (slug: string): PageContent => {
    const defaultSections: PageSection[] = [
      {
        id: 'hero-1',
        type: 'hero',
        title: getDefaultPageData(slug).hero_title,
        subtitle: getDefaultPageData(slug).hero_subtitle,
        image: getDefaultPageData(slug).hero_image,
        order: 1
      }
    ];

    // Add specific sections based on page type
    switch (slug) {
      case 'ana-sayfa':
        defaultSections.push(
          {
            id: 'features-1',
            type: 'features',
            title: 'Neden Bizi Seçmelisiniz?',
            content: JSON.stringify([
              { title: 'Uzman Kadro', description: 'Alanında uzman doktorlarımız', icon: '👨‍⚕️' },
              { title: 'Modern Teknoloji', description: 'En son tıbbi teknolojiler', icon: '🏥' },
              { title: '7/24 Hizmet', description: 'Kesintisiz sağlık hizmeti', icon: '🕐' }
            ]),
            order: 2
          },
          {
            id: 'cta-1',
            type: 'cta',
            title: 'Randevu Almak İster Misiniz?',
            subtitle: 'Uzman doktorlarımızdan randevu alın',
            button_text: 'Online Randevu',
            button_link: 'https://anadoluhastaneleri.kendineiyibak.app/',
            order: 3
          }
        );
        break;
      
      case 'hakkimizda':
        defaultSections.push(
          {
            id: 'text-1',
            type: 'text',
            title: 'Misyonumuz',
            content: 'Hastalarımıza en kaliteli sağlık hizmetini sunmak, modern tıbbi teknolojiler ve uzman kadromuzla toplum sağlığına katkıda bulunmak.',
            order: 2
          },
          {
            id: 'text-2',
            type: 'text',
            title: 'Vizyonumuz',
            content: '2030 yılına kadar Türkiye\'nin önde gelen sağlık kuruluşlarından biri olmak ve uluslararası standartlarda hizmet vermek.',
            order: 3
          }
        );
        break;
      
      default:
        defaultSections.push({
          id: 'text-1',
          type: 'text',
          title: 'İçerik',
          content: 'Bu sayfa için içerik admin panelinden düzenlenebilir.',
          order: 2
        });
    }

    return {
      page_slug: slug,
      sections: defaultSections
    };
  };

  return {
    ...state,
    refetch: fetchPageData
  };
};
