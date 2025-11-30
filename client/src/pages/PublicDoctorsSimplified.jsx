import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { publicAPI, patientAPI } from '../utils/apiService';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

const PublicDoctorsSimplified = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { user, isAuthenticated } = useAuth();
  
  // Assignment state
  const [assigningDoctorId, setAssigningDoctorId] = useState(null);
  const [myDoctorId, setMyDoctorId] = useState(null);
  const [assignmentMessage, setAssignmentMessage] = useState(null);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        // Try the public endpoint first
        try {
          const response = await publicAPI.getDoctors({ verified_only: true, limit: 50 });
          setDoctors(response.data);
        } catch (publicError) {
          console.warn('Public endpoint not available, trying alternative approach');
          // If public endpoint fails, show a message about the feature
          setError('Doctor directory is currently being updated');
          setDoctors([]);
        }
        
      } catch (err) {
        console.error('Doctors fetch error:', err);
        setError('Unable to load doctor directory at this time');
        setDoctors([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  // Fetch current assigned doctor if user is a patient
  useEffect(() => {
    const fetchMyDoctor = async () => {
      if (isAuthenticated && user?.role === 'patient') {
        try {
          const response = await patientAPI.getMyDoctor();
          if (response.data) {
            setMyDoctorId(response.data.id);
          }
        } catch (err) {
          console.log('No doctor assigned yet');
        }
      }
    };
    
    fetchMyDoctor();
  }, [isAuthenticated, user]);

  // Handle doctor assignment
  const handleAssignDoctor = async (doctorId) => {
    if (!isAuthenticated) {
      setAssignmentMessage({ type: 'error', text: 'Please login to assign a doctor' });
      return;
    }

    if (user?.role !== 'patient') {
      setAssignmentMessage({ type: 'error', text: 'Only patients can assign doctors' });
      return;
    }

    setAssigningDoctorId(doctorId);
    setAssignmentMessage(null);

    try {
      const response = await patientAPI.assignDoctor(doctorId);
      setMyDoctorId(doctorId);
      setAssignmentMessage({ 
        type: 'success', 
        text: response.data.message || 'Doctor assigned successfully!' 
      });
      
      setTimeout(() => setAssignmentMessage(null), 5000);
    } catch (err) {
      console.error('Error assigning doctor:', err);
      setAssignmentMessage({ 
        type: 'error', 
        text: err.response?.data?.detail || 'Failed to assign doctor. Please try again.' 
      });
    } finally {
      setAssigningDoctorId(null);
    }
  };

  // Filter doctors by search term
  const filteredDoctors = doctors.filter(doctor => {
    if (!searchTerm) return true;
    const fullName = `${doctor.first_name} ${doctor.last_name}`.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase()) || 
           doctor.email.toLowerCase().includes(searchTerm.toLowerCase());
  });

  if (loading) return <LoadingSpinner size="lg" text="Loading doctors..." />;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Find Verified Doctors</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover qualified medical professionals in our network of verified healthcare providers
          </p>
          {isAuthenticated && user?.role === 'patient' && doctors.length > 0 && (
            <p className="text-sm text-blue-600 mt-3 font-medium">
              Click "Assign as My Doctor" to add a doctor to your healthcare team
            </p>
          )}
        </div>

        {/* Assignment Message Banner */}
        {assignmentMessage && (
          <div className={`mb-6 p-4 rounded-lg border ${
            assignmentMessage.type === 'success' 
              ? 'bg-green-50 border-green-200' 
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {assignmentMessage.type === 'success' ? (
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
                <p className={`text-sm font-medium ${
                  assignmentMessage.type === 'success' ? 'text-green-800' : 'text-red-800'
                }`}>
                  {assignmentMessage.text}
                </p>
              </div>
              <button
                onClick={() => setAssignmentMessage(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-8 bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Doctor Directory Coming Soon</h3>
            <p className="text-gray-600 mb-4">
              We're currently setting up our verified doctor directory. This feature will be available soon.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              In the meantime, you can register as a doctor or explore other platform features.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/doctor/register"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Register as Doctor
              </Link>
              <Link 
                to="/"
                className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Back to Home
              </Link>
            </div>
          </div>
        )}

        {/* Search Bar - Only show if we have doctors */}
        {doctors.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <div className="max-w-md mx-auto">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                Search Doctors
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  id="search"
                  placeholder="Search by doctor name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Doctors Grid */}
        {filteredDoctors.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredDoctors.map((doctor) => {
              const isMyDoctor = myDoctorId === doctor.id;
              const isAssigning = assigningDoctorId === doctor.id;
              
              return (
              <div key={doctor.id} className={`bg-white rounded-lg border-2 p-6 hover:shadow-md transition-all duration-200 ${
                isMyDoctor ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'
              }`}>
                {/* My Doctor Badge */}
                {isMyDoctor && (
                  <div className="mb-3">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-500 text-white">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Your Doctor
                    </span>
                  </div>
                )}
                
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-lg font-bold text-blue-600">
                      {doctor.first_name[0]}{doctor.last_name[0]}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Dr. {doctor.first_name} {doctor.last_name}
                    </h3>
                    {doctor.resume_verification_status && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Verified
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  {doctor.specialization && (
                    <div>
                      <span className="text-sm font-medium text-gray-500">Specialization:</span>
                      <p className="text-sm text-gray-900">{doctor.specialization}</p>
                    </div>
                  )}
                  
                  {doctor.hospital_affiliation && (
                    <div>
                      <span className="text-sm font-medium text-gray-500">Hospital:</span>
                      <p className="text-sm text-gray-900">{doctor.hospital_affiliation}</p>
                    </div>
                  )}
                  
                  {doctor.years_of_experience && (
                    <div>
                      <span className="text-sm font-medium text-gray-500">Experience:</span>
                      <p className="text-sm text-gray-900">{doctor.years_of_experience} years</p>
                    </div>
                  )}

                  <div>
                    <span className="text-sm font-medium text-gray-500">Contact:</span>
                    <p className="text-sm text-gray-900">{doctor.email}</p>
                    <p className="text-sm text-gray-900">{doctor.phone_number}</p>
                  </div>
                </div>

                {/* Assignment Button - Only for authenticated patients */}
                {isAuthenticated && user?.role === 'patient' && !isMyDoctor && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => handleAssignDoctor(doctor.id)}
                      disabled={isAssigning}
                      className={`w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors ${
                        isAssigning 
                          ? 'bg-blue-400 cursor-not-allowed' 
                          : 'bg-blue-600 hover:bg-blue-700'
                      }`}
                    >
                      {isAssigning ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Assigning...
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          Assign as My Doctor
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* Login prompt for non-authenticated users */}
                {!isAuthenticated && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <Link
                      to="/login"
                      className="w-full flex items-center justify-center px-4 py-2 border border-blue-300 rounded-lg text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                    >
                      Login to Assign Doctor
                    </Link>
                  </div>
                )}
              </div>
            )})}
          </div>
        ) : doctors.length === 0 && !error && (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Doctors Found</h3>
            <p className="text-gray-600">No verified doctors are currently available in the directory.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicDoctorsSimplified;
