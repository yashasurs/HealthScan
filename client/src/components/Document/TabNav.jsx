import React from 'react';

const TabNav = ({ activeTab, setActiveTab, fetchCollections, fetchRecords, selectedCollection, isLoading }) => {
  return (
    <div className="px-6 py-4">
      <div className="flex justify-between items-center">
        {/* Tab Buttons */}
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button 
            className={`relative px-6 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
              activeTab === 'upload' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
            onClick={() => setActiveTab('upload')}
          >
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <span>Upload</span>
            </div>
          </button>
          <button 
            className={`relative px-6 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
              activeTab === 'records' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
            onClick={() => setActiveTab('records')}
          >
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Library</span>
            </div>
          </button>
        </div>
        
        {/* Action Buttons */}
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => {
              fetchCollections();
              if (selectedCollection) fetchRecords(selectedCollection);
            }}
            className={`flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={isLoading}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span className="text-sm font-medium">
              {isLoading ? 'Refreshing...' : 'Refresh'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TabNav;
