import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import SectionTitle from '../components/ui/SectionTitle'
import { FaSearch, FaFilter } from 'react-icons/fa'

// Mock data for doctors
const doctors = [
  {
    id: 1,
    name: 'Prof. Dr. Ahmet Yılmaz',
    slug: 'prof-dr-ahmet-yilmaz',
    title: 'Kardiyoloji Uzmanı',
    department: 'Kardiyoloji',
    hospital: 'Anadolu Merkez Hastanesi',
    image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80',
    education: 'İstanbul Üniversitesi Tıp Fakültesi',
    experience: '25 yıl',
  },
  {
    id: 2,
    name: 'Doç. Dr. Ayşe Kaya',
    slug: 'doc-dr-ayse-kaya',
    title: 'Nöroloji Uzmanı',
    department: 'Nöroloji',
    hospital: 'Anadolu Avrupa Hastanesi',
    image: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80',
    education: 'Ankara Üniversitesi Tıp Fakültesi',
    experience: '15 yıl',
  },
  {
    id: 3,
    name: 'Prof. Dr. Mehmet Demir',
    slug: 'prof-dr-mehmet-demir',
    title: 'Ortopedi Uzmanı',
    department: 'Ortopedi',
    hospital: 'Anadolu Merkez Hastanesi',
    image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80',
    education: 'Hacettepe Üniversitesi Tıp Fakültesi',
    experience: '20 yıl',
  },
  {
    id: 4,
    name: 'Uzm. Dr. Zeynep Şahin',
    slug: 'uzm-dr-zeynep-sahin',
    title: 'Göz Hastalıkları Uzmanı',
    department: 'Göz Hastalıkları',
    hospital: 'Anadolu Çocuk Hastanesi',
    image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80',
    education: 'Ege Üniversitesi Tıp Fakültesi',
    experience: '10 yıl',
  },
  {
    id: 5,
    name: 'Prof. Dr. Ali Yıldız',
    slug: 'prof-dr-ali-yildiz',
    title: 'Genel Cerrahi Uzmanı',
    department: 'Genel Cerrahi',
    hospital: 'Anadolu Uluslararası Hastanesi',
    image: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80',
    education: 'Marmara Üniversitesi Tıp Fakültesi',
    experience: '22 yıl',
  },
  {
    id: 6,
    name: 'Doç. Dr. Selin Arslan',
    slug: 'doc-dr-selin-arslan',
    title: 'Kadın Hastalıkları Uzmanı',
    department: 'Kadın Hastalıkları',
    hospital: 'Anadolu Avrupa Hastanesi',
    image: 'https://images.unsplash.com/photo-1651008376811-b90baee60c1f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80',
    education: 'İstanbul Üniversitesi Tıp Fakültesi',
    experience: '18 yıl',
  },
  {
    id: 7,
    name: 'Uzm. Dr. Emre Kılıç',
    slug: 'uzm-dr-emre-kilic',
    title: 'Dahiliye Uzmanı',
    department: 'Dahiliye',
    hospital: 'Anadolu Merkez Hastanesi',
    image: 'https://images.unsplash.com/photo-1612531386530-97286d97c2d2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80',
    education: 'Dokuz Eylül Üniversitesi Tıp Fakültesi',
    experience: '8 yıl',
  },
  {
    id: 8,
    name: 'Prof. Dr. Deniz Yılmaz',
    slug: 'prof-dr-deniz-yilmaz',
    title: 'Çocuk Sağlığı Uzmanı',
    department: 'Çocuk Sağlığı',
    hospital: 'Anadolu Çocuk Hastanesi',
    image: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80',
    education: 'Hacettepe Üniversitesi Tıp Fakültesi',
    experience: '25 yıl',
  },
];

// Get unique departments and hospitals for filters
const departments = [...new Set(doctors.map(doctor => doctor.department))];
const hospitals = [...new Set(doctors.map(doctor => doctor.hospital))];

const DoctorsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedHospital, setSelectedHospital] = useState('');
  const [filteredDoctors, setFilteredDoctors] = useState(doctors);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    const filtered = doctors.filter((doctor) => {
      const matchesSearch = doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.department.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesDepartment = selectedDepartment === '' || doctor.department === selectedDepartment;
      const matchesHospital = selectedHospital === '' || doctor.hospital === selectedHospital;
      
      return matchesSearch && matchesDepartment && matchesHospital;
    });
    
    setFilteredDoctors(filtered);
  }, [searchTerm, selectedDepartment, selectedHospital]);

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedDepartment('');
    setSelectedHospital('');
  };

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
        <title>Doktorlarımız | Anadolu Hastaneleri Grubu</title>
        <meta name="description" content="Anadolu Hastaneleri Grubu'nun uzman doktor kadrosu hakkında bilgi alın ve online randevu alın." />
      </Helmet>

      <div className="pt-24 pb-12 bg-neutral">
        <div className="container-custom">
          <SectionTitle
            title="Doktorlarımız"
            subtitle="Anadolu Hastaneleri Grubu olarak, alanında uzman ve deneyimli doktor kadromuzla sağlığınız için buradayız."
          />

          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="md:flex-1 relative">
              <input
                type="text"
                placeholder="Doktor adı, uzmanlık alanı veya bölüm ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-12 w-full"
              />
              <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-text-light" />
            </div>
            
            <button
              className="md:hidden flex items-center justify-center px-4 py-3 bg-white rounded-lg border border-gray-300 text-text-light hover:bg-neutral transition-colors"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
            >
              <FaFilter className="mr-2" />
              Filtrele
            </button>
            
            <div className="hidden md:flex gap-4">
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="input-field"
              >
                <option value="">Tüm Bölümler</option>
                {departments.map((department) => (
                  <option key={department} value={department}>
                    {department}
                  </option>
                ))}
              </select>
              
              <select
                value={selectedHospital}
                onChange={(e) => setSelectedHospital(e.target.value)}
                className="input-field"
              >
                <option value="">Tüm Hastaneler</option>
                {hospitals.map((hospital) => (
                  <option key={hospital} value={hospital}>
                    {hospital}
                  </option>
                ))}
              </select>
              
              <button
                onClick={resetFilters}
                className="px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors"
              >
                Filtreleri Temizle
              </button>
            </div>
          </div>
          
          {/* Mobile Filters */}
          {isFilterOpen && (
            <div className="md:hidden bg-white p-4 rounded-lg shadow-md mb-6">
              <h3 className="font-medium mb-3">Filtreler</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text mb-1">Bölüm</label>
                  <select
                    value={selectedDepartment}
                    onChange={(e) => setSelectedDepartment(e.target.value)}
                    className="input-field w-full"
                  >
                    <option value="">Tüm Bölümler</option>
                    {departments.map((department) => (
                      <option key={department} value={department}>
                        {department}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-text mb-1">Hastane</label>
                  <select
                    value={selectedHospital}
                    onChange={(e) => setSelectedHospital(e.target.value)}
                    className="input-field w-full"
                  >
                    <option value="">Tüm Hastaneler</option>
                    {hospitals.map((hospital) => (
                      <option key={hospital} value={hospital}>
                        {hospital}
                      </option>
                    ))}
                  </select>
                </div>
                
                <button
                  onClick={resetFilters}
                  className="w-full px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors"
                >
                  Filtreleri Temizle
                </button>
              </div>
            </div>
          )}

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {filteredDoctors.map((doctor) => (
              <motion.div
                key={doctor.id}
                variants={itemVariants}
                className="card overflow-hidden group"
              >
                <div className="relative h-64 -mx-6 -mt-6 mb-6 overflow-hidden">
                  <img
                    src={doctor.image}
                    alt={doctor.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                    crossOrigin="anonymous"
                  />
                </div>
                <span className="text-xs font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">
                  {doctor.hospital}
                </span>
                <h3 className="text-xl font-semibold mt-3 mb-1">{doctor.name}</h3>
                <p className="text-text-light text-sm mb-1">{doctor.title}</p>
                <p className="text-text-light text-xs mb-4">{doctor.department}</p>
                <div className="flex justify-between items-center">
                  <Link
                    to={`/doktorlar/${doctor.slug}`}
                    className="text-sm font-medium text-primary hover:text-primary-dark transition-colors"
                  >
                    Profili Görüntüle
                  </Link>
                  <a
                    href="https://anadoluhastaneleri.kendineiyibak.app/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-accent hover:text-accent-dark transition-colors"
                  >
                    Randevu Al
                  </a>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {filteredDoctors.length === 0 && (
            <div className="text-center py-12">
              <i className="bi bi-search text-4xl text-text-light mb-4"></i>
              <h3 className="text-xl font-semibold mb-2">Sonuç Bulunamadı</h3>
              <p className="text-text-light">Arama kriterlerinize uygun doktor bulunamadı. Lütfen farklı bir arama terimi deneyin veya filtreleri temizleyin.</p>
              <button
                onClick={resetFilters}
                className="mt-4 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
              >
                Filtreleri Temizle
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default DoctorsPage;
