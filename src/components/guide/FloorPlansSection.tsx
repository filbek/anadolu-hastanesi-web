import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { getHospitals } from '../../services/hospitalService';
import { getLocalized } from '../../hooks/useLocalized';
import type { SupportedLang } from '../../services/translationService';
import type { Hospital } from '../../lib/supabase';

// Satır sonu (gerçek ya da "\n" yazısı olarak kaydedilmiş) veya "|" ile ayrılmış birimler
const unitsOf = (description?: string) =>
  (description ?? '')
    .split(/\r?\n|\\n|\|/)
    .map((u) => u.trim())
    .filter(Boolean);

/**
 * Hastane İçi Rehber > Kat Planları (kat başlığı + birim listesi).
 * Veri hastaneler tablosundaki `floor_plans` alanından gelir; admin panelde
 * Hastaneler > (hastane) > "Kat Planları" bölümünden yönetilir.
 * Kat tanımlı hastane yoksa bölüm hiç görünmez.
 */
const FloorPlansSection = () => {
  const { t, i18n } = useTranslation();
  // "en-US" -> "en"; desteklenmeyen dil getLocalized içinde Türkçe'ye düşer
  const lang = ((i18n.language || 'tr').slice(0, 2).toLowerCase() || 'tr') as SupportedLang;
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [activeId, setActiveId] = useState<Hospital['id'] | null>(null);

  useEffect(() => {
    let alive = true;
    getHospitals({ onlyPublished: true }).then((list) => {
      if (!alive) return;
      const withFloors = list.filter(
        (h) => Array.isArray(h.floor_plans) && h.floor_plans.some((f) => f.title?.trim()),
      );
      setHospitals(withFloors);
      if (withFloors.length) setActiveId(withFloors[0].id);
    });
    return () => {
      alive = false;
    };
  }, []);

  if (hospitals.length === 0) return null;

  const active = hospitals.find((h) => h.id === activeId) ?? hospitals[0];
  const floors = (active.floor_plans ?? []).filter((f) => f.title?.trim());

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

        {hospitals.length > 1 && (
          <div role="tablist" aria-label={t('guide.floorHospitals', 'Hastane seçin')} className="flex flex-wrap gap-2 mb-8">
            {hospitals.map((h) => {
              const selected = h.id === active.id;
              return (
                <button
                  key={h.id}
                  role="tab"
                  type="button"
                  aria-selected={selected}
                  onClick={() => setActiveId(h.id)}
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
    </section>
  );
};

export default FloorPlansSection;
