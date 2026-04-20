import { useState } from 'react';
import { FaSave, FaGlobe, FaPlus, FaTrash, FaQuestionCircle, FaListUl, FaTimeline } from 'react-icons/fa';

const AdminHealthTourism = () => {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const [content, setContent] = useState({
        hero: {
            title: 'Türkiye\'de Şifa Yolculuğunuz',
            subtitle: 'Premium sağlık hizmetleri ve tam kapsamlı seyahat desteğiyle yanınızdayız.',
            image: 'https://images.unsplash.com/photo-1576091160550-217359f42f8c?auto=format&fit=crop&w=1200'
        },
        whyChooseUs: [
            { id: 1, title: 'Son Teknoloji', description: 'En modern tıbbi cihazlarla donatılmış hastaneler.' },
            { id: 2, title: 'Uzman Kadro', description: 'Dünya çapında deneyimli profesör ve doktorlar.' }
        ],
        faqs: [
            { id: 1, question: 'Ulaşım desteği sağlıyor musunuz?', answer: 'Evet, havalimanı transferleri tarafımızca ayarlanmaktadır.' }
        ]
    });

    const handleSave = async () => {
        setLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            setMessage({ type: 'success', text: 'Sağlık Turizmi ayarları kaydedildi!' });
        } catch (error) {
            setMessage({ type: 'error', text: 'Kaydedilirken bir hata oluştu.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 pb-20">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                    <FaGlobe className="mr-3 text-primary" /> Sağlık Turizmi Yönetimi
                </h1>
                <button
                    onClick={handleSave}
                    disabled={loading}
                    className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark transition-colors flex items-center disabled:opacity-50"
                >
                    {loading ? 'Kaydediliyor...' : <><FaSave className="mr-2" /> Kaydet</>}
                </button>
            </div>

            {message.text && (
                <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {message.text}
                </div>
            )}

            {/* Tabs / Modules */}
            <div className="grid grid-cols-1 gap-6">
                {/* Why Choose Us */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-lg font-semibold mb-6 flex items-center text-gray-700">
                        <FaListUl className="mr-2 text-primary" /> Neden Bizi Seçmelisiniz?
                    </h2>
                    <div className="space-y-4">
                        {content.whyChooseUs.map((item, idx) => (
                            <div key={item.id} className="flex gap-4 items-start border-b border-gray-50 pb-4 last:border-0">
                                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <input
                                        type="text"
                                        value={item.title}
                                        placeholder="Başlık"
                                        onChange={(e) => {
                                            const newList = [...content.whyChooseUs];
                                            newList[idx].title = e.target.value;
                                            setContent({ ...content, whyChooseUs: newList });
                                        }}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-primary"
                                    />
                                    <input
                                        type="text"
                                        value={item.description}
                                        placeholder="Açıklama"
                                        onChange={(e) => {
                                            const newList = [...content.whyChooseUs];
                                            newList[idx].description = e.target.value;
                                            setContent({ ...content, whyChooseUs: newList });
                                        }}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-primary"
                                    />
                                </div>
                                <button className="text-red-500 p-2 mt-1"><FaTrash /></button>
                            </div>
                        ))}
                        <button className="mt-4 flex items-center text-sm font-medium text-primary hover:text-primary-dark">
                            <FaPlus className="mr-1" /> Yeni Madde Ekle
                        </button>
                    </div>
                </div>

                {/* FAQs */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-lg font-semibold mb-6 flex items-center text-gray-700">
                        <FaQuestionCircle className="mr-2 text-primary" /> Sık Sorulan Sorular
                    </h2>
                    <div className="space-y-4">
                        {content.faqs.map((faq, idx) => (
                            <div key={faq.id} className="space-y-3 border-b border-gray-50 pb-4 last:border-0">
                                <div className="flex justify-between">
                                    <input
                                        type="text"
                                        value={faq.question}
                                        placeholder="Soru"
                                        className="flex-1 font-medium px-2 py-1 outline-none border-b border-transparent focus:border-primary"
                                    />
                                    <button className="text-red-500"><FaTrash /></button>
                                </div>
                                <textarea
                                    value={faq.answer}
                                    placeholder="Cevap"
                                    rows={2}
                                    className="w-full p-2 text-sm text-gray-600 bg-gray-50 rounded border border-gray-100 outline-none focus:ring-1 focus:ring-primary"
                                />
                            </div>
                        ))}
                        <button className="mt-4 text-sm font-medium text-primary hover:text-primary-dark">
                            + Soru Ekle
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminHealthTourism;
