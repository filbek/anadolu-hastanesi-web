import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaTimes, FaSave, FaImage, FaUpload, FaLink, FaDatabase, FaClipboard } from 'react-icons/fa';
import { getAllSeminars, createSeminar, updateSeminar, deleteSeminar, uploadSeminarImage, GebeOkuluSeminar } from '../../services/gebeOkuluService';
import { defaultSeminars } from '../../data/gebeOkuluSeminars';

const AdminGebeOkulu = () => {
  const { t } = useTranslation();
  const [items, setItems] = useState<GebeOkuluSeminar[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);

  const emptyForm: Omit<GebeOkuluSeminar, 'id' | 'created_at' | 'updated_at'> = {
    title: '',
    date: '',
    image: '',
    summary: '',
    topics: [],
    link_url: '',
    order_index: 0,
    is_active: true,
  };
  const [formData, setFormData] = useState(emptyForm);
  const [topicsInput, setTopicsInput] = useState('');

  const loadItems = async () => {
    setLoading(true);
    setDbError(null);
    try {
      const data = await getAllSeminars();
      setItems(data);
    } catch (err: any) {
      console.error('Error in AdminGebeOkulu:', err);
      // Table doesn't exist error detection (could not find table, 42P01 etc)
      if (err.message && (err.message.includes('relation') || err.message.includes('find the table') || err.code === '42P01')) {
        setDbError('gebe_okulu_seminars');
      } else {
        setDbError(err.message || 'Bilinmeyen bir veritabanı hatası oluştu.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  const filtered = items.filter(i =>
    i.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (i.summary || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const resetForm = () => {
    setFormData(emptyForm);
    setTopicsInput('');
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (item: GebeOkuluSeminar) => {
    const { id, created_at, updated_at, ...rest } = item;
    setFormData(rest);
    setTopicsInput(Array.isArray(item.topics) ? item.topics.join(', ') : '');
    setEditingId(id);
    setShowForm(true);
  };

  // RLS yazma politikası eksikse Supabase "row-level security" hatası döner;
  // çözümü proje kökündeki fix_gebe_okulu_rls.sql dosyasının SQL Editor'de
  // çalıştırılması gerektiğinden kullanıcıyı oraya yönlendiriyoruz.
  const formatWriteError = (err: any) => {
    const message = err?.message || String(err);
    if (message.includes('row-level security')) {
      return 'Veritabanı yazma izni eksik (RLS politikası tanımlı değil). Proje kökündeki fix_gebe_okulu_rls.sql dosyasını Supabase SQL Editor\'de çalıştırdıktan sonra tekrar deneyin.';
    }
    return message;
  };

  // Sitede fallback olarak gösterilen varsayılan seminerleri veritabanına yükler.
  // Tablo boşken site bu içeriği koddan gösterir ama admin panelde yönetilemez;
  // içe aktarınca yönetilebilir hale gelir.
  const handleImportDefaults = async () => {
    if (!confirm(t('admin.confirmImportSeminars', 'Sitede gösterilen 6 varsayılan seminer veritabanına eklenecek. Devam edilsin mi?'))) return;
    setImporting(true);
    try {
      for (const seminar of defaultSeminars) {
        const { id, created_at, updated_at, ...rest } = seminar;
        const { error } = await createSeminar(rest);
        if (error) throw error;
      }
      await loadItems();
    } catch (err: any) {
      alert(t('admin.importError', 'İçe aktarılırken hata oluştu: ') + formatWriteError(err));
    } finally {
      setImporting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(t('admin.confirmDeleteSeminar', 'Bu semineri silmek istediğinizden emin misiniz?'))) return;
    try {
      const { error } = await deleteSeminar(id);
      if (error) throw error;
      await loadItems();
    } catch (err: any) {
      alert(t('admin.deleteError', 'Silinirken hata oluştu: ') + err.message);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    try {
      setUploading(true);
      const file = e.target.files[0];
      const { url, error } = await uploadSeminarImage(file);
      if (error) throw error;
      if (url) setFormData(prev => ({ ...prev, image: url }));
    } catch (err: any) {
      alert(err.message || t('admin.imageUploadError', 'Resim yüklenirken hata oluştu!'));
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.date.trim() || !formData.image.trim()) {
      alert(t('admin.titleDateAndImageRequired', 'Başlık, tarih ve görsel URL zorunludur!'));
      return;
    }

    setSaving(true);
    // Convert topics comma separated to array
    const processedTopics = topicsInput
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    const submissionData = {
      ...formData,
      topics: processedTopics,
      link_url: formData.link_url?.trim() || null
    };

    try {
      if (editingId) {
        const { error } = await updateSeminar(editingId, submissionData);
        if (error) throw error;
      } else {
        const { error } = await createSeminar(submissionData);
        if (error) throw error;
      }
      resetForm();
      await loadItems();
    } catch (err: any) {
      alert(t('admin.saveError', 'Kaydedilirken hata oluştu: ') + formatWriteError(err));
    } finally {
      setSaving(false);
    }
  };

  const sqlCode = `-- Supabase SQL Editor'de çalıştırın:
CREATE TABLE IF NOT EXISTS gebe_okulu_seminars (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  date VARCHAR(100) NOT NULL,
  image VARCHAR(500) NOT NULL,
  summary TEXT,
  topics TEXT[] DEFAULT '{}',
  link_url VARCHAR(500),
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  translations JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

GRANT SELECT ON gebe_okulu_seminars TO anon, authenticated;
GRANT ALL ON gebe_okulu_seminars TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE gebe_okulu_seminars_id_seq TO authenticated;`;

  const copySqlToClipboard = () => {
    navigator.clipboard.writeText(sqlCode);
    alert('SQL kodu panoya kopyalandı!');
  };

  if (dbError === 'gebe_okulu_seminars') {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-8 max-w-4xl mx-auto">
        <div className="flex items-center gap-4 text-amber-500 mb-6">
          <FaDatabase size={40} className="animate-pulse" />
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Veritabanı Tablosu Bulunamadı</h1>
            <p className="text-slate-500 mt-1">Gebe Okulu seminerlerini dinamik yönetebilmek için veritabanında gerekli tablo oluşturulmalıdır.</p>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-6">
          <h3 className="font-semibold text-amber-800 mb-2">Çözüm Adımları:</h3>
          <ol className="list-decimal list-inside text-sm text-amber-700 space-y-2">
            <li>Aşağıdaki SQL kodunu yanındaki butona tıklayarak kopyalayın.</li>
            <li>Supabase Dashboard'a gidin: <a href="https://supabase.com/dashboard/project/cfwwcxqpyxktikizjjxx/sql/new" target="_blank" rel="noopener noreferrer" className="underline font-bold hover:text-amber-900">SQL Editor ↗</a></li>
            <li>Kopyaladığınız kodu yeni bir SQL sorgusu olarak yapıştırın ve **Run** butonuna tıklayarak çalıştırın.</li>
            <li>Çalıştırdıktan sonra bu sayfayı yenileyin.</li>
          </ol>
        </div>

        <div className="relative bg-slate-900 text-slate-100 rounded-xl p-6 font-mono text-sm overflow-x-auto max-h-96">
          <button
            onClick={copySqlToClipboard}
            className="absolute top-4 right-4 bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded-lg flex items-center gap-2 text-xs transition-colors border border-slate-700"
          >
            <FaClipboard /> Kopyala
          </button>
          <pre>{sqlCode}</pre>
        </div>

        <div className="mt-8 flex justify-center">
          <button
            onClick={loadItems}
            className="bg-primary hover:bg-primary-dark text-white px-6 py-2.5 rounded-xl font-medium transition-colors shadow-sm"
          >
            Tabloyu Kontrol Et ve Sayfayı Yenile
          </button>
        </div>
      </div>
    );
  }

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
        <div>
          <h1 className="text-2xl font-bold text-primary">Gebe Okulu Seminerleri</h1>
          <p className="text-slate-500 text-sm mt-1">Gebe Okulu sayfasındaki seminerleri ve atölye içeriklerini yönetin.</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="bg-primary text-white px-4 py-2.5 rounded-xl hover:bg-primary-dark transition-all flex items-center font-semibold shadow-md shadow-primary/10"
        >
          <FaPlus className="mr-2" /> Yeni Seminer Ekle
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-2xl shadow-sm p-4 mb-6 border border-slate-100">
        <div className="relative">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Seminer başlığı veya özetinde ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
          />
        </div>
      </div>

      {/* Modal / Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-800">
                {editingId ? 'Semineri Düzenle' : 'Yeni Seminer Ekle'}
              </h2>
              <button onClick={resetForm} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-50 transition-colors">
                <FaTimes size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Seminer Başlığı *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Örn: Doğum Hazırlık ve Nefes Teknikleri"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm transition-all"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Tarih Bilgisi *</label>
                  <input
                    type="text"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    placeholder="Örn: 22 Mayıs 2025 veya 7/24 Aktif"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Görsel Yükle / URL *</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      value={formData.image}
                      placeholder="/uploads/gebe-okulu-silivri.jpg veya URL"
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm transition-all"
                    />
                    <label className="cursor-pointer px-4 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors flex items-center border border-slate-200">
                      {uploading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-primary"></div>
                      ) : (
                        <FaUpload className="text-slate-600" />
                      )}
                      <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
                    </label>
                  </div>
                  {formData.image && (
                    <div className="mt-2 relative inline-block">
                      <img src={formData.image} alt="Önizleme" className="h-16 rounded-xl object-cover border border-slate-100 shadow-sm" />
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Görsele Tıklandığında Gidilecek Link (URL)</label>
                <div className="relative">
                  <FaLink className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="url"
                    value={formData.link_url || ''}
                    onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                    placeholder="https://anadoluhastaneleri.kendineiyibak.app/"
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm transition-all"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Kullanıcı Gebe Okulu sayfasında seminer resmine tıkladığında bu bağlantıya yönlendirilecektir. Boş bırakırsanız resim tıklanamaz.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Seminer Özeti (Açıklama)</label>
                <textarea
                  value={formData.summary || ''}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  placeholder="Seminer hakkında kısa bilgilendirici açıklama yazın..."
                  rows={3}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Seminer Konuları (Etiketler - Virgülle Ayırın)</label>
                <input
                  type="text"
                  value={topicsInput}
                  onChange={(e) => setTopicsInput(e.target.value)}
                  placeholder="Örn: Nefes teknikleri, Doğum pozisyonları, Eş desteği"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm transition-all"
                />
                <p className="text-[11px] text-slate-400 mt-1">Konuları birbirlerinden virgülle ayırarak giriniz.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Görünüm Sırası</label>
                  <input
                    type="number"
                    value={formData.order_index}
                    onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm transition-all"
                  />
                </div>
                <div className="flex items-end pb-2.5">
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="w-5 h-5 text-primary rounded-lg border-slate-200 focus:ring-primary/20"
                    />
                    <span className="text-sm font-semibold text-slate-700">Web Sitesinde Göster (Aktif)</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-5 py-2.5 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors text-sm font-semibold"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 bg-primary text-white rounded-xl hover:bg-primary-dark flex items-center disabled:opacity-50 text-sm font-semibold shadow-md shadow-primary/10"
                >
                  {saving && <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white mr-2"></div>}
                  <FaSave className="mr-2" /> {editingId ? 'Güncelle' : 'Kaydet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((item) => (
          <div key={item.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-all duration-300 flex flex-col justify-between">
            <div>
              <div className="h-48 bg-slate-50 relative">
                {item.image ? (
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400"><FaImage size={32} /></div>
                )}
                <div className="absolute top-3 right-3 flex gap-2">
                  {!item.is_active && (
                    <span className="bg-slate-900/80 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md">Pasif</span>
                  )}
                  {item.link_url && (
                    <span className="bg-primary/95 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-md flex items-center gap-1 shadow-sm"><FaLink size={8} /> Bağlantılı</span>
                  )}
                </div>
                <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm text-primary text-xs font-bold px-2.5 py-1 rounded-lg shadow-sm">
                  {item.date}
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-bold text-slate-800 text-lg leading-snug mb-2 line-clamp-1">{item.title}</h3>
                <p className="text-sm text-slate-500 mb-4 line-clamp-3 leading-relaxed">{item.summary || 'Açıklama belirtilmemiş.'}</p>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {Array.isArray(item.topics) && item.topics.slice(0, 3).map((topic, idx) => (
                    <span key={idx} className="bg-slate-50 text-slate-600 text-[10px] font-medium px-2.5 py-0.5 rounded-full border border-slate-100">
                      {topic}
                    </span>
                  ))}
                  {Array.isArray(item.topics) && item.topics.length > 3 && (
                    <span className="text-slate-400 text-[10px] font-bold px-1.5">+{item.topics.length - 3}</span>
                  )}
                </div>
              </div>
            </div>

            <div className="px-5 pb-5 pt-3 border-t border-slate-50 flex justify-between items-center bg-slate-50/50">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Sıra: {item.order_index}</span>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(item)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors border border-transparent hover:border-blue-100 bg-white shadow-sm"
                  title="Düzenle"
                >
                  <FaEdit size={14} />
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors border border-transparent hover:border-red-100 bg-white shadow-sm"
                  title="Sil"
                >
                  <FaTrash size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 py-16 text-center shadow-sm">
          <div className="text-slate-300 text-6xl mb-4">🤰</div>
          <h3 className="text-lg font-bold text-slate-800 mb-1">Seminer Bulunamadı</h3>
          <p className="text-slate-400 text-sm max-w-md mx-auto">
            {searchTerm
              ? 'Arama kriterlerinize uygun seminer bulunamadı.'
              : 'Veritabanında henüz seminer kaydı yok. Web sitesindeki Gebe Okulu sayfası şu an koddaki varsayılan içeriği gösteriyor; bu içeriği buradan yönetebilmek için içe aktarın veya yeni seminer ekleyin.'}
          </p>
          {!searchTerm && items.length === 0 && (
            <button
              onClick={handleImportDefaults}
              disabled={importing}
              className="mt-6 inline-flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-xl hover:bg-primary-dark transition-colors font-semibold shadow-md shadow-primary/10 disabled:opacity-50"
            >
              {importing ? (
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white" />
              ) : (
                <FaDatabase />
              )}
              {importing ? 'İçe Aktarılıyor...' : `Sitedeki Varsayılan Seminerleri İçe Aktar (${defaultSeminars.length})`}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminGebeOkulu;
