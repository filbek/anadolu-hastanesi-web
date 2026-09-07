// ============================================================
// İş başvurusu paylaşım sayfası
//
// İK'nın ürettiği süreli bağlantıyla açılır; panel hesabı gerektirmez.
// Veriyi doğrudan veritabanından OKUMAZ — share-job-application edge
// function'ı yalnızca kapsama giren alanları döner. Kapsam dışı alanlar
// bu sayfaya hiç ulaşmaz.
// ============================================================

import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { FaFilePdf, FaClock, FaUserShield, FaExclamationTriangle } from 'react-icons/fa';
import { supabase } from '../lib/supabase';
import { SKILL_BLOCKS, POSITION_GROUPS, type PositionGroup } from '../data/jobApplicationSkills';

interface SharedApplication {
  [key: string]: any;
}

interface ShareResponse {
  application: SharedApplication;
  cv_url: string | null;
  scope: 'ozet' | 'tam';
  shared_by: string | null;
  shared_at: string;
  expires_at: string;
}

const formatDateTime = (v?: string | null) =>
  v
    ? new Date(v).toLocaleString('tr-TR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '-';

const groupLabel = (value?: string) =>
  POSITION_GROUPS.find((g) => g.value === (value as PositionGroup))?.label ?? value ?? '-';

const YES_NO: Record<string, string> = { evet: 'Evet', hayir: 'Hayır' };

const Row = ({ label, value }: { label: string; value: React.ReactNode }) => {
  if (value === null || value === undefined || value === '' || value === '-') return null;
  return (
    <div className="grid grid-cols-3 gap-3 py-2 border-b border-gray-100 last:border-0">
      <dt className="text-sm font-semibold text-gray-600">{label}</dt>
      <dd className="text-sm text-gray-900 col-span-2 whitespace-pre-wrap break-words">{value}</dd>
    </div>
  );
};

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="mb-6">
    <h2 className="text-sm font-black text-primary uppercase tracking-wide border-b-2 border-primary/20 pb-2 mb-2">
      {title}
    </h2>
    {children}
  </section>
);

