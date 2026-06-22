import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import SectionTitle from '../ui/SectionTitle'
import { FaArrowRight, FaClock } from 'react-icons/fa'
import AutoTranslate from '../common/AutoTranslate'
import { useHealthArticles } from '../../hooks/useHealthArticles'
import { getArticleImageUrl } from '../../services'

const fallbackArticles = [
  {
    id: 1,
    title: 'Kalp Sağlığınızı Korumak İçin 10 Öneri',
    slug: 'kalp-sagliginizi-korumak-icin-10-oneri',
    category: 'Kardiyoloji',
    image: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=800&q=80',
    date: '2023-09-15',
    views: 1245,
    excerpt: 'Kalp sağlığınızı korumak için beslenme, egzersiz and yaşam tarzı önerileri.',
    type: 'article',
    content: '',
  },
  {
    id: 2,
    title: 'Çocuklarda Bağışıklık Sistemini Güçlendirme Yolları',
    slug: 'cocuklarda-bagisiklik-sistemini-guclendirme-yollari',
    category: 'Çocuk Sağlığı',
    image: 'https://images.unsplash.com/photo-1505576399279-565b52d4ac71?auto=format&fit=crop&w=800&q=80',
    date: '2023-09-10',
    views: 987,
    excerpt: 'Çocuğunuzun bağışıklık sistemini güçlendirmek için beslenme and yaşam tarzı önerileri.',
    type: 'article',
    content: '',
  },
  {
    id: 3,
    title: 'Sağlıkli Kemikler İçin Beslenme Önerileri',
    slug: 'saglikli-kemikler-icin-beslenme-onerileri',
    category: 'Ortopedi',
    image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=800&q=80',
    date: '2023-09-05',
    views: 756,
    excerpt: 'Kemik sağlığınızı korumak için beslenme and yaşam tarzı önerileri.',
    type: 'article',
    content: '',
  },
]

const HealthGuideSection = () => {
  const { t } = useTranslation()
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.1 })
  const { data: dbArticles = [] } = useHealthArticles()

  const displayArticles = dbArticles.length > 0 ? dbArticles.slice(0, 3) : fallbackArticles

  return (
    <section className="py-20 md:py-28 bg-surface">
      <div className="container-custom">
        <SectionTitle
          label={t('home.guideLabel', 'Bilgilendirme')}
          title={t('home.guideTitle', 'Sağlık Rehberi')}
          subtitle={t('home.guideSubtitle', 'Sağlıklı yaşam ipuçları, hastalıklar hakkında bilgiler and uzman görüşleri.')}
        />

          <motion.div
            ref={ref}
            initial={false}
            animate={isInView ? 'visible' : 'hidden'}
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.1 } },
            }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12"
          >
            {displayArticles.map((article) => (
              <motion.article
                key={article.id}
                variants={{
                  hidden: { opacity: 1, y: 20 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
                }}
                className="group bg-white rounded-2xl overflow-hidden border border-neutral-100 hover:border-ocean-200 hover:shadow-hover transition-all duration-300"
              >
                <Link to={`/saglik-rehberi/${article.slug}`} className="block">
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={getArticleImageUrl(article.image, article.category)}
                      alt={article.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-2 text-xs text-neutral-500 mb-2">
                      <span className="px-2 py-0.5 rounded-full bg-ocean-50 text-ocean-600 font-medium">
                        <AutoTranslate text={article.category || t('home.defaultCategory', 'Sağlık')} />
                      </span>
                      <span className="flex items-center gap-1">
                        <FaClock className="text-[10px]" />
                        <AutoTranslate text={(article as any).read_time || t('home.defaultReadTime', '5 dk')} />
                      </span>
                    </div>
                    <h3 className="font-display font-semibold text-primary-600 text-lg mb-2 group-hover:text-ocean-600 transition-colors line-clamp-2">
                      <AutoTranslate text={article.title} />
                    </h3>
                    <p className="text-sm text-neutral-500 line-clamp-2 mb-3">
                      <AutoTranslate text={(article as any).excerpt || (article as any).content?.substring(0, 120) + '...'} />
                    </p>
                    <span className="inline-flex items-center gap-1.5 text-sm font-medium text-ocean-500 group-hover:text-ocean-600 transition-colors">
                      {t('home.readMore', 'Devamını Oku')}
                      <FaArrowRight className="text-xs opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
                    </span>
                  </div>
                </Link>
              </motion.article>
            ))}
          </motion.div>

        <div className="text-center mt-12">
          <Link to="/saglik-rehberi" className="btn btn-outline">
            {t('home.allArticles', 'Tüm Makaleler')}
          </Link>
        </div>
      </div>
    </section>
  )
}

export default HealthGuideSection
