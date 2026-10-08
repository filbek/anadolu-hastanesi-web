import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  FaComments, FaPaperPlane, FaTrash, FaCheck, FaUndo, FaSearch,
  FaPhone, FaEnvelope, FaGlobe, FaClock, FaUserCircle, FaCircle,
  FaTag, FaTimes, FaPlus, FaBolt, FaPaperclip, FaFilePdf,
  FaFileCsv, FaPrint, FaStar, FaHandPaper, FaExchangeAlt,
} from 'react-icons/fa';
import { useSupabase } from '../../contexts/SupabaseContext';
import {
  AttachmentPayload, CannedResponse, ChatConversation, ChatMessage, ChatStatus, ChatTag,
  fetchConversations, fetchConversationMessages, sendAgentMessage,
  setConversationStatus, markAgentRead, deleteConversation,
  subscribeToChatChanges, hasUnreadForAgent, formatChatTime,
  fetchChatTags, updateConversationTags,
  fetchCannedResponses, bumpCannedUse, setAgentTyping, fetchVisitorTyping,
  uploadChatAttachment, formatFileSize, ALLOWED_ATTACHMENT_TYPES,
  downloadTranscriptCsv, printTranscript, fetchChatSettings,
  AvailableAgent, fetchAvailableAgents, claimConversation, transferConversation,
} from '../../services/chatService';

/** Gelen kutusu kapsamı — kimin görüşmeleri listelensin */
type Scope = 'mine' | 'pool' | 'all';

const SCOPES: { value: Scope; label: string }[] = [
  { value: 'mine', label: 'Bana Atananlar' },
  { value: 'pool', label: 'Havuz' },
  { value: 'all', label: 'Tümü' },
];

/** Yazıyor sinyali en fazla bu sıklıkta gider (sunucu 8 sn geçerli sayar) */
const TYPING_THROTTLE_MS = 4000;
/** Seçili görüşmede "ziyaretçi yazıyor" sorgu aralığı */
const TYPING_POLL_MS = 3000;

type Filter = 'all' | ChatStatus;

const FILTERS: { value: Filter; label: string }[] = [
  { value: 'open', label: 'Bekleyen' },
  { value: 'active', label: 'Devam Eden' },
  { value: 'all', label: 'Tümü' },
  { value: 'closed', label: 'Kapalı' },
];

const STATUS_STYLES: Record<ChatStatus, { label: string; className: string }> = {
  open: { label: 'Bekliyor', className: 'bg-amber-100 text-amber-700' },
  active: { label: 'Görüşmede', className: 'bg-success-50 text-success-700' },
  closed: { label: 'Kapalı', className: 'bg-neutral-100 text-neutral-500' },
};

