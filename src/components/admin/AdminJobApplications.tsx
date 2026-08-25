// ============================================================
// Admin > İş Başvuruları
//
// Kariyer sayfasındaki başvuru formundan gelen kayıtların listesi,
// detay görünümü, durum takibi ve CSV dışa aktarımı.
// Kayıtlar TC kimlik / adres gibi hassas veri içerir; tablo RLS ile
// yalnızca oturum açmış kullanıcılara okunabilir (bkz. migration).
// ============================================================

import { useState, useEffect, useMemo } from 'react';
import {
  FaSearch,
  FaTrash,
  FaEye,
  FaTimes,
  FaFileCsv,
  FaPhone,
  FaEnvelope,
  FaIdCard,
  FaPaperclip,
  FaBriefcase,
} from 'react-icons/fa';
import { supabase } from '../../lib/supabase';
import {
  SKILL_BLOCKS,
  POSITION_GROUPS,
  type PositionGroup,
} from '../../data/jobApplicationSkills';

interface JobApplication {
  id: number;
  reference_code: string;
  position: string;
  position_group: string;
  hospital: string | null;
  full_name: string;
  national_id: string;
  gender: string | null;
  birth_place_date: string | null;
  marital_status: string | null;
  nationality: string | null;
  address: string | null;
  mobile_phone: string;
  home_phone: string | null;
  alternative_phone: string | null;
  email: string;
  blood_type: string | null;
  drivers_license: string | null;
  military_status: string | null;
  smoker: string | null;
  health_issues: string | null;
  preferred_cities: string[] | null;
  photo_url: string | null;
  cv_url: string | null;
  education: { level: string; school: string; graduation: string; degree: string }[];
  experience: { company: string; department: string; period: string; reason: string }[];
  skills: Record<string, string>;
  computer_skills: Record<string, string>;
  languages: Record<string, string>;
  certificates: { name: string; date: string; institution: string; duration: string }[];
  references_list: { name: string; company: string; phone: string; duration: string }[];
  profession_notes: string | null;
  earliest_start_date: string | null;
  overtime: string | null;
  weekend_work: string | null;
  night_shift: string | null;
  public_holiday: string | null;
  travel: string | null;
  last_salary: string | null;
  expected_salary: string | null;
  status: string;
  admin_note: string | null;
  is_read: boolean;
  created_at: string;
}

const STATUS_OPTIONS = [
  { value: 'yeni', label: 'Yeni', className: 'bg-blue-100 text-blue-800' },
  { value: 'incelendi', label: 'İncelendi', className: 'bg-gray-100 text-gray-800' },
  { value: 'gorusme', label: 'Görüşmeye Çağrıldı', className: 'bg-amber-100 text-amber-800' },
  { value: 'olumlu', label: 'Olumlu', className: 'bg-green-100 text-green-800' },
  { value: 'olumsuz', label: 'Olumsuz', className: 'bg-red-100 text-red-800' },
  { value: 'arsiv', label: 'Arşiv', className: 'bg-slate-100 text-slate-600' },
];

const statusMeta = (value: string) =>
  STATUS_OPTIONS.find((s) => s.value === value) ?? STATUS_OPTIONS[0];

const groupLabel = (value: string) =>
  POSITION_GROUPS.find((g) => g.value === (value as PositionGroup))?.label ?? value;

const formatDate = (v: string | null) =>
  v ? new Date(v).toLocaleString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '-';

const formatDateTime = (v: string) =>
  new Date(v).toLocaleString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

const YES_NO_LABEL: Record<string, string> = { evet: 'Evet', hayir: 'Hayır' };

/** Beceri puanlarını `hemsireGenel_0` anahtarından okunabilir metne çevirir */
const readableSkills = (skills: Record<string, string>) =>
  SKILL_BLOCKS.map((block) => {
    const scored = block.items
      .map((item, idx) => ({ item, score: skills?.[`${block.key}_${idx}`] }))
      .filter((x) => x.score !== undefined && x.score !== '');
    return scored.length ? { title: block.title, scored } : null;
  }).filter(Boolean) as { title: string; scored: { item: string; score: string }[] }[];

