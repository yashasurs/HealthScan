import React from 'react';
import ReactMarkdown from 'react-markdown';
import { formatDate } from '../../../utils/dateUtils';

const DocumentCard = ({
  record,
  isSelectionMode,
  isSelected,
  isExpanded,
  onToggleSelection,
  onToggleExpansion,
  onRecordClick,
  onMoveRecord,
  onRemoveRecord
}) => {
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

  const truncateContent = (content, maxLength = 200) => {
    if (!content) return '';
    return content.length > maxLength ? content.substring(0, maxLength) + '...' : content;
  };
  return (
    <div
      className={`bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border overflow-hidden ${
        isSelectionMode && isSelected
          ? 'border-blue-500 bg-blue-50'
          : 'border-gray-200'
      }`}
    >
      <div className="p-4 sm:p-5 lg:p-7">        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between space-y-4 lg:space-y-0 lg:space-x-6">
          <div className="flex items-start gap-3 sm:gap-4 flex-1">            {isSelectionMode && (
              <div className="mt-1 flex-shrink-0">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => onToggleSelection(record.id)}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>
            )}
            
            <div className="bg-green-100 rounded-lg p-2.5 flex-shrink-0">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            
            <div className="flex-1 min-w-0">
              <div>                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-3">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 break-words">
                    {record.filename || `Record #${record.id}`}
                  </h3>
                  
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    <button
                      onClick={() => onToggleExpansion(record.id)}
                      className="text-blue-600 hover:text-blue-800 text-xs sm:text-sm font-medium flex items-center gap-1"
                      title={isExpanded ? "Collapse details" : "Expand details"}
                    >
                      {isExpanded ? (
                        <>
                          <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                          </svg>
                          <span className="hidden xs:inline">Less</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                          <span className="hidden xs:inline">More</span>
                        </>
                      )}
                    </button>
                    
                    <button
                      onClick={() => onRecordClick(record)}
                      className="inline-flex items-center gap-1 sm:gap-2 text-green-600 hover:text-green-800 font-medium transition-colors text-xs sm:text-sm"
                      title="View record details"
                    >
                      <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      <span className="hidden sm:inline">View Details</span>
                      <span className="sm:hidden">View</span>
                    </button>
                  </div>
                </div>                {/* File Information */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5 text-xs sm:text-sm text-gray-500 mb-4">
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Added {formatDate(record.created_at)}</span>
                  </div>
                  
                  {record.file_type && (
                    <div className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      <span className="bg-gray-100 px-2 py-1 rounded-full text-xs">
                        {getFileTypeDisplay(record.file_type)}
                      </span>
                    </div>
                  )}
                  
                  {record.file_size && (
                    <div className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      <span>{formatFileSize(record.file_size)}</span>
                    </div>
                  )}
                </div>
              </div>              {/* Content Preview */}
              {record.content && (
                <div className="bg-gray-50 rounded-lg p-4 sm:p-5 mb-5">
                  <div className="flex items-center mb-3">
                    <h4 className="text-sm font-medium text-gray-700">Content Preview:</h4>
                  </div>
                  <div className="text-gray-600 text-sm leading-relaxed">
                    {isExpanded ? (
                      <div className="markdown-content max-h-96 overflow-y-auto">
                        <ReactMarkdown>{record.content}</ReactMarkdown>
                      </div>
                    ) : (
                      <p className="line-clamp-3">
                        {truncateContent(record.content)}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>          {!isSelectionMode && (
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 lg:ml-6 lg:flex-shrink-0">              <button
                onClick={() => onMoveRecord(record.id)}
                className="inline-flex items-center justify-center gap-2 px-3 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg font-medium transition-all duration-200 border border-transparent hover:border-blue-200"
                title="Move to another collection"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
                <span className="font-medium">Move</span>
              </button>
              <button
                onClick={() => onRemoveRecord(record.id)}
                className="inline-flex items-center justify-center gap-2 px-3 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg font-medium transition-all duration-200 border border-transparent hover:border-red-200"
                title="Remove from collection"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span className="font-medium">Remove</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentCard;
