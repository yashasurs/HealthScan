import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';

const PatientDetail = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('overview');

  // Hardcoded patient data
  const patient = {
    id: parseInt(id),
    name: 'John Doe',
    age: 34,
    gender: 'Male',
    phone: '+91 9876543210',
    email: 'john.doe@email.com',
    address: '123 Main Street, Mumbai, Maharashtra 400001',
    emergencyContact: {
      name: 'Jane Doe',
      relation: 'Wife',
      phone: '+91 9876543220'
    },
    medicalHistory: {
      bloodType: 'A+',
      allergies: ['Penicillin', 'Nuts'],
      chronicConditions: ['Hypertension', 'High Cholesterol'],
      currentMedications: [
        { name: 'Lisinopril', dosage: '10mg daily', startDate: '2024-01-15' },
        { name: 'Simvastatin', dosage: '20mg nightly', startDate: '2024-02-01' }
      ]
    },
    vitalSigns: {
      lastRecorded: '2024-06-26',
      bloodPressure: '130/85 mmHg',
      heartRate: '72 bpm',
      temperature: '98.6°F',
      weight: '75 kg',
      height: '175 cm',
      bmi: '24.5'
    },
    appointments: [
      {
        id: 1,
        date: '2024-06-26',
        time: '10:00 AM',
        type: 'Routine Checkup',
        status: 'completed',
        notes: 'Blood pressure slightly elevated. Continue current medication.'
      },
      {
        id: 2,
        date: '2024-06-15',
        time: '2:00 PM',
        type: 'Follow-up',
        status: 'completed',
        notes: 'Patient responding well to treatment.'
      },
      {
        id: 3,
        date: '2024-07-01',
        time: '11:00 AM',
        type: 'Routine Checkup',
        status: 'scheduled',
        notes: ''
      }
    ],
    labResults: [
      {
        id: 1,
        date: '2024-06-20',
        test: 'Complete Blood Count',
        status: 'normal',
        values: {
          'WBC': '7,200/μL',
          'RBC': '4.8 million/μL',
          'Hemoglobin': '14.2 g/dL',
          'Platelets': '250,000/μL'
        }
      },
      {
        id: 2,
        date: '2024-06-20',
        test: 'Lipid Panel',
        status: 'abnormal',
        values: {
          'Total Cholesterol': '240 mg/dL',
          'LDL': '160 mg/dL',
          'HDL': '45 mg/dL',
          'Triglycerides': '180 mg/dL'
        }
      }
    ]
  };

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'history', label: 'Medical History' },
    { id: 'appointments', label: 'Appointments' },
    { id: 'labs', label: 'Lab Results' }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'normal':
        return 'text-green-600 bg-green-100';
      case 'abnormal':
        return 'text-red-600 bg-red-100';
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'scheduled':
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link 
              to="/doctor/patients"
              className="text-blue-600 hover:text-blue-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{patient.name}</h1>
              <p className="text-gray-600">Patient ID: #{patient.id}</p>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <Link 
              to={`/doctor/patients/${patient.id}/edit`}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              Edit Patient
            </Link>
            <Link 
              to={`/doctor/appointments/new?patient=${patient.id}`}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
            >
              Schedule Appointment
            </Link>
          </div>
        </div>

        {/* Patient Info Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">Age:</span> {patient.age} years</p>
                <p><span className="font-medium">Gender:</span> {patient.gender}</p>
                <p><span className="font-medium">Phone:</span> {patient.phone}</p>
                <p><span className="font-medium">Email:</span> {patient.email}</p>
                <p><span className="font-medium">Address:</span> {patient.address}</p>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Emergency Contact</h3>
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">Name:</span> {patient.emergencyContact.name}</p>
                <p><span className="font-medium">Relation:</span> {patient.emergencyContact.relation}</p>
                <p><span className="font-medium">Phone:</span> {patient.emergencyContact.phone}</p>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Latest Vital Signs</h3>
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">Date:</span> {patient.vitalSigns.lastRecorded}</p>
                <p><span className="font-medium">BP:</span> {patient.vitalSigns.bloodPressure}</p>
                <p><span className="font-medium">Heart Rate:</span> {patient.vitalSigns.heartRate}</p>
                <p><span className="font-medium">Weight:</span> {patient.vitalSigns.weight}</p>
                <p><span className="font-medium">BMI:</span> {patient.vitalSigns.bmi}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Medications</h3>
                  <div className="space-y-3">
                    {patient.medicalHistory.currentMedications.map((med, index) => (
                      <div key={index} className="p-3 bg-gray-50 rounded-lg">
                        <p className="font-medium text-gray-900">{med.name}</p>
                        <p className="text-sm text-gray-600">Dosage: {med.dosage}</p>
                        <p className="text-sm text-gray-600">Started: {med.startDate}</p>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Chronic Conditions</h3>
                  <div className="space-y-2">
                    {patient.medicalHistory.chronicConditions.map((condition, index) => (
                      <span key={index} className="inline-block px-3 py-1 bg-red-100 text-red-800 text-sm rounded-full mr-2">
                        {condition}
                      </span>
                    ))}
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 mt-6">Allergies</h3>
                  <div className="space-y-2">
                    {patient.medicalHistory.allergies.map((allergy, index) => (
                      <span key={index} className="inline-block px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full mr-2">
                        {allergy}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'history' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Medical History</h3>
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p><span className="font-medium">Blood Type:</span> {patient.medicalHistory.bloodType}</p>
                  </div>
                  {/* Add more medical history details here */}
                </div>
              </div>
            )}

            {activeTab === 'appointments' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Appointment History</h3>
                <div className="space-y-4">
                  {patient.appointments.map(appointment => (
                    <div key={appointment.id} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="font-medium text-gray-900">{appointment.type}</p>
                          <p className="text-sm text-gray-600">{appointment.date} at {appointment.time}</p>
                        </div>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(appointment.status)}`}>
                          {appointment.status}
                        </span>
                      </div>
                      {appointment.notes && (
                        <p className="text-sm text-gray-700 mt-2">{appointment.notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'labs' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Lab Results</h3>
                <div className="space-y-6">
                  {patient.labResults.map(lab => (
                    <div key={lab.id} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="font-medium text-gray-900">{lab.test}</p>
                          <p className="text-sm text-gray-600">{lab.date}</p>
                        </div>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(lab.status)}`}>
                          {lab.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {Object.entries(lab.values).map(([key, value]) => (
                          <div key={key} className="text-sm">
                            <p className="font-medium text-gray-700">{key}</p>
                            <p className="text-gray-600">{value}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDetail;
