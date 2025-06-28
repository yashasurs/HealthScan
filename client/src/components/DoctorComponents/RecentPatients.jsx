import React from 'react';
import { Link } from 'react-router-dom';

const RecentPatients = () => {
  const recentPatients = [
    {
      id: 1,
      name: 'John Doe',
      age: 34,
      condition: 'Hypertension',
      lastVisit: '2 days ago',
      status: 'stable',
      avatar: 'JD'
    },
    {
      id: 2,
      name: 'Sarah Wilson',
      age: 28,
      condition: 'Diabetes Type 2',
      lastVisit: '1 week ago',
      status: 'needs-followup',
      avatar: 'SW'
    },
    {
      id: 3,
      name: 'Michael Brown',
      age: 45,
      condition: 'Heart Disease',
      lastVisit: '3 days ago',
      status: 'critical',
      avatar: 'MB'
    },
    {
      id: 4,
      name: 'Emily Davis',
      age: 31,
      condition: 'Pregnancy Checkup',
      lastVisit: '1 day ago',
      status: 'stable',
      avatar: 'ED'
    },
    {
      id: 5,
      name: 'Robert Johnson',
      age: 52,
      condition: 'Arthritis',
      lastVisit: '5 days ago',
      status: 'stable',
      avatar: 'RJ'
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

  return (
    <div className="space-y-4">
      {recentPatients.map(patient => (
        <div 
          key={patient.id} 
          className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow duration-200"
        >
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
              {patient.avatar}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">{patient.name}</h3>
              <p className="text-sm text-gray-600">Age: {patient.age} • {patient.condition}</p>
              <p className="text-xs text-gray-500">Last visit: {patient.lastVisit}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(patient.status)}`}>
              {getStatusText(patient.status)}
            </span>
            <Link 
              to={`/doctor/patients/${patient.id}`}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              View
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RecentPatients;
