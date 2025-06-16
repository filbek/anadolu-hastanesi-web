import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView } from 'framer-motion'
import SectionTitle from '../ui/SectionTitle'
import { FaCalendarAlt, FaEye } from 'react-icons/fa'

const articles = [
  {
    id: 1,
    title: 'Kalp Sağlığınızı Korumak İçin 10 Öneri',
    slug: 'kalp-sagliginizi-korumak-icin-10-oneri',
    category: 'Kardiyoloji',
    image: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
    date: '15 Eylül 2023',
    views: 1245,
    excerpt: 'Kalp sağlığınızı korumak için beslenme, egzersiz ve yaşam tarzı önerileri.',
  },
  {
    id: 2,
    title: 'Çocuklarda Bağışıklık Sistemini Güçlendirme Yolları',
    slug: 'cocuklarda-bagisiklik-sistemini-guclendirme-yollari',
    category: 'Çocuk Sağlığı',
    image: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
    date: '10 Eylül 2023',
    views: 987,
    excerpt: 'Çocuğunuzun bağışıklık sistemini güçlendirmek için beslenme ve yaşam tarzı önerileri.',
  },
  {
    id: 3,
    title: 'Sağlıklı Kemikler İçin Beslenme Önerileri',
    slug: 'saglikli-kemikler-icin-beslenme-onerileri',
    category: 'Ortopedi',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
    date: '5 Eylül 2023',
    views: 756,
    excerpt: 'Kemik sağlığınızı korumak için beslenme ve yaşam tarzı önerileri.',
  },
]

const HealthGuideSection = () => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.2 })

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  }

  return (
    <section className="py-20">
      <div className="container-custom">
        <SectionTitle
          title="Sağlık Rehberi"
          subtitle="Sağlıklı bir yaşam için uzmanlarımızın hazırladığı bilgilendirici içerikler."
        />

        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {articles.map((article) => (
            <motion.div
              key={article.id}
              variants={itemVariants}
              className="card overflow-hidden group"
            >
              <div className="relative h-48 -mx-6 -mt-6 mb-6 overflow-hidden">
                <img
                  src={article.image}
                  alt={article.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  loading="lazy"
                  crossOrigin="anonymous"
                />
                <div className="absolute top-4 left-4 bg-accent text-white text-xs font-medium px-3 py-1 rounded-full">
                  {article.category}
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-text-light mb-3">
                <div className="flex items-center">
                  <FaCalendarAlt className="mr-1" />
                  <span>{article.date}</span>
                </div>
                <div className="flex items-center">
                  <FaEye className="mr-1" />
                  <span>{article.views} görüntülenme</span>
                </div>
              </div>
              <h3 className="text-lg font-semibold mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                <Link to={`/saglik-rehberi/${article.slug}`}>{article.title}</Link>
              </h3>
              <p className="text-text-light text-sm mb-4 line-clamp-2">{article.excerpt}</p>
              <Link
                to={`/saglik-rehberi/${article.slug}`}
                className="inline-block text-sm font-medium text-primary hover:text-primary-dark transition-colors"
              >
                Devamını Oku
              </Link>
            </motion.div>
          ))}
        </motion.div>

        <div className="text-center mt-12">
          <Link to="/saglik-rehberi" className="btn btn-outline">
            Tüm Makaleler
          </Link>
        </div>
      </div>
    </section>
  )
}

export default HealthGuideSection
