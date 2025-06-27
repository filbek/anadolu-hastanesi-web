import { useState, useEffect } from 'react';
import { FaSave, FaInfoCircle, FaHistory, FaEye, FaAward } from 'react-icons/fa';
import { supabaseNew as supabase } from '../../lib/supabase-new';

interface AboutContent {
  id?: number;
  mission: string;
  vision: string;
  values: string;
  history: string;
  achievements: string;
  team_info: string;
  facilities: string;
  certifications: string;
  updated_at?: string;
}

const AdminAbout = () => {
  const [aboutContent, setAboutContent] = useState<AboutContent>({
    mission: 'Hastalarımıza en kaliteli sağlık hizmetini sunmak, modern tıbbi teknolojiler ve uzman kadromuzla toplum sağlığına katkıda bulunmak.',
    vision: '2030 yılına kadar Türkiye\'nin önde gelen sağlık kuruluşlarından biri olmak ve uluslararası standartlarda hizmet vermek.',
    values: 'İnsan odaklılık\nKalite ve güvenlik\nSürekli gelişim\nEtik değerler\nTakım çalışması\nHastane memnuniyeti',
    history: '1995 yılında kurulan Anadolu Hastaneleri Grubu, 25 yılı aşkın deneyimi ile sağlık sektöründe öncü konumundadır. İlk gününden bu yana hasta memnuniyetini ön planda tutarak, modern tıbbi teknolojiler ve uzman kadrosuyla hizmet vermektedir.',
    achievements: '• 500.000+ başarılı tedavi\n• 50+ uzman doktor\n• 24/7 acil servis\n• JCI akreditasyonu\n• ISO 9001 kalite belgesi\n• Hasta memnuniyet oranı %98',
    team_info: 'Deneyimli doktorlarımız, hemşirelerimiz ve sağlık personelimizle oluşan güçlü ekibimiz, hastalarımıza en iyi hizmeti sunmak için 7/24 çalışmaktadır.',
    facilities: '• 200 yatak kapasitesi\n• 8 ameliyathane\n• Yoğun bakım üniteleri\n• Modern görüntüleme cihazları\n• Laboratuvar hizmetleri\n• Fizik tedavi merkezi',
    certifications: '• JCI (Joint Commission International) Akreditasyonu\n• ISO 9001:2015 Kalite Yönetim Sistemi\n• ISO 27001 Bilgi Güvenliği Yönetim Sistemi\n• Sağlık Bakanlığı Yetki Belgesi'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('mission');

  useEffect(() => {
    fetchAboutContent();
  }, []);

  const fetchAboutContent = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('about_content')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setAboutContent(data);
      }
    } catch (error) {
      console.error('Error fetching about content:', error);
      // Keep default values if fetch fails
    } finally {
      setLoading(false);
    }
  };

  const saveAboutContent = async () => {
    try {
      setSaving(true);
      
      const contentData = {
        ...aboutContent,
        updated_at: new Date().toISOString(),
      };

      if (aboutContent.id) {
        // Update existing
        const { error } = await supabase
          .from('about_content')
          .update(contentData)
          .eq('id', aboutContent.id);

        if (error) throw error;
      } else {
        // Insert new
        const { data, error } = await supabase
          .from('about_content')
          .insert([contentData])
          .select()
          .single();

        if (error) throw error;
        setAboutContent(data);
      }

      alert('Hakkımızda içeriği başarıyla kaydedildi!');
    } catch (error) {
      console.error('Error saving about content:', error);
      alert('İçerik kaydedilirken hata oluştu!');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof AboutContent, value: string) => {
    setAboutContent(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const tabs = [
    { id: 'mission', label: 'Misyon & Vizyon', icon: FaInfoCircle },
    { id: 'history', label: 'Tarihçe', icon: FaHistory },
    { id: 'achievements', label: 'Başarılar', icon: FaAward },
    { id: 'facilities', label: 'Olanaklar', icon: FaEye }
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
        <h1 className="text-2xl font-semibold text-primary">Hakkımızda İçerik Yönetimi</h1>
        <button
          onClick={saveAboutContent}
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
          {activeTab === 'mission' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Misyonumuz
                </label>
                <textarea
                  value={aboutContent.mission}
                  onChange={(e) => handleInputChange('mission', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vizyonumuz
                </label>
                <textarea
                  value={aboutContent.vision}
                  onChange={(e) => handleInputChange('vision', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Değerlerimiz
                </label>
                <textarea
                  value={aboutContent.values}
                  onChange={(e) => handleInputChange('values', e.target.value)}
                  rows={6}
                  placeholder="Her satıra bir değer yazın"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tarihçemiz
                </label>
                <textarea
                  value={aboutContent.history}
                  onChange={(e) => handleInputChange('history', e.target.value)}
                  rows={8}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ekip Bilgileri
                </label>
                <textarea
                  value={aboutContent.team_info}
                  onChange={(e) => handleInputChange('team_info', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>
          )}

          {activeTab === 'achievements' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Başarılarımız
                </label>
                <textarea
                  value={aboutContent.achievements}
                  onChange={(e) => handleInputChange('achievements', e.target.value)}
                  rows={8}
                  placeholder="• Her satıra bir başarı yazın"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sertifikalar ve Akreditasyonlar
                </label>
                <textarea
                  value={aboutContent.certifications}
                  onChange={(e) => handleInputChange('certifications', e.target.value)}
                  rows={6}
                  placeholder="• Her satıra bir sertifika yazın"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>
          )}

          {activeTab === 'facilities' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Olanaklarımız
              </label>
              <textarea
                value={aboutContent.facilities}
                onChange={(e) => handleInputChange('facilities', e.target.value)}
                rows={10}
                placeholder="• Her satıra bir olanağı yazın"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          )}
        </div>
      </div>

      {/* Preview */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Önizleme</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Misyon</h4>
            <p className="text-gray-600 mb-4">{aboutContent.mission}</p>
            
            <h4 className="font-medium text-gray-700 mb-2">Vizyon</h4>
            <p className="text-gray-600">{aboutContent.vision}</p>
          </div>
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Değerlerimiz</h4>
            <div className="text-gray-600 whitespace-pre-line">{aboutContent.values}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAbout;
