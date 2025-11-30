import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../utils/apiService';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [userLimit, setUserLimit] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);
  const { user: currentUser } = useAuth();

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = {
        limit: userLimit,
        skip: (currentPage - 1) * userLimit,
        ...(searchTerm && { search: searchTerm }),
        ...(selectedRole && { role: selectedRole })
      };
      const response = await adminAPI.getUsers(params);
      setUsers(response.data);
    } catch (err) {
      setError('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [searchTerm, selectedRole, userLimit, currentPage]);

  const handleRoleUpdate = async (userId, newRole) => {
    try {
      console.log('Sending role update request:', { user_id: userId, new_role: newRole });
      await adminAPI.updateUserRole(userId, newRole);
      await fetchUsers();
    } catch (err) {
      console.error('Role update error:', err);
      console.error('Error response:', err.response?.data);
      setError(`Failed to update user role: ${err.response?.data?.detail || err.message}`);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        await adminAPI.deleteUser(userId);
        await fetchUsers();
      } catch (err) {
        setError('Failed to delete user');
      }
    }
  };

  if (loading && users.length === 0) return <LoadingSpinner size="lg" text="Loading users..." />;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Link
              to="/admin"
              className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Dashboard
            </Link>
          </div>
          <h1 className="text-2xl font-semibold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-1">Manage all users, roles, and permissions</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by name, username, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-4">
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 min-w-[120px]"
              >
                <option value="">All Roles</option>
                <option value="patient">Patients</option>
                <option value="doctor">Doctors</option>
                <option value="admin">Admins</option>
              </select>
              <select
                value={userLimit}
                onChange={(e) => setUserLimit(Number(e.target.value))}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 min-w-[100px]"
              >
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="text-red-700">{error}</div>
          </div>
        )}

        {/* Users List */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <LoadingSpinner size="md" text="Loading users..." centered={false} />
            </div>
          ) : users.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-gray-500 text-lg">No users found</div>
              <p className="text-gray-400 mt-2">Try adjusting your search filters</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {users.map((user) => (
                    <UserRow
                      key={user.id}
                      user={user}
                      currentUser={currentUser}
                      onRoleUpdate={handleRoleUpdate}
                      onDeleteUser={handleDeleteUser}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {users.length === userLimit && (
          <div className="mt-6 flex justify-center">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors text-sm"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-gray-600 text-sm">Page {currentPage}</span>
              <button
                onClick={() => setCurrentPage(prev => prev + 1)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// User Row Component
const UserRow = ({ user, currentUser, onRoleUpdate, onDeleteUser }) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const isCurrentUser = user.id === currentUser?.id;

  const handleRoleChange = async (newRole) => {
    // Prevent changing to the same role
    if (newRole === user.role) return;
    
    // Prevent changing own role
    if (isCurrentUser) return;
    
    setIsUpdating(true);
    try {
      await onRoleUpdate(user.id, newRole);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-6 py-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-gray-700 font-medium">
            {user.first_name?.[0]?.toUpperCase() || user.username?.[0]?.toUpperCase()}
          </div>
          <div>
            <div className="font-medium text-gray-900">
              {user.first_name} {user.last_name}
              {isCurrentUser && (
                <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">You</span>
              )}
            </div>
            <div className="text-sm text-gray-500">@{user.username}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <RoleBadge role={user.role} />
      </td>
      <td className="px-6 py-4">
        <div className="text-sm text-gray-900">{user.email}</div>
        {user.phone_number && (
          <div className="text-sm text-gray-500">{user.phone_number}</div>
        )}
      </td>
      <td className="px-6 py-4">
        <StatusBadge user={user} />
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center space-x-3">
          <RoleSelector
            currentRole={user.role}
            onRoleChange={handleRoleChange}
            disabled={isCurrentUser || isUpdating}
            isUpdating={isUpdating}
          />
          <button
            onClick={() => onDeleteUser(user.id)}
            disabled={isCurrentUser}
            className="text-red-500 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
          >
            Delete
          </button>
        </div>
      </td>
    </tr>
  );
};

// Role Badge Component
const RoleBadge = ({ role }) => {
  const roleConfig = {
    admin: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
    doctor: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
    patient: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' }
  };

  const config = roleConfig[role] || roleConfig.patient;

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${config.bg} ${config.text} ${config.border}`}>
      {role?.charAt(0).toUpperCase() + role?.slice(1)}
    </span>
  );
};

// Status Badge Component
const StatusBadge = ({ user }) => {
  if (user.role === 'doctor') {
    return user.resume_verification_status ? (
      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-50 text-green-700 border border-green-200">
        Verified
      </span>
    ) : (
      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-orange-50 text-orange-700 border border-orange-200">
        Pending
      </span>
    );
  }

  return (
    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-50 text-gray-700 border border-gray-200">
      Active
    </span>
  );
};

// Role Selector Component
const RoleSelector = ({ currentRole, onRoleChange, disabled, isUpdating }) => {
  return (
    <select
      value={currentRole}
      onChange={(e) => onRoleChange(e.target.value)}
      disabled={disabled}
      className="text-sm border border-gray-300 rounded-md px-3 py-1 disabled:opacity-50 disabled:cursor-not-allowed focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    >
      <option value="patient">Patient</option>
      <option value="doctor">Doctor</option>
      <option value="admin">Admin</option>
    </select>
  );
};

export default AdminUsers;
