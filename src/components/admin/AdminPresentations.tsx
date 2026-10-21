import { useState, useEffect, useRef } from 'react';
import {
  FaFilePdf,
  FaTrash,
  FaExternalLinkAlt,
  FaSpinner,
  FaCopy,
  FaCheck,
  FaUpload,
  FaSyncAlt,
} from 'react-icons/fa';
import { supabase } from '../../lib/supabase';
import { createAuditLog } from '../../services/auditLogService';

const STORAGE_BUCKET = 'presentations';
const MAX_SIZE = 50 * 1024 * 1024; // bucket limitiyle aynı (presentations_migration.sql)

interface Presentation {
  id: number;
  title: string;
  slug: string;
  file_path: string;
  file_size: number | null;
  created_at: string;
  updated_at: string;
}

const TR_MAP: Record<string, string> = { ç: 'c', ğ: 'g', ı: 'i', ö: 'o', ş: 's', ü: 'u' };

// "Kalite Sunumu 2026" → "kalite-sunumu-2026-x7k2"
// Sondaki rastgele ek linkin tahmin edilmesini engeller.
const makeSlug = (title: string) => {
  const base = title
    .toLocaleLowerCase('tr')
    .replace(/[çğıöşü]/g, (c) => TR_MAP[c])
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'sunum';
  const suffix = Math.random().toString(36).slice(2, 6);
  return `${base}-${suffix}`;
};

const isPdf = (file: File) =>
  file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');

const formatSize = (bytes: number | null) => {
  if (!bytes) return '';
  return bytes >= 1024 * 1024
    ? `${(bytes / 1024 / 1024).toFixed(1)} MB`
    : `${Math.round(bytes / 1024)} KB`;
};

// Paylaşılan link: canlıda https://<site>/sunum/<slug> (vercel.json yönlendirir).
// Yerel geliştirmede bu yönlendirme olmadığı için doğrudan storage linki verilir.
const shareUrlFor = (p: Presentation) => {
  const { hostname, origin } = window.location;
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return supabase.storage.from(STORAGE_BUCKET).getPublicUrl(p.file_path).data.publicUrl;
  }
  return `${origin}/sunum/${p.slug}`;
};

