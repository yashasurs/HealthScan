import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createApiService } from '../utils/apiService';
import LoadingSpinner from '../components/LoadingSpinner';

const PublicDoctorsSimplified = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const api = createApiService();
        
        // Try the public endpoint first
        try {
          const response = await api.get('/public/doctors?verified_only=true&limit=50');
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
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Find Verified Doctors</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover qualified medical professionals in our network of verified healthcare providers
          </p>
        </div>

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
            {filteredDoctors.map((doctor) => (
              <div key={doctor.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
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
              </div>
            ))}
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
