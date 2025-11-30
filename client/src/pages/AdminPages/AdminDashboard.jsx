import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../utils/apiService';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const response = await adminAPI.getDashboard();
        setStats(response.data);
      } catch (err) {
        setError('Failed to fetch dashboard statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back, {user?.first_name || user?.username}</p>
        </div>

        {/* Quick Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Users"
            value={stats?.total_users || 0}
            change="+12% from last month"
            icon="users"
          />
          <StatCard
            title="Medical Records"
            value={stats?.total_records || 0}
            change="+8% from last month"
            icon="document"
          />
          <StatCard
            title="Collections"
            value={stats?.total_collections || 0}
            change="+5% from last month"
            icon="folder"
          />
          <StatCard
            title="Verified Doctors"
            value={stats?.verified_doctors || 0}
            change={`${stats?.unverified_doctors || 0} pending`}
            icon="shield"
          />
        </div>

        {/* User Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">User Distribution</h3>
            <div className="space-y-4">
              <UserDistributionItem
                label="Patients"
                count={stats?.total_patients || 0}
                total={stats?.total_users || 1}
                color="blue"
              />
              <UserDistributionItem
                label="Doctors"
                count={stats?.total_doctors || 0}
                total={stats?.total_users || 1}
                color="green"
              />
              <UserDistributionItem
                label="Administrators"
                count={stats?.total_admins || 0}
                total={stats?.total_users || 1}
                color="gray"
              />
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Doctor Verification</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                  <span className="text-sm text-gray-600">Verified</span>
                </div>
                <span className="text-lg font-semibold text-gray-900">{stats?.verified_doctors || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-orange-500 rounded-full mr-3"></div>
                  <span className="text-sm text-gray-600">Pending</span>
                </div>
                <span className="text-lg font-semibold text-gray-900">{stats?.unverified_doctors || 0}</span>
              </div>
              <div className="pt-2 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Total Doctors</span>
                  <span className="text-lg font-semibold text-gray-900">{stats?.total_doctors || 0}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <ActionButton
              to="/admin/users"
              title="Manage Users"
              description="View and manage all users"
            />
            <ActionButton
              to="/admin/hospitals"
              title="Manage Hospitals"
              description="Manage hospitals and doctors"
            />
            <ActionButton
              to="/admin/collections"
              title="View Collections"
              description="Browse all collections"
            />
            <ActionButton
              to="/admin/records"
              title="View Records"
              description="Browse medical records"
            />
            <ActionButton
              to="/admin/reports"
              title="System Reports"
              description="Analytics and insights"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// Stat Card Component
const StatCard = ({ title, value, change, icon }) => {
  const icons = {
    users: (
      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
      </svg>
    ),
    document: (
      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    folder: (
      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
      </svg>
    ),
    shield: (
      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    )
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center">
            {icons[icon]}
            <p className="ml-2 text-sm font-medium text-gray-600">{title}</p>
          </div>
          <p className="mt-2 text-2xl font-semibold text-gray-900">{value.toLocaleString()}</p>
          <p className="mt-1 text-xs text-gray-500">{change}</p>
        </div>
      </div>
    </div>
  );
};

// User Distribution Item Component
const UserDistributionItem = ({ label, count, total, color }) => {
  const percentage = ((count / total) * 100).toFixed(1);
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    gray: 'bg-gray-500'
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center flex-1">
        <div className={`w-3 h-3 ${colorClasses[color]} rounded-full mr-3`}></div>
        <span className="text-sm text-gray-600">{label}</span>
        <div className="flex-1 mx-4">
          <div className="bg-gray-200 rounded-full h-2">
            <div 
              className={`${colorClasses[color]} h-2 rounded-full`} 
              style={{ width: `${percentage}%` }}
            ></div>
          </div>
        </div>
      </div>
      <div className="text-right">
        <div className="text-lg font-semibold text-gray-900">{count}</div>
        <div className="text-xs text-gray-500">{percentage}%</div>
      </div>
    </div>
  );
};

// Action Button Component
const ActionButton = ({ to, title, description }) => (
  <Link
    to={to}
    className="block p-4 border border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-colors duration-200"
  >
    <div className="text-center">
      <div className="font-medium text-gray-900 text-sm mb-1">{title}</div>
      <div className="text-xs text-gray-500">{description}</div>
    </div>
  </Link>
);

export default AdminDashboard;
