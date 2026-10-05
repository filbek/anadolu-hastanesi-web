import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { getHospitals } from '../../services/hospitalService';
import { getLocalized } from '../../hooks/useLocalized';
import type { SupportedLang } from '../../services/translationService';
import type { Hospital } from '../../lib/supabase';
import { FaFilePdf, FaSpinner } from 'react-icons/fa';
import { downloadFloorPlanPdf } from '../../utils/floorPlanPdf';

// Satır sonu (gerçek ya da "\n" yazısı olarak kaydedilmiş) veya "|" ile ayrılmış birimler
const unitsOf = (description?: string) =>
  (description ?? '')
    .split(/\r?\n|\\n|\|/)
    .map((u) => u.trim())
    .filter(Boolean);

const floorsOf = (h: Hospital) => (h.floor_plans ?? []).filter((f) => f.title?.trim());

const slugify = (text: string) =>
  text
    .toLocaleLowerCase('tr-TR')
    .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's').replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

/**
 * Hastane İçi Rehber > Kat Planları (kat başlığı + birim listesi).
 * Veri hastaneler tablosundaki `floor_plans` alanından gelir; admin panelde
 * Hastaneler > (hastane) > "Kat Planları" bölümünden yönetilir.
 * Her yayındaki şube bir sekmedir; seçili şubenin planı tek sayfalık PDF
 * olarak (şube logosuyla) indirilebilir. Hiçbir şubede kat yoksa bölüm görünmez.
 */
