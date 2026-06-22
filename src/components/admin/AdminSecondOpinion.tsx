import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FaEnvelope,
  FaTrash,
  FaEye,
  FaCheck,
  FaSearch,
  FaPhone,
  FaHospital,
  FaCalendar,
  FaPaperPlane,
  FaTimes,
} from 'react-icons/fa';
import { supabase } from '../../lib/supabase';

interface SecondOpinionSubmission {
  id: number;
  name: string;
  email: string;
  phone: string;
  hospital: string | null;
  message: string;
  file_url: string | null;
  consent: boolean;
  is_read: boolean;
  created_at: string;
}

const AdminSecondOpinion = () => {
  const { t } = useTranslation();
  const [submissions, setSubmissions] = useState<SecondOpinionSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRead, setFilterRead] = useState<'all' | 'read' | 'unread'>('all');
  const [selectedSubmission, setSelectedSubmission] = useState<SecondOpinionSubmission | null>(null);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('second_opinion_submissions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSubmissions(data || []);
    } catch (error) {
      console.error('Error fetching submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: number) => {
    try {
      const { error } = await supabase
        .from('second_opinion_submissions')
        .update({ is_read: true })
        .eq('id', id);

      if (error) throw error;
      setSubmissions(submissions.map(s => s.id === id ? { ...s, is_read: true } : s));
      if (selectedSubmission?.id === id) {
        setSelectedSubmission({ ...selectedSubmission, is_read: true });
      }
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const deleteSubmission = async (id: number) => {
    if (!confirm(t('admin.confirmDelete', 'Bu kaydı silmek istediğinizden emin misiniz?'))) return;

    try {
      const { error } = await supabase
        .from('second_opinion_submissions')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setSubmissions(submissions.filter(s => s.id !== id));
      if (selectedSubmission?.id === id) setSelectedSubmission(null);
    } catch (error) {
      console.error('Error deleting submission:', error);
      alert(t('admin.deleteError', 'Silinirken hata oluştu!'));
    }
  };

  const filteredSubmissions = submissions.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.phone.includes(searchTerm);
    const matchesFilter =
      filterRead === 'all' ||
      (filterRead === 'read' && s.is_read) ||
      (filterRead === 'unread' && !s.is_read);
    return matchesSearch && matchesFilter;
  });

  const unreadCount = submissions.filter((s) => !s.is_read).length;

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-primary">İkinci Görüş Başvuruları</h1>
          <p className="text-gray-500 text-sm mt-1">
            {unreadCount > 0 ? (
              <span className="text-red-600 font-medium">{unreadCount} okunmamış başvuru</span>
            ) : (
              'Tüm başvurular okundu'
            )}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="İsim, email veya telefon ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <select
            value={filterRead}
            onChange={(e) => setFilterRead(e.target.value as 'all' | 'read' | 'unread')}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="all">Tüm Başvurular</option>
            <option value="unread">Okunmamış</option>
            <option value="read">Okunmuş</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {filteredSubmissions.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">
              <FaEnvelope />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm || filterRead !== 'all'
                ? 'Arama kriterlerine uygun başvuru bulunamadı'
                : 'Henüz hiç başvuru yok'}
            </h3>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Durum
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    İsim
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Telefon
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hastane
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tarih
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredSubmissions.map((submission) => (
                  <tr
                    key={submission.id}
                    className={`hover:bg-gray-50 transition-colors ${!submission.is_read ? 'bg-blue-50/30' : ''}`}
                  >
                    <td className="px-4 py-3 whitespace-nowrap">
                      {submission.is_read ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <FaCheck className="mr-1" /> Okundu
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          <FaEnvelope className="mr-1" /> Yeni
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`text-sm font-medium ${!submission.is_read ? 'text-secondary' : 'text-gray-700'}`}>
                        {submission.name}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                      {submission.email}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                      {submission.phone}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                      {submission.hospital || '-'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(submission.created_at)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        {!submission.is_read && (
                          <button
                            onClick={() => markAsRead(submission.id)}
                            className="text-blue-600 hover:text-blue-800 transition-colors"
                            title="Okundu olarak işaretle"
                          >
                            <FaCheck />
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedSubmission(submission)}
                          className="text-gray-600 hover:text-primary transition-colors"
                          title="Detay görüntüle"
                        >
                          <FaEye />
                        </button>
                        <button
                          onClick={() => deleteSubmission(submission.id)}
                          className="text-red-600 hover:text-red-800 transition-colors"
                          title="Sil"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-secondary">Başvuru Detayı</h2>
              <button
                onClick={() => setSelectedSubmission(null)}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FaTimes />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center gap-2 mb-4">
                {selectedSubmission.is_read ? (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    <FaCheck className="mr-1" /> Okundu
                  </span>
                ) : (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    <FaEnvelope className="mr-1" /> Yeni Başvuru
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <FaPaperPlane className="text-primary" />
                  <div>
                    <p className="text-xs text-gray-500">İsim</p>
                    <p className="font-medium text-secondary">{selectedSubmission.name}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <FaEnvelope className="text-primary" />
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="font-medium text-secondary">{selectedSubmission.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <FaPhone className="text-primary" />
                  <div>
                    <p className="text-xs text-gray-500">Telefon</p>
                    <p className="font-medium text-secondary">{selectedSubmission.phone}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <FaHospital className="text-primary" />
                  <div>
                    <p className="text-xs text-gray-500">Hastane</p>
                    <p className="font-medium text-secondary">{selectedSubmission.hospital || '-'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg md:col-span-2">
                  <FaCalendar className="text-primary" />
                  <div>
                    <p className="text-xs text-gray-500">Başvuru Tarihi</p>
                    <p className="font-medium text-secondary">{formatDate(selectedSubmission.created_at)}</p>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <p className="text-xs text-gray-500 mb-2">Mesaj</p>
                <div className="p-4 bg-gray-50 rounded-lg text-gray-700 whitespace-pre-wrap">
                  {selectedSubmission.message}
                </div>
              </div>

              {selectedSubmission.file_url && (
                <div className="mt-4">
                  <p className="text-xs text-gray-500 mb-2">Ekli Dosya</p>
                  <a
                    href={selectedSubmission.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                  >
                    <FaPaperPlane />
                    Dosyayı Görüntüle
                  </a>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
              {!selectedSubmission.is_read && (
                <button
                  onClick={() => markAsRead(selectedSubmission.id)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <FaCheck /> Okundu Olarak İşaretle
                </button>
              )}
              <button
                onClick={() => {
                  setSelectedSubmission(null);
                  deleteSubmission(selectedSubmission.id);
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
              >
                <FaTrash /> Sil
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSecondOpinion;
