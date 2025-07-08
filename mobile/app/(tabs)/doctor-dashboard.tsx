import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { useApiService } from '@/services/apiService';
import { UserRole } from '@/types';
import { showToast } from '@/utils/toast';
import { router } from 'expo-router';

interface DoctorDashboard {
  patients_count: number;
  total_records: number;
  recent_uploads: number;
  verification_status: boolean;
}

interface PatientInfo {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone_number?: string;
  blood_group?: string;
  allergies?: string;
}

export default function DoctorDashboardScreen() {
  const [dashboardData, setDashboardData] = useState<DoctorDashboard | null>(null);
  const [patients, setPatients] = useState<PatientInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user, getUserRole, isDoctor } = useAuth();
  const { getAuthenticatedApi } = useApiService();

  // Redirect if not a doctor
  useEffect(() => {
    if (!isDoctor()) {
      router.replace('/(tabs)');
      return;
    }
  }, [isDoctor]);

  const loadDashboardData = async () => {
    try {
      const api = await getAuthenticatedApi();
      
      // Load dashboard stats
      const dashboardResponse = await api.get('/doctor/dashboard');
      setDashboardData(dashboardResponse.data);
      
      // Load patients
      const patientsResponse = await api.get('/doctor/patients');
      setPatients(patientsResponse.data);
      
    } catch (error: any) {
      console.error('Error loading dashboard data:', error);
      showToast.error('Error', 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  useEffect(() => {
    if (isDoctor()) {
      loadDashboardData();
    }
  }, [isDoctor]);

  const handleViewPatient = (patientId: number) => {
    // For now, navigate to a general route or show a message
    showToast.info('Coming Soon', 'Patient records view will be available soon');
  };

  const handleRegisterAsDoctor = () => {
    showToast.info('Coming Soon', 'Doctor verification feature will be available soon');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Doctor Dashboard</Text>
          <Text style={styles.headerSubtitle}>
            Welcome, Dr. {user?.first_name} {user?.last_name}
          </Text>
        </View>

        {/* Verification Status */}
        {user && !user.resume_verification_status && (
          <View style={styles.verificationCard}>
            <View style={styles.verificationHeader}>
              <Ionicons name="warning" size={24} color="#FF6B6B" />
              <Text style={styles.verificationTitle}>Account Verification Required</Text>
            </View>
            <Text style={styles.verificationText}>
              Complete your doctor verification to access all features
            </Text>
            <TouchableOpacity
              style={styles.verificationButton}
              onPress={handleRegisterAsDoctor}
            >
              <Text style={styles.verificationButtonText}>Complete Verification</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Dashboard Stats */}
        {dashboardData && (
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Ionicons name="people" size={24} color="#007AFF" />
              <Text style={styles.statNumber}>{dashboardData.patients_count}</Text>
              <Text style={styles.statLabel}>Patients</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="document-text" size={24} color="#34C759" />
              <Text style={styles.statNumber}>{dashboardData.total_records}</Text>
              <Text style={styles.statLabel}>Records</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="cloud-upload" size={24} color="#FF9500" />
              <Text style={styles.statNumber}>{dashboardData.recent_uploads}</Text>
              <Text style={styles.statLabel}>Recent</Text>
            </View>
          </View>
        )}

        {/* Patients List */}
        <View style={styles.patientsSection}>
          <Text style={styles.sectionTitle}>My Patients</Text>
          {patients.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="people-outline" size={48} color="#8E8E93" />
              <Text style={styles.emptyStateText}>No patients assigned yet</Text>
              <Text style={styles.emptyStateSubtext}>
                Patients will appear here once they assign you as their doctor
              </Text>
            </View>
          ) : (
            patients.map((patient) => (
              <TouchableOpacity
                key={patient.id}
                style={styles.patientCard}
                onPress={() => handleViewPatient(patient.id)}
              >
                <View style={styles.patientInfo}>
                  <Text style={styles.patientName}>
                    {patient.first_name} {patient.last_name}
                  </Text>
                  <Text style={styles.patientEmail}>{patient.email}</Text>
                  {patient.blood_group && (
                    <Text style={styles.patientBloodGroup}>
                      Blood Group: {patient.blood_group}
                    </Text>
                  )}
                  {patient.allergies && (
                    <Text style={styles.patientAllergies}>
                      Allergies: {patient.allergies}
                    </Text>
                  )}
                </View>
                <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#8E8E93',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    paddingTop: 20,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#8E8E93',
  },
  verificationCard: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B6B',
  },
  verificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  verificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF6B6B',
    marginLeft: 8,
  },
  verificationText: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 12,
  },
  verificationButton: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  verificationButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 4,
  },
  patientsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#FFF',
    borderRadius: 12,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8E8E93',
    marginTop: 16,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 8,
    textAlign: 'center',
  },
  patientCard: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  patientInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  patientEmail: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 4,
  },
  patientBloodGroup: {
    fontSize: 12,
    color: '#FF6B6B',
    marginBottom: 2,
  },
  patientAllergies: {
    fontSize: 12,
    color: '#FF9500',
  },
});