import { FaCalendarAlt } from 'react-icons/fa';

interface LastUpdatedProps {
  /** Verilmezse sitenin son yayın (derleme) tarihi gösterilir; her güncellemede kendiliğinden yenilenir. */
  date?: string;
  className?: string;
}

const LastUpdated = ({ date = __BUILD_DATE__, className = '' }: LastUpdatedProps) => {
  return (
    <div
      className={`inline-flex items-center gap-2 text-xs font-medium text-gray-400 bg-gray-50 border border-gray-100 rounded-lg px-3 py-1.5 ${className}`}
      aria-label={`Son güncelleme tarihi: ${date}`}
    >
      <FaCalendarAlt className="text-accent text-[10px]" />
      <span>Son Güncelleme: {date}</span>
    </div>
  );
};

export default LastUpdated;
