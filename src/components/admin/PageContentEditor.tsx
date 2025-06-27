import { useState, useEffect } from 'react';
import { FaSave, FaEye, FaCode, FaImage, FaPlus, FaTrash, FaArrowUp, FaArrowDown } from 'react-icons/fa';
import { supabaseNew as supabase } from '../../lib/supabase-new';

interface PageContent {
  id?: number;
  page_slug: string;
  sections: ContentSection[];
  updated_at?: string;
}

interface ContentSection {
  id: string;
  type: 'hero' | 'text' | 'image' | 'gallery' | 'cta' | 'features' | 'contact' | 'custom';
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

interface Props {
  pageSlug: string;
  onSave?: () => void;
}

const PageContentEditor = ({ pageSlug, onSave }: Props) => {
  const [content, setContent] = useState<PageContent>({
    page_slug: pageSlug,
    sections: []
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    fetchPageContent();
  }, [pageSlug]);

  const fetchPageContent = async () => {
    try {
      setLoading(true);
      
      // Try to fetch existing content
      const { data, error } = await supabase
        .from('page_contents')
        .select('*')
        .eq('page_slug', pageSlug)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setContent(data);
      } else {
        // Create default sections based on page type
        const defaultSections = getDefaultSections(pageSlug);
        setContent({
          page_slug: pageSlug,
          sections: defaultSections
        });
      }
    } catch (error) {
      console.error('Error fetching page content:', error);
      // Set default sections on error
      const defaultSections = getDefaultSections(pageSlug);
      setContent({
        page_slug: pageSlug,
        sections: defaultSections
      });
    } finally {
      setLoading(false);
    }
  };

  const getDefaultSections = (slug: string): ContentSection[] => {
    const commonSections: ContentSection[] = [
      {
        id: 'hero-1',
        type: 'hero',
        title: getPageTitle(slug),
        subtitle: getPageSubtitle(slug),
        image: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=1200',
        order: 1
      }
    ];

    switch (slug) {
      case 'ana-sayfa':
        return [
          ...commonSections,
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
        ];
      
      case 'hakkimizda':
        return [
          ...commonSections,
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
        ];
      
      default:
        return [
          ...commonSections,
          {
            id: 'text-1',
            type: 'text',
            title: 'İçerik',
            content: 'Bu sayfa için içerik ekleyin.',
            order: 2
          }
        ];
    }
  };

  const getPageTitle = (slug: string): string => {
    const titles: Record<string, string> = {
      'ana-sayfa': 'Sağlığınız Bizim Önceliğimiz',
      'hastanelerimiz': 'Hastanelerimiz',
      'bolumlerimiz': 'Tıbbi Bölümlerimiz',
      'doktorlar': 'Uzman Doktorlarımız',
      'saglik-rehberi': 'Sağlık Rehberi',
      'saglik-turizmi': 'Sağlık Turizmi',
      'iletisim': 'İletişim',
      'hakkimizda': 'Hakkımızda'
    };
    return titles[slug] || 'Sayfa Başlığı';
  };

  const getPageSubtitle = (slug: string): string => {
    const subtitles: Record<string, string> = {
      'ana-sayfa': 'Modern tıbbi teknolojiler ve uzman kadromuzla yanınızdayız',
      'hastanelerimiz': 'Modern teknoloji ve uzman kadromuzla hizmet veriyoruz',
      'bolumlerimiz': 'Uzman doktorlarımız ve modern teknolojimizle yanınızdayız',
      'doktorlar': 'Alanında uzman, deneyimli doktorlarımızla hizmetinizdeyiz',
      'saglik-rehberi': 'Sağlığınız için faydalı bilgiler ve uzman tavsiyeleri',
      'saglik-turizmi': 'Uluslararası hastalara özel hizmetler',
      'iletisim': 'Bizimle iletişime geçin',
      'hakkimizda': '25 yılı aşkın deneyimimizle sağlık sektöründe öncüyüz'
    };
    return subtitles[slug] || 'Sayfa alt başlığı';
  };

