import React from 'react';
import { StyleSheet, ScrollView, Alert } from 'react-native';
import { Header } from '../components/common';
import { PatientInfoCard, MedicalHistoryCard } from '../components/dashboard';

const DashboardScreen = () => {
  // Mock patient data - we no longer pass this to PatientInfoCard since it's hardcoded now
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

  const handleRecordPress = (record) => {
    Alert.alert(
      record.type,
      `Date: ${record.date}\nDoctor: ${record.doctor}\n\n${record.description}`,
      [{ text: 'OK' }]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Header title="Patient Medical Records" />
      <PatientInfoCard />
      <MedicalHistoryCard 
        medicalRecords={medicalRecords} 
        onRecordPress={handleRecordPress} 
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});

export default DashboardScreen;
