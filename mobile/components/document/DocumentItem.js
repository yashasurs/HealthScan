import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';

/**
 * Document item component
 * @param {Object} props
 * @param {Object} props.document - Document object with name and size
 * @param {Function} props.onRemove - Callback when remove button is pressed
 */
const DocumentItem = ({ document, onRemove }) => {
  const fileExtension = document.name.split('.').pop().toUpperCase();
  const fileSizeKB = (document.size / 1024).toFixed(2);

  return (
    <View style={styles.documentItem}>
      <View style={styles.documentIcon}>
        <Text style={styles.documentIconText}>
          {fileExtension}
        </Text>
      </View>
      <View style={styles.documentInfo}>
        <Text style={styles.documentName} numberOfLines={1}>
          {document.name}
        </Text>
        <Text style={styles.documentSize}>
          {fileSizeKB} KB
        </Text>
      </View>
      <TouchableOpacity 
        style={styles.documentRemove}
        onPress={() => onRemove(document)}
      >
        <Text style={styles.documentRemoveText}>✕</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  documentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    marginBottom: 10,
  },
  documentIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  documentIconText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  documentInfo: {
    flex: 1,
  },
  documentName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
  },
  documentSize: {
    fontSize: 12,
    color: '#777',
  },
  documentRemove: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  documentRemoveText: {
    color: '#777',
    fontSize: 16,
  },
});

export default DocumentItem;
