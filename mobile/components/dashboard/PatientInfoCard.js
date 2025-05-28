import React from 'react';
import { StyleSheet, View, Text } from 'react-native';

/**
 * Patient information card component
 */
const PatientInfoCard = () => {
  // Patient data
  const patientData = {
    name: "John Doe",
    age: 42,
    gender: "Male",
    patientId: "PT-10042",
    bloodType: "O+",
    allergies: ["Penicillin", "Peanuts", "Dust"]
  };
    return (
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
});

export default PatientInfoCard;
