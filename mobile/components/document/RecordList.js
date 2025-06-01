import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, FlatList } from 'react-native';
import RecordItem from './RecordItem';

/**
 * Record list component
 * @param {Object} props
 * @param {Array} props.records - Array of record objects
 * @param {Function} props.onRemoveRecord - Callback when record is removed
 * @param {Function} props.onUploadAll - Callback when upload all button is pressed
 */
const RecordList = ({ records = [], onRemoveRecord, onUploadAll }) => {
  const renderRecordItem = ({ item }) => {
    const handleRemove = typeof onRemoveRecord === 'function' ? onRemoveRecord : undefined;
    return (
      <RecordItem 
        record={item} 
        onRemove={handleRemove}
      />
    );
  };
  
  const renderFooter = () => (
    <TouchableOpacity 
      style={styles.submitButton}
      onPress={onUploadAll}
    >
      <Text style={styles.submitButtonText}>Upload All Records</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>
        Uploaded Records ({records.length})
      </Text>
      
      {records.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No records uploaded yet</Text>
        </View>
      ) : (
        <FlatList
          data={records}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderRecordItem}
          ListFooterComponent={renderFooter}
          scrollEnabled={false}
          nestedScrollEnabled={true}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#000',
  },
  emptyState: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
  },
  emptyStateText: {
    color: '#777',
  },
  submitButton: {
    backgroundColor: '#000',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 30,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default RecordList;
