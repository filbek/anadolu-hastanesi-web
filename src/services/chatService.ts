import { supabase } from '../lib/supabase';

/**
 * Canlı destek (live chat) servis katmanı.
 *
 * İki farklı erişim yolu vardır ve karıştırılmamalıdır:
 *
 * - ZİYARETÇİ: tablolara doğrudan erişimi yoktur. Her şey `chat_*` RPC'leri
 *   üzerinden, konuşmaya özel `access_token` ile yapılır. Anon rolünün SELECT
 *   hakkı olmadığı için Realtime dinleyemez; widget açıkken polling kullanılır.
 *
 * - OPERATÖR: admin olarak giriş yapmıştır, RLS ona tam erişim verir.
 *   Tabloları doğrudan okur ve Realtime ile anlık güncellenir.
 *
 * Şema ve gerekçeler: src/sql/live_chat_migration.sql
 */

export type ChatSenderRole = 'visitor' | 'agent' | 'system';
export type ChatStatus = 'open' | 'active' | 'closed';

export interface ChatMessage {
  id: number;
  conversation_id?: string;
  sender_role: ChatSenderRole;
  sender_name: string | null;
  content: string;
  created_at: string;
  attachment_url?: string | null;
  attachment_name?: string | null;
  attachment_type?: string | null;
  attachment_size?: number | null;
}

/** Operatörün "/" ile çağırdığı hazır metin */
export interface CannedResponse {
  id: number;
  shortcut: string;
  title: string;
  content: string;
  category: string | null;
  display_order: number;
  is_active: boolean;
  use_count: number;
}

export interface ChatConversation {
  id: string;
  visitor_name: string | null;
  visitor_email: string | null;
  visitor_phone: string | null;
  subject: string | null;
  hospital_name: string | null;
  status: ChatStatus;
  page_url: string | null;
  user_agent: string | null;
  assigned_to: string | null;
  assigned_name: string | null;
  last_message_at: string;
  visitor_read_at: string;
  agent_read_at: string | null;
  created_at: string;
  closed_at: string | null;
  /** Otomatik (içerik kuralları) + operatörün elle eklediği etiketler */
  tags: string[];
  /** Görüşme sonu memnuniyet anketi (1-5); puanlanmadıysa null */
  rating: number | null;
  rating_comment: string | null;
  rated_at: string | null;
}

/** Otomatik etiketleme kuralı — Admin > Canlı Destek Etiketleri */
export interface ChatTag {
  id: number;
  name: string;
  color: string;
  /** Bu kelimelerden biri ziyaretçi mesajında geçerse etiket atanır */
  keywords: string[];
  is_active: boolean;
  display_order: number;
}

export interface ChatSettings {
  is_enabled: boolean;
  widget_title: string;
  widget_subtitle: string;
  welcome_message: string;
  offline_message: string;
  agent_display_name: string;
  agent_avatar_url: string | null;
  require_name: boolean;
  require_phone: boolean;
  require_email: boolean;
  /**
   * Açıkken çalışma günü/saati hiç değerlendirilmez, widget her zaman
   * çevrimiçi görünür. Hastane çağrı merkezi 7/24 çalıştığı için
   * varsayılan budur.
   */
  is_24_7: boolean;
  /** 1 = Pazartesi ... 7 = Pazar */
  online_days: number[];
  /** "HH:MM" veya "HH:MM:SS" */
  online_start: string;
  online_end: string;
  whatsapp_fallback_number: string | null;
  quick_replies: string[];
  consent_text: string | null;
  /** Dosya eki: varsayılan kapalı — bkz. CHAT_SETUP.md gizlilik notu */
  allow_attachments: boolean;
  max_attachment_mb: number;
}

