import React, { useState } from 'react';
import { StyleSheet, ScrollView, Alert } from 'react-native';
import { useAuth } from '../utils/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { Header } from '../components/common';
import { ProfileHeader, ProfileInfo, ProfileActions } from '../components/profile';

const ProfileScreen = () => {
  const { user, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navigation = useNavigation();
  
  // Fallback user data if API data is not yet loaded
  const defaultUserData = {
    name: 'User',
    email: 'loading@example.com',
    phone: 'Loading...',
    role: 'User',
    joinDate: 'Loading...',
  };
  
  // Use API data if available, otherwise use default
  const userData = user || defaultUserData;
  
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
              // Navigation is handled by the AppNavigator based on auth state
            } catch (error) {
              Alert.alert('Logout Failed', error.message || 'Please try again');
              setIsLoggingOut(false);
            }
          },
        },
      ]
    );
  };

  const handleChangeAvatar = () => {
    Alert.alert('Coming Soon', 'This feature will be available in a future update.');
  };

  const handleEditProfile = () => {
    Alert.alert('Coming Soon', 'This feature will be available in a future update.');
  };

  const handleChangePassword = () => {
    Alert.alert('Coming Soon', 'This feature will be available in a future update.');
  };
  return (
    <ScrollView style={styles.container}>
      <Header title="Profile" />
      
      <ProfileHeader 
        userData={userData} 
        onChangeAvatar={handleChangeAvatar} 
      />
      
      <ProfileInfo userData={userData} />
      
      <ProfileActions 
        isLoggingOut={isLoggingOut}
        onEditProfile={handleEditProfile}
        onChangePassword={handleChangePassword}
        onAuthTest={() => navigation.navigate('AuthTest')}
        onNetworkTest={() => navigation.navigate('NetworkTest')}
        onLogout={handleLogout}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  }
});

export default ProfileScreen;
