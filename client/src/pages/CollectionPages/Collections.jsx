import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collectionsAPI, createApiService } from '../../utils/apiService';
import LoadingSpinner from '../../components/LoadingSpinner';

const Collections = () => {
  const navigate = useNavigate();  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [qrLoading, setQrLoading] = useState(false);
  const [qrLoadingCollectionId, setQrLoadingCollectionId] = useState(null);  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  useEffect(() => {
    fetchCollections();
  }, []);  const fetchCollections = async () => {
    try {
      setLoading(true);
      console.log('Fetching collections...');
      const response = await collectionsAPI.getAll();
      console.log('Collections response:', response);
      console.log('Collections data:', response.data);
      console.log('Collections data type:', typeof response.data);
      console.log('Collections array length:', Array.isArray(response.data) ? response.data.length : 'Not an array');
      
      if (Array.isArray(response.data) && response.data.length > 0) {
        console.log('First collection:', response.data[0]);
        console.log('First collection ID:', response.data[0].id, 'Type:', typeof response.data[0].id);
      }
      
      setCollections(response.data);
    } catch (err) {
      setError('Failed to fetch collections');
      console.error('Error fetching collections:', err);
      console.error('Error response:', err.response);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCollection = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Collection name is required');
      return;
    }

    try {
      await collectionsAPI.create(formData);
      setShowCreateModal(false);
      setFormData({ name: '', description: '' });
      setError('');
      fetchCollections();
    } catch (err) {
      setError('Failed to create collection');
      console.error('Error creating collection:', err);
    }
  };

  const handleUpdateCollection = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Collection name is required');
      return;
    }

    try {
      await collectionsAPI.update(selectedCollection.id, formData);
      setShowEditModal(false);
      setSelectedCollection(null);
      setFormData({ name: '', description: '' });
      setError('');
      fetchCollections();
    } catch (err) {
      setError('Failed to update collection');
      console.error('Error updating collection:', err);
    }
  };

  const handleDeleteCollection = async (collectionId) => {
    if (!window.confirm('Are you sure you want to delete this collection?')) {
      return;
    }

    try {
      await collectionsAPI.delete(collectionId);
      fetchCollections();
    } catch (err) {
      setError('Failed to delete collection');
      console.error('Error deleting collection:', err);
    }
  };

  const handleCollectionClick = (collection) => {
    navigate(`/collections/${collection.id}`);
  };  const openEditModal = (collection) => {
    setSelectedCollection(collection);
    setFormData({
      name: collection.name,
      description: collection.description || ''
    });
    setShowEditModal(true);
  };

  const closeModals = () => {
    setShowCreateModal(false);
    setShowEditModal(false);
    setSelectedCollection(null);
    setFormData({ name: '', description: '' });
    setError('');
  };  const handleDownloadCollectionQR = async (collectionId, collectionName) => {
    if (qrLoading) return; // Prevent multiple concurrent requests
    
    setQrLoading(true);
    setQrLoadingCollectionId(collectionId);
    setError('');
    setSuccessMessage('');
    
    try {
      console.log('Generating QR code for collection:', collectionId, collectionName);
      
      // Create API service instance with proper authentication
      const api = createApiService();
      
      // Make request to QR endpoint
      const response = await api.post(`/qr/collection/${collectionId}`, null, {
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
      const safeCollectionName = collectionName
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
      setSuccessMessage(`QR code for "${collectionName}" downloaded successfully!`);
      
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
      setQrLoadingCollectionId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <LoadingSpinner />
      </div>
    );
  }
  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Collections</h1>
          <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">Organize your documents into collections</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm sm:text-base w-full sm:w-auto justify-center"
        >
          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span className="sm:inline">Create Collection</span>
        </button>
      </div>      {error && (
        <div className="bg-red-50 border border-red-300 text-red-700 px-3 sm:px-4 py-3 rounded-lg mb-4 sm:mb-6 text-sm sm:text-base">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="bg-green-50 border border-green-300 text-green-700 px-3 sm:px-4 py-3 rounded-lg mb-4 sm:mb-6 text-sm sm:text-base">
          {successMessage}
        </div>
      )}{collections.length === 0 ? (
        <div className="text-center py-12 sm:py-16 px-4">
          <div className="w-24 h-24 sm:w-32 sm:h-32 mx-auto mb-4 sm:mb-6 text-gray-300">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2 sm:mb-3">No collections yet</h3>
          <p className="text-gray-500 mb-6 sm:mb-8 max-w-md mx-auto text-sm sm:text-base">Create your first collection to start organizing your documents into meaningful groups</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg transition-all duration-200 font-medium shadow-md hover:shadow-lg text-sm sm:text-base"
          >
            Create Your First Collection
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">          {collections.map((collection) => (
            <div
              key={collection.id}
              className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200 overflow-hidden hover:border-blue-300 cursor-pointer transform hover:-translate-y-1"
              onClick={() => handleCollectionClick(collection)}
            >
              {/* Collection Header */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                    <div className="bg-blue-100 rounded-lg p-1.5 sm:p-2 group-hover:bg-blue-200 transition-colors duration-200 flex-shrink-0">
                      <svg className="w-4 h-4 sm:w-6 sm:h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate group-hover:text-blue-700 transition-colors">
                      {collection.name}
                    </h3>
                  </div>                  <div className="flex gap-0.5 sm:gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex-shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditModal(collection);
                      }}
                      className="p-1.5 sm:p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                      title="Edit collection"
                    >
                      <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteCollection(collection.id);
                      }}
                      className="p-1.5 sm:p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                      title="Delete collection"
                    >
                      <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownloadCollectionQR(collection.id, collection.name);
                      }}
                      disabled={qrLoadingCollectionId === collection.id}
                      className={`p-1.5 sm:p-2 rounded-lg transition-all duration-200 ${
                        qrLoadingCollectionId === collection.id
                          ? 'text-gray-300 cursor-not-allowed'
                          : 'text-gray-400 hover:text-purple-600 hover:bg-purple-50'
                      }`}
                      title={qrLoadingCollectionId === collection.id ? "Generating QR code..." : "Download QR code"}
                    >
                      {qrLoadingCollectionId === collection.id ? (
                        <svg className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Collection Body */}
              <div className="p-4 sm:p-6">
                {collection.description && (
                  <p className="text-gray-600 mb-3 sm:mb-4 line-clamp-3 leading-relaxed text-sm sm:text-base">{collection.description}</p>
                )}
                
                {/* Stats */}
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className="flex items-center space-x-3 sm:space-x-4">
                    <div className="flex items-center space-x-1.5 sm:space-x-2 text-xs sm:text-sm text-gray-500">
                      <div className="bg-gray-100 rounded-full p-0.5 sm:p-1">
                        <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <span className="font-medium">{collection.records?.length || 0} documents</span>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-full">
                    {new Date(collection.created_at).toLocaleDateString()}
                  </span>
                </div>

                {/* Action Button */}
                <div className="flex items-center justify-between">
                  <div className="text-xs sm:text-sm text-gray-500">
                    Click to view documents
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}      {/* Create Collection Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-white bg-opacity-30 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-4 sm:p-6 mx-4 shadow-2xl">
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-semibold">Create New Collection</h2>
              <button
                onClick={closeModals}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleCreateCollection}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Collection Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                  placeholder="Enter collection name"
                  required
                />
              </div>
              
              <div className="mb-4 sm:mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                  placeholder="Enter collection description (optional)"
                />
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={closeModals}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm sm:text-base"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm sm:text-base"
                >
                  Create Collection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}      {/* Edit Collection Modal */}
      {showEditModal && selectedCollection && (
        <div className="fixed inset-0 bg-white bg-opacity-30 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-4 sm:p-6 mx-4 shadow-2xl">
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-semibold">Edit Collection</h2>
              <button
                onClick={closeModals}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleUpdateCollection}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Collection Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                  placeholder="Enter collection name"
                  required
                />
              </div>
              
              <div className="mb-4 sm:mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                  placeholder="Enter collection description (optional)"
                />
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={closeModals}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm sm:text-base"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm sm:text-base"
                >
                  Update Collection
                </button>
              </div>            </form>          </div>
        </div>
      )}
    </div>
  );
};

export default Collections;