export const DEFAULT_CHAT_SETTINGS: ChatSettings = {
  is_enabled: false, // ayarlar okunamazsa widget açılmasın
  widget_title: 'Canlı Destek',
  widget_subtitle: 'Genellikle birkaç dakika içinde yanıtlıyoruz',
  welcome_message:
    'Merhaba! 👋 Anadolu Hastaneleri Grubu canlı destek hattına hoş geldiniz. Size nasıl yardımcı olabiliriz?',
  offline_message:
    'Şu anda çevrimiçi değiliz. Mesajınızı bırakın, mesai saatlerinde size dönüş yapalım.',
  agent_display_name: 'Hasta Danışmanı',
  agent_avatar_url: null,
  require_name: true,
  require_phone: true,
  require_email: false,
  is_24_7: true,
  online_days: [1, 2, 3, 4, 5, 6, 7],
  online_start: '08:00',
  online_end: '20:00',
  whatsapp_fallback_number: null,
  quick_replies: [],
  consent_text: null,
  allow_attachments: false,
  max_attachment_mb: 5,
};

// ============================================================
// Ayarlar
// ============================================================

export async function fetchChatSettings(): Promise<ChatSettings> {
  const { data, error } = await supabase
    .from('chat_settings')
    .select('*')
    .eq('id', 1)
    .maybeSingle();

  if (error || !data) {
    if (error) console.error('Canlı destek ayarları okunamadı:', error);
    return DEFAULT_CHAT_SETTINGS;
  }

  return {
    ...DEFAULT_CHAT_SETTINGS,
    ...data,
    // jsonb string olarak da gelebilir
    quick_replies: normalizeQuickReplies(data.quick_replies),
    online_days: Array.isArray(data.online_days) ? data.online_days : [1, 2, 3, 4, 5],
  };
}

function normalizeQuickReplies(raw: unknown): string[] {
  if (Array.isArray(raw)) return raw.map(String).filter(Boolean);
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.map(String).filter(Boolean) : [];
    } catch {
      return [];
    }
  }
  return [];
}

/**
 * Çalışma saatleri içinde miyiz?
 *
 * `is_24_7` açıksa saatlere hiç bakılmaz — hastane çağrı merkezi kesintisiz
 * çalıştığı için widget'ın çevrimdışı görünmesi kabul edilmiyor.
 *
 * Kapalıysa: ziyaretçinin cihaz saati yanlış ya da farklı saat diliminde
 * olabileceği için karşılaştırma her zaman Europe/Istanbul'a çevrilerek yapılır.
 */
export function isWithinWorkingHours(settings: ChatSettings, now: Date = new Date()): boolean {
  if (settings.is_24_7) return true;

  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Istanbul',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(now);

  const get = (type: string) => parts.find((p) => p.type === type)?.value || '';

  // ISO-8601: Pazartesi = 1 ... Pazar = 7
  const dayMap: Record<string, number> = {
    Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 7,
  };
  const day = dayMap[get('weekday')];
  if (!day || !settings.online_days.includes(day)) return false;

  const minutes = parseInt(get('hour'), 10) * 60 + parseInt(get('minute'), 10);
  const toMinutes = (t: string) => {
    const [h, m] = (t || '00:00').split(':');
    return parseInt(h, 10) * 60 + parseInt(m || '0', 10);
  };

  const start = toMinutes(settings.online_start);
  const end = toMinutes(settings.online_end);

  // Gece yarısını aşan aralık (ör. 20:00 - 02:00)
  if (end <= start) return minutes >= start || minutes < end;
  return minutes >= start && minutes < end;
}

// ============================================================
// Ziyaretçi oturumu (localStorage)
// ============================================================

const SESSION_KEY = 'ahg_chat_session';

export interface ChatSession {
  conversationId: string;
  accessToken: string;
  /** Ön formu tekrar doldurtmamak için */
  visitorName?: string;
  visitorPhone?: string;
  visitorEmail?: string;
}

export function loadChatSession(): ChatSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ChatSession;
    if (!parsed?.conversationId || !parsed?.accessToken) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveChatSession(session: ChatSession): void {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch {
    // Gizli sekmede localStorage yazılamayabilir — sohbet yine de çalışır,
    // yalnızca sayfa yenilenince geçmiş kaybolur.
  }
}

export function clearChatSession(): void {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch {
    /* yoksay */
  }
}

// ============================================================
// Ziyaretçi işlemleri (RPC)
// ============================================================

export interface StartConversationInput {
  name?: string;
  phone?: string;
  email?: string;
  subject?: string;
  hospitalName?: string;
  message: string;
}

