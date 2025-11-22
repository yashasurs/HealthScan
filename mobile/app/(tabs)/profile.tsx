import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, View, ActivityIndicator, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { ProfileHeader, ProfileInfo, ProfileActions } from '@/components/profile';
import { useAuth } from '@/contexts/AuthContext';
import { useApiService } from '@/services/apiService';
import { showToast, showConfirmToast } from '@/utils/toast';
import { User } from '@/types';

const ProfileScreen = () => {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Changed from true since we get data from AuthContext
  const [isEditing, setIsEditing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();
  const { logout, user, loading: authLoading } = useAuth(); // Get user from AuthContext
  const apiService = useApiService();

  // No need for loadUserData function - use user from AuthContext
  // Only set loading to false when auth loading is complete
  useEffect(() => {
    if (!authLoading) {
      setIsLoading(false);
    }
  }, [authLoading]);
  
  const handleLogout = async () => {
    showConfirmToast(
      'Confirm Logout',
      'Are you sure you want to log out?',
      async () => {
        setIsLoggingOut(true);
        try {
          await logout();
          setIsLoggingOut(false);
        } catch (error) {
          showToast.error('Error', 'Failed to logout');
          setIsLoggingOut(false);
        }
      }
    );
  };

  const handleUpdateProfile = async (updatedData: any) => {
    try {
      setIsLoading(true);
      const response = await apiService.auth.updateUser(updatedData);
      // Note: The updated user data should be reflected in AuthContext automatically
      // after the API call. If not, we may need to trigger a user data refresh in AuthContext
      setIsEditing(false);
      showToast.success('Success', 'Profile updated successfully');
    } catch (error: any) {
      showToast.error('Error', error.response?.data?.detail || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async (oldPassword: string, newPassword: string) => {
    try {
      // You'll need to implement this API call in your backend
      // For now, just show a message
      showToast.info('Coming Soon', 'Password change feature will be available in a future update.');
    } catch (error) {
      showToast.error('Error', 'Failed to change password');
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
        {user && (
          <>
            <ProfileHeader 
              user={user}
              isEditing={isEditing}
              onUpdate={handleUpdateProfile}
            />
            
            <ProfileInfo 
              user={user}
              isEditing={isEditing}
              onUpdate={handleUpdateProfile}
            />
            
            <ProfileActions 
              isLoggingOut={isLoggingOut}
              isEditing={isEditing}
              onEditProfile={() => setIsEditing(true)}
              onCancelEdit={() => setIsEditing(false)}
              onChangePassword={handleChangePassword}
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
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  contentContainer: {
    paddingBottom: 160, // Extra padding to account for navigation bar and additional content
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
});

export default ProfileScreen;
