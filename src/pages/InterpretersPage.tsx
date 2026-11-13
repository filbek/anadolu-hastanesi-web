import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { FaPhoneAlt, FaWhatsapp, FaLanguage, FaSpinner } from 'react-icons/fa';
import { supabase } from '../lib/supabase';
import type { Interpreter } from '../lib/interpreters';
import { splitLanguages, formatPhone, telHref, whatsappHref } from '../lib/interpreters';

/**
 * Tercüman / danışman listesi — hastane bankolarındaki görseldeki QR kod bu
 * sayfayı açar. Sitede hiçbir yerden bağlantı verilmez; arama motorlarına kapalı.
 * Okuyanlar çoğunlukla yabancı hastalar olduğundan sayfa metinleri burada,
 * sitedeki 8 dilin hepsinde tutulur (dil, ziyaretçinin ülkesine göre seçilir).
 */
type Copy = {
  title: string;
  subtitle: string;
  call: string;
  whatsapp: string;
  empty: string;
  error: string;
  retry: string;
};

const COPY: Record<string, Copy> = {
  tr: {
    title: 'Tercüman ve Danışman Desteği',
    subtitle: 'Dilinizi konuşan danışmanımıza telefon veya WhatsApp ile hemen ulaşabilirsiniz.',
    call: 'Ara',
    whatsapp: 'WhatsApp',
    empty: 'Şu anda listelenecek danışman bulunmuyor. Lütfen bankodaki personelimize başvurun.',
    error: 'Liste yüklenemedi.',
    retry: 'Tekrar dene',
  },
  en: {
    title: 'Interpreter & Patient Advisor Support',
    subtitle: 'Reach an advisor who speaks your language instantly by phone or WhatsApp.',
    call: 'Call',
    whatsapp: 'WhatsApp',
    empty: 'No advisors are listed at the moment. Please ask our staff at the desk.',
    error: 'The list could not be loaded.',
    retry: 'Try again',
  },
  ru: {
    title: 'Помощь переводчика и консультанта',
    subtitle: 'Свяжитесь с консультантом, говорящим на вашем языке, по телефону или WhatsApp.',
    call: 'Позвонить',
    whatsapp: 'WhatsApp',
    empty: 'Сейчас в списке нет консультантов. Пожалуйста, обратитесь к сотрудникам на стойке.',
    error: 'Не удалось загрузить список.',
    retry: 'Повторить',
  },
  ar: {
    title: 'دعم المترجمين ومستشاري المرضى',
    subtitle: 'تواصل فوراً مع مستشار يتحدث لغتك عبر الهاتف أو واتساب.',
    call: 'اتصال',
    whatsapp: 'واتساب',
    empty: 'لا يوجد مستشارون في القائمة حالياً. يرجى مراجعة موظفينا في المكتب.',
    error: 'تعذر تحميل القائمة.',
    retry: 'إعادة المحاولة',
  },
  de: {
    title: 'Dolmetscher- und Patientenberatung',
    subtitle: 'Erreichen Sie sofort einen Berater, der Ihre Sprache spricht – per Telefon oder WhatsApp.',
    call: 'Anrufen',
    whatsapp: 'WhatsApp',
    empty: 'Derzeit sind keine Berater aufgeführt. Bitte wenden Sie sich an unser Personal am Schalter.',
    error: 'Die Liste konnte nicht geladen werden.',
    retry: 'Erneut versuchen',
  },
  fr: {
    title: 'Interprètes et conseillers patients',
    subtitle: 'Contactez immédiatement un conseiller qui parle votre langue, par téléphone ou WhatsApp.',
    call: 'Appeler',
    whatsapp: 'WhatsApp',
    empty: 'Aucun conseiller n’est disponible pour le moment. Veuillez vous adresser au personnel de l’accueil.',
    error: 'Impossible de charger la liste.',
    retry: 'Réessayer',
  },
  es: {
    title: 'Intérpretes y asesores de pacientes',
    subtitle: 'Contacte de inmediato con un asesor que habla su idioma por teléfono o WhatsApp.',
    call: 'Llamar',
    whatsapp: 'WhatsApp',
    empty: 'No hay asesores en la lista en este momento. Consulte con nuestro personal en el mostrador.',
    error: 'No se pudo cargar la lista.',
    retry: 'Reintentar',
  },
  bg: {
    title: 'Преводачи и консултанти за пациенти',
    subtitle: 'Свържете се веднага с консултант, който говори вашия език, по телефон или WhatsApp.',
    call: 'Обаждане',
    whatsapp: 'WhatsApp',
    empty: 'В момента няма консултанти в списъка. Моля, обърнете се към служителите на гишето.',
    error: 'Списъкът не можа да бъде зареден.',
    retry: 'Опитай отново',
  },
};