export async function startConversation(
  input: StartConversationInput,
): Promise<ChatSession> {
  const { data, error } = await supabase.rpc('chat_start_conversation', {
    p_name: input.name || null,
    p_phone: input.phone || null,
    p_email: input.email || null,
    p_subject: input.subject || null,
    p_hospital_name: input.hospitalName || null,
    p_page_url: typeof window !== 'undefined' ? window.location.href : null,
    p_user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
    p_message: input.message,
  });

  if (error) throw error;

  // RETURNS TABLE tek satırlık dizi olarak gelir
  const row = Array.isArray(data) ? data[0] : data;
  if (!row?.conversation_id || !row?.access_token) {
    throw new Error('Görüşme başlatılamadı.');
  }

  const session: ChatSession = {
    conversationId: row.conversation_id,
    accessToken: row.access_token,
    visitorName: input.name,
    visitorPhone: input.phone,
    visitorEmail: input.email,
  };
  saveChatSession(session);
  return session;
}

export interface AttachmentPayload {
  url: string;
  name: string;
  type: string;
  size: number;
}

export async function sendVisitorMessage(
  session: ChatSession,
  content: string,
  attachment?: AttachmentPayload,
): Promise<void> {
  const { error } = await supabase.rpc('chat_post_visitor_message', {
    p_conversation_id: session.conversationId,
    p_token: session.accessToken,
    p_content: content,
    p_attachment_url: attachment?.url ?? null,
    p_attachment_name: attachment?.name ?? null,
    p_attachment_type: attachment?.type ?? null,
    p_attachment_size: attachment?.size ?? null,
  });
  if (error) throw error;
}

export interface PollResult {
  messages: ChatMessage[];
  status: ChatStatus;
  /** Operatör şu an yazıyor mu (son 8 saniye içinde sinyal geldi mi) */
  agentTyping: boolean;
  /** Görüşme daha önce puanlandı mı — anketi tekrar göstermemek için */
  rated: boolean;
}

/**
 * Tek turda hem yeni mesajları hem görüşme durumunu getirir.
 * `afterId` son görülen mesaj id'sidir; transkript her turda baştan inmez.
 */
export async function pollConversation(
  session: ChatSession,
  afterId = 0,
): Promise<PollResult> {
  const { data, error } = await supabase.rpc('chat_poll', {
    p_conversation_id: session.conversationId,
    p_token: session.accessToken,
    p_after_id: afterId,
  });

  if (error) throw error;

  const payload = data as {
    messages: ChatMessage[];
    status: ChatStatus;
    agent_typing: boolean;
    rated: boolean;
  };

  return {
    messages: payload?.messages || [],
    status: payload?.status || 'open',
    agentTyping: !!payload?.agent_typing,
    rated: !!payload?.rated,
  };
}

/** Ziyaretçi yazıyor sinyali. Çağıran taraf kısıtlamalıdır (bkz. THROTTLE). */
export async function setVisitorTyping(session: ChatSession): Promise<void> {
  const { error } = await supabase.rpc('chat_set_visitor_typing', {
    p_conversation_id: session.conversationId,
    p_token: session.accessToken,
  });
  if (error) console.error('Yazıyor sinyali gönderilemedi:', error);
}

export async function rateConversation(
  session: ChatSession,
  rating: number,
  comment?: string,
): Promise<void> {
  const { error } = await supabase.rpc('chat_rate_conversation', {
    p_conversation_id: session.conversationId,
    p_token: session.accessToken,
    p_rating: rating,
    p_comment: comment?.trim() || null,
  });
  if (error) throw error;
}

// ============================================================
// Dosya eki
// ============================================================

/** Kabul edilen türler — ziyaretçi rapor/film/görsel gönderir */
export const ALLOWED_ATTACHMENT_TYPES = [
  'image/jpeg', 'image/png', 'image/webp', 'image/heic',
  'application/pdf',
];

export const ATTACHMENT_BUCKET = 'chat-attachments';

