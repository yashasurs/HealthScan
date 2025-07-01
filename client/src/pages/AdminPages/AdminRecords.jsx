import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createApiService } from '../../utils/apiService';
import LoadingSpinner from '../../components/LoadingSpinner';

const AdminRecords = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const api = createApiService();
        const response = await api.get('/admin/records');
        setRecords(response.data);
      } catch (err) {
        setError('Failed to fetch records');
      } finally {
        setLoading(false);
      }
    };

    fetchRecords();
  }, []);

  const handleDeleteRecord = async (recordId) => {
    if (window.confirm('Are you sure you want to delete this record? This action cannot be undone.')) {
      try {
        await axios.delete(`${API_BASE_URL}/admin/records/${recordId}`);
        setRecords(records.filter(r => r.id !== recordId));
      } catch (err) {
        setError('Failed to delete record');
      }
    }
  };

  if (loading) return <LoadingSpinner size="lg" text="Loading records..." />;

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
          <h1 className="text-2xl font-semibold text-gray-900">Records Management</h1>
          <p className="text-gray-600 mt-1">View and manage all medical records</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="text-red-700">{error}</div>
          </div>
        )}

        {/* Records Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {records.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-gray-500 text-lg">No records found</div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Record
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Owner
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Collection
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {records.map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{record.filename}</div>
                            <div className="text-sm text-gray-500">{record.file_type}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{record.owner?.username}</div>
                        <div className="text-sm text-gray-500">{record.owner?.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{record.collection?.name || 'No Collection'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {new Date(record.created_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleDeleteRecord(record.id)}
                          className="text-red-600 hover:text-red-700 text-sm font-medium transition-colors"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminRecords;
