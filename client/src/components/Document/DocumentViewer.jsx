import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import LoadingSpinner from '../LoadingSpinner';
import { formatDateTime } from '../../utils/dateUtils';

const DocumentViewer = ({ record, onClose }) => {
  const [imageUrl, setImageUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    if (record && record.file_type && record.file_type.startsWith('image/')) {
      // If the record is an image, try to load it
      setIsLoading(true);
      setLoadError(false);
      
      // We'd ideally have an API endpoint to fetch the image
      // For now, we're just showing the OCR content
      setIsLoading(false);
    }
  }, [record]);

  if (!record) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold truncate">{record.filename}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Content */}
        <div className="p-4 overflow-y-auto flex-grow">
          {/* Document metadata */}
          <div className="mb-4 text-sm text-gray-500">            <p><strong>Size:</strong> {Math.round(record.file_size / 1024)} KB</p>
            <p><strong>Type:</strong> {record.file_type}</p>
            <p><strong>Created:</strong> {formatDateTime(record.created_at)}</p>
            {record.updated_at && (
              <p><strong>Updated:</strong> {formatDateTime(record.updated_at)}</p>
            )}
          </div>
              {/* Document content */}
          <div className="border p-4 rounded-md bg-gray-50">
            <h3 className="font-medium mb-2">Extracted Text:</h3>
            {isLoading ? (
              <div className="flex justify-center py-4">
                <LoadingSpinner size="md" />
              </div>
            ) : loadError ? (
              <div className="text-red-500 text-center py-4">
                Failed to load document content
              </div>            ) : (
              <div className="markdown-content">
                <ReactMarkdown>{record.content}</ReactMarkdown>
              </div>
            )}
          </div>
          
          {/* Original Image - This would show if we had an API to retrieve images */}
          {imageUrl && (
            <div className="mt-4 border p-4 rounded-md">
              <h3 className="font-medium mb-2">Original Image:</h3>
              <img 
                src={imageUrl} 
                alt={record.filename}
                className="max-w-full h-auto rounded" 
              />
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="border-t p-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-gray-800"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default DocumentViewer;
