import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FaSearch, FaTrash, FaHistory } from 'react-icons/fa';
import { useAuditLogs } from '../../hooks/useAuditLogs';
import { deleteOldAuditLogs } from '../../services/auditLogService';

const AdminAuditLogs = () => {
  const { t } = useTranslation();
  const [limit, setLimit] = useState(50);
  const { data: logs, isLoading, refetch } = useAuditLogs(limit);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleting, setDeleting] = useState(false);

  const filtered = (logs || []).filter(l =>
    l.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.entity_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    JSON.stringify(l.details || {}).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCleanOld = async () => {
    if (!confirm(t('admin.confirmCleanOldLogs', '90 günden eski logları silmek istediğinizden emin misiniz?'))) return;
    setDeleting(true);
    const { error } = await deleteOldAuditLogs(90);
    setDeleting(false);
    if (error) { alert(t('admin.deleteError', 'Silinirken hata oluştu!')); return; }
    await refetch();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-primary">{t('admin.auditLogs.title', 'Aktivite Logları')}</h1>
        <button onClick={handleCleanOld} disabled={deleting}
          className="px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 flex items-center disabled:opacity-50">
          {deleting && <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-red-600 mr-2"></div>}
          <FaTrash className="mr-2" /> {t('admin.auditLogs.cleanOld', '90+ Gün Temizle')}
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder={t('admin.searchPlaceholder', 'Ara...')} value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <select value={limit} onChange={(e) => setLimit(parseInt(e.target.value))}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
            <option value={50}>{t('admin.auditLogs.last50', 'Son 50')}</option>
            <option value={100}>{t('admin.auditLogs.last100', 'Son 100')}</option>
            <option value={200}>{t('admin.auditLogs.last200', 'Son 200')}</option>
            <option value={500}>{t('admin.auditLogs.last500', 'Son 500')}</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('admin.label.date', 'Tarih')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('admin.label.action', 'İşlem')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('admin.label.type', 'Tip')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('admin.label.id', 'ID')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('admin.label.detail', 'Detay')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((log) => (
              <tr key={log.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                  {new Date(log.created_at).toLocaleString('tr-TR')}
                </td>
                <td className="px-6 py-4">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    log.action.includes('DELETE') ? 'bg-red-100 text-red-700' :
                    log.action.includes('CREATE') ? 'bg-green-100 text-green-700' :
                    log.action.includes('UPDATE') ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {log.action}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{log.entity_type}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{log.entity_id || '-'}</td>
                <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                  {JSON.stringify(log.details || {})}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4"><FaHistory className="mx-auto" /></div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">{t('admin.auditLogs.notFound', 'Log bulunamadı')}</h3>
          <p className="text-gray-500">
            {searchTerm ? t('admin.searchNoResults', 'Arama kriterlerinize uygun log bulunamadı.') : t('admin.auditLogs.empty', 'Henüz hiç aktivite logu bulunmamaktadır.')}
          </p>
        </div>
      )}
    </div>
  );
};

export default AdminAuditLogs;
