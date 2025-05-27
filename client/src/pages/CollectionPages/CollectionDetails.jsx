import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { collectionsAPI } from '../../utils/apiService';
import LoadingSpinner from '../../components/LoadingSpinner';
import MoveRecordModal from '../../components/Document/MoveRecordModal';
import RecordPreviewModal from '../../components/Document/RecordPreviewModal';

const CollectionDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [collection, setCollection] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [moveModalOpen, setMoveModalOpen] = useState(false);
  const [selectedRecordId, setSelectedRecordId] = useState(null);
  const [selectedRecordIds, setSelectedRecordIds] = useState([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [expandedRecords, setExpandedRecords] = useState(new Set());
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewRecord, setPreviewRecord] = useState(null);

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
  };

  const openPreviewModal = (record) => {
    setPreviewRecord(record);
    setPreviewModalOpen(true);
  };

  const closePreviewModal = () => {
    setPreviewRecord(null);
    setPreviewModalOpen(false);
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
          <p className="text-gray-500 mb-8">The collection you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => navigate('/collections')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
          >
            Back to Collections
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={() => navigate('/collections')}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
            title="Back to Collections"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{collection.name}</h1>
            {collection.description && (
              <p className="text-gray-600 mt-2">{collection.description}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-6 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <div className="bg-blue-100 rounded-full p-1">
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <span className="font-medium">{records.length} documents</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="bg-gray-100 rounded-full p-1">
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4m-8 0h8m-8 0V5a1 1 0 011-1h6a1 1 0 011 1v2M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2z" />
              </svg>
            </div>
            <span>Created {new Date(collection.created_at).toLocaleDateString()}</span>
          </div>
          {records.length > 0 && (
            <button
              onClick={toggleSelectionMode}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                isSelectionMode
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {isSelectionMode ? 'Cancel Selection' : 'Select Multiple'}
            </button>
          )}
        </div>

        {/* Batch Actions Toolbar */}
        {isSelectionMode && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-blue-900">
                  {selectedRecordIds.length} of {records.length} records selected
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={selectAllRecords}
                    className="text-xs text-blue-600 hover:text-blue-800 underline"
                  >
                    Select All
                  </button>
                  <button
                    onClick={clearSelection}
                    className="text-xs text-blue-600 hover:text-blue-800 underline"
                  >
                    Clear Selection
                  </button>
                </div>
              </div>
              
              {selectedRecordIds.length > 0 && (
                <div className="flex gap-2">
                  <button
                    onClick={handleBatchMove}
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Move to Collection
                  </button>
                  <button
                    onClick={handleBatchRemove}
                    className="px-3 py-1 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Remove from Collection
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Documents */}
      {records.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-32 h-32 mx-auto mb-6 text-gray-300">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-2xl font-semibold text-gray-900 mb-3">No documents yet</h3>
          <p className="text-gray-500 mb-8 max-w-md mx-auto">
            This collection is empty. Add documents to organize your content better.
          </p>
          <button
            onClick={() => navigate('/documents')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg transition-all duration-200 font-medium shadow-md hover:shadow-lg"
          >
            Browse Documents
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
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
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
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
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      
                      <div className="flex-1">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {record.filename || `Record #${record.id}`}
                            </h3>                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => toggleRecordExpansion(record.id)}
                                className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
                                title={isExpanded ? "Collapse details" : "Expand details"}
                              >
                                {isExpanded ? (
                                  <>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                    </svg>
                                    Less
                                  </>
                                ) : (
                                  <>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                    More
                                  </>
                                )}
                              </button>
                              <button
                                onClick={() => openPreviewModal(record)}
                                className="text-green-600 hover:text-green-800 text-sm font-medium flex items-center gap-1"
                                title="Full preview"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                Preview
                              </button>
                            </div>
                          </div>

                          {/* File Information */}
                          <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                            <div className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span>Added {new Date(record.created_at).toLocaleDateString()}</span>
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
                        {record.content && (
                          <div className="bg-gray-50 rounded-lg p-4 mb-4">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="text-sm font-medium text-gray-700">Content Preview:</h4>
                              <div className="text-xs text-gray-500">
                                {record.content.length} characters
                              </div>
                            </div>
                            
                            <div className="text-gray-600 text-sm leading-relaxed">
                              {isExpanded ? (
                                <div className="whitespace-pre-wrap max-h-96 overflow-y-auto">
                                  {record.content}
                                </div>
                              ) : (
                                <p className="line-clamp-3">
                                  {truncateContent(record.content)}
                                </p>
                              )}
                            </div>

                            {/* Word count and reading time for expanded view */}
                            {isExpanded && (
                              <div className="mt-3 pt-3 border-t border-gray-200 flex items-center gap-4 text-xs text-gray-500">
                                <span>
                                  Words: {record.content.split(/\s+/).filter(word => word.length > 0).length}
                                </span>
                                <span>
                                  Est. reading time: {Math.ceil(record.content.split(/\s+/).length / 200)} min
                                </span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Additional Details (Expanded View) */}
                        {isExpanded && (
                          <div className="space-y-3">
                            {/* Record ID and technical details */}
                            <div className="bg-blue-50 rounded-lg p-3">
                              <h5 className="text-xs font-medium text-blue-900 mb-2">Technical Details</h5>
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                <div>
                                  <span className="text-blue-700 font-medium">Record ID:</span>
                                  <span className="text-blue-800 ml-1 font-mono">{record.id}</span>
                                </div>
                                <div>
                                  <span className="text-blue-700 font-medium">Last Updated:</span>
                                  <span className="text-blue-800 ml-1">{new Date(record.updated_at).toLocaleString()}</span>
                                </div>
                                {record.user_id && (
                                  <div>
                                    <span className="text-blue-700 font-medium">User ID:</span>
                                    <span className="text-blue-800 ml-1">{record.user_id}</span>
                                  </div>
                                )}
                                {record.collection_id && (
                                  <div>
                                    <span className="text-blue-700 font-medium">Collection ID:</span>
                                    <span className="text-blue-800 ml-1 font-mono">{record.collection_id}</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Content Analysis */}
                            {record.content && (
                              <div className="bg-green-50 rounded-lg p-3">
                                <h5 className="text-xs font-medium text-green-900 mb-2">Content Analysis</h5>
                                <div className="grid grid-cols-3 gap-2 text-xs">
                                  <div>
                                    <span className="text-green-700 font-medium">Characters:</span>
                                    <span className="text-green-800 ml-1">{record.content.length.toLocaleString()}</span>
                                  </div>
                                  <div>
                                    <span className="text-green-700 font-medium">Lines:</span>
                                    <span className="text-green-800 ml-1">{record.content.split('\n').length}</span>
                                  </div>
                                  <div>
                                    <span className="text-green-700 font-medium">Paragraphs:</span>
                                    <span className="text-green-800 ml-1">{record.content.split('\n\n').length}</span>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {!isSelectionMode && (
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => handleMoveRecord(record.id)}
                          className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 border border-gray-200 hover:border-blue-300"
                          title="Move to another collection"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                          </svg>
                          <span className="text-sm font-medium">Move</span>
                        </button>
                        <button
                          onClick={() => handleRemoveRecord(record.id)}
                          className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 border border-gray-200 hover:border-red-300"
                          title="Remove from collection"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          <span className="text-sm font-medium">Remove</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Move Record Modal */}
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
      />      {/* Record Preview Modal */}
      <RecordPreviewModal
        isOpen={previewModalOpen}
        onClose={closePreviewModal}
        record={previewRecord}
      />
    </div>
  );
};

export default CollectionDetails;
