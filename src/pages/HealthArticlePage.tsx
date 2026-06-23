import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useTranslation } from 'react-i18next'
import { FaCalendarAlt, FaEye, FaUser, FaTags, FaShare, FaFacebookF, FaTwitter, FaLinkedinIn, FaWhatsapp, FaArrowRight, FaCalendarCheck } from 'react-icons/fa'
import { motion } from 'framer-motion'
import AutoTranslate from '../components/common/AutoTranslate'
import SecondOpinionBanner from '../components/common/SecondOpinionBanner'
import { getHealthArticleBySlug, getHealthArticles, getArticleImageUrl } from '../services'
import { getDepartmentByName } from '../services/departmentService'
import { useDoctorsByDepartment } from '../hooks/useDoctors'
import { useLocalizedItem } from '../hooks/useLocalizedList'
import type { HealthArticle, Department } from '../lib/supabase'

const HealthArticlePage = () => {
  const { t } = useTranslation();
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<HealthArticle | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<HealthArticle[]>([]);
  const [relatedDepartment, setRelatedDepartment] = useState<Department | null>(null);
  const [loading, setLoading] = useState(true);
  // Makale gövdesini (HTML) aktif dile çevir (başlık/kategori AutoTranslate ile yönetilir)
  const localizedArticle = useLocalizedItem(article, ['content']);

  useEffect(() => {
    const fetchArticle = async () => {
      setLoading(true);
      try {
        if (!slug) {
          setLoading(false);
          return;
        }
        const data = await getHealthArticleBySlug(slug);
        if (data) {
          setArticle(data);
          // Fetch related department by category name
          const dept = await getDepartmentByName(data.category);
          if (dept) setRelatedDepartment(dept);
          // Fetch related articles (same category, exclude current)
          const allArticles = await getHealthArticles();
          const related = allArticles
            .filter(a => a.id !== data.id && a.category === data.category)
            .slice(0, 3);
          // If not enough same-category articles, fill with others
          if (related.length < 3) {
            const others = allArticles
              .filter(a => a.id !== data.id && !related.find(r => r.id === a.id))
              .slice(0, 3 - related.length);
            setRelatedArticles([...related, ...others]);
          } else {
            setRelatedArticles(related);
          }
        } else {
          setArticle(null);
        }
      } catch (error) {
        console.error('Error fetching article:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [slug]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="container-custom py-20 text-center">
        <h2 className="text-2xl font-bold mb-4">{t('healthArticle.notFound', 'Makale Bulunamadı')}</h2>
        <p className="mb-8">{t('healthArticle.notFoundDesc', 'Aradığınız makale bulunamadı. Lütfen tüm makalelerimizi görüntüleyin.')}</p>
        <Link to="/saglik-rehberi" className="btn btn-primary">
          {t('healthArticle.allArticles', 'Tüm Makaleler')}
        </Link>
      </div>
    );
  }

  const shareUrl = window.location.href;
  const authorName = article.author_name || 'Anadolu Hastaneleri';
  const authorTitle = article.author_title || 'Uzman Kadro';
  const authorImage = article.author_image || 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=300&q=80';
  const displayDate = article.date
    ? new Date(article.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })
    : '';

  return (
    <>
      <Helmet>
        <title>{article.title} | Anadolu Hastaneleri Grubu</title>
        <meta name="description" content={`${article.title}. ${article.category} kategorisinde uzmanlarımız tarafından hazırlanan sağlık makalesi.`} />
      </Helmet>

      <div className="pt-24 pb-12">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            {/* Article Header */}
            <div className="mb-8">
              <div className="bg-primary/10 text-primary text-sm font-medium px-4 py-1 rounded-full inline-block mb-4">
                <AutoTranslate text={article.category} translations={article.translations} field="category" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-primary mb-4">
                <AutoTranslate text={article.title} translations={article.translations} field="title" />
              </h1>
              <div className="flex flex-wrap items-center text-text-light text-sm gap-4 mb-6">
                <div className="flex items-center">
                  <FaCalendarAlt className="mr-2" />
                  <span>{displayDate}</span>
                </div>
                <div className="flex items-center">
                  <FaEye className="mr-2" />
                  <span>{article.views || 0} {t('common.views', 'görüntülenme')}</span>
                </div>
                <div className="flex items-center">
                  <FaUser className="mr-2" />
                  <span>{authorName}</span>
                </div>
              </div>
              <div className="relative h-96 rounded-xl overflow-hidden mb-8">
                <img
                  src={getArticleImageUrl(article.image, article.category)}
                  alt={article.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            </div>

            {/* Article Content */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="md:col-span-3">
                <div 
                  className="prose prose-lg max-w-none mb-8"
                  dangerouslySetInnerHTML={{ __html: localizedArticle?.content || article.content }}
                />

                {/* Tags */}
                {article.tags && article.tags.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2 mb-8">
                    <FaTags className="text-primary" />
                    {article.tags.map((tag, index) => (
                      <Link
                        key={index}
                        to={`/saglik-rehberi?tag=${tag}`}
                        className="bg-neutral px-3 py-1 rounded-full text-sm text-text-light hover:bg-primary/10 hover:text-primary transition-colors"
                      >
                        <AutoTranslate text={tag} />
                      </Link>
                    ))}
                  </div>
                )}

                {/* Share */}
                <div className="border-t border-b border-gray-200 py-6 mb-8">
                  <h3 className="font-semibold mb-4 flex items-center">
                    <FaShare className="mr-2 text-primary" /> {t('healthArticle.share', 'Bu Makaleyi Paylaşın')}
                  </h3>
                  <div className="flex gap-3">
                    <a
                      href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-full bg-[#3b5998] text-white flex items-center justify-center hover:opacity-90 transition-opacity"
                      aria-label={t('healthArticle.shareFacebook', "Facebook'ta Paylaş")}
                    >
                      <FaFacebookF />
                    </a>
                    <a
                      href={`https://twitter.com/intent/tweet?url=${shareUrl}&text=${article.title}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-full bg-[#1da1f2] text-white flex items-center justify-center hover:opacity-90 transition-opacity"
                      aria-label={t('healthArticle.shareTwitter', "Twitter'da Paylaş")}
                    >
                      <FaTwitter />
                    </a>
                    <a
                      href={`https://www.linkedin.com/shareArticle?mini=true&url=${shareUrl}&title=${article.title}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-full bg-[#0077b5] text-white flex items-center justify-center hover:opacity-90 transition-opacity"
                      aria-label={t('healthArticle.shareLinkedIn', "LinkedIn'de Paylaş")}
                    >
                      <FaLinkedinIn />
                    </a>
                    <a
                      href={`https://wa.me/?text=${article.title} ${shareUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-full bg-[#25d366] text-white flex items-center justify-center hover:opacity-90 transition-opacity"
                      aria-label={t('healthArticle.shareWhatsApp', "WhatsApp'ta Paylaş")}
                    >
                      <FaWhatsapp />
                    </a>
                  </div>
                </div>

                {/* Author */}
                <div className="bg-neutral rounded-xl p-6 mb-8">
                  <div className="flex items-center">
                    <img
                      src={authorImage}
                      alt={authorName}
                      className="w-16 h-16 rounded-full object-cover mr-4"
                      loading="lazy"
                    />
                    <div>
                      <h3 className="font-semibold">{authorName}</h3>
                      <p className="text-text-light text-sm">{authorTitle}</p>
                    </div>
                  </div>
                </div>

                {/* Related Articles */}
                {relatedArticles.length > 0 && (
                  <div>
                    <h3 className="text-xl font-semibold text-primary mb-6">{t('healthArticle.relatedArticles', 'İlgili Makaleler')}</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                      {relatedArticles.map((relatedArticle) => (
                        <Link
                          key={relatedArticle.id}
                          to={`/saglik-rehberi/${relatedArticle.slug}`}
                          className="card overflow-hidden group"
                        >
                          <div className="relative h-40 -mx-6 -mt-6 mb-4 overflow-hidden">
                            <img
                              src={getArticleImageUrl(relatedArticle.image, relatedArticle.category)}
                              alt={relatedArticle.title}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                              loading="lazy"
                            />
                            <div className="absolute top-2 left-2 bg-accent text-white text-xs font-medium px-2 py-1 rounded-full">
                              {relatedArticle.category}
                            </div>
                          </div>
                          <h4 className="font-medium mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                            <AutoTranslate text={relatedArticle.title} />
                          </h4>
                          <p className="text-xs text-text-light">
                            <FaCalendarAlt className="inline mr-1" /> {relatedArticle.date}
                          </p>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="md:col-span-1">
                <div className="sticky top-24">
                  {/* Department Doctors */}
                  {relatedDepartment && (
                    <div className="card mb-6">
                      <h3 className="text-lg font-semibold text-primary mb-4">
                        <AutoTranslate text={relatedDepartment.name} /> {t('common.doctors', 'Doktorları')}
                      </h3>
                      <DepartmentDoctorsList departmentId={relatedDepartment.id} departmentSlug={relatedDepartment.slug} />
                    </div>
                  )}

                  {/* Categories */}
                  <div className="card mb-6">
                    <h3 className="text-lg font-semibold text-primary mb-4">{t('common.categories', 'Kategoriler')}</h3>
                    <ul className="space-y-2">
                      {['Kardiyoloji', 'Nöroloji', 'Ortopedi', 'Beslenme', 'Psikoloji'].map(cat => (
                        <li key={cat}>
                          <Link to={`/saglik-rehberi?category=${cat}`} className="flex items-center text-text-light hover:text-primary transition-colors">
                            <i className="bi bi-dot text-primary mr-2"></i>
                            <AutoTranslate text={cat} />
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <SecondOpinionBanner />
    </>
  );
};

const DepartmentDoctorsList = ({ departmentId, departmentSlug }: { departmentId: number; departmentSlug?: string }) => {
  const { t } = useTranslation();
  const { data: doctors = [], isLoading } = useDoctorsByDepartment(departmentId);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3 animate-pulse">
            <div className="w-12 h-12 rounded-full bg-neutral-200" />
            <div className="flex-1 space-y-1">
              <div className="h-3 bg-neutral-200 rounded w-24" />
              <div className="h-2 bg-neutral-200 rounded w-16" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (doctors.length === 0) {
    return (
      <p className="text-sm text-neutral-500">{t('common.noDoctors', 'Bu bölümde henüz doktor bulunmamaktadır.')}</p>
    );
  }

  return (
    <div className="space-y-3">
      {doctors.slice(0, 5).map((doctor) => (
        <motion.div
          key={doctor.id}
          initial={false}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-center gap-3 p-2 rounded-xl hover:bg-surface transition-colors group"
        >
          <Link to={`/doktorlar/${doctor.slug}`} className="shrink-0">
            <img
              src={doctor.image}
              alt={doctor.name}
              className="w-12 h-12 rounded-full object-cover object-top border border-neutral-100 group-hover:border-ocean-200 transition-colors"
              loading="lazy"
            />
          </Link>
          <div className="flex-1 min-w-0">
            <Link
              to={`/doktorlar/${doctor.slug}`}
              className="block text-sm font-semibold text-primary-600 truncate group-hover:text-ocean-600 transition-colors"
            >
              {doctor.name}
            </Link>
            <p className="text-xs text-neutral-500 truncate">{doctor.title}</p>
          </div>
          <a
            href="https://anadoluhastaneleri.kendineiyibak.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 w-8 h-8 rounded-full bg-ocean-50 text-ocean-600 flex items-center justify-center hover:bg-ocean-100 transition-colors"
            title={t('home.appointment', 'Randevu Al')}
          >
            <FaCalendarCheck className="text-xs" />
          </a>
        </motion.div>
      ))}
      {doctors.length > 5 && (
        <Link
          to={departmentSlug ? `/bolumler/${departmentSlug}` : '/doktorlar'}
          className="flex items-center justify-center gap-1.5 text-sm font-medium text-ocean-600 hover:text-ocean-700 transition-colors pt-2 border-t border-neutral-100"
        >
          {t('common.allDoctors', 'Tüm Doktorları Gör')} <FaArrowRight className="text-xs" />
        </Link>
      )}
    </div>
  );
};

export default HealthArticlePage;
