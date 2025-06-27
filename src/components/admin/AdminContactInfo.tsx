import { useState, useEffect } from 'react';
import { FaSave, FaPhone, FaEnvelope, FaMapMarkerAlt, FaClock, FaWhatsapp, FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';
import { supabaseNew as supabase } from '../../lib/supabase-new';

interface ContactInfo {
  id?: number;
  main_phone: string;
  emergency_phone: string;
  email: string;
  address: string;
  working_hours: string;
  emergency_hours: string;
  whatsapp: string;
  facebook: string;
  twitter: string;
  instagram: string;
  linkedin: string;
  google_maps_embed: string;
  updated_at?: string;
}

const AdminContactInfo = () => {
  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    main_phone: '+90 212 123 45 67',
    emergency_phone: '+90 212 123 45 68',
    email: 'info@anadoluhastaneleri.com',
    address: 'Merkez Mah. Sağlık Cad. No:123\nŞişli/İstanbul',
    working_hours: 'Pazartesi - Cuma: 08:00 - 18:00\nCumartesi: 09:00 - 17:00\nPazar: 10:00 - 16:00',
    emergency_hours: '7/24 Acil Servis',
    whatsapp: '+90 212 123 45 69',
    facebook: 'https://facebook.com/anadoluhastaneleri',
    twitter: 'https://twitter.com/anadoluhastane',
    instagram: 'https://instagram.com/anadoluhastaneleri',
    linkedin: 'https://linkedin.com/company/anadolu-hastaneleri',
    google_maps_embed: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchContactInfo();
  }, []);

  const fetchContactInfo = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('contact_info')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setContactInfo(data);
      }
    } catch (error) {
      console.error('Error fetching contact info:', error);
      // Keep default values if fetch fails
    } finally {
      setLoading(false);
    }
  };

  const saveContactInfo = async () => {
    try {
      setSaving(true);
      
      const contactData = {
        ...contactInfo,
        updated_at: new Date().toISOString(),
      };

      if (contactInfo.id) {
        // Update existing
        const { error } = await supabase
          .from('contact_info')
          .update(contactData)
          .eq('id', contactInfo.id);

        if (error) throw error;
      } else {
        // Insert new
        const { data, error } = await supabase
          .from('contact_info')
          .insert([contactData])
          .select()
          .single();

        if (error) throw error;
        setContactInfo(data);
      }

      alert('İletişim bilgileri başarıyla kaydedildi!');
    } catch (error) {
      console.error('Error saving contact info:', error);
      alert('İletişim bilgileri kaydedilirken hata oluştu!');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof ContactInfo, value: string) => {
    setContactInfo(prev => ({
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
        <h1 className="text-2xl font-semibold text-primary">İletişim Bilgileri</h1>
        <button
          onClick={saveContactInfo}
          disabled={saving}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors flex items-center disabled:opacity-50"
        >
          <FaSave className="mr-2" />
          {saving ? 'Kaydediliyor...' : 'Kaydet'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Temel İletişim Bilgileri */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-primary mb-4 flex items-center">
            <FaPhone className="mr-2" />
            Temel İletişim
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ana Telefon
              </label>
              <input
                type="text"
                value={contactInfo.main_phone}
                onChange={(e) => handleInputChange('main_phone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Acil Telefon
              </label>
              <input
                type="text"
                value={contactInfo.emergency_phone}
                onChange={(e) => handleInputChange('emergency_phone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                E-posta
              </label>
              <input
                type="email"
                value={contactInfo.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                WhatsApp
              </label>
              <input
                type="text"
                value={contactInfo.whatsapp}
                onChange={(e) => handleInputChange('whatsapp', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Adres ve Çalışma Saatleri */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-primary mb-4 flex items-center">
            <FaMapMarkerAlt className="mr-2" />
            Adres ve Saatler
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Adres
              </label>
              <textarea
                value={contactInfo.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Çalışma Saatleri
              </label>
              <textarea
                value={contactInfo.working_hours}
                onChange={(e) => handleInputChange('working_hours', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Acil Servis Saatleri
              </label>
              <input
                type="text"
                value={contactInfo.emergency_hours}
                onChange={(e) => handleInputChange('emergency_hours', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Sosyal Medya */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-primary mb-4">
            Sosyal Medya
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <FaFacebook className="mr-2 text-blue-600" />
                Facebook
              </label>
              <input
                type="url"
                value={contactInfo.facebook}
                onChange={(e) => handleInputChange('facebook', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <FaTwitter className="mr-2 text-blue-400" />
                Twitter
              </label>
              <input
                type="url"
                value={contactInfo.twitter}
                onChange={(e) => handleInputChange('twitter', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <FaInstagram className="mr-2 text-pink-500" />
                Instagram
              </label>
              <input
                type="url"
                value={contactInfo.instagram}
                onChange={(e) => handleInputChange('instagram', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <FaLinkedin className="mr-2 text-blue-700" />
                LinkedIn
              </label>
              <input
                type="url"
                value={contactInfo.linkedin}
                onChange={(e) => handleInputChange('linkedin', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Google Maps */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-primary mb-4">
            Google Maps
          </h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Google Maps Embed Kodu
            </label>
            <textarea
              value={contactInfo.google_maps_embed}
              onChange={(e) => handleInputChange('google_maps_embed', e.target.value)}
              rows={4}
              placeholder='<iframe src="https://www.google.com/maps/embed?..." width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy"></iframe>'
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <p className="text-sm text-gray-500 mt-1">
              Google Maps'ten "Embed a map" seçeneğini kullanarak iframe kodunu buraya yapıştırın.
            </p>
          </div>
        </div>
      </div>

      {/* Preview */}
      <div className="mt-8 bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Önizleme</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-sm">
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Telefon Bilgileri</h4>
            <p className="text-gray-600">Ana: {contactInfo.main_phone}</p>
            <p className="text-gray-600">Acil: {contactInfo.emergency_phone}</p>
            <p className="text-gray-600">WhatsApp: {contactInfo.whatsapp}</p>
          </div>
          <div>
            <h4 className="font-medium text-gray-700 mb-2">İletişim</h4>
            <p className="text-gray-600">{contactInfo.email}</p>
            <p className="text-gray-600 whitespace-pre-line">{contactInfo.address}</p>
          </div>
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Çalışma Saatleri</h4>
            <p className="text-gray-600 whitespace-pre-line">{contactInfo.working_hours}</p>
            <p className="text-gray-600">Acil: {contactInfo.emergency_hours}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminContactInfo;
