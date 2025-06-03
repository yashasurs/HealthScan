import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import createApiService from '../../utils/apiService';
import LoadingSpinner from '../../components/LoadingSpinner';
import { formatDateTime } from '../../utils/dateUtils';

const RecordDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();  const [record, setRecord] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState('');
  const [editedFilename, setEditedFilename] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // Summary generation state
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [summaryError, setSummaryError] = useState(null);

  // Extract collection info from URL parameters
  const searchParams = new URLSearchParams(location.search);
  const fromCollectionId = searchParams.get('fromCollection');
  const collectionName = searchParams.get('collectionName');

  useEffect(() => {
    if (isAuthenticated && id) {
      fetchRecord();
    }
  }, [isAuthenticated, id]);

  const fetchRecord = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const api = createApiService();
      const response = await api.get(`/records/${id}`);
      setRecord(response.data);
      setEditedContent(response.data.content);
    } catch (error) {
      console.error('Error fetching record:', error);
      if (error.response?.status === 404) {
        setError('Record not found.');
      } else {
        setError('Failed to fetch record. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };
  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    if (!isEditing) {
      setEditedContent(record.content);
      setEditedFilename(record.filename);
    }
  };
  const handleContentChange = (e) => {
    setEditedContent(e.target.value);
  };

  const handleFilenameChange = (e) => {
    setEditedFilename(e.target.value);
  };
  const handleUpdateRecord = async () => {
    if (!record) return;

    // Validate inputs
    if (!editedFilename.trim()) {
      setError('Filename cannot be empty');
      return;
    }

    try {
      setIsLoading(true);
      const api = createApiService();
      
      // Update both filename and content
      await api.patch(`/records/${record.id}`, {
        filename: editedFilename.trim(),
        content: editedContent
      });
      
      setRecord({ 
        ...record, 
        filename: editedFilename.trim(),
        content: editedContent 
      });
      setIsEditing(false);
      showSuccessMessage('Record updated successfully');
    } catch (error) {
      console.error('Error updating record:', error);
      setError('Failed to update record. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteRecord = async () => {
    if (!window.confirm('Are you sure you want to delete this record?')) return;
    
    try {
      setIsLoading(true);
      const api = createApiService();
      await api.delete(`/records/${record.id}`);
      
      showSuccessMessage('Record deleted successfully');
      setTimeout(() => navigate('/records'), 1500);
    } catch (error) {
      console.error('Error deleting record:', error);
      setError('Failed to delete record. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    if (!record) return;
    
    const api = createApiService();
    const downloadUrl = `${api.defaults.baseURL}/records/${record.id}/pdf`;
    
    // Create a temporary anchor element to trigger download
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.setAttribute('download', `record_${record.id}.pdf`);
    link.setAttribute('target', '_blank');
    
    // Add auth header for the download
    const token = localStorage.getItem('token');
    if (token) {
      // For downloads, we need to handle auth differently
      fetch(downloadUrl, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      .then(response => response.blob())
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        link.href = url;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      })
      .catch(err => {
        console.error('Error downloading PDF:', err);
        setError('Failed to download PDF. Please try again.');
      });
    }
  };

  const handleDownloadQR = async () => {
    if (!record) return;
    
    try {
      const api = createApiService();
      const response = await fetch(`${api.defaults.baseURL}/qr/record/${record.id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate QR code');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `record_${record.filename}_qr.png`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      showSuccessMessage('QR code downloaded successfully');
    } catch (error) {
      console.error('Error downloading QR code:', error);
      setError('Failed to generate QR code. Please try again.');
    }
  };  const showSuccessMessage = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleGenerateSummary = async () => {
    if (!record) return;
    
    setIsGeneratingSummary(true);
    setSummaryError(null);
    
    try {
      const api = createApiService();
      const response = await api.get(`/records/${record.id}/summary`);
      
      showSuccessMessage(`Summary generated successfully! New record: "${response.data.filename}"`);
      
      // Optionally navigate to the new summary record
      // navigate(`/records/${response.data.id}`);
    } catch (error) {
      console.error('Error generating summary:', error);
      
      if (error.response?.status === 400) {
        setSummaryError('Record content is too short to summarize. Please ensure the record has substantial medical content.');
      } else if (error.response?.status === 404) {
        setSummaryError('Record not found.');
      } else {
        setSummaryError('Failed to generate summary. Please try again.');
      }
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  if (isLoading && !record) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center py-8">
          <LoadingSpinner />
        </div>
      </div>
    );
  }  if (error && !record) {
    return (
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 sm:p-4 mb-4 text-sm sm:text-base">
          <p>{error}</p>
        </div>        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          {fromCollectionId ? (            <button
              onClick={() => navigate(`/collections/${fromCollectionId}`)}
              className="text-green-600 hover:text-green-800 font-medium transition-colors text-sm sm:text-base py-2 sm:py-0"
            >
              ← Back to {collectionName ? decodeURIComponent(collectionName) : 'Collection'}
            </button>
          ) : null}
          <button
            onClick={() => navigate('/records')}
            className="text-blue-600 hover:text-blue-800 font-medium transition-colors text-sm sm:text-base py-2 sm:py-0"
          >
            ← Back to Records
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">      {/* Breadcrumb */}
      <nav className="mb-4 sm:mb-6">
        <div className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm overflow-x-auto pb-2">          {fromCollectionId ? (            <>              <button
                onClick={() => navigate('/collections')}
                className="text-blue-600 hover:text-blue-800 font-medium transition-colors whitespace-nowrap"
              >
                Collections
              </button>
              <span className="text-gray-500">→</span>              <button
                onClick={() => navigate(`/collections/${fromCollectionId}`)}
                className="text-blue-600 hover:text-blue-800 font-medium transition-colors whitespace-nowrap"
              >
                {collectionName ? decodeURIComponent(collectionName) : 'Collection'}
              </button>
              <span className="text-gray-500">→</span>
              <span className="text-gray-700 font-medium whitespace-nowrap">
                {record?.filename || 'Record Details'}
              </span>
            </>
          ) : (            <>              <button
                onClick={() => navigate('/records')}
                className="text-blue-600 hover:text-blue-800 font-medium transition-colors whitespace-nowrap"
              >
                Records
              </button>
              <span className="text-gray-500">→</span>
              <span className="text-gray-700 font-medium whitespace-nowrap">
                {record?.filename || 'Record Details'}
              </span>
            </>
          )}
        </div>
        
        {/* Back button */}        <div className="mt-2">          {fromCollectionId ? (            <button
              onClick={() => navigate(`/collections/${fromCollectionId}`)}
              className="inline-flex items-center gap-2 text-green-600 hover:text-green-800 font-medium transition-colors text-sm sm:text-base py-2 sm:py-0"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="hidden xs:inline">Back to {collectionName ? decodeURIComponent(collectionName) : 'Collection'}</span>
              <span className="xs:hidden">Back</span>
            </button>
          ) : (            <button
              onClick={() => navigate('/records')}
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium transition-colors text-sm sm:text-base py-2 sm:py-0"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="hidden xs:inline">Back to Records</span>
              <span className="xs:hidden">Back</span>
            </button>
          )}
        </div>
      </nav>      {/* Success message */}
      {successMessage && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-3 sm:p-4 mb-4 text-sm sm:text-base">
          <p>{successMessage}</p>
        </div>
      )}
        {/* Error message */}
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 sm:p-4 mb-4 text-sm sm:text-base">
          <p>{error}</p>
        </div>
      )}
      
      {/* Summary Error message */}
      {summaryError && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 sm:p-4 mb-4 text-sm sm:text-base">
          <p>{summaryError}</p>
        </div>
      )}

      {record && (
        <div className="bg-white rounded-lg shadow-md p-3 sm:p-6">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start mb-4 sm:mb-6 space-y-4 lg:space-y-0">            <div className="flex-1 min-w-0">
              {isEditing ? (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Record Name
                  </label>
                  <input
                    type="text"
                    value={editedFilename}
                    onChange={handleFilenameChange}
                    className="w-full text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 bg-white border border-blue-300 rounded px-3 py-2"
                    placeholder="Enter record name..."
                  />
                </div>
              ) : (
                <div className="flex items-center gap-2 mb-2">
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 break-words">{record.filename}</h1>
                </div>
              )}
              <div className="text-xs sm:text-sm text-gray-500 space-y-1">
                <div>Created: {formatDateTime(record.created_at)}</div>
                <div>Updated: {formatDateTime(record.updated_at)}</div>
                <div>Type: {record.file_type || 'Not specified'}</div>
                <div>Size: {record.file_size ? `${Math.round(record.file_size / 1024)} KB` : 'Unknown'}</div>
              </div>
            </div>
              {/* Action buttons */}
            <div className="flex flex-wrap gap-2 sm:gap-3 lg:flex-shrink-0">
              <button
                onClick={handleDownloadPDF}
                className="inline-flex items-center justify-center gap-2 text-green-600 hover:text-green-800 font-medium transition-colors py-2 sm:py-0 text-sm sm:text-base"
                title="Download as PDF"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="hidden sm:inline">Download PDF</span>
                <span className="sm:hidden">PDF</span>
              </button>              <button
                onClick={handleDownloadQR}
                className="inline-flex items-center justify-center gap-2 text-purple-600 hover:text-purple-800 font-medium transition-colors py-2 sm:py-0 text-sm sm:text-base"
                title="Download QR Code"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>                <span className="hidden sm:inline">Download QR</span>
                <span className="sm:hidden">QR</span>
              </button>

              <button
                onClick={handleGenerateSummary}
                disabled={isGeneratingSummary}
                className="inline-flex items-center justify-center gap-2 text-blue-600 hover:text-blue-800 font-medium transition-colors py-2 sm:py-0 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                title="Generate Medical Summary"
              >
                {isGeneratingSummary ? (
                  <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                )}
                <span className="hidden sm:inline">
                  {isGeneratingSummary ? 'Generating...' : 'Generate Summary'}
                </span>
                <span className="sm:hidden">
                  {isGeneratingSummary ? '...' : 'Summary'}
                </span>
              </button>
                <button
                onClick={handleEditToggle}
                className="inline-flex items-center justify-center gap-2 text-blue-600 hover:text-blue-800 font-medium transition-colors py-2 sm:py-0 text-sm sm:text-base"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isEditing ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  )}
                </svg>
                {isEditing ? 'Cancel' : 'Edit'}
              </button>
                <button
                onClick={handleDeleteRecord}
                className="inline-flex items-center justify-center gap-2 text-red-600 hover:text-red-800 font-medium transition-colors py-2 sm:py-0 text-sm sm:text-base"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete
              </button>
            </div>
          </div>          {/* Content */}
          {isEditing ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Record Content
              </label>
              <textarea
                value={editedContent}
                onChange={handleContentChange}
                className="w-full h-64 sm:h-80 lg:h-96 p-3 sm:p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-xs sm:text-sm resize-none"
                placeholder="Record content..."
              /><div className="mt-3 sm:mt-4 flex justify-end">                <button
                  onClick={handleUpdateRecord}
                  className="inline-flex items-center gap-2 text-green-600 hover:text-green-800 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed py-2 sm:py-0 text-sm sm:text-base"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span className="hidden sm:inline">Saving...</span>
                      <span className="sm:hidden">...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="hidden sm:inline">Save Changes</span>
                      <span className="sm:hidden">Save</span>
                    </>
                  )}
                </button>
              </div>            </div>
          ) : (
            <div className="bg-gray-50 p-3 sm:p-4 lg:p-6 rounded-lg border border-gray-200 min-h-[300px] sm:min-h-[400px]">
              <div className="markdown-content text-sm sm:text-base">
                <ReactMarkdown>{record.content}</ReactMarkdown>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RecordDetail;
