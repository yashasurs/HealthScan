import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useApiService } from '../../services/apiService';

/**
 * Medical history card component showing list of medical records
 */
const MedicalHistoryCard = () => {
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const apiService = useApiService();

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const response = await apiService.records.getAll();
        setMedicalRecords(response.data);
      } catch (error) {
        console.error('Error fetching medical records:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecords();
  }, []);

  const handleRecordPress = (record) => {
    Alert.alert(
      record.type,
      `Date: ${record.date}\nDoctor: ${record.doctor}\n\n${record.description}`,
      [{ text: 'OK' }]
    );
  };
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Medical History</Text>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      ) : medicalRecords.length > 0 ? (
        medicalRecords.map((record) => (
          <TouchableOpacity 
            key={record.id} 
            style={styles.recordItem}
            onPress={() => handleRecordPress(record)}
          >
            <View style={styles.recordIcon}></View>
            <View style={styles.recordContent}>
              <Text style={styles.recordTitle}>{record.title || "Medical Record"}</Text>
              <Text style={styles.recordDetails}>
                {new Date(record.created_at).toLocaleDateString()} • {record.doctor_name || "No doctor specified"}
              </Text>
              <Text style={styles.recordDescription}>{record.description || "No description available"}</Text>
            </View>
          </TouchableOpacity>
        ))
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No medical records found</Text>
          <Text style={styles.emptyStateSubText}>Your medical history will appear here</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    minHeight: 200,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  emptyStateSubText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#000',
  },
  recordItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  recordIcon: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#000',
    marginRight: 12,
    marginTop: 4,
  },
  recordContent: {
    flex: 1,
  },
  recordTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  recordDetails: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  recordDescription: {
    fontSize: 14,
    color: '#444',
  },
});

export default MedicalHistoryCard;
