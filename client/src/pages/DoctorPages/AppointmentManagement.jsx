import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const AppointmentManagement = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [viewMode, setViewMode] = useState('day'); // day, week, month
  const [filterStatus, setFilterStatus] = useState('all');

  const appointments = [
    {
      id: 1,
      time: '09:00',
      duration: 30,
      patient: {
        name: 'John Doe',
        phone: '+91 9876543210',
        avatar: 'JD'
      },
      type: 'Routine Checkup',
      status: 'confirmed',
      notes: 'Follow-up for hypertension'
    },
    {
      id: 2,
      time: '10:30',
      duration: 45,
      patient: {
        name: 'Sarah Wilson',
        phone: '+91 9876543211',
        avatar: 'SW'
      },
      type: 'Consultation',
      status: 'confirmed',
      notes: 'Diabetes management consultation'
    },
    {
      id: 3,
      time: '11:15',
      duration: 60,
      patient: {
        name: 'Michael Brown',
        phone: '+91 9876543212',
        avatar: 'MB'
      },
      type: 'Emergency',
      status: 'urgent',
      notes: 'Chest pain complaint'
    },
    {
      id: 4,
      time: '14:00',
      duration: 30,
      patient: {
        name: 'Emily Davis',
        phone: '+91 9876543213',
        avatar: 'ED'
      },
      type: 'Prenatal Checkup',
      status: 'confirmed',
      notes: 'Regular pregnancy checkup'
    },
    {
      id: 5,
      time: '15:30',
      duration: 30,
      patient: {
        name: 'Robert Johnson',
        phone: '+91 9876543214',
        avatar: 'RJ'
      },
      type: 'Follow-up',
      status: 'pending',
      notes: 'Arthritis treatment follow-up'
    },
    {
      id: 6,
      time: '16:45',
      duration: 30,
      patient: {
        name: 'Lisa Anderson',
        phone: '+91 9876543215',
        avatar: 'LA'
      },
      type: 'Routine Checkup',
      status: 'confirmed',
      notes: 'Annual health checkup'
    }
  ];

  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getAppointmentForSlot = (time) => {
    return appointments.find(appointment => appointment.time === time);
  };

  const filteredAppointments = appointments.filter(appointment => {
    return filterStatus === 'all' || appointment.status === filterStatus;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Appointment Management</h1>
            <p className="text-gray-600 mt-2">Manage your daily schedule and appointments</p>
          </div>
          
          <div className="flex items-center space-x-4 mt-4 lg:mt-0">
            <Link 
              to="/doctor/appointments/new"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Appointment
            </Link>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Date</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">View Mode</label>
              <select
                value={viewMode}
                onChange={(e) => setViewMode(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="day">Day View</option>
                <option value="week">Week View</option>
                <option value="month">Month View</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="confirmed">Confirmed</option>
                <option value="pending">Pending</option>
                <option value="urgent">Urgent</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            
            <div className="flex items-end">
              <button className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200">
                Export Schedule
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Schedule View */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  Schedule for {new Date(selectedDate).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </h2>
              </div>
              
              <div className="p-6">
                <div className="space-y-2">
                  {timeSlots.map(time => {
                    const appointment = getAppointmentForSlot(time);
                    
                    return (
                      <div key={time} className="grid grid-cols-12 gap-4 py-2 border-b border-gray-100">
                        <div className="col-span-2 text-sm font-medium text-gray-600 py-2">
                          {time}
                        </div>
                        
                        <div className="col-span-10">
                          {appointment ? (
                            <div className={`p-3 rounded-lg border ${getStatusColor(appointment.status)}`}>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                                    {appointment.patient.avatar}
                                  </div>
                                  <div>
                                    <p className="font-medium text-gray-900">{appointment.patient.name}</p>
                                    <p className="text-sm text-gray-600">{appointment.type}</p>
                                    {appointment.notes && (
                                      <p className="text-xs text-gray-500 mt-1">{appointment.notes}</p>
                                    )}
                                  </div>
                                </div>
                                
                                <div className="flex items-center space-x-2">
                                  <span className="text-xs text-gray-500">{appointment.duration}min</span>
                                  <button className="text-blue-600 hover:text-blue-700 text-sm">
                                    Edit
                                  </button>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="h-12 border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center text-gray-400 text-sm hover:border-gray-300 cursor-pointer">
                              Available
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Today's Summary */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Summary</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Total Appointments</span>
                  <span className="font-semibold text-gray-900">{appointments.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Confirmed</span>
                  <span className="font-semibold text-green-600">
                    {appointments.filter(a => a.status === 'confirmed').length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Pending</span>
                  <span className="font-semibold text-yellow-600">
                    {appointments.filter(a => a.status === 'pending').length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Urgent</span>
                  <span className="font-semibold text-red-600">
                    {appointments.filter(a => a.status === 'urgent').length}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors duration-200">
                  <div className="flex items-center space-x-3">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm font-medium">Block Time Slot</span>
                  </div>
                </button>
                
                <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors duration-200">
                  <div className="flex items-center space-x-3">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm font-medium">Mark as Completed</span>
                  </div>
                </button>
                
                <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors duration-200">
                  <div className="flex items-center space-x-3">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16l2.879-2.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm font-medium">Send Reminder</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Upcoming Appointments */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Next Appointments</h3>
              <div className="space-y-3">
                {filteredAppointments.slice(0, 3).map(appointment => (
                  <div key={appointment.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                      {appointment.patient.avatar}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{appointment.patient.name}</p>
                      <p className="text-xs text-gray-600">{appointment.time} • {appointment.type}</p>
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

export default AppointmentManagement;