const JobApplicationSharePage = () => {
  const { token } = useParams<{ token: string }>();
  const [data, setData] = useState<ShareResponse | null>(null);
  const [state, setState] = useState<'loading' | 'ok' | 'expired' | 'error'>('loading');
  const [message, setMessage] = useState('');

  /*
   * Meta etiketleri DOĞRUDAN yazılır, react-helmet-async ile değil:
   * bu projede Helmet çalışmıyor (başlık ve meta'lar hiçbir sayfada
   * uygulanmıyor), dolayısıyla noindex koruması Helmet'e bırakılamaz.
   * Burada özel nitelikli veri gösterildiği için etiketin gerçekten
   * uygulanması şart.
   *
   * Ek katman: public/robots.txt bu yolu tümden dışlar. Meta etiketi
   * yalnızca JavaScript çalıştıran tarayıcılarda görünür.
   */
  useEffect(() => {
    const previousTitle = document.title;
    document.title = 'Aday Başvurusu';

    const created: HTMLMetaElement[] = [];
    const setMeta = (name: string, content: string) => {
      let tag = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.name = name;
        document.head.appendChild(tag);
        created.push(tag);
      }
      tag.content = content;
    };

    setMeta('robots', 'noindex, nofollow, noarchive');
    // Token'ın Referer başlığıyla üçüncü sitelere sızmasını engeller
    setMeta('referrer', 'no-referrer');

    return () => {
      document.title = previousTitle;
      created.forEach((tag) => tag.remove());
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const { data: res, error } = await supabase.functions.invoke('share-job-application', {
        body: { action: 'resolve', token },
      });

      if (cancelled) return;

      if (error) {
        // Edge function 404 döndüğünde gövdedeki 'expired' işareti okunur
        const response = (error as any).context as Response | undefined;
        let body: any = null;
        if (response) {
          try {
            body = await response.clone().json();
          } catch {
            /* gövde JSON değilse varsayılan mesaj */
          }
        }
        if (body?.error === 'expired') {
          setState('expired');
        } else {
          setState('error');
          setMessage(body?.error ?? error.message);
        }
        return;
      }

      setData(res as ShareResponse);
      setState('ok');
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [token]);


  if (state === 'loading') {
    return (
      <>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary" />
        </div>
      </>
    );
  }

  if (state === 'expired' || state === 'error') {
    return (
      <>
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-sm p-8 text-center">
            <FaExclamationTriangle className="mx-auto text-4xl text-amber-500 mb-4" />
            <h1 className="text-xl font-bold text-gray-900 mb-2">
              {state === 'expired' ? 'Bağlantı geçerli değil' : 'Bir sorun oluştu'}
            </h1>
            <p className="text-sm text-gray-600">
              {state === 'expired'
                ? 'Bu paylaşım bağlantısının süresi dolmuş veya bağlantı iptal edilmiş olabilir. Bağlantıyı sizinle paylaşan kişiden yeni bir bağlantı isteyin.'
                : message || 'Başvuru görüntülenemedi.'}
            </p>
          </div>
        </div>
      </>
    );
  }

  const app = data!.application;
  const isFull = data!.scope === 'tam';

  const scoredSkills = SKILL_BLOCKS.map((block) => {
    const scored = block.items
      .map((item, idx) => ({ item, score: app.skills?.[`${block.key}_${idx}`] }))
      .filter((x) => x.score !== undefined && x.score !== '');
    return scored.length ? { title: block.title, scored } : null;
  }).filter(Boolean) as { title: string; scored: { item: string; score: string }[] }[];

  return (
    <>
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-3xl mx-auto">
          {/* Alıcı bu sayfanın süreli ve kayıt altında olduğunu bilsin */}
          <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 mb-6 text-sm text-amber-900">
            <div className="flex items-start gap-3">
              <FaUserShield className="mt-0.5 shrink-0 text-amber-600" aria-hidden="true" />
              <div>
                <p className="font-semibold">
                  Bu sayfa {data!.shared_by ?? 'İnsan Kaynakları'} tarafından{' '}
                  {formatDateTime(data!.shared_at)} tarihinde paylaşıldı.
                </p>
                <p className="mt-1 flex items-center gap-1.5">
                  <FaClock aria-hidden="true" />
                  {formatDateTime(data!.expires_at)} tarihinde geçersiz olacak. Erişimler kayıt
                  altındadır.
                </p>
                <p className="mt-1">
                  İçerik kişisel veri niteliğindedir; üçüncü kişilerle paylaşmayınız.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
            <div className="mb-6">
              <p className="text-xs font-mono text-gray-500">{app.reference_code}</p>
              <h1 className="text-2xl font-black text-secondary">{app.full_name}</h1>
              <p className="text-gray-600">
                {app.position} · {groupLabel(app.position_group)}
              </p>
              {!isFull && (
                <p className="mt-2 inline-block text-xs font-semibold px-2 py-1 rounded-full bg-slate-100 text-slate-600">
                  Özet görünüm — kimlik ve iletişim bilgileri paylaşılmamıştır
                </p>
              )}
            </div>

            {isFull && (
              <Section title="Kişisel Bilgiler">
                <dl>
                  <Row label="TC Kimlik No" value={app.national_id} />
                  <Row label="Cinsiyet" value={app.gender} />
                  <Row label="Doğum Yeri / Tarihi" value={app.birth_place_date} />
                  <Row label="Medeni Hal" value={app.marital_status} />
                  <Row label="Uyruk" value={app.nationality} />
                  <Row label="Adres" value={app.address} />
                  <Row label="Cep Telefonu" value={app.mobile_phone} />
                  <Row label="Ev Telefonu" value={app.home_phone} />
                  <Row label="E-posta" value={app.email} />
                  <Row label="Kan Grubu" value={app.blood_type} />
                  <Row label="Askerlik" value={app.military_status} />
                  <Row label="Sigara" value={app.smoker} />
                  <Row label="Sağlık Durumu" value={app.health_issues} />
                  <Row label="Son Ücret" value={app.last_salary} />
                  <Row label="Ücret Beklentisi" value={app.expected_salary} />
                </dl>
              </Section>
            )}

            <Section title="Başvuru">
              <dl>
                <Row label="Tercih Edilen Hastane" value={app.hospital} />
                <Row label="Tercih Edilen Şehirler" value={app.preferred_cities?.join(', ')} />
                <Row label="En Erken Başlama" value={app.earliest_start_date} />
                <Row label="Sürücü Belgesi" value={app.drivers_license} />
                <Row label="Başvuru Tarihi" value={formatDateTime(app.created_at)} />
              </dl>
            </Section>

            {app.education?.length > 0 && (
              <Section title="Eğitim">
                <ul className="space-y-2">
                  {app.education.map((e: any, i: number) => (
                    <li key={i} className="text-sm border border-gray-200 rounded-lg p-3">
                      <div className="font-semibold text-gray-900">{e.school}</div>
                      <div className="text-gray-600">
                        {[e.level, e.degree, e.graduation].filter(Boolean).join(' · ')}
                      </div>
                    </li>
                  ))}
                </ul>
              </Section>
            )}

            {app.experience?.length > 0 && (
              <Section title="İş Deneyimi">
                <ul className="space-y-2">
                  {app.experience.map((e: any, i: number) => (
                    <li key={i} className="text-sm border border-gray-200 rounded-lg p-3">
                      <div className="font-semibold text-gray-900">{e.company}</div>
                      <div className="text-gray-600">
                        {[e.department, e.period].filter(Boolean).join(' · ')}
                      </div>
                      {e.reason && (
                        <div className="text-gray-500 mt-1">Ayrılma nedeni: {e.reason}</div>
                      )}
                    </li>
                  ))}
                </ul>
              </Section>
            )}

            {scoredSkills.length > 0 && (
              <Section title="Mesleki Beceriler">
                {scoredSkills.map((block) => (
                  <div key={block.title} className="mb-4">
                    <h3 className="text-sm font-bold text-gray-800 mb-1">{block.title}</h3>
                    <ul className="text-sm text-gray-700 grid sm:grid-cols-2 gap-x-4">
                      {block.scored.map((x, i) => (
                        <li key={i} className="flex justify-between gap-2 py-0.5">
                          <span>{x.item}</span>
                          <span className="font-mono text-gray-500">{x.score}/3</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
                <p className="text-xs text-gray-500">0 = hiç, 1 = çok az, 2 = iyi, 3 = çok iyi</p>
              </Section>
            )}

            {app.certificates?.length > 0 && (
              <Section title="Sertifikalar">
                <ul className="space-y-2">
                  {app.certificates.map((c: any, i: number) => (
                    <li key={i} className="text-sm border border-gray-200 rounded-lg p-3">
                      <div className="font-semibold text-gray-900">{c.name}</div>
                      <div className="text-gray-600">
                        {[c.institution, c.date, c.duration].filter(Boolean).join(' · ')}
                      </div>
                    </li>
                  ))}
                </ul>
              </Section>
            )}

            {app.references_list?.length > 0 && (
              <Section title="Referanslar">
                <ul className="space-y-2">
                  {app.references_list.map((r: any, i: number) => (
                    <li key={i} className="text-sm border border-gray-200 rounded-lg p-3">
                      <div className="font-semibold text-gray-900">{r.name}</div>
                      <div className="text-gray-600">
                        {[r.company, r.duration].filter(Boolean).join(' · ')}
                      </div>
                      {/* Referans telefonu yalnızca tam kayıt paylaşımında */}
                      {isFull && r.phone && <div className="text-gray-600">{r.phone}</div>}
                    </li>
                  ))}
                </ul>
              </Section>
            )}

            <Section title="Çalışma Koşulları">
              <dl>
                <Row label="Fazla Mesai" value={YES_NO[app.overtime ?? '']} />
                <Row label="Hafta Sonu" value={YES_NO[app.weekend_work ?? '']} />
                <Row label="Gece Vardiyası" value={YES_NO[app.night_shift ?? '']} />
                <Row label="Resmî Tatil" value={YES_NO[app.public_holiday ?? '']} />
                <Row label="Seyahat Engeli" value={YES_NO[app.travel ?? '']} />
              </dl>
            </Section>

            {app.profession_notes && (
              <Section title="Aday Notu">
                <p className="text-sm text-gray-900 whitespace-pre-wrap">{app.profession_notes}</p>
              </Section>
            )}

            {data!.cv_url && (
              <a
                href={data!.cv_url}
                target="_blank"
                rel="noopener noreferrer nofollow"
                referrerPolicy="no-referrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-white font-semibold hover:brightness-110"
              >
                <FaFilePdf />
                Özgeçmişi Aç
              </a>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default JobApplicationSharePage;
