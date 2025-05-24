import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import DocumentItem from './DocumentItem';

/**
 * Document list component
 * @param {Object} props
 * @param {Array} props.documents - Array of document objects
 * @param {Function} props.onRemoveDocument - Callback when document is removed
 * @param {Function} props.onUploadAll - Callback when upload all button is pressed
 */
const DocumentList = ({ documents, onRemoveDocument, onUploadAll }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>
        Uploaded Documents ({documents.length})
      </Text>
      
      {documents.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No documents uploaded yet</Text>
        </View>
      ) : (
        <>
          {documents.map((doc, index) => (
            <DocumentItem 
              key={index} 
              document={doc} 
              onRemove={onRemoveDocument} 
            />
          ))}
          
          <TouchableOpacity 
            style={styles.submitButton}
            onPress={onUploadAll}
          >
            <Text style={styles.submitButtonText}>Upload All Documents</Text>
          </TouchableOpacity>
        </>
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

export default DocumentList;
