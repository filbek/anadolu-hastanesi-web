import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex justify-center items-center min-h-[400px] w-full">
      <div
        className="w-12 h-12 border-4 border-gray-200 border-t-primary rounded-full animate-spin"
        role="status"
      >
        <span className="sr-only">Yükleniyor...</span>
      </div>
    </div>
  );
};

export default LoadingSpinner;