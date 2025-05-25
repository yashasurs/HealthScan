import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';

/**
 * Profile header component showing user avatar, name and role with hardcoded data
 * @param {function} onChangeAvatar - Function to call when change avatar button is pressed
 */
const ProfileHeader = ({ onChangeAvatar }) => {
  // Hardcoded user data
  const hardcodedUserData = {
    fullName: "John Doe",
    role: "Patient"
  };
  
  // Generate initials from the name
  const displayName = hardcodedUserData.fullName;
  const initials = displayName.split(' ').map(n => n[0]).join('');  
  return (
    <View style={styles.profileSection}>
      <View style={styles.avatarContainer}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {initials}
          </Text>
        </View>
        <TouchableOpacity 
          style={styles.editAvatarButton}
          onPress={onChangeAvatar}
        >
          <Text style={styles.editAvatarButtonText}>Change</Text>
        </TouchableOpacity>
      </View>
      
      <Text style={styles.userName}>{displayName}</Text>
      <Text style={styles.userRole}>{hardcodedUserData.role}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  profileSection: {
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  avatarText: {
    color: '#fff',
    fontSize: 36,
    fontWeight: 'bold',
  },
  editAvatarButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f0f0f0',
    borderRadius: 15,
  },
  editAvatarButtonText: {
    fontSize: 12,
    color: '#000',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userRole: {
    fontSize: 16,
    color: '#666',
  },
});

export default ProfileHeader;
