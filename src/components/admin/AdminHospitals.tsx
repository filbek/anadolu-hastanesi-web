import React from 'react';

const AdminHospitals: React.FC = () => {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-800">Hastane Yönetimi</h1>
      <p className="mt-2 text-gray-600">
        Bu bölümde hastaneleri yönetebilir, yeni hastane ekleyebilir, mevcutları güncelleyebilir veya silebilirsiniz.
      </p>
      {/* Buraya hastane listesi, ekleme formu vb. gelecek */}
    </div>
  );
};

export default AdminHospitals;
