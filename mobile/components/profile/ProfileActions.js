import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ActivityIndicator, Modal, TextInput, Alert } from 'react-native';

/**
 * Profile actions component with buttons for various actions
 * @param {boolean} isLoggingOut - Whether the user is currently logging out
 * @param {boolean} isEditing - Whether the user is currently editing the profile
 * @param {function} onEditProfile - Function to call when edit profile is pressed
 * @param {function} onCancelEdit - Function to call when cancel editing is pressed
 * @param {function} onChangePassword - Function to call when change password is pressed
 * @param {function} onLogout - Function to call when logout is pressed
 */
const ProfileActions = ({ 
  isLoggingOut, 
  isEditing,
  onEditProfile, 
  onCancelEdit,
  onChangePassword, 
  onLogout 
}) => {
  const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false);  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const handlePasswordChange = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    setIsChangingPassword(true);
    try {
      if (onChangePassword) {
        await onChangePassword(passwordForm.oldPassword, passwordForm.newPassword);
      }
      setIsPasswordModalVisible(false);
      setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      console.error('Password change error:', error);
      Alert.alert('Error', 'Failed to change password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <View style={styles.actionsSection}>
      {!isEditing ? (
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={onEditProfile}
        >
          <Text style={styles.actionButtonText}>Edit Profile</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity 
          style={[styles.actionButton, styles.cancelButton]}
          onPress={onCancelEdit}
        >
          <Text style={[styles.actionButtonText, styles.cancelButtonText]}>Cancel Editing</Text>
        </TouchableOpacity>
      )}
      
      <TouchableOpacity 
        style={styles.actionButton}
        onPress={() => setIsPasswordModalVisible(true)}
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

      <Modal
        visible={isPasswordModalVisible}
        transparent
        animationType="slide"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Change Password</Text>
              <TextInput
              style={styles.input}
              placeholder="Current Password"
              value={String(passwordForm.oldPassword || '')}
              onChangeText={(text) => setPasswordForm(prev => ({ ...prev, oldPassword: String(text || '') }))}
              secureTextEntry
            />
            
            <TextInput
              style={styles.input}
              placeholder="New Password"
              value={String(passwordForm.newPassword || '')}
              onChangeText={(text) => setPasswordForm(prev => ({ ...prev, newPassword: String(text || '') }))}
              secureTextEntry
            />
            
            <TextInput
              style={styles.input}
              placeholder="Confirm New Password"
              value={String(passwordForm.confirmPassword || '')}
              onChangeText={(text) => setPasswordForm(prev => ({ ...prev, confirmPassword: String(text || '') }))}
              secureTextEntry
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelModalButton]}                onPress={() => {
                  setIsPasswordModalVisible(false);
                  setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
                }}
              >
                <Text style={styles.cancelModalButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.confirmModalButton]}
                onPress={handlePasswordChange}
                disabled={isChangingPassword}
              >
                {isChangingPassword ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.confirmModalButtonText}>Change Password</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  cancelButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#666',
  },
  actionButtonText: {
    fontWeight: '600',
    fontSize: 16,
    color: '#000',
  },
  cancelButtonText: {
    color: '#666',
  },
  logoutButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#000',
  },
  logoutButtonText: {
    color: '#000',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelModalButton: {
    backgroundColor: '#f5f5f5',
    marginRight: 8,
  },
  confirmModalButton: {
    backgroundColor: '#000',
    marginLeft: 8,
  },
  cancelModalButtonText: {
    color: '#666',
    fontWeight: '600',
  },
  confirmModalButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default ProfileActions;
