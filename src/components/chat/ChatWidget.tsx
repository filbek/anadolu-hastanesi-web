import { useState, useEffect, useRef, useCallback, FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaComments, FaPaperPlane, FaWhatsapp, FaCheckCircle,
  FaExclamationTriangle, FaChevronDown, FaUserCircle,
  FaPaperclip, FaTimes, FaFilePdf, FaStar,
} from 'react-icons/fa';
import {
  AttachmentPayload, ChatMessage, ChatSession, ChatSettings, ChatStatus,
  DEFAULT_CHAT_SETTINGS, fetchChatSettings, isWithinWorkingHours,
  loadChatSession, clearChatSession,
  startConversation, sendVisitorMessage, pollConversation,
  markVisitorRead, closeConversationByVisitor,
  setVisitorTyping, rateConversation, uploadChatAttachment,
  formatFileSize, ALLOWED_ATTACHMENT_TYPES,
} from '../../services/chatService';

/** Widget açıkken yeni mesaj kontrol aralığı (ms). */
const POLL_ACTIVE_MS = 3000;
/** Widget kapalıyken — okunmamış rozetini beslemek için daha seyrek. */
const POLL_IDLE_MS = 20000;
/**
 * "Yazıyor" sinyali en fazla bu sıklıkta gider. Sunucu tarafı sinyali
 * 8 saniye geçerli sayar, yani her tuşta istek atmaya gerek yok.
 */
const TYPING_THROTTLE_MS = 4000;

type Panel = 'prechat' | 'chat';

