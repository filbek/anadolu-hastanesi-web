import { useTranslation } from 'react-i18next';
import { FaLayerGroup, FaPlus, FaTrash, FaArrowUp, FaArrowDown } from 'react-icons/fa';
import type { FloorPlan } from '../../lib/supabase';

interface Props {
  value: FloorPlan[];
  onChange: (next: FloorPlan[]) => void;
}

/**
 * Hastane formundaki "Kat Planları" bölümü. Her kart bir kat başlığı ve o
 * kattaki birimlerin listesidir (her satır bir birim). Kartlar Hastane İçi
 * Rehber sayfasında dizi sırasıyla gösterilir.
 */
const HospitalFloorPlansEditor = ({ value, onChange }: Props) => {
  const { t } = useTranslation();

  const update = (index: number, patch: Partial<FloorPlan>) =>
    onChange(value.map((f, i) => (i === index ? { ...f, ...patch } : f)));

  const add = () => onChange([...value, { floor: '', title: '', description: '' }]);

  const remove = (index: number) => {
    if (!confirm(t('admin.floorPlans.confirmDelete', 'Bu kat silinsin mi?'))) return;
    onChange(value.filter((_, i) => i !== index));
  };

  const move = (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= value.length) return;
    const next = [...value];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  const inputClass =
    'w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent';

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 lg:col-span-3">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-lg font-semibold text-primary flex items-center">
          <FaLayerGroup className="mr-2" />
          {t('admin.floorPlans.title', 'Kat Planları')}
        </h3>
        <button
          type="button"
          onClick={add}
          className="inline-flex items-center gap-2 px-3 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
        >
          <FaPlus />
          {t('admin.floorPlans.add', 'Kat Ekle')}
        </button>
      </div>
      <p className="text-sm text-gray-500 mb-4">
        {t(
          'admin.floorPlans.help',
          'Hastane İçi Rehber sayfasında bu hastane için gösterilir. Her kata bir başlık girin ve kattaki birimleri satır satır yazın. Kartlar aşağıdaki sırayla listelenir; sırayı okları kullanarak değiştirebilirsiniz.'
        )}
      </p>

      {value.length === 0 && (
        <p className="text-sm text-gray-400 border border-dashed border-gray-300 rounded-lg p-6 text-center">
          {t('admin.floorPlans.empty', 'Henüz kat eklenmedi.')}
        </p>
      )}

      <div className="space-y-4">
        {value.map((plan, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-[120px_1fr] gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('admin.floorPlans.floor', 'Kat')}
                </label>
                <input
                  type="text"
                  value={plan.floor}
                  onChange={(e) => update(index, { floor: e.target.value })}
                  className={inputClass}
                  placeholder="-2, Zemin, 3"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('admin.floorPlans.cardTitle', 'Başlık')}
                </label>
                <input
                  type="text"
                  value={plan.title}
                  onChange={(e) => update(index, { title: e.target.value })}
                  className={inputClass}
                  placeholder="3. Kat"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('admin.floorPlans.units', 'Kattaki Birimler (her satıra bir birim)')}
              </label>
              <textarea
                value={plan.description || ''}
                onChange={(e) => update(index, { description: e.target.value })}
                rows={5}
                className={inputClass}
                placeholder={'İç Hastalıkları Servisi\nMedikal Onkoloji\nHemşirelik Hizmetleri'}
              />
            </div>
            <div className="flex items-center gap-2 justify-end">
              <button
                type="button"
                onClick={() => move(index, -1)}
                disabled={index === 0}
                aria-label={t('admin.floorPlans.moveUp', 'Yukarı taşı')}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-30"
              >
                <FaArrowUp />
              </button>
              <button
                type="button"
                onClick={() => move(index, 1)}
                disabled={index === value.length - 1}
                aria-label={t('admin.floorPlans.moveDown', 'Aşağı taşı')}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-30"
              >
                <FaArrowDown />
              </button>
              <button
                type="button"
                onClick={() => remove(index)}
                aria-label={t('admin.floorPlans.remove', 'Katı sil')}
                className="p-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50"
              >
                <FaTrash />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HospitalFloorPlansEditor;
