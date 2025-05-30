import React from 'react';

const SelectionToolbar = ({
  isSelectionMode,
  selectedRecordIds,
  totalRecords,
  onSelectAll,
  onClearSelection,
  onBatchMove,
  onBatchRemove
}) => {
  if (!isSelectionMode) return null;
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 sm:p-5 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
          <span className="text-sm font-semibold text-blue-900">
            {selectedRecordIds.length} of {totalRecords} records selected
          </span>
          
          <div className="flex gap-3">
            <button
              onClick={onSelectAll}
              className="inline-flex items-center gap-2 text-sm font-medium text-blue-700 hover:text-blue-900 transition-colors px-3 py-1.5 rounded-md hover:bg-blue-100"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Select All
            </button>
            
            <button
              onClick={onClearSelection}
              className="inline-flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors px-3 py-1.5 rounded-md hover:bg-gray-100"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Clear Selection
            </button>
          </div>
        </div>
        
        {selectedRecordIds.length > 0 && (
          <div className="flex gap-3">
            <button
              onClick={onBatchMove}
              className="inline-flex items-center gap-2 px-4 py-2 text-blue-700 bg-blue-100 border border-blue-300 hover:bg-blue-200 hover:border-blue-400 font-medium transition-all duration-200 text-sm rounded-lg"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
              <span className="hidden sm:inline">Move to Collection</span>
              <span className="sm:hidden">Move</span>
            </button>
            <button
              onClick={onBatchRemove}
              className="inline-flex items-center gap-2 text-red-600 hover:text-red-800 font-medium transition-colors text-xs sm:text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span className="hidden sm:inline">Remove from Collection</span>
              <span className="sm:hidden">Remove</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SelectionToolbar;
