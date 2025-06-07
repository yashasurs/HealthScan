import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, Alert, View, ActivityIndicator, Text, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Header } from '../components/common';
import { ProfileHeader, ProfileInfo, ProfileActions } from '../components/profile';
import { useAuth } from '../Contexts/Authcontext';
import { useApiService } from '../services/apiService';

const ProfileScreen = () => {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigation = useNavigation();
  const { logout } = useAuth();
  const apiService = useApiService();

  const loadUserData = async () => {
    try {
      const response = await apiService.auth.getCurrentUser();
      setUserData(response.data);
      setErrorMessage('');
    } catch (error) {
      setErrorMessage('Failed to load user data');
      console.error('Error loading user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUserData();
  }, []);

  const handleLogout = async () => {
    Alert.alert(
      'Confirm Logout',
      'Are you sure you want to log out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          onPress: async () => {
            setIsLoggingOut(true);
            try {
              await logout();
              setIsLoggingOut(false);
            } catch (error) {
              Alert.alert('Error', 'Failed to logout');
              setIsLoggingOut(false);
            }
          },
        },
      ]
    );
  };

  const handleUpdateProfile = async (updatedData) => {
    try {
      setIsLoading(true);
      const response = await apiService.auth.updateUser(updatedData);
      setUserData(response.data);
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      Alert.alert('Error', error.response?.data?.detail || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async (oldPassword, newPassword) => {
    try {
      setIsLoading(true);
      await apiService.auth.changePassword(oldPassword, newPassword);
      Alert.alert('Success', 'Password changed successfully');
    } catch (error) {
      Alert.alert('Error', error.response?.data?.detail || 'Failed to change password');
    } finally {
      setIsLoading(false);
    }
  };
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
        <Text style={styles.subtitle}>Manage your account and settings</Text>
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {userData && (
          <>
            <ProfileHeader 
              user={userData}
              isEditing={isEditing}
              onUpdate={handleUpdateProfile}
            />
            
            <ProfileInfo 
              user={userData}
              isEditing={isEditing}
              onUpdate={handleUpdateProfile}
            />
            
            <ProfileActions 
              isLoggingOut={isLoggingOut}
              isEditing={isEditing}
              onEditProfile={() => setIsEditing(true)}
              onCancelEdit={() => setIsEditing(false)}
              onChangePassword={handlePasswordChange}
              onLogout={handleLogout}
            />
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  errorContainer: {
    backgroundColor: '#fff2f2',
    padding: 16,
    margin: 16,
    borderRadius: 8,
  },
  errorText: {
    color: '#dc2626',
    fontSize: 14,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: '#1a1a1a',
  },
  secondaryButton: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  primaryButtonText: {
    color: '#fff',
  },
  secondaryButtonText: {
    color: '#666',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
});

export default ProfileScreen;