const ChatWidget = () => {
  const [settings, setSettings] = useState<ChatSettings>(DEFAULT_CHAT_SETTINGS);
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const [session, setSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [status, setStatus] = useState<ChatStatus>('open');
  const [unread, setUnread] = useState(0);

  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [agentTyping, setAgentTyping] = useState(false);

  // Dosya eki
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Memnuniyet anketi
  const [rated, setRated] = useState(false);
  const [ratingValue, setRatingValue] = useState(0);
  const [ratingComment, setRatingComment] = useState('');
  const [ratingSent, setRatingSent] = useState(false);

  // Ön form
  const [form, setForm] = useState({ name: '', phone: '', email: '', message: '' });
  const [consent, setConsent] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);
  // Poll döngüsünün her turda okuduğu değerler — effect'i yeniden kurmamak için ref
  const lastIdRef = useRef(0);
  const isOpenRef = useRef(false);
  // Zamanlayıcı turu ile gönderim sonrası çağrı çakışırsa aynı mesajlar
  // iki kez eklenebilir; tek seferde tek istek çalışsın.
  const pollingRef = useRef(false);
  const lastTypingSentRef = useRef(0);

  const panel: Panel = session ? 'chat' : 'prechat';
  const isOnline = settingsLoaded && isWithinWorkingHours(settings);

  // --- Ayarlar + kayıtlı oturum ---
  useEffect(() => {
    let cancelled = false;
    fetchChatSettings().then((s) => {
      if (cancelled) return;
      setSettings(s);
      setSettingsLoaded(true);
    });
    setSession(loadChatSession());
    return () => {
      cancelled = true;
    };
  }, []);

  // --- Yeni mesajları çek ---
  const pollMessages = useCallback(async () => {
    const current = loadChatSession();
    if (!current || pollingRef.current) return;

    pollingRef.current = true;
    try {
      const {
        messages: fresh,
        status: newStatus,
        agentTyping: typing,
        rated: alreadyRated,
      } = await pollConversation(current, lastIdRef.current);

      setStatus(newStatus);
      setAgentTyping(typing);
      setRated(alreadyRated);

      if (fresh.length === 0) return;

      lastIdRef.current = fresh[fresh.length - 1].id;
      setMessages((prev) => [...prev, ...fresh]);

      // Kapalıyken gelen operatör mesajları rozete yazılır
      if (!isOpenRef.current) {
        const incoming = fresh.filter((m) => m.sender_role !== 'visitor').length;
        if (incoming > 0) setUnread((n) => n + incoming);
      }
    } catch (err) {
      // Konuşma silinmiş ya da token geçersiz — oturumu düşür, ziyaretçi
      // widget'ı tekrar açtığında yeni bir görüşme başlatabilsin.
      const code = (err as { code?: string })?.code;
      if (code === '42501' || code === 'PGRST116') {
        clearChatSession();
        setSession(null);
        setMessages([]);
        lastIdRef.current = 0;
      } else {
        console.error('Mesajlar alınamadı:', err);
      }
    } finally {
      pollingRef.current = false;
    }
  }, []);

  // --- Polling döngüsü: açıkken sık, kapalıyken seyrek ---
  useEffect(() => {
    isOpenRef.current = isOpen;
    if (!session) return;

    pollMessages();
    const interval = setInterval(pollMessages, isOpen ? POLL_ACTIVE_MS : POLL_IDLE_MS);
    return () => clearInterval(interval);
  }, [session, isOpen, pollMessages]);

  // --- Açılışta okundu işaretle ---
  useEffect(() => {
    if (!isOpen || !session) return;
    setUnread(0);
    markVisitorRead(session);
  }, [isOpen, session]);

  // --- Yeni mesajda en alta kaydır ---
  useEffect(() => {
    if (!isOpen) return;
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isOpen]);

  // --- Esc ile kapat, kapanınca odağı launcher'a döndür ---
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        launcherRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen]);

  // --- Görüşme başlat ---
  const handleStart = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    const message = form.message.trim();
    if (!message) {
      setError('Lütfen mesajınızı yazın.');
      return;
    }
    if (settings.require_name && !form.name.trim()) {
      setError('Lütfen adınızı girin.');
      return;
    }
    if (settings.require_phone && !form.phone.trim()) {
      setError('Lütfen telefon numaranızı girin.');
      return;
    }
    if (settings.require_email && !form.email.trim()) {
      setError('Lütfen e-posta adresinizi girin.');
      return;
    }
    if (settings.consent_text && !consent) {
      setError('Devam etmek için onay kutusunu işaretleyin.');
      return;
    }

    setSending(true);
    try {
      const newSession = await startConversation({
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        message,
      });
      lastIdRef.current = 0;
      setMessages([]);
      setSession(newSession);
      setStatus('open');
      setForm((f) => ({ ...f, message: '' }));
      setTimeout(() => inputRef.current?.focus(), 100);
    } catch (err) {
      console.error('Görüşme başlatılamadı:', err);
      setError('Görüşme başlatılamadı. Lütfen daha sonra tekrar deneyin.');
    } finally {
      setSending(false);
    }
  };

  // --- Yazıyor sinyali (kısıtlanmış) ---
  const signalTyping = useCallback(() => {
    if (!session) return;
    const now = Date.now();
    if (now - lastTypingSentRef.current < TYPING_THROTTLE_MS) return;
    lastTypingSentRef.current = now;
    setVisitorTyping(session);
  }, [session]);

  // --- Dosya seçimi ---
  const handleFilePick = (file: File | null) => {
    setError(null);
    if (!file) {
      setPendingFile(null);
      return;
    }
    if (!ALLOWED_ATTACHMENT_TYPES.includes(file.type)) {
      setError('Yalnızca JPG, PNG, WEBP ve PDF gönderebilirsiniz.');
      return;
    }
    if (file.size > settings.max_attachment_mb * 1024 * 1024) {
      setError(`Dosya çok büyük. En fazla ${settings.max_attachment_mb} MB olmalı.`);
      return;
    }
    setPendingFile(file);
  };

  // --- Mesaj gönder ---
  const handleSend = async (text?: string) => {
    const content = (text ?? draft).trim();
    // Dosya varsa metin boş olabilir
    if ((!content && !pendingFile) || !session || sending) return;

    setSending(true);
    setError(null);

    const file = pendingFile;

    // İyimser gösterim: sunucudan dönmeden baloncuğu ekle. Gerçek kayıt
    // bir sonraki poll turunda geldiğinde geçici olan ayıklanır.
    const optimistic: ChatMessage = {
      id: -Date.now(),
      sender_role: 'visitor',
      sender_name: session.visitorName || null,
      content,
      created_at: new Date().toISOString(),
      attachment_name: file?.name ?? null,
      attachment_type: file?.type ?? null,
      attachment_size: file?.size ?? null,
    };
    setMessages((prev) => [...prev, optimistic]);
    setDraft('');
    setPendingFile(null);

    try {
      let attachment: AttachmentPayload | undefined;
      if (file) {
        setUploading(true);
        attachment = await uploadChatAttachment(
          file,
          session.conversationId,
          settings.max_attachment_mb,
        );
        setUploading(false);
      }

      await sendVisitorMessage(session, content, attachment);
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
      await pollMessages();
    } catch (err) {
      console.error('Mesaj gönderilemedi:', err);
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
      setDraft(content);
      if (file) setPendingFile(file);
      setError(
        err instanceof Error && err.message.includes('MB')
          ? err.message
          : 'Mesaj gönderilemedi. Lütfen tekrar deneyin.',
      );
    } finally {
      setUploading(false);
      setSending(false);
    }
  };

  // --- Memnuniyet anketi ---
  const handleRate = async () => {
    if (!session || ratingValue < 1) return;
    try {
      await rateConversation(session, ratingValue, ratingComment);
      setRatingSent(true);
      setRated(true);
    } catch (err) {
      console.error('Değerlendirme gönderilemedi:', err);
      setError('Değerlendirme gönderilemedi.');
    }
  };

  const handleNewConversation = async () => {
    if (session && status !== 'closed') {
      try {
        await closeConversationByVisitor(session);
      } catch (err) {
        console.error('Görüşme kapatılamadı:', err);
      }
    }
    clearChatSession();
    setSession(null);
    setMessages([]);
    setStatus('open');
    lastIdRef.current = 0;
    setForm({ name: '', phone: '', email: '', message: '' });
    setConsent(false);
    setRated(false);
    setRatingValue(0);
    setRatingComment('');
    setRatingSent(false);
    setPendingFile(null);
    setAgentTyping(false);
  };

  const whatsappUrl = settings.whatsapp_fallback_number
    ? `https://wa.me/${settings.whatsapp_fallback_number}?text=${encodeURIComponent(
        'Merhaba, web sitesi üzerinden bilgi almak istiyorum.',
      )}`
    : null;

  // Ayarlar okunana kadar ya da destek kapalıysa widget hiç görünmez
  if (!settingsLoaded || !settings.is_enabled) return null;

  return (
    <>
      {/* ---------------- Launcher ---------------- */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            ref={launcherRef}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6 }}
            transition={{ duration: 0.2, ease: [0.34, 1.56, 0.64, 1] }}
            onClick={() => setIsOpen(true)}
            aria-label={
              unread > 0
                ? `${settings.widget_title} — ${unread} okunmamış mesaj`
                : settings.widget_title
            }
            className="fixed bottom-6 right-6 z-[60] flex items-center gap-3 rounded-full bg-primary pl-5 pr-6 py-4 text-white shadow-elevated transition-all duration-300 hover:bg-primary-light hover:shadow-hover focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/30"
          >
            <span className="relative">
              <FaComments size={22} aria-hidden="true" />
              {unread > 0 && (
                <span className="absolute -top-2 -right-2 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-coral px-1 text-[11px] font-bold text-white">
                  {unread > 9 ? '9+' : unread}
                </span>
              )}
            </span>
            <span className="hidden text-sm font-semibold sm:inline">
              {settings.widget_title}
            </span>
            {isOnline && (
              <span
                className="absolute bottom-1 left-1 h-3 w-3 rounded-full border-2 border-white bg-success"
                aria-hidden="true"
              />
            )}
          </motion.button>
        )}
      </AnimatePresence>

      {/* ---------------- Panel ---------------- */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            role="dialog"
            aria-modal="false"
            aria-label={settings.widget_title}
            className="fixed inset-x-0 bottom-0 z-[60] flex h-[85vh] flex-col overflow-hidden rounded-t-3xl bg-white shadow-elevated sm:inset-x-auto sm:bottom-6 sm:right-6 sm:h-[600px] sm:max-h-[calc(100vh-3rem)] sm:w-[400px] sm:rounded-3xl"
          >
            {/* Başlık */}
            <header className="flex items-start gap-3 bg-primary px-5 py-4 text-white">
              <div className="relative flex-shrink-0">
                {settings.agent_avatar_url ? (
                  <img
                    src={settings.agent_avatar_url}
                    alt=""
                    className="h-11 w-11 rounded-full border-2 border-white/20 object-cover"
                  />
                ) : (
                  <FaUserCircle size={44} className="text-white/70" aria-hidden="true" />
                )}
                <span
                  className={`absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-primary ${
                    isOnline ? 'bg-success' : 'bg-neutral-400'
                  }`}
                  aria-hidden="true"
                />
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate font-display text-base font-bold leading-tight">
                  {settings.widget_title}
                </p>
                <p className="mt-0.5 truncate text-xs text-white/70">
                  {isOnline ? settings.widget_subtitle : 'Şu anda çevrimdışıyız'}
                </p>
              </div>

              <button
                onClick={() => {
                  setIsOpen(false);
                  launcherRef.current?.focus();
                }}
                aria-label="Canlı desteği kapat"
                className="-mr-1 rounded-lg p-2 text-white/70 transition-colors hover:bg-white/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
              >
                <FaChevronDown aria-hidden="true" />
              </button>
            </header>

            {/* ---------------- Ön form ---------------- */}
            {panel === 'prechat' && (
              <form
                onSubmit={handleStart}
                className="flex-1 overflow-y-auto px-5 py-5"
                aria-label="Canlı destek başlatma formu"
              >
                <p className="mb-5 rounded-2xl rounded-tl-sm bg-neutral-100 px-4 py-3 text-sm leading-relaxed text-text-light">
                  {isOnline ? settings.welcome_message : settings.offline_message}
                </p>

                <div className="space-y-3">
                  <Field
                    id="chat-name"
                    label="Adınız Soyadınız"
                    required={settings.require_name}
                    value={form.name}
                    onChange={(v) => setForm({ ...form, name: v })}
                    autoComplete="name"
                  />
                  <Field
                    id="chat-phone"
                    label="Telefon"
                    type="tel"
                    required={settings.require_phone}
                    value={form.phone}
                    onChange={(v) => setForm({ ...form, phone: v })}
                    autoComplete="tel"
                    placeholder="0532 123 45 67"
                  />
                  <Field
                    id="chat-email"
                    label="E-posta"
                    type="email"
                    required={settings.require_email}
                    value={form.email}
                    onChange={(v) => setForm({ ...form, email: v })}
                    autoComplete="email"
                  />

                  <div>
                    <label
                      htmlFor="chat-message"
                      className="mb-1 block text-xs font-semibold text-text-light"
                    >
                      Mesajınız <span className="text-coral">*</span>
                    </label>
                    <textarea
                      id="chat-message"
                      required
                      rows={3}
                      maxLength={4000}
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      placeholder="Size nasıl yardımcı olabiliriz?"
                      className="w-full resize-none rounded-xl border border-border px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary-light focus:ring-2 focus:ring-primary/15"
                    />
                  </div>

                  {settings.quick_replies.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {settings.quick_replies.map((q) => (
                        <button
                          key={q}
                          type="button"
                          onClick={() => setForm({ ...form, message: q })}
                          className="rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  )}

                  {settings.consent_text && (
                    <label className="flex cursor-pointer items-start gap-2.5 pt-1 text-xs leading-relaxed text-text-muted">
                      <input
                        type="checkbox"
                        checked={consent}
                        onChange={(e) => setConsent(e.target.checked)}
                        className="mt-0.5 h-4 w-4 flex-shrink-0 rounded border-border text-primary focus:ring-primary"
                      />
                      <span>{settings.consent_text}</span>
                    </label>
                  )}
                </div>

                {error && <ErrorNote>{error}</ErrorNote>}

                <button
                  type="submit"
                  disabled={sending}
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-coral px-4 py-3 text-sm font-bold text-white shadow-coral transition-all hover:bg-coral-dark disabled:opacity-60 focus:outline-none focus-visible:ring-4 focus-visible:ring-coral/25"
                >
                  <FaPaperPlane aria-hidden="true" />
                  {sending ? 'Bağlanıyor...' : 'Görüşmeyi Başlat'}
                </button>

                {!isOnline && whatsappUrl && (
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-success/30 bg-success/5 px-4 py-3 text-sm font-semibold text-success-dark transition-colors hover:bg-success/10"
                  >
                    <FaWhatsapp size={18} aria-hidden="true" />
                    WhatsApp'tan yazın
                  </a>
                )}
              </form>
            )}

            {/* ---------------- Sohbet ---------------- */}
            {panel === 'chat' && (
              <>
                <div
                  ref={scrollRef}
                  className="flex-1 space-y-3 overflow-y-auto bg-surface px-4 py-4"
                  role="log"
                  aria-live="polite"
                  aria-label="Görüşme mesajları"
                >
                  {messages.map((m) => (
                    <MessageBubble
                      key={m.id}
                      message={m}
                      agentName={settings.agent_display_name}
                    />
                  ))}

                  {agentTyping && <TypingBubble name={settings.agent_display_name} />}

                  {status === 'open' && !agentTyping && messages.length > 0 && (
                    <p className="pt-1 text-center text-[11px] text-text-muted">
                      {isOnline
                        ? 'Danışmanımıza iletildi, birazdan yanıtlayacağız.'
                        : 'Mesajınız alındı. Mesai saatlerinde size dönüş yapacağız.'}
                    </p>
                  )}
                </div>

                {error && (
                  <div className="px-4 pb-1">
                    <ErrorNote>{error}</ErrorNote>
                  </div>
                )}

                {status === 'closed' ? (
                  <div className="border-t border-border bg-white px-4 py-4">
                    {/* Kapanan görüşme henüz puanlanmadıysa anket göster */}
                    {!rated && !ratingSent ? (
                      <div className="text-center">
                        <p className="mb-1 text-sm font-semibold text-text">
                          Görüşmemizi değerlendirir misiniz?
                        </p>
                        <p className="mb-3 text-xs text-text-muted">
                          Geri bildiriminiz hizmetimizi geliştirmemize yardımcı oluyor.
                        </p>

                        <div
                          className="mb-3 flex justify-center gap-1"
                          role="radiogroup"
                          aria-label="Memnuniyet puanı"
                        >
                          {[1, 2, 3, 4, 5].map((n) => (
                            <button
                              key={n}
                              onClick={() => setRatingValue(n)}
                              role="radio"
                              aria-checked={ratingValue === n}
                              aria-label={`${n} yıldız`}
                              className="p-1 transition-transform hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber/40"
                            >
                              <FaStar
                                size={26}
                                className={
                                  n <= ratingValue ? 'text-amber' : 'text-neutral-200'
                                }
                              />
                            </button>
                          ))}
                        </div>

                        {ratingValue > 0 && (
                          <>
                            <label htmlFor="chat-rating-comment" className="sr-only">
                              Eklemek istedikleriniz
                            </label>
                            <textarea
                              id="chat-rating-comment"
                              rows={2}
                              maxLength={500}
                              value={ratingComment}
                              onChange={(e) => setRatingComment(e.target.value)}
                              placeholder="Eklemek istediğiniz bir şey var mı? (isteğe bağlı)"
                              className="mb-3 w-full resize-none rounded-xl border border-border px-3 py-2 text-sm outline-none focus:border-primary-light focus:ring-2 focus:ring-primary/15"
                            />
                            <button
                              onClick={handleRate}
                              className="w-full rounded-xl bg-coral px-4 py-2.5 text-sm font-bold text-white shadow-coral transition-colors hover:bg-coral-dark"
                            >
                              Değerlendirmeyi Gönder
                            </button>
                          </>
                        )}

                        <button
                          onClick={handleNewConversation}
                          className="mt-3 w-full text-center text-[11px] text-text-muted underline-offset-2 hover:text-primary hover:underline"
                        >
                          Yeni görüşme başlat
                        </button>
                      </div>
                    ) : (
                      <div className="text-center">
                        <p className="mb-3 flex items-center justify-center gap-2 text-sm text-text-light">
                          <FaCheckCircle className="text-success" aria-hidden="true" />
                          {ratingSent
                            ? 'Değerlendirmeniz için teşekkürler!'
                            : 'Bu görüşme sonlandırıldı.'}
                        </p>
                        <button
                          onClick={handleNewConversation}
                          className="w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-light focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/25"
                        >
                          Yeni Görüşme Başlat
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="border-t border-border bg-white p-3">
                    {/* Gönderilmeyi bekleyen dosya */}
                    {pendingFile && (
                      <div className="mb-2 flex items-center gap-2 rounded-xl bg-neutral-100 px-3 py-2">
                        <FaPaperclip
                          size={12}
                          className="flex-shrink-0 text-text-muted"
                          aria-hidden="true"
                        />
                        <span className="min-w-0 flex-1 truncate text-xs text-text-light">
                          {pendingFile.name}
                        </span>
                        <span className="flex-shrink-0 text-[10px] text-text-muted">
                          {formatFileSize(pendingFile.size)}
                        </span>
                        <button
                          onClick={() => setPendingFile(null)}
                          aria-label="Dosyayı kaldır"
                          className="flex-shrink-0 text-text-muted hover:text-coral"
                        >
                          <FaTimes size={11} />
                        </button>
                      </div>
                    )}

                    <div className="flex items-end gap-2">
                      {settings.allow_attachments && (
                        <>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept={ALLOWED_ATTACHMENT_TYPES.join(',')}
                            className="hidden"
                            onChange={(e) => {
                              handleFilePick(e.target.files?.[0] || null);
                              e.target.value = '';
                            }}
                          />
                          <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={sending}
                            aria-label="Dosya ekle"
                            className="flex h-11 w-9 flex-shrink-0 items-center justify-center text-text-muted transition-colors hover:text-primary disabled:opacity-40"
                          >
                            <FaPaperclip size={16} aria-hidden="true" />
                          </button>
                        </>
                      )}

                      <label htmlFor="chat-draft" className="sr-only">
                        Mesajınız
                      </label>
                      <textarea
                        id="chat-draft"
                        ref={inputRef}
                        rows={1}
                        maxLength={4000}
                        value={draft}
                        onChange={(e) => {
                          setDraft(e.target.value);
                          signalTyping();
                        }}
                        onKeyDown={(e) => {
                          // Enter gönderir, Shift+Enter yeni satır
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSend();
                          }
                        }}
                        placeholder="Mesajınızı yazın..."
                        className="max-h-28 flex-1 resize-none rounded-2xl border border-border px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary-light focus:ring-2 focus:ring-primary/15"
                      />
                      <button
                        onClick={() => handleSend()}
                        disabled={sending || (!draft.trim() && !pendingFile)}
                        aria-label="Mesajı gönder"
                        className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-coral text-white transition-all hover:bg-coral-dark disabled:opacity-40 focus:outline-none focus-visible:ring-4 focus-visible:ring-coral/25"
                      >
                        <FaPaperPlane size={15} aria-hidden="true" />
                      </button>
                    </div>

                    {uploading && (
                      <p className="mt-2 text-center text-[11px] text-text-muted">
                        Dosya yükleniyor...
                      </p>
                    )}

                    <button
                      onClick={handleNewConversation}
                      className="mt-2 w-full text-center text-[11px] text-text-muted underline-offset-2 transition-colors hover:text-coral hover:underline"
                    >
                      Görüşmeyi sonlandır
                    </button>
                  </div>
                )}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

// ============================================================
// Alt bileşenler
// ============================================================

const MessageBubble = ({
  message,
  agentName,
}: {
  message: ChatMessage;
  agentName: string;
}) => {
  const isVisitor = message.sender_role === 'visitor';
  const isSystem = message.sender_role === 'system';

  const time = new Date(message.created_at).toLocaleTimeString('tr-TR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  if (isSystem) {
    return (
      <div className="flex justify-center">
        <p className="max-w-[85%] rounded-xl bg-neutral-100 px-3 py-2 text-center text-xs leading-relaxed text-text-muted">
          {message.content}
        </p>
      </div>
    );
  }

  return (
    <div className={`flex ${isVisitor ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[80%] ${isVisitor ? 'items-end' : 'items-start'}`}>
        {!isVisitor && (
          <p className="mb-1 ml-1 text-[11px] font-semibold text-ocean">
            {message.sender_name || agentName}
          </p>
        )}
        <div
          className={`break-words px-4 py-2.5 text-sm leading-relaxed shadow-soft ${
            isVisitor
              ? 'rounded-2xl rounded-br-sm bg-primary text-white'
              : 'rounded-2xl rounded-bl-sm bg-white text-text'
          }`}
        >
          {message.attachment_name && (
            <Attachment message={message} isVisitor={isVisitor} />
          )}
          {message.content && (
            <p className="whitespace-pre-wrap">{message.content}</p>
          )}
        </div>
        <p
          className={`mt-1 text-[10px] text-text-muted ${
            isVisitor ? 'text-right mr-1' : 'ml-1'
          }`}
        >
          {time}
        </p>
      </div>
    </div>
  );
};

/**
 * Görsel eklerde küçük önizleme, PDF'te dosya satırı gösterir.
 * Yükleme sırasında (henüz url yok) yalnızca ad görünür.
 */
const Attachment = ({
  message,
  isVisitor,
}: {
  message: ChatMessage;
  isVisitor: boolean;
}) => {
  const isImage = (message.attachment_type || '').startsWith('image/');
  const muted = isVisitor ? 'text-white/70' : 'text-text-muted';

  const body = (
    <>
      {isImage && message.attachment_url ? (
        <img
          src={message.attachment_url}
          alt={message.attachment_name || 'Ek görsel'}
          className="mb-1.5 max-h-44 w-full rounded-lg object-cover"
          loading="lazy"
        />
      ) : (
        <span className="flex items-center gap-2">
          <FaFilePdf size={14} aria-hidden="true" />
          <span className="min-w-0 flex-1 truncate">{message.attachment_name}</span>
        </span>
      )}
      {message.attachment_size ? (
        <span className={`block text-[10px] ${muted}`}>
          {formatFileSize(message.attachment_size)}
        </span>
      ) : null}
    </>
  );

  if (!message.attachment_url) {
    return <div className={`mb-1 text-xs ${muted}`}>{body}</div>;
  }

  return (
    <a
      href={message.attachment_url}
      target="_blank"
      rel="noopener noreferrer"
      className="mb-1 block text-xs underline-offset-2 hover:underline"
    >
      {body}
    </a>
  );
};

/** Operatör yazarken görünen üç nokta */
const TypingBubble = ({ name }: { name: string }) => (
  <div className="flex justify-start">
    <div>
      <p className="mb-1 ml-1 text-[11px] font-semibold text-ocean">{name}</p>
      <div className="flex items-center gap-1 rounded-2xl rounded-bl-sm bg-white px-4 py-3 shadow-soft">
        <span className="sr-only">Yazıyor</span>
        {[0, 150, 300].map((delay) => (
          <span
            key={delay}
            className="h-1.5 w-1.5 animate-bounce rounded-full bg-neutral-300"
            style={{ animationDelay: `${delay}ms` }}
            aria-hidden="true"
          />
        ))}
      </div>
    </div>
  </div>
);

const Field = ({
  id, label, value, onChange, required, type = 'text', autoComplete, placeholder,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  type?: string;
  autoComplete?: string;
  placeholder?: string;
}) => (
  <div>
    <label htmlFor={id} className="mb-1 block text-xs font-semibold text-text-light">
      {label} {required && <span className="text-coral">*</span>}
    </label>
    <input
      id={id}
      type={type}
      required={required}
      value={value}
      autoComplete={autoComplete}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-xl border border-border px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary-light focus:ring-2 focus:ring-primary/15"
    />
  </div>
);

const ErrorNote = ({ children }: { children: React.ReactNode }) => (
  <p
    role="alert"
    className="mt-3 flex items-start gap-2 rounded-xl bg-coral-50 px-3 py-2 text-xs text-coral-700"
  >
    <FaExclamationTriangle className="mt-0.5 flex-shrink-0" aria-hidden="true" />
    {children}
  </p>
);

export default ChatWidget;
