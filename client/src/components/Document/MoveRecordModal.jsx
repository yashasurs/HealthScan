import React, { useState, useEffect } from 'react';
import { collectionsAPI } from '../../utils/apiService';

const MoveRecordModal = ({ isOpen, onClose, recordId, recordIds, currentCollectionId, onMoveSuccess }) => {
  const [collections, setCollections] = useState([]);
  const [selectedCollectionId, setSelectedCollectionId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Determine if we're moving single or multiple records
  const isMultipleRecords = recordIds && recordIds.length > 0;
  const recordsToMove = isMultipleRecords ? recordIds : [recordId];
  const recordCount = recordsToMove.length;

  useEffect(() => {
    if (isOpen) {
      fetchCollections();
    }
  }, [isOpen]);

  const fetchCollections = async () => {
    try {
      const response = await collectionsAPI.getAll();
      // Filter out the current collection from the list
      const availableCollections = response.data.filter(
        collection => collection.id !== currentCollectionId
      );
      setCollections(availableCollections);
    } catch (err) {
      setError('Failed to fetch collections');
      console.error('Error fetching collections:', err);
    }
  };
  const handleMove = async () => {
    if (!selectedCollectionId) {
      setError('Please select a collection');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      // Move all records to the target collection
      const movePromises = recordsToMove.map(id => 
        collectionsAPI.moveRecord(currentCollectionId, selectedCollectionId, id)
      );
      
      await Promise.all(movePromises);
      
      onMoveSuccess();
      onClose();
    } catch (err) {
      setError(`Failed to move ${recordCount > 1 ? 'records' : 'record'}`);
      console.error('Error moving records:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedCollectionId('');
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Move {recordCount > 1 ? `${recordCount} Records` : 'Record'} to Collection
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-600 mb-4">
            Select the collection where you want to move {recordCount > 1 ? 'these records' : 'this record'}:
          </p>

          {error && (
            <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          {collections.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-2">
                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <p className="text-gray-500">No other collections available</p>
            </div>
          ) : (
            <div className="space-y-2">
              {collections.map((collection) => (
                <label
                  key={collection.id}
                  className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all ${
                    selectedCollectionId === collection.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="collection"
                    value={collection.id}
                    checked={selectedCollectionId === collection.id}
                    onChange={(e) => setSelectedCollectionId(e.target.value)}
                    className="mr-3 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{collection.name}</div>
                    {collection.description && (
                      <div className="text-sm text-gray-500 mt-1">{collection.description}</div>
                    )}
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleMove}
            disabled={!selectedCollectionId || loading || collections.length === 0}            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Moving...' : `Move ${recordCount > 1 ? 'Records' : 'Record'}`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MoveRecordModal;