const FloorPlansSection = () => {
  const { t, i18n } = useTranslation();
  // "en-US" -> "en"; desteklenmeyen dil getLocalized içinde Türkçe'ye düşer
  const lang = ((i18n.language || 'tr').slice(0, 2).toLowerCase() || 'tr') as SupportedLang;
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [activeId, setActiveId] = useState<Hospital['id'] | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [pdfError, setPdfError] = useState('');

  useEffect(() => {
    let alive = true;
    getHospitals({ onlyPublished: true }).then((list) => {
      if (!alive) return;
      // Kat planı olmayan şubeler de sekme olarak görünür; ilk sekme planı olan ilk şube
      if (!list.some((h) => floorsOf(h).length > 0)) return;
      setHospitals(list);
      setActiveId((list.find((h) => floorsOf(h).length > 0) ?? list[0]).id);
    });
    return () => {
      alive = false;
    };
  }, []);

  if (hospitals.length === 0) return null;

  const active = hospitals.find((h) => h.id === activeId) ?? hospitals[0];
  const floors = floorsOf(active);
  const activeName = getLocalized(active, 'name', lang);

  const handleDownload = async () => {
    setPdfError('');
    setDownloading(true);
    try {
      await downloadFloorPlanPdf({
        hospitalName: activeName,
        logoUrl: active.logo_url,
        address: active.address,
        phone: active.phone,
        floors: floors.map((f) => ({ title: f.title, units: unitsOf(f.description) })),
        labels: {
          heading: t('guide.floorTag', 'Kat Planları'),
          subheading: `${t('guide.floorTitle', 'Hangi Birim')} ${t('guide.floorHighlight', 'Hangi Katta?')}`,
          date: new Date().toLocaleDateString(i18n.language || 'tr-TR'),
        },
        fileName: `${slugify(active.name || 'hastane')}-kat-plani.pdf`,
      });
    } catch (err) {
      console.error('Kat planı PDF oluşturulamadı:', err);
      setPdfError(t('guide.floorPdfError', 'PDF oluşturulamadı. Lütfen tekrar deneyin.'));
    } finally {
      setDownloading(false);
    }
  };

  return (
    <section className="bg-white py-20 lg:py-28" aria-labelledby="floor-plans-heading">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mb-10"
        >
          <div className="flex items-center gap-3 mb-5">
            <span className="block h-px w-[60px] bg-accent" />
            <span className="text-xs uppercase tracking-[0.25em] text-accent font-bold">
              {t('guide.floorTag', 'Kat Planları')}
            </span>
          </div>
          <h2 id="floor-plans-heading" className="text-4xl lg:text-5xl font-black text-secondary leading-tight mb-4">
            {t('guide.floorTitle', 'Hangi Birim')}{' '}
            <span className="text-primary">{t('guide.floorHighlight', 'Hangi Katta?')}</span>
          </h2>
          <p className="text-gray-500 leading-relaxed">
            {t('guide.floorDesc', 'Gitmek istediğiniz birimin hangi katta olduğunu aşağıdan görebilirsiniz.')}
          </p>
        </motion.div>

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
          <div role="tablist" aria-label={t('guide.floorHospitals', 'Hastane seçin')} className="flex flex-wrap gap-2">
            {hospitals.map((h) => {
              const selected = h.id === active.id;
              return (
                <button
                  key={h.id}
                  id={`floor-tab-${h.id}`}
                  role="tab"
                  type="button"
                  aria-selected={selected}
                  aria-controls="floor-panel"
                  tabIndex={selected ? 0 : -1}
                  onClick={() => {
                    setActiveId(h.id);
                    setPdfError('');
                  }}
                  onKeyDown={(e) => {
                    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
                    const idx = hospitals.findIndex((x) => x.id === h.id);
                    const next = hospitals[(idx + (e.key === 'ArrowRight' ? 1 : hospitals.length - 1)) % hospitals.length];
                    setActiveId(next.id);
                    document.getElementById(`floor-tab-${next.id}`)?.focus();
                  }}
                  className={`px-5 py-2.5 rounded-xl text-sm font-bold border transition-colors ${
                    selected
                      ? 'bg-primary text-white border-primary'
                      : 'bg-white text-secondary border-gray-200 hover:border-primary'
                  }`}
                >
                  {getLocalized(h, 'name', lang)}
                </button>
              );
            })}
          </div>

          {floors.length > 0 && (
            <button
              type="button"
              onClick={handleDownload}
              disabled={downloading}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-accent text-white hover:bg-accent-dark transition-colors disabled:opacity-60 self-start lg:self-auto"
            >
              {downloading ? <FaSpinner className="animate-spin" aria-hidden="true" /> : <FaFilePdf aria-hidden="true" />}
              {downloading ? t('guide.floorPdfPreparing', 'PDF hazırlanıyor...') : t('guide.floorPdfDownload', 'Kat Planını PDF İndir')}
            </button>
          )}
        </div>

        {pdfError && (
          <p role="alert" className="mb-6 text-sm font-medium text-accent-dark">
            {pdfError}
          </p>
        )}

        <div id="floor-panel" role="tabpanel" aria-labelledby={`floor-tab-${active.id}`}>
        {floors.length === 0 && (
          <p className="text-gray-500 bg-gray-50 border border-gray-100 rounded-2xl p-6">
            {t('guide.floorEmpty', 'Bu hastanenin kat planı yakında eklenecektir.')}
          </p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {floors.map((floor, i) => {
            const units = unitsOf(floor.description);
            return (
              <motion.article
                key={`${active.id}-${i}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: (i % 3) * 0.08 }}
                className="bg-gray-50 rounded-2xl border border-gray-100 shadow-sm p-6"
              >
                <h3 className="text-xl font-black text-secondary pb-3 mb-4 border-b-2 border-accent inline-block">
                  {floor.title}
                </h3>
                {units.length > 0 && (
                  <ul className="space-y-2.5">
                    {units.map((unit, u) => (
                      <li key={u} className="flex items-start gap-2.5 text-[15px] font-medium text-gray-700 leading-snug">
                        <span aria-hidden="true" className="mt-[7px] block w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                        <span>{unit}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </motion.article>
            );
          })}
        </div>
        </div>
      </div>
    </section>
  );
};

export default FloorPlansSection;
