import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';
import createApiService from '../../utils/apiService';
import { formatDateTime } from '../../utils/dateUtils';

const SharedRecord = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [record, setRecord] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const token = searchParams.get('token');
    
    if (token) {
      fetchSharedRecord(token);
    } else {
      setError('No share token provided');
      setIsLoading(false);
    }
  }, [location.search]);

  const fetchSharedRecord = async (token) => {
    try {
      setIsLoading(true);
      setError(null);
        // Fetch from the shared record endpoint (no auth required)
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'https://healthscan-e868bea9b278.herokuapp.com'}/records/share/${token}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Record not found or share link has expired');
        }
        throw new Error('Failed to fetch shared record');
      }

      const data = await response.json();
      setRecord(data);
    } catch (error) {
      console.error('Error fetching shared record:', error);
      setError(error.message || 'Failed to load shared record. Please check the link and try again.');
    } finally {
      setIsLoading(false);
    }
  };
  const handleDownloadPDF = async () => {
    if (!record) return;
    
    try {
      const searchParams = new URLSearchParams(location.search);
      const token = searchParams.get('token');
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'https://healthscan-e868bea9b278.herokuapp.com'}/records/share/${token}/pdf`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${record.filename || 'shared_record'}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Failed to download PDF. Please try again.');
    }
  };

  const handleSaveRecord = async () => {
    if (!isAuthenticated) {
      // Redirect to login with return URL
      const currentUrl = window.location.href;
      navigate(`/login?returnUrl=${encodeURIComponent(currentUrl)}`);
      return;
    }

    try {
      setIsSaving(true);
      setSaveMessage('');
      
      const searchParams = new URLSearchParams(location.search);
      const token = searchParams.get('token');
      
      const api = createApiService();
      const response = await api.post(`/records/share/${token}/save`);
      
      setSaveMessage('Record saved successfully to your account!');
      
      // Clear message after 3 seconds
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      console.error('Error saving record:', error);
      if (error.response?.status === 400 && error.response?.data?.detail?.includes('already have a copy')) {
        setSaveMessage('You already have a copy of this record in your account.');
      } else {
        setSaveMessage('Failed to save record. Please try again.');
      }
      
      // Clear message after 3 seconds
      setTimeout(() => setSaveMessage(''), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLoginRedirect = () => {
    const currentUrl = window.location.href;
    navigate(`/login?returnUrl=${encodeURIComponent(currentUrl)}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-4 text-gray-600">Loading shared record...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-white rounded-lg shadow-md p-8">
            <svg className="mx-auto h-16 w-16 text-red-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Unable to Load Record</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Go to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!record) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No record data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Shared Medical Record</h1>
                <p className="mt-1 text-sm text-gray-600">
                  This record has been securely shared with you
                </p>
              </div>              <div className="flex items-center space-x-3">
                <button
                  onClick={handleDownloadPDF}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Save to Account Section - Moved to Top */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="px-6 py-4">
            <div className="flex flex-col items-start space-y-2">
              {!isAuthenticated ? (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 w-full">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3 flex-1">
                      <h3 className="text-sm font-medium text-blue-800">Save to Your Account</h3>
                      <div className="mt-2 text-sm text-blue-700">
                        <p>Sign in to save this medical record to your personal account for future access.</p>
                      </div>
                      <div className="mt-3">
                        <button
                          onClick={handleLoginRedirect}
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-200 hover:bg-blue-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                          </svg>
                          Sign In to Save
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 w-full">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3 flex-1">
                      <h3 className="text-sm font-medium text-green-800">Save to Your Account</h3>
                      <div className="mt-2 text-sm text-green-700">
                        <p>Signed in as <strong>{user?.username}</strong>. Save this record to your personal account for future access.</p>
                      </div>
                      <div className="mt-3">
                        <button
                          onClick={handleSaveRecord}
                          disabled={isSaving}
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isSaving ? (
                            <>
                              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Saving...
                            </>
                          ) : (
                            <>
                              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                              </svg>
                              Save Record
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {saveMessage && (
                    <div className={`mt-3 p-2 rounded-md text-sm ${
                      saveMessage.includes('successfully') 
                        ? 'bg-green-100 text-green-700 border border-green-200' 
                        : saveMessage.includes('already have')
                        ? 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                        : 'bg-red-100 text-red-700 border border-red-200'
                    }`}>
                      {saveMessage}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg">
          {/* Record Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{record.filename}</h2>
                <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                  <span>Created: {formatDateTime(record.created_at)}</span>
                  {record.file_type && (
                    <span>Type: {record.file_type}</span>
                  )}
                  {record.file_size && (
                    <span>Size: {Math.round(record.file_size / 1024)} KB</span>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Shared Securely
                </span>
              </div>
            </div>
          </div>          {/* Record Content */}
          <div className="px-6 py-6">
            <div className="prose max-w-none">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Medical Record Content</h3>
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <div className="markdown-content">
                  <ReactMarkdown>{record.content}</ReactMarkdown>
                </div>
              </div>
            </div>          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                <p>This medical record was shared securely using MedicalQR.</p>
                <p className="mt-1">The content above represents the complete shared record.</p>
              </div>
              <button
                onClick={() => navigate('/')}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Visit MedicalQR →
              </button>
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">Security Notice</h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>
                  This record has been shared using a secure, time-limited link. 
                  Please handle this medical information responsibly and in accordance with privacy regulations.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SharedRecord;
