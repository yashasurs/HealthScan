import React from 'react';
import LoadingSpinner from '../LoadingSpinner';

const RecordsTab = ({ 
  collections, 
  selectedCollection, 
  handleCollectionChange,
  searchQuery,
  setSearchQuery,
  isLoading,
  filteredRecords,
  records,
  selectedDocument,
  setSelectedDocument,
  setViewingRecord
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">View Documents</h2>
      
      {/* Collection selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Select Collection
        </label>
        <select
          className="w-full p-2 border rounded-md focus:ring focus:ring-blue-200"
          value={selectedCollection}
          onChange={handleCollectionChange}
        >
          <option value="">-- Select a Collection --</option>
          {collections.map(collection => (
            <option key={collection.id} value={collection.id}>
              {collection.name}
            </option>
          ))}
        </select>
      </div>
      
      {/* Search box - only shown if collection is selected */}
      {selectedCollection && !isLoading && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Search Documents
          </label>
          <div className="flex">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by filename or content..."
              className="flex-grow p-2 border rounded-l-md focus:ring focus:ring-blue-200 focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="bg-gray-200 hover:bg-gray-300 px-4 rounded-r-md flex items-center justify-center"
                type="button"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            )}
          </div>
          {records.length > 0 && filteredRecords.length < records.length && searchQuery && (
            <p className="text-xs text-gray-500 mt-1">
              Showing {filteredRecords.length} of {records.length} documents
            </p>
          )}
        </div>
      )}
      
      {/* Records list */}
      {selectedCollection ? (
        isLoading ? (
          <div className="flex justify-center items-center py-10">
            <LoadingSpinner size="lg" />
          </div>
        ) : filteredRecords.length > 0 ? (
          <div className="space-y-4">
            {filteredRecords.map(record => (
              <div key={record.id} className="border rounded-md p-4 hover:shadow-md transition-shadow duration-200">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium">{record.filename}</h3>
                    <p className="text-sm text-gray-500 mb-2">
                      Size: {Math.round(record.file_size / 1024)} KB • 
                      Type: {record.file_type} •
                      Added: {new Date(record.created_at).toLocaleString()}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedDocument(record.id === selectedDocument ? null : record.id)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    {record.id === selectedDocument ? 'Hide Content' : 'Show Content'}
                  </button>
                </div>
                {record.id === selectedDocument && (
                  <div className="bg-gray-50 p-3 mt-3 rounded overflow-auto max-h-64 text-sm">
                    <div dangerouslySetInnerHTML={{ __html: record.content }} />
                    <button
                      type="button"
                      onClick={() => setViewingRecord(record)}
                      className="mt-2 text-sm text-blue-600 hover:text-blue-800"
                    >
                      View Full Document
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 py-10">
            {searchQuery ? 'No documents matching your search criteria' : 'No documents found in this collection'}
          </p>
        )
      ) : (
        <p className="text-center text-gray-500 py-10">Please select a collection to view documents</p>
      )}
    </div>
  );
};

export default RecordsTab;
