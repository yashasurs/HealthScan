import React from 'react';

const AppointmentsList = () => {
  const todayAppointments = [
    {
      id: 1,
      time: '09:00 AM',
      patient: 'John Doe',
      type: 'Routine Checkup',
      status: 'confirmed',
      avatar: 'JD'
    },
    {
      id: 2,
      time: '10:30 AM',
      patient: 'Sarah Wilson',
      type: 'Follow-up',
      status: 'confirmed',
      avatar: 'SW'
    },
    {
      id: 3,
      time: '11:15 AM',
      patient: 'Michael Brown',
      type: 'Emergency',
      status: 'urgent',
      avatar: 'MB'
    },
    {
      id: 4,
      time: '02:00 PM',
      patient: 'Emily Davis',
      type: 'Consultation',
      status: 'pending',
      avatar: 'ED'
    },
    {
      id: 5,
      time: '03:30 PM',
      patient: 'Robert Johnson',
      type: 'Treatment',
      status: 'confirmed',
      avatar: 'RJ'
    },
    {
      id: 6,
      time: '04:45 PM',
      patient: 'Lisa Anderson',
      type: 'Routine Checkup',
      status: 'confirmed',
      avatar: 'LA'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'urgent':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getCurrentTime = () => {
    return new Date().toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const isCurrentAppointment = (appointmentTime) => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    
    // Parse appointment time (simplified for demo)
    const [time, period] = appointmentTime.split(' ');
    const [hour, minute] = time.split(':');
    let appointmentHour = parseInt(hour);
    
    if (period === 'PM' && appointmentHour !== 12) {
      appointmentHour += 12;
    } else if (period === 'AM' && appointmentHour === 12) {
      appointmentHour = 0;
    }
    
    return currentHour === appointmentHour && Math.abs(currentMinute - parseInt(minute)) <= 15;
  };

  return (
    <div className="space-y-3">
      {todayAppointments.map(appointment => (
        <div 
          key={appointment.id}
          className={`p-3 rounded-lg border transition-all duration-200 hover:shadow-sm ${
            isCurrentAppointment(appointment.time) 
              ? 'bg-blue-50 border-blue-200 ring-2 ring-blue-200' 
              : 'bg-white border-gray-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                {appointment.avatar}
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <p className="font-medium text-gray-900 text-sm">{appointment.patient}</p>
                  {isCurrentAppointment(appointment.time) && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                      Now
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-600">{appointment.type}</p>
              </div>
            </div>
            
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{appointment.time}</p>
              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded border ${getStatusColor(appointment.status)}`}>
                {appointment.status}
              </span>
            </div>
          </div>
        </div>
      ))}
      
      <div className="pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          Current time: {getCurrentTime()}
        </p>
      </div>
    </div>
  );
};

export default AppointmentsList;
