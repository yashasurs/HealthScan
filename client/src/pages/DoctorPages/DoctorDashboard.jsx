import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import StatsCard from '../../components/DoctorComponents/StatsCard';
import PatientChart from '../../components/DoctorComponents/PatientChart';
import RecentPatients from '../../components/DoctorComponents/RecentPatients';
import AppointmentsList from '../../components/DoctorComponents/AppointmentsList';
import QuickActions from '../../components/DoctorComponents/QuickActions';

const DoctorDashboard = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState('week');
  const [dashboardData, setDashboardData] = useState({
    stats: {
      totalPatients: 247,
      todayAppointments: 12,
      pendingReports: 8,
      monthlyRevenue: 45600
    },
    recentActivity: [
      {
        id: 1,
        type: 'appointment',
        patient: 'John Doe',
        time: '2 hours ago',
        status: 'completed'
      },
      {
        id: 2,
        type: 'report',
        patient: 'Sarah Wilson',
        time: '4 hours ago',
        status: 'pending'
      }
    ]
  });

  const timeframeOptions = [
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'quarter', label: 'This Quarter' },
    { value: 'year', label: 'This Year' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Doctor Dashboard</h1>
            <p className="text-gray-600 mt-2">Welcome back, Dr. Sarah Johnson</p>
          </div>
          
          <div className="flex items-center space-x-4 mt-4 lg:mt-0">
            <select
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              {timeframeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            
            <Link 
              to="/doctor/patients/new"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Patient
            </Link>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Patients"
            value={dashboardData.stats.totalPatients}
            change="+12%"
            changeType="positive"
            icon="users"
          />
          <StatsCard
            title="Today's Appointments"
            value={dashboardData.stats.todayAppointments}
            change="+3"
            changeType="positive"
            icon="calendar"
          />
          <StatsCard
            title="Pending Reports"
            value={dashboardData.stats.pendingReports}
            change="-2"
            changeType="negative"
            icon="document"
          />
          <StatsCard
            title="Monthly Revenue"
            value={`₹${dashboardData.stats.monthlyRevenue.toLocaleString()}`}
            change="+8.2%"
            changeType="positive"
            icon="currency"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Charts and Analytics */}
          <div className="lg:col-span-2 space-y-8">
            {/* Patient Analytics Chart */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Patient Analytics</h2>
                <div className="flex space-x-2">
                  <button className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg">
                    Appointments
                  </button>
                  <button className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700">
                    Revenue
                  </button>
                </div>
              </div>
              <PatientChart timeframe={selectedTimeframe} />
            </div>

            {/* Recent Patients */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Recent Patients</h2>
                <Link 
                  to="/doctor/patients"
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  View All
                </Link>
              </div>
              <RecentPatients />
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-8">
            {/* Quick Actions */}
            <QuickActions />

            {/* Today's Appointments */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Today's Schedule</h2>
                <Link 
                  to="/doctor/appointments"
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  View All
                </Link>
              </div>
              <AppointmentsList />
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Activity</h2>
              <div className="space-y-4">
                {dashboardData.recentActivity.map(activity => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      activity.status === 'completed' ? 'bg-green-500' : 'bg-yellow-500'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 font-medium">{activity.patient}</p>
                      <p className="text-sm text-gray-500 capitalize">{activity.type} - {activity.status}</p>
                      <p className="text-xs text-gray-400">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
