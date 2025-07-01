import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createApiService } from '../../utils/apiService';
import LoadingSpinner from '../../components/LoadingSpinner';

const AdminCollections = () => {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedCollection, setExpandedCollection] = useState(null);
  const [collectionRecords, setCollectionRecords] = useState({});
  const [loadingRecords, setLoadingRecords] = useState(false);

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const api = createApiService();
        console.log('Fetching collections...');
        const response = await api.get('/admin/collections');
        console.log('Collections response:', response.data);
        setCollections(response.data);
      } catch (err) {
        console.error('Collections fetch error:', err);
        console.error('Error response:', err.response?.data);
        setError(`Failed to fetch collections: ${err.response?.data?.detail || err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchCollections();
  }, []);

  const fetchCollectionRecords = async (collectionId) => {
    try {
      setLoadingRecords(true);
      const api = createApiService();
      // Fetch all records and filter by collection
      const response = await api.get('/admin/records');
      const filteredRecords = response.data.filter(record => 
        record.collection_id === collectionId
      );
      setCollectionRecords(prev => ({
        ...prev,
        [collectionId]: filteredRecords
      }));
    } catch (err) {
      console.error('Error fetching collection records:', err);
      setError(`Failed to fetch records for collection: ${err.response?.data?.detail || err.message}`);
    } finally {
      setLoadingRecords(false);
    }
  };

  const toggleCollectionExpansion = async (collectionId) => {
    if (expandedCollection === collectionId) {
      setExpandedCollection(null);
    } else {
      setExpandedCollection(collectionId);
      if (!collectionRecords[collectionId]) {
        await fetchCollectionRecords(collectionId);
      }
    }
  };

  const handleDeleteCollection = async (collectionId) => {
    if (window.confirm('Are you sure you want to delete this collection? This action cannot be undone.')) {
      try {
        const api = createApiService();
        await api.delete(`/admin/collections/${collectionId}`);
        setCollections(collections.filter(c => c.id !== collectionId));
      } catch (err) {
        setError('Failed to delete collection');
      }
    }
  };

  if (loading) return <LoadingSpinner size="lg" text="Loading collections..." />;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Link
              to="/admin"
              className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Dashboard
            </Link>
          </div>
          <h1 className="text-2xl font-semibold text-gray-900">Collections Management</h1>
          <p className="text-gray-600 mt-1">View and manage all user collections</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="text-red-700">{error}</div>
          </div>
        )}

        {/* Collections List */}
        <div className="space-y-6">
          {collections.map((collection) => (
            <div key={collection.id} className="bg-white rounded-lg border border-gray-200">
              {/* Collection Header */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{collection.name}</h3>
                      <p className="text-sm text-gray-500">Owner: {collection.owner?.username}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => toggleCollectionExpansion(collection.id)}
                      className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      {expandedCollection === collection.id ? (
                        <>
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                          </svg>
                          Hide Records
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                          View Records
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleDeleteCollection(collection.id)}
                      className="text-red-600 hover:text-red-700 text-sm font-medium px-3 py-1"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <p className="text-gray-600 text-sm mb-4">{collection.description}</p>
                <div className="text-xs text-gray-500">
                  Created: {new Date(collection.created_at).toLocaleDateString()}
                </div>
              </div>

              {/* Records Section */}
              {expandedCollection === collection.id && (
                <div className="border-t border-gray-200 bg-gray-50">
                  <div className="p-6">
                    <h4 className="text-lg font-medium text-gray-900 mb-4">Records in this Collection</h4>
                    {loadingRecords ? (
                      <div className="text-center py-8">
                        <LoadingSpinner size="sm" text="Loading records..." centered={false} />
                      </div>
                    ) : collectionRecords[collection.id] ? (
                      collectionRecords[collection.id].length > 0 ? (
                        <div className="space-y-3">
                          {collectionRecords[collection.id].map((record) => (
                            <div key={record.id} className="bg-white p-4 rounded-lg border border-gray-200">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <h5 className="font-medium text-gray-900">{record.filename}</h5>
                                  <p className="text-sm text-gray-600 mt-1">{record.description || 'No description'}</p>
                                  <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                                    <span>Type: {record.file_type}</span>
                                    <span>Size: {(record.file_size / 1024).toFixed(1)} KB</span>
                                    <span>Created: {new Date(record.created_at).toLocaleDateString()}</span>
                                  </div>
                                  <div className="text-xs text-gray-500 mt-1">
                                    Owner: {record.owner?.username}
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2 ml-4">
                                  <Link
                                    to={`/records/${record.id}`}
                                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                                  >
                                    View
                                  </Link>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <div className="text-gray-500">No records in this collection</div>
                        </div>
                      )
                    ) : null}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {collections.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg">No collections found</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCollections;
