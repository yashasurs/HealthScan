import React from 'react';
import { Link } from 'react-router-dom';

const QuickActions = () => {
  const actions = [
    {
      title: 'Add New Patient',
      description: 'Register a new patient',
      icon: 'userPlus',
      link: '/doctor/patients/new',
      color: 'blue'
    },
    {
      title: 'Schedule Appointment',
      description: 'Book new appointment',
      icon: 'calendar',
      link: '/doctor/appointments/new',
      color: 'green'
    },
    {
      title: 'View Reports',
      description: 'Check pending reports',
      icon: 'document',
      link: '/doctor/reports',
      color: 'purple'
    },
    {
      title: 'Patient Records',
      description: 'Access medical records',
      icon: 'folder',
      link: '/doctor/records',
      color: 'orange'
    },
    {
      title: 'Analytics',
      description: 'View practice insights',
      icon: 'chart',
      link: '/doctor/analytics',
      color: 'indigo'
    }
  ];

  const getIcon = (iconType) => {
    switch (iconType) {
      case 'userPlus':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            <circle cx="12" cy="7" r="4" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
          </svg>
        );
      case 'calendar':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
      case 'document':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      case 'folder':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>
        );
      case 'chart':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        );
      default:
        return null;
    }
  };

  const getColorClasses = (color) => {
    switch (color) {
      case 'blue':
        return 'bg-blue-100 text-blue-600 hover:bg-blue-200 border-blue-200';
      case 'green':
        return 'bg-green-100 text-green-600 hover:bg-green-200 border-green-200';
      case 'purple':
        return 'bg-purple-100 text-purple-600 hover:bg-purple-200 border-purple-200';
      case 'orange':
        return 'bg-orange-100 text-orange-600 hover:bg-orange-200 border-orange-200';
      case 'indigo':
        return 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200 border-indigo-200';
      default:
        return 'bg-gray-100 text-gray-600 hover:bg-gray-200 border-gray-200';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
      
      <div className="grid grid-cols-1 gap-4">
        {actions.map((action, index) => (
          <Link
            key={index}
            to={action.link}
            className={`flex items-center p-4 rounded-lg border transition-all duration-200 transform hover:scale-105 ${getColorClasses(action.color)}`}
          >
            <div className="flex-shrink-0">
              {getIcon(action.icon)}
            </div>
            <div className="ml-4 flex-1">
              <h3 className="font-medium text-gray-900">{action.title}</h3>
              <p className="text-sm text-gray-600">{action.description}</p>
            </div>
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        ))}
      </div>
      
      <div className="mt-6 pt-6 border-t border-gray-200">
        <Link 
          to="/doctor/emergency"
          className="w-full flex items-center justify-center p-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 font-medium"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          Emergency Protocol
        </Link>
      </div>
    </div>
  );
};

export default QuickActions;
