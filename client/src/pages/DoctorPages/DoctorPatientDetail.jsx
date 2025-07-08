import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { createApiService } from '../../utils/apiService';
import LoadingSpinner from '../../components/LoadingSpinner';

const DoctorPatientDetail = () => {
  const { patientId } = useParams();
  const [patient, setPatient] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recordsLoading, setRecordsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('info');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        const api = createApiService();
        
        // Fetch patient info from patients list (we need this from the patients endpoint)
        const patientsResponse = await api.get('/doctor/patients');
        const patientData = patientsResponse.data.find(p => p.id === parseInt(patientId));
        
        if (!patientData) {
          setError('Patient not found or not assigned to you');
          return;
        }
        
        setPatient(patientData);
        
        // Fetch patient records
        setRecordsLoading(true);
        try {
          const recordsResponse = await api.get(`/doctor/patient/${patientId}/records`);
          setRecords(recordsResponse.data);
        } catch (recordErr) {
          console.error('Records fetch error:', recordErr);
          // Don't set error here, just log it - records might be empty
          setRecords([]);
        } finally {
          setRecordsLoading(false);
        }
        
      } catch (err) {
        console.error('Patient fetch error:', err);
        setError('Failed to fetch patient data');
      } finally {
        setLoading(false);
      }
    };

    if (patientId) {
      fetchPatientData();
    }
  }, [patientId]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown size';
    const kb = bytes / 1024;
    const mb = kb / 1024;
    if (mb >= 1) return `${mb.toFixed(2)} MB`;
    return `${kb.toFixed(2)} KB`;
  };

  if (loading) return <LoadingSpinner size="lg" text="Loading patient data..." />;

  if (error) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="text-red-500 text-lg font-medium">{error}</div>
        <button 
          onClick={() => navigate('/doctor/patients')} 
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Back to Patients
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
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/doctor/patients')}
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Patients
              </button>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">
                  {patient?.first_name} {patient?.last_name}
                </h1>
                <p className="text-gray-600">Patient Details</p>
              </div>
            </div>
          </div>
        </div>

        {/* Patient Profile Card */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="flex items-center space-x-6">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-blue-600">
                {patient?.first_name?.[0]}{patient?.last_name?.[0]}
              </span>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-900">
                {patient?.first_name} {patient?.last_name}
              </h2>
              <p className="text-gray-600">{patient?.email}</p>
              <div className="flex items-center mt-2 space-x-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                  {patient?.blood_group}
                </span>
                <span className="text-sm text-gray-500">{patient?.phone_number}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('info')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'info'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Patient Information
              </button>
              <button
                onClick={() => setActiveTab('records')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'records'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Medical Records ({records.length})
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'info' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Personal Information</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500">First Name</label>
                      <p className="mt-1 text-sm text-gray-900">{patient?.first_name}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Last Name</label>
                      <p className="mt-1 text-sm text-gray-900">{patient?.last_name}</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500">Email</label>
                    <p className="mt-1 text-sm text-gray-900">{patient?.email}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500">Phone Number</label>
                    <p className="mt-1 text-sm text-gray-900">{patient?.phone_number}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500">Blood Group</label>
                    <span className="mt-1 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                      {patient?.blood_group}
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Medical Information</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Allergies</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {patient?.allergies || 'No known allergies'}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500">Registration Date</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {formatDate(patient?.created_at)}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500">Username</label>
                    <p className="mt-1 text-sm text-gray-900">{patient?.username}</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'records' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-medium text-gray-900">Medical Records</h3>
                  {recordsLoading && <LoadingSpinner size="sm" />}
                </div>

                {recordsLoading ? (
                  <div className="text-center py-8">
                    <LoadingSpinner size="lg" text="Loading medical records..." />
                  </div>
                ) : records.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h4 className="text-lg font-medium text-gray-900 mb-2">No Medical Records</h4>
                    <p className="text-gray-600">This patient doesn't have any medical records uploaded yet.</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {records.map((record) => (
                      <div key={record.id} className="bg-gray-50 rounded-lg border border-gray-200 p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="text-lg font-medium text-gray-900">{record.filename}</h4>
                            <p className="text-sm text-gray-600 mt-1">
                              Created: {formatDate(record.created_at)}
                            </p>
                            <div className="flex items-center space-x-4 mt-2">
                              {record.file_size && (
                                <span className="text-xs text-gray-500">
                                  Size: {formatFileSize(record.file_size)}
                                </span>
                              )}
                              {record.file_type && (
                                <span className="text-xs text-gray-500">
                                  Type: {record.file_type}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="ml-4">
                            <button className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                              View Record
                            </button>
                          </div>
                        </div>
                        {record.content && (
                          <div className="mt-4 p-3 bg-white rounded border">
                            <p className="text-xs font-medium text-gray-500 mb-2">CONTENT PREVIEW:</p>
                            <p className="text-sm text-gray-700 line-clamp-3">
                              {record.content.substring(0, 200)}
                              {record.content.length > 200 && '...'}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorPatientDetail;
