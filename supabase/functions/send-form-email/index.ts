// ============================================================
// Supabase Edge Function: send-form-email
// Form başvurularını (ikinci görüş, iletişim, hasta geri bildirim)
// admin panelinde site_settings tablosunda belirlenen e-posta
// adresine Resend üzerinden gönderir.
//
// İki gönderim yolu desteklenir; SMTP_HOST tanımlıysa SMTP, değilse Resend.
//
// A) SMTP (kurum posta kutusu — DNS doğrulaması gerektirmez):
//   SMTP_HOST      -> örn csmtp.yaanimail.com
//   SMTP_PORT      -> örn 587 (STARTTLS) — 465 verilirse doğrudan TLS
//   SMTP_USER      -> örn isbasvuru@anadoluhastaneleri.com
//   SMTP_PASSWORD  -> posta kutusu şifresi
//   SMTP_FROM      -> opsiyonel; verilmezse SMTP_USER kullanılır
//
// B) Resend (API):
//   RESEND_API_KEY -> Resend API anahtarı
//   RESEND_FROM    -> Gönderen adres, örn "Anadolu Hastaneleri <bildirim@alanadiniz.com>"
//                     (opsiyonel; verilmezse Resend test adresi kullanılır)
//
// Not: Şifreler yalnızca `supabase secrets set ...` ile saklanır, repoya yazılmaz.
//
// SUPABASE_URL ve SUPABASE_SERVICE_ROLE_KEY edge runtime'da otomatik gelir.
// ============================================================

