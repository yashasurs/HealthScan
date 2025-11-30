import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { hospitalsAPI, adminAPI } from '../../utils/apiService';
import LoadingSpinner from '../../components/LoadingSpinner';
import Modal from '../../components/Modal';
import Input from '../../components/Input';
import Button from '../../components/Button';

const AdminHospitals = () => {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDoctorsModal, setShowDoctorsModal] = useState(false);
  const [showAddDoctorModal, setShowAddDoctorModal] = useState(false);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [hospitalDoctors, setHospitalDoctors] = useState([]);
  const [allDoctors, setAllDoctors] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone_number: '',
    email: ''
  });

  const [selectedDoctorId, setSelectedDoctorId] = useState('');

  useEffect(() => {
    fetchHospitals();
  }, []);

  const fetchHospitals = async () => {
    try {
      setLoading(true);
      const response = await hospitalsAPI.getAll();
      setHospitals(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch hospitals');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllDoctors = async () => {
    try {
      const response = await adminAPI.getUsers({ 
        params: { role: 'doctor', limit: 1000 } 
      });
      setAllDoctors(response.data);
    } catch (err) {
      console.error('Failed to fetch doctors:', err);
    }
  };

  const fetchHospitalDoctors = async (hospitalId) => {
    try {
      const response = await hospitalsAPI.getDoctors(hospitalId);
      setHospitalDoctors(response.data);
    } catch (err) {
      console.error('Failed to fetch hospital doctors:', err);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // Clean data - send null for empty strings
      const cleanData = {
        name: formData.name,
        address: formData.address.trim() || null,
        phone_number: formData.phone_number.trim() || null,
        email: formData.email.trim() || null
      };
      await hospitalsAPI.create(cleanData);
      setShowCreateModal(false);
      resetForm();
      await fetchHospitals();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create hospital');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // Clean data - send null for empty strings
      const cleanData = {
        name: formData.name,
        address: formData.address.trim() || null,
        phone_number: formData.phone_number.trim() || null,
        email: formData.email.trim() || null
      };
      await hospitalsAPI.update(selectedHospital.id, cleanData);
      setShowEditModal(false);
      resetForm();
      setSelectedHospital(null);
      await fetchHospitals();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update hospital');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (hospital) => {
    if (window.confirm(`Are you sure you want to delete ${hospital.name}? This action cannot be undone.`)) {
      try {
        await hospitalsAPI.delete(hospital.id);
        await fetchHospitals();
      } catch (err) {
        setError('Failed to delete hospital');
        console.error(err);
      }
    }
  };

  const handleAddDoctor = async () => {
    if (!selectedDoctorId) return;
    
    setSubmitting(true);
    try {
      await hospitalsAPI.addDoctor(selectedHospital.id, parseInt(selectedDoctorId));
      setSelectedDoctorId('');
      await fetchHospitalDoctors(selectedHospital.id);
      setShowAddDoctorModal(false);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to add doctor to hospital');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveDoctor = async (doctorId) => {
    if (window.confirm('Are you sure you want to remove this doctor from the hospital?')) {
      try {
        await hospitalsAPI.removeDoctor(selectedHospital.id, doctorId);
        await fetchHospitalDoctors(selectedHospital.id);
      } catch (err) {
        setError('Failed to remove doctor from hospital');
        console.error(err);
      }
    }
  };

  const openEditModal = (hospital) => {
    setSelectedHospital(hospital);
    setFormData({
      name: hospital.name,
      address: hospital.address || '',
      phone_number: hospital.phone_number || '',
      email: hospital.email || ''
    });
    setShowEditModal(true);
  };

  const openDoctorsModal = async (hospital) => {
    setSelectedHospital(hospital);
    await fetchHospitalDoctors(hospital.id);
    setShowDoctorsModal(true);
  };

  const openAddDoctorModal = async () => {
    await fetchAllDoctors();
    setShowAddDoctorModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      address: '',
      phone_number: '',
      email: ''
    });
  };

  const filteredHospitals = hospitals.filter(hospital =>
    hospital.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (hospital.address && hospital.address.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (hospital.email && hospital.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getAvailableDoctors = () => {
    const hospitalDoctorIds = hospitalDoctors.map(d => d.id);
    return allDoctors.filter(doctor => !hospitalDoctorIds.includes(doctor.id));
  };

  if (loading && hospitals.length === 0) {
    return <LoadingSpinner size="lg" text="Loading hospitals..." />;
  }

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
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Hospital Management</h1>
              <p className="text-gray-600 mt-1">Manage hospitals and their affiliated doctors</p>
            </div>
            <Button onClick={() => setShowCreateModal(true)}>
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Hospital
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <input
            type="text"
            placeholder="Search hospitals by name, address, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="text-red-700">{error}</div>
            <button
              onClick={() => setError(null)}
              className="text-sm text-red-600 hover:text-red-700 mt-2 underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Hospitals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredHospitals.map((hospital) => (
            <div key={hospital.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{hospital.name}</h3>
                  {hospital.address && (
                    <p className="text-sm text-gray-600 flex items-start mb-2">
                      <svg className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>{hospital.address}</span>
                    </p>
                  )}
                  {hospital.phone_number && (
                    <p className="text-sm text-gray-600 flex items-center mb-2">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      {hospital.phone_number}
                    </p>
                  )}
                  {hospital.email && (
                    <p className="text-sm text-gray-600 flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      {hospital.email}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-200">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => openDoctorsModal(hospital)}
                  className="flex-1"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Doctors
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => openEditModal(hospital)}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => handleDelete(hospital)}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </Button>
              </div>
            </div>
          ))}
        </div>

        {filteredHospitals.length === 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <div className="text-gray-500 text-lg">No hospitals found</div>
            <p className="text-gray-400 mt-2">
              {searchTerm ? 'Try adjusting your search' : 'Click "Add Hospital" to create one'}
            </p>
          </div>
        )}

        {/* Create Hospital Modal */}
        <Modal
          isOpen={showCreateModal}
          onClose={() => {
            setShowCreateModal(false);
            resetForm();
          }}
          title="Create New Hospital"
          size="md"
        >
          <form onSubmit={handleCreate} className="space-y-4">
            <Input
              label="Hospital Name"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter hospital name"
            />
            <Input
              label="Address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Enter address (optional)"
            />
            <Input
              label="Phone Number"
              value={formData.phone_number}
              onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
              placeholder="Enter phone number (optional)"
            />
            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="Enter email (optional)"
            />
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowCreateModal(false);
                  resetForm();
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button type="submit" loading={submitting} className="flex-1">
                Create Hospital
              </Button>
            </div>
          </form>
        </Modal>

        {/* Edit Hospital Modal */}
        <Modal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            resetForm();
            setSelectedHospital(null);
          }}
          title="Edit Hospital"
          size="md"
        >
          <form onSubmit={handleUpdate} className="space-y-4">
            <Input
              label="Hospital Name"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter hospital name"
            />
            <Input
              label="Address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Enter address (optional)"
            />
            <Input
              label="Phone Number"
              value={formData.phone_number}
              onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
              placeholder="Enter phone number (optional)"
            />
            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="Enter email (optional)"
            />
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowEditModal(false);
                  resetForm();
                  setSelectedHospital(null);
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button type="submit" loading={submitting} className="flex-1">
                Update Hospital
              </Button>
            </div>
          </form>
        </Modal>

        {/* Hospital Doctors Modal */}
        <Modal
          isOpen={showDoctorsModal}
          onClose={() => {
            setShowDoctorsModal(false);
            setSelectedHospital(null);
            setHospitalDoctors([]);
          }}
          title={`Doctors at ${selectedHospital?.name}`}
          size="lg"
        >
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-600">
                {hospitalDoctors.length} doctor{hospitalDoctors.length !== 1 ? 's' : ''} affiliated
              </p>
              <Button size="sm" onClick={openAddDoctorModal}>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Doctor
              </Button>
            </div>

            {hospitalDoctors.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No doctors affiliated with this hospital yet
              </div>
            ) : (
              <div className="space-y-2">
                {hospitalDoctors.map((doctor) => (
                  <div
                    key={doctor.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {doctor.first_name?.[0]}{doctor.last_name?.[0]}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {doctor.first_name} {doctor.last_name}
                        </div>
                        <div className="text-sm text-gray-500">{doctor.email}</div>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleRemoveDoctor(doctor.id)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Modal>

        {/* Add Doctor to Hospital Modal */}
        <Modal
          isOpen={showAddDoctorModal}
          onClose={() => {
            setShowAddDoctorModal(false);
            setSelectedDoctorId('');
          }}
          title="Add Doctor to Hospital"
          size="md"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Doctor
              </label>
              <select
                value={selectedDoctorId}
                onChange={(e) => setSelectedDoctorId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">-- Select a doctor --</option>
                {getAvailableDoctors().map((doctor) => (
                  <option key={doctor.id} value={doctor.id}>
                    Dr. {doctor.first_name} {doctor.last_name} ({doctor.email})
                  </option>
                ))}
              </select>
            </div>

            {getAvailableDoctors().length === 0 && (
              <p className="text-sm text-gray-500 italic">
                All doctors are already affiliated with this hospital
              </p>
            )}

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowAddDoctorModal(false);
                  setSelectedDoctorId('');
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddDoctor}
                loading={submitting}
                disabled={!selectedDoctorId}
                className="flex-1"
              >
                Add Doctor
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default AdminHospitals;
