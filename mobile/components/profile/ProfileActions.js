import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';

/**
 * Profile actions component with buttons for various actions
 * @param {boolean} isLoggingOut - Whether the user is currently logging out
 * @param {function} onEditProfile - Function to call when edit profile is pressed
 * @param {function} onChangePassword - Function to call when change password is pressed
 * @param {function} onLogout - Function to call when logout is pressed
 */
const ProfileActions = ({ 
  isLoggingOut, 
  onEditProfile, 
  onChangePassword, 
  onLogout 
}) => {
  return (
    <View style={styles.actionsSection}>
      <TouchableOpacity 
        style={styles.actionButton}
        onPress={onEditProfile}
      >
        <Text style={styles.actionButtonText}>Edit Profile</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.actionButton}
        onPress={onChangePassword}
      >
        <Text style={styles.actionButtonText}>Change Password</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.actionButton, styles.logoutButton]} 
        onPress={onLogout}
        disabled={isLoggingOut}
      >
        {isLoggingOut ? (
          <ActivityIndicator color="#000" size="small" />
        ) : (
          <Text style={[styles.actionButtonText, styles.logoutButtonText]}>Logout</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  actionsSection: {
    padding: 20,
  },
  actionButton: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  actionButtonText: {
    fontWeight: '600',
    fontSize: 16,
  },
  logoutButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#000',
  },
  logoutButtonText: {
    color: '#000',
  },
});

export default ProfileActions;
