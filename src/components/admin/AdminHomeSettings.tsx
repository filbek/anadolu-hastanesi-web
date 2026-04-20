import { useState, useEffect } from 'react';
import {
    FaSave, FaHome, FaSpinner, FaEye, FaEyeSlash,
    FaGripVertical, FaEdit, FaCheck, FaTimes
} from 'react-icons/fa';
import { supabase } from '../../lib/supabase';
import { motion, Reorder } from 'framer-motion';

interface PageSection {
    id: string;
    page_slug: string;
    section_type: string;
    title: string | null;
    subtitle: string | null;
    content: any;
    image_url: string | null;
    order_index: number;
    is_visible: boolean;
    updated_at: string;
}

const SECTION_LABELS: Record<string, string> = {
    'hero_banner': 'Hero Banner (Giriş Görseli)',
    'hospital_branches': 'Hastanelerimiz',
    'departments_list': 'Tıbbi Bölümler',
    'doctors_list': 'Uzman Doktorlar',
    'health_guide': 'Sağlık Rehberi',
    'testimonials_slider': 'Hasta Yorumları',
    'health_tourism': 'Sağlık Turizmi',
    'stats': 'istatistikler',
    'features': 'Özellikler'
};

const AdminHomeSettings = () => {
    const [sections, setSections] = useState<PageSection[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editFormData, setEditFormData] = useState<Partial<PageSection>>({});

    useEffect(() => {
        fetchHomeSections();
    }, []);

    const fetchHomeSections = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('page_sections')
                .select('*')
                .eq('page_slug', '/')
                .order('order_index', { ascending: true });

            if (error) throw error;
            setSections(data || []);
        } catch (error: any) {
            console.error('Error fetching home sections:', error);
            setMessage({ type: 'error', text: 'Bölümler yüklenirken bir hata oluştu.' });
        } finally {
            setLoading(false);
        }
    };

    const handleReorder = async (newOrder: PageSection[]) => {
        setSections(newOrder);
        // Debounce or save on button click? Let's implement a manual save for order to avoid too many DB hits during drag.
    };

    const saveOrder = async () => {
        setSaving(true);
        try {
            const updates = sections.map((section, index) => ({
                id: section.id,
                order_index: index,
                updated_at: new Date().toISOString()
            }));

            for (const update of updates) {
                const { error } = await supabase
                    .from('page_sections')
                    .update({ order_index: update.order_index, updated_at: update.updated_at })
                    .eq('id', update.id);
                if (error) throw error;
            }

            setMessage({ type: 'success', text: 'Sıralama başarıyla kaydedildi!' });
        } catch (error: any) {
            console.error('Error saving order:', error);
            setMessage({ type: 'error', text: 'Sıralama kaydedilirken hata oluştu.' });
        } finally {
            setSaving(false);
        }
    };

    const toggleVisibility = async (id: string, currentStatus: boolean) => {
        try {
            const { error } = await supabase
                .from('page_sections')
                .update({ is_visible: !currentStatus, updated_at: new Date().toISOString() })
                .eq('id', id);

            if (error) throw error;

            setSections(sections.map(s => s.id === id ? { ...s, is_visible: !currentStatus } : s));
            setMessage({ type: 'success', text: 'Görünürlük güncellendi.' });
        } catch (error: any) {
            console.error('Error toggling visibility:', error);
            setMessage({ type: 'error', text: 'Görünürlük güncellenirken hata oluştu.' });
        }
    };

    const startEditing = (section: PageSection) => {
        setEditingId(section.id);
        setEditFormData({
            title: section.title,
            subtitle: section.subtitle,
            image_url: section.image_url,
            content: section.content
        });
    };

    const cancelEditing = () => {
        setEditingId(null);
        setEditFormData({});
    };

    const saveSection = async (id: string) => {
        setSaving(true);
        try {
            const { error } = await supabase
                .from('page_sections')
                .update({
                    ...editFormData,
                    updated_at: new Date().toISOString()
                })
                .eq('id', id);

            if (error) throw error;

            setSections(sections.map(s => s.id === id ? { ...s, ...editFormData } : s));
            setEditingId(null);
            setMessage({ type: 'success', text: 'Bölüm başarıyla güncellendi!' });
        } catch (error: any) {
            console.error('Error saving section:', error);
            setMessage({ type: 'error', text: 'Güncellenirken hata oluştu.' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <FaSpinner className="animate-spin text-primary text-3xl" />
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-20">
            <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-gray-100 shadow-sm sticky top-0 z-20">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                        <FaHome className="mr-3 text-primary" /> Ana Sayfa Modül Yönetimi
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">Görünürlüğü değiştirin ve sürükleyerek sıralayın.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={saveOrder}
                        disabled={saving}
                        className="bg-primary text-white px-6 py-2 rounded-xl hover:bg-primary-dark transition-all flex items-center shadow-lg shadow-primary/20 disabled:opacity-50"
                    >
                        {saving ? <FaSpinner className="mr-2 animate-spin" /> : <FaSave className="mr-2" />}
                        Sıralamayı Kaydet
                    </button>
                </div>
            </div>

            {message.text && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-xl flex items-center ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}
                >
                    <span className="flex-1 font-medium">{message.text}</span>
                    <button onClick={() => setMessage({ type: '', text: '' })} className="hover:bg-black/5 p-1 rounded">
                        <FaTimes />
                    </button>
                </motion.div>
            )}

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                    <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest">AKTİF MODÜLLER</h2>
                </div>

                <Reorder.Group axis="y" values={sections} onReorder={handleReorder} className="divide-y divide-gray-100">
                    {sections.map((section) => (
                        <Reorder.Item
                            key={section.id}
                            value={section}
                            className={`p-4 bg-white hover:bg-gray-50/50 transition-colors ${!section.is_visible ? 'opacity-60 grayscale-[0.5]' : ''}`}
                        >
                            <div className="flex items-center gap-4">
                                <div className="cursor-grab active:cursor-grabbing text-gray-300 p-2">
                                    <FaGripVertical />
                                </div>

                                <div className="flex-1">
                                    <div className="flex items-center gap-3">
                                        <span className="font-bold text-gray-800">
                                            {SECTION_LABELS[section.section_type] || section.section_type}
                                        </span>
                                        {!section.is_visible && (
                                            <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                                                GİZLİ
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-xs text-gray-400 mt-0.5">
                                        Modül Tipi: <span className="font-mono">{section.section_type}</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => startEditing(section)}
                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                        title="Düzenle"
                                    >
                                        <FaEdit />
                                    </button>
                                    <button
                                        onClick={() => toggleVisibility(section.id, section.is_visible)}
                                        className={`p-2 rounded-lg transition-colors ${section.is_visible ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-100'}`}
                                        title={section.is_visible ? 'Gizle' : 'Göster'}
                                    >
                                        {section.is_visible ? <FaEye /> : <FaEyeSlash />}
                                    </button>
                                </div>
                            </div>

                            {editingId === section.id && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="mt-6 p-6 border-t border-gray-100 bg-gray-50/50 rounded-xl space-y-4"
                                >
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Başlık</label>
                                                <input
                                                    type="text"
                                                    value={editFormData.title || ''}
                                                    onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary outline-none transition-all"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Alt Başlık</label>
                                                <textarea
                                                    value={editFormData.subtitle || ''}
                                                    onChange={(e) => setEditFormData({ ...editFormData, subtitle: e.target.value })}
                                                    rows={3}
                                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary outline-none transition-all"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Görsel URL</label>
                                                <input
                                                    type="text"
                                                    value={editFormData.image_url || ''}
                                                    onChange={(e) => setEditFormData({ ...editFormData, image_url: e.target.value })}
                                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary outline-none transition-all"
                                                />
                                            </div>
                                            {section.section_type === 'stats' && (
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">İçerik (JSON - İstatistikler)</label>
                                                    <textarea
                                                        value={typeof editFormData.content === 'object' ? JSON.stringify(editFormData.content, null, 2) : editFormData.content}
                                                        onChange={(e) => {
                                                            try {
                                                                const parsed = JSON.parse(e.target.value);
                                                                setEditFormData({ ...editFormData, content: parsed });
                                                            } catch (err) {
                                                                setEditFormData({ ...editFormData, content: e.target.value });
                                                            }
                                                        }}
                                                        rows={5}
                                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary outline-none transition-all font-mono text-xs"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                                        <button
                                            onClick={cancelEditing}
                                            className="bg-white text-gray-600 px-6 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 transition-all font-bold"
                                        >
                                            İptal
                                        </button>
                                        <button
                                            onClick={() => saveSection(section.id)}
                                            disabled={saving}
                                            className="bg-primary text-white px-6 py-2 rounded-xl hover:bg-primary-dark transition-all flex items-center shadow-lg shadow-primary/20 disabled:opacity-50 font-bold"
                                        >
                                            {saving ? <FaSpinner className="mr-2 animate-spin" /> : <FaCheck className="mr-2" />}
                                            Güncelle
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </Reorder.Item>
                    ))}
                </Reorder.Group>

                {sections.length === 0 && (
                    <div className="p-20 text-center text-gray-400 italic">
                        Hiçbir modül bulunamadı.
                    </div>
                )}
            </div>

            <div className="bg-blue-50 border border-blue-100 p-6 rounded-2xl flex gap-4 text-blue-800">
                <div className="text-2xl mt-1">💡</div>
                <div>
                    <h4 className="font-bold text-lg mb-1">Nasıl Kullanılır?</h4>
                    <ul className="text-sm space-y-2 list-disc ml-4 opacity-90">
                        <li>Sıralamayı değiştirmek için modülleri sol taraftaki tutamaçtan tutup yukarı/aşağı sürükleyin.</li>
                        <li>Sıralama değişikliklerinin aktif olması için <b>"Sıralamayı Kaydet"</b> butonuna basmanız gerekir.</li>
                        <li>Görünürlük ve içerik düzenlemeleri anında kaydedilir ve ön belleği temizlemeden hemen yansır.</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default AdminHomeSettings;
