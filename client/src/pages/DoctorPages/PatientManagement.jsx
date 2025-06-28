import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const PatientManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('name');

  const patients = [
    {
      id: 1,
      name: 'John Doe',
      age: 34,
      gender: 'Male',
      phone: '+91 9876543210',
      email: 'john.doe@email.com',
      condition: 'Hypertension',
      lastVisit: '2024-06-26',
      nextAppointment: '2024-07-01',
      status: 'stable',
      avatar: 'JD'
    },
    {
      id: 2,
      name: 'Sarah Wilson',
      age: 28,
      gender: 'Female',
      phone: '+91 9876543211',
      email: 'sarah.wilson@email.com',
      condition: 'Diabetes Type 2',
      lastVisit: '2024-06-20',
      nextAppointment: '2024-06-30',
      status: 'needs-followup',
      avatar: 'SW'
    },
    {
      id: 3,
      name: 'Michael Brown',
      age: 45,
      gender: 'Male',
      phone: '+91 9876543212',
      email: 'michael.brown@email.com',
      condition: 'Heart Disease',
      lastVisit: '2024-06-25',
      nextAppointment: '2024-06-29',
      status: 'critical',
      avatar: 'MB'
    },
    {
      id: 4,
      name: 'Emily Davis',
      age: 31,
      gender: 'Female',
      phone: '+91 9876543213',
      email: 'emily.davis@email.com',
      condition: 'Pregnancy Checkup',
      lastVisit: '2024-06-27',
      nextAppointment: '2024-07-04',
      status: 'stable',
      avatar: 'ED'
    },
    {
      id: 5,
      name: 'Robert Johnson',
      age: 52,
      gender: 'Male',
      phone: '+91 9876543214',
      email: 'robert.johnson@email.com',
      condition: 'Arthritis',
      lastVisit: '2024-06-23',
      nextAppointment: '2024-07-02',
      status: 'stable',
      avatar: 'RJ'
    },
    {
      id: 6,
      name: 'Lisa Anderson',
      age: 39,
      gender: 'Female',
      phone: '+91 9876543215',
      email: 'lisa.anderson@email.com',
      condition: 'Asthma',
      lastVisit: '2024-06-24',
      nextAppointment: '2024-07-03',
      status: 'stable',
      avatar: 'LA'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'stable':
        return 'bg-green-100 text-green-800';
      case 'needs-followup':
        return 'bg-yellow-100 text-yellow-800';
      case 'critical':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'stable':
        return 'Stable';
      case 'needs-followup':
        return 'Needs Follow-up';
      case 'critical':
        return 'Critical';
      default:
        return 'Unknown';
    }
  };

  const filteredPatients = patients
    .filter(patient => {
      const matchesSearch = patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           patient.condition.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           patient.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || patient.status === filterStatus;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'age':
          return a.age - b.age;
        case 'lastVisit':
          return new Date(b.lastVisit) - new Date(a.lastVisit);
        default:
          return 0;
      }
    });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Patient Management</h1>
            <p className="text-gray-600 mt-2">Manage and monitor your patients</p>
          </div>
          
          <div className="flex items-center space-x-4 mt-4 lg:mt-0">
            <Link 
              to="/doctor/patients/new"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add New Patient
            </Link>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search Patients</label>
              <input
                type="text"
                placeholder="Search by name, condition, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="stable">Stable</option>
                <option value="needs-followup">Needs Follow-up</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sort by</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="name">Name</option>
                <option value="age">Age</option>
                <option value="lastVisit">Last Visit</option>
              </select>
            </div>
          </div>
        </div>

        {/* Patients List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Patients ({filteredPatients.length})
            </h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Patient
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Condition
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Visit
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPatients.map(patient => (
                  <tr key={patient.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                          {patient.avatar}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{patient.name}</div>
                          <div className="text-sm text-gray-500">{patient.age} years • {patient.gender}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{patient.phone}</div>
                      <div className="text-sm text-gray-500">{patient.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{patient.condition}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{patient.lastVisit}</div>
                      <div className="text-sm text-gray-500">Next: {patient.nextAppointment}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(patient.status)}`}>
                        {getStatusText(patient.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <Link 
                        to={`/doctor/patients/${patient.id}`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        View
                      </Link>
                      <Link 
                        to={`/doctor/patients/${patient.id}/edit`}
                        className="text-green-600 hover:text-green-900"
                      >
                        Edit
                      </Link>
                      <Link 
                        to={`/doctor/appointments/new?patient=${patient.id}`}
                        className="text-purple-600 hover:text-purple-900"
                      >
                        Schedule
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientManagement;
