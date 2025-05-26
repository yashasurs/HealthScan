import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import createApiService from '../utils/apiService';
import { CollectionManager, DocumentViewer } from '../components/Document';

const Collections = () => {  
  const { isAuthenticated } = useAuth();
  const [collections, setCollections] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState('');  
  const [selectedCollectionName, setSelectedCollectionName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [records, setRecords] = useState([]);
  const [viewingRecord, setViewingRecord] = useState(null);

  // Fetch collections when component mounts
  useEffect(() => {
    if (isAuthenticated) {
      fetchCollections();
    }
  }, [isAuthenticated]);

  // Fetch collections from API
  const fetchCollections = async () => {
    try {
      setIsLoading(true);
      const api = createApiService();
      const response = await api.get('/collections/');
      setCollections(response.data);
    } catch (error) {
      console.error('Error fetching collections:', error);
      setError('Failed to load collections. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle collection creation callback
  const handleCollectionCreated = (newCollection) => {
    setCollections([...collections, newCollection]);
  };

  // Handle collection deletion callback
  const handleCollectionDeleted = (deletedCollectionId) => {
    setCollections(collections.filter(c => c.id !== deletedCollectionId));
    if (selectedCollection === deletedCollectionId) {
      setSelectedCollection('');
      setRecords([]);
    }
  };
  
  // Handle collection selection
  const handleCollectionSelect = (collectionId) => {
    setError(''); // Clear any previous errors
    setSuccess(''); // Clear any previous success messages
    setSelectedCollection(collectionId);
    
    // Find the collection name for the success message
    const selectedColl = collections.find(c => c.id === collectionId);
    if (selectedColl) {
      setSelectedCollectionName(selectedColl.name);
    }
    
    fetchRecords(collectionId);
  };
  
  // Handle opening a document to view
  const handleViewDocument = (record) => {
    setViewingRecord(record);
  };
  
  // Fetch records of a collection
  const fetchRecords = async (collectionId) => {
    setIsLoading(true);
    try {
      const api = createApiService();
      const response = await api.get(`/collections/${collectionId}/records`);
      
      if (response.status === 200) {
        setRecords(response.data);
        if (selectedCollectionName) {
          setSuccess(`Successfully loaded ${response.data.length} document${response.data.length !== 1 ? 's' : ''} from collection "${selectedCollectionName}"`);
        }
      }
    } catch (error) {
      console.error('Error fetching records:', error);
      setError('Failed to load documents. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <h1 className="text-3xl font-bold mb-6">Collections</h1>
        {/* Display any errors */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-800 rounded-lg border border-red-200 flex items-start space-x-3">
          <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="font-medium">{error}</p>
        </div>
      )}
      
      {/* Display success messages */}
      {success && (
        <div className="mb-6 p-4 bg-green-50 text-green-800 rounded-lg border border-green-200 flex items-start space-x-3">
          <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="font-medium">{success}</p>
        </div>
      )}
      
      {/* Collection Manager Component */}
      <div className="mb-8">
        <CollectionManager 
          collections={collections} 
          onCollectionCreated={handleCollectionCreated}
          onCollectionDeleted={handleCollectionDeleted}
          onCollectionSelect={handleCollectionSelect}
          selectedCollectionId={selectedCollection}
        />
      </div>
      
      {/* Display Documents for Selected Collection */}
      {selectedCollection && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Documents in Collection</h2>
            <div className="flex items-center">
              {isLoading ? (
                <div className="flex items-center text-gray-500">
                  <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Loading...
                </div>
              ) : (
                <span className="text-sm bg-gray-100 px-3 py-1 rounded-full">
                  {records.length} document{records.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>
          
          {isLoading ? (
            <div className="py-12 flex justify-center">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 rounded w-64"></div>
                <div className="h-4 bg-gray-200 rounded w-52"></div>
                <div className="h-4 bg-gray-200 rounded w-40"></div>
              </div>
            </div>
          ) : records.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">No Documents Yet</h4>
              <p className="text-gray-500 mb-4">This collection doesn't have any documents yet</p>
              <a 
                href="/documents" 
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all duration-200"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Upload Documents
              </a>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {records.map(record => (                <div 
                  key={record.id} 
                  className="bg-gradient-to-r from-white to-gray-50/30 rounded-xl p-4 border border-gray-200 hover:border-blue-300 transition-all duration-200 hover:shadow-lg cursor-pointer group"
                  onClick={() => handleViewDocument(record)}
                >
                  <div className="flex items-start">
                    <div className="bg-blue-100 rounded-md p-2 mr-3 group-hover:bg-blue-200 transition-colors duration-200">
                      <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h3 className="font-medium text-gray-900 truncate">{record.filename}</h3>
                        <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 ml-2">View</span>
                      </div>
                      <p className="text-sm text-gray-500">
                        Added {new Date(record.created_at).toLocaleDateString()}
                      </p>
                      <div className="flex mt-3 text-xs">
                        <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded mr-2">
                          {Math.round(record.file_size / 1024)} KB
                        </span>
                        <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded">
                          {record.file_type?.split('/')[1] || 'Document'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      
      {/* Document Viewer Modal */}
      {viewingRecord && (
        <DocumentViewer 
          record={viewingRecord} 
          onClose={() => setViewingRecord(null)} 
        />
      )}
    </div>
  );
};

export default Collections;
