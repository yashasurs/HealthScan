import React from 'react';
import { formatDate } from '../../../utils/dateUtils';

const CollectionStats = ({ collection, recordCount, onToggleSelectionMode, isSelectionMode }) => {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 sm:p-5">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8 text-sm text-gray-600">
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 rounded-full p-2">
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <span className="font-semibold text-gray-900">{recordCount} documents</span>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="bg-gray-100 rounded-full p-2">
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4m-8 0h8m-8 0V5a1 1 0 011-1h6a1 1 0 011 1v2M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2z" />
            </svg>
          </div>
          <span>Created {formatDate(collection.created_at)}</span>
        </div>
        
        {recordCount > 0 && (
          <div className="flex-1 flex justify-end">
            <button
              onClick={onToggleSelectionMode}
              className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border transition-all duration-200 ${
                isSelectionMode
                  ? 'text-red-700 bg-red-50 border-red-200 hover:bg-red-100 hover:border-red-300'
                  : 'text-blue-700 bg-blue-50 border-blue-200 hover:bg-blue-100 hover:border-blue-300'
              }`}
            >
              {isSelectionMode ? (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Cancel Selection
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Select Multiple
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CollectionStats;
