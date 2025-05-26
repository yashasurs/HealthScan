import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { collectionsAPI } from '../utils/apiService';
import LoadingSpinner from '../components/LoadingSpinner';

const CollectionDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [collection, setCollection] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCollectionDetails();
  }, [id]);  const fetchCollectionDetails = async () => {
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
        </div>
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
          {records.map((record) => (
            <div
              key={record.id}
              className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200 overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="bg-green-100 rounded-lg p-2">
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Record #{record.id}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                          <span>Added {new Date(record.created_at).toLocaleDateString()}</span>
                          {record.document_type && (
                            <span className="bg-gray-100 px-2 py-1 rounded-full text-xs">
                              {record.document_type}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Document Content Preview */}
                    {record.content && (
                      <div className="bg-gray-50 rounded-lg p-4 mb-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Content Preview:</h4>
                        <p className="text-gray-600 text-sm line-clamp-3">
                          {record.content}
                        </p>
                      </div>
                    )}

                    {/* Metadata */}
                    {record.metadata && Object.keys(record.metadata).length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Metadata:</h4>
                        <div className="grid grid-cols-2 gap-2">
                          {Object.entries(record.metadata).map(([key, value]) => (
                            <div key={key} className="text-sm">
                              <span className="text-gray-500">{key}:</span>
                              <span className="text-gray-700 ml-1">{value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleRemoveRecord(record.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                      title="Remove from collection"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CollectionDetails;
