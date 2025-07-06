import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createApiService } from '../../utils/apiService';
import LoadingSpinner from '../../components/LoadingSpinner';
import { PatientCard } from '../../components/doctor/DoctorComponents';

const DoctorPatients = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterByBloodGroup, setFilterByBloodGroup] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const api = createApiService();
        const response = await api.get('/doctor/patients');
        setPatients(response.data);
      } catch (err) {
        console.error('Patients fetch error:', err);
        setError('Failed to fetch patients data');
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);

  const handlePatientClick = (patient) => {
    navigate(`/doctor/patients/${patient.id}`);
  };

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = searchTerm === '' || 
      `${patient.first_name} ${patient.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.phone_number.includes(searchTerm);
    
    const matchesBloodGroup = filterByBloodGroup === '' || patient.blood_group === filterByBloodGroup;
    
    return matchesSearch && matchesBloodGroup;
  });

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  if (loading) return <LoadingSpinner size="lg" text="Loading patients..." />;

  if (error) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="text-red-500 text-lg font-medium">{error}</div>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Retry
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">My Patients</h1>
              <p className="text-gray-600 mt-1">
                {patients.length} patient{patients.length !== 1 ? 's' : ''} under your care
              </p>
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

        {/* Search and Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                Search Patients
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
                  placeholder="Search by name, email, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Blood Group Filter */}
            <div>
              <label htmlFor="bloodGroup" className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Blood Group
              </label>
              <select
                id="bloodGroup"
                value={filterByBloodGroup}
                onChange={(e) => setFilterByBloodGroup(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Blood Groups</option>
                {bloodGroups.map(group => (
                  <option key={group} value={group}>{group}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Results Summary */}
          {(searchTerm || filterByBloodGroup) && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Showing {filteredPatients.length} of {patients.length} patients
                {searchTerm && ` matching "${searchTerm}"`}
                {filterByBloodGroup && ` with blood group ${filterByBloodGroup}`}
              </p>
            </div>
          )}
        </div>

        {/* Patients List */}
        {filteredPatients.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {patients.length === 0 ? 'No Patients Assigned' : 'No Patients Found'}
            </h3>
            <p className="text-gray-600">
              {patients.length === 0 
                ? 'You don\'t have any patients assigned to your care yet.'
                : 'Try adjusting your search criteria to find the patients you\'re looking for.'
              }
            </p>
            {(searchTerm || filterByBloodGroup) && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterByBloodGroup('');
                }}
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredPatients.map((patient) => (
              <PatientCard
                key={patient.id}
                patient={patient}
                onClick={handlePatientClick}
              />
            ))}
          </div>
        )}

        {/* Summary Stats */}
        {patients.length > 0 && (
          <div className="mt-8 bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Patient Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {bloodGroups.map(group => {
                const count = patients.filter(p => p.blood_group === group).length;
                return (
                  <div key={group} className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{count}</div>
                    <div className="text-sm text-gray-600">{group}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorPatients;
