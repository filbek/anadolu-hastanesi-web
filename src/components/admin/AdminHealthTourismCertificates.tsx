import { useEffect, useRef, useState } from 'react';
import {
  FaArrowDown,
  FaArrowUp,
  FaCertificate,
  FaCheckCircle,
  FaExternalLinkAlt,
  FaPlus,
  FaSave,
  FaSpinner,
  FaTrash,
  FaUpload,
} from 'react-icons/fa';
import { supabase } from '../../lib/supabase';
import {
  fetchHealthTourismCertificates,
  type HealthTourismCertificate,
} from '../../services/healthTourismCertificates';

const STORAGE_BUCKET = 'quality-documents';
const STORAGE_PATH = 'health-tourism';
const MAX_SIZE = 10 * 1024 * 1024;

const newId = () => `cert-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

/**
 * /saglik-turizmi sayfasındaki yetki belgelerini yönetir.
 * Veri: site_settings.health_tourism_certificates (JSONB) —
 * bkz. src/sql/health_tourism_certificates_migration.sql
 */
const AdminHealthTourismCertificates = () => {
  const [settingsId, setSettingsId] = useState<string | number | null>(null);
  const [certificates, setCertificates] = useState<HealthTourismCertificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});
  // Kayıtlı görseller — kaydetme sonrası artık kullanılmayan dosyaları silmek için
  const persistedUrlsRef = useRef<string[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const { settingsId, certificates } = await fetchHealthTourismCertificates();
        setSettingsId(settingsId);
        setCertificates(certificates);
        persistedUrlsRef.current = certificates.map((c) => c.image_url);
      } catch (error: any) {
        console.error('Error fetching health tourism certificates:', error);
        setLoadError(
          'Belgeler okunamadı. src/sql/health_tourism_certificates_migration.sql dosyasının Supabase SQL Editor\'da çalıştırıldığından emin olun. ' +
            (error?.message || '')
        );
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const update = (id: string, patch: Partial<HealthTourismCertificate>) =>
    setCertificates((list) => list.map((c) => (c.id === id ? { ...c, ...patch } : c)));

  const move = (index: number, dir: -1 | 1) =>
    setCertificates((list) => {
      const next = [...list];
      const target = index + dir;
      if (target < 0 || target >= next.length) return list;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });

  const add = () =>
    setCertificates((list) => [
      ...list,
      { id: newId(), title: '', subtitle: 'Uluslararası Sağlık Turizmi Yetki Belgesi', image_url: '' },
    ]);

  const remove = (id: string) => {
    if (!confirm('Bu belge kaldırılsın mı? (Kalıcı olması için "Belgeleri Kaydet"e basın.)')) return;
    setCertificates((list) => list.filter((c) => c.id !== id));
  };

  // Yalnızca bizim bucket'ımızdaki dosyaları siler; /uploads gibi statik dosyalara dokunmaz.
  const deleteFromStorage = async (urls: string[]) => {
    const marker = `/object/public/${STORAGE_BUCKET}/`;
    const paths = urls
      .map((url) => {
        const idx = url.indexOf(marker);
        return idx === -1 ? '' : decodeURIComponent(url.slice(idx + marker.length));
      })
      .filter(Boolean);
    if (!paths.length) return;
    const { error } = await supabase.storage.from(STORAGE_BUCKET).remove(paths);
    if (error) console.error('Error deleting old certificate images:', error);
  };

  const handleUpload = async (id: string, file: File | undefined) => {
    if (!file) return;
    const input = fileRefs.current[id];
    if (!file.type.startsWith('image/')) {
      alert('Lütfen bir görsel dosyası (JPG, PNG, WEBP) seçin.');
      if (input) input.value = '';
      return;
    }
    if (file.size > MAX_SIZE) {
      alert('Dosya boyutu 10MB\'dan küçük olmalıdır.');
      if (input) input.value = '';
      return;
    }

    try {
      setUploadingId(id);
      const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const filePath = `${STORAGE_PATH}/certificate-${Date.now()}.${ext}`;
      const { error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(filePath, file, { contentType: file.type, upsert: true });
      if (error) throw error;

      const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(filePath);
      update(id, { image_url: data.publicUrl });
    } catch (error: any) {
      console.error('Error uploading certificate image:', error);
      alert('Görsel yüklenirken hata oluştu: ' + (error?.message || ''));
    } finally {
      setUploadingId(null);
      if (input) input.value = '';
    }
  };

  const handleSave = async () => {
    const incomplete = certificates.find((c) => !c.title.trim() || !c.image_url);
    if (incomplete) {
      alert('Her belge için hastane adı ve belge görseli zorunludur.');
      return;
    }
    if (!settingsId) {
      alert('site_settings kaydı bulunamadı. Önce Genel Ayarlar sayfasından ayarları bir kez kaydedin.');
      return;
    }

    try {
      setSaving(true);
      const payload = certificates.map((c) => ({
        id: c.id,
        title: c.title.trim(),
        subtitle: c.subtitle?.trim() || '',
        image_url: c.image_url,
      }));
      const { error } = await supabase
        .from('site_settings')
        .update({ health_tourism_certificates: payload, updated_at: new Date().toISOString() })
        .eq('id', settingsId);
      if (error) throw error;

      const current = payload.map((c) => c.image_url);
      await deleteFromStorage(persistedUrlsRef.current.filter((url) => !current.includes(url)));
      persistedUrlsRef.current = current;

      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (error: any) {
      console.error('Error saving health tourism certificates:', error);
      alert('Kaydedilirken hata oluştu: ' + (error?.message || ''));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
        <h2 className="text-lg font-semibold flex items-center text-gray-700">
          <FaCertificate className="mr-2 text-primary" /> Sağlık Turizmi Yetki Belgeleri
        </h2>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || loading || !!loadError || !!uploadingId}
          className="bg-primary text-white px-5 py-2 rounded-lg hover:bg-primary-dark transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {saving ? <FaSpinner className="animate-spin" /> : saved ? <FaCheckCircle /> : <FaSave />}
          {saving ? 'Kaydediliyor...' : saved ? 'Kaydedildi' : 'Belgeleri Kaydet'}
        </button>
      </div>
      <p className="text-sm text-gray-500 mb-6">
        Sağlık Turizmi sayfasında gösterilen belgeler. Sıralama, sayfadaki görünüm sırasıdır.
      </p>

      {loading ? (
        <div className="flex items-center gap-2 text-gray-500 text-sm">
          <FaSpinner className="animate-spin" /> Yükleniyor...
        </div>
      ) : loadError ? (
        <div className="p-4 rounded-lg bg-red-50 text-red-700 text-sm">{loadError}</div>
      ) : (
        <div className="space-y-4">
          {certificates.length === 0 && (
            <p className="text-sm text-gray-500">Henüz belge yok. Sayfada belge alanı gizlenir.</p>
          )}

          {certificates.map((cert, index) => (
            <div key={cert.id} className="flex flex-col md:flex-row gap-4 border border-gray-100 rounded-lg p-4">
              <div className="w-full md:w-40 flex-shrink-0">
                {cert.image_url ? (
                  <a href={cert.image_url} target="_blank" rel="noopener noreferrer" className="block group relative">
                    <img
                      src={cert.image_url}
                      alt={cert.title || 'Yetki belgesi'}
                      className="w-full h-40 object-contain bg-gray-50 rounded border border-gray-100"
                    />
                    <FaExternalLinkAlt className="absolute top-2 right-2 text-xs text-gray-400 group-hover:text-primary" />
                  </a>
                ) : (
                  <div className="w-full h-40 flex items-center justify-center bg-gray-50 rounded border border-dashed border-gray-300 text-xs text-gray-400">
                    Görsel yok
                  </div>
                )}
              </div>

              <div className="flex-1 space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1" htmlFor={`${cert.id}-title`}>
                    Hastane adı *
                  </label>
                  <input
                    id={`${cert.id}-title`}
                    type="text"
                    value={cert.title}
                    placeholder="Ör. Avcılar Anadolu Hastanesi"
                    onChange={(e) => update(cert.id, { title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1" htmlFor={`${cert.id}-subtitle`}>
                    Belge adı
                  </label>
                  <input
                    id={`${cert.id}-subtitle`}
                    type="text"
                    value={cert.subtitle || ''}
                    placeholder="Uluslararası Sağlık Turizmi Yetki Belgesi"
                    onChange={(e) => update(cert.id, { subtitle: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <input
                    ref={(el) => { fileRefs.current[cert.id] = el; }}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleUpload(cert.id, e.target.files?.[0])}
                  />
                  <button
                    type="button"
                    onClick={() => fileRefs.current[cert.id]?.click()}
                    disabled={!!uploadingId}
                    className="inline-flex items-center gap-2 text-sm px-3 py-2 rounded-lg border border-primary text-primary hover:bg-primary hover:text-white transition-colors disabled:opacity-50"
                  >
                    {uploadingId === cert.id ? <FaSpinner className="animate-spin" /> : <FaUpload />}
                    {uploadingId === cert.id ? 'Yükleniyor...' : cert.image_url ? 'Görseli Değiştir' : 'Görsel Yükle'}
                  </button>
                </div>
              </div>

              <div className="flex md:flex-col gap-2 md:justify-start">
                <button
                  type="button"
                  onClick={() => move(index, -1)}
                  disabled={index === 0}
                  className="p-2 text-gray-500 hover:text-primary disabled:opacity-30"
                  aria-label="Yukarı taşı"
                >
                  <FaArrowUp />
                </button>
                <button
                  type="button"
                  onClick={() => move(index, 1)}
                  disabled={index === certificates.length - 1}
                  className="p-2 text-gray-500 hover:text-primary disabled:opacity-30"
                  aria-label="Aşağı taşı"
                >
                  <FaArrowDown />
                </button>
                <button
                  type="button"
                  onClick={() => remove(cert.id)}
                  className="p-2 text-red-500 hover:text-red-700"
                  aria-label="Belgeyi kaldır"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={add}
            className="flex items-center text-sm font-medium text-primary hover:text-primary-dark"
          >
            <FaPlus className="mr-1" /> Yeni Belge Ekle
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminHealthTourismCertificates;
