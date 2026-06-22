import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FaGlobe, FaMagic, FaSyncAlt, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa'
import { supabase } from '../../lib/supabase'
import {
  TARGET_LANGS,
  type TargetLang,
  mergeTranslations,
} from '../../services/translationService'

/**
 * Toplu çeviri ekranı.
 * Her tabloyu tarayıp `translations` sütununda eksik dilleri otomatik üretir.
 *
 * Önkoşul: src/sql/translations_migration.sql Supabase'de çalıştırılmış olmalı.
 */

type TableConfig = {
  table: string
  label: string
  fields: string[]
}

const TABLES: TableConfig[] = [
  {
    table: 'hospitals',
    label: 'Hastaneler',
    fields: [
      'name',
      'description',
      'address',
      'working_hours',
      'emergency_hours',
      'meta_title',
      'meta_description',
      'hero_title',
      'hero_subtitle',
    ],
  },
  {
    table: 'departments',
    label: 'Bölümler',
    fields: [
      'name',
      'description',
      'long_description',
      'meta_title',
      'meta_description',
      'hero_title',
      'hero_subtitle',
    ],
  },
  {
    table: 'doctors',
    label: 'Doktorlar',
    fields: ['title', 'education', 'experience', 'about', 'specialties'],
  },
  {
    table: 'health_articles',
    label: 'Sağlık Makaleleri',
    fields: ['title', 'category', 'excerpt', 'content', 'read_time', 'author_title', 'tags'],
  },
  {
    table: 'pages',
    label: 'Sayfalar',
    fields: ['title', 'content', 'meta_title', 'meta_description'],
  },
  {
    table: 'hero_slides',
    label: 'Hero Slider',
    fields: ['title', 'subtitle', 'button_text'],
  },
  {
    table: 'testimonials',
    label: 'Hasta Yorumları',
    fields: ['title', 'comment'],
  },
  {
    table: 'news_items',
    label: 'Haberler',
    fields: ['title', 'excerpt', 'content', 'category'],
  },
  {
    table: 'site_stats',
    label: 'İstatistikler',
    fields: ['label'],
  },
  {
    table: 'accreditations',
    label: 'Akreditasyonlar',
    fields: ['name'],
  },
]

type TableStatus = {
  total: number
  missing: number
  loading: boolean
  error?: string
  progress?: { done: number; total: number }
}

