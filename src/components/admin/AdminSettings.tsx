import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { FaSave, FaGlobe, FaPhone, FaExternalLinkAlt, FaUpload, FaImage, FaTrash, FaEye, FaEnvelope } from 'react-icons/fa';
import { supabase } from '../../lib/supabase';

interface SiteSettings {
  id?: number;
  site_name: string;
  site_description: string;
  site_keywords: string;
  contact_phone: string;
  contact_email: string;
  contact_address: string;
  emergency_phone: string;
  working_hours: string;
  appointment_url: string;
  social_facebook: string;
  social_twitter: string;
  social_instagram: string;
  social_linkedin: string;
  google_analytics_id: string;
  meta_title: string;
  meta_description: string;
  logo_url: string;
  favicon_url: string;
  second_opinion_email: string;
  updated_at?: string;
}

const AdminSettings = () => {
  const { t } = useTranslation();
  const [settings, setSettings] = useState<SiteSettings>({
    site_name: 'Anadolu Hastaneleri Grubu',
    site_description: 'Sağlığınız için en iyi hizmet, en son teknoloji ve uzman kadro.',
    site_keywords: 'hastane, sağlık, doktor, randevu, tıbbi, Anadolu, sağlık hizmetleri',
    contact_phone: '+90 212 123 45 67',
    contact_email: 'info@anadoluhastaneleri.com',
    contact_address: 'İstanbul, Türkiye',
    emergency_phone: '+90 212 123 45 68',
    working_hours: '24/7 Acil Servis, Poliklinik: 08:00-18:00',
    appointment_url: 'https://anadoluhastaneleri.kendineiyibak.app/',
    social_facebook: '',
    social_twitter: '',
    social_instagram: '',
    social_linkedin: '',
    google_analytics_id: '',
    meta_title: 'Anadolu Hastaneleri Grubu - Sağlığınız Bizim Önceliğimiz',
    meta_description: 'Modern tıbbi teknolojiler ve uzman kadrosuyla hizmet veren öncü sağlık kuruluşu. Randevu almak için hemen iletişime geçin.',
    logo_url: '',
    favicon_url: '',
    second_opinion_email: 'info@anadoluhastaneleri.com',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [faviconPreview, setFaviconPreview] = useState<string>('');
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingFavicon, setUploadingFavicon] = useState(false);
  const logoFileRef = useRef<HTMLInputElement>(null);
  const faviconFileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  useEffect(() => {
    // Set previews when settings change
    if (settings.logo_url) {
      setLogoPreview(settings.logo_url);
    }
    if (settings.favicon_url) {
      setFaviconPreview(settings.favicon_url);
    }
  }, [settings.logo_url, settings.favicon_url]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setSettings(data);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);

      const settingsData = {
        ...settings,
        updated_at: new Date().toISOString(),
      };

      if (settings.id) {
        // Update existing settings
        const { error } = await supabase
          .from('site_settings')
          .update(settingsData)
          .eq('id', settings.id);

        if (error) throw error;
      } else {
        // Insert new settings
        const { data, error } = await supabase
          .from('site_settings')
          .insert([settingsData])
          .select()
          .single();

        if (error) throw error;
        setSettings(data);
      }

      // Save logo to localStorage for immediate use
      if (settings.logo_url) {
        localStorage.setItem('site_logo_url', settings.logo_url);
      } else {
        localStorage.removeItem('site_logo_url');
      }

      if (settings.favicon_url) {
        localStorage.setItem('site_favicon_url', settings.favicon_url);
        // Update favicon in document head
        updateFavicon(settings.favicon_url);
      }

      alert(t('admin.settings.saved', 'Ayarlar başarıyla kaydedildi!'));
    } catch (error) {
      console.error('Error saving settings:', error);
      alert(t('admin.settings.saveError', 'Ayarlar kaydedilirken hata oluştu!'));
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert(t('admin.settings.invalidImage', 'Lütfen geçerli bir resim dosyası seçin!'));
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert(t('admin.settings.logoSizeError', 'Dosya boyutu 2MB\'dan küçük olmalıdır!'));
      return;
    }

    try {
      setUploadingLogo(true);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setLogoPreview(result);
        setSettings(prev => ({ ...prev, logo_url: result }));
      };
      reader.readAsDataURL(file);

      // In a real app, you would upload to a storage service like Supabase Storage
      // For now, we'll use the data URL

    } catch (error) {
      console.error('Error uploading logo:', error);
      alert(t('admin.settings.logoUploadError', 'Logo yüklenirken hata oluştu!'));
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleFaviconUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert(t('admin.settings.invalidImage', 'Lütfen geçerli bir resim dosyası seçin!'));
      return;
    }

    // Validate file size (max 1MB)
    if (file.size > 1024 * 1024) {
      alert(t('admin.settings.faviconSizeError', 'Favicon dosya boyutu 1MB\'dan küçük olmalıdır!'));
      return;
    }

    try {
      setUploadingFavicon(true);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setFaviconPreview(result);
        setSettings(prev => ({ ...prev, favicon_url: result }));
      };
      reader.readAsDataURL(file);

    } catch (error) {
      console.error('Error uploading favicon:', error);
      alert(t('admin.settings.faviconUploadError', 'Favicon yüklenirken hata oluştu!'));
    } finally {
      setUploadingFavicon(false);
    }
  };

  const removeLogo = () => {
    setSettings(prev => ({ ...prev, logo_url: '' }));
    setLogoPreview('');
    if (logoFileRef.current) {
      logoFileRef.current.value = '';
    }
  };

  const removeFavicon = () => {
    setSettings(prev => ({ ...prev, favicon_url: '' }));
    setFaviconPreview('');
    if (faviconFileRef.current) {
      faviconFileRef.current.value = '';
    }
  };

  const updateFavicon = (faviconUrl: string) => {
    // Remove existing favicon
    const existingFavicon = document.querySelector('link[rel="icon"]') ||
      document.querySelector('link[rel="shortcut icon"]');
    if (existingFavicon) {
      existingFavicon.remove();
    }

    // Add new favicon
    const link = document.createElement('link');
    link.rel = 'icon';
    link.href = faviconUrl;
    document.head.appendChild(link);
  };

  const handleInputChange = (field: keyof SiteSettings, value: string) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
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
        <h1 className="text-2xl font-semibold text-primary">{t('admin.settings.title', 'Site Ayarları')}</h1>
        <button
          onClick={saveSettings}
          disabled={saving}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors flex items-center disabled:opacity-50"
        >
          <FaSave className="mr-2" />
          {saving ? t('admin.saving', 'Kaydediliyor...') : t('admin.save', 'Kaydet')}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Genel Bilgiler */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-primary mb-4 flex items-center">
            <FaGlobe className="mr-2" />
            {t('admin.settings.generalInfo', 'Genel Bilgiler')}
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('admin.label.siteName', 'Site Adı')}
              </label>
              <input
                type="text"
                value={settings.site_name}
                onChange={(e) => handleInputChange('site_name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('admin.label.siteDescription', 'Site Açıklaması')}
              </label>
              <textarea
                value={settings.site_description}
                onChange={(e) => handleInputChange('site_description', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('admin.label.keywords', 'Anahtar Kelimeler')}
              </label>
              <input
                type="text"
                value={settings.site_keywords}
                onChange={(e) => handleInputChange('site_keywords', e.target.value)}
                placeholder={t('admin.label.keywordsPlaceholder', 'virgülle ayırın')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* İletişim Bilgileri */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-primary mb-4 flex items-center">
            <FaPhone className="mr-2" />
            {t('admin.settings.contactInfo', 'İletişim Bilgileri')}
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('admin.label.phone', 'Telefon')}
              </label>
              <input
                type="text"
                value={settings.contact_phone}
                onChange={(e) => handleInputChange('contact_phone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('admin.label.email', 'E-posta')}
              </label>
              <input
                type="email"
                value={settings.contact_email}
                onChange={(e) => handleInputChange('contact_email', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('admin.label.address', 'Adres')}
              </label>
              <textarea
                value={settings.contact_address}
                onChange={(e) => handleInputChange('contact_address', e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('admin.label.emergencyPhone', 'Acil Telefon')}
              </label>
              <input
                type="text"
                value={settings.emergency_phone}
                onChange={(e) => handleInputChange('emergency_phone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('admin.label.workingHours', 'Çalışma Saatleri')}
              </label>
              <input
                type="text"
                value={settings.working_hours}
                onChange={(e) => handleInputChange('working_hours', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Form Bildirim Ayarları */}
        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-primary">
          <h2 className="text-lg font-semibold text-primary mb-4 flex items-center">
            <FaEnvelope className="mr-2" />
            Form Bildirim Ayarları
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                İkinci Görüş Formu Email Adresi
              </label>
              <input
                type="email"
                value={settings.second_opinion_email}
                onChange={(e) => handleInputChange('second_opinion_email', e.target.value)}
                placeholder="ornek@mail.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <p className="text-sm text-gray-500 mt-1">
                Anasayfadaki ikinci görüş formu doldurulduğunda başvuru bilgilerinin gönderileceği email adresi.
                Bu adres değiştirildiğinde yeni başvurular yeni adrese yönlendirilecektir.
              </p>
            </div>
          </div>
        </div>

        {/* Randevu Sistemi */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-primary mb-4 flex items-center">
            <FaExternalLinkAlt className="mr-2" />
            {t('admin.settings.appointmentSystem', 'Randevu Sistemi')}
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('admin.label.appointmentUrl', 'Randevu URL\'si')}
              </label>
              <input
                type="url"
                value={settings.appointment_url}
                onChange={(e) => handleInputChange('appointment_url', e.target.value)}
                placeholder="https://anadoluhastaneleri.kendineiyibak.app/"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <p className="text-sm text-gray-500 mt-1">
                {t('admin.settings.appointmentUrlHint', 'Randevu Al butonuna tıklandığında açılacak sayfa')}
              </p>
            </div>
          </div>
        </div>

        {/* Logo ve Görsel Yönetimi */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-primary mb-4 flex items-center">
            <FaImage className="mr-2" />
            {t('admin.settings.logoManagement', 'Logo ve Görsel Yönetimi')}
          </h2>

          <div className="space-y-6">
            {/* Ana Logo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('admin.label.mainLogo', 'Ana Logo')}
              </label>
              <div className="space-y-3">
                {/* Logo Preview */}
                {logoPreview && (
                  <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                    <img
                      src={logoPreview}
                      alt="Logo Preview"
                      className="h-16 w-auto object-contain"
                    />
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">{t('admin.settings.currentLogo', 'Mevcut Logo')}</p>
                      <div className="flex space-x-2 mt-2">
                        <button
                          type="button"
                          onClick={() => window.open(logoPreview, '_blank')}
                          className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                        >
                          <FaEye className="mr-1" />
                          {t('admin.view', 'Görüntüle')}
                        </button>
                        <button
                          type="button"
                          onClick={removeLogo}
                          className="text-red-600 hover:text-red-800 text-sm flex items-center"
                        >
                          <FaTrash className="mr-1" />
                          {t('admin.remove', 'Kaldır')}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Logo Upload */}
                <div className="flex items-center space-x-4">
                  <input
                    ref={logoFileRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => logoFileRef.current?.click()}
                    disabled={uploadingLogo}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {uploadingLogo ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        {t('admin.uploading', 'Yükleniyor...')}
                      </>
                    ) : (
                      <>
                        <FaUpload className="mr-2" />
                        {t('admin.settings.uploadLogo', 'Logo Yükle')}
                      </>
                    )}
                  </button>
                  <span className="text-sm text-gray-500">
                    PNG, JPG, SVG (Max: 2MB)
                  </span>
                </div>

                {/* Logo URL Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    {t('admin.settings.orLogoUrl', 'Veya Logo URL\'si Girin')}
                  </label>
                  <input
                    type="url"
                    value={settings.logo_url}
                    onChange={(e) => handleInputChange('logo_url', e.target.value)}
                    placeholder="https://example.com/logo.png"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Favicon */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('admin.label.favicon', 'Favicon (Site İkonu)')}
              </label>
              <div className="space-y-3">
                {/* Favicon Preview */}
                {faviconPreview && (
                  <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                    <img
                      src={faviconPreview}
                      alt="Favicon Preview"
                      className="h-8 w-8 object-contain"
                    />
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">{t('admin.settings.currentFavicon', 'Mevcut Favicon')}</p>
                      <div className="flex space-x-2 mt-2">
                        <button
                          type="button"
                          onClick={() => window.open(faviconPreview, '_blank')}
                          className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                        >
                          <FaEye className="mr-1" />
                          {t('admin.view', 'Görüntüle')}
                        </button>
                        <button
                          type="button"
                          onClick={removeFavicon}
                          className="text-red-600 hover:text-red-800 text-sm flex items-center"
                        >
                          <FaTrash className="mr-1" />
                          {t('admin.remove', 'Kaldır')}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Favicon Upload */}
                <div className="flex items-center space-x-4">
                  <input
                    ref={faviconFileRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFaviconUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => faviconFileRef.current?.click()}
                    disabled={uploadingFavicon}
                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    {uploadingFavicon ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        {t('admin.uploading', 'Yükleniyor...')}
                      </>
                    ) : (
                      <>
                        <FaUpload className="mr-2" />
                        {t('admin.settings.uploadFavicon', 'Favicon Yükle')}
                      </>
                    )}
                  </button>
                  <span className="text-sm text-gray-500">
                    ICO, PNG (Max: 1MB, Önerilen: 32x32px)
                  </span>
                </div>

                {/* Favicon URL Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    {t('admin.settings.orFaviconUrl', 'Veya Favicon URL\'si Girin')}
                  </label>
                  <input
                    type="url"
                    value={settings.favicon_url}
                    onChange={(e) => handleInputChange('favicon_url', e.target.value)}
                    placeholder="https://example.com/favicon.ico"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Logo Kullanım Bilgileri */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-blue-800 mb-2">💡 {t('admin.settings.logoTips', 'Logo Kullanım İpuçları')}</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>{t('admin.settings.logoTip1', '• Ana logo için şeffaf arka planlı PNG formatı önerilir')}</li>
                <li>{t('admin.settings.logoTip2', '• Logo boyutu 200x60px civarında olmalıdır')}</li>
                <li>{t('admin.settings.logoTip3', '• Favicon için 32x32px veya 16x16px boyutları idealdir')}</li>
                <li>{t('admin.settings.logoTip4', '• Yüklenen logolar otomatik olarak kaydedilir')}</li>
                <li>{t('admin.settings.logoTip5', '• Logo değişiklikleri site genelinde anında yansır')}</li>
              </ul>
            </div>
          </div>
        </div>

        {/* SEO Ayarları */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-primary mb-4">
            {t('admin.seo.title', 'SEO Ayarları')}
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('admin.label.metaTitle', 'Meta Başlık')}
              </label>
              <input
                type="text"
                value={settings.meta_title}
                onChange={(e) => handleInputChange('meta_title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('admin.label.metaDescription', 'Meta Açıklama')}
              </label>
              <textarea
                value={settings.meta_description}
                onChange={(e) => handleInputChange('meta_description', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('admin.label.googleAnalyticsId', 'Google Analytics ID')}
              </label>
              <input
                type="text"
                value={settings.google_analytics_id}
                onChange={(e) => handleInputChange('google_analytics_id', e.target.value)}
                placeholder="G-XXXXXXXXXX"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
