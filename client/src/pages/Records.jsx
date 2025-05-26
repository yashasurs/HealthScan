import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import createApiService from '../utils/apiService';
import LoadingSpinner from '../components/LoadingSpinner';

const Records = () => {
  const { isAuthenticated } = useAuth();
  const [records, setRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState('');
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
  };

  const handleRecordSelect = (record) => {
    setSelectedRecord(record);
    setEditedContent(record.content);
    setIsEditing(false);
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleContentChange = (e) => {
    setEditedContent(e.target.value);
  };

  const handleUpdateRecord = async () => {
    if (!selectedRecord) return;

    try {
      setIsLoading(true);
      const api = createApiService();
      await api.patch(`/records/${selectedRecord.id}?content=${encodeURIComponent(editedContent)}`);
      
      // Update the record in the local state
      setRecords(records.map(record => 
        record.id === selectedRecord.id 
          ? { ...record, content: editedContent } 
          : record
      ));
      
      setSelectedRecord({ ...selectedRecord, content: editedContent });
      setIsEditing(false);
      showSuccessMessage('Record updated successfully');
    } catch (error) {
      console.error('Error updating record:', error);
      setError('Failed to update record. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteRecord = async (recordId) => {
    if (!window.confirm('Are you sure you want to delete this record?')) return;
    
    try {
      setIsLoading(true);
      const api = createApiService();
      await api.delete(`/records/${recordId}`);
      
      // Remove the record from the local state
      setRecords(records.filter(record => record.id !== recordId));
      
      if (selectedRecord && selectedRecord.id === recordId) {
        setSelectedRecord(null);
      }
      
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
    }
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

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
      )}

      <div className="flex flex-col md:flex-row gap-6">
        {/* Records List Panel */}
        <div className="md:w-1/3 bg-white rounded-lg shadow-md p-4">
          <div className="mb-4 space-y-3">
            {/* Search Input */}
            <input
              type="text"
              placeholder="Search records..."
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            
            {/* Sort Options */}
            <div className="flex items-center">
              <label htmlFor="sortOption" className="text-sm text-gray-600 mr-2">Sort by:</label>
              <select
                id="sortOption"
                value={sortOption}
                onChange={handleSortChange}
                className="flex-grow p-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
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
          
          <h2 className="text-xl font-semibold mb-3 text-gray-700">Your Records ({filteredAndSortedRecords.length})</h2>
          
          {isLoading && !records.length ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : (
            <div className="space-y-2 max-h-[60vh] overflow-y-auto">
              {filteredAndSortedRecords.length > 0 ? (
                filteredAndSortedRecords.map(record => (
                  <div 
                    key={record.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedRecord?.id === record.id 
                        ? 'bg-blue-50 border-blue-300' 
                        : 'hover:bg-gray-50 border-gray-200'
                    }`}
                    onClick={() => handleRecordSelect(record)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-gray-800">{record.filename}</h3>
                        <p className="text-xs text-gray-500">Created: {formatDate(record.created_at)}</p>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{record.content.substring(0, 60)}...</p>
                      </div>
                      <button 
                        className="text-red-500 hover:text-red-700"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteRecord(record.id);
                        }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  {searchQuery ? 'No matching records found.' : 'No records available.'}
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Record Detail Panel */}
        <div className="md:w-2/3 bg-white rounded-lg shadow-md p-4">
          {selectedRecord ? (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">{selectedRecord.filename}</h2>
                <button
                  onClick={handleEditToggle}
                  className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                  {isEditing ? 'Cancel' : 'Edit'}
                </button>
              </div>
              
              <div className="text-sm text-gray-500 mb-4">
                <div>Created: {formatDate(selectedRecord.created_at)}</div>
                <div>Updated: {formatDate(selectedRecord.updated_at)}</div>
                <div>Type: {selectedRecord.file_type || 'Not specified'}</div>
                <div>Size: {selectedRecord.file_size ? `${Math.round(selectedRecord.file_size / 1024)} KB` : 'Unknown'}</div>
              </div>
              
              {isEditing ? (
                <div className="mt-4">
                  <textarea
                    value={editedContent}
                    onChange={handleContentChange}
                    className="w-full h-64 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="mt-3 flex justify-end">
                    <button
                      onClick={handleUpdateRecord}
                      className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 whitespace-pre-wrap min-h-[300px] max-h-[60vh] overflow-y-auto">
                  {selectedRecord.content}
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              Select a record to view details
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Records;
