import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import SectionTitle from '../components/ui/SectionTitle'
import { FaSearch } from 'react-icons/fa'

import { useDepartments } from '../hooks/useDepartments'

const DepartmentsPage = () => {
  const { data: departments = [], isLoading } = useDepartments({ onlyPublished: true })
  const [searchTerm, setSearchTerm] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')

  const filteredDepartments = departments.filter((department: { name: string; description?: string; category: string }) => {
    const matchesSearch = department.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (department.description || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = activeCategory === 'all' || department.category === activeCategory;

    return matchesSearch && matchesCategory;
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <>
      <Helmet>
        <title>Bölümlerimiz | Anadolu Hastaneleri Grubu</title>
        <meta name="description" content="Anadolu Hastaneleri Grubu'nun sunduğu tüm tıbbi bölümler ve hizmetler hakkında bilgi alın." />
      </Helmet>

      <div className="pt-24 pb-12 bg-neutral">
        <div className="container-custom">
          <SectionTitle
            title="Bölümlerimiz"
            subtitle="Anadolu Hastaneleri Grubu olarak, alanında uzman doktorlarımız ve modern teknolojimizle sağlığınız için hizmet veriyoruz."
          />

          <div className="max-w-xl mx-auto mb-8">
            <div className="relative">
              <input
                type="text"
                placeholder="Bölüm adı veya tedavi ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-12"
              />
              <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-text-light" />
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-2 mb-8">
            <button
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeCategory === 'all' ? 'bg-primary text-white' : 'bg-white text-text-light hover:bg-primary/10'
                }`}
              onClick={() => setActiveCategory('all')}
            >
              Tüm Bölümler
            </button>
            <button
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeCategory === 'cerrahi' ? 'bg-primary text-white' : 'bg-white text-text-light hover:bg-primary/10'
                }`}
              onClick={() => setActiveCategory('cerrahi')}
            >
              Cerrahi Birimler
            </button>
            <button
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeCategory === 'dahili' ? 'bg-primary text-white' : 'bg-white text-text-light hover:bg-primary/10'
                }`}
              onClick={() => setActiveCategory('dahili')}
            >
              Dahili Birimler
            </button>
            <button
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeCategory === 'teshis' ? 'bg-primary text-white' : 'bg-white text-text-light hover:bg-primary/10'
                }`}
              onClick={() => setActiveCategory('teshis')}
            >
              Teşhis Birimleri
            </button>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {filteredDepartments.map((department: any) => (
              <motion.div
                key={department.id}
                variants={itemVariants}
                className="card text-center hover:-translate-y-2 group"
              >
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <i className={`bi ${department.icon || 'bi-hospital'} text-2xl text-primary`}></i>
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

          {filteredDepartments.length === 0 && (
            <div className="text-center py-12">
              <i className="bi bi-search text-4xl text-text-light mb-4"></i>
              <h3 className="text-xl font-semibold mb-2">Sonuç Bulunamadı</h3>
              <p className="text-text-light">Arama kriterlerinize uygun bölüm bulunamadı. Lütfen farklı bir arama terimi deneyin.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default DepartmentsPage;
