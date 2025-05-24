import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';

const DocumentUploadScreen = () => {
  const [documents, setDocuments] = useState([]);

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });
      
      if (result.canceled === false) {
        setDocuments([...documents, result.assets[0]]);
      }
    } catch (err) {
      console.log('Document picking error:', err);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Document Upload</Text>
      </View>
      
      <ScrollView style={styles.content}>
        <View style={styles.uploadSection}>
          <TouchableOpacity style={styles.uploadButton} onPress={pickDocument}>
            <Text style={styles.uploadButtonText}>Select Document</Text>
          </TouchableOpacity>
          <Text style={styles.uploadInfo}>
            Supported formats: PDF, DOC, DOCX, JPG, PNG
          </Text>
        </View>
        
        <View style={styles.documentsSection}>
          <Text style={styles.sectionTitle}>
            Uploaded Documents ({documents.length})
          </Text>
          
          {documents.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No documents uploaded yet</Text>
            </View>
          ) : (
            documents.map((doc, index) => (
              <View key={index} style={styles.documentItem}>
                <View style={styles.documentIcon}>
                  <Text style={styles.documentIconText}>
                    {doc.name.split('.').pop().toUpperCase()}
                  </Text>
                </View>
                <View style={styles.documentInfo}>
                  <Text style={styles.documentName} numberOfLines={1}>
                    {doc.name}
                  </Text>
                  <Text style={styles.documentSize}>
                    {(doc.size / 1024).toFixed(2)} KB
                  </Text>
                </View>
                <TouchableOpacity style={styles.documentRemove}>
                  <Text style={styles.documentRemoveText}>✕</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>
        
        {documents.length > 0 && (
          <TouchableOpacity style={styles.submitButton}>
            <Text style={styles.submitButtonText}>Upload All Documents</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
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
  content: {
    flex: 1,
    padding: 20,
  },
  uploadSection: {
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 20,
    marginBottom: 20,
  },
  uploadButton: {
    backgroundColor: '#000',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 10,
  },
  uploadButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  uploadInfo: {
    color: '#777',
    textAlign: 'center',
  },
  documentsSection: {
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

export default DocumentUploadScreen;
