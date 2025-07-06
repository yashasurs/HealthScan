import React from 'react';

// Stat Card Component for Doctor Dashboard
export const DoctorStatCard = ({ title, value, change, icon, color = "blue" }) => {
  const icons = {
    patients: (
      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
      </svg>
    ),
    records: (
      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    stethoscope: (
      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2m14 0H5m9-16l3 3m-3-3v12" />
      </svg>
    ),
    verification: (
      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    )
  };

  const colorClasses = {
    blue: "border-blue-200 bg-blue-50",
    green: "border-green-200 bg-green-50", 
    orange: "border-orange-200 bg-orange-50",
    purple: "border-purple-200 bg-purple-50"
  };

  return (
    <div className={`bg-white rounded-lg border ${colorClasses[color]} p-6 hover:shadow-md transition-shadow duration-200`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center">
            {icons[icon]}
            <p className="ml-2 text-sm font-medium text-gray-600">{title}</p>
          </div>
          <p className="mt-2 text-2xl font-semibold text-gray-900">{typeof value === 'number' ? value.toLocaleString() : value}</p>
          <p className="mt-1 text-xs text-gray-500">{change}</p>
        </div>
      </div>
    </div>
  );
};

// Patient Card Component
export const PatientCard = ({ patient, onClick }) => {
  return (
    <div 
      className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md hover:border-gray-300 transition-all duration-200 cursor-pointer"
      onClick={() => onClick(patient)}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h4 className="text-lg font-medium text-gray-900">
            {patient.first_name} {patient.last_name}
          </h4>
          <p className="text-sm text-gray-600">{patient.email}</p>
          <div className="flex items-center mt-2 space-x-4">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {patient.blood_group}
            </span>
            <span className="text-xs text-gray-500">{patient.phone_number}</span>
          </div>
          {patient.allergies && (
            <p className="text-xs text-red-600 mt-1">
              <span className="font-medium">Allergies:</span> {patient.allergies}
            </p>
          )}
        </div>
        <div className="ml-4">
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </div>
  );
};

// Recent Patients Component
export const RecentPatients = ({ patients, onPatientClick }) => {
  if (!patients || patients.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Patients</h3>
        <div className="text-center py-6">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
          </svg>
          <p className="mt-2 text-sm text-gray-500">No patients assigned yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Patients</h3>
      <div className="space-y-3">
        {patients.map((patient) => (
          <div 
            key={patient.id}
            className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors duration-200"
            onClick={() => onPatientClick(patient)}
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-blue-600">
                  {patient.name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{patient.name}</p>
                <p className="text-xs text-gray-500">{patient.blood_group}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">
                {patient.last_visit ? new Date(patient.last_visit).toLocaleDateString() : 'No visits'}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Doctor Profile Card Component
export const DoctorProfileCard = ({ doctor }) => {
  if (!doctor) return null;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center space-x-4">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-gray-900">{doctor.name}</h3>
          <p className="text-gray-600">{doctor.email}</p>
          {doctor.specialization && (
            <p className="text-sm text-blue-600 font-medium">{doctor.specialization}</p>
          )}
        </div>
      </div>
      
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        {doctor.hospital_affiliation && (
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Hospital</p>
            <p className="text-sm text-gray-900 mt-1">{doctor.hospital_affiliation}</p>
          </div>
        )}
        {doctor.medical_license_number && (
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">License Number</p>
            <p className="text-sm text-gray-900 mt-1">{doctor.medical_license_number}</p>
          </div>
        )}
        {doctor.years_of_experience && (
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Experience</p>
            <p className="text-sm text-gray-900 mt-1">{doctor.years_of_experience} years</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Quick Action Button Component
export const DoctorActionButton = ({ to, title, description, icon, onClick, disabled = false }) => {
  const icons = {
    patients: (
      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
      </svg>
    ),
    profile: (
      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
    register: (
      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    info: (
      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  };

  const content = (
    <div className={`block p-6 border rounded-lg transition-all duration-200 ${
      disabled 
        ? 'border-gray-200 bg-gray-50 cursor-not-allowed' 
        : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50 cursor-pointer'
    }`}>
      <div className="text-center">
        <div className="flex justify-center mb-3">
          {icons[icon]}
        </div>
        <div className={`font-medium text-sm mb-1 ${disabled ? 'text-gray-400' : 'text-gray-900'}`}>
          {title}
        </div>
        <div className={`text-xs ${disabled ? 'text-gray-400' : 'text-gray-500'}`}>
          {description}
        </div>
      </div>
    </div>
  );

  if (disabled || onClick) {
    return (
      <div onClick={disabled ? undefined : onClick}>
        {content}
      </div>
    );
  }

  return content;
};
