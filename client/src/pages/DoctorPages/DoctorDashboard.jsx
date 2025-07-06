import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createApiService } from '../../utils/apiService';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';
import { 
  DoctorStatCard, 
  RecentPatients, 
  DoctorProfileCard, 
  DoctorActionButton 
} from '../../components/doctor/DoctorComponents';

const DoctorDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const api = createApiService();
        const response = await api.get('/doctor/dashboard');
        setDashboardData(response.data);
      } catch (err) {
        console.error('Dashboard fetch error:', err);
        setError('Failed to fetch dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handlePatientClick = (patient) => {
    navigate(`/doctor/patients/${patient.id}`);
  };

  const handleRegisterAsDoctor = () => {
    navigate('/doctor/register');
  };

  if (loading) return <LoadingSpinner size="lg" text="Loading dashboard..." />;
  
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

  // Check if user needs to register as doctor
  if (!dashboardData && user.role !== 'DOCTOR') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="bg-white rounded-lg border border-gray-200 p-8 max-w-2xl mx-auto">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2m14 0H5m9-16l3 3m-3-3v12" />
                  </svg>
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Doctor Registration Required</h2>
              <p className="text-gray-600 mb-6">
                To access the doctor dashboard, you need to register as a doctor by uploading your medical credentials for verification.
              </p>
              <button
                onClick={handleRegisterAsDoctor}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
              >
                Register as Doctor
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">Doctor Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Welcome back, Dr. {dashboardData?.doctor_info?.name || user?.first_name}
          </p>
        </div>

        {/* Doctor Profile Card */}
        {dashboardData?.doctor_info && (
          <div className="mb-8">
            <DoctorProfileCard doctor={dashboardData.doctor_info} />
          </div>
        )}

        {/* Quick Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <DoctorStatCard
            title="Total Patients"
            value={dashboardData?.total_patients || 0}
            change={dashboardData?.total_patients > 0 ? "Patients under your care" : "No patients assigned yet"}
            icon="patients"
            color="blue"
          />
          <DoctorStatCard
            title="Recent Activity"
            value={dashboardData?.recent_patients?.length || 0}
            change="Recent patient interactions"
            icon="records"
            color="green"
          />
          <DoctorStatCard
            title="Verification Status"
            value={user?.resume_verification_status ? "Verified" : "Pending"}
            change={user?.resume_verification_status ? "Medical credentials verified" : "Verification in progress"}
            icon="verification"
            color={user?.resume_verification_status ? "green" : "orange"}
          />
        </div>

        {/* Main Dashboard Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Recent Patients */}
          <RecentPatients 
            patients={dashboardData?.recent_patients || []}
            onPatientClick={handlePatientClick}
          />

          {/* Quick Actions */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 gap-4">
              <Link to="/doctor/patients">
                <DoctorActionButton
                  title="View All Patients"
                  description="See complete list of your patients"
                  icon="patients"
                />
              </Link>
              <Link to="/doctor/profile">
                <DoctorActionButton
                  title="Update Profile"
                  description="Manage your professional information"
                  icon="profile"
                />
              </Link>
              {!user?.resume_verification_status && (
                <DoctorActionButton
                  title="Complete Verification"
                  description="Upload medical credentials for verification"
                  icon="register"
                  onClick={handleRegisterAsDoctor}
                />
              )}
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Platform Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 mb-2">🏥</div>
              <h4 className="font-medium text-gray-900 mb-1">Digital Records</h4>
              <p className="text-sm text-gray-600">Access patient records instantly with QR codes</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 mb-2">🔒</div>
              <h4 className="font-medium text-gray-900 mb-1">Secure Platform</h4>
              <p className="text-sm text-gray-600">HIPAA compliant and secure data handling</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 mb-2">📱</div>
              <h4 className="font-medium text-gray-900 mb-1">Mobile Ready</h4>
              <p className="text-sm text-gray-600">Access from any device, anywhere</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
