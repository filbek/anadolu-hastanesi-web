import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaFileAlt, FaCode } from 'react-icons/fa';
import { supabase, type Translations } from '../../lib/supabase';
import PageContentEditor from './PageContentEditor';
import TranslationsPanel from './TranslationsPanel';

interface Page {
  id: number;
  title: string;
  slug: string;
  content: string;
  hero_title?: string;
  hero_subtitle?: string;
  hero_image?: string;
  sections?: PageSection[];
  meta_title?: string;
  meta_description?: string;
  is_published: boolean;
  page_type: 'static' | 'dynamic' | 'landing';
  template: string;
  translations?: Translations;
  created_at: string;
  updated_at: string;
}

interface PageSection {
  id: string;
  type: 'hero' | 'text' | 'image' | 'gallery' | 'cta' | 'features' | 'testimonials' | 'contact';
  title?: string;
  content?: string;
  image?: string;
  images?: string[];
  settings?: Record<string, any>;
  order: number;
}

const AdminPages = () => {
  const { t } = useTranslation();
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingPage, setEditingPage] = useState<Page | null>(null);
  const [showContentEditor, setShowContentEditor] = useState(false);
  const [editingPageSlug, setEditingPageSlug] = useState<string>('');
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    hero_title: '',
    hero_subtitle: '',
    hero_image: '',
    meta_title: '',
    meta_description: '',
    is_published: true,
    page_type: 'static' as 'static' | 'dynamic' | 'landing',
    template: 'default',
    translations: {} as Translations
  });

  useEffect(() => {
    fetchPages();
    createPagesTable();
  }, []);

  const createPagesTable = async () => {
    try {
      await supabase.rpc('create_pages_table_if_not_exists');
    } catch (error) {
      // Table might already exist, create manually
      const { error: createError } = await supabase
        .from('pages')
        .select('id')
        .limit(1);

      if (createError && createError.code === '42P01') {
        // Table doesn't exist, we'll create some default pages
        console.log('Pages table needs to be created');
      }
    }
  };

  const fetchPages = async () => {
    try {
      setLoading(true);

      // Create default pages if table is empty
      const defaultPages = [
        {
          title: 'Ana Sayfa',
          slug: 'ana-sayfa',
          content: '<div class="hero-section"><h1>Anadolu Hastaneleri Grubu</h1><p>Sağlığınız için en iyi hizmet, en son teknoloji ve uzman kadro.</p></div>',
          hero_title: 'Sağlığınız Bizim Önceliğimiz',
          hero_subtitle: 'Modern tıbbi teknolojiler ve uzman kadromuzla yanınızdayız',
          hero_image: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=1200',
          meta_title: 'Anadolu Hastaneleri Grubu - Sağlığınız Bizim Önceliğimiz',
          meta_description: 'Modern tıbbi teknolojiler ve uzman kadrosuyla hizmet veren öncü sağlık kuruluşu.',
          is_published: true,
          page_type: 'landing',
          template: 'homepage'
        },
        {
          title: 'Hastanelerimiz',
          slug: 'hastanelerimiz',
          content: '<h1>Hastanelerimiz</h1><p>Modern teknoloji ve uzman kadromuzla hizmet veren hastanelerimiz.</p>',
          hero_title: 'Hastanelerimiz',
          hero_subtitle: 'Modern teknoloji ve uzman kadromuzla hizmet veriyoruz',
          meta_title: 'Hastanelerimiz - Anadolu Hastaneleri',
          meta_description: 'Anadolu Hastaneleri Grubu hastaneleri ve hizmetleri.',
          is_published: true,
          page_type: 'dynamic',
          template: 'hospitals'
        },
        {
          title: 'Bölümlerimiz',
          slug: 'bolumlerimiz',
          content: '<h1>Bölümlerimiz</h1><p>Uzman doktorlarımız ve modern tıbbi cihazlarımızla hizmet veren bölümlerimiz.</p>',
          hero_title: 'Tıbbi Bölümlerimiz',
          hero_subtitle: 'Uzman doktorlarımız ve modern teknolojimizle yanınızdayız',
          meta_title: 'Bölümlerimiz - Anadolu Hastaneleri',
          meta_description: 'Anadolu Hastaneleri tıbbi bölümleri ve uzman doktorları.',
          is_published: true,
          page_type: 'dynamic',
          template: 'departments'
        },
        {
          title: 'Doktorlarımız',
          slug: 'doktorlar',
          content: '<h1>Doktorlarımız</h1><p>Alanında uzman, deneyimli doktorlarımızla hizmetinizdeyiz.</p>',
          hero_title: 'Uzman Doktorlarımız',
          hero_subtitle: 'Alanında uzman, deneyimli doktorlarımızla hizmetinizdeyiz',
          meta_title: 'Doktorlarımız - Anadolu Hastaneleri',
          meta_description: 'Anadolu Hastaneleri uzman doktorları ve branşları.',
          is_published: true,
          page_type: 'dynamic',
          template: 'doctors'
        },
        {
          title: 'Sağlık Rehberi',
          slug: 'saglik-rehberi',
          content: '<h1>Sağlık Rehberi</h1><p>Sağlığınız için faydalı bilgiler, makaleler ve rehberler.</p>',
          hero_title: 'Sağlık Rehberi',
          hero_subtitle: 'Sağlığınız için faydalı bilgiler ve uzman tavsiyeleri',
          meta_title: 'Sağlık Rehberi - Anadolu Hastaneleri',
          meta_description: 'Sağlık konularında faydalı makaleler ve uzman tavsiyeleri.',
          is_published: true,
          page_type: 'dynamic',
          template: 'health-guide'
        },
        {
          title: 'Sağlık Turizmi',
          slug: 'saglik-turizmi',
          content: '<h1>Sağlık Turizmi</h1><p>Uluslararası hastalara özel sağlık turizmi hizmetlerimiz.</p>',
          hero_title: 'Sağlık Turizmi',
          hero_subtitle: 'Uluslararası hastalara özel hizmetler',
          meta_title: 'Sağlık Turizmi - Anadolu Hastaneleri',
          meta_description: 'Anadolu Hastaneleri sağlık turizmi hizmetleri.',
          is_published: true,
          page_type: 'static',
          template: 'health-tourism'
        },
        {
          title: 'İletişim',
          slug: 'iletisim',
          content: '<h1>İletişim</h1><p>Bizimle iletişime geçin, size yardımcı olmaktan mutluluk duyarız.</p>',
          hero_title: 'İletişim',
          hero_subtitle: 'Bizimle iletişime geçin',
          meta_title: 'İletişim - Anadolu Hastaneleri',
          meta_description: 'Anadolu Hastaneleri ile iletişim bilgileri.',
          is_published: true,
          page_type: 'static',
          template: 'contact'
        },
        {
          title: 'Hakkımızda',
          slug: 'hakkimizda',
          content: '<h1>Hakkımızda</h1><p>1995 yılından bu yana sağlık sektöründe öncü konumundayız.</p>',
          hero_title: 'Hakkımızda',
          hero_subtitle: '25 yılı aşkın deneyimimizle sağlık sektöründe öncüyüz',
          meta_title: 'Hakkımızda - Anadolu Hastaneleri',
          meta_description: 'Anadolu Hastaneleri Grubu hakkında detaylı bilgi.',
          is_published: true,
          page_type: 'static',
          template: 'about'
        }
      ];

      // Try to fetch existing pages
      const { data, error } = await supabase
        .from('pages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error && error.code === '42P01') {
        // Table doesn't exist, show default pages
        setPages(defaultPages.map((page, index) => ({
          ...page,
          id: index + 1,
          page_type: page.page_type as 'static' | 'dynamic' | 'landing',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })));
      } else if (error) {
        throw error;
      } else {
        setPages(data || []);
      }
    } catch (error) {
      console.error('Error fetching pages:', error);
      // Show default pages on error
      setPages([
        {
          id: 1,
          title: 'Ana Sayfa',
          slug: 'ana-sayfa',
          content: 'Ana sayfa içeriği...',
          is_published: true,
          page_type: 'landing',
          template: 'homepage',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingPage) {
        // Update existing page
        const { error } = await supabase
          .from('pages')
          .update({
            ...formData,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingPage.id);

        if (error) throw error;

        setPages(pages.map(page =>
          page.id === editingPage.id
            ? { ...page, ...formData, updated_at: new Date().toISOString() }
            : page
        ));
      } else {
        // Create new page
        const { data, error } = await supabase
          .from('pages')
          .insert([formData])
          .select()
          .single();

        if (error) throw error;

        setPages([data, ...pages]);
      }

      setShowForm(false);
      setEditingPage(null);
      setFormData({
        title: '',
        slug: '',
        content: '',
        hero_title: '',
        hero_subtitle: '',
        hero_image: '',
        meta_title: '',
        meta_description: '',
        is_published: true,
        page_type: 'static',
        template: 'default',
        translations: {}
      });

      alert(editingPage ? t('admin.pageUpdated', 'Sayfa güncellendi!') : t('admin.pageCreated', 'Sayfa oluşturuldu!'));
    } catch (error) {
      console.error('Error saving page:', error);
      alert(t('admin.pageSaveError', 'Sayfa kaydedilirken hata oluştu!'));
    }
  };

  const deletePage = async (id: number) => {
    if (!confirm(t('admin.confirmDeletePage', 'Bu sayfayı silmek istediğinizden emin misiniz?'))) return;

    try {
      const { error } = await supabase
        .from('pages')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setPages(pages.filter(page => page.id !== id));
      alert(t('admin.pageDeleted', 'Sayfa silindi!'));
    } catch (error) {
      console.error('Error deleting page:', error);
      alert(t('admin.pageDeleteError', 'Sayfa silinirken hata oluştu!'));
    }
  };

  const editPage = (page: Page) => {
    setEditingPage(page);
    setFormData({
      title: page.title,
      slug: page.slug,
      content: page.content,
      hero_title: page.hero_title || '',
      hero_subtitle: page.hero_subtitle || '',
      hero_image: page.hero_image || '',
      meta_title: page.meta_title || '',
      meta_description: page.meta_description || '',
      is_published: page.is_published,
      page_type: page.page_type || 'static',
      template: page.template || 'default',
      translations: page.translations || {}
    });
    setShowForm(true);
  };

  const filteredPages = pages.filter(page =>
    page.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    page.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        <h1 className="text-2xl font-semibold text-primary">{t('admin.pages.title', 'Sayfa Yönetimi')}</h1>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingPage(null);
            setFormData({
              title: '',
              slug: '',
              content: '',
              hero_title: '',
              hero_subtitle: '',
              hero_image: '',
              meta_title: '',
              meta_description: '',
              is_published: true,
              page_type: 'static',
              template: 'default',
              translations: {}
            });
          }}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors flex items-center"
        >
          <FaPlus className="mr-2" />
          {t('admin.pages.new', 'Yeni Sayfa')}
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={t('admin.pages.searchPlaceholder', 'Sayfa ara...')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
      </div>

      {/* Pages List */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('admin.label.page', 'Sayfa')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('admin.label.status', 'Durum')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('admin.label.lastUpdate', 'Son Güncelleme')}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('admin.label.actions', 'İşlemler')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPages.map((page) => (
                <tr key={page.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <FaFileAlt className="text-primary mr-3" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{page.title}</div>
                        <div className="text-sm text-gray-500">/{page.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${page.is_published
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                      }`}>
                      {page.is_published ? t('admin.published', 'Yayında') : t('admin.draft', 'Taslak')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(page.updated_at).toLocaleDateString('tr-TR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <button
                      onClick={() => {
                        setEditingPageSlug(page.slug);
                        setShowContentEditor(true);
                      }}
                      className="text-green-600 hover:text-green-800 transition-colors"
                      title={t('admin.contentEditor', 'İçerik Editörü')}
                    >
                      <FaCode />
                    </button>
                    <button
                      onClick={() => editPage(page)}
                      className="text-blue-600 hover:text-blue-800 transition-colors"
                      title={t('admin.pageSettings', 'Sayfa Ayarları')}
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => deletePage(page.id)}
                      className="text-red-600 hover:text-red-800 transition-colors"
                      title={t('admin.delete', 'Sil')}
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">
              {editingPage ? t('admin.pages.edit', 'Sayfa Düzenle') : t('admin.pages.new', 'Yeni Sayfa')}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('admin.label.pageTitle', 'Sayfa Başlığı')}
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('admin.label.urlSlug', 'URL Slug')}
                  </label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('admin.label.pageType', 'Sayfa Tipi')}
                  </label>
                  <select
                    value={formData.page_type}
                    onChange={(e) => setFormData({ ...formData, page_type: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="static">{t('admin.pageType.static', 'Statik Sayfa')}</option>
                    <option value="dynamic">{t('admin.pageType.dynamic', 'Dinamik Sayfa')}</option>
                    <option value="landing">{t('admin.pageType.landing', 'Landing Page')}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('admin.label.heroTitle', 'Hero Başlık')}
                </label>
                <input
                  type="text"
                  value={formData.hero_title}
                  onChange={(e) => setFormData({ ...formData, hero_title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder={t('admin.label.heroTitlePlaceholder', 'Sayfanın ana başlığı')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('admin.label.heroSubtitle', 'Hero Alt Başlık')}
                </label>
                <input
                  type="text"
                  value={formData.hero_subtitle}
                  onChange={(e) => setFormData({ ...formData, hero_subtitle: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder={t('admin.label.heroSubtitlePlaceholder', 'Sayfanın alt başlığı')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('admin.label.heroImageUrl', 'Hero Resim URL')}
                </label>
                <input
                  type="url"
                  value={formData.hero_image}
                  onChange={(e) => setFormData({ ...formData, hero_image: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('admin.label.content', 'İçerik')}
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={8}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder={t('admin.label.contentPlaceholder', 'HTML içerik veya metin')}
                  required
                />
              </div>

              <div className="border-t pt-4">
                <h3 className="text-lg font-medium text-gray-900 mb-3">{t('admin.seoSettings', 'SEO Ayarları')}</h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('admin.label.metaTitle', 'Meta Başlık')}
                  </label>
                  <input
                    type="text"
                    value={formData.meta_title}
                    onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder={t('admin.label.metaTitlePlaceholder', 'SEO için sayfa başlığı')}
                  />
                </div>

                <div className="mt-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('admin.label.metaDescription', 'Meta Açıklama')}
                  </label>
                  <textarea
                    value={formData.meta_description}
                    onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder={t('admin.label.metaDescriptionPlaceholder', 'SEO için sayfa açıklaması (150-160 karakter)')}
                  />
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_published"
                  checked={formData.is_published}
                  onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                  className="mr-2"
                />
                <label htmlFor="is_published" className="text-sm font-medium text-gray-700">
                  {t('admin.label.published', 'Yayında')}
                </label>
              </div>

              {/* Çeviriler */}
              <TranslationsPanel
                source={formData}
                value={formData.translations || {}}
                onChange={(next) => setFormData({ ...formData, translations: next })}
                fields={[
                  { key: 'title', label: t('admin.label.pageTitle', 'Sayfa Başlığı'), type: 'text' },
                  { key: 'hero_title', label: t('admin.label.heroTitle', 'Banner Başlığı'), type: 'text' },
                  { key: 'hero_subtitle', label: t('admin.label.heroSubtitle', 'Banner Alt Başlığı'), type: 'textarea' },
                  { key: 'content', label: t('admin.label.content', 'İçerik'), type: 'html' },
                  { key: 'meta_title', label: t('admin.label.metaTitle', 'Meta Başlık'), type: 'text' },
                  { key: 'meta_description', label: t('admin.label.metaDescription', 'Meta Açıklama'), type: 'textarea' },
                ]}
              />

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  {t('admin.cancel', 'İptal')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
                >
                  {editingPage ? t('admin.update', 'Güncelle') : t('admin.create', 'Oluştur')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Content Editor Modal */}
      {showContentEditor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-primary">
                {t('admin.pageContentEditor', 'Sayfa İçerik Editörü')}
              </h2>
              <button
                onClick={() => setShowContentEditor(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="p-6">
              <PageContentEditor
                pageSlug={editingPageSlug}
                onSave={() => {
                  setShowContentEditor(false);
                  fetchPages();
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPages;
