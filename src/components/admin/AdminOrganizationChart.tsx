import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FaFilePdf,
  FaTrash,
  FaExternalLinkAlt,
  FaSave,
  FaSpinner,
  FaCheckCircle,
} from 'react-icons/fa';
import { supabase } from '../../lib/supabase';
import type { Hospital } from '../../lib/supabase';

const STORAGE_BUCKET = 'quality-documents';
const STORAGE_PATH = 'organization-chart';

const AdminOrganizationChart = () => {
  const { t } = useTranslation();
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [selectedHospitalId, setSelectedHospitalId] = useState<string | number | null>(null);
  const [chartRowId, setChartRowId] = useState<number | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  // DB'ye kaydedilmiş (persisted) URL — kaldırma/kaydetme sırasında eski dosyayı silmek için.
  const persistedUrlRef = useRef<string>('');

  useEffect(() => {
    fetchHospitals();
  }, []);

  useEffect(() => {
    if (selectedHospitalId) fetchChart(selectedHospitalId);
  }, [selectedHospitalId]);

  const fetchHospitals = async () => {
    try {
      const { data, error } = await supabase
        .from('hospitals')
        .select('*')
        .order('display_order', { ascending: true });
      if (error) throw error;
      const list = (data || []) as Hospital[];
      setHospitals(list);
      setSelectedHospitalId(list[0]?.id ?? null);
    } catch (error) {
      console.error('Error fetching hospitals:', error);
      setLoading(false);
    }
  };

  const fetchChart = async (hospitalId: string | number) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('quality_org_charts')
        .select('id, pdf_url')
        .eq('hospital_id', hospitalId)
        .maybeSingle();

      if (error) throw error;
      setChartRowId(data?.id ?? null);
      setPdfUrl(data?.pdf_url || '');
      persistedUrlRef.current = data?.pdf_url || '';
    } catch (error) {
      console.error('Error fetching organization chart:', error);
    } finally {
      setLoading(false);
    }
  };

  // Public URL'den storage yolunu çıkarıp dosyayı siler (eski sürümleri temizlemek için).
  // Yalnızca bizim bucket'ımıza ait URL'leri siler; harici/diğer bucket'lara dokunmaz.
  const deleteFromStorage = async (url: string) => {
    if (!url) return;
    const marker = `/object/public/${STORAGE_BUCKET}/`;
    const idx = url.indexOf(marker);
    if (idx === -1) return;
    const path = decodeURIComponent(url.slice(idx + marker.length));
    if (!path) return;
    try {
      const { error } = await supabase.storage.from(STORAGE_BUCKET).remove([path]);
      if (error) console.error('Error deleting old PDF:', error);
    } catch (e) {
      console.error('Error deleting old PDF:', e);
    }
  };

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // PDF doğrulama
    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    if (!isPdf) {
      alert(t('admin.orgChart.invalidPdf', 'Lütfen geçerli bir PDF dosyası seçin!'));
      if (fileRef.current) fileRef.current.value = '';
      return;
    }

    // Boyut sınırı (20MB)
    if (file.size > 20 * 1024 * 1024) {
      alert(t('admin.orgChart.sizeError', 'Dosya boyutu 20MB\'dan küçük olmalıdır!'));
      if (fileRef.current) fileRef.current.value = '';
      return;
    }

    try {
      setUploading(true);
      const previousUrl = pdfUrl; // yükleme öncesi eski dosya (varsa)
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'pdf';
      const fileName = `org-chart-${Date.now()}.${fileExt}`;
      const filePath = `${STORAGE_PATH}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(filePath, file, { contentType: 'application/pdf', upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(filePath);
      setPdfUrl(data.publicUrl);

      // Yeni dosya başarıyla yüklenince eski PDF'i storage'dan sil (DB şişmesin).
      // Yeni yükleme başarısız olsaydı eskiyi korumak istediğimizden bunu en son yapıyoruz.
      if (previousUrl && previousUrl !== data.publicUrl) {
        await deleteFromStorage(previousUrl);
      }
    } catch (error: any) {
      console.error('Error uploading PDF:', error);
      alert(
        t('admin.orgChart.uploadError', 'PDF yüklenirken hata oluştu: ') +
          (error?.message || '')
      );
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handleRemove = () => {
    setPdfUrl('');
  };

  const handleSave = async () => {
    if (!selectedHospitalId) return;
    try {
      setSaving(true);
      const payload = {
        hospital_id: selectedHospitalId,
        pdf_url: pdfUrl || null,
        updated_at: new Date().toISOString(),
      };

      if (chartRowId) {
        const { error } = await supabase
          .from('quality_org_charts')
          .update(payload)
          .eq('id', chartRowId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('quality_org_charts')
          .upsert([payload], { onConflict: 'hospital_id' })
          .select('id')
          .single();
        if (error) throw error;
        if (data?.id) setChartRowId(data.id);
      }

      // Kaydetme başarılı: eğer PDF kaldırıldıysa (pdfUrl boş) veya değiştiyse,
      // artık referans verilmeyen eski dosyayı storage'dan sil.
      if (persistedUrlRef.current && pdfUrl !== persistedUrlRef.current) {
        await deleteFromStorage(persistedUrlRef.current);
      }
      persistedUrlRef.current = pdfUrl || '';

      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (error: any) {
      console.error('Error saving organization chart:', error);
      alert(t('admin.orgChart.saveError', 'Kaydedilirken hata oluştu: ') + (error?.message || ''));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-semibold text-primary">
          {t('admin.orgChart.title', 'Organizasyon Şeması')}
        </h1>
        <div className="flex items-center gap-3">
          <select
            value={selectedHospitalId ?? ''}
            onChange={(e) => setSelectedHospitalId(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {hospitals.map((h) => (
              <option key={h.id} value={h.id}>{h.name}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <FaSpinner className="animate-spin text-primary text-3xl" />
        </div>
      ) : (
      <>
      <div className="flex justify-end mb-6">
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors flex items-center disabled:opacity-50"
        >
          {saved ? (
            <>
              <FaCheckCircle className="mr-2" />
              {t('admin.orgChart.saved', 'Kaydedildi')}
            </>
          ) : saving ? (
            <>
              <FaSpinner className="animate-spin mr-2" />
              {t('admin.saving', 'Kaydediliyor...')}
            </>
          ) : (
            <>
              <FaSave className="mr-2" />
              {t('admin.save', 'Kaydet')}
            </>
          )}
        </button>
      </div>

      <p className="text-gray-600 mb-6">
        {t(
          'admin.orgChart.description',
          'Kalite Yönetim Birimi organizasyon şeması PDF olarak yüklenir. Ziyaretçiler şemaya tıklayarak PDF\'i görüntüler.'
        )}
      </p>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-primary mb-4 flex items-center">
          <FaFilePdf className="mr-2" />
          {t('admin.orgChart.currentFile', 'Mevcut PDF')}
        </h2>

        {/* Mevcut dosya önizleme */}
        {pdfUrl ? (
          <div className="mb-6">
            <div className="w-full h-[480px] rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
              <object data={pdfUrl} type="application/pdf" className="w-full h-full">
                <iframe src={pdfUrl} title="Organizasyon Şeması" className="w-full h-full" />
              </object>
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <a
                href={pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-primary hover:underline text-sm font-medium"
              >
                <FaExternalLinkAlt className="text-xs" />
                {t('admin.orgChart.openInNewTab', 'Yeni sekmede aç')}
              </a>
              <button
                onClick={handleRemove}
                className="inline-flex items-center gap-2 text-red-600 hover:text-red-700 text-sm font-medium"
              >
                <FaTrash className="text-xs" />
                {t('admin.orgChart.remove', 'Kaldır')}
              </button>
            </div>
          </div>
        ) : (
          <div className="mb-6 rounded-lg border border-dashed border-gray-300 bg-gray-50 p-10 text-center">
            <FaFilePdf className="text-gray-300 text-4xl mx-auto mb-3" />
            <p className="text-gray-500 text-sm">
              {t('admin.orgChart.noFile', 'Henüz bir PDF yüklenmedi.')}
            </p>
          </div>
        )}

        {/* Yükleme alanı */}
        <div className="border-t border-gray-100 pt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('admin.orgChart.uploadLabel', 'PDF Yükle')}
          </label>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <input
              ref={fileRef}
              type="file"
              accept="application/pdf,.pdf"
              onChange={handleUpload}
              disabled={uploading}
              className="block w-full text-sm text-gray-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary file:text-white hover:file:bg-primary-dark file:cursor-pointer"
            />
            {uploading && (
              <span className="inline-flex items-center gap-2 text-gray-500 text-sm">
                <FaSpinner className="animate-spin" />
                {t('admin.orgChart.uploading', 'Yükleniyor...')}
              </span>
            )}
          </div>
          <p className="mt-2 text-xs text-gray-400">
            {t('admin.orgChart.hint', 'Sadece PDF formatı. Maksimum 20MB.')}
          </p>
        </div>
      </div>

      <div className="mt-4 rounded-lg bg-amber-50 border border-amber-200 p-4 text-sm text-amber-800">
        <strong>{t('admin.orgChart.noteTitle', 'Not:')} </strong>
        {t(
          'admin.orgChart.note',
          'Yükleme sonrası "Kaydet" butonuna basmayı unutmayın. Değişiklik Kalite Yönetimi sayfasına yansıyacaktır.'
        )}
      </div>
      </>
      )}
    </div>
  );
};

export default AdminOrganizationChart;