const AdminLiveChat = () => {
  const { user, userProfile } = useSupabase();

  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [filter, setFilter] = useState<Filter>('all');
  const [search, setSearch] = useState('');
  const [allTags, setAllTags] = useState<ChatTag[]>([]);
  const [tagFilter, setTagFilter] = useState<string | null>(null);
  const [tagMenuOpen, setTagMenuOpen] = useState(false);

  // Çoklu operatör
  const [scope, setScope] = useState<Scope>('mine');
  const [team, setTeam] = useState<AvailableAgent[]>([]);
  const [transferOpen, setTransferOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);

  // Hazır yanıtlar
  const [canned, setCanned] = useState<CannedResponse[]>([]);
  const [cannedOpen, setCannedOpen] = useState(false);
  const [cannedIndex, setCannedIndex] = useState(0);

  // Yazıyor göstergesi
  const [visitorTyping, setVisitorTyping] = useState(false);

  // Dosya eki
  const [attachmentsEnabled, setAttachmentsEnabled] = useState(false);
  const [maxMb, setMaxMb] = useState(5);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const draftRef = useRef<HTMLTextAreaElement>(null);
  const lastTypingSentRef = useRef(0);
  // Realtime callback'i içinden güncel seçimi okumak için — abonelik
  // her seçim değişiminde yeniden kurulmasın.
  const selectedIdRef = useRef<string | null>(null);
  selectedIdRef.current = selectedId;

  const agentName =
    userProfile?.full_name || user?.user_metadata?.full_name || 'Hasta Danışmanı';

  const loadConversations = useCallback(async () => {
    try {
      setConversations(await fetchConversations('all'));
    } catch (err) {
      console.error('Görüşmeler yüklenemedi:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMessages = useCallback(async (conversationId: string) => {
    try {
      setMessages(await fetchConversationMessages(conversationId));
    } catch (err) {
      console.error('Mesajlar yüklenemedi:', err);
    }
  }, []);

  // Etiket kuralları, hazır yanıtlar ve dosya eki ayarı
  useEffect(() => {
    fetchChatTags()
      .then(setAllTags)
      .catch((err) => console.error('Etiketler yüklenemedi:', err));

    fetchCannedResponses()
      .then((list) => setCanned(list.filter((c) => c.is_active)))
      .catch((err) => console.error('Hazır yanıtlar yüklenemedi:', err));

    fetchChatSettings()
      .then((s) => {
        setAttachmentsEnabled(s.allow_attachments);
        setMaxMb(s.max_attachment_mb);
      })
      .catch(() => {/* ayar okunamazsa ek kapalı kalır */});

    // Devretme listesi ve vardiya görünümü
    const loadTeam = () =>
      fetchAvailableAgents()
        .then(setTeam)
        .catch(() => {/* ekip tanımlı değilse boş kalır */});
    loadTeam();
    const interval = setInterval(loadTeam, 30000);
    return () => clearInterval(interval);
  }, []);

  // Seçili görüşmede ziyaretçi yazıyor mu — Realtime yerine kısa sorgu,
  // çünkü her tuş vuruşunu yayına sokmak listeyi sürekli tazelerdi.
  useEffect(() => {
    if (!selectedId) {
      setVisitorTyping(false);
      return;
    }
    let cancelled = false;
    const tick = () => {
      fetchVisitorTyping(selectedId).then((t) => {
        if (!cancelled) setVisitorTyping(t);
      });
    };
    tick();
    const interval = setInterval(tick, TYPING_POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [selectedId]);

  // İlk yükleme + Realtime aboneliği
  useEffect(() => {
    loadConversations();

    return subscribeToChatChanges(() => {
      loadConversations();
      const current = selectedIdRef.current;
      if (current) loadMessages(current);
    });
  }, [loadConversations, loadMessages]);

  // Seçim değişince mesajları çek ve okundu işaretle
  useEffect(() => {
    setTagMenuOpen(false);
    setTransferOpen(false);
    if (!selectedId) {
      setMessages([]);
      return;
    }
    loadMessages(selectedId);
    markAgentRead(selectedId);
  }, [selectedId, loadMessages]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages]);

  const selected = conversations.find((c) => c.id === selectedId) || null;

  const visible = useMemo(() => {
    const term = search.trim().toLocaleLowerCase('tr');
    return conversations.filter((c) => {
      if (scope === 'mine' && c.assigned_to !== user?.id) return false;
      if (scope === 'pool' && c.assigned_to !== null) return false;
      if (filter !== 'all' && c.status !== filter) return false;
      if (tagFilter && !(c.tags || []).includes(tagFilter)) return false;
      if (!term) return true;
      return [c.visitor_name, c.visitor_phone, c.visitor_email, c.subject]
        .filter(Boolean)
        .some((v) => String(v).toLocaleLowerCase('tr').includes(term));
    });
  }, [conversations, filter, search, tagFilter, scope, user?.id]);

  // Sekme rozetleri: bakılmayı bekleyen görüşmeler
  const scopeCounts = useMemo(
    () => ({
      mine: conversations.filter(
        (c) => c.assigned_to === user?.id && hasUnreadForAgent(c),
      ).length,
      pool: conversations.filter((c) => c.assigned_to === null && c.status !== 'closed')
        .length,
      all: conversations.filter(hasUnreadForAgent).length,
    }),
    [conversations, user?.id],
  );

  const handleClaim = async () => {
    if (!selectedId) return;
    try {
      const won = await claimConversation(selectedId);
      if (!won) {
        alert('Bu görüşmeyi başka bir operatör aldı.');
      }
      await loadConversations();
    } catch (err) {
      console.error('Görüşme üstlenilemedi:', err);
      alert('Görüşme üstlenilemedi.');
    }
  };

  const handleTransfer = async (targetUserId: string) => {
    if (!selectedId) return;
    const note = prompt('Devralacak danışmana not (isteğe bağlı):') ?? undefined;
    try {
      await transferConversation(selectedId, targetUserId, note);
      setTransferOpen(false);
      await Promise.all([loadConversations(), loadMessages(selectedId)]);
    } catch (err) {
      console.error('Devredilemedi:', err);
      alert('Devredilemedi.');
    }
  };

  /** Etiket adından rengini bulur; kural silinmişse nötr renk döner. */
  const tagColor = useCallback(
    (name: string) => allTags.find((t) => t.name === name)?.color || '#6B7884',
    [allTags],
  );

  const handleToggleTag = async (tagName: string) => {
    if (!selected) return;
    const current = selected.tags || [];
    const next = current.includes(tagName)
      ? current.filter((t) => t !== tagName)
      : [...current, tagName];

    // İyimser güncelleme — Realtime turu beklenmeden rozet değişsin
    setConversations((prev) =>
      prev.map((c) => (c.id === selected.id ? { ...c, tags: next } : c)),
    );

    try {
      await updateConversationTags(selected.id, next);
    } catch (err) {
      console.error('Etiket güncellenemedi:', err);
      alert('Etiket güncellenemedi.');
      await loadConversations();
    }
  };

  const waitingCount = conversations.filter(
    (c) => c.status !== 'closed' && hasUnreadForAgent(c),
  ).length;

  const handleSend = async () => {
    const content = draft.trim();
    if ((!content && !pendingFile) || !selectedId || sending) return;

    const file = pendingFile;
    setSending(true);
    setDraft('');
    setPendingFile(null);
    setCannedOpen(false);

    try {
      let attachment: AttachmentPayload | undefined;
      if (file) {
        setUploading(true);
        attachment = await uploadChatAttachment(file, selectedId, maxMb);
        setUploading(false);
      }

      await sendAgentMessage(selectedId, content, agentName, attachment);
      await loadMessages(selectedId);
      await loadConversations();
    } catch (err) {
      console.error('Mesaj gönderilemedi:', err);
      alert(
        err instanceof Error && err.message.includes('MB')
          ? err.message
          : 'Mesaj gönderilemedi. Lütfen tekrar deneyin.',
      );
      setDraft(content);
      if (file) setPendingFile(file);
    } finally {
      setUploading(false);
      setSending(false);
    }
  };

  /** Operatör yazıyor sinyali — kısıtlanmış */
  const signalTyping = () => {
    if (!selectedId) return;
    const now = Date.now();
    if (now - lastTypingSentRef.current < TYPING_THROTTLE_MS) return;
    lastTypingSentRef.current = now;
    setAgentTyping(selectedId);
  };

  // Komposerde "/" ile başlayan son kelime hazır yanıt aramasıdır
  const cannedQuery = (() => {
    const match = draft.match(/(?:^|\s)\/([\p{L}\d-]*)$/u);
    return match ? match[1].toLocaleLowerCase('tr') : null;
  })();

  const cannedMatches = useMemo(() => {
    if (cannedQuery === null) return [];
    return canned.filter(
      (c) =>
        c.shortcut.toLocaleLowerCase('tr').includes(cannedQuery) ||
        c.title.toLocaleLowerCase('tr').includes(cannedQuery),
    );
  }, [canned, cannedQuery]);

  useEffect(() => {
    setCannedOpen(cannedQuery !== null && cannedMatches.length > 0);
    setCannedIndex(0);
  }, [cannedQuery, cannedMatches.length]);

  const applyCanned = (item: CannedResponse) => {
    // "/kisayol" parçasını hazır metinle değiştir
    setDraft((prev) => prev.replace(/(?:^|\s)\/[\p{L}\d-]*$/u, (m) =>
      (m.startsWith(' ') ? ' ' : '') + item.content,
    ));
    setCannedOpen(false);
    bumpCannedUse(item.id);
    setTimeout(() => draftRef.current?.focus(), 0);
  };

  const handleDraftKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (cannedOpen && cannedMatches.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setCannedIndex((i) => (i + 1) % cannedMatches.length);
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setCannedIndex((i) => (i - 1 + cannedMatches.length) % cannedMatches.length);
        return;
      }
      if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        applyCanned(cannedMatches[cannedIndex]);
        return;
      }
      if (e.key === 'Escape') {
        setCannedOpen(false);
        return;
      }
    }

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFilePick = (file: File | null) => {
    if (!file) return;
    if (!ALLOWED_ATTACHMENT_TYPES.includes(file.type)) {
      alert('Yalnızca JPG, PNG, WEBP ve PDF gönderebilirsiniz.');
      return;
    }
    if (file.size > maxMb * 1024 * 1024) {
      alert(`Dosya çok büyük. En fazla ${maxMb} MB olmalı.`);
      return;
    }
    setPendingFile(file);
  };

  const handleStatusChange = async (status: ChatStatus) => {
    if (!selectedId) return;
    try {
      await setConversationStatus(selectedId, status);
      await loadConversations();
    } catch (err) {
      console.error('Durum güncellenemedi:', err);
      alert('Durum güncellenemedi.');
    }
  };

  const handleDelete = async () => {
    if (!selectedId) return;
    if (!confirm('Bu görüşme ve tüm mesajları kalıcı olarak silinecek. Emin misiniz?')) return;
    try {
      await deleteConversation(selectedId);
      setSelectedId(null);
      await loadConversations();
    } catch (err) {
      console.error('Görüşme silinemedi:', err);
      alert('Görüşme silinemedi.');
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-primary" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="flex items-center gap-3 text-2xl font-semibold text-primary">
          <FaComments className="text-ocean" /> Canlı Destek
          {waitingCount > 0 && (
            <span className="rounded-full bg-coral px-2.5 py-0.5 text-sm font-bold text-white">
              {waitingCount}
            </span>
          )}
        </h1>
      </div>

      {/* Yükseklik: viewport eksi admin header + sekme çubuğu + sayfa başlığı */}
      <div className="flex h-[calc(100vh-19rem)] min-h-[420px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {/* ---------------- Görüşme listesi ---------------- */}
        <aside
          className={`flex w-full flex-col border-r border-slate-200 md:w-80 lg:w-96 ${
            selectedId ? 'hidden md:flex' : 'flex'
          }`}
        >
          {/* Kapsam: kimin görüşmeleri — çoklu operatörde asıl ayrım burası */}
          <div className="flex border-b border-slate-200">
            {SCOPES.map((s) => (
              <button
                key={s.value}
                onClick={() => setScope(s.value)}
                aria-current={scope === s.value}
                className={`flex flex-1 items-center justify-center gap-1.5 border-b-2 px-2 py-2.5 text-xs font-medium transition-colors ${
                  scope === s.value
                    ? 'border-primary text-primary'
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                {s.label}
                {scopeCounts[s.value] > 0 && (
                  <span
                    className={`rounded-full px-1.5 text-[10px] font-bold ${
                      s.value === 'pool'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-coral text-white'
                    }`}
                  >
                    {scopeCounts[s.value]}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="border-b border-slate-100 p-3">
            <div className="relative">
              <FaSearch
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300"
                size={13}
                aria-hidden="true"
              />
              <label htmlFor="chat-search" className="sr-only">
                Görüşmelerde ara
              </label>
              <input
                id="chat-search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="İsim, telefon, e-posta ara..."
                className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="mt-3 flex gap-1">
              {FILTERS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setFilter(f.value)}
                  className={`flex-1 rounded-lg px-2 py-1.5 text-xs font-medium transition-colors ${
                    filter === f.value
                      ? 'bg-primary text-white'
                      : 'text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Etikete göre daralt — yalnızca kullanımdaki etiketler listelenir */}
            {allTags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {tagFilter && (
                  <button
                    onClick={() => setTagFilter(null)}
                    className="flex items-center gap-1 rounded-full bg-slate-800 px-2.5 py-1 text-[11px] font-medium text-white"
                  >
                    <FaTimes size={9} /> Etiket filtresi
                  </button>
                )}
                {allTags
                  .filter((t) =>
                    conversations.some((c) => (c.tags || []).includes(t.name)),
                  )
                  .map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setTagFilter(tagFilter === t.name ? null : t.name)}
                      aria-pressed={tagFilter === t.name}
                      className="rounded-full px-2.5 py-1 text-[11px] font-medium transition-opacity"
                      style={{
                        backgroundColor: `${t.color}1A`,
                        color: t.color,
                        opacity: tagFilter && tagFilter !== t.name ? 0.4 : 1,
                      }}
                    >
                      {t.name}
                    </button>
                  ))}
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {visible.length === 0 ? (
              <p className="p-8 text-center text-sm text-slate-400">
                Bu filtrede görüşme yok.
              </p>
            ) : (
              visible.map((c) => {
                const unread = hasUnreadForAgent(c);
                return (
                  <button
                    key={c.id}
                    onClick={() => setSelectedId(c.id)}
                    aria-current={selectedId === c.id}
                    className={`flex w-full gap-3 border-b border-slate-50 px-4 py-3 text-left transition-colors ${
                      selectedId === c.id ? 'bg-primary/5' : 'hover:bg-slate-50'
                    }`}
                  >
                    <FaUserCircle
                      size={38}
                      className="mt-0.5 flex-shrink-0 text-slate-200"
                      aria-hidden="true"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-2">
                        <span
                          className={`truncate text-sm ${
                            unread ? 'font-bold text-slate-900' : 'font-medium text-slate-700'
                          }`}
                        >
                          {c.visitor_name || 'İsimsiz Ziyaretçi'}
                        </span>
                        <span className="flex-shrink-0 text-[11px] text-slate-400">
                          {formatChatTime(c.last_message_at)}
                        </span>
                      </div>
                      <p className="truncate text-xs text-slate-500">
                        {c.visitor_phone || c.visitor_email || 'İletişim bilgisi yok'}
                      </p>
                      <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                            STATUS_STYLES[c.status].className
                          }`}
                        >
                          {STATUS_STYLES[c.status].label}
                        </span>
                        {(c.tags || []).slice(0, 2).map((t) => (
                          <span
                            key={t}
                            className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                            style={{ backgroundColor: `${tagColor(t)}1A`, color: tagColor(t) }}
                          >
                            {t}
                          </span>
                        ))}
                        {(c.tags || []).length > 2 && (
                          <span className="text-[10px] text-slate-400">
                            +{(c.tags || []).length - 2}
                          </span>
                        )}
                        {unread && (
                          <FaCircle size={7} className="text-coral" aria-label="Okunmamış" />
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </aside>

        {/* ---------------- Sohbet paneli ---------------- */}
        <section className={`flex flex-1 flex-col ${selectedId ? 'flex' : 'hidden md:flex'}`}>
          {!selected ? (
            <div className="flex flex-1 flex-col items-center justify-center text-slate-300">
              <FaComments size={48} aria-hidden="true" />
              <p className="mt-3 text-sm">Soldan bir görüşme seçin</p>
            </div>
          ) : (
            <>
              <header className="flex flex-wrap items-center gap-3 border-b border-slate-200 px-5 py-3">
                <button
                  onClick={() => setSelectedId(null)}
                  className="text-sm text-slate-400 md:hidden"
                >
                  ← Geri
                </button>

                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-slate-900">
                    {selected.visitor_name || 'İsimsiz Ziyaretçi'}
                  </p>
                  <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-slate-500">
                    {selected.visitor_phone && (
                      <a
                        href={`tel:${selected.visitor_phone}`}
                        className="flex items-center gap-1 hover:text-primary"
                      >
                        <FaPhone size={10} aria-hidden="true" /> {selected.visitor_phone}
                      </a>
                    )}
                    {selected.visitor_email && (
                      <a
                        href={`mailto:${selected.visitor_email}`}
                        className="flex items-center gap-1 hover:text-primary"
                      >
                        <FaEnvelope size={10} aria-hidden="true" /> {selected.visitor_email}
                      </a>
                    )}
                    <span className="flex items-center gap-1">
                      <FaClock size={10} aria-hidden="true" />
                      {new Date(selected.created_at).toLocaleString('tr-TR')}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Atama durumu: havuzdaysa üstlen, değilse kimde olduğu */}
                  {selected.assigned_to === null ? (
                    <button
                      onClick={handleClaim}
                      className="flex items-center gap-1.5 rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-600"
                    >
                      <FaHandPaper size={11} aria-hidden="true" /> Bana Ata
                    </button>
                  ) : (
                    <span
                      className={`rounded-lg px-2 py-1 text-xs font-medium ${
                        selected.assigned_to === user?.id
                          ? 'bg-primary/10 text-primary'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {selected.assigned_to === user?.id
                        ? 'Sizde'
                        : selected.assigned_name || 'Başka operatörde'}
                    </span>
                  )}

                  {team.length > 1 && (
                    <div className="relative">
                      <button
                        onClick={() => setTransferOpen((v) => !v)}
                        aria-expanded={transferOpen}
                        title="Başka operatöre devret"
                        aria-label="Görüşmeyi devret"
                        className="rounded-lg p-2 text-slate-500 hover:bg-slate-50"
                      >
                        <FaExchangeAlt size={13} aria-hidden="true" />
                      </button>

                      {transferOpen && (
                        <div className="absolute right-0 top-full z-30 mt-1 w-60 rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
                          <p className="px-3 py-1.5 text-[10px] uppercase tracking-wide text-slate-400">
                            Devredilecek danışman
                          </p>
                          {team
                            .filter((a) => a.user_id !== selected.assigned_to)
                            .map((a) => (
                              <button
                                key={a.user_id}
                                onClick={() => handleTransfer(a.user_id)}
                                className="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-slate-50"
                              >
                                <FaCircle
                                  size={7}
                                  className={
                                    a.is_available ? 'text-green-500' : 'text-slate-300'
                                  }
                                  aria-hidden="true"
                                />
                                <span className="flex-1 truncate text-xs text-slate-700">
                                  {a.display_name}
                                </span>
                                <span className="text-[10px] tabular-nums text-slate-400">
                                  {a.active_load}/{a.max_concurrent}
                                </span>
                              </button>
                            ))}
                        </div>
                      )}
                    </div>
                  )}

                  {selected.rating && (
                    <span
                      className="flex items-center gap-1 rounded-lg bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700"
                      title={selected.rating_comment || 'Ziyaretçi değerlendirmesi'}
                    >
                      <FaStar size={10} aria-hidden="true" /> {selected.rating}/5
                    </span>
                  )}

                  <button
                    onClick={() => downloadTranscriptCsv(selected, messages)}
                    title="CSV olarak indir"
                    aria-label="Transkripti CSV olarak indir"
                    className="rounded-lg p-2 text-slate-500 hover:bg-slate-50"
                  >
                    <FaFileCsv size={13} aria-hidden="true" />
                  </button>
                  <button
                    onClick={() => printTranscript(selected, messages)}
                    title="Yazdır / PDF olarak kaydet"
                    aria-label="Transkripti yazdır"
                    className="rounded-lg p-2 text-slate-500 hover:bg-slate-50"
                  >
                    <FaPrint size={13} aria-hidden="true" />
                  </button>

                  {selected.status === 'closed' ? (
                    <button
                      onClick={() => handleStatusChange('active')}
                      className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
                    >
                      <FaUndo size={11} aria-hidden="true" /> Yeniden Aç
                    </button>
                  ) : (
                    <button
                      onClick={() => handleStatusChange('closed')}
                      className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
                    >
                      <FaCheck size={11} aria-hidden="true" /> Sonlandır
                    </button>
                  )}
                  <button
                    onClick={handleDelete}
                    aria-label="Görüşmeyi sil"
                    className="rounded-lg p-2 text-red-500 hover:bg-red-50"
                  >
                    <FaTrash size={12} aria-hidden="true" />
                  </button>
                </div>
              </header>

              {/* Etiketler: mesaj içeriğine göre otomatik atanır, elle düzeltilebilir */}
              <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-100 px-5 py-2">
                <FaTag size={10} className="mr-0.5 text-slate-300" aria-hidden="true" />

                {(selected.tags || []).length === 0 && (
                  <span className="text-xs text-slate-400">Etiket yok</span>
                )}

                {(selected.tags || []).map((t) => (
                  <span
                    key={t}
                    className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold"
                    style={{ backgroundColor: `${tagColor(t)}1A`, color: tagColor(t) }}
                  >
                    {t}
                    <button
                      onClick={() => handleToggleTag(t)}
                      aria-label={`"${t}" etiketini kaldır`}
                      className="opacity-50 transition-opacity hover:opacity-100"
                    >
                      <FaTimes size={9} />
                    </button>
                  </span>
                ))}

                <div className="relative">
                  <button
                    onClick={() => setTagMenuOpen((v) => !v)}
                    aria-expanded={tagMenuOpen}
                    className="flex items-center gap-1 rounded-full border border-dashed border-slate-300 px-2.5 py-1 text-[11px] text-slate-500 hover:border-primary hover:text-primary"
                  >
                    <FaPlus size={8} /> Etiket
                  </button>

                  {tagMenuOpen && (
                    <div className="absolute left-0 top-full z-20 mt-1 max-h-64 w-56 overflow-y-auto rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
                      {allTags.filter((t) => t.is_active).map((t) => {
                        const on = (selected.tags || []).includes(t.name);
                        return (
                          <button
                            key={t.id}
                            onClick={() => handleToggleTag(t.name)}
                            className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs hover:bg-slate-50"
                          >
                            <span
                              className="h-2.5 w-2.5 flex-shrink-0 rounded-full"
                              style={{ backgroundColor: t.color }}
                            />
                            <span className="flex-1 truncate">{t.name}</span>
                            {on && <FaCheck size={9} className="text-success" />}
                          </button>
                        );
                      })}
                      {allTags.length === 0 && (
                        <p className="px-3 py-2 text-xs text-slate-400">
                          Henüz etiket kuralı yok.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {selected.page_url && (
                <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50 px-5 py-2 text-xs text-slate-500">
                  <FaGlobe size={10} className="flex-shrink-0" aria-hidden="true" />
                  <span className="truncate">Başladığı sayfa: {selected.page_url}</span>
                </div>
              )}

              <div
                ref={scrollRef}
                className="flex-1 space-y-3 overflow-y-auto bg-slate-50 px-5 py-4 custom-scrollbar"
                role="log"
                aria-live="polite"
              >
                {messages.map((m) => (
                  <AgentMessageBubble key={m.id} message={m} />
                ))}

                {visitorTyping && (
                  <div className="flex justify-start">
                    <div className="flex items-center gap-1 rounded-2xl rounded-bl-sm border border-slate-200 bg-white px-4 py-3">
                      <span className="sr-only">Ziyaretçi yazıyor</span>
                      {[0, 150, 300].map((d) => (
                        <span
                          key={d}
                          className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-300"
                          style={{ animationDelay: `${d}ms` }}
                          aria-hidden="true"
                        />
                      ))}
                    </div>
                  </div>
                )}

                {selected.rating_comment && (
                  <div className="mx-auto max-w-[80%] rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-center">
                    <p className="flex items-center justify-center gap-1 text-[11px] font-semibold text-amber-700">
                      {Array.from({ length: selected.rating || 0 }).map((_, i) => (
                        <FaStar key={i} size={9} aria-hidden="true" />
                      ))}
                      <span className="ml-1">Ziyaretçi değerlendirmesi</span>
                    </p>
                    <p className="mt-1 text-xs text-amber-900">
                      “{selected.rating_comment}”
                    </p>
                  </div>
                )}
              </div>

              <div className="border-t border-slate-200 p-3">
                {selected.status === 'closed' ? (
                  <p className="py-2 text-center text-sm text-slate-400">
                    Bu görüşme kapatıldı. Yanıt yazmak için yeniden açın.
                  </p>
                ) : (
                  <div className="relative">
                    {/* Hazır yanıt seçici — "/" ile açılır */}
                    {cannedOpen && (
                      <div className="absolute bottom-full left-0 z-30 mb-2 max-h-64 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
                        <p className="px-3 py-1.5 text-[10px] uppercase tracking-wide text-slate-400">
                          Hazır yanıtlar — ↑↓ ile seçin, Enter/Tab ile ekleyin
                        </p>
                        {cannedMatches.map((c, i) => (
                          <button
                            key={c.id}
                            onMouseEnter={() => setCannedIndex(i)}
                            onClick={() => applyCanned(c)}
                            className={`block w-full px-3 py-2 text-left ${
                              i === cannedIndex ? 'bg-primary/5' : 'hover:bg-slate-50'
                            }`}
                          >
                            <span className="flex items-center gap-2">
                              <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] text-slate-600">
                                /{c.shortcut}
                              </span>
                              <span className="text-xs font-medium text-slate-800">
                                {c.title}
                              </span>
                            </span>
                            <span className="mt-0.5 block truncate text-[11px] text-slate-400">
                              {c.content}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}

                    {pendingFile && (
                      <div className="mb-2 flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2">
                        <FaPaperclip size={11} className="text-slate-400" aria-hidden="true" />
                        <span className="min-w-0 flex-1 truncate text-xs text-slate-600">
                          {pendingFile.name}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {formatFileSize(pendingFile.size)}
                        </span>
                        <button
                          onClick={() => setPendingFile(null)}
                          aria-label="Dosyayı kaldır"
                          className="text-slate-400 hover:text-red-500"
                        >
                          <FaTimes size={11} />
                        </button>
                      </div>
                    )}

                    <div className="flex items-end gap-2">
                      {attachmentsEnabled && (
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
                            aria-label="Dosya ekle"
                            className="flex h-11 w-9 flex-shrink-0 items-center justify-center text-slate-400 hover:text-primary"
                          >
                            <FaPaperclip size={15} aria-hidden="true" />
                          </button>
                        </>
                      )}

                      <label htmlFor="agent-draft" className="sr-only">
                        Yanıtınız
                      </label>
                      <textarea
                        id="agent-draft"
                        ref={draftRef}
                        rows={1}
                        value={draft}
                        onChange={(e) => {
                          setDraft(e.target.value);
                          signalTyping();
                        }}
                        onKeyDown={handleDraftKeyDown}
                        placeholder="Yanıtınızı yazın... ( / ile hazır yanıt, Enter ile gönder)"
                        className="max-h-32 flex-1 resize-none rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                      />
                      <button
                        onClick={handleSend}
                        disabled={sending || (!draft.trim() && !pendingFile)}
                        aria-label="Yanıtı gönder"
                        className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-primary text-white transition-colors hover:bg-primary-light disabled:opacity-40"
                      >
                        <FaPaperPlane size={14} aria-hidden="true" />
                      </button>
                    </div>

                    <div className="mt-1.5 flex items-center gap-3 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <FaBolt size={9} aria-hidden="true" /> {canned.length} hazır yanıt
                      </span>
                      {uploading && <span>Dosya yükleniyor...</span>}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
};

const AgentMessageBubble = ({ message }: { message: ChatMessage }) => {
  const isAgent = message.sender_role === 'agent';
  const isSystem = message.sender_role === 'system';

  const time = new Date(message.created_at).toLocaleTimeString('tr-TR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  if (isSystem) {
    return (
      <p className="mx-auto max-w-[80%] rounded-lg bg-slate-100 px-3 py-1.5 text-center text-[11px] text-slate-500">
        {message.content}
      </p>
    );
  }

  return (
    <div className={`flex ${isAgent ? 'justify-end' : 'justify-start'}`}>
      <div className="max-w-[75%]">
        <div
          className={`break-words px-4 py-2.5 text-sm leading-relaxed ${
            isAgent
              ? 'rounded-2xl rounded-br-sm bg-primary text-white'
              : 'rounded-2xl rounded-bl-sm border border-slate-200 bg-white text-slate-800'
          }`}
        >
          {message.attachment_url && (
            <a
              href={message.attachment_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mb-1.5 block underline-offset-2 hover:underline"
            >
              {(message.attachment_type || '').startsWith('image/') ? (
                <img
                  src={message.attachment_url}
                  alt={message.attachment_name || 'Ek görsel'}
                  className="max-h-52 w-full rounded-lg object-cover"
                  loading="lazy"
                />
              ) : (
                <span className="flex items-center gap-2 text-xs">
                  <FaFilePdf size={14} aria-hidden="true" />
                  <span className="truncate">{message.attachment_name}</span>
                </span>
              )}
              <span
                className={`mt-0.5 block text-[10px] ${
                  isAgent ? 'text-white/60' : 'text-slate-400'
                }`}
              >
                {formatFileSize(message.attachment_size)}
              </span>
            </a>
          )}
          {message.content && <p className="whitespace-pre-wrap">{message.content}</p>}
        </div>
        <p className={`mt-1 text-[10px] text-slate-400 ${isAgent ? 'text-right' : ''}`}>
          {message.sender_name ? `${message.sender_name} · ` : ''}
          {time}
        </p>
      </div>
    </div>
  );
};

export default AdminLiveChat;
