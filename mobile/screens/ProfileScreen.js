import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, Alert, View, ActivityIndicator } from 'react-native';
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
  }

  return (
    <ScrollView style={styles.container}>
      <Header title="Profile" />
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
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});

export default ProfileScreen;
