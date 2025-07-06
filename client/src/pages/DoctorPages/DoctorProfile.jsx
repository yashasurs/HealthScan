import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createApiService } from '../../utils/apiService';
import LoadingSpinner from '../../components/LoadingSpinner';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { useAuth } from '../../context/AuthContext';

const DoctorProfile = () => {
  const [formData, setFormData] = useState({
    specialization: '',
    medical_license_number: '',
    hospital_affiliation: '',
    years_of_experience: ''
  });
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Initialize form with current user data
    if (user) {
      setFormData({
        specialization: user.specialization || '',
        medical_license_number: user.medical_license_number || '',
        hospital_affiliation: user.hospital_affiliation || '',
        years_of_experience: user.years_of_experience || ''
      });
      setInitialLoading(false);
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const api = createApiService();
      
      // Prepare data for submission
      const updateData = {
        specialization: formData.specialization || null,
        medical_license_number: formData.medical_license_number || null,
        hospital_affiliation: formData.hospital_affiliation || null,
        years_of_experience: formData.years_of_experience ? parseInt(formData.years_of_experience) : null
      };

      const response = await api.put('/doctor/info', updateData);
      
      setSuccess('Profile updated successfully!');
      // Refresh user data
      await refreshUser();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
      
    } catch (err) {
      console.error('Profile update error:', err);
      setError(
        err.response?.data?.detail || 
        'An error occurred while updating your profile. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return <LoadingSpinner size="lg" text="Loading profile..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Doctor Profile</h1>
              <p className="text-gray-600 mt-1">Manage your professional information</p>
            </div>
            <button
              onClick={() => navigate('/doctor/dashboard')}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Dashboard
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Summary Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="text-center">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Dr. {user?.first_name} {user?.last_name}
                </h3>
                <p className="text-gray-600">{user?.email}</p>
                
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="space-y-2">
                    <div className="flex items-center justify-center">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        user?.resume_verification_status 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-orange-100 text-orange-800'
                      }`}>
                        {user?.resume_verification_status ? 'Verified Doctor' : 'Verification Pending'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      Member since {new Date(user?.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Verification Status */}
            {!user?.resume_verification_status && (
              <div className="mt-6 bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-orange-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-orange-800">Verification Required</p>
                    <p className="text-xs text-orange-600 mt-1">
                      Complete doctor verification to access all features
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => navigate('/doctor/register')}
                  className="mt-3 w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-orange-700 bg-orange-100 hover:bg-orange-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                >
                  Complete Verification
                </button>
              </div>
            )}
          </div>

          {/* Profile Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-6">Professional Information</h2>

              {success && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <p className="text-green-700">{success}</p>
                  </div>
                </div>
              )}

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <p className="text-red-700">{error}</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Input
                    label="Specialization"
                    name="specialization"
                    type="text"
                    value={formData.specialization}
                    onChange={handleInputChange}
                    placeholder="e.g., Cardiology, Pediatrics, General Medicine"
                    helpText="Your medical specialization or area of expertise"
                  />
                </div>

                <div>
                  <Input
                    label="Medical License Number"
                    name="medical_license_number"
                    type="text"
                    value={formData.medical_license_number}
                    onChange={handleInputChange}
                    placeholder="Your medical license number"
                    helpText="Your official medical license registration number"
                  />
                </div>

                <div>
                  <Input
                    label="Hospital Affiliation"
                    name="hospital_affiliation"
                    type="text"
                    value={formData.hospital_affiliation}
                    onChange={handleInputChange}
                    placeholder="e.g., AIIMS Delhi, Apollo Hospital"
                    helpText="Primary hospital or healthcare institution where you practice"
                  />
                </div>

                <div>
                  <Input
                    label="Years of Experience"
                    name="years_of_experience"
                    type="number"
                    value={formData.years_of_experience}
                    onChange={handleInputChange}
                    placeholder="e.g., 5"
                    min="0"
                    max="50"
                    helpText="Total years of medical practice experience"
                  />
                </div>

                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/doctor/dashboard')}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="min-w-[120px]"
                  >
                    {loading ? (
                      <div className="flex items-center">
                        <LoadingSpinner size="sm" />
                        <span className="ml-2">Saving...</span>
                      </div>
                    ) : (
                      'Save Changes'
                    )}
                  </Button>
                </div>
              </form>
            </div>

            {/* Additional Information */}
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-blue-900 mb-2">Profile Guidelines</h3>
              <ul className="text-xs text-blue-800 space-y-1">
                <li>• Keep your professional information up to date for better patient trust</li>
                <li>• Accurate specialization helps patients find the right care</li>
                <li>• Hospital affiliation adds credibility to your profile</li>
                <li>• All information is visible to your assigned patients</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorProfile;
