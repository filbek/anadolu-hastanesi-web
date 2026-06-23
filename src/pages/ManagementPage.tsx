import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import {
  FaUserTie,
  FaUserMd,
  FaBriefcaseMedical,
  FaChevronRight,
  FaCrown,
  FaSpinner,
} from 'react-icons/fa';
import { supabase } from '../lib/supabase';
import type { ManagementTeamMember, Doctor } from '../lib/supabase';
import LastUpdated from '../components/ui/LastUpdated';

/* ─── Avatar helper ─── */
const avatar = (name: string) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=1e3a5f&color=fff&size=400&bold=true`;

interface MemberWithDoctor extends ManagementTeamMember {
  doctor?: Doctor | null;
}

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5 },
};

const roleSectionMeta: Record<string, { label: string; title: string; highlight: string; icon: React.ReactNode }> = {
  board: {
    label: 'Üst Yönetim',
    title: 'Yönetim',
    highlight: 'Kurulu',
    icon: <FaCrown />,
  },
  chief_physician: {
    label: 'Tıbbi Yönetim',
    title: 'Başhekimlik',
    highlight: 'Kadrosu',
    icon: <FaUserMd />,
  },
  assistant_chief: {
    label: 'Tıbbi Yönetim',
    title: 'Başhekimlik',
    highlight: 'Kadrosu',
    icon: <FaUserMd />,
  },
  health_care_manager: {
    label: 'İdari Yönetim',
    title: 'İdari ve Hizmet',
    highlight: 'Yönetimi',
    icon: <FaBriefcaseMedical />,
  },
  it_unit: {
    label: 'İdari Yönetim',
    title: 'İdari ve Hizmet',
    highlight: 'Yönetimi',
    icon: <FaBriefcaseMedical />,
  },
  general_manager_deputy: {
    label: 'İdari Yönetim',
    title: 'İdari ve Hizmet',
    highlight: 'Yönetimi',
    icon: <FaBriefcaseMedical />,
  },
  financial_affairs_manager: {
    label: 'İdari Yönetim',
    title: 'İdari ve Hizmet',
    highlight: 'Yönetimi',
    icon: <FaBriefcaseMedical />,
  },
  hospitality_services_manager: {
    label: 'İdari Yönetim',
    title: 'İdari ve Hizmet',
    highlight: 'Yönetimi',
    icon: <FaBriefcaseMedical />,
  },
  quality_management_manager: {
    label: 'İdari Yönetim',
    title: 'İdari ve Hizmet',
    highlight: 'Yönetimi',
    icon: <FaBriefcaseMedical />,
  },
  administrative: {
    label: 'İdari Yönetim',
    title: 'İdari ve Hizmet',
    highlight: 'Yönetimi',
    icon: <FaBriefcaseMedical />,
  },
};

const ManagementPage = () => {
  const { t } = useTranslation();
  const [members, setMembers] = useState<MemberWithDoctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchManagementTeam();
  }, []);

  const fetchManagementTeam = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('management_team')
        .select(`
          *,
          doctor:doctor_id(id, name, title, image, department_id)
        `)
        .eq('is_active', true)
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMembers(data || []);
    } catch (err: any) {
      console.error('Error fetching management team:', err);
      setError(err?.message || 'Yönetim ekibi yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const getMemberImage = (member: MemberWithDoctor): string => {
    if (member.doctor?.image) return member.doctor.image;
    if (member.image) return member.image;
    return avatar(member.name);
  };

  const boardMembers = members.filter(m => m.role === 'board');
  const chiefPhysicians = members.filter(m => m.role === 'chief_physician');
  const assistantChiefs = members.filter(m => m.role === 'assistant_chief');

  const adminRoles = [
    'administrative',
    'health_care_manager',
    'it_unit',
    'general_manager_deputy',
    'financial_affairs_manager',
    'hospitality_services_manager',
    'quality_management_manager',
  ];
  const adminMembers = members.filter(m => adminRoles.includes(m.role));

  const hasMedical = chiefPhysicians.length > 0 || assistantChiefs.length > 0;
  const hasAdmin = adminMembers.length > 0;

  return (
    <>
      <Helmet>
        <title>{t('management.pageTitle', 'Yönetim Kadromuz')} | Anadolu Hastaneleri Grubu</title>
        <meta
          name="description"
          content={t('management.metaDescription', 'Anadolu Hastaneleri Grubu yönetim kadrosu ve hastane yönetim ekibi.')}
        />
      </Helmet>

      {/* ─── HERO ─── */}
      <section className="relative min-h-[480px] md:min-h-[520px] flex items-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2400&q=80')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a1628]/95 via-[#0a1628]/80 to-[#0a1628]/50" />
        <div className="absolute left-0 top-0 h-full w-1 bg-accent" />

        <div className="container-custom relative z-10 py-24">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl"
          >
            <div className="flex items-center gap-2 mb-6">
              <span className="block h-px w-10 bg-accent" />
              <span className="text-accent text-xs uppercase tracking-[0.25em] font-semibold">
                Kurumsal
              </span>
            </div>

            <h1 className="text-4xl md:text-6xl font-black text-white leading-tight mb-6">
              Yönetim
              <br />
              <span className="text-accent">Kadromuz</span>
            </h1>

            <p className="text-white/70 text-lg md:text-xl leading-relaxed max-w-xl">
              Anadolu Hastaneleri Grubu olarak, uzman ve deneyimli yönetim kadromuzla sağlık
              hizmetlerinde sürdürülebilir kalite ve hasta memnuniyetini önceliklendiriyoruz.
            </p>
          </motion.div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 overflow-hidden">
          <svg viewBox="0 0 1440 60" preserveAspectRatio="none" className="w-full h-12 md:h-16 fill-gray-50">
            <polygon points="0,60 1440,0 1440,60" />
          </svg>
        </div>
      </section>

      {/* ─── LOADING / ERROR ─── */}
      {loading && (
        <section className="bg-gray-50 py-20">
          <div className="container-custom flex flex-col items-center justify-center">
            <FaSpinner className="animate-spin text-primary text-4xl mb-4" />
            <p className="text-gray-600">Yönetim ekibi yükleniyor...</p>
          </div>
        </section>
      )}

      {error && !loading && (
        <section className="bg-gray-50 py-20">
          <div className="container-custom text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={fetchManagementTeam}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
            >
              Tekrar Dene
            </button>
          </div>
        </section>
      )}

      {!loading && !error && members.length === 0 && (
        <section className="bg-gray-50 py-20">
          <div className="container-custom text-center">
            <p className="text-gray-500 text-lg">Henüz yönetim ekibi bilgisi eklenmemiş.</p>
          </div>
        </section>
      )}

      {/* ─── BAŞKAN VEKİLİ / ÜST YÖNETİM ─── */}
      {!loading && boardMembers.length > 0 && (
        <section className="bg-gray-50 py-20 lg:py-28">
          <div className="container-custom">
            <motion.div {...fadeUp} className="flex items-center gap-3 mb-12">
              <span className="block h-px flex-1 bg-gray-200 max-w-[60px]" />
              <span className="text-xs uppercase tracking-[0.25em] text-primary font-bold">
                {roleSectionMeta.board.label}
              </span>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {boardMembers.map((member, idx) => (
                <motion.div
                  key={member.id}
                  {...fadeUp}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className="max-w-sm mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100"
                >
                  <div className="h-32 bg-primary relative">
                    <div className="absolute -bottom-16 left-1/2 -translate-x-1/2">
                      <div className="w-36 h-36 rounded-full border-[5px] border-white shadow-xl overflow-hidden bg-gray-100">
                        <img
                          src={getMemberImage(member)}
                          alt={member.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                    <div className="absolute top-4 right-4 text-white/20 text-4xl">
                      {roleSectionMeta.board.icon}
                    </div>
                  </div>
                  <div className="pt-20 pb-8 px-6 text-center">
                    <h3 className="text-xl font-bold text-secondary mb-1">{member.name}</h3>
                    <p className="text-primary font-semibold text-sm mb-2">{member.title}</p>
                    {member.department && (
                      <p className="text-gray-500 text-sm">{member.department}</p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── TIBBİ YÖNETİM ─── */}
      {!loading && hasMedical && (
        <section className="bg-white py-20 lg:py-28">
          <div className="container-custom">
            <motion.div {...fadeUp} className="flex items-center gap-3 mb-6">
              <span className="block h-px flex-1 bg-gray-200 max-w-[60px]" />
              <span className="text-xs uppercase tracking-[0.25em] text-primary font-bold">
                Tıbbi Yönetim
              </span>
            </motion.div>

            <motion.h2 {...fadeUp} className="text-3xl md:text-4xl font-black text-secondary mb-12">
              Başhekimlik <span className="text-primary">Kadrosu</span>
            </motion.h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Başhekim(ler) - öne çıkan */}
              {chiefPhysicians.map((member, idx) => (
                <motion.div
                  key={member.id}
                  {...fadeUp}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className="md:col-span-2 lg:col-span-2 bg-primary rounded-2xl p-8 md:p-10 flex flex-col md:flex-row items-center gap-6 md:gap-8 text-white shadow-xl"
                >
                  <div className="w-40 h-40 md:w-44 md:h-44 rounded-full border-[5px] border-white/20 overflow-hidden flex-shrink-0 shadow-lg">
                    <img
                      src={getMemberImage(member)}
                      alt={member.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="text-center md:text-left">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-xs font-bold mb-3">
                      <FaUserMd />
                      {member.title}
                    </div>
                    <h3 className="text-2xl font-bold mb-1">{member.name}</h3>
                    {member.department && <p className="text-white/80 text-lg">{member.department}</p>}
                  </div>
                </motion.div>
              ))}

              {/* Başhekim Yardımcıları */}
              {assistantChiefs.map((member, idx) => (
                <motion.div
                  key={member.id}
                  {...fadeUp}
                  transition={{ duration: 0.5, delay: (chiefPhysicians.length + idx) * 0.1 }}
                  className="bg-gray-50 rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition-shadow duration-300 flex flex-col items-center text-center"
                >
                  <div className="w-32 h-32 rounded-full border-[5px] border-white shadow-lg overflow-hidden mb-4">
                    <img
                      src={getMemberImage(member)}
                      alt={member.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[11px] font-bold mb-2">
                    <FaUserMd />
                    {member.title}
                  </div>
                  <h3 className="text-base font-bold text-secondary mb-1">{member.name}</h3>
                  {member.department && <p className="text-gray-500 text-sm">{member.department}</p>}
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── İDARİ YÖNETİM ─── */}
      {!loading && hasAdmin && (
        <section className="bg-gray-50 py-20 lg:py-28">
          <div className="container-custom">
            <motion.div {...fadeUp} className="flex items-center gap-3 mb-6">
              <span className="block h-px flex-1 bg-gray-200 max-w-[60px]" />
              <span className="text-xs uppercase tracking-[0.25em] text-primary font-bold">
                İdari Yönetim
              </span>
            </motion.div>

            <motion.h2 {...fadeUp} className="text-3xl md:text-4xl font-black text-secondary mb-12">
              İdari ve Hizmet <span className="text-primary">Yönetimi</span>
            </motion.h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {adminMembers.map((member, idx) => {
                const isEmpty = member.name === '—' || member.name === '-' || member.name.toLowerCase().includes('açık');
                return (
                  <motion.div
                    key={member.id}
                    {...fadeUp}
                    transition={{ duration: 0.5, delay: idx * 0.07 }}
                    className={`rounded-2xl p-6 border transition-all duration-300 flex flex-col items-center text-center ${isEmpty
                        ? 'bg-white/60 border-dashed border-gray-200 text-gray-400'
                        : 'bg-white border-gray-100 hover:shadow-lg'
                      }`}
                  >
                    <div
                      className={`w-32 h-32 rounded-full border-[5px] overflow-hidden mb-4 ${isEmpty ? 'border-gray-200 bg-gray-100' : 'border-white shadow-lg'
                        }`}
                    >
                      {!isEmpty ? (
                        <img
                          src={getMemberImage(member)}
                          alt={member.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                          <FaBriefcaseMedical size={28} />
                        </div>
                      )}
                    </div>

                    <div
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold mb-2 ${isEmpty ? 'bg-gray-100 text-gray-400' : 'bg-ocean-50 text-ocean-600'
                        }`}
                    >
                      {isEmpty ? <FaBriefcaseMedical /> : <FaUserTie />}
                      {member.title}
                    </div>

                    <h3
                      className={`text-base font-bold mb-1 ${isEmpty ? 'text-gray-400' : 'text-secondary'
                        }`}
                    >
                      {isEmpty ? 'Pozisyon Açık' : member.name}
                    </h3>

                    {member.department && (
                      <p className="text-gray-500 text-sm">{member.department}</p>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ─── BOTTOM CTA STRIP ─── */}
      <section className="bg-primary py-14">
        <div className="container-custom flex flex-col md:flex-row items-center justify-between gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-accent text-xs uppercase tracking-[0.2em] font-bold mb-2">
              {t('common.brand', 'Anadolu Hastaneleri Grubu')}
            </p>
            <h3 className="text-2xl md:text-3xl font-black text-white">
              {t('common.ctaTitle', '"Herşey Sağlığınız İçin..."')}
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

      <section className="bg-white py-6 border-t border-gray-100">
        <div className="container-custom">
          <LastUpdated date="22.06.2026" />
        </div>
      </section>
    </>
  );
};

export default ManagementPage;