/**
 * Dosyayı Storage'a yükler ve mesaja iliştirilecek bilgiyi döner.
 *
 * Dosya adı tahmin edilemez bir UUID'ye çevrilir; orijinal ad yalnızca
 * veritabanında görünen etiket olarak saklanır. Bucket'ın herkese açık
 * olmasının getirdiği sınır için bkz. CHAT_SETUP.md.
 */
export async function uploadChatAttachment(
  file: File,
  conversationId: string,
  maxMb: number,
): Promise<AttachmentPayload> {
  if (!ALLOWED_ATTACHMENT_TYPES.includes(file.type)) {
    throw new Error('Yalnızca JPG, PNG, WEBP ve PDF dosyaları gönderebilirsiniz.');
  }
  if (file.size > maxMb * 1024 * 1024) {
    throw new Error(`Dosya çok büyük. En fazla ${maxMb} MB olmalı.`);
  }

  const ext = (file.name.split('.').pop() || 'bin').toLowerCase().slice(0, 8);
  const random =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const path = `${conversationId}/${random}.${ext}`;

  const { error } = await supabase.storage
    .from(ATTACHMENT_BUCKET)
    .upload(path, file, { cacheControl: '3600', upsert: false });

  if (error) throw error;

  const { data } = supabase.storage.from(ATTACHMENT_BUCKET).getPublicUrl(path);

  return {
    url: data.publicUrl,
    name: file.name.slice(0, 120),
    type: file.type,
    size: file.size,
  };
}

