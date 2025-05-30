import React from 'react';
import { useNavigate } from 'react-router-dom';

const EmptyState = () => {
  const navigate = useNavigate();
  return (
    <div className="text-center py-20 sm:py-24 px-4">
      <div className="w-32 h-32 sm:w-36 sm:h-36 mx-auto mb-8 text-gray-300">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>      <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3 sm:mb-4">No documents yet</h3>
      <p className="text-gray-500 mb-8 sm:mb-10 max-w-md mx-auto text-sm sm:text-base px-4 leading-relaxed">
        This collection is empty. Add documents to organize your content better.
      </p>
      <button
        onClick={() => navigate('/upload')}
        className="inline-flex items-center gap-2 sm:gap-3 text-blue-600 hover:text-blue-800 font-medium transition-colors text-sm sm:text-base"
      >
        <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <span className="hidden xs:inline">Browse Documents</span>
        <span className="xs:hidden">Browse</span>
        <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
};

export default EmptyState;
