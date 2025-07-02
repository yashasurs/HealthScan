import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import createApiService, { doctorAPI } from '../utils/apiService';
import { formatDate } from '../utils/dateUtils';
import LoadingSpinner from '../components/LoadingSpinner';
import { TwoFactorSettings } from '../components/TwoFactor';

// Icons
const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
  </svg>
);

const EmailIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
  </svg>
);

const PhoneIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
  </svg>
);

const HeartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
  </svg>
);

const IdentificationIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
  </svg>
);

const ExclamationIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
  </svg>
);

const CalendarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
  </svg>
);

const EditIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const Profile = () => {
  const { user, isAuthenticated, getCurrentUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // Doctor verification state
  const [isDoctorVerifying, setIsDoctorVerifying] = useState(false);
  const [doctorVerificationFile, setDoctorVerificationFile] = useState(null);
  const [doctorVerificationResult, setDoctorVerificationResult] = useState(null);
  const [doctorVerificationError, setDoctorVerificationError] = useState('');
  
  // Form state
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    phone_number: '',
    blood_group: '',
    aadhar: '',
    allergies: '',
    visit_date: ''
  });

  const bloodGroupOptions = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  // Load user data into form
  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        email: user.email || '',
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        phone_number: user.phone_number || '',
        blood_group: user.blood_group || '',
        aadhar: user.aadhar || '',
        allergies: user.allergies || '',
        visit_date: user.visit_date ? user.visit_date.split('T')[0] : ''
      });
    }
  }, [user]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleEdit = () => {
    setIsEditing(true);
    setError('');
    setSuccessMessage('');
  };
  const handleCancel = () => {
    setIsEditing(false);
    setError('');
    setSuccessMessage('');
    // Reset form data to original user data
    if (user) {
      setFormData({
        username: user.username || '',
        email: user.email || '',
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        phone_number: user.phone_number || '',
        blood_group: user.blood_group || '',
        aadhar: user.aadhar || '',
        allergies: user.allergies || '',
        visit_date: user.visit_date ? user.visit_date.split('T')[0] : ''
      });
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError('');
    setSuccessMessage('');

    try {
      const api = createApiService();
        // Prepare data for API call
      const updateData = {
        username: formData.username || null,
        email: formData.email || null,
        first_name: formData.first_name || null,
        last_name: formData.last_name || null,
        phone_number: formData.phone_number || null,
        blood_group: formData.blood_group || null,
        aadhar: formData.aadhar || null,
        allergies: formData.allergies || null,
        visit_date: formData.visit_date ? new Date(formData.visit_date).toISOString() : null
      };

      await api.put('/user', updateData);
      
      // Refresh user data
      await getCurrentUser();
      
      setIsEditing(false);
      setSuccessMessage('Profile updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
      
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.response?.data?.detail || 'Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Doctor verification functions
  const handleDoctorVerificationFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type (PDF or common image formats)
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        setDoctorVerificationError('Please upload a PDF or image file (JPEG, PNG)');
        return;
      }
      
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setDoctorVerificationError('File size must be less than 10MB');
        return;
      }
      
      setDoctorVerificationFile(file);
      setDoctorVerificationError('');
    }
  };

  const handleSubmitDoctorVerification = async () => {
    if (!doctorVerificationFile) {
      setDoctorVerificationError('Please select a resume file to upload');
      return;
    }

    setIsDoctorVerifying(true);
    setDoctorVerificationError('');
    setDoctorVerificationResult(null);

    try {
      const response = await doctorAPI.registerDoctor(doctorVerificationFile);

      setDoctorVerificationResult(response.data);
      
      // Refresh user data to update role if verification was successful
      if (response.data.success) {
        await getCurrentUser();
        setSuccessMessage('Doctor verification submitted successfully!');
        setDoctorVerificationFile(null);
        // Clear file input
        const fileInput = document.getElementById('doctor-verification-file');
        if (fileInput) fileInput.value = '';
      }
      
    } catch (err) {
      console.error('Error submitting doctor verification:', err);
      setDoctorVerificationError(
        err.response?.data?.detail || 'Failed to submit verification. Please try again.'
      );
    } finally {
      setIsDoctorVerifying(false);
    }
  };

  const clearDoctorVerification = () => {
    setDoctorVerificationFile(null);
    setDoctorVerificationResult(null);
    setDoctorVerificationError('');
    const fileInput = document.getElementById('doctor-verification-file');
    if (fileInput) fileInput.value = '';
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Please Log In</h2>
          <p className="text-gray-600">You need to be logged in to view your profile.</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">                <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">
                    {user.first_name 
                      ? user.first_name.charAt(0).toUpperCase() 
                      : user.username 
                        ? user.username.charAt(0).toUpperCase() 
                        : 'U'}
                  </span>
                </div><div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {user.first_name || user.last_name 
                      ? `${user.first_name || ''} ${user.last_name || ''}`.trim()
                      : user.username || 'User'}
                  </h1>
                  <p className="text-gray-600">{user.email}</p>
                  {user.phone_number && (
                    <p className="text-sm text-gray-500">{user.phone_number}</p>
                  )}
                </div>
              </div>
              
              {!isEditing ? (
                <button
                  onClick={handleEdit}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
                >
                  <EditIcon />
                  <span className="ml-2">Edit Profile</span>
                </button>
              ) : (
                <div className="space-x-3">
                  <button
                    onClick={handleCancel}
                    disabled={isSaving}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50"
                  >
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
            <div className="flex">
              <ExclamationIcon />
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {successMessage && (
          <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-green-700">{successMessage}</p>
              </div>
            </div>
          </div>
        )}

        {/* Two-Factor Authentication Settings - Moved to top for visibility */}
        <div className="mb-6">
          <TwoFactorSettings />
        </div>

        {/* Doctor Verification Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-medium text-gray-900">Doctor Verification</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Upload your medical resume to get verified as a healthcare professional
                </p>
              </div>
              {user?.role === 'DOCTOR' && (
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium text-green-700">Verified Doctor</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="px-6 py-4">
            {user?.role === 'DOCTOR' ? (
              // Already verified doctor
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">You're Verified!</h3>
                <p className="text-gray-600">
                  Your medical credentials have been verified. You now have access to doctor features.
                </p>
                {user?.resume_verification_confidence && (
                  <p className="text-sm text-gray-500 mt-2">
                    Verification confidence: {Math.round(user.resume_verification_confidence)}%
                  </p>
                )}
              </div>
            ) : (
              // Not yet verified
              <div className="space-y-4">
                <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-blue-800">Doctor Verification Requirements</h3>
                      <div className="mt-2 text-sm text-blue-700">
                        <ul className="list-disc pl-5 space-y-1">
                          <li>Upload your medical resume (PDF or image format)</li>
                          <li>Resume should include medical degrees (MD, MBBS, DO)</li>
                          <li>Include hospital experience and medical specializations</li>
                          <li>Medical licenses and certifications are helpful</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* File Upload Section */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Upload Medical Resume
                  </label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-gray-400 transition-colors">
                    <div className="space-y-1 text-center">
                      <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <div className="flex text-sm text-gray-600">
                        <label htmlFor="doctor-verification-file" className="relative cursor-pointer bg-white rounded-md font-medium text-black hover:text-gray-800 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-black">
                          <span>Upload a file</span>
                          <input
                            id="doctor-verification-file"
                            name="doctor-verification-file"
                            type="file"
                            className="sr-only"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={handleDoctorVerificationFileChange}
                            disabled={isDoctorVerifying}
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">PDF, PNG, JPG up to 10MB</p>
                    </div>
                  </div>
                  
                  {doctorVerificationFile && (
                    <div className="mt-3 flex items-center justify-between bg-gray-50 px-3 py-2 rounded-md">
                      <div className="flex items-center space-x-2">
                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span className="text-sm text-gray-900">{doctorVerificationFile.name}</span>
                        <span className="text-xs text-gray-500">
                          ({(doctorVerificationFile.size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                      </div>
                      <button
                        onClick={clearDoctorVerification}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                        disabled={isDoctorVerifying}
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>

                {/* Error Display */}
                {doctorVerificationError && (
                  <div className="bg-red-50 border-l-4 border-red-400 p-4">
                    <div className="flex">
                      <ExclamationIcon />
                      <div className="ml-3">
                        <p className="text-sm text-red-700">{doctorVerificationError}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Verification Result */}
                {doctorVerificationResult && (
                  <div className={`border-l-4 p-4 ${
                    doctorVerificationResult.success 
                      ? 'bg-green-50 border-green-400' 
                      : 'bg-red-50 border-red-400'
                  }`}>
                    <div className="flex">
                      <div className="ml-3">
                        <p className={`text-sm ${
                          doctorVerificationResult.success 
                            ? 'text-green-700' 
                            : 'text-red-700'
                        }`}>
                          {doctorVerificationResult.message}
                        </p>
                        {doctorVerificationResult.verification_confidence && (
                          <p className="text-xs text-gray-600 mt-1">
                            Confidence: {Math.round(doctorVerificationResult.verification_confidence)}%
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <div className="flex justify-end">
                  <button
                    onClick={handleSubmitDoctorVerification}
                    disabled={!doctorVerificationFile || isDoctorVerifying}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isDoctorVerifying ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Verifying...
                      </>
                    ) : (
                      'Submit for Verification'
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Profile Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Profile Information</h2>
          </div>
          
          <div className="px-6 py-4 space-y-6">            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Username
                </label>
                {isEditing ? (
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <UserIcon />
                    </div>
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) => handleInputChange('username', e.target.value)}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                      placeholder="Enter username"
                    />
                  </div>
                ) : (
                  <div className="flex items-center space-x-3 py-2">
                    <UserIcon />
                    <span className="text-gray-900">{user.username || 'Not provided'}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                {isEditing ? (
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <EmailIcon />
                    </div>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                      placeholder="Enter email"
                    />
                  </div>
                ) : (
                  <div className="flex items-center space-x-3 py-2">
                    <EmailIcon />
                    <span className="text-gray-900">{user.email || 'Not provided'}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name
                </label>
                {isEditing ? (
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <UserIcon />
                    </div>
                    <input
                      type="text"
                      value={formData.first_name}
                      onChange={(e) => handleInputChange('first_name', e.target.value)}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                      placeholder="Enter first name"
                    />
                  </div>
                ) : (
                  <div className="flex items-center space-x-3 py-2">
                    <UserIcon />
                    <span className="text-gray-900">{user.first_name || 'Not provided'}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name
                </label>
                {isEditing ? (
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <UserIcon />
                    </div>
                    <input
                      type="text"
                      value={formData.last_name}
                      onChange={(e) => handleInputChange('last_name', e.target.value)}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                      placeholder="Enter last name"
                    />
                  </div>
                ) : (
                  <div className="flex items-center space-x-3 py-2">
                    <UserIcon />
                    <span className="text-gray-900">{user.last_name || 'Not provided'}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                {isEditing ? (
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <PhoneIcon />
                    </div>
                    <input
                      type="tel"
                      value={formData.phone_number}
                      onChange={(e) => handleInputChange('phone_number', e.target.value)}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                      placeholder="Enter phone number"
                    />
                  </div>
                ) : (
                  <div className="flex items-center space-x-3 py-2">
                    <PhoneIcon />
                    <span className="text-gray-900">{user.phone_number || 'Not provided'}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Medical Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Blood Group
                </label>
                {isEditing ? (
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <HeartIcon />
                    </div>
                    <select
                      value={formData.blood_group}
                      onChange={(e) => handleInputChange('blood_group', e.target.value)}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                    >
                      <option value="">Select blood group</option>
                      {bloodGroupOptions.map(option => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="flex items-center space-x-3 py-2">
                    <HeartIcon />
                    <span className="text-gray-900">{user.blood_group || 'Not provided'}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Aadhar Number
                </label>
                {isEditing ? (
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <IdentificationIcon />
                    </div>
                    <input
                      type="text"
                      value={formData.aadhar}
                      onChange={(e) => handleInputChange('aadhar', e.target.value)}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                      placeholder="Enter Aadhar number"
                      maxLength="12"
                    />
                  </div>
                ) : (
                  <div className="flex items-center space-x-3 py-2">
                    <IdentificationIcon />
                    <span className="text-gray-900">{user.aadhar || 'Not provided'}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Allergies */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Allergies
              </label>
              {isEditing ? (
                <div className="relative">
                  <div className="absolute top-3 left-0 pl-3 flex items-start pointer-events-none">
                    <ExclamationIcon />
                  </div>
                  <textarea
                    value={formData.allergies}
                    onChange={(e) => handleInputChange('allergies', e.target.value)}
                    rows={3}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-black resize-none"
                    placeholder="List any allergies you may have"
                  />
                </div>
              ) : (
                <div className="flex space-x-3 py-2">
                  <div className="mt-1">
                    <ExclamationIcon />
                  </div>
                  <span className="text-gray-900">
                    {user.allergies || 'No allergies listed'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Doctor Verification Section - New */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mt-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Doctor Verification</h2>
          </div>
          
          <div className="px-6 py-4 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Verification Document
              </label>
              <div className="flex items-center">
                <input
                  id="doctor-verification-file"
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf"
                  onChange={handleDoctorVerificationFileChange}
                  className="block w-full text-sm text-gray-900 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                />
              </div>
              {doctorVerificationError && (
                <p className="mt-2 text-sm text-red-600">{doctorVerificationError}</p>
              )}
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleSubmitDoctorVerification}
                disabled={isDoctorVerifying}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50"
              >
                {isDoctorVerifying ? 'Verifying...' : 'Verify Doctor'}
              </button>
            </div>

            {doctorVerificationResult && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
                <p className="text-sm text-green-700">
                  Doctor verification successful! Details:
                </p>
                <pre className="mt-2 text-sm text-green-800 bg-white p-3 rounded-md">
                  {JSON.stringify(doctorVerificationResult, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
