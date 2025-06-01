import React from 'react';
import { StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, View } from 'react-native';
import { Header } from '../components/common';
import { PatientInfoCard } from '../components/dashboard';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const DashboardScreen = () => {
  const navigation = useNavigation();
  const handleAddRecord = () => {
    navigation.navigate('Upload');
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Patient Profile" />
      <View style={styles.mainContainer}>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          <PatientInfoCard />
        </ScrollView>
        <TouchableOpacity style={styles.fab} onPress={handleAddRecord}>
          <Ionicons name="add" size={30} color="#fff" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  mainContainer: {
    flex: 1,
    position: 'relative',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});

export default DashboardScreen;
