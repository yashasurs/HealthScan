import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'
import createApiService from '../utils/apiService'
import UploadTab from '../components/Document/UploadTab'
import DebugInfo from '../components/Document/DebugInfo'

const Documents = () => {
  const { isAuthenticated, user } = useAuth();
  const [files, setFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [collections, setCollections] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Fetch collections when component mounts
  useEffect(() => {
    if (isAuthenticated) {
      fetchCollections();
    }
  }, [isAuthenticated]);
  
  // Fetch collections from API
  const fetchCollections = async () => {    try {
      setIsLoading(true);
      const api = createApiService();
      const response = await api.get('/collections/');
      setCollections(response.data);
    } catch (error) {
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
    }
  };
  
  // Remove a file from the selection
  const removeFile = (fileToRemove) => {
    setFiles(files.filter(file => file !== fileToRemove));
  };
  
  // Handle collection change
  const handleCollectionChange = (e) => {
    const collectionId = e.target.value;
    setSelectedCollection(collectionId);
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
      });
        // If a collection is selected, add its ID to the request
      // Records will still be created even without a collection
      if (selectedCollection) {
        // The collection_id should be sent as a query parameter, not in the form data
      }
      
      // Create API service with auth token
      const api = createApiService();
      
      // Make the OCR request
      let url = `/ocr/get-text`;
      // Add collection_id as a query parameter if selected
      if (selectedCollection) {
        url += `?collection_id=${selectedCollection}`;
      }        const response = await api.post(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      const recordsCreated = response.data.length;
      const collectionMessage = selectedCollection 
        ? `and added to collection` 
        : `as independent records`;
      
      setUploadStatus(`Successfully processed ${recordsCreated} file(s) ${collectionMessage}`);
      setFiles([]);
      
    } catch (error) {
      setUploadStatus(`Error: ${error.response?.data?.detail || 'Failed to process files'}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">      {/* Hero Section */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 max-w-7xl">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Document Upload</h1>
              <p className="text-sm sm:text-base text-gray-600">Upload and process your documents with OCR technology</p>
            </div>
            <div className="flex items-center justify-between sm:justify-end gap-4">
              <div className="bg-blue-50 rounded-lg px-3 py-2 sm:px-4">
                <span className="text-xs sm:text-sm font-medium text-blue-700">Collections: {collections.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-7xl">        {/* Main Content Area */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="p-4 sm:p-6 lg:p-8">
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-6">
                <div className="bg-blue-100 rounded-full p-2 self-start sm:self-center">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Upload Documents</h2>
                  <p className="text-sm sm:text-base text-gray-600">Process your images with OCR technology</p>
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
          </div>
        </div>
        
        {/* Debug Information - Only in development */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8">
            <DebugInfo 
              isAuthenticated={isAuthenticated}
              selectedCollection={selectedCollection}
              records={[]}
              files={files}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Documents;
