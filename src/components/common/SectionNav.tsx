import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { findSectionGroup } from '../../data/sectionNav';

/**
 * Kurumsal / Hasta Hizmetleri sayfalarında hero'nun hemen altında duran,
 * aşağı kaydırırken sabit header'ın (72px) altına yapışan bölüm menüsü.
 * Bulunulan sayfa vurgulanır. Bağlantılar sığmazsa yatay kaydırılır;
 * kenarlarda solma efekti ve (fare kullanıcıları için) ok düğmeleri çıkar.
 * Grubu olmayan bir sayfada hiçbir şey çizmez.
 */
const SectionNav = () => {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const group = findSectionGroup(pathname);
  const activeRef = useRef<HTMLAnchorElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  const updateEdges = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 4);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  // Aktif bağlantı görünür alanda değilse (yalnızca yatayda) görünür yap.
  useEffect(() => {
    const scroller = scrollerRef.current;
    const active = activeRef.current;
    if (scroller && active) {
      const left = active.offsetLeft;
      const right = left + active.offsetWidth;
      const margin = 48;
      if (left < scroller.scrollLeft + margin) {
        scroller.scrollLeft = Math.max(0, left - margin);
      } else if (right > scroller.scrollLeft + scroller.clientWidth - margin) {
        scroller.scrollLeft = right - scroller.clientWidth + margin;
      }
    }
    updateEdges();
  }, [pathname, updateEdges]);

  useEffect(() => {
    window.addEventListener('resize', updateEdges);
    return () => window.removeEventListener('resize', updateEdges);
  }, [updateEdges]);

  if (!group) return null;

  const current = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
  const title = t(group.titleKey, group.titleFallback);

  const scrollBy = (dir: 1 | -1) => {
    const el = scrollerRef.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.6, behavior: 'smooth' });
  };

  const arrowClass =
    'hidden md:flex absolute top-1/2 -translate-y-1/2 z-10 w-8 h-8 items-center justify-center rounded-full bg-white border border-gray-200 shadow-sm text-gray-600 hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary';

  return (
    <nav
      aria-label={title}
      className="sticky top-[72px] z-40 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm"
    >
      <div className="container-custom flex items-center gap-4">
        <span className="hidden xl:inline-flex flex-shrink-0 items-center text-[11px] uppercase tracking-[0.2em] font-bold text-gray-500 pr-4 border-r border-gray-200 py-1">
          {title}
        </span>
        <div className="relative flex-1 min-w-0">
          {/* Kenar solmaları — kaydırılabilecek içerik olduğunu gösterir */}
          <span
            aria-hidden="true"
            className={`pointer-events-none absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-white to-transparent z-[5] transition-opacity ${canLeft ? 'opacity-100' : 'opacity-0'}`}
          />
          <span
            aria-hidden="true"
            className={`pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-white to-transparent z-[5] transition-opacity ${canRight ? 'opacity-100' : 'opacity-0'}`}
          />
          {canLeft && (
            <button
              type="button"
              onClick={() => scrollBy(-1)}
              className={`${arrowClass} left-0`}
              aria-label={t('sectionNav.scrollLeft', 'Önceki bağlantılar')}
            >
              <FaChevronLeft className="text-xs" aria-hidden="true" />
            </button>
          )}
          {canRight && (
            <button
              type="button"
              onClick={() => scrollBy(1)}
              className={`${arrowClass} right-0`}
              aria-label={t('sectionNav.scrollRight', 'Sonraki bağlantılar')}
            >
              <FaChevronRight className="text-xs" aria-hidden="true" />
            </button>
          )}
          <div
            ref={scrollerRef}
            onScroll={updateEdges}
            className="overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            <ul className="flex items-stretch gap-0.5 min-w-max">
              {group.links.map(link => {
                const isActive = link.path === current;
                return (
                  <li key={link.path} className="flex">
                    <Link
                      to={link.path}
                      ref={isActive ? activeRef : undefined}
                      aria-current={isActive ? 'page' : undefined}
                      className={`relative inline-flex items-center px-2.5 py-4 text-sm font-semibold whitespace-nowrap transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset rounded ${
                        isActive ? 'text-primary' : 'text-gray-600 hover:text-primary'
                      }`}
                    >
                      {t(link.key, link.fallback)}
                      <span
                        aria-hidden="true"
                        className={`absolute left-2.5 right-2.5 bottom-0 h-[3px] rounded-full bg-primary transition-opacity ${
                          isActive ? 'opacity-100' : 'opacity-0'
                        }`}
                      />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default SectionNav;
