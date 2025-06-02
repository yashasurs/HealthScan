import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';

/**
 * Profile information component showing user details with hardcoded data
 */
const ProfileInfo = ({ user, isEditing, onUpdate }) => {
  const [formData, setFormData] = useState({
    username: user.username || '',
    email: user.email || '',
    first_name: user.first_name || '',
    last_name: user.last_name || '',
    phone_number: user.phone_number || '',
    blood_group: user.blood_group || '',
    aadhar: user.aadhar || '',
    allergies: user.allergies || '',
    doctor_name: user.doctor_name || '',
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    // Validate required fields
    const required = ['first_name', 'last_name', 'phone_number'];
    const missing = required.filter(field => !formData[field]);
    if (missing.length > 0) {
      Alert.alert('Error', `Please fill in all required fields: ${missing.join(', ')}`);
      return;
    }
    
    // Validate phone number format (basic validation)
    const phoneRegex = /^\+?[1-9]\d{9,14}$/;
    if (!phoneRegex.test(formData.phone_number)) {
      Alert.alert('Error', 'Please enter a valid phone number');
      return;
    }

    onUpdate(formData);
  };

  const bloodGroupOptions = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch (e) {
      return 'N/A';
    }
  };

  const renderField = (label, value, field, inputProps = {}, required = false) => (
    <View style={styles.infoItem}>
      <Text style={styles.infoLabel}>{label}{required && ' *'}</Text>
      {isEditing ? (
        <TextInput
          style={[
            styles.input,
            required && !formData[field] && styles.requiredField
          ]}
          value={formData[field]}
          onChangeText={(text) => handleChange(field, text)}
          placeholder={`Enter ${label.toLowerCase()}`}
          {...inputProps}
        />
      ) : (
        <Text style={styles.infoValue}>{value || 'Not provided'}</Text>
      )}
    </View>
  );

  return (
    <View style={styles.infoSection}>
      <Text style={styles.sectionTitle}>Personal Information</Text>
      
      {renderField('First Name', user.first_name, 'first_name', {}, true)}
      {renderField('Last Name', user.last_name, 'last_name', {}, true)}
      {renderField('Phone Number', user.phone_number, 'phone_number', {
        keyboardType: 'phone-pad',
        placeholder: 'e.g., +1234567890'
      }, true)}
      
      {renderField('Username', user.username, 'username')}
      {renderField('Email', user.email, 'email', { keyboardType: 'email-address' })}
      
      <View style={styles.infoItem}>
        <Text style={styles.infoLabel}>Blood Group</Text>
        {isEditing ? (
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={formData.blood_group}
              onValueChange={(value) => handleChange('blood_group', value)}
              style={styles.picker}
            >
              <Picker.Item label="Select blood group" value="" />
              {bloodGroupOptions.map(option => (
                <Picker.Item key={option} label={option} value={option} />
              ))}
            </Picker>
          </View>
        ) : (
          <Text style={styles.infoValue}>{user.blood_group || 'Not provided'}</Text>
        )}
      </View>

      {renderField('Aadhar', user.aadhar, 'aadhar', { 
        keyboardType: 'numeric',
        maxLength: 12
      })}
      
      {renderField('Doctor Name', user.doctor_name, 'doctor_name')}
      
      <View style={styles.infoItem}>
        <Text style={styles.infoLabel}>Last Visit</Text>
        <Text style={styles.infoValue}>{formatDate(user.visit_date)}</Text>
      </View>

      <View style={styles.infoItem}>
        <Text style={styles.infoLabel}>Allergies</Text>
        {isEditing ? (
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.allergies}
            onChangeText={(text) => handleChange('allergies', text)}
            placeholder="List any allergies"
            multiline
            numberOfLines={3}
          />
        ) : (
          <Text style={styles.infoValue}>{user.allergies || 'None reported'}</Text>
        )}
      </View>

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
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
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
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  picker: {
    height: 50,
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