const DetailRow = ({ label, value }: { label: string; value: React.ReactNode }) => {
  if (value === null || value === undefined || value === '' || value === '-') return null;
  return (
    <div className="grid grid-cols-3 gap-3 py-2 border-b border-gray-100 last:border-0">
      <dt className="text-sm font-semibold text-gray-600 col-span-1">{label}</dt>
      <dd className="text-sm text-gray-900 col-span-2 whitespace-pre-wrap break-words">{value}</dd>
    </div>
  );
};

const DetailSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="mb-6">
    <h3 className="text-sm font-black text-primary uppercase tracking-wide border-b-2 border-primary/20 pb-2 mb-2">
      {title}
    </h3>
    {children}
  </section>
);

const AdminJobApplications = () => {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [groupFilter, setGroupFilter] = useState('all');
  const [selected, setSelected] = useState<JobApplication | null>(null);
  const [noteDraft, setNoteDraft] = useState('');

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('job_applications')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setApplications((data ?? []) as JobApplication[]);
    } catch (err) {
      console.error('Başvurular yüklenemedi:', err);
    } finally {
      setLoading(false);
    }
  };

  const openDetail = async (app: JobApplication) => {
    setSelected(app);
    setNoteDraft(app.admin_note ?? '');
    if (!app.is_read) {
      await supabase.from('job_applications').update({ is_read: true }).eq('id', app.id);
      setApplications((prev) => prev.map((a) => (a.id === app.id ? { ...a, is_read: true } : a)));
    }
  };

  const updateStatus = async (id: number, status: string) => {
    const { error } = await supabase.from('job_applications').update({ status }).eq('id', id);
    if (error) return console.error('Durum güncellenemedi:', error);
    setApplications((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
    setSelected((prev) => (prev && prev.id === id ? { ...prev, status } : prev));
  };

  const saveNote = async () => {
    if (!selected) return;
    const { error } = await supabase
      .from('job_applications')
      .update({ admin_note: noteDraft })
      .eq('id', selected.id);
    if (error) return console.error('Not kaydedilemedi:', error);
    setApplications((prev) =>
      prev.map((a) => (a.id === selected.id ? { ...a, admin_note: noteDraft } : a))
    );
    setSelected({ ...selected, admin_note: noteDraft });
  };

  const remove = async (id: number) => {
    if (!confirm('Bu başvuruyu kalıcı olarak silmek istediğinizden emin misiniz?')) return;
    const { error } = await supabase.from('job_applications').delete().eq('id', id);
    if (error) {
      console.error('Başvuru silinemedi:', error);
      alert('Silme işlemi başarısız oldu.');
      return;
    }
    setApplications((prev) => prev.filter((a) => a.id !== id));
    if (selected?.id === id) setSelected(null);
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return applications.filter((a) => {
      const matchesSearch =
        !q ||
        a.full_name.toLowerCase().includes(q) ||
        a.email.toLowerCase().includes(q) ||
        a.position.toLowerCase().includes(q) ||
        a.mobile_phone.includes(q) ||
        a.reference_code.toLowerCase().includes(q);
      const matchesStatus = statusFilter === 'all' || a.status === statusFilter;
      const matchesGroup = groupFilter === 'all' || a.position_group === groupFilter;
      return matchesSearch && matchesStatus && matchesGroup;
    });
  }, [applications, search, statusFilter, groupFilter]);

  /** Excel'de açılabilmesi için UTF-8 BOM'lu, noktalı virgül ayraçlı CSV */
  const exportCsv = () => {
    const headers = [
      'Başvuru No', 'Tarih', 'Ad Soyad', 'TC Kimlik', 'Pozisyon', 'Pozisyon Grubu',
      'Hastane', 'E-posta', 'Cep Telefonu', 'Ücret Beklentisi', 'Durum',
    ];
    const escape = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const rows = filtered.map((a) =>
      [
        a.reference_code, formatDateTime(a.created_at), a.full_name, a.national_id,
        a.position, groupLabel(a.position_group), a.hospital ?? '', a.email,
        a.mobile_phone, a.expected_salary ?? '', statusMeta(a.status).label,
      ].map(escape).join(';')
    );
    const csv = '﻿' + [headers.map(escape).join(';'), ...rows].join('\r\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `is-basvurulari-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const unreadCount = applications.filter((a) => !a.is_read).length;

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-500">Başvurular yükleniyor...</div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      {/* Başlık */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-primary flex items-center gap-3">
            <FaBriefcase />
            İş Başvuruları
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Toplam {applications.length} başvuru
            {unreadCount > 0 && (
              <span className="ml-2 px-2 py-0.5 rounded-full bg-accent text-white text-xs font-bold">
                {unreadCount} okunmamış
              </span>
            )}
          </p>
        </div>
        <button
          onClick={exportCsv}
          disabled={filtered.length === 0}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 disabled:opacity-50 transition-colors"
        >
          <FaFileCsv />
          CSV İndir ({filtered.length})
        </button>
      </div>

      {/* Filtreler */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6 grid md:grid-cols-3 gap-3">
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Ad, e-posta, pozisyon, başvuru no..."
            aria-label="Başvurularda ara"
            className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          aria-label="Duruma göre filtrele"
          className="px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="all">Tüm durumlar</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
        <select
          value={groupFilter}
          onChange={(e) => setGroupFilter(e.target.value)}
          aria-label="Pozisyon grubuna göre filtrele"
          className="px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="all">Tüm pozisyon grupları</option>
          {POSITION_GROUPS.map((g) => (
            <option key={g.value} value={g.value}>{g.label}</option>
          ))}
        </select>
      </div>

      {/* Liste */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center text-gray-500">
          {applications.length === 0
            ? 'Henüz başvuru bulunmuyor.'
            : 'Arama kriterlerine uyan başvuru bulunamadı.'}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left">
              <tr>
                <th scope="col" className="px-4 py-3 font-semibold text-gray-600">Aday</th>
                <th scope="col" className="px-4 py-3 font-semibold text-gray-600">Pozisyon</th>
                <th scope="col" className="px-4 py-3 font-semibold text-gray-600 hidden lg:table-cell">İletişim</th>
                <th scope="col" className="px-4 py-3 font-semibold text-gray-600">Durum</th>
                <th scope="col" className="px-4 py-3 font-semibold text-gray-600 hidden md:table-cell">Tarih</th>
                <th scope="col" className="px-4 py-3 font-semibold text-gray-600 text-right">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((a) => (
                <tr key={a.id} className={a.is_read ? '' : 'bg-blue-50/40'}>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-gray-900 flex items-center gap-2">
                      {!a.is_read && (
                        <span className="w-2 h-2 rounded-full bg-accent shrink-0" aria-label="Okunmadı" />
                      )}
                      {a.full_name}
                    </div>
                    <div className="text-xs text-gray-500 font-mono">{a.reference_code}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-gray-900">{a.position}</div>
                    <div className="text-xs text-gray-500">{groupLabel(a.position_group)}</div>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell text-gray-600">
                    <div>{a.email}</div>
                    <div className="text-xs">{a.mobile_phone}</div>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={a.status}
                      onChange={(e) => updateStatus(a.id, e.target.value)}
                      aria-label={`${a.full_name} başvuru durumu`}
                      className={`text-xs font-bold px-2.5 py-1.5 rounded-full border-0 cursor-pointer ${statusMeta(a.status).className}`}
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-gray-500 text-xs whitespace-nowrap">
                    {formatDateTime(a.created_at)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openDetail(a)}
                        className="p-2 rounded-lg text-primary hover:bg-primary/10 transition-colors"
                        aria-label={`${a.full_name} başvurusunu görüntüle`}
                      >
                        <FaEye />
                      </button>
                      <button
                        onClick={() => remove(a.id)}
                        className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                        aria-label={`${a.full_name} başvurusunu sil`}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Detay */}
      {selected && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-label={`${selected.full_name} başvuru detayı`}
          onClick={(e) => e.target === e.currentTarget && setSelected(null)}
        >
          <div className="bg-white rounded-2xl w-full max-w-3xl my-8 shadow-2xl">
            <div className="sticky top-0 bg-primary text-white px-6 py-4 rounded-t-2xl flex items-start justify-between gap-4 z-10">
              <div>
                <h2 className="text-lg font-bold">{selected.full_name}</h2>
                <p className="text-sm text-white/70">
                  {selected.position} · {selected.reference_code}
                </p>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                aria-label="Kapat"
              >
                <FaTimes />
              </button>
            </div>

            <div className="p-6">
              {/* Hızlı işlemler */}
              <div className="flex flex-wrap gap-2 mb-6">
                <a
                  href={`mailto:${selected.email}`}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:brightness-125"
                >
                  <FaEnvelope /> E-posta Gönder
                </a>
                <a
                  href={`tel:${selected.mobile_phone}`}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-sm font-semibold hover:border-primary"
                >
                  <FaPhone /> Ara
                </a>
                {selected.cv_url && (
                  <a
                    href={selected.cv_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-sm font-semibold hover:border-primary"
                  >
                    <FaPaperclip /> Özgeçmiş
                  </a>
                )}
                {selected.photo_url && (
                  <a
                    href={selected.photo_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-sm font-semibold hover:border-primary"
                  >
                    <FaIdCard /> Fotoğraf
                  </a>
                )}
              </div>

              <DetailSection title="Başvuru">
                <dl>
                  <DetailRow label="Başvuru No" value={selected.reference_code} />
                  <DetailRow label="Başvuru Tarihi" value={formatDateTime(selected.created_at)} />
                  <DetailRow label="Pozisyon" value={selected.position} />
                  <DetailRow label="Pozisyon Grubu" value={groupLabel(selected.position_group)} />
                  <DetailRow label="Tercih Edilen Hastane" value={selected.hospital} />
                  <DetailRow label="En Erken Başlama" value={formatDate(selected.earliest_start_date)} />
                  <DetailRow label="Son Ücret" value={selected.last_salary} />
                  <DetailRow label="Ücret Beklentisi" value={selected.expected_salary} />
                </dl>
              </DetailSection>

              <DetailSection title="Kişisel Bilgiler">
                <dl>
                  <DetailRow label="T.C. Kimlik No" value={selected.national_id} />
                  <DetailRow label="E-posta" value={selected.email} />
                  <DetailRow label="Cep Telefonu" value={selected.mobile_phone} />
                  <DetailRow label="Ev Telefonu" value={selected.home_phone} />
                  <DetailRow label="Alternatif Telefon" value={selected.alternative_phone} />
                  <DetailRow label="Doğum Yeri / Tarihi" value={selected.birth_place_date} />
                  <DetailRow label="Cinsiyet" value={selected.gender === 'kadin' ? 'Kadın' : selected.gender === 'erkek' ? 'Erkek' : null} />
                  <DetailRow label="Medeni Hâl" value={selected.marital_status} />
                  <DetailRow label="Uyruk" value={selected.nationality} />
                  <DetailRow label="Kan Grubu" value={selected.blood_type} />
                  <DetailRow label="Ehliyet" value={selected.drivers_license} />
                  <DetailRow label="Askerlik" value={selected.military_status} />
                  <DetailRow label="Sigara" value={YES_NO_LABEL[selected.smoker ?? '']} />
                  <DetailRow label="Adres" value={selected.address} />
                  <DetailRow label="Sağlık Problemi" value={selected.health_issues} />
                  <DetailRow
                    label="Tercih Edilen Şehirler"
                    value={selected.preferred_cities?.length ? selected.preferred_cities.join(', ') : null}
                  />
                </dl>
              </DetailSection>

              {selected.education?.length > 0 && (
                <DetailSection title="Eğitim">
                  <dl>
                    {selected.education.map((e, i) => (
                      <DetailRow
                        key={i}
                        label={e.level}
                        value={[e.school, e.graduation, e.degree].filter(Boolean).join(' · ')}
                      />
                    ))}
                  </dl>
                </DetailSection>
              )}

              {selected.experience?.length > 0 && (
                <DetailSection title="İş Deneyimi">
                  <div className="space-y-3">
                    {selected.experience.map((x, i) => (
                      <div key={i} className="bg-gray-50 rounded-lg p-3">
                        <div className="font-semibold text-gray-900">{x.company}</div>
                        <div className="text-sm text-gray-600">
                          {[x.department, x.period].filter(Boolean).join(' · ')}
                        </div>
                        {x.reason && (
                          <div className="text-xs text-gray-500 mt-1">Ayrılma sebebi: {x.reason}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </DetailSection>
              )}

              {readableSkills(selected.skills ?? {}).length > 0 && (
                <DetailSection title="Mesleki Deneyim (0 = hiç · 3 = çok iyi)">
                  <div className="space-y-3">
                    {readableSkills(selected.skills).map((block) => (
                      <div key={block.title}>
                        <h4 className="text-xs font-bold text-gray-500 uppercase mb-1.5">{block.title}</h4>
                        <div className="flex flex-wrap gap-1.5">
                          {block.scored.map((s) => (
                            <span
                              key={s.item}
                              className="text-xs px-2 py-1 rounded-md bg-gray-100 text-gray-700"
                            >
                              {s.item} <strong className="text-primary">{s.score}</strong>
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </DetailSection>
              )}

              {selected.profession_notes && (
                <DetailSection title="Mesleki Yetkinlik Notu">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 rounded-lg p-3">
                    {selected.profession_notes}
                  </p>
                </DetailSection>
              )}

              {(Object.keys(selected.computer_skills ?? {}).length > 0 ||
                Object.keys(selected.languages ?? {}).length > 0) && (
                <DetailSection title="Bilgisayar ve Yabancı Dil (1 = başlangıç · 4 = çok iyi)">
                  <dl>
                    <DetailRow
                      label="Bilgisayar"
                      value={Object.entries(selected.computer_skills ?? {})
                        .filter(([, v]) => v)
                        .map(([k, v]) => `${k}: ${v}`)
                        .join(' · ')}
                    />
                    <DetailRow
                      label="Yabancı Dil"
                      value={Object.entries(selected.languages ?? {})
                        .filter(([, v]) => v)
                        .map(([k, v]) => `${k}: ${v}`)
                        .join(' · ')}
                    />
                  </dl>
                </DetailSection>
              )}

              {selected.certificates?.length > 0 && (
                <DetailSection title="Sertifikalar">
                  <dl>
                    {selected.certificates.map((c, i) => (
                      <DetailRow
                        key={i}
                        label={c.name}
                        value={[c.institution, c.date, c.duration && `${c.duration} gün`]
                          .filter(Boolean)
                          .join(' · ')}
                      />
                    ))}
                  </dl>
                </DetailSection>
              )}

              {selected.references_list?.length > 0 && (
                <DetailSection title="Referanslar">
                  <dl>
                    {selected.references_list.map((r, i) => (
                      <DetailRow
                        key={i}
                        label={r.name}
                        value={[r.company, r.phone, r.duration].filter(Boolean).join(' · ')}
                      />
                    ))}
                  </dl>
                </DetailSection>
              )}

              <DetailSection title="Çalışma Koşulları">
                <dl>
                  <DetailRow label="Fazla Mesai" value={YES_NO_LABEL[selected.overtime ?? '']} />
                  <DetailRow label="Hafta Sonu" value={YES_NO_LABEL[selected.weekend_work ?? '']} />
                  <DetailRow label="Gece Vardiyası" value={YES_NO_LABEL[selected.night_shift ?? '']} />
                  <DetailRow label="Resmî Tatil" value={YES_NO_LABEL[selected.public_holiday ?? '']} />
                  <DetailRow label="Seyahat Engeli" value={YES_NO_LABEL[selected.travel ?? '']} />
                </dl>
              </DetailSection>

              <DetailSection title="İK Notu">
                <textarea
                  value={noteDraft}
                  onChange={(e) => setNoteDraft(e.target.value)}
                  rows={3}
                  aria-label="İnsan kaynakları notu"
                  placeholder="Görüşme notu, değerlendirme..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button
                  onClick={saveNote}
                  className="mt-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:brightness-125"
                >
                  Notu Kaydet
                </button>
              </DetailSection>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminJobApplications;
