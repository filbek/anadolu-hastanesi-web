import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView } from 'framer-motion'
import SectionTitle from '../ui/SectionTitle'
import { FaCalendarAlt, FaEye } from 'react-icons/fa'

import { useHealthArticles } from '../../hooks/useHealthArticles'

const HealthGuideSection = () => {
  const { data: articles, isLoading } = useHealthArticles();
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
          {isLoading ? (
            Array(3).fill(0).map((_, i) => (
              <div key={i} className="bg-gray-100 animate-pulse rounded-2xl h-[400px]"></div>
            ))
          ) : (
            articles?.slice(0, 3).map((article) => (
              <motion.div
                key={article.id}
                variants={itemVariants}
                className="card overflow-hidden group"
              >
                <div className="relative h-48 -mx-6 -mt-6 mb-6 overflow-hidden">
                  <img
                    src={article.image || 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=800&q=80'}
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
                    <span>{new Date(article.date).toLocaleDateString('tr-TR')}</span>
                  </div>
                  <div className="flex items-center">
                    <FaEye className="mr-1" />
                    <span>{article.views} görüntülenme</span>
                  </div>
                </div>
                <h3 className="text-lg font-semibold mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                  <Link to={`/saglik-rehberi/${article.slug}`}>{article.title}</Link>
                </h3>
                <p className="text-text-light text-sm mb-4 line-clamp-2">{(article as any).summary || article.content?.substring(0, 100) || ''}...</p>
                <Link
                  to={`/saglik-rehberi/${article.slug}`}
                  className="inline-block text-sm font-medium text-primary hover:text-primary-dark transition-colors"
                >
                  Devamını Oku
                </Link>
              </motion.div>
            ))
          )}
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
