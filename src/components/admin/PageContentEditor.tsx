import { useState, useEffect } from 'react';
import {
  FaSave, FaEye, FaCode, FaImage, FaPlus, FaTrash,
  FaArrowUp, FaArrowDown, FaExclamationTriangle,
  FaHeading, FaParagraph, FaBullhorn, FaThLarge, FaQuoteRight,
  FaAddressBook, FaChartBar, FaImages
} from 'react-icons/fa';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';

interface ContentSection {
  id: string;
  type: 'hero' | 'text' | 'image' | 'gallery' | 'cta' | 'features' | 'testimonials' | 'contact' | 'hospital_stats' | 'custom';
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
  id?: number;
  page_slug: string;
  sections: ContentSection[];
  updated_at?: string;
}

interface Props {
  pageSlug: string;
  onSave?: () => void;
}

const SECTION_TYPES = [
  { type: 'hero', icon: <FaHeading />, label: 'Hero', description: 'Giriş bölümü, büyük başlık ve görsel' },
  { type: 'text', icon: <FaParagraph />, label: 'Metin', description: 'Zengin metin ve açıklamalar' },
  { type: 'image', icon: <FaImage />, label: 'Resim', description: 'Tekli görsel ve açıklama' },
  { type: 'gallery', icon: <FaImages />, label: 'Galeri', description: 'Çoklu görsel ızgarası' },
  { type: 'cta', icon: <FaBullhorn />, label: 'Eylem (CTA)', description: 'Vurgulu buton ve çağrı alanı' },
  { type: 'features', icon: <FaThLarge />, label: 'Özellikler', description: 'İkonlu madde ve özellik listesi' },
  { type: 'hospital_stats', icon: <FaChartBar />, label: 'İstatistikler', description: 'Sayısal veriler ve başarılar' },
  { type: 'testimonials', icon: <FaQuoteRight />, label: 'Referanslar', description: 'Hasta ve danışan yorumları' },
  { type: 'contact', icon: <FaAddressBook />, label: 'İletişim', description: 'Harita ve iletişim form alanı' }
];

