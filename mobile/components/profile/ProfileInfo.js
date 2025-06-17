import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { showToast } from '../../utils/toast';

/**
 * Profile information component showing user details with full field support
 */
const ProfileInfo = ({ user, isEditing, onUpdate }) => {  const [formData, setFormData] = useState({
    username: String(user.username || ''),
    email: String(user.email || ''),
    first_name: String(user.first_name || ''),
    last_name: String(user.last_name || ''),
    phone_number: String(user.phone_number || ''),
    blood_group: String(user.blood_group || ''),
    aadhar: String(user.aadhar || ''),
    allergies: String(user.allergies || ''),
    doctor_name: String(user.doctor_name || ''),
    visit_date: String(user.visit_date || ''),
  });  // Update formData when user prop changes
  useEffect(() => {
    setFormData({
      username: String(user.username || ''),
      email: String(user.email || ''),
      first_name: String(user.first_name || ''),
      last_name: String(user.last_name || ''),
      phone_number: String(user.phone_number || ''),
      blood_group: String(user.blood_group || ''),
      aadhar: String(user.aadhar || ''),
      allergies: String(user.allergies || ''),
      doctor_name: String(user.doctor_name || ''),
      visit_date: String(user.visit_date || ''),
    });
  }, [user]);
  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: String(value || '')
    }));
  };  const handleSave = () => {
    try {
      // Validate required fields
      const required = ['first_name', 'last_name', 'phone_number'];
      const missing = required.filter(field => {
        const value = formData[field];
        return !value || String(value).trim() === '';
      });
        if (missing.length > 0) {
        const missingFieldsString = missing.map(field => field.replace(/_/g, ' ')).join(', ');
        showToast.error('Error', `Please fill in all required fields: ${missingFieldsString}`);
        return;
      }

      // Validate phone number format (basic validation)
      const phoneNumber = String(formData.phone_number || '');
      const phoneRegex = /^\+?[1-9]\d{9,14}$/;
      if (!phoneRegex.test(phoneNumber.replace(/\s+/g, ''))) {
        showToast.error('Error', 'Please enter a valid phone number');
        return;
      }

      // Validate email format if provided
      const email = String(formData.email || '').trim();
      if (email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          showToast.error('Error', 'Please enter a valid email address');
          return;
        }
      }

      // Clean and format data before sending
      const cleanedData = {
        ...formData,
        first_name: String(formData.first_name || '').trim(),
        last_name: String(formData.last_name || '').trim(),
        phone_number: String(formData.phone_number || '').trim(),
        username: String(formData.username || '').trim(),
        email: String(formData.email || '').trim(),
        blood_group: String(formData.blood_group || '').trim(),
        aadhar: String(formData.aadhar || '').trim(),
        allergies: String(formData.allergies || '').trim(),
        doctor_name: String(formData.doctor_name || '').trim(),
      };

      onUpdate(cleanedData);    } catch (error) {
      console.error('Error in handleSave:', error);
      showToast.error('Error', 'An unexpected error occurred. Please try again.');
    }
  };
  const renderField = (label, value, field, inputProps = {}, required = false) => (
    <View style={styles.infoItem}>
      <Text style={styles.infoLabel}>{label}{required && ' *'}</Text>      {isEditing ? (
        <TextInput
          style={[
            styles.input,
            inputProps.multiline && styles.textArea,
            required && !formData[field] && styles.requiredField
          ]}
          value={String(formData[field] || '')}
          onChangeText={(text) => handleChange(field, text)}
          placeholder={`Enter ${label.toLowerCase()}`}
          {...inputProps}
        />
      ) : (
        <Text style={styles.infoValue}>{String(value || 'Not provided')}</Text>
      )}
    </View>
  );
  return (
    <View style={styles.infoSection}>
      <Text style={styles.sectionTitle}>Personal Information</Text>
      
      {/* Required Fields */}
      {renderField('First Name', user.first_name, 'first_name', {}, true)}
      {renderField('Last Name', user.last_name, 'last_name', {}, true)}
      {renderField('Phone Number', user.phone_number, 'phone_number', {
        keyboardType: 'phone-pad',
        placeholder: 'e.g., +1234567890'
      }, true)}
      
      {/* Account Information */}
      {renderField('Username', user.username, 'username')}
      {renderField('Email', user.email, 'email', { keyboardType: 'email-address' })}
      
      {/* Medical Information */}
      <Text style={styles.subsectionTitle}>Medical Information</Text>
      {renderField('Blood Group', user.blood_group, 'blood_group', {
        placeholder: 'e.g., A+, B-, O+, AB-'
      })}
      {renderField('Aadhar Number', user.aadhar, 'aadhar', {
        keyboardType: 'numeric',
        placeholder: 'e.g., 1234 5678 9012'
      })}
      {renderField('Allergies', user.allergies, 'allergies', {
        multiline: true,
        numberOfLines: 3,
        placeholder: 'List any known allergies...'
      })}
      {renderField('Doctor Name', user.doctor_name, 'doctor_name', {
        placeholder: 'Primary care physician name'
      })}
      {renderField('Last Visit Date', user.visit_date ? new Date(user.visit_date).toLocaleDateString() : '', 'visit_date', {
        placeholder: 'YYYY-MM-DD'
      })}

      {isEditing && (
        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={[styles.button, styles.saveButton]}
            onPress={handleSave}
          >
            <Text style={styles.buttonText}>Save Changes</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  infoSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#000',
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 12,
    color: '#333',
  },
  infoItem: {
    marginBottom: 16,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#000',
    backgroundColor: '#fff',
  },
  requiredField: {
    borderColor: '#ff6b6b',
  },  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  buttonsContainer: {
    marginTop: 20,
  },
  button: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: '#000',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ProfileInfo;
