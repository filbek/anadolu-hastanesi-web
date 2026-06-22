import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import SectionTitle from '../ui/SectionTitle'

import { useDepartments } from '../../hooks/useDepartments'
import {
  FaHeart,
  FaBrain,
  FaBone,
  FaEye,
  FaBaby,
  FaStethoscope,
  FaRibbon,
  FaArrowRight,
} from 'react-icons/fa'

const categoryIcons: Record<string, React.ReactNode> = {
  'Kardiyoloji': <FaHeart />,
  'Nöroloji': <FaBrain />,
  'Ortopedi': <FaBone />,
  'Göz Hastalıkları': <FaEye />,
  'Kadın Doğum': <FaBaby />,
  'Dahiliye': <FaStethoscope />,
  'Onkoloji': <FaRibbon />,
}

const fallbackDescriptions: Record<string, string> = {
  'Acil Servis': '7/24 kesintisiz acil sağlık hizmeti ile uzman doktor ve modern ekipmanlarımızla anında müdahale sağlıyoruz.',
  'Ağız ve Diş Sağlığı': 'Diş tedavisi, implant, ortodonti ve estetik diş hekimliğinde uzman kadromuzla hizmetinizdeyiz.',
  'Algoloji (Ağrı)': 'Kronik ağrıların tanı ve tedavisinde multidisipliner yaklaşımla ağrısız bir yaşam için çözümler sunuyoruz.',
  'Anestezi ve Reanimasyon': 'Ameliyat öncesi, sırası ve sonrası güvenli anestezi uygulamaları ile konforunuzu ön planda tutuyoruz.',
  'Beyin ve Sinir Cerrahisi': 'Beyin, omurilik ve sinir sistemi cerrahisinde ileri teknoloji ve deneyimli kadro ile hizmet veriyoruz.',
  'Çocuk Sağlığı ve Hastalıkları': '0-18 yaş çocukların sağlık takibi, aşılama ve tedavisinde uzman pediatristlerimiz görev alıyor.',
  'Dermatoloji': 'Cilt, saç ve tırnak hastalıklarının tanı ve tedavisinde modern yöntemlerle estetik ve sağlık bir arada.',
  'Endokrinoloji': 'Diyabet, tiroid ve hormonal bozuklukların tanı ve tedavisinde uzman endokrinoloji hizmeti sunuyoruz.',
  'Gastroenteroloji': 'Sindirim sistemi hastalıklarının tanı ve tedavisinde endoskopi ve ileri görüntüleme yöntemlerini kullanıyoruz.',
  'Göğüs Hastalıkları': 'Akciğer ve solunum yolu hastalıklarının tanı ve tedavisinde kapsamlı tetkik ve tedavi imkanları.',
  'Kulak Burun Boğaz': 'Kulak, burun, boğaz ve baş boyun cerrahisinde tanı, tedavi ve ameliyat hizmetleri sunuyoruz.',
  'Üroloji': 'İdrar yolu, prostat ve erkek sağlığı hastalıklarının tanı ve tedavisinde modern cerrahi teknikler.',
}

const DepartmentsSection = () => {
  const { t } = useTranslation()
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.1 })
  const { data: departments = [] } = useDepartments({ onlyPublished: true })

  const displayDepartments = departments.slice(0, 8)

  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="container-custom">
        <SectionTitle
          label={t('home.departmentsLabel', 'Tıbbi Birimlerimiz')}
          title={t('home.departmentsTitle', 'Bölümlerimiz')}
          subtitle={t('home.departmentsSubtitle', 'Alanında uzman doktorlarımız ve son teknoloji ekipmanlarımızla sağlığınız için hizmetinizdeyiz.')}
        />

        <motion.div
          ref={ref}
          initial={false}
          animate={isInView ? 'visible' : 'hidden'}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.08 } },
          }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-12"
        >
          {displayDepartments.map((department) => (
                <motion.div
                  key={department.id}
                  variants={{
                    hidden: { opacity: 1, y: 16 },
                    visible: {
                      opacity: 1,
                      y: 0,
                      transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
                    },
                  }}
                  className="group bg-surface rounded-2xl p-6 transition-all duration-300 hover:bg-white hover:shadow-hover border border-transparent hover:border-ocean-200 hover:border-l-4 hover:border-l-ocean-500"
                >
                  <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center text-ocean-500 text-xl mb-4 shadow-soft group-hover:bg-ocean-500 group-hover:text-white transition-all duration-300">
                    {categoryIcons[department.name] || <FaStethoscope />}
                  </div>
                  <h3 className="font-display text-lg font-semibold text-primary-600 mb-2 group-hover:text-ocean-600 transition-colors">
                    {department.name}
                  </h3>
                  <p className="text-sm text-neutral-500 line-clamp-2 mb-4">
                    {department.description || fallbackDescriptions[department.name] || t('home.defaultDepartmentDesc', 'Alanında uzman doktorlarımızla modern teknoloji ve hasta odaklı yaklaşımla hizmetinizdeyiz.')}
                  </p>
                  <Link
                    to={`/bolumlerimiz/${department.slug}`}
                    aria-label={t('home.moreInfoAbout', '{{name}} hakkında detaylı bilgi', { name: department.name })}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-ocean-500 hover:text-ocean-600 transition-colors"
                  >
                    {t('home.moreInfo', 'Detaylı Bilgi')}
                    <FaArrowRight aria-hidden="true" className="text-xs opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
                  </Link>
                </motion.div>
              ))}
        </motion.div>

        <div className="text-center mt-12">
          <Link to="/bolumlerimiz" className="btn btn-outline">
            {t('home.allDepartments', 'Tüm Bölümlerimiz')}
          </Link>
        </div>
      </div>
    </section>
  )
}

export default DepartmentsSection
