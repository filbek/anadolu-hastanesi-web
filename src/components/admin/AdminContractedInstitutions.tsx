import { useState, useEffect, useMemo } from 'react';
import { FaHandshake, FaPlus, FaSave, FaTrash, FaFileImport, FaArrowUp, FaArrowDown } from 'react-icons/fa';
import { useHospitals } from '../../hooks/useHospitals';
import {
  getContractedByHospital,
  createContractedInstitution,
  updateContractedInstitution,
  deleteContractedInstitution,
  bulkInsertContractedInstitutions,
  type ContractedInstitution,
} from '../../services/contractedInstitutionService';
import { contractedInstitutions as staticData } from '../../data/contractedInstitutions';

type EditableRow = ContractedInstitution & { itemsText: string };

const itemsFromText = (text: string): string[] =>
  text.split('\n').map((s) => s.trim()).filter(Boolean);

const AdminContractedInstitutions = () => {
  const { data: hospitals = [] } = useHospitals();
  const [activeHospitalId, setActiveHospitalId] = useState<number | null>(null);
  const [rows, setRows] = useState<EditableRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState<number | 'new' | null>(null);
  const [importing, setImporting] = useState(false);

  // İlk hastaneyi seç
  useEffect(() => {
    if (activeHospitalId === null && hospitals.length > 0) {
      setActiveHospitalId(Number(hospitals[0].id));
    }
  }, [hospitals, activeHospitalId]);

  const activeHospital = useMemo(
    () => hospitals.find((h: any) => Number(h.id) === activeHospitalId),
    [hospitals, activeHospitalId]
  );

  const loadRows = async (hospitalId: number) => {
    setLoading(true);
    const data = await getContractedByHospital(hospitalId);
    setRows(data.map((r) => ({ ...r, itemsText: (r.items || []).join('\n') })));
    setLoading(false);
  };

  useEffect(() => {
    if (activeHospitalId !== null) loadRows(activeHospitalId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeHospitalId]);

  const updateRow = (index: number, patch: Partial<EditableRow>) => {
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, ...patch } : r)));
  };

  const addRow = () => {
    if (activeHospitalId === null) return;
    const maxOrder = rows.reduce((m, r) => Math.max(m, r.display_order || 0), 0);
    setRows((prev) => [
      ...prev,
      {
        id: 0,
        hospital_id: activeHospitalId,
        category: '',
        items: [],
        itemsText: '',
        display_order: maxOrder + 1,
        is_active: true,
        created_at: '',
      },
    ]);
  };

  const saveRow = async (index: number) => {
    const row = rows[index];
    if (!row.category.trim()) {
      alert('Kategori adı boş olamaz.');
      return;
    }
    setSavingId(row.id || 'new');
    const payload = {
      hospital_id: row.hospital_id,
      category: row.category.trim(),
      items: itemsFromText(row.itemsText),
      display_order: row.display_order || 0,
      is_active: row.is_active,
    };
    if (row.id && row.id > 0) {
      await updateContractedInstitution(row.id, payload);
    } else {
      await createContractedInstitution(payload);
    }
    setSavingId(null);
    if (activeHospitalId !== null) loadRows(activeHospitalId);
  };

  const removeRow = async (index: number) => {
    const row = rows[index];
    if (row.id && row.id > 0) {
      if (!confirm(`"${row.category}" kategorisini silmek istediğinize emin misiniz?`)) return;
      await deleteContractedInstitution(row.id);
      if (activeHospitalId !== null) loadRows(activeHospitalId);
    } else {
      setRows((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const moveRow = async (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= rows.length) return;
    const a = rows[index];
    const b = rows[target];
    // display_order değerlerini takas et ve kaydet
    const aOrder = a.display_order;
    const bOrder = b.display_order;
    updateRow(index, { display_order: bOrder });
    updateRow(target, { display_order: aOrder });
    if (a.id > 0) await updateContractedInstitution(a.id, { display_order: bOrder });
    if (b.id > 0) await updateContractedInstitution(b.id, { display_order: aOrder });
    if (activeHospitalId !== null) loadRows(activeHospitalId);
  };

  const importFromStatic = async () => {
    if (!activeHospital || activeHospitalId === null) return;
    const staticCats = staticData[(activeHospital as any).slug] || [];
    if (staticCats.length === 0) {
      alert('Bu şube için içe aktarılacak hazır liste bulunmuyor.');
      return;
    }
    if (!confirm(`${staticCats.length} kategori "${(activeHospital as any).name}" şubesine eklenecek. Devam edilsin mi?`)) return;
    setImporting(true);
    const payload = staticCats.map((c, idx) => ({
      hospital_id: activeHospitalId,
      category: c.category,
      items: c.items,
      display_order: idx + 1,
      is_active: true,
    }));
    await bulkInsertContractedInstitutions(payload);
    setImporting(false);
    loadRows(activeHospitalId);
  };

  const totalInstitutions = rows.reduce((sum, r) => sum + itemsFromText(r.itemsText).length, 0);
  const hasStaticForActive = !!(activeHospital && (staticData[(activeHospital as any).slug]?.length ?? 0) > 0);

  return (
    <div>
      {/* Başlık */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-lg">
            <FaHandshake />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-primary">Anlaşmalı Kurumlar</h1>
            <p className="text-sm text-gray-500">Şube bazlı anlaşmalı kurum kategorilerini yönetin.</p>
          </div>
        </div>
        <button
          onClick={addRow}
          disabled={activeHospitalId === null}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors flex items-center gap-2 disabled:opacity-50"
        >
          <FaPlus /> Kategori Ekle
        </button>
      </div>

      {/* Şube sekmeleri */}
      <div className="flex flex-wrap gap-2 mb-6">
        {hospitals.map((h: any) => (
          <button
            key={h.id}
            onClick={() => setActiveHospitalId(Number(h.id))}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeHospitalId === Number(h.id)
                ? 'bg-primary text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {h.name}
          </button>
        ))}
      </div>

      {/* Özet + içe aktar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <p className="text-sm text-gray-500">
          {rows.length} kategori · {totalInstitutions} kurum
        </p>
        {rows.length === 0 && hasStaticForActive && (
          <button
            onClick={importFromStatic}
            disabled={importing}
            className="text-sm bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <FaFileImport /> {importing ? 'İçe aktarılıyor...' : 'Hazır listeden içe aktar'}
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : rows.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center text-gray-400">
          <FaHandshake className="text-4xl mx-auto mb-3 opacity-30" />
          <p>Bu şube için henüz kategori eklenmemiş. "Kategori Ekle" ile başlayabilirsiniz.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {rows.map((row, index) => (
            <div key={row.id || `new-${index}`} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <input
                  type="text"
                  value={row.category}
                  onChange={(e) => updateRow(index, { category: e.target.value })}
                  placeholder="Kategori adı (ör. Eğitim Kurumları)"
                  className="flex-1 min-w-[200px] px-3 py-2 border border-gray-300 rounded-lg font-semibold text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <div className="flex items-center gap-1">
                  <button onClick={() => moveRow(index, -1)} disabled={index === 0} className="p-2 text-gray-400 hover:text-primary disabled:opacity-30" title="Yukarı taşı">
                    <FaArrowUp />
                  </button>
                  <button onClick={() => moveRow(index, 1)} disabled={index === rows.length - 1} className="p-2 text-gray-400 hover:text-primary disabled:opacity-30" title="Aşağı taşı">
                    <FaArrowDown />
                  </button>
                </div>
                <label className="flex items-center gap-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={row.is_active}
                    onChange={(e) => updateRow(index, { is_active: e.target.checked })}
                  />
                  Yayında
                </label>
              </div>

              <label className="block text-xs font-medium text-gray-500 mb-1">
                Kurumlar (her satıra bir kurum)
              </label>
              <textarea
                value={row.itemsText}
                onChange={(e) => updateRow(index, { itemsText: e.target.value })}
                rows={Math.min(Math.max(itemsFromText(row.itemsText).length + 1, 4), 20)}
                placeholder={'Örnek Kurum A\nÖrnek Kurum B'}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary font-mono"
              />

              <div className="flex items-center justify-between mt-3">
                <span className="text-xs text-gray-400">{itemsFromText(row.itemsText).length} kurum</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => removeRow(index)}
                    className="px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <FaTrash /> Sil
                  </button>
                  <button
                    onClick={() => saveRow(index)}
                    disabled={savingId !== null}
                    className="px-4 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    <FaSave /> Kaydet
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminContractedInstitutions;