/** "2,4 MB" / "812 KB" */
export function formatFileSize(bytes?: number | null): string {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1).replace('.', ',')} MB`;
}

export async function markVisitorRead(session: ChatSession): Promise<void> {
  const { error } = await supabase.rpc('chat_mark_visitor_read', {
    p_conversation_id: session.conversationId,
    p_token: session.accessToken,
  });
  if (error) console.error('Okundu bilgisi güncellenemedi:', error);
}

export async function closeConversationByVisitor(session: ChatSession): Promise<void> {
  const { error } = await supabase.rpc('chat_close_by_visitor', {
    p_conversation_id: session.conversationId,
    p_token: session.accessToken,
  });
  if (error) throw error;
}

// ============================================================
// Operatör işlemleri (RLS ile korunur)
// ============================================================

export async function fetchConversations(
  filter: 'all' | ChatStatus = 'all',
): Promise<ChatConversation[]> {
  let query = supabase
    .from('chat_conversations')
    .select('*')
    .order('last_message_at', { ascending: false })
    .limit(200);

  if (filter !== 'all') query = query.eq('status', filter);

  const { data, error } = await query;
  if (error) throw error;
  return (data || []) as ChatConversation[];
}

export async function fetchConversationMessages(
  conversationId: string,
): Promise<ChatMessage[]> {
  const { data, error } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('id', { ascending: true });

  if (error) throw error;
  return (data || []) as ChatMessage[];
}

export async function sendAgentMessage(
  conversationId: string,
  content: string,
  agentName: string,
  attachment?: AttachmentPayload,
): Promise<void> {
  const { error } = await supabase.rpc('chat_post_agent_message', {
    p_conversation_id: conversationId,
    p_content: content,
    p_agent_name: agentName,
    p_attachment_url: attachment?.url ?? null,
    p_attachment_name: attachment?.name ?? null,
    p_attachment_type: attachment?.type ?? null,
    p_attachment_size: attachment?.size ?? null,
  });
  if (error) throw error;
}

/** Operatör yazıyor sinyali — çağıran taraf kısıtlamalıdır */
export async function setAgentTyping(conversationId: string): Promise<void> {
  const { error } = await supabase.rpc('chat_set_agent_typing', {
    p_conversation_id: conversationId,
  });
  if (error) console.error('Yazıyor sinyali gönderilemedi:', error);
}

/** Seçili görüşmede ziyaretçi şu an yazıyor mu */
export async function fetchVisitorTyping(conversationId: string): Promise<boolean> {
  const { data, error } = await supabase.rpc('chat_visitor_typing', {
    p_conversation_id: conversationId,
  });
  if (error) return false;
  return !!data;
}

// ============================================================
// Hazır yanıtlar
// ============================================================

export async function fetchCannedResponses(): Promise<CannedResponse[]> {
  const { data, error } = await supabase
    .from('chat_canned_responses')
    .select('*')
    .order('display_order', { ascending: true });

  if (error) throw error;
  return (data || []) as CannedResponse[];
}

export async function saveCannedResponse(item: Partial<CannedResponse>): Promise<void> {
  const payload = {
    shortcut: item.shortcut?.trim().replace(/^\//, '').toLocaleLowerCase('tr'),
    title: item.title?.trim(),
    content: item.content,
    category: item.category?.trim() || null,
    display_order: item.display_order ?? 0,
    is_active: item.is_active ?? true,
  };

  const { error } = item.id
    ? await supabase.from('chat_canned_responses').update(payload).eq('id', item.id)
    : await supabase.from('chat_canned_responses').insert([payload]);

  if (error) throw error;
}

export async function deleteCannedResponse(id: number): Promise<void> {
  const { error } = await supabase.from('chat_canned_responses').delete().eq('id', id);
  if (error) throw error;
}

/** Hangi hazır metnin işe yaradığını raporlayabilmek için sayacı artırır */
export async function bumpCannedUse(id: number): Promise<void> {
  const { error } = await supabase.rpc('chat_bump_canned_use', { p_id: id });
  if (error) console.error('Kullanım sayacı güncellenemedi:', error);
}

// ============================================================
// Transkript dışa aktarma
// ============================================================

/** Excel'in UTF-8'i doğru açması için BOM şart */
const CSV_BOM = '﻿';

function csvCell(value: unknown): string {
  const text = value === null || value === undefined ? '' : String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

const ROLE_LABELS: Record<ChatSenderRole, string> = {
  visitor: 'Ziyaretçi',
  agent: 'Operatör',
  system: 'Sistem',
};

export function buildTranscriptCsv(
  conversation: ChatConversation,
  messages: ChatMessage[],
): string {
  const meta = [
    ['Görüşme No', conversation.id],
    ['Ziyaretçi', conversation.visitor_name || '—'],
    ['Telefon', conversation.visitor_phone || '—'],
    ['E-posta', conversation.visitor_email || '—'],
    ['Durum', conversation.status],
    ['Etiketler', (conversation.tags || []).join(', ') || '—'],
    ['Puan', conversation.rating ? `${conversation.rating}/5` : '—'],
    ['Başlangıç', new Date(conversation.created_at).toLocaleString('tr-TR')],
    ['Başladığı sayfa', conversation.page_url || '—'],
  ]
    .map((row) => row.map(csvCell).join(';'))
    .join('\n');

  const header = ['Zaman', 'Gönderen', 'Ad', 'Mesaj', 'Ek'].map(csvCell).join(';');

  const rows = messages
    .map((m) =>
      [
        new Date(m.created_at).toLocaleString('tr-TR'),
        ROLE_LABELS[m.sender_role] || m.sender_role,
        m.sender_name || '',
        m.content,
        m.attachment_url || '',
      ]
        .map(csvCell)
        .join(';'),
    )
    .join('\n');

  return `${CSV_BOM}${meta}\n\n${header}\n${rows}`;
}

export function downloadTranscriptCsv(
  conversation: ChatConversation,
  messages: ChatMessage[],
): void {
  const csv = buildTranscriptCsv(conversation, messages);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const safeName = (conversation.visitor_name || 'gorusme')
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .slice(0, 40);
  const date = new Date(conversation.created_at).toISOString().slice(0, 10);

  const link = document.createElement('a');
  link.href = url;
  link.download = `canli-destek-${safeName}-${date}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Transkripti yazdırma penceresinde açar — tarayıcının "PDF olarak kaydet"
 * seçeneği kütüphane eklemeden PDF üretir.
 */
