import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import createApiService from '../../utils/apiService';
import LoadingSpinner from '../../components/LoadingSpinner';
import { formatDateTime } from '../../utils/dateUtils';

const Records = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [records, setRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [sortOption, setSortOption] = useState('newest'); // Default sort by newest first

  // Fetch records when component mounts
  useEffect(() => {
    if (isAuthenticated) {
      fetchRecords();
    }
  }, [isAuthenticated]);

  const fetchRecords = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const api = createApiService();
      const response = await api.get('/records/');
      setRecords(response.data);
    } catch (error) {
      console.error('Error fetching records:', error);
      setError('Failed to fetch records. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };  const handleRecordSelect = (record) => {
    navigate(`/records/${record.id}`);
  };

  const handleDeleteRecord = async (recordId) => {
    if (!window.confirm('Are you sure you want to delete this record?')) return;
    
    try {
      setIsLoading(true);
      const api = createApiService();
      await api.delete(`/records/${recordId}`);
        // Remove the record from the local state
      setRecords(records.filter(record => record.id !== recordId));
      
      showSuccessMessage('Record deleted successfully');
    } catch (error) {
      console.error('Error deleting record:', error);
      setError('Failed to delete record. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSortChange = (e) => {
    setSortOption(e.target.value);
  };

  const showSuccessMessage = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  // Filter records based on search query
  const searchFilteredRecords = searchQuery
    ? records.filter(record => 
        record.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.content.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : records;

  // Sort the filtered records based on the selected sort option
  const filteredAndSortedRecords = [...searchFilteredRecords].sort((a, b) => {
    switch (sortOption) {
      case 'newest':
        return new Date(b.created_at) - new Date(a.created_at);
      case 'oldest':
        return new Date(a.created_at) - new Date(b.created_at);
      case 'name_asc':
        return a.filename.localeCompare(b.filename);
      case 'name_desc':
        return b.filename.localeCompare(a.filename);
      case 'size_asc':
        return (a.file_size || 0) - (b.file_size || 0);
      case 'size_desc':
        return (b.file_size || 0) - (a.file_size || 0);
      case 'recently_updated':
        return new Date(b.updated_at) - new Date(a.updated_at);
      default:
        return new Date(b.created_at) - new Date(a.created_at);
    }  });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Medical Records</h1>
      
      {/* Success message */}
      {successMessage && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4">
          <p>{successMessage}</p>
        </div>
      )}
      
      {/* Error message */}
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
          <p>{error}</p>
        </div>
      )}      <div className="flex flex-col gap-6">
        {/* Records List Panel */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="mb-6 space-y-4">
            {/* Search Input */}
            <input
              type="text"
              placeholder="Search records..."
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            
            {/* Sort Options */}
            <div className="flex items-center">
              <label htmlFor="sortOption" className="text-sm text-gray-600 mr-3">Sort by:</label>
              <select
                id="sortOption"
                value={sortOption}
                onChange={handleSortChange}
                className="flex-grow p-3 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="newest">Date (Newest First)</option>
                <option value="oldest">Date (Oldest First)</option>
                <option value="recently_updated">Recently Updated</option>
                <option value="name_asc">Name (A-Z)</option>
                <option value="name_desc">Name (Z-A)</option>
                <option value="size_asc">Size (Smallest First)</option>
                <option value="size_desc">Size (Largest First)</option>
              </select>
            </div>
          </div>
          
          <h2 className="text-2xl font-semibold mb-4 text-gray-700">Your Records ({filteredAndSortedRecords.length})</h2>
          
          {isLoading && !records.length ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : (
            <div className="space-y-3">
              {filteredAndSortedRecords.length > 0 ? (
                filteredAndSortedRecords.map(record => (
                  <div 
                    key={record.id}
                    className="p-4 border rounded-lg cursor-pointer transition-all hover:bg-gray-50 hover:border-gray-300 hover:shadow-md border-gray-200"
                    onClick={() => handleRecordSelect(record)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-gray-800 mb-1">{record.filename}</h3>                        <div className="text-sm text-gray-500 mb-2 space-y-1">
                          <div>Created: {formatDateTime(record.created_at)}</div>
                          <div>Updated: {formatDateTime(record.updated_at)}</div>
                          <div>Type: {record.file_type || 'Not specified'} • Size: {record.file_size ? `${Math.round(record.file_size / 1024)} KB` : 'Unknown'}</div>
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2">{record.content.substring(0, 150)}...</p>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <button 
                          className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/records/${record.id}`);
                          }}
                          title="View record"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        <button 
                          className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteRecord(record.id);
                          }}
                          title="Delete record"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {searchQuery ? 'No matching records found' : 'No records available'}
                  </h3>
                  <p className="text-gray-500">
                    {searchQuery ? 'Try adjusting your search terms.' : 'Upload your first document to create a record.'}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Records;
