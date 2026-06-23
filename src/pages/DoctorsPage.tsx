import { useState, useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import SectionTitle from '../components/ui/SectionTitle'
import { DoctorCardSkeleton } from '../components/ui/Skeleton'
import { FaSearch, FaFilter, FaArrowRight, FaCalendarCheck } from 'react-icons/fa'
import { useDoctors } from '../hooks/useDoctors'
import { useLocalizedList } from '../hooks/useLocalizedList'

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.06 },
  },
}

const itemVariants = {
  hidden: { y: 16 },
  visible: {
    y: 0,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  },
}

const DoctorsPage = () => {
  const { t } = useTranslation()
  const { data: doctorsRaw = [], isLoading } = useDoctors()
  const doctors = useLocalizedList(doctorsRaw, ['title', 'departments.name', 'hospitals.name'])
  const [searchParams] = useSearchParams()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDepartment, setSelectedDepartment] = useState('')
  // Hastane profilindeki "Tüm Doktorları Gör" linki ?hastane=<ad> ile gelir
  const [selectedHospital, setSelectedHospital] = useState(searchParams.get('hastane') || '')
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  const departments = useMemo(
    () => [...new Set(doctors.map((d: any) => d.departments?.name).filter(Boolean))].sort(),
    [doctors]
  )
  const hospitals = useMemo(
    () => [...new Set(doctors.map((d: any) => d.hospitals?.name).filter(Boolean))].sort(),
    [doctors]
  )



  // Title ranking for sorting
  const TITLE_RANK: Record<string, number> = {
    'Prof. Dr.': 1, 'Prof.Dr.': 1,
    'Doç. Dr.': 2, 'Doç Dr.': 2,
    'Dr. Öğr. Üyesi': 3, 'Dr. Öğr.Üyesi': 3,
    'Op. Dr.': 4, 'Op.Dr.': 4,
    'Uzm. Dr.': 5, 'Uzm.Dr.': 5,
    'Dr.': 6,
    'Dt.': 7,
    'Dyt.': 8, 'Uzm. Dyt.': 8,
    'Uzm. Psikolog': 9,
  }

  // Silivri executives order
  const SILIVRI_EXECUTIVES = [
    'Dr. Öğr. Üyesi Halil Narlı',
    'Op. Dr. Ülker Moralar',
    'Doç. Dr. İbak Gönen',
    'Dr. Öğr. Üyesi Ali Karaçınar',
  ]

  const sortDoctors = (list: any[]) => {
    return [...list].sort((a, b) => {
      const aExec = SILIVRI_EXECUTIVES.indexOf(a.name)
      const bExec = SILIVRI_EXECUTIVES.indexOf(b.name)
      if (aExec !== -1 && bExec !== -1) return aExec - bExec
      if (aExec !== -1) return -1
      if (bExec !== -1) return 1

      const aRank = TITLE_RANK[a.title] || 99
      const bRank = TITLE_RANK[b.title] || 99
      if (aRank !== bRank) return aRank - bRank

      return a.name.localeCompare(b.name, 'tr')
    })
  }

  const filteredDoctors = useMemo(
    () => {
      const filtered = doctors.filter((doctor: any) => {
        const matchesSearch =
          doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (doctor.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (doctor.departments?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
        const matchesDepartment =
          selectedDepartment === '' || doctor.departments?.name === selectedDepartment
        const matchesHospital =
          selectedHospital === '' || doctor.hospitals?.name === selectedHospital
        return matchesSearch && matchesDepartment && matchesHospital
      })
      return sortDoctors(filtered)
    },
    [doctors, searchTerm, selectedDepartment, selectedHospital]
  )

  const resetFilters = () => {
    setSearchTerm('')
    setSelectedDepartment('')
    setSelectedHospital('')
  }

  return (
    <>
      <Helmet>
        <title>{t('doctorsPage.title')} | Anadolu Hastaneleri Grubu</title>
        <meta
          name="description"
          content={t('doctorsPage.subtitle')}
        />
      </Helmet>

      <div className="pt-24 pb-12 bg-neutral">
        <div className="container-custom">
          <SectionTitle
            as="h1"
            title={t('doctorsPage.title')}
            subtitle={t('doctorsPage.subtitle')}
          />

          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="md:flex-1 relative">
              <label htmlFor="doctor-search" className="sr-only">{t('doctorsPage.searchPlaceholder')}</label>
              <input
                id="doctor-search"
                type="search"
                placeholder={t('doctorsPage.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-12 w-full"
                disabled={isLoading}
              />
              <FaSearch aria-hidden="true" className="absolute left-4 top-1/2 transform -translate-y-1/2 text-text-light" />
            </div>

            <button
              type="button"
              className="md:hidden flex items-center justify-center px-4 py-3 bg-white rounded-lg border border-gray-300 text-text-light hover:bg-neutral transition-colors"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              aria-expanded={isFilterOpen}
              aria-controls="doctor-mobile-filters"
            >
              <FaFilter className="mr-2" aria-hidden="true" />
              {t('common.filter')}
            </button>

            <div className="hidden md:flex gap-4">
              <label htmlFor="doctor-department" className="sr-only">{t('doctorsPage.departmentLabel')}</label>
              <select
                id="doctor-department"
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="input-field"
                disabled={isLoading}
              >
                <option value="">{t('doctorsPage.allDepartments')}</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>

              <label htmlFor="doctor-hospital" className="sr-only">{t('doctorsPage.hospitalLabel')}</label>
              <select
                id="doctor-hospital"
                value={selectedHospital}
                onChange={(e) => setSelectedHospital(e.target.value)}
                className="input-field"
                disabled={isLoading}
              >
                <option value="">{t('doctorsPage.allHospitals')}</option>
                {hospitals.map((hosp) => (
                  <option key={hosp} value={hosp}>{hosp}</option>
                ))}
              </select>

              <button
                onClick={resetFilters}
                className="px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors"
              >
                {t('doctorsPage.clear')}
              </button>
            </div>
          </div>

          {isFilterOpen && (
            <div id="doctor-mobile-filters" className="md:hidden bg-white p-4 rounded-lg shadow-md mb-6">
              <h2 className="font-medium mb-3">{t('doctorsPage.mobileFilterTitle')}</h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="doctor-department-mobile" className="block text-sm font-medium text-text mb-1">{t('doctorsPage.departmentLabel')}</label>
                  <select
                    id="doctor-department-mobile"
                    value={selectedDepartment}
                    onChange={(e) => setSelectedDepartment(e.target.value)}
                    className="input-field w-full"
                  >
                    <option value="">{t('doctorsPage.allDepartments')}</option>
                    {departments.map((dept) => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="doctor-hospital-mobile" className="block text-sm font-medium text-text mb-1">{t('doctorsPage.hospitalLabel')}</label>
                  <select
                    id="doctor-hospital-mobile"
                    value={selectedHospital}
                    onChange={(e) => setSelectedHospital(e.target.value)}
                    className="input-field w-full"
                  >
                    <option value="">{t('doctorsPage.allHospitals')}</option>
                    {hospitals.map((hosp) => (
                      <option key={hosp} value={hosp}>{hosp}</option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={resetFilters}
                  className="w-full px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors"
                >
                  {t('common.clearFilters')}
                </button>
              </div>
            </div>
          )}

          {/* Ekran okuyucu için sonuç sayısı duyurusu */}
          <p className="sr-only" role="status" aria-live="polite">
            {isLoading
              ? t('common.loading', 'Yükleniyor...')
              : t('doctorsPage.resultCount', '{{count}} doktor listeleniyor', { count: filteredDoctors.length })}
          </p>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
          >
            <AnimatePresence mode="popLayout">
              {isLoading
                ? [1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                    <motion.div key={`skeleton-${i}`} layout exit={{ opacity: 0 }}>
                      <DoctorCardSkeleton />
                    </motion.div>
                  ))
                : filteredDoctors.map((doctor: any) => (
                    <motion.div
                      key={doctor.id}
                      variants={itemVariants}
                      layout
                      className="group bg-white rounded-2xl overflow-hidden border border-neutral-100 hover:border-ocean-200 hover:shadow-hover transition-all duration-300"
                    >
                      {/* Image */}
                      <div className="relative aspect-[3/4] overflow-hidden bg-surface">
                        <img
                          src={doctor.image}
                          alt={doctor.name}
                          className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                          loading="lazy"
                        />
                      </div>

                      {/* Content */}
                      <div className="p-5">
                        <span className="inline-block px-2.5 py-0.5 rounded-full bg-ocean-50 text-ocean-600 text-xs font-medium mb-2">
                          {doctor.hospitals?.name || t('home.defaultHospital', 'Anadolu Hastanesi')}
                        </span>
                        <h3 className="font-display font-bold text-primary-600 text-lg mb-1 group-hover:text-ocean-600 transition-colors">
                          {doctor.name}
                        </h3>
                        <p className="text-sm text-neutral-500 mb-1">{doctor.title}</p>
                        {doctor.departments?.name && (
                          <p className="text-xs text-neutral-500 mb-4">{doctor.departments.name}</p>
                        )}

                        <div className="flex items-center gap-3 pt-3 border-t border-neutral-100">
                          <Link
                            to={`/doktorlar/${doctor.slug}`}
                            aria-label={t('doctorsPage.viewProfileOf', '{{name}} profilini görüntüle', { name: doctor.name })}
                            className="flex items-center gap-1.5 text-sm font-medium text-primary-600 hover:text-ocean-600 transition-colors"
                          >
                            {t('home.profile', 'Profil')} <FaArrowRight className="text-xs" aria-hidden="true" />
                          </Link>
                          <a
                            href="https://anadoluhastaneleri.kendineiyibak.app/"
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={t('doctorsPage.bookAppointmentWith', '{{name}} ile randevu al', { name: doctor.name })}
                            className="flex items-center gap-1.5 text-sm font-medium text-coral-500 hover:text-coral-600 transition-colors ml-auto"
                          >
                            <FaCalendarCheck className="text-xs" aria-hidden="true" />
                            {t('home.appointment', 'Randevu')}
                          </a>
                        </div>
                      </div>
                    </motion.div>
                  ))}
            </AnimatePresence>
          </motion.div>

          {!isLoading && filteredDoctors.length === 0 && (
            <div className="text-center py-12">
              <i className="bi bi-search text-4xl text-text-light mb-4"></i>
              <h3 className="text-xl font-semibold mb-2">{t('common.noResults')}</h3>
              <p className="text-text-light">
                {t('common.noResultsDesc')}
              </p>
              <button
                onClick={resetFilters}
                className="mt-4 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
              >
                {t('common.clearFilters')}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default DoctorsPage
