import { useState, useEffect } from 'react';
import { useSupabase } from '../../contexts/SupabaseContext';

type Appointment = {
  id: number;
  doctor_name: string;
  department: string;
  hospital: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
};

const UserAppointments = () => {
  const { user } = useSupabase();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // This is a mock function - in a real app, you would fetch from Supabase
    const fetchAppointments = async () => {
      setLoading(true);
      
      // Mock data for demonstration
      const mockAppointments: Appointment[] = [
        {
          id: 1,
          doctor_name: 'Prof. Dr. Ahmet Yılmaz',
          department: 'Kardiyoloji',
          hospital: 'Anadolu Merkez Hastanesi',
          date: '2023-10-15',
          time: '14:30',
          status: 'confirmed',
        },
        {
          id: 2,
          doctor_name: 'Doç. Dr. Ayşe Kaya',
          department: 'Nöroloji',
          hospital: 'Anadolu Avrupa Hastanesi',
          date: '2023-09-20',
          time: '10:00',
          status: 'completed',
        },
        {
          id: 3,
          doctor_name: 'Uzm. Dr. Mehmet Demir',
          department: 'Ortopedi',
          hospital: 'Anadolu Merkez Hastanesi',
          date: '2023-10-25',
          time: '16:15',
          status: 'pending',
        },
      ];
      
      setTimeout(() => {
        setAppointments(mockAppointments);
        setLoading(false);
      }, 1000);
    };

    if (user) {
      fetchAppointments();
    }
  }, [user]);

  const getStatusBadge = (status: Appointment['status']) => {
    switch (status) {
      case 'pending':
        return <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">Bekliyor</span>;
      case 'confirmed':
        return <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Onaylandı</span>;
      case 'completed':
        return <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">Tamamlandı</span>;
      case 'cancelled':
        return <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">İptal Edildi</span>;
      default:
        return null;
    }
  };

  if (!user) {
    return (
      <div className="card p-6">
        <p className="text-center text-text-light">Lütfen giriş yapın.</p>
      </div>
    );
  }

  return (
    <div className="card p-6">
      <h2 className="text-2xl font-semibold text-primary mb-6">Randevularım</h2>
      
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : appointments.length === 0 ? (
        <div className="text-center py-8">
          <i className="bi bi-calendar-x text-4xl text-text-light mb-4"></i>
          <p className="text-text-light">Henüz randevunuz bulunmamaktadır.</p>
          <a
            href="https://anadoluhastaneleri.kendineiyibak.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary mt-4"
          >
            Randevu Al
          </a>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-neutral">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-light uppercase tracking-wider">
                  Doktor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-light uppercase tracking-wider">
                  Bölüm
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-light uppercase tracking-wider">
                  Hastane
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-light uppercase tracking-wider">
                  Tarih & Saat
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-light uppercase tracking-wider">
                  Durum
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-text-light uppercase tracking-wider">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {appointments.map((appointment) => (
                <tr key={appointment.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-text">{appointment.doctor_name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-text-light">{appointment.department}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-text-light">{appointment.hospital}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-text-light">
                      {new Date(appointment.date).toLocaleDateString('tr-TR')} {appointment.time}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(appointment.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    {appointment.status === 'pending' || appointment.status === 'confirmed' ? (
                      <button className="text-red-600 hover:text-red-900 text-sm font-medium">
                        İptal Et
                      </button>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default UserAppointments;
