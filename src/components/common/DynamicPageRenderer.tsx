import { Helmet } from 'react-helmet-async';
import { usePage } from '../../hooks/usePage';

interface PageSection {
  id: string;
  type: 'hero' | 'text' | 'image' | 'gallery' | 'cta' | 'features' | 'testimonials' | 'contact';
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
  fallbackComponent?: React.ComponentType;
}

const DynamicPageRenderer = ({ slug, fallbackComponent: FallbackComponent }: Props) => {
  console.log('🔄 DynamicPageRenderer rendered for slug:', slug);
  const { pageData, pageContent, loading, error } = usePage(slug);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error && FallbackComponent) {
    return <FallbackComponent />;
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
            className="relative bg-gradient-to-r from-primary to-primary-dark text-white py-20"
            style={section.image ? {
              backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${section.image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            } : {}}
          >
            <div className="container mx-auto px-4 text-center">
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                {section.title || pageData.hero_title}
              </h1>
              {(section.subtitle || pageData.hero_subtitle) && (
                <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
                  {section.subtitle || pageData.hero_subtitle}
                </p>
              )}
            </div>
          </section>
        );

      case 'text':
        return (
          <section key={section.id} className="py-16 bg-white">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto">
                {section.title && (
                  <h2 className="text-3xl font-bold text-primary mb-8 text-center">
                    {section.title}
                  </h2>
                )}
                {section.content && (
                  <div 
                    className="prose prose-lg max-w-none text-gray-700 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: section.content }}
                  />
                )}
              </div>
            </div>
          </section>
        );

      case 'image':
        return (
          <section key={section.id} className="py-16 bg-gray-50">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto text-center">
                {section.title && (
                  <h2 className="text-3xl font-bold text-primary mb-8">
                    {section.title}
                  </h2>
                )}
                {section.image && (
                  <div className="mb-8">
                    <img 
                      src={section.image} 
                      alt={section.title || ''} 
                      className="w-full h-96 object-cover rounded-lg shadow-lg"
                    />
                  </div>
                )}
                {section.content && (
                  <p className="text-gray-700 text-lg leading-relaxed">
                    {section.content}
                  </p>
                )}
              </div>
            </div>
          </section>
        );

      case 'cta':
        return (
          <section key={section.id} className="py-16 bg-primary text-white">
            <div className="container mx-auto px-4 text-center">
              {section.title && (
                <h2 className="text-3xl font-bold mb-4">
                  {section.title}
                </h2>
              )}
              {section.subtitle && (
                <p className="text-xl mb-8 max-w-2xl mx-auto">
                  {section.subtitle}
                </p>
              )}
              {section.button_text && section.button_link && (
                <a
                  href={section.button_link}
                  target={section.button_link.startsWith('http') ? '_blank' : '_self'}
                  rel={section.button_link.startsWith('http') ? 'noopener noreferrer' : ''}
                  className="inline-block bg-white text-primary px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors"
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
          <section key={section.id} className="py-16 bg-gray-50">
            <div className="container mx-auto px-4">
              {section.title && (
                <h2 className="text-3xl font-bold text-primary mb-12 text-center">
                  {section.title}
                </h2>
              )}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {features.map((feature: any, index: number) => (
                  <div key={index} className="text-center bg-white p-8 rounded-lg shadow-sm">
                    {feature.icon && (
                      <div className="text-4xl mb-4">{feature.icon}</div>
                    )}
                    <h3 className="text-xl font-semibold text-primary mb-4">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600">
                      {feature.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        );

      case 'contact':
        return (
          <section key={section.id} className="py-16 bg-white">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto">
                {section.title && (
                  <h2 className="text-3xl font-bold text-primary mb-12 text-center">
                    {section.title}
                  </h2>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div>
                    <h3 className="text-xl font-semibold text-primary mb-6">İletişim Bilgileri</h3>
                    <div className="space-y-4">
                      <div className="flex items-center">
                        <span className="text-primary mr-3">📞</span>
                        <span>+90 212 123 45 67</span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-primary mr-3">✉️</span>
                        <span>info@anadoluhastaneleri.com</span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-primary mr-3">📍</span>
                        <span>İstanbul, Türkiye</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-primary mb-6">Randevu Al</h3>
                    <p className="text-gray-600 mb-6">
                      Online randevu sistemimiz ile kolayca randevu alabilirsiniz.
                    </p>
                    <a
                      href="https://anadoluhastaneleri.kendineiyibak.app/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark transition-colors"
                    >
                      Online Randevu Al
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </section>
        );

      default:
        return null;
    }
  };

  const sections = pageContent?.sections || [];
  const sortedSections = sections.sort((a, b) => a.order - b.order);

  return (
    <>
      <Helmet>
        <title>{pageData.meta_title || pageData.title}</title>
        <meta name="description" content={pageData.meta_description || ''} />
      </Helmet>

      <div className="min-h-screen">
        {sortedSections.length > 0 ? (
          sortedSections.map(renderSection)
        ) : (
          // Fallback content if no sections
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

        {/* Show original component for specific pages */}
        {FallbackComponent && (
          <div className="bg-white">
            <FallbackComponent />
          </div>
        )}
      </div>
    </>
  );
};

export default DynamicPageRenderer;
