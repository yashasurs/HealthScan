import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { showToast } from '@/utils/toast';

interface FormData {
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  blood_group: string;
  aadhar: string;
  allergies: string;
  doctor_name: string;
  visit_date: string;
}

export default function SignupScreen() {
  const [formData, setFormData] = useState<FormData>({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    first_name: '',
    last_name: '',
    phone_number: '',
    blood_group: '',
    aadhar: '',
    allergies: '',
    doctor_name: '',
    visit_date: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { register, markLaunchComplete, isAuthenticated } = useAuth();
  const router = useRouter();

  // Mark launch complete when component mounts (user navigated from landing)
  useEffect(() => {
    if (markLaunchComplete) {
      markLaunchComplete();
    }
  }, [markLaunchComplete]);

  // Navigate to tabs if user becomes authenticated
  useEffect(() => {
    if (isAuthenticated) {
      console.log('User is authenticated, navigating to tabs from signup screen');
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, router]);

  // Also check on mount if user is already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      console.log('User already authenticated on signup screen mount, redirecting');
      router.replace('/(tabs)');
    }
  }, []);

  const bloodGroupOptions = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  
  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDateChange = (event: any, date?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (date) {
      setSelectedDate(date);
      const formattedDate = date.toISOString().split('T')[0]; // YYYY-MM-DD format
      handleInputChange('visit_date', formattedDate);
    }
  };

  const showDatePickerModal = () => {
    setShowDatePicker(true);
  };
  
  const validateForm = () => {
    const { email, username, password, confirmPassword, blood_group, first_name, last_name, phone_number } = formData;
    
    if (!email.trim()) {
      showToast.error('Error', 'Please enter your email');
      return false;
    }
    
    if (!email.includes('@')) {
      showToast.error('Error', 'Please enter a valid email address');
      return false;
    }
    
    if (!username.trim()) {
      showToast.error('Error', 'Please enter a username');
      return false;
    }

    if (!first_name.trim()) {
      showToast.error('Error', 'Please enter your first name');
      return false;
    }

    if (!last_name.trim()) {
      showToast.error('Error', 'Please enter your last name');
      return false;
    }

    if (!phone_number.trim()) {
      showToast.error('Error', 'Please enter your phone number');
      return false;
    }

    if (phone_number.length < 10) {
      showToast.error('Error', 'Please enter a valid phone number');
      return false;
    }
    
    if (!password.trim()) {
      showToast.error('Error', 'Please enter a password');
      return false;
    }
    
    if (password.length < 6) {
      showToast.error('Error', 'Password must be at least 6 characters');
      return false;
    }
    
    if (password !== confirmPassword) {
      showToast.error('Error', 'Passwords do not match');
      return false;
    }

    if (!blood_group) {
      showToast.error('Error', 'Please select your blood group');
      return false;
    }
    
    return true;
  };

  const handleSignup = async () => {
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const userData = {
        email: formData.email,
        username: formData.username,
        password: formData.password,
        first_name: formData.first_name,
        last_name: formData.last_name,
        blood_group: formData.blood_group, // Required field
        ...(formData.phone_number && { phone_number: formData.phone_number }),
        ...(formData.aadhar && { aadhar: formData.aadhar }),
        ...(formData.allergies && { allergies: formData.allergies }),
        ...(formData.doctor_name && { doctor_name: formData.doctor_name }),
        ...(formData.visit_date && { visit_date: formData.visit_date }),
      };
      
      const result = await register(userData);
      console.log('Registration result:', result);
      
      if (result.success) {
        console.log('Registration successful, showing toast...');
        showToast.success('Success', 'Account created successfully!');
        console.log('Registration successful, auth state will trigger navigation');
        // Navigation will happen automatically via useEffect when isAuthenticated changes
      } else {
        console.log('Registration failed:', result.error);
        // Ensure we're always passing a string to the toast
        const errorMessage = typeof result.error === 'string' ? result.error : 'Registration failed. Please try again.';
        showToast.error('Registration Failed', errorMessage);
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      // Ensure we're always passing a string to the toast
      const errorMessage = typeof error.message === 'string' ? error.message : 'An unexpected error occurred. Please try again.';
      showToast.error('Registration Failed', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToLogin = () => {
    router.push('/login');
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Please fill in the form to continue</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>First Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your first name"
                value={formData.first_name}
                onChangeText={(value) => handleInputChange('first_name', value)}
                editable={!isLoading}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Last Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your last name"
                value={formData.last_name}
                onChangeText={(value) => handleInputChange('last_name', value)}
                editable={!isLoading}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Phone Number *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your phone number"
                value={formData.phone_number}
                onChangeText={(value) => handleInputChange('phone_number', value)}
                keyboardType="phone-pad"
                maxLength={15}
                editable={!isLoading}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                value={formData.email}
                onChangeText={(value) => handleInputChange('email', value)}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!isLoading}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Username *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your username"
                value={formData.username}
                onChangeText={(value) => handleInputChange('username', value)}
                autoCapitalize="none"
                editable={!isLoading}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your password"
                value={formData.password}
                onChangeText={(value) => handleInputChange('password', value)}
                secureTextEntry
                editable={!isLoading}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Confirm Password *</Text>
              <TextInput
                style={styles.input}
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChangeText={(value) => handleInputChange('confirmPassword', value)}
                secureTextEntry
                editable={!isLoading}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Blood Group *</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formData.blood_group}
                  onValueChange={(value) => handleInputChange('blood_group', value)}
                  style={styles.picker}
                  enabled={!isLoading}
                >
                  <Picker.Item label="Select your blood group" value="" />
                  {bloodGroupOptions.map((group) => (
                    <Picker.Item key={group} label={group} value={group} />
                  ))}
                </Picker>
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Aadhar Number (Optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your Aadhar number"
                value={formData.aadhar}
                onChangeText={(value) => handleInputChange('aadhar', value)}
                keyboardType="numeric"
                maxLength={12}
                editable={!isLoading}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Allergies (Optional)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Enter any allergies"
                value={formData.allergies}
                onChangeText={(value) => handleInputChange('allergies', value)}
                multiline
                numberOfLines={3}
                editable={!isLoading}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Doctor Name (Optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your doctor's name"
                value={formData.doctor_name}
                onChangeText={(value) => handleInputChange('doctor_name', value)}
                editable={!isLoading}
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Last Visit Date (Optional)</Text>
              <TouchableOpacity 
                style={styles.datePickerButton}
                onPress={showDatePickerModal}
                disabled={isLoading}
              >
                <Text style={[styles.datePickerText, !formData.visit_date && styles.placeholderText]}>
                  {formData.visit_date || 'Select last visit date'}
                </Text>
                <Ionicons name="calendar-outline" size={20} color="#666" />
              </TouchableOpacity>
              
              {showDatePicker && (
                <DateTimePicker
                  value={selectedDate}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={handleDateChange}
                  maximumDate={new Date()}
                />
              )}
            </View>

            <TouchableOpacity 
              style={[styles.signupButton, isLoading && styles.disabledButton]}
              onPress={handleSignup}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.signupButtonText}>Create Account</Text>
              )}
            </TouchableOpacity>

            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <TouchableOpacity onPress={navigateToLogin} disabled={isLoading}>
                <Text style={styles.loginLink}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: '#f8f9fa',
  },
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    backgroundColor: '#ffe6e6',
    padding: 12,
    borderRadius: 4,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#ff0000',
  },
  errorText: {
    color: '#cc0000',
    fontSize: 14,
  },
  form: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#181818',
    borderRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1a1a1a',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    borderWidth: 2,
    borderColor: '#181818',
    borderRadius: 4,
    backgroundColor: '#fff',
  },
  picker: {
    height: 50,
    color: '#1a1a1a',
  },
  datePickerButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#181818',
    borderRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  datePickerText: {
    fontSize: 16,
    color: '#1a1a1a',
  },
  placeholderText: {
    color: '#666',
  },
  signupButton: {
    backgroundColor: '#181818',
    borderRadius: 4,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
    borderWidth: 2,
    borderColor: '#181818',
  },
  disabledButton: {
    opacity: 0.6,
  },
  signupButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    fontSize: 16,
    color: '#666',
  },
  loginLink: {
    fontSize: 16,
    color: '#181818',
    fontWeight: '600',
  },
});
