import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import createApiService from '../utils/apiService';

const SaveSharedRecordButton = ({ shareToken, recordData, onSaveSuccess }) => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

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
      
      const api = createApiService();
      const response = await api.post(`/records/share/${shareToken}/save`);
      
      setSaveMessage('Record saved successfully to your account!');
      if (onSaveSuccess) {
        onSaveSuccess(response.data);
      }
      
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

  return (
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
  );
};

export default SaveSharedRecordButton;
