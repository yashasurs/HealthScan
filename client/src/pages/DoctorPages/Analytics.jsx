import React, { useState } from 'react';

const Analytics = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedMetric, setSelectedMetric] = useState('patients');

  // Hardcoded analytics data
  const analyticsData = {
    overview: {
      totalPatients: 247,
      newPatients: 23,
      appointments: 156,
      revenue: 85600,
      satisfaction: 4.8
    },
    patientDemographics: {
      ageGroups: [
        { range: '0-18', count: 32, percentage: 13 },
        { range: '19-35', count: 89, percentage: 36 },
        { range: '36-50', count: 78, percentage: 32 },
        { range: '51-65', count: 34, percentage: 14 },
        { range: '65+', count: 14, percentage: 5 }
      ],
      genderDistribution: [
        { gender: 'Male', count: 128, percentage: 52 },
        { gender: 'Female', count: 115, percentage: 47 },
        { gender: 'Other', count: 4, percentage: 1 }
      ]
    },
    commonConditions: [
      { condition: 'Hypertension', count: 45, percentage: 18 },
      { condition: 'Diabetes', count: 38, percentage: 15 },
      { condition: 'Heart Disease', count: 29, percentage: 12 },
      { condition: 'Asthma', count: 25, percentage: 10 },
      { condition: 'Arthritis', count: 22, percentage: 9 },
      { condition: 'Depression', count: 18, percentage: 7 }
    ],
    appointmentTrends: {
      monthly: [
        { month: 'Jan', appointments: 142, revenue: 71000 },
        { month: 'Feb', appointments: 158, revenue: 79000 },
        { month: 'Mar', appointments: 134, revenue: 67000 },
        { month: 'Apr', appointments: 167, revenue: 83500 },
        { month: 'May', appointments: 189, revenue: 94500 },
        { month: 'Jun', appointments: 156, revenue: 78000 }
      ]
    }
  };

  const periods = [
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'quarter', label: 'This Quarter' },
    { value: 'year', label: 'This Year' }
  ];

  const StatCard = ({ title, value, change, icon, color = 'blue' }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          {change && (
            <p className={`text-sm mt-2 ${change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
              {change} from last period
            </p>
          )}
        </div>
        <div className={`p-3 rounded-full bg-${color}-100`}>
          {icon}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="text-gray-600 mt-2">Comprehensive insights into your practice</p>
          </div>
          
          <div className="flex items-center space-x-4 mt-4 lg:mt-0">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              {periods.map(period => (
                <option key={period.value} value={period.value}>
                  {period.label}
                </option>
              ))}
            </select>
            
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200">
              Export Report
            </button>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <StatCard
            title="Total Patients"
            value={analyticsData.overview.totalPatients}
            change="+12%"
            icon={
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
              </svg>
            }
          />
          
          <StatCard
            title="New Patients"
            value={analyticsData.overview.newPatients}
            change="+8%"
            icon={
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            }
            color="green"
          />
          
          <StatCard
            title="Appointments"
            value={analyticsData.overview.appointments}
            change="+15%"
            icon={
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            }
            color="purple"
          />
          
          <StatCard
            title="Revenue"
            value={`₹${analyticsData.overview.revenue.toLocaleString()}`}
            change="+22%"
            icon={
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            }
            color="orange"
          />
          
          <StatCard
            title="Satisfaction"
            value={`${analyticsData.overview.satisfaction}/5`}
            change="+0.2"
            icon={
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            }
            color="yellow"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Patient Demographics */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Patient Demographics</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-700 mb-4">Age Distribution</h3>
                <div className="space-y-3">
                  {analyticsData.patientDemographics.ageGroups.map((group, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{group.range} years</span>
                      <div className="flex items-center space-x-3">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full" 
                            style={{ width: `${group.percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-900">{group.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-700 mb-4">Gender Distribution</h3>
                <div className="space-y-3">
                  {analyticsData.patientDemographics.genderDistribution.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{item.gender}</span>
                      <div className="flex items-center space-x-3">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full" 
                            style={{ width: `${item.percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-900">{item.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Common Conditions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Most Common Conditions</h2>
            
            <div className="space-y-4">
              {analyticsData.commonConditions.map((condition, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                      <span className="text-red-600 font-semibold text-sm">{index + 1}</span>
                    </div>
                    <span className="font-medium text-gray-900">{condition.condition}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{condition.count}</p>
                    <p className="text-sm text-gray-500">{condition.percentage}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Appointment Trends */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Appointment & Revenue Trends</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            {analyticsData.appointmentTrends.monthly.map((month, index) => (
              <div key={index} className="text-center p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                <p className="text-sm font-medium text-gray-600">{month.month}</p>
                <p className="text-2xl font-bold text-blue-600 mt-2">{month.appointments}</p>
                <p className="text-xs text-gray-500">appointments</p>
                <p className="text-sm font-semibold text-green-600 mt-2">₹{month.revenue.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
