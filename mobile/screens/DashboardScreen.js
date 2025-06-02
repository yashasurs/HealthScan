import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, View, Text, ActivityIndicator, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../Contexts/Authcontext';
import { useApiService } from '../services/apiService';

const DashboardScreen = () => {
  const navigation = useNavigation();
  const [patientData, setPatientData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuth();
  const apiService = useApiService();

  const loadData = async () => {
    try {
      const response = await apiService.auth.getCurrentUser();
      setPatientData(response.data);
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
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleContainer}>
              <View style={styles.iconContainer}>
                <Ionicons name="person-circle-outline" size={24} color="#4A90E2" />
              </View>
              <Text style={styles.cardTitle}>Patient Information</Text>
            </View>
            <TouchableOpacity style={styles.editButton}>
              <Ionicons name="pencil-outline" size={20} color="#666" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.patientInfoContainer}>
            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>Basic Info</Text>
              <View style={styles.patientInfoRow}>
                <Text style={styles.patientInfoLabel}>Name:</Text>
                <Text style={styles.patientInfoValue}>
                  {`${patientData.first_name} ${patientData.last_name}`}
                </Text>
              </View>
              <View style={styles.patientInfoRow}>
                <Text style={styles.patientInfoLabel}>Phone:</Text>
                <Text style={styles.patientInfoValue}>{patientData.phone_number}</Text>
              </View>
              <View style={styles.patientInfoRow}>
                <Text style={styles.patientInfoLabel}>Username:</Text>
                <Text style={styles.patientInfoValue}>{patientData.username}</Text>
              </View>
              <View style={styles.patientInfoRow}>
                <Text style={styles.patientInfoLabel}>Blood Group:</Text>
                <Text style={[styles.patientInfoValue, styles.highlightValue]}>
                  {patientData.blood_group || 'Not specified'}
                </Text>
              </View>
              <View style={styles.patientInfoRow}>
                <Text style={styles.patientInfoLabel}>Aadhar:</Text>
                <Text style={styles.patientInfoValue}>{patientData.aadhar || 'Not provided'}</Text>
              </View>
            </View>

            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>Medical Info</Text>
              <View style={styles.patientInfoRow}>
                <Text style={styles.patientInfoLabel}>Doctor:</Text>
                <Text style={styles.patientInfoValue}>{patientData.doctor_name || 'Not assigned'}</Text>
              </View>
              <View style={styles.patientInfoRow}>
                <Text style={styles.patientInfoLabel}>Last Visit:</Text>
                <Text style={styles.patientInfoValue}>{patientData.visit_date || 'No visits recorded'}</Text>
              </View>
              <View style={[styles.patientInfoRow, styles.lastRow]}>
                <Text style={styles.patientInfoLabel}>Allergies:</Text>
                <Text style={styles.patientInfoValue}>
                  {patientData.allergies ? patientData.allergies.join(", ") : 'None reported'}
                </Text>
              </View>
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
          <Text style={styles.buttonText}>Add New Record</Text>
        </TouchableOpacity>
      </View>      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#333']}
          />
        }
      >
        {renderContent()}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({  container: {
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
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  title: {
    fontSize: 34,
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
  },
  section: {
    flex: 1,
    padding: 16,
  },  patientCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#edf2f7',
  },
  cardTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    backgroundColor: '#e8f2ff',
    padding: 8,
    borderRadius: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2d3748',
    marginLeft: 10,
  },
  editButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f1f1f1',
  },  patientInfoContainer: {
    flex: 1,
    padding: 16,
  },
  infoSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4A90E2',
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#edf2f7',
  },  patientInfoRow: {
    flexDirection: 'row',
    marginBottom: 12,
    paddingBottom: 12,
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
    color: '#718096',
  },
  patientInfoValue: {
    flex: 1,
    fontSize: 14,
    color: '#2d3748',
    fontWeight: '500',
  },
  highlightValue: {
    color: '#4A90E2',
    fontWeight: '700',
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
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },  emptyStateSubText: {
    fontSize: 14,
    color: '#666',
  },
  scrollContent: {
    flexGrow: 1,
  },
});

export default DashboardScreen;