const AdminTranslations = () => {
  const { t } = useTranslation()
  const [statuses, setStatuses] = useState<Record<string, TableStatus>>({})
  const [running, setRunning] = useState<string | null>(null)
  const [forceMode, setForceMode] = useState(false)

  useEffect(() => {
    void scanAll()
  }, [])

  const scanTable = async (cfg: TableConfig): Promise<TableStatus> => {
    try {
      const { data, error } = await supabase
        .from(cfg.table)
        .select('id, translations')
      if (error) throw error
      const rows = data || []
      const missing = rows.filter((r: any) => isMissing(r.translations, cfg.fields)).length
      return { total: rows.length, missing, loading: false }
    } catch (e: any) {
      return {
        total: 0,
        missing: 0,
        loading: false,
        error: e?.message || 'Hata',
      }
    }
  }

  const scanAll = async () => {
    const next: Record<string, TableStatus> = {}
    for (const cfg of TABLES) {
      next[cfg.table] = { total: 0, missing: 0, loading: true }
    }
    setStatuses(next)
    for (const cfg of TABLES) {
      const s = await scanTable(cfg)
      setStatuses((prev) => ({ ...prev, [cfg.table]: s }))
    }
  }

  const translateTable = async (cfg: TableConfig) => {
    setRunning(cfg.table)
    setStatuses((prev) => ({
      ...prev,
      [cfg.table]: { ...prev[cfg.table], loading: true, error: undefined },
    }))
    try {
      const { data, error } = await supabase.from(cfg.table).select('*')
      if (error) throw error
      const rows = data || []

      const targetRows = forceMode
        ? rows
        : rows.filter((r: any) => isMissing(r.translations, cfg.fields))

      const total = targetRows.length
      let done = 0
      setStatuses((prev) => ({
        ...prev,
        [cfg.table]: { ...prev[cfg.table], progress: { done, total } },
      }))

      for (const row of targetRows) {
        const merged = await mergeTranslations(
          row,
          cfg.fields as any,
          row.translations || {},
          { force: forceMode }
        )
        const { error: upErr } = await supabase
          .from(cfg.table)
          .update({ translations: merged })
          .eq('id', row.id)
        if (upErr) throw upErr
        done++
        setStatuses((prev) => ({
          ...prev,
          [cfg.table]: { ...prev[cfg.table], progress: { done, total } },
        }))
      }

      const fresh = await scanTable(cfg)
      setStatuses((prev) => ({ ...prev, [cfg.table]: fresh }))
    } catch (e: any) {
      setStatuses((prev) => ({
        ...prev,
        [cfg.table]: { ...prev[cfg.table], loading: false, error: e?.message || 'Hata' },
      }))
    } finally {
      setRunning(null)
    }
  }

  const translateAll = async () => {
    for (const cfg of TABLES) {
      const s = statuses[cfg.table]
      if (s?.error) continue // tablo yoksa atla
      if (!forceMode && (s?.missing ?? 0) === 0) continue
      await translateTable(cfg)
    }
  }

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
        <h1 className="text-2xl font-semibold text-primary flex items-center">
          <FaGlobe className="mr-2" />
          {t('admin.translations.title', 'Otomatik Çeviri Yönetimi')}
        </h1>
        <div className="flex items-center gap-2">
          <label className="flex items-center text-sm text-gray-600 mr-2">
            <input
              type="checkbox"
              checked={forceMode}
              onChange={(e) => setForceMode(e.target.checked)}
              className="mr-2"
            />
            Mevcut çevirilerin üzerine yaz
          </label>
          <button
            type="button"
            onClick={() => void scanAll()}
            disabled={running !== null}
            className="bg-gray-200 text-gray-700 px-3 py-2 rounded-md text-sm hover:bg-gray-300 transition-colors flex items-center disabled:opacity-50"
          >
            <FaSyncAlt className="mr-2" />
            Yeniden Tara
          </button>
          <button
            type="button"
            onClick={() => void translateAll()}
            disabled={running !== null}
            className="bg-primary text-white px-4 py-2 rounded-md text-sm hover:bg-primary-dark transition-colors flex items-center disabled:opacity-50"
          >
            <FaMagic className="mr-2" />
            {running ? `Çevriliyor: ${running}` : 'Tüm Eksikleri Çevir'}
          </button>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-sm text-blue-900">
        <p className="mb-2">
          <strong>Nasıl çalışır:</strong> Türkçe içeriğiniz veritabanında olduğu gibi
          kalır. <code className="bg-white px-1 rounded">translations</code> JSONB sütunu
          her satıra <em>{TARGET_LANGS.join(', ')}</em> dillerinde otomatik çeviri ekler.
        </p>
        <p className="mb-2">
          Yeni içerik eklerken her form üstündeki <strong>"Tümünü Otomatik Çevir"</strong>{' '}
          butonu o satır için çeviri üretir. Bu sayfa, mevcut içeriklerdeki eksiklikleri
          toplu olarak doldurmak içindir.
        </p>
        <p>
          <strong>Önkoşul:</strong> Supabase'de{' '}
          <code className="bg-white px-1 rounded">src/sql/translations_migration.sql</code>{' '}
          dosyası bir kez çalıştırılmış olmalı.
        </p>
      </div>

      <div className="space-y-3">
        {TABLES.map((cfg) => {
          const s = statuses[cfg.table]
          const isRunning = running === cfg.table
          return (
            <div
              key={cfg.table}
              className="bg-white rounded-lg shadow-sm p-4 flex items-center justify-between flex-wrap gap-3"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-800">{cfg.label}</h3>
                  <code className="text-xs text-gray-400">{cfg.table}</code>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Çevrilen alanlar: {cfg.fields.join(', ')}
                </p>
                {s?.error ? (
                  <p className="text-xs text-red-600 mt-1 flex items-center">
                    <FaExclamationTriangle className="mr-1" />
                    {s.error}
                  </p>
                ) : s?.loading && !s.progress ? (
                  <p className="text-xs text-gray-500 mt-1">Taranıyor...</p>
                ) : s?.progress ? (
                  <div className="mt-2">
                    <div className="text-xs text-gray-600 mb-1">
                      Çevriliyor: {s.progress.done} / {s.progress.total}
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div
                        className="bg-primary h-1.5 rounded-full transition-all"
                        style={{
                          width: `${
                            s.progress.total > 0
                              ? (s.progress.done / s.progress.total) * 100
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-gray-600 mt-1">
                    Toplam: <strong>{s?.total ?? '-'}</strong> ·{' '}
                    {s && s.missing === 0 ? (
                      <span className="text-green-600 font-semibold inline-flex items-center">
                        <FaCheckCircle className="mr-1" /> Tüm çeviriler tamam
                      </span>
                    ) : (
                      <span className="text-orange-600 font-semibold">
                        Eksik: {s?.missing ?? '-'}
                      </span>
                    )}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={() => void translateTable(cfg)}
                disabled={
                  running !== null ||
                  !!s?.error ||
                  (!forceMode && (s?.missing ?? 0) === 0)
                }
                className="bg-primary text-white px-3 py-1.5 rounded-md text-sm hover:bg-primary-dark transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isRunning ? (
                  <>
                    <FaSyncAlt className="mr-1.5 animate-spin" />
                    Çevriliyor...
                  </>
                ) : (
                  <>
                    <FaMagic className="mr-1.5" />
                    {forceMode ? 'Yeniden Çevir' : 'Eksikleri Çevir'}
                  </>
                )}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function isMissing(translations: any, fields: string[]): boolean {
  if (!translations || typeof translations !== 'object') return true
  for (const lang of TARGET_LANGS) {
    const t = translations[lang as TargetLang]
    if (!t || typeof t !== 'object') return true
    for (const f of fields) {
      const v = t[f]
      if (v == null) return true
      if (typeof v === 'string' && v.trim() === '') return true
      // Diziler için: kaynak boş değilse ama hedef boşsa eksik say
      if (Array.isArray(v) && v.length === 0) return true
    }
  }
  return false
}

export default AdminTranslations