  const addSection = (type: ContentSection['type']) => {
    const newSection: ContentSection = {
      id: `${type}-${Date.now()}`,
      type,
      title: '',
      content: '',
      order: content.sections.length + 1
    };

    setContent(prev => ({
      ...prev,
      sections: [...prev.sections, newSection]
    }));
  };

  const updateSection = (sectionId: string, updates: Partial<ContentSection>) => {
    setContent(prev => ({
      ...prev,
      sections: prev.sections.map(section =>
        section.id === sectionId ? { ...section, ...updates } : section
      )
    }));
  };

  const deleteSection = (sectionId: string) => {
    if (!confirm('Bu bölümü silmek istediğinizden emin misiniz?')) return;
    
    setContent(prev => ({
      ...prev,
      sections: prev.sections.filter(section => section.id !== sectionId)
    }));
  };

  const moveSection = (sectionId: string, direction: 'up' | 'down') => {
    const sections = [...content.sections];
    const index = sections.findIndex(s => s.id === sectionId);
    
    if (direction === 'up' && index > 0) {
      [sections[index], sections[index - 1]] = [sections[index - 1], sections[index]];
    } else if (direction === 'down' && index < sections.length - 1) {
      [sections[index], sections[index + 1]] = [sections[index + 1], sections[index]];
    }

    // Update order
    sections.forEach((section, i) => {
      section.order = i + 1;
    });

    setContent(prev => ({ ...prev, sections }));
  };

  const saveContent = async () => {
    try {
      setSaving(true);
      
      const contentData = {
        ...content,
        updated_at: new Date().toISOString()
      };

      if (content.id) {
        // Update existing
        const { error } = await supabase
          .from('page_contents')
          .update(contentData)
          .eq('id', content.id);

        if (error) throw error;
      } else {
        // Insert new
        const { data, error } = await supabase
          .from('page_contents')
          .insert([contentData])
          .select()
          .single();

        if (error) throw error;
        setContent(data);
      }

      alert('Sayfa içeriği kaydedildi!');
      onSave?.();
    } catch (error) {
      console.error('Error saving content:', error);
      alert('İçerik kaydedilirken hata oluştu!');
    } finally {
      setSaving(false);
    }
  };

