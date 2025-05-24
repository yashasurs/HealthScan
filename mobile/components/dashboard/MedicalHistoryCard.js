import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';

/**
 * Medical history card component showing list of medical records
 * @param {array} medicalRecords - Array of medical records
 * @param {function} onRecordPress - Function to call when a record is pressed
 */
const MedicalHistoryCard = ({ medicalRecords, onRecordPress }) => {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Medical History</Text>
      {medicalRecords.map((record) => (
        <TouchableOpacity 
          key={record.id} 
          style={styles.recordItem}
          onPress={() => onRecordPress && onRecordPress(record)}
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
