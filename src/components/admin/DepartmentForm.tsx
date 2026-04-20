import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaArrowLeft, FaSave, FaUpload, FaTimes, FaPlus, FaTrash, FaGlobe, FaSearch, FaEye, FaCheckCircle, FaTools, FaStethoscope } from 'react-icons/fa';
import { createDepartment, updateDepartment, uploadDepartmentImage, getDepartments } from '../../services/departmentService';
import type { Department } from '../../lib/supabase';

const DepartmentForm: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const isEdit = !!id;

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(isEdit);
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'basic' | 'content' | 'seo'>('basic');

    const [formData, setFormData] = useState<Omit<Department, 'id' | 'created_at'>>({
        name: '',
        slug: '',
        description: '',
        category: '',
        icon: 'bi-hospital',
        long_description: '',
        meta_title: '',
        meta_description: '',
        hero_title: '',
        hero_subtitle: '',
        is_published: true,
        display_order: 0,
        images: [],
        treatments: [],
        equipment: []
    });

    useEffect(() => {
        if (isEdit) {
            loadDepartment();
        }
    }, [id]);

    const loadDepartment = async () => {
        try {
            setFetching(true);
            const allDeps = await getDepartments();
            const dept = allDeps.find(d => d.id === parseInt(id!));

            if (dept) {
                const { id: _, created_at: __, ...rest } = dept;
                setFormData({
                    ...rest,
                    long_description: rest.long_description || '',
                    meta_title: rest.meta_title || '',
                    meta_description: rest.meta_description || '',
                    hero_title: rest.hero_title || '',
                    hero_subtitle: rest.hero_subtitle || '',
                    images: rest.images || [],
                    treatments: rest.treatments || [],
                    equipment: rest.equipment || []
                });
            } else {
                alert('Bölüm bulunamadı!');
                navigate('/admin/departments');
            }
        } catch (error) {
            console.error('Error loading department:', error);
            alert('Bölüm yüklenirken hata oluştu!');
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
            const { url, error } = await uploadDepartmentImage(file);

            if (error) throw error;
            if (url) {
                setFormData(prev => ({
                    ...prev,
                    images: [...(prev.images || []), url]
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
            images: (prev.images || []).filter((_: string, i: number) => i !== index)
        }));
    };

    // Treatment & Equipment management
    const addListItem = (type: 'treatments' | 'equipment') => {
        const newItem = { name: '', description: '', icon: 'bi-star', image: '' };
        setFormData(prev => ({
            ...prev,
            [type]: [...(prev[type] || []), newItem]
        }));
    };

    const removeListItem = (type: 'treatments' | 'equipment', index: number) => {
        setFormData(prev => ({
            ...prev,
            [type]: (prev[type] || []).filter((_: any, i: number) => i !== index)
        }));
    };

    const updateListItem = (type: 'treatments' | 'equipment', index: number, field: string, value: string) => {
        const newList = [...(formData[type] || [])];
        newList[index] = { ...newList[index], [field]: value };
        setFormData(prev => ({ ...prev, [type]: newList }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true);
            const { error } = isEdit
                ? await updateDepartment(parseInt(id!), formData)
                : await createDepartment(formData);

            if (error) throw error;

            alert(isEdit ? 'Bölüm başarıyla güncellendi!' : 'Bölüm başarıyla eklendi!');
            navigate('/admin/departments');
        } catch (error: any) {
            console.error('Error saving department:', error);
            alert(error.message || 'Bölüm kaydedilirken hata oluştu!');
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
                        onClick={() => navigate('/admin/departments')}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <FaArrowLeft className="text-gray-600" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-primary">
                            {isEdit ? 'Bölümü Düzenle' : 'Yeni Bölüm Ekle'}
                        </h1>
                        <p className="text-sm text-gray-500">{formData.name || 'Yeni Bölüm'}</p>
                    </div>
                </div>
                <div className="flex items-center space-x-3">
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
                    <FaGlobe className="mr-2" /> SEO & Yayım
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {activeTab === 'basic' && (
                    <div className="animate-fadeIn space-y-6">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="col-span-1">
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Bölüm Adı</label>
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
                                <div className="col-span-1">
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Kategori</label>
                                    <input
                                        type="text"
                                        name="category"
                                        value={formData.category}
                                        onChange={handleInputChange}
                                        placeholder="Cerrahi Bölümler, Dahili Bölümler vb."
                                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary outline-none transition-all"
                                    />
                                </div>
                                <div className="col-span-1">
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">İkon (Bootstrap Icon Class)</label>
                                    <input
                                        type="text"
                                        name="icon"
                                        value={formData.icon}
                                        onChange={handleInputChange}
                                        placeholder="bi-heart-pulse-fill"
                                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary outline-none transition-all"
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Kısa Açıklama</label>
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
                    </div>
                )}

                {activeTab === 'content' && (
                    <div className="animate-fadeIn space-y-6">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Banner & Tanıtım</h2>
                            <div className="space-y-4">
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
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Detaylı Bölüm Tanıtımı</label>
                                    <textarea
                                        name="long_description"
                                        value={formData.long_description}
                                        onChange={handleInputChange}
                                        rows={6}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary outline-none transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Treatments Section */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                                    <FaStethoscope className="mr-2 text-primary" /> Sunulan Tedaviler
                                </h2>
                                <button
                                    type="button"
                                    onClick={() => addListItem('treatments')}
                                    className="text-primary hover:text-primary-dark font-medium flex items-center"
                                >
                                    <FaPlus className="mr-1" /> Ekle
                                </button>
                            </div>
                            <div className="space-y-4">
                                {formData.treatments?.map((item: any, index: number) => (
                                    <div key={index} className="p-4 bg-gray-50 rounded-xl border border-gray-200 relative group">
                                        <button
                                            type="button"
                                            onClick={() => removeListItem('treatments', index)}
                                            className="absolute top-2 right-2 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <FaTrash size={14} />
                                        </button>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <input
                                                type="text"
                                                placeholder="Tedavi Adı"
                                                value={item.name}
                                                onChange={(e) => updateListItem('treatments', index, 'name', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                                            />
                                            <input
                                                type="text"
                                                placeholder="İkon (bi-...)"
                                                value={item.icon}
                                                onChange={(e) => updateListItem('treatments', index, 'icon', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                                            />
                                            <textarea
                                                placeholder="Tedavi Açıklaması"
                                                value={item.description}
                                                onChange={(e) => updateListItem('treatments', index, 'description', e.target.value)}
                                                className="col-span-full w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none resize-none"
                                                rows={2}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Equipment Section */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                                    <FaTools className="mr-2 text-primary" /> Kullanılan Teknolojiler
                                </h2>
                                <button
                                    type="button"
                                    onClick={() => addListItem('equipment')}
                                    className="text-primary hover:text-primary-dark font-medium flex items-center"
                                >
                                    <FaPlus className="mr-1" /> Ekle
                                </button>
                            </div>
                            <div className="space-y-4">
                                {formData.equipment?.map((item: any, index: number) => (
                                    <div key={index} className="p-4 bg-gray-50 rounded-xl border border-gray-200 relative group">
                                        <button
                                            type="button"
                                            onClick={() => removeListItem('equipment', index)}
                                            className="absolute top-2 right-2 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <FaTrash size={14} />
                                        </button>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <input
                                                type="text"
                                                placeholder="Cihaz/Teknoloji Adı"
                                                value={item.name}
                                                onChange={(e) => updateListItem('equipment', index, 'name', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                                            />
                                            <input
                                                type="text"
                                                placeholder="Resim URL"
                                                value={item.image}
                                                onChange={(e) => updateListItem('equipment', index, 'image', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                                            />
                                            <textarea
                                                placeholder="Teknoloji Açıklaması"
                                                value={item.description}
                                                onChange={(e) => updateListItem('equipment', index, 'description', e.target.value)}
                                                className="col-span-full w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none resize-none"
                                                rows={2}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Images Section */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Galeri</h2>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {formData.images?.map((img: string, index: number) => (
                                    <div key={index} className="relative aspect-video rounded-lg overflow-hidden border border-gray-200 group">
                                        <img src={img} alt="Department" className="w-full h-full object-cover" />
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
                                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
                                    ) : (
                                        <>
                                            <FaUpload className="text-gray-400 text-xl mb-1" />
                                            <span className="text-[10px] font-semibold text-gray-500">Yükle</span>
                                        </>
                                    )}
                                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
                                </label>
                            </div>
                            {uploadError && <p className="text-red-500 text-xs mt-2">{uploadError}</p>}
                        </div>
                    </div>
                )}

                {activeTab === 'seo' && (
                    <div className="animate-fadeIn space-y-6">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 flex items-center mb-4">
                                <FaSearch className="mr-2 text-primary" /> SEO Ayarları
                            </h2>
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">SEO Başlığı</label>
                                    <input
                                        type="text"
                                        name="meta_title"
                                        value={formData.meta_title}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">SEO Açıklaması</label>
                                    <textarea
                                        name="meta_description"
                                        value={formData.meta_description}
                                        onChange={handleInputChange}
                                        rows={4}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary outline-none resize-none"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Görünürlük & Sıralama</h2>
                            <div className="flex flex-col md:flex-row md:items-center gap-6">
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id="is_published"
                                        name="is_published"
                                        checked={formData.is_published}
                                        onChange={handleInputChange}
                                        className="w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary"
                                    />
                                    <label htmlFor="is_published" className="text-sm font-bold text-gray-700">Yayında</label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <span className="text-sm font-semibold text-gray-700">Görüntüleme Sırası:</span>
                                    <input
                                        type="number"
                                        name="display_order"
                                        value={formData.display_order}
                                        onChange={handleInputChange}
                                        className="w-20 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </form>
        </div>
    );
};

export default DepartmentForm;
