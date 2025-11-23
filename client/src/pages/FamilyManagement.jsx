import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createApiService } from '../utils/apiService';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

const FamilyManagement = () => {
  const [family, setFamily] = useState(null);
  const [members, setMembers] = useState([]);
  const [expandedMember, setExpandedMember] = useState(null);
  const [memberRecords, setMemberRecords] = useState({});
  const [memberCollections, setMemberCollections] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showDeleteFamilyModal, setShowDeleteFamilyModal] = useState(false);
  const [newMemberUserId, setNewMemberUserId] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.family_id) {
      fetchFamilyData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchFamilyData = async () => {
    try {
      const api = createApiService();
      
      // Fetch family info
      const familyResponse = await api.get('/family/my-family');
      setFamily(familyResponse.data);
      
      // Fetch family members
      const membersResponse = await api.get('/family/my-family/members');
      setMembers(membersResponse.data);
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching family data:', err);
      setError(err.response?.data?.detail || 'Failed to load family data');
      setLoading(false);
    }
  };

  const fetchMemberRecords = async (memberId) => {
    if (memberRecords[memberId]) return; // Already fetched
    
    try {
      const api = createApiService();
      const response = await api.get(`/family/members/${memberId}/records`);
      setMemberRecords(prev => ({ ...prev, [memberId]: response.data }));
    } catch (err) {
      console.error('Error fetching member records:', err);
    }
  };

  const fetchMemberCollections = async (memberId) => {
    if (memberCollections[memberId]) return; // Already fetched
    
    try {
      const api = createApiService();
      const response = await api.get(`/family/members/${memberId}/collections`);
      setMemberCollections(prev => ({ ...prev, [memberId]: response.data }));
    } catch (err) {
      console.error('Error fetching member collections:', err);
    }
  };

  const toggleMemberExpansion = async (memberId) => {
    if (expandedMember === memberId) {
      setExpandedMember(null);
    } else {
      setExpandedMember(memberId);
      // Fetch records and collections when expanding
      await Promise.all([
        fetchMemberRecords(memberId),
        fetchMemberCollections(memberId)
      ]);
    }
  };

  const handleViewRecord = (recordId) => {
    navigate(`/records/${recordId}`);
  };

  const handleViewCollection = (collectionId) => {
    navigate(`/collections/${collectionId}`);
  };

  const handleRemoveMember = async (memberId, memberName) => {
    if (!window.confirm(`Are you sure you want to remove ${memberName} from the family?`)) {
      return;
    }

    setActionLoading(true);
    try {
      const api = createApiService();
      await api.post('/family/remove-member', { user_id: memberId });
      
      setSuccessMessage(`Successfully removed ${memberName} from the family`);
      setTimeout(() => setSuccessMessage(''), 3000);
      
      // Refresh family data
      await fetchFamilyData();
    } catch (err) {
      console.error('Error removing member:', err);
      alert(err.response?.data?.detail || 'Failed to remove member');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteFamily = async () => {
    setActionLoading(true);
    try {
      const api = createApiService();
      await api.delete('/family/');
      
      setSuccessMessage('Family deleted successfully');
      
      // Refresh user data and redirect
      await refreshUser();
      setTimeout(() => {
        navigate('/profile');
      }, 1500);
    } catch (err) {
      console.error('Error deleting family:', err);
      alert(err.response?.data?.detail || 'Failed to delete family');
      setActionLoading(false);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    
    if (!newMemberUserId || isNaN(newMemberUserId)) {
      alert('Please enter a valid user ID');
      return;
    }

    setActionLoading(true);
    try {
      const api = createApiService();
      await api.post('/family/add-member', { user_id: parseInt(newMemberUserId) });
      
      setSuccessMessage('Successfully added member to the family');
      setTimeout(() => setSuccessMessage(''), 3000);
      
      setShowAddMemberModal(false);
      setNewMemberUserId('');
      
      // Refresh family data
      await fetchFamilyData();
    } catch (err) {
      console.error('Error adding member:', err);
      alert(err.response?.data?.detail || 'Failed to add member');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!user?.family_id) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg border border-gray-200 p-6 text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Not Part of a Family</h2>
          <p className="text-gray-600 mb-4">You need to create or join a family to access this page.</p>
          <button
            onClick={() => navigate('/create-family')}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create a Family
          </button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg border border-red-200 p-6 text-center">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6">
      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 border border-green-300 text-green-700 px-3 sm:px-4 py-3 rounded-lg mb-4 sm:mb-6 text-sm sm:text-base">
          {successMessage}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Family Management</h1>
          <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">{family?.name} - {members.length} {members.length === 1 ? 'member' : 'members'}</p>
        </div>
        {user?.is_family_admin && (
          <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
            <button
              onClick={() => setShowAddMemberModal(true)}
              className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 py-2 rounded-lg flex items-center gap-2 justify-center transition-colors text-sm sm:text-base"
              disabled={actionLoading}
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              <span>Add Member</span>
            </button>
            <button
              onClick={() => setShowDeleteFamilyModal(true)}
              className="flex-1 sm:flex-none bg-red-600 hover:bg-red-700 text-white px-3 sm:px-4 py-2 rounded-lg flex items-center gap-2 justify-center transition-colors text-sm sm:text-base"
              disabled={actionLoading}
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span className="hidden sm:inline">Delete Family</span>
              <span className="sm:hidden">Delete</span>
            </button>
          </div>
        )}
      </div>

        {/* Family Members */}
        <div className="grid grid-cols-1 gap-4 sm:gap-6">
          {members.map((member) => {
            const isExpanded = expandedMember === member.id;
            const records = memberRecords[member.id] || [];
            const collections = memberCollections[member.id] || [];

            return (
              <div key={member.id} className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200 overflow-hidden hover:border-blue-300">
                {/* Member Header */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 sm:space-x-4 flex-1 min-w-0">
                      <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                        member.id === user.id ? 'bg-blue-100' : 'bg-gray-100'
                      }`}>
                        <svg className={`w-5 h-5 sm:w-6 sm:h-6 ${member.id === user.id ? 'text-blue-600' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 flex-wrap">
                          <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                            {member.first_name} {member.last_name}
                          </h3>
                          {member.id === user.id && (
                            <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full flex-shrink-0">You</span>
                          )}
                          {member.is_family_admin && (
                            <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full flex-shrink-0">Admin</span>
                          )}
                        </div>
                      </div>
                    </div>
                    {user?.is_family_admin && (
                      <button
                        onClick={() => toggleMemberExpansion(member.id)}
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium hover:bg-blue-50 px-3 py-2 rounded-lg transition-colors"
                      >
                        {isExpanded ? 'Hide Details' : 'View Details'}
                        <svg
                          className={`w-4 h-4 transition-transform ${isExpanded ? 'transform rotate-180' : ''}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>

                {/* Expanded Content - Only for Family Admin */}
                {user?.is_family_admin && isExpanded && (
                  <div className="border-t border-gray-200 bg-gray-50">
                    {/* Member Details */}
                    <div className="px-4 sm:px-6 py-3 border-b border-gray-200 bg-white">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-gray-500">Email:</span>
                          <span className="ml-2 text-gray-900">{member.email}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Blood Group:</span>
                          <span className="ml-2 text-gray-900">{member.blood_group}</span>
                        </div>
                        {member.phone_number && (
                          <div>
                            <span className="text-gray-500">Phone:</span>
                            <span className="ml-2 text-gray-900">{member.phone_number}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Remove Member Button (Admin Only) */}
                    {member.id !== user.id && (
                      <div className="px-4 sm:px-6 pt-4">
                        <button
                          onClick={() => handleRemoveMember(member.id, `${member.first_name} ${member.last_name}`)}
                          className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center hover:bg-red-50 px-3 py-2 rounded-lg transition-colors"
                          disabled={actionLoading}
                        >
                          <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7a4 4 0 11-8 0 4 4 0 018 0zM9 14a6 6 0 00-6 6v1h12v-1a6 6 0 00-6-6zM21 12h-6" />
                          </svg>
                          Remove from Family
                        </button>
                      </div>
                    )}
                    
                    <div className="p-4 sm:p-6 grid md:grid-cols-2 gap-4 sm:gap-6">
                      {/* Collections */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                          </svg>
                          Collections ({collections.length})
                        </h4>
                        {collections.length === 0 ? (
                          <p className="text-sm text-gray-500 italic">No collections yet</p>
                        ) : (
                          <div className="space-y-2">
                            {collections.map((collection) => (
                              <button
                                key={collection.id}
                                onClick={() => handleViewCollection(collection.id)}
                                className="w-full text-left p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-400 hover:shadow-sm transition-all"
                              >
                                <div className="font-medium text-gray-900 text-sm">{collection.name}</div>
                                {collection.description && (
                                  <div className="text-xs text-gray-500 mt-1 line-clamp-2">{collection.description}</div>
                                )}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Records */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Records ({records.length})
                        </h4>
                        {records.length === 0 ? (
                          <p className="text-sm text-gray-500 italic">No records yet</p>
                        ) : (
                          <div className="space-y-2">
                            {records.map((record) => (
                              <button
                                key={record.id}
                                onClick={() => handleViewRecord(record.id)}
                                className="w-full text-left p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-400 hover:shadow-sm transition-all"
                              >
                                <div className="flex items-center justify-between">
                                  <div className="font-medium text-gray-900 text-sm truncate pr-2">{record.filename}</div>
                                  <div className="text-xs text-gray-400 flex-shrink-0">
                                    {new Date(record.created_at).toLocaleDateString()}
                                  </div>
                                </div>
                                <div className="text-xs text-gray-500 mt-1 line-clamp-2">
                                  {record.content?.substring(0, 100)}...
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Add Member Modal */}
        {showAddMemberModal && (
          <div className="fixed inset-0 bg-white bg-opacity-30 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-4 sm:p-6 mx-4 shadow-2xl">
              <div className="flex justify-between items-center mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl font-semibold">Add Family Member</h2>
                <button
                  onClick={() => setShowAddMemberModal(false)}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <form onSubmit={handleAddMember}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    User ID *
                  </label>
                  <input
                    type="number"
                    value={newMemberUserId}
                    onChange={(e) => setNewMemberUserId(e.target.value)}
                    placeholder="Enter user ID"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Enter the ID of the user you want to add to your family
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={() => setShowAddMemberModal(false)}
                    className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm sm:text-base"
                    disabled={actionLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm sm:text-base disabled:opacity-50"
                    disabled={actionLoading}
                  >
                    {actionLoading ? 'Adding...' : 'Add Member'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Family Modal */}
        {showDeleteFamilyModal && (
          <div className="fixed inset-0 bg-white bg-opacity-30 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-4 sm:p-6 mx-4 shadow-2xl">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Delete Family</h3>
                  <p className="text-sm text-gray-500">This action cannot be undone</p>
                </div>
              </div>
              
              <p className="text-gray-600 mb-6 text-sm sm:text-base">
                Are you sure you want to delete <strong>{family?.name}</strong>? All members will be removed from the family.
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setShowDeleteFamilyModal(false)}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm sm:text-base"
                  disabled={actionLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteFamily}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 text-sm sm:text-base"
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Deleting...' : 'Delete Family'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    
  );
};

export default FamilyManagement;
