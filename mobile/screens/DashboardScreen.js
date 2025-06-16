import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, View, Text, ActivityIndicator, RefreshControl, TextInput, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../Contexts/Authcontext';
import { useApiService } from '../services/apiService';

const DashboardScreen = () => {
  const navigation = useNavigation();
  const [patientData, setPatientData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const { user } = useAuth();
  const apiService = useApiService();
  const loadData = async () => {
    try {
      const response = await apiService.auth.getCurrentUser();
      setPatientData(response.data);
      setEditData(response.data);
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };
  const handleAddRecord = () => {
    navigation.navigate('Upload');
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditData(patientData);
  };
  const handleSaveEdit = async () => {
    try {
      setLoading(true);
      await apiService.auth.updateUser(editData);
      setPatientData(editData);
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setEditData(prev => ({
      ...prev,
      [field]: value    }));
  };

  const renderField = (label, field, value, editable = true) => (
    <View style={styles.patientInfoRow}>
      <Text style={styles.patientInfoLabel}>{label}:</Text>
      {isEditing && editable ? (
        <TextInput
          style={styles.editInput}
          value={editData[field] || ''}
          onChangeText={(text) => handleInputChange(field, text)}
          placeholder={`Enter ${label.toLowerCase()}`}
        />
      ) : (
        <Text style={styles.patientInfoValue}>{value}</Text>
      )}
    </View>
  );

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      );
    }

    if (!patientData) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>Failed to load patient information</Text>
          <Text style={styles.emptyStateSubText}>Please try again later</Text>
        </View>
      );
    }

    return (
      <View style={styles.section}>
        <View style={styles.patientCard}>
          <View style={styles.cardHeader}>            <View style={styles.cardTitleContainer}>              <View style={styles.iconContainer}>
                <Ionicons name="person-circle-outline" size={24} color="#666" />
              </View>
              <Text style={styles.cardTitle}>Patient Information</Text>
            </View>            <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
              <Ionicons name="pencil-outline" size={20} color="#666" />
            </TouchableOpacity>
          </View>
            <View style={styles.patientInfoContainer}>            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>Basic Info</Text>
              {renderField('Full Name', 'full_name', `${patientData.first_name || ''} ${patientData.last_name || ''}`.trim())}
              {renderField('Username', 'username', patientData.username)}
            </View>

            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>Medical Info</Text>
              {renderField('Blood Group', 'blood_group', patientData.blood_group || 'Not specified')}
              {renderField('Aadhar Card', 'aadhar_card', patientData.aadhar_card || 'Not provided')}
              {renderField('Allergies', 'allergies', patientData.allergies || 'None reported')}
              {renderField('Doctor Name', 'doctor_name', patientData.doctor_name || 'Not assigned')}
              {renderField('Last Visit', 'visit_date', patientData.visit_date || 'No visits recorded', false)}
            </View>

            {isEditing && (
              <View style={styles.editButtonsContainer}>
                <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={handleCancelEdit}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={handleSaveEdit}>
                  <Text style={styles.saveButtonText}>Save Changes</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Patient Profile</Text>
        <Text style={styles.subtitle}>View and manage your medical information</Text>
        
        <TouchableOpacity 
          style={styles.createButton} 
          onPress={handleAddRecord}
        >
          <Ionicons name="add" size={24} color="#fff" />
          <Text style={styles.buttonText}>Add New Record</Text>
        </TouchableOpacity>
      </View>      <ScrollView
        style={styles.content}
        contentContainerStyle={[
          styles.scrollContent,
          isEditing && styles.scrollContentEditing
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#333']}
          />
        }      >
        {renderContent()}
      </ScrollView>
      
      {/* Floating QR Scanner Button */}
      <TouchableOpacity 
        style={styles.fabButton}
        onPress={() => navigation.navigate('QRScanner')}
      >
        <Ionicons name="qr-code" size={28} color="#fff" />
      </TouchableOpacity>
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
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#181818',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 8,
    marginBottom: 24,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },  content: {
    flex: 1,
    padding: 20,
  },  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  patientCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#f7f7f9',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },cardTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },  iconContainer: {
    backgroundColor: '#f0f0f0',
    padding: 6,
    borderRadius: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginLeft: 8,
  },
  editButton: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: '#f0f0f0',
  },  patientInfoContainer: {
    flex: 1,
    padding: 12,
  },
  infoSection: {
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },  patientInfoRow: {
    flexDirection: 'row',
    marginBottom: 10,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  lastRow: {
    marginBottom: 0,
    paddingBottom: 0,
    borderBottomWidth: 0,
  },
  patientInfoLabel: {
    width: 100,
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  patientInfoValue: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  highlightValue: {
    color: '#333',
    fontWeight: '700',
  },  editInput: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#fff',
  },  editButtonsContainer: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  saveButton: {
    backgroundColor: '#181818',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 400,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    backgroundColor: '#fff',
    borderRadius: 12,
    margin: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  emptyStateSubText: {
    fontSize: 14,
    color: '#666',
  },scrollContent: {
    flexGrow: 1,
  },  scrollContentEditing: {
    paddingBottom: 150, // Extra padding when in edit mode
  },
  fabButton: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4A90E2',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});

export default DashboardScreen;
