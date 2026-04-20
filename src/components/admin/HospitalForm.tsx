import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaArrowLeft, FaSave, FaUpload, FaTimes, FaGlobe, FaSearch, FaMapMarkedAlt, FaCheckCircle, FaEye } from 'react-icons/fa';
import { createHospital, updateHospital, uploadHospitalImage, getHospitals } from '../../services/hospitalService';
import type { Hospital } from '../../lib/supabase';

const HospitalForm: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const isEdit = !!id;

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(isEdit);
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'basic' | 'content' | 'seo'>('basic');

    const [formData, setFormData] = useState<Omit<Hospital, 'id' | 'created_at'>>({
        name: '',
        slug: '',
        description: '',
        address: '',
        phone: '',
        email: '',
        working_hours: '',
        emergency_hours: '',
        images: [],
        display_on_homepage: true,
        display_order: 0,
        meta_title: '',
        meta_description: '',
        hero_title: '',
        hero_subtitle: '',
        map_url: '',
        is_published: true
    });

    useEffect(() => {
        if (isEdit) {
            loadHospital();
        }
    }, [id]);

    const loadHospital = async () => {
        try {
            setFetching(true);
            const allHospitals = await getHospitals();
            const hospital = allHospitals.find(h => h.id === parseInt(id!));

            if (hospital) {
                const { id: _, created_at: __, ...rest } = hospital;
                setFormData({
                    ...rest,
                    meta_title: rest.meta_title || '',
                    meta_description: rest.meta_description || '',
                    hero_title: rest.hero_title || '',
                    hero_subtitle: rest.hero_subtitle || '',
                    map_url: rest.map_url || '',
                    is_published: rest.is_published ?? true
                });
            } else {
                alert('Hastane bulunamadı!');
                navigate('/admin/hospitals');
            }
        } catch (error) {
            console.error('Error loading hospital:', error);
            alert('Hastane yüklenirken hata oluştu!');
        } finally {
            setFetching(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;

        setFormData(prev => ({
            ...prev,
            [name]: val
        }));

        if (name === 'name' && !isEdit) {
            const slug = value.toLowerCase()
                .replace(/[^a-z0-9ğüşıöç\s]/g, '')
                .replace(/\s+/g, '-');
            setFormData(prev => ({ ...prev, slug, meta_title: value + ' | Anadolu Hastaneleri Group' }));
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        try {
            setUploading(true);
            setUploadError(null);
            const file = e.target.files[0];
            const { url, error } = await uploadHospitalImage(file);

            if (error) throw error;
            if (url) {
                setFormData(prev => ({
                    ...prev,
                    images: [...prev.images, url]
                }));
            }
        } catch (error: any) {
            console.error('Error uploading image:', error);
            setUploadError(error.message || 'Resim yüklenirken hata oluştu!');
        } finally {
            setUploading(false);
        }
    };

    const removeImage = (index: number) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_: string, i: number) => i !== index)
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true);
            const { error } = isEdit
                ? await updateHospital(parseInt(id!), formData)
                : await createHospital(formData);

            if (error) throw error;

            alert(isEdit ? 'Hastane başarıyla güncellendi!' : 'Hastane başarıyla eklendi!');
            navigate('/admin/hospitals');
        } catch (error: any) {
            console.error('Error saving hospital:', error);
            alert(error.message || 'Hastane kaydedilirken hata oluştu!');
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto pb-12">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-4">
                    <button
                        onClick={() => navigate('/admin/hospitals')}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <FaArrowLeft className="text-gray-600" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-primary">
                            {isEdit ? 'Hastane Düzenle' : 'Yeni Hastane Ekle'}
                        </h1>
                        <p className="text-sm text-gray-500">{formData.name || 'Yeni Şube'}</p>
                    </div>
                </div>
                <div className="flex items-center space-x-3">
                    <div className="flex items-center mr-4">
                        <span className={`w-3 h-3 rounded-full mr-2 ${formData.is_published ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                        <span className="text-sm font-medium text-gray-600">{formData.is_published ? 'Yayında' : 'Taslak'}</span>
                    </div>
                    <button
                        onClick={handleSubmit}
                        disabled={loading || uploading}
                        className="px-8 py-2.5 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors flex items-center shadow-lg shadow-primary/20 disabled:opacity-50"
                    >
                        {loading ? <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white mr-2"></div> : <FaSave className="mr-2" />}
                        {isEdit ? 'Güncelle' : 'Kaydet'}
                    </button>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-xl">
                <button
                    onClick={() => setActiveTab('basic')}
                    className={`flex-1 flex items-center justify-center py-2.5 text-sm font-medium rounded-lg transition-all ${activeTab === 'basic' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    <FaCheckCircle className="mr-2" /> Genel Bilgiler
                </button>
                <button
                    onClick={() => setActiveTab('content')}
                    className={`flex-1 flex items-center justify-center py-2.5 text-sm font-medium rounded-lg transition-all ${activeTab === 'content' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    <FaEye className="mr-2" /> Sayfa İçeriği
                </button>
                <button
                    onClick={() => setActiveTab('seo')}
                    className={`flex-1 flex items-center justify-center py-2.5 text-sm font-medium rounded-lg transition-all ${activeTab === 'seo' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    <FaGlobe className="mr-2" /> SEO Ayarları
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {activeTab === 'basic' && (
                    <div className="animate-fadeIn space-y-6">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-6 border-b border-gray-100">
                                <h2 className="text-lg font-semibold text-gray-900">Temel Kimlik</h2>
                            </div>
                            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="col-span-1">
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Hastane Adı</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary outline-none transition-all"
                                        required
                                    />
                                </div>
                                <div className="col-span-1">
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">URL Slug</label>
                                    <input
                                        type="text"
                                        name="slug"
                                        value={formData.slug}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary outline-none transition-all bg-gray-50"
                                        required
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Kısa Açıklama (Liste görünümü için)</label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        rows={3}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary outline-none transition-all resize-none"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-6 border-b border-gray-100">
                                <h2 className="text-lg font-semibold text-gray-900">İletişim Detayları</h2>
                            </div>
                            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="col-span-2">
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Adres/Konum</label>
                                    <input
                                        type="text"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary outline-none transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Telefon</label>
                                    <input
                                        type="text"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary outline-none transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">E-posta</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary outline-none transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Mesai Saatleri</label>
                                    <input
                                        type="text"
                                        name="working_hours"
                                        value={formData.working_hours}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary outline-none transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Acil Servis</label>
                                    <input
                                        type="text"
                                        name="emergency_hours"
                                        value={formData.emergency_hours}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary outline-none transition-all"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'content' && (
                    <div className="animate-fadeIn space-y-6">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-6 border-b border-gray-100">
                                <h2 className="text-lg font-semibold text-gray-900">Banner & Başlıklar</h2>
                            </div>
                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Hero Başlık</label>
                                    <input
                                        type="text"
                                        name="hero_title"
                                        value={formData.hero_title}
                                        onChange={handleInputChange}
                                        placeholder={formData.name}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary outline-none transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Hero Alt Başlık</label>
                                    <textarea
                                        name="hero_subtitle"
                                        value={formData.hero_subtitle}
                                        onChange={handleInputChange}
                                        rows={2}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary outline-none transition-all resize-none"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-6 border-b border-gray-100">
                                <h2 className="text-lg font-semibold text-gray-900">Konum Haritası</h2>
                            </div>
                            <div className="p-6">
                                <label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center">
                                    <FaMapMarkedAlt className="mr-2 text-primary" /> Google Maps Embed URL (İsteğe Bağlı)
                                </label>
                                <input
                                    type="text"
                                    name="map_url"
                                    value={formData.map_url}
                                    onChange={handleInputChange}
                                    placeholder="https://www.google.com/maps/embed?..."
                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary outline-none transition-all mb-4"
                                />
                                {formData.map_url && (
                                    <div className="aspect-video rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                                        <iframe
                                            src={formData.map_url}
                                            className="w-full h-full border-0"
                                            allowFullScreen={false}
                                            loading="lazy"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-6 border-b border-gray-100">
                                <h2 className="text-lg font-semibold text-gray-900">Galeri & Resimler</h2>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {formData.images.map((img: string, index: number) => (
                                        <div key={index} className="relative aspect-video rounded-lg overflow-hidden border border-gray-200 group">
                                            <img src={img} alt="Hospital" className="w-full h-full object-cover" />
                                            <button
                                                type="button"
                                                onClick={() => removeImage(index)}
                                                className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                            >
                                                <FaTimes size={12} />
                                            </button>
                                        </div>
                                    ))}
                                    <label className={`relative aspect-video rounded-lg border-2 border-dashed flex flex-col items-center justify-center transition-colors ${uploading ? 'border-primary bg-gray-50' : 'border-gray-200 hover:border-primary hover:bg-slate-50 cursor-pointer'}`}>
                                        {uploading ? (
                                            <div className="flex flex-col items-center">
                                                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary mb-2"></div>
                                                <span className="text-[10px] text-gray-400">Yükleniyor...</span>
                                            </div>
                                        ) : (
                                            <>
                                                <FaUpload className="text-gray-400 text-2xl mb-2" />
                                                <span className="text-xs font-semibold text-gray-500">Görsel Ekle</span>
                                            </>
                                        )}
                                        <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
                                    </label>
                                    {uploadError && (
                                        <div className="col-span-full p-4 bg-red-50 border border-red-100 rounded-xl flex items-center text-red-600 text-sm mb-4">
                                            <FaTimes className="mr-3" /> {uploadError}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'seo' && (
                    <div className="animate-fadeIn space-y-6">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-6 border-b border-gray-100">
                                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                                    <FaSearch className="mr-2 text-primary" /> Arama Motoru Optimizasyonu (SEO)
                                </h2>
                            </div>
                            <div className="p-6 space-y-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">SEO Başlığı (Sayfa Başlığı)</label>
                                    <input
                                        type="text"
                                        name="meta_title"
                                        value={formData.meta_title}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary outline-none transition-all"
                                    />
                                    <p className="text-[10px] text-gray-400 mt-1">Önerilen uzunluk: 50-60 karakter</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">SEO Açıklaması (Meta Description)</label>
                                    <textarea
                                        name="meta_description"
                                        value={formData.meta_description}
                                        onChange={handleInputChange}
                                        rows={4}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary outline-none transition-all resize-none"
                                    />
                                    <p className="text-[10px] text-gray-400 mt-1">Önerilen uzunluk: 150-160 karakter</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-semibold text-gray-800">Yayın Durumu</h3>
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id="is_published"
                                        name="is_published"
                                        checked={formData.is_published}
                                        onChange={handleInputChange}
                                        className="w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary"
                                    />
                                    <label htmlFor="is_published" className="text-sm font-bold text-gray-700">Yayınla</label>
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <h3 className="font-semibold text-gray-800">Ana Sayfada Göster</h3>
                                <div className="flex items-center space-x-4">
                                    <input
                                        type="checkbox"
                                        id="display_on_homepage"
                                        name="display_on_homepage"
                                        checked={formData.display_on_homepage}
                                        onChange={handleInputChange}
                                        className="w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary"
                                    />
                                    <div className="flex items-center space-x-2">
                                        <span className="text-xs text-gray-500">Sıra:</span>
                                        <input
                                            type="number"
                                            name="display_order"
                                            value={formData.display_order}
                                            onChange={handleInputChange}
                                            className="w-16 px-2 py-1 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </form>
        </div>
    );
};

export default HospitalForm;