const PageContentEditor = ({ pageSlug, onSave }: Props) => {
  const [content, setContent] = useState<PageContent>({
    page_slug: pageSlug,
    sections: []
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);

  useEffect(() => {
    fetchPageContent();
  }, [pageSlug]);

  const fetchPageContent = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('page_contents')
        .select('*')
        .eq('page_slug', pageSlug)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setContent(data);
        if (data.sections.length > 0) setActiveSectionId(data.sections[0].id);
      } else {
        const defaultSections = getDefaultSections();
        setContent({ page_slug: pageSlug, sections: defaultSections });
        if (defaultSections.length > 0) setActiveSectionId(defaultSections[0].id);
      }
    } catch (error) {
      console.error('Error fetching content:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDefaultSections = (): ContentSection[] => {
    return [
      {
        id: `hero-${Date.now()}`,
        type: 'hero',
        title: 'Sayfa Başlığı',
        subtitle: 'Sayfa alt başlığı ve kısa açıklama',
        image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1200&q=80',
        order: 1
      }
    ];
  };

  const addSection = (type: ContentSection['type']) => {
    const newSection: ContentSection = {
      id: `${type}-${Date.now()}`,
      type,
      title: type === 'features' ? 'Neden Bizi Seçmelisiniz?' : '',
      content: type === 'features' ? JSON.stringify([
        { title: 'Uzman Kadro', description: 'Deneyimli doktorlar', icon: '👨‍⚕️' },
        { title: 'Modern Teknoloji', description: 'En son teknolojiler', icon: '🏥' }
      ]) : '',
      order: content.sections.length + 1
    };

    setContent(prev => ({
      ...prev,
      sections: [...prev.sections, newSection]
    }));
    setActiveSectionId(newSection.id);
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
    setContent(prev => {
      const newSections = prev.sections.filter(section => section.id !== sectionId);
      if (activeSectionId === sectionId) setActiveSectionId(newSections[0]?.id || null);
      return { ...prev, sections: newSections };
    });
  };

  const moveSection = (sectionId: string, direction: 'up' | 'down') => {
    const sections = [...content.sections].sort((a, b) => a.order - b.order);
    const index = sections.findIndex(s => s.id === sectionId);

    if (direction === 'up' && index > 0) {
      [sections[index], sections[index - 1]] = [sections[index - 1], sections[index]];
    } else if (direction === 'down' && index < sections.length - 1) {
      [sections[index], sections[index + 1]] = [sections[index + 1], sections[index]];
    }

    sections.forEach((s, i) => s.order = i + 1);
    setContent(prev => ({ ...prev, sections }));
  };

  const saveContent = async () => {
    try {
      setSaving(true);
      const contentData = { ...content, updated_at: new Date().toISOString() };

      const { data, error } = content.id
        ? await supabase.from('page_contents').update(contentData).eq('id', content.id).select().single()
        : await supabase.from('page_contents').insert([contentData]).select().single();

      if (error) throw error;
      setContent(data);
      alert('Değişiklikler başarıyla kaydedildi!');
      onSave?.();
    } catch (error) {
      console.error('Error saving:', error);
      alert('Kaydedilirken bir hata oluştu.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-20">
      <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
      <p className="text-gray-500 font-medium">İçerik yükleniyor...</p>
    </div>
  );

  return (
    <div className="bg-gray-50 flex flex-col h-[calc(90vh-120px)] overflow-hidden rounded-xl shadow-2xl">
      {/* Action Header */}
      <div className="bg-white border-b px-6 py-4 flex justify-between items-center z-10">
        <div className="flex items-center gap-4">
          <div className="bg-primary/10 p-2 rounded-lg text-primary">
            <FaCode size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900 leading-tight">Dinamik Sayfa Editörü</h2>
            <p className="text-sm text-gray-500">Slug: <span className="font-mono bg-gray-100 px-1 rounded">{pageSlug}</span></p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setPreviewMode(!previewMode)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${previewMode ? 'bg-primary text-white' : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              }`}
          >
            <FaEye /> {previewMode ? 'Düzenleme Modu' : 'Canlı Önizleme'}
          </button>

          <button
            onClick={saveContent}
            disabled={saving}
            className="flex items-center gap-2 bg-accent text-white px-6 py-2 rounded-lg font-bold hover:shadow-lg active:scale-95 transition-all disabled:opacity-50"
          >
            <FaSave /> {saving ? 'Kaydediliyor...' : 'Yayınla'}
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar: Section List */}
        {!previewMode && (
          <div className="w-80 bg-white border-r flex flex-col">
            <div className="p-4 bg-gray-50 border-b">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">BÖLÜMLER</h3>
              <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                {content.sections.sort((a, b) => a.order - b.order).map((section, idx) => (
                  <div
                    key={section.id}
                    onClick={() => setActiveSectionId(section.id)}
                    className={`group p-3 rounded-lg border cursor-pointer transition-all ${activeSectionId === section.id
                      ? 'bg-primary/5 border-primary shadow-sm'
                      : 'bg-white border-gray-100 hover:border-gray-300'
                      }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold text-gray-400">#0{idx + 1}</span>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={(e) => { e.stopPropagation(); moveSection(section.id, 'up'); }} className="p-1 hover:bg-gray-200 rounded text-gray-500"><FaArrowUp size={10} /></button>
                        <button onClick={(e) => { e.stopPropagation(); moveSection(section.id, 'down'); }} className="p-1 hover:bg-gray-200 rounded text-gray-500"><FaArrowDown size={10} /></button>
                        <button onClick={(e) => { e.stopPropagation(); deleteSection(section.id); }} className="p-1 hover:bg-red-100 rounded text-red-400"><FaTrash size={10} /></button>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-primary">{SECTION_TYPES.find(t => t.type === section.type)?.icon}</span>
                      <span className={`text-sm font-bold ${activeSectionId === section.id ? 'text-primary' : 'text-gray-700'} `}>
                        {section.title || (section.type.charAt(0).toUpperCase() + section.type.slice(1))}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 flex-1 overflow-y-auto">
              <h1 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">YENİ BÖLÜM EKLE</h1>
              <div className="grid grid-cols-1 gap-2">
                {SECTION_TYPES.map(st => (
                  <button
                    key={st.type}
                    onClick={() => addSection(st.type as any)}
                    className="flex flex-col text-left p-3 border border-gray-100 rounded-xl hover:border-primary/30 hover:bg-primary/5 transition-all group"
                  >
                    <div className="flex items-center gap-3 mb-1">
                      <div className="text-gray-400 group-hover:text-primary transition-colors">{st.icon}</div>
                      <span className="text-sm font-bold text-gray-700">{st.label}</span>
                    </div>
                    <span className="text-[11px] text-gray-400 line-clamp-1">{st.description}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto bg-gray-100 p-8 custom-scrollbar">
          {previewMode ? (
            <div className="max-w-4xl mx-auto space-y-8 pb-20">
              <div className="bg-yellow-50 border-2 border-yellow-200 p-4 rounded-xl mb-8 flex items-center gap-3 text-yellow-700">
                <FaExclamationTriangle size={24} />
                <p className="text-sm font-medium">Bu bölümde görülenler, kaydedildikten sonra web sitesinde nasıl görüneceğinin bir simülasyonudur.</p>
              </div>
              {content.sections.sort((a, b) => a.order - b.order).map((section) => (
                <div key={section.id} className="bg-white rounded-2xl shadow-sm border overflow-hidden">
                  <div className="bg-gray-50 px-4 py-2 border-b flex justify-between items-center text-[10px] font-bold text-gray-400">
                    <span>{section.type.toUpperCase()} BÖLÜMÜ</span>
                    <span>SIRALAMA: {section.order}</span>
                  </div>
                  {/* Mock preview components based on type */}
                  <div className="p-8">
                    {section.type === 'hero' && (
                      <div className="text-center">
                        <h1 className="text-4xl font-extrabold text-primary mb-4">{section.title}</h1>
                        <p className="text-xl text-gray-600 mb-6">{section.subtitle}</p>
                        {section.image && <img src={section.image} alt="hero" className="rounded-xl shadow-lg w-full max-h-[300px] object-cover" />}
                      </div>
                    )}
                    {section.type === 'text' && (
                      <div className="prose max-w-none">
                        <h2 className="text-2xl font-bold mb-4">{section.title}</h2>
                        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{section.content}</p>
                      </div>
                    )}
                    {(section.type === 'cta' || section.type === 'features') && (
                      <div className="text-center rounded-2xl bg-primary/5 p-10">
                        <h2 className="text-2xl font-bold text-primary mb-4">{section.title}</h2>
                        <p className="text-gray-600 mb-8">{section.subtitle || section.content}</p>
                        {section.button_text && (
                          <button className="bg-accent text-white px-8 py-3 rounded-full font-bold shadow-lg">
                            {section.button_text}
                          </button>
                        )}
                      </div>
                    )}
                    {/* Fallback for others */}
                    {!['hero', 'text', 'cta', 'features'].includes(section.type) && (
                      <div className="text-center py-10 text-gray-400 italic">
                        {section.type} tipi için görsel önizleme geliştirme aşamasındadır.
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : activeSectionId ? (
            <div className="max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-xl border border-white/20 p-8"
              >
                {content.sections.find(s => s.id === activeSectionId) && (() => {
                  const section = content.sections.find(s => s.id === activeSectionId)!;
                  return (
                    <div className="space-y-6">
                      <div className="flex items-center gap-3 mb-8 border-b pb-4">
                        <div className="bg-primary text-white p-3 rounded-xl shadow-lg shadow-primary/20">
                          {SECTION_TYPES.find(t => t.type === section.type)?.icon}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">Bölüm Detayları</h3>
                          <p className="text-sm text-gray-500">{SECTION_TYPES.find(t => t.type === section.type)?.label} tipi düzenleniyor</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-6">
                        <div>
                          <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">BAŞLIK</label>
                          <input
                            type="text"
                            value={section.title || ''}
                            onChange={(e) => updateSection(section.id, { title: e.target.value })}
                            className="w-full bg-gray-50 border-gray-100 rounded-xl px-4 py-3 text-gray-700 font-medium focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all outline-none"
                            placeholder="Bölüm ana başlığı..."
                          />
                        </div>

                        {(section.type === 'hero' || section.type === 'cta') && (
                          <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">ALT BAŞLIK</label>
                            <input
                              type="text"
                              value={section.subtitle || ''}
                              onChange={(e) => updateSection(section.id, { subtitle: e.target.value })}
                              className="w-full bg-gray-50 border-gray-100 rounded-xl px-4 py-3 text-gray-700 font-medium focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all outline-none"
                              placeholder="Vurgulayıcı alt başlık..."
                            />
                          </div>
                        )}

                        {(section.type === 'hero' || section.type === 'image') && (
                          <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">GÖRSEL URL</label>
                            <div className="relative">
                              <FaImage className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                              <input
                                type="text"
                                value={section.image || ''}
                                onChange={(e) => updateSection(section.id, { image: e.target.value })}
                                className="w-full bg-gray-50 border-gray-100 rounded-xl pl-12 pr-4 py-3 text-gray-700 font-medium focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all outline-none"
                                placeholder="Görsel linki (Unsplash vb.)..."
                              />
                            </div>
                          </div>
                        )}

                        {(section.type === 'text' || section.type === 'image') && (
                          <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">İÇERİK / AÇIKLAMA</label>
                            <textarea
                              value={section.content || ''}
                              onChange={(e) => updateSection(section.id, { content: e.target.value })}
                              rows={6}
                              className="w-full bg-gray-50 border-gray-100 rounded-xl px-4 py-3 text-gray-700 font-medium focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all outline-none resize-none"
                              placeholder="Zengin içerik buraya gelir..."
                            />
                          </div>
                        )}

                        {section.type === 'cta' && (
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">BUTON METNİ</label>
                              <input
                                type="text"
                                value={section.button_text || ''}
                                onChange={(e) => updateSection(section.id, { button_text: e.target.value })}
                                className="w-full bg-gray-50 border-gray-100 rounded-xl px-4 py-3 text-gray-700 font-medium focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all outline-none"
                                placeholder="Örn: Randevu Al"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">BUTON LİNKİ</label>
                              <input
                                type="text"
                                value={section.button_link || ''}
                                onChange={(e) => updateSection(section.id, { button_link: e.target.value })}
                                className="w-full bg-gray-50 border-gray-100 rounded-xl px-4 py-3 text-gray-700 font-medium focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all outline-none"
                                placeholder="/iletisim veya https://..."
                              />
                            </div>
                          </div>
                        )}

                        {section.type === 'gallery' && (
                          <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">RESİMLER (JSON URL LİSTESİ)</label>
                            <textarea
                              value={section.images ? JSON.stringify(section.images, null, 2) : '[]'}
                              onChange={(e) => {
                                try {
                                  const parsed = JSON.parse(e.target.value);
                                  updateSection(section.id, { images: parsed });
                                } catch (err) {
                                  // Invalid JSON while typing
                                }
                              }}
                              className="w-full bg-gray-50 border-gray-100 rounded-xl px-4 py-3 text-xs font-mono text-gray-700 focus:bg-white focus:ring-4 focus:ring-primary/5 outline-none h-32"
                              placeholder='["url1", "url2"]'
                            />
                            <p className="text-[10px] text-gray-400 mt-2">İpucu: Görsel URL'lerini içeren bir JSON dizisi girin.</p>
                          </div>
                        )}

                        {(section.type === 'hospital_stats' || section.type === 'testimonials' || section.type === 'features') && (
                          <div className="bg-primary/5 p-6 rounded-2xl border border-primary/20">
                            <div className="flex items-center gap-2 mb-4">
                              <FaCode className="text-primary" />
                              <span className="text-sm font-bold text-primary italic">Detaylı Yapılandırma (JSON)</span>
                            </div>
                            <textarea
                              value={section.content || ''}
                              onChange={(e) => updateSection(section.id, { content: e.target.value })}
                              className="w-full bg-white border-gray-200 rounded-xl p-4 text-xs font-mono focus:ring-4 focus:ring-primary/10 outline-none h-48"
                              placeholder={
                                section.type === 'hospital_stats'
                                  ? '[{"label": "Hasta", "value": "100k"}, ...]'
                                  : section.type === 'testimonials'
                                    ? '[{"author": "İsim", "content": "Yorum", "role": "Hasta"}, ...]'
                                    : '[{"title": "Başlık", "description": "Açıklama", "icon": "İkon"}, ...]'
                              }
                            />
                            <div className="mt-4 p-3 bg-white/50 rounded-lg">
                              <p className="text-[10px] text-gray-400 uppercase font-bold mb-2">Örnek Şablon:</p>
                              <pre className="text-[10px] text-primary/60 font-mono overflow-x-auto">
                                {section.type === 'hospital_stats'
                                  ? '[{"label": "Hasta", "value": "10k"}]'
                                  : section.type === 'testimonials'
                                    ? '[{"author": "Ahmet Y.", "content": "Harika hizmet", "role": "Hasta"}]'
                                    : '[{"title": "Kalite", "description": "En iyi hizmet", "icon": "💎"}]'}
                              </pre>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </motion.div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-20 text-center">
              <div className="bg-white p-10 rounded-3xl shadow-xl border border-gray-100">
                <FaPlus className="text-4xl text-primary/20 mx-auto mb-6" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">Başlamak İçin Bölüm Ekleyin</h3>
                <p className="text-gray-500 max-w-xs mx-auto mb-8">Sol taraftaki listeden bir bölüm tipi seçerek sayfanızı oluşturmaya hemen başlayabilirsiniz.</p>
                <div className="flex gap-2 justify-center">
                  <button onClick={() => addSection('hero')} className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-lg">Hero Ekle</button>
                  <button onClick={() => addSection('text')} className="px-4 py-2 bg-gray-100 text-gray-700 text-xs font-bold rounded-lg">Metin Ekle</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PageContentEditor;
