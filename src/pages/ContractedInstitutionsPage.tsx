import { useMemo, useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FaSearch, FaHandshake, FaGraduationCap, FaIndustry, FaTshirt, FaBoxOpen,
  FaCogs, FaHardHat, FaUtensils, FaHeartbeat, FaTruck, FaHotel, FaUsers,
  FaLandmark, FaStore, FaBuilding, FaChevronDown,
} from 'react-icons/fa'
import PageBanner from '../components/common/PageBanner'
import { useHospitals } from '../hooks/useHospitals'
import { useLocalizedList } from '../hooks/useLocalizedList'
import { useContractedInstitutions } from '../hooks/useContractedInstitutions'
import { type ContractedCategory } from '../data/contractedInstitutions'

// Kategori başlığına göre ikon eşlemesi (Türkçe küçük harfe duyarsız anahtar kelimeler)
const getCategoryIcon = (category: string) => {
  const c = category.toLocaleLowerCase('tr')
  if (c.includes('eğitim')) return <FaGraduationCap />
  if (c.includes('tekstil')) return <FaTshirt />
  if (c.includes('plastik') || c.includes('ambalaj') || c.includes('baskı')) return <FaBoxOpen />
  if (c.includes('metal') || c.includes('makine')) return <FaCogs />
  if (c.includes('inşaat') || c.includes('yapı')) return <FaHardHat />
  if (c.includes('gıda') || c.includes('restoran') || c.includes('pasta')) return <FaUtensils />
  if (c.includes('sağlık') || c.includes('medikal') || c.includes('güzellik')) return <FaHeartbeat />
  if (c.includes('lojistik') || c.includes('taşımacılık') || c.includes('otomotiv')) return <FaTruck />
  if (c.includes('otel') || c.includes('turizm') || c.includes('konaklama')) return <FaHotel />
  if (c.includes('dernek') || c.includes('vakıf') || c.includes('sendika')) return <FaUsers />
  if (c.includes('kamu') || c.includes('resmî') || c.includes('resmi')) return <FaLandmark />
  if (c.includes('perakende') || c.includes('moda')) return <FaStore />
  if (c.includes('sanayi') || c.includes('üretim')) return <FaIndustry />
  return <FaBuilding />
}

const normalize = (str: string) =>
  (str || '')
    .toLocaleLowerCase('tr-TR')
    .replace(/ı/g, 'i')
    .replace(/\s+/g, ' ')
    .trim()

