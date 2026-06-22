import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FaSave, FaEye, FaCode, FaPlus, FaTrash, FaArrowUp, FaArrowDown, FaGripVertical } from 'react-icons/fa';

interface PageSection {
  id: string;
  type: 'hero' | 'text' | 'image' | 'gallery' | 'cta' | 'features' | 'testimonials' | 'contact' | 'cards' | 'stats';
  title?: string;
  subtitle?: string;
  content?: string;
  image?: string;
  images?: string[];
  button_text?: string;
  button_url?: string;
  settings?: Record<string, any>;
  order: number;
  is_active: boolean;
}

interface PageContentEditorProps {
  pageSlug: string;
  onSave?: () => void;
}

const PageContentEditor = ({ pageSlug, onSave }: PageContentEditorProps) => {
  const { t } = useTranslation();
  const [sections, setSections] = useState<PageSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [selectedSection, setSelectedSection] = useState<PageSection | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<PageSection>({
    id: '',
    type: 'text',
    title: '',
    subtitle: '',
    content: '',
    image: '',
    images: [],
    button_text: '',
    button_url: '',
    order: 1,
    is_active: true,
    settings: {}
  });

  const sectionTypes = [
    { value: 'hero', label: t('admin.pageEditor.sectionHero', 'Hero'), icon: '🏠' },
    { value: 'text', label: t('admin.pageEditor.sectionText', 'Metin'), icon: '📝' },
    { value: 'image', label: t('admin.pageEditor.sectionImage', 'Resim'), icon: '🖼️' },
    { value: 'gallery', label: t('admin.pageEditor.sectionGallery', 'Galeri'), icon: '📸' },
    { value: 'cta', label: t('admin.pageEditor.sectionCta', 'Çağrı Butonu'), icon: '🔔' },
    { value: 'features', label: t('admin.pageEditor.sectionFeatures', 'Özellikler'), icon: '✨' },
    { value: 'testimonials', label: t('admin.pageEditor.sectionTestimonials', 'Yorumlar'), icon: '💬' },
    { value: 'contact', label: t('admin.pageEditor.sectionContact', 'İletişim'), icon: '📞' },
    { value: 'cards', label: t('admin.pageEditor.sectionCards', 'Kartlar'), icon: '🃏' },
    { value: 'stats', label: t('admin.pageEditor.sectionStats', 'İstatistikler'), icon: '📊' }
  ];

  useEffect(() => {
    fetchSections();
  }, [pageSlug]);

  const fetchSections = async () => {
    try {
      setLoading(true);

      // Create sample sections based on page slug
      const sampleSections: Record<string, PageSection[]> = {
        'ana-sayfa': [
          {
            id: '1',
            type: 'hero',
            title: 'Sağlığınız Bizim Önceliğimiz',
            subtitle: 'Modern tıbbi teknolojiler ve uzman kadromuzla yanınızdayız',
            image: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=1200',
            button_text: 'Randevu Al',
            button_url: 'https://anadoluhastaneleri.kendineiyibak.app/',
            order: 1,
            is_active: true
          },
          {
            id: '2',
            type: 'features',
            title: 'Neden Biz?',
            subtitle: 'Size sunduğumuz ayrıcalıklı hizmetler',
            order: 2,
            is_active: true
          },
          {
            id: '3',
            type: 'stats',
            title: 'Rakamlarla Biz',
            subtitle: '25 yılı aşkın deneyimimiz',
            order: 3,
            is_active: true
          },
          {
            id: '4',
            type: 'testimonials',
            title: 'Hasta Yorumları',
            subtitle: 'Bizi tercih eden hastalarımızın deneyimleri',
            order: 4,
            is_active: true
          },
          {
            id: '5',
            type: 'cta',
            title: 'Hemen Randevu Alın',
            subtitle: 'Sağlığınız için ilk adımı atın',
            button_text: 'Randevu Al',
            button_url: 'https://anadoluhastaneleri.kendineiyibak.app/',
            order: 5,
            is_active: true
          }
        ],
        'hastanelerimiz': [
          {
            id: '1',
            type: 'hero',
            title: 'Hastanelerimiz',
            subtitle: 'Modern teknoloji ve uzman kadromuzla hizmet veriyoruz',
            order: 1,
            is_active: true
          },
          {
            id: '2',
            type: 'cards',
            title: 'Hastanelerimiz',
            order: 2,
            is_active: true
          }
        ]
      };

      setSections(sampleSections[pageSlug] || []);
    } catch (error) {
      console.error('Error fetching sections:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      // In a real app, save to database
      // For now, we'll just show success
      alert(t('admin.pageEditor.saved', 'Sayfa içeriği kaydedildi!'));
      onSave?.();
    } catch (error) {
      console.error('Error saving sections:', error);
      alert(t('admin.pageEditor.saveError', 'Sayfa içeriği kaydedilirken hata oluştu!'));
    } finally {
      setSaving(false);
    }
  };

  const addSection = () => {
    setSelectedSection(null);
    setFormData({
      id: Date.now().toString(),
      type: 'text',
      title: '',
      subtitle: '',
      content: '',
      image: '',
      images: [],
      button_text: '',
      button_url: '',
      order: sections.length + 1,
      is_active: true,
      settings: {}
    });
    setShowForm(true);
  };

  const editSection = (section: PageSection) => {
    setSelectedSection(section);
    setFormData({ ...section });
    setShowForm(true);
  };

  const deleteSection = (sectionId: string) => {
    if (!confirm(t('admin.pageEditor.confirmDeleteSection', 'Bu bölümü silmek istediğinizden emin misiniz?'))) return;
    setSections(sections.filter(s => s.id !== sectionId));
  };

  const moveSection = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === sections.length - 1) return;

    const newSections = [...sections];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newSections[index], newSections[targetIndex]] = [newSections[targetIndex], newSections[index]];

    // Update order
    newSections.forEach((section, i) => {
      section.order = i + 1;
    });

    setSections(newSections);
  };

  const saveSection = () => {
    if (selectedSection) {
      setSections(sections.map(s => s.id === selectedSection.id ? formData : s));
    } else {
      setSections([...sections, formData]);
    }
    setShowForm(false);
  };

  const renderSectionPreview = (section: PageSection) => {
    switch (section.type) {
      case 'hero':
        return (
          <div className="bg-primary text-white p-8 rounded-lg text-center">
            <h2 className="text-2xl font-bold mb-2">{section.title}</h2>
            <p className="text-lg opacity-90">{section.subtitle}</p>
            {section.button_text && (
              <button className="mt-4 px-6 py-2 bg-white text-primary rounded-lg font-medium">
                {section.button_text}
              </button>
            )}
          </div>
        );
      case 'text':
        return (
          <div className="bg-white p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-2">{section.title}</h3>
            <p className="text-gray-600">{section.content || t('admin.pageEditor.sampleText', 'Örnek metin içeriği')}</p>
          </div>
        );
      case 'image':
        return (
          <div className="bg-white p-6 rounded-lg">
            <img
              src={section.image || 'https://via.placeholder.com/800x400'}
              alt={section.title}
              className="w-full h-48 object-cover rounded-lg"
            />
            <h3 className="text-lg font-semibold mt-3">{section.title}</h3>
          </div>
        );
      case 'cta':
        return (
          <div className="bg-primary text-white p-6 rounded-lg text-center">
            <h3 className="text-xl font-bold mb-2">{section.title}</h3>
            <p className="mb-4">{section.subtitle}</p>
            <button className="px-6 py-2 bg-white text-primary rounded-lg font-medium">
              {section.button_text || t('admin.pageEditor.sampleButton', 'Buton')}
            </button>
          </div>
        );
      default:
        return (
          <div className="bg-gray-50 p-6 rounded-lg border-2 border-dashed border-gray-200">
            <div className="text-center text-gray-500">
              <span className="text-2xl mb-2 block">{sectionTypes.find(t => t.value === section.type)?.icon}</span>
              <h3 className="font-medium">{section.title || sectionTypes.find(t => t.value === section.type)?.label}</h3>
              <p className="text-sm">{section.subtitle}</p>
            </div>
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
        <h1 className="text-2xl font-semibold text-primary">
          {t('admin.pageEditor.title', 'Sayfa İçerik Editörü')}
        </h1>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center"
          >
            <FaEye className="mr-2" />
            {showPreview ? t('admin.pageEditor.editMode', 'Düzenleme Modu') : t('admin.pageEditor.previewMode', 'Önizleme')}
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors flex items-center disabled:opacity-50"
          >
            <FaSave className="mr-2" />
            {saving ? t('admin.saving', 'Kaydediliyor...') : t('admin.save', 'Kaydet')}
          </button>
        </div>
      </div>

      {!showPreview ? (
        <div className="space-y-4">
          {sections.map((section, index) => (
            <div
              key={section.id}
              className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-primary"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <FaGripVertical className="text-gray-400 mr-3 cursor-move" />
                  <span className="text-2xl mr-3">{sectionTypes.find(t => t.value === section.type)?.icon}</span>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {section.title || sectionTypes.find(t => t.value === section.type)?.label}
                    </h3>
                    <span className="text-sm text-gray-500">{sectionTypes.find(t => t.value === section.type)?.label}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => moveSection(index, 'up')}
                    disabled={index === 0}
                    className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg disabled:opacity-30"
                  >
                    <FaArrowUp />
                  </button>
                  <button
                    onClick={() => moveSection(index, 'down')}
                    disabled={index === sections.length - 1}
                    className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg disabled:opacity-30"
                  >
                    <FaArrowDown />
                  </button>
                  <button
                    onClick={() => editSection(section)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                  >
                    <FaCode />
                  </button>
                  <button
                    onClick={() => deleteSection(section.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                {renderSectionPreview(section)}
              </div>
            </div>
          ))}

          <button
            onClick={addSection}
            className="w-full py-8 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-primary hover:text-primary transition-colors flex flex-col items-center"
          >
            <FaPlus className="text-2xl mb-2" />
            <span>{t('admin.pageEditor.addSection', 'Yeni Bölüm Ekle')}</span>
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="space-y-6">
            {sections.filter(s => s.is_active).map(section => (
              <div key={section.id}>
                {renderSectionPreview(section)}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">
              {selectedSection ? t('admin.pageEditor.editSection', 'Bölüm Düzenle') : t('admin.pageEditor.addSection', 'Yeni Bölüm Ekle')}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('admin.label.sectionType', 'Bölüm Tipi')}
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {sectionTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.icon} {type.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('admin.label.title', 'Başlık')}
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('admin.label.subtitle', 'Alt Başlık')}
                </label>
                <input
                  type="text"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {['text', 'hero', 'features', 'testimonials', 'contact'].includes(formData.type) && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('admin.label.content', 'İçerik')}
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    rows={5}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              )}

              {['hero', 'image', 'gallery'].includes(formData.type) && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('admin.label.imageUrl', 'Resim URL')}
                  </label>
                  <input
                    type="url"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              )}

              {['hero', 'cta'].includes(formData.type) && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('admin.label.buttonText', 'Buton Metni')}
                    </label>
                    <input
                      type="text"
                      value={formData.button_text}
                      onChange={(e) => setFormData({ ...formData, button_text: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('admin.label.buttonUrl', 'Buton URL')}
                    </label>
                    <input
                      type="url"
                      value={formData.button_url}
                      onChange={(e) => setFormData({ ...formData, button_url: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </>
              )}

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="mr-2"
                />
                <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                  {t('admin.label.active', 'Aktif')}
                </label>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                {t('admin.cancel', 'İptal')}
              </button>
              <button
                type="button"
                onClick={saveSection}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark flex items-center"
              >
                <FaSave className="mr-2" />
                {t('admin.save', 'Kaydet')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PageContentEditor;
