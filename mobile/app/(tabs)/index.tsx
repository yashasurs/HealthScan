import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, View, Text, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { DeviceEventEmitter } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useApiService } from '@/services/apiService';

interface PatientData {
  id: number;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
  blood_group?: string;
  aadhar?: string;
  allergies?: string;
  doctor_name?: string;
  visit_date?: string;
  totp_enabled?: boolean;
  role?: string;
  created_at: string;
  updated_at: string;
}

const DashboardScreen: React.FC = () => {
  const [patientData, setPatientData] = useState<PatientData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [initialLoad, setInitialLoad] = useState<boolean>(true);
  const { user } = useAuth();
  const apiService = useApiService();

  const loadData = useCallback(async () => {
    try {
      if (initialLoad) {
        setLoading(true);
      }
      
      const response = await apiService.auth.getCurrentUser();
      setPatientData(response.data);
    } catch (error: any) {
      console.error('Error fetching user data:', error);
      
      // Check if it's a 401 error (authentication failure)
      if (error.response?.status === 401) {
        console.log('Authentication failed, will be handled by auth error listener');
        // The DeviceEventEmitter in the apiService will handle the redirect
        return;
      }
      
      // For other errors, show a user-friendly message
      setPatientData(null);
    } finally {
      if (initialLoad) {
        setLoading(false);
        setInitialLoad(false);
      }
    }
  }, [apiService, initialLoad]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAddRecord = () => {
    router.push('/upload');
  };

  const renderField = (label: string, value?: string | null) => (
    <View style={styles.infoItem}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value || 'Not provided'}</Text>
    </View>
  );

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#000" />
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
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleContainer}>
              <View style={styles.iconContainer}>
                <Ionicons name="person-circle-outline" size={24} color="#666" />
              </View>
              <Text style={styles.cardTitle}>Patient Information</Text>
            </View>
          </View>
          
          <View style={styles.patientInfoContainer}>
            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>Basic Information</Text>
              {renderField('Full Name', `${patientData.first_name || ''} ${patientData.last_name || ''}`.trim())}
              {renderField('Username', patientData.username)}
            </View>

            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>Medical Information</Text>
              {renderField('Blood Group', patientData.blood_group)}
              {renderField('Allergies', patientData.allergies)}
              {renderField('Doctor Name', patientData.doctor_name)}
              {renderField('Last Visit', patientData.visit_date)}
            </View>
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
          <Text style={styles.createButtonText}>Add New Record</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {renderContent()}
      </ScrollView>
      
      {/* Floating QR Scanner Button */}
      <TouchableOpacity 
        style={styles.fabButton}
        onPress={() => router.push('/scanner')}
      >
        <Ionicons name="qr-code" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000',
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
    backgroundColor: '#000',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 8,
    marginBottom: 24,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  content: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  section: {
    backgroundColor: '#fff',
    marginBottom: 20,
  },
  patientCard: {
    flex: 1,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  cardTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    backgroundColor: '#f0f0f0',
    padding: 6,
    borderRadius: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginLeft: 8,
  },
  patientInfoContainer: {
    flex: 1,
    padding: 20,
  },
  infoSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#000',
  },
  infoItem: {
    marginBottom: 16,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
  },
  loadingContainer: {
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
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40, // Extra padding at the end of the screen
  },
  fabButton: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#000',
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
