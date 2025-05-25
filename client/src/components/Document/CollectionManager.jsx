import React, { useState } from 'react';
import createApiService from '../../utils/apiService';

const CollectionManager = ({ collections, onCollectionCreated, onCollectionDeleted }) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [newCollectionDescription, setNewCollectionDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
    // Handle collection creation form submission
  const handleCreateCollection = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!newCollectionName.trim()) {
      setError('Collection name is required');
      return;
    }
    
    setIsCreating(true);
    
    try {
      const api = createApiService();
      const response = await api.post(`/collections/`, {
        name: newCollectionName,
        description: newCollectionDescription
      });
      
      setSuccess(`Collection "${newCollectionName}" created successfully!`);
      setNewCollectionName('');
      setNewCollectionDescription('');
      setShowCreateForm(false);
      
      // Call the parent component's callback to update collections list
      if (onCollectionCreated) {
        onCollectionCreated(response.data);
      }
      
    } catch (error) {
      setError(error.response?.data?.detail || 'Failed to create collection');
    } finally {
      setIsCreating(false);
    }
  };
    // Handle collection deletion
  const handleDeleteCollection = async (collectionId, collectionName) => {
    if (window.confirm(`Are you sure you want to delete the collection "${collectionName}"? Documents will not be deleted but will be removed from this collection.`)) {
      setIsDeleting(true);
      
      try {
        const api = createApiService();
        await api.delete(`/collections/${collectionId}`);
        
        // Call the parent component's callback to update collections list
        if (onCollectionDeleted) {
          onCollectionDeleted(collectionId);
        }
        
        setSuccess(`Collection "${collectionName}" deleted successfully!`);
      } catch (error) {
        setError(error.response?.data?.detail || 'Failed to delete collection');
      } finally {
        setIsDeleting(false);
      }
    }
  };
  
  return (
    <div className="mb-6 bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Manage Collections</h2>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
        >
          {showCreateForm ? 'Cancel' : 'New Collection'}
        </button>
      </div>
      
      {/* Error and success messages */}
      {error && (
        <div className="mb-4 p-3 rounded-md bg-red-100 text-red-700">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-3 rounded-md bg-green-100 text-green-700">
          {success}
        </div>
      )}
      
      {/* Create collection form */}
      {showCreateForm && (
        <form onSubmit={handleCreateCollection} className="mb-6 p-4 border border-gray-200 rounded-md">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Collection Name*
            </label>
            <input
              type="text"
              value={newCollectionName}
              onChange={(e) => setNewCollectionName(e.target.value)}
              className="w-full p-2 border rounded-md focus:ring focus:ring-blue-200"
              placeholder="Enter collection name"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description (Optional)
            </label>
            <textarea
              value={newCollectionDescription}
              onChange={(e) => setNewCollectionDescription(e.target.value)}
              className="w-full p-2 border rounded-md focus:ring focus:ring-blue-200"
              placeholder="Enter collection description"
              rows="2"
            />
          </div>
          
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isCreating}
              className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                isCreating
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
              }`}
            >
              {isCreating ? 'Creating...' : 'Create Collection'}
            </button>
          </div>
        </form>
      )}
      
      {/* Collections list */}
      <div>
        <h3 className="text-lg font-medium mb-3">Your Collections</h3>
        
        {collections.length === 0 ? (
          <p className="text-center text-gray-500 py-4">You haven't created any collections yet.</p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {collections.map(collection => (
              <li key={collection.id} className="py-3 flex justify-between items-center">
                <div>
                  <h4 className="font-medium">{collection.name}</h4>
                  {collection.description && (
                    <p className="text-sm text-gray-500">{collection.description}</p>
                  )}
                </div>
                <button
                  onClick={() => handleDeleteCollection(collection.id, collection.name)}
                  disabled={isDeleting}
                  className="text-red-600 hover:text-red-800 focus:outline-none"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default CollectionManager;
