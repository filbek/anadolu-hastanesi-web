import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView } from 'framer-motion'
import SectionTitle from '../ui/SectionTitle'

const departments = [
  {
    id: 1,
    name: 'Kardiyoloji',
    slug: 'kardiyoloji',
    icon: 'bi-heart-pulse-fill',
    description: 'Kalp ve damar hastalıklarının tanı ve tedavisi',
  },
  {
    id: 2,
    name: 'Nöroloji',
    slug: 'noroloji',
    icon: 'bi-brain',
    description: 'Sinir sistemi hastalıklarının tanı ve tedavisi',
  },
  {
    id: 3,
    name: 'Ortopedi',
    slug: 'ortopedi',
    icon: 'bi-person-standing',
    description: 'Kemik, kas ve eklem hastalıklarının tanı ve tedavisi',
  },
  {
    id: 4,
    name: 'Göz Hastalıkları',
    slug: 'goz-hastaliklari',
    icon: 'bi-eye-fill',
    description: 'Göz ve görme ile ilgili hastalıkların tanı ve tedavisi',
  },
  {
    id: 5,
    name: 'Genel Cerrahi',
    slug: 'genel-cerrahi',
    icon: 'bi-scissors',
    description: 'Cerrahi müdahale gerektiren hastalıkların tanı ve tedavisi',
  },
  {
    id: 6,
    name: 'Kadın Hastalıkları',
    slug: 'kadin-hastaliklari',
    icon: 'bi-gender-female',
    description: 'Kadın üreme sistemi hastalıklarının tanı ve tedavisi',
  },
  {
    id: 7,
    name: 'Çocuk Sağlığı',
    slug: 'cocuk-sagligi',
    icon: 'bi-balloon-heart-fill',
    description: 'Çocuk sağlığı ve hastalıklarının tanı ve tedavisi',
  },
  {
    id: 8,
    name: 'Dahiliye',
    slug: 'dahiliye',
    icon: 'bi-clipboard2-pulse-fill',
    description: 'İç hastalıklarının tanı ve tedavisi',
  },
]

const DepartmentsSection = () => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.2 })

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
          {departments.map((department) => (
            <motion.div
              key={department.id}
              variants={itemVariants}
              className="card text-center hover:-translate-y-2 group"
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <i className={`bi ${department.icon} text-2xl text-primary`}></i>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-primary">{department.name}</h3>
              <p className="text-text-light text-sm mb-4">{department.description}</p>
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
