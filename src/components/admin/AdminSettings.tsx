import { useState, useEffect } from 'react';
import { FaSave, FaGlobe, FaPhone, FaEnvelope, FaMapMarkerAlt, FaClock, FaExternalLinkAlt } from 'react-icons/fa';
import { supabaseNew as supabase } from '../../lib/supabase-new';

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
  updated_at?: string;
}

const AdminSettings = () => {
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
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

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

      alert('Ayarlar başarıyla kaydedildi!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Ayarlar kaydedilirken hata oluştu!');
    } finally {
      setSaving(false);
    }
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
        <h1 className="text-2xl font-semibold text-primary">Site Ayarları</h1>
        <button
          onClick={saveSettings}
          disabled={saving}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors flex items-center disabled:opacity-50"
        >
          <FaSave className="mr-2" />
          {saving ? 'Kaydediliyor...' : 'Kaydet'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Genel Bilgiler */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-primary mb-4 flex items-center">
            <FaGlobe className="mr-2" />
            Genel Bilgiler
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Site Adı
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
                Site Açıklaması
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
                Anahtar Kelimeler
              </label>
              <input
                type="text"
                value={settings.site_keywords}
                onChange={(e) => handleInputChange('site_keywords', e.target.value)}
                placeholder="virgülle ayırın"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* İletişim Bilgileri */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-primary mb-4 flex items-center">
            <FaPhone className="mr-2" />
            İletişim Bilgileri
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Telefon
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
                E-posta
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
                Adres
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
                Acil Telefon
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
                Çalışma Saatleri
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

        {/* Randevu Sistemi */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-primary mb-4 flex items-center">
            <FaExternalLinkAlt className="mr-2" />
            Randevu Sistemi
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Randevu URL'si
              </label>
              <input
                type="url"
                value={settings.appointment_url}
                onChange={(e) => handleInputChange('appointment_url', e.target.value)}
                placeholder="https://anadoluhastaneleri.kendineiyibak.app/"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <p className="text-sm text-gray-500 mt-1">
                Randevu Al butonuna tıklandığında açılacak sayfa
              </p>
            </div>
          </div>
        </div>

        {/* SEO Ayarları */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-primary mb-4">
            SEO Ayarları
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Meta Başlık
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
                Meta Açıklama
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
                Google Analytics ID
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
