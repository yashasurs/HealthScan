import React from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import { Header } from '../components/common';
import { PatientInfoCard, MedicalHistoryCard } from '../components/dashboard';

const DashboardScreen = () => {
  return (
    <ScrollView style={styles.container}>
      <Header title="Patient Medical Records" />
      <PatientInfoCard />
      <MedicalHistoryCard />
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