const InterpretersPage = () => {
  const { i18n } = useTranslation();
  const lang = (i18n.language || 'tr').slice(0, 2);
  const c = COPY[lang] || COPY.en;
  const isRtl = lang === 'ar';

  const [items, setItems] = useState<Interpreter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      setError(false);
      const { data, error } = await supabase
        .from('interpreters')
        .select('id, name, languages, phone, display_order, is_active')
        .eq('is_active', true)
        .order('display_order', { ascending: true })
        .order('name', { ascending: true });
      if (error) throw error;
      setItems((data || []) as Interpreter[]);
    } catch (err) {
      console.error('Error fetching interpreters:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <>
      <Helmet>
        <title>{c.title} | Anadolu Hastaneleri Grubu</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div dir={isRtl ? 'rtl' : 'ltr'} className="bg-gray-50 min-h-screen pt-[72px]">
        <section className="bg-primary text-white">
          <div className="container-custom py-10 md:py-14">
            <div className="flex items-start gap-4">
              <span className="flex-shrink-0 w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center text-2xl">
                <FaLanguage aria-hidden="true" />
              </span>
              <div>
                <h1 className="text-2xl md:text-4xl font-black leading-tight">{c.title}</h1>
                <p className="mt-2 text-white/80 md:text-lg max-w-2xl">{c.subtitle}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="container-custom py-8 md:py-12">
          {loading ? (
            <div className="flex justify-center py-16">
              <FaSpinner className="animate-spin text-primary text-3xl" aria-label="…" />
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <p className="text-red-600 mb-4">{c.error}</p>
              <button
                type="button"
                onClick={load}
                className="px-6 py-2 bg-primary text-white rounded-lg hover:brightness-110"
              >
                {c.retry}
              </button>
            </div>
          ) : items.length === 0 ? (
            <p className="text-center text-gray-500 py-16">{c.empty}</p>
          ) : (
            <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map((item) => {
                const langs = splitLanguages(item.languages);
                return (
                  <li
                    key={item.id}
                    className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col"
                  >
                    <h2 className="text-lg font-bold text-secondary">{item.name}</h2>
                    {langs.length > 0 && (
                      <ul className="mt-3 flex flex-wrap gap-2" aria-label={c.title}>
                        {langs.map((l) => (
                          <li
                            key={l}
                            className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold"
                          >
                            {l}
                          </li>
                        ))}
                      </ul>
                    )}
                    {item.phone && (
                      <>
                        <p className="mt-4 text-gray-700 font-semibold tracking-wide" dir="ltr">
                          {formatPhone(item.phone)}
                        </p>
                        <div className="mt-4 grid grid-cols-2 gap-2">
                          <a
                            href={telHref(item.phone)}
                            className="inline-flex items-center justify-center gap-2 min-h-[44px] rounded-xl bg-primary text-white font-bold text-sm hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary"
                            aria-label={`${c.call}: ${item.name}`}
                          >
                            <FaPhoneAlt aria-hidden="true" />
                            {c.call}
                          </a>
                          <a
                            href={whatsappHref(item.phone)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-2 min-h-[44px] rounded-xl bg-[#1f8f4e] text-white font-bold text-sm hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1f8f4e]"
                            aria-label={`${c.whatsapp}: ${item.name}`}
                          >
                            <FaWhatsapp aria-hidden="true" className="text-base" />
                            {c.whatsapp}
                          </a>
                        </div>
                      </>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </>
  );
};

export default InterpretersPage;
