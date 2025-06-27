import { useState, useEffect } from 'react';
import { supabaseNew as supabase } from '../lib/supabase-new';

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
  console.log('🪝 usePage hook called for slug:', slug);
  const [pageData, setPageData] = useState<PageData | null>(null);
  const [pageContent, setPageContent] = useState<PageContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('🔄 usePage useEffect triggered for slug:', slug);
    fetchPageData();
  }, [slug]);

  const fetchPageData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch page basic data
      const { data: page, error: pageError } = await supabase
        .from('pages')
        .select('*')
        .eq('slug', slug)
        .eq('is_published', true)
        .single();

      if (pageError && pageError.code !== 'PGRST116') {
        throw pageError;
      }

      // If page doesn't exist, create default page data
      if (!page) {
        const defaultPage = getDefaultPageData(slug);
        setPageData(defaultPage);
      } else {
        setPageData(page);
      }

      // Fetch page content sections
      const { data: content, error: contentError } = await supabase
        .from('page_contents')
        .select('*')
        .eq('page_slug', slug)
        .single();

      if (contentError && contentError.code !== 'PGRST116') {
        console.warn('Content fetch error:', contentError);
      }

      if (content) {
        setPageContent(content);
      } else {
        // Create default content
        const defaultContent = getDefaultPageContent(slug);
        setPageContent(defaultContent);
      }

    } catch (err: any) {
      console.error('Error fetching page:', err);
      setError(err.message);
      
      // Set default data on error
      const defaultPage = getDefaultPageData(slug);
      const defaultContent = getDefaultPageContent(slug);
      setPageData(defaultPage);
      setPageContent(defaultContent);
    } finally {
      setLoading(false);
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
    pageData,
    pageContent,
    loading,
    error,
    refetch: fetchPageData
  };
};
