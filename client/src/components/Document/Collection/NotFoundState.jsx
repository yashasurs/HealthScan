import React from 'react';
import { useNavigate } from 'react-router-dom';

const NotFoundState = () => {
  const navigate = useNavigate();
  return (
    <div className="max-w-4xl mx-auto p-6 sm:p-8">
      <div className="text-center py-20 sm:py-24 px-4">
        <div className="w-32 h-32 sm:w-36 sm:h-36 mx-auto mb-8 text-gray-300">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4 sm:mb-5">Collection not found</h3>
        <p className="text-gray-500 mb-8 sm:mb-10 max-w-md mx-auto leading-relaxed">The collection you're looking for doesn't exist or has been removed.</p>
        <button
          onClick={() => navigate('/collections')}
          className="inline-flex items-center gap-2 sm:gap-3 px-4 py-2.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 font-medium transition-all duration-200 rounded-lg border border-transparent hover:border-blue-200"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Collections
        </button>
      </div>
    </div>
  );
};

export default NotFoundState;
