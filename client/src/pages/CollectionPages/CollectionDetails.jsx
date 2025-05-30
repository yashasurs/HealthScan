import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { collectionsAPI, createApiService } from '../../utils/apiService';
import LoadingSpinner from '../../components/LoadingSpinner';
import MoveRecordModal from '../../components/Document/Modals/MoveRecordModal';
import CollectionHeader from '../../components/Document/Collection/CollectionHeader';
import CollectionStats from '../../components/Document/Collection/CollectionStats';
import SelectionToolbar from '../../components/Document/Collection/SelectionToolbar';
import DocumentList from '../../components/Document/Collection/DocumentList';
import EmptyState from '../../components/Document/Collection/EmptyState';
import NotFoundState from '../../components/Document/Collection/NotFoundState';
import {
  useCollectionEditing,
  useDocumentSelection,
  useDocumentExpansion
} from '../../hooks/useCollectionState';

const CollectionDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [collection, setCollection] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [qrLoading, setQrLoading] = useState(false);
  const [moveModalOpen, setMoveModalOpen] = useState(false);
  const [selectedRecordId, setSelectedRecordId] = useState(null);

  // Custom hooks for state management
  const collectionEditing = useCollectionEditing(collection);
  const documentSelection = useDocumentSelection(records);
  const documentExpansion = useDocumentExpansion();

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
    documentSelection.clearSelection(); // Clear batch selection when moving single record
    setMoveModalOpen(true);
  };

  const handleMoveSuccess = () => {
    fetchCollectionDetails(); // Refresh the records
    setMoveModalOpen(false);
    setSelectedRecordId(null);
    documentSelection.clearSelection();
    documentSelection.exitSelectionMode();
  };

  const handleBatchMove = () => {
    if (documentSelection.selectedRecordIds.length === 0) return;
    setSelectedRecordId(null); // Clear single record selection
    setMoveModalOpen(true);
  };

  const handleBatchRemove = async () => {
    if (documentSelection.selectedRecordIds.length === 0) return;
    
    if (!window.confirm(`Are you sure you want to remove ${documentSelection.selectedRecordIds.length} documents from the collection?`)) {
      return;
    }

    try {
      const removePromises = documentSelection.selectedRecordIds.map(recordId => 
        collectionsAPI.removeRecord(id, recordId)
      );
      
      await Promise.all(removePromises);
      fetchCollectionDetails();
      documentSelection.clearSelection();
      documentSelection.exitSelectionMode();
    } catch (err) {
      setError('Failed to remove documents from collection');
      console.error('Error removing records:', err);
    }
  };

  const handleRecordClick = (record) => {
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
    collectionEditing.startEditingName();
  };

  const handleSaveName = async () => {
    if (!collectionEditing.editedName.trim()) {
      setError('Collection name cannot be empty');
      return;
    }

    try {
      const api = createApiService();
      await api.patch(`/collections/${collection.id}`, {
        name: collectionEditing.editedName.trim()
      });
      
      setCollection({ ...collection, name: collectionEditing.editedName.trim() });
      collectionEditing.stopEditingName();
      setSuccessMessage('Collection name updated successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error updating collection name:', error);
      setError('Failed to update collection name. Please try again.');
      setTimeout(() => setError(''), 5000);
    }
  };

  const handleCancelEditName = () => {
    collectionEditing.cancelEditingName();
  };

  /**
   * Handles editing collection description
   */
  const handleEditDescription = () => {
    collectionEditing.startEditingDescription();
  };

  const handleSaveDescription = async () => {
    try {
      const api = createApiService();
      await api.patch(`/collections/${collection.id}`, {
        description: collectionEditing.editedDescription.trim()
      });
      
      setCollection({ ...collection, description: collectionEditing.editedDescription.trim() });
      collectionEditing.stopEditingDescription();
      setSuccessMessage('Collection description updated successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error updating collection description:', error);
      setError('Failed to update collection description. Please try again.');
      setTimeout(() => setError(''), 5000);
    }
  };

  const handleCancelEditDescription = () => {
    collectionEditing.cancelEditingDescription();
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
    return <NotFoundState />;
  }  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
      {/* Header */}
      <CollectionHeader
        collection={collection}
        isEditingName={collectionEditing.isEditingName}
        editedName={collectionEditing.editedName}
        setEditedName={collectionEditing.setEditedName}
        isEditingDescription={collectionEditing.isEditingDescription}
        editedDescription={collectionEditing.editedDescription}
        setEditedDescription={collectionEditing.setEditedDescription}
        qrLoading={qrLoading}
        onEditName={handleEditName}
        onSaveName={handleSaveName}
        onCancelEditName={handleCancelEditName}
        onEditDescription={handleEditDescription}
        onSaveDescription={handleSaveDescription}
        onCancelEditDescription={handleCancelEditDescription}
        onDownloadQR={handleDownloadCollectionQR}
      />

      {/* Collection Stats */}
      <CollectionStats
        collection={collection}
        recordCount={records.length}
        onToggleSelectionMode={documentSelection.toggleSelectionMode}
        isSelectionMode={documentSelection.isSelectionMode}
      />

      {/* Selection Toolbar */}
      <SelectionToolbar
        isSelectionMode={documentSelection.isSelectionMode}
        selectedRecordIds={documentSelection.selectedRecordIds}
        totalRecords={records.length}
        onSelectAll={() => documentSelection.selectAllRecords(records)}
        onClearSelection={documentSelection.clearSelection}
        onBatchMove={handleBatchMove}
        onBatchRemove={handleBatchRemove}
      />      {/* Error and Success Messages */}
      {error && (
        <div className="bg-red-50 border border-red-300 text-red-700 px-4 sm:px-5 py-4 sm:py-5 rounded-lg shadow-sm">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="bg-green-50 border border-green-300 text-green-700 px-4 sm:px-5 py-4 sm:py-5 rounded-lg shadow-sm">
          {successMessage}
        </div>
      )}

      {/* Documents Section */}
      <div className="pt-2">
        {records.length === 0 ? (
          <EmptyState />
        ) : (
          <DocumentList
            records={records}
            isSelectionMode={documentSelection.isSelectionMode}
            selectedRecordIds={documentSelection.selectedRecordIds}
            expandedRecords={documentExpansion.expandedRecords}
            onToggleSelection={documentSelection.toggleRecordSelection}
            onToggleExpansion={documentExpansion.toggleRecordExpansion}
            onRecordClick={handleRecordClick}
            onMoveRecord={handleMoveRecord}
            onRemoveRecord={handleRemoveRecord}
          />
        )}
      </div>

      {/* Move Record Modal */}
      <MoveRecordModal
        isOpen={moveModalOpen}
        onClose={() => {
          setMoveModalOpen(false);
          setSelectedRecordId(null);
          documentSelection.clearSelection();
        }}
        recordId={selectedRecordId}
        recordIds={documentSelection.selectedRecordIds}
        currentCollectionId={id}
        onMoveSuccess={handleMoveSuccess}
      />
    </div>
  );
};

export default CollectionDetails;