import { createClient, type SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { SMTPClient } from 'https://deno.land/x/denomailer@1.6.0/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

type FormType = 'second_opinion' | 'contact' | 'feedback' | 'job_application';

// Hangi formun alıcısı hangi site_settings kolonunda
const RECIPIENT_COLUMN: Record<FormType, string> = {
  second_opinion: 'second_opinion_email',
  contact: 'contact_form_email',
  feedback: 'feedback_form_email',
  job_application: 'career_form_email',
};

// site_settings okunamazsa / boşsa kullanılacak varsayılan alıcılar
const FALLBACK_RECIPIENT: Record<FormType, string> = {
  second_opinion: 'info@anadoluhastaneleri.com',
  contact: 'info@anadoluhastaneleri.com',
  feedback: 'hastahaklari@anadoluhastaneleri.com',
  job_application: 'isbasvuru@anadoluhastaneleri.com',
};

const FORM_TITLE: Record<FormType, string> = {
  second_opinion: 'İkinci Görüş Başvurusu',
  contact: 'İletişim Formu Mesajı',
  feedback: 'Hasta Geri Bildirimi',
  job_application: 'Yeni İş Başvurusu',
};

function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Form alanlarını okunabilir Türkçe etiketlerle eşle
const FIELD_LABELS: Record<string, string> = {
  name: 'Ad Soyad',
  email: 'E-posta',
  phone: 'Telefon',
  hospital: 'Hastane',
  subject: 'Konu',
  department: 'Birim / Bölüm',
  message: 'Mesaj',
  file_url: 'Ekli Dosya',
  type: 'Bildirim Türü',
};

function buildHtml(formType: FormType, data: Record<string, unknown>): string {
  const rows = Object.entries(data)
    .filter(([, v]) => v !== null && v !== undefined && String(v).trim() !== '')
    .map(([key, value]) => {
      const label = FIELD_LABELS[key] || key;
      let displayValue = escapeHtml(value);
      if (key === 'file_url') {
        displayValue = `<a href="${escapeHtml(value)}" target="_blank">Dosyayı Görüntüle</a>`;
      }
      return `
        <tr>
          <td style="padding:10px 14px;border:1px solid #e5e7eb;background:#f8fafc;font-weight:600;color:#0a1628;white-space:nowrap;vertical-align:top;">${escapeHtml(
            label,
          )}</td>
          <td style="padding:10px 14px;border:1px solid #e5e7eb;color:#374151;white-space:pre-wrap;">${displayValue}</td>
        </tr>`;
    })
    .join('');

  return `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:640px;margin:0 auto;">
    <div style="background:#0a1628;color:#fff;padding:20px 24px;border-radius:12px 12px 0 0;">
      <h2 style="margin:0;font-size:18px;">${escapeHtml(FORM_TITLE[formType])}</h2>
      <p style="margin:6px 0 0;font-size:13px;opacity:.7;">Anadolu Hastaneleri Grubu — web sitesi formu</p>
    </div>
    <table style="width:100%;border-collapse:collapse;font-size:14px;">
      <tbody>${rows}</tbody>
    </table>
    <p style="font-size:12px;color:#9ca3af;padding:14px 24px;">
      Bu e-posta web sitesindeki form üzerinden otomatik olarak gönderilmiştir.
      Gönderim tarihi: ${new Date().toLocaleString('tr-TR', { timeZone: 'Europe/Istanbul' })}
    </p>
  </div>`;
}

// ── İş başvurusu e-postası ───────────────────────────────────
// Beceri puanları formda `hemsireGenel_0` gibi indeksli anahtarlarla gelir.
// Bu liste src/data/jobApplicationSkills.ts ile aynı sırada tutulmalıdır —
// sıra bozulursa e-postada yanlış madde adı görünür.
const JOB_SKILL_BLOCKS: { key: string; title: string; items: string[] }[] = [
  {
    key: 'hemsireGenel',
    title: 'Hemşirelik - Genel',
    items: ['EKG','Defibrilatör','Monitörizasyon','Ambu','Nebulizatör','Aspiratör','Air-Way','Laringoskop','Steteskop','Tansiyon Aleti','İnsülin Kalemi Kullanımı','Damar Yoluna Girme (Yetişkin-Çocuk)','Endoskopi Hazırlığı-Asistanı','Oksijen Tüpü ve Maskeleri','Ventilatör Kullanımı (Yoğun Bakım)','CPR (Kardiyopulmoner Resüsitasyon)','Yara Bakımı','Post-Op Yara Pansumanı','Decübitüs Yara Bakımı','İM Enjeksiyon','İV Enjeksiyon','SC Enjeksiyon','İntra Dermal Enjeksiyon','Lavman Uygulaması','İdrar Sondası Takma ve Bakımı','Nazogastrik Sonda Takma','Orogastrik Sonda Takma','Merkezi Oksijen Sistemi Kullanımı','İlaç Doz Hesaplamaları','Steril Set Açma Tekniği','Anjiyocut Takılması ve Bakımı','Holter Cihazı','Elor Testi','EEG Çekimi','Mide Yıkaması ve Örnek Alınması'],
  },
  {
    key: 'hemsireKadinDogum',
    title: 'Hemşirelik - Kadın Doğum',
    items: ['Vacum','NST Çekimi (TOKO çekimi ve yorumu)','Koter Cihazı Kullanımı','El Doppleri Kullanımı','Perine (Epizyotomi) Bakımı','Post Partum Fundus Muayenesi','Fundus Masajı Uygulaması','Tüşe ile Serviks Değerlendirmesi','Meme Bakımı','Kanama Takibi (Lochia)'],
  },
  {
    key: 'hemsireCocuk',
    title: 'Hemşirelik - Çocuk',
    items: ['Bebek Isıtıcısı','Küvöz','Fototerapi','Çocuk CPR','Çocuk Damar Yoluna Girme','Bebek Göbek ve Göz Bakımı','Exchange Seti Hazırlama ve Asiste Etme'],
  },
  {
    key: 'hemsireAmeliyat',
    title: 'Hemşirelik - Ameliyathane',
    items: ['Laparoskopi ve Endoskopi Sistemi Hazırlanıp Kullanılması','Ameliyathane Mikroskobu Hazırlanıp Kullanılması','Koter','Otoklav (Buharlı Sterilizasyon)','MSU Kuru Sterilizasyon','Soğuk Sterilizasyon','Flaş Otoklav','Poşetleme Cihazı','Masa Hazırlama ve Enstrüman/Asiste Etme','Cerrahi El Yıkama','Cerrahi Alet Bakımı'],
  },
  {
    key: 'labItems',
    title: 'Laboratuvar',
    items: ['Hemogram Cihazı','Otoanalizör','Mikroskop','Tam İdrar Tetkiki','Mikrobiyolojik Tetkikler','Hormon Analizi'],
  },
  {
    key: 'anesteziItems',
    title: 'Anestezi',
    items: ['Monitör','Defibrilatör','Laringoskop','Aspiratör','Anestezi Cihazı ve Vaporizatör','Entübasyon','Resüsitasyon'],
  },
  {
    key: 'rontgenItems',
    title: 'Röntgen ve Görüntüleme',
    items: ['Direkt Röntgen Çekimi','Taş Kırma Ünitesi','Skopi','C Kolu Röntgen (Portabl)','Manuel (El Banyosu)','Otomatik Banyo Yapma','Kontrastlı Röntgen Film Çekimi','Histerografi Çekimi','Mamografi Çekimi','BT Çekimi','MR Çekimi','Periferik Anjiyo Çekimi'],
  },
];

const TD_LABEL =
  'padding:9px 12px;border:1px solid #e5e7eb;background:#f8fafc;font-weight:600;color:#0F1F3A;width:34%;vertical-align:top;';
const TD_VALUE = 'padding:9px 12px;border:1px solid #e5e7eb;color:#374151;white-space:pre-wrap;';

function jobHeading(text: string): string {
  return `<h3 style="color:#0F1F3A;border-bottom:2px solid #E30613;padding-bottom:8px;font-size:16px;margin:26px 0 10px;">${escapeHtml(
    text,
  )}</h3>`;
}

function jobTable(rows: [string, unknown][]): string {
  const body = rows
    .filter(([, v]) => v !== null && v !== undefined && String(v).trim() !== '')
    .map(
      ([label, value]) =>
        `<tr><td style="${TD_LABEL}">${escapeHtml(label)}</td><td style="${TD_VALUE}">${escapeHtml(
          value,
        )}</td></tr>`,
    )
    .join('');
  if (!body) return '';
  return `<table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:6px;"><tbody>${body}</tbody></table>`;
}

// deno-lint-ignore no-explicit-any
// ── Aday belgeleri için süreli imzalı bağlantı ──────────────
//
// Bucket gizlidir; dosyanın kendisi e-postaya EKLENMEZ, çünkü ek olarak
// giden bir vesikalık ileti sunucularında ve arşivlerde kalıcı kopya
// bırakır ve adayın silme talebi uygulanamaz hale gelir. Bunun yerine
// süresi dolduğunda kendiliğinden erişilemez olan imzalı URL konur.
const DOC_LINK_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 gün

const BUCKET = 'job-applications';

/** Kayıttaki değeri bucket içi yola çevirir (eski kayıtlarda tam URL olabilir) */
function toStoragePath(value: string): string {
  if (!/^https?:\/\//i.test(value)) return value;
  const marker = `/${BUCKET}/`;
  const idx = value.indexOf(marker);
  return idx === -1 ? value : decodeURIComponent(value.slice(idx + marker.length));
}

type DocLinks = { photo: string | null; cv: string | null };

/**
 * Başvurunun belge yollarını DB'den okuyup imzalı URL üretir.
 *
 * Yollar istemciden ALINMAZ, reference_code ile sunucuda okunur; aksi halde
 * fonksiyona sahte bir yol gönderen biri başka adayın dosyası için imzalı
 * bağlantı ürettirebilirdi.
 */
async function signApplicationDocuments(
  // Şema tipleri üretilmediği için gevşek istemci tipi
  supabase: SupabaseClient<any>,
  referenceCode: unknown,
): Promise<DocLinks> {
  const empty: DocLinks = { photo: null, cv: null };
  if (typeof referenceCode !== 'string' || !referenceCode) return empty;

  const { data: row, error } = await supabase
    .from('job_applications')
    .select('photo_url, cv_url')
    .eq('reference_code', referenceCode)
    .maybeSingle();

  if (error || !row) {
    console.error('Belge yolları okunamadı:', error);
    return empty;
  }

  const sign = async (value: unknown): Promise<string | null> => {
    if (typeof value !== 'string' || !value) return null;
    const { data, error: signError } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(toStoragePath(value), DOC_LINK_TTL_SECONDS);
    if (signError || !data?.signedUrl) {
      console.error('İmzalı bağlantı üretilemedi:', signError);
      return null;
    }
    return data.signedUrl;
  };

  return { photo: await sign(row.photo_url), cv: await sign(row.cv_url) };
}

function buildJobApplicationHtml(data: Record<string, any>, links: DocLinks): string {
  const parts: string[] = [];

  parts.push(jobHeading('Başvuru Özeti'));
  parts.push(
    jobTable([
      ['Başvuru No', data.reference_code],
      ['Pozisyon', data.position],
      ['Pozisyon Grubu', data.position_group],
      ['Tercih Edilen Hastane', data.hospital],
      ['En Erken Başlama', data.earliest_start_date],
      ['Ücret Beklentisi', data.expected_salary],
    ]),
  );

  parts.push(jobHeading('Kişisel Bilgiler'));
  parts.push(
    jobTable([
      ['Ad Soyad', data.name],
      ['T.C. Kimlik No', data.national_id],
      ['E-posta', data.email],
      ['Telefon', data.phone],
      ['Doğum Yeri / Tarihi', data.birth_place_date],
      ['Adres', data.address],
    ]),
  );

  // Dosyalar ek olarak gönderilmez; 7 gün geçerli imzalı bağlantı verilir.
  // Süre dolduktan sonra belgeler yalnızca panelden açılır.
  if (links.photo || links.cv || data.has_attachments) {
    parts.push(jobHeading('Belgeler'));
    const adminUrl = typeof data.admin_url === 'string' ? data.admin_url : '';
    const linkStyle = 'display:inline-block;margin:0 12px 6px 0;font-size:14px;';
    const rows: string[] = [];

    if (links.photo) {
      rows.push(`<a href="${escapeHtml(links.photo)}" style="${linkStyle}">Fotoğrafı görüntüle</a>`);
    }
    if (links.cv) {
      rows.push(`<a href="${escapeHtml(links.cv)}" style="${linkStyle}">Özgeçmişi görüntüle</a>`);
    }

    if (rows.length) {
      parts.push(`<p style="padding:0 2px;">${rows.join('')}</p>`);
      parts.push(
        `<p style="font-size:12px;color:#6b7280;padding:0 2px;">` +
          `Bu bağlantılar 7 gün geçerlidir. Süre dolduktan sonra belgeler ` +
          (adminUrl
            ? `<a href="${escapeHtml(adminUrl)}">yönetim panelinden</a>`
            : 'yönetim panelinden') +
          ` görüntülenebilir. Aday belgeleri kişisel veridir; bağlantıyı kurum dışına iletmeyiniz.</p>`,
      );
    } else {
      parts.push(
        `<p style="font-size:14px;padding:0 2px;">Adayın belgeleri başvuruya eklidir. ` +
          (adminUrl
            ? `<a href="${escapeHtml(adminUrl)}">Yönetim panelinden görüntüleyin</a>.`
            : 'Yönetim paneli &gt; İnsan Kaynakları &gt; İş Başvuruları bölümünden görüntüleyebilirsiniz.') +
          `</p>`,
      );
    }
  }

  if (Array.isArray(data.education) && data.education.length) {
    parts.push(jobHeading('Eğitim Durumu'));
    parts.push(
      jobTable(
        data.education.map((e: Record<string, unknown>) => [
          String(e.level ?? ''),
          [e.school, e.graduation, e.degree].filter(Boolean).join(' · '),
        ]) as [string, unknown][],
      ),
    );
  }

  if (Array.isArray(data.experience) && data.experience.length) {
    parts.push(jobHeading('İş Deneyimi'));
    data.experience.forEach((x: Record<string, unknown>, i: number) => {
      parts.push(
        jobTable([
          [`${i + 1}. Şirket`, x.company],
          ['Bölüm / Ünvan', x.department],
          ['Tarih Aralığı', x.period],
          ['Ayrılma Sebebi', x.reason],
        ]),
      );
    });
  }

  const skills = (data.skills ?? {}) as Record<string, string>;
  const skillRows: [string, unknown][] = [];
  for (const block of JOB_SKILL_BLOCKS) {
    const scored = block.items
      .map((item, idx) => [item, skills[`${block.key}_${idx}`]] as const)
      .filter(([, v]) => v !== undefined && v !== null && v !== '')
      .map(([item, v]) => `${item}: ${v}`);
    if (scored.length) skillRows.push([block.title, scored.join(' · ')]);
  }
  if (skillRows.length) {
    parts.push(jobHeading('Mesleki Deneyim Puanları (0 = hiç · 3 = çok iyi)'));
    parts.push(jobTable(skillRows));
  }

  if (data.profession_notes) {
    parts.push(jobHeading('Mesleki Yetkinlik Notu'));
    parts.push(jobTable([['Açıklama', data.profession_notes]]));
  }

  const computer = Object.entries((data.computer_skills ?? {}) as Record<string, string>)
    .filter(([, v]) => v);
  const langs = Object.entries((data.languages ?? {}) as Record<string, string>)
    .filter(([, v]) => v);
  if (computer.length || langs.length) {
    parts.push(jobHeading('Bilgisayar ve Yabancı Dil (1 = başlangıç · 4 = çok iyi)'));
    parts.push(
      jobTable([
        ['Bilgisayar', computer.map(([k, v]) => `${k}: ${v}`).join(' · ')],
        ['Yabancı Dil', langs.map(([k, v]) => `${k}: ${v}`).join(' · ')],
      ]),
    );
  }

  if (Array.isArray(data.certificates) && data.certificates.length) {
    parts.push(jobHeading('Kurs / Sertifika / Seminer'));
    parts.push(
      jobTable(
        data.certificates.map((c: Record<string, unknown>) => [
          String(c.name ?? ''),
          [c.institution, c.date, c.duration ? `${c.duration} gün` : ''].filter(Boolean).join(' · '),
        ]) as [string, unknown][],
      ),
    );
  }

  if (Array.isArray(data.references_list) && data.references_list.length) {
    parts.push(jobHeading('Referanslar'));
    parts.push(
      jobTable(
        data.references_list.map((r: Record<string, unknown>) => [
          String(r.name ?? ''),
          [r.company, r.phone, r.duration].filter(Boolean).join(' · '),
        ]) as [string, unknown][],
      ),
    );
  }

  return `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:680px;margin:0 auto;">
    <div style="background:#0F1F3A;color:#fff;padding:20px 24px;border-radius:12px 12px 0 0;">
      <h2 style="margin:0;font-size:18px;">Yeni İş Başvurusu</h2>
      <p style="margin:6px 0 0;font-size:13px;opacity:.7;">
        Anadolu Hastaneleri Grubu — kariyer sayfası başvuru formu
      </p>
    </div>
    <div style="padding:4px 4px 0;">${parts.join('')}</div>
    <p style="font-size:12px;color:#9ca3af;padding:14px 24px;">
      Bu e-posta web sitesindeki başvuru formu üzerinden otomatik olarak gönderilmiştir.
      Başvurunun tamamı admin panelinde <strong>İş Başvuruları</strong> bölümünde görüntülenebilir.
      Gönderim tarihi: ${new Date().toLocaleString('tr-TR', { timeZone: 'Europe/Istanbul' })}
    </p>
  </div>`;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { formType, data } = (await req.json()) as {
      formType: FormType;
      data: Record<string, unknown>;
    };

    if (!formType || !RECIPIENT_COLUMN[formType]) {
      return new Response(
        JSON.stringify({ error: 'Geçersiz formType' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // Alıcı adresi her zaman sunucu tarafında site_settings'ten okunur (güvenlik)
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const column = RECIPIENT_COLUMN[formType];
    const { data: settings } = await supabase
      .from('site_settings')
      .select(column)
      .limit(1)
      .single();

    const recipient =
      (settings as Record<string, string> | null)?.[column] ||
      FALLBACK_RECIPIENT[formType];

    // Ziyaretçi e-postası varsa yanıtla (reply-to) kolaylığı için ekle
    const replyTo =
      typeof data.email === 'string' && data.email.includes('@')
        ? data.email
        : undefined;

    const subject =
      formType === 'job_application'
        ? `[İş Başvurusu] ${String(data.position || '')} — ${String(data.name || '')}`.trim()
        : `[${FORM_TITLE[formType]}] ${String(data.name || '')}`.trim();

    const html =
      formType === 'job_application'
        ? buildJobApplicationHtml(
            data,
            await signApplicationDocuments(supabase, data.reference_code),
          )
        : buildHtml(formType, data);

    const smtpHost = Deno.env.get('SMTP_HOST');

    if (smtpHost) {
      // ── A) Kurum posta kutusu üzerinden SMTP ile gönderim ──
      const port = Number(Deno.env.get('SMTP_PORT') || '587');
      const username = Deno.env.get('SMTP_USER') ?? '';
      const password = Deno.env.get('SMTP_PASSWORD') ?? '';

      if (!username || !password) {
        return new Response(
          JSON.stringify({ error: 'SMTP_USER / SMTP_PASSWORD tanımlı değil' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        );
      }

      const client = new SMTPClient({
        connection: {
          hostname: smtpHost,
          port,
          // 465 => doğrudan TLS, 587 => düz bağlanıp STARTTLS ile yükseltilir
          tls: port === 465,
          auth: { username, password },
        },
      });

      try {
        await client.send({
          from: Deno.env.get('SMTP_FROM') || username,
          to: recipient,
          replyTo,
          subject,
          content: 'auto',
          html,
        });
      } catch (smtpErr) {
        console.error('SMTP error:', smtpErr);
        return new Response(
          JSON.stringify({ error: 'E-posta gönderilemedi', detail: String(smtpErr) }),
          { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        );
      } finally {
        try {
          await client.close();
        } catch {
          // bağlantı zaten kapanmışsa yut
        }
      }
    } else {
      // ── B) Resend API üzerinden gönderim ──
      const apiKey = Deno.env.get('RESEND_API_KEY');
      if (!apiKey) {
        return new Response(
          JSON.stringify({ error: 'SMTP_HOST veya RESEND_API_KEY tanımlı değil' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        );
      }

      const from =
        Deno.env.get('RESEND_FROM') ||
        'Anadolu Hastaneleri <onboarding@resend.dev>';

      const resendRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from,
          to: [recipient],
          reply_to: replyTo,
          subject,
          html,
        }),
      });

      if (!resendRes.ok) {
        const errText = await resendRes.text();
        console.error('Resend error:', errText);
        return new Response(
          JSON.stringify({ error: 'E-posta gönderilemedi', detail: errText }),
          { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        );
      }
    }

    return new Response(
      JSON.stringify({ success: true, recipient }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    console.error('send-form-email error:', err);
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
