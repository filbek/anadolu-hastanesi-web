import { Helmet } from 'react-helmet-async';
import { usePage } from '../../hooks/usePage';
import React from 'react';
import HeroBanner from '../home/HeroBanner';
import HospitalBranches from '../home/HospitalBranches';
import DepartmentsSection from '../home/DepartmentsSection';
import DoctorsSlider from '../home/DoctorsSlider';
import HealthGuideSection from '../home/HealthGuideSection';
import TestimonialsSection from '../home/TestimonialsSection';
import HealthTourismSection from '../home/HealthTourismSection';
import ScrollReveal from '../ui/ScrollReveal';

interface PageSection {
  id: string;
  type: 'hero' | 'text' | 'image' | 'gallery' | 'cta' | 'features' | 'testimonials' | 'contact' | 'hospital_stats' | 'stats' | 'custom' | 'hospital_branches' | 'departments_list' | 'doctors_list' | 'health_guide' | 'testimonials_slider' | 'health_tourism' | 'hero_banner';
  title?: string;
  subtitle?: string;
  content?: string;
  image?: string;
  images?: string[];
  button_text?: string;
  button_link?: string;
  settings?: Record<string, any>;
  order: number;
}

interface Props {
  slug: string;
  fallbackComponent?: React.ComponentType<any>;
  renderCustomFallback?: (pageData: any, pageContent: any) => React.ReactNode;
}

