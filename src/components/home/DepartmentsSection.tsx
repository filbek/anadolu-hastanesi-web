import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView } from 'framer-motion'
import SectionTitle from '../ui/SectionTitle'
import { useDepartments } from '../../hooks/useDepartments'

const DepartmentsSection = () => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.2 })
  const { data: departments = [], isLoading } = useDepartments({ onlyPublished: true })

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
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

  // Only show first 8 departments on homepage
  const displayDepartments = departments.slice(0, 8)

  if (isLoading && departments.length === 0) {
    return (
      <section className="py-20">
        <div className="container-custom">
          <SectionTitle
            title="Bölümlerimiz"
            subtitle="Hizmetlerimiz yükleniyor..."
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse bg-neutral rounded-2xl h-48 shadow-sm" />
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-20">
      <div className="container-custom">
        <SectionTitle
          title="Bölümlerimiz"
          subtitle="Anadolu Hastaneleri Grubu olarak, alanında uzman doktorlarımız ve modern teknolojimizle sağlığınız için hizmet veriyoruz."
        />

        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {displayDepartments.map((department) => (
            <motion.div
              key={department.id}
              variants={itemVariants}
              className="card text-center hover:-translate-y-2 group"
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <i className={`bi ${department.icon || 'bi-hospital'} text-2xl text-primary`}></i>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-primary">{department.name}</h3>
              <p className="text-text-light text-sm mb-4 line-clamp-2">{department.description}</p>
              <Link
                to={`/bolumlerimiz/${department.slug}`}
                className="inline-block text-sm font-medium text-primary hover:text-primary-dark transition-colors"
              >
                Detaylı Bilgi
              </Link>
            </motion.div>
          ))}
        </motion.div>

        <div className="text-center mt-12">
          <Link to="/bolumlerimiz" className="btn btn-outline">
            Tüm Bölümlerimiz
          </Link>
        </div>
      </div>
    </section>
  )
}

export default DepartmentsSection
