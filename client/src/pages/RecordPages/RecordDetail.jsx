import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import createApiService from '../../utils/apiService';
import LoadingSpinner from '../../components/LoadingSpinner';

const RecordDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [record, setRecord] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

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
    }
  };

  const handleContentChange = (e) => {
    setEditedContent(e.target.value);
  };

  const handleUpdateRecord = async () => {
    if (!record) return;

    try {
      setIsLoading(true);
      const api = createApiService();
      await api.patch(`/records/${record.id}?content=${encodeURIComponent(editedContent)}`);
      
      setRecord({ ...record, content: editedContent });
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

  const showSuccessMessage = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  if (isLoading && !record) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center py-8">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (error && !record) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
          <p>{error}</p>
        </div>
        <button
          onClick={() => navigate('/records')}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          Back to Records
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6">
        <button
          onClick={() => navigate('/records')}
          className="text-blue-500 hover:text-blue-700 font-medium"
        >
          ← Back to Records
        </button>
      </nav>

      {/* Success message */}
      {successMessage && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4">
          <p>{successMessage}</p>
        </div>
      )}
      
      {/* Error message */}
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
          <p>{error}</p>
        </div>
      )}

      {record && (
        <div className="bg-white rounded-lg shadow-md p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">{record.filename}</h1>
              <div className="text-sm text-gray-500 space-y-1">
                <div>Created: {formatDate(record.created_at)}</div>
                <div>Updated: {formatDate(record.updated_at)}</div>
                <div>Type: {record.file_type || 'Not specified'}</div>
                <div>Size: {record.file_size ? `${Math.round(record.file_size / 1024)} KB` : 'Unknown'}</div>
              </div>
            </div>
            
            {/* Action buttons */}
            <div className="flex space-x-3">
              <button
                onClick={handleDownloadPDF}
                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                title="Download as PDF"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                PDF
              </button>
              
              <button
                onClick={handleEditToggle}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
              >
                {isEditing ? 'Cancel' : 'Edit'}
              </button>
              
              <button
                onClick={handleDeleteRecord}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
          
          {/* Content */}
          {isEditing ? (
            <div>
              <textarea
                value={editedContent}
                onChange={handleContentChange}
                className="w-full h-96 p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                placeholder="Record content..."
              />
              <div className="mt-4 flex justify-end">
                <button
                  onClick={handleUpdateRecord}
                  className="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50"
                  disabled={isLoading}
                >
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 whitespace-pre-wrap min-h-[400px] font-mono text-sm leading-relaxed">
              {record.content}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RecordDetail;