const DynamicPageRenderer = ({ slug, fallbackComponent: FallbackComponent, renderCustomFallback }: Props) => {
  console.log('🔄 DynamicPageRenderer rendered for slug:', slug);
  const { pageData, pageContent, loading, error } = usePage(slug);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error && (FallbackComponent || renderCustomFallback)) {
    if (renderCustomFallback) return <>{renderCustomFallback(pageData, pageContent)}</>;
    return FallbackComponent ? <FallbackComponent /> : null;
  }

  if (!pageData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Sayfa Bulunamadı</h1>
          <p className="text-gray-600">Aradığınız sayfa mevcut değil.</p>
        </div>
      </div>
    );
  }

  const renderSection = (section: PageSection) => {
    switch (section.type) {
      case 'hero':
        return (
          <section
            key={section.id}
            className="relative min-h-[60vh] flex items-center bg-primary text-white overflow-hidden"
          >
            {(section.image || pageData.hero_image) && (
              <div className="absolute inset-0 z-0">
                <img
                  src={section.image || pageData.hero_image}
                  alt={section.title || pageData.hero_title || ''}
                  className="w-full h-full object-cover opacity-40"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/80 to-transparent" />
              </div>
            )}
            <div className="container-custom relative z-10 py-20">
              <div className="max-w-3xl">
                <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                  {section.title || pageData.hero_title}
                </h1>
                {(section.subtitle || pageData.hero_subtitle) && (
                  <p className="text-xl md:text-2xl text-white/90 mb-10 leading-relaxed">
                    {section.subtitle || pageData.hero_subtitle}
                  </p>
                )}
                {section.button_text && (
                  <a
                    href={section.button_link || '#'}
                    className="btn btn-accent px-8 py-4 text-lg"
                  >
                    {section.button_text}
                  </a>
                )}
              </div>
            </div>
          </section>
        );

      case 'text':
        return (
          <section key={section.id} className="py-20 bg-white">
            <div className="container-custom">
              <div className="max-w-4xl mx-auto">
                {section.title && (
                  <h2 className="text-3xl font-bold text-primary mb-10 text-center">
                    {section.title}
                  </h2>
                )}
                {section.content && (
                  <div
                    className="prose prose-lg max-w-none text-text-light leading-loose"
                    dangerouslySetInnerHTML={{ __html: section.content }}
                  />
                )}
              </div>
            </div>
          </section>
        );

      case 'image':
        return (
          <section key={section.id} className="py-20 bg-neutral/30">
            <div className="container-custom">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className={section.settings?.order === 'reverse' ? 'lg:order-2' : ''}>
                  {section.title && (
                    <h2 className="text-3xl font-bold text-primary mb-6">
                      {section.title}
                    </h2>
                  )}
                  {section.content && (
                    <p className="text-text-light text-lg leading-relaxed mb-8">
                      {section.content}
                    </p>
                  )}
                  {section.button_text && (
                    <a href={section.button_link || '#'} className="btn btn-primary">
                      {section.button_text}
                    </a>
                  )}
                </div>
                <div className={section.settings?.order === 'reverse' ? 'lg:order-1' : ''}>
                  {section.image && (
                    <img
                      src={section.image}
                      alt={section.title || ''}
                      className="w-full h-[500px] object-cover rounded-2xl shadow-2xl"
                    />
                  )}
                </div>
              </div>
            </div>
          </section>
        );

      case 'gallery':
        const galleryImages = section.images || [];
        return (
          <section key={section.id} className="py-20 bg-white">
            <div className="container-custom">
              {section.title && (
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold text-primary mb-4">{section.title}</h2>
                  {section.subtitle && <p className="text-text-light">{section.subtitle}</p>}
                </div>
              )}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {galleryImages.map((img, i) => (
                  <div key={`${section.id}-img-${i}`} className="group relative aspect-square overflow-hidden rounded-xl bg-gray-100">
                    <img
                      src={img}
                      alt={`Gallery ${i}`}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                ))}
              </div>
            </div>
          </section>
        );

      case 'cta':
        return (
          <section key={section.id} className="py-16 bg-accent text-white relative overflow-hidden">
            <div className="container-custom relative z-10 text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                {section.title}
              </h2>
              {section.subtitle && (
                <p className="text-xl opacity-90 mb-10 max-w-2xl mx-auto leading-relaxed">
                  {section.subtitle}
                </p>
              )}
              {section.button_text && (
                <a
                  href={section.button_link || '#'}
                  className="inline-block bg-white text-accent px-10 py-4 rounded-full font-bold text-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
                >
                  {section.button_text}
                </a>
              )}
            </div>
          </section>
        );

      case 'features':
        let features = [];
        try {
          features = section.content ? JSON.parse(section.content) : [];
        } catch {
          features = [];
        }

        return (
          <section key={section.id} className="py-20 bg-neutral">
            <div className="container-custom">
              {section.title && (
                <h2 className="text-3xl font-bold text-primary mb-12 text-center">
                  {section.title}
                </h2>
              )}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {features.map((feature: any, index: number) => (
                  <div key={`${section.id}-feature-${index}`} className="bg-white p-10 rounded-2xl shadow-sm hover:shadow-xl transition-all group border-b-4 border-transparent hover:border-primary">
                    {feature.icon && (
                      <div className="text-5xl mb-6 transform group-hover:scale-110 transition-transform">{feature.icon}</div>
                    )}
                    <h3 className="text-xl font-bold text-primary mb-4">
                      {feature.title}
                    </h3>
                    <p className="text-text-light leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        );

      case 'hospital_stats':
      case 'stats':
        let stats = [];
        try {
          stats = section.content ? JSON.parse(section.content) : [];
        } catch {
          stats = [
            { label: 'Yıllık Hasta', value: '250.000+' },
            { label: 'Uzman Doktor', value: '150+' },
            { label: 'Modern Yatak', value: '500+' },
            { label: 'Başarı Oranı', value: '%98' }
          ];
        }

        return (
          <section key={section.id} className="py-20 bg-primary text-white">
            <div className="container-custom">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                {stats.map((stat: any, i: number) => (
                  <div key={`${section.id}-stat-${i}`} className="text-center p-8 border border-white/20 rounded-2xl bg-white/5 backdrop-blur-sm">
                    <div className="text-4xl md:text-5xl font-bold mb-2 text-accent">{stat.value}</div>
                    <div className="text-lg font-medium opacity-80 uppercase tracking-widest">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        );

      case 'testimonials':
        let testimonials = [];
        try {
          testimonials = section.content ? JSON.parse(section.content) : [];
        } catch {
          testimonials = [];
        }

        return (
          <section key={section.id} className="py-20 bg-white">
            <div className="container-custom">
              {section.title && <h2 className="text-3xl font-bold text-primary mb-12 text-center">{section.title}</h2>}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {testimonials.map((t: any, i: number) => (
                  <div key={`${section.id}-testi-${i}`} className="bg-neutral p-8 rounded-2xl relative shadow-sm">
                    <div className="text-accent text-5xl absolute top-6 right-8 opacity-20 italic">"</div>
                    <p className="text-text-light italic leading-relaxed mb-6 relative z-10">{t.content}</p>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">
                        {t.author?.charAt(0) || 'H'}
                      </div>
                      <div>
                        <div className="font-bold text-primary">{t.author}</div>
                        <div className="text-xs text-text-light uppercase tracking-tighter">{t.role || 'Hasta'}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        );

      case 'contact':
        return (
          <section key={section.id} className="py-20 bg-white">
            <div className="container-custom">
              <div className="max-w-6xl mx-auto bg-neutral rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row">
                <div className="md:w-1/2 p-12 bg-primary text-white">
                  <h3 className="text-2xl font-bold mb-8">İletişim Bilgileri</h3>
                  <div className="space-y-8">
                    <div className="flex items-start gap-4">
                      <div className="bg-white/10 p-3 rounded-lg">📞</div>
                      <div>
                        <div className="text-sm opacity-60 uppercase mb-1">Telefon</div>
                        <div className="text-lg font-medium">+90 212 123 45 67</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="bg-white/10 p-3 rounded-lg">✉️</div>
                      <div>
                        <div className="text-sm opacity-60 uppercase mb-1">E-posta</div>
                        <div className="text-lg font-medium">info@anadoluhastaneleri.com</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="bg-white/10 p-3 rounded-lg">📍</div>
                      <div>
                        <div className="text-sm opacity-60 uppercase mb-1">Adres</div>
                        <div className="text-lg font-medium">İstanbul, Türkiye</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="md:w-1/2 p-12 flex flex-col justify-center">
                  <h3 className="text-2xl font-bold text-primary mb-6">Online Randevu</h3>
                  <p className="text-text-light text-lg mb-8 leading-relaxed">
                    Size en yakın hastanemizi seçerek hemen online randevunuzu oluşturabilirsiniz.
                  </p>
                  <a
                    href="https://anadoluhastaneleri.kendineiyibak.app/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-accent inline-flex items-center justify-center gap-3 py-4 text-lg"
                  >
                    Hemen Randevu Al
                  </a>
                </div>
              </div>
            </div>
          </section>
        );

      case 'hospital_branches':
        return <HospitalBranches key={section.id} />;

      case 'departments_list':
        return <DepartmentsSection key={section.id} />;

      case 'doctors_list':
        return <DoctorsSlider key={section.id} />;

      case 'health_guide':
        return (
          <ScrollReveal key={section.id}>
            <HealthGuideSection />
          </ScrollReveal>
        );

      case 'testimonials_slider':
        return (
          <ScrollReveal key={section.id}>
            <TestimonialsSection />
          </ScrollReveal>
        );

      case 'health_tourism':
        return <HealthTourismSection key={section.id} />;

      case 'hero_banner':
        return (
          <HeroBanner
            key={section.id}
            dynamicData={{
              title: section.title || pageData.hero_title,
              subtitle: section.subtitle || pageData.hero_subtitle,
              image: section.image || pageData.hero_image
            }}
          />
        );

      default:
        return null;
    }
  };

  const sections = pageContent?.sections || [];
  const sortedSections = [...sections].sort((a: PageSection, b: PageSection) => a.order - b.order);

  return (
    <>
      <Helmet>
        <title>{pageData.meta_title || pageData.title}</title>
        <meta name="description" content={pageData.meta_description || ''} />
      </Helmet>

      <div className="min-h-screen">
        {sortedSections.length > 0 ? (
          sortedSections.map(renderSection)
        ) : slug === 'ana-sayfa' || (slug === '/' && renderCustomFallback) ? (
          renderCustomFallback ? <>{renderCustomFallback(pageData, pageContent)}</> : (FallbackComponent ? <FallbackComponent /> : null)
        ) : (
          <section className="py-20 bg-gradient-to-r from-primary to-primary-dark text-white">
            <div className="container mx-auto px-4 text-center">
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                {pageData.hero_title || pageData.title}
              </h1>
              {pageData.hero_subtitle && (
                <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
                  {pageData.hero_subtitle}
                </p>
              )}
            </div>
          </section>
        )}

        {/* Show fallback component as additional content for pages other than ana-sayfa if sections exist */}
        {FallbackComponent && slug !== 'ana-sayfa' && sortedSections.length > 0 && (
          <div className="bg-white">
            <FallbackComponent />
          </div>
        )}
      </div>
    </>
  );
};

export default DynamicPageRenderer;
