import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { FaCalendarAlt, FaEye, FaUser, FaTags, FaShare, FaFacebookF, FaTwitter, FaLinkedinIn, FaWhatsapp } from 'react-icons/fa'

// Mock data for a single article
const articleData = {
  id: 1,
  title: 'Kalp Sağlığınızı Korumak İçin 10 Öneri',
  slug: 'kalp-sagliginizi-korumak-icin-10-oneri',
  category: 'Kardiyoloji',
  image: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80',
  date: '15 Eylül 2023',
  views: 1245,
  author: 'Prof. Dr. Ahmet Yılmaz',
  authorSlug: 'prof-dr-ahmet-yilmaz',
  authorTitle: 'Kardiyoloji Uzmanı',
  authorImage: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&q=80',
  tags: ['Kalp Sağlığı', 'Beslenme', 'Egzersiz', 'Sağlıklı Yaşam'],
  content: `
    <p>Kalp sağlığı, genel sağlığımızın en önemli bileşenlerinden biridir. Kalp ve damar hastalıkları, dünya genelinde en yaygın ölüm nedenlerinden biri olmaya devam etmektedir. Ancak, doğru yaşam tarzı seçimleri ve alışkanlıklar ile kalp sağlığınızı korumak mümkündür.</p>
    
    <h2>1. Dengeli Beslenin</h2>
    <p>Kalp sağlığı için Akdeniz tipi beslenme önerilmektedir. Bu beslenme şekli, zeytinyağı, balık, sebze, meyve, tam tahıllar ve kuruyemişler gibi kalp dostu besinleri içerir. Doymuş yağlar, trans yağlar ve aşırı tuz tüketiminden kaçınmak önemlidir.</p>
    
    <h2>2. Düzenli Egzersiz Yapın</h2>
    <p>Haftada en az 150 dakika orta yoğunlukta aerobik egzersiz (yürüyüş, yüzme, bisiklet) veya 75 dakika yüksek yoğunlukta egzersiz yapmak kalp sağlığınızı destekler. Ayrıca, haftada en az iki gün kas güçlendirici egzersizler yapmanız önerilir.</p>
    
    <h2>3. Sigarayı Bırakın</h2>
    <p>Sigara içmek, kalp hastalığı riskini önemli ölçüde artırır. Sigara içiyorsanız, bırakmak için profesyonel destek alabilirsiniz. Sigarayı bıraktıktan sonra, kalp hastalığı riskiniz zamanla azalacaktır.</p>
    
    <h2>4. Alkolü Sınırlayın</h2>
    <p>Aşırı alkol tüketimi, kalp sağlığınızı olumsuz etkileyebilir. Erkekler için günde en fazla iki, kadınlar için bir standart içki önerilmektedir. Ancak, alkol tüketmiyorsanız, kalp sağlığı için alkole başlamanız önerilmez.</p>
    
    <h2>5. Sağlıklı Kilonuzu Koruyun</h2>
    <p>Fazla kilo ve obezite, kalp hastalığı riskini artırır. Sağlıklı bir vücut kitle indeksi (BMI) ve bel çevresi ölçüsü hedefleyin. Dengeli beslenme ve düzenli egzersiz, kilo kontrolünde yardımcı olacaktır.</p>
    
    <h2>6. Stresi Yönetin</h2>
    <p>Kronik stres, kalp sağlığınızı olumsuz etkileyebilir. Meditasyon, derin nefes alma egzersizleri, yoga veya hobi edinmek gibi stres yönetim teknikleri uygulayın. Yeterli uyku da stres yönetiminde önemlidir.</p>
    
    <h2>7. Kan Basıncınızı Kontrol Edin</h2>
    <p>Yüksek tansiyon, kalp hastalığı için önemli bir risk faktörüdür. Düzenli olarak kan basıncınızı ölçtürün ve yüksekse, doktorunuzun önerdiği tedaviyi uygulayın. Tuz tüketimini azaltmak, düzenli egzersiz yapmak ve stresi yönetmek, kan basıncını kontrol etmeye yardımcı olabilir.</p>
    
    <h2>8. Kolesterol Seviyelerinizi Takip Edin</h2>
    <p>Yüksek LDL (kötü) kolesterol ve düşük HDL (iyi) kolesterol, kalp hastalığı riskini artırır. Düzenli olarak kolesterol seviyelerinizi kontrol ettirin ve gerekirse doktorunuzun önerdiği tedaviyi uygulayın.</p>
    
    <h2>9. Diyabet Riskinizi Azaltın</h2>
    <p>Diyabet, kalp hastalığı riskini artırır. Sağlıklı beslenme, düzenli egzersiz ve kilo kontrolü ile diyabet riskinizi azaltabilirsiniz. Diyabetiniz varsa, kan şekerinizi kontrol altında tutmak için doktorunuzun önerilerini uygulayın.</p>
    
    <h2>10. Düzenli Sağlık Kontrolleri Yaptırın</h2>
    <p>Düzenli sağlık kontrolleri, kalp hastalığı risk faktörlerini erken tespit etmeye yardımcı olur. Yaşınıza ve risk faktörlerinize bağlı olarak, doktorunuzun önerdiği sıklıkta sağlık kontrollerinizi yaptırın.</p>
    
    <p>Kalp sağlığınızı korumak için bu önerileri günlük yaşamınıza dahil etmek, kalp hastalığı riskinizi azaltacak ve genel sağlığınızı iyileştirecektir. Unutmayın, küçük değişiklikler bile büyük fark yaratabilir.</p>
  `,
  relatedArticles: [
    {
      id: 4,
      title: 'Hipertansiyon Nedir ve Nasıl Kontrol Edilir?',
      slug: 'hipertansiyon-nedir-ve-nasil-kontrol-edilir',
      category: 'Kardiyoloji',
      image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
      date: '28 Ağustos 2023',
    },
    {
      id: 6,
      title: 'Sağlıklı Beslenme Rehberi',
      slug: 'saglikli-beslenme-rehberi',
      category: 'Beslenme',
      image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
      date: '15 Ağustos 2023',
    },
    {
      id: 7,
      title: 'Stres Yönetimi Teknikleri',
      slug: 'stres-yonetimi-teknikleri',
      category: 'Psikoloji',
      image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
      date: '10 Ağustos 2023',
    },
  ],
};

