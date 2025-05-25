import React from 'react';
import { StyleSheet, View, Text } from 'react-native';

/**
 * Profile information component showing user details with hardcoded data
 */
const ProfileInfo = () => {
  // Hardcoded user data
  const hardcodedUserData = {
    email: "john.doe@example.com",
    username: "johndoe",
    phoneNumber: "+1 (123) 456-7890",
    lastLogin: "2025-05-24T14:30:00Z"
  };

  // Format date if lastLogin exists
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch (e) {
      return 'N/A';
    }
  };
  return (
    <View style={styles.infoSection}>
      <Text style={styles.sectionTitle}>Personal Information</Text>
      
      <View style={styles.infoItem}>
        <Text style={styles.infoLabel}>Email</Text>
        <Text style={styles.infoValue}>{hardcodedUserData.email}</Text>
      </View>
      
      <View style={styles.infoItem}>
        <Text style={styles.infoLabel}>Username</Text>
        <Text style={styles.infoValue}>{hardcodedUserData.username}</Text>
      </View>

      <View style={styles.infoItem}>
        <Text style={styles.infoLabel}>Phone</Text>
        <Text style={styles.infoValue}>{hardcodedUserData.phoneNumber}</Text>
      </View>
      
      <View style={styles.infoItem}>
        <Text style={styles.infoLabel}>Last Login</Text>
        <Text style={styles.infoValue}>{formatDate(hardcodedUserData.lastLogin)}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  infoSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoLabel: {
    fontSize: 16,
    color: '#666',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
  },
});

export default ProfileInfo;
