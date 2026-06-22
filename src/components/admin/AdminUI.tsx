import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FaSave, FaPalette, FaFont, FaDesktop, FaMobile, FaTablet } from 'react-icons/fa';

interface UITheme {
  id?: number;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  font_family: string;
  heading_font: string;
  body_font: string;
  border_radius: string;
  button_style: string;
  card_style: string;
  updated_at?: string;
}

const AdminUI = () => {
  const { t } = useTranslation();
  const [theme, setTheme] = useState<UITheme>({
    primary_color: '#1e40af',
    secondary_color: '#3b82f6',
    accent_color: '#ef4444',
    font_family: 'Inter',
    heading_font: 'Inter',
    body_font: 'Inter',
    border_radius: 'medium',
    button_style: 'rounded',
    card_style: 'shadow'
  });
  const [saving, setSaving] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  const saveTheme = async () => {
    try {
      setSaving(true);
      // In a real app, save to database
      // For now, save to localStorage for immediate preview
      localStorage.setItem('ui_theme', JSON.stringify(theme));
      alert(t('admin.ui.saved', 'Tema ayarları kaydedildi!'));
    } catch (error) {
      console.error('Error saving theme:', error);
      alert(t('admin.ui.saveError', 'Tema kaydedilirken hata oluştu!'));
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof UITheme, value: string) => {
    setTheme(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const colorOptions = [
    { name: t('admin.ui.colorPrimary', 'Ana Renk'), field: 'primary_color' as keyof UITheme },
    { name: t('admin.ui.colorSecondary', 'İkincil Renk'), field: 'secondary_color' as keyof UITheme },
    { name: t('admin.ui.colorAccent', 'Vurgu Rengi'), field: 'accent_color' as keyof UITheme }
  ];

  const fontOptions = [
    'Inter',
    'Roboto',
    'Open Sans',
    'Poppins',
    'Nunito',
    'Lato',
    'Montserrat',
    'Raleway'
  ];

  const borderRadiusOptions = [
    { value: 'none', label: t('admin.ui.radiusNone', 'Köşeler Düz') },
    { value: 'small', label: t('admin.ui.radiusSmall', 'Hafif Yuvarlak') },
    { value: 'medium', label: t('admin.ui.radiusMedium', 'Orta Yuvarlak') },
    { value: 'large', label: t('admin.ui.radiusLarge', 'Çok Yuvarlak') }
  ];

  const buttonStyleOptions = [
    { value: 'rounded', label: t('admin.ui.btnRounded', 'Yuvarlak Kenarlar') },
    { value: 'pill', label: t('admin.ui.btnPill', 'Hap Şekli') },
    { value: 'square', label: t('admin.ui.btnSquare', 'Düz Kenarlar') }
  ];

  const cardStyleOptions = [
    { value: 'shadow', label: t('admin.ui.cardShadow', 'Gölge Efekti') },
    { value: 'border', label: t('admin.ui.cardBorder', 'Kenarlık') },
    { value: 'flat', label: t('admin.ui.cardFlat', 'Düz Tasarım') }
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-primary">{t('admin.ui.title', 'UI / Tema Yönetimi')}</h1>
        <button
          onClick={saveTheme}
          disabled={saving}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors flex items-center disabled:opacity-50"
        >
          <FaSave className="mr-2" />
          {saving ? t('admin.saving', 'Kaydediliyor...') : t('admin.save', 'Kaydet')}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Renk Ayarları */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-primary mb-4 flex items-center">
            <FaPalette className="mr-2" />
            {t('admin.ui.colors', 'Renk Ayarları')}
          </h2>

          <div className="space-y-4">
            {colorOptions.map((color) => (
              <div key={color.field}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {color.name}
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={theme[color.field]}
                    onChange={(e) => handleInputChange(color.field, e.target.value)}
                    className="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer"
                  />
                  <input
                    type="text"
                    value={theme[color.field]}
                    onChange={(e) => handleInputChange(color.field, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="#1e40af"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Font Ayarları */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-primary mb-4 flex items-center">
            <FaFont className="mr-2" />
            {t('admin.ui.fonts', 'Font Ayarları')}
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('admin.ui.headingFont', 'Başlık Fontu')}
              </label>
              <select
                value={theme.heading_font}
                onChange={(e) => handleInputChange('heading_font', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                {fontOptions.map(font => (
                  <option key={font} value={font}>{font}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('admin.ui.bodyFont', 'Gövde Fontu')}
              </label>
              <select
                value={theme.body_font}
                onChange={(e) => handleInputChange('body_font', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                {fontOptions.map(font => (
                  <option key={font} value={font}>{font}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Stil Ayarları */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-primary mb-4 flex items-center">
            <FaDesktop className="mr-2" />
            {t('admin.ui.styles', 'Stil Ayarları')}
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('admin.ui.borderRadius', 'Köşe Yuvarlaklığı')}
              </label>
              <select
                value={theme.border_radius}
                onChange={(e) => handleInputChange('border_radius', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                {borderRadiusOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('admin.ui.buttonStyle', 'Buton Stili')}
              </label>
              <select
                value={theme.button_style}
                onChange={(e) => handleInputChange('button_style', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                {buttonStyleOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('admin.ui.cardStyle', 'Kart Stili')}
              </label>
              <select
                value={theme.card_style}
                onChange={(e) => handleInputChange('card_style', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                {cardStyleOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Önizleme */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-primary mb-4">{t('admin.ui.preview', 'Önizleme')}</h2>

          {/* Device Toggle */}
          <div className="flex justify-center space-x-2 mb-4">
            <button
              onClick={() => setPreviewDevice('desktop')}
              className={`p-2 rounded-lg ${previewDevice === 'desktop' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'}`}
            >
              <FaDesktop />
            </button>
            <button
              onClick={() => setPreviewDevice('tablet')}
              className={`p-2 rounded-lg ${previewDevice === 'tablet' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'}`}
            >
              <FaTablet />
            </button>
            <button
              onClick={() => setPreviewDevice('mobile')}
              className={`p-2 rounded-lg ${previewDevice === 'mobile' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'}`}
            >
              <FaMobile />
            </button>
          </div>

          {/* Preview Container */}
          <div className={`mx-auto border border-gray-200 rounded-lg overflow-hidden ${previewDevice === 'desktop' ? 'max-w-full' : previewDevice === 'tablet' ? 'max-w-md' : 'max-w-xs'
            }`}>
            {/* Mock Navbar */}
            <div className="px-4 py-3" style={{ backgroundColor: theme.primary_color }}>
              <div className="flex items-center justify-between">
                <span className="text-white font-bold text-lg">Logo</span>
                <div className="flex space-x-2">
                  <div className="w-4 h-4 bg-white/20 rounded"></div>
                  <div className="w-4 h-4 bg-white/20 rounded"></div>
                  <div className="w-4 h-4 bg-white/20 rounded"></div>
                </div>
              </div>
            </div>

            {/* Mock Hero */}
            <div className="px-4 py-8 text-center" style={{ backgroundColor: theme.secondary_color + '20' }}>
              <h1 style={{ fontFamily: theme.heading_font, color: theme.primary_color }} className="text-xl font-bold mb-2">
                {t('admin.ui.sampleHeading', 'Örnek Başlık')}
              </h1>
              <p style={{ fontFamily: theme.body_font }} className="text-gray-600 text-sm mb-4">
                {t('admin.ui.sampleText', 'Bu bir örnek metindir.')}
              </p>
              <button
                className={`px-4 py-2 text-white text-sm ${theme.button_style === 'pill' ? 'rounded-full' : theme.button_style === 'square' ? 'rounded-none' : 'rounded-lg'
                  }`}
                style={{ backgroundColor: theme.accent_color }}
              >
                {t('admin.ui.sampleButton', 'Buton')}
              </button>
            </div>

            {/* Mock Cards */}
            <div className="p-4 grid grid-cols-2 gap-3">
              {[1, 2].map(i => (
                <div
                  key={i}
                  className={`p-3 bg-white ${theme.card_style === 'shadow' ? 'shadow-md' : theme.card_style === 'border' ? 'border border-gray-200' : ''}`}
                  style={{ borderRadius: theme.border_radius === 'none' ? '0' : theme.border_radius === 'small' ? '4px' : theme.border_radius === 'medium' ? '8px' : '16px' }}
                >
                  <div className="w-full h-16 bg-gray-200 rounded mb-2"></div>
                  <h3 className="font-semibold text-sm">{t('admin.ui.sampleCard', 'Kart')}</h3>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminUI;
