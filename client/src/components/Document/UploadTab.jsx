import React from 'react';
import ImagePreview from './ImagePreview';

const UploadTab = ({ 
  collections, 
  selectedCollection, 
  handleCollectionChange, 
  files, 
  handleFileChange, 
  handleDrop, 
  handleDragOver,
  removeFile,
  setFiles,
  handleUpload,
  isUploading,
  uploadStatus
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">Upload Images for OCR Processing</h2>
      
      <form onSubmit={handleUpload}>
        {/* Collection selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select Collection (Optional)
          </label>
          <select
            className="w-full p-2 border rounded-md focus:ring focus:ring-blue-200"
            value={selectedCollection}
            onChange={handleCollectionChange}
          >
            <option value="">-- No Collection --</option>
            {collections.map(collection => (
              <option key={collection.id} value={collection.id}>
                {collection.name}
              </option>
            ))}
          </select>
        </div>
        
        {/* File input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select Image File(s)
          </label>
          <div 
            className="mt-1 flex flex-col items-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            <div className="space-y-1 text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
                aria-hidden="true"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div className="flex text-sm text-gray-600">
                <label
                  htmlFor="file-upload"
                  className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                >
                  <span>Upload images</span>
                  <input
                    id="file-upload"
                    name="file-upload"
                    type="file"
                    className="sr-only"
                    accept="image/*"
                    multiple
                    onChange={handleFileChange}
                  />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500">
                PNG, JPG, GIF up to 10MB
              </p>
            </div>
            
            {/* Image previews */}
            {files.length > 0 && (
              <div className="mt-6 w-full">
                <div className="flex flex-wrap justify-center">
                  {Array.from(files).map((file, index) => (
                    <ImagePreview 
                      key={index} 
                      file={file} 
                      onRemove={removeFile} 
                    />
                  ))}
                </div>
                <div className="mt-3 text-center">
                  <button 
                    type="button" 
                    onClick={() => setFiles([])} 
                    className="text-sm text-red-600 hover:text-red-800"
                  >
                    Clear all files
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Upload status */}
        {uploadStatus && (
          <div className={`mb-4 p-3 rounded-md ${uploadStatus.startsWith('Error') ? 'bg-red-100 text-red-700' : uploadStatus.startsWith('Successfully') ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
            {uploadStatus}
          </div>
        )}
        
        {/* Upload button */}
        <div className="flex justify-center">
          <button
            type="submit"
            disabled={isUploading || files.length === 0}
            className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
              isUploading || files.length === 0
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
            }`}
          >
            {isUploading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : (
              'Process Images'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UploadTab;
