import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import {
  FaHeart,
  FaChevronRight,
  FaCalendarAlt,
  FaHospital,
  FaHandHoldingMedical,
} from 'react-icons/fa';
import { supabase } from '../lib/supabase';
import type { Hospital } from '../lib/supabase';
import AutoTranslate from '../components/common/AutoTranslate';

type CsrActivity = {
  id: number;
  title: string;
  description: string;
  image?: string | null;
  event_date?: string | null;
  hospital_id?: number | null;
  is_active: boolean;
  display_order: number;
  hospitals?: { id: number; name: string; slug: string } | null;
};

const SocialResponsibilityPage = () => {
  const { t } = useTranslation();
  const [activities, setActivities] = useState<CsrActivity[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [selectedHospitalId, setSelectedHospitalId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [activitiesRes, hospitalsRes] = await Promise.all([
          supabase
            .from('social_responsibility_activities')
            .select('*, hospitals:hospital_id(id, name, slug)')
            .eq('is_active', true)
            .order('display_order', { ascending: true })
            .order('event_date', { ascending: false, nullsFirst: false }),
          supabase
            .from('hospitals')
            .select('*')
            .order('display_order', { ascending: true }),
        ]);
        setActivities((activitiesRes.data as unknown as CsrActivity[]) || []);
        setHospitals(hospitalsRes.data || []);
      } catch (error) {
        console.error('Error fetching social responsibility activities:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Şube seçiliyken o şubenin etkinlikleri + tüm şubeler için girilen genel etkinlikler gösterilir
  const filteredActivities = useMemo(() => {
    if (!selectedHospitalId) return activities;
    return activities.filter(
      (a) => !a.hospital_id || a.hospital_id === selectedHospitalId,
    );
  }, [activities, selectedHospitalId]);

  const formatDate = (date?: string | null) => {
    if (!date) return null;
    try {
      return new Date(date).toLocaleDateString('tr-TR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return date;
    }
  };

  return (
    <>
      <Helmet>
        <title>{t('csr.pageTitle', 'Sosyal Sorumluluk Projeleri')} | Anadolu Hastaneleri Grubu</title>
        <meta
          name="description"
          content={t('csr.metaDescription', 'Koruyucu sağlık ve sağlığın geliştirilmesine yönelik sosyal sorumluluk projelerimiz ve etkinliklerimiz.')}
        />
      </Helmet>

      {/* ─── HERO ─── */}
      <section className="relative min-h-[420px] md:min-h-[480px] flex items-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1559027615-cd4628902d4a?ixlib=rb-4.0.3&auto=format&fit=crop&w=2400&q=80')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a1628]/95 via-[#0a1628]/80 to-[#0a1628]/50" />
        <div className="absolute left-0 top-0 h-full w-1 bg-green-500" />

        <div className="container-custom relative z-10 py-24">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl"
          >
            <div className="flex items-center gap-2 mb-6">
              <span className="block h-px w-10 bg-green-500" />
              <span className="text-green-500 text-xs uppercase tracking-[0.25em] font-semibold">
                {t('csr.heroTag', 'Toplumsal Değer')}
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-white leading-tight mb-6">
              {t('csr.heroTitle1', 'Sosyal Sorumluluk')}
              <br />
              <span className="text-green-500">{t('csr.heroTitle2', 'Projeleri')}</span>
            </h1>
            <p className="text-white/70 text-lg md:text-xl leading-relaxed max-w-xl">
              {t('csr.heroDesc', 'Koruyucu sağlık hizmetleri ve sağlığın geliştirilmesine yönelik etkinliklerimizle toplum sağlığına katkı sağlıyoruz.')}
            </p>
          </motion.div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 overflow-hidden">
          <svg viewBox="0 0 1440 60" preserveAspectRatio="none" className="w-full h-12 md:h-16 fill-gray-50">
            <polygon points="0,60 1440,0 1440,60" />
          </svg>
        </div>
      </section>

      {/* ─── ETKİNLİKLER ─── */}
      <section className="bg-gray-50 py-20 lg:py-28">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mb-10"
          >
            <div className="flex items-center gap-3 mb-5">
              <span className="block h-px w-[60px] bg-accent" />
              <span className="text-xs uppercase tracking-[0.25em] text-accent font-bold">
                {t('csr.activitiesTag', 'Etkinliklerimiz')}
              </span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-black text-secondary leading-tight mb-4">
              {t('csr.activitiesTitle', 'Koruyucu Sağlık ve Sağlığın Geliştirilmesine Yönelik Etkinlikler')}
            </h2>
            <p className="text-gray-500 text-lg">
              {t('csr.activitiesDesc', 'Şubelerimizin toplum sağlığını korumak ve geliştirmek amacıyla düzenlediği etkinlikler.')}
            </p>
          </motion.div>

          {/* Şube Seçimi */}
          {hospitals.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-10" role="group" aria-label={t('csr.selectBranch', 'Şube seçimi')}>
              <button
                onClick={() => setSelectedHospitalId(null)}
                aria-pressed={!selectedHospitalId}
                className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 ${
                  !selectedHospitalId
                    ? 'bg-primary text-white shadow-lg shadow-primary/20'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-primary hover:text-primary'
                }`}
              >
                {t('csr.allBranches', 'Tüm Şubeler')}
              </button>
              {hospitals.map((h) => (
                <button
                  key={h.id}
                  onClick={() => setSelectedHospitalId(Number(h.id))}
                  aria-pressed={selectedHospitalId === Number(h.id)}
                  className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 ${
                    selectedHospitalId === Number(h.id)
                      ? 'bg-primary text-white shadow-lg shadow-primary/20'
                      : 'bg-white text-gray-600 border border-gray-200 hover:border-primary hover:text-primary'
                  }`}
                >
                  {h.name}
                </button>
              ))}
            </div>
          )}

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
            </div>
          ) : filteredActivities.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-green-500/10 text-green-600 flex items-center justify-center text-2xl mx-auto mb-4">
                <FaHandHoldingMedical />
              </div>
              <h3 className="text-xl font-bold text-secondary mb-2">
                {t('csr.emptyTitle', 'Henüz etkinlik eklenmedi')}
              </h3>
              <p className="text-gray-500 text-sm max-w-md mx-auto">
                {t('csr.emptyDesc', 'Bu şube için yaklaşan etkinlikler yakında burada paylaşılacaktır. Lütfen daha sonra tekrar kontrol ediniz.')}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredActivities.map((activity, i) => (
                <motion.article
                  key={activity.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: Math.min(i, 5) * 0.08 }}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col"
                >
                  {activity.image && (
                    <div className="aspect-[16/9] overflow-hidden">
                      <img
                        src={activity.image}
                        alt={activity.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  )}
                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-4">
                      {activity.event_date && (
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-primary bg-primary/5 rounded-full px-3 py-1.5">
                          <FaCalendarAlt className="text-[10px]" />
                          {formatDate(activity.event_date)}
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-green-700 bg-green-500/10 rounded-full px-3 py-1.5">
                        <FaHospital className="text-[10px]" />
                        {activity.hospitals?.name || t('csr.allBranches', 'Tüm Şubeler')}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-secondary mb-2">
                      <AutoTranslate text={activity.title} />
                    </h3>
                    {activity.description && (
                      <p className="text-gray-500 text-sm leading-relaxed whitespace-pre-line">
                        <AutoTranslate text={activity.description} />
                      </p>
                    )}
                  </div>
                </motion.article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="bg-primary py-14">
        <div className="container-custom flex flex-col md:flex-row items-center justify-between gap-6">
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <p className="text-accent text-xs uppercase tracking-[0.2em] font-bold mb-2">
              {t('common.brand', 'Anadolu Hastaneleri Grubu')}
            </p>
            <h3 className="text-2xl md:text-3xl font-black text-white flex items-center gap-3">
              <FaHeart className="text-accent" />
              {t('csr.ctaTitle', 'Sosyal Sorumluluk Projelerimize Destek Olun')}
            </h3>
          </motion.div>
          <motion.a
            href="/iletisim"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex-shrink-0 inline-flex items-center gap-2 px-8 py-4 bg-accent text-white font-bold rounded-xl hover:brightness-110 transition-all"
          >
            {t('common.contactUs', 'İletişime Geçin')}
            <FaChevronRight className="text-sm" />
          </motion.a>
        </div>
      </section>
    </>
  );
};

export default SocialResponsibilityPage;
