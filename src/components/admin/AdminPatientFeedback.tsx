import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FaSearch, FaEnvelopeOpen, FaEnvelope, FaTrash, FaCheck, FaReply, FaStickyNote } from 'react-icons/fa';
import { getPatientFeedback, updatePatientFeedback, deletePatientFeedback, PatientFeedback } from '../../services/patientFeedbackService';

const AdminPatientFeedback = () => {
  const { t } = useTranslation();
  const [items, setItems] = useState<PatientFeedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'unread' | 'unresponded'>('all');
  const [sourceFilter, setSourceFilter] = useState<'all' | 'hasta' | 'personel'>('all');
  const [noteId, setNoteId] = useState<number | null>(null);
  const [noteText, setNoteText] = useState('');

  const loadItems = async () => {
    setLoading(true);
    const data = await getPatientFeedback();
    setItems(data);
    setLoading(false);
  };

  useEffect(() => { loadItems(); }, []);

  const filtered = items.filter(i => {
    const matchesSearch = i.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (i.email || '').toLowerCase().includes(searchTerm.toLowerCase());
    // Eski kayıtlarda source olmayabilir → 'hasta' varsayılır
    const rowSource = i.source || 'hasta';
    const matchesSource = sourceFilter === 'all' || rowSource === sourceFilter;
    if (!matchesSource) return false;
    if (filter === 'unread') return matchesSearch && !i.is_read;
    if (filter === 'unresponded') return matchesSearch && !i.is_responded;
    return matchesSearch;
  });

  const markAsRead = async (id: number, read: boolean) => {
    const { error } = await updatePatientFeedback(id, { is_read: read });
    if (error) { alert(t('admin.updateError', 'Güncellenirken hata oluştu!')); return; }
    await loadItems();
  };

  const markAsResponded = async (id: number, responded: boolean) => {
    const { error } = await updatePatientFeedback(id, { is_responded: responded });
    if (error) { alert(t('admin.updateError', 'Güncellenirken hata oluştu!')); return; }
    await loadItems();
  };

  const saveNote = async (id: number) => {
    const { error } = await updatePatientFeedback(id, { admin_notes: noteText });
    if (error) { alert(t('admin.noteSaveError', 'Not kaydedilirken hata oluştu!')); return; }
    setNoteId(null);
    setNoteText('');
    await loadItems();
  };

  const handleDelete = async (id: number) => {
    if (!confirm(t('admin.confirmDeleteFeedback', 'Bu geri bildirimi silmek istediğinizden emin misiniz?'))) return;
    const { error } = await deletePatientFeedback(id);
    if (error) { alert(t('admin.deleteError', 'Silinirken hata oluştu!')); return; }
    await loadItems();
  };

  const unreadCount = items.filter(i => !i.is_read).length;
  const unrespondedCount = items.filter(i => !i.is_responded).length;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-primary">{t('admin.patientFeedback.title', 'Hasta Geri Bildirimleri')}</h1>
        <div className="flex gap-2">
          <span className="bg-red-100 text-red-700 text-xs px-3 py-1.5 rounded-full font-medium">
            {unreadCount} {t('admin.patientFeedback.unread', 'Okunmamış')}
          </span>
          <span className="bg-orange-100 text-orange-700 text-xs px-3 py-1.5 rounded-full font-medium">
            {unrespondedCount} {t('admin.patientFeedback.unresponded', 'Cevapsız')}
          </span>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder={t('admin.searchPlaceholder', 'Ara...')} value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <select value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value as any)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
            <option value="all">{t('admin.feedbackSourceAll', 'Tüm Kaynaklar')}</option>
            <option value="hasta">{t('admin.feedbackSourcePatient', 'Hasta')}</option>
            <option value="personel">{t('admin.feedbackSourceEmployee', 'Çalışan')}</option>
          </select>
          <select value={filter} onChange={(e) => setFilter(e.target.value as any)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
            <option value="all">{t('admin.all', 'Tümü')}</option>
            <option value="unread">{t('admin.unread', 'Okunmamış')}</option>
            <option value="unresponded">{t('admin.unresponded', 'Cevapsız')}</option>
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {filtered.map((item) => (
          <div key={item.id} className={`bg-white rounded-lg shadow-sm p-6 ${!item.is_read ? 'border-l-4 border-primary' : ''}`}>
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center flex-wrap gap-2 mb-2">
                  <h3 className="font-semibold text-gray-900">{item.name}</h3>
                  {(item.source || 'hasta') === 'personel'
                    ? <span className="bg-indigo-100 text-indigo-700 text-xs px-2 py-0.5 rounded-full font-medium">{t('admin.feedbackSourceEmployee', 'Çalışan')}</span>
                    : <span className="bg-sky-100 text-sky-700 text-xs px-2 py-0.5 rounded-full font-medium">{t('admin.feedbackSourcePatient', 'Hasta')}</span>}
                  {!item.is_read && <span className="bg-primary text-white text-xs px-2 py-0.5 rounded-full">{t('admin.new', 'Yeni')}</span>}
                  {item.is_responded && <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full">{t('admin.answered', 'Cevaplandı')}</span>}
                </div>
                <div className="flex flex-wrap gap-3 text-sm text-gray-500 mb-3">
                  {item.email && <span>{item.email}</span>}
                  {item.phone && <span>{item.phone}</span>}
                  {item.subject && <span className="font-medium text-gray-700">{t('admin.label.subject', 'Konu')}: {item.subject}</span>}
                  <span>{new Date(item.created_at).toLocaleString('tr-TR')}</span>
                </div>
                <p className="text-gray-700 leading-relaxed bg-gray-50 rounded-lg p-4">{item.message}</p>
                {item.admin_notes && (
                  <div className="mt-3 bg-yellow-50 rounded-lg p-3 text-sm text-yellow-800">
                    <strong>{t('admin.label.adminNote', 'Admin Notu')}:</strong> {item.admin_notes}
                  </div>
                )}
              </div>
              <div className="flex md:flex-col gap-2">
                <button onClick={() => markAsRead(item.id, !item.is_read)}
                  className={`p-2 rounded-lg flex items-center gap-2 text-sm ${item.is_read ? 'text-gray-500 hover:bg-gray-100' : 'text-primary hover:bg-primary/10'}`}>
                  {item.is_read ? <FaEnvelopeOpen /> : <FaEnvelope />}
                  <span className="hidden md:inline">{item.is_read ? t('admin.markUnread', 'Okunmadı') : t('admin.markRead', 'Okundu')}</span>
                </button>
                <button onClick={() => markAsResponded(item.id, !item.is_responded)}
                  className={`p-2 rounded-lg flex items-center gap-2 text-sm ${item.is_responded ? 'text-gray-500 hover:bg-gray-100' : 'text-green-600 hover:bg-green-50'}`}>
                  {item.is_responded ? <FaCheck /> : <FaReply />}
                  <span className="hidden md:inline">{item.is_responded ? t('admin.cancelAnswer', 'Cevap İptal') : t('admin.markAnswered', 'Cevaplandı')}</span>
                </button>
                <button onClick={() => { setNoteId(item.id); setNoteText(item.admin_notes || ''); }}
                  className="p-2 rounded-lg flex items-center gap-2 text-sm text-orange-600 hover:bg-orange-50">
                  <FaStickyNote />
                  <span className="hidden md:inline">{t('admin.note', 'Not')}</span>
                </button>
                <button onClick={() => handleDelete(item.id)}
                  className="p-2 rounded-lg flex items-center gap-2 text-sm text-red-600 hover:bg-red-50">
                  <FaTrash />
                  <span className="hidden md:inline">{t('admin.delete', 'Sil')}</span>
                </button>
              </div>
            </div>

            {noteId === item.id && (
              <div className="mt-4 bg-gray-50 rounded-lg p-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('admin.label.adminNote', 'Admin Notu')}</label>
                <textarea value={noteText} rows={2}
                  onChange={(e) => setNoteText(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary mb-2" />
                <div className="flex gap-2">
                  <button onClick={() => saveNote(item.id)} className="px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary-dark">{t('admin.save', 'Kaydet')}</button>
                  <button onClick={() => setNoteId(null)} className="px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-100">{t('admin.cancel', 'İptal')}</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📬</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">{t('admin.patientFeedback.notFound', 'Geri bildirim bulunamadı')}</h3>
          <p className="text-gray-500">
            {searchTerm || filter !== 'all' ? t('admin.searchNoResults', 'Arama kriterlerinize uygun geri bildirim bulunamadı.') : t('admin.patientFeedback.empty', 'Henüz hiç geri bildirim alınmamış.')}
          </p>
        </div>
      )}
    </div>
  );
};

export default AdminPatientFeedback;
