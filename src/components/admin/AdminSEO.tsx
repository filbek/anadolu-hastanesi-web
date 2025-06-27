import { useState, useEffect } from 'react';
import { FaSave, FaGlobe, FaSearch, FaCode, FaChartLine } from 'react-icons/fa';
import { supabaseNew as supabase } from '../../lib/supabase-new';

interface SEOSettings {
  id?: number;
  site_title: string;
  site_description: string;
  site_keywords: string;
  og_title: string;
  og_description: string;
  og_image: string;
  twitter_title: string;
  twitter_description: string;
  twitter_image: string;
  google_analytics_id: string;
  google_search_console: string;
  robots_txt: string;
  sitemap_url: string;
  canonical_url: string;
  updated_at?: string;
}

const AdminSEO = () => {
  const [seoSettings, setSeoSettings] = useState<SEOSettings>({
    site_title: 'Anadolu Hastaneleri Grubu - Sağlığınız Bizim Önceliğimiz',
    site_description: 'Modern tıbbi teknolojiler ve uzman kadrosuyla hizmet veren öncü sağlık kuruluşu. Randevu almak için hemen iletişime geçin.',
    site_keywords: 'hastane, sağlık, doktor, randevu, tıbbi, Anadolu, sağlık hizmetleri, kardiyoloji, nöroloji, ortopedi',
    og_title: 'Anadolu Hastaneleri Grubu - Sağlığınız Bizim Önceliğimiz',
    og_description: 'Modern tıbbi teknolojiler ve uzman kadrosuyla hizmet veren öncü sağlık kuruluşu.',
    og_image: 'https://anadoluhastaneleri.com/og-image.jpg',
    twitter_title: 'Anadolu Hastaneleri Grubu',
    twitter_description: 'Sağlığınız için en iyi hizmet, en son teknoloji ve uzman kadro.',
    twitter_image: 'https://anadoluhastaneleri.com/twitter-image.jpg',
    google_analytics_id: '',
    google_search_console: '',
    robots_txt: 'User-agent: *\nAllow: /\nSitemap: https://anadoluhastaneleri.com/sitemap.xml',
    sitemap_url: 'https://anadoluhastaneleri.com/sitemap.xml',
    canonical_url: 'https://anadoluhastaneleri.com'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  useEffect(() => {
    fetchSEOSettings();
  }, []);

  const fetchSEOSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('seo_settings')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setSeoSettings(data);
      }
    } catch (error) {
      console.error('Error fetching SEO settings:', error);
      // Keep default values if fetch fails
    } finally {
      setLoading(false);
    }
  };

  const saveSEOSettings = async () => {
    try {
      setSaving(true);
      
      const seoData = {
        ...seoSettings,
        updated_at: new Date().toISOString(),
      };

      if (seoSettings.id) {
        // Update existing
        const { error } = await supabase
          .from('seo_settings')
          .update(seoData)
          .eq('id', seoSettings.id);

        if (error) throw error;
      } else {
        // Insert new
        const { data, error } = await supabase
          .from('seo_settings')
          .insert([seoData])
          .select()
          .single();

        if (error) throw error;
        setSeoSettings(data);
      }

      alert('SEO ayarları başarıyla kaydedildi!');
    } catch (error) {
      console.error('Error saving SEO settings:', error);
      alert('SEO ayarları kaydedilirken hata oluştu!');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof SEOSettings, value: string) => {
    setSeoSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const tabs = [
    { id: 'general', label: 'Genel SEO', icon: FaGlobe },
    { id: 'social', label: 'Sosyal Medya', icon: FaSearch },
    { id: 'analytics', label: 'Analytics', icon: FaChartLine },
    { id: 'technical', label: 'Teknik SEO', icon: FaCode }
  ];

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
        <h1 className="text-2xl font-semibold text-primary">SEO Ayarları</h1>
        <button
          onClick={saveSEOSettings}
          disabled={saving}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors flex items-center disabled:opacity-50"
        >
          <FaSave className="mr-2" />
          {saving ? 'Kaydediliyor...' : 'Kaydet'}
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="mr-2" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Site Başlığı (Title)
                </label>
                <input
                  type="text"
                  value={seoSettings.site_title}
                  onChange={(e) => handleInputChange('site_title', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Önerilen uzunluk: 50-60 karakter
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Site Açıklaması (Meta Description)
                </label>
                <textarea
                  value={seoSettings.site_description}
                  onChange={(e) => handleInputChange('site_description', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Önerilen uzunluk: 150-160 karakter
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Anahtar Kelimeler (Keywords)
                </label>
                <textarea
                  value={seoSettings.site_keywords}
                  onChange={(e) => handleInputChange('site_keywords', e.target.value)}
                  rows={3}
                  placeholder="virgülle ayırın"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Canonical URL
                </label>
                <input
                  type="url"
                  value={seoSettings.canonical_url}
                  onChange={(e) => handleInputChange('canonical_url', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>
          )}

          {activeTab === 'social' && (
            <div className="space-y-6">
              <div className="border-b border-gray-200 pb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Open Graph (Facebook)</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      OG Başlık
                    </label>
                    <input
                      type="text"
                      value={seoSettings.og_title}
                      onChange={(e) => handleInputChange('og_title', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      OG Açıklama
                    </label>
                    <textarea
                      value={seoSettings.og_description}
                      onChange={(e) => handleInputChange('og_description', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      OG Resim URL
                    </label>
                    <input
                      type="url"
                      value={seoSettings.og_image}
                      onChange={(e) => handleInputChange('og_image', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Önerilen boyut: 1200x630 piksel
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Twitter Cards</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Twitter Başlık
                    </label>
                    <input
                      type="text"
                      value={seoSettings.twitter_title}
                      onChange={(e) => handleInputChange('twitter_title', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Twitter Açıklama
                    </label>
                    <textarea
                      value={seoSettings.twitter_description}
                      onChange={(e) => handleInputChange('twitter_description', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Twitter Resim URL
                    </label>
                    <input
                      type="url"
                      value={seoSettings.twitter_image}
                      onChange={(e) => handleInputChange('twitter_image', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Google Analytics ID
                </label>
                <input
                  type="text"
                  value={seoSettings.google_analytics_id}
                  onChange={(e) => handleInputChange('google_analytics_id', e.target.value)}
                  placeholder="G-XXXXXXXXXX"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Google Analytics 4 ölçüm kimliği
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Google Search Console Doğrulama Kodu
                </label>
                <input
                  type="text"
                  value={seoSettings.google_search_console}
                  onChange={(e) => handleInputChange('google_search_console', e.target.value)}
                  placeholder="google-site-verification=..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>
          )}

          {activeTab === 'technical' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Robots.txt İçeriği
                </label>
                <textarea
                  value={seoSettings.robots_txt}
                  onChange={(e) => handleInputChange('robots_txt', e.target.value)}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-mono text-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sitemap URL
                </label>
                <input
                  type="url"
                  value={seoSettings.sitemap_url}
                  onChange={(e) => handleInputChange('sitemap_url', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* SEO Preview */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Google Arama Sonucu Önizlemesi</h3>
        <div className="bg-white p-4 rounded border max-w-2xl">
          <div className="text-blue-600 text-lg hover:underline cursor-pointer">
            {seoSettings.site_title}
          </div>
          <div className="text-green-700 text-sm">
            {seoSettings.canonical_url}
          </div>
          <div className="text-gray-600 text-sm mt-1">
            {seoSettings.site_description}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSEO;
