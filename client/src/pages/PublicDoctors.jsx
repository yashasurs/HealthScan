import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { publicAPI, patientAPI } from '../utils/apiService';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

const PublicDoctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [specializations, setSpecializations] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, isAuthenticated } = useAuth();
  
  // Assignment state
  const [assigningDoctorId, setAssigningDoctorId] = useState(null);
  const [myDoctorId, setMyDoctorId] = useState(null);
  const [assignmentMessage, setAssignmentMessage] = useState(null);
  
  // Filters
  const [selectedSpecialization, setSelectedSpecialization] = useState('');
  const [selectedHospital, setSelectedHospital] = useState('');
  const [verifiedOnly, setVerifiedOnly] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Fetch all data in parallel with error handling for individual endpoints
        const fetchPromises = [
          publicAPI.getSpecializations().catch(err => {
            console.warn('Specializations endpoint failed:', err);
            return { data: [] };
          }),
          publicAPI.getHospitals().catch(err => {
            console.warn('Hospitals endpoint failed:', err);
            return { data: [] };
          }),
          publicAPI.getStats().catch(err => {
            console.warn('Stats endpoint failed:', err);
            return { data: null };
          })
        ];

        const [specialsResponse, hospitalsResponse, statsResponse] = await Promise.all(fetchPromises);

        setSpecializations(specialsResponse.data || []);
        setHospitals(hospitalsResponse.data || []);
        setStats(statsResponse.data);
        
        // Fetch initial doctors list
        await fetchDoctors();
        
      } catch (err) {
        console.error('Initial data fetch error:', err);
        setError('Some features may be limited due to server connectivity');
        // Still try to fetch doctors
        await fetchDoctors();
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
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
          console.log('No doctor assigned yet or error fetching:', err);
        }
      }
    };
    
    fetchMyDoctor();
  }, [isAuthenticated, user]);

  const fetchDoctors = async () => {
    try {
      const params = {
        specialization: selectedSpecialization || undefined,
        hospital: selectedHospital || undefined,
        verified_only: verifiedOnly,
        limit: 50
      };
      
      const response = await publicAPI.getDoctors(params);
      setDoctors(response.data);
      setError(null); // Clear any previous errors
    } catch (err) {
      console.error('Doctors fetch error:', err);
      if (err.response?.status === 404) {
        setError('Doctor directory service is currently unavailable');
        setDoctors([]); // Set empty array for graceful degradation
      } else {
        setError('Failed to load doctors');
      }
    }
  };

  // Refetch doctors when filters change
  useEffect(() => {
    if (!loading) {
      fetchDoctors();
    }
  }, [selectedSpecialization, selectedHospital, verifiedOnly]);

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
      
      // Auto-hide success message after 5 seconds
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

  const handleRemoveDoctor = async () => {
    if (!window.confirm('Are you sure you want to remove your assigned doctor?')) {
      return;
    }

    try {
      await patientAPI.removeDoctor();
      setMyDoctorId(null);
      setAssignmentMessage({ 
        type: 'success', 
        text: 'Doctor removed successfully' 
      });
      
      setTimeout(() => setAssignmentMessage(null), 5000);
    } catch (err) {
      console.error('Error removing doctor:', err);
      setAssignmentMessage({ 
        type: 'error', 
        text: err.response?.data?.detail || 'Failed to remove doctor. Please try again.' 
      });
    }
  };

  // Filter doctors by search term on frontend
  const filteredDoctors = doctors.filter(doctor => {
    if (!searchTerm) return true;
    const fullName = `${doctor.first_name} ${doctor.last_name}`.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase()) || 
           doctor.email.toLowerCase().includes(searchTerm.toLowerCase());
  });

  if (loading) return <LoadingSpinner size="lg" text="Loading doctors..." />;

  if (error && doctors.length === 0) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Service Unavailable</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <p className="text-sm text-gray-500 mb-6">
          The doctor directory service is currently being updated. Please try again later or contact support if the issue persists.
        </p>
        <div className="space-y-2">
          <button 
            onClick={() => window.location.reload()} 
            className="block w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Retry
          </button>
          <Link 
            to="/"
            className="block w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Find Verified Doctors</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover qualified medical professionals in our network of verified healthcare providers
          </p>
          {isAuthenticated && user?.role === 'patient' && (
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

        {/* Error Banner - Show if there are partial errors but content is available */}
        {error && doctors.length > 0 && (
          <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-orange-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div>
                <p className="text-sm font-medium text-orange-800">Limited Functionality</p>
                <p className="text-xs text-orange-600 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Statistics */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">{stats.total_doctors}</div>
              <div className="text-gray-600">Total Doctors</div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">{stats.verified_doctors}</div>
              <div className="text-gray-600">Verified Doctors</div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">{Object.keys(stats.specialization_counts || {}).length}</div>
              <div className="text-gray-600">Specializations</div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Filter Doctors</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                Search by Name
              </label>
              <input
                type="text"
                id="search"
                placeholder="Doctor name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Specialization Filter */}
            <div>
              <label htmlFor="specialization" className="block text-sm font-medium text-gray-700 mb-2">
                Specialization
              </label>
              <select
                id="specialization"
                value={selectedSpecialization}
                onChange={(e) => setSelectedSpecialization(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Specializations</option>
                {specializations.map(spec => (
                  <option key={spec} value={spec}>{spec}</option>
                ))}
              </select>
            </div>

            {/* Hospital Filter */}
            <div>
              <label htmlFor="hospital" className="block text-sm font-medium text-gray-700 mb-2">
                Hospital
              </label>
              <select
                id="hospital"
                value={selectedHospital}
                onChange={(e) => setSelectedHospital(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Hospitals</option>
                {hospitals.map(hospital => (
                  <option key={hospital} value={hospital}>{hospital}</option>
                ))}
              </select>
            </div>

            {/* Verification Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Verification Status
              </label>
              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={verifiedOnly}
                    onChange={(e) => setVerifiedOnly(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-600">Verified only</span>
                </label>
              </div>
            </div>
          </div>
          
          {/* Results count */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Showing {filteredDoctors.length} doctor{filteredDoctors.length !== 1 ? 's' : ''}
              {(selectedSpecialization || selectedHospital || searchTerm) && ' matching your criteria'}
            </p>
          </div>
        </div>

        {/* Doctors Grid */}
        {filteredDoctors.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Doctors Found</h3>
            <p className="text-gray-600">
              Try adjusting your search criteria to find the doctors you're looking for.
            </p>
          </div>
        ) : (
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
                  <div className="mb-3 flex items-center justify-between">
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
                {isAuthenticated && user?.role === 'patient' && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    {isMyDoctor ? (
                      <button
                        onClick={handleRemoveDoctor}
                        className="w-full flex items-center justify-center px-4 py-2 border border-red-300 rounded-lg text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Remove from My Care
                      </button>
                    ) : (
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
                    )}
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
        )}

        {/* Specializations Stats */}
        {stats?.specialization_counts && (
          <div className="mt-12 bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-6">Doctors by Specialization</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Object.entries(stats.specialization_counts).map(([specialization, count]) => (
                <div key={specialization} className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{count}</div>
                  <div className="text-sm text-gray-600">{specialization}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicDoctors;