  const renderSectionEditor = (section: ContentSection) => {
    switch (section.type) {
      case 'hero':
        return (
          <div className="space-y-3">
            <input
              type="text"
              value={section.title || ''}
              onChange={(e) => updateSection(section.id, { title: e.target.value })}
              placeholder="Hero Başlık"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <input
              type="text"
              value={section.subtitle || ''}
              onChange={(e) => updateSection(section.id, { subtitle: e.target.value })}
              placeholder="Hero Alt Başlık"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <input
              type="url"
              value={section.image || ''}
              onChange={(e) => updateSection(section.id, { image: e.target.value })}
              placeholder="Arka Plan Resim URL"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        );
      
      case 'text':
        return (
          <div className="space-y-3">
            <input
              type="text"
              value={section.title || ''}
              onChange={(e) => updateSection(section.id, { title: e.target.value })}
              placeholder="Başlık"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <textarea
              value={section.content || ''}
              onChange={(e) => updateSection(section.id, { content: e.target.value })}
              placeholder="İçerik"
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        );
      
      case 'image':
        return (
          <div className="space-y-3">
            <input
              type="text"
              value={section.title || ''}
              onChange={(e) => updateSection(section.id, { title: e.target.value })}
              placeholder="Resim Başlığı"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <input
              type="url"
              value={section.image || ''}
              onChange={(e) => updateSection(section.id, { image: e.target.value })}
              placeholder="Resim URL"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <textarea
              value={section.content || ''}
              onChange={(e) => updateSection(section.id, { content: e.target.value })}
              placeholder="Resim Açıklaması"
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        );
      
      case 'cta':
        return (
          <div className="space-y-3">
            <input
              type="text"
              value={section.title || ''}
              onChange={(e) => updateSection(section.id, { title: e.target.value })}
              placeholder="CTA Başlık"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <input
              type="text"
              value={section.subtitle || ''}
              onChange={(e) => updateSection(section.id, { subtitle: e.target.value })}
              placeholder="CTA Alt Başlık"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                value={section.button_text || ''}
                onChange={(e) => updateSection(section.id, { button_text: e.target.value })}
                placeholder="Buton Metni"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <input
                type="url"
                value={section.button_link || ''}
                onChange={(e) => updateSection(section.id, { button_link: e.target.value })}
                placeholder="Buton Linki"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        );
      
      default:
        return (
          <div className="space-y-3">
            <input
              type="text"
              value={section.title || ''}
              onChange={(e) => updateSection(section.id, { title: e.target.value })}
              placeholder="Başlık"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <textarea
              value={section.content || ''}
              onChange={(e) => updateSection(section.id, { content: e.target.value })}
              placeholder="İçerik"
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-primary">
          {pageSlug} - İçerik Editörü
        </h2>
        <div className="flex space-x-3">
          <button
            onClick={() => setPreviewMode(!previewMode)}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center"
          >
            <FaEye className="mr-2" />
            {previewMode ? 'Düzenle' : 'Önizle'}
          </button>
          <button
            onClick={saveContent}
            disabled={saving}
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors flex items-center disabled:opacity-50"
          >
            <FaSave className="mr-2" />
            {saving ? 'Kaydediliyor...' : 'Kaydet'}
          </button>
        </div>
      </div>

      {!previewMode && (
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-3">Yeni Bölüm Ekle</h3>
          <div className="flex flex-wrap gap-2">
            {['hero', 'text', 'image', 'cta', 'features', 'contact'].map(type => (
              <button
                key={type}
                onClick={() => addSection(type as ContentSection['type'])}
                className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
              >
                <FaPlus className="mr-1 inline" />
                {type === 'hero' ? 'Hero' : 
                 type === 'text' ? 'Metin' :
                 type === 'image' ? 'Resim' :
                 type === 'cta' ? 'CTA' :
                 type === 'features' ? 'Özellikler' : 'İletişim'}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-6">
        {content.sections
          .sort((a, b) => a.order - b.order)
          .map((section) => (
            <div key={section.id} className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-medium text-gray-900">
                  {section.type === 'hero' ? 'Hero Bölümü' :
                   section.type === 'text' ? 'Metin Bölümü' :
                   section.type === 'image' ? 'Resim Bölümü' :
                   section.type === 'cta' ? 'CTA Bölümü' :
                   section.type === 'features' ? 'Özellikler' : 'İletişim'}
                </h4>
                
                {!previewMode && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => moveSection(section.id, 'up')}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <FaArrowUp />
                    </button>
                    <button
                      onClick={() => moveSection(section.id, 'down')}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <FaArrowDown />
                    </button>
                    <button
                      onClick={() => deleteSection(section.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <FaTrash />
                    </button>
                  </div>
                )}
              </div>

              {previewMode ? (
                <div className="border rounded-lg p-4 bg-gray-50">
                  {section.type === 'hero' && (
                    <div className="text-center">
                      <h1 className="text-3xl font-bold text-primary mb-2">{section.title}</h1>
                      <p className="text-gray-600">{section.subtitle}</p>
                      {section.image && (
                        <img src={section.image} alt="" className="w-full h-48 object-cover rounded mt-4" />
                      )}
                    </div>
                  )}
                  {section.type === 'text' && (
                    <div>
                      <h2 className="text-2xl font-semibold text-primary mb-3">{section.title}</h2>
                      <p className="text-gray-600 whitespace-pre-wrap">{section.content}</p>
                    </div>
                  )}
                  {section.type === 'cta' && (
                    <div className="text-center bg-primary/10 p-6 rounded">
                      <h2 className="text-2xl font-semibold text-primary mb-2">{section.title}</h2>
                      <p className="text-gray-600 mb-4">{section.subtitle}</p>
                      <button className="bg-primary text-white px-6 py-3 rounded-lg">
                        {section.button_text}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                renderSectionEditor(section)
              )}
            </div>
          ))}
      </div>

      {content.sections.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <FaCode className="text-4xl text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Henüz içerik yok</h3>
          <p className="text-gray-500 mb-4">Bu sayfa için içerik bölümleri ekleyin</p>
        </div>
      )}
    </div>
  );
};

export default PageContentEditor;
