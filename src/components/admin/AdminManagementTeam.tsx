import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaUser, FaEye, FaEyeSlash } from 'react-icons/fa';
import { supabase } from '../../lib/supabase';
import type { ManagementTeamMember, Doctor, Hospital } from '../../lib/supabase';

interface MemberWithDoctor extends ManagementTeamMember {
  doctor?: Doctor | null;
}

const roleLabels: Record<string, string> = {
  board: 'Üst Yönetim',
  chief_physician: 'Başhekim',
  assistant_chief: 'Başhekim Yardımcısı',
  health_care_manager: 'Sağlık Bakım Hizm. Müdürü',
  it_unit: 'IT Birimi',
  general_manager_deputy: 'Genel Müdür Yd.',
  financial_affairs_manager: 'Mali İşler Müdürü',
  hospitality_services_manager: 'Otelcilik Hizmetleri Müdürü',
  quality_management_manager: 'Kalite Yönetim Müdürü',
  administrative: 'İdari Yönetim',
};

const roleBadgeColors: Record<string, string> = {
  board: 'bg-purple-100 text-purple-700',
  chief_physician: 'bg-blue-100 text-blue-700',
  assistant_chief: 'bg-cyan-100 text-cyan-700',
  administrative: 'bg-green-100 text-green-700',
};

/** Hastaneye bağlı olmayan (grup geneli) üyeler için kullanılan anahtar */
const GROUP_KEY = 'group';

const hospitalKey = (hospitalId: ManagementTeamMember['hospital_id']) =>
  hospitalId === null || hospitalId === undefined || hospitalId === '' ? GROUP_KEY : String(hospitalId);

