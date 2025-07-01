import React from 'react';
import { Link } from 'react-router-dom';

const AdminReports = () => {
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">System Reports & Analytics</h1>
              <p className="text-gray-600 mt-1">Comprehensive data insights and reporting tools</p>
            </div>
            <div className="bg-blue-50 px-3 py-1 rounded-md border border-blue-200">
              <span className="text-blue-700 font-medium text-sm">Enterprise Feature</span>
            </div>
          </div>
        </div>

        {/* Report Categories Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* User Analytics */}
          <ReportCard
            title="User Analytics"
            description="Track user engagement, registration trends, and activity patterns"
            features={[
              "User registration trends",
              "Activity heatmaps", 
              "Role distribution analysis",
              "User engagement metrics"
            ]}
            status="In Development"
          />

          {/* System Performance */}
          <ReportCard
            title="System Performance"
            description="Monitor system health, performance metrics, and usage statistics"
            features={[
              "Response time analytics",
              "Error rate monitoring",
              "Resource utilization",
              "Uptime statistics"
            ]}
            status="Planned"
          />

          {/* Data Insights */}
          <ReportCard
            title="Data Insights"
            description="Analyze medical records, collections, and data patterns"
            features={[
              "Record upload trends",
              "Collection usage patterns",
              "Data storage analytics",
              "Document type distribution"
            ]}
            status="Planned"
          />

          {/* Doctor Verification */}
          <ReportCard
            title="Verification Reports"
            description="Track doctor verification processes and compliance metrics"
            features={[
              "Verification status overview",
              "Processing time metrics",
              "Compliance tracking",
              "Verification trends"
            ]}
            status="Planned"
          />
        </div>

        {/* Export Tools Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Export Tools</h3>
              <p className="text-gray-600 mt-1 text-sm">Generate and export reports in various formats</p>
            </div>
            <div className="flex space-x-3">
              <ExportButton format="PDF" disabled />
              <ExportButton format="Excel" disabled />
              <ExportButton format="CSV" disabled />
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-900 text-sm">Export functionality coming soon</p>
                <p className="text-sm text-gray-600">We're developing comprehensive export capabilities for all report types</p>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-6">Development Roadmap</h3>
          <div className="space-y-4">
            <TimelineItem
              quarter="Q3 2025"
              title="User Analytics Dashboard"
              description="Complete user behavior tracking and engagement metrics"
              status="current"
            />
            <TimelineItem
              quarter="Q4 2025"
              title="System Performance Monitoring"
              description="Real-time performance metrics and health monitoring"
              status="upcoming"
            />
            <TimelineItem
              quarter="Q1 2026"
              title="Advanced Data Insights"
              description="AI-powered data analysis and predictive insights"
              status="future"
            />
            <TimelineItem
              quarter="Q2 2026"
              title="Export & Integration Tools"
              description="Comprehensive export options and third-party integrations"
              status="future"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// Report Card Component
const ReportCard = ({ title, description, icon, features, status, color }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200">
    <div className="flex items-start justify-between mb-4">
      <div className={`w-14 h-14 bg-gradient-to-r ${color} rounded-xl flex items-center justify-center shadow-lg`}>
        <span className="text-white text-2xl">{icon}</span>
      </div>
      <StatusBadge status={status} />
    </div>
    <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-600 text-sm mb-4">{description}</p>
    <div className="space-y-2">
      <h4 className="text-sm font-medium text-gray-900">Key Features:</h4>
      <ul className="space-y-1">
        {features.map((feature, index) => (
          <li key={index} className="text-sm text-gray-600 flex items-center">
            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-3"></span>
            {feature}
          </li>
        ))}
      </ul>
    </div>
  </div>
);

// Status Badge Component
const StatusBadge = ({ status }) => {
  const statusConfig = {
    'In Development': { bg: 'bg-blue-100', text: 'text-blue-800', dot: 'bg-blue-500' },
    'Planned': { bg: 'bg-gray-100', text: 'text-gray-800', dot: 'bg-gray-500' },
    'Coming Soon': { bg: 'bg-orange-100', text: 'text-orange-800', dot: 'bg-orange-500' }
  };

  const config = statusConfig[status] || statusConfig['Planned'];

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
      <span className={`w-2 h-2 ${config.dot} rounded-full mr-2`}></span>
      {status}
    </span>
  );
};

// Export Button Component
const ExportButton = ({ format, icon, disabled = false }) => (
  <button
    disabled={disabled}
    className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
      disabled
        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
        : 'bg-blue-600 text-white hover:bg-blue-700'
    }`}
  >
    <span className="mr-2">{icon}</span>
    {format}
  </button>
);

// Timeline Item Component
const TimelineItem = ({ quarter, title, description, status }) => {
  const statusConfig = {
    current: { bg: 'bg-blue-500', border: 'border-blue-200' },
    upcoming: { bg: 'bg-orange-500', border: 'border-orange-200' },
    future: { bg: 'bg-gray-400', border: 'border-gray-200' }
  };

  const config = statusConfig[status];

  return (
    <div className="flex items-start">
      <div className={`w-4 h-4 ${config.bg} rounded-full mt-1 mr-4 border-4 ${config.border}`}></div>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-gray-900">{title}</h4>
          <span className="text-sm text-gray-500 font-medium">{quarter}</span>
        </div>
        <p className="text-sm text-gray-600 mt-1">{description}</p>
      </div>
    </div>
  );
};

export default AdminReports;
