import React, { useState } from 'react';
import { StyleSheet, ScrollView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Header } from '../components/common';
import { ProfileHeader, ProfileInfo, ProfileActions } from '../components/profile';

const ProfileScreen = () => {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navigation = useNavigation();
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
              // Simulated logout - no actual authentication call
              setTimeout(() => {
                // Navigate to login screen
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'Login' }],
                });
                setIsLoggingOut(false);
              }, 1000);
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
