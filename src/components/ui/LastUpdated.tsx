import { FaCalendarAlt } from 'react-icons/fa';

interface LastUpdatedProps {
  date: string;
  className?: string;
}

const LastUpdated = ({ date, className = '' }: LastUpdatedProps) => {
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