const AdminPresentations = () => {
  const [items, setItems] = useState<Presentation[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [replacingId, setReplacingId] = useState<number | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [lastCreated, setLastCreated] = useState<Presentation | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const replaceRef = useRef<HTMLInputElement>(null);
  const replaceTarget = useRef<Presentation | null>(null);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('presentations')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setItems((data || []) as Presentation[]);
    } catch (error) {
      console.error('Error fetching presentations:', error);
    } finally {
      setLoading(false);
    }
  };

  const validate = (f: File) => {
    if (!isPdf(f)) {
      alert('Lütfen geçerli bir PDF dosyası seçin!');
      return false;
    }
    if (f.size > MAX_SIZE) {
      alert('Dosya boyutu 50MB\'dan küçük olmalıdır!');
      return false;
    }
    return true;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    if (f && !validate(f)) {
      e.target.value = '';
      setFile(null);
      return;
    }
    setFile(f);
    // Başlık boşsa dosya adından doldur
    if (f && !title.trim()) setTitle(f.name.replace(/\.pdf$/i, ''));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title.trim()) return;

    const slug = makeSlug(title.trim());
    const filePath = `${slug}.pdf`;
    try {
      setUploading(true);
      const { error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(filePath, file, { contentType: 'application/pdf', cacheControl: '60' });
      if (uploadError) throw uploadError;

      const { data, error } = await supabase
        .from('presentations')
        .insert([{ title: title.trim(), slug, file_path: filePath, file_size: file.size }])
        .select()
        .single();
      if (error) {
        // Kayıt oluşmadıysa yetim dosya bırakma
        await supabase.storage.from(STORAGE_BUCKET).remove([filePath]);
        throw error;
      }

      const created = data as Presentation;
      setItems((prev) => [created, ...prev]);
      setLastCreated(created);
      setTitle('');
      setFile(null);
      if (fileRef.current) fileRef.current.value = '';
      createAuditLog({
        action: 'CREATE',
        entity_type: 'presentations',
        entity_id: created.id,
        details: { title: created.title, slug: created.slug },
      });
    } catch (error: any) {
      console.error('Error uploading presentation:', error);
      alert('Sunum yüklenirken hata oluştu: ' + (error?.message || ''));
    } finally {
      setUploading(false);
    }
  };

  // Aynı link korunarak PDF'in yeni sürümü yüklenir
  const startReplace = (p: Presentation) => {
    replaceTarget.current = p;
    replaceRef.current?.click();
  };

  const handleReplace = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    const target = replaceTarget.current;
    e.target.value = '';
    if (!f || !target || !validate(f)) return;

    try {
      setReplacingId(target.id);
      const { error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(target.file_path, f, { contentType: 'application/pdf', cacheControl: '60', upsert: true });
      if (uploadError) throw uploadError;

      const { data, error } = await supabase
        .from('presentations')
        .update({ file_size: f.size, updated_at: new Date().toISOString() })
        .eq('id', target.id)
        .select()
        .single();
      if (error) throw error;
      setItems((prev) => prev.map((p) => (p.id === target.id ? (data as Presentation) : p)));
      createAuditLog({
        action: 'UPDATE',
        entity_type: 'presentations',
        entity_id: target.id,
        details: { title: target.title, slug: target.slug },
      });
    } catch (error: any) {
      console.error('Error replacing presentation:', error);
      alert('PDF değiştirilirken hata oluştu: ' + (error?.message || ''));
    } finally {
      setReplacingId(null);
    }
  };

  const handleDelete = async (p: Presentation) => {
    if (!confirm(`"${p.title}" sunumunu silmek istediğinizden emin misiniz? Paylaşılan link artık çalışmayacak.`)) return;
    try {
      const { error } = await supabase.from('presentations').delete().eq('id', p.id);
      if (error) throw error;
      const { error: storageError } = await supabase.storage.from(STORAGE_BUCKET).remove([p.file_path]);
      if (storageError) console.error('Error deleting presentation file:', storageError);
      setItems((prev) => prev.filter((x) => x.id !== p.id));
      if (lastCreated?.id === p.id) setLastCreated(null);
      createAuditLog({
        action: 'DELETE',
        entity_type: 'presentations',
        entity_id: p.id,
        details: { title: p.title, slug: p.slug },
      });
    } catch (error: any) {
      console.error('Error deleting presentation:', error);
      alert('Silinirken hata oluştu: ' + (error?.message || ''));
    }
  };

  const copyLink = async (p: Presentation) => {
    const url = shareUrlFor(p);
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      window.prompt('Linki kopyalayın:', url);
      return;
    }
    setCopiedId(p.id);
    setTimeout(() => setCopiedId((id) => (id === p.id ? null : id)), 2000);
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-primary">Sunumlar</h1>
        <p className="text-gray-600 mt-1">
          PDF sunumunuzu yükleyin, size bir link verilsin. Linki paylaştığınız kişi tıkladığında PDF doğrudan açılır.
        </p>
      </div>

      {/* Yeni sunum */}
      <form onSubmit={handleCreate} className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold text-primary mb-4 flex items-center">
          <FaUpload className="mr-2" />
          Yeni Sunum Yükle
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="presentation-title" className="block text-sm font-medium text-gray-700 mb-2">
              Sunum Başlığı
            </label>
            <input
              id="presentation-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Örn: 2026 Kalite Sunumu"
              maxLength={150}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label htmlFor="presentation-file" className="block text-sm font-medium text-gray-700 mb-2">
              PDF Dosyası
            </label>
            <input
              id="presentation-file"
              ref={fileRef}
              type="file"
              accept="application/pdf,.pdf"
              onChange={handleFileChange}
              disabled={uploading}
              required
              className="block w-full text-sm text-gray-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary file:text-white hover:file:bg-primary-dark file:cursor-pointer"
            />
            <p className="mt-1 text-xs text-gray-400">Sadece PDF formatı. Maksimum 50MB.</p>
          </div>
        </div>
        <div className="flex justify-end mt-4">
          <button
            type="submit"
            disabled={uploading || !file || !title.trim()}
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors flex items-center disabled:opacity-50"
          >
            {uploading ? (
              <>
                <FaSpinner className="animate-spin mr-2" />
                Yükleniyor...
              </>
            ) : (
              <>
                <FaUpload className="mr-2" />
                Yükle ve Link Oluştur
              </>
            )}
          </button>
        </div>

        {lastCreated && (
          <div className="mt-4 rounded-lg bg-green-50 border border-green-200 p-4" role="status">
            <p className="text-sm font-medium text-green-800 mb-2">
              "{lastCreated.title}" yüklendi. Paylaşım linkiniz:
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                readOnly
                value={shareUrlFor(lastCreated)}
                onFocus={(e) => e.target.select()}
                aria-label="Paylaşım linki"
                className="flex-1 px-3 py-2 border border-green-300 rounded-lg bg-white text-sm text-gray-800"
              />
              <button
                type="button"
                onClick={() => copyLink(lastCreated)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center text-sm"
              >
                {copiedId === lastCreated.id ? <FaCheck className="mr-2" /> : <FaCopy className="mr-2" />}
                {copiedId === lastCreated.id ? 'Kopyalandı' : 'Linki Kopyala'}
              </button>
            </div>
          </div>
        )}
      </form>

      {/* Liste */}
      <div className="bg-white rounded-lg shadow-sm">
        <h2 className="text-lg font-semibold text-primary p-6 pb-4 flex items-center">
          <FaFilePdf className="mr-2" />
          Yüklenen Sunumlar
        </h2>
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <FaSpinner className="animate-spin text-primary text-3xl" />
          </div>
        ) : items.length === 0 ? (
          <div className="px-6 pb-8 text-center text-gray-500 text-sm">Henüz sunum yüklenmedi.</div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {items.map((p) => {
              const url = shareUrlFor(p);
              return (
                <li key={p.id} className="px-6 py-4 flex flex-col lg:flex-row lg:items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 truncate">{p.title}</p>
                    <p className="text-xs text-gray-500 truncate">{url}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(p.updated_at || p.created_at).toLocaleString('tr-TR')}
                      {p.file_size ? ` · ${formatSize(p.file_size)}` : ''}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => copyLink(p)}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary text-white text-sm hover:bg-primary-dark transition-colors"
                    >
                      {copiedId === p.id ? <FaCheck /> : <FaCopy />}
                      {copiedId === p.id ? 'Kopyalandı' : 'Linki Kopyala'}
                    </button>
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-300 text-gray-700 text-sm hover:bg-gray-50"
                    >
                      <FaExternalLinkAlt className="text-xs" />
                      Aç
                    </a>
                    <button
                      type="button"
                      onClick={() => startReplace(p)}
                      disabled={replacingId === p.id}
                      title="Link aynı kalır, PDF yenisiyle değişir"
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-300 text-gray-700 text-sm hover:bg-gray-50 disabled:opacity-50"
                    >
                      {replacingId === p.id ? <FaSpinner className="animate-spin" /> : <FaSyncAlt className="text-xs" />}
                      PDF'i Değiştir
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(p)}
                      aria-label={`${p.title} sunumunu sil`}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-red-600 text-sm hover:bg-red-50"
                    >
                      <FaTrash className="text-xs" />
                      Sil
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
        <input
          ref={replaceRef}
          type="file"
          accept="application/pdf,.pdf"
          onChange={handleReplace}
          className="hidden"
          aria-hidden="true"
          tabIndex={-1}
        />
      </div>
    </div>
  );
};

export default AdminPresentations;
