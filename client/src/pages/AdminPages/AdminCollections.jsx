import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from '../../utils/constants';
import LoadingSpinner from '../../components/LoadingSpinner';

const AdminCollections = () => {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/admin/collections`);
        setCollections(response.data);
      } catch (err) {
        setError('Failed to fetch collections');
      } finally {
        setLoading(false);
      }
    };

    fetchCollections();
  }, []);

  const handleDeleteCollection = async (collectionId) => {
    if (window.confirm('Are you sure you want to delete this collection? This action cannot be undone.')) {
      try {
        await axios.delete(`${API_BASE_URL}/admin/collections/${collectionId}`);
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

        {/* Collections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {collections.map((collection) => (
            <div key={collection.id} className="bg-white rounded-lg border border-gray-200 p-6">
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
                <button
                  onClick={() => handleDeleteCollection(collection.id)}
                  className="text-red-600 hover:text-red-700 text-sm font-medium"
                >
                  Delete
                </button>
              </div>
              <p className="text-gray-600 text-sm mb-4">{collection.description}</p>
              <div className="text-xs text-gray-500">
                Created: {new Date(collection.created_at).toLocaleDateString()}
              </div>
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
