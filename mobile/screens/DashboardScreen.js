import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';

const DashboardScreen = () => {
  // Mock patient data
  const patientData = {
    name: "Jane Smith",
    age: 42,
    gender: "Female",
    patientId: "PT-20250524-001",
    bloodType: "O+",
    allergies: ["Penicillin", "Peanuts"]
  };

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

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Patient Medical Records</Text>
      </View>
      
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Patient Information</Text>
        <View style={styles.patientInfoContainer}>
          <View style={styles.patientInfoRow}>
            <Text style={styles.patientInfoLabel}>Name:</Text>
            <Text style={styles.patientInfoValue}>{patientData.name}</Text>
          </View>
          <View style={styles.patientInfoRow}>
            <Text style={styles.patientInfoLabel}>Age:</Text>
            <Text style={styles.patientInfoValue}>{patientData.age} years</Text>
          </View>
          <View style={styles.patientInfoRow}>
            <Text style={styles.patientInfoLabel}>Gender:</Text>
            <Text style={styles.patientInfoValue}>{patientData.gender}</Text>
          </View>
          <View style={styles.patientInfoRow}>
            <Text style={styles.patientInfoLabel}>Patient ID:</Text>
            <Text style={styles.patientInfoValue}>{patientData.patientId}</Text>
          </View>
          <View style={styles.patientInfoRow}>
            <Text style={styles.patientInfoLabel}>Blood Type:</Text>
            <Text style={styles.patientInfoValue}>{patientData.bloodType}</Text>
          </View>
          <View style={styles.patientInfoRow}>
            <Text style={styles.patientInfoLabel}>Allergies:</Text>
            <Text style={styles.patientInfoValue}>{patientData.allergies.join(", ")}</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Medical History</Text>
        {medicalRecords.map((record) => (
          <TouchableOpacity key={record.id} style={styles.recordItem}>
            <View style={styles.recordIcon}></View>
            <View style={styles.recordContent}>
              <Text style={styles.recordTitle}>{record.type}</Text>
              <Text style={styles.recordDetails}>{record.date} • {record.doctor}</Text>
              <Text style={styles.recordDescription}>{record.description}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 20,
    backgroundColor: '#000',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
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
  patientInfoContainer: {
    marginBottom: 10,
  },
  patientInfoRow: {
    flexDirection: 'row',
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  patientInfoLabel: {
    width: 100,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
  },
  patientInfoValue: {
    flex: 1,
    fontSize: 14,
    color: '#444',
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
    color: '#000',
  },
  recordDetails: {
    fontSize: 12,
    color: '#777',
    marginTop: 2,
  },
  recordDescription: {
    fontSize: 14,
    color: '#444',
    marginTop: 4,
  },
});

export default DashboardScreen;
