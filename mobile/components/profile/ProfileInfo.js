import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';

/**
 * Profile information component showing user details with hardcoded data
 */
const ProfileInfo = ({ user, isEditing, onUpdate }) => {  const [formData, setFormData] = useState({
    username: user.username || '',
    email: user.email || '',
    first_name: user.first_name || '',
    last_name: user.last_name || '',
    phone_number: user.phone_number || '',
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
    }    onUpdate(formData);
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
      }, true)}        {renderField('Username', user.username, 'username')}
      {renderField('Email', user.email, 'email', { keyboardType: 'email-address' })}

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