const ContractedInstitutionsPage = () => {
  const { t } = useTranslation()
  const { data: hospitalsRaw = [], isLoading: hospitalsLoading } = useHospitals({ onlyPublished: true })
  const hospitals = useLocalizedList(hospitalsRaw, ['name'])
  const { data: rows = [], isLoading: rowsLoading } = useContractedInstitutions()
  const isLoading = hospitalsLoading || rowsLoading
  const [activeHospitalId, setActiveHospitalId] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState('')
  // Açık olan kategoriler (accordion). Varsayılan: hepsi kapalı.
  const [openCats, setOpenCats] = useState<Set<string>>(new Set())

  const toggleCategory = (category: string) => {
    setOpenCats((prev) => {
      const next = new Set(prev)
      next.has(category) ? next.delete(category) : next.add(category)
      return next
    })
  }

  // DB satırlarını hastane id'sine göre kategori listelerine grupla
  const categoriesByHospital = useMemo(() => {
    const map = new Map<string, ContractedCategory[]>()
    ;(rows as any[]).forEach((row) => {
      const key = String(row.hospital_id)
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push({ category: row.category, items: row.items || [] })
    })
    return map
  }, [rows])

  // Yalnızca anlaşmalı kurum verisi olan şubeleri sekme olarak göster
  const hospitalTabs = useMemo(
    () => (hospitals as any[]).filter((h) => (categoriesByHospital.get(String(h.id))?.length ?? 0) > 0),
    [hospitals, categoriesByHospital]
  )

  // İlk yüklemede verisi olan ilk şubeyi seç
  useEffect(() => {
    if (!activeHospitalId && hospitalTabs.length > 0) {
      setActiveHospitalId(String(hospitalTabs[0].id))
    }
  }, [hospitalTabs, activeHospitalId])

  const activeHospital = (hospitals as any[]).find((h) => String(h.id) === activeHospitalId)
  const categories: ContractedCategory[] = categoriesByHospital.get(activeHospitalId) ?? []

  // Aramaya göre kategori ve kurumları filtrele
  const filteredCategories = useMemo(() => {
    const q = normalize(searchTerm)
    if (!q) return categories
    return categories
      .map((cat) => ({
        ...cat,
        items: cat.items.filter((item) => normalize(item).includes(q)),
      }))
      .filter((cat) => cat.items.length > 0)
  }, [categories, searchTerm])

  const totalCount = useMemo(
    () => categories.reduce((sum, c) => sum + c.items.length, 0),
    [categories]
  )
  const filteredCount = useMemo(
    () => filteredCategories.reduce((sum, c) => sum + c.items.length, 0),
    [filteredCategories]
  )

  return (
    <div className="bg-gray-50 min-h-screen">
      <Helmet>
        <title>{t('contracted.pageTitle', 'Anlaşmalı Kurumlar')} | Anadolu Hastaneleri Grubu</title>
        <meta
          name="description"
          content={t('contracted.metaDescription', 'Anadolu Hastaneleri Grubu şubelerinin anlaşmalı olduğu kurum ve kuruluşlar.')}
        />
      </Helmet>

      <PageBanner
        title={t('contracted.pageTitle', 'Anlaşmalı Kurumlar')}
        subtitle={t('contracted.pageSubtitle', 'Şubelerimizin anlaşmalı olduğu kurum ve kuruluşlar. Kurumunuzu seçerek avantajlı sağlık hizmetlerimizden yararlanın.')}
        image="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
      />

      <div className="container-custom py-16 lg:py-20">
        {/* Şube sekmeleri */}
        {hospitalTabs.length > 0 && (
          <div
            className="flex flex-wrap justify-center gap-2 mb-8"
            role="tablist"
            aria-label={t('contracted.tabsLabel', 'Hastane şubesine göre anlaşmalı kurumlar')}
          >
            {hospitalTabs.map((hospital: any) => (
              <button
                key={hospital.id}
                type="button"
                role="tab"
                aria-selected={activeHospitalId === String(hospital.id)}
                className={`px-5 py-2 rounded-full text-sm font-semibold transition-colors ${
                  activeHospitalId === String(hospital.id) ? 'bg-primary text-white' : 'bg-white text-text-light hover:bg-primary/10 border border-gray-200'
                }`}
                onClick={() => { setActiveHospitalId(String(hospital.id)); setSearchTerm('') }}
              >
                {hospital.name}
              </button>
            ))}
          </div>
        )}

        {/* Arama */}
        {totalCount > 0 && (
          <div className="max-w-xl mx-auto mb-10">
            <div className="relative">
              <label htmlFor="contracted-search" className="sr-only">
                {t('contracted.searchLabel', 'Kurum ara')}
              </label>
              <input
                id="contracted-search"
                type="search"
                placeholder={t('contracted.searchPlaceholder', 'Kurum adı ara...')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-12"
              />
              <FaSearch aria-hidden="true" className="absolute left-4 top-1/2 -translate-y-1/2 text-text-light" />
            </div>
            <p className="sr-only" role="status" aria-live="polite">
              {t('contracted.resultCount', '{{count}} kurum listeleniyor', { count: filteredCount })}
            </p>
          </div>
        )}

        {/* İçerik */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : hospitalTabs.length === 0 || totalCount === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <FaHandshake className="text-5xl mx-auto mb-4 opacity-30" />
            <p className="font-medium">
              {t('contracted.empty', '{{hospital}} için anlaşmalı kurum bilgisi henüz eklenmemiş.', {
                hospital: activeHospital?.name || t('contracted.thisBranch', 'Bu şube'),
              })}
            </p>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="text-center py-16">
            <FaSearch className="text-4xl text-text-light mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">{t('common.noResults', 'Sonuç Bulunamadı')}</h3>
            <p className="text-text-light">{t('contracted.noResultsDesc', 'Arama kriterinize uygun kurum bulunamadı.')}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredCategories.map((cat, idx) => {
              // Aramada eşleşen kategoriler otomatik açılır; aksi halde kullanıcı tıklamasına bağlı
              const isOpen = searchTerm.trim() ? true : openCats.has(cat.category)
              const panelId = `contracted-panel-${idx}`
              return (
                <motion.section
                  key={cat.category}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.05 }}
                  transition={{ duration: 0.4, delay: Math.min(idx * 0.04, 0.3) }}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => toggleCategory(cat.category)}
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    className="w-full flex items-center gap-4 px-6 py-5 bg-primary/5 hover:bg-primary/10 transition-colors text-left"
                  >
                    <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-lg flex-shrink-0">
                      {getCategoryIcon(cat.category)}
                    </div>
                    <h2 className="text-lg font-bold text-primary">{cat.category}</h2>
                    <span className="ml-auto text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                      {cat.items.length}
                    </span>
                    <FaChevronDown
                      aria-hidden="true"
                      className={`text-primary/60 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                    />
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        id={panelId}
                        key="panel"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden"
                      >
                        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-1 p-6 border-t border-gray-100">
                          {cat.items.map((item) => (
                            <li key={item} className="flex items-start gap-2.5 py-1.5 text-sm text-gray-700">
                              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.section>
              )
            })}
          </div>
        )}

        {/* Bilgilendirme */}
        {totalCount > 0 && (
          <div className="max-w-3xl mx-auto mt-12 bg-gray-100 rounded-2xl p-6 text-center text-gray-600 text-sm">
            {t('contracted.footerNote', 'Anlaşmalı kurum çalışanları ve yakınları için sunulan indirim ve avantajlar hakkında detaylı bilgi almak üzere hastane çağrı merkezimizle (444 50 58) iletişime geçebilirsiniz.')}
          </div>
        )}
      </div>
    </div>
  )
}

export default ContractedInstitutionsPage
