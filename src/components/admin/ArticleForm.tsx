import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { FaSave, FaArrowLeft, FaImage, FaTag, FaCloudUploadAlt, FaTimes } from 'react-icons/fa';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import type { HealthArticle, Department, Doctor } from '../../lib/supabase';

interface ArticleFormProps {
  article?: HealthArticle;
  onSave?: (article: HealthArticle) => void;
  onCancel?: () => void;
}

const ArticleForm = ({ article, onSave, onCancel }: ArticleFormProps = {}) => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<Partial<HealthArticle>>({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    image: '',
    category: '',
    tags: [],
    type: 'article',
    date: new Date().toISOString().split('T')[0],
    views: 0,
    is_published: false,
    is_featured: false,
    author_name: '',
    author_title: '',
    author_image: '',
    read_time: '5 dk',
  });
  const [tagInput, setTagInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [relatedDoctors, setRelatedDoctors] = useState<Doctor[]>([]);

  const types = [
    { value: 'article', label: t('admin.type.article', 'Makale') },
    { value: 'video', label: t('admin.type.video', 'Video') },
    { value: 'pdf', label: t('admin.type.pdf', 'PDF') },
  ];

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    if (article) {
      setFormData(article);
    } else if (id) {
      fetchArticle(parseInt(id));
    }
  }, [article, id]);

  useEffect(() => {
    if (formData.category) {
      fetchRelatedDoctors(formData.category);
    } else {
      setRelatedDoctors([]);
    }
  }, [formData.category]);

  const fetchDepartments = async () => {
    try {
      const { data, error } = await supabase
        .from('departments')
        .select('id, name, slug')
        .eq('is_published', true)
        .order('name');
      if (!error) setDepartments(data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchRelatedDoctors = async (categoryName: string) => {
    try {
      const { data, error } = await supabase
        .from('doctors')
        .select('id, name, title, image, department_id')
        .eq('is_active', true)
        .order('name');
      if (error) throw error;

      // Filtrele: kategori adıyla eşleşen departmana sahip doktorlar
      const dept = departments.find(d =>
        d.name.toLowerCase() === categoryName.toLowerCase() ||
        d.slug.toLowerCase() === categoryName.toLowerCase()
      );
      if (dept && data) {
        setRelatedDoctors(data.filter((doc: Doctor) => doc.department_id === dept.id));
      } else {
        setRelatedDoctors([]);
      }
    } catch (e) {
      console.error(e);
      setRelatedDoctors([]);
    }
  };

  const fetchArticle = async (articleId: number) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('health_articles').select('*').eq('id', articleId).single();
      if (error) throw error;
      if (data) {
        setFormData({
          ...data,
          tags: Array.isArray(data.tags) ? data.tags : (typeof data.tags === 'string' ? JSON.parse(data.tags || '[]') : [])
        });
      }
    } catch (error) {
      console.error('Error fetching article:', error);
      alert(t('admin.errorFetching', 'Makale bilgileri yüklenemedi!'));
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 60);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setFormData(prev => ({
      ...prev,
      title,
      slug: prev.slug || generateSlug(title)
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}-${Date.now()}.${fileExt}`;
      const filePath = `article-images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('doctor-images')
        .upload(filePath, file);

      if (uploadError) {
        alert('Resim yüklenirken hata oluştu: ' + uploadError.message);
        return;
      }

      const { data } = supabase.storage.from('doctor-images').getPublicUrl(filePath);
      setFormData(prev => ({ ...prev, image: data.publicUrl }));
    } catch (error: any) {
      alert('Resim yüklenirken hata oluştu: ' + error?.message);
    } finally {
      setUploadingImage(false);
    }
  };

  const removeImage = () => {
    setFormData(prev => ({ ...prev, image: '' }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const addTag = () => {
    if (tagInput.trim() && !(formData.tags || []).includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: (prev.tags || []).filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const articleData = {
        ...formData,
        created_at: formData.created_at || new Date().toISOString()
      };

      if (onSave) {
        onSave(articleData as HealthArticle);
      } else {
        if (id || formData.id) {
          const articleId = id ? parseInt(id) : formData.id!;
          await supabase.from('health_articles').update(articleData).eq('id', articleId);
        } else {
          await supabase.from('health_articles').insert([articleData]);
        }
        navigate('/admin/articles');
      }
    } catch (error) {
      console.error('Error saving article:', error);
      alert(t('admin.articleForm.saveError', 'Makale kaydedilirken hata oluştu!'));
    } finally {
      setSaving(false);
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
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button
            onClick={() => onCancel ? onCancel() : navigate('/admin/articles')}
            className="mr-4 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FaArrowLeft />
          </button>
          <h1 className="text-2xl font-semibold text-primary">
            {article || id ? t('admin.articleForm.editTitle', 'Makale Düzenle') : t('admin.articleForm.newTitle', 'Yeni Makale')}
          </h1>
        </div>
        <button
          onClick={handleSubmit}
          disabled={saving}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors flex items-center disabled:opacity-50"
        >
          <FaSave className="mr-2" />
          {saving ? t('admin.saving', 'Kaydediliyor...') : t('admin.save', 'Kaydet')}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('admin.label.articleTitle', 'Makale Başlığı')}
                </label>
                <input
                  type="text"
                  value={formData.title || ''}
                  onChange={handleTitleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder={t('admin.label.articleTitlePlaceholder', 'Makale başlığı girin')}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('admin.label.slug', 'URL Slug')}
                </label>
                <input
                  type="text"
                  value={formData.slug || ''}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="makale-basligi"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('admin.label.excerpt', 'Özet')}
                </label>
                <textarea
                  value={formData.excerpt || ''}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder={t('admin.label.excerptPlaceholder', 'Makale özeti (160 karakter)')}
                  maxLength={160}
                />
                <p className="text-sm text-gray-500 mt-1">
                  {(formData.excerpt || '').length}/160 {t('admin.label.characters', 'karakter')}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('admin.label.content', 'İçerik')}
                </label>
                <textarea
                  value={formData.content || ''}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={15}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-mono text-sm"
                  placeholder={t('admin.label.contentPlaceholder', 'Makale içeriğini HTML veya Markdown formatında girin')}
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Publishing Options */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-primary mb-4">{t('admin.label.publishing', 'Yayınlama')}</h3>

            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_published"
                  checked={!!formData.is_published}
                  onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                  className="mr-2"
                />
                <label htmlFor="is_published" className="text-sm font-medium text-gray-700">
                  {t('admin.label.published', 'Yayında')}
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_featured"
                  checked={!!formData.is_featured}
                  onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                  className="mr-2"
                />
                <label htmlFor="is_featured" className="text-sm font-medium text-gray-700">
                  {t('admin.label.featured', 'Öne Çıkan')}
                </label>
              </div>
            </div>
          </div>

          {/* Type */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-primary mb-4">{t('admin.label.type', 'Tür')}</h3>
            <select
              value={formData.type || 'article'}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as 'article' | 'video' | 'pdf' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              {types.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>

          {/* Category */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-primary mb-4">{t('admin.label.category', 'Kategori')}</h3>
            <select
              value={formData.category || ''}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">Kategori seçin</option>
              {departments.map(dept => (
                <option key={dept.id} value={dept.name}>{dept.name}</option>
              ))}
            </select>
            {relatedDoctors.length > 0 && (
              <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                <p className="text-xs text-blue-700 font-medium mb-2">Bu kategorideki doktorlar sayfada listelenecek:</p>
                <div className="flex flex-wrap gap-1">
                  {relatedDoctors.map(doc => (
                    <span key={doc.id} className="text-xs bg-white text-blue-600 px-2 py-1 rounded border border-blue-100">
                      {doc.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Date */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-primary mb-4">{t('admin.label.date', 'Tarih')}</h3>
            <input
              type="date"
              value={formData.date || ''}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          {/* Author */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-primary mb-4">{t('admin.label.author', 'Yazar')}</h3>
            <div className="space-y-3">
              <input
                type="text"
                value={formData.author_name || ''}
                onChange={(e) => setFormData({ ...formData, author_name: e.target.value })}
                placeholder={t('admin.label.authorName', 'Yazar Adı')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <input
                type="text"
                value={formData.author_title || ''}
                onChange={(e) => setFormData({ ...formData, author_title: e.target.value })}
                placeholder={t('admin.label.authorTitle', 'Yazar Unvanı')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>

          {/* Tags */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-primary mb-4 flex items-center">
              <FaTag className="mr-2" />
              {t('admin.label.tags', 'Etiketler')}
            </h3>

            <div className="flex items-center space-x-2 mb-3">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder={t('admin.label.tagPlaceholder', 'Etiket ekle...')}
              />
              <button
                type="button"
                onClick={addTag}
                className="px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
              >
                {t('admin.add', 'Ekle')}
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {(formData.tags || []).map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 bg-primary/10 text-primary text-sm rounded-full"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-1 text-primary hover:text-primary-dark"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Featured Image */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-primary mb-4 flex items-center">
              <FaImage className="mr-2" />
              {t('admin.label.featuredImage', 'Kapak Resmi')}
            </h3>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />

            {formData.image ? (
              <div className="relative">
                <img
                  src={formData.image}
                  alt="Preview"
                  className="w-full h-40 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                >
                  <FaTimes size={12} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingImage}
                className="w-full flex flex-col items-center justify-center gap-2 p-6 rounded-xl border-2 border-dashed border-primary/30 bg-gray-50 hover:bg-white hover:border-primary/50 transition-all cursor-pointer disabled:opacity-50"
              >
                {uploadingImage ? (
                  <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-primary" />
                ) : (
                  <FaCloudUploadAlt className="text-2xl text-primary/60" />
                )}
                <span className="text-sm font-medium text-secondary">
                  {uploadingImage ? 'Yükleniyor...' : 'Resim Yükle'}
                </span>
                <span className="text-xs text-gray-400">JPG, PNG (Max: 5MB)</span>
              </button>
            )}

            <div className="mt-3">
              <label className="block text-xs text-gray-500 mb-1">Veya URL girin</label>
              <input
                type="url"
                value={formData.image || ''}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ArticleForm;
