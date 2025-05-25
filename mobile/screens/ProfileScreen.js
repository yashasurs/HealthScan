import React, { useState } from 'react';
import { StyleSheet, ScrollView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Header } from '../components/common';
import { ProfileHeader, ProfileInfo, ProfileActions } from '../components/profile';
import { useAuth } from '../Contexts/Authcontext';

const ProfileScreen = () => {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navigation = useNavigation();
  const { logout } = useAuth();
  const handleLogout = async () => {
    Alert.alert(
      'Confirm Logout',
      'Are you sure you want to log out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {          text: 'Logout',
          onPress: async () => {
            setIsLoggingOut(true);
            try {
              // Call the logout function from AuthContext
              await logout();
              // No need to navigate, the AuthProvider will handle the navigation
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

  const handleChangeAvatar = () => {
    Alert.alert('Coming Soon', 'This feature will be available in a future update.');
  };

  const handleEditProfile = () => {
    Alert.alert('Coming Soon', 'This feature will be available in a future update.');
  };

  const handleChangePassword = () => {
    Alert.alert('Coming Soon', 'This feature will be available in a future update.');
  };  return (
    <ScrollView style={styles.container}>
      <Header title="Profile" />
      <ProfileHeader 
        onChangeAvatar={handleChangeAvatar} 
      />
      
      <ProfileInfo />
      
      <ProfileActions 
        isLoggingOut={isLoggingOut}
        onEditProfile={handleEditProfile}
        onChangePassword={handleChangePassword}
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
