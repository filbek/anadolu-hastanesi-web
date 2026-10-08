import { useState, useEffect, useMemo, useRef } from 'react';
import {
  FaChartBar, FaComments, FaExclamationTriangle, FaStopwatch,
  FaEnvelopeOpenText, FaSync, FaTable, FaStar, FaBolt,
} from 'react-icons/fa';
import {
  ChatStats, ChatTag, fetchChatStats, fetchChatTags, formatDuration,
} from '../../services/chatService';

/**
 * Tüm grafikler TEK serilidir (bir büyüklük ölçüsü), bu yüzden hepsi tek
 * renk kullanır ve lejant gerektirmez — başlık seriyi zaten adlandırır.
 * Renk burada kimlik değil, yalnızca "bu işaret veridir" demektir.
 */
const MARK = '#0A6B7D';
const GRID = '#E2E8F0';

const PERIODS = [
  { days: 7, label: '7 gün' },
  { days: 30, label: '30 gün' },
  { days: 90, label: '90 gün' },
];

const AdminChatStats = () => {
  const [stats, setStats] = useState<ChatStats | null>(null);
  const [tags, setTags] = useState<ChatTag[]>([]);
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showTable, setShowTable] = useState(false);

  const load = async (period: number) => {
    setLoading(true);
    setError(null);
    try {
      const [s, t] = await Promise.all([fetchChatStats(period), fetchChatTags()]);
      setStats(s);
      setTags(t);
    } catch (err) {
      console.error('İstatistikler alınamadı:', err);
      setError('İstatistikler alınamadı. Etiket/istatistik migration’ı çalıştırıldı mı?');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(days);
  }, [days]);

  const tagColor = useMemo(
    () => (name: string) => tags.find((t) => t.name === name)?.color || MARK,
    [tags],
  );

  if (loading && !stats) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-sm text-red-800">
        <p className="font-semibold">İstatistikler yüklenemedi</p>
        <p className="mt-1">{error}</p>
        <button
          onClick={() => load(days)}
          className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
        >
          Tekrar dene
        </button>
      </div>
    );
  }

  if (!stats) return null;

  const { totals, response } = stats;
  const answerRate = totals.conversations
    ? Math.round((response.answered / totals.conversations) * 100)
    : 0;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="flex items-center gap-3 text-2xl font-semibold text-primary">
          <FaChartBar className="text-ocean" /> Canlı Destek İstatistikleri
        </h1>

        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-slate-200 bg-white p-1">
            {PERIODS.map((p) => (
              <button
                key={p.days}
                onClick={() => setDays(p.days)}
                aria-pressed={days === p.days}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  days === p.days
                    ? 'bg-primary text-white'
                    : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
          <button
            onClick={() => load(days)}
            aria-label="Yenile"
            className="rounded-lg border border-slate-200 bg-white p-2.5 text-slate-500 hover:bg-slate-50"
          >
            <FaSync size={13} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* --- Özet kartlar --- */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile
          icon={FaComments}
          label="Görüşme"
          value={totals.conversations}
          hint={`${totals.open} bekleyen · ${totals.active} devam eden`}
        />
        <StatTile
          icon={FaExclamationTriangle}
          label="Yanıtlanmamış"
          value={totals.unanswered}
          hint="Kapanmamış ve operatör hiç yazmamış"
          tone={totals.unanswered > 0 ? 'alert' : 'default'}
        />
        <StatTile
          icon={FaStopwatch}
          label="Ort. İlk Yanıt"
          value={formatDuration(response.avg_first_seconds)}
          hint={`Medyan ${formatDuration(response.median_first_seconds)}`}
        />
        <StatTile
          icon={FaEnvelopeOpenText}
          label="Yanıtlanma Oranı"
          value={`%${answerRate}`}
          hint={`${response.answered} / ${totals.conversations} görüşme`}
        />
      </div>

      {/* --- Memnuniyet --- */}
      {stats.satisfaction && (
        <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Card title="Memnuniyet" subtitle="Görüşme sonu anketi">
            {stats.satisfaction.rated === 0 ? (
              <Empty note="Henüz değerlendirme yok." />
            ) : (
              <>
                <div className="mb-4 flex items-baseline gap-2">
                  <span className="font-display text-4xl font-bold text-slate-900">
                    {String(stats.satisfaction.average).replace('.', ',')}
                  </span>
                  <span className="text-sm text-slate-400">/ 5</span>
                  <span className="ml-auto text-xs text-slate-400">
                    {stats.satisfaction.rated} değerlendirme
                  </span>
                </div>

                <ul className="space-y-1.5">
                  {[5, 4, 3, 2, 1].map((s) => {
                    const n =
                      stats.satisfaction.breakdown.find((b) => b.stars === s)?.count || 0;
                    const pct = stats.satisfaction.rated
                      ? (n / stats.satisfaction.rated) * 100
                      : 0;
                    return (
                      <li key={s} className="flex items-center gap-2">
                        <span className="flex w-10 items-center gap-0.5 text-xs text-slate-500">
                          {s} <FaStar size={9} className="text-amber-400" />
                        </span>
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full bg-amber-400"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="w-6 text-right text-xs tabular-nums text-slate-500">
                          {n}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </>
            )}
          </Card>

          <div className="lg:col-span-2">
            <Card title="Son Yorumlar" subtitle="Ziyaretçilerin yazdıkları">
              {stats.satisfaction.comments.length === 0 ? (
                <Empty note="Henüz yorum yazılmamış." />
              ) : (
                <ul className="max-h-64 space-y-3 overflow-y-auto">
                  {stats.satisfaction.comments.map((c, i) => (
                    <li key={i} className="border-l-2 border-amber-300 pl-3">
                      <div className="flex items-center gap-2">
                        <span className="flex gap-0.5">
                          {Array.from({ length: c.stars }).map((_, j) => (
                            <FaStar key={j} size={9} className="text-amber-400" />
                          ))}
                        </span>
                        <span className="text-xs font-medium text-slate-700">
                          {c.name || 'İsimsiz'}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {new Date(c.at).toLocaleDateString('tr-TR')}
                        </span>
                      </div>
                      <p className="mt-0.5 text-sm text-slate-600">{c.comment}</p>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>
        </div>
      )}

      {/* --- Günlük seyir --- */}
      <Card
        title="Günlük Görüşme Sayısı"
        subtitle={`Son ${stats.period_days} gün`}
        action={
          <button
            onClick={() => setShowTable((v) => !v)}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-primary"
          >
            <FaTable size={11} /> {showTable ? 'Grafiği göster' : 'Tabloyu göster'}
          </button>
        }
      >
        {stats.daily.length === 0 ? (
          <Empty />
        ) : showTable ? (
          <DailyTable rows={stats.daily} />
        ) : (
          <TrendChart data={stats.daily} />
        )}
      </Card>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* --- Saat dağılımı --- */}
        <Card
          title="Saatlere Göre Yoğunluk"
          subtitle="Görüşmenin başladığı saat (Europe/Istanbul)"
        >
          {stats.hourly.length === 0 ? <Empty /> : <HourlyChart data={stats.hourly} />}
        </Card>

        {/* --- Etiket dağılımı --- */}
        <Card title="Konu Dağılımı" subtitle="Otomatik etiketlere göre">
          {stats.tags.length === 0 ? (
            <Empty note="Henüz etiketlenmiş görüşme yok." />
          ) : (
            <TagBars data={stats.tags} color={tagColor} />
          )}
        </Card>
      </div>

      {/* --- Operatörler ve hazır yanıtlar --- */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {stats.agents.length > 0 && (
          <Card title="Operatör Aktivitesi" subtitle="Gönderilen yanıt sayısı">
            <ul className="divide-y divide-slate-100">
              {stats.agents.map((a) => (
                <li key={a.name} className="flex items-center justify-between py-2.5">
                  <span className="text-sm text-slate-700">{a.name}</span>
                  <span className="text-sm font-semibold text-slate-900">
                    {a.messages} mesaj
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        )}

        {stats.canned && stats.canned.length > 0 && (
          <Card
            title="En Çok Kullanılan Hazır Yanıtlar"
            subtitle="Hangi metinler işe yarıyor"
          >
            <ul className="divide-y divide-slate-100">
              {stats.canned.map((c) => (
                <li key={c.title} className="flex items-center justify-between py-2.5">
                  <span className="flex items-center gap-2 text-sm text-slate-700">
                    <FaBolt size={10} className="text-ocean" aria-hidden="true" />
                    {c.title}
                  </span>
                  <span className="text-sm font-semibold text-slate-900">{c.count}</span>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </div>
    </div>
  );
};

// ============================================================
// Kartlar
// ============================================================

const Card = ({
  title, subtitle, action, children,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) => (
  <section className="rounded-2xl border border-slate-200 bg-white p-5">
    <div className="mb-4 flex items-start justify-between gap-3">
      <div>
        <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
        {subtitle && <p className="mt-0.5 text-xs text-slate-400">{subtitle}</p>}
      </div>
      {action}
    </div>
    {children}
  </section>
);

const StatTile = ({
  icon: Icon, label, value, hint, tone = 'default',
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: number | string;
  hint?: string;
  tone?: 'default' | 'alert';
}) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-5">
    <div className="flex items-center gap-2 text-slate-400">
      <Icon size={13} className={tone === 'alert' ? 'text-coral' : ''} />
      <span className="text-xs font-medium uppercase tracking-wide">{label}</span>
    </div>
    <p
      className={`mt-2 font-display text-3xl font-bold tabular-nums ${
        tone === 'alert' ? 'text-coral' : 'text-slate-900'
      }`}
    >
      {value}
    </p>
    {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
  </div>
);

const Empty = ({ note = 'Bu dönemde veri yok.' }: { note?: string }) => (
  <p className="py-10 text-center text-sm text-slate-400">{note}</p>
);

// ============================================================
// Grafikler
//
// Hepsi tek serili. Izgara ve eksenler geri planda; değerler noktaya
// gelince tooltip ile, uçlarda doğrudan etiketle okunur.
// ============================================================

const TrendChart = ({ data }: { data: { date: string; count: number }[] }) => {
  const [hover, setHover] = useState<number | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  const W = 720;
  const H = 220;
  const PAD = { top: 16, right: 16, bottom: 28, left: 34 };

  const max = Math.max(...data.map((d) => d.count), 1);
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;

  const x = (i: number) =>
    PAD.left + (data.length === 1 ? innerW / 2 : (i / (data.length - 1)) * innerW);
  const y = (v: number) => PAD.top + innerH - (v / max) * innerH;

  const line = data.map((d, i) => `${i === 0 ? 'M' : 'L'}${x(i)},${y(d.count)}`).join(' ');
  const area = `${line} L${x(data.length - 1)},${PAD.top + innerH} L${x(0)},${
    PAD.top + innerH
  } Z`;

  // Fare konumundan en yakın günü bul
  const onMove = (e: React.MouseEvent) => {
    const rect = wrapRef.current?.getBoundingClientRect();
    if (!rect) return;
    const rel = ((e.clientX - rect.left) / rect.width) * W;
    const frac = (rel - PAD.left) / innerW;
    const idx = Math.round(frac * (data.length - 1));
    setHover(Math.min(Math.max(idx, 0), data.length - 1));
  };

  const ticks = [0, Math.round(max / 2), max];
  const fmt = (iso: string) =>
    new Date(iso).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });

  return (
    <div className="relative" ref={wrapRef} onMouseMove={onMove} onMouseLeave={() => setHover(null)}>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img"
           aria-label={`Günlük görüşme sayısı, ${data.length} gün`}>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={PAD.left} x2={W - PAD.right} y1={y(t)} y2={y(t)} stroke={GRID} strokeWidth={1} />
            <text x={PAD.left - 8} y={y(t) + 4} textAnchor="end" fontSize={11} fill="#94A3B8">
              {t}
            </text>
          </g>
        ))}

        <path d={area} fill={MARK} opacity={0.08} />
        <path d={line} fill="none" stroke={MARK} strokeWidth={2}
              strokeLinecap="round" strokeLinejoin="round" />

        {/* Tek gün varsa çizgi görünmez; noktayı her hâlükârda göster */}
        {data.length === 1 && <circle cx={x(0)} cy={y(data[0].count)} r={4} fill={MARK} />}

        {hover !== null && (
          <>
            <line x1={x(hover)} x2={x(hover)} y1={PAD.top} y2={PAD.top + innerH}
                  stroke={MARK} strokeWidth={1} opacity={0.3} />
            {/* 2px yüzey halkası: işaret arka planla karışmasın */}
            <circle cx={x(hover)} cy={y(data[hover].count)} r={5}
                    fill={MARK} stroke="#fff" strokeWidth={2} />
          </>
        )}

        <text x={PAD.left} y={H - 8} fontSize={11} fill="#94A3B8">
          {fmt(data[0].date)}
        </text>
        {data.length > 1 && (
          <text x={W - PAD.right} y={H - 8} fontSize={11} fill="#94A3B8" textAnchor="end">
            {fmt(data[data.length - 1].date)}
          </text>
        )}
      </svg>

      {hover !== null && (
        <div
          className="pointer-events-none absolute -translate-x-1/2 -translate-y-full rounded-lg bg-slate-900 px-2.5 py-1.5 text-xs text-white shadow-lg"
          style={{
            left: `${(x(hover) / W) * 100}%`,
            top: `${(y(data[hover].count) / H) * 100}%`,
          }}
        >
          <span className="font-semibold">{data[hover].count}</span> görüşme
          <span className="ml-1.5 opacity-60">{fmt(data[hover].date)}</span>
        </div>
      )}
    </div>
  );
};

const HourlyChart = ({ data }: { data: { hour: number; count: number }[] }) => {
  const [hover, setHover] = useState<number | null>(null);

  // Boş saatler de görünsün ki "sessiz saatler" okunabilsin
  const full = Array.from({ length: 24 }, (_, h) => ({
    hour: h,
    count: data.find((d) => d.hour === h)?.count ?? 0,
  }));
  const max = Math.max(...full.map((d) => d.count), 1);

  return (
    <div>
      {/* items-stretch şart: items-end olsaydı sütunlar içeriğe göre
          küçülür, çubukların yüzde yüksekliği sıfır yükseklikli bir
          kaba göre hesaplanır ve hiçbir çubuk görünmezdi. */}
      <div className="flex h-40 items-stretch gap-[2px]">
        {full.map((d) => (
          <div
            key={d.hour}
            className="group relative flex flex-1 flex-col justify-end"
            onMouseEnter={() => setHover(d.hour)}
            onMouseLeave={() => setHover(null)}
          >
            {hover === d.hour && d.count > 0 && (
              <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 -translate-x-1/2 whitespace-nowrap rounded-lg bg-slate-900 px-2 py-1 text-[11px] text-white shadow-lg">
                {String(d.hour).padStart(2, '0')}:00 — {d.count} görüşme
              </div>
            )}
            <div
              className="w-full rounded-t transition-opacity"
              style={{
                height: `${Math.max((d.count / max) * 100, d.count > 0 ? 4 : 1)}%`,
                backgroundColor: d.count > 0 ? MARK : GRID,
                opacity: hover !== null && hover !== d.hour ? 0.45 : 1,
              }}
            />
          </div>
        ))}
      </div>
      <div className="mt-2 flex justify-between text-[11px] text-slate-400">
        <span>00:00</span>
        <span>06:00</span>
        <span>12:00</span>
        <span>18:00</span>
        <span>23:00</span>
      </div>
    </div>
  );
};

const TagBars = ({
  data, color,
}: {
  data: { tag: string; count: number }[];
  color: (name: string) => string;
}) => {
  const max = Math.max(...data.map((d) => d.count), 1);

  return (
    <ul className="space-y-2.5">
      {data.slice(0, 10).map((d) => (
        <li key={d.tag}>
          <div className="mb-1 flex items-baseline justify-between gap-2">
            <span className="flex items-center gap-1.5 text-xs font-medium text-slate-700">
              <span
                className="h-2 w-2 flex-shrink-0 rounded-full"
                style={{ backgroundColor: color(d.tag) }}
                aria-hidden="true"
              />
              {d.tag}
            </span>
            <span className="text-xs tabular-nums text-slate-500">{d.count}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full"
              style={{
                width: `${(d.count / max) * 100}%`,
                backgroundColor: color(d.tag),
              }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
};

const DailyTable = ({ rows }: { rows: { date: string; count: number }[] }) => (
  <div className="max-h-64 overflow-y-auto">
    <table className="w-full text-sm">
      <thead className="sticky top-0 bg-white text-left text-xs text-slate-400">
        <tr>
          <th className="py-2 font-medium">Tarih</th>
          <th className="py-2 text-right font-medium">Görüşme</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {[...rows].reverse().map((r) => (
          <tr key={r.date}>
            <td className="py-2 text-slate-600">
              {new Date(r.date).toLocaleDateString('tr-TR', {
                day: 'numeric', month: 'long', weekday: 'short',
              })}
            </td>
            <td className="py-2 text-right font-medium tabular-nums text-slate-900">
              {r.count}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default AdminChatStats;
