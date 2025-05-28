import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { formatDate, formatDateTime } from '../../utils/dateUtils';

const PreviewModal = ({ item, type, isOpen, onClose }) => {
  // Determine if this is a record or collection first
  const isRecord = type === 'record' || (item?.content !== undefined && item?.filename !== undefined);
  const isCollection = type === 'collection' || (item?.name !== undefined && item?.records !== undefined);
  
  // Set default activeTab based on item type
  const getDefaultTab = () => {
    if (isRecord) {
      return 'content'; // Records only show content tab
    }
    return 'overview'; // Collections show overview by default
  };
  
  const [activeTab, setActiveTab] = useState(getDefaultTab());

  if (!isOpen || !item) return null;

  // Helper functions for records
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
      alert('Content copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };
  const downloadAsTextFile = () => {
    const content = isRecord ? item.content : `# ${item.name}\n\n${item.description ? `## Description\n${item.description}\n\n` : ''}## Records\n${item.records?.map(r => `- ${r.filename || r.id}`).join('\n') || 'No records'}`;
    const filename = isRecord ? (item.filename || `record-${item.id}`) : `collection-${item.name.replace(/[^a-zA-Z0-9]/g, '-')}`;
    
    // Check if content looks like markdown (contains # headers, *, etc.)
    const hasMarkdown = content.includes('#') || content.includes('*') || content.includes('_') || content.includes('`');
    const fileExtension = hasMarkdown ? 'md' : 'txt';
    const mimeType = hasMarkdown ? 'text/markdown' : 'text/plain';
    
    const element = document.createElement('a');
    const file = new Blob([content], { type: mimeType });
    element.href = URL.createObjectURL(file);
    element.download = `${filename}.${fileExtension}`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Get display title
  const getTitle = () => {
    if (isRecord) return item.filename || `Record #${item.id}`;
    if (isCollection) return item.name || `Collection #${item.id}`;
    return 'Preview';
  };

  // Get subtitle
  const getSubtitle = () => {    if (isRecord) {
      return `${getFileTypeDisplay(item.file_type)} • ${formatFileSize(item.file_size)} • ${formatDate(item.created_at)}`;
    }
    if (isCollection) {
      const recordCount = item.records?.length || 0;
      return `${recordCount} document${recordCount !== 1 ? 's' : ''} • Created ${formatDate(item.created_at)}`;
    }
    return '';
  };

  // Calculate stats for records
  const getRecordStats = () => {
    if (!isRecord || !item.content) return null;
    
    const wordCount = item.content.split(/\s+/).filter(word => word.length > 0).length;
    const charCount = item.content.length;
    const lineCount = item.content.split('\n').length;
    const readingTime = Math.ceil(wordCount / 200);
    
    return { wordCount, charCount, lineCount, readingTime };
  };

  // Get collection stats
  const getCollectionStats = () => {
    if (!isCollection) return null;
    
    const recordCount = item.records?.length || 0;
    const totalSize = item.records?.reduce((acc, record) => acc + (record.file_size || 0), 0) || 0;
    const fileTypes = [...new Set(item.records?.map(r => r.file_type).filter(Boolean) || [])];
    const lastUpdated = item.records?.length > 0 
      ? new Date(Math.max(...item.records.map(r => new Date(r.created_at))))
      : new Date(item.created_at);
    
    return { recordCount, totalSize, fileTypes, lastUpdated };
  };

  const recordStats = getRecordStats();
  const collectionStats = getCollectionStats();
  // Determine available tabs
  const getAvailableTabs = () => {
    const tabs = [];
    
    if (isRecord) {
      // Only show content tab for records
      if (item.content) tabs.push({ id: 'content', label: 'Content' });
    }
    
    if (isCollection) {
      tabs.push({ id: 'overview', label: 'Overview' });
      tabs.push({ id: 'records', label: 'Records' });
      tabs.push({ id: 'details', label: 'Details' });
    }
    
    return tabs;
  };

  const availableTabs = getAvailableTabs();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className={`px-6 py-4 text-white ${isRecord ? 'bg-gradient-to-r from-blue-600 to-blue-700' : 'bg-gradient-to-r from-green-600 to-green-700'}`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">{getTitle()}</h2>
              <p className={`text-sm mt-1 ${isRecord ? 'text-blue-100' : 'text-green-100'}`}>
                {getSubtitle()}
              </p>
            </div>
            <button
              onClick={onClose}
              className={`text-white transition-colors ${isRecord ? 'hover:text-blue-200' : 'hover:text-green-200'}`}
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
            {availableTabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? `border-${isRecord ? 'blue' : 'green'}-500 text-${isRecord ? 'blue' : 'green'}-600`
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-160px)]">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {isRecord ? 'Document Overview' : 'Collection Overview'}
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={downloadAsTextFile}
                    className={`px-3 py-2 text-sm rounded-lg transition-colors flex items-center gap-2 ${
                      isRecord 
                        ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                        : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Export
                  </button>
                </div>
              </div>

              {/* Quick Stats */}
              {isRecord && recordStats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-blue-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">{recordStats.charCount.toLocaleString()}</div>
                    <div className="text-sm text-blue-700">Characters</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">{recordStats.wordCount.toLocaleString()}</div>
                    <div className="text-sm text-green-700">Words</div>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-purple-600">{recordStats.lineCount}</div>
                    <div className="text-sm text-purple-700">Lines</div>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-orange-600">{recordStats.readingTime}</div>
                    <div className="text-sm text-orange-700">Min read</div>
                  </div>
                </div>
              )}

              {isCollection && collectionStats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-green-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">{collectionStats.recordCount}</div>
                    <div className="text-sm text-green-700">Documents</div>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">{formatFileSize(collectionStats.totalSize)}</div>
                    <div className="text-sm text-blue-700">Total Size</div>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-purple-600">{collectionStats.fileTypes.length}</div>
                    <div className="text-sm text-purple-700">File Types</div>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-orange-600">{collectionStats.lastUpdated.toLocaleDateString()}</div>
                    <div className="text-sm text-orange-700">Last Updated</div>
                  </div>
                </div>
              )}

              {/* Content Preview */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">
                  {isRecord ? 'Content Preview' : 'Description'}
                </h4>
                <div className="text-sm text-gray-600 leading-relaxed">
                  {isRecord && item.content ? (
                    <p className="line-clamp-6 whitespace-pre-wrap font-mono">
                      {item.content.slice(0, 500)}{item.content.length > 500 ? '...' : ''}
                    </p>
                  ) : isCollection ? (
                    <p>{item.description || 'No description provided for this collection.'}</p>
                  ) : (
                    <p className="text-gray-400 italic">No content available</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Content Tab (Records only) */}
          {activeTab === 'content' && isRecord && item.content && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Document Content</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => copyToClipboard(item.content)}
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
              </div>              <div className="bg-gray-50 rounded-lg p-4">
                <div className="markdown-content">
                  <ReactMarkdown>{item.content}</ReactMarkdown>
                </div>
                {/* Debug info */}
                {process.env.NODE_ENV === 'development' && (
                  <details className="mt-4 text-xs text-gray-500">
                    <summary>Debug: Raw Content</summary>
                    <pre className="mt-2 p-2 bg-gray-100 rounded text-[10px] overflow-auto max-h-20">
                      {item.content}
                    </pre>
                  </details>
                )}
              </div>
            </div>
          )}

          {/* Records Tab (Collections only) */}
          {activeTab === 'records' && isCollection && (
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Collection Records</h3>
              {item.records && item.records.length > 0 ? (
                <div className="space-y-3">
                  {item.records.map((record, index) => (
                    <div key={record.id || index} className="bg-gray-50 rounded-lg p-4 border">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 mb-1">
                            {record.filename || `Record #${record.id}`}
                          </h4>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            {record.file_type && (
                              <span className="bg-gray-200 px-2 py-1 rounded text-xs">
                                {getFileTypeDisplay(record.file_type)}
                              </span>
                            )}
                            {record.file_size && (
                              <span>{formatFileSize(record.file_size)}</span>                            )}
                            <span>Added {formatDate(record.created_at)}</span>
                          </div>
                          {record.content && (
                            <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                              {record.content.slice(0, 150)}...
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p>No records in this collection</p>
                </div>
              )}
            </div>
          )}

          {/* Details Tab */}
          {activeTab === 'details' && (
            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {isRecord ? 'Record Information' : 'Collection Information'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {isRecord && (
                    <>
                      <div className="bg-blue-50 rounded-lg p-4">
                        <h4 className="font-medium text-blue-900 mb-2">File Details</h4>
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="text-blue-700 font-medium">Filename:</span>
                            <span className="text-blue-800 ml-2">{item.filename || 'Unknown'}</span>
                          </div>
                          <div>
                            <span className="text-blue-700 font-medium">File Type:</span>
                            <span className="text-blue-800 ml-2">{getFileTypeDisplay(item.file_type)}</span>
                          </div>
                          <div>
                            <span className="text-blue-700 font-medium">File Size:</span>
                            <span className="text-blue-800 ml-2">{formatFileSize(item.file_size)}</span>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {isCollection && (
                    <div className="bg-green-50 rounded-lg p-4">
                      <h4 className="font-medium text-green-900 mb-2">Collection Details</h4>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-green-700 font-medium">Name:</span>
                          <span className="text-green-800 ml-2">{item.name}</span>
                        </div>
                        <div>
                          <span className="text-green-700 font-medium">Records:</span>
                          <span className="text-green-800 ml-2">{item.records?.length || 0} documents</span>
                        </div>
                        {item.description && (
                          <div>
                            <span className="text-green-700 font-medium">Description:</span>
                            <span className="text-green-800 ml-2">{item.description}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className={`${isRecord ? 'bg-green-50' : 'bg-blue-50'} rounded-lg p-4`}>
                    <h4 className={`font-medium ${isRecord ? 'text-green-900' : 'text-blue-900'} mb-2`}>Timestamps</h4>
                    <div className="space-y-2 text-sm">
                      <div>                        <span className={`${isRecord ? 'text-green-700' : 'text-blue-700'} font-medium`}>Created:</span>
                        <span className={`${isRecord ? 'text-green-800' : 'text-blue-800'} ml-2`}>
                          {formatDateTime(item.created_at)}
                        </span>
                      </div>
                      <div>
                        <span className={`${isRecord ? 'text-green-700' : 'text-blue-700'} font-medium`}>Updated:</span>
                        <span className={`${isRecord ? 'text-green-800' : 'text-blue-800'} ml-2`}>
                          {formatDateTime(item.updated_at)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-purple-50 rounded-lg p-4">
                    <h4 className="font-medium text-purple-900 mb-2">System Details</h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-purple-700 font-medium">ID:</span>
                        <span className="text-purple-800 ml-2 font-mono text-xs">{item.id}</span>
                      </div>
                      <div>
                        <span className="text-purple-700 font-medium">User ID:</span>
                        <span className="text-purple-800 ml-2">{item.user_id}</span>
                      </div>
                      {isRecord && item.collection_id && (
                        <div>
                          <span className="text-purple-700 font-medium">Collection ID:</span>
                          <span className="text-purple-800 ml-2 font-mono text-xs">{item.collection_id}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Analysis Tab (Records only) */}
          {activeTab === 'analysis' && isRecord && recordStats && (
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Content Analysis</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">{recordStats.charCount.toLocaleString()}</div>
                  <div className="text-sm text-blue-700">Characters</div>
                </div>
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">{recordStats.wordCount.toLocaleString()}</div>
                  <div className="text-sm text-green-700">Words</div>
                </div>
                <div className="bg-purple-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">{recordStats.lineCount}</div>
                  <div className="text-sm text-purple-700">Lines</div>
                </div>
                <div className="bg-orange-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-orange-600">{recordStats.readingTime}</div>
                  <div className="text-sm text-orange-700">Min read</div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Content Structure Analysis</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-700 font-medium">Average words per line:</span>
                    <span className="text-gray-800 ml-2">
                      {recordStats.lineCount > 0 ? Math.round(recordStats.wordCount / recordStats.lineCount) : 0}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-700 font-medium">Average characters per word:</span>
                    <span className="text-gray-800 ml-2">
                      {recordStats.wordCount > 0 ? Math.round(recordStats.charCount / recordStats.wordCount) : 0}
                    </span>
                  </div>
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

export default PreviewModal;
