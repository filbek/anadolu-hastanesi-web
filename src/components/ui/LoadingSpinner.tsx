import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex justify-center items-center">
      <div
        className="w-12 h-12 border-4 border-t-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"
        role="status"
      >
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  );
};

export default LoadingSpinner;