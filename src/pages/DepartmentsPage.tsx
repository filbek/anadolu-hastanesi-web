import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import SectionTitle from '../components/ui/SectionTitle'
import { FaSearch } from 'react-icons/fa'

import { useDepartments } from '../hooks/useDepartments'
import { useDoctors } from '../hooks/useDoctors'
import { useHospitals } from '../hooks/useHospitals'
import { useLocalizedList } from '../hooks/useLocalizedList'

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.06,
    },
  },
}

const itemVariants = {
  hidden: { y: 16 },
  visible: {
    y: 0,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  },
}

const DepartmentsPage = () => {
  const { t } = useTranslation();
  const { data: departmentsRaw = [], isLoading } = useDepartments({ onlyPublished: true })
  const { data: doctorsRaw = [] } = useDoctors()
  const { data: hospitalsRaw = [] } = useHospitals({ onlyPublished: true })
  const departments = useLocalizedList(departmentsRaw, ['name', 'description'])
  const hospitals = useLocalizedList(hospitalsRaw, ['name'])
  const [searchTerm, setSearchTerm] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')
  // Seçili hastane şubesi: 'all' = tüm bölümler, aksi halde hastane id'si (string)
  const [activeHospital, setActiveHospital] = useState<string>('all')

  // Her hastane şubesinde gösterilecek bölüm id'lerini hibrit olarak hesapla:
  //   (o şubede aktif doktoru olan bölümler)  ∪  (admin'in "her zaman göster" seçtiği department_ids)
  // Doktordan türeyen kısım: bir doktorun tek hospital_id + tek department_id'si olduğundan
  // "bu şubede hangi bölümler var" bilgisini doktor kayıtlarından çıkarıyoruz.
  const hospitalDeptMap = useMemo(() => {
    const map = new Map<string, Set<number>>()
    // Önce admin tarafından hastaneye elle eklenmiş bölümler (tanı/hizmet birimleri vb.)
    ;(hospitalsRaw as any[]).forEach((h) => {
      const set = new Set<number>()
      ;(h.department_ids ?? []).forEach((id: any) => {
        if (id != null) set.add(Number(id))
      })
      map.set(String(h.id), set)
    })
    // Sonra doktoru bulunan bölümleri ekle
    ;(doctorsRaw as any[]).forEach((doc) => {
      if (doc.hospital_id == null || doc.department_id == null) return
      const key = String(doc.hospital_id)
      if (!map.has(key)) map.set(key, new Set())
      map.get(key)!.add(Number(doc.department_id))
    })
    return map
  }, [doctorsRaw, hospitalsRaw])

  // Sadece en az bir bölümü olan şubeleri sekme olarak göster,
  // hastanelerin display_order sırasını koru.
  const hospitalTabs = useMemo(
    () => (hospitals as any[]).filter((h) => (hospitalDeptMap.get(String(h.id))?.size ?? 0) > 0),
    [hospitals, hospitalDeptMap]
  )

  // Aktif şubeye ait bölüm id'leri (şube seçili değilse null = tümü)
  const activeHospitalDeptIds = activeHospital === 'all' ? null : hospitalDeptMap.get(activeHospital) ?? new Set<number>()

  const defaultDescriptions: Record<string, string> = {
    'acil-servis': t('deptDesc.acilServis', '7/24 kesintisiz acil sağlık hizmeti sunan modern acil servisimizde uzman hekimlerimizle anında müdahale.'),
    'agiz-ve-dis-sagligi': t('deptDesc.agizDis', 'Modern diş ünitelerimizde estetik ve tedavi odaklı ağız-diş sağlığı hizmetleri.'),
    'algoloji-agri': t('deptDesc.algoloji', 'Kronik ağrı yönetimi ve ağrı enjeksiyonları ile yaşam kalitenizi artırıyoruz.'),
    'anestezi-ve-reanimasyon': t('deptDesc.anestezi', 'Ameliyat öncesi, sırası ve sonrası güvenli anestezi uygulamaları.'),
    'beslenme-ve-diyet': t('deptDesc.beslenme', 'Bireysel beslenme planları ve diyet danışmanlığı ile sağlıklı yaşam.'),
    'beyin-ve-sinir-cerrahisi': t('deptDesc.beyinCerrahi', 'Beyin ve omurilik cerrahisinde ileri teknoloji ve uzman kadro.'),
    'biyokimya': t('deptDesc.biyokimya', 'Hassas laboratuvar analizleri ile tanı süreçlerine güçlü destek.'),
    'check-up': t('deptDesc.checkup', 'Erken teşhis için kapsamlı sağlık tarama paketleri.'),
    'cocuk-cerrahisi': t('deptDesc.cocukCerrahi', 'Çocuklara özel minimal invaziv cerrahi çözümler.'),
    'cocuk-kardiyoloji': t('deptDesc.cocukKardiyoloji', 'Doğumsal kalp hastalıklarından ritim bozukluklarına uzman çocuk kalp sağlığı.'),
    'cocuk-sagligi-ve-hastaliklari': t('deptDesc.cocukSagligi', '0-18 yaş arası büyüme gelişme takibi ve çocuk hastalıkları tedavisi.'),
    'cocuk-ve-ergen-ruh-sagligi': t('deptDesc.cocukRuhSagligi', 'Çocuk ve ergen ruh sağlığı, davranış bozuklukları ve terapi.'),
    'dermatoloji': t('deptDesc.dermatoloji', 'Cilt sağlığı, estetik dermatoloji ve lazer tedavileri.'),
    'diyabet-poliklinigi': t('deptDesc.diyabet', 'Diyabet tanı, tedavi ve takibinde multidisipliner yaklaşım.'),
    'el-ve-mikro-cerrahisi': t('deptDesc.elMikro', 'El ve bilek cerrahisi, mikrocerrahi ve sinir onarımı.'),
    'endokrinoloji-ve-metabolizma': t('deptDesc.endokrinoloji', 'Hormon bozuklukları, tiroid ve metabolizma hastalıkları.'),
    'enfeksiyon-hastaliklari-ve-mikrobiyoloji': t('deptDesc.enfeksiyon', 'Enfeksiyon tanı ve tedavisi, aşı danışmanlığı.'),
    'fizik-tedavi-ve-rehabilitasyon': t('deptDesc.fizikTedavi', 'Kas-iskelet ve nörolojik rehabilitasyon uzman ekibi.'),
    'gastroenteroloji': t('deptDesc.gastroenteroloji', 'Sindirim sistemi hastalıklarında endoskopi ve kolonoskopi hizmetleri.'),
    'genel-cerrahi': t('deptDesc.genelCerrahi', 'Laparoskopik ve açık cerrahi yöntemlerle güvenli operasyonlar.'),
    'girisimsel-radyoloji': t('deptDesc.girisimselRadyoloji', 'Görüntüleme eşliğinde minimal invaziv girişimsel işlemler.'),
    'gogus-hastaliklari': t('deptDesc.gogus', 'Astım, KOAH, akciğer kanseri ve uyku apnesi tanı ve tedavisi.'),
    'goz-sagligi-ve-hastaliklari': t('deptDesc.goz', 'Katarakt, glokom, lazer ve retina cerrahisi hizmetleri.'),
    'ic-hastaliklari-dahiliye': t('deptDesc.icHastaliklari', 'İç hastalıkları tanı ve tedavisinde deneyimli kadro.'),
    'kadin-hastaliklari-ve-dogum': t('deptDesc.kadinHastaliklari', 'Jinekolojik cerrahi, doğum ve tüp bebek hizmetleri.'),
    'kalp-ve-damar-cerrahisi': t('deptDesc.kalpDamarCerrahi', 'Koroner bypass, kapak cerrahisi ve damarsal girişimler.'),
    'kardiyoloji': t('deptDesc.kardiyoloji', 'Ekokardiyografi, anjiyografi ve stent uygulamaları.'),
    'kulak-burun-bogaz': t('deptDesc.kbb', 'Sinüzit, işitme kaybı ve KBB cerrahisi hizmetleri.'),
    'medikal-estetik': t('deptDesc.medikalEstetik', 'Botoks, dolgu, mezoterapi ve cilt gençleştirme uygulamaları.'),
    'medikal-onkoloji': t('deptDesc.medikalOnkoloji', 'Kemoterapi, immünoterapi ve kanser tedavisi.'),
    'nefroloji': t('deptDesc.nefroloji', 'Böbrek hastalıkları, diyaliz ve hipertansiyon tedavisi.'),
    'noroloji': t('deptDesc.noroloji', 'Beyin, sinir ve kas hastalıklarının tanı ve tedavisi.'),
    'ortodonti': t('deptDesc.ortodonti', 'Tel tedavisi, şeffaf plak ve çene ortopedisi.'),
    'ortopedi-ve-travmatoloji': t('deptDesc.ortopedi', 'Kemik kırığı, eklem protezi ve spor yaralanmaları.'),
    'patoloji': t('deptDesc.patoloji', 'Biyopsi ve sitoloji incelemeleri ile kesin tanı.'),
    'plastik-rekonstruktif-ve-estetik-cerrahi': t('deptDesc.plastikCerrahi', 'Burun estetiği, liposuction ve rekonstrüktif cerrahi.'),
    'psikiyatri': t('deptDesc.psikiyatri', 'Depresyon, anksiyete ve bağımlılık tedavileri.'),
    'psikoloji': t('deptDesc.psikoloji', 'Bireysel, aile ve çift terapisi hizmetleri.'),
    'radyoloji': t('deptDesc.radyoloji', 'MR, BT, ultrason ve mamografi görüntüleme hizmetleri.'),
    'uroloji': t('deptDesc.uroloji', 'Böbrek taşı, prostat ve idrar yolu hastalıkları.'),
    'yenidogan-yogun-bakim-unitesi': t('deptDesc.yenidoganYogunBakim', 'Prematüre ve riskli bebekler için yoğun bakım.'),
    'yogun-bakim': t('deptDesc.yogunBakim', 'Multidisipliner yoğun bakım hizmetleri.'),
  }

  const getDeptDescription = (dept: any) => {
    return dept.description || defaultDescriptions[dept.slug] || t('departments.defaultDesc', '{{name}} birimimizde uzman kadromuzla hizmet vermekteyiz.', { name: dept.name })
  }

  const filteredDepartments = departments.filter((department: { id: number; name: string; description?: string; category: string; slug?: string }) => {
    const desc = getDeptDescription(department)
    const matchesSearch = department.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      desc.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = activeCategory === 'all' || department.category === activeCategory
    const matchesHospital = activeHospitalDeptIds === null || activeHospitalDeptIds.has(Number(department.id))
    return matchesSearch && matchesCategory && matchesHospital
  })

  const categories = [
    { id: 'all', label: t('departments.catAll', 'Tüm Bölümler') },
    { id: 'cerrahi', label: t('departments.catSurgical', 'Cerrahi Birimler') },
    { id: 'dahili', label: t('departments.catInternal', 'Dahili Birimler') },
    { id: 'teshis', label: t('departments.catDiagnostic', 'Teşhis Birimleri') },
  ]

  return (
    <>
      <Helmet>
        <title>{t('departments.pageTitle', 'Bölümlerimiz')} | Anadolu Hastaneleri Grubu</title>
        <meta name="description" content={t('departments.metaDescription', "Anadolu Hastaneleri Grubu'nun sunduğu tüm tıbbi bölümler ve hizmetler hakkında bilgi alın.")} />
      </Helmet>

      <div className="pt-24 pb-12 bg-neutral">
        <div className="container-custom">
          <SectionTitle
            as="h1"
            title={t('departments.title', 'Bölümlerimiz')}
            subtitle={t('departments.subtitle', 'Anadolu Hastaneleri Grubu olarak, alanında uzman doktorlarımız ve modern teknolojimizle sağlığınız için hizmet veriyoruz.')}
          />

          {/* Hastane şubesi sekmeleri */}
          {hospitalTabs.length > 0 && (
            <div
              className="flex flex-wrap justify-center gap-2 mt-10 mb-8"
              role="tablist"
              aria-label={t('departments.hospitalTabsLabel', 'Hastane şubesine göre bölümler')}
            >
              <button
                type="button"
                role="tab"
                aria-selected={activeHospital === 'all'}
                className={`px-5 py-2 rounded-full text-sm font-semibold transition-colors ${
                  activeHospital === 'all' ? 'bg-primary text-white' : 'bg-white text-text-light hover:bg-primary/10'
                }`}
                onClick={() => setActiveHospital('all')}
              >
                {t('departments.allHospitals', 'Tüm Şubeler')}
              </button>
              {hospitalTabs.map((hospital: any) => (
                <button
                  key={hospital.id}
                  type="button"
                  role="tab"
                  aria-selected={activeHospital === String(hospital.id)}
                  className={`px-5 py-2 rounded-full text-sm font-semibold transition-colors ${
                    activeHospital === String(hospital.id) ? 'bg-primary text-white' : 'bg-white text-text-light hover:bg-primary/10'
                  }`}
                  onClick={() => setActiveHospital(String(hospital.id))}
                >
                  {hospital.name}
                </button>
              ))}
            </div>
          )}

          <div className="max-w-xl mx-auto mb-8">
            <div className="relative">
              <label htmlFor="department-search" className="sr-only">
                {t('departments.searchLabel', 'Bölüm adı veya tedavi ara')}
              </label>
              <input
                id="department-search"
                type="search"
                placeholder={t('departments.searchPlaceholder', 'Bölüm adı veya tedavi ara...')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-12"
                disabled={isLoading}
              />
              <FaSearch aria-hidden="true" className="absolute left-4 top-1/2 transform -translate-y-1/2 text-text-light" />
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-2 mb-8" role="group" aria-label={t('departments.filterLabel', 'Bölüm kategorisine göre filtrele')}>
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                aria-pressed={activeCategory === cat.id}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeCategory === cat.id ? 'bg-primary text-white' : 'bg-white text-text-light hover:bg-primary/10'
                }`}
                onClick={() => setActiveCategory(cat.id)}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Ekran okuyucu için sonuç sayısı duyurusu */}
          <p className="sr-only" role="status" aria-live="polite">
            {isLoading
              ? t('common.loading', 'Yükleniyor...')
              : t('departments.resultCount', '{{count}} bölüm listeleniyor', { count: filteredDepartments.length })}
          </p>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {isLoading
              ? [1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <div key={i} className="animate-pulse bg-white rounded-2xl h-48 shadow-sm" />
                ))
              : filteredDepartments.map((department: any) => (
                  <motion.div
                    key={department.id}
                    variants={itemVariants}
                    className="card text-center hover:-translate-y-2 group"
                  >
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <i className={`bi ${department.icon || 'bi-hospital'} text-2xl text-primary`}></i>
                    </div>
                    <h3 className="text-xl font-semibold mb-2 text-primary">{department.name}</h3>
                    <p className="text-text-light text-sm mb-4">{getDeptDescription(department)}</p>
                    <Link
                      to={activeHospital === 'all' ? `/bolumlerimiz/${department.slug}` : `/bolumlerimiz/${department.slug}?hastane=${activeHospital}`}
                      aria-label={t('departments.moreInfoAbout', '{{name}} hakkında detaylı bilgi', { name: department.name })}
                      className="inline-block text-sm font-medium text-primary hover:text-primary-dark transition-colors"
                    >
                      {t('common.moreInfo', 'Detaylı Bilgi')}
                    </Link>
                  </motion.div>
                ))}
          </motion.div>

          {!isLoading && filteredDepartments.length === 0 && (
            <div className="text-center py-12">
              <i className="bi bi-search text-4xl text-text-light mb-4"></i>
              <h3 className="text-xl font-semibold mb-2">{t('common.noResults', 'Sonuç Bulunamadı')}</h3>
              <p className="text-text-light">{t('departments.noResultsDesc', 'Arama kriterlerinize uygun bölüm bulunamadı. Lütfen farklı bir arama terimi deneyin.')}</p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default DepartmentsPage
