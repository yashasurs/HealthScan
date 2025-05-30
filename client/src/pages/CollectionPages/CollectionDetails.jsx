import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { collectionsAPI, createApiService } from '../../utils/apiService';
import LoadingSpinner from '../../components/LoadingSpinner';
import MoveRecordModal from '../../components/Document/Modals/MoveRecordModal';
import { formatDate, formatDateTime } from '../../utils/dateUtils';

const CollectionDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [collection, setCollection] = useState(null);
  const [records, setRecords] = useState([]);  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [qrLoading, setQrLoading] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [editedDescription, setEditedDescription] = useState('');
  const [moveModalOpen, setMoveModalOpen] = useState(false);
  const [selectedRecordId, setSelectedRecordId] = useState(null);const [selectedRecordIds, setSelectedRecordIds] = useState([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [expandedRecords, setExpandedRecords] = useState(new Set());

  useEffect(() => {
    fetchCollectionDetails();
  }, [id]);

  const fetchCollectionDetails = async () => {
    try {
      setLoading(true);
      console.log('Fetching collection details for ID:', id);
      
      // Try to get the specific collection directly first
      try {
        const [collectionResponse, recordsResponse] = await Promise.all([
          collectionsAPI.getById(id),
          collectionsAPI.getRecords(id)
        ]);
        
        console.log('Direct collection response:', collectionResponse.data);
        setCollection(collectionResponse.data);
        setRecords(recordsResponse.data);
      } catch (directError) {
        console.log('Direct collection fetch failed, trying to get from all collections:', directError);
        
        // Fallback: get all collections and find the specific one
        const [collectionResponse, recordsResponse] = await Promise.all([
          collectionsAPI.getAll(),
          collectionsAPI.getRecords(id)
        ]);
        
        console.log('All collections:', collectionResponse.data);
        console.log('Looking for collection with ID:', id, 'Type:', typeof id);
        
        // Handle both string and integer IDs by converting both to strings for comparison
        const specificCollection = collectionResponse.data.find(c => {
          const collectionId = String(c.id);
          const targetId = String(id);
          console.log('Comparing:', collectionId, 'with', targetId);
          return collectionId === targetId;
        });
        
        console.log('Found collection:', specificCollection);
        setCollection(specificCollection);
        setRecords(recordsResponse.data);
      }
    } catch (err) {
      setError('Failed to fetch collection details');
      console.error('Error fetching collection details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveRecord = async (recordId) => {
    if (!window.confirm('Are you sure you want to remove this document from the collection?')) {
      return;
    }

    try {
      await collectionsAPI.removeRecord(id, recordId);
      fetchCollectionDetails(); // Refresh the records
    } catch (err) {
      setError('Failed to remove document from collection');
      console.error('Error removing record:', err);
    }
  };

  const handleMoveRecord = (recordId) => {
    setSelectedRecordId(recordId);
    setSelectedRecordIds([]); // Clear batch selection when moving single record
    setMoveModalOpen(true);
  };

  const handleMoveSuccess = () => {
    fetchCollectionDetails(); // Refresh the records
    setMoveModalOpen(false);
    setSelectedRecordId(null);
    setSelectedRecordIds([]);
    setIsSelectionMode(false);
  };

  const toggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    setSelectedRecordIds([]);
  };

  const toggleRecordSelection = (recordId) => {
    setSelectedRecordIds(prev => 
      prev.includes(recordId) 
        ? prev.filter(id => id !== recordId)
        : [...prev, recordId]
    );
  };

  const selectAllRecords = () => {
    setSelectedRecordIds(records.map(record => record.id));
  };

  const clearSelection = () => {
    setSelectedRecordIds([]);
  };

  const handleBatchMove = () => {
    if (selectedRecordIds.length === 0) return;
    setSelectedRecordId(null); // Clear single record selection
    setMoveModalOpen(true);
  };

  const handleBatchRemove = async () => {
    if (selectedRecordIds.length === 0) return;
    
    if (!window.confirm(`Are you sure you want to remove ${selectedRecordIds.length} documents from the collection?`)) {
      return;
    }

    try {
      const removePromises = selectedRecordIds.map(recordId => 
        collectionsAPI.removeRecord(id, recordId)
      );
      
      await Promise.all(removePromises);
      fetchCollectionDetails();
      setSelectedRecordIds([]);
      setIsSelectionMode(false);
    } catch (err) {
      setError('Failed to remove documents from collection');
      console.error('Error removing records:', err);
    }
  };

  const toggleRecordExpansion = (recordId) => {
    setExpandedRecords(prev => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(recordId)) {
        newExpanded.delete(recordId);
      } else {
        newExpanded.add(recordId);
      }
      return newExpanded;
    });
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown size';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileTypeDisplay = (fileType) => {
    if (!fileType) return 'Unknown';
    const typeMap = {
      'application/pdf': 'PDF Document',
      'image/jpeg': 'JPEG Image',
      'image/jpg': 'JPG Image', 
      'image/png': 'PNG Image',
      'image/gif': 'GIF Image',
      'image/webp': 'WebP Image',
      'text/plain': 'Text File',
      'application/msword': 'Word Document',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Word Document'
    };
    return typeMap[fileType] || fileType.split('/')[1]?.toUpperCase() || 'Unknown';
  };
  const truncateContent = (content, maxLength = 200) => {
    if (!content) return '';
    return content.length > maxLength ? content.substring(0, maxLength) + '...' : content;
  };  const handleRecordClick = (record) => {
    navigate(`/records/${record.id}?fromCollection=${id}&collectionName=${encodeURIComponent(collection?.name || 'Collection')}`);
  };

  /**
   * Downloads a QR code for the current collection
   * Creates a secure shareable link and generates a QR code PNG file
   */
  const handleDownloadCollectionQR = async () => {
    if (!collection) {
      setError('Collection not found. Cannot generate QR code.');
      return;
    }
    
    setQrLoading(true);
    setError('');
    setSuccessMessage('');
    
    try {
      console.log('Generating QR code for collection:', collection.id, collection.name);
      
      // Create API service instance with proper authentication
      const api = createApiService();
      
      // Make request to QR endpoint
      const response = await api.post(`/qr/collection/${collection.id}`, null, {
        responseType: 'blob', // Important: expect binary data
        headers: {
          'Accept': 'image/png'
        }
      });
      
      // Validate response
      if (!response.data) {
        throw new Error('No QR code data received from server');
      }
      
      // Create download link
      const blob = new Blob([response.data], { type: 'image/png' });
      const url = window.URL.createObjectURL(blob);
      
      // Generate safe filename
      const safeCollectionName = collection.name
        .replace(/[^a-z0-9]/gi, '_')
        .toLowerCase()
        .substring(0, 50); // Limit filename length
      
      const filename = `collection_${safeCollectionName}_qr_${new Date().getTime()}.png`;
      
      // Create and trigger download
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up object URL
      window.URL.revokeObjectURL(url);
      
      // Show success message
      setSuccessMessage(`QR code for "${collection.name}" downloaded successfully!`);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
      
      console.log('QR code download completed successfully:', filename);
      
    } catch (error) {
      console.error('Error downloading QR code:', error);
      
      // Handle different types of errors
      let errorMessage = 'Failed to generate QR code. Please try again.';
      
      if (error.response) {
        // Server responded with error
        const status = error.response.status;
        const data = error.response.data;
        
        if (status === 404) {
          errorMessage = 'Collection not found. It may have been deleted.';
        } else if (status === 401) {
          errorMessage = 'Authentication failed. Please log in again.';
        } else if (status === 403) {
          errorMessage = 'You do not have permission to access this collection.';
        } else if (status >= 500) {
          errorMessage = 'Server error occurred while generating QR code.';
        } else if (data && typeof data === 'string') {
          errorMessage = data;
        }
      } else if (error.request) {
        // Network error
        errorMessage = 'Network error. Please check your connection and try again.';
      } else if (error.message) {
        // Other errors
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      
      // Clear error message after 5 seconds
      setTimeout(() => setError(''), 5000);
      
    } finally {
      setQrLoading(false);
    }
  };

  /**
   * Handles editing collection name
   */
  const handleEditName = () => {
    setIsEditingName(true);
    setEditedName(collection.name);
  };

  const handleSaveName = async () => {
    if (!editedName.trim()) {
      setError('Collection name cannot be empty');
      return;
    }

    try {
      const api = createApiService();
      await api.patch(`/collections/${collection.id}`, {
        name: editedName.trim()
      });
      
      setCollection({ ...collection, name: editedName.trim() });
      setIsEditingName(false);
      setSuccessMessage('Collection name updated successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error updating collection name:', error);
      setError('Failed to update collection name. Please try again.');
      setTimeout(() => setError(''), 5000);
    }
  };

  const handleCancelEditName = () => {
    setIsEditingName(false);
    setEditedName('');
  };

  /**
   * Handles editing collection description
   */
  const handleEditDescription = () => {
    setIsEditingDescription(true);
    setEditedDescription(collection.description || '');
  };

  const handleSaveDescription = async () => {
    try {
      const api = createApiService();
      await api.patch(`/collections/${collection.id}`, {
        description: editedDescription.trim()
      });
      
      setCollection({ ...collection, description: editedDescription.trim() });
      setIsEditingDescription(false);
      setSuccessMessage('Collection description updated successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error updating collection description:', error);
      setError('Failed to update collection description. Please try again.');
      setTimeout(() => setError(''), 5000);
    }
  };

  const handleCancelEditDescription = () => {
    setIsEditingDescription(false);
    setEditedDescription('');
  };

  /**
   * Helper function to show success messages
   */
  const showSuccessMessage = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  /**
   * Helper function to show error messages
   */
  const showErrorMessage = (message) => {
    setError(message);
    setTimeout(() => setError(''), 5000);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <LoadingSpinner />
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-16">
          <div className="w-32 h-32 mx-auto mb-6 text-gray-300">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-2xl font-semibold text-gray-900 mb-3">Collection not found</h3>
          <p className="text-gray-500 mb-8">The collection you're looking for doesn't exist or has been removed.</p>          <button
            onClick={() => navigate('/collections')}
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Collections
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className="max-w-6xl mx-auto p-3 sm:p-4 lg:p-6">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-4">          <button
            onClick={() => navigate('/collections')}
            className="flex items-center gap-2 text-gray-600 hover:text-blue-600 font-medium transition-colors text-sm sm:text-base self-start"
            title="Back to Collections"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="font-medium">Back</span>
          </button>          <div className="flex-1 min-w-0">
            {isEditingName ? (
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="text"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 bg-white border border-blue-300 rounded px-2 py-1 flex-1 min-w-0"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveName();
                    if (e.key === 'Escape') handleCancelEditName();
                  }}
                />
                <button
                  onClick={handleSaveName}
                  className="text-green-600 hover:text-green-800 p-1"
                  title="Save"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </button>
                <button
                  onClick={handleCancelEditName}
                  className="text-red-600 hover:text-red-800 p-1"
                  title="Cancel"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 mb-2 group">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 break-words">{collection.name}</h1>
                <button
                  onClick={handleEditName}
                  className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-blue-600 p-1 transition-all"
                  title="Edit collection name"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
              </div>
            )}
            
            {isEditingDescription ? (
              <div className="flex items-start gap-2">
                <textarea
                  value={editedDescription}
                  onChange={(e) => setEditedDescription(e.target.value)}
                  className="text-gray-600 text-sm sm:text-base bg-white border border-blue-300 rounded px-2 py-1 flex-1 min-w-0 resize-none"
                  rows="2"
                  placeholder="Add a description..."
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSaveDescription();
                    }
                    if (e.key === 'Escape') handleCancelEditDescription();
                  }}
                />
                <div className="flex flex-col gap-1">
                  <button
                    onClick={handleSaveDescription}
                    className="text-green-600 hover:text-green-800 p-1"
                    title="Save"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </button>
                  <button
                    onClick={handleCancelEditDescription}
                    className="text-red-600 hover:text-red-800 p-1"
                    title="Cancel"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-2 group">
                {collection.description ? (
                  <p className="text-gray-600 mt-2 text-sm sm:text-base">{collection.description}</p>
                ) : (
                  <p className="text-gray-400 mt-2 text-sm sm:text-base italic">No description</p>
                )}
                <button
                  onClick={handleEditDescription}
                  className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-blue-600 p-1 transition-all mt-1"
                  title="Edit description"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
              </div>
            )}
          </div>{/* QR Code Download Button */}
          <div className="flex-shrink-0">
            <button
              onClick={handleDownloadCollectionQR}
              disabled={qrLoading}
              className={`inline-flex items-center gap-2 px-3 py-2 font-medium transition-colors text-xs sm:text-sm border rounded-lg ${
                qrLoading
                  ? 'text-gray-400 border-gray-300 cursor-not-allowed'
                  : 'text-purple-600 hover:text-purple-800 border-purple-300 hover:border-purple-400'
              }`}
              title={qrLoading ? "Generating QR Code..." : "Download QR Code for Collection"}
            >
              {qrLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="hidden sm:inline">Generating...</span>
                  <span className="sm:hidden">...</span>
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                  </svg>
                  <span className="hidden sm:inline">Download QR</span>
                  <span className="sm:hidden">QR</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 text-xs sm:text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <div className="bg-blue-100 rounded-full p-1">
              <svg className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <span className="font-medium">{records.length} documents</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="bg-gray-100 rounded-full p-1">
              <svg className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4m-8 0h8m-8 0V5a1 1 0 011-1h6a1 1 0 011 1v2M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2z" />              </svg>
            </div>
            <span>Created {formatDate(collection.created_at)}</span>
          </div>
          {records.length > 0 && (            <button
              onClick={toggleSelectionMode}
              className={`inline-flex items-center gap-2 text-xs sm:text-sm font-medium transition-colors py-1 sm:py-0 ${
                isSelectionMode
                  ? 'text-red-600 hover:text-red-800'
                  : 'text-gray-700 hover:text-blue-600'
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
          )}
        </div>        {/* Batch Actions Toolbar */}
        {isSelectionMode && (
          <div className="mt-4 p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <span className="text-xs sm:text-sm font-medium text-blue-900">
                  {selectedRecordIds.length} of {records.length} records selected
                </span>                <div className="flex flex-wrap gap-2">                  <button
                    onClick={selectAllRecords}
                    className="inline-flex items-center gap-1 text-xs font-medium text-blue-700 hover:text-blue-900 transition-colors"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="hidden xs:inline">Select All</span>
                    <span className="xs:hidden">All</span>
                  </button>                  <button
                    onClick={clearSelection}
                    className="inline-flex items-center gap-1 text-xs font-medium text-gray-700 hover:text-gray-900 transition-colors"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span className="hidden xs:inline">Clear Selection</span>
                    <span className="xs:hidden">Clear</span>
                  </button>
                </div>
              </div>
                {selectedRecordIds.length > 0 && (
                <div className="flex flex-wrap gap-2">                  <button
                    onClick={handleBatchMove}
                    className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium transition-colors text-xs sm:text-sm"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                    <span className="hidden sm:inline">Move to Collection</span>
                    <span className="sm:hidden">Move</span>
                  </button>
                  <button
                    onClick={handleBatchRemove}
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
        )}
      </div>      {error && (
        <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="bg-green-50 border border-green-300 text-green-700 px-4 py-3 rounded-lg mb-6">
          {successMessage}
        </div>
      )}

      {/* Documents */}
      {records.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-32 h-32 mx-auto mb-6 text-gray-300">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>          <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2 sm:mb-3">No documents yet</h3>
          <p className="text-gray-500 mb-6 sm:mb-8 max-w-md mx-auto text-sm sm:text-base px-4">
            This collection is empty. Add documents to organize your content better.
          </p>          <button
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
      ) : (        <div className="grid grid-cols-1 gap-4 sm:gap-6">
          {records.map((record) => {
            const isExpanded = expandedRecords.has(record.id);
            const isSelected = selectedRecordIds.includes(record.id);
            
            return (
              <div
                key={record.id}
                className={`bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border overflow-hidden ${
                  isSelectionMode && isSelected
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200'
                }`}
              >
                <div className="p-3 sm:p-4 lg:p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between space-y-3 lg:space-y-0">
                    <div className="flex items-start gap-2 sm:gap-3 flex-1">
                      {isSelectionMode && (
                        <div className="mt-1">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleRecordSelection(record.id)}
                            className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                        </div>
                      )}
                      
                      <div className="bg-green-100 rounded-lg p-2">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                            <h3 className="text-base sm:text-lg font-semibold text-gray-900 break-words">
                              {record.filename || `Record #${record.id}`}
                            </h3>                            <div className="flex flex-wrap items-center gap-2">
                              <button
                                onClick={() => toggleRecordExpansion(record.id)}
                                className="text-blue-600 hover:text-blue-800 text-xs sm:text-sm font-medium flex items-center gap-1"
                                title={isExpanded ? "Collapse details" : "Expand details"}
                              >
                                {isExpanded ? (
                                  <>
                                    <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                    </svg>
                                    <span className="hidden xs:inline">Less</span>
                                  </>
                                ) : (
                                  <>
                                    <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                    <span className="hidden xs:inline">More</span>
                                  </>
                                )}
                              </button>                              <button
                                onClick={() => handleRecordClick(record)}
                                className="inline-flex items-center gap-1 sm:gap-2 text-green-600 hover:text-green-800 font-medium transition-colors text-xs sm:text-sm"
                                title="View record details"
                              >
                                <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                <span className="hidden sm:inline">View Details</span>
                                <span className="sm:hidden">View</span>
                              </button>
                            </div>
                          </div>

                          {/* File Information */}
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500 mb-3">
                            <div className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />                              </svg>
                              <span>Added {formatDate(record.created_at)}</span>
                            </div>
                            
                            {record.file_type && (
                              <div className="flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                                <span className="bg-gray-100 px-2 py-1 rounded-full text-xs">
                                  {getFileTypeDisplay(record.file_type)}
                                </span>
                              </div>
                            )}
                            
                            {record.file_size && (
                              <div className="flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                                <span>{formatFileSize(record.file_size)}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Content Preview */}
                        {record.content && (                          <div className="bg-gray-50 rounded-lg p-4 mb-4">
                            <div className="flex items-center mb-2">
                              <h4 className="text-sm font-medium text-gray-700">Content Preview:</h4>
                            </div><div className="text-gray-600 text-sm leading-relaxed">
                              {isExpanded ? (
                                <div className="markdown-content max-h-96 overflow-y-auto">
                                  <ReactMarkdown>{record.content}</ReactMarkdown>
                                </div>
                              ) : (
                                <p className="line-clamp-3">
                                  {truncateContent(record.content)}
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {!isSelectionMode && (
                      <div className="flex gap-2 ml-4">                        <button
                          onClick={() => handleMoveRecord(record.id)}
                          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium transition-colors"
                          title="Move to another collection"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                          </svg>
                          <span className="font-medium">Move</span>                        </button><button
                          onClick={() => handleRemoveRecord(record.id)}
                          className="inline-flex items-center gap-2 text-red-600 hover:text-red-800 font-medium transition-colors"
                          title="Remove from collection"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          <span className="font-medium">Remove</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}      {/* Move Record Modal */}
      <MoveRecordModal
        isOpen={moveModalOpen}
        onClose={() => {
          setMoveModalOpen(false);
          setSelectedRecordId(null);
          setSelectedRecordIds([]);
        }}
        recordId={selectedRecordId}
        recordIds={selectedRecordIds}
        currentCollectionId={id}
        onMoveSuccess={handleMoveSuccess}
      />
    </div>
  );
};

export default CollectionDetails;
