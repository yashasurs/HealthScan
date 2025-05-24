import React from 'react';
import { StyleSheet, View, Text } from 'react-native';

/**
 * Profile information component showing user details
 * @param {object} userData - User data containing email, phone, and joinDate
 */
const ProfileInfo = ({ userData }) => {
  return (
    <View style={styles.infoSection}>
      <Text style={styles.sectionTitle}>Personal Information</Text>
      
      <View style={styles.infoItem}>
        <Text style={styles.infoLabel}>Email</Text>
        <Text style={styles.infoValue}>{userData.email}</Text>
      </View>
      
      <View style={styles.infoItem}>
        <Text style={styles.infoLabel}>Phone</Text>
        <Text style={styles.infoValue}>{userData.phone}</Text>
      </View>
      
      <View style={styles.infoItem}>
        <Text style={styles.infoLabel}>Member Since</Text>
        <Text style={styles.infoValue}>{userData.joinDate}</Text>
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
