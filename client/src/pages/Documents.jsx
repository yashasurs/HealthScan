import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'
import createApiService from '../utils/apiService'
import { 
  CollectionManager,
  UploadTab,
  RecordsTab,
  DocumentViewer,
  DebugInfo,
  TabNav
} from '../components/Document'

const Documents = () => {
  const { isAuthenticated, user } = useAuth();
  const [files, setFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [collections, setCollections] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState('');
  const [records, setRecords] = useState([]);
  const [activeTab, setActiveTab] = useState('upload'); // 'upload' or 'records'
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [viewingRecord, setViewingRecord] = useState(null);
  
  // Fetch collections when component mounts
  useEffect(() => {
    if (isAuthenticated) {
      fetchCollections();
    }
  }, [isAuthenticated]);
  
  // Monitor records changes
  useEffect(() => {
    console.log('Records state updated:', records);
  }, [records]);
    // Fetch collections from API
  const fetchCollections = async () => {
    try {
      setIsLoading(true);
      const api = createApiService();
      const response = await api.get('/collections/');
      console.log('Collections response:', response.data);
      setCollections(response.data);
    } catch (error) {
      console.error('Error fetching collections:', error);
      setUploadStatus('Error fetching collections. Please try again.');
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
    setSelectedCollection(collectionId);
    setActiveTab('records'); // Switch to records tab when a collection is selected
    fetchRecords(collectionId);
  };
  
  // Fetch records of a collection
  const fetchRecords = async (collectionId) => {
    setIsLoading(true);
    try {
      console.log(`Fetching records for collection ID: ${collectionId}`);
      const api = createApiService();
      const response = await api.get(`/collections/${collectionId}/records`);
      console.log('Records API response:', response);
      
      if (response.status === 200) {
        console.log(`Retrieved ${response.data.length} records:`, response.data);
        setRecords(currentRecords => {
          console.log('Previous records:', currentRecords);
          console.log('Setting new records:', response.data);
          return response.data;
        });
      } else {
        console.error('Unexpected status code:', response.status);
      }
    } catch (error) {
      console.error('Error fetching records:', error);
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
      } else if (error.request) {
        // The request was made but no response was received
        console.error('No response received:', error.request);
      } else {
        // Something happened in setting up the request
        console.error('Error message:', error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  // Filter and sort records based on search query
  const filteredRecords = records
    .filter(record => {
      if (!searchQuery) return true;
      
      const query = searchQuery.toLowerCase();
      return (
        record.filename.toLowerCase().includes(query) || 
        (record.content && record.content.toLowerCase().includes(query))
      );
    })
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at)); // Sort by date, newest first
  
  // Remove a file from the selection
  const removeFile = (fileToRemove) => {
    setFiles(files.filter(file => file !== fileToRemove));
  };
  
  // Handle collection change
  const handleCollectionChange = (e) => {
    const collectionId = e.target.value;
    setSelectedCollection(collectionId);
    if (collectionId) {
      fetchRecords(collectionId);
    } else {
      setRecords([]);
    }
  };
  
  // Handle file selection
  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      // Filter out non-image files
      const imageFiles = Array.from(e.target.files).filter(file => 
        file.type.startsWith('image/')
      );
      
      if (imageFiles.length !== e.target.files.length) {
        setUploadStatus('Warning: Non-image files were removed from selection.');
      }
      
      setFiles(prevFiles => [...prevFiles, ...imageFiles]);
    }
  };
  
  // Handle file drop
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files.length > 0) {
      // Filter out non-image files
      const imageFiles = Array.from(e.dataTransfer.files).filter(file => 
        file.type.startsWith('image/')
      );
      
      if (imageFiles.length !== e.dataTransfer.files.length) {
        setUploadStatus('Warning: Non-image files were removed from selection.');
      }
      
      setFiles(prevFiles => [...prevFiles, ...imageFiles]);
    }
  };
  
  // Handle dragover event
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };
  
  // Handle file upload and OCR processing
  const handleUpload = async (e) => {
    e.preventDefault();
    
    if (files.length === 0) {
      setUploadStatus('Please select at least one image file');
      return;
    }
    
    setIsUploading(true);
    setUploadStatus('Uploading and processing images...');
    
    try {
      const formData = new FormData();
      
      // Append all files to formData
      files.forEach(file => {
        formData.append('files', file);
        console.log(`Appending file: ${file.name}, size: ${file.size}, type: ${file.type}`);
      });
      
      // If a collection is selected, add its ID to the request
      if (selectedCollection) {
        // The collection_id should be sent as a query parameter, not in the form data
        console.log(`Using collection ID: ${selectedCollection}`);
      }
      
      console.log('Sending OCR request...');
      
      // Create API service with auth token
      const api = createApiService();
      
      // Make the OCR request
      let url = `/ocr/get-text`;
      // Add collection_id as a query parameter if selected
      if (selectedCollection) {
        url += `?collection_id=${selectedCollection}`;
      }
      
      const response = await api.post(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      console.log('OCR response received:', response.data);
      setUploadStatus(`Successfully processed ${response.data.length} file(s)`);
      setFiles([]);
      
      // If a collection was specified, update the records
      if (selectedCollection) {
        console.log(`Fetching records for collection ${selectedCollection}`);
        await fetchRecords(selectedCollection);
        // We can't log records here immediately because setState is asynchronous
        // The records will be logged by our useEffect hook when the state updates
      }
      
      // Switch to records tab to show the results if a collection was selected
      // Slightly delay the tab switch to ensure records are loaded
      if (selectedCollection) {
        setTimeout(() => {
          console.log('Switching to records tab after upload');
          setActiveTab('records');
        }, 500); // Add a small delay to ensure state updates have time to process
      }
      
    } catch (error) {
      console.error('Error uploading or processing files:', error);
      setUploadStatus(`Error: ${error.response?.data?.detail || 'Failed to process files'}`);
    } finally {
      setIsUploading(false);
    }
  };    return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Hero Section */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Document Management</h1>
              <p className="text-gray-600">Upload, organize, and search your documents with OCR processing</p>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <div className="bg-blue-50 rounded-lg px-4 py-2">
                <span className="text-sm font-medium text-blue-700">Collections: {collections.length}</span>
              </div>
              <div className="bg-green-50 rounded-lg px-4 py-2">
                <span className="text-sm font-medium text-green-700">Documents: {records.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Collection Manager Component */}        <div className="mb-8">
          <CollectionManager 
            collections={collections} 
            onCollectionCreated={handleCollectionCreated}
            onCollectionDeleted={handleCollectionDeleted}
            onCollectionSelect={handleCollectionSelect}
            selectedCollectionId={selectedCollection}
          />
        </div>
        
        {/* Main Content Area */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          {/* Enhanced Tab Navigation */}
          <div className="border-b border-gray-200 bg-gray-50">
            <TabNav 
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              fetchCollections={fetchCollections}
              fetchRecords={fetchRecords}
              selectedCollection={selectedCollection}
              isLoading={isLoading}
            />
          </div>
          
          {/* Tab Content */}
          <div className="p-6 md:p-8">
            {/* Upload Tab */}
            {activeTab === 'upload' && (
              <div className="space-y-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="bg-blue-100 rounded-full p-2">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Upload Documents</h2>
                    <p className="text-gray-600">Process your images with OCR technology</p>
                  </div>
                </div>
                <UploadTab 
                  collections={collections}
                  selectedCollection={selectedCollection}
                  handleCollectionChange={handleCollectionChange}
                  files={files}
                  handleFileChange={handleFileChange}
                  handleDrop={handleDrop}
                  handleDragOver={handleDragOver}
                  removeFile={removeFile}
                  setFiles={setFiles}
                  handleUpload={handleUpload}
                  isUploading={isUploading}
                  uploadStatus={uploadStatus}
                />
              </div>
            )}
            
            {/* Records Tab */}
            {activeTab === 'records' && (
              <div className="space-y-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="bg-green-100 rounded-full p-2">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Document Library</h2>
                    <p className="text-gray-600">Browse and search your processed documents</p>
                  </div>
                </div>
                <RecordsTab 
                  collections={collections}
                  selectedCollection={selectedCollection}
                  handleCollectionChange={handleCollectionChange}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  isLoading={isLoading}
                  filteredRecords={filteredRecords}
                  records={records}
                  selectedDocument={selectedDocument}
                  setSelectedDocument={setSelectedDocument}
                  setViewingRecord={setViewingRecord}
                />
              </div>
            )}
          </div>
        </div>
        
        {/* Document Viewer Modal */}
        {viewingRecord && (
          <DocumentViewer 
            record={viewingRecord} 
            onClose={() => setViewingRecord(null)} 
          />
        )}
        
        {/* Debug Information - Only in development */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8">
            <DebugInfo 
              isAuthenticated={isAuthenticated}
              selectedCollection={selectedCollection}
              records={records}
              files={files}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Documents;
