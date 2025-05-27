import React, { useState } from 'react';
import { formatDateTime } from '../../utils/dateUtils';

const RecordPreviewModal = ({ record, isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('content');

  if (!isOpen || !record) return null;

  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown size';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileTypeDisplay = (fileType) => {
    if (!fileType) return 'Unknown';
    const typeMap = {
      'application/pdf': 'PDF Document',
      'image/jpeg': 'JPEG Image',
      'image/jpg': 'JPG Image', 
      'image/png': 'PNG Image',
      'image/gif': 'GIF Image',
      'image/webp': 'WebP Image',
      'text/plain': 'Text File',
      'application/msword': 'Word Document',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Word Document'
    };
    return typeMap[fileType] || fileType.split('/')[1]?.toUpperCase() || 'Unknown';
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      // You could add a toast notification here
      alert('Content copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const downloadAsTextFile = () => {
    const element = document.createElement('a');
    const file = new Blob([record.content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${record.filename || `record-${record.id}`}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const wordCount = record.content ? record.content.split(/\s+/).filter(word => word.length > 0).length : 0;
  const charCount = record.content ? record.content.length : 0;
  const lineCount = record.content ? record.content.split('\n').length : 0;
  const readingTime = Math.ceil(wordCount / 200);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">
                {record.filename || `Record #${record.id}`}              </h2>
              <p className="text-blue-100 text-sm mt-1">
                {getFileTypeDisplay(record.file_type)} • {formatFileSize(record.file_size)} • {formatDateTime(record.created_at)}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-blue-200 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex px-6">
            <button
              onClick={() => setActiveTab('content')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'content'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Content
            </button>
            <button
              onClick={() => setActiveTab('details')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'details'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Details
            </button>
            <button
              onClick={() => setActiveTab('analysis')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'analysis'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Analysis
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-160px)]">
          {activeTab === 'content' && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Document Content</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => copyToClipboard(record.content)}
                    className="px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copy
                  </button>
                  <button
                    onClick={downloadAsTextFile}
                    className="px-3 py-2 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Download
                  </button>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <pre className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed font-mono">
                  {record.content}
                </pre>
              </div>
            </div>
          )}

          {activeTab === 'details' && (
            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Record Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 mb-2">File Details</h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-blue-700 font-medium">Filename:</span>
                        <span className="text-blue-800 ml-2">{record.filename || 'Unknown'}</span>
                      </div>
                      <div>
                        <span className="text-blue-700 font-medium">File Type:</span>
                        <span className="text-blue-800 ml-2">{getFileTypeDisplay(record.file_type)}</span>
                      </div>
                      <div>
                        <span className="text-blue-700 font-medium">File Size:</span>
                        <span className="text-blue-800 ml-2">{formatFileSize(record.file_size)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 rounded-lg p-4">
                    <h4 className="font-medium text-green-900 mb-2">Timestamps</h4>                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-green-700 font-medium">Created:</span>
                        <span className="text-green-800 ml-2">{formatDateTime(record.created_at)}</span>
                      </div>
                      <div>
                        <span className="text-green-700 font-medium">Updated:</span>
                        <span className="text-green-800 ml-2">{formatDateTime(record.updated_at)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-purple-50 rounded-lg p-4">
                    <h4 className="font-medium text-purple-900 mb-2">System Details</h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-purple-700 font-medium">Record ID:</span>
                        <span className="text-purple-800 ml-2 font-mono text-xs">{record.id}</span>
                      </div>
                      <div>
                        <span className="text-purple-700 font-medium">User ID:</span>
                        <span className="text-purple-800 ml-2">{record.user_id}</span>
                      </div>
                      {record.collection_id && (
                        <div>
                          <span className="text-purple-700 font-medium">Collection ID:</span>
                          <span className="text-purple-800 ml-2 font-mono text-xs">{record.collection_id}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'analysis' && (
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Content Analysis</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">{charCount.toLocaleString()}</div>
                  <div className="text-sm text-blue-700">Characters</div>
                </div>
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">{wordCount.toLocaleString()}</div>
                  <div className="text-sm text-green-700">Words</div>
                </div>
                <div className="bg-purple-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">{lineCount}</div>
                  <div className="text-sm text-purple-700">Lines</div>
                </div>
                <div className="bg-orange-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-orange-600">{readingTime}</div>
                  <div className="text-sm text-orange-700">Min read</div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Content Preview</h4>
                <div className="text-sm text-gray-600 leading-relaxed">
                  <p className="line-clamp-6">
                    {record.content}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecordPreviewModal;
