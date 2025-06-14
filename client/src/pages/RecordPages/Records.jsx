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
  const [isLoading, setIsLoading] = useState(true);  const [error, setError] = useState(null);
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

  const handleGenerateQR = async (recordId, filename) => {
    try {
      setIsLoading(true);
      const api = createApiService();
      const response = await fetch(`${api.defaults.baseURL}/qr/record/${recordId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to generate QR code');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `record_${filename}_qr.png`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      showSuccessMessage('QR code downloaded successfully');
    } catch (error) {
      console.error('Error generating QR code:', error);
      setError('Failed to generate QR code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };  const showSuccessMessage = (message) => {
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
    }  });  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-2 sm:px-4 py-6 sm:py-10">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-gray-900">Medical Records</h1>
      
      {/* Success message */}
      {successMessage && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-3 sm:p-4 mb-4 rounded-r-md">
          <p className="text-sm sm:text-base">{successMessage}</p>
        </div>
      )}
        {/* Error message */}      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 sm:p-4 mb-4 rounded-r-md">
          <p className="text-sm sm:text-base">{error}</p>
        </div>
      )}<div className="flex flex-col gap-6 sm:gap-8">
        {/* Records List Panel */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 sm:p-8">
          <div className="mb-6 sm:mb-8 space-y-4 sm:space-y-6">
            {/* Search Input */}
            <input
              type="text"
              placeholder="Search records..."
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            
            {/* Sort Options */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <label htmlFor="sortOption" className="text-sm text-gray-600 sm:mr-3 font-medium">Sort by:</label>
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
          
          <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4 text-gray-700">Your Records ({filteredAndSortedRecords.length})</h2>
            {isLoading && !records.length ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : (            <div className="space-y-4 sm:space-y-6">
              {filteredAndSortedRecords.length > 0 ? (
                filteredAndSortedRecords.map(record => (
                  <div 
                    key={record.id}
                    className="p-4 sm:p-6 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-lg hover:border-blue-300 hover:bg-blue-50/30 cursor-pointer transition-all duration-200 transform hover:-translate-y-1"
                    onClick={() => handleRecordSelect(record)}
                  >                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 sm:gap-6">
                      <div className="flex-1 min-w-0">
                        {/* Title with truncation */}
                        <h3 className="font-bold text-lg sm:text-xl text-gray-900 mb-3 truncate pr-2" title={record.filename}>
                          {record.filename}
                        </h3>
                        
                        {/* Metadata - stacked on mobile, inline on desktop */}
                        <div className="text-xs sm:text-sm text-gray-600 mb-4 space-y-2">
                          <div className="flex flex-col sm:flex-row sm:gap-6">
                            <div className="flex items-center gap-2">
                              <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span>Created: {formatDateTime(record.created_at)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                              </svg>
                              <span>Updated: {formatDateTime(record.updated_at)}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              <span>{record.file_type || 'Not specified'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                              </svg>
                              <span>{record.file_size ? `${Math.round(record.file_size / 1024)} KB` : 'Unknown'}</span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Content preview with better mobile handling */}
                        <div className="bg-gray-50 rounded-lg p-3 sm:p-4 border-l-4 border-blue-400">
                          <p className="text-sm sm:text-base text-gray-700 line-clamp-3 leading-relaxed">
                            {record.content.substring(0, 200)}...
                          </p>
                        </div>
                      </div>
                        {/* Action buttons - horizontal on mobile, vertical on desktop */}
                      <div className="flex sm:flex-col gap-3 justify-end sm:ml-6 flex-shrink-0">
                        <button 
                          className="flex-1 sm:flex-none p-3 sm:p-2.5 text-blue-600 hover:text-blue-700 hover:bg-blue-100 bg-blue-50 rounded-lg transition-all duration-200 min-w-0 shadow-sm hover:shadow-md"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/records/${record.id}`);
                          }}
                          title="View record"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                          <button 
                          className="flex-1 sm:flex-none p-3 sm:p-2.5 text-black hover:text-black hover:bg-gray-100 bg-gray-50 rounded-lg transition-all duration-200 min-w-0 shadow-sm hover:shadow-md"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleGenerateQR(record.id, record.filename);
                          }}
                          title="Generate QR Code"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                          </svg>
                        </button>
                          <button 
                          className="flex-1 sm:flex-none p-3 sm:p-2.5 text-red-600 hover:text-red-700 hover:bg-red-100 bg-red-50 rounded-lg transition-all duration-200 min-w-0 shadow-sm hover:shadow-md"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteRecord(record.id);
                          }}
                          title="Delete record"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))              ) : (
                <div className="text-center py-8 sm:py-12 text-gray-500 px-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-3 sm:mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
                    {searchQuery ? 'No matching records found' : 'No records available'}
                  </h3>
                  <p className="text-sm sm:text-base text-gray-500 max-w-sm mx-auto">
                    {searchQuery ? 'Try adjusting your search terms.' : 'Upload your first document to create a record.'}
                  </p>
                </div>
              )}
            </div>          )}
        </div>
      </div>
    </div>
    </div>
  );
};

export default Records;
