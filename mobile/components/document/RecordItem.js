import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';

/**
 * Record item component
 * @param {Object} props
 * @param {Object} props.record - Record object with name and size
 * @param {Function} props.onRemove - Callback when remove button is pressed
 */
const RecordItem = ({ record, onRemove }) => {
  if (!record) return null;
  
  const fileExtension = record.filename ? record.filename.split('.').pop()?.toUpperCase() || 'FILE' : 'FILE';
  const fileSizeKB = ((record.file_size || 0) / 1024).toFixed(2);

  return (
    <View style={styles.recordItem}>
      <View style={styles.recordIcon}>
        <Text style={styles.recordIconText}>
          {fileExtension}
        </Text>
      </View>
      <View style={styles.recordInfo}>        <Text style={styles.recordName} numberOfLines={1}>
          {record.filename || 'Unnamed Record'}
        </Text>
        <Text style={styles.recordSize}>
          {record.file_type ? `${record.file_type.split('/')[1] || 'Unknown'} • ` : ''}{fileSizeKB} KB
        </Text>      </View>      {typeof onRemove === 'function' && (
        <TouchableOpacity 
          style={styles.recordRemove}
          onPress={() => onRemove(record)}
          accessibilityLabel="Remove record"
        >
          <Text style={styles.recordRemoveText}>✕</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  recordItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    marginBottom: 10,
  },
  recordIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  recordIconText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  recordInfo: {
    flex: 1,
  },
  recordName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
  },
  recordSize: {
    fontSize: 12,
    color: '#777',
  },  recordRemove: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordRemoveText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default RecordItem;