const HealthArticlePage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<typeof articleData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real application, you would fetch the article data from an API
    // For this example, we'll use the mock data
    setLoading(true);
    setTimeout(() => {
      setArticle(articleData);
      setLoading(false);
    }, 500);
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
        <h2 className="text-2xl font-bold mb-4">Makale Bulunamadı</h2>
        <p className="mb-8">Aradığınız makale bulunamadı. Lütfen tüm makalelerimizi görüntüleyin.</p>
        <Link to="/saglik-rehberi" className="btn btn-primary">
          Tüm Makaleler
        </Link>
      </div>
    );
  }

  const shareUrl = window.location.href;

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
                {article.category}
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-primary mb-4">{article.title}</h1>
              <div className="flex flex-wrap items-center text-text-light text-sm gap-4 mb-6">
                <div className="flex items-center">
                  <FaCalendarAlt className="mr-2" />
                  <span>{article.date}</span>
                </div>
                <div className="flex items-center">
                  <FaEye className="mr-2" />
                  <span>{article.views} görüntülenme</span>
                </div>
                <div className="flex items-center">
                  <FaUser className="mr-2" />
                  <Link to={`/doktorlar/${article.authorSlug}`} className="hover:text-primary transition-colors">
                    {article.author}
                  </Link>
                </div>
              </div>
              <div className="relative h-96 rounded-xl overflow-hidden mb-8">
                <img
                  src={article.image}
                  alt={article.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  crossOrigin="anonymous"
                />
              </div>
            </div>

            {/* Article Content */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="md:col-span-3">
                <div 
                  className="prose prose-lg max-w-none mb-8"
                  dangerouslySetInnerHTML={{ __html: article.content }}
                />

                {/* Tags */}
                <div className="flex flex-wrap items-center gap-2 mb-8">
                  <FaTags className="text-primary" />
                  {article.tags.map((tag, index) => (
                    <Link
                      key={index}
                      to={`/saglik-rehberi?tag=${tag}`}
                      className="bg-neutral px-3 py-1 rounded-full text-sm text-text-light hover:bg-primary/10 hover:text-primary transition-colors"
                    >
                      {tag}
                    </Link>
                  ))}
                </div>

                {/* Share */}
                <div className="border-t border-b border-gray-200 py-6 mb-8">
                  <h3 className="font-semibold mb-4 flex items-center">
                    <FaShare className="mr-2 text-primary" /> Bu Makaleyi Paylaşın
                  </h3>
                  <div className="flex gap-3">
                    <a
                      href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-full bg-[#3b5998] text-white flex items-center justify-center hover:opacity-90 transition-opacity"
                      aria-label="Facebook'ta Paylaş"
                    >
                      <FaFacebookF />
                    </a>
                    <a
                      href={`https://twitter.com/intent/tweet?url=${shareUrl}&text=${article.title}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-full bg-[#1da1f2] text-white flex items-center justify-center hover:opacity-90 transition-opacity"
                      aria-label="Twitter'da Paylaş"
                    >
                      <FaTwitter />
                    </a>
                    <a
                      href={`https://www.linkedin.com/shareArticle?mini=true&url=${shareUrl}&title=${article.title}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-full bg-[#0077b5] text-white flex items-center justify-center hover:opacity-90 transition-opacity"
                      aria-label="LinkedIn'de Paylaş"
                    >
                      <FaLinkedinIn />
                    </a>
                    <a
                      href={`https://wa.me/?text=${article.title} ${shareUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-full bg-[#25d366] text-white flex items-center justify-center hover:opacity-90 transition-opacity"
                      aria-label="WhatsApp'ta Paylaş"
                    >
                      <FaWhatsapp />
                    </a>
                  </div>
                </div>

                {/* Author */}
                <div className="bg-neutral rounded-xl p-6 mb-8">
                  <div className="flex items-center">
                    <img
                      src={article.authorImage}
                      alt={article.author}
                      className="w-16 h-16 rounded-full object-cover mr-4"
                      loading="lazy"
                      crossOrigin="anonymous"
                    />
                    <div>
                      <h3 className="font-semibold">{article.author}</h3>
                      <p className="text-text-light text-sm">{article.authorTitle}</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <Link
                      to={`/doktorlar/${article.authorSlug}`}
                      className="text-primary font-medium hover:text-primary-dark transition-colors"
                    >
                      Profili Görüntüle
                    </Link>
                  </div>
                </div>

                {/* Related Articles */}
                <div>
                  <h3 className="text-xl font-semibold text-primary mb-6">İlgili Makaleler</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {article.relatedArticles.map((relatedArticle) => (
                      <Link
                        key={relatedArticle.id}
                        to={`/saglik-rehberi/${relatedArticle.slug}`}
                        className="card overflow-hidden group"
                      >
                        <div className="relative h-40 -mx-6 -mt-6 mb-4 overflow-hidden">
                          <img
                            src={relatedArticle.image}
                            alt={relatedArticle.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            loading="lazy"
                            crossOrigin="anonymous"
                          />
                          <div className="absolute top-2 left-2 bg-accent text-white text-xs font-medium px-2 py-1 rounded-full">
                            {relatedArticle.category}
                          </div>
                        </div>
                        <h4 className="font-medium mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                          {relatedArticle.title}
                        </h4>
                        <p className="text-xs text-text-light">
                          <FaCalendarAlt className="inline mr-1" /> {relatedArticle.date}
                        </p>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="md:col-span-1">
                <div className="sticky top-24">
                  {/* Categories */}
                  <div className="card mb-6">
                    <h3 className="text-lg font-semibold text-primary mb-4">Kategoriler</h3>
                    <ul className="space-y-2">
                      <li>
                        <Link to="/saglik-rehberi?category=Kardiyoloji" className="flex items-center text-text-light hover:text-primary transition-colors">
                          <i className="bi bi-heart-pulse-fill text-primary mr-2"></i>
                          <span>Kardiyoloji</span>
                        </Link>
                      </li>
                      <li>
                        <Link to="/saglik-rehberi?category=Nöroloji" className="flex items-center text-text-light hover:text-primary transition-colors">
                          <i className="bi bi-brain text-primary mr-2"></i>
                          <span>Nöroloji</span>
                        </Link>
                      </li>
                      <li>
                        <Link to="/saglik-rehberi?category=Ortopedi" className="flex items-center text-text-light hover:text-primary transition-colors">
                          <i className="bi bi-person-standing text-primary mr-2"></i>
                          <span>Ortopedi</span>
                        </Link>
                      </li>
                      <li>
                        <Link to="/saglik-rehberi?category=Beslenme" className="flex items-center text-text-light hover:text-primary transition-colors">
                          <i className="bi bi-apple text-primary mr-2"></i>
                          <span>Beslenme</span>
                        </Link>
                      </li>
                      <li>
                        <Link to="/saglik-rehberi?category=Psikoloji" className="flex items-center text-text-light hover:text-primary transition-colors">
                          <i className="bi bi-emoji-smile text-primary mr-2"></i>
                          <span>Psikoloji</span>
                        </Link>
                      </li>
                    </ul>
                  </div>

                  {/* Popular Articles */}
                  <div className="card mb-6">
                    <h3 className="text-lg font-semibold text-primary mb-4">Popüler Makaleler</h3>
                    <ul className="space-y-4">
                      <li>
                        <Link to="/saglik-rehberi/saglikli-beslenme-rehberi" className="flex items-start group">
                          <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 mr-3">
                            <img
                              src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80"
                              alt="Sağlıklı Beslenme Rehberi"
                              className="w-full h-full object-cover"
                              loading="lazy"
                              crossOrigin="anonymous"
                            />
                          </div>
                          <div>
                            <h4 className="text-sm font-medium group-hover:text-primary transition-colors line-clamp-2">
                              Sağlıklı Beslenme Rehberi
                            </h4>
                            <p className="text-xs text-text-light mt-1">15 Ağustos 2023</p>
                          </div>
                        </Link>
                      </li>
                      <li>
                        <Link to="/saglik-rehberi/stres-yonetimi-teknikleri" className="flex items-start group">
                          <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 mr-3">
                            <img
                              src="https://images.unsplash.com/photo-1506126613408-eca07ce68773?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80"
                              alt="Stres Yönetimi Teknikleri"
                              className="w-full h-full object-cover"
                              loading="lazy"
                              crossOrigin="anonymous"
                            />
                          </div>
                          <div>
                            <h4 className="text-sm font-medium group-hover:text-primary transition-colors line-clamp-2">
                              Stres Yönetimi Teknikleri
                            </h4>
                            <p className="text-xs text-text-light mt-1">10 Ağustos 2023</p>
                          </div>
                        </Link>
                      </li>
                      <li>
                        <Link to="/saglik-rehberi/cocuklarda-bagisiklik-sistemini-guclendirme-yollari" className="flex items-start group">
                          <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 mr-3">
                            <img
                              src="https://images.unsplash.com/photo-1516627145497-ae6968895b74?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80"
                              alt="Çocuklarda Bağışıklık Sistemini Güçlendirme Yolları"
                              className="w-full h-full object-cover"
                              loading="lazy"
                              crossOrigin="anonymous"
                            />
                          </div>
                          <div>
                            <h4 className="text-sm font-medium group-hover:text-primary transition-colors line-clamp-2">
                              Çocuklarda Bağışıklık Sistemini Güçlendirme Yolları
                            </h4>
                            <p className="text-xs text-text-light mt-1">10 Eylül 2023</p>
                          </div>
                        </Link>
                      </li>
                    </ul>
                  </div>

                  {/* Tags */}
                  <div className="card">
                    <h3 className="text-lg font-semibold text-primary mb-4">Etiketler</h3>
                    <div className="flex flex-wrap gap-2">
                      <Link to="/saglik-rehberi?tag=Kalp Sağlığı" className="bg-neutral px-3 py-1 rounded-full text-sm text-text-light hover:bg-primary/10 hover:text-primary transition-colors">
                        Kalp Sağlığı
                      </Link>
                      <Link to="/saglik-rehberi?tag=Beslenme" className="bg-neutral px-3 py-1 rounded-full text-sm text-text-light hover:bg-primary/10 hover:text-primary transition-colors">
                        Beslenme
                      </Link>
                      <Link to="/saglik-rehberi?tag=Egzersiz" className="bg-neutral px-3 py-1 rounded-full text-sm text-text-light hover:bg-primary/10 hover:text-primary transition-colors">
                        Egzersiz
                      </Link>
                      <Link to="/saglik-rehberi?tag=Sağlıklı Yaşam" className="bg-neutral px-3 py-1 rounded-full text-sm text-text-light hover:bg-primary/10 hover:text-primary transition-colors">
                        Sağlıklı Yaşam
                      </Link>
                      <Link to="/saglik-rehberi?tag=Stres" className="bg-neutral px-3 py-1 rounded-full text-sm text-text-light hover:bg-primary/10 hover:text-primary transition-colors">
                        Stres
                      </Link>
                      <Link to="/saglik-rehberi?tag=Uyku" className="bg-neutral px-3 py-1 rounded-full text-sm text-text-light hover:bg-primary/10 hover:text-primary transition-colors">
                        Uyku
                      </Link>
                      <Link to="/saglik-rehberi?tag=Bağışıklık" className="bg-neutral px-3 py-1 rounded-full text-sm text-text-light hover:bg-primary/10 hover:text-primary transition-colors">
                        Bağışıklık
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default HealthArticlePage;
