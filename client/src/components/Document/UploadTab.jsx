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
    <div className="space-y-8">      {/* Collection Selection */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 sm:p-6 border border-blue-100">
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          <div className="bg-blue-100 rounded-full p-2 self-start sm:flex-shrink-0">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              Choose Collection (Optional)
            </label>
            <p className="text-xs sm:text-sm text-gray-600 mb-4">
              Select a collection to organize your documents, or leave blank to create independent records
            </p>
            <select
              className="w-full p-3 text-sm sm:text-base border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm transition-all duration-200"
              value={selectedCollection}
              onChange={handleCollectionChange}
            >
              <option value="">-- Create Independent Records --</option>
              {collections.map(collection => (
                <option key={collection.id} value={collection.id}>
                  📁 {collection.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* File Upload Area */}
      <div className="space-y-6">
        <form onSubmit={handleUpload} className="space-y-6">          {/* Drag and Drop Zone */}
          <div 
            className={`relative border-2 border-dashed rounded-xl p-4 sm:p-6 lg:p-8 text-center transition-all duration-300 ${
              files.length > 0 
                ? 'border-green-300 bg-green-50' 
                : 'border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            <div className="space-y-3 sm:space-y-4">
              {files.length === 0 ? (
                <>
                  <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Upload your images</h3>
                    <p className="text-sm sm:text-base text-gray-600 mb-4">Drag and drop your files here, or click to browse</p>
                  </div>
                  <div className="flex justify-center">
                    <label className="relative cursor-pointer">
                      <span className="inline-flex items-center px-4 py-2 sm:px-6 sm:py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 text-sm sm:text-base">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Choose Files
                      </span>
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
                  </div>
                  <p className="text-xs text-gray-500">
                    Supports PNG, JPG, GIF files up to 10MB each
                  </p>
                </>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>                    <p className="text-base sm:text-lg font-medium text-green-700">
                      {files.length} file{files.length > 1 ? 's' : ''} ready for processing
                    </p>
                  </div>
                  
                  {/* File Previews */}
                  <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 mt-6">
                    {Array.from(files).map((file, index) => (
                      <ImagePreview 
                        key={index} 
                        file={file} 
                        onRemove={removeFile} 
                      />
                    ))}
                  </div>
                  
                  {/* Add More Files */}
                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex flex-col sm:flex-row gap-3">
                      <label className="cursor-pointer flex-1 sm:flex-none">
                        <span className="inline-flex items-center justify-center w-full sm:w-auto px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors duration-200 text-sm">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                          Add More Files
                        </span>
                        <input
                          type="file"
                          className="sr-only"
                          accept="image/*"
                          multiple
                          onChange={handleFileChange}
                        />
                      </label>
                      <button 
                        type="button" 
                        onClick={() => setFiles([])} 
                        className="inline-flex items-center justify-center w-full sm:w-auto px-4 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 font-medium rounded-lg transition-colors duration-200 text-sm"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Clear All
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
            {/* Upload Status */}
          {uploadStatus && (
            <div className={`p-3 sm:p-4 rounded-lg border ${
              uploadStatus.startsWith('Error') 
                ? 'bg-red-50 border-red-200 text-red-800' 
                : uploadStatus.startsWith('Successfully') 
                ? 'bg-green-50 border-green-200 text-green-800' 
                : 'bg-blue-50 border-blue-200 text-blue-800'
            }`}>
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-0.5">
                  {uploadStatus.startsWith('Error') ? (
                    <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ) : uploadStatus.startsWith('Successfully') ? (
                    <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                </div>
                <p className="font-medium text-sm sm:text-base">{uploadStatus}</p>
              </div>
            </div>
          )}
          
          {/* Process Button */}
          <div className="flex justify-center pt-4 sm:pt-6">
            <button
              type="submit"
              disabled={isUploading || files.length === 0}
              className={`w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg transition-all duration-300 transform ${
                isUploading || files.length === 0
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                  : 'bg-gradient bg-blue-600 text-white shadow-lg hover:shadow-xl hover:scale-105'
              }`}
            >
              {isUploading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing Images...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Process Images with OCR
                </span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadTab;
