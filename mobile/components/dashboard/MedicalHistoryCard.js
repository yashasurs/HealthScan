import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert } from 'react-native';

/**
 * Medical history card component showing list of medical records
 */
const MedicalHistoryCard = () => {
  // Mock medical records
  const medicalRecords = [
    {
      id: "MR001",
      date: "May 15, 2025",
      type: "General Checkup",
      doctor: "Dr. Johnson",
      description: "Routine health examination"
    },
    {
      id: "MR002",
      date: "April 3, 2025",
      type: "Blood Test",
      doctor: "Dr. Williams",
      description: "Complete blood count and metabolic panel"
    },
    {
      id: "MR003",
      date: "March 10, 2025",
      type: "Vaccination",
      doctor: "Dr. Martinez",
      description: "Influenza vaccine administered"
    }
  ];

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
      {medicalRecords.map((record) => (
        <TouchableOpacity 
          key={record.id} 
          style={styles.recordItem}
          onPress={() => handleRecordPress(record)}
        >
          <View style={styles.recordIcon}></View>
          <View style={styles.recordContent}>
            <Text style={styles.recordTitle}>{record.type}</Text>
            <Text style={styles.recordDetails}>{record.date} • {record.doctor}</Text>
            <Text style={styles.recordDescription}>{record.description}</Text>
          </View>
        </TouchableOpacity>
      ))}
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