const AdminManagementTeam = () => {
  const { t } = useTranslation();
  const [members, setMembers] = useState<MemberWithDoctor[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedHospital, setSelectedHospital] = useState('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [{ data, error }, { data: hospitalData, error: hospitalError }] = await Promise.all([
        supabase
          .from('management_team')
          .select(`
            *,
            doctor:doctor_id(id, name, title, image, department_id)
          `)
          .order('display_order', { ascending: true })
          .order('created_at', { ascending: true }),
        supabase
          .from('hospitals')
          .select('id, name, slug, display_order')
          .order('display_order', { ascending: true }),
      ]);

      if (error) throw error;
      if (hospitalError) throw hospitalError;

      setMembers(data || []);
      setHospitals((hospitalData || []) as Hospital[]);
    } catch (error) {
      console.error('Error fetching management team:', error);
    } finally {
      setLoading(false);
    }
  };

  const hospitalName = (hospitalId: ManagementTeamMember['hospital_id']) => {
    const key = hospitalKey(hospitalId);
    if (key === GROUP_KEY) return 'Grup Yönetimi (hastane seçilmemiş)';
    return hospitals.find(h => String(h.id) === key)?.name || `Hastane #${key}`;
  };

  const deleteMember = async (id: number) => {
    if (!confirm(t('admin.confirmDelete', 'Bu kaydı silmek istediğinizden emin misiniz?'))) return;

    try {
      const { error } = await supabase.from('management_team').delete().eq('id', id);
      if (error) throw error;
      setMembers(members.filter(m => m.id !== id));
      alert(t('admin.deleted', 'Kayıt başarıyla silindi!'));
    } catch (error) {
      console.error('Error deleting member:', error);
      alert(t('admin.deleteError', 'Silinirken hata oluştu!'));
    }
  };

  const toggleStatus = async (id: number, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('management_team')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) {
        console.error('Supabase error details:', error);
        alert(t('admin.statusError', 'Durum güncellenirken hata oluştu!'));
        return;
      }

      setMembers(members.map(m =>
        m.id === id ? { ...m, is_active: !currentStatus } : m
      ));
    } catch (error: any) {
      console.error('Error toggling status:', error);
      alert(t('admin.statusError', 'Durum güncellenirken hata oluştu!'));
    }
  };

  const getMemberImage = (member: MemberWithDoctor) => {
    if (member.doctor?.image) return member.doctor.image;
    if (member.image) return member.image;
    return null;
  };

  const filteredMembers = members.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (member.department || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'all' || member.role === selectedRole;
    const matchesHospital = selectedHospital === 'all' || hospitalKey(member.hospital_id) === selectedHospital;
    return matchesSearch && matchesRole && matchesHospital;
  });

  // Hastane bazında grupla: önce grup geneli, sonra hastaneler (display_order sırasıyla)
  const groups: { key: string; label: string; members: MemberWithDoctor[] }[] = [
    { key: GROUP_KEY, label: 'Grup Yönetimi (hastane seçilmemiş)' },
    ...hospitals.map(h => ({ key: String(h.id), label: h.name })),
  ]
    .map(group => ({
      ...group,
      members: filteredMembers.filter(m => hospitalKey(m.hospital_id) === group.key),
    }))
    .filter(group => group.members.length > 0);

  // Silinmiş/bilinmeyen hastaneye bağlı kayıtlar kaybolmasın
  const groupedIds = new Set(groups.flatMap(g => g.members.map(m => m.id)));
  const ungrouped = filteredMembers.filter(m => !groupedIds.has(m.id));
  if (ungrouped.length > 0) {
    groups.push({ key: 'unknown', label: 'Bilinmeyen Hastane', members: ungrouped });
  }

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
        <h1 className="text-2xl font-semibold text-primary">{t('admin.managementTeam.title', 'Yönetim Ekibi')}</h1>
        <Link
          to="/admin/management-team/new"
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors flex items-center"
        >
          <FaPlus className="mr-2" />
          {t('admin.managementTeam.new', 'Yeni Üye')}
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={t('admin.managementTeam.searchPlaceholder', 'İsim, unvan veya bölüm ara...')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="all">{t('admin.allRoles', 'Tüm Roller')}</option>
            <option value="board">{roleLabels.board}</option>
            <option value="chief_physician">{roleLabels.chief_physician}</option>
            <option value="assistant_chief">{roleLabels.assistant_chief}</option>
            <option value="administrative">{roleLabels.administrative}</option>
          </select>
          <select
            value={selectedHospital}
            onChange={(e) => setSelectedHospital(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="all">Tüm Hastaneler</option>
            <option value={GROUP_KEY}>Grup Yönetimi (hastane seçilmemiş)</option>
            {hospitals.map(h => (
              <option key={h.id} value={String(h.id)}>{h.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Members Grid – hastane bazında gruplu */}
      {groups.map((group) => (
        <div key={group.key} className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-lg font-semibold text-gray-800">{group.label}</h2>
            <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
              {group.members.length} kişi
            </span>
            <span className="flex-1 h-px bg-gray-200" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {group.members.map((member) => {
          const memberImage = getMemberImage(member);
          return (
            <div key={member.id} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                  {memberImage ? (
                    <img
                      src={memberImage}
                      alt={member.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <FaUser className="text-primary text-2xl" />
                  )}
                </div>
                <div className="flex space-x-2 items-center">
                  <button
                    onClick={() => toggleStatus(member.id, !!member.is_active)}
                    className={`transition-colors ${member.is_active !== false ? 'text-green-600 hover:text-green-800' : 'text-gray-400 hover:text-gray-600'}`}
                    title={member.is_active !== false ? t('admin.deactivate', 'Pasif yap') : t('admin.activate', 'Aktif yap')}
                  >
                    {member.is_active !== false ? <FaEye /> : <FaEyeSlash />}
                  </button>
                  <Link
                    to={`/admin/management-team/edit/${member.id}`}
                    className="text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    <FaEdit />
                  </Link>
                  <button
                    onClick={() => deleteMember(member.id)}
                    className="text-red-600 hover:text-red-800 transition-colors"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between mb-1">
                <h3 className="text-lg font-semibold text-primary">{member.name}</h3>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${member.is_active !== false ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                  {member.is_active !== false ? t('admin.active', 'Aktif') : t('admin.inactive', 'Pasif')}
                </span>
              </div>

              <p className="text-gray-600 text-sm mb-2">{member.title}</p>

              <div className="space-y-1 mb-4">
                <span className={`inline-block text-xs px-2 py-1 rounded-full ${roleBadgeColors[member.role] || 'bg-gray-100 text-gray-700'}`}>
                  {roleLabels[member.role] || member.role}
                </span>
                <span
                  className={`inline-block text-xs px-2 py-1 rounded-full ml-1 ${hospitalKey(member.hospital_id) === GROUP_KEY
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-indigo-100 text-indigo-700'
                    }`}
                >
                  {hospitalName(member.hospital_id)}
                </span>
                {member.department && (
                  <span className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full ml-1">
                    {member.department}
                  </span>
                )}
                {member.doctor_id && (
                  <span className="inline-block bg-orange-100 text-orange-700 text-xs px-2 py-1 rounded-full ml-1">
                    Doktor: {member.doctor?.name || 'Bağlı'}
                  </span>
                )}
              </div>

              <div className="text-xs text-gray-500">
                Sıra: {member.display_order || 0}
              </div>
            </div>
          );
        })}
          </div>
        </div>
      ))}

      {filteredMembers.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">👔</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">{t('admin.managementTeam.notFound', 'Kayıt bulunamadı')}</h3>
          <p className="text-gray-500 mb-4">
            {searchTerm || selectedRole !== 'all' || selectedHospital !== 'all'
              ? t('admin.searchNoResults', 'Arama kriterlerinize uygun kayıt bulunamadı.')
              : t('admin.managementTeam.empty', 'Henüz hiç yönetim ekibi üyesi eklenmemiş.')}
          </p>
          <Link
            to="/admin/management-team/new"
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors inline-flex items-center"
          >
            <FaPlus className="mr-2" />
            {t('admin.managementTeam.addFirst', 'İlk Üyeyi Ekle')}
          </Link>
        </div>
      )}
    </div>
  );
};

export default AdminManagementTeam;
