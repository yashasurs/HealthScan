import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { showToast } from '../../utils/toast';

/**
 * Profile header component showing user avatar, name and role with real user data
 * @param {Object} user - The user data
 * @param {boolean} isEditing - Flag indicating if the profile is in editing mode
 * @param {function} onUpdate - Function to call when user data is updated
 */
const ProfileHeader = ({ user, isEditing, onUpdate }) => {
  // Generate initials from the first and last name
  const initials = user.first_name && user.last_name 
    ? `${user.first_name[0]}${user.last_name[0]}`.toUpperCase()
    : (user.username ? user.username[0].toUpperCase() : 'U');
  
  const fullName = user.first_name && user.last_name 
    ? `${user.first_name} ${user.last_name}`
    : user.username;
  
  return (
    <View style={styles.profileSection}>
      <View style={styles.avatarContainer}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {initials}
          </Text>
        </View>
        {isEditing && (
          <TouchableOpacity 
            style={styles.editAvatarButton}
            onPress={() => showToast.info('Coming Soon', 'Avatar upload feature will be available in a future update.')}
          >
            <Text style={styles.editAvatarButtonText}>Change</Text>
          </TouchableOpacity>
        )}
      </View>
      
      <Text style={styles.userName}>{fullName}</Text>
      <Text style={styles.userRole}>Patient</Text>
      {user.phone_number && (
        <Text style={styles.phoneNumber}>{user.phone_number}</Text>
      )}
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
    marginBottom: 4,
  },
  phoneNumber: {
    fontSize: 14,
    color: '#666',
  },
});

export default ProfileHeader;
