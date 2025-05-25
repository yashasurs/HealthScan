import React from 'react';

const TabNav = ({ activeTab, setActiveTab, fetchCollections, fetchRecords, selectedCollection, isLoading }) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <div className="flex border-b">
        <button 
          className={`py-2 px-4 font-medium ${activeTab === 'upload' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('upload')}
        >
          Upload Documents
        </button>
        <button 
          className={`py-2 px-4 font-medium ${activeTab === 'records' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('records')}
        >
          View Documents
        </button>
      </div>
      
      {/* Refresh button */}
      <button 
        onClick={() => {
          fetchCollections();
          if (selectedCollection) fetchRecords(selectedCollection);
        }}
        className="flex items-center px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-gray-600"
        disabled={isLoading}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        Refresh
      </button>
    </div>
  );
};

export default TabNav;
