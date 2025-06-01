import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ActivityIndicator } from 'react-native';
import { useAuth } from '../../Contexts/Authcontext';
import { useApiService } from '../../services/apiService';

/**
 * Patient information card component
 */
const PatientInfoCard = () => {
  const [patientData, setPatientData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const apiService = useApiService();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await apiService.auth.getCurrentUser();
        setPatientData(response.data);
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);    if (loading) {
      return (
        <View style={[styles.card, styles.loadingContainer]}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      );
    }

    if (!patientData) {
      return (
        <View style={styles.card}>
          <Text style={styles.errorText}>Failed to load patient information</Text>
        </View>
      );
    }

    return (
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Patient Information</Text>
        <View style={styles.patientInfoContainer}>
          <View style={styles.patientInfoRow}>
            <Text style={styles.patientInfoLabel}>Username:</Text>
            <Text style={styles.patientInfoValue}>{patientData.username}</Text>
          </View>
          <View style={styles.patientInfoRow}>
            <Text style={styles.patientInfoLabel}>Email:</Text>
            <Text style={styles.patientInfoValue}>{patientData.email}</Text>
          </View>
          <View style={styles.patientInfoRow}>
            <Text style={styles.patientInfoLabel}>Blood Group:</Text>
            <Text style={styles.patientInfoValue}>{patientData.blood_group || 'Not specified'}</Text>
          </View>
          <View style={styles.patientInfoRow}>
            <Text style={styles.patientInfoLabel}>Aadhar:</Text>
            <Text style={styles.patientInfoValue}>{patientData.aadhar || 'Not provided'}</Text>
          </View>
          <View style={styles.patientInfoRow}>
            <Text style={styles.patientInfoLabel}>Doctor:</Text>
            <Text style={styles.patientInfoValue}>{patientData.doctor_name || 'Not assigned'}</Text>
          </View>
          <View style={styles.patientInfoRow}>
            <Text style={styles.patientInfoLabel}>Last Visit:</Text>
            <Text style={styles.patientInfoValue}>{patientData.visit_date || 'No visits recorded'}</Text>
          </View>
          <View style={styles.patientInfoRow}>
            <Text style={styles.patientInfoLabel}>Allergies:</Text>
            <Text style={styles.patientInfoValue}>
              {patientData.allergies ? patientData.allergies.join(", ") : 'None reported'}
            </Text>
          </View>
        </View>
      </View>
    );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 15,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 400,
  },
  errorText: {
    color: '#FF3B30',
    textAlign: 'center',
    fontSize: 16,
    padding: 20,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#fafafa',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  patientInfoContainer: {
    padding: 20,
  },
  patientInfoRow: {
    flexDirection: 'row',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  patientInfoLabel: {
    width: 120,
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  patientInfoValue: {
    flex: 1,
    fontSize: 16,
    color: '#1a1a1a',
    fontWeight: '500',
  },
});

export default PatientInfoCard;
