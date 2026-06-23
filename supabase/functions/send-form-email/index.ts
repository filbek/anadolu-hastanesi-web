// ============================================================
// Supabase Edge Function: send-form-email
// Form başvurularını (ikinci görüş, iletişim, hasta geri bildirim)
// admin panelinde site_settings tablosunda belirlenen e-posta
// adresine Resend üzerinden gönderir.
//
// Gerekli secret'lar (supabase secrets set ...):
//   RESEND_API_KEY  -> Resend API anahtarı (zorunlu)
//   RESEND_FROM     -> Gönderen adres, örn "Anadolu Hastaneleri <bildirim@alanadiniz.com>"
//                      (opsiyonel; verilmezse Resend test adresi kullanılır)
//
// SUPABASE_URL ve SUPABASE_SERVICE_ROLE_KEY edge runtime'da otomatik gelir.
// ============================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

type FormType = 'second_opinion' | 'contact' | 'feedback';

// Hangi formun alıcısı hangi site_settings kolonunda
const RECIPIENT_COLUMN: Record<FormType, string> = {
  second_opinion: 'second_opinion_email',
  contact: 'contact_form_email',
  feedback: 'feedback_form_email',
};

const FORM_TITLE: Record<FormType, string> = {
  second_opinion: 'İkinci Görüş Başvurusu',
  contact: 'İletişim Formu Mesajı',
  feedback: 'Hasta Geri Bildirimi',
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
      'info@anadoluhastaneleri.com';

    const apiKey = Deno.env.get('RESEND_API_KEY');
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'RESEND_API_KEY tanımlı değil' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const from =
      Deno.env.get('RESEND_FROM') ||
      'Anadolu Hastaneleri <onboarding@resend.dev>';

    // Ziyaretçi e-postası varsa yanıtla (reply-to) kolaylığı için ekle
    const replyTo =
      typeof data.email === 'string' && data.email.includes('@')
        ? data.email
        : undefined;

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
        subject: `[${FORM_TITLE[formType]}] ${escapeHtml(data.name || '')}`.trim(),
        html: buildHtml(formType, data),
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