export function printTranscript(
  conversation: ChatConversation,
  messages: ChatMessage[],
): void {
  const esc = (s: unknown) =>
    String(s ?? '').replace(/[&<>"]/g, (c) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c] as string),
    );

  const rows = messages
    .map(
      (m) => `
      <tr>
        <td class="t">${esc(new Date(m.created_at).toLocaleString('tr-TR'))}</td>
        <td class="r">${esc(ROLE_LABELS[m.sender_role] || m.sender_role)}${
          m.sender_name ? ` · ${esc(m.sender_name)}` : ''
        }</td>
        <td>${esc(m.content).replace(/\n/g, '<br>')}${
          m.attachment_url
            ? `<div class="a">Ek: ${esc(m.attachment_name || 'dosya')}</div>`
            : ''
        }</td>
      </tr>`,
    )
    .join('');

  const html = `<!doctype html><html lang="tr"><head><meta charset="utf-8">
<title>Canlı Destek Transkripti</title>
<style>
  body{font-family:system-ui,-apple-system,sans-serif;color:#1A1D23;margin:32px;font-size:12px}
  h1{font-size:18px;margin:0 0 4px}
  .sub{color:#6B7884;font-size:11px;margin-bottom:16px}
  dl{display:grid;grid-template-columns:auto 1fr;gap:2px 12px;margin:0 0 20px;font-size:11px}
  dt{color:#6B7884}
  dd{margin:0}
  table{width:100%;border-collapse:collapse}
  th,td{border-bottom:1px solid #E2E8F0;padding:6px 8px;text-align:left;vertical-align:top}
  th{background:#F7F9FB;font-size:10px;text-transform:uppercase;letter-spacing:.05em;color:#6B7884}
  .t{white-space:nowrap;color:#6B7884;width:130px}
  .r{white-space:nowrap;width:130px}
  .a{color:#0A6B7D;font-size:10px;margin-top:4px}
  @media print{body{margin:0}}
</style></head><body>
<h1>Canlı Destek Transkripti</h1>
<div class="sub">Anadolu Hastaneleri Grubu</div>
<dl>
  <dt>Ziyaretçi</dt><dd>${esc(conversation.visitor_name || '—')}</dd>
  <dt>Telefon</dt><dd>${esc(conversation.visitor_phone || '—')}</dd>
  <dt>E-posta</dt><dd>${esc(conversation.visitor_email || '—')}</dd>
  <dt>Etiketler</dt><dd>${esc((conversation.tags || []).join(', ') || '—')}</dd>
  <dt>Puan</dt><dd>${conversation.rating ? `${conversation.rating}/5` : '—'}</dd>
  <dt>Başlangıç</dt><dd>${esc(new Date(conversation.created_at).toLocaleString('tr-TR'))}</dd>
  <dt>Görüşme No</dt><dd>${esc(conversation.id)}</dd>
</dl>
<table>
  <thead><tr><th>Zaman</th><th>Gönderen</th><th>Mesaj</th></tr></thead>
  <tbody>${rows}</tbody>
</table>
</body></html>`;

  const win = window.open('', '_blank', 'width=900,height=700');
  if (!win) {
    alert('Yazdırma penceresi açılamadı. Tarayıcının pop-up engelleyicisini kontrol edin.');
    return;
  }
  win.document.write(html);
  win.document.close();
  win.focus();
  // İçerik yerleşsin diye bir tur bekle
  setTimeout(() => win.print(), 250);
}

export async function setConversationStatus(
  conversationId: string,
  status: ChatStatus,
): Promise<void> {
  const { error } = await supabase
    .from('chat_conversations')
    .update({
      status,
      closed_at: status === 'closed' ? new Date().toISOString() : null,
    })
    .eq('id', conversationId);
  if (error) throw error;
}

export async function markAgentRead(conversationId: string): Promise<void> {
  const { error } = await supabase
    .from('chat_conversations')
    .update({ agent_read_at: new Date().toISOString() })
    .eq('id', conversationId);
  if (error) console.error('Okundu bilgisi güncellenemedi:', error);
}

export async function deleteConversation(conversationId: string): Promise<void> {
  const { error } = await supabase
    .from('chat_conversations')
    .delete()
    .eq('id', conversationId);
  if (error) throw error;
}

// ============================================================
// Operatör ekibi (çoklu agent)
// ============================================================

export type AgentRole = 'agent' | 'supervisor';
export type AgentStatus = 'online' | 'away' | 'offline';

export interface ChatAgent {
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  agent_role: AgentRole;
  max_concurrent: number;
  status: AgentStatus;
  last_seen_at: string | null;
  is_active: boolean;
}

/** chat_available_agents görünümü — heartbeat tazeliği ve yük dahil */
export interface AvailableAgent {
  user_id: string;
  display_name: string;
  agent_role: AgentRole;
  max_concurrent: number;
  status: AgentStatus;
  last_seen_at: string | null;
  is_available: boolean;
  active_load: number;
}

export const AGENT_STATUS_LABELS: Record<AgentStatus, string> = {
  online: 'Müsait',
  away: 'Meşgul',
  offline: 'Çevrimdışı',
};

export async function fetchChatAgents(): Promise<ChatAgent[]> {
  const { data, error } = await supabase
    .from('chat_agents')
    .select('*')
    .order('agent_role', { ascending: true })
    .order('display_name', { ascending: true });

  if (error) throw error;
  return (data || []) as ChatAgent[];
}

export async function fetchAvailableAgents(): Promise<AvailableAgent[]> {
  const { data, error } = await supabase
    .from('chat_available_agents')
    .select('*')
    .order('active_load', { ascending: true });

  if (error) throw error;
  return (data || []) as AvailableAgent[];
}

export async function saveChatAgent(agent: Partial<ChatAgent>): Promise<void> {
  if (!agent.user_id) throw new Error('Kullanıcı seçilmedi.');

  const { error } = await supabase.from('chat_agents').upsert(
    {
      user_id: agent.user_id,
      display_name: agent.display_name?.trim(),
      avatar_url: agent.avatar_url || null,
      agent_role: agent.agent_role || 'agent',
      max_concurrent: agent.max_concurrent ?? 5,
      is_active: agent.is_active ?? true,
    },
    { onConflict: 'user_id' },
  );

  if (error) throw error;
}

export async function removeChatAgent(userId: string): Promise<void> {
  const { error } = await supabase.from('chat_agents').delete().eq('user_id', userId);
  if (error) throw error;
}

/**
 * Panel açıkken çağrılır. `status` verilirse operatörün seçimi de güncellenir.
 * 90 saniyeden eski heartbeat "çevrimdışı" sayılır (bkz. chat_available_agents).
 */
export async function agentHeartbeat(status?: AgentStatus): Promise<void> {
  const { error } = await supabase.rpc('chat_agent_heartbeat', {
    p_status: status ?? null,
  });
  if (error) console.error('Heartbeat gönderilemedi:', error);
}

/**
 * Havuzdaki görüşmeyi üstlenir.
 * `false` dönerse başka bir operatör önce davranmıştır.
 */
export async function claimConversation(conversationId: string): Promise<boolean> {
  const { data, error } = await supabase.rpc('chat_claim_conversation', {
    p_conversation_id: conversationId,
  });
  if (error) throw error;
  return !!data;
}

export async function transferConversation(
  conversationId: string,
  targetUserId: string,
  note?: string,
): Promise<void> {
  const { error } = await supabase.rpc('chat_transfer_conversation', {
    p_conversation_id: conversationId,
    p_target_user_id: targetUserId,
    p_note: note?.trim() || null,
  });
  if (error) throw error;
}

// ============================================================
// Etiketler
// ============================================================

export async function fetchChatTags(): Promise<ChatTag[]> {
  const { data, error } = await supabase
    .from('chat_tags')
    .select('*')
    .order('display_order', { ascending: true });

  if (error) throw error;
  return (data || []) as ChatTag[];
}

export async function saveChatTag(tag: Partial<ChatTag>): Promise<void> {
  const payload = {
    name: tag.name,
    color: tag.color,
    keywords: tag.keywords,
    is_active: tag.is_active,
    display_order: tag.display_order,
  };

  const { error } = tag.id
    ? await supabase.from('chat_tags').update(payload).eq('id', tag.id)
    : await supabase.from('chat_tags').insert([payload]);

  if (error) throw error;
}

export async function deleteChatTag(id: number): Promise<void> {
  const { error } = await supabase.from('chat_tags').delete().eq('id', id);
  if (error) throw error;
}

/** Operatörün bir görüşmenin etiketlerini elle düzenlemesi */
export async function updateConversationTags(
  conversationId: string,
  tags: string[],
): Promise<void> {
  const { error } = await supabase
    .from('chat_conversations')
    .update({ tags })
    .eq('id', conversationId);
  if (error) throw error;
}

// ============================================================
// İstatistikler
// ============================================================

export interface ChatStats {
  period_days: number;
  totals: {
    conversations: number;
    open: number;
    active: number;
    closed: number;
    messages: number;
    unanswered: number;
    with_phone: number;
    attachments: number;
  };
  response: {
    answered: number;
    avg_first_seconds: number;
    median_first_seconds: number;
    avg_messages_per_conversation: number;
  };
  satisfaction: {
    rated: number;
    average: number;
    breakdown: { stars: number; count: number }[];
    comments: { stars: number; comment: string; name: string | null; at: string }[];
  };
  daily: { date: string; count: number }[];
  hourly: { hour: number; count: number }[];
  tags: { tag: string; count: number }[];
  agents: { name: string; messages: number }[];
  canned: { title: string; count: number }[];
}

export async function fetchChatStats(days = 30): Promise<ChatStats> {
  const { data, error } = await supabase.rpc('chat_stats', { p_days: days });
  if (error) throw error;
  return data as ChatStats;
}

/** Saniyeyi "42 sn" / "3 dk" / "1 sa 12 dk" biçimine çevirir */
export function formatDuration(seconds: number): string {
  const s = Math.max(0, Math.round(seconds));
  if (s < 60) return `${s} sn`;
  if (s < 3600) return `${Math.round(s / 60)} dk`;
  const h = Math.floor(s / 3600);
  const m = Math.round((s % 3600) / 60);
  return m > 0 ? `${h} sa ${m} dk` : `${h} sa`;
}

export async function updateChatSettings(patch: Partial<ChatSettings>): Promise<void> {
  const { error } = await supabase
    .from('chat_settings')
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq('id', 1);
  if (error) throw error;
}

/** Aynı anda birden fazla abone olabildiği için kanal adları çakışmamalı. */
let channelSeq = 0;

/**
 * Operatör panosu için Realtime aboneliği. Yeni mesaj veya konuşma
 * değişikliğinde `onChange` çağrılır; çağıran taraf listeyi tazeler.
 * Dönen fonksiyon aboneliği kapatır.
 *
 * Not: Sidebar rozeti ve Canlı Destek sayfası aynı anda abone olur. Supabase
 * aynı topic'e ikinci kez abone olunmasını reddettiği için her çağrı kendi
 * benzersiz kanal adını alır.
 */
export function subscribeToChatChanges(onChange: () => void): () => void {
  try {
    const channel = supabase
      .channel(`admin-live-chat-${++channelSeq}-${Date.now()}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'chat_messages' },
        onChange,
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'chat_conversations' },
        onChange,
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  } catch (err) {
    // Realtime kurulamazsa (yayın kapalı, soket reddi vb.) panel yine
    // çalışmalı — yalnızca anlık güncelleme olmaz, manuel yenileme gerekir.
    console.error('Canlı destek Realtime aboneliği kurulamadı:', err);
    return () => {};
  }
}

/** Konuşmada operatörün görmediği ziyaretçi mesajı var mı? */
export function hasUnreadForAgent(conv: ChatConversation): boolean {
  if (conv.status === 'closed') return false;
  if (!conv.agent_read_at) return true;
  return new Date(conv.last_message_at) > new Date(conv.agent_read_at);
}

/** Listede gösterilecek kısa zaman etiketi: "3 dk", "2 sa", "12 Şub" */
export function formatChatTime(iso: string): string {
  const date = new Date(iso);
  const diffMin = Math.floor((Date.now() - date.getTime()) / 60000);

  if (diffMin < 1) return 'şimdi';
  if (diffMin < 60) return `${diffMin} dk`;
  if (diffMin < 60 * 24) return `${Math.floor(diffMin / 60)} sa`;

  return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
}
